import { INodeConfig } from '@/types';

export default function findNode(nodes: INodeConfig[], dst: string, {
  dstOption = 'id',
} = {}): INodeConfig | null {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  let target: INodeConfig | null = null;
  nodes.every((node) => {
    if (node[dstOption] === dst) {
      target = node;
      return false;
    }
    if (node.children && node.children.length > 0) {
      const res = findNode(node.children, dst, { dstOption });
      if (res) {
        target = res;
        return false;
      }
    }
    return true;
  });
  return target;
}
