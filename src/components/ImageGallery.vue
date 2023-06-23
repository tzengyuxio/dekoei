<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import palettes from "@/data/palettes";
import { useOffsetInfosStore } from "@/stores/offset-infos";
import { useColorPresetStore } from "@/stores/color-preset";
import { colorIndexesToImage, hexToRGB, unpackGrp, unpackKao, unpackNpk } from "@/utils/unpack";

const gallery = ref(null);
const offsetInfosStore = useOffsetInfosStore();
const selectedOption = useColorPresetStore();
const colors = computed(() => palettes[selectedOption.preset].codes);

const { fileBytes, offsetInfos } = storeToRefs(offsetInfosStore);

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
  gallery.value.innerHTML = "";
  const unpackers = { kao: unpackKao, npk: unpackNpk, grp: unpackGrp };
  const offsetInfos = offsetInfosStore.offsetInfos;
  const rgbColors = colors.value.map(hexToRGB);

  offsetInfos.forEach((offsetInfo) => {
    const unpacker = unpackers[offsetInfo.type];
    if (unpacker === null) {
      console.log("guess type: ", offsetInfo.type);
      return;
    }
    for (let i = 0; i < offsetInfo.count; i++) {
      const startPos = offsetInfo.offset + i * offsetInfo.size;
      const endPos = startPos + offsetInfo.size;
      const data = offsetInfosStore.fileBytes.slice(startPos, endPos);
      const [colorIndexes, , w, h] = unpacker(data, 64, 80);
      const imageData = colorIndexesToImage(colorIndexes, w, h, rgbColors);
      createCanvas(imageData, w, h);
    }
  });
}

watch([fileBytes, offsetInfos], updateGallery);
</script>

<template>
  <div class="flex flex-grow flex-wrap border place-content-start" ref="gallery"></div>
</template>

<style scoped></style>
