import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useOffsetInfosStore = defineStore("offset-infos", () => {
  // OffsetInfo {
  //   format: string;
  //   offset: number;
  //   size: number;
  //   count: number;
  //   options: object;
  // }
  const halfHeight = ref(false);
  const fileBytes = ref(new Uint8Array(0));
  const offsetInfos = ref([]);

  const totalSize = computed(() =>
    offsetInfos.value.reduce((sum, offsetInfo) => sum + offsetInfo.size * offsetInfo.count, 0)
  );

  function setHalfHeight(halfHeight) {
    this.halfHeight = halfHeight;
  }

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
        format: "skip",
        offset: totalSize,
        size: fullSize - totalSize.value,
        count: 1,
      });
    }
  }

  return { halfHeight, setHalfHeight, fileBytes, setFileBytes, offsetInfos, clear, append, insert, remove, fill };
});
