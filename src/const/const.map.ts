export const DRAW_TOOL_TYPES = {
  CLEAR: "CLEAR",
  MEASUREDISTANCE: "MEASUREDISTANCE",
  MEASUREANGLE: "MEASUREANGLE",
  AZIMUTH: "AZIMUTH",
  MEASUREPOLYGON: "MEASUREPOLYGON",
};

export const TOOL_TO_MAPBOX_TYPES = {
  MEASUREDISTANCE: "draw_line_string",
  MEASUREANGLE: "draw_point",
  AZIMUTH: "draw_point",
  MEASUREPOLYGON: "draw_polygon",
};

export const MAP_DRAW_EVENT_TYPE = {
  CREATE: "draw.create",
  UPDATE: "draw.update",
};
