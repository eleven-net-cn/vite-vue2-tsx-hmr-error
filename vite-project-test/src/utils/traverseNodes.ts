import { INodeConfig } from '@/types';
import initializeConfig from './initializeConfig';

export default function traverseNodes(
  nodes: INodeConfig[],
  callback: (node: INodeConfig) => INodeConfig
) {
  return nodes.map((node) => {
    if (node.children && node.children.length > 0) {
      node.children = traverseNodes(node.children, callback);
    }

    return callback(node);
  });
}

export function traverseNodesWithFilter(
  nodes: INodeConfig[],
  callback: (node: INodeConfig) => INodeConfig | undefined
) {
  return nodes.map((node) => {
    if (node.children && node.children.length > 0) {
      node.children = traverseNodesWithFilter(node.children, callback);
    }
    return callback(node);
  }).filter(x => x) as INodeConfig[];
}

export const getDefNodes = (nodes, callback) => nodes?.map?.((node) => {
  // 用户手动修改节点
  const newNode = callback({ ...node });
  if (newNode.children && newNode.children.length > 0) {
    newNode.children = getDefNodes(newNode.children, callback);
  }
  return newNode;
});
interface IdMap {
  [key:string]:string;
}
// todo 复制后事件的target与source处理
export const getCopyNodeConifg = (node) => {
  const preIdMap:IdMap = {};
  // 遍历一次复制所有节点，并拿到节点所有id
  let newNode = traverseNodes([JSON.parse(JSON.stringify(node))], (item) => {
    const preId = item.id;
    const fmtConfig = initializeConfig(item);
    const curId = fmtConfig.id;
    preIdMap[preId] = curId;
    const copyIndex = (fmtConfig.fmtConfig || 1) + 1;
    const matchIndex = item.alias.match(/(.*?)(\d+)$/);
    const alias = matchIndex ? `${matchIndex[1]}${(Number(matchIndex[2]) || 1) + 1}` : `${item.alias}2`;
    return {
      ...fmtConfig,
      copyIndex,
      alias
    };
  })[0];
  // 遍历复制后的节点，如果有使用之前的id，则转化为之前的id对应的当前id
  newNode = JSON.parse(JSON.stringify(newNode, (key, val) => {
    if (typeof val !== 'string' || !preIdMap[val]) return val;
    return preIdMap[val];
  }));
  return newNode;
};
