// ---------------------------------------------------------------------------
// Protocol v1 — snake_case, versioned, forward-compatible
// ---------------------------------------------------------------------------

export const PROTOCOL_VERSION = 1;

// --- Extension → Daemon ---

export interface ClientHello {
  protocol: number;
  type: 'hello';
  role: 'vscode';
  version?: string;
}

export interface ContextUpdate {
  protocol: number;
  type: 'context_update';
  workspace_path?: string;
  git_branch?: string;
  active_terminal_index?: number;
  terminals_count?: number;
}

// --- Daemon → Extension ---

export interface VscodeCommand {
  protocol: number;
  type: 'vscode_command';
  cmd:
    | 'send_text'        // payload: { text, execute }
    | 'send_sequence'    // payload: { sequence: 'Enter' | 'Esc' | 'Ctrl+C' }
    | 'focus_terminal'   // payload: { index }
    | 'cycle_terminal'   // payload: { direction: 1 | -1 }
    | 'open_uri'         // payload: { uri }
    | 'reveal_receipt';  // payload: { path }
  payload?: any;
}

/**
 * RenderMessage is the daemon's authoritative UI state.
 * The extension mirrors `pending_prompt` from this to decide
 * Enter/Esc behavior.
 */
export interface RenderMessage {
  protocol: number;
  type: 'render';
  /** If set, a prompt is loaded (the "round in the chamber"). */
  pending_prompt?: PendingPrompt | null;
  /** Hook-confirmed agent state. Only trust this if hooks are connected. */
  agent_state?: AgentState;
  [key: string]: any;
}

export interface PendingPrompt {
  prompt_id: string;
  label: string;
  /** The text that will be injected into the terminal on Enter. */
  text: string;
}

/**
 * Agent lifecycle state — only populated when hooks are connected.
 * 'unknown' when degraded (no hooks).
 */
export type AgentState =
  | 'unknown'
  | 'idle'
  | 'running'
  | 'waiting'
  | 'complete'
  | 'settled'
  | 'ended'
  | 'blocked';

export type DaemonMessage =
  | VscodeCommand
  | RenderMessage
  | { type: string; [key: string]: any };
