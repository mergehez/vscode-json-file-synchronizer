<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Config, ConfigSearchResult } from '../../../Types';
import LoadingButton from './LoadingButton.vue';
import Scaffold from './Scaffold.vue';
import { loader, postMessage, initAndListenVsCode } from './store'

initAndListenVsCode('initConfigPage', (message) => {
    if (message.request === "initConfigPage") {
        for (const c of message.data.configs) {
            configs.push(c);
        }
        currentWorkspacePath.value = message.data.workspacePath;
    }else if (message.request === "getFilesInFolder") {
        if(!message.success){
            searchResults.value = [];
        }else{
            searchResults.value = message.data.map((t:any) => { return { checked: true, "value": t } as ConfigSearchResult; });
        }
    }
});
const emit = defineEmits(['switchPage']);

const configs = reactive<Array<Config>>([]);
const activeConfig = ref<Config | null>(configs.filter(t => t.active)[0] ?? configs[0]);
const searchResults = ref<Array<ConfigSearchResult>>([]);
const currentWorkspacePath = ref('');

function requestFilePaths() {
    postMessage({
        command: 'getFilesInFolder',
        directory: activeConfig.value?.directory,
        fileExts: activeConfig.value?.fileExts,
        regexFilter: activeConfig.value?.regexFilter,
        recursive: activeConfig.value?.recursive
    }, 'search-for-files');
}
function saveAll() {
    if (activeConfig.value) {
        activeConfig.value.fileNames = searchResults.value.filter(t => t.checked).map(t => t.value);
    }

    setTimeout(() => {
        postMessage({
            command: 'updateAllConfigs',
            configJsonStr: JSON.stringify(configs),
            refresh: true
        }, 'save-all');
    }, 500);
}
function goToTranslations() {
    emit('switchPage');
    // setTimeout(() => {
    //     postMessage({
    //         command: 'refresh',
    //     }, 'finish');
    // }, 500);
}
function changeTab(key: string) {
    activeConfig.value = configs.filter(t => t.key == key)[0] ?? undefined;
    searchResults.value = activeConfig.value?.fileNames?.map(t => { return { checked: true, value: t } }) ?? [];
}
function addNewConfig() {
    const newKey = "New-" + (new Date()).getTime();
    configs.push({
        key: "New-" + (new Date()).getTime(),
        directory: currentWorkspacePath.value,
    } as Config);

    changeTab(newKey);
}
function deleteConf(key: string) {
    configs.splice(configs.findIndex(t => t.key === key), 1);
    if (configs.length == 0) {
        configs.push({
            key: "New-" + (new Date()).getTime(),
        } as Config);
    }

    changeTab(configs[0].key);
}

