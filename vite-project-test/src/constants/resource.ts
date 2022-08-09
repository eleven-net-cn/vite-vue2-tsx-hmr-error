import { MI18N_RES_TYPE } from '@/types';

export const PUZZLE_RES_REG = /https:\/\/(webstatic|hoyoverse)-test\.mihoyo\.com\/upload\/(puzzle|static-resource|static-resource-sea)\/\d{4}\/\d{1,2}\/\d{1,2}\/[^:]+?\.(png|jpeg|jpg|gif|mp4|mp3|ts)/g;
export const VENDOR_RES_REG = /https?:\/\/[^:]+\.(png|jpeg|jpg|gif|mp4|mp3|ts)/g;
export enum RES_TYPE{
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  // OTHER = 'other'
}
export const RES_TYPE_LIST = {
  [RES_TYPE.IMAGE]: {
    label: '图片'
  },
  [RES_TYPE.VIDEO]: {
    label: '视频'
  },
  [RES_TYPE.AUDIO]: {
    label: '音频'
  },
  // [RES_TYPE.OTHER]: {
  //   label: '其他'
  // }
};

export const MI18N_RES_TYPES = [
  {
    label: '文本',
    value: MI18N_RES_TYPE.TEXT
  },
  {
    label: '图片',
    value: MI18N_RES_TYPE.IMAGE
  },
  {
    label: '视频',
    value: MI18N_RES_TYPE.VIDEO
  },
  {
    label: '音频',
    value: MI18N_RES_TYPE.AUDIO
  }
];

export const RES_TYPE_MAP = {
  png: RES_TYPE.IMAGE,
  jpeg: RES_TYPE.IMAGE,
  jpg: RES_TYPE.IMAGE,
  gif: RES_TYPE.IMAGE,
  mp3: RES_TYPE.AUDIO,
  mp4: RES_TYPE.VIDEO,
  ts: RES_TYPE.VIDEO,
};
export const TYPE_RES_MAP = {};

Object.keys(RES_TYPE_MAP).forEach(resType => {
  const type = RES_TYPE_MAP[resType];
  if (!TYPE_RES_MAP[type]) {
    TYPE_RES_MAP[type] = [resType];
    return;
  }
  TYPE_RES_MAP[type].push(resType);
});
