export function createEmptyJsonRow(valueCount: number, key = '') {
    return {
        key,
        value: Array(valueCount).fill(""),
    } as JsonRow;
}
export const defaultSettings: Settings = { baseTextSize: '1'}

export type JsonRow = {
    id: string,
    key: string,
    value: (string|object)[],
    isObject: boolean,
    hide?: boolean,
    // hasEmptyCol: string,
}
export type Settings = {
    baseTextSize: string
}
export type ConfigSearchResult = {
    checked: boolean,
    value: string
}
export type Config = {
    key : number
    title : string
    active : boolean
    fileExts : string
    directory : string
    typeGenPath?: string
    typeGenName?: string
    regexFilter : string
    recursive : boolean
    fileNames : string[]
    tableFilterEmpty : boolean
    tableSaveOnChange : boolean
}