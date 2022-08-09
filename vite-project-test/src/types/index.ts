import { HistoryRecord } from '@/utils/historyRecord';
import type { ModuleDevState } from './dev';

declare global {
  interface Window {
    historyRecord: HistoryRecord;
  }
}

export interface IEvent {
  emitter: string;
  target: string;
  listener: string;
  data: string;
  mi18n?: boolean;
}

export interface IBeData {
  versionList: number[];
  flowList: number[];
}
// 一些特殊节点类别，会对它们进行很多特殊处理
export enum NODE_CATEGORY {
  DIALOG = 'dialog',
  FULL_PAGE_CONTAINER = 'fullpageContainer',
  SWIPER_CONTAINER = 'swiperContainer',
}

/**
 * GE —— `>=`
 *
 * LE —— `<=`
 *
 * EQ —— `=`
 *
 * GT —— `>`
 *
 * LT —— `<`
 *
 */
export enum COMPARE_SYMBOL {
  GE = 'ge',
  LE = 'le',
  EQ = 'eq',
  GT = 'gt',
  LT = 'lt',
}

export interface CompDevConf {
  cdnBaseURL: string;
  namePrefix: string;
  oriName: string;
}

interface ILinkMsgList {
  state: {
    [prop: string]: any;
  };
}
interface IMi18nFrom {
  id: string;
  plat: string;
}

export interface INodeConfig {
  id: string; // 挂载DOM节点ID
  name: string; // 组件的npm name
  label: string;
  alias: string;
  version: string; // 组件semver版本号
  enabled: boolean; // 是否激活
  boxStyle: Partial<CSSStyleDeclaration>;
  appendEl?: string | Element;
  editOptions?: any;
  nodeCategory?: NODE_CATEGORY;
  // 组件props
  options: any;
  events: IEvent[];
  children?: INodeConfig[];
  beData?: IBeData;
  otherOptions: {
    linkMsgList?: ILinkMsgList[];
    mi18n?: ICustomMi18nMsgs;
    mi18nFrom?: IMi18nFrom;
  };
  __dev__?: CompDevConf;
}
export enum MI18N_RES_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  // OTHER = 'other'
}
export interface IMi18nDeclaration {
  type: MI18N_RES_TYPE;
  optionLabel: string;
  optionName?: string;
}
/**
 * 自定义多语言字段信息
 */
export interface ICustomMi18nMsg {
  customKey?: string;
  enabled?: boolean;
  desc?: string;
}

export interface ICustomMi18nMsgs {
  [key: string]: ICustomMi18nMsg;
}
/**
 * 当前选项的多语言信息
 */
export interface IMi18nOptionMsg {
  key: string;
  val: string;
  desc: ICustomMi18nMsg['desc'];
  item: IMi18nDeclaration;
  customKey?: ICustomMi18nMsg['customKey'];
  node?: INodeConfig;
}
interface LangMap {
  [key: string]: string[];
}
interface Mi18nData {
  [key: string]: string;
}

interface UrlSearchMsg {
  key: string;
  val: string;
}
// 预览用的某个渠道,包含名称、url search参数的集合
interface PreviewPlat {
  label: string;
  urlSearchList: UrlSearchMsg[];
}
interface CookieTipsConfig {
  enable: boolean;
}
/**
 * 自定义全局多语言字段信息
 */
interface ICustomMi18n {
  desc: string;
  type: IMi18nDeclaration['type'];
}
interface ICustomMi18nKey {
  [key: string]: ICustomMi18n;
}
export interface IFmtMi18nMsg {
  mi18nKEY: string;
  type: IMi18nDeclaration['type'];
  module: Platform | string;
  desc: string;
  value: IMi18nOptionMsg['val'];
  customKey?: IMi18nOptionMsg['customKey'];
}

export interface ICreateMi18nMsg {
  mi18nKEY: IFmtMi18nMsg['mi18nKEY'];
  type: IFmtMi18nMsg['type'];
  module: IFmtMi18nMsg['module'];
  desc: IFmtMi18nMsg['desc'];
}
interface DomainList {
  sea: string;
  cn: string;
}
interface merlinList {
  [key: string]: IBeData;
}
export interface IBaseInfo {
  id: number;
  // url?: string;
  game_biz: string;
  bizList: string[];
  eventKey: string;
  statKey: string;
  publish_key: string;
  lang: string;
  langMap?: LangMap;
  merlinList: merlinList;
  buildVer: string; // 构建时的模板版本
  cnzzSiteId?: string;
  gaId: string;
  miaAppId: string;
  publicPath?: boolean; // 构建时是否启用publicPath
  hasGameBgm?: boolean; // 关闭游戏bgm
  useSeverTime?: boolean; // 使用服务器时间
  uploadCompress: boolean; // 是否开启上传压缩
  isDevop: boolean;
  domainList?: DomainList;
  commonDomainList?: DomainList;
  head: {
    title: string;
    desc: string;
    keywords: string;
    icon: string;
  };
  seaHead: {
    desc: string;
    keywords: string;
    shareTitle: string;
    shareDesc: string;
    shareImage: string;
  };
  share: {
    enable: boolean;
    title: string;
    desc: string;
    img: string;
  };
  accountRole?: {
    uidLogin: boolean;
    theme: { sea?: string; cn?: string };
  };
  cookieTip: CookieTipsConfig | boolean;
  mi18n?: {
    enable: boolean;
    key: string;
  };
  script?: {
    enable: boolean;
    srcs: string[];
  };
  previewPlatList: PreviewPlat[];
  /** 横竖屏提示 */
  landscapeTip: boolean;
  customMi18nKey: ICustomMi18nKey;
}

