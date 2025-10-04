<script setup lang="ts">
import {twMerge} from "tailwind-merge";

defineProps({
    show: {type: Boolean, default: false,},
    targetsRuntime: {type: Boolean, default: false,}, // we will show modal using plain js
    contentClass: {type: String, default: '',},
    contentStyle: {type: String, default: '',},
    closeOnOutside: {type: Boolean, default: false,},
    verticalCenter: {type: Boolean, default: true,},
    closeButton: {type: Boolean, default: false,},
});
defineEmits(['update:show']);
</script>

<template>
    <div class="fixed z-50 inset-0 w-screen h-screen flex justify-center" :class="{'hidden': !show, 'items-center':verticalCenter, 'items-start': !verticalCenter}"
         aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div v-show="targetsRuntime || show"
             class="fixed inset-0  bg-gray-500/75 transition-opacity" @click="() => closeOnOutside ? $emit('update:show', false) : {}"></div>

        <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
        >
            <div v-show="targetsRuntime || show" class="z-10 flex justify-center" :class="{'items-center':verticalCenter, 'items-start': !verticalCenter}">
                <div :class="twMerge('rounded-md ring-1 ring-black/10 py-1 bg-gray-200 dark:bg-gray-700 relative', contentClass)" :style="contentStyle">
                    <button v-if="closeButton" class="absolute top-3 right-3.5" @click="$emit('update:show', false)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"/>
                        </svg>
                    </button>
                    <slot/>
                </div>
            </div>
        </transition>

    </div>
</template>
