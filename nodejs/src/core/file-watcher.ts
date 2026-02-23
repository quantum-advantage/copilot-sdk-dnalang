/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * File Watcher — monitors source directories for changes and dispatches patch diffs.
 *
 * Uses `chokidar` to watch files, keeps an in-memory content cache so it can
 * compute diffs, and emits structured {@link FileChangeEvent} objects that the
 * shell layer can forward to a Copilot session.
 */

import { watch, type FSWatcher } from "chokidar";
import { readFileSync, existsSync } from "node:fs";
import { EventEmitter } from "node:events";
import { computeLineDiff, type LineDiffResult } from "./diff-engine.js";

/** Telemetry entry recorded for each file-change cycle. */
export interface PatchTelemetry {
    /** Absolute path that changed. */
    filePath: string;
    /** Wall-clock time when the change was first detected (ms since epoch). */
    detectedAt: number;
    /** Wall-clock time when the diff was fully computed (ms since epoch). */
    diffComputedAt: number;
    /** Total latency in ms from detection to diff completion. */
    latencyMs: number;
}

/** Emitted by {@link FileWatcher} for each file change. */
export interface FileChangeEvent {
    /** Type of filesystem event. */
    type: "change" | "add" | "unlink";
    /** Absolute path of the affected file. */
    filePath: string;
    /** Structured diff result (undefined for `unlink` events). */
    diff?: LineDiffResult;
    /** Telemetry for this patch cycle. */
    telemetry: PatchTelemetry;
}

/** Options for {@link FileWatcher}. */
export interface FileWatcherOptions {
    /**
     * Glob patterns or directory/file paths to watch.
     * @example ["src/**\/*.ts", "lib/**\/*.ts"]
     */
    paths: string[];

    /**
     * Glob patterns to ignore.
     * @default ["**\/node_modules\/**", "**\/.git\/**"]
     */
    ignored?: string[];

    /**
     * Debounce window in ms — consecutive changes to the same file within this
     * window are collapsed into a single event.
     * @default 200
     */
    debounceMs?: number;

    /**
     * Whether to emit an event for every existing file when the watcher starts.
     * @default false
     */
    watchInitial?: boolean;
}

/** Typed event map for {@link FileWatcher}. */
interface FileWatcherEvents {
    change: [event: FileChangeEvent];
    error: [error: Error];
    ready: [];
}

/**
 * Watches source directories for file changes and emits structured diff events.
 *
 * @example
 * ```typescript
 * const watcher = new FileWatcher({ paths: ["src"] });
 * watcher.on("change", (event) => {
 *     console.log(event.diff?.patch);
 * });
 * await watcher.start();
 * // ...later:
 * await watcher.stop();
 * ```
 */
export class FileWatcher extends EventEmitter<FileWatcherEvents> {
    private watcher: FSWatcher | null = null;
    private readonly cache = new Map<string, string>();
    private readonly debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
    private readonly options: Required<FileWatcherOptions>;

    constructor(options: FileWatcherOptions) {
        super();
        this.options = {
            paths: options.paths,
            ignored: options.ignored ?? ["**/node_modules/**", "**/.git/**"],
            debounceMs: options.debounceMs ?? 200,
            watchInitial: options.watchInitial ?? false,
        };
    }

    /** Start watching. Resolves when the watcher is ready. */
    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.watcher) {
                resolve();
                return;
            }

            this.watcher = watch(this.options.paths, {
                ignored: this.options.ignored,
                persistent: true,
                ignoreInitial: !this.options.watchInitial,
                awaitWriteFinish: {
                    stabilityThreshold: 80,
                    pollInterval: 50,
                },
            });

            this.watcher
                .on("add", (filePath) => this.handleFsEvent("add", filePath))
                .on("change", (filePath) => this.handleFsEvent("change", filePath))
                .on("unlink", (filePath) => this.handleFsEvent("unlink", filePath))
                .on("error", (err) => {
                    const error = err instanceof Error ? err : new Error(String(err));
                    this.emit("error", error);
                    reject(error);
                })
                .on("ready", () => {
                    this.emit("ready");
                    resolve();
                });
        });
    }

    /** Stop watching and clear internal state. */
    async stop(): Promise<void> {
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();

        if (this.watcher) {
            await this.watcher.close();
            this.watcher = null;
        }
        this.cache.clear();
    }

    /** Return the cached file content for `filePath`, or `undefined` if not cached. */
    getCached(filePath: string): string | undefined {
        return this.cache.get(filePath);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private handleFsEvent(type: FileChangeEvent["type"], filePath: string): void {
        // Debounce
        const existing = this.debounceTimers.get(filePath);
        if (existing) {
            clearTimeout(existing);
        }
        const detectedAt = Date.now();
        const timer = setTimeout(() => {
            this.debounceTimers.delete(filePath);
            this.processChange(type, filePath, detectedAt);
        }, this.options.debounceMs);
        this.debounceTimers.set(filePath, timer);
    }

    private processChange(
        type: FileChangeEvent["type"],
        filePath: string,
        detectedAt: number
    ): void {
        if (type === "unlink") {
            const telemetry = buildTelemetry(filePath, detectedAt);
            this.cache.delete(filePath);
            this.emit("change", { type, filePath, telemetry });
            return;
        }

        let newContent: string;
        try {
            if (!existsSync(filePath)) return;
            newContent = readFileSync(filePath, "utf-8");
        } catch {
            // File unreadable (permission error, etc.) — skip silently
            return;
        }

        const oldContent = this.cache.get(filePath) ?? "";
        this.cache.set(filePath, newContent);

        const diff = computeLineDiff(filePath, oldContent, newContent);
        const telemetry = buildTelemetry(filePath, detectedAt);

        this.emit("change", { type, filePath, diff, telemetry });
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildTelemetry(filePath: string, detectedAt: number): PatchTelemetry {
    const diffComputedAt = Date.now();
    return {
        filePath,
        detectedAt,
        diffComputedAt,
        latencyMs: diffComputedAt - detectedAt,
    };
}
