<script setup lang="ts">
// import {Config, JsonRow} from '@vscode/Types';
// import DeleteButton from "./DeleteButton.vue";
// import {state} from "../helpers";
// import {reactive, ref} from "vue";
//
// const props = defineProps<{
//     config: Config,
//     row: JsonRow,
//     indexRow: number,
// }>();
//
// const emit = defineEmits(['delete', 'save']);
// const data = reactive({
//     id: props.row.id,
//     key: props.row.key,
//     value: props.row.value.map(v => typeof v == 'object' ? '[object]' : ''+v),
//     isObject: props.row.isObject
// });
//
// function showRow(row: JsonRow){
//     return props.config &&
//         (!state.query || row.key.toLowerCase().includes(state.query.toLowerCase()))
//         // &&
//         // (!props.config.tableFilterEmpty || row.hasEmptyCol);
// }
//
// function focusInput(e:any){
//     e.target.parentNode.parentNode.classList.add("focused");
// }
// function unfocusInput(e:any){
//     e.target.value = e.target.value.trim();
//     console.log(e.target.value)
//     e.target.parentNode.parentNode.classList.remove("focused");
// }
// function tryToMoveFocusedBox(e:KeyboardEvent, indexRow:number, indexCol:number){
//     e.preventDefault();
//     const key = e.key;
//
//     const tableBody = document.querySelector('.tbody') as HTMLElement;
//     const rowCount = tableBody.children.length;
//     const colCount = state.fileCount+1;
//
//     const moveY = (key == "ArrowUp" ? -1 : (key == "ArrowDown" ? 1 : 0)) * (e.shiftKey ? Math.ceil(rowCount/5) : 1);
//     const moveX = (key == "ArrowLeft" ? -1 : (key == "ArrowRight" ? 1 : 0)) * (e.shiftKey ? 2 : 1);
//     const newRow = (indexRow + moveY + rowCount) % rowCount + 1;
//     const newCol = (indexCol + moveX + colCount) % colCount + 1;
//     (tableBody.querySelector(`.tr:nth-child(${newRow}) .td:nth-child(${newCol}) > *`) as HTMLInputElement)?.focus();
// }
//
// function saveAllIfCtrlS(e:KeyboardEvent){
//     e.preventDefault();
//     if(e.key == 's'){
//         emit('save');
//     }else console.log(e.key)
// }
</script>

<template>

<!--<div v-if="showRow(row)" class="tr border-b dark:border-gray-700 flex">-->
<!--<div class="tr border-b dark:border-gray-700 flex">-->
<!--    <div class="td flex-1">-->
<!--        <input type="text"-->
<!--               v-model="data.key"-->
<!--               class="fw-bold"-->
<!--               :required="true"-->
<!--               @focus="focusInput"-->
<!--               @blur="unfocusInput"-->
<!--               data-index="-2"-->
<!--                @keyup.alt="(e) => tryToMoveFocusedBox(e, indexRow, 0)" @keyup.ctrl="(e) => saveAllIfCtrlS(e)">-->
<!--    </div>-->
<!--    <template v-for="num in state.fileCount" :key="num">-->
<!--        <div class="td flex-1">-->
<!--            <input-->
<!--                type="text"-->
<!--                :required="!data.isObject"-->
<!--                :readonly="data.isObject"-->
<!--                :style="data.isObject ? 'cursor:not-allowed;':''"-->
<!--                :title="data.isObject ? 'this currently cannot be edited. Because it is an object..':''"-->
<!--                :data-index="num-1"-->
<!--                v-model="data.value[num-1]"-->
<!--                @change="data.value[num-1] = $event.target.value.trim()"-->
<!--                @focus="focusInput"-->
<!--                @blur="unfocusInput"-->
<!--                :disabled="data.key.length == 0"-->
<!--                >-->
<!--&lt;!&ndash;                @keyup.alt="(e) => tryToMoveFocusedBox(e, indexRow, indexCol+1)"&ndash;&gt;-->
<!--&lt;!&ndash;                @keyup.ctrl="(e) => saveAllIfCtrlS(e)"&ndash;&gt;-->
<!--        </div>-->
<!--    </template>-->
<!--    <div class="td td-actions relative">-->
<!--        <DeleteButton @confirm="$emit('delete')" />-->
<!--    </div>-->
<!--</div>    -->

</template>