<script setup>
import { ref } from "vue";
import { unpackFormats } from "@/utils/unpack";
import { useOffsetInfosStore } from "@/stores/offset-infos";

const props = defineProps({
  index: { type: Number, default: 0 },
  title: { type: String, default: "" },
  format: { type: String, default: "skip", required: true },
  offset: { type: Number, default: 0, required: true },
  size: { type: Number, default: 0, required: true },
  count: { type: Number, default: -1 },
  width: { type: Number, default: -1 },
  height: { type: Number, default: -1 },
});

const vOffset = ref(props.offset);
const vSize = ref(props.size);
const vCount = ref(props.count);
const vWidth = ref(props.width);
const vHeight = ref(props.height);

const editMode = ref(false);
const selected = ref(props.format);
const formats = Object.keys(unpackFormats);
const offsetInfosStore = useOffsetInfosStore();

function enableEdit() {
  editMode.value = true;
}

function deleteInfo() {
  offsetInfosStore.remove(props.index);
}

function save() {
  const size = selected.value === "kao" ? ((vWidth.value * vHeight.value) / 8) * 3 : vSize.value;
  offsetInfosStore.update(props.index, {
    format: selected.value,
    offset: vOffset.value,
    size: size,
    count: selected.value === "skip" ? 1 : vCount.value,
    width: selected.value === "kao" ? vWidth.value : -1,
    height: selected.value === "kao" ? vHeight.value : -1,
  });
  editMode.value = false;
}

function cancel() {
  editMode.value = false;
}
</script>

<template>
  <div class="card w-[27rem] bg-base-100 shadow-xl hover:bg-blue-200 mt-2 px-2 py-2 flex-row flex-wrap">
    <!-- Title -->
    <h2 class="card-title w-4/6">#{{ index }} {{ title }}</h2>
    <!-- Button Controls -->
    <template v-if="!editMode">
      <button class="btn btn-circle w-1/6" @click="enableEdit">
        <svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 0 512 512">
          <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
          />
        </svg>
      </button>
      <button class="btn btn-circle w-1/6" @click="deleteInfo">
        <svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 0 448 512">
          <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
          />
        </svg>
      </button>
    </template>
    <template v-else>
      <button class="btn btn-circle w-1/6" @click="save">
        <svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 0 448 512" class="fill-green-600">
          <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
          />
        </svg>
      </button>
      <button class="btn btn-circle w-1/6" @click="cancel">
        <svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 0 384 512" class="fill-red-600">
          <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
          />
        </svg>
      </button>
    </template>
    <!-- Input Controls -->
    <div class="form-control w-1/6">
      <label class="label pb-0">
        <span class="label-text">type</span>
      </label>
      <select v-model="selected" :disabled="!editMode" class="select select-primary select-xs w-full max-w-sx">
        <option v-for="x in formats" :key="x" :value="x" :selected="x === format">{{ x }}</option>
      </select>
    </div>
    <div class="form-control w-1/6">
      <label class="label pb-0">
        <span class="label-text">offset</span>
      </label>
      <input
        v-model.number="vOffset"
        type="text"
        :disabled="!editMode"
        class="input input-bordered w-full max-w-xs input-xs"
      />
    </div>
    <div class="form-control w-1/6">
      <label class="label pb-0">
        <span class="label-text">size</span>
      </label>
      <input
        v-model.number="vSize"
        type="text"
        :disabled="!editMode || selected === 'kao'"
        class="input input-bordered w-full max-w-xs input-xs"
      />
    </div>
    <div class="form-control w-1/6">
      <label class="label pb-0">
        <span class="label-text">count</span>
      </label>
      <input
        v-model.number="vCount"
        type="text"
        :disabled="!editMode || selected === 'skip'"
        class="input input-bordered w-full max-w-xs input-xs"
      />
    </div>
    <div class="form-control w-1/6">
      <label class="label pb-0">
        <span class="label-text">w</span>
      </label>
      <input
        v-model.number="vWidth"
        type="text"
        :disabled="!editMode || selected !== 'kao'"
        class="input input-bordered w-full max-w-xs input-xs"
      />
    </div>
    <div class="form-control w-1/6">
      <label class="label pb-0">
        <span class="label-text">h</span>
      </label>
      <input
        v-model.number="vHeight"
        type="text"
        :disabled="!editMode || selected !== 'kao'"
        class="input input-bordered w-full max-w-xs input-xs"
      />
    </div>
    <!-- Infos -->
    <span class="flex w-full mt-1">
      <span class="w-3/12 text-left">pos:{{ offset }} </span>
      <span class="w-1/12 text-center">| ⬅</span>
      <span class="w-4/12 text-center">{{ (size * count).toLocaleString() }} bytes</span>
      <span class="w-1/12 text-center">➡ |</span>
      <span class="w-3/12 text-right">pos:{{ offset + size * count }}</span>
    </span>
  </div>
</template>

<style scoped></style>
