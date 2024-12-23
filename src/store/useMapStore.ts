import { defineStore, PiniaCustomStateProperties } from "pinia";

export const useMapStore = defineStore("map", {
  state: () => {
    return {
      map: null,
    };
  },
  actions: {
    setMapConfig(
      params: PiniaCustomStateProperties<{
        map: null | mapboxgl.Map;
      }>
    ) {
      this.$state = { ...this.$state, ...params };
    },
  },
});
