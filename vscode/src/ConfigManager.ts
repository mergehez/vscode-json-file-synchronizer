import * as vscode from 'vscode';
import {Config, createEmptyJsonRow, JsonRow} from './Types';
import * as path from "path";
import * as fs from "fs";
import {GlobalStateHelper} from "./GlobalStateHelper";

export default class ConfigManager{
    public static getTranslations(config: Config, globalStateHelper: GlobalStateHelper): JsonRow[] {
        if(!config.directory){
            const workspacePaths = vscode.workspace.workspaceFolders;
            if(workspacePaths){
                config.directory = workspacePaths[0].uri.fsPath;
                globalStateHelper.updateConfig(config);
            }
        }
        const map: JsonRow[] = []
        for (const fileName of config.fileNames) {
            const filePathFull = path.join(config.directory, fileName);
            const json = JSON.parse(fs.readFileSync(filePathFull, 'utf8'));
            // const fileName = path.parse(filePathWithoutRoot).base;

            for (const key in json) {
                const fileIndex = config.fileNames.indexOf(fileName);
                if (fileIndex === -1) {
                    throw new Error("file not found");
                }

                let keyValues = map.find(x => x.key === key);
                if(keyValues === undefined){
                    keyValues = createEmptyJsonRow(config.fileNames.length, key);
                    keyValues.value[fileIndex] = json[key];
                    map.push(keyValues);
                }else
                    keyValues.value[fileIndex] = json[key];
            }
        }
        return map.sort((a: JsonRow, b: JsonRow) => {
            return a.key.localeCompare(b.key, undefined, {ignorePunctuation: true});
        });
    }

    public static updateJsonFiles(config: Config, map: JsonRow[], fileIndex: number){
        if(fileIndex === -2){
            for(let i = 0; i < config.fileNames.length; i++){
                ConfigManager.updateJsonFiles(config, map, i);
            }
        }else{
            const filePathFull = path.join(config.directory, config.fileNames[fileIndex]);
            const mapFile: { [key: string]: any } = {};

            map.sort((a: JsonRow, b: JsonRow) => {
                return a.key.localeCompare(b.key, undefined, {ignorePunctuation: true});
            }).forEach(x => {
                mapFile[x.key] = x.value[fileIndex];
            });
            const json = JSON.stringify(mapFile, null, '\t');

            fs.writeFileSync(filePathFull, json);
        }
    }
}