#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * Copilot Cognitive Shell — Autonomous File Watcher + Self-Refactor Loop
 *
 * An interactive shell that watches source directories for file changes,
 * computes structured diffs, and streams refactor suggestions from a Copilot
 * agent. Supports an optional autonomous mode that auto-applies suggested edits.
 *
 * Usage:
 *   npx tsx bin/shell.ts [--model <model>] [--auto]
 *
 * Shell commands:
 *   /watch <dir>    — Start watching a directory (can be used multiple times)
 *   /unwatch        — Stop all watchers
 *   /auto           — Toggle autonomous (auto-apply) mode
 *   /status         — Show watcher status and telemetry summary
 *   /events         — Show recent file-change events
 *   /tools          — List available slash commands
 *   /help           — Alias for /tools
 *   /quit | /exit   — Exit the shell
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { CopilotClient } from "../src/index.js";
import { FileWatcher } from "../src/core/file-watcher.js";
import { formatDiffForPrompt } from "../src/core/diff-engine.js";
import type { FileChangeEvent, PatchTelemetry } from "../src/core/file-watcher.js";
import type { LineDiffResult } from "../src/core/diff-engine.js";

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const ESC = "\x1b[";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const FG = {
    red: `${ESC}31m`,
    green: `${ESC}32m`,
    yellow: `${ESC}33m`,
    cyan: `${ESC}36m`,
    magenta: `${ESC}35m`,
    brightCyan: `${ESC}96m`,
    brightGreen: `${ESC}92m`,
    brightRed: `${ESC}91m`,
    brightYellow: `${ESC}93m`,
    brightWhite: `${ESC}97m`,
    brightBlack: `${ESC}90m`,
    brightMagenta: `${ESC}95m`,
} as const;

const c = (color: string, text: string) => `${color}${text}${RESET}`;

// ─── Header ──────────────────────────────────────────────────────────────────

const SHELL_WIDTH = 66;

function printHeader(model: string, autoMode: boolean) {
    const border = "═".repeat(SHELL_WIDTH);
    const modeTag = autoMode
        ? c(FG.brightYellow, " [AUTO-APPLY ON]")
        : c(FG.brightBlack, " [AUTO-APPLY OFF]");
    console.log();
    console.log(c(FG.brightCyan, `╔${border}╗`));
    const title = `  Copilot Cognitive Shell  ·  File Watcher + Refactor Loop  `;
    const titlePad = " ".repeat(Math.max(0, SHELL_WIDTH - title.length));
    console.log(
        c(FG.brightCyan, "║") + c(BOLD + FG.brightWhite, title + titlePad) + c(FG.brightCyan, "║")
    );
    console.log(c(FG.brightCyan, `╠${border}╣`));
    const modelLine = `  Model: ${model}${modeTag}  ·  Type /help for commands  `;
    const modelPad = " ".repeat(Math.max(0, SHELL_WIDTH - stripAnsi(modelLine).length));
    console.log(c(FG.brightCyan, "║") + modelLine + modelPad + c(FG.brightCyan, "║"));
    console.log(c(FG.brightCyan, `╚${border}╝`));
    console.log();
}

