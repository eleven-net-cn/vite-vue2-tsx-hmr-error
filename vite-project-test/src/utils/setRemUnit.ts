import styleConst from '@/constants/style';

let rem;
const base = 100;
export default function setRemUnit(
  docWidth: number,
  widthParam: number,
) {
  const docEl = document.documentElement;
  rem = docWidth / widthParam * base;
  docEl.style.fontSize = `${rem}px`;
  console.log('setRemUnit: ', docWidth, widthParam, rem);
  const nowRem = parseFloat(window.getComputedStyle(docEl).fontSize);
  rem *= (rem / nowRem);
  docEl.style.fontSize = `${rem}px`;
}
export function rem2px(remVal: number, retNum = true) {
  if (remVal === null || remVal === undefined) {
    return retNum ? 0 : '';
  }
  const count = remVal * rem;
  return retNum ? count : `${count}px`;
}
export function px2rem(pxVal: number, retNum = false) {
  if (pxVal === null || pxVal === undefined) {
    return retNum ? 0 : '';
  }
  const count = pxVal / rem;
  return retNum ? count : `${count.toFixed(styleConst.remPrecise)}rem`;
}

// 设计稿宽度to rem
export function dpx2rem(pxVal: number, retNum = false) {
  if (pxVal === null || pxVal === undefined) {
    return retNum ? 0 : '';
  }
  const count = pxVal / base;
  return retNum ? count : `${count.toFixed(styleConst.remPrecise)}rem`;
}
