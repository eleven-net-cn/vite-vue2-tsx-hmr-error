export default (Vue) => {
  // 转小写
  Vue.filter('filterA', (value) => value || value.toLowerCase());

  // 转大写
  Vue.filter('filterB', (value) => value || value.toUpperCase());

  Vue.filter('updateStatus', (v) => {
    const map = {
      UpdateStatusPublish: 'success',
      UpdateStatusDefault: 'info',
      UpdateStatusUpdate: 'warning',
      UpdateStatusPackage: 'warning'
    };
    return map[v] || '';
  });

  Vue.filter('releaseStatus', (v) => {
    const map = {
      ReleaseEnvDefault: 'info',
      ReleaseEnvDev: 'warning',
      ReleaseEnvPre: '',
      ReleaseEnvProd: 'success'
    };
    return map[v] || '';
  });

  Vue.filter('publishLabel', (v) => {
    const map = {
      PublishStatusDefault: '未知',
      PublishStatusStart: '未开始',
      PublishStatusRunning: '打包中',
      PublishStatusFail: '发布失败',
      PublishStatusOK: '发布成功'
    };
    return map[v] || '';
  });

  Vue.filter('publishStatus', (v) => {
    const map = {
      PublishStatusDefault: 'info',
      PublishStatusStart: '',
      PublishStatusRunning: 'warning',
      PublishStatusFail: 'danger',
      PublishStatusOK: 'success'
    };
    return map[v] || '';
  });

  Vue.filter('releaseLabel', (v) => {
    const map = {
      ReleaseEnvDefault: '未发布',
      ReleaseEnvDev: '测试环境',
      ReleaseEnvPre: '预发布环境',
      ReleaseEnvProd: '生产环境'
    };
    return map[v] || '';
  });

  Vue.filter('updateLabel', (v) => {
    const map = {
      UpdateStatusUpdated: '已编辑',
      UpdateStatusPublish: '已发布',
      UpdateStatusPackage: '打包中'
    };
    return map[v] || '';
  });
};
