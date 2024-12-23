<script setup lang="ts">
import { watch, ref } from "vue";
import { useMapStore } from "../store";
import { storeToRefs } from "pinia";

const mapStore = useMapStore();

const { map } = storeToRefs(mapStore);

const mousePositionStr = ref("");
const bingEvent = (mapInstance: mapboxgl.Map | null) => {
  mapInstance?.on("mousemove", (event) => {
    const { lat, lng } = event.lngLat;
    if (lat && lng) {
      let str = `经度:${lng.toFixed(3)}° 纬度:${lat.toFixed(3)}°`;
      mousePositionStr.value = str;
    }
  });
};

watch(
  () => map.value,
  (newMap) => {
    bingEvent(newMap);
  }
);
</script>

<template>
  <div className="brp">{{ mousePositionStr }}</div>
</template>
<style scoped>
.brp {
  position: absolute;
  height: 25px;
  width: fit-content;
  background-color: #f7f4f1c0;
  z-index: 2;
  border-radius: 2px;
  padding: 2px 3px;
  bottom: 10px;
  right: 10px;
  line-height: 25px;
}
</style>