/** Strip ANSI escape codes to compute visual width. */
function stripAnsi(s: string): string {
    // eslint-disable-next-line no-control-regex
    return s.replace(/\x1b\[[0-9;]*m/g, "");
}

// ─── UI panes ─────────────────────────────────────────────────────────────────

function printSectionHeader(label: string) {
    const line = `── ${label} ${"─".repeat(Math.max(0, SHELL_WIDTH - label.length - 4))}`;
    console.log(c(FG.brightCyan, line));
}

/** /tools — list available commands */
function printTools() {
    printSectionHeader("Tools / Commands");
    const cmds: [string, string][] = [
        ["/watch <dir>", "Start watching a directory for changes"],
        ["/unwatch", "Stop all active file watchers"],
        ["/auto", "Toggle autonomous (auto-apply) mode"],
        ["/status", "Show watcher status and telemetry summary"],
        ["/events", "Show recent file-change events (last 10)"],
        ["/tools  |  /help", "Show this command list"],
        ["/quit  |  /exit", "Exit the shell"],
        ["<any text>", "Send a message to the Copilot agent"],
    ];
    for (const [cmd, desc] of cmds) {
        console.log(`  ${c(FG.brightYellow, cmd.padEnd(28))} ${c(DIM, desc)}`);
    }
    console.log();
}

/** /events — recent file-change events */
function printEvents(events: FileChangeEvent[]) {
    printSectionHeader("Recent File-Change Events");
    if (events.length === 0) {
        console.log(c(DIM, "  (no events yet)"));
    } else {
        for (const evt of events) {
            const typeLabel =
                evt.type === "add"
                    ? c(FG.brightGreen, "ADD ")
                    : evt.type === "unlink"
                      ? c(FG.brightRed, "DEL ")
                      : c(FG.brightYellow, "MOD ");
            const added = evt.diff ? `+${evt.diff.linesAdded}` : "";
            const removed = evt.diff ? `-${evt.diff.linesRemoved}` : "";
            const stats =
                evt.diff
                    ? ` ${c(FG.brightGreen, added)} ${c(FG.brightRed, removed)}`
                    : "";
            console.log(
                `  ${typeLabel} ${c(FG.brightWhite, path.basename(evt.filePath))}` +
                    `${stats}  ${c(DIM, `(${evt.telemetry.latencyMs}ms)`)}`
            );
        }
    }
    console.log();
}

/** /status — watcher status + telemetry summary */
function printStatus(
    watchedPaths: string[],
    autoMode: boolean,
    telemetryLog: PatchTelemetry[]
) {
    printSectionHeader("Watcher Status");
    console.log(
        `  Autonomous mode : ${autoMode ? c(FG.brightYellow, "ON") : c(FG.brightBlack, "OFF")}`
    );
    if (watchedPaths.length === 0) {
        console.log(`  Watched paths   : ${c(DIM, "(none)")}`);
    } else {
        for (const p of watchedPaths) {
            console.log(`  Watching        : ${c(FG.brightCyan, p)}`);
        }
    }
    if (telemetryLog.length > 0) {
        const latencies = telemetryLog.map((t) => t.latencyMs);
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const max = Math.max(...latencies);
        console.log();
        printSectionHeader("Telemetry Summary");
        console.log(`  Total patches   : ${telemetryLog.length}`);
        console.log(`  Avg diff latency: ${avg.toFixed(1)} ms`);
        console.log(`  Max diff latency: ${max} ms`);
    }
    console.log();
}

// ─── Auto-apply ───────────────────────────────────────────────────────────────

/** Attempt to apply a suggested edit returned by the agent. */
function tryApplyEdit(filePath: string, suggestion: string): boolean {
    // Look for a fenced code block (```...```) in the suggestion.
    // If found, write the first code block's content back to the file.
    const match = suggestion.match(/```(?:\w*\n)?([\s\S]*?)```/);
    if (!match) return false;
    try {
        fs.writeFileSync(filePath, match[1]!, "utf-8");
        return true;
    } catch {
        return false;
    }
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

class Spinner {
    private frame = 0;
    private timer: ReturnType<typeof setInterval> | null = null;
    private active = false;

    start(label = "Thinking") {
        this.active = true;
        this.frame = 0;
        process.stdout.write("\n");
        this.timer = setInterval(() => {
            const icon = c(FG.brightCyan, SPINNER_FRAMES[this.frame % SPINNER_FRAMES.length]!);
            process.stdout.write(`\r  ${icon}  ${c(DIM, label + "…")}`);
            this.frame++;
        }, 80);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.active) {
            process.stdout.write("\r\x1b[2K");
            this.active = false;
        }
    }
}

// ─── Main shell ───────────────────────────────────────────────────────────────

async function main() {
    // ── Parse CLI args ────────────────────────────────────────────────────────
    const args = process.argv.slice(2);
    let model: string | undefined;
    let autonomousMode = false;

    for (let i = 0; i < args.length; i++) {
        if ((args[i] === "--model" || args[i] === "-m") && args[i + 1]) {
            model = args[++i];
        } else if (args[i] === "--auto") {
            autonomousMode = true;
        }
    }

    // ── SDK setup ─────────────────────────────────────────────────────────────
    const client = new CopilotClient();
    let session = await client.createSession(
        model ? { model, streaming: true } : { streaming: true }
    );

    // ── State ─────────────────────────────────────────────────────────────────
    let watcher: FileWatcher | null = null;
    const watchedPaths: string[] = [];
    const recentEvents: FileChangeEvent[] = [];
    const telemetryLog: PatchTelemetry[] = [];
    const MAX_RECENT_EVENTS = 10;

    const spinner = new Spinner();
    let isProcessing = false;

    const currentModel = () => model ?? "default";

    printHeader(currentModel(), autonomousMode);

    // ── Readline setup ────────────────────────────────────────────────────────
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    const prompt = () => {
        if (!isProcessing) {
            process.stdout.write(`\n${c(FG.brightCyan, "  ❯")} `);
        }
    };

    // ── Graceful shutdown ─────────────────────────────────────────────────────
    async function shutdown() {
        spinner.stop();
        if (watcher) await watcher.stop().catch(() => {});
        await session.destroy().catch(() => {});
        await client.stop().catch(() => {});
        console.log(`\n  ${c(FG.brightCyan, "Goodbye! 👋")}\n`);
        rl.close();
        process.exit(0);
    }

    rl.on("SIGINT", () => void shutdown());

    // ── Watch event handler ───────────────────────────────────────────────────

    async function handleFileChange(event: FileChangeEvent) {
        // Record telemetry
        telemetryLog.push(event.telemetry);

        // Track recent events (events pane)
        recentEvents.push(event);
        if (recentEvents.length > MAX_RECENT_EVENTS) {
            recentEvents.shift();
        }

        if (!event.diff || (event.diff.linesAdded === 0 && event.diff.linesRemoved === 0)) {
            return; // nothing changed semantically
        }

        const diffText = formatDiffForPrompt(event.diff);
        const prompt_text =
            `A file has changed. Please review the diff below and suggest improvements ` +
            `or refactors. If you propose a full rewrite of the file, wrap the new content ` +
            `in a single fenced code block.\n\n${diffText}`;

        console.log(
            `\n  ${c(FG.brightYellow, "⟳")} ${c(BOLD, "File changed:")} ` +
                `${c(FG.brightCyan, path.basename(event.filePath))} ` +
                `${c(FG.brightGreen, `+${event.diff.linesAdded}`)} ` +
                `${c(FG.brightRed, `-${event.diff.linesRemoved}`)}`
        );

        // Telemetry: record patch dispatch time
        const patchSentAt = Date.now();

        isProcessing = true;
        spinner.start("Analyzing");

        let fullResponse = "";
        const unsubscribe = session.on((ev) => {
            if (ev.type === "assistant.message_delta") {
                const delta: string = (ev.data as { deltaContent?: string }).deltaContent ?? "";
                fullResponse += delta;
            }
        });

        try {
            await session.sendAndWait({ prompt: prompt_text }, 120_000);
        } catch (err) {
            spinner.stop();
            const msg = err instanceof Error ? err.message : String(err);
            console.log(`\n  ${c(FG.brightRed, "Agent error:")} ${msg}`);
            unsubscribe();
            isProcessing = false;
            prompt();
            return;
        }

        unsubscribe();
        spinner.stop();

        // Telemetry: record agent response latency
        const agentLatencyMs = Date.now() - patchSentAt;
        console.log(
            `\n  ${c(FG.brightMagenta + BOLD, "Copilot")}  ${c(FG.brightBlack, "─".repeat(53))}`
        );
        if (fullResponse) {
            for (const line of fullResponse.split("\n")) {
                console.log(`  ${c(FG.brightWhite, line)}`);
            }
        }

        console.log(
            `\n  ${c(DIM, `[telemetry] diff: ${event.telemetry.latencyMs}ms  agent: ${agentLatencyMs}ms]`)}`
        );

        // Auto-apply if enabled
        if (autonomousMode && fullResponse) {
            const applied = tryApplyEdit(event.filePath, fullResponse);
            if (applied) {
                console.log(
                    `  ${c(FG.brightGreen, "✓")} ${c(DIM, "Auto-applied edit to")} ` +
                        `${c(FG.brightCyan, path.basename(event.filePath))}`
                );
            }
        }

        isProcessing = false;
        prompt();
    }

    // ── Command dispatch ──────────────────────────────────────────────────────

    rl.on("line", async (line: string) => {
        const input = line.trim();
        if (!input) {
            prompt();
            return;
        }

        if (input.startsWith("/")) {
            const [cmd, ...rest] = input.split(/\s+/);
            switch (cmd?.toLowerCase()) {
                // ── /quit / /exit ─────────────────────────────────────────
                case "/quit":
                case "/exit":
                    await shutdown();
                    return;

                // ── /help / /tools ────────────────────────────────────────
                case "/help":
                case "/tools":
                    printTools();
                    break;

                // ── /watch <dir> ──────────────────────────────────────────
                case "/watch": {
                    const target = rest[0]
                        ? path.resolve(rest[0])
                        : process.cwd();

                    if (!fs.existsSync(target)) {
                        console.log(
                            `\n  ${c(FG.brightRed, "Error:")} path not found: ${target}\n`
                        );
                        break;
                    }

                    if (watchedPaths.includes(target)) {
                        console.log(
                            `\n  ${c(FG.brightYellow, "Already watching:")} ${target}\n`
                        );
                        break;
                    }

                    watchedPaths.push(target);

                    if (watcher) {
                        await watcher.stop();
                    }

                    watcher = new FileWatcher({ paths: [...watchedPaths] });
                    watcher.on("change", (event) => void handleFileChange(event));
                    watcher.on("error", (err) =>
                        console.log(`\n  ${c(FG.brightRed, "Watcher error:")} ${err.message}\n`)
                    );

                    await watcher.start();
                    console.log(
                        `\n  ${c(FG.brightGreen, "✓")} Watching: ${c(FG.brightCyan, target)}\n`
                    );
                    break;
                }

                // ── /unwatch ──────────────────────────────────────────────
                case "/unwatch":
                    if (watcher) {
                        await watcher.stop();
                        watcher = null;
                    }
                    watchedPaths.length = 0;
                    console.log(`\n  ${c(FG.brightGreen, "✓")} All watchers stopped.\n`);
                    break;

                // ── /auto ─────────────────────────────────────────────────
                case "/auto":
                    autonomousMode = !autonomousMode;
                    console.log(
                        `\n  ${c(FG.brightGreen, "✓")} Autonomous mode: ` +
                            `${autonomousMode ? c(FG.brightYellow, "ON") : c(FG.brightBlack, "OFF")}\n`
                    );
                    break;

                // ── /status ───────────────────────────────────────────────
                case "/status":
                    console.log();
                    printStatus(watchedPaths, autonomousMode, telemetryLog);
                    break;

                // ── /events ───────────────────────────────────────────────
                case "/events":
                    console.log();
                    printEvents(recentEvents);
                    break;

                // ── /model ────────────────────────────────────────────────
                case "/model": {
                    const newModel = rest[0];
                    if (!newModel) {
                        console.log(`\n  ${c(FG.brightRed, "Usage:")} /model <model-name>\n`);
                    } else {
                        await session.destroy().catch(() => {});
                        model = newModel;
                        session = await client.createSession({ model, streaming: true });
                        console.log(
                            `\n  ${c(FG.brightGreen, "✓")} Switched to model: ` +
                                `${c(FG.brightYellow, model)}\n`
                        );
                    }
                    break;
                }

                default:
                    console.log(
                        `\n  ${c(FG.brightRed, "Unknown command:")} ${input}  ${c(DIM, "(type /help)")}\n`
                    );
            }
            prompt();
            return;
        }

        // ── Free-form chat message ────────────────────────────────────────────
        isProcessing = true;
        console.log(`\n  ${c(FG.brightGreen + BOLD, "You")}  ${c(FG.brightBlack, "─".repeat(56))}`);
        for (const ln of input.split("\n")) {
            console.log(`  ${c(FG.brightGreen, ln)}`);
        }

        spinner.start("Thinking");

        let fullResponse = "";
        const unsubscribe = session.on((ev) => {
            if (ev.type === "assistant.message_delta") {
                const delta: string = (ev.data as { deltaContent?: string }).deltaContent ?? "";
                fullResponse += delta;
            }
        });

        try {
            await session.sendAndWait({ prompt: input });
        } catch (err) {
            spinner.stop();
            const msg = err instanceof Error ? err.message : String(err);
            console.log(`\n  ${c(FG.brightRed, "Error:")} ${msg}\n`);
            unsubscribe();
            isProcessing = false;
            prompt();
            return;
        }

        unsubscribe();
        spinner.stop();

        console.log(
            `\n  ${c(FG.brightMagenta + BOLD, "Copilot")}  ${c(FG.brightBlack, "─".repeat(53))}`
        );
        for (const ln of fullResponse.split("\n")) {
            console.log(`  ${c(FG.brightWhite, ln)}`);
        }
        console.log();

        isProcessing = false;
        prompt();
    });

    prompt();
}

main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\nFatal error: ${msg}\n`);
    process.exit(1);
});
