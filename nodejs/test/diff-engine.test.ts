/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import { describe, it, expect } from "vitest";
import { computeLineDiff, formatDiffForPrompt } from "../src/core/diff-engine.js";

describe("computeLineDiff", () => {
    it("returns empty hunks for identical content", () => {
        const result = computeLineDiff("file.ts", "hello\nworld\n", "hello\nworld\n");
        expect(result.hunks).toHaveLength(0);
        expect(result.linesAdded).toBe(0);
        expect(result.linesRemoved).toBe(0);
        expect(result.filePath).toBe("file.ts");
    });

    it("detects a single-line change", () => {
        const result = computeLineDiff("src/index.ts", "foo\nbar\nbaz\n", "foo\nqux\nbaz\n");
        expect(result.linesAdded).toBe(1);
        expect(result.linesRemoved).toBe(1);
        expect(result.hunks).toHaveLength(1);
        const hunk = result.hunks[0]!;
        expect(hunk.removed).toContain("bar");
        expect(hunk.added).toContain("qux");
    });

    it("detects added lines", () => {
        const result = computeLineDiff("f.ts", "a\n", "a\nb\nc\n");
        expect(result.linesAdded).toBe(2);
        expect(result.linesRemoved).toBe(0);
    });

    it("detects removed lines", () => {
        const result = computeLineDiff("f.ts", "a\nb\nc\n", "a\n");
        expect(result.linesAdded).toBe(0);
        expect(result.linesRemoved).toBe(2);
    });

    it("produces a non-empty patch string", () => {
        const result = computeLineDiff("file.ts", "old\n", "new\n");
        expect(result.patch).toContain("-old");
        expect(result.patch).toContain("+new");
    });

    it("reports the correct filePath", () => {
        const result = computeLineDiff("custom/path.ts", "x\n", "y\n");
        expect(result.filePath).toBe("custom/path.ts");
    });

    it("handles empty old content (new file)", () => {
        const result = computeLineDiff("new.ts", "", "hello\nworld\n");
        expect(result.linesAdded).toBe(2);
        expect(result.linesRemoved).toBe(0);
    });

    it("handles empty new content (deleted file content)", () => {
        const result = computeLineDiff("del.ts", "a\nb\n", "");
        expect(result.linesAdded).toBe(0);
        expect(result.linesRemoved).toBe(2);
    });

    it("returns multiple hunks for non-contiguous changes", () => {
        const old = "line1\nline2\nline3\nline4\nline5\n";
        const next = "line1\nLINE2\nline3\nline4\nLINE5\n";
        const result = computeLineDiff("f.ts", old, next);
        expect(result.hunks.length).toBeGreaterThanOrEqual(2);
    });
});

describe("formatDiffForPrompt", () => {
    it("includes the file path in the output", () => {
        const result = computeLineDiff("src/app.ts", "a\n", "b\n");
        const formatted = formatDiffForPrompt(result);
        expect(formatted).toContain("src/app.ts");
    });

    it("includes lines-added and lines-removed counts", () => {
        const result = computeLineDiff("f.ts", "old\n", "new\n");
        const formatted = formatDiffForPrompt(result);
        expect(formatted).toContain("Lines added: 1");
        expect(formatted).toContain("Lines removed: 1");
    });

    it("wraps the patch in a diff code fence", () => {
        const result = computeLineDiff("f.ts", "old\n", "new\n");
        const formatted = formatDiffForPrompt(result);
        expect(formatted).toContain("```diff");
        expect(formatted).toContain("```");
    });
});
