<script setup>
import { defineComponent, ref } from "vue";
import { storeToRefs } from "pinia";
import ZOffsetInfoCard from "@/components/ZOffsetInfoCard.vue";
import { useOffsetInfosStore } from "@/stores/offset-infos";

defineComponent({
  name: "ZOffsetInfoList",
});

const container = ref(null);
const offsetInfosStore = useOffsetInfosStore();
const { offsetInfos } = storeToRefs(offsetInfosStore);

function cardTitle(index) {
  const offsetInfo = offsetInfos.value[index];
  const hex1 = offsetInfo.offset.toString(16).toUpperCase();
  const hex2 = offsetInfo.size.toString(16).toUpperCase();
  return `${offsetInfo.format.toUpperCase()}.${hex1}.${hex2}`;
}
</script>

<template>
  <div class="mt-4 outline-block" ref="container">
    <template v-for="(offsetInfo, index) in offsetInfos" :key="cardTitle(index)">
      <z-offset-info-card
        :index="index"
        :title="cardTitle(index)"
        :format="offsetInfo.format"
        :offset="offsetInfo.offset"
        :size="offsetInfo.size"
        :count="offsetInfo.count"
      />
    </template>
  </div>
</template>

<style scoped></style>
