import { ref } from "vue";
import { defineStore } from "pinia";

export const useColorPresetStore = defineStore("color-preset", () => {
  const preset = ref("defaultDOS");
  function setPreset(newPreset) {
    preset.value = newPreset;
  }

  return { preset, setPreset };
});
