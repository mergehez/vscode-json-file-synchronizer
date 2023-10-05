import {Config, defaultSettings, Settings} from "./Types";
import * as vscode from "vscode";

const KEY_SETTINGS = 'arg-json-synchronizer-settings';
const KEY_CONFIGS = 'arg-json-synchronizer-configs';
export class GlobalStateHelper{
    private context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public getConfigs = () => this.context.globalState.get<Config[]>(KEY_CONFIGS) ?? [];
    public updateConfig = (configToUpdate: Config): Thenable<void> => {
        const configs = this.getConfigs();
        for (let i = 0; i < configs.length; i++){
            if(configs[i].key === configToUpdate.key){
                configs[i] = configToUpdate;
                return this.context.globalState.update(KEY_CONFIGS, configs);
            }
        }
        configs.push(configToUpdate);
        return this.context.globalState.update(KEY_CONFIGS, configs);
    };
    public deleteConfig = (configToDelete: Config) => {
        const configs = this.getConfigs().filter(t => t.key !== configToDelete.key);
        return this.context.globalState.update(KEY_CONFIGS, configs);
    };

    public getSettings = () => this.context.globalState.get<Settings>(KEY_SETTINGS) ?? defaultSettings;
    public updateSettings = (settings: Settings) => this.context.globalState.update(KEY_SETTINGS, settings ?? defaultSettings);
}