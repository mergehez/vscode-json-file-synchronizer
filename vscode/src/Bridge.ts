import {JsonSyncManager} from "./JsonSyncManager";
import {Config, JsonRow, Settings} from "./Types";

export type CommandFromVue = {
    request: 'updateFile',
    data: {config: Config, fileIndex: number, map: JsonRow[]}
} | {
    request: 'openFile',
    data: {config: Config, fileIndex: number}
} | {
    request: 'updateSettings',
    data: Settings
} | {
    request: 'getTranslations' | 'updateConfig' | 'getFilesInFolder' | 'deleteConfig',
    data: Config
} | {
    request: 'alert',
    data: string
} | {
    request: 'getConfigsAndSettings'
    data?: any
};

type CommandFromVsCode = {
    request: 'getConfigsAndSettings',
    data: { configs: Config[], settings: Settings, workspacePath: string }
} | {
    request: 'getTranslations',
    data: JsonRow[]
} | {
    request: 'getFilesInFolder',
    data: string[]
} | {
    request: 'updateSettings',
    data: Settings
} | {
    request: 'alert' | 'updateFile' | 'updateConfig' | 'deleteConfig' | 'onDidChangeActiveColorTheme'
    data?: any
};

export type RequestType = CommandFromVue["request"];
export type ResponseType = CommandFromVsCode & { success: boolean, message: string}


export function listenToRequestsFromVue(page: JsonSyncManager, handle: (message: CommandFromVue) => void){
    page._panel.webview.onDidReceiveMessage((messageStr: string) => {
        const message = JSON.parse(messageStr) as CommandFromVue;
        console.log("REQUEST FROM VUE", message);
        handle(message);
    }, null, page._disposables)
}

export function sendResponseToVue(page: JsonSyncManager, payload: CommandFromVsCode, success: boolean = true, message: string = ''){
    page._panel.webview.postMessage(JSON.stringify({ request: payload.request, data: payload.data, success, message } as ResponseType));
}