<script setup lang="ts">
import { onMounted } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox-controls/zoom/src/index.css";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
mapboxgl.accessToken =
  "pk.eyJ1IjoiamFrZWpvdWUiLCJhIjoiY2tyZnNlM2d1MG5tMDJ1cW5jaXN2MW02NyJ9.H6m2TZiZaAwet6HXv1TMvQ";

const initMap = () => {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
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
  // Set marker options.
  const marker = new mapboxgl.Marker({
    color: "#FFFFFF",
    draggable: true,
  })
    .setLngLat([114.3055, 30.5928])
    .addTo(map);

  const marker2 = new mapboxgl.Marker()
    .setLngLat([114.3055, 31.5928])
    .setPopup(new mapboxgl.Popup().setHTML("<h1>Hello World!</h1>")) // add popup
    .addTo(map);
  //   map.addControl(new ZoomControl(), 'top-left');

  map.addControl(new mapboxgl.FullscreenControl());

  map.addControl(new mapboxgl.NavigationControl(), "top-left");

  map.addControl(new mapboxgl.ScaleControl());
};

onMounted(() => {
  initMap();
});
</script>
<template>
  <div id="map"></div>
</template>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>
