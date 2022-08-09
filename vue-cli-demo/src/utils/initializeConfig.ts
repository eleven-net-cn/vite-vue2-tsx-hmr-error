import newId from './newId';

export const fmtConfig = (config, deepCopy?:boolean) => {
  let id;
  // eslint-disable-next-line prefer-const
  ({ id, ...config } = deepCopy ? JSON.parse(JSON.stringify(config)) : config);
  // 将id放到最前面
  config = {
    id,
    ...config
  };
  const defaultOptionsList = [
    {
      key: 'modId',
      val: 0
    },
    {
      key: 'otherOptions',
      val: {}
    },
    {
      key: 'editOptions',
      val: {}
    },
    {
      key: 'enabled',
      val: true
    },
    {
      key: 'version',
      val: 'latest'
    },
    {
      key: 'label',
      val: '未命名组件'
    }
  ];
  // 为这几个设置默认值
  defaultOptionsList.forEach(item => {
    config[item.key] = config[item.key] ?? item.val;
  });
  // 别名
  config.alias = config.alias ?? config.label;
  // 样式
  config.boxStyle = {
    // 默认相对定位
    position: 'relative',
    ...(config.boxStyle || {})
  };
  // 如果元素为绝对定位，则需要预设left和top值
  if (config.boxStyle.position !== 'relative') {
    if (!['left', 'right'].some(key => config.boxStyle[key])) {
      config.boxStyle.left = '0rem';
    }
    if (!['top', 'bottom'].some(key => config.boxStyle[key])) {
      config.boxStyle.top = '0rem';
    }
  }
  // 对事件进行一次过滤，因为考虑到事件后面加了两个属性
  config.events?.forEach((item) => {
    item.source = item.source || config.id;
    item.compare = item.compare || {};
  });
  return config;
};
export const getDefaultState = (linkStateMsg) => {
  if (!linkStateMsg) return;
  const defaultState = {};
  Object.keys(linkStateMsg).forEach(key => {
    const linkStateMsgItem = linkStateMsg[key];
    const defaultVal = linkStateMsgItem.default;
    if (defaultVal === undefined) return;
    defaultState[key] = defaultVal;
  });
  return defaultState;
};
export default function initializeConfig(config) {
  return fmtConfig({ ...config, id: newId() });
}