interface Resources {
  [key: string]: {
    type: string;
    preload: boolean;
  };
}
export interface CustomCanvasMsg {
  width?: number;
  height?: number;
}
/** 针对背景的配置项 */
export interface IBgConfig {
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  custombackgroundSizeHeight?: string;
  custombackgroundSizeWidth?: string;
  backgroundRepeat?: string;
  backgroundColor?: string;
  backgroundAttachment?: string;
  backgroundClip?: string;
  backgroundOrigin?: string;
}

export interface PlatMsg {
  enable: boolean;
  body: {
    width: number;
    height?: number;
    backgroundColor: string;
    backgroundImage?: string;
    fullScreen?: string;
    backgroundListConfig?: IBgConfig[];
  };
  // 页面用到的资源列表
  resources: Resources;
  preloadNum: number; // 预加载的个数
  jumpUrl: string; // pc h5互跳地址
  mode: string; // 'normal' | 'slidepage' 等于 'fullpage'
  // 是否存在滚动监听器
  hasScrollListener?: boolean;
}

export interface IComp {
  name: string;
  type: string;
  title: string;
  label: string;
  version: string;
  latestVer: string;
  icon: string;
  pageType: string;
  // cdnUrl: string;
  // cssUrl: string;
  main: any;
  __dev__?: CompDevConf & {
    state: '' | 'compiling' | 'done' | 'error' | string;
  };
}

// eslint-disable-next-line no-shadow
export enum Platform {
  // eslint-disable-next-line no-unused-vars
  PC = 'pc',
  // eslint-disable-next-line no-unused-vars
  H5 = 'h5',
}
export interface Position {
  x: number;
  y: number;
}
// 方块位置信息
export interface Rect {
  x: Position['x'];
  y: Position['y'];
  width: number;
  height: number;
}
export interface ScreenConfig {
  // 屏幕的id
  id: string;
  // 根元素id
  rootNodeId?: string;
}
export interface CanvasTransformData {
  x: Position['x'];
  y: Position['y'];
  scale: number;
  offsetLeft: number;
  offsetTop: number;
  clientHeight: number;
  clientWidth: number;
}
// 拖拽时需要改变的参数
export interface dragActiveBoxStyle {
  left?: string;
  top?: string;
  width?: string;
  height?: string;
  marginLeft?: string;
  marginRight?: string;
  marginTop?: string;
  marginBottom?: string;
}
export interface CurrentActiveElStyleNum {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number; // style上的top
  left: number; // style上的left
  marginLeft: number;
  marginTop: number;
  marginBottom: number;
  marginRight: number;
}

export interface IBackendModule {
  event_key: string;
  flow_list: {
    [key: string]: string;
  };
  game_biz: string;
  module_list: Array<{
    config_url: string;
    event_key: string;
    name: string;
  }>;
  module_name: string;
}

// 在页面中已经渲染的node
export interface NodeProInPage {
  activeEl: Element;
  screenCategory?: string;
  editOptions: any;
}
export interface NodePro {
  currentNode: INodeConfig;
  parentProNode: NodePro;
  parentNode: INodeConfig;
}
export interface NodesPro {
  [id: string]: NodePro;
}
// 在页面内的额外node信息
export interface NodesProInPage {
  [id: string]: NodeProInPage;
}
// 当前的拖拽信息
export interface CurDragMessage {
  compName: string;
  dragType: string;
  el: Element;
  nodeid?: string;
  targetProNode?: NodeProInPage;
}

interface PlatConfig extends PlatMsg {
  nodes: INodeConfig;
}

interface PageConfig {
  baseInfo?: IBaseInfo;
  [Platform.PC]?: PlatConfig;
  [Platform.H5]?: PlatConfig;
}
interface PreviewExtraParam {
  key: string;
  val: string;
}
export interface IState {
  // viewport: {
  //   width: number;
  //   height: number;
  // },
  compList: {
    [name: string]: IComp;
  };
  baseInfo: IBaseInfo;
  nodes: INodeConfig[];
  platform: Platform;
  platMsg: PlatMsg;
  modeType: string;
  activeScreenNodeId: string[];
  activeNodeId: string;
  activePageIdx: number;
  canvasContainerEl: Element | null;
  mi18nAdminUrl: string;
  gameBiz: string;
  lang: string;
  mi18nData?: Mi18nData;
  ctrlKeyDown: boolean;
  screenList: ScreenConfig[];
  previewExtraParams: PreviewExtraParam[];
  canvasTransformData: CanvasTransformData;
  dragActiveBoxStyle: dragActiveBoxStyle;
  mouseDownPosition?: Position;
  nodesProInPage: NodesProInPage;
  nodesEditOptions: any;
  duringDrag: boolean;
  currentActiveElStyleNum: CurrentActiveElStyleNum;
  bizList: any[];
  funcModules: any[];
  activeNodeStateKey: string;
  prePageConfig: PageConfig;
  pageModule: string;
  pageStatus: string;
  customCanvas?: CustomCanvasMsg;
  previewZone: number;
  previewTime: null | number;
  /** vuex module dev */
  dev?: ModuleDevState;
}
