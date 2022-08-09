/**
 * 工单数据处理model
 * Created by spring on 2018/8/21.
 * mihoyo-admin-model 接口文档：https://www.tapd.cn/22435861/markdown_wikis/#1122435861001005659
 */
import {
  defaultFormatParams,
  defaultFormatResult,
  get,
  post,
} from 'mihoyo-admin-model';
import * as utils from '@/utils';

const event2formData = event => {
  const { start_time, end_time, game_biz, biz_list, ...rest } = event;

  return {
    ...rest,
    game_biz: biz_list?.[0] || game_biz,
    biz_list,
    eventTimeRange: [utils.formatTime(start_time), utils.formatTime(end_time)],
  };
};

const formData2event = event => {
  const { eventTimeRange, ...rest } = event;

  const [start_time = '', end_time = ''] = eventTimeRange || [];

  return {
    ...rest,
    start_time,
    end_time,
  };
};

export default {
  getBizList(options = {}) {
    const formatResult = function (data) {
      const bizList = [] as any[];
      data.list.forEach(game => {
        game.biz_list.forEach(biz => {
          biz.game = game.group_key;
          biz.game_name = game.group_name;
          bizList.push(biz);
        });
      });
      return bizList;
    };
    return get(
      'portal/api/getBizList',
      options,
      defaultFormatParams,
      formatResult,
    );
  },
  /**
   * 添加活动
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  addEvent(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/addEvent',
      options,
      formData2event,
      formatResult,
    );
  },

  deleteEvent(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/deleteEvent',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  offlineEvent(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/offlineEvent',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 更新活动信息
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  updateEvent(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/updateEvent',
      options,
      formData2event,
      formatResult,
    );
  },

  /**
   * 复制活动
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  copyEvent(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/copyEvent',
      options,
      formData2event,
      formatResult,
    );
  },

  /**
   * 更新活动配置
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  updateEventConfig(options = {}) {
    // const formatResult = function (data) {
    //   return data;
    // };
    return post(
      'puzzle_admin/api/updateEventConfig',
      options,
      defaultFormatParams,
      defaultFormatResult,
    );
  },
  /**
   * 更新多语言配置
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  updateMi18n(options = {}) {
    // const formatResult = function (data) {
    //   return data;
    // };
    return post(
      'puzzle_admin/api/updateMi18n',
      options,
      defaultFormatParams,
      defaultFormatResult,
    );
  },

  /**
   * 校验多语言发布状态
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  checkMi18nStatus(options = {}) {
    // const formatResult = function (data) {
    //   return data;
    // };
    return get(
      'puzzle_admin/api/checkMi18nStatus',
      options,
      defaultFormatParams,
      defaultFormatResult,
    );
  },

  /**
   * 获取活动详情
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  getEventInfo(options = {}) {
    return get(
      'puzzle_admin/api/getEventInfo',
      options,
      defaultFormatParams,
      event2formData,
    );
  },

  /**
   * 获取活动列表
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  getEventList(options = {}) {
    const formatResult = function (data) {
      data.list = data.list.map(event2formData);
      return data;
    };
    return get(
      'puzzle_admin/api/getEventList',
      options,
      defaultFormatParams,
      formatResult,
    );
  },
  /**
   * 发布活动
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  publishEvent(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/publishEvent',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 获取活动发布列表
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  getEventPublishList(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return get(
      'puzzle_admin/api/getEventPublishList',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 获取编辑记录列表
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  getEventVersionList(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return get(
      'puzzle_admin/api/getEventVersionList',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 回滚活动配置
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  rollbackEventVersion(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/rollbackEventVersion',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 获取发布状态
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  getEventPublishInfo(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return get(
      'puzzle_admin/api/getEventPublishInfo',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 获取发布状态
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  publishEventResource(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/publishEventResource',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  rollbackEventPublish(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post(
      'puzzle_admin/api/rollbackEventPublish',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 获取组件列表
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  getModuleList(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return get(
      'puzzle_admin/api/getModuleList',
      options,
      defaultFormatParams,
      formatResult,
    );
  },

  /**
   * 获取活动可用的组件列表
   * @param options 请求参数
   * @param devURL 拉取本地调试的组件时需要 #DEV_COMP
   * @returns {*} 返回 promise 对象
   */
  async getEventModuleList(
    options = {},
    devURL: string | undefined = undefined,
  ) {
    const formatResult = function ({ list }) {
      const formatData = {};
      list.forEach(comp => {
        formatData[comp.module_name] = {
          id: comp.id,
          name: comp.module_name,
          label: comp.show_name,
          latestVer: comp.module_ver,
          version: comp.module_ver,
          type: comp.module_type,
          icon: comp.module_icon,
          is_h5: comp.is_h5,
          is_pc: comp.is_pc,
          //  ctime: comp.ctime,
          //  mtime: comp.mtime,
          main: null,
        };
      });
      return formatData;
    };
    if (devURL) {
      const res = await fetch(devURL);
      return formatResult({ list: await res.json() });
    }
    return get(
      'puzzle_admin/api/getEventModuleList',
      options,
      defaultFormatParams,
      formatResult,
    );
  },
  // 拿到对应人是否有权限和对应mi18n链接信息
  getMi18nInfo(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return get(
      'puzzle_admin/api/getMi18nAppBiz',
      options,
      defaultFormatParams,
      formatResult,
    );
    // return get('mi18n/mi18N/validAppBiz?app_key=m05181848151501')
  },
  // 拿到对应区服对应语言的多语言数据
  getMi18nData({
    lang = '',
    ...options
  }: {
    lang: string;
    biz_type: string;
    app_key: string;
    id: number;
  }) {
    const formatParams = function (params) {
      return {
        current_page: 1,
        page_size: 999,
        status: 100,
        ...params,
      };
    };
    const formatResult = function (data) {
      const newData = {};
      data?.list?.forEach(item => {
        let value = item.text.find(text => text.lang === lang).value || '';
        if (value.startsWith('upload/')) {
          value = `https://webstatic-test.mihoyo.com/${value}`;
        }
        newData[item.row_key] = value;
      });
      return newData;
    };
    return get(
      'puzzle_admin/api/getMi18nOpTranslationList',
      options as any,
      formatParams,
      formatResult,
    );
    // return get('mi18n/mi18N/validAppBiz?app_key=m05181848151501')
  },
  /**
   * 拿到当前game的区服与默认语言列表映射表
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  getDefaultMi18nLangMapByGame(options = {}) {
    const formatResult = function ({ list = [] }) {
      const langMap = {};
      interface LangItem {
        key: string;
      }
      interface Item {
        businessKey: string;
        langs: LangItem[];
      }

      list.forEach((item: Item) => {
        langMap[item.businessKey] = (item.langs || []).map(
          (langItem: LangItem) => langItem.key,
        );
      });
      return langMap;
    };
    return get(
      '/mi18n/mi18N/businessLangs',
      options,
      defaultFormatParams,
      formatResult,
    );
  },
};
