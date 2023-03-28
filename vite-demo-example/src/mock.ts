import Mock from 'mockjs-async';

Mock.mock(/\/mock\/31\/in\/v1\/app\/list/, () => {
  return {
    retcode: 0,
    message: 'success',
    data: {},
  };
});