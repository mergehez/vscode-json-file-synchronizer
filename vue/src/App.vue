<script setup lang="ts">
import ArgJsonTable from './components/ArgJsonTable.vue';
import {onMounted, ref} from 'vue';
import {currentWorkspacePath, listenToVsCode, postMessageToVsCode, settings, subscribeToVsCodeResponse} from './helpers';
import ArgConfigSelector from "./components/ArgConfigSelector.vue";
import {Config, JsonRow} from "@vscode/Types";
import {triggerFakeEvent} from "./faker";

const loading = ref(false);
const content = ref('');
const contentKey = ref('init-key')

const allConfigs = ref<Config[]>([]);
const translations = ref<JsonRow[]>([]);
console.log('App.vue')

subscribeToVsCodeResponse('getConfigsAndSettings', ({request, data}) => {
    if(request === 'getConfigsAndSettings'){
        allConfigs.value = data.configs;
        settings.value = data.settings;
        currentWorkspacePath.value = data.workspacePath;
        content.value = 'selector';
        if(fake)
            selectedConfig.value = data.configs[0]
    }
});
subscribeToVsCodeResponse('getTranslations', ({request, data}) => {
    if(request === 'getTranslations'){
        translations.value = data;
        loading.value = false;
        content.value = 'jsonTable';
    }
});

function switchPage(){
    content.value = content.value == 'jsonTable' ? 'selector' : 'jsonTable';
}
function refreshPage(){
    loading.value = true;
    setTimeout(() => {
        contentKey.value = new Date().toString();
        loading.value = false;
    }, 500);   
}
const selectedConfig = ref<Config|null>(null);
function selectConfig(c: Config){
    selectedConfig.value = c;
    console.log("config selected", c)
    loading.value = true;
    postMessageToVsCode({ request: 'getTranslations', data: c})
}

let fake = false;
// fake = true;
onMounted(() => {
    listenToVsCode();
    postMessageToVsCode({request: "getConfigsAndSettings"});
    if(fake){
        triggerFakeEvent();
        document.documentElement.classList.add('dark')
    }
})
</script>

<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <button disabled type="button" class="py-2 px-5 mr-2 text-4xl font-medium text-gray-900 bg-white rounded-lg border border-gray-200 ring-0 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 inline-flex items-center">
            <svg class="inline mr-2 w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            Arg Json Synchronizer
        </button>
    </div>
    <template v-else>
        <ArgJsonTable v-if="content=='jsonTable'"  :key="contentKey" @switchPage="switchPage()" @refresh="refreshPage()"
                      :config="selectedConfig!" :translations="translations" />
        <ArgConfigSelector v-else-if="content === 'selector'"  @selected="selectConfig"
            :configs="allConfigs"/>
    </template>
</template>
