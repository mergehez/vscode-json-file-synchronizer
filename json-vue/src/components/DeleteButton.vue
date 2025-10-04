<script setup lang="ts">

import {ref} from "vue";

defineProps<{
    py?: 0 | 0.5 | 1
}>()

const emit = defineEmits(['confirm'])
const showConfirm = ref(false);

function ask() {
    showConfirm.value = true;
    setTimeout(() => showConfirm.value = false, 2000);
}

function confirm() {
    showConfirm.value = false;
    emit('confirm');
}
</script>

<template>
    <slot :ask="ask">
        <div
            title="delete"
            class="btn btn-danger justify-between px-1 rounded-sm relative"
            :class="py == 0.5 ? 'py-0.5' : py == 1 ? 'py-1' : 'py-0'"
            @click="ask"
        >
            <i class="icon icon-[mingcute--delete-2-line] text-lg "></i>
        </div>
    </slot>
    <button v-if="showConfirm" class="absolute right-0 top-0 z-50 btn btn-danger py-0" @click.prevent.stop="confirm">
        <span>Confirm</span>
    </button>
</template>