import { ClientHello, DaemonMessage, PROTOCOL_VERSION } from '../protocol';

export function buildClientHello(extensionVersion?: string): ClientHello {
  return {
    protocol: PROTOCOL_VERSION,
    type: 'hello',
    role: 'vscode',
    version: extensionVersion,
    capabilities: {
      start_session: true
    }
  };
}

export function parseDaemonMessage(raw: string): DaemonMessage | null {
  try {
    return JSON.parse(raw) as DaemonMessage;
  } catch {
    return null;
  }
}
