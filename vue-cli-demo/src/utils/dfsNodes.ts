import { INodeConfig } from '@/types';

export default function dfsNodes(
  nodes: INodeConfig[],
  callback: (node: INodeConfig) => any
) {
  nodes.forEach((node) => {
    callback(node);
    if (node.children && node.children.length > 0) {
      dfsNodes(node.children, callback);
    }
  });
}
