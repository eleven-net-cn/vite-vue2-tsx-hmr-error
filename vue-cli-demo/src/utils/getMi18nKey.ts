import lodash from 'lodash';
import store from '@/store';
import {
  INodeConfig, Platform, COMPARE_SYMBOL, IMi18nOptionMsg, ICustomMi18nMsgs, IFmtMi18nMsg, ICreateMi18nMsg, MI18N_RES_TYPE
} from '@/types';
import { isNumber } from './cssUnit';
import { compareBuildver } from './versionCompare';
import dfsNodes from './dfsNodes';
import { getOtherStateKeyMsg } from './globalMedthod';
import { MI18N_RES_TYPES } from '@/constants/resource';
/**
 * description 生成多语言系统上的key
 * @param param.namespace key名的命名空间，比如有些key在option里，有些在event里
 * @param param.keyName 自定义的key名
 * @param param.platform 当前渠道，用于区分大渠道，一般是`pc|m`
 * @param param.nodeId 节点的ID，用于确定节点的
 * @param param.arrayIndex 数组的index，通过它去拼接数组的key
 * @todo 未来会进行层级相关的解析，就不需要组件开发者去打平组件的选项了
 */
export const getMi18nKey = ({
  platform, namespace = '', nodeId, keyName = '', arrayIndex
} : {platform?:Platform|string, namespace?:string; nodeId?:INodeConfig['id'], keyName:string, arrayIndex?:number}) => {
  // 自定义key的情况下不需要前缀id
  // 没有nodeid的时候则id为pc-
  platform = `${platform ? `${platform}-` : ''}`;
  nodeId = `${nodeId ? `${nodeId}-` : ''}`;
  namespace = `${namespace ? `${namespace}-` : ''}`;
  const id = `${platform}${nodeId}${namespace}`;
  const isArray = isNumber(arrayIndex);
  const arrayKey = compareBuildver(COMPARE_SYMBOL.LT, '2.10.45') ? '' : 'pz';
  return `${id}${keyName}${isArray ? `-${arrayKey}array-${arrayIndex}` : ''}`;
};
/**
 * 一些节点需要用到**节点名**加**描述**的方式用于区分内容
 * 比如名为【pv视频】的组件：【pv视频】-【组件多语言定义文件中定义的描述】
 * 也看
 * @param optionLabel 默认描述
 * @param alias 组件别名
 */
export const getMi18nDefaultDesc = (optionLabel, alias = '') => `${alias ? '' : `${alias}-`}${optionLabel}`;
export const getMi18nModuleName = (module:Platform|string, type:MI18N_RES_TYPE) => `${module}|${MI18N_RES_TYPES.find(item => item.value === type)?.label || MI18N_RES_TYPE.TEXT}`;
/**
 * 拿到格式化组件的多语言信息
 * @param param.optionMsg 当前多语言option的自定义选项
 * @param param.optionMsg.key 当前需要创建的option key
 * @param param.optionMsg.val 当前需要创建的option val
 * @param param.optionMsg.desc 当前创建多语言的自定义描述
 * @param param.optionMsg.item 当前创建多语言的定义信息
 * @param param.optionMsg.item.type 当前创建多语言的类型
 * @param param.optionMsg.item.optionLabel 当前创建多语言的定义label
 * @param param.index 当前为数组的话值的index
 * @param param.node 当前节点
 * @param param.module 当前多语言模块名
 * @return
 * mi18nKEY：将创建的多语言字段
 * type：将创建的多语言类型
 * module：多语言模块
 * desc：多语言描述
 *
 */
export const fmtMi18nOptionsMsg = ({
  optionMsg, index, node, module
} : {optionMsg:IMi18nOptionMsg, index?:number, node:INodeConfig, module:Platform|string, isPageCompType?:boolean}) => {
  // 普通text的字段描述为手动描述，或者组件自身设置的描述
  let desc;
  const {
    key, val, desc: opDesc, item
  } = optionMsg;
  const isPageCompType = store.getters.isPageCompType;
  const defaultDesc = getMi18nDefaultDesc(item.optionLabel, isPageCompType ? '' : node.alias);
  // 视频的默认描述为视频地址加默认描述
  if ([MI18N_RES_TYPE.AUDIO, MI18N_RES_TYPE.VIDEO].includes(item.type)) {
    // 页面级组件的情况下不需要组件别名做区别，因为只有一个组件
    desc = `<a href="${val}" target="_blank">${defaultDesc}</a>`;
  }
  // 图片的默认描述为图片地址或者默认描述
  if ([MI18N_RES_TYPE.IMAGE].includes(item.type)) {
    desc = val || defaultDesc;
  }
  // 文字的描述使用文字本身的值,如果没有则使用定义的label
  if ([MI18N_RES_TYPE.TEXT].includes(item.type)) {
    desc = val || defaultDesc;
  }
  // 优先使用手动设置的描述
  desc = opDesc || desc;
  let customKey = optionMsg.customKey;
  // 小于43版本不允许自定义key
  if (compareBuildver(COMPARE_SYMBOL.LT, '2.10.45')) {
    customKey = '';
  }
  return {
    // 创建或者更新多语言平台字段的信息
    // 页面级组件只需要自定义的名称即可，不管是自己生成还是通过自动生成
    mi18nKEY: customKey || getMi18nKey(isPageCompType ? {
      keyName: key, arrayIndex: index,
    } : {
      keyName: key, arrayIndex: index, nodeId: node.id, platform: module, namespace: 'options'
    }),
    type: item.type,
    // 多语言模块
    module: getMi18nModuleName(module, item.type),
    // 多语言描述
    desc,
    // 当前多语言字段对应的options的值
    value: val,
    // 当前多语言是否使用了自定义key
    customKey,
    node
  };
};
/**
 * @param nodeName 组件的名称，用于获取组件定义
 */
