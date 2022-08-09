import {
  defaultFormatParams, get, post
} from 'mihoyo-admin-model';
import groupBy from 'lodash/groupBy';

const beModuleFormatResult = (data) => {
  const formatData = data.list!.map(item => {
    item.module_list = Object.keys(item.module_list!)
      .filter(moduleName => moduleName !== '资格模块')
      .map(moduleName => ({
        name: moduleName,
        ...item.module_list[moduleName],
      }));
    item.module_name = `@puzzle/${item.module_name!.replace('_', '-')}`;
    return item;
  });
  const result = groupBy(formatData, 'module_name');
  return result;
};

const beModuleFormatParams = (options) => {
  options.module_name = options.module_name.replace('@puzzle/', '').replace('-', '_');
  return options;
};

export default {
  /**
   * 创建后端模块
   * @param options 请求参数
   * @returns {*} 返回 promise 对象
   */
  addBEModule(options = {}) {
    return post('puzzle_admin/api/addBEModule', options, beModuleFormatParams, beModuleFormatResult);
  },
  /**
  * 获取后端组件列表
  * @param payload
  * @returns {*} 返回 promise 对象
  */
  getBEmoduleInfo(options = {}) {
    return get('puzzle_admin/api/getBEmoduleInfo', options, defaultFormatParams, beModuleFormatResult);
  },
  /**
  * 删除后端模块
  * @param payload
  * @returns {*} 返回 promise 对象
  */
  delBEModule(options = {}) {
    return post('puzzle_admin/api/delBEModule', options, beModuleFormatParams, beModuleFormatResult);
  },
};
