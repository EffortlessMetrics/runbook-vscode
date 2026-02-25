import * as vscode from 'vscode';

export async function openUri(uriString?: string) {
  if (!uriString) return;
  try {
    const uri = vscode.Uri.parse(uriString);
    await vscode.env.openExternal(uri);
  } catch (e) {
    vscode.window.showErrorMessage(`Runbook: Failed to open URI: ${uriString}`);
  }
}

export async function revealReceipt(filePath?: string) {
  if (!filePath) return;
  try {
    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  } catch (e) {
    vscode.window.showErrorMessage(`Runbook: Failed to open receipt: ${filePath}`);
  }
}
