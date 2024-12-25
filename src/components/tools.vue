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
import arrowImg from "../assets/上箭头.png";
import {
  calculateAngle as computeAngle,
  createAngleSVG,
  formatDistance,
  formatArea,
} from "../util";
import {
  DRAW_TOOL_TYPES,
  TOOL_TO_MAPBOX_TYPES,
  MAP_DRAW_EVENT_TYPE,
} from "../const/index";

const { CREATE, UPDATE } = MAP_DRAW_EVENT_TYPE;
const { map } = storeToRefs(useMapStore());

const active = ref("");

const modes = MapboxDraw.modes;

const draw = new MapboxDraw({ modes });

let globalData = {},
  globalMarkers = {};

watch(
  () => map.value,
  (mapInstance) => {
    if (draw) {
      draw.onAdd(mapInstance);
    }

    mapInstance.on(CREATE, handleDraw);
    mapInstance.on(UPDATE, handleDraw);
  }
);
let timeStamp = new Date().getTime();
const handleDraw = (event) => {
  const data = draw.getAll();
  const { type, features, action } = event;
  if (type == UPDATE && features.length) {
    let modifyId = null;
    if (
      [
        DRAW_TOOL_TYPES.MEASUREDISTANCE,
        DRAW_TOOL_TYPES.MEASUREPOLYGON,
      ].includes(active.value)
    ) {
      const { id } = features[0];
      modifyId = id;
    } else {
      const { id } = features[0];
      const a = Object.values(globalData)?.[0];

      const tmp = a.filter((feature) => feature.id == id);
      if (tmp && tmp.length) {
        modifyId = tmp[0].properties.timeStamp;
        globalData[modifyId] = globalData[modifyId].filter(
          (feature) => feature.id != id
        );
      }
    }

    if (modifyId) {
      //清除之前的marker
      globalMarkers[modifyId].forEach((marker) => {
        marker.remove();
      });
      globalMarkers[modifyId] = [];
    }
  }
  //测面积
  if (active.value == DRAW_TOOL_TYPES.MEASUREPOLYGON) {
    if (event.features && event.features.length) {
      handleArea(event.features[0]);
      active.value = "";
    }
  }
  //测长度
  if (active.value == DRAW_TOOL_TYPES.MEASUREDISTANCE) {
    if (event.features && event.features.length) {
      handleLine(event.features[0]);
      active.value = "";
    }
  }

  //量角
  if (active.value == DRAW_TOOL_TYPES.MEASUREANGLE) {
    if (event.features && event.features.length) {
      handleAngle(event.features[0]);
    }
  }

  //方位角
  if (active.value == DRAW_TOOL_TYPES.AZIMUTH) {
    if (event.features && event.features.length) {
      handleAzimuth(event.features[0]);
    }
  }
};

const handleAzimuth = (feature) => {
  const data = draw.getAll();
  const { id } = feature;
  data.features.forEach((element, index, array) => {
    if (element.id == id) {
      array[index].properties.timeStamp = timeStamp;
      if (
        globalData[timeStamp] &&
        globalData[timeStamp].length &&
        globalData[timeStamp].length < 2
      ) {
        globalData[timeStamp].push(element);
      } else if (!globalData[timeStamp]) {
        globalData[timeStamp] = [element];
      }
    }
  });

  if (globalData[timeStamp].length < 2) {
    setTimeout(function () {
      draw.changeMode("draw_point");
    }, 0);
  } else {
    renderAzimuthAngle();
    active.value = "";
  }
};

const renderAzimuthAngle = () => {
  globalMarkers[timeStamp] = [];
  let coordinates = [];
  for (let i = 0; i < globalData[timeStamp].length; i++) {
    coordinates.push(globalData[timeStamp][i].geometry.coordinates);
  }

  const distance = calculateDistance(coordinates[0], coordinates[1]);

  const northPoint = [coordinates[0][0], coordinates[0][1] + distance / 111139];

  coordinates.unshift(northPoint);

  for (let i = 0; i < coordinates.length; i++) {
    globalMarkers[timeStamp].push(
      new mapboxgl.Marker(createPointEl(i == 0 ? arrowImg : pointImg,i==0))
        .setLngLat(coordinates[i])
        .addTo(map.value)
    );
  }

  globalMarkers[timeStamp].push(
    new mapboxgl.Marker({
      element: createLabelElement("正北方向"),
    })
      .setLngLat(coordinates[0])
      .setOffset([0, -12])
      .addTo(map.value)
  );

  const Angle = computeAngle({ points: coordinates });
  const svgImg = createAngleSVG(Angle);
  globalMarkers[timeStamp].push(
    new mapboxgl.Marker(createImgEl(svgImg))
      .setLngLat(coordinates[1])
      .addTo(map.value)
  );

  if (draw.get(timeStamp)) {
    draw.delete([timeStamp]);
  }
  draw.add({
    id: timeStamp,
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: coordinates,
    },
  });
};

const handleAngle = (feature) => {
  const data = draw.getAll();
  const { id } = feature;
  data.features.forEach((element, index, array) => {
    if (element.id == id) {
      array[index].properties.timeStamp = timeStamp;
      if (
        globalData[timeStamp] &&
        globalData[timeStamp].length &&
        globalData[timeStamp].length < 3
      ) {
        globalData[timeStamp].push(element);
      } else if (!globalData[timeStamp]) {
        globalData[timeStamp] = [element];
      }
    }
  });

  if (globalData[timeStamp].length < 3) {
    setTimeout(function () {
      draw.changeMode("draw_point");
    }, 0);
  } else {
    renderAngle();
    active.value = "";
  }
};

const createImgEl = (imgsrc) => {
  const el = document.createElement("img");
  el.className = "mapbox-tool-angle-img";
  el.src = imgsrc;
  el.style.width = `200px`;
  el.style.height = `200px`;
  return el;
};

const renderAngle = () => {
  globalMarkers[timeStamp] = [];
  let coordinates = [];
  for (let i = 0; i < globalData[timeStamp].length; i++) {
    let coordinate = globalData[timeStamp][i].geometry.coordinates;
    coordinates.push(coordinate);
    globalMarkers[timeStamp].push(
      new mapboxgl.Marker(createPointEl(pointImg))
        .setLngLat(coordinate)
        .addTo(map.value)
    );
  }
  const Angle = computeAngle({ points: coordinates });
  const svgImg = createAngleSVG(Angle);
  globalMarkers[timeStamp].push(
    new mapboxgl.Marker(createImgEl(svgImg))
      .setLngLat(coordinates[1])
      .addTo(map.value)
  );

  if (draw.get(timeStamp)) {
    draw.delete([timeStamp]);
  }

  draw.add({
    id: timeStamp,
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: coordinates,
    },
  });
};

const handleArea = (features) => {
  const {
    geometry: { coordinates },
    id,
  } = features;
  globalMarkers[id] = [];

  renderPointMarker(coordinates[0], true, id);

  const poly = turf.polygon(coordinates);
  const center = turf.center(poly);

  const area = turf.area(features);

  globalMarkers[id].push(
    new mapboxgl.Marker({
      element: createLabelElement(formatArea(area)),
    })
      .setLngLat(center.geometry.coordinates)
      // .setOffset([0, -10])
      .addTo(map.value)
  );
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
    id,
  } = features;
  const el_start = createEl("start");
  globalMarkers[id] = [];
  globalMarkers[id].push(
    new mapboxgl.Marker(el_start)
      .setLngLat(coordinates[0])
      .setOffset([0, -14])
      .addTo(map.value)
  );

  const el_end = createEl("end");
  globalMarkers[id].push(
    new mapboxgl.Marker(el_end)
      .setLngLat(coordinates[coordinates.length - 1])
      .setOffset([0, -14])
      .addTo(map.value)
  );

  if (coordinates.length > 2) {
    renderPointMarker(coordinates, false, id);
  }
  calculateAndDisplayDistances(coordinates, id);
};

const createPointEl = (imgSrc, size) => {
  const el = document.createElement("div");
  el.className = "mapbox-tool-marker";
  el.style.background = `url(${imgSrc})`;
  el.style.backgroundSize = "100%";
  el.style.width = size ? "24px" : `12px`;
  el.style.height = `12px`;
  el.style.display = "block";
  return el;
};

function renderPointMarker(coordinates, flag, id) {
  let i = 0;
  if (!flag) {
    i = 1;
  }
  for (; i < coordinates.length - 1; i++) {
    globalMarkers[id].push(
      new mapboxgl.Marker(createPointEl(pointImg))
        .setLngLat(coordinates[i])
        .addTo(map.value)
    );
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

function calculateAndDisplayDistances(coordinates, id) {
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

    addDistanceLabel(start, end, segmentDistance, id);
  }

  //总长度
  if (coordinates.length > 2) {
    globalMarkers[id].push(
      new mapboxgl.Marker({
        element: createLabelElement(formatDistance(totalDistance)),
      })
        .setLngLat(coordinates[coordinates.length - 1])
        .setOffset([0, 15])
        .addTo(map.value)
    );
  }
}
// 在每个线段的中点上添加距离文本
function addDistanceLabel(start, end, segmentDistance, id) {
  const midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];

  const angle = calculateAngle(start, end);
  const labelTxt = formatDistance(segmentDistance);
  globalMarkers[id].push(
    new mapboxgl.Marker({
      element: createLabelElement(labelTxt),
    })
      .setLngLat(midPoint)
      .setRotation(angle)
      .setOffset([0, -10])
      .addTo(map.value)
  );
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

// 创建文本元素
function createLabelElement(txt) {
  const label = document.createElement("div");
  label.style.fontSize = "12px";
  label.style.color = "#333";
  label.style.textAlign = "center";
  label.style.textShadow = "2px 2px 5px white";
  label.textContent = `${txt}`;

  return label;
}

const handleClickOpIcon = (type: string) => {
  active.value = type;
  timeStamp = new Date().getTime();
  const mode = TOOL_TO_MAPBOX_TYPES[type];
  if (mode) {
    draw.changeMode(mode);
  } else {
    draw.deleteAll();
    active.value = "";
    globalData = {};
    timeStamp = undefined;
    for (let id in globalMarkers) {
      globalMarkers[id].forEach((marker) => marker.remove());
    }
  }
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
  {
    text: "清除",
    icon: "#icon-delete",
    type: DRAW_TOOL_TYPES.CLEAR,
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
