import { ref } from "vue";
import { defineStore } from "pinia";

export const useOffsetInfosStore = defineStore("offset-infos", () => {
  const offsetInfos = ref([]);
  return { offsetInfos };
});
