/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * Diff Engine — structured line diff generator.
 *
 * Computes unified-diff–style change sets between two versions of a file,
 * and formats them as patch text suitable for sending to a Copilot agent.
 */

import { diffLines, createPatch } from "diff";

/** A single changed hunk in a line-level diff. */
export interface DiffHunk {
    /** 1-based starting line number in the original file (for removed/context lines). */
    startLine: number;
    /** Lines removed from the original file (without the leading `-`). */
    removed: string[];
    /** Lines added to the new file (without the leading `+`). */
    added: string[];
}

/** Structured result from {@link computeLineDiff}. */
export interface LineDiffResult {
    /** Path of the changed file (relative or absolute). */
    filePath: string;
    /** Unified patch string suitable for embedding in a prompt or log. */
    patch: string;
    /** Structured list of change hunks, useful for targeted edits. */
    hunks: DiffHunk[];
    /** Total number of lines added. */
    linesAdded: number;
    /** Total number of lines removed. */
    linesRemoved: number;
}

/**
 * Compute a structured line diff between two versions of a file.
 *
 * @param filePath   - Path label shown in the patch header (e.g. `src/index.ts`).
 * @param oldContent - Previous content of the file.
 * @param newContent - New content of the file.
 * @returns {@link LineDiffResult} with both a unified patch and structured hunks.
 *
 * @example
 * ```typescript
 * const result = computeLineDiff("src/index.ts", oldText, newText);
 * console.log(result.patch);
 * ```
 */
export function computeLineDiff(
    filePath: string,
    oldContent: string,
    newContent: string
): LineDiffResult {
    const patch = createPatch(filePath, oldContent, newContent, "original", "modified");

    const changes = diffLines(oldContent, newContent);
    const hunks: DiffHunk[] = [];

    let lineNo = 1; // current position in the original file
    let currentHunk: DiffHunk | null = null;

    let linesAdded = 0;
    let linesRemoved = 0;

    for (const change of changes) {
        const lines = change.value.split("\n");
        // diffLines includes a trailing empty string when the value ends with "\n"
        const lineCount = lines[lines.length - 1] === "" ? lines.length - 1 : lines.length;

        if (change.added) {
            linesAdded += lineCount;
            if (!currentHunk) {
                currentHunk = { startLine: lineNo, removed: [], added: [] };
            }
            for (let i = 0; i < lineCount; i++) {
                currentHunk.added.push(lines[i]!);
            }
        } else if (change.removed) {
            linesRemoved += lineCount;
            if (!currentHunk) {
                currentHunk = { startLine: lineNo, removed: [], added: [] };
            }
            for (let i = 0; i < lineCount; i++) {
                currentHunk.removed.push(lines[i]!);
            }
            lineNo += lineCount;
        } else {
            // Context — flush pending hunk
            if (currentHunk) {
                hunks.push(currentHunk);
                currentHunk = null;
            }
            lineNo += lineCount;
        }
    }

    if (currentHunk) {
        hunks.push(currentHunk);
    }

    return { filePath, patch, hunks, linesAdded, linesRemoved };
}

/**
 * Format a {@link LineDiffResult} as a concise patch-style prompt fragment.
 *
 * @param result - The diff result to format.
 * @returns A string ready to embed in a Copilot prompt.
 */
export function formatDiffForPrompt(result: LineDiffResult): string {
    return [
        `File changed: ${result.filePath}`,
        `Lines added: ${result.linesAdded}  Lines removed: ${result.linesRemoved}`,
        "",
        "```diff",
        result.patch.trim(),
        "```",
    ].join("\n");
}