const fileSelectorValue = ref<any>(null);
function onPathSelectorValueChange(event: any) {
    fileSelectorValue.value = event.target.value;
}
</script>
<template>
    <Scaffold>     
        <div class="card" style="min-width: 300px; max-width: 40%;">
            <div class="card-header"> Project List </div>
            <div class="card-body">
                <ul class="flex flex-col">
                    <template v-for="conf in configs">
                        <div class="btn btn-light flex flex-row items-center pointer py-0 rounded-none" >
                            <span class="flex-1 py-2 px-2" @click="changeTab(conf.key)">
                                {{activeConfig?.key == conf.key ? ">" : ""}} {{conf.key}}
                            </span>
                            <button @click="deleteConf(conf.key)" class="btn btn-danger px-1 my-1"><i class="ic ic-sm ic-delete"></i></button>
                        </div>
                    </template>
                    <div class="text-center mt-2">
                        <button @click="addNewConfig()" class="btn btn-primary w-full">+ Add New</button>
                    </div>
                </ul>

                <div class="px-2 text-center mt-4">
                    <LoadingButton loader-target="finish" @click="goToTranslations()" class="btn btn-primary ml-2" >
                        Go to translation table
                    </LoadingButton>
                </div>
            </div>
        </div>
        <div v-if="activeConfig" class="card flex-1 ml-3">
            <div class="card-header"> Configuration of <b>{{activeConfig.key}}</b> </div>
            <div class="card-body">
                <form @submit.prevent="requestFilePaths()">
                    <input id="fileselector" type="file" @change="onPathSelectorValueChange" webkitdirectory directory
                        multiple="false" style="display:none" />
                    <div class="flex mb-3">
                        <label for="input-key" class="col-auto col-form-label" style="width: 160px;">Project title</label>
                        <div class="flex-1"> 
                            <input type="text" class="form-control" id="input-key" :required="true" v-model="activeConfig.key"> 
                        </div>
                    </div>
                    <!-- <div class="flex mb-3">
                        <label for="input-basepath" class="col-auto col-form-label" style="width: 160px;">Project Base Path</label>
                        <div class="flex-1"> 
                            <input type="text" class="form-control" id="input-basepath" :required="true" v-model="activeConfig.directory"> 
                        </div>
                    </div> -->
                    <div class="flex mb-3">
                        <label for="input-folder" class="col-auto col-form-label" style="width: 160px;">Directory to search in</label>
                        <div class="flex-1">
                            <input type="text" class="form-control" id="input-folder" :required="true" v-model="activeConfig.directory" placeholder="e.g. c:/path/to/project/localization">
                            <div class="form-text">Absolute path where the files are located</div>
                        </div>
                    </div>
                    <div class="flex mb-3">
                        <label for="input-recursive" class="col-auto col-form-label" style="width: 160px;">Search recursively</label>
                        <div class="flex-1"> 
                            <input type="checkbox" style="width:25px;height:25px;" class="form-check-input" id="input-recursive" v-model="activeConfig.recursive"> 
                        </div>
                    </div>
                    <div class="flex mb-3">
                        <label for="input-regex-filter" class="col-auto col-form-label" style="width: 160px;">Regex filter</label>
                        <div class="flex-1"> 
                            <input type="text" class="form-control" id="input-regex-filter" v-model="activeConfig.regexFilter" placeholder="e.g. ^assets/(.*)/[A-z]{2}.json"> 
                        </div>
                    </div>
                    <div class="flex mb-3">
                        <label for="input-fileExts" class="col-auto col-form-label" style="width: 160px;">File extensions</label>
                        <div class="flex-1">
                            <input type="text" class="form-control" id="input-fileExts" :required="true" v-model="activeConfig.fileExts" placeholder="e.g. json">
                            <div class="form-text">Separate extensions by comma</div>
                        </div>
                    </div>

                    <div class="flex mb-3">
                        <label for="input-fileExts" class="col-auto col-form-label" style="width: 160px;"></label>
                        <div class="flex-1">
                            <LoadingButton loader-target="search-for-files" type="submit" class="btn btn-primary px-4" >
                                Search for files
                            </LoadingButton>
                            <!-- <div class="border p-1 bg-red-400" v-show="error" v-html="error"></div> -->
                        </div>
                    </div>
                </form>
                


                <template v-if="searchResults.length > 0">
                    <div>
                        <hr class="my-4" />
                        <div class="card">
                            <div class="card-header">Search Result</div>
                            <div class="card-body">
                                <div class="form-text mb-2">Please uncheck files you don't want to include</div> 
                                <div>
                                    <button class="btn btn-light text-decoration-none py-1" @click="searchResults.forEach(t => t.checked = false)">Uncheck All</button>
                                    <button class="btn btn-light text-decoration-none py-1 ml-2" @click="searchResults.forEach(t => t.checked = true)">Check All</button>
                                </div>
                                <div class="list-group mt-2">
                                    <template v-for="(x,index) in searchResults">
                                        <div class="btn btn-light flex flex-row items-center pointer py-1 rounded-none border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" :id="'filepath-'+index" v-model="x.checked" class="form-check-input mr-1" style="width: 20px; height: 20px;">
                                            <label class="noselect pl-3 flex-1" :for="'filepath-'+index">{{x.value}}</label>
                                        </div>
                                    </template>
                                </div>
                                <LoadingButton loader-target="save-all" @click.prevent="saveAll()" class="btn btn-success mt-3 px-5" >
                                    Save
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div v-if="!activeConfig" class="flex-1 px-2 py-1">
            <div class="w-full alert alert-danger">
                Please select or create a new project to start using the extension...
            </div>
        </div>

    </Scaffold>
</template>

<style scoped>
input[type=checkbox] {
    width: 20px;
    height: 20px;
    margin-right: .25rem;
}
</style>