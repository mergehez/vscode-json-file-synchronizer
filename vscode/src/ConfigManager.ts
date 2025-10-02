import * as vscode from 'vscode';
import {Config, createEmptyJsonRow, JsonRow} from './Types';
import * as path from "path";
import * as fs from "fs";
import {GlobalStateHelper} from "./GlobalStateHelper";

export default class ConfigManager {
    public static getTranslations(config: Config, globalStateHelper: GlobalStateHelper): JsonRow[] {
        if (!config.directory) {
            const workspacePaths = vscode.workspace.workspaceFolders;
            if (workspacePaths) {
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
                if (keyValues === undefined) {
                    keyValues = createEmptyJsonRow(config.fileNames.length, key);
                    keyValues.value[fileIndex] = json[key];
                    map.push(keyValues);
                } else {
                    keyValues.value[fileIndex] = json[key];
                }

                keyValues.isObject = typeof json[key] === 'object';
            }
        }
        return map.sort((a: JsonRow, b: JsonRow) => {
            return a.key.localeCompare(b.key, undefined, {ignorePunctuation: true});
        });
    }

    public static updateJsonFiles(config: Config, map: JsonRow[], fileIndex: number) {
        if (fileIndex !== -2) {
            throw new Error("fileIndex was not -2, but " + fileIndex + " instead.");
        }

        map.sort((a: JsonRow, b: JsonRow) => {
            return a.key.localeCompare(b.key, undefined, {ignorePunctuation: true});
        });
        if (config.typeGenPath && config.typeGenName) {
            if (!fs.existsSync(config.typeGenPath)) {
                fs.mkdirSync(path.dirname(config.typeGenPath), {recursive: true});
            }
            const keys = map.map(x => `'${x.key.replace(/'/g, "\\'")}'`).join(" | ");
            const content = `export type ${config.typeGenName} = ${keys};\n`;
            const url = new URL('file://' + config.typeGenPath);
            console.log("Writing to", url);
            fs.writeFileSync(url, content);
        }
        for (let i = 0; i < config.fileNames.length; i++) {
            ConfigManager.updateJsonFile(config, map, i);
        }
    }

    private static updateJsonFile(config: Config, map: JsonRow[], fileIndex: number) {
        const filePathFull = path.join(config.directory, config.fileNames[fileIndex]);
        const mapFile: { [key: string]: any } = {};

        map.forEach(x => {
            mapFile[x.key] = x.value[fileIndex];
        });

        // the default value of 'jsonFormattingOption' is 'tab'
        const format = (!config.jsonFormattingOption || config.jsonFormattingOption === 'tab')
            ? '\t'
            : config.jsonFormattingOption === 'spaces2'
                ? 2
                : config.jsonFormattingOption === 'spaces4'
                    ? 4
                    : undefined;

        const json = JSON.stringify(mapFile, null, format);
        fs.writeFileSync(filePathFull, json);

        if (!config.jsonFormattingOption || config.jsonFormattingOption === 'vscodeFormatter') {
            ConfigManager.formatDocument(filePathFull);
        }
    }

    private static async formatDocument(filePathFull: string) {
        try {
            const uri = vscode.Uri.file(filePathFull);
            const commands = await vscode.commands.getCommands(true);
            if (commands.includes('editor.action.formatDocument')) {
                const success = await vscode.commands.executeCommand('editor.action.formatDocument', uri);
                if (success) {
                    return;
                }
                console.error(`Failed to format ${filePathFull}`);
            }
            const edits: any = await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', uri, {})
            if (edits && edits.length > 0) {
                const edit = new vscode.WorkspaceEdit();
                edit.set(uri, edits);
                return vscode.workspace.applyEdit(edit);
            }

            console.log(`No formatting edits for ${filePathFull}`);
        } catch (error) {
            console.error(`Error formatting ${filePathFull}:`, error);
        }
    }
}