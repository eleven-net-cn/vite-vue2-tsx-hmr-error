export const environment = 'test';
export const apiBase = 'https://devapi-takumi.mihoyo.com/';
export const merlinBase = 'https://devapi-takumi.mihoyo.com/merlin_admin/op/v1/';
export { baseAppKey } from './production.config';

export const puzzleCDNBaseURL = {
  cn: {
    test: 'https://webstatic-test.mihoyo.com/test',
    pre: 'https://webstatic-test.mihoyo.com/pre',
    prod: 'https://webstatic-test.mihoyo.com/prod',
  },
  global: {
    test: 'https://act-test.hoyoverse.com/puzzle/test',
    pre: 'https://act-test.hoyoverse.com/puzzle/pre',
    prod: 'https://act-test.hoyoverse.com/puzzle/prod',
  },
  ossSea: {
    test: 'https://webstatic-sea-test.hoyoverse.com/test',
    pre: 'https://webstatic-sea-test.hoyoverse.com/pre',
    prod: 'https://webstatic-sea-test.hoyoverse.com/prod',
  },
};
