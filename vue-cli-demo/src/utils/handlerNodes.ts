import {
  INodeConfig
} from '@/types';
import {
  LOCK_DATA_MAP, NO_RESIZE_MAP, NO_ACTIVE_MAP, NO_EDIT_STYLE_MAP
} from '@/constants/';
import { getCssValAndUnit } from './cssUnit';
// 格式化元素的编辑项
export const formateEditOptions = (editOptions:any) => {
  if (!editOptions) return {};
  let _editOptions = { ...editOptions };
  // 如果元素被锁定
  if (_editOptions.locked) {
    _editOptions = {
      ..._editOptions,
      ...LOCK_DATA_MAP
    };
  }
  // 如果元素不可被激活则加入这些属性
  if (_editOptions.noActive) {
    _editOptions = {
      ..._editOptions,
      ...NO_ACTIVE_MAP
    };
  }

  if (_editOptions.noEditStyle) {
    _editOptions = {
      ..._editOptions,
      ...NO_EDIT_STYLE_MAP
    };
  }
  if (_editOptions.noResize) {
    _editOptions = {
      ..._editOptions,
      ...NO_RESIZE_MAP
    };
  }
  return _editOptions;
};

// 判断元素当前的定位方式
export const checkPositionType = (boxStyle:INodeConfig['boxStyle'] = {}) => {
  const {
    left, top, right, bottom
  } = (boxStyle as any);
  const positionOptions = {
    left, top, right, bottom
  };
  // 定位方式默认为左上角
  let positionType = 'tl';
  Object.keys(positionOptions).map(key => {
    if (!positionOptions[key]) return;
    let type = key.slice(0, 1);
    // 默认按这种格式来代表居中
    if (/^calc\(50% - .*\)$/.test(positionOptions[key])) {
      type = 'm';
    }
    if (['left', 'right'].includes(key)) {
      positionType = positionType.slice(0, 1) + type;
    } else {
      positionType = type + positionType.slice(-1);
    }
  });
  return positionType;
};
export const setPosition = (val:string): string|undefined => {
  const valMsg = getCssValAndUnit(val);
  if (!valMsg) return val;
  const offsetMap = {
    px: 30
  };
  const offset = offsetMap[valMsg.calcUnit || valMsg.unit] || 0.3;
  if (valMsg.unit === 'calc') {
    return `calc(50% - ${valMsg.val + offset}${valMsg.calcUnit})`;
  }
  return `${valMsg.val + 0.3}${valMsg.unit}`;
};
