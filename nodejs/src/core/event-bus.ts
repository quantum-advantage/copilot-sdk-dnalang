/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * EventBus — typed pub/sub message bus for shell UI components.
 *
 * Provides a shell-oriented event vocabulary that maps from the lower-level
 * Copilot session event types to the three canonical shell UI events:
 *
 *  - `tool.execution_start`    → tool call has begun (toolName, toolCallId)
 *  - `tool.execution_complete` → tool call has ended (success flag, optional result/error)
 *  - `chat.delta`              → incremental assistant text (maps to assistant.message_delta)
 *
 * Usage:
 * ```typescript
 * const bus = new EventBus();
 *
 * // Subscribe
 * const unsub = bus.on("chat.delta", ({ delta }) => console.log(delta));
 *
 * // Publish
 * bus.emit("chat.delta", { delta: "Hello, world!" });
 *
 * // Unsubscribe
 * unsub();
 * ```
 */

/** Payload shapes for each shell event type. */
export interface ShellEventMap {
    /** A tool call has started executing. */
    "tool.execution_start": {
        toolCallId: string;
        toolName: string;
    };
    /** A tool call has finished (successfully or with an error). */
    "tool.execution_complete": {
        toolCallId: string;
        success: boolean;
        /** Human-readable result excerpt when success is true. */
        result?: string;
        /** Error message when success is false. */
        error?: string;
    };
    /**
     * An incremental text delta from the assistant.
     * Maps to the session's `assistant.message_delta` event.
     */
    "chat.delta": {
        delta: string;
    };
}

/** All event type strings recognised by the EventBus. */
export type ShellEventType = keyof ShellEventMap;

/** Typed handler for a specific shell event. */
export type ShellEventHandler<T extends ShellEventType> = (payload: ShellEventMap[T]) => void;

/**
 * A simple, synchronous, in-process typed event bus.
 *
 * All handlers are called synchronously on `emit`. Errors thrown by a handler
 * are swallowed so that one bad handler cannot prevent others from receiving
 * the event.
 */
export class EventBus {
    private readonly handlers = new Map<string, Set<(...args: unknown[]) => void>>();

    /**
     * Subscribe to an event.
     *
     * @param event   - The event type to listen for.
     * @param handler - Callback invoked with the event payload.
     * @returns An unsubscribe function; call it to remove this specific handler.
     */
    on<T extends ShellEventType>(event: T, handler: ShellEventHandler<T>): () => void {
        let set = this.handlers.get(event);
        if (!set) {
            set = new Set();
            this.handlers.set(event, set);
        }
        // Cast is safe: handler receives the correctly typed payload at dispatch time.
        const stored = handler as (...args: unknown[]) => void;
        set.add(stored);
        return () => {
            set?.delete(stored);
        };
    }

    /**
     * Emit an event, synchronously calling all registered handlers.
     *
     * Handler errors are caught and silently discarded to prevent cascading
     * failures when a single subscriber throws.
     *
     * @param event   - The event type to emit.
     * @param payload - The event payload.
     */
    emit<T extends ShellEventType>(event: T, payload: ShellEventMap[T]): void {
        const set = this.handlers.get(event);
        if (!set) return;
        for (const handler of set) {
            try {
                handler(payload);
            } catch {
                // Intentionally swallowed — see class docstring.
            }
        }
    }

    /**
     * Remove all handlers for a given event, or all handlers for every event.
     *
     * @param event - When provided, only clears handlers for that event type.
     *                When omitted, clears all handlers on the bus.
     */
    removeAllListeners(event?: ShellEventType): void {
        if (event !== undefined) {
            this.handlers.delete(event);
        } else {
            this.handlers.clear();
        }
    }
}
