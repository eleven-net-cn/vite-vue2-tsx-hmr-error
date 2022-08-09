import gameBizZoneMap from './gameBizZoneMap';

export const getDefaultZone = (biz) => {
  let cnTime;
  if (biz.endsWith('_cn')) {
    cnTime = 8;
  }
  return cnTime ?? gameBizZoneMap[biz];
};
