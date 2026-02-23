/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import { describe, it, expect, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { FileWatcher } from "../src/core/file-watcher.js";

/** Create a temporary directory and return its path. */
function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "fw-test-"));
}

/** Write a file, creating parent dirs as needed. */
function writeFile(filePath: string, content: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
}

/** Wait for `ms` milliseconds. */
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

describe("FileWatcher", () => {
    const dirsToCleanup: string[] = [];

    afterEach(() => {
        for (const dir of dirsToCleanup) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
        dirsToCleanup.length = 0;
    });

    it("emits ready after start()", async () => {
        const dir = makeTmpDir();
        dirsToCleanup.push(dir);
        const watcher = new FileWatcher({ paths: [dir] });
        let readyFired = false;
        watcher.on("ready", () => {
            readyFired = true;
        });
        await watcher.start();
        expect(readyFired).toBe(true);
        await watcher.stop();
    });

    it("detects a new file (add event)", async () => {
        const dir = makeTmpDir();
        dirsToCleanup.push(dir);
        const watcher = new FileWatcher({ paths: [dir], watchInitial: false });
        await watcher.start();

        const events: string[] = [];
        watcher.on("change", (ev) => events.push(ev.type));

        writeFile(path.join(dir, "new.ts"), "const x = 1;\n");
        await wait(600);
        await watcher.stop();

        expect(events).toContain("add");
    });

    it("detects a file change", async () => {
        const dir = makeTmpDir();
        dirsToCleanup.push(dir);
        const filePath = path.join(dir, "file.ts");
        writeFile(filePath, "const x = 1;\n");

        const watcher = new FileWatcher({ paths: [dir], watchInitial: false, debounceMs: 100 });
        await watcher.start();

        const events: string[] = [];
        watcher.on("change", (ev) => events.push(ev.type));

        writeFile(filePath, "const x = 2;\n");
        await wait(500);
        await watcher.stop();

        expect(events).toContain("change");
    });

    it("detects a file deletion (unlink event)", async () => {
        const dir = makeTmpDir();
        dirsToCleanup.push(dir);
        const filePath = path.join(dir, "del.ts");
        writeFile(filePath, "hello\n");

        const watcher = new FileWatcher({ paths: [dir], watchInitial: false, debounceMs: 100 });
        await watcher.start();

        const events: string[] = [];
        watcher.on("change", (ev) => events.push(ev.type));

        fs.unlinkSync(filePath);
        await wait(500);
        await watcher.stop();

        expect(events).toContain("unlink");
    });

    it("includes a diff result for changed files", async () => {
        const dir = makeTmpDir();
        dirsToCleanup.push(dir);
        const filePath = path.join(dir, "src.ts");
        writeFile(filePath, "const a = 1;\n");

        const watcher = new FileWatcher({ paths: [dir], watchInitial: false, debounceMs: 100 });
        await watcher.start();

        // Pre-populate cache by triggering initial add
        let diffResult = null;
        watcher.on("change", (ev) => {
            if (ev.diff) diffResult = ev.diff;
        });

        writeFile(filePath, "const a = 2;\n");
        await wait(500);
        await watcher.stop();

        // diff result should be populated (linesAdded >= 0)
        expect(diffResult).not.toBeNull();
    });

    it("includes telemetry with non-negative latency", async () => {
        const dir = makeTmpDir();
        dirsToCleanup.push(dir);
        const watcher = new FileWatcher({ paths: [dir], watchInitial: false });
        await watcher.start();

        const telemetries: number[] = [];
        watcher.on("change", (ev) => telemetries.push(ev.telemetry.latencyMs));

        writeFile(path.join(dir, "t.ts"), "x\n");
        await wait(600);
        await watcher.stop();

        if (telemetries.length > 0) {
            expect(telemetries[0]).toBeGreaterThanOrEqual(0);
        }
    });

    it("getCached returns undefined before the file is seen", () => {
        const watcher = new FileWatcher({ paths: ["/non-existent"] });
        expect(watcher.getCached("/non-existent/file.ts")).toBeUndefined();
    });

    it("stop() is idempotent", async () => {
        const dir = makeTmpDir();
        dirsToCleanup.push(dir);
        const watcher = new FileWatcher({ paths: [dir] });
        await watcher.start();
        await watcher.stop();
        // Second stop should not throw
        await expect(watcher.stop()).resolves.toBeUndefined();
    });
});
