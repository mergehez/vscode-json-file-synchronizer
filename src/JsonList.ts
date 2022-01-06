import * as fs from 'fs';
import * as path from 'path';

class KeyValue<T> {
	key: string;
	value: T;
	constructor(key: string, value: T) {
		this.key = key;
		this.value = value;
	}
}

class Data{
	private _map: Array<KeyValue<string[]>> = [];
	public get map(): Array<KeyValue<string[]>> {
		return this._map;
	}
	private _rootPath: string;
	public get rootPath(): string {
		return this._rootPath;
	}
	
	private _fileNames: string[] = [];
	public get fileNames(): string[] {
		return this._fileNames;
	}
	
	private _filePaths: string[] = [];
	public get filePaths(): string[] {
		return this._filePaths;
	}
	
	constructor() {
		this._rootPath = "";
	}

	public init(rootPath: string, filePathsWithoutRoot: string[]){
		this._rootPath = rootPath;
		this._filePaths = filePathsWithoutRoot;
		this._fileNames = filePathsWithoutRoot.map(x => path.parse(x).base);
	}
	public setMap(map: Array<KeyValue<string[]>>) {
		this._map = map;
	}
	public clear() {
		this._rootPath = "";
		this._map = [];
		this._filePaths = [];
		this._fileNames = [];
	}
}

// [{ key: [values]}]
export default class JsonList{
	private data : Data = new Data();
	
	public get map(): Array<KeyValue<string[]>> {
		return this.data.map;
	}
	public get rootPath(): string {
		return this.data.rootPath;
	}
	public get fileNames(): string[] {
		return this.data.fileNames;
	}

	public get filePaths(): string[] {
		return this.data.filePaths;
	}

	private _getFileIndex(fileName: string){
		return this.fileNames.indexOf(fileName);
	}

	public init(rootPath: string, filePathsWithoutRoot: string[]){
		this.data.init(rootPath, filePathsWithoutRoot);
		for (let i = 0; i < this.filePaths.length; i++) {
			const filePath = this.filePaths[i];
			this.parseJsonFile(filePath);
		}
		this.sort();
	}
	
	public setMap(map: Array<KeyValue<string[]>>, sort = false) {
		this.data.setMap(map);
		if(sort){
			this.sort();
        }
	}

	public clear() {
		this.data.clear();
	}

	private _addValue(fileName: string, key: string, value: string) {
		const fileIndex = this._getFileIndex(fileName);
		if (fileIndex === -1) {
			throw new Error("file not found");
		}

		let keyValues = this.map.find(x => x.key === key);
		if(keyValues === undefined){
			keyValues = new KeyValue<string[]>(key, new Array(this.fileNames.length).fill(""));
			this.map.push(keyValues);
		}

		keyValues.value[fileIndex] = value;
	}

	private parseJsonFile(filePathWithoutRoot: string){
        const filePathFull = path.join(this.rootPath, filePathWithoutRoot);
        const json = JSON.parse(fs.readFileSync(filePathFull, 'utf8'));
        const fileName = path.parse(filePathWithoutRoot).base;

        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {	
                this._addValue(fileName, key, json[key]);
            }
        }
	}

	// sort map by string index
	public sort() {
        let map = this.map.sort((a: KeyValue<string[]>, b: KeyValue<string[]>) => {
            return a.key.localeCompare(b.key, undefined, {ignorePunctuation: true});
        });
		this.data.setMap(map);
	}

	public writeAllToFile(){
		for(let i = 0; i < this.filePaths.length; i++){
			this.writeToFile(i);
		}
	}

	public writeToFile(fileIndex: number){
		if(fileIndex === -2){
			this.writeAllToFile();
		}else{
			const filePathFull = path.join(this.rootPath, this.filePaths[fileIndex]);
			const mapFile: { [key: string]: any } = {};

			this.map.forEach(x => {
				mapFile[x.key] = x.value[fileIndex];
			});
			const json = JSON.stringify(mapFile, null, '\t');
	
			fs.writeFileSync(filePathFull, json);
		}
	}
}