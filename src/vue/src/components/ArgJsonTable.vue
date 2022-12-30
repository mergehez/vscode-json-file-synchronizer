<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Config, JsonRow, Settings } from '../../../Types';
import LoadingButton from './LoadingButton.vue';
import Scaffold from './Scaffold.vue';
import { loader, postMessage, initAndListenVsCode } from './store'

initAndListenVsCode('initTranslationPage', (message) => {
    if (message.request === "initTranslationPage" || message.request === 'changeActiveConfig') {
        console.log(message.request)
        map.value = message.data.map as Array<JsonRow>;
        settings.value = message.data.settings;

        configs.splice(0, configs.length);
        for (const c of message.data.configs) {
            configs.push(c);
        }
        activeConfig.value = configs.filter(t => t.active)[0] ?? configs[0];
    }else if(message.request === 'updateAllConfigs'){

    }
});

const emit = defineEmits(['switchPage', 'refresh']);

// const files = ref<Array<string>>([]);
const map = ref<Array<JsonRow>>([]);
const configs = reactive<Array<Config>>([]);
const settings = ref<Settings>(new Settings());
const activeConfig = ref<Config | null>(null);
const fileCount = computed(() => activeConfig.value?.fileNames.length ?? 0);


function addRow(){
    if(map.value.filter(row => row.key.length == 0).length == 0){
        map.value.unshift(JsonRow.empty(fileCount.value));
    }
    setTimeout(() => {
        let emptyInput = (document.querySelector("#table-body input:required:invalid") || document.querySelector("#table-body tr td input")) as HTMLInputElement;
        emptyInput?.focus();
    }, 200);
}
function showRow(row: JsonRow){
    return activeConfig.value && (!activeConfig.value.tableFilterEmpty || row.value.filter(t => t == null || t.toString().trim().length == 0).length > 0);
}
function deleteRow(key: string){
    const rowIndex = map.value.findIndex(r => r.key == key);
    if(rowIndex != -1 && confirm("Really want to delete the row?")){
        map.value.splice(rowIndex, 1);
        // updateFile(-2); //TODO: check this
    }
}
function refresh(){
    emit('refresh');
    // postMessage({ command: 'refresh' }, '');
}
// function saveChanges(fileIndex:number){
function saveChanges(){
    postMessage({ 
        command: 'updateFile', 
        data: JSON.stringify( { fileIndex: -2, map: map.value })
    }, 'save-changes');
}

function updateAllConfigs(){
    postMessage({ 
        command: 'updateAllConfigs', 
        configJsonStr : JSON.stringify(configs),
        silent: true,
    }, '');
}
function updateSettings(){
    postMessage({ 
        command: 'updateSettings', 
        settingsJson : JSON.stringify(settings.value),
    }, '');
}
function goToConfigPage(){
    emit('switchPage');
    // postMessage({ 
    //     command: 'goToConfigPage'
    // }, 'go-to-config-page');
}
function changeProject(e : any){
    const key = e.target.value;
    console.log(key);
    if(key == '-gotoconfig-'){
        return goToConfigPage();
    }

    for (let i = 0; i < configs.length; i++) {
        configs[i].active = configs[i].key == key;
    }
    postMessage({ 
        command: 'changeActiveConfig', 
        configJsonStr : JSON.stringify(configs),
    }, '');
}
// function changeBaseTextSize(e : any){
//     settings.baseTextSize = e.target.value;
//     vscode?.postMessage({ 
//         command: 'setSetting', 
//         key: 'baseTextSize',
//         value: e.target.value,
//     });
// }

function focusInput(e:any){
    e.target.parentNode.parentNode.classList.add("focused");
}
function unfocusInput(e:any){
    e.target.parentNode.parentNode.classList.remove("focused");
}

const menuData = ref({
    rowKey: "", 
    fileIndex: -1, 
    style : 'display:none;',
});
function hideInputMenu(e:any){
    if(menuData.value.rowKey){
        menuData.value.rowKey = "";
        menuData.value.style = "display:none;";
    }else if(e){
        if(e.target.tagName.toUpperCase() == "INPUT" && e.target.disabled){
            e.target.parentNode.parentNode.querySelector("input")?.focus();
        }
    }
}
function showInputMenu(e:any, row:JsonRow, fileIndex:number){
    e.preventDefault();
    menuData.value = {
        rowKey: row.key,
        fileIndex: fileIndex,
        style: `left: ${e.pageX}px; top: ${e.pageY}px;display:block;`
    };
}

function tryToMoveFocusedBox(e:KeyboardEvent, indexRow:number, indexCol:number){
    e.preventDefault();
    const key = e.key;
    
    const tableBody = document.querySelector('.tbody') as HTMLElement;
    const rowCount = tableBody.children.length;
    const colCount = fileCount.value+1;
    
    const moveY = (key == "ArrowUp" ? -1 : (key == "ArrowDown" ? 1 : 0)) * (e.shiftKey ? Math.ceil(rowCount/5) : 1);
    const moveX = (key == "ArrowLeft" ? -1 : (key == "ArrowRight" ? 1 : 0)) * (e.shiftKey ? 2 : 1);
    const newRow = (indexRow + moveY + rowCount) % rowCount + 1;
    const newCol = (indexCol + moveX + colCount) % colCount + 1;
    (tableBody.querySelector(`.tr:nth-child(${newRow}) .td:nth-child(${newCol}) > *`) as HTMLInputElement)?.focus();
}
function saveAllIfCtrlS(e:KeyboardEvent){
    e.preventDefault();
    if(e.key == 's'){
        saveChanges();
    }else console.log(e.key)
}

