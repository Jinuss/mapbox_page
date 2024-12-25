export const formatDistance = (dis: number) => {
    if (dis > 100) {
        return Math.round((dis / 1000) * 100) / 100 + " " + "km";
    } else {
        return Math.round(dis * 100) / 100 + " " + "m";
    }
};

export const formatArea = (area: number) => {
    if (area > 1000000) {
        return Math.round((area / 1000000) * 100) / 100 + " " + "km²";
    } else {
        return Math.round(area * 100) / 100 + " " + "m²";
    }
};