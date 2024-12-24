<script setup lang="ts">
import { onBeforeMount } from "vue";
import mapBox from "./components/map.vue";
const container: Element | null = document.querySelector("#svgBase");
const fetchSymbols = () => {
  fetch("./icons.svg")
    .then((response) => response.text())
    .then((content) => {
      if (container && content) {
        container.innerHTML = content;
      }
    });
};

onBeforeMount(() => {
  fetchSymbols();
});
</script>
<template>
  <mapBox />
</template>
<style scoped></style>
