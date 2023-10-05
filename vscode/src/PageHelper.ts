import * as vscode from 'vscode';
import JsonList from './JsonList';
import { Settings } from './Types';
// import { openFileFromMedia } from './io';


export default class PageHelper{
	private readonly _panel: vscode.WebviewPanel;
	private readonly _context: vscode.ExtensionContext;
	private readonly _extensionUri: vscode.Uri;

    constructor(_panel: vscode.WebviewPanel, _extensionUri: vscode.Uri, _context: vscode.ExtensionContext){
        this._panel = _panel;
        this._extensionUri = _extensionUri;
        this._context = _context;
    }

    // public openConfigPage(configArrAsJson: string, filePathsToBeSent : any | undefined){
    //     const workspacePaths = vscode.workspace.workspaceFolders;
    //     const workspacePath = workspacePaths ? workspacePaths[0]?.uri.fsPath.toString().replace(/\\/gi, "/") ?? "" : "";
    //
    //     const alpineScriptUri = vscode.Uri.joinPath(this._extensionUri, 'media', 'alpine.js').with({ 'scheme': 'vscode-resource' });
    //     const vscodeCssUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
    //     const htmlContent = openFileFromMedia(this._context.extensionPath, "config.html")
    //                             .replace("[vscodeCssUri]", vscodeCssUri.toString())
    //                             .replace("[alpineScriptUri]", alpineScriptUri.toString())
    //                             .replace("[cspSource]", this._panel.webview.cspSource + " https://cdn.jsdelivr.net")
    //                             .replace("[WORKSPACE_PATH]", workspacePath)
    //                             .replace("[CONFIG_ARR]", configArrAsJson);
    //
    //     this._panel.webview.html = htmlContent;
    //
    //     if(filePathsToBeSent){
    //         this._panel.webview.postMessage({ command: 'file-list', list: filePathsToBeSent});
    //     }
    // }
}