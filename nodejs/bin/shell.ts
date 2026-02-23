#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * Copilot Cognitive Shell — Phase 1 Entry Point
 *
 * Full-screen TUI shell that wires together:
 *   - {@link CopilotClient}  — creates and manages the Copilot session
 *   - {@link EventBus}       — translates session events to shell UI events
 *   - {@link ShellLayout}    — blessed full-screen layout with five panes
 *
 * Layout (two-column):
 *   Left  : scrollable Chat output + Input text-box
 *   Right : four side-panes — Tools, Events, Status, Log
 *
 * Session → EventBus mappings:
 *   tool.execution_start    → EventBus "tool.execution_start"
 *   tool.execution_complete → EventBus "tool.execution_complete"
 *   assistant.message_delta → EventBus "chat.delta"
 *
 * Usage:
 *   npx tsx bin/shell.ts [--model <model>]
 *
 * Keyboard:
 *   Tab / Shift+Tab  — cycle focus between panes
 *   Enter            — send message (when Input pane is focused)
 *   q / Ctrl+C       — exit
 */

import { CopilotClient } from "../src/index.js";
import { EventBus } from "../src/core/event-bus.js";
import { ShellLayout } from "../src/core/layout.js";


// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    // ── Parse CLI args ────────────────────────────────────────────────────────
    const args = process.argv.slice(2);
    let model: string | undefined;

    for (let i = 0; i < args.length; i++) {
        if ((args[i] === "--model" || args[i] === "-m") && args[i + 1]) {
            model = args[++i];
        }
    }

    const resolvedModel = model ?? "default";

    // ── SDK setup ─────────────────────────────────────────────────────────────
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession(
        model ? { model, streaming: true } : { streaming: true }
    );

    // ── Event bus ─────────────────────────────────────────────────────────────
    const bus = new EventBus();

    // ── Layout ────────────────────────────────────────────────────────────────
    const layout = new ShellLayout({
        model: resolvedModel,
        onExit: () => void shutdown(),
        onInput: (text) => void handleUserInput(text),
    });

    // Wire EventBus → layout panes
    layout.wireEventBus(bus);

    // ── Bridge session events → EventBus ─────────────────────────────────────
    //
    //   Session event               EventBus event
    //   ─────────────────────────   ─────────────────────────
    //   tool.execution_start      → tool.execution_start
    //   tool.execution_complete   → tool.execution_complete
    //   assistant.message_delta   → chat.delta
    //
    const unsubSession = session.on((ev) => {
        switch (ev.type) {
            case "tool.execution_start":
                bus.emit("tool.execution_start", {
                    toolCallId: ev.data.toolCallId,
                    toolName: ev.data.toolName,
                });
                layout.logEvent(`start: ${ev.data.toolName}`);
                break;

            case "tool.execution_complete":
                bus.emit("tool.execution_complete", {
                    toolCallId: ev.data.toolCallId,
                    success: ev.data.success,
                    result: ev.data.result?.content,
                    error: ev.data.error?.message,
                });
                layout.logEvent(`done:  ${ev.data.toolCallId.slice(0, 8)}`);
                break;

            case "assistant.message_delta":
                bus.emit("chat.delta", { delta: ev.data.deltaContent });
                break;

            case "assistant.message":
                layout.appendChat(`{cyan-fg}Copilot:{/} ${ev.data.content}`);
                break;

            case "session.idle":
                layout.setStatus(`Model: ${resolvedModel}\nIdle`);
                break;

            case "session.error":
                layout.appendChat(`{red-fg}Error:{/} ${ev.data.message}`);
                break;

            default:
                // Log other events to the debug Log pane.
                layout.appendLog(ev.type);
        }
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────────
    async function shutdown(): Promise<void> {
        unsubSession();
        bus.removeAllListeners();
        layout.destroy();
        await session.destroy().catch(() => {});
        await client.stop().catch(() => {});
        process.exit(0);
    }

    // ── Handle user input ─────────────────────────────────────────────────────
    async function handleUserInput(text: string): Promise<void> {
        layout.appendChat(`{green-fg}You:{/} ${text}`);
        layout.setStatus(`Model: ${resolvedModel}\nThinking…`);

        try {
            await session.sendAndWait({ prompt: text }, 120_000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            layout.appendChat(`{red-fg}Error:{/} ${msg}`);
            layout.setStatus(`Model: ${resolvedModel}\nError`);
        }
    }

    // ── Initial render ────────────────────────────────────────────────────────
    layout.setStatus(`Model: ${resolvedModel}\nReady`);
    layout.render();
}

main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`\nFatal error: ${msg}\n`);
    process.exit(1);
});
