import * as vscode from 'vscode';
import { getWebviewOptions } from './extension';
import JsonList from './JsonList';
import { getFilesInFolder, getConfig, setConfig, openFileInSrc } from './Utils';

export class JsonSyncManager {
	public static currentPanel: JsonSyncManager | undefined;

	public static readonly viewType = "ArgJsonSyncronizer";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _context: vscode.ExtensionContext;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	private readonly _translations: JsonList = new JsonList();

	public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
            
		if (JsonSyncManager.currentPanel) {
			JsonSyncManager.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			JsonSyncManager.viewType,
			'JSON File Synchronizer',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri)
		);

		JsonSyncManager.currentPanel = new JsonSyncManager(panel, extensionUri, context);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
		JsonSyncManager.currentPanel = new JsonSyncManager(panel, extensionUri, context);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._context = context;

		this._refresh();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._listenToCommands();
	}

	public dispose() {
		JsonSyncManager.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _listenToCommands(){
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
					case 'refresh':
						this._refresh(true, true);
						
						return;
					case 'goToConfigPage':{
						const filesPaths = getConfig("files", undefined);
						this._panel.webview.html = openFileInSrc(this._context.extensionPath, "config.html");
						this._panel.webview.postMessage({ command: 'file-list', list: filesPaths ?? "directory not found" });
						return;
					}
					case 'updateFile':{
						const data = JSON.parse(message.data);
						const index = data.fileIndex as number;
						this._translations.setMap(data.map, true);
						this._translations.writeToFile(index);
						return;
					}
					case 'setConfig':{
						setConfig(message.key, message.value);
						if(message.refresh && message.refresh === 1){
							this._refresh(true, true);
						}
						return;
					}
					case 'getFilesInFolder':{
						const fileNames = getFilesInFolder(message.folderPath, message.recursive);
						this._panel.webview.postMessage({ command: 'file-list', list: fileNames ?? "directory not found" });
						return;
					}
				}
			},
			null,
			this._disposables
		);
	}
	private _refresh(clearData = false, resetHtml = true) {
		if(clearData){
			this._translations.clear();
		}
		if(resetHtml || this._panel.webview.html.length < 100){
			this._getHtmlForWebview(this._panel.webview);
		}
		
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		let htmlFileName = "index.html";
		const filesPaths = getConfig("files", undefined);
		if(!filesPaths){
			htmlFileName = "config.html";
		}else if(this._translations.filePaths.length === 0) {
			const workspacePaths = vscode.workspace.workspaceFolders;
			if (workspacePaths) {
				this._translations.init(workspacePaths[0].uri.fsPath, filesPaths);
			}
		}

		const htmlContent = openFileInSrc(this._context.extensionPath, htmlFileName);

		if(!filesPaths){
			this._panel.webview.html = htmlContent;
		}else{
			const alpineScriptUri = vscode.Uri.joinPath(this._extensionUri, 'src', 'alpine.js').with({ 'scheme': 'vscode-resource' });
			const vscodeCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'vscode.css'));
	
			this._panel.webview.html = htmlContent
				.replace("[vscodeCssUri]", vscodeCssUri.toString())
				.replace("[alpineScriptUri]", alpineScriptUri.toString())
				.replace("[cspSource]", webview.cspSource)
				.replace("[MAP]", JSON.stringify(this._translations.map))
				.replace("[FILES]", JSON.stringify(this._translations.fileNames))
				.replace("[SAVEONCHANGE]", getConfig("saveOnChange", false) ? "true" : "false");
				
			// this._panel.webview.postMessage({ command: 'json', json: this._translations });
		}
	}
}

