// 拿到多状态的key,多语言虽然也属于多状态，但不在这个多状态key的范围内
export const getOtherStateKeyMsg = (key:string) => {
  const match = key.match(/^(pzstate\d+-)(.*)/);
  if (!match) return;
  return {
    // 当前状态完整的key
    stateKey: match[0],
    // 当前状态的名称
    stateName: match[1],
    // 当前状态的原始选项
    originKey: match[2]
  };
};
