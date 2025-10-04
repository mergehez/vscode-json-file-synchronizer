<script setup lang="ts">
import { message } from '../helpers'

</script>
<template>
    <div class="w-full h-full p-2 flex flex-col grow overflow-y-auto dark:bg-neutral-800 text-gray-900 dark:text-white">
        <h1 class="pb-3 text-center text-3xl w-full">Arg JSON File Synchronizer </h1>
        <div class="px-2">
            <div v-show="!message.text" class="alert alert-info italic">messages come here...</div>
            <div v-show="message.text && message.type == 'danger'" class="alert alert-danger" >{{message.text}}</div>
            <div v-show="message.text && message.type == 'success'" class="alert alert-success" >{{message.text}}</div>
        </div>
        <div class="flex grow flex-col px-2 overflow-y-auto">
            <slot></slot>
        </div>
    </div>

</template>