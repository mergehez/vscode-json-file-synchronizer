<script setup lang="ts">

import {ref} from "vue";

const emit = defineEmits(['confirm'])
const showConfirm = ref(false);
function ask(){
    showConfirm.value = true;
    setTimeout(() => showConfirm.value = false, 2000);
}
function confirm(){
    showConfirm.value = false;
    emit('confirm');
}
</script>

<template>
        <slot :ask="ask">
            <div title="delete" class="btn btn-danger justify-between py-0 px-1 rounded relative" @click="ask">
                <i class="ic ic-delete"></i>
            </div>
        </slot>
        <button v-if="showConfirm" class="absolute right-0 top-0 z-50 btn btn-danger py-0" @click.prevent.stop="confirm">
            <span>Confirm</span>
        </button>
</template>