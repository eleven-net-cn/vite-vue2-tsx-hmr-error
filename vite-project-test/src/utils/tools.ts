// @ts-nocheck
export const debounce = (fn, time, first = false, end = true) => {
  let timer:any = null;
  const setTimer = function (...params) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (end) {
        fn.call((this as any), ...params);
      }
      timer = null;
    }, time);
  };
  return function (...params) {
    if (!timer && first) {
      fn.call(this, ...params);
    }
    // 每次都刷新timer
    setTimer.call(this, ...params);
  };
};
// 首字母大写
export const initialToUpperCase = (str:string) => {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
};
