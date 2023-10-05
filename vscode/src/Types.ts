export function createEmptyJsonRow(valueCount: number, key = '') {
    return {key, value: Array(valueCount).fill("")} as JsonRow;
}
export const defaultSettings: Settings = { baseTextSize: '1'}

export type JsonRow = {
    key: string,
    value: (string|object)[]
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
    regexFilter : string
    recursive : boolean
    fileNames : string[]
    tableFilterEmpty : boolean
    tableSaveOnChange : boolean
}