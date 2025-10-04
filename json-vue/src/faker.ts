import {JsonRow} from "@vscode/Types.ts";
import {uniqueId} from "./helpers.ts";

const getConfigsAndSettings = {
    "settings": {
        "baseTextSize": "1"
    },
    "workspacePath": "/Users/mazlum/Downloads/Workspace/node/VSCodeExt/arg-json-test",
    "configs": [
        {
            "key": "New-1671314481691",
            "title": "arg-json-test",
            "active": true,
            "fileExts": "json",
            "directory": "c:/Workspace/node/VSCodeExt/arg-json-test/lang",
            "typeOutPath": "c:/Workspace/node/VSCodeExt/arg-json-test/types/tr_keys.ts",
            "regexFilter": "",
            "recursive": false,
            "fileNames": [
                "en.json",
                "kmr.json",
                "zza.json",
                "tr.json"
            ],
            "tableFilterEmpty": false,
            "tableSaveOnChange": false,
            "baseTextSize": "1"
        },
        {
            "key": "qusol",
            "title": "qusol",
            "active": false,
            "fileExts": "json",
            "directory": "lang",
            "regexFilter": "",
            "recursive": false,
            "fileNames": [],
            "tableFilterEmpty": false,
            "tableSaveOnChange": false,
            "baseTextSize": "1"
        },
    ]
}


const trigger = (key: string, data: any) => {
    try {
        setTimeout(() => {
            const event = new CustomEvent('message', {
                detail: JSON.stringify({
                    "request": key,
                    "success": true,
                    "message": "",
                    "data": data
                }),
            });

            // Dispatch the event.
            window.dispatchEvent(event);
        }, 100);
    } catch (e) {
        console.error("error in triggerFakeEvent", e);
    }
};

export function triggerFakeEvent() {
    trigger('getConfigsAndSettings', getConfigsAndSettings);

    const langs = ['en', 'kmr', 'zza', 'tr'];
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const fake = [] as JsonRow[];

    for (const l of alphabet) {
        for (let i = 0; i < 3; i++) {
            const key = l + ' ' + (i + 1);
            const r: JsonRow = {
                id: uniqueId(),
                key: key,
                isObject: false,
                value: []
            };
            for (const lang of langs) {
                r.value.push(uniqueId() + ` ${lang}`);
            }
            fake.push(r);
        }
    }
    trigger('getTranslations', fake);
}

export function triggerSearchResults() {
    trigger('getFilesInFolder', getConfigsAndSettings.configs[0].fileNames);
}