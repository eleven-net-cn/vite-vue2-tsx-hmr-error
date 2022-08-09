// 资源处理用
import { PUZZLE_RES_REG, VENDOR_RES_REG, RES_TYPE_MAP } from '@/constants/resource';

// 通过拓展名判断资源类型
const checkResTypeByExtension = (extension) => RES_TYPE_MAP[extension] || 'other';

export const getResMsgByUrl = (url) => {
  const puzzleReg = new RegExp(PUZZLE_RES_REG);
  const vendorReg = new RegExp(VENDOR_RES_REG);
  if (!url || typeof url !== 'string') return undefined;
  const puzzleMatch = [...url.matchAll(puzzleReg)];
  const vendorMatch = [...url.matchAll(vendorReg)].filter(item => !puzzleMatch.find(puzzleItem => puzzleItem[0] === item[0]));
  const match = [...puzzleMatch, ...vendorMatch];
  if (!match.length) return undefined;
  return match.map((matchItem, index) => {
    const extension = matchItem[matchItem.length - 1];
    const type = checkResTypeByExtension(extension);
    return {
      // 是否是puzzle上传的资源
      isPuzzleRes: Boolean(index < puzzleMatch.length),
      extension,
      type,
      url: matchItem[0]
    };
  });
};
