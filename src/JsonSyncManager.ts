import * as vscode from 'vscode';
import ConfigManager from './Config';
import { getWebviewOptions } from './extension';
import JsonList from './JsonList';
import { getFilesInFolder, openFileFromMedia } from './Utils';

export class JsonSyncManager {
	public static currentPanel: JsonSyncManager | undefined;

	public static readonly viewType = "ArgJsonSyncronizer";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _context: vscode.ExtensionContext;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
    private _configManager : ConfigManager = new ConfigManager();

	private readonly _translations: JsonList = new JsonList();

	public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        
		// const column = vscode.window.activeTextEditor
		// 	? vscode.window.activeTextEditor.viewColumn
		// 	: undefined;
            
		// if (column && JsonSyncManager.currentPanel) {
		// 	JsonSyncManager.currentPanel._panel.reveal(column);
		// 	return;
		// }

		// const panel = vscode.window.createWebviewPanel(
		// 	JsonSyncManager.viewType,
		// 	'JSON File Synchronizer',
		// 	column || vscode.ViewColumn.One,
		// 	getWebviewOptions(extensionUri)
		// );
		const panel = vscode.window.createWebviewPanel(
			JsonSyncManager.viewType,
			'JSON File Synchronizer',
			vscode.ViewColumn.One,
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
                        console.log("refresh called");
						this._refresh(true, true);
						
						return;
					case 'goToConfigPage':{
                        this._goToConfigPage(true);
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
                        const conf = JSON.parse(message.configJsonStr);
                        this._configManager.update(conf);
						// setConfig(message.key, message.value);
						if(message.refresh && message.refresh === 1){
							this._refresh(true, true);
						}
						return;
					}
					case 'getFilesInFolder':{
                        const exts = message.fileExts;
                        const regexFilter = message.regexFilter;
						const filePaths = getFilesInFolder(message.folderPath, message.recursive, exts, regexFilter);
						this._panel.webview.postMessage({ command: 'file-list', list: filePaths ?? "directory not found" });
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

    private _goToConfigPage(sendFileList = false){
		const htmlContent = openFileFromMedia(this._context.extensionPath, "config.html");
        this._configManager.reinit();
        const configArr = this._configManager.createJsonStr();

        const alpineScriptUri = vscode.Uri.joinPath(this._extensionUri, 'media', 'alpine.js').with({ 'scheme': 'vscode-resource' });
        const vscodeCssUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        this._panel.webview.html = htmlContent
            .replace("[vscodeCssUri]", vscodeCssUri.toString())
            .replace("[alpineScriptUri]", alpineScriptUri.toString())
            .replace("[cspSource]", this._panel.webview.cspSource)
            .replace("[CONFIG_ARR]", configArr);
        
        if(sendFileList){
            const filesPaths = this._configManager.activeConfig?.filePaths ?? undefined;
            this._panel.webview.postMessage({ command: 'file-list', list: filesPaths ?? "directory not found" });
        }
    }

	private _getHtmlForWebview(webview: vscode.Webview) {
        if(!this._configManager.hasConfigs){
            this._configManager.update([{"key": "new1", "active": true}]);
            this._goToConfigPage();
            return;
        }
		const filesPaths = this._configManager.activeConfig?.filePaths ?? [];
		if(this._translations.filePathsNoRoot.length === 0) {
			const workspacePaths = vscode.workspace.workspaceFolders;
			if (workspacePaths) {
				this._translations.init(workspacePaths[0].uri.fsPath, filesPaths);
			}
		}

        const alpineScriptUri = vscode.Uri.joinPath(this._extensionUri, 'media', 'alpine.js').with({ 'scheme': 'vscode-resource' });
        const vscodeCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        
		const htmlContent = openFileFromMedia(this._context.extensionPath, "index.html");
        this._panel.webview.html = 
            '<div style="display: flex;justify-items:center;align-items:center; width:100vw;height:100vh;">'+
                '<span style="flex-grow:1;text-align:center;font-size:3.5em;">loading...</span>'+
            '</div>';
        setTimeout(() => {
            this._panel.webview.html = htmlContent
            .replace("[vscodeCssUri]", vscodeCssUri.toString())
            .replace("[alpineScriptUri]", alpineScriptUri.toString())
            .replace("[cspSource]", webview.cspSource)
            .replace("[MAP]", JSON.stringify(this._translations.map))
            .replace("[FILE_PATHS]", JSON.stringify(this._translations.filePathsNoRoot))
            .replace("[CONFIG_ARR]", this._configManager.createJsonStr());
        }, 350);
	}
}

