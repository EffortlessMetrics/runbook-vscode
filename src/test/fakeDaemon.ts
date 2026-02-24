import { WebSocketServer, WebSocket } from 'ws';

/**
 * A simple fake daemon script to test the VS Code extension manually.
 * It broadcasts RenderModel updates and requests dispatch on press.
 */

const port = 29381;
const wss = new WebSocketServer({ port });

console.log(`Fake daemon listening on ws://127.0.0.1:${port}/ws`);

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (data: any) => {
    let msg: any;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    
    console.log('Received from extension:', msg);

    if (msg.type === 'hello') {
      console.log('Got hello from extension, dispatching test render state.');
      // Send a fake render state
      ws.send(JSON.stringify({
        protocol: 1,
        type: 'render',
        agent_state: 'idle',
        armed: null,
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Example: Periodically simulate VS Code commands from daemon
  const interval = setInterval(() => {
    console.log('Simulating daemon text dispatch to VS Code...');
    ws.send(JSON.stringify({
      protocol: 1,
      type: 'vscode_command',
      cmd: 'send_text',
      payload: {
        text: 'echo "Hello from Fake Daemon"',
        execute: true
      }
    }));
  }, 10000);

  ws.on('close', () => clearInterval(interval));
});
