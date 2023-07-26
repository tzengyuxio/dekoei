<script setup>
import { computed, ref } from "vue";
import Encoding from "encoding-japanese";
import { koeiTwToOrder, orderOfUnicode, orderToKOEITw, orderToUnicode } from "@/utils/encoding-convert";

const encodings = ref([
  { label: "KOEI TW", value: "koei_tw" },
  { label: "Big5", value: "big5" },
  { label: "Shift JIS", value: "shift_jis" },
]);
const selectedEncoding = ref("koei_tw");
const inputText = ref("");
const inputHex = ref("");

const encodedText = computed(() => {
  if (inputText.value === "") {
    return "";
  }

  if (selectedEncoding.value === "koei_tw") {
    return textToKOEITwCode(inputText.value);
  }

  if (selectedEncoding.value === "shift_jis") {
    return textToShiftJISCode(inputText.value);
  }

  return "(尚不支援 " + selectedEncoding.value + " 轉換內碼)";
});

const decodedText = computed(() => {
  if (inputHex.value === "") {
    return "";
  }

  if (selectedEncoding.value === "koei_tw") {
    return koeiTwCodeToText(inputHex.value);
  }

  return codeToText(inputHex.value, selectedEncoding.value);
});

function addSpaceToText(text) {
  // 使用正則表達式來將每四個字符匹配到一個獨立的分組中
  const regex = /(.{4})/g;
  // 將每四個字符替換為匹配分組中的字符和一個空格
  const newText = text.replace(regex, "$1 ");
  // 移除可能在最後添加的尾隨空格
  return newText.trim();
}

function codeToText(code, codec) {
  const decoder = new TextDecoder(codec);
  const inputHexArray = code.replaceAll(" ", "").match(/.{1,2}/g);
  const inputUint8Array = new Uint8Array(inputHexArray.length);
  for (let i = 0; i < inputHexArray.length; i++) {
    inputUint8Array[i] = parseInt(inputHexArray[i], 16);
  }

  return decoder.decode(inputUint8Array.buffer);
}

function koeiTwCodeToText(code) {
  const inputHexArray = code.replaceAll(" ", "").match(/.{1,2}/g);
  const inputUint8Array = new Uint8Array(inputHexArray.length);
  for (let i = 0; i < inputHexArray.length; i++) {
    inputUint8Array[i] = parseInt(inputHexArray[i], 16);
  }

  const outputArray = [];
  for (let i = 0; i < inputUint8Array.length; i += 2) {
    const pair = new Uint8Array([inputUint8Array[i], inputUint8Array[i + 1]]);
    const order = koeiTwToOrder(pair);
    outputArray.push(orderToUnicode(order));
  }

  return outputArray.join("");
}

function textToKOEITwCode(text) {
  const orders = text.split("").map((c) => orderOfUnicode(c));
  const koeiTwValues = orders.map((order) => orderToKOEITw(order));
  const koeiTwHexes = koeiTwValues.map((value) =>
    Array.from(value)
      .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join("")
  );
  return koeiTwHexes.join(" ");
}

/**
 * Converts the given text to Shift JIS encoded hex string.
 *
 * @param {string} text - the text to convert to Shift JIS encoded hex string.
 * @return {string} the Shift JIS encoded hex string representation of the input text.
 */
function textToShiftJISCode(text) {
  const unicodeArray = Encoding.stringToCode(text); // Convert string to code array
  const sjisArray = Encoding.convert(unicodeArray, {
    to: "SJIS",
    from: "UNICODE",
  });
  const encodedTextHexArray = Array.from(sjisArray, (byte) => ("00" + byte.toString(16)).slice(-2).toUpperCase());
  return addSpaceToText(encodedTextHexArray.join(""));
}
</script>

<template>
  <template v-for="encoding in encodings" :key="encoding.value">
    <div>
      <input
        type="radio"
        :id="'encoding-' + encoding.value"
        name="encoding"
        :value="encoding.value"
        v-model="selectedEncoding"
        class="radio radio-sm checked:bg-cyan-500 mr-2"
      />
      <label :for="'encoding-' + encoding.value"> {{ encoding.label }} </label>
    </div>
  </template>
  <div>
    <label for="input1">輸入文字:</label>
    <input type="text" id="input1" class="input-sm" v-model="inputText" placeholder="(請輸入文字)" />
    <div>轉換結果: {{ encodedText }}</div>
  </div>
  <div>
    <label for="input2">輸入 hex string:</label>
    <input type="text" id="input2" class="input-sm" v-model="inputHex" />
    <div>轉換結果: {{ decodedText }}</div>
  </div>
</template>

<style scoped>
input[type="text"] {
  @apply border border-b-gray-900 ml-2;
}
</style>
