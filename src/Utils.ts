import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const _configFileName = "arg-json-file-sync.json";

export function openFileFromMedia(thisContextExtensionPath: string, fileName: string){
	const pathToFile = vscode.Uri.file( path.join(thisContextExtensionPath, 'media', fileName) );
	return fs.readFileSync(pathToFile.with({ scheme: 'vscode-resource' }).fsPath, 'utf8');
}

export function getFilesInFolder(directory: string, recursive: boolean, exts = "json", regexFilter = ""){
		if(! fs.existsSync(directory)){
			return undefined;
		}
		if(recursive){
            const regex = regexFilter.length > 0 ? new RegExp(regexFilter.replace(/\\/g, "/").replace(/\/\//g, "/")) : null;
			return findInDir(directory, exts, [], regex, directory);
        }

		const fileNames = fs.readdirSync(directory);
		return fileNames.filter(f => exts.split(",").map(t => t.trim()).filter(ext => f.endsWith(`.${ext}`)).length > 0);
}

function findInDir (dir : string, exts = "json", fileList = new Array<string>(), regExp : RegExp | null, replace = "") {
    dir = dir.replace(/\\/gi, "/");
    replace = replace.replace(/\\/gi, "/");
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file).replace(/\\/gi, "/");
  
		if (fs.lstatSync(filePath).isDirectory()) {
			findInDir(filePath, exts, fileList, regExp, replace);
            return;
		}

        if (file === _configFileName || exts.split(",").map(t => t.trim()).filter(ext => file.endsWith(`.${ext}`)).length === 0){
            return;
        }

        let res = replace.length === 0 ? filePath : filePath.replace(replace, "");
        // res = res.replace(/\\/gi, "/");
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