/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/**
 * Copilot SDK - TypeScript/Node.js Client
 *
 * JSON-RPC based SDK for programmatic control of GitHub Copilot CLI
 */

export { CopilotClient } from "./client.js";
export { CopilotSession, type AssistantMessageEvent } from "./session.js";
export { defineTool } from "./types.js";
export {
    computeLineDiff,
    formatDiffForPrompt,
    type DiffHunk,
    type LineDiffResult,
} from "./core/diff-engine.js";
export {
    FileWatcher,
    type FileChangeEvent,
    type FileWatcherOptions,
    type PatchTelemetry,
} from "./core/file-watcher.js";
export type {
    ConnectionState,
    CopilotClientOptions,
    CustomAgentConfig,
    GetAuthStatusResponse,
    GetStatusResponse,
    InfiniteSessionConfig,
    MCPLocalServerConfig,
    MCPRemoteServerConfig,
    MCPServerConfig,
    MessageOptions,
    ModelBilling,
    ModelCapabilities,
    ModelInfo,
    ModelPolicy,
    PermissionHandler,
    PermissionRequest,
    PermissionRequestResult,
    ResumeSessionConfig,
    SessionConfig,
    SessionEvent,
    SessionEventHandler,
    SessionEventPayload,
    SessionEventType,
    SessionMetadata,
    SystemMessageAppendConfig,
    SystemMessageConfig,
    SystemMessageReplaceConfig,
    Tool,
    ToolHandler,
    ToolInvocation,
    ToolResultObject,
    TypedSessionEventHandler,
    ZodSchema,
} from "./types.js";
