/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import { describe, it, expect, vi } from "vitest";
import { EventBus } from "../src/core/event-bus.js";

describe("EventBus", () => {
    describe("basic delivery", () => {
        it("delivers a chat.delta event to a registered handler", () => {
            const bus = new EventBus();
            const handler = vi.fn();

            bus.on("chat.delta", handler);
            bus.emit("chat.delta", { delta: "Hello, world!" });

            expect(handler).toHaveBeenCalledOnce();
            expect(handler).toHaveBeenCalledWith({ delta: "Hello, world!" });
        });

        it("delivers a tool.execution_start event to a registered handler", () => {
            const bus = new EventBus();
            const handler = vi.fn();

            bus.on("tool.execution_start", handler);
            bus.emit("tool.execution_start", { toolCallId: "abc-123", toolName: "read_file" });

            expect(handler).toHaveBeenCalledOnce();
            expect(handler).toHaveBeenCalledWith({ toolCallId: "abc-123", toolName: "read_file" });
        });

        it("delivers a tool.execution_complete event to a registered handler", () => {
            const bus = new EventBus();
            const handler = vi.fn();

            bus.on("tool.execution_complete", handler);
            bus.emit("tool.execution_complete", {
                toolCallId: "abc-123",
                success: true,
                result: "file content",
            });

            expect(handler).toHaveBeenCalledOnce();
            expect(handler).toHaveBeenCalledWith({
                toolCallId: "abc-123",
                success: true,
                result: "file content",
            });
        });

        it("does not deliver to handlers for a different event type", () => {
            const bus = new EventBus();
            const handler = vi.fn();

            bus.on("chat.delta", handler);
            bus.emit("tool.execution_start", { toolCallId: "x", toolName: "y" });

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe("multiple handlers", () => {
        it("calls all registered handlers for the same event", () => {
            const bus = new EventBus();
            const h1 = vi.fn();
            const h2 = vi.fn();

            bus.on("chat.delta", h1);
            bus.on("chat.delta", h2);
            bus.emit("chat.delta", { delta: "ping" });

            expect(h1).toHaveBeenCalledOnce();
            expect(h2).toHaveBeenCalledOnce();
        });
    });

    describe("unsubscribe", () => {
        it("stops delivering after unsubscribe is called", () => {
            const bus = new EventBus();
            const handler = vi.fn();

            const unsub = bus.on("chat.delta", handler);
            bus.emit("chat.delta", { delta: "first" });
            unsub();
            bus.emit("chat.delta", { delta: "second" });

            expect(handler).toHaveBeenCalledOnce();
            expect(handler).toHaveBeenCalledWith({ delta: "first" });
        });

        it("only removes the unsubscribed handler, leaving others intact", () => {
            const bus = new EventBus();
            const h1 = vi.fn();
            const h2 = vi.fn();

            const unsub1 = bus.on("chat.delta", h1);
            bus.on("chat.delta", h2);

            unsub1();
            bus.emit("chat.delta", { delta: "after unsub" });

            expect(h1).not.toHaveBeenCalled();
            expect(h2).toHaveBeenCalledOnce();
        });
    });

    describe("removeAllListeners", () => {
        it("removes all handlers for a specific event", () => {
            const bus = new EventBus();
            const h1 = vi.fn();
            const h2 = vi.fn();

            bus.on("chat.delta", h1);
            bus.on("tool.execution_start", h2);

            bus.removeAllListeners("chat.delta");
            bus.emit("chat.delta", { delta: "x" });
            bus.emit("tool.execution_start", { toolCallId: "id", toolName: "t" });

            expect(h1).not.toHaveBeenCalled();
            expect(h2).toHaveBeenCalledOnce();
        });

        it("removes all handlers when called with no argument", () => {
            const bus = new EventBus();
            const h1 = vi.fn();
            const h2 = vi.fn();

            bus.on("chat.delta", h1);
            bus.on("tool.execution_start", h2);

            bus.removeAllListeners();
            bus.emit("chat.delta", { delta: "x" });
            bus.emit("tool.execution_start", { toolCallId: "id", toolName: "t" });

            expect(h1).not.toHaveBeenCalled();
            expect(h2).not.toHaveBeenCalled();
        });
    });

    describe("error isolation", () => {
        it("continues calling remaining handlers when one throws", () => {
            const bus = new EventBus();
            const throwing = vi.fn().mockImplementation(() => {
                throw new Error("handler error");
            });
            const safe = vi.fn();

            bus.on("chat.delta", throwing);
            bus.on("chat.delta", safe);

            // Should not throw, even though `throwing` throws
            expect(() => bus.emit("chat.delta", { delta: "hi" })).not.toThrow();
            expect(throwing).toHaveBeenCalledOnce();
            expect(safe).toHaveBeenCalledOnce();
        });
    });

    describe("emit with no handlers", () => {
        it("does not throw when there are no handlers for an event", () => {
            const bus = new EventBus();
            expect(() =>
                bus.emit("chat.delta", { delta: "nobody listening" })
            ).not.toThrow();
        });
    });
});
