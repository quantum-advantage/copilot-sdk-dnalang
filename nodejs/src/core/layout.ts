/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * ShellLayout — full-screen blessed UI for the Copilot Cognitive Shell.
 *
 * Renders a two-column layout:
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Copilot Cognitive Shell  ·  Model: <model>     [header]    │
 * ├─────────────────────────────────────────────────┬───────────┤
 * │                                                 │  Tools    │
 * │  Chat output                                    ├───────────┤
 * │  (scrollable)                                   │  Events   │
 * │                                                 ├───────────┤
 * │                                                 │  Status   │
 * ├─────────────────────────────────────────────────┼───────────┤
 * │ Input ▸                                         │  Log      │
 * └─────────────────────────────────────────────────┴───────────┘
 * ```
 *
 * The right "container" is divided into **four side panes** (Tools, Events,
 * Status, Log) that are updated via the {@link EventBus}.
 *
 * ## Keyboard navigation
 * - **Tab / Shift+Tab** — cycle focus between the Chat, Input, Tools, Events,
 *   Status, and Log panes.
 * - **Enter** (when Input pane is focused) — submit the typed message.
 * - **Ctrl+C / q** — graceful exit (calls the registered `onExit` handler).
 *
 * ## Known Limitations
 *
 * ### Log trimming via `blessed` internal `_clines` API
 *
 * The {@link ShellLayout} trims the Tools and Log side-panes when their
 * content exceeds {@link MAX_PANE_LINES} rendered lines.  To determine the
 * current rendered line count we access the **undocumented internal property**
 * `element._clines` on a `blessed` widget.
 *
 * `_clines` is an array of strings that `blessed` builds internally when it
 * renders a `Log` or `Box` widget's content onto the terminal.  It correctly
 * accounts for word-wrap, ANSI escape codes, and Unicode width — things that a
 * naïve `content.split('\n').length` count would get wrong.
 *
 * **Why this is a risk**: `_clines` is not part of blessed's public API and is
 * not documented.  It has been stable across all released versions of blessed
 * (0.0.x through 0.1.x) as of 2026, but a future major release could rename
 * or remove it.
 *
 * **Fallback**: If `_clines` is unavailable (i.e., the property is undefined),
 * the layout silently falls back to splitting `getContent()` on newlines.
 * This fallback is slightly less accurate under word-wrap but is always safe.
 *
 * **Mitigation path**: Should blessed be updated and `_clines` disappears,
 * replace the `trimPaneContent` helper below with a call to the public
 * `scrollback` option on `Widgets.Log` (set a bounded `scrollback` value so
 * blessed itself discards old lines) or implement a manual content-accumulator
 * that keeps a plain string buffer and calls `setContent` on each update.
 */

import blessed from "blessed";
import type { EventBus } from "./event-bus.js";

/** Maximum number of lines kept in the Tools and Log side-panes. */
const MAX_PANE_LINES = 200;

/**
 * Internal helper: access the blessed `_clines` array to get the rendered
 * line count of a box element.
 *
 * @see "Known Limitations" section in the module docstring above.
 */
function renderedLineCount(element: blessed.Widgets.BoxElement): number {
    const clines = (element as unknown as { _clines?: string[] })._clines;
    if (clines) {
        return clines.length;
    }
    // Fallback: count newlines in the stored content string.
    return element.getContent().split("\n").length;
}

/**
 * Trim a `Widgets.Log` pane so that it never exceeds `maxLines` rendered
 * lines.  When over the limit we discard the oldest half of the content.
 *
 * This helper intentionally uses the `_clines` internal API.  See the module
 * docstring for rationale and migration guidance.
 */
function trimPaneContent(pane: blessed.Widgets.Log, maxLines: number): void {
    if (renderedLineCount(pane) <= maxLines) return;

    // Grab content as a plain string and split on newlines.
    const lines = pane.getContent().split("\n");
    // Keep only the most-recent half.
    const keep = lines.slice(Math.floor(lines.length / 2));
    pane.setContent(keep.join("\n"));
}

/** Options accepted by the {@link ShellLayout} constructor. */
export interface ShellLayoutOptions {
    /** Model name shown in the header. */
    model: string;
    /** Called when the user presses Ctrl+C or 'q'. */
    onExit: () => void;
    /** Called when the user submits a prompt from the input pane. */
    onInput: (text: string) => void;
}

/**
 * Full-screen blessed UI for the Copilot Cognitive Shell.
 *
 * Create an instance, call {@link render} to paint the initial layout, then
 * use the public methods ({@link appendChat}, {@link logTool}, {@link logEvent},
 * {@link setStatus}, {@link appendLog}) to push content into the panes.
 *
 * The layout subscribes itself to an {@link EventBus} via
 * {@link wireEventBus}; you do **not** need to call the pane-update methods
 * manually when using the bus.
 */
export class ShellLayout {
    private readonly screen: blessed.Widgets.Screen;
    private readonly chatPane: blessed.Widgets.Log;
    private readonly inputBox: blessed.Widgets.TextboxElement;
    private readonly toolsPane: blessed.Widgets.Log;
    private readonly eventsPane: blessed.Widgets.Log;
    private readonly statusPane: blessed.Widgets.BoxElement;
    private readonly logPane: blessed.Widgets.Log;

    /** All focusable panes in Tab-cycle order. */
    private readonly focusOrder: blessed.Widgets.BlessedElement[];
    private focusIndex = 0;

    constructor(private readonly opts: ShellLayoutOptions) {
        // ── Screen ──────────────────────────────────────────────────────────
        this.screen = blessed.screen({
            smartCSR: true,
            title: "Copilot Cognitive Shell",
            fullUnicode: true,
        });

        // ── Header ──────────────────────────────────────────────────────────
        blessed.box({
            parent: this.screen,
            top: 0,
            left: 0,
            width: "100%",
            height: 1,
            content: ` Copilot Cognitive Shell  ·  Model: ${opts.model}  [Tab] focus  [Enter] send  [q] quit`,
            style: {
                fg: "white",
                bg: "blue",
                bold: true,
            },
        });

        // ── Right container width ────────────────────────────────────────────
        const rightWidth = 32; // columns

        // ── Chat pane (left, large scrollable area) ──────────────────────────
        this.chatPane = blessed.log({
            parent: this.screen,
            top: 1,
            left: 0,
            width: `100%-${rightWidth}`,
            height: "100%-3", // leave 1 header + 2 input rows
            label: " Chat ",
            border: { type: "line" },
            scrollable: true,
            alwaysScroll: true,
            scrollOnInput: true,
            mouse: true,
            keys: true,
            vi: true,
            scrollback: MAX_PANE_LINES,
            style: {
                fg: "white",
                border: { fg: "cyan" },
                label: { fg: "cyan", bold: true },
                scrollbar: { bg: "cyan" },
            },
            scrollbar: { ch: "│" },
        });

        // ── Input box ────────────────────────────────────────────────────────
        this.inputBox = blessed.textbox({
            parent: this.screen,
            bottom: 0,
            left: 0,
            width: `100%-${rightWidth}`,
            height: 2,
            label: " Input ▸ ",
            border: { type: "line" },
            inputOnFocus: true,
            keys: true,
            mouse: true,
            style: {
                fg: "brightGreen",
                border: { fg: "green" },
                label: { fg: "green", bold: true },
                focus: { border: { fg: "brightGreen" } },
            },
        });

        // ── Right-column side panes ──────────────────────────────────────────

        const paneHeight = Math.floor((this.screen.height as number) / 4) || 8;

        // [1] Tools pane — top quarter of right column
        this.toolsPane = blessed.log({
            parent: this.screen,
            top: 1,
            right: 0,
            width: rightWidth,
            height: paneHeight,
            label: " Tools ",
            border: { type: "line" },
            scrollable: true,
            alwaysScroll: true,
            scrollOnInput: true,
            mouse: true,
            scrollback: MAX_PANE_LINES,
            style: {
                fg: "yellow",
                border: { fg: "yellow" },
                label: { fg: "yellow", bold: true },
                scrollbar: { bg: "yellow" },
            },
            scrollbar: { ch: "│" },
        });

        // [2] Events pane — second quarter
        this.eventsPane = blessed.log({
            parent: this.screen,
            top: 1 + paneHeight,
            right: 0,
            width: rightWidth,
            height: paneHeight,
            label: " Events ",
            border: { type: "line" },
            scrollable: true,
            alwaysScroll: true,
            scrollOnInput: true,
            mouse: true,
            scrollback: MAX_PANE_LINES,
            style: {
                fg: "magenta",
                border: { fg: "magenta" },
                label: { fg: "magenta", bold: true },
                scrollbar: { bg: "magenta" },
            },
            scrollbar: { ch: "│" },
        });

        // [3] Status pane — third quarter
        this.statusPane = blessed.box({
            parent: this.screen,
            top: 1 + paneHeight * 2,
            right: 0,
            width: rightWidth,
            height: paneHeight,
            label: " Status ",
            border: { type: "line" },
            content: `Model: ${opts.model}\nReady`,
            style: {
                fg: "brightCyan",
                border: { fg: "cyan" },
                label: { fg: "cyan", bold: true },
            },
        });

        // [4] Log pane — bottom quarter of right column
        this.logPane = blessed.log({
            parent: this.screen,
            top: 1 + paneHeight * 3,
            right: 0,
            width: rightWidth,
            height: "100%-" + (1 + paneHeight * 3),
            label: " Log ",
            border: { type: "line" },
            scrollable: true,
            alwaysScroll: true,
            scrollOnInput: true,
            mouse: true,
            scrollback: MAX_PANE_LINES,
            style: {
                fg: "brightBlack",
                border: { fg: "brightBlack" },
                label: { fg: "brightBlack", bold: true },
                scrollbar: { bg: "brightBlack" },
            },
            scrollbar: { ch: "│" },
        });

        // ── Focus order ──────────────────────────────────────────────────────
        this.focusOrder = [
            this.inputBox,
            this.chatPane,
            this.toolsPane,
            this.eventsPane,
            this.statusPane,
            this.logPane,
        ];

        // ── Keyboard bindings ────────────────────────────────────────────────
        this.screen.key(["q", "C-c"], () => {
            opts.onExit();
        });

        this.screen.key(["tab"], () => {
            this.advanceFocus(1);
        });

        this.screen.key(["S-tab"], () => {
            this.advanceFocus(-1);
        });

        // Submit input on Enter when input box is focused
        this.inputBox.on("submit", (value: string) => {
            const text = (value ?? "").trim();
            this.inputBox.clearValue();
            if (text) {
                opts.onInput(text);
            }
            this.screen.render();
        });

        // Focus input box by default
        this.inputBox.focus();
    }

    /** Paint the initial layout. */
    render(): void {
        this.screen.render();
    }

    /**
     * Append a line to the Chat pane.
     * @param line - Plain text or blessed-tagged markup.
     */
    appendChat(line: string): void {
        this.chatPane.log(line);
        this.screen.render();
    }

    /**
     * Append a line to the Tools side-pane.
     * Automatically trims old content when {@link MAX_PANE_LINES} is exceeded.
     */
    logTool(line: string): void {
        this.toolsPane.log(line);
        trimPaneContent(this.toolsPane, MAX_PANE_LINES);
        this.screen.render();
    }

    /**
     * Append a line to the Events side-pane.
     * Automatically trims old content when {@link MAX_PANE_LINES} is exceeded.
     */
    logEvent(line: string): void {
        this.eventsPane.log(line);
        trimPaneContent(this.eventsPane, MAX_PANE_LINES);
        this.screen.render();
    }

    /**
     * Replace the entire content of the Status pane.
     * @param text - Plain text (newlines are honored).
     */
    setStatus(text: string): void {
        this.statusPane.setContent(text);
        this.screen.render();
    }

    /**
     * Append a raw line to the Debug Log pane.
     * Automatically trims old content when {@link MAX_PANE_LINES} is exceeded.
     */
    appendLog(line: string): void {
        this.logPane.log(line);
        trimPaneContent(this.logPane, MAX_PANE_LINES);
        this.screen.render();
    }

    /**
     * Wire the layout to an {@link EventBus} so that incoming bus events are
     * automatically reflected in the appropriate side-panes.
     *
     * Returns a cleanup function that removes all subscriptions.
     */
    wireEventBus(bus: EventBus): () => void {
        const unsubStart = bus.on("tool.execution_start", ({ toolCallId, toolName }) => {
            this.logTool(`{yellow-fg}▶{/} ${toolName} [${toolCallId.slice(0, 8)}]`);
        });

        const unsubComplete = bus.on("tool.execution_complete", ({ toolCallId, success, error }) => {
            const icon = success ? "{green-fg}✓{/}" : "{red-fg}✗{/}";
            const suffix = !success && error ? ` ${error}` : "";
            this.logTool(`${icon} done  [${toolCallId.slice(0, 8)}]${suffix}`);
        });

        const unsubDelta = bus.on("chat.delta", ({ delta }) => {
            // Append incremental chat content without a trailing newline.
            // We accumulate deltas by appending to the last chat line.
            this.chatPane.log(delta);
            this.screen.render();
        });

        return () => {
            unsubStart();
            unsubComplete();
            unsubDelta();
        };
    }

    /** Destroy the blessed screen (restores normal terminal state). */
    destroy(): void {
        this.screen.destroy();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /** Move focus to the next (delta=+1) or previous (delta=-1) pane. */
    private advanceFocus(delta: 1 | -1): void {
        const len = this.focusOrder.length;
        this.focusIndex = ((this.focusIndex + delta) % len + len) % len;
        this.focusOrder[this.focusIndex]?.focus();
        this.screen.render();
    }
}
