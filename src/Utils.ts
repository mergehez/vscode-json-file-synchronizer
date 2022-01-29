import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const _configFileName = "arg-json-file-sync.json";

export function openFileFromMedia(thisContextExtensionPath: string, fileName: string){
	const pathToFile = vscode.Uri.file( path.join(thisContextExtensionPath, 'media', fileName) );
	return fs.readFileSync(pathToFile.with({ scheme: 'vscode-resource' }).fsPath, 'utf8');
}

function _readConfigFile(){
	const workspacePaths = vscode.workspace.workspaceFolders;
	if(workspacePaths){
		const vsCodeFolder = path.join(workspacePaths[0].uri.fsPath, '.vscode/');
		fs.mkdirSync(vsCodeFolder, { recursive: true });
		const configFile = path.join(vsCodeFolder, _configFileName);
		if (!fs.existsSync(configFile)) {
			fs.writeFileSync(configFile, '{}');
		}
		return JSON.parse(fs.readFileSync(configFile, 'utf8'));
	}
	return undefined;
}
function _writeConfigFile(config: any){
	const workspacePaths = vscode.workspace.workspaceFolders;
	if(workspacePaths){
		const configFile = path.join(workspacePaths[0].uri.fsPath, '.vscode/' + _configFileName);
		fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
	}
}

export function setConfig(key: string, value: string | number | boolean) {
	const config = _readConfigFile();
	config[key] = value;
	_writeConfigFile(config);
}

export function getConfig<T>(key: string, defaultValue: T) : T {
	const config = _readConfigFile();
	if(!config){
		return defaultValue;
    }
		
	return config[key] ?? defaultValue;
}

export function getFilesInFolder(folderPath: string, recursive: boolean, exts = "json", regexFilter = ""){
	const workspacePaths = vscode.workspace.workspaceFolders;
	if(workspacePaths){
		const rootPath = workspacePaths[0].uri.fsPath;
		const pathsString = path.join(rootPath, folderPath);
		if(! fs.existsSync(pathsString)){
			return undefined;
		}
		if(recursive){
			return findInDir(pathsString, exts, [], regexFilter.length > 0 ? new RegExp(regexFilter) : null, rootPath);
        }

		const fileNames = fs.readdirSync(pathsString);
		return fileNames.filter(f => exts.split(",").map(t => t.trim()).filter(ext => f.endsWith(`.${ext}`)).length > 0);
	}
	return undefined;
}

function findInDir (dir : string, exts = "json", fileList = new Array<string>(), regExp : RegExp | null, replace = "") {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
  
		if (fs.lstatSync(filePath).isDirectory()) {
			findInDir(filePath, exts, fileList, regExp, replace);
            return;
		}

        if (file === _configFileName || exts.split(",").map(t => t.trim()).filter(ext => file.endsWith(`.${ext}`)).length === 0){
            return;
        }

        let res = replace.length === 0 ? filePath : filePath.replace(replace, "");
        if(res.length > 0 && (res[0] === "/" || res[0] === "\\")){
            res = res.substring(1);
        }
        if(regExp !== null){
            if(regExp.test(res)){
                fileList.push(res);
            }
            return;
        }

        fileList.push(res);
	});
  
	return fileList;
  }