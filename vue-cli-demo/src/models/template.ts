/**
 * 工单数据处理model
 * Created by spring on 2018/8/21.
 * mihoyo-admin-model 接口文档：https://www.tapd.cn/22435861/markdown_wikis/#1122435861001005659
 */
import {
  defaultFormatParams, defaultFormatResult, get, post
} from 'mihoyo-admin-model';

export default {
  /**
    * 添加模板
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  addTemplate(options = {}) {
    return post('puzzle_admin/api/addTemplate', options, defaultFormatParams, defaultFormatResult);
  },

  /**
    * 删除模板
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  deleteTemplate(options = {}) {
    return post('puzzle_admin/api/deleteTemplate', options, defaultFormatParams, defaultFormatResult);
  },

  /**
    * 获取模板详情
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  getTemplateInfo(options = {}) {
    return get('puzzle_admin/api/getTemplateInfo', options, defaultFormatParams, defaultFormatResult);
  },

  /**
    * 获取模板列表
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  getTemplateList(options = {}) {
    return get('puzzle_admin/api/getTemplateList', options, defaultFormatParams, defaultFormatResult);
  },
  /**
    * 更新模板基础信息
    * @param options 请求参数
    * @returns {*} 返回 promise 对象
    */
  updateTemplate(options = {}) {
    return post('puzzle_admin/api/updateTemplate', options, defaultFormatParams, defaultFormatResult);
  },

  /**
     * 更新模板配置
     * @param options 请求参数
     * @param options.id 模板id，Number
     * @param options.config_str 新的模板配置，String
     * @returns {*} 返回 promise 对象
     */
  updateTemplateConfig(options = {}) {
    return post('puzzle_admin/api/updateTemplateConfig', options, defaultFormatParams, defaultFormatResult);
  },

};
