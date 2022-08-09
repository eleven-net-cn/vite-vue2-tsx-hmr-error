import { nanoid, customAlphabet } from 'nanoid';

// This alphabet uses `A-Za-z0-9_-` symbols. The genetic algorithm helped
// optimize the gzip compression for this alphabet.
const urlAlphabet = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';

// 节点id生成器
export default function (len = 10) {
  return `pz-${nanoid(len)}`;
}

const eventIdGenerator = customAlphabet(urlAlphabet.replace(/-/g, ''), 10);
// 页面id生成器
export function newEventId() {
  return `pz_${eventIdGenerator()}`;
}
