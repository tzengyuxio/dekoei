<script setup>
import { useOffsetInfosStore } from "@/stores/offset-infos";
import { computed, onMounted, ref, watch } from "vue";
import { colorIndexesToImage, hexToRGB, unpackGrp, unpackKao, unpackNpk } from "@/utils/unpack";
import { useColorPresetStore } from "@/stores/color-preset";
import palettes from "@/data/palettes";
import { storeToRefs } from "pinia";

const gallery = ref(null);
const offsetInfoStore = useOffsetInfosStore();
const selectedOption = useColorPresetStore();
const colors = computed(() => palettes[selectedOption.preset].codes);

const { fileBytes, offsetInfos } = storeToRefs(offsetInfoStore);

onMounted(() => {
  updateGallery();
});

function createCanvas(imageData, w, h) {
  const canvas = document.createElement("canvas");
  canvas.classList = "m-0.5"; // Border: 2px solid gray
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.getContext("2d").putImageData(imageData, 0, 0);
  gallery.value.appendChild(canvas);
}

function updateGallery() {
  const unpackers = { kao: unpackKao, npk: unpackNpk, grp: unpackGrp };
  const offsetInfos = offsetInfoStore.offsetInfos;
  const rgbColors = colors.value.map(hexToRGB);

  offsetInfos.forEach((offsetInfo) => {
    const unpacker = unpackers[offsetInfo.type];
    if (unpacker === null) {
      console.log("guess type: ", offsetInfo.type);
      return;
    }
    console.log("offset info: ", offsetInfo);
    for (let i = 0; i < offsetInfo.count; i++) {
      const startPos = offsetInfo.offset + i * offsetInfo.size;
      const endPos = startPos + offsetInfo.size;
      const data = offsetInfoStore.fileBytes.slice(startPos, endPos);
      const [colorIndexes, , w, h] = unpacker(data, 64, 80);
      const imageData = colorIndexesToImage(colorIndexes, w, h, rgbColors);
      createCanvas(imageData, w, h);
    }
  });
}

watch([fileBytes, offsetInfos], updateGallery);
</script>

<template>
  <div class="flex flex-grow flex-wrap border" ref="gallery"></div>
</template>

<style scoped></style>
