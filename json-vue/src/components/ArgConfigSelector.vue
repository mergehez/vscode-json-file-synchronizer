<script setup lang="ts">
import {ref} from 'vue'
import {Config} from '@vscode/Types';
import CenteredModal from "./CenteredModal.vue";
import ConfigEdit from "./ConfigEdit.vue";
import DeleteButton from "./DeleteButton.vue";

const props = defineProps<{
    configs: Config[],
    onSelect: (c: Config) => void,
    onDelete: (c: Config) => void,
}>();

const currConfigs = ref(props.configs);

function deleteConfig(c: Config) {
    props.onDelete(c)
    currConfigs.value = currConfigs.value.filter(t => t.key != c.key);
}

const configToEdit = ref<Config | null>(null);

function editConfig(c: Config | null) {
    configToEdit.value = c;
    showCreateModal.value = true;
}

const showCreateModal = ref(false);

function onConfigSaved(c: Config) {
    const i = currConfigs.value.findIndex(t => t.key == c.key);
    if (i >= 0) {
        currConfigs.value[i] = c;
    } else {
        currConfigs.value.push(c)
    }

    showCreateModal.value = false;
}
</script>
<template>
    <div class="w-full h-full flex flex-col items-center justify-center">
        <div class="flex flex-col items-stretch text-center" style="max-width: min(75dvw, 380px); min-width: min(25%, 480px)">
            <h1 class="text-3xl mb-1">Arg Json File Synchronizer</h1>
            <h2 class="mb-3 w-full">Please select a config or create a new one...</h2>
            <div class="w-full flex flex-col items-stretch overflow-y-auto" style="max-height: 60dvh">
                <div v-for="c of currConfigs" class="relative flex mb-1"
                     @click.stop.prevent="onSelect(c)">
                    <button class="bg-green-500 w-full btn rounded-sm btn-secondary border-none">
                        <span class="text-lg">{{ c.title || c.key }}</span>
                        <i class="text-xs text-gray-500 dark:text-gray-400 inline-block truncate w-full px-6">({{ c.directory }})</i>
                    </button>
                    <div class="absolute right-0 pr-1 flex h-full justify-center items-center gap-2 z-10">
                        <i class="ic ic-edit ic-lg hover:text-yellow-700 text-yellow-400 cursor-pointer" @click.stop.prevent="editConfig(c)"></i>
                        <div class="inline-flex p-0 relative">
                            <DeleteButton @confirm="deleteConfig(c)">
                                <template #default="{ask}">
                                    <i class="ic ic-delete ic-lg hover:text-red-700 text-red-400 cursor-pointer" @click.stop.prevent="ask"></i>
                                </template>
                            </DeleteButton>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!currConfigs.length" class="alert alert-danger text-sm">No config found! <br> Please click the button below to start using the extension</div>
            <button class="btn btn-primary mt-2" @click="editConfig(null)">
                + New Config
            </button>
        </div>
    </div>
    <CenteredModal v-model:show="showCreateModal" content-class="p-5" close-button>
        <ConfigEdit v-if="showCreateModal" :config="configToEdit" @save="onConfigSaved"/>
    </CenteredModal>
</template>