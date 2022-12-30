import * as vscode from 'vscode';
import JsonList from './JsonList';
import { Config, Settings } from './Types';

export default class ConfigManager{
    public _keys : Array<string> = [];
    public _allConfigs : Array<Config> = [];
    public _settings : Settings|null = null;
    public activeConfig : Config | undefined;
    public hasConfigs = false;
    private _context : vscode.ExtensionContext | undefined;
    
    public syncAllConfigs(selectFirstConfig = false) : ConfigManager{
        this._allConfigs = this._context!.globalState.get<Array<Config>>("all-configs") ?? [];
        this.setDirectoryIfNotSet();
        this.hasConfigs = this._allConfigs.length > 0;
        if(this._allConfigs.length === 1){
            this.activeConfig = this._allConfigs[0];
        }else if(this.hasConfigs){
            this.activeConfig = this._allConfigs.filter(c => c.active)[0];
        }
        if(selectFirstConfig && !this.activeConfig){
            this.activeConfig = this._allConfigs[0];
        }
        return this;
    }

	constructor(context: vscode.ExtensionContext, selectFirstConfig = false) {
        this._context = context;
        this.syncAllConfigs(selectFirstConfig);
	}

    public setActiveConfig(key: string){
        this.activeConfig = this._allConfigs.filter(t => t.key === key)[0];
    }
    
    public initTranslations(translations: JsonList){
        const dir = this.activeConfig?.directory ?? "";
        const fileNames = this.activeConfig?.fileNames ?? [];
        translations.init(dir, fileNames);
    }

    public async updateAllConfigsByJsonObject(modifiedJsonObj : any, translations: JsonList|null = null){
        this._allConfigs = [];
        this._keys = [];
        this.hasConfigs = false;
        for (const key in modifiedJsonObj) {
            if(key === "lastActive"){
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(modifiedJsonObj, key)) {
                const configObject = modifiedJsonObj[key];
                const tmpConfig = Config.parseJsonObject(configObject);
                if(this._keys.includes(tmpConfig.key)){
                    continue;
                }
                this._keys.push(tmpConfig.key);
                this._allConfigs.push(tmpConfig);
                this.hasConfigs = true;
                if(tmpConfig.active){
                    this.activeConfig = tmpConfig;
                }
            }
        }
        await this._context!.globalState.update("all-configs", this._allConfigs);
        if(translations !== null){
            this.initTranslations(translations);
        }
    }

    private settingsKey = 'arg-json-synchronizer-settingsd';
    public async updateSettings(settings: any){
        await this._context!.globalState.update(this.settingsKey, Settings.parseJsonObject(settings));
        this._settings = null;
        return this.getSettings();
    }

    public getSettings(){
        if(!this._settings){
            const fromState = this._context!.globalState.get<Settings>(this.settingsKey);
            this._settings = fromState ? Settings.parseJsonObject(JSON.parse(JSON.stringify(fromState))) : new Settings();
        }
        return this._settings;
    }

    public getKeys(){
        return this._keys;
    }
    
    public getAllConfigAsJson(){
        return JSON.stringify(this._allConfigs , null, 2);
    }

    private setDirectoryIfNotSet(){
        const workspacePaths = vscode.workspace.workspaceFolders;        
        if(workspacePaths){
            for (const conf of this._allConfigs) {
                if(conf.directory.length === 0){
                    conf.directory = workspacePaths[0].uri.fsPath;
                }
            }
            this._context!.globalState.update("all-configs", this._allConfigs);
        }
    }
}