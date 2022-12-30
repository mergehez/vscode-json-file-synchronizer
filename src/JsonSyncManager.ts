import * as vscode from 'vscode';
import { ColorThemeKind } from 'vscode';
import ConfigManager from './ConfigManager';
import { getWebviewOptions } from './extension';
import JsonList from './JsonList';
import PageHelper from './PageHelper';
import { getFilesInFolder } from './Utils';

export class JsonSyncManager{
	public static readonly viewType = "ArgJsonSyncronizer";
	protected readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];


    private _configManager : ConfigManager;
    // private _pageHelper : PageHelper;
    private _extensionUri : vscode.Uri;

	private readonly _translations: JsonList = new JsonList();

	// public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
	// 	WebPanelManager.currentPanel = new JsonSyncManager(panel, extensionUri, context);
	// }
	constructor(extensionUri: vscode.Uri, context: vscode.ExtensionContext, panelFromState : vscode.WebviewPanel | undefined = undefined) {
        this._panel = panelFromState ?? vscode.window.createWebviewPanel(
			JsonSyncManager.viewType,
			'JSON File Synchronizer',
			vscode.ViewColumn.One,
			getWebviewOptions(extensionUri)
		);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._listenToCommands();


        this._configManager = new ConfigManager(context, true);
        this._extensionUri = extensionUri;
        // this._pageHelper = new PageHelper(this._panel, extensionUri, context);
		this._refresh();
	}
    
    
	protected _refresh(clearData = false, resetHtml = true) {
		if(clearData){
			this._translations.clear();
		}
		if(resetHtml || this._panel.webview.html.length < 100){
			this._getHtmlForWebview();
		}
	}

	protected _listenToCommands(){
        vscode.window.onDidChangeActiveColorTheme((e) => {
            const dark = e.kind === ColorThemeKind.Dark || e.kind === ColorThemeKind.HighContrast;
            console.log(`onDidChangeActiveColorTheme: ${dark ? 'dark' : 'light'}`, e.kind);
            this._panel.webview.postMessage({ command: 'onDidChangeActiveColorTheme', dark });
        });
        this._panel.webview.onDidReceiveMessage(
            message => {
                console.log("received request from frontent", message);
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'refresh':
                        console.log("refresh called");
                        this._refresh(true, true);
                        
                        return;
                    // case 'goToConfigPage':{
                    //     this._goToConfigPage(true);
                    //     return;
                    // }
                    case 'initConfigPage':{
                        const configs = this._configManager._allConfigs;
                        const workspacePaths = vscode.workspace.workspaceFolders;
                        const workspacePath = workspacePaths ? workspacePaths[0]?.uri.fsPath.toString().replace(/\\/gi, "/") ?? "" : "";
                        this._panel.webview.postMessage({ command: 'message-response', request: message.command, success: true, message: '', data: {configs, workspacePath} });
                        return;
                    }
                    case 'initTranslationPage':{
                        const configs = this._configManager._allConfigs;
                        const map = this._translations.map;
                        const settings = this._configManager.getSettings();
                        this._panel.webview.postMessage({ command: 'message-response', request: message.command, success: true, message: '', data: {map, configs, settings} });
                        return;
                    }
                    case 'updateFile':{
                        const data = JSON.parse(message.data);
                        const index = data.fileIndex as number;
                        this._translations.setMap(data.map, true);
                        this._translations.writeToFile(index);
                        this._panel.webview.postMessage({ command: 'message-response', request: message.command, success: true, message: "Successfully saved!" });
                        return;
                    }
                    case 'changeActiveConfig':{
                        const conf = JSON.parse(message.configJsonStr);
                        this._configManager.updateAllConfigsByJsonObject(conf, this._translations).then(() => {
                            const configs = this._configManager._allConfigs;
                            const map = this._translations.map;
                            const settings = this._configManager.getSettings();
                            const msg = `Successfully switched to project: "${this._configManager.activeConfig?.key}"`;
                            this._panel.webview.postMessage({ command: 'message-response', request: message.command, success: true, message: msg, data: {map, configs, settings} });
                        });
                        return;
                    }
                    case 'updateAllConfigs':{
                        const conf = JSON.parse(message.configJsonStr);
                        this._configManager.updateAllConfigsByJsonObject(conf).then(() => {
                            const msg = message.silent ? '' : 'Successfully saved changes';
                            this._panel.webview.postMessage({ command: 'message-response', request: message.command, success: true, message: msg });
                        });
                        // setConfig(message.key, message.value);
                        // if(message.refresh && message.refresh === true){
                        //     this._refresh(true, true);
                        // }
                        return;
                    }
                    case 'updateSettings':{
                        const settings = JSON.parse(message.settingsJson);
                        this._configManager.updateSettings(settings).then(() => {
                            this._panel.webview.postMessage({ command: 'message-response', request: message.command, success: true, message: "" });
                        });
                        // setConfig(message.key, message.value);
                        // if(message.refresh && message.refresh === true){
                        //     this._refresh(true, true);
                        // }
                        return;
                    }
                    case 'getFilesInFolder':{
                        const exts = message.fileExts;
                        const regexFilter = message.regexFilter;
                        const directory = message.directory;
                        const fileNames = getFilesInFolder(directory, message.recursive, exts, regexFilter);
                        // this._panel.webview.postMessage({ command: 'file-list', list: fileNames ?? "directory not found" });
                        const msg = fileNames ? 'Successfully retrieved files.' : (fileNames === undefined ? "The given directory does not exists. Please check it." : "No JSON file found in the given directory.");
                        this._panel.webview.postMessage({ command: 'message-response', request: message.command, success: !!fileNames, message: msg, data: fileNames });
                        return;
                    }
                }
            },
			null,
			this._disposables
		);
	}

    // private _goToConfigPage(sendFileList = false){
    //     const configArr = this._configManager.syncAllConfigs().getAllConfigAsJson();
    //     const fileNames = sendFileList ? this._configManager.activeConfig?.fileNames ?? "directory not found" : undefined;
        
    //     this._pageHelper.openConfigPage(configArr, fileNames);
    // }

	protected _getHtmlForWebview() {
        // if(!this._configManager.hasConfigs){
        //     this._configManager.updateAllConfigsByJsonObject([{"key": "new1", "active": true}]);
        //     this._goToConfigPage();
        //     return;
        // }

        this._configManager.initTranslations(this._translations);

		// if(this._translations.fileNames.length === 0) {
        //     const dir = this._configManager.activeConfig?.directory ?? "";
        //     const fileNames = this._configManager.activeConfig?.fileNames ?? [];
        //     this._translations.init(dir, fileNames);
		// }

        // this._pageHelper.openTranslationsPage(this._configManager.getAllConfigAsJson(), this._translations, this._configManager.getSettings());

        const styleUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'ArgJsonTable', 'arg-json-table.css'));
        const scriptUri = this._panel.webview.asWebviewUri( vscode.Uri.joinPath(this._extensionUri, "ArgJsonTable", "arg-json-table.js") );
        
        const nonce = this.getNonce();  
        const baseUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath( this._extensionUri, 'ArgJsonTable') ).toString().replace('%22', '');
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link href="${styleUri}" rel="stylesheet">
                <style>
                    .ic-delete:before {
                        background-image: url("${baseUri}/delete.svg");
                    }
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
        let text = "";
        const possible =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }
	// protected _getHtmlForWebview2() {
    //     if(!this._configManager.hasConfigs){
    //         this._configManager.updateAllConfigsByJsonObject([{"key": "new1", "active": true}]);
    //         this._goToConfigPage();
    //         return;
    //     }

	// 	if(this._translations.fileNames.length === 0) {
    //         const dir = this._configManager.activeConfig?.directory ?? "";
    //         const fileNames = this._configManager.activeConfig?.fileNames ?? [];
    //         this._translations.init(dir, fileNames);
	// 	}

    //     this._pageHelper.openTranslationsPage(this._configManager.getAllConfigAsJson(), this._translations, this._configManager.getSettings());
	// }

    
	public dispose() {
		// WebPanelManager.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}