</script>
<template>
    <Scaffold>
        <div class="w-full flex-1 overflow-y-auto flex flex-col" v-if="activeConfig">
            <component is="style">
                :root {
                    font-size: {{settings.baseTextSize}}rem;
                }
            </component>
            <div class="flex items-center mb-2">
                <button @click="addRow" class="btn btn-primary"> Add New Key </button>
                <LoadingButton :loader="loader" loader-target="refresh" @click="refresh()" class="btn btn-primary ml-2" >
                    Refresh Table
                </LoadingButton>
                <LoadingButton :loader="loader" loader-target="save-changes" @click="saveChanges()" class="btn btn-primary ml-2" >
                    Save Changes
                </LoadingButton>
                <div class="flex items-center py-0 px-2">
                    <input type="checkbox" id="input-recursive" v-model="activeConfig.tableSaveOnChange" @change="updateAllConfigs()">
                    <label for="input-recursive">Save on Change</label>
                </div>
                <div class="flex items-center py-0 px-2">
                    <input type="checkbox" id="input-filter-empty" v-model="activeConfig.tableFilterEmpty" @change="updateAllConfigs()">
                    <label for="input-filter-empty">Only empty fields</label>
                </div>
                <div class="flex items-center py-0 px-2">
                    <label for="input-select-size" class="pr-2 whitespace-nowrap">Size: </label>
                    <select v-model="settings.baseTextSize" @change="updateSettings()" class="btn btn-light" id="input-select-size">
                        <template v-for="size in ['0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.3', '1.4', '1.5']">
                            <option :value="size" :selected="size == settings.baseTextSize">{{size}}</option>
                        </template>
                    </select>
                </div>
                <div class="flex-1"></div>
                <div class="flex items-center py-0 px-2">
                    <label for="input-select-project" class="pr-2 whitespace-nowrap">Current Project: </label>
                    <select @change="changeProject" class="btn btn-light" id="input-select-project">
                        <template v-for="conf in configs">
                            <option :value="conf.key" :selected="conf.key == activeConfig?.key">{{conf.key}}</option>
                        </template>
                        <option value="-gotoconfig-">-- Config --</option>
                    </select>
                </div>
                <LoadingButton loader-target="go-to-config-page" @click="goToConfigPage()" class="btn btn-primary ml-2">
                    Configuration
                </LoadingButton>
            </div>
            <div class="arg-table w-full text-left flex flex-col scrollbar-s flex-1 overflow-y-auto relative text-gray-500 dark:text-gray-400" @click="hideInputMenu($event)">
                <div class="thead w-full flex sticky left-0 right-0 top-0">
                    <div class="th flex-1 p-1">Key</div>
                    <template v-for="file in activeConfig.fileNames">
                        <div class="th flex-1 p-1">{{file}}</div>
                    </template>
                    <div class="th td-actions"></div>
                </div>
                <div class="tbody flex flex-col">
                    <template v-for="(row, indexRow) in map">
                        <div v-if="showRow(row)" class="tr border-b dark:border-gray-700 flex">
                            <div class="td flex-1">
                                <input type="text" v-model="row.key" class="fw-bold" :required="true" @focus="focusInput" @blur="unfocusInput" data-index="-2"
                                        @keyup.alt="(e) => tryToMoveFocusedBox(e, indexRow, 0)" @keyup.ctrl="(e) => saveAllIfCtrlS(e)">
                            </div>
                            <template v-for="(val, indexCol) in row.value">
                                <div class="td flex-1">
                                    <input 
                                        type="text" 
                                        :required="typeof val !== 'object'" 
                                        :readonly="typeof val == 'object'"
                                        :style="typeof val == 'object' ? 'cursor:not-allowed;':''"
                                        :title="typeof val == 'object' ? 'this currently cannot be edited. Because it is an object..':''"
                                        :data-index="indexCol" 
                                        @focus="focusInput" 
                                        v-model="row.value[indexCol]"
                                        @blur="unfocusInput" 
                                        @contextmenu="(e) => showInputMenu(e, row, indexCol)" 
                                        @click="hideInputMenu($event)"
                                        @keyup.alt="(e) => tryToMoveFocusedBox(e, indexRow, indexCol+1)"
                                        @keyup.ctrl="(e) => saveAllIfCtrlS(e)"
                                        :disabled="row.key.length == 0"
                                        >
                                </div>
                            </template>
                            <div class="td td-actions">
                                <button @click="deleteRow(row.key)" title="delete" class="btn btn-danger py-0 px-1 rounded"><i class="ic ic-delete"></i></button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </Scaffold>
</template>

<style scoped>
    /* width */
    .scrollbar-s::-webkit-scrollbar { width: 10px; }
    
    /* Track */
    .scrollbar-s::-webkit-scrollbar-track { background: #f1f1f1; }
    
    /* Handle */
    .scrollbar-s::-webkit-scrollbar-thumb { background: #aaa; }
    
    /* Handle on hover */
    .scrollbar-s::-webkit-scrollbar-thumb:hover { background: #888; }

    input[type=checkbox]{
        width:15px; height: 15px;
        margin-right: .25rem;
    }
</style>