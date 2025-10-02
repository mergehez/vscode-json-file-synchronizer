<script setup lang="ts">
import {reactive, ref} from 'vue'
import {Config, ConfigSearchResult} from "@vscode/Types";
import LoadingButton from "./LoadingButton.vue";
import {currentWorkspacePath, postMessageToVsCode, state, subscribeToVsCodeResponse} from "../helpers";
import * as faker from '../faker'

const props = defineProps<{
    config: Config|null
}>();
const emit = defineEmits(['update:config', 'save']);

const currConfig = reactive((props.config ? JSON.parse(JSON.stringify(props.config)) : {
    directory: currentWorkspacePath.value,
    typeGenPath: currentWorkspacePath.value,
    typeGenName: null,
    fileExts: 'json',
    key: (new Date()).getTime(),
    title: 'new-' + (new Date()).getTime()
} as Config) as Config);
const typeGen = ref(props.config ? props.config.typeGenPath && props.config.typeGenName : false);

const searchResultMessage = ref('');
const searchResults = ref<ConfigSearchResult[]|null>(props.config ? JSON.parse(JSON.stringify(props.config)).fileNames.map((t:string) => ({
    checked: true,
    value: t
})) : null);

subscribeToVsCodeResponse('getFilesInFolder', ({request, data ,message}) => {
    if(request === 'getFilesInFolder'){
        searchResultMessage.value = message;
        searchResults.value = data.map(t => ({
            checked: true,
            value: t
        }));
    }
});
subscribeToVsCodeResponse('updateConfig', ({request, success}) => {
    if(request === 'updateConfig' && success){
        emit('save', currConfig);
    }
});

function requestFilePaths() {
    if(state.fake){
        faker.triggerSearchResults();
    }else{
        postMessageToVsCode({
            request: 'getFilesInFolder',
            data: currConfig
        }, 'search-for-files');
    }
}
function updateConfig() {
    currConfig.fileNames = searchResults.value!.filter(t => t.checked).map(t => t.value);

    setTimeout(() => {
        postMessageToVsCode({
            request: 'updateConfig',
            data: currConfig,
        }, 'btn-save-config');
    }, 500);
}

const fileSelectorValue = ref<any>(null);
function onPathSelectorValueChange(event: any) {
    fileSelectorValue.value = event.target.value;
}
</script>

