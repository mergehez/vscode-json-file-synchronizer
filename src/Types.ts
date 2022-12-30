import JsonList from "./JsonList";

export class Config{
    public key : string = "";
    public active : boolean = false;
    public fileExts : Array<string> = [];
    public directory : string = "";
    public regexFilter : string = "";
    public recursive : boolean = false;
    public fileNames : Array<string> = [];

    public tableFilterEmpty : boolean = false;
    public tableSaveOnChange : boolean = false;
    // public baseTextSize : string = '0.8';

    public static parseJsonObject(configObject : any) : Config {
        let config = new Config();
        config.key = configObject["key"] ?? "";
        config.active = configObject["active"] ?? false;
        config.fileExts = configObject["fileExts"] ?? [];
        config.directory = configObject["directory"] ?? "";
        config.regexFilter = configObject["regexFilter"] ?? "";
        config.recursive = configObject["recursive"] ?? false;
        config.fileNames = configObject["fileNames"] ?? [];
        config.tableFilterEmpty = configObject["tableFilterEmpty"] ?? false;
        config.tableSaveOnChange = configObject["tableSaveOnChange"] ?? false;
        // config.baseTextSize = configObject["baseTextSize"] ?? '0.8';
        return config;
    }
    public initTranslations(translations: JsonList){
        translations.init(this.directory ?? "", this.fileNames ?? []);
    }

    public getTranslations(){

    }
}


export class KeyValue<T> {
	key: string;
	value: T;
	constructor(key: string, value: T) {
		this.key = key;
		this.value = value;
	}
}
export class JsonRow extends KeyValue<Array<String|Object>> {
    public static empty(valueCount: number){
        return { key: '', value: Array(valueCount).fill("") } as JsonRow;
    }
}

export class KeyValueAny extends KeyValue<any>{}

export class Settings {
    public baseTextSize : string = "0.8";
    
    public static parseJsonObject(obj : any) {
        let newVal = new Settings();
        newVal.baseTextSize = obj["baseTextSize"] ?? '0.8';
        return newVal;
    }
}

export class ConfigSearchResult {
    checked: boolean;
    value: string;
	constructor(value: string, checked: boolean = true) {
		this.checked = checked;
		this.value = value;
	}
}