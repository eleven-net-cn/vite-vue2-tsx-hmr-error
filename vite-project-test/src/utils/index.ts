export { default as newId, newEventId } from './newId';
export { default as loadComp } from './loadComp';
export { default as findNode } from './findNode';
export { default as traverseNodes, getDefNodes, getCopyNodeConifg } from './traverseNodes';
export { default as dfsNodes } from './dfsNodes';
export { default as openDialog } from './openDialog';
export { default as initializeConfig, fmtConfig, getDefaultState } from './initializeConfig';
export { default as formatTime } from './formatTime';
export {
  default as setRemUnit, px2rem, rem2px, dpx2rem
} from './setRemUnit';
export { default as getPageUrls } from './getPageUrls';
export { deleteBridge, setBridge, sendDataToIframe } from './iframeBridge';
export { maxVersion, compareVersion } from './versionCompare';
export { getCssValAndUnit } from './cssUnit';
export const getBgImg = (backgroundImage: string) => backgroundImage?.replace(/url\(|\)|"|'/g, '');
