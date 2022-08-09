/**
 * 工单数据处理model
 * Created by spring on 2018/8/21.
 * mihoyo-admin-model 接口文档：https://www.tapd.cn/22435861/markdown_wikis/#1122435861001005659
 */
import {
  defaultFormatParams, defaultFormatResult, get, post
} from 'mihoyo-admin-model';
import { merlinBase } from 'appConfig';

export function formatComp(comp) {
  return {
    id: comp.id,
    name: comp.module_name,
    label: comp.show_name,
    latestVer: comp.module_ver,
    version: '',
    type: comp.module_type,
    icon: comp.module_icon,
    is_h5: comp.is_h5,
    is_pc: comp.is_pc,
    pageType: comp.page_type,
    //  ctime: comp.ctime,
    //  mtime: comp.mtime,
    main: null
  };
}

export function formatEventFuncModule(module) {
  const feComps = Object.fromEntries(
    module.fe_list.map((comp) => [
      comp.module_name,
      {
        ...formatComp(comp),
        type: 'BEModuleTypeFE',
        beData: {
          flowList: module.flow_id_list,
          versionList: module.version_list
        },
      }
    ])
  );

  return {
    ...module,
    feComps
  };
}

export default {
  /**
    * 功能模块
    */
  getFeFuncModuleList(options = {}) {
    const formatResult = function ({ list }) {
      const formatData = {};
      list.forEach(x => {
        x.fe_list.forEach((comp) => {
          formatData[comp.module_name] = formatComp(comp);
        });
      });
      return formatData;
    };
    return get(`${merlinBase}event/getFeFuncModuleList`, options, defaultFormatParams, formatResult);
  },

  getEventFuncModuleList(options = {}) {
    const formatResult = function ({ list, event }) {
      const { eventKey, domain_list } = event;
      const allComps = {};
      const newList = list.map((module) => formatEventFuncModule(module));
      newList.forEach(({ feComps }) => {
        Object.keys(feComps).forEach((key) => {
          allComps[key] = feComps[key];
        });
      });
      return {
        list: newList,
        allComps,
        eventKey,
        domain_list
      };
    };
    return get(`${merlinBase}event/getEventFuncModuleList`, options, defaultFormatParams, formatResult);
  },

  getAvailableEventFuncModuleList(options = {}) {
    return get(`${merlinBase}event/getAvailableEventFuncModuleList`, options, defaultFormatParams, defaultFormatResult);
  },

  createConst(options = {}) {
    return post(`${merlinBase}event/createConst`, options, defaultFormatParams, defaultFormatResult);
  },

  deleteConst(options = {}) {
    return post(`${merlinBase}event/deleteConst`, options, defaultFormatParams, defaultFormatResult);
  },

  editConst(options = {}) {
    return post(`${merlinBase}event/editConst`, options, defaultFormatParams, defaultFormatResult);
  },

  constList(options = {}) {
    return get(`${merlinBase}event/constList`, options, defaultFormatParams, defaultFormatResult);
  },

  importFuncModule(options = {}) {
    return post(`${merlinBase}event/importFuncModule`, options, defaultFormatParams, defaultFormatResult);
  },

  deleteEventFuncModule(options = {}) {
    return post(`${merlinBase}event/deleteEventFuncModule`, options, defaultFormatParams, defaultFormatResult);
  },

};
