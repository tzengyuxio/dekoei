<script setup>
import { unpackGrp, unpackKao, unpackNpk } from "@/utils/unpack";
import { ref } from "vue";
import ZButton from "@/components/ZButton.vue";
import ZColorPalette from "@/components/ZColorPalette.vue";
import { useOffsetInfosStore } from "@/stores/offset-infos";
import ImageGallery from "@/components/ImageGallery.vue";

const selectedFile = ref(new Blob());
const offsetInfoStore = useOffsetInfosStore();

function onFileChange(event) {
  reset();
  selectedFile.value = event.target.files[0];
  if (selectedFile.value) {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        offsetInfoStore.setFileBytes(new Uint8Array(reader.result));
        guessOffsetInfos();
        // drawImages();
      }
    };

    reader.onerror = (error) => {
      console.error("Error on file change", error);
    };

    reader.readAsArrayBuffer(selectedFile.value);
  } else {
    console.error("The selected file isn't a file.");
  }
}

function reset() {
  // gallery.value.innerHTML = "";
  console.log("resetting...");
}

function guessOffsetInfos() {
  let cursor = 0;
  const type = guessType(offsetInfoStore.fileBytes);
  const unpacker = { kao: unpackKao, npk: unpackNpk, grp: unpackGrp }[type];
  if (unpacker === null) {
    console.log("guess type failed");
    return;
  }
  console.log("guess type: ", type);
  while (cursor < offsetInfoStore.fileBytes.length) {
    const data = offsetInfoStore.fileBytes.slice(cursor);
    const [colorIndexes, used, ,] = unpacker(data, 64, 80);
    console.log("cursor, used:", cursor, used);
    if (colorIndexes === null) {
      console.log("break via null color index");
      break;
    }
    offsetInfoStore.append({
      type: type,
      offset: cursor,
      size: used,
      count: 1,
      memo: {},
    });
    cursor += used;
  }
  offsetInfoStore.fill(offsetInfoStore.fileBytes.length);

  console.log("guessOffsetInfos:", offsetInfoStore.offsetInfos);
}

function guessType(data) {
  const header = String.fromCharCode(...data.slice(0, 4));
  if (header.startsWith("NPK")) {
    return "npk";
  }

  const w = (data[1] << 8) | data[0];
  const h = (data[3] << 8) | data[2];
  if (w > 0 && w <= 800 && h > 0 && h <= 600) {
    return "grp";
  }

  return "kao";
}
</script>

<template>
  <div class="container flex">
    <div class="flex flex-col w-1/2">
      <!-- File Controls -->
      <div class="small-block w-64 h-24 border border-gray-400">
        <div>載入檔案</div>
        <input type="file" @change="onFileChange" />
        <z-button type="reset" @click="reset">清除</z-button>
      </div>
      <!-- Color Pickers -->
      <z-color-palette />
      <!-- Offset Infos -->
      <div class="mt-4 border"></div>
    </div>
    <image-gallery />
  </div>
</template>

<style scoped></style>
