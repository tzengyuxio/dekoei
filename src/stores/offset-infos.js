import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useOffsetInfosStore = defineStore("offset-infos", () => {
  // OffsetInfo {
  //   type: string;
  //   offset: number;
  //   size: number;
  //   count: number;
  //   options: object;
  // }
  const fileBytes = ref(new Uint8Array(0));
  const offsetInfos = ref([]);

  const totalSize = computed(() =>
    offsetInfos.value.reduce((sum, offsetInfo) => sum + offsetInfo.size * offsetInfo.count, 0)
  );

  function setFileBytes(fileBytes) {
    this.fileBytes = fileBytes;
  }

  function clear() {
    offsetInfos.value = [];
  }

  function append(offsetInfo) {
    offsetInfos.value.push(offsetInfo);
  }

  function insert(index, offsetInfo) {
    offsetInfos.value.splice(index, 0, offsetInfo);
  }

  function remove(index) {
    offsetInfos.value.splice(index, 1);
  }

  function fill(fullSize) {
    if (totalSize.value < fullSize) {
      append({
        type: "fill",
        offset: totalSize,
        size: fullSize - totalSize.value,
        count: 1,
      });
    }
  }

  return { fileBytes, setFileBytes, offsetInfos, clear, append, insert, remove, fill };
});
