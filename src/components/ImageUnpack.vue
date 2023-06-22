<script setup>
import { colorIndexesToImage, hexToRGB, unpackGrp, unpackKao, unpackNpk } from "@/utils/unpack";
import { ref, computed, onMounted } from "vue";
import palettes from "@/data/palettes.js";
import ZButton from "@/components/ZButton.vue";

const fileBytes = ref(null);
const selectedFile = ref("");
const selectedOption = ref("default");
const options = Object.entries(palettes).map(([key, value]) => ({ label: value.name, value: key }));

const colors = computed(() => palettes[selectedOption.value].codes);
const gallery = ref(null);

onMounted(() => {
  // Console.log(gallery.value);
  drawImages();
});

function onFileChange(event) {
  reset();
  selectedFile.value = event.target.files[0];
  if (selectedFile.value) {
    const reader = new FileReader();
    reader.onload = () => {
      fileBytes.value = new Uint8Array(reader.result);
      drawImages();
    };

    reader.onerror = (error) => {
      console.error("Load file error:", error);
    };

    reader.readAsArrayBuffer(selectedFile.value);
  } else {
    console.error("The selected file isn't a file.");
  }
}

function reset() {
  gallery.value.innerHTML = "";
}

function drawImages() {
  const unpackers = { kao: unpackKao, npk: unpackNpk, grp: unpackGrp };
  if (fileBytes.value) {
    let cursor = 0;
    const rgbColors = colors.value.map(hexToRGB);
    let unpacker = null;
    while (cursor < fileBytes.value.length) {
      const data = fileBytes.value.slice(cursor);
      if (unpacker === null) {
        const type = guessType(data);
        console.log("guess type: ", type);
        unpacker = unpackers[type];
      }

      const [colorIndexes, used, w, h] = unpacker(data, 64, 80);
      if (colorIndexes === null) {
        break;
      }

      console.log("drawImages:", fileBytes.value.length, cursor, used, w, h);
      cursor += used;
      const imageData = colorIndexesToImage(colorIndexes, w, h, rgbColors);

      const canvas = document.createElement("canvas");
      canvas.classList = "m-0.5"; // Border: 2px solid gray
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.getContext("2d").putImageData(imageData, 0, 0);
      gallery.value.appendChild(canvas);
    }
  } else {
    console.error("The selected file isn't a file.");
  }
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
      <div class="small-block w-64 h-16 border border-gray-400">
        <div>載入檔案</div>
        <input type="file" @change="onFileChange" />
        <z-button type="reset" @click="reset">清除</z-button>
      </div>
      <!-- Color Pickers -->
      <div class="mt-4 border">
        <select class="mb-2" v-model="selectedOption">
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <div class="flex">
          <span v-for="(color, index) in colors" :key="index">
            <input type="color" :value="color" class="w-16 h-9" disabled />
            <span class="text-sm">{{ color }}</span>
          </span>
        </div>
      </div>
      <!-- Offset Infos -->
      <div class="mt-4 border"></div>
    </div>
    <div class="flex flex-grow flex-wrap border" ref="gallery"></div>
  </div>
</template>

<style scoped></style>
