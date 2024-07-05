## Features

- Synchronizes json files by keys. A use case is managing localization files.
- Auto-generate typescript file containing a type for keys. like `export type TrKey = 'about' | 'home';`


![Screenshot](https://raw.githubusercontent.com/mergehez/vscode-json-file-synchronizer/master/images/screenshot2.JPG)

## Notice
- Only 'flat' JSON (no nesting) is supported currently. See the "iodine" row in the screenshot.
- If you have comments in your json files, they will be removed! (Though comments must not be used in JSON files...)

## Install

You can install it in VSCode Extension panel by searching "Json File Synchronizer" or from here: https://marketplace.visualstudio.com/items?itemName=MergeSoft.arg-json-file-synchronizer

### Features to be implemented

- Exporting as CSV, XML, JSON...
- Copying row or column (only cell can be copied currently)
- Support for nested json
- Support for arb files


## Requirements

- This extension does not require any dependencies.
