<script setup>
import {defineComponent} from 'vue';
defineComponent({
	name: 'ZButton',
});
</script>

<template>
  <button
      class="mx-2 text-blue-700 font-normal py-1 px-2 rounded transition duration-300 ease-in-out focus:outline-none focus:shadow-outline border border-blue-700 hover:bg-blue-700 hover:text-white">
    <slot/>
  </button>
</template>

<style scoped>
</style>
