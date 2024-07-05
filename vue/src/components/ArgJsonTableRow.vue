<script setup lang="ts">
import { ref } from 'vue'
import {Config, createEmptyJsonRow, JsonRow} from '@vscode/Types';


const props = defineProps<{config: Config, translations: JsonRow[]}>();
function showRow(row: JsonRow){
    return props.config &&
        (row.key.toLowerCase().includes(q.value.toLowerCase())) &&
        (!props.config.tableFilterEmpty || row.value.filter(t => t == null || t.toString().trim().length == 0).length > 0);
}
</script>

<template>

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
        </div>
    </template>
    <div class="td td-actions relative">
        <DeleteButton @confirm="deleteRow(row)" />
    </div>
</div>    

</template>