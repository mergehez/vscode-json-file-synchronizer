<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {Config, createEmptyJsonRow, JsonRow} from '@vscode/Types';
import LoadingButton from './LoadingButton.vue';
import Scaffold from './Scaffold.vue';
import {loader, settings, postMessageToVsCode} from '../helpers'
import DeleteButton from "./DeleteButton.vue";

const props = defineProps<{config: Config, translations: JsonRow[]}>();
const emit = defineEmits(['switchPage', 'refresh']);

const map = ref<Array<JsonRow>>(props.translations);
const configs = reactive<Array<Config>>([]);
const fileCount = computed(() => props.config.fileNames.length ?? 0);

function addRow(){
    if(map.value.filter(row => row.key.length == 0).length == 0){
        map.value.unshift(createEmptyJsonRow(fileCount.value));
    }
    setTimeout(() => {
        let emptyInput = (document.querySelector("#table-body input:required:invalid") || document.querySelector("#table-body tr td input")) as HTMLInputElement;
        emptyInput?.focus();
    }, 200);
}
function showRow(row: JsonRow){
    return props.config && (!props.config.tableFilterEmpty || row.value.filter(t => t == null || t.toString().trim().length == 0).length > 0);
}
function deleteRow(row: JsonRow){
    const rowIndex = map.value.findIndex(r => r.key == row.key);
    if(rowIndex != -1){
        map.value.splice(rowIndex, 1);
        // map.value = map.value.filter(t => t.key !== row.key);
        // updateFile(-2); //TODO: check this
    }
}
function refresh(){
    emit('refresh');
    // postMessage({ command: 'refresh' }, '');
}
// function saveChanges(fileIndex:number){
function saveChanges(){
    postMessageToVsCode({
        request: 'updateFile',
        data: {
            config: props.config,
            fileIndex: -2,
            map: map.value
        }
    }, 'save-changes');
}

function updateAllConfigs(){
    postMessageToVsCode({
        request: 'updateConfig',
        data: configs[0],
        // configJsonStr : JSON.stringify(configs),
        // silent: true,
    }, '');
}
function updateSettings(){
    postMessageToVsCode({
        request: 'updateSettings',
        data : settings.value,
    }, '');
}
function goToConfigPage(){
    emit('switchPage');
    // postMessage({ 
    //     command: 'goToConfigPage'
    // }, 'go-to-config-page');
}

function focusInput(e:any){
    e.target.parentNode.parentNode.classList.add("focused");
}
function unfocusInput(e:any){
    e.target.parentNode.parentNode.classList.remove("focused");
}

// const menuData = ref({
//     rowKey: "",
//     fileIndex: -1,
//     style : 'display:none;',
// });
// function hideInputMenu(e:any){
//     if(menuData.value.rowKey){
//         menuData.value.rowKey = "";
//         menuData.value.style = "display:none;";
//     }else if(e){
//         if(e.target.tagName.toUpperCase() == "INPUT" && e.target.disabled){
//             e.target.parentNode.parentNode.querySelector("input")?.focus();
//         }
//     }
// }
// function showInputMenu(e:any, row:JsonRow, fileIndex:number){
//     e.preventDefault();
//     menuData.value = {
//         rowKey: row.key,
//         fileIndex: fileIndex,
//         style: `left: ${e.pageX}px; top: ${e.pageY}px;display:block;`
//     };
// }

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
        <component is="style">
            html,
            body {
                font-size: calc(var(--vscode-font-size, 13px) * {{settings.baseTextSize}}) !important;
            }
        </component>
        <div class="flex items-center mb-2">
            <button @click="addRow" class="btn btn-primary"> Add New Key </button>
            <LoadingButton :loader="loader" loader-target="refresh" @click="refresh()" class="btn btn-primary flex-row gap-1 ml-2" >
                Refresh Table
            </LoadingButton>
            <LoadingButton :loader="loader" loader-target="save-changes" @click="saveChanges()" class="btn btn-primary flex-row gap-1 ml-2" >
                Save Changes
            </LoadingButton>
<!--            <div class="flex items-center py-0 px-2">-->
<!--                <input type="checkbox" id="input-recursive" v-model="config.tableSaveOnChange" @change="updateAllConfigs()">-->
<!--                <label for="input-recursive">Save on Change</label>-->
<!--            </div>-->
            <div class="flex items-center py-0 px-2 text-sm">
                <input type="checkbox" id="input-filter-empty" v-model="config.tableFilterEmpty" @change="updateAllConfigs()">
                <label for="input-filter-empty">Only empty fields</label>
            </div>
            <div class="flex items-center py-1 px-2 text-sm">
                <label for="input-select-size" class="pr-2 whitespace-nowrap">Size: </label>
                <select v-model="settings.baseTextSize" @change="updateSettings()" class="btn btn-light" id="input-select-size">
                    <template v-for="size in ['0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.3', '1.4', '1.5']">
                        <option :value="size" :selected="size == settings.baseTextSize">{{size}}</option>
                    </template>
                </select>
            </div>
            <div class="flex-1"></div>
            <LoadingButton loader-target="go-to-config-page" @click="goToConfigPage()" class="btn btn-primary ml-2">
                Configuration
            </LoadingButton>
        </div>
        <div class="arg-table w-full text-left flex flex-col scrollbar-s flex-1 overflow-y-auto relative text-gray-500 dark:text-gray-400">
<!--            @click="hideInputMenu($event)">-->
            <div class="thead w-full flex sticky left-0 right-0 top-0">
                <div class="th flex-1 p-1">Key</div>
                <template v-for="file in config.fileNames">
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
                                    @keyup.alt="(e) => tryToMoveFocusedBox(e, indexRow, indexCol+1)"
                                    @keyup.ctrl="(e) => saveAllIfCtrlS(e)"
                                    :disabled="row.key.length == 0"
                                    >
<!--                                    @contextmenu="(e) => showInputMenu(e, row, indexCol)"-->
<!--                                    @click="hideInputMenu($event)"-->
                            </div>
                        </template>
                        <div class="td td-actions relative">
                            <DeleteButton @confirm="deleteRow(row)" />
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </Scaffold>
</template>

<style scoped>

    input[type=checkbox]{
        width:15px; height: 15px;
        margin-right: .25rem;
    }
</style>