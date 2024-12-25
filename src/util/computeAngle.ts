export const calculateAngle = ({
  points,
  azimuth = false,
}: {
  points: Array<[number, number]>;
  azimuth: boolean;
}) => {
  // 提取坐标点 A, B, C
  const [A, B, C] = points;

  // 计算向量 AB 和 BC
  const AB = { x: B[0] - A[0], y: B[1] - A[1] };
  const BC = { x: C[0] - B[0], y: C[1] - B[1] };

  // 计算点积
  const dotProduct = AB.x * BC.x + AB.y * BC.y;

  // 计算向量的模
  const magnitudeAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magnitudeBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);

  // 计算余弦值
  const cosTheta = dotProduct / (magnitudeAB * magnitudeBC);

  // 确保 cosTheta 在 -1 和 1 之间
  const clippedCosTheta = Math.max(-1, Math.min(1, cosTheta));

  // 计算夹角（弧度转换为度）
  const angleInRadians = Math.acos(clippedCosTheta);
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  // 计算方向（使用叉积）
  const crossProduct = AB.x * BC.y - AB.y * BC.x;

  // 如果叉积为负
  let angle: number =
    crossProduct < 0 ? angleInDegrees - 180 : 180 - angleInDegrees;

  //计算的夹角是方位角
  if (azimuth) {
    angle = angle < 0 ? angle + 360 : angle;
  }

  const { angleBA, angleBC } = calculateAnglePointInternal(points);

  let rotate = 0;
  if (angleBA < 0 && angleBC < 0) {
    rotate = -Math.max(Math.abs(angleBA), Math.abs(angleBC));
  }
  if (angleBA > 0 && angleBC > 0) {
    rotate = Math.min(Math.abs(angleBA), Math.abs(angleBC));
  }

  //第一二三象限 不同象限

  if (angleBA >= 135 && angleBA <= 180 && angleBC <= -45 && angleBC >= -90) {
    rotate = angleBA;
  }
  if (angleBC >= 135 && angleBC <= 180 && angleBA <= -45 && angleBA >= -90) {
    rotate = angleBC;
  }

  if (angleBA >= 135 && angleBA <= 180 && angleBC <= 0 && angleBC >= -45) {
    rotate = angleBC;
  }
  if (angleBC >= 135 && angleBC <= 180 && angleBA <= 0 && angleBA >= -45) {
    rotate = angleBA;
  }

  if (angleBA >= 90 && angleBA <= 135 && angleBC <= 0 && angleBC >= -45) {
    rotate = angleBC;
  }
  if (angleBC >= 90 && angleBC <= 135 && angleBA <= 0 && angleBA >= -45) {
    rotate = angleBA;
  }
  if (angleBA >= 90 && angleBA <= 135 && angleBC >= -90 && angleBC <= -45) {
    rotate = angleBA;
  }

  if (angleBC >= 90 && angleBC <= 135 && angleBA >= -90 && angleBA <= -45) {
    rotate = angleBC;
  }

  if (angleBA >= 0 && angleBA <= 90 && angleBC <= 0 && angleBC >= -90) {
    rotate = angleBC;
  }

  if (angleBC >= 0 && angleBC <= 90 && angleBA <= 0 && angleBA >= -90) {
    rotate = angleBA;
  }

  //第一二四象限不同象限
  if (angleBC >= -180 && angleBC <= -90 && angleBA <= 180 && angleBA >= 90) {
    rotate = angleBA;
  }

  if (angleBA >= -180 && angleBA <= -90 && angleBC <= 180 && angleBC >= 90) {
    rotate = angleBC;
  }

  if (angleBC >= -135 && angleBC <= -90 && angleBA >= 0 && angleBA <= 45) {
    rotate = angleBC;
  }

  if (angleBC >= -135 && angleBC <= -90 && angleBA >= 45 && angleBA <= 90) {
    rotate = angleBA;
  }

  if (angleBA >= -135 && angleBA <= -90 && angleBC >= 0 && angleBC <= 45) {
    rotate = angleBA;
  }

  if (angleBA >= -135 && angleBA <= -90 && angleBC >= 45 && angleBC <= 90) {
    rotate = angleBC;
  }

  if (angleBC >= -180 && angleBC <= -135 && angleBA >= 0 && angleBA <= 45) {
    rotate = angleBC;
  }

  if (angleBC >= -180 && angleBC <= -135 && angleBA >= 45 && angleBA <= 90) {
    rotate = angleBA;
  }

  if (angleBA >= -180 && angleBA <= -135 && angleBC >= 0 && angleBC <= 45) {
    rotate = angleBA;
  }
  if (angleBA >= -180 && angleBA <= -135 && angleBC >= 45 && angleBC <= 90) {
    rotate = angleBC;
  }

  return {
    Angle: Number(Math.abs(angle.toFixed(0))),
    rotate: rotate,
    rotation: (angle * Math.PI) / 180,
  };
};