<template>
    <div class="text-center text-2xl mb-2"> Create/Edit Config </div>
    <div class="py-3 px-1 flex gap-3" style="width: min(800px, 80dvw)">
        <form class="w-7/12" @submit.prevent="requestFilePaths()">
            <input id="file-selector" type="file" @change="onPathSelectorValueChange" webkitdirectory directory
                   :multiple="false" style="display:none" />
            <div class="mb-3">
                <label for="input-name" class="leading-tight px-1 text-sm">Project title</label>
                <input type="text" class="form-control" id="input-name" :required="true" v-model="currConfig.title">
            </div>
            <div class="mb-3">
                <label for="input-folder" class="leading-tight px-1 text-sm">Directory to search in (absolute path)</label>
                <input type="text" class="form-control" id="input-folder" :required="true" v-model="currConfig.directory" placeholder="e.g. c:/path/to/project/localization">
            </div>
            <div class="mb-3">
                <label for="input-regex-filter" class="leading-tight px-1 text-sm">Regex filter</label>
                <input type="text" class="form-control" id="input-regex-filter" v-model="currConfig.regexFilter" placeholder="e.g. ^assets/(.*)/[A-z]{2}.json">
            </div>
            <div class="mb-4">
                <label for="input-fileExts" class="leading-tight px-1 text-sm">File extensions</label>
                <input type="text" class="form-control" id="input-fileExts" :required="true" v-model="currConfig.fileExts" placeholder="e.g. json (comma separated)">
            </div>
            <div class="flex mb-6 gap-2 pl-1 items-center">
                <input type="checkbox" style="width:20px;height:20px;" class="form-check-input" id="input-recursive" v-model="currConfig.recursive">
                <label for="input-recursive" class="leading-tight px-1 text-sm flex-1">Search recursively</label>
            </div>
            <div class="text-center">
                <LoadingButton loader-target="search-for-files" type="submit" class="btn btn-primary w-full !flex-row" >
                    Search for files
                </LoadingButton>
            </div>
        </form>
        <div class="w-5/12 border-l border-gray-400 dark:border-gray-500 pl-3">
            <div v-if="searchResults === null" class="h-full flex items-center justify-center">
                <span class="alert alert-info text-xs mt-2"> Results will come here...</span>
            </div>
            <div v-else-if="searchResults.length > 0">
                <div class="font-bold">Search Result</div>
                <div class="form-text text-sm mb-2">Please uncheck files you don't want to include</div>
                <div>
                    <button class="btn btn-secondary rounded-sm text-xs text-decoration-none py-0.5" @click="searchResults.forEach(t => t.checked = false)">Uncheck All</button>
                    <button class="btn btn-secondary rounded-sm text-xs text-decoration-none py-0.5 ml-2" @click="searchResults.forEach(t => t.checked = true)">Check All</button>
                </div>
                <div class="mt-1 border border-gray-300 dark:border-gray-600 flex flex-col divide-y divide-gray-300 dark:divide-gray-600 text-sm overflow-y-auto scrollbar-thin" style="max-height: 225px">
                    <template v-for="(x,index) in searchResults">
                        <div class="flex flex-row items-center pointer p-1 px-3 hover:opacity-80">
                            <input type="checkbox" :id="'filepath-'+index" v-model="x.checked" class="form-check-input mr-1" style="width: 20px; height: 20px;">
                            <label class="no-select pl-3 flex-1" :for="'filepath-'+index">{{x.value}}</label>
                        </div>
                    </template>
                </div>
                <div class="border border-gray-300 dark:border-gray-600 py-1.5 px-2 mt-3 flex gap-2 items-center">
                    <label for="input-json-format-option" class="leading-tight px-1 text-sm flex-1">JSON Formatting:</label>
                    <select id="input-json-format-option" v-model="currConfig.jsonFormattingOption" class="form-control w-min py-1.5">
                        <option value="none">Minified</option>
                        <option value="tab">Pretty (tab)</option>
                        <option value="spaces2">Pretty (2 spaces)</option>
                        <option value="spaces4">Pretty (4 spaces)</option>
                        <option value="vscodeFormatter">VS Code Formatter</option>
                    </select>
                </div>
                <div class="border border-gray-300 dark:border-gray-600 p-2 mt-3">
                    <div class="flex gap-2 items-center">
                        <input type="checkbox" style="width:20px;height:20px;" class="form-check-input" id="input-type-gen"
                               v-model="typeGen"
                        >
                        <label for="input-type-gen" class="leading-tight px-1 text-sm flex-1">Generate TS type for keys</label>
                    </div>
                    <div v-if="typeGen" class="mt-2">
                        <label for="input-type-gen-path" class="leading-tight px-1 text-sm">Absolute Path</label>
                        <input type="text" class="form-control" id="input-type-gen-path" :required="true" v-model="currConfig.typeGenPath" placeholder="e.g. c:/path/to/project/types/tr_keys.ts">
                    </div>
                    <div v-if="typeGen" class="mt-2">
                        <label for="input-type-gen-name" class="leading-tight px-1 text-sm">Type Name</label>
                        <input type="text" class="form-control" id="input-types-name" :required="true" v-model="currConfig.typeGenName" placeholder="e.g. TrKey">
                    </div>
                </div>
                <LoadingButton loader-target="btn-save-config" @click.prevent="updateConfig()" class="btn btn-success mt-3 px-5 w-full !flex-row" >
                    Save
                </LoadingButton>
            </div>
            <div v-else class="h-full flex items-center justify-center">
                <span class="alert alert-danger text-xs mt-2 max-w-full break-all"> {{ searchResultMessage || 'no files' }}</span>
            </div>
        </div>
    </div>
</template>