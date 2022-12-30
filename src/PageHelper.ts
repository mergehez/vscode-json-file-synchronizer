import * as vscode from 'vscode';
import JsonList from './JsonList';
import { Settings } from './Types';
import { openFileFromMedia } from './Utils';


export default class PageHelper{
	private readonly _panel: vscode.WebviewPanel;
	private readonly _context: vscode.ExtensionContext;
	private readonly _extensionUri: vscode.Uri;

    constructor(_panel: vscode.WebviewPanel, _extensionUri: vscode.Uri, _context: vscode.ExtensionContext){
        this._panel = _panel;
        this._extensionUri = _extensionUri;
        this._context = _context;
    }

    public openConfigPage(configArrAsJson: string, filePathsToBeSent : any | undefined){
        const workspacePaths = vscode.workspace.workspaceFolders;
        const workspacePath = workspacePaths ? workspacePaths[0]?.uri.fsPath.toString().replace(/\\/gi, "/") ?? "" : "";
        
        const alpineScriptUri = vscode.Uri.joinPath(this._extensionUri, 'media', 'alpine.js').with({ 'scheme': 'vscode-resource' });
        const vscodeCssUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const htmlContent = openFileFromMedia(this._context.extensionPath, "config.html")
                                .replace("[vscodeCssUri]", vscodeCssUri.toString())
                                .replace("[alpineScriptUri]", alpineScriptUri.toString())
                                .replace("[cspSource]", this._panel.webview.cspSource + " https://cdn.jsdelivr.net")
                                .replace("[WORKSPACE_PATH]", workspacePath)
                                .replace("[CONFIG_ARR]", configArrAsJson);

        this._panel.webview.html = htmlContent;
        
        if(filePathsToBeSent){
            this._panel.webview.postMessage({ command: 'file-list', list: filePathsToBeSent});
        }
    }

    public openTranslationsPage(configArrAsJson: string, _translations : JsonList, _settings: Settings){        
        this.displayLoading();
        
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
                <title>Arg Json Synchronizer</title>
            </head>
            <body>
                <input hidden data-uri="${baseUri}">
                <div id="app"></div>  
                <script type="module" crossorigin src="${scriptUri}" nonce="${nonce}"></script>
            </body>
            </html> 
        `;  
        // const htmlContent = openFileFromMedia(this._context.extensionPath, "index.html")
        //                         .replace("[vscodeCssUri]", vscodeCssUri.toString())
        //                         .replace("[alpineScriptUri]", alpineScriptUri.toString())
        //                         .replace("[cspSource]", this._panel.webview.cspSource + " https://cdn.jsdelivr.net")
        //                         .replace("[MAP]", JSON.stringify(_translations.map))
        //                         .replace("[FILE_PATHS]", JSON.stringify(_translations.filePathsNoRoot))
        //                         .replace("[SETTINGS]", JSON.stringify(_settings))
        //                         .replace("[CONFIG_ARR]", configArrAsJson);

        setTimeout(() => {
            this._panel.webview.html = htmlContent;
        }, 350);
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

    public openTranslationsPage2(configArrAsJson: string, _translations : JsonList, _settings: Settings){        
        this.displayLoading();
        
        const alpineScriptUri = vscode.Uri.joinPath(this._extensionUri, 'media', 'alpine.js').with({ 'scheme': 'vscode-resource' });
        const vscodeCssUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        
        const htmlContent = openFileFromMedia(this._context.extensionPath, "index.html")
                                .replace("[vscodeCssUri]", vscodeCssUri.toString())
                                .replace("[alpineScriptUri]", alpineScriptUri.toString())
                                .replace("[cspSource]", this._panel.webview.cspSource + " https://cdn.jsdelivr.net")
                                .replace("[MAP]", JSON.stringify(_translations.map))
                                .replace("[FILE_PATHS]", JSON.stringify(_translations.fileNames))
                                .replace("[SETTINGS]", JSON.stringify(_settings))
                                .replace("[CONFIG_ARR]", configArrAsJson);

        setTimeout(() => {
            this._panel.webview.html = htmlContent;
        }, 350);
    }

    private displayLoading(){
        this._panel.webview.html = 
            '<div style="display: flex;justify-items:center;align-items:center; width:100vw;height:100vh;">'+
                '<span style="flex-grow:1;text-align:center;font-size:3.5em;">loading...</span>'+
            '</div>';
    }
}