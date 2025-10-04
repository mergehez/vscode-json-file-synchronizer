<script setup lang="ts">
import {reactive, ref} from 'vue'
import {Config, createEmptyJsonRow, JsonRow} from '../../../vscode/src/Types';
import {loader, postMessageToVsCode, settings, state} from '../helpers'
import LoadingButton from './LoadingButton.vue';
import Scaffold from './Scaffold.vue';
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import DeleteButton from "./DeleteButton.vue";
import CenteredModal from "./CenteredModal.vue";

const props = defineProps<{
    config: Config,
    translations: JsonRow[]
}>();
const emit = defineEmits(['switchPage', 'refresh']);

console.log(props.config)
state.fileCount = props.config.fileNames.length;

const map = ref(props.translations);
const visibleMap = ref([...map.value]);
const configs = reactive<Array<Config>>([]);

function addRow() {
    let alreadyEmptyId = map.value.findIndex(row => row.key.length == 0);
    if (alreadyEmptyId >= 0) {
        console.log(alreadyEmptyId)
        let alreadyEmpty = map.value[alreadyEmptyId];
        map.value.splice(alreadyEmptyId, 1);
        map.value.unshift(alreadyEmpty)
    } else {
        const c = createEmptyJsonRow(state.fileCount);
        console.log(c)
        map.value.unshift(c);
    }
    filterData(true);
    setTimeout(() => {
        let emptyInput = (document.querySelector(".arg-table input:required:invalid") || document.querySelector(".arg-table tr td input")) as HTMLInputElement;
        console.log(emptyInput)
        emptyInput?.focus();
    }, 200);
}

function deleteRow(row: JsonRow) {
    const rowIndex = map.value.findIndex(r => r.key == row.key);
    if (rowIndex != -1) {
        map.value.splice(rowIndex, 1);
        filterData(true);
        // map.value = map.value.filter(t => t.key !== row.key);
        // updateFile(-2); //TODO: check this
    }
}

function refresh() {
    emit('refresh');
    // postMessage({ command: 'refresh' }, '');
}

// function saveChanges(fileIndex:number){
function saveChanges() {
    postMessageToVsCode({
        request: 'updateFile',
        data: {
            config: props.config,
            fileIndex: -2,
            map: map.value
        }
    }, 'save-changes');
}

function updateAllConfigs() {
    postMessageToVsCode({
        request: 'updateConfig',
        data: configs[0],
        // configJsonStr : JSON.stringify(configs),
        // silent: true,
    }, '');
}

function updateSettings() {
    postMessageToVsCode({
        request: 'updateSettings',
        data: settings.value,
    }, '');
}

function goToConfigPage() {
    emit('switchPage');
    // postMessage({ 
    //     command: 'goToConfigPage'
    // }, 'go-to-config-page');
}

const filter = reactive({
    query: '',
    emptyOnly: false,
});
let lastFilter = '';

function filterData(force = false) {
    if (filter.query.trim().length == 0) {
        filter.query = '';
    }
    const q = filter.query.toLowerCase();
    if (filter.emptyOnly) {
        if (q.trim()) {
            if (!force && lastFilter == '_empty_' + q) {
                return;
            }
            visibleMap.value = [...map.value.filter(row => {
                return row.key.trim().length == 0 || (!row.isObject && row.key.toLowerCase().includes(q.toLowerCase()) && row.value.some((v: string) => v.length == 0));
            })];
            lastFilter = '_empty_' + q;
        } else {
            if (!force && lastFilter == '_empty_') {
                return;
            }
            visibleMap.value = [...map.value.filter(row => {
                return row.key.trim().length == 0 || (!row.isObject && row.value.some((v: string) => v.length == 0));
            })];
            lastFilter = '_empty_';
        }
    } else {
        if (q.trim()) {
            if (!force && lastFilter == q) {
                return;
            }
            visibleMap.value = [...map.value.filter(row => {
                return row.key.trim().length == 0 || (!row.isObject && row.key.toLowerCase().includes(q.toLowerCase()));
            })];
            lastFilter = q;
        } else {
            if (!force && lastFilter == '') {
                return;
            }
            visibleMap.value = [...map.value];
            lastFilter = '';
        }
    }
}


function focusInput(e: any) {
    e.target.parentNode.parentNode.classList.add("focused");
}

function unfocusInput(e: any) {
    e.target.value = e.target.value.trim();
    e.target.parentNode.parentNode.classList.remove("focused");
}

