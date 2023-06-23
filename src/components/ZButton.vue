<script setup>
import { defineComponent } from "vue";
defineComponent({
  name: "ZButton",
});
</script>

<template>
  <button class="btn btn-primary">
    <slot />
  </button>
</template>

<style scoped></style>
