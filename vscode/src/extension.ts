// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { JsonSyncManager } from './JsonSyncManager';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('arg-json-file-synchronizer.start', () => {
            console.log("arg-json-file-synchronizer.start")
            new JsonSyncManager(context.extensionUri, context);
        })
    );
    
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(JsonSyncManager.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
                webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                new JsonSyncManager(context.extensionUri, context, webviewPanel);
            }
        });
    }
}

export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewPanelOptions & vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,
		
		retainContextWhenHidden: true,
		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [
            vscode.Uri.joinPath(extensionUri, 'media'), 
            vscode.Uri.joinPath(extensionUri, 'ArgJsonTable'),
        ]
	};
}

// This method is called when your extension is deactivated
export function deactivate() { }
