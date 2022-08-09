export function loadImage(src: string, timeout = 10000) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    // const base64DataSrcRe = /^data:/
    // 规避base64图设置crossOrigin = 'Anonymous'引起的兼容问题
    // if (!base64DataSrcRe.test(src)) {
    //   img.crossOrigin = 'Anonymous'
    // }
    const timer = setTimeout(() => {
      reject({
        msg: `loadImage timeout: ${src}`,
        src
      });
    }, timeout);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = err => {
      clearTimeout(timer);
      reject(err);
    };
    img.src = src;
  });
}

// 预加载图片资源
export default function preloadImages(srcArr: string[], timeout = 10000) {
  return Promise.all(srcArr.map(item => loadImage(item, timeout)));
}
