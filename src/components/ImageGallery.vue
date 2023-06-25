<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import palettes from "@/data/palettes.json";
import { useImageFileStore } from "@/stores/image-file";
import { useOffsetInfosStore } from "@/stores/offset-infos";
import { useColorPresetStore } from "@/stores/color-preset";
import { colorIndexesToImage, hexToRGB, unpackFormats } from "@/utils/unpack";

const gallery = ref(null);
const imageFileStore = useImageFileStore();
const offsetInfosStore = useOffsetInfosStore();
const selectedOption = useColorPresetStore();
const colors = computed(() => palettes[selectedOption.preset].codes);

const { halfHeight, offsetInfos } = storeToRefs(offsetInfosStore);
const { fileBytes } = storeToRefs(imageFileStore);

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
  const rgbColors = colors.value.map(hexToRGB);

  offsetInfosStore.offsetInfos.forEach((offsetInfo) => {
    const unpacker = unpackFormats[offsetInfo.format].method;
    if (typeof unpacker !== "function") {
      console.log("guess format, unpacker: ", offsetInfo.format, unpacker);
      return;
    }
    for (let i = 0; i < offsetInfo.count; i++) {
      const startPos = offsetInfo.offset + i * offsetInfo.size;
      const endPos = startPos + offsetInfo.size;
      const data = imageFileStore.fileBytes.slice(startPos, endPos);
      // console.log("update gallery iterate offset info", i, startPos, endPos, unpacker);
      const [colorIndexes, , w, h, error] = unpacker(data, 64, 80, halfHeight.value);
      if (colorIndexes === null || colorIndexes.length === 0) {
        if (error !== "") {
          console.error("updateGallery format and error: ", offsetInfo.format, error);
        }
        continue;
      }
      try {
        const imageData = colorIndexesToImage(colorIndexes, w, h, rgbColors, halfHeight.value);
        createCanvas(imageData, w, h);
      } catch (e) {
        console.error("updateGallery info, count and error: ", offsetInfo, i, e);
      }
    }
  });
}

watch([halfHeight, fileBytes, offsetInfos, selectedOption], updateGallery, { deep: true });
</script>

<template>
  <div class="flex flex-grow flex-wrap place-content-start outline-block" ref="gallery"></div>
</template>

<style scoped></style>
