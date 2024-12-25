<script setup lang="ts">
import { toRaw, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { useMapStore } from "../store";
import startImg from "../assets/起点.png";
import endImg from "../assets/终点.png";
import pointImg from "../assets/空心圆.png";

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
let timeStamp = new Date().getTime();
const handleDraw = (event) => {
  const data = draw.getAll();
  console.log("🚀 ~ handleDraw ~ data:", draw.getMode(), data);
  console.log("🚀 ~ e:", event);
  //测面积
  if (active.value == DRAW_TOOL_TYPES.MEASUREPOLYGON) {
    if (event.features && event.features.length) {
      handleArea(event.features[0]);
    }
  }
  //测长度
  if (active.value == DRAW_TOOL_TYPES.MEASUREDISTANCE) {
    if (event.features && event.features.length) {
      handleLine(event.features[0]);
    }
  }
  //量角
  if (active.value == DRAW_TOOL_TYPES.MEASUREANGLE) {
    const data = draw.getAll();
    const id = event.features[0].id;
    event.features[0].properties.timeStamp = timeStamp;

    data.features.forEach((element, index, array) => {
      if (element.id == id) {
        array[index].properties.timeStamp = timeStamp;
      }
    });

    const features = data.features.filter((i) => i.properties.timeStamp == timeStamp);
    console.log("🚀 ~ handleDraw ~ features:", features)
    if (features.length != 3) {
      // draw.changeMode('simple_select');
      // draw.changeMode('draw_point');
      setTimeout(function() {
                draw.changeMode('draw_point');
            }, 0); // 延迟切换，确保在绘制完成后进行
    }
    console.log("🚀 ~ handleDraw ~ data:", data);
  }
};

const handleArea = (features) => {
  const {
    geometry: { coordinates },
  } = features;
  renderPointMarker(coordinates[0], true);

  const poly = turf.polygon(coordinates);
  const center = turf.center(poly);
  console.log("🚀 ~ handleArea ~ center:", center);
  const area = turf.area(features);
  new mapboxgl.Marker({
    element: createAreaLabelElement(area),
  })
    .setLngLat(center.geometry.coordinates)
    .setOffset([0, -10])
    .addTo(map.value);
};
const createEl = (type = "start") => {
  const el = document.createElement("div");
  el.className = "mapbox-tool-marker";
  el.style.background = `url(${type == "start" ? startImg : endImg})`;
  el.style.backgroundSize = "100%";
  el.style.width = `32px`;
  el.style.height = `32px`;
  el.style.display = "block";
  return el;
};

const handleLine = (features) => {
  const {
    geometry: { coordinates },
  } = features;
  const el_start = createEl("start");
  new mapboxgl.Marker(el_start)
    .setLngLat(coordinates[0])
    .setOffset([0, -14])
    .addTo(map.value);

  const el_end = createEl("end");
  new mapboxgl.Marker(el_end)
    .setLngLat(coordinates[coordinates.length - 1])
    .setOffset([0, -14])
    .addTo(map.value);

  if (coordinates.length > 2) {
    renderPointMarker(coordinates, false);
  }
  calculateAndDisplayDistances(coordinates);
};

const createPointEl = () => {
  const el = document.createElement("div");
  el.className = "mapbox-tool-marker";
  el.style.background = `url(${pointImg})`;
  el.style.backgroundSize = "100%";
  el.style.width = `12px`;
  el.style.height = `12px`;
  el.style.display = "block";
  return el;
};

function renderPointMarker(coordinates, flag) {
  console.log("🚀 ~ renderPointMarker ~ coordinates:", coordinates);
  if (!flag) {
    for (let i = 1; i < coordinates.length - 1; i++) {
      new mapboxgl.Marker(createPointEl())
        .setLngLat(coordinates[i])
        .addTo(map.value);
    }
  } else {
    for (let i = 0; i < coordinates.length - 1; i++) {
      new mapboxgl.Marker(createPointEl())
        .setLngLat(coordinates[i])
        .addTo(map.value);
    }
  }
}

// 计算两点之间的地理距离，单位为米
function calculateDistance(start, end) {
  const startCoord = [start[1], start[0]]; // [longitude, latitude]
  const endCoord = [end[1], end[0]];

  const from = turf.point(startCoord);
  const to = turf.point(endCoord);

  return turf.distance(from, to, { units: "meters" });
}

function calculateAndDisplayDistances(coordinates) {
  let totalDistance = 0;
  let distances = [];

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];

    const segmentDistance = calculateDistance(start, end);
    totalDistance += segmentDistance;
    distances.push({
      distance: segmentDistance,
      start: start,
      end: end,
    });

    addDistanceLabel(start, end, segmentDistance);
  }
}
// 在每个线段的中点上添加距离文本
function addDistanceLabel(start, end, segmentDistance) {
  const midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];

  const angle = calculateAngle(start, end);

  new mapboxgl.Marker({
    element: createDistanceLabelElement(segmentDistance),
  })
    .setLngLat(midPoint)
    .setRotation(angle)
    .setOffset([0, -10])
    .addTo(map.value);
}

function calculateAngle(start, end) {
  // 假设 start 和 end 是 [longitude, latitude] 格式
  const dx = end[0] - start[0]; // 经度差，x轴方向
  const dy = end[1] - start[1]; // 纬度差，y轴方向

  // 使用 Math.atan2 计算角度，结果是从 X轴正方向（东）开始，逆时针
  const radians = Math.atan2(dy, dx);

  // 将弧度转换为度
  let degrees = radians * (180 / Math.PI);

  // 标准化角度范围为 0 到 360 度
  if (degrees < 0) {
    degrees += 360; // 将负角度转为正角度
  }

  return 360 - degrees;
}

// 创建一个显示距离的文本元素
function createDistanceLabelElement(segmentDistance) {
  const label = document.createElement("div");
  label.style.fontSize = "12px";
  label.style.color = "#333";
  label.style.textAlign = "center";
  label.textContent = `${segmentDistance.toFixed(2)} m`;

  return label;
}

function createAreaLabelElement(segmentDistance) {
  const label = document.createElement("div");
  label.style.fontSize = "12px";
  label.style.color = "#333";
  label.style.textAlign = "center";
  label.textContent = `${segmentDistance.toFixed(2)} m^2`;

  return label;
}

const handleClickOpIcon = (type: string) => {
  timeStamp = new Date().getTime();
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
    text: "测面",
    icon: "#icon-measure-polygon",
    type: DRAW_TOOL_TYPES.MEASUREPOLYGON,
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
