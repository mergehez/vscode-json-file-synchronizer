import {reactive, ref} from "vue";
import {CommandFromVue, RequestType, ResponseType} from "@vscode/Bridge";
import {defaultSettings, Settings} from "@vscode/Types";

const vscode: typeof window.vscode = window.vscode ?? Function(` return typeof acquireVsCodeApi == 'function' ? acquireVsCodeApi() : undefined; `)();
console.log("helpers.ts vscode", vscode);
export const state = reactive({
    fileCount: 0,
    fake: false,
})

export const loader = reactive({active: false, target: ''});

export function postMessageToVsCode(message: CommandFromVue, loaderTarget?: string) {
    if (!loaderTarget) {
        vscode?.postMessage(JSON.stringify(message))
        return;
    }

    loader.active = true;
    loader.target = loaderTarget;
    setTimeout(() => {
        vscode?.postMessage(JSON.stringify(message))
    }, 500);
}

export const message = ref({type: 'success', text: '', class: ''});

export const settings = ref<Settings>(defaultSettings);
export const currentWorkspacePath = ref('');

function setMessage(text: string, type = 'danger') {
    message.value = {type, text, class: `px-2 text-lg alert alert-${type}`};
    if (text.length > 0) {
        // setTimeout(() => {
        //     message.value = { type: 'success', text: '', class: '' };
        // }, duration);
    }
}

export function updateCurrentTheme() {
    console.log("updating current theme...");
    if (document.body.classList.contains('vscode-dark')) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}


const subscriptions: Record<string, (data: ResponseType) => void> = {};

export function listenToVsCode() {
    updateCurrentTheme();
    window.addEventListener('message', (event: any) => {
        try {
            const responseStr = event.data ?? event.detail;
            if (typeof responseStr !== 'string') {
                return;
            }
            const response = JSON.parse(responseStr) as ResponseType;
            console.log("MESSAGE FROM BACKGROUND", response ?? event);
            if (!response || (event.isTrusted && !event.origin.startsWith('vscode'))) {
                console.log("not valid event", event);
                return;
            }
            if (response.request === 'onDidChangeActiveColorTheme') {
                updateCurrentTheme();
            } else if (response.request === 'updateSettings') {
                settings.value = response.data;
            } else {
                loader.active = false;
                loader.target = '';
                setMessage(response.message, response.success ? 'success' : 'danger');
                // const sub = subscriptions.find(t => t.request === response.request);
                subscriptions[response.request]?.(response);
                // onResponse(response);
            }
        } catch (e) {
            console.error("Error in listenToVsCode", e);
        }
    });
}

export function subscribeToVsCodeResponse(request: RequestType, onResponse: (message: ResponseType) => void) {
    subscriptions[request] = onResponse
    // subscriptions.push({
    //     request,
    //     onResponse
    // })
}

export function uniqueId(len = 10) {
    const arr = new Uint8Array(len / 2);
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec => dec.toString(16).padStart(2, "0")).join('')
}