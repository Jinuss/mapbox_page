<script setup lang="ts">
import { toRaw, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { useMapStore } from "../store";
import { DRAW_TOOL_TYPES, TOOL_TO_MAPBOX_TYPES } from "../const/index";

const { map } = storeToRefs(useMapStore());

const active = ref("");

const modes = MapboxDraw.modes;

const draw = new MapboxDraw({ modes });

watch(
  () => map.value,
  (mapInstance) => {
    if (draw) {
      draw.onAdd(mapInstance);
    }

    mapInstance.on("draw.create", handleDraw);
    mapInstance.on("draw.delete", handleDraw);
    mapInstance.on("draw.update", handleDraw);
  }
);

const handleDraw = (event) => {
  const data = draw.getAll();
  console.log("🚀 ~ handleDraw ~ data:", draw.getMode(), data);
  console.log("🚀 ~ e:", event);
  //测面积
  if (active.value == DRAW_TOOL_TYPES.MEASUREPOLYGON) {
    const area = turf.area(event.features[0]);
    console.log("🚀 ~ handleDraw ~ area:", area);
  }
  //测长度
  if (active.value == DRAW_TOOL_TYPES.MEASUREDISTANCE) {
    const area = turf.length(event.features[0]);
    console.log("🚀 ~ handleDraw ~ area:", area);
  }
};

const handleClickOpIcon = (type: string) => {
  active.value = type;
  const mode = TOOL_TO_MAPBOX_TYPES[type];
  draw.changeMode(mode);
};

const List = [
  {
    text: "测距",
    icon: "#icon-measure-distance",
    type: DRAW_TOOL_TYPES.MEASUREDISTANCE,
  },
  {
    text: "量角",
    icon: "#icon-protractor",
    type: DRAW_TOOL_TYPES.MEASUREANGLE,
  },
  {
    text: "方位角",
    icon: "#icon-azimuth",
    type: DRAW_TOOL_TYPES.AZIMUTH,
  },
  {
    text: "测面",
    icon: "#icon-measure-polygon",
    type: DRAW_TOOL_TYPES.MEASUREPOLYGON,
  },
];
</script>
<template>
  <ul class="Draw_draw__UPVhb">
    <li
      :class="{ active: active == item.type }"
      v-for="item in List"
      @click="() => handleClickOpIcon(item.type)"
    >
      <el-tooltip
        class="box-item"
        effect="dark"
        :content="item.text"
        placement="left"
        :offset="20"
      >
        <span role="img" class="anticon">
          <svg
            width="1em"
            height="1em"
            aria-hidden="true"
            focusable="false"
            class=""
          >
            <use :xlink:href="item.icon"></use>
          </svg>
        </span>
      </el-tooltip>
    </li>
  </ul>
</template>
<style scoped>
ul {
  border-radius: 4px;
  box-shadow: 0 0 4px 2px #b1b1b180;
  position: absolute;
  right: 10px;
  top: 100px;
  z-index: 5;
  background: #fff;
}

li {
  background-color: var(--primary-color);
  font-size: 22px;
  height: 29px;
  transition: all 0.3s;
  width: 29px;
  align-items: center;
  display: flex;
  justify-content: center;
}

li svg {
  fill: var(--primary-svg-color);
}
ul > li:not(:last-child) {
  border-bottom: 1px solid var(--primary-li-bottom-color);
}

.Draw_draw__UPVhb > li:first-child,
.Draw_draw__UPVhb > li:last-child {
  font-size: 26px;
}

.anticon {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  align-items: center;
  color: inherit;
  display: inline-flex;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-rendering: optimizelegibility;
  text-transform: none;
  vertical-align: -0.125em;
  font-size: 22px;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
}

li:hover {
  background-color: var(--primary-svg-hover-color);
  cursor: pointer;
}

ul > li.active {
  color: #3385ff;
}

ul > li.active svg {
  fill: #3385ff !important;
}
</style>