export const getMi18Def = (nodeName:INodeConfig['name']) => {
  // 在对应平台下组件列表中查找对应组件
  const comp = store.getters.allComps.find(item => item.name === nodeName);
  return comp?.main?.declarations?.mi18n || [];
};
// eslint-disable-next-line no-unused-vars
export const getMi18nCreateMsg:(msg:IFmtMi18nMsg)=>ICreateMi18nMsg = (msg:IFmtMi18nMsg) => lodash.pick(msg, ['mi18nKEY', 'type', 'module', 'desc']);

/**
 *  搜集某些节点的mi18nkey信息
 */

export const collectNodesMi18nKeys = (nodes:INodeConfig[] = [], module:Platform|string) => {
  const mi18nKeys:IFmtMi18nMsg[] = [];
  const updateMi18nOptionsKey = (data) => {
    mi18nKeys.push(fmtMi18nOptionsMsg(data));
  };
  // 搜集节点的内容
  dfsNodes(nodes, (node) => {
    if (node.otherOptions.mi18nFrom) return;
    const mi18nDef = getMi18Def(node.name); // 节点的定义了mi18n的字段
    // 所有加到多语言上的字段
    const optionMsgs:IMi18nOptionMsg[] = [];
    // 遍历组件中定义的字段查找符合标准的key,一个item代表一个多语言key
    mi18nDef.forEach?.(item => {
      // 每一个key遍历节点查找符合标准的，可能是多状态的，可能是正常状态的
      Object.keys(node.options).forEach(key => {
        const normalVal = node.options[key];
        const otherStateKeyMsg = getOtherStateKeyMsg(key);
        const realKey = otherStateKeyMsg?.originKey || key;
        // 能加入到多语言的key必须是在组件中定义过
        if (realKey !== item.optionName) return;
        // 手动定义的字段多语言信息
        const curMi18nMsg = node.otherOptions.mi18n?.[realKey] || {};
        // 有对应的key或者是多状态下的key则也加入多语言
        if (curMi18nMsg.enabled) {
          optionMsgs.push({
            key, item, val: normalVal || '', desc: curMi18nMsg.desc, customKey: curMi18nMsg.customKey
          });
        }
      });
    });
    // 只有在options没有这个key，但是勾选了该字段需要上传到多语言的时候会出现以下情况
    Object.keys((node.otherOptions.mi18n || {})).forEach(key => {
      const curMi18nMsg = (node.otherOptions.mi18n as ICustomMi18nMsgs)[key];
      // 如果该key开启了多语言选项，并且组件选项中并未遍历到过需要上传的key，则该key标记为需要上传多语言
      if (curMi18nMsg.enabled) {
        // 不考虑数组添加多语言的情况，直接为空字符串
        optionMsgs.push({
          key, val: '', item: mi18nDef.find(val => val.optionName === key), desc: curMi18nMsg.desc, customKey: curMi18nMsg.customKey
        });
      }
    });
    optionMsgs.forEach(optionMsg => {
      const item = optionMsg.item;
      // 如果检测到为数组，则判断数组的类型
      if (item.type.endsWith('[]')) {
        const type = item.type.slice(0, -2);
        (optionMsg.val as any)?.forEach?.((arrayValItem, index) => {
          updateMi18nOptionsKey({
            // 更改一下type，其他都复用，更改一下值，其他描述与key都复用
            optionMsg: { ...optionMsg, val: String(arrayValItem) || '', item: { ...item, type } }, index, node, module
          });
        });
      } else {
        updateMi18nOptionsKey({
          optionMsg, node, module
        });
      }
    });
    // 搜集节点的事件
    node.events?.forEach((event, index) => {
      if (event.data && event.mi18n) {
        // pc-id-event-0-listener 旧的
        let keyName = `${index}-${event.listener}`;
        // 大于等于这个版本event只受限于index，而不通过index + name
        if (compareBuildver(COMPARE_SYMBOL.GE, '2.10.45')) {
          // pc-id-event-0 新的
          keyName = `${index}`;
        }
        mi18nKeys.push({
          mi18nKEY: getMi18nKey({
            platform: module, nodeId: node.id, namespace: 'event', keyName
          }),
          type: MI18N_RES_TYPE.TEXT,
          module: getMi18nModuleName(module, MI18N_RES_TYPE.TEXT),
          // 事件的描述由设置的值和组件的别名组成
          desc: getMi18nDefaultDesc(event.data, node.alias),
          value: event.data,
        });
      }
    });
  });
  return mi18nKeys;
};
