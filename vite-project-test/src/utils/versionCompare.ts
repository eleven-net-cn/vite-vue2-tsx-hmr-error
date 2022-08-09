import store from '@/store/index';
import { COMPARE_SYMBOL } from '@/types';

export const maxVersion = (...versionList:string[]) => {
  // 从大到小排序
  const versionListMaxToMin:Array<string> = [];
  versionList.forEach(version1 => {
    const versionArray1 = version1.split('.');
    const verisonArrayNumber1 = versionArray1.map(val => Number(val));
    // 首次直接push
    if (!versionListMaxToMin.length) {
      versionListMaxToMin.unshift(version1);
      return;
    }
    // 插排
    versionListMaxToMin.forEach((version2, index) => {
      const versionArray2 = version2.split('.');
      const verisonArrayNumber2 = versionArray2.map(val => Number(val));
      const versionMinLength = Math.max(versionArray2.length, versionArray1.length);
      const versionNoZero2 = verisonArrayNumber2.join('.');
      const versionNoZero1 = verisonArrayNumber1.join('.');
      // 如果两个版本都一样 ，则加到最前面
      if (versionNoZero2 === versionNoZero1) {
        versionListMaxToMin.splice(index, 0, version1);
        return;
      }
      for (let i = 0; i < versionMinLength; i++) {
        // 原数组
        const item1 = verisonArrayNumber1[i];
        // 已排序数组
        const item2 = verisonArrayNumber2[i];
        // 如果大于则插入到它的前面
        if (item1 > item2) {
          versionListMaxToMin.splice(index, 0, version1);
          break;
        } else if (item1 < item2 && index === versionListMaxToMin.length - 1) {
          // 如果是小于的话并且已经比到了最后一个比最后一个小或者比，则加到最后面
          versionListMaxToMin.push(version1);
          break;
        } else if (i === versionMinLength - 1) {
          if (verisonArrayNumber1 > verisonArrayNumber2) {
            versionListMaxToMin.splice(index, 0, version1);
          } else if (index === versionListMaxToMin.length - 1) {
            versionListMaxToMin.push(version1);
          }
        }
      }
    });
  });
  return versionListMaxToMin[0];
};
const compare = (version1, version2) => {
  if (version1 === version2) return 'eq';
  const maxV = maxVersion(version1, version2);
  if (maxV === version1) {
    return 'gt';
  }
  return 'lt';
};

export const compareVersion = (version1, compareSymbol:COMPARE_SYMBOL, version2) => {
  const compareResult = compare(version1, version2);
  // 结果为等于
  if (compareResult === 'eq') {
    return ['eq', 'ge', 'le'].includes(compareSymbol);
  }
  if (['ne'].includes(compareSymbol)) {
    return true;
  }
  // 结果为小于
  if (compareResult === 'lt') {
    return ['le', 'lt'].includes(compareSymbol);
  }
  if (compareResult === 'gt') {
    return ['ge', 'gt'].includes(compareSymbol);
  }
  return false;
};

/**
 * @param compareSymbol 用于对比的符号
 * GE —— `>=`
 *
 * LE —— `<=`
 *
 * EQ —— `=`
 *
 * GT —— `>`
 *
 * LT —— `<`
 *
 * @param version 用于对比的version字符串，比如`1.10.12`
 *
 */
export const compareBuildver = (compareSymbol:COMPARE_SYMBOL, version) => compareVersion(store.state.baseInfo.buildVer, compareSymbol, version);
