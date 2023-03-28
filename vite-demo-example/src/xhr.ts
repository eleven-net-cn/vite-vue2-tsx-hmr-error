import axios from 'axios';

export function queryList() {
  return axios
    .get('https://plat-yapi.mihoyo.com/mock/31/in/v1/app/list')
    .then(({ data }) => {
      return data;
    });
}
