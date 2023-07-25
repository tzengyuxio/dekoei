<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import ZButton from "@/components/ZButton.vue";
import ZColorPalette from "@/components/ZColorPalette.vue";
import ZOffsetInfoList from "@/components/ZOffsetInfoList.vue";
import ZTabLabel from "@/components/ZTabLabel.vue";
import ImageGallery from "@/components/ImageGallery.vue";
import { useImageFileStore } from "@/stores/image-file";
import { useOffsetInfosStore } from "@/stores/offset-infos";
import { unpackFormats } from "@/utils/unpack";
import { useColorPresetStore } from "@/stores/color-preset";

const selectedFile = ref(new Blob());
const colorPresetStore = useColorPresetStore();
const offsetInfoStore = useOffsetInfosStore();
const imageFileStore = useImageFileStore();

const { halfHeight } = storeToRefs(offsetInfoStore);

function onFileChange(event) {
  reset();
  const filename = event.target.files[0].name;
  selectedFile.value = event.target.files[0];
  if (selectedFile.value) {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        console.log("ArrayBuffer filename:", filename);
        imageFileStore.setFile(filename, new Uint8Array(reader.result));
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
  offsetInfoStore.clear();
  console.log("resetting...");
}

function guessOffsetInfos() {
  let cursor = 0;
  const format = guessFormat(imageFileStore.fileBytes);
  const unpacker = unpackFormats[format].method;
  const infos = [];
  if (unpacker === null) {
    console.log("guess type failed: ", format);
    return;
  }
  while (cursor < imageFileStore.fileBytes.length) {
    const data = imageFileStore.fileBytes.slice(cursor);
    const [, used, , , error] = unpacker(data, 64, 80, halfHeight.value);
    // console.debug("guess offset info: ", format, cursor, used, halfHeight.value);
    if (error !== "") {
      console.error("break via null color index: ", error);
      break;
    }
    infos.push({
      format: format,
      offset: cursor,
      size: used,
      count: 1,
      width: -1,
      height: -1,
      memo: {},
    });
    cursor += used;
  }
  const newInfos = [];
  infos.forEach((info) => {
    if (info.format === "kao" && newInfos.length > 0) {
      const prevInfo = newInfos[newInfos.length - 1];
      if (prevInfo.format === "kao" && info.size === prevInfo.size) {
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
  offsetInfoStore.fill(imageFileStore.fileBytes.length);
}

function guessFormat(data) {
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

function addCardAtFirst() {
  offsetInfoStore.insert(0, {
    format: "skip",
    offset: 0,
    size: 0,
    count: 1,
    width: -1,
    height: -1,
  });
}

function addCardAtLast() {
  const lastInfo = offsetInfoStore.offsetInfos[offsetInfoStore.offsetInfos.length - 1];
  const pos = lastInfo.offset + lastInfo.size * lastInfo.count;
  offsetInfoStore.append({
    format: "skip",
    offset: pos,
    size: 0,
    count: 1,
    width: -1,
    height: -1,
  });
}

function exportOffsetInfos() {
  const data = JSON.stringify(
    {
      palette: colorPresetStore.preset,
      halfHeight: offsetInfoStore.halfHeight,
      offsetInfos: offsetInfoStore.offsetInfos,
    },
    null,
    2
  );
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${imageFileStore.filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importOffsetInfos(event) {
  const file = event.target.files[0];

  console.log("importOffsetInfos 1");
  if (file.type === "application/json") {
    console.log("importOffsetInfos 2");
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (event) => {
      console.log("onload in import");
      const jsonContent = event.target.result.toString();
      const data = JSON.parse(jsonContent);
      offsetInfoStore.halfHeight = data.halfHeight;
      console.log("halfHeight set");
      offsetInfoStore.offsetInfos = data.offsetInfos;
      console.log("offsetInfos set");
      colorPresetStore.setPreset(data.palette);
      console.log("palette set");
    };
  } else {
    alert("請上傳 JSON 格式的文件！");
  }
}

function reorderOffsetInfos() {
  let cursor = 0;
  offsetInfoStore.offsetInfos.forEach((info) => {
    info.offset = cursor;
    cursor += info.size * info.count;
  });
}
</script>

<template>
  <div class="container flex">
    <div class="flex flex-col w-1/2 h-screen">
      <!-- File Controls -->
      <div class="small-block w-128 outline-block">
        <z-tab-label>Files</z-tab-label>
        <div>載入檔案</div>
        <input type="file" class="file-input file-input-bordered w-full max-w-xs" @change="onFileChange" />
        <z-button type="reset" @click="reset">清除</z-button><br />
        <span>檔案大小：</span><span>{{ imageFileStore.fileBytes.length.toLocaleString() }} bytes</span>
      </div>
      <!-- Color Pickers -->
      <z-color-palette />
      <!-- Offset Info Header -->
      <div class="flex-row flex-wrap form-control w-fit outline-block">
        <z-tab-label>Offset Infos</z-tab-label>
        <label class="label cursor-pointer">
          <span :class="'label-text' + (halfHeight ? '' : ' text-gray-400')">半高 (HalfHeight)</span>
          <input type="checkbox" class="toggle mx-1" v-model="halfHeight" />
        </label>
        <z-button class="w-fit m-1" @click="addCardAtFirst" :disabled="imageFileStore.fileBytes.length <= 0"
          >新增 Card (前)</z-button
        >
        <z-button class="w-fit m-1" @click="addCardAtLast" :disabled="imageFileStore.fileBytes.length <= 0"
          >新增 Card (後)</z-button
        >
        <z-button class="w-fit m-1" @click="exportOffsetInfos" :disabled="offsetInfoStore.offsetInfos.length <= 0"
          >Export</z-button
        >
        <z-button class="w-fit m-1" @click="reorderOffsetInfos" :disabled="offsetInfoStore.offsetInfos.length <= 0"
          >Reorder</z-button
        >
        <input
          type="file"
          class="w-fit m-1"
          @change="importOffsetInfos"
          :disabled="imageFileStore.fileBytes.length <= 0"
        />
        <z-button class="w-fit m-1" disabled>Download Images</z-button>
      </div>
      <!-- Offset Infos -->
      <z-offset-info-list />
    </div>
    <image-gallery />
  </div>
</template>

<style scoped></style>
