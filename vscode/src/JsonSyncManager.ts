import * as vscode from 'vscode';
import { ColorThemeKind } from 'vscode';
import ConfigManager from './ConfigManager';
import { getWebviewOptions } from './extension';
import { listenToRequestsFromVue, sendResponseToVue } from "./Bridge";
import { GlobalStateHelper } from "./GlobalStateHelper";
import { getFilesInFolder } from "./io";

export class JsonSyncManager {
    public static readonly viewType = "ArgJsonSyncronizer";
    public readonly _panel: vscode.WebviewPanel;
    public _disposables: vscode.Disposable[] = [];

    private readonly _globalStateHelper: GlobalStateHelper;
    private readonly _extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri, context: vscode.ExtensionContext, panelFromState: vscode.WebviewPanel | undefined = undefined) {
        this._panel = panelFromState ?? vscode.window.createWebviewPanel(
            JsonSyncManager.viewType,
            'JSON File Synchronizer',
            vscode.ViewColumn.One,
            getWebviewOptions(extensionUri)
        );
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._listenToCommands();

        this._globalStateHelper = new GlobalStateHelper(context);
        this._extensionUri = extensionUri;
        this._getHtmlForWebview();
    }

    protected _listenToCommands() {
        vscode.window.onDidChangeActiveColorTheme((e) => {
            const dark = e.kind === ColorThemeKind.Dark || e.kind === ColorThemeKind.HighContrast;
            console.log(`onDidChangeActiveColorTheme: ${dark ? 'dark' : 'light'}`, e.kind);
            sendResponseToVue(this, { request: 'onDidChangeActiveColorTheme', data: dark });
        });

        listenToRequestsFromVue(this, ({ request, data: dataFromVue }) => {
            if (request === 'alert') {
                vscode.window.showErrorMessage(dataFromVue);
            } else if (request === 'getConfigsAndSettings') {
                const workspacePaths = vscode.workspace.workspaceFolders;
                const workspacePath = workspacePaths ? workspacePaths[0]?.uri.fsPath.toString().replace(/\\/gi, "/") ?? "" : "";
                sendResponseToVue(this, {
                    request, data: {
                        configs: this._globalStateHelper.getConfigs(),
                        settings: this._globalStateHelper.getSettings(),
                        workspacePath
                    }
                });
            } else if (request === 'getTranslations') {
                const data = ConfigManager.getTranslations(dataFromVue, this._globalStateHelper);
                sendResponseToVue(this, { request, data });
            } else if (request === 'updateFile') {
                ConfigManager.updateJsonFiles(dataFromVue.config, dataFromVue.map, dataFromVue.fileIndex);
                sendResponseToVue(this, { request });
                return;
            } else if (request === 'updateConfig') {
                this._globalStateHelper.updateConfig(dataFromVue)
                    .then(() => sendResponseToVue(this, { request }));
            } else if (request === 'deleteConfig') {
                this._globalStateHelper.deleteConfig(dataFromVue)
                    .then(() => sendResponseToVue(this, { request }));
            } else if (request === 'updateSettings') {
                this._globalStateHelper.updateSettings(dataFromVue)
                    .then(() => sendResponseToVue(this, { request, data: this._globalStateHelper.getSettings() }));
            } else if (request === 'getFilesInFolder') {
                getFilesInFolder(dataFromVue.directory, dataFromVue.recursive, dataFromVue.fileExts, dataFromVue.regexFilter)
                    .then(data => {
                        if (typeof data !== 'string' && data.length === 0) { 
                            data = "No JSON file found in the given directory."; 
                        }
                        const msg = typeof data !== 'string' ? ('Successfully retrieved files.') : data;
                        sendResponseToVue(this, { request, data: typeof data !== 'string' ? data : [] }, typeof data !== 'string', msg);
                    });
                return;
            } else {
                console.log(`request '${request}' is not supported!`);
            }
        });
    }

    protected _getHtmlForWebview() {
        const styleUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'ArgJsonTable', 'arg-json-table.css'));
        const scriptUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "ArgJsonTable", "arg-json-table.js"));

        const nonce = this.getNonce();
        const baseUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'ArgJsonTable')).toString().replace('%22', '');
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link href="${styleUri}" rel="stylesheet">
                <style>
                    .ic.ic-delete:before{ --ic-url: url("delete.svg"); }
                    .ic.ic-edit:before{ --ic-url: url("edit.svg"); }
                    .ic.ic-expand:before{ --ic-url: url("expand.svg"); }
                </style>
                <title>Arg Json Synchronizer</title>
            </head>
            <body>
                <input hidden data-uri="${baseUri}">
                <div id="app"></div>  
                <script type="module" crossorigin src="${scriptUri}" nonce="${nonce}"></script>
            </body>
            </html> 
        `;
        setTimeout(() => {
            this._panel.webview.html = htmlContent;
        }, 100);
    }
    private getNonce() {
        const possible:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    public dispose() {
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

