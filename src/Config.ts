import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class Config{
    public key : string = "";
    public active : boolean = false;
    public fileExts : Array<string> = [];
    public directory : string = "";
    public regexFilter : string = "";
    public recursive : boolean = false;
    public filePaths : Array<string> = [];

    public tableFilterEmpty : boolean = false;
    public tableSaveOnChange : boolean = false;

    public static parseJsonObject(configObject : any) : Config {
        let config = new Config();
        config.key = configObject["key"] ?? "";
        config.active = configObject["active"] ?? false;
        config.fileExts = configObject["fileExts"] ?? [];
        config.directory = configObject["directory"] ?? "";
        config.regexFilter = configObject["regexFilter"] ?? "";
        config.recursive = configObject["recursive"] ?? false;
        config.filePaths = configObject["filePaths"] ?? [];
        config.tableFilterEmpty = configObject["tableFilterEmpty"] ?? false;
        config.tableSaveOnChange = configObject["tableSaveOnChange"] ?? false;
        return config;
    }
}

export default class ConfigManager{
    private _configFileName = "arg-json-file-sync.json";
    private _configs : Array<Config> = [];
    public _keys : Array<string> = [];
    public activeConfig : Config | undefined;
    public hasConfigs = false;

	constructor() {
        this.reinit();
	}

    public reinit(){
        const workspacePaths = vscode.workspace.workspaceFolders;
        if(workspacePaths){
            const vsCodeFolder = path.join(workspacePaths[0].uri.fsPath, '.vscode/');
            fs.mkdirSync(vsCodeFolder, { recursive: true });
            const configFile = path.join(vsCodeFolder, this._configFileName);
            if (!fs.existsSync(configFile)) {
                fs.writeFileSync(configFile, '{}');
            }
            const configJsonObj = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            this.setClassValues(configJsonObj);
        }
    }

    private setClassValues(configJsonObj : any){
        this._configs = [];
        this._keys = [];
        this.hasConfigs = false;
        for (const key in configJsonObj) {
            if(key === "lastActive"){
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(configJsonObj, key)) {
                const configObject = configJsonObj[key];
                const tmpConfig = Config.parseJsonObject(configObject);
                this._keys.push(tmpConfig.key);
                this._configs.push(tmpConfig);
                this.hasConfigs = true;
                if(tmpConfig.active){
                    this.activeConfig = tmpConfig;
                }
            }
        }
    }

    public selectConfig(key: string){
        this.activeConfig = this._configs.filter(t => t.key === key)[0];
    }

    public update(modifiedJsonObj : any){
        this.setClassValues(modifiedJsonObj);
        this.writeConfigs();
    }

    
    private writeConfigs(){
        const workspacePaths = vscode.workspace.workspaceFolders;
        if(workspacePaths){
            const configFile = path.join(workspacePaths[0].uri.fsPath, '.vscode/' + this._configFileName);
            const newJsonStr = this.createJsonStr();
            fs.writeFileSync(configFile, newJsonStr);
        }
    }

    public createJsonStr(){
        return JSON.stringify(this._configs , null, 2);
    }

    public getKeys(){
        return this._keys;
    }

    public getFileListInFolder(){

    }
}