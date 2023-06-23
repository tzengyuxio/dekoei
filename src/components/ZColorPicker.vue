<script setup>
import { defineComponent, defineProps } from "vue";
defineComponent({
  name: "ZColorPicker",
});
defineProps({
  colorCode: {
    type: String,
    default: "#000000",
  },
});
</script>

<template>
  <div class="inline-block m-px lg:tooltip" :data-tip="colorCode">
    <input type="color" class="w-16 h-9 opacity-100" :value="colorCode" disabled />
  </div>
</template>

<style scoped></style>
