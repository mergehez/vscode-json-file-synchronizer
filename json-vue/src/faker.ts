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


const trigger = (key:string, data:any) => {
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
export function triggerFakeEvent(){
    // const configs = getConfigsAndSettings;
    trigger('getConfigsAndSettings', getConfigsAndSettings);

    const translations: JsonRow[] = [];
    readJsonFiles().then((jsons) => {
        for (let i = 0; i < jsons.length; i++){
            const json = jsons[i];
            for (const key in json) {
                let existing = translations.find(t => t.key === key);
                if(!existing){
                    existing = {
                        id: uniqueId(),
                        key,
                        value: Array.from({length: jsons.length}).fill('') as (string|object)[],
                        // hasEmptyCol: json[key],
                        isObject: typeof json[key] === 'object'
                    };
                    existing.value[i] = json[key];
                    translations.push(existing);
                }else{
                    existing.value[i] = json[key];
                }

                // if(i === jsons.length - 1)
                //     existing.hasEmptyCol = existing.value.some(t => t === '') ? 'true' : 'false';
            }
        }
        trigger('getTranslations', translations);
    });

    // trigger('getTranslations', getTranslations);
}


async function readJsonFiles() {
    const jsons = [];
    for (const file of getConfigsAndSettings.configs[0].fileNames) {
        jsons.push(await readJsonFile(file));
    }
    return jsons;
}
async function readJsonFile(file: string) {
    var response = await fetch(`http://127.0.0.1:5500/${file}`);//Change this to your url
    const json = response.json();

    console.log(json);
    return json;
}

export function triggerSearchResults(){
    trigger('getFilesInFolder', getConfigsAndSettings.configs[0].fileNames);
}