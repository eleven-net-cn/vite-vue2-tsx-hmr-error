/*
 * 测试幽灵依赖
 * @Author: Eleven 
 * @Date: 2022-07-20 19:21:22 
 * @Last Modified by: Eleven
 * @Last Modified time: 2022-07-20 19:27:32
 */

import { cloneDeep } from 'lodash';

const TEST = {
  k1: {
    a: 1,
    b: 2,
  },
  k2: {
    c: 3,
    d: 4,
  },
};

const TEST_CLONE_DEEP = cloneDeep(TEST);

console.log('Run import-lodash...');
console.log('TEST_CLONE_DEEP: ', TEST_CLONE_DEEP);
