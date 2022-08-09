import { NODE_CATEGORY } from '@/types';
import devices from './devices';
// localStorage key map
const STORAGE_KEY = {
  page: 'puzzle-config-page', // 页面整体的配置，page.config
  nodes: 'puzzle-config-nodes', // 页面节点树配置，page.config.nodes
  comp: 'puzzle-config-comp', // 组件整体配置，node.config
  style: 'puzzle-config-style', // 组件样式配置,node.config.boxStyle
};
// 保存为模版需要的baseInfo中的key，除了这些，其它都要进行自定义
const templayeKeys = ['buildVer', 'cookieTip', 'script', 'publicPath', 'publish_key', 'bizList', 'landscapeTip', 'hasGameBgm', 'useSeverTime', 'customMi18nKey'];
export {
  STORAGE_KEY,
  devices,
  templayeKeys
};
const pageMode = {
  // 长页面
  scrollPage: 1,
  colSlidePage: 2,
  rawSlidePage: 3,
  colpage: 4,
  rawpage: 5
};
const langList = [
  {
    label: '中文（简体）',
    value: 'zh-cn'
  },
  {
    label: '中文（繁體）',
    value: 'zh-tw'
  },
  {
    label: 'Deutsch',
    value: 'de-de'
  },
  {
    label: 'English',
    value: 'en-us'
  },
  {
    label: 'Español',
    value: 'es-es'
  },
  {
    label: 'Français',
    value: 'fr-fr'
  },
  {
    label: 'Indonesia',
    value: 'id-id'
  },
  {
    label: '日本語',
    value: 'ja-jp'
  },
  {
    label: '한국어',
    value: 'ko-kr'
  },
  {
    label: 'Português',
    value: 'pt-pt'
  },
  {
    label: 'Pусский',
    value: 'ru-ru'
  },
  {
    label: 'ภาษาไทย',
    value: 'th-th'
  },
  {
    label: 'Tiếng Việt',
    value: 'vi-vn'
  }
];
// 各类预览渠道信息
export const normalPreviewPlatList = [
  {
    label: '游戏内',
    value: 'isGame',
    plat: 'all',
    urlSearchList: [{
      key: 'gamewebview',
      val: '1',
    }]
  },
  {
    label: '米游社',
    value: 'isBBS',
    plat: 'h5',
    urlSearchList: [{
      key: 'bbswebview',
      val: '1',
    }]
  },
  {
    label: 'iOS系统',
    value: 'isIOS',
    plat: 'h5',
    urlSearchList: [{
      key: 'ioswebview',
      val: '1',
    }]
  }
];
// 页面级别组件因为配置不区分pc和移动端，所以有特有的是否是pc端的选项
export const pageCompPreviewPlatList = [
  {
    label: 'pc端',
    value: 'isPC',
    urlSearchList: [{
      key: 'is_mobile',
      val: '',
    }]
  }
];

enum RES_TYPE{
  MAIN='main',
  DIALOG='dialog',
  SWIPER='swiper',
  COLLAPSE='collapse',
  CUSTOM_BUTTON='customButton'
}
// 编辑选项
export enum EDIT_OPTIONS{
  // 不能被激活
  NO_ACTIVE = 'noActive',
  // 不能被拖拽
  NO_DRAG = 'noDrag',
  // 不能加入子节点
  NO_APPEND = 'noAppend',
  // 不能被删除
  NO_DELETE = 'noDelete',
  // 不能编辑子节点
  NO_CHILD_EDIT= 'noChildEdit',
  // 不能添加兄弟节点
  NO_BEFORE = 'noBefore',
  // 不能编辑样式
  NO_EDIT_STYLE = 'noEditStyle',
  // 不能缩放
  NO_RESIZE = 'noResize',
  // 不能改变位置
  NO_POSITION = 'noPosition',
  // 不能设置高度
  NO_RESIZE_HEIGHT = 'noResizeHeight',
  // 不能设置宽度
  NO_RESIZE_WIDTH = 'noResizeWidth'
}

