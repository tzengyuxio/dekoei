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
  const offsetInfos = ref([]);

  const totalSize = computed(() =>
    offsetInfos.value.reduce((sum, offsetInfo) => sum + offsetInfo.size * offsetInfo.count, 0)
  );

  function clear() {
    offsetInfos.value = [];
  }

  function append(offsetInfo) {
    offsetInfos.value.push(offsetInfo);
  }

  function insert(index, offsetInfo) {
    offsetInfos.value.splice(index, 0, offsetInfo);
  }

  function update(index, offsetInfo) {
    console.log(offsetInfo);
    offsetInfos.value[index] = offsetInfo;
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

  return {
    halfHeight,
    offsetInfos,
    clear,
    append,
    insert,
    update,
    remove,
    fill,
  };
});
