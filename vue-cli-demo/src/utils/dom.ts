export const getParentList = (el:Node) => {
  let curDom = el;
  const parentList:Node[] = [];
  while (curDom.parentNode) {
    parentList.push(curDom.parentNode);
    curDom = curDom.parentNode;
  }
  return parentList;
};