export const LOCK_DATA_MAP = {
  [EDIT_OPTIONS.NO_ACTIVE]: true,
  [EDIT_OPTIONS.NO_DRAG]: true,
  [EDIT_OPTIONS.NO_APPEND]: true,
  [EDIT_OPTIONS.NO_DELETE]: true,
  [EDIT_OPTIONS.NO_CHILD_EDIT]: true,
  [EDIT_OPTIONS.NO_BEFORE]: true
};
export const NO_ACTIVE_MAP = {
  [EDIT_OPTIONS.NO_EDIT_STYLE]: true,
  [EDIT_OPTIONS.NO_DELETE]: true
};
export const NO_EDIT_STYLE_MAP = {
  [EDIT_OPTIONS.NO_RESIZE]: true,
  [EDIT_OPTIONS.NO_POSITION]: true
};
export const NO_RESIZE_MAP = {
  [EDIT_OPTIONS.NO_RESIZE_HEIGHT]: true,
  [EDIT_OPTIONS.NO_RESIZE_WIDTH]: true
};
// 在不同屏幕上的不同特殊节点在编辑端的样式
export const SCREEN_EDIT_OPTIONS_MAP = {
  // 在弹窗屏幕中
  [RES_TYPE.DIALOG]: {
    // 弹窗节点本身
    [NODE_CATEGORY.DIALOG]: {
      // 初始可见
      $initVisible: true,
      // 能被激活
      [EDIT_OPTIONS.NO_ACTIVE]: false
    }
  }
};
// 由编辑后台添加的元素正常情况下被编辑的样式
export const EXTRA_EDIT_OPTIONS_MAP = {
  // 弹窗正常情况下的编辑属性就是在弹窗编辑框内的属性
  [NODE_CATEGORY.DIALOG]: SCREEN_EDIT_OPTIONS_MAP[RES_TYPE.DIALOG][NODE_CATEGORY.DIALOG]
};

export default {
  langList,
  eventTypeMap: {
    EventTypeDev: {
      value: 'EventTypeDev',
      label: '开发活动',
    },
    EventTypeRelease: {
      value: 'EventTypeRelease',
      label: '正式活动',
    },
  },
  pageMode,
  compPageMode: {
    mode: 'comppage',
    label: '页面级别组件',
    pcInitState: {
      width: 1920,
    },
    h5InitState: {
      width: 750
    }
  },
  // 页面配置与值的映射
  pageModeMap: [
    {
      fullScreen: undefined,
      mode: 'normal',
      value: pageMode.scrollPage,
      label: '长页面',
      pcInitState: {
        width: 1920,
        minScrollWidth: 1400,
      },
      h5InitState: {
        width: 750
      }
    },
    {
      fullScreen: 'colClip',
      mode: 'slidepage',
      value: pageMode.colSlidePage,
      label: '竖屏滚屏',
      h5InitState: {
        width: 750,
        height: 1334,
        maxRatio: 750 / 1334
      }
    },
    {
      fullScreen: 'rawClip',
      mode: 'slidepage',
      value: pageMode.rawSlidePage,
      label: '横屏滚屏',
      pcInitState: {
        width: 1920,
        height: 1080,
        minRatio: 1920 / 1080
      },
      h5InitState: {
        width: 1334,
        height: 750,
        minRatio: 1334 / 750
      }
    },
    {
      fullScreen: 'colClip',
      mode: 'normal',
      value: pageMode.colpage,
      label: '竖屏全屏',
      h5InitState: {
        width: 750,
        height: 1334,
        maxRatio: 750 / 1334
      }
    },
    {
      fullScreen: 'rawClip',
      mode: 'normal',
      value: pageMode.rawpage,
      label: '横屏全屏',
      pcInitState: {
        width: 1920,
        height: 1080,
        minRatio: 1920 / 1080
      },
      h5InitState: {
        width: 1334,
        height: 750,
        minRatio: 1334 / 750
      }
    },
  ],
  // 目前一共有两种屏幕，分别存放主要内容和弹窗内容
  screenCategory: RES_TYPE,
  deviceMap: {
    DeviceModeH5: {
      value: 'h5',
      label: 'H5',
    },
    DeviceModePC: {
      value: 'pc',
      label: 'PC',
    },
  },
  screenMap: {
    ScreenModeLong: {
      value: 'normal',
      label: '长屏',
    },
    ScreenModeFull: {
      value: 'slidepage',
      label: '全屏',
    },
  },
  envMap: {
    1: {
      name: '测试环境',
      value: 'test',
    },
    2: {
      name: '预发布环境',
      value: 'pre',
    },
    3: {
      name: '正式环境',
      value: 'prd',
    },
  },
  latestBuilderVer: '2.10.77'
};
