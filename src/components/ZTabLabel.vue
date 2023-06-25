<script setup></script>

<template>
  <div class="tab-label"><slot /></div>
</template>

<style scoped>
.tab-label {
  position: absolute;
  top: -25px;
  left: 12px;
  background-color: white;
  padding: 2px 7px 2px 7px;
  border: 1px solid black;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  font-size: small;
  color: #444;
}
</style>
