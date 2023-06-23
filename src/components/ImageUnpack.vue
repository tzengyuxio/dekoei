<script setup>
import { ref } from "vue";
import ZButton from "@/components/ZButton.vue";
import ZColorPalette from "@/components/ZColorPalette.vue";
import ImageGallery from "@/components/ImageGallery.vue";
import { useOffsetInfosStore } from "@/stores/offset-infos";
import { unpackGrp, unpackKao, unpackNpk } from "@/utils/unpack";
import ZOffsetInfoList from "@/components/ZOffsetInfoList.vue";

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
        offsetInfoStore.clear();
        guessOffsetInfos();
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
  offsetInfoStore.clear();
  console.log("resetting...");
}

function guessOffsetInfos() {
  let cursor = 0;
  const type = guessType(offsetInfoStore.fileBytes);
  const unpacker = { kao: unpackKao, npk: unpackNpk, grp: unpackGrp }[type];
  const infos = [];
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
    infos.push({
      type: type,
      offset: cursor,
      size: used,
      count: 1,
      memo: {},
    });
    cursor += used;
  }
  const newInfos = [];
  infos.forEach((info) => {
    if (info.type === "kao" && newInfos.length > 0) {
      const prevInfo = newInfos[newInfos.length - 1];
      if (prevInfo.type === "kao" && info.size === prevInfo.size) {
        newInfos[newInfos.length - 1].count += 1;
        return;
      }
    }
    newInfos.push(info);
  });
  console.log("newInfos", newInfos);
  newInfos.forEach((info) => {
    offsetInfoStore.append(info);
  });
  offsetInfoStore.fill(offsetInfoStore.fileBytes.length);
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
      <div class="small-block w-128 h-24 border border-gray-400">
        <div>載入檔案</div>
        <input type="file" class="file-input file-input-bordered w-full max-w-xs" @change="onFileChange" />
        <z-button type="reset" @click="reset">清除</z-button>
      </div>
      <!-- Color Pickers -->
      <z-color-palette />
      <!-- Offset Infos -->
      <z-offset-info-list />
    </div>
    <image-gallery />
  </div>
</template>

<style scoped></style>
