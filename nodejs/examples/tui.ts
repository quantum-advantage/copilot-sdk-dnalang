/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * Gemini-style Terminal User Interface for GitHub Copilot SDK
 *
 * An interactive TUI providing a chat interface with streaming responses,
 * code block formatting, and slash commands.
 *
 * Usage:
 *   npx tsx examples/tui.ts [--model <model>]
 */

import * as readline from "node:readline";
import { CopilotClient } from "../src/index.js";

// ─── ANSI color / style helpers ──────────────────────────────────────────────
const ESC = "\x1b[";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// Foreground colors
const FG = {
    black: `${ESC}30m`,
    red: `${ESC}31m`,
    green: `${ESC}32m`,
    yellow: `${ESC}33m`,
    blue: `${ESC}34m`,
    magenta: `${ESC}35m`,
    cyan: `${ESC}36m`,
    white: `${ESC}37m`,
    brightBlack: `${ESC}90m`,
    brightRed: `${ESC}91m`,
    brightGreen: `${ESC}92m`,
    brightYellow: `${ESC}93m`,
    brightBlue: `${ESC}94m`,
    brightMagenta: `${ESC}95m`,
    brightCyan: `${ESC}96m`,
    brightWhite: `${ESC}97m`,
} as const;

// Background colors
const BG = {
    black: `${ESC}40m`,
    blue: `${ESC}44m`,
    brightBlack: `${ESC}100m`,
} as const;

const c = (color: string, text: string) => `${color}${text}${RESET}`;

// ─── Layout constants ─────────────────────────────────────────────────────────
const HEADER_WIDTH = 66;
const CODE_BLOCK_WIDTH = 60;
const MSG_SEP_USER = 56;
const MSG_SEP_ASSISTANT = 53;

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
            process.stdout.write("\r\x1b[2K"); // clear spinner line
            this.active = false;
        }
    }
}

// ─── Code-block renderer ─────────────────────────────────────────────────────

/**
 * Render a string that may contain fenced code blocks (```…```).
 * Code blocks are shown with a distinct background/border.
 */
