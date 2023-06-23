<script setup>
import { computed, defineComponent } from "vue";
import palettes from "@/data/palettes";
import ZButton from "@/components/ZButton.vue";
import ZColorPicker from "@/components/ZColorPicker.vue";
import { useColorPresetStore } from "@/stores/color-preset";

defineComponent({
  name: "ZColorPalette",
});

const selectedPreset = useColorPresetStore();
const presets = Object.entries(palettes).map(([key, value]) => ({
  label: value.name,
  value: key,
}));
const colors = computed(() => palettes[selectedPreset.preset].codes);

function handleReset() {
  console.log("handle reset");
}
</script>

<template>
  <div class="m-2 mt-4 border">
    <!--    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-1/3 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"-->
    <select class="select w-full max-w-xs" @change="selectedPreset.setPreset($event.target.value)">
      <option v-for="preset in presets" :key="preset.value" :value="preset.value">
        {{ preset.label }}
      </option>
    </select>
    <z-button @click="handleReset" class="ml-2">Reset</z-button>
    <br />
    <div>
      <template v-for="(color, index) in colors" :key="index">
        <z-color-picker :colorCode="color" />
        <br v-if="(index + 1) % 8 === 0" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
