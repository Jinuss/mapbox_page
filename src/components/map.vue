<script setup lang="ts">
import { onMounted } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox-controls/zoom/src/index.css";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useMapStore } from "../store";
import brp from "./brp.vue";
import tools from './tools.vue'

// mapboxgl.accessToken =
//   "pk.eyJ1IjoiamFrZWpvdWUiLCJhIjoiY2tyZnNlM2d1MG5tMDJ1cW5jaXN2MW02NyJ9.H6m2TZiZaAwet6HXv1TMvQ";

mapboxgl.accessToken =
  "pk.eyJ1IjoibG9uZ2xvbmd3YXl0b2dvIiwiYSI6ImNqdnZ6OWV6cTFnY240NG9nbmxnc2k5dTkifQ.hsbNl4QUNyn46nfbztiFpw";
const mapStore = useMapStore();

const initMap = () => {
  const map: null | mapboxgl.Map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    // style: 'mapbox://styles/mapbox/streets-v11',
    center: [114.3055, 30.5928],
    zoom: 12,
    projection: "globe",
  });

  map.scrollZoom.enable();

  map.touchZoomRotate.enable();

  map.addControl(
    new MapboxLanguage({
      defaultLanguage: "zh-Hans",
    })
  );

  map.addControl(new mapboxgl.FullscreenControl());

  map.addControl(new mapboxgl.NavigationControl(), "top-left");

  map.addControl(new mapboxgl.ScaleControl());

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
  );
  
  mapStore.setMapConfig({ map });
};

onMounted(() => {
  initMap();
});
</script>
<template>
  <div id="map">
    <brp />
    <tools />
  </div>
</template>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>