function renderMarkdown(text: string): string {
    const lines = text.split("\n");
    const out: string[] = [];
    let inCode = false;
    let lang = "";

    for (const line of lines) {
        const fence = line.match(/^```(\w*)$/);
        if (fence) {
            if (!inCode) {
                inCode = true;
                lang = fence[1] ?? "";
                const label = lang ? c(FG.brightBlack, ` ${lang} `) : "";
                out.push(
                    `  ${c(BG.brightBlack, c(FG.brightBlack, "┌─"))}${c(BG.brightBlack, label)}${c(BG.brightBlack, "─".repeat(Math.max(0, CODE_BLOCK_WIDTH - 2 - (lang ? lang.length + 2 : 0))) + "┐")}`
                );
            } else {
                inCode = false;
                lang = "";
                out.push(`  ${c(BG.brightBlack, c(FG.brightBlack, "└" + "─".repeat(CODE_BLOCK_WIDTH) + "┘"))}`);
            }
        } else if (inCode) {
            out.push(`  ${c(BG.brightBlack, c(FG.brightCyan, " " + line.padEnd(CODE_BLOCK_WIDTH) + " "))}`);
        } else {
            // Inline code `…`
            const rendered = line.replace(/`([^`]+)`/g, (_, code: string) =>
                c(FG.brightYellow, `\`${code}\``)
            );
            // Bold **…**
            const bolded = rendered.replace(/\*\*([^*]+)\*\*/g, (_, txt: string) =>
                `${BOLD}${txt}${RESET}`
            );
            out.push(bolded);
        }
    }

    return out.join("\n");
}

// ─── Header ──────────────────────────────────────────────────────────────────

function printHeader(model: string) {
    const width = HEADER_WIDTH;
    const border = "═".repeat(width);
    console.log();
    console.log(c(FG.brightCyan, `╔${border}╗`));
    console.log(
        c(FG.brightCyan, "║") +
            c(FG.brightWhite + BOLD, "    ██████╗ ██████╗ ██████╗ ██╗██╗      ██████╗ ████████╗   ") +
            c(FG.brightCyan, "║")
    );
    console.log(
        c(FG.brightCyan, "║") +
            c(FG.brightWhite + BOLD, "   ██╔════╝██╔═══██╗██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝   ") +
            c(FG.brightCyan, "║")
    );
    console.log(
        c(FG.brightCyan, "║") +
            c(FG.brightCyan + BOLD,  "   ██║     ██║   ██║██████╔╝██║██║     ██║   ██║   ██║      ") +
            c(FG.brightCyan, "║")
    );
    console.log(
        c(FG.brightCyan, "║") +
            c(FG.brightCyan + BOLD,  "   ██║     ██║   ██║██╔═══╝ ██║██║     ██║   ██║   ██║      ") +
            c(FG.brightCyan, "║")
    );
    console.log(
        c(FG.brightCyan, "║") +
            c(FG.brightCyan + BOLD,  "   ╚██████╗╚██████╔╝██║     ██║███████╗╚██████╔╝   ██║      ") +
            c(FG.brightCyan, "║")
    );
    console.log(
        c(FG.brightCyan, "║") +
            c(FG.brightCyan + BOLD,  "    ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝      ") +
            c(FG.brightCyan, "║")
    );
    console.log(c(FG.brightCyan, `╠${border}╣`));
    const modelLine = `  GitHub Copilot  ·  Model: ${model}  ·  Type /help for commands  `;
    const pad = " ".repeat(Math.max(0, width - modelLine.length));
    console.log(c(FG.brightCyan, "║") + c(DIM, modelLine + pad) + c(FG.brightCyan, "║"));
    console.log(c(FG.brightCyan, `╚${border}╝`));
    console.log();
}

// ─── Help text ───────────────────────────────────────────────────────────────

function printHelp() {
    const cmds: [string, string][] = [
        ["/help", "Show this help message"],
        ["/clear", "Clear conversation history and start fresh"],
        ["/model <name>", "Switch to a different model"],
        ["/quit  or  /exit", "Exit the TUI"],
    ];
    console.log(`\n${c(FG.brightCyan, "  Available commands:")}\n`);
    for (const [cmd, desc] of cmds) {
        console.log(`  ${c(FG.brightYellow, cmd.padEnd(20))} ${c(DIM, desc)}`);
    }
    console.log(`\n  ${c(DIM, "Press Ctrl+C at any time to exit.")}\n`);
}

// ─── Message rendering ───────────────────────────────────────────────────────

function printUserMessage(text: string) {
    console.log(
        `\n  ${c(FG.brightGreen + BOLD, "You")}  ${c(FG.brightBlack, "─".repeat(MSG_SEP_USER))}`
    );
    for (const line of text.split("\n")) {
        console.log(`  ${c(FG.brightGreen, line)}`);
    }
}

function printAssistantLabel() {
    process.stdout.write(
        `\n  ${c(FG.brightMagenta + BOLD, "Copilot")}  ${c(FG.brightBlack, "─".repeat(MSG_SEP_ASSISTANT))}\n`
    );
}

// ─── Main TUI ────────────────────────────────────────────────────────────────

async function main() {
    // Parse CLI args
    const args = process.argv.slice(2);
    let model: string | undefined;
    for (let i = 0; i < args.length; i++) {
        if ((args[i] === "--model" || args[i] === "-m") && args[i + 1]) {
            model = args[++i];
        }
    }

    const client = new CopilotClient();
    let session = await client.createSession(model ? { model } : {});

    const currentModel = () => model ?? "default";

    printHeader(currentModel());

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
        prompt: `${c(FG.brightCyan, "  ❯")} `,
    });

    const spinner = new Spinner();
    let isProcessing = false;

    const prompt = () => {
        if (!isProcessing) {
            process.stdout.write(`\n${c(FG.brightCyan, "  ❯")} `);
        }
    };

    // Handle Ctrl+C gracefully
    rl.on("SIGINT", async () => {
        spinner.stop();
        console.log(`\n\n  ${c(FG.brightCyan, "Goodbye! 👋")}\n`);
        await session.destroy().catch(() => {});
        await client.stop().catch(() => {});
        process.exit(0);
    });

    rl.on("line", async (line: string) => {
        const input = line.trim();
        if (!input) {
            prompt();
            return;
        }

        // ── Slash commands ────────────────────────────────────────────────
        if (input.startsWith("/")) {
            const [cmd, ...rest] = input.split(/\s+/);
            switch (cmd?.toLowerCase()) {
                case "/quit":
                case "/exit": {
                    spinner.stop();
                    console.log(`\n  ${c(FG.brightCyan, "Goodbye! 👋")}\n`);
                    await session.destroy().catch(() => {});
                    await client.stop().catch(() => {});
                    rl.close();
                    process.exit(0);
                    return;
                }
                case "/help": {
                    printHelp();
                    break;
                }
                case "/clear": {
                    // Destroy old session and create a new one
                    await session.destroy().catch(() => {});
                    session = await client.createSession(model ? { model } : {});
                    // Clear terminal
                    process.stdout.write("\x1bc");
                    printHeader(currentModel());
                    console.log(`  ${c(FG.brightCyan, "✓")} ${c(DIM, "Conversation cleared.")}`);
                    break;
                }
                case "/model": {
                    const newModel = rest[0];
                    if (!newModel) {
                        console.log(`\n  ${c(FG.brightRed, "Usage:")} /model <model-name>\n`);
                    } else {
                        await session.destroy().catch(() => {});
                        model = newModel;
                        session = await client.createSession({ model });
                        console.log(
                            `\n  ${c(FG.brightCyan, "✓")} ${c(DIM, `Switched to model: ${c(FG.brightYellow, model)}\n`)}`
                        );
                    }
                    break;
                }
                default: {
                    console.log(
                        `\n  ${c(FG.brightRed, "Unknown command:")} ${input}  ${c(DIM, "(type /help)")}\n`
                    );
                }
            }
            prompt();
            return;
        }

        // ── Chat message ─────────────────────────────────────────────────
        isProcessing = true;
        printUserMessage(input);
        spinner.start("Thinking");

        let fullResponse = "";

        const unsubscribe = session.on((event) => {
            if (event.type === "assistant.message_delta") {
                const delta: string = (event.data as { content?: string }).content ?? "";
                fullResponse += delta;
            }
        });

        try {
            await session.sendAndWait({ prompt: input });
        } catch (err: unknown) {
            spinner.stop();
            const msg = err instanceof Error ? err.message : String(err);
            console.log(`\n  ${c(FG.brightRed, "Error:")} ${msg}\n`);
            isProcessing = false;
            prompt();
            unsubscribe();
            return;
        }

        unsubscribe();
        spinner.stop();

        printAssistantLabel();
        const rendered = renderMarkdown(fullResponse);
        for (const line of rendered.split("\n")) {
            console.log(`  ${c(FG.brightWhite, line)}`);
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
