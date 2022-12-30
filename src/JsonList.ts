import * as fs from 'fs';
import * as path from 'path';
import { JsonRow } from './Types';


class Data{
	private _map: Array<JsonRow> = [];
	public get map(): Array<JsonRow> {
		return this._map;
	}
	private _dir: string;
	public get dir(): string {
		return this._dir;
	}
	
	private _fileNames: string[] = [];
	public get fileNames(): string[] {
		return this._fileNames;
	}
	
	constructor() {
		this._dir = "";
	}

	public init(dir: string, fileNames: string[]){
		this._map = [];
		this._dir = dir;
		this._fileNames = fileNames;
	}
	public setMap(map: Array<JsonRow>) {
		this._map = map;
	}
	public clear() {
		this._dir = "";
		this._map = [];
		this._fileNames = [];
	}
}

// [{ key: [values]}]
export default class JsonList{
	private data : Data = new Data();
	
	public get map(): Array<JsonRow> {
		return this.data.map;
	}
	public get dir(): string {
		return this.data.dir;
	}

	public get fileNames(): string[] {
		return this.data.fileNames;
	}

	private _getFileIndex(fileName: string){
		return this.fileNames.indexOf(fileName);
	}

	public init(dir: string, fileNames: string[]){
		this.data.init(dir, fileNames);
		for (let i = 0; i < this.fileNames.length; i++) {
			this.parseJsonFile(this.fileNames[i]);
		}
		this.sort();
	}
	
	public setMap(map: Array<JsonRow>, sort = false) {
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
			keyValues = new JsonRow(key, new Array(this.fileNames.length).fill(""));
			this.map.push(keyValues);
		}

		keyValues.value[fileIndex] = value;
	}

	private parseJsonFile(fileName: string){
        const filePathFull = path.join(this.dir, fileName);
        const json = JSON.parse(fs.readFileSync(filePathFull, 'utf8'));
        // const fileName = path.parse(filePathWithoutRoot).base;

        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {	
                this._addValue(fileName, key, json[key]);
                // this._addValue(fileName, key, json[key]);
            }
        }
	}

	// sort map by string index
	public sort() {
        let map = this.map.sort((a: JsonRow, b: JsonRow) => {
            return a.key.localeCompare(b.key, undefined, {ignorePunctuation: true});
        });
		this.data.setMap(map);
	}

	public writeAllToFile(){
		for(let i = 0; i < this.fileNames.length; i++){
			this.writeToFile(i);
		}
	}

	public writeToFile(fileIndex: number){
		if(fileIndex === -2){
			this.writeAllToFile();
		}else{
			const filePathFull = path.join(this.dir, this.fileNames[fileIndex]);
			const mapFile: { [key: string]: any } = {};

			this.map.forEach(x => {
				mapFile[x.key] = x.value[fileIndex];
			});
			const json = JSON.stringify(mapFile, null, '\t');
	
			fs.writeFileSync(filePathFull, json);
		}
	}
}