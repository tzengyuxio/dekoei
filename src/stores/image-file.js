import { defineStore } from "pinia";
import { ref } from "vue";

export const useImageFileStore = defineStore("image-file", () => {
  const fileBytes = ref(new Uint8Array(0));
  const filename = ref("");

  function setFile(filename, fileBytes) {
    this.filename = filename;
    this.fileBytes = fileBytes;
  }

  return { fileBytes, filename, setFile };
});
