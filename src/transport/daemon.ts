import * as vscode from 'vscode';
import WebSocket from 'ws';
import { ClientHello, DaemonMessage } from '../protocol';
import { EventEmitter } from 'events';

export class DaemonClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private status: vscode.StatusBarItem;
  private url: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private backoffMs = 1000;
  private readonly maxBackoffMs = 30000;

  constructor(private readonly ctx: vscode.ExtensionContext) {
    super();
    this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    this.status.text = 'Runbook: disconnected';
    this.status.show();

    // Load from config or use default
    const config = vscode.workspace.getConfiguration('runbook');
    this.url = config.get<string>('daemonUrl') || 'ws://127.0.0.1:29381/ws';
  }

  public connect() {
    if (this.ws) {
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.status.text = '$(sync~spin) Runbook: connecting…';

    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.on('open', () => {
      this.status.text = '$(sync~spin) Runbook: handshaking…';

      const hello: ClientHello = {
        protocol: 1,
        type: 'hello',
        role: 'vscode',
        version: this.ctx.extension.packageJSON.version,
        capabilities: {
          start_session: true
        }
      };
      this.send(hello);
    });

    ws.on('message', async (data) => {
      const text = data.toString();
      let msg: DaemonMessage;
      try {
        msg = JSON.parse(text) as DaemonMessage;
      } catch {
        return;
      }

      if (msg.type === 'hello_ack') {
        this.status.text = '$(plug) Runbook: connected';
        this.backoffMs = 1000; // reset backoff
        this.emit('connected');
        return;
      }

      this.emit('message', msg);
    });

    ws.on('close', () => {
      this.handleDisconnect('disconnected');
    });

    ws.on('error', (err) => {
      this.handleDisconnect('error');
      console.error('Runbook websocket error', err);
    });
  }

  public send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status.text = '$(circle-slash) Runbook: disconnected';
    this.emit('disconnected');
  }

  private handleDisconnect(stateText: string) {
    this.ws = null;
    this.status.text = `$(warning) Runbook: ${stateText}`;
    this.emit('disconnected');

    // Reconnect with exponential backoff
    this.schemaReconnect();
  }

  private schemaReconnect() {
    if (this.reconnectTimer) {
      return;
    }
    this.status.text = `$(sync) Runbook: reconnecting in ${this.backoffMs / 1000}s`;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.backoffMs = Math.min(this.backoffMs * 1.5, this.maxBackoffMs);
      this.connect();
    }, this.backoffMs);
  }

  public dispose() {
    this.disconnect();
    this.status.dispose();
  }
}
