<script setup>
import Encoding from 'encoding-japanese';
import {ref} from 'vue';
import {koeiTwToOrder, orderOfUnicode, orderToKOEITw, orderToUnicode} from '@/utils/encoding-convert';

const inputText = ref('');
const inputHex = ref('');
const encodedText = ref('');
const decodedText = ref('');

function encoding() {
	const encodingRadios = document.getElementsByName('encoding');
	let selectedEncoding = 'koeitw';
	for (let i = 0; i < encodingRadios.length; i++) {
		if (encodingRadios[i].checked) {
			selectedEncoding = encodingRadios[i].value;
			break;
		}
	}

	return selectedEncoding;
}

function addSpaceToText(text) {
	// 使用正則表達式來將每四個字符匹配到一個獨立的分組中
	const regex = /(.{4})/g;
	// 將每四個字符替換為匹配分組中的字符和一個空格
	const newText = text.replace(regex, '$1 ');
	// 移除可能在最後添加的尾隨空格
	return newText.trim();
}

function codeToText(code, codec) {
	const shiftJISDecoder = new TextDecoder(codec);
	const inputHexArray = code.replaceAll(' ', '').match(/.{1,2}/g);
	const inputUint8Array = new Uint8Array(inputHexArray.length);
	for (let i = 0; i < inputHexArray.length; i++) {
		inputUint8Array[i] = parseInt(inputHexArray[i], 16);
	}

	return shiftJISDecoder.decode(inputUint8Array.buffer);
}

function koeiTwCodeToText(code) {
	const inputHexArray = code.replaceAll(' ', '').match(/.{1,2}/g);
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

	return outputArray.join('');
}

function textToKOEITwCode(text) {
	const orders = text.split('').map(c => orderOfUnicode(c));
	const koeiTwValues = orders.map(order => orderToKOEITw(order));
	console.log(koeiTwValues);
	const koeiTwHexes = koeiTwValues.map(value =>
		Array.from(value)
			.map(b => b.toString(16).padStart(2, '0').toUpperCase())
			.join(''),
	);
	return koeiTwHexes.join(' ');
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
		to: 'SJIS',
		from: 'UNICODE',
	});
	const encodedTextHexArray = Array.from(sjisArray, byte =>
		('00' + byte.toString(16)).slice(-2).toUpperCase(),
	);
	return addSpaceToText(encodedTextHexArray.join(''));
}

function encodeText() {
	if (encoding() === 'shiftjis') {
		encodedText.value = textToShiftJISCode(inputText.value);
	} else {
		encodedText.value = textToKOEITwCode(inputText.value);
	}
}

function decodeText() {
	if (encoding() === 'shiftjis') {
		decodedText.value = codeToText(inputHex.value, 'shift_jis');
	} else {
		decodedText.value = koeiTwCodeToText(inputHex.value);
	}
}

</script>

<template>
  <label> <input type="radio" name="encoding" value="koeitw" checked/> KOEI-TW </label>
  <label> <input type="radio" name="encoding" value="shiftjis"/> Shift JIS </label>
  <div>
    <label for="input1">輸入文字:</label>
    <input type="text" id="input1" class="text-black" v-model="inputText" @keyup.enter="encodeText"/>
    <button type="button" @click="encodeText"
            class="mx-2 text-blue-700 font-normal py-1 px-2 rounded transition duration-300 ease-in-out focus:outline-none focus:shadow-outline border border-blue-700 hover:bg-blue-700 hover:text-white">
      轉換
    </button>
    <div>轉換結果: {{ encodedText }}</div>
  </div>
  <div>
    <label for="input2">輸入 hex string:</label>
    <input type="text" id="input2" class="text-black" v-model="inputHex" @keyup.enter="decodeText"/>
    <button type="button" @click="decodeText"
            class="mx-2 text-blue-700 font-normal py-1 px-2 rounded transition duration-300 ease-in-out focus:outline-none focus:shadow-outline border border-blue-700 hover:bg-blue-700 hover:text-white">
      轉換
    </button>
    <div>轉換結果: {{ decodedText }}</div>
  </div>
</template>

<style scoped>
input {
  border: 1px solid #222222;
  margin: 2px;
}
</style>
