export interface ClientHello {
  protocol: number;
  type: "hello";
  role: "vscode";
  version?: string;
}

export interface VscodeCommand {
  protocol: number;
  type: "vscode_command";
  cmd:
    | "send_text"
    | "send_sequence"
    | "focus_terminal"
    | "cycle_terminal"
    | "open_uri"
    | "reveal_receipt";
  payload?: any;
}

export interface RenderMessage {
  protocol: number;
  type: "render";
  [key: string]: any;
}

// Telemetry from VS Code back to daemon
export interface VscodeTelemetry {
  protocol: number;
  type: "context_update";
  workspace_path?: string;
  git_branch?: string;
  active_terminal_index?: number;
  terminals_count?: number;
}

export type DaemonMessage =
  | VscodeCommand
  | RenderMessage
  | { type: string; [key: string]: any };