function onKeyUp(e: KeyboardEvent, colIndex: number) {
    console.log(e)
    if (!e.altKey) {
        return;
    }
    const change = e.key == 'ArrowDown' ? 1 : (e.key == 'ArrowUp' ? -1 : 0);
    if (change) {
        const tr = (e.target as HTMLInputElement).closest('tr') as HTMLTableRowElement;
        const rowIndex = tr.rowIndex;
        const totalCount = document.querySelectorAll('.arg-table tr').length;
        const newIndex = (rowIndex + change + totalCount) % totalCount;
        const input = document.querySelector(`.arg-table tr:nth-child(${newIndex}) td:nth-child(${colIndex + 1}) input`) as HTMLInputElement;
        input?.focus();
    }

    if (e.ctrlKey && e.code == 'KeyN') {
        addRow();
    }
}

const enableExpand = ref(true);
const toExpand = reactive({
    row: null as JsonRow | null,
    index: 0,
    list: true,
});

function expand(row: JsonRow, index: any) {
    toExpand.index = index;
    toExpand.row = row;
}
</script>


<template>
    <Scaffold>
        <component is="style">
            html,
            body {
            font-size: calc(var(--vscode-font-size, 13px) * {{ settings.baseTextSize }}) !important;
            }
        </component>
        <div class="flex items-center mb-2">
            <button @click="addRow" class="btn btn-primary inline-flex flex-row gap-2 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 12 12">
                    <path fill="currentColor" d="M6.5 1.75a.75.75 0 0 0-1.5 0V5H1.75a.75.75 0 0 0 0 1.5H5v3.25a.75.75 0 0 0 1.5 0V6.5h3.25a.75.75 0 0 0 0-1.5H6.5z"/>
                </svg>
                Add
            </button>
            <LoadingButton :loader="loader" loader-target="save-changes" @click="saveChanges()" class="btn btn-primary flex-row gap-1 ml-2">
                Save Changes
            </LoadingButton>
            <!--            <div class="flex items-center py-0 px-2">-->
            <!--                <input type="checkbox" id="input-recursive" v-model="config.tableSaveOnChange" @change="updateAllConfigs()">-->
            <!--                <label for="input-recursive">Save on Change</label>-->
            <!--            </div>-->
            <div class="flex items-center py-0 px-2 text-sm ml-3">
                <input type="checkbox" id="input-filter-empty" v-model="config.tableFilterEmpty" @change="(v: any) => {filter.emptyOnly = v.target.checked; filterData(); updateAllConfigs()}">
                <label for="input-filter-empty">Only missing</label>
            </div>
            <div class="flex items-center py-0 px-2 text-sm ml-3" title="if enabled, you will see a button to open a larger editor for the row when you hover over a cell">
                <input type="checkbox" id="input-filter-expand" v-model="enableExpand">
                <label for="input-filter-expand">Enable Expand</label>
            </div>
            <div class="flex items-center py-1 px-2 text-sm ml-2">
                <label for="input-select-size" class="pr-2 whitespace-nowrap">Size: </label>
                <select v-model="settings.baseTextSize" @change="updateSettings()" class="btn btn-light" id="input-select-size">
                    <template v-for="size in ['0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.3', '1.4', '1.5']">
                        <option :value="size" :selected="size == settings.baseTextSize">{{ size }}</option>
                    </template>
                </select>
            </div>
            <div class="relative h-5/6 flex items-center ml-2" style="width: 180px;">
                <InputText :model-value="filter.query"
                           @update:model-value="(v: string) => {filter.query = v; filterData();}"
                           name="search"
                           class="absolute inset-0 h-full rounded py-1 px-2 border border-gray-300 dark:border-gray-600 bg-transparent"
                           placeholder="search key"/>
                <button v-if="filter.query" class="absolute right-1 cursor-pointer px-2 z-10 opacity-70" @click="filter.query = ''; filterData();">x</button>
            </div>
            <div class="flex-1"></div>
            <button :loader="loader" loader-target="refresh" @click="refresh()" class="btn btn-primary flex-row h-5/6 py-0 px-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1536 1536">
                    <path fill="currentColor"
                          d="M1511 928q0 5-1 7q-64 268-268 434.5T764 1536q-146 0-282.5-55T238 1324l-129 129q-19 19-45 19t-45-19t-19-45V960q0-26 19-45t45-19h448q26 0 45 19t19 45t-19 45l-137 137q71 66 161 102t187 36q134 0 250-65t186-179q11-17 53-117q8-23 30-23h192q13 0 22.5 9.5t9.5 22.5m25-800v448q0 26-19 45t-45 19h-448q-26 0-45-19t-19-45t19-45l138-138Q969 256 768 256q-134 0-250 65T332 500q-11 17-53 117q-8 23-30 23H50q-13 0-22.5-9.5T18 608v-7q65-268 270-434.5T768 0q146 0 284 55.5T1297 212l130-129q19-19 45-19t45 19t19 45"/>
                </svg>
            </button>
            <LoadingButton loader-target="go-to-config-page" @click="goToConfigPage()" class="btn btn-primary ml-2">
                Configuration
            </LoadingButton>
        </div>
        <DataTable :value="visibleMap" data-key="id"
                   class="arg-table"
                   :class="enableExpand ? 'expandable' : ''"
                   size="small"
                   :pt="{ table: { style: 'min-width: 50rem' } }"
                   scrollable showGridlines
                   scrollHeight="flex"
                   :virtualScrollerOptions="{ itemSize: 25 * Number(settings.baseTextSize) }"
        >
            <Column field="key" header="Key">
                <template #body="{ data, field }">
                    <input
                        v-model="data[field]"
                        required
                        name="key"
                        :readonly="data[field].isObject"
                        :title="data[field].isObject ? 'this currently cannot be edited. Because it is an object..':''"
                        @focus="focusInput"
                        @blur="unfocusInput"
                    />
                </template>
            </Column>

            <Column v-for="num of state.fileCount" :key="num" field="value" :header="config.fileNames[num-1]" class="relative"> <!-- style="width: 25%"-->
                <template #body="{ data, field }">
                    <input
                        v-model="data[field][num-1]"
                        :required="!data[field].isObject"
                        :readonly="data[field].isObject"
                        :style="data[field].isObject ? 'cursor:not-allowed;':''"
                        :title="data[field].isObject ? 'this currently cannot be edited. Because it is an object..':''"
                        :disabled="data.key.length == 0"
                        @keyup="(e) => onKeyUp(e, num)"
                        @focus="focusInput"
                        name="value"
                        @blur="unfocusInput"/>

                    <button v-if="enableExpand" class="btn btn-secondary p-0.5 ic ic-expand" @click.prevent.stop="expand(data, num)">
                        <!--<i class="ic ic-expand"></i>-->
                    </button>
                </template>
            </Column>
            <Column field="key" style="width:45px;">
                <template #body="{ data }">
                    <div class="relative text-center">
                        <DeleteButton @confirm="deleteRow(data)"/>
                    </div>
                </template>
            </Column>
            <template #footer>
                <CenteredModal
                    :show="!!toExpand.row"
                    @update:show="toExpand.row = null"
                    content-class="py-10 px-8"
                    close-button>
                    <div v-if="toExpand.row" class="flex flex-col gap-2">
                        <div class="font-bold text-2xl">{{ toExpand.row.key }}</div>
                        <div class="flex mt-3 w-full">
                            <template v-if="!toExpand.list">
                                <button
                                    v-for="num of state.fileCount" :key="num"
                                    class="btn rounded-none mr-2"
                                    :class="num == toExpand.index ? 'btn-success' : 'btn-secondary'"
                                    @click.prevent.stop="toExpand.index = num">
                                    <span>{{ config.fileNames[num - 1] }}</span>
                                </button>
                            </template>
                            <button
                                class="btn rounded-none ml-auto"
                                :class="toExpand.list ? 'btn-success' : 'btn-secondary'"
                                @click.prevent.stop="toExpand.list = true">
                                <span>List</span>
                            </button>
                            <button
                                class="btn rounded-none"
                                :class="!toExpand.list ? 'btn-success' : 'btn-secondary'"
                                @click.prevent.stop="toExpand.list = false">
                                <span>Tab</span>
                            </button>
                        </div>

                        <div v-if="toExpand.list"
                             class="grid gap-2"
                             style="grid-template-columns: auto 1fr;">
                            <template v-for="num of state.fileCount" :key="num">
                                <span class="font-bold pr-2">{{ config.fileNames[num - 1] }}</span>
                                <textarea
                                    v-model="toExpand.row!.value[num-1] as string"
                                    rows="2"
                                    class="border border-gray-300 dark:border-gray-600 p-2.5 bg-transparent flex-1"
                                    style="width: min(90vw, 600px);"
                                ></textarea>
                            </template>
                        </div>
                        <textarea
                            v-else
                            v-model="toExpand.row!.value[toExpand.index-1] as string"
                            rows="20"
                            class="border border-gray-300 dark:border-gray-600 p-2.5 bg-transparent"
                            style="width: min(90vw, 600px);"
                        ></textarea>
                    </div>
                </CenteredModal>
            </template>
        </DataTable>


    </Scaffold>
</template>

<style scoped>

input[type=checkbox] {
    width: 15px;
    height: 15px;
    margin-right: .25rem;
}
</style>