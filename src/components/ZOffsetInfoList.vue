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
</script>

<template>
  <div class="mt-4 border" ref="container">
    <template v-for="(offsetInfo, index) in offsetInfos" :key="index">
      <z-offset-info-card
        :index="index"
        :format="offsetInfo.format"
        :offset="offsetInfo.offset"
        :size="offsetInfo.size"
        :count="offsetInfo.count"
      />
    </template>
  </div>
</template>

<style scoped></style>
