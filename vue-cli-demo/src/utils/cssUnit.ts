// 拆分css值与单位
export const getCssValAndUnit = (value = '') => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  const valveArr = value.match(/^(-?\d*\.?\d*)(rem|%|px|em|vh|vw)$/);
  // 目前只识别一种固定的calc
  const calcMatch = value.match(/^calc\(50% - (.*)\)$/);
  if (calcMatch) {
    const calcItem = getCssValAndUnit(calcMatch[1]);
    if (!calcItem) return undefined;
    return {
      val: calcItem.val,
      unit: 'calc',
      calcUnit: calcItem.unit
    };
  }
  if (!valveArr) {
    return undefined;
  }
  return {
    val: Number(valveArr[1]),
    unit: valveArr[2]
  };
};

export const formatTranslate = (styleString = '') => {
  const match = styleString.match(/translate\((-?\d*\.?\d*)(rem|%|px|em|vh|vw),(-?\d*\.?\d*)(rem|%|px|em|vh|vw)\)/);
  if (!match) return;
  // 分别为x偏移和y偏移
  return {
    x: {
      num: Number(match[1]),
      unit: match[2],
      value: match[1] + match[2]
    },
    y: {
      num: Number(match[3]),
      unit: match[4],
      value: match[3] + match[4]
    }
  };
};
export const formatScale = (styleString = '') => {
  const match = styleString.match(/scale\((\d*\.?\d*)\)/);
  // 分别为x偏移和y偏移
  return Number(match?.[1]) || 0;
};

export const toFixed = (val, n = 0) => Number(Number(val).toFixed(n));
/**
 * 有有效值的判定
 * 不包括除0以外的假值以及Infinity
 */
export const hasVal = (value) => (value || value === 0) && (![Infinity, -Infinity].includes(value));
/**
  * 有有效值值并且值可以转化为有效的数字
  * 不包括除0以外的假值以及Infinity
  */
// eslint-disable-next-line no-self-compare
export const isNumber = (data) => hasVal(data) && (Number(data) === Number(data));
