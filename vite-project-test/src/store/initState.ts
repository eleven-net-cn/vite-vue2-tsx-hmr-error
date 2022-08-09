import {
  INodeConfig, IBaseInfo, IState, Platform, PlatMsg
} from '@/types';
import constants from '@/constants';

const getInitPlatMsg = (platform:Platform, pageMode?:number, flexibleOptions?:any) => {
  const initPlatMsg = {
    body: {
      backgroundImage: '',
      backgroundColor: '#fff',
      backgroundPosition: 'top',
      backgroundAttachment: 'local',
      width: 0,
      fullScreen: ''
    },
    // 跳转的地址
    jumpUrl: '',
    // 当前的页面模式目前只有slidepage 和 normal两种
    mode: '',
    // 自动预加载前5张图(排除分享图)
    preloadNum: 5,
    resources: {},
    // 默认两端都开启
    enable: true
  };
  let platInitBodyConfig;
  if (flexibleOptions) {
    platInitBodyConfig = constants.compPageMode;
  } else {
    platInitBodyConfig = constants.pageModeMap.find(item => item.value === pageMode) || constants.pageModeMap[0];
  }

  return {
    ...initPlatMsg,
    mode: platInitBodyConfig.mode,
    body: {
      ...initPlatMsg.body,
      fullScreen: platInitBodyConfig.fullScreen,
      ...platInitBodyConfig[`${platform}InitState`],
      flexibleOptions
    },
  };
};
const getInitBaseInfo = () => ({
  id: 0,
  // gamebizList的第一个
  game_biz: '',
  // 选择的服务列表
  bizList: [],
  // 当前项目的id
  publish_key: '',
  // 后端接口的key
  eventKey: '',
  // 埋点用的belong
  statKey: '',
  // 如果非多语言的情况下，会有lang参数明示语言
  lang: '',
  // 渲染版本
  buildVer: '',
  // 几个埋埋点的id
  cnzzSiteId: '',
  miaAppId: '',
  gaId: '',
  isDevop: false,
  // 在有多语言的情况下，有对应区服对应的语言参数，按照多语言系统为准
  langMap: undefined,
  // 国内的head
  head: {
    title: '',
    desc: '',
    keywords: '',
    icon: '',
  },
  // 海外的head
  seaHead: {
    shareTitle: '',
    shareDesc: '',
    shareImage: '',
    icon: '',
    desc: '',
    keywords: ''
  },
  share: {
    enable: false,
    title: '',
    desc: '',
    img: ''
  },
  merlinList: {},
  cookieTip: {
    enable: false
  },
  mi18n: {
    enable: false,
    key: '',
  },
  script: {
    enable: false,
    srcs: []
  },
  uploadCompress: false,
  hasGameBgm: true,
  // 使用服务器时间
  useSeverTime: false,
  previewPlatList: [],
  publicPath: true,
  /** 默认为false，index（edit index初始化的时候根据是否为页面组件来设置默认true） */
  landscapeTip: false,
  customMi18nKey: {}
} as IBaseInfo);
const getInitState = (platform:Platform, pageMode?:number) => {
  const initState: IState = {
    funcModules: [],
    compList: {},
    // 当前的编辑模式
    modeType: 'edit',
    // 当前的节点列表
    nodes: [] as INodeConfig[],
    // 当前页面的基础信息
    baseInfo: getInitBaseInfo(),
    // 当前渠道的信息
    platMsg: getInitPlatMsg(platform, pageMode),
    // 当前激活元素的id
    activeNodeId: '',
    // 滚屏以及全屏模式当前激活的节点
    activePageIdx: 0,
    // 当前激活元素生效的状态key
    // 多状态名称的格式为 /pzstate\d+-/
    activeNodeStateKey: '',
    // 当前放入新窗口中的nodeID
    activeScreenNodeId: [],
    // 当前所有存在元素的补充状态
    nodesProInPage: {},
    // 当前所有元素的额外编辑用的配置项 id:配置项
    nodesEditOptions: {},
    // 当前的画布元素
    canvasContainerEl: null,
    // 多语言的链接
    mi18nAdminUrl: '',
    // 当前选择的区服
    gameBiz: '',
    // 当前选择的语言
    lang: '',
    // 当前mi18n的信息
    mi18nData: {},
    ctrlKeyDown: false,
    // 当前屏幕列表
    screenList: [],
    // 预览模式下一些额外的参数
    previewExtraParams: [],
    // 画布的各类信息
    canvasTransformData: {
      // 画布的缩放
      scale: 1,
      // 画布的位移
      x: 0,
      y: 0,
      // 画布未缩放位移之前的各类属性
      offsetLeft: 0,
      offsetTop: 0,
      clientWidth: 0,
      clientHeight: 0
    },
    // 当前激活的元素的各类样式,单位都是px，为真实的缩放后的大小
    currentActiveElStyleNum: {
      // 相对于屏幕的left和top
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      // 真实的left和top
      top: 0,
      left: 0,
      marginLeft: 0,
      marginTop: 0,
      marginBottom: 0,
      marginRight: 0
    },
    // 鼠标按下时候在全局的位置
    mouseDownPosition: {
      x: 0,
      y: 0
    },
    // 当前的渠道
    platform: Platform.H5,
    // 元素拖拽开始
    duringDrag: false,
    // 拖拽过程当中的样式
    dragActiveBoxStyle: {},
    // 当前业务的种类list
    bizList: [],
    // 页面配置
    prePageConfig: {},
    // 页面组件模块数据
    pageModule: '',
    pageStatus: '',
    customCanvas: undefined,
    previewZone: 8,
    previewTime: null,
  };
  return initState;
};
// 格式化baseInfo，保证字段结构的兼容性
export const resetBaseInfo = (baseInfo:IBaseInfo) => ({ ...getInitBaseInfo(), ...baseInfo });
// pageMode在模版模式没有该plat配置下可能为空
export const resetPlatMsg = (platform = Platform.PC, pageMode?:number, platMsg?:PlatMsg, flexibleOptions?:any) => ({ ...getInitPlatMsg(platform, pageMode, flexibleOptions), ...(platMsg || {}) });
export function generateInitState(platform = Platform.PC, pageMode?:number) {
  const initState = getInitState(platform, pageMode);
  return {
    ...initState,
    platform,
  };
}

export default generateInitState();
