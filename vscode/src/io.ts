import * as vscode from 'vscode';
import * as path from 'path';
import {Uri} from "vscode";

export async function getFilesInFolder(directory: string, recursive: boolean, exts = "json", regexFilter = ""){
    if(directory.startsWith('~')){
        directory = path.join(require('os').homedir(), directory.substring(1));
    }
    if(!directory.endsWith('/')){
        directory += '/';
    }
    try {
        if(recursive){
            const regex = regexFilter.length > 0 ? new RegExp(regexFilter.replace(/\\/g, "/").replace(/\/\//g, "/")) : null;
            return await findInDir(directory, exts, [], regex, directory);
        }

        const fileNames = await vscode.workspace.fs.readDirectory(Uri.parse(directory));
        return fileNames.map(([f]) => f).filter(f => exts.split(",").map(t => t.trim()).filter(ext => f.endsWith(`.${ext}`)).length > 0);
    }catch (ex: any){
        return ex.message as string;
    }
}

async function findInDir (dir : string, exts = "json", fileList = new Array<string>(), regExp : RegExp | null, replace = "") {
    dir = dir.replace(/\\/gi, "/");
    replace = replace.replace(/\\/gi, "/");
	const files = await vscode.workspace.fs.readDirectory(Uri.parse(dir));

	for (const [file, fileType] of files) {
		const filePath = path.join(dir, file).replace(/\\/gi, "/");
		if (fileType === vscode.FileType.Directory) {
			await findInDir(filePath, exts, fileList, regExp, replace);
            continue;
		}

        if (exts.split(",").map(t => t.trim()).filter(ext => file.endsWith(`.${ext}`)).length === 0){
            continue;
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
            continue;
        }

        fileList.push(res);
	}

    return fileList;
  }