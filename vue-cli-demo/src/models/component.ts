/**
 * 工单数据处理model
 * Created by spring on 2018/8/21.
 * mihoyo-admin-model 接口文档：https://www.tapd.cn/22435861/markdown_wikis/#1122435861001005659
 */
import {
  defaultFormatParams, get, post
} from 'mihoyo-admin-model';

export default {
  getRenderTemplateLatestVersion() {
    const url = 'https://plat-registry-npm.mihoyo.com/-/verdaccio/sidebar/@puzzle/render-template';
    return fetch(url).then((response) => response.json()).then(data => data.latest.version);
  },
  getLatestVersions() {
    const url = 'https://plat-registry-npm.mihoyo.com/-/verdaccio/packages';
    return fetch(url).then((response) => response.json());
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
    return get('puzzle_admin/api/getModuleList', options, defaultFormatParams, formatResult);
  },

  /**
    * 获取组件详情
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  getModuleInfo(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return get('puzzle_admin/api/getModuleInfo', options, defaultFormatParams, formatResult);
  },

  /**
    * 添加组件
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  addModule(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post('puzzle_admin/api/addModule', options, defaultFormatParams, formatResult);
  },

  /**
    * 更新组件信息
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  updateModule(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post('puzzle_admin/api/updateModule', options, defaultFormatParams, formatResult);
  },

  /**
    * 发布组件
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  publishModule(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post('puzzle_admin/api/publishModule', options, defaultFormatParams, formatResult);
  },

  /**
    * 禁用组件
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  disableModule(options = {}) {
    const formatResult = function (data) {
      return data;
    };
    return post('puzzle_admin/api/disableModule', options, defaultFormatParams, formatResult);
  }
};
