import * as vscode from 'vscode';
import { exec } from 'child_process';
import { DaemonClient } from '../transport/daemon';

export class ContextCollector {
  private gitBranch: string = '';
  private workspacePath: string = '';

  constructor(private readonly client: DaemonClient) {
    this.updateContext();
    
    // Re-check periodically or on workspace changes
    vscode.workspace.onDidChangeWorkspaceFolders(() => this.updateContext());
    
    // Could also watch .git/HEAD for branch changes, but a simple interval or event-based is easier
    setInterval(() => this.updateContext(), 10000);
  }

  private async updateContext() {
    let changed = false;

    const folders = vscode.workspace.workspaceFolders;
    const newWsPath = folders && folders.length > 0 ? folders[0].uri.fsPath : '';
    
    if (newWsPath !== this.workspacePath) {
      this.workspacePath = newWsPath;
      changed = true;
    }

    if (this.workspacePath) {
      exec('git rev-parse --abbrev-ref HEAD', { cwd: this.workspacePath }, (error, stdout) => {
        const branch = error ? '' : stdout.trim();
        if (branch !== this.gitBranch) {
          this.gitBranch = branch;
          changed = true;
        }

        if (changed) {
          this.reportTelemetry();
        }
      });
    } else {
      if (changed) this.reportTelemetry();
    }
  }

  public reportTelemetry() {
    this.client.send({
      protocol: 1,
      type: 'vscode_telemetry',
      workspace_path: this.workspacePath,
      git_branch: this.gitBranch
    });
  }
}