/**
 * 计算夹角度数
 * @param points
 * @returns
 */
export const calculateAnglePointInternal = (
  points: Array<[number, number]>
) => {
  const [A, B, C] = points;
  const [Ax, Ay] = A;
  const [Bx, By] = B;
  const [Cx, Cy] = C;

  // 计算向量 BA 和 BC
  const BA = { x: Ax - Bx, y: Ay - By }; // BA 向量（从 B 到 A）
  const BC = { x: Cx - Bx, y: Cy - By }; // BC 向量（从 B 到 C）

  // 计算 BA 和 BC 向量与 X 轴的夹角（单位：度）
  let angleBA = Math.atan2(BA.y, BA.x) * (180 / Math.PI); // [-180, 180] 范围
  let angleBC = Math.atan2(BC.y, BC.x) * (180 / Math.PI); // [-180, 180] 范围

  // 计算 BA 向量与 X 轴负半轴的夹角
  if (angleBA >= 0 && angleBA < 90) {
    // 第一象限，夹角为正钝角
    angleBA = 180 - angleBA;
  } else if (angleBA >= 90 && angleBA <= 180) {
    // 第二象限，夹角为正锐角
    angleBA = 180 - angleBA;
  } else if (angleBA < 0 && angleBA >= -90) {
    // 第四象限，夹角为负钝角
    angleBA = Math.abs(angleBA) - 180;
  } else {
    // 第三象限，夹角为负锐角
    angleBA = Math.abs(angleBA) - 180;
  }

  // 计算 BC 向量与 X 轴负半轴的夹角
  if (angleBC >= 0 && angleBC < 90) {
    // 第一象限，夹角为正钝角
    angleBC = 180 - angleBC;
  } else if (angleBC >= 90 && angleBC <= 180) {
    // 第二象限，夹角为正锐角
    angleBC = 180 - angleBC;
  } else if (angleBC < 0 && angleBC >= -90) {
    // 第四象限，夹角为负钝角
    angleBC = Math.abs(angleBC) - 180;
  } else {
    // 第三象限，夹角为负锐角
    angleBC = Math.abs(angleBC) - 180;
  }

  return {
    angleBA: angleBA, // BA 向量与 X 轴负半轴的夹角
    angleBC: angleBC, // BC 向量与 X 轴负半轴的夹角
  };
};

export const getAngle = (adjustedAngle: number) => {
  // 反推 angle
  let angle = (adjustedAngle + 90) % 360;

  // 根据范围调整
  if (angle < 270) {
    angle += 360;
  }
  return angle;
};

/**
 * 创建夹角圆弧
 * @param Angles {Angle:夹角度数，rotate：旋转度数}
 * @returns
 */
export const createAngleSVG = (Angles: { Angle: number; rotate: number }) => {
  const adjustedAngle = getAngle(Angles.Angle);
  const radius = 40; // 半径
  const centerX = 100; // 圆心 X 坐标
  const centerY = 100; // 圆心 Y 坐标
  const endY = centerY + radius * Math.cos((adjustedAngle * Math.PI) / 180);
  const endX = centerX - radius * Math.sin((adjustedAngle * Math.PI) / 180);
  const startY = centerX;
  const startX = centerY - radius;

  // const largeArcFlag = adjustedAngle > 180 ? 0 : 1;

  let largeArcFlag;
  if (adjustedAngle >= 450 && adjustedAngle <= 629) {
    largeArcFlag = 0;
  } else if (adjustedAngle >= 270 && adjustedAngle < 450) {
    largeArcFlag = 1;
  }

  const d_1 = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  const d_2 = `M ${endX} ${endY} L ${startX} ${endY}  L${startX} ${startY}`;
  const angle = Math.abs(adjustedAngle);

  let lastD = d_1;
  if (angle == 540) {
    lastD = d_2;
  }

  let svgText =
    Angles.Angle == 90
      ? ""
      : `<text fill="black" font-size="16" text-anchor="middle">
              <textPath href="#arc" startOffset="50%" side="left">
                  <tspan dy="-5">${Angles.Angle}°</tspan>
              </textPath>
          </text>`;

  const svgstr = `<svg width="200" height="200" viewBox="0 0 200 200" style="transform:rotate(${Angles.rotate}deg);transform-origin: 100px 100px;"  transform="rotate(${Angles.rotate})" xmlns="http://www.w3.org/2000/svg">
          <path id="arc" fill="none" stroke="red" stroke-width="1" d="${lastD}" />${svgText}</svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgstr);
};
