import Vue from 'vue';
import $ from 'jquery';
import Swiper from 'swiper';
import pzWrapper from '@puzzle/wrapper';
import '@puzzle/wrapper/dist/main.css';
import pzWrapperMixin from '@puzzle/wrapper/dist/customEventMixin';
import pzWrapperPlugins from '@puzzle/wrapper/dist/plugins';
import mhyFormGenerator from 'mihoyo-form-generator';
import puzzleUpload from '@puzzle-admin/upload';
import * as puzzleUtils from '@puzzle/utils';
import * as puzzleCore from '@puzzle/core';
import ElementUI from 'element-ui';

const cache = {};

const updateStyle = (link: string) => {
  const linkDom = document.createElement('link');
  linkDom.href = link;
  linkDom.type = 'text/css';
  linkDom.rel = 'stylesheet';
  document.head.appendChild(linkDom);
};
const fetchJs = async ({ compName, cdnUrl, declarations }) => {
  // console.log('loadComp: ', name);
  const data = await fetch(cdnUrl);
  const context = {
    Vue,
    $,
    Swiper,
    pzWrapper,
    pzWrapperMixin,
    commonDeclarations: declarations,
    mhyFormGenerator,
    pzWrapperPlugins,
    ElementUI,
    puzzleUpload,
    puzzleUtils,
    puzzleCore
  };
  const funcBody = await data.text();
  // eslint-disable-next-line no-new-func
  new Function('self', `${funcBody}`)(context);
  // console.log(`loadComp ${compName} return: `, context[compName], context);
  return context[compName];
};

export default async function loadComp({
  compName, cdnUrl, cssUrl, declarations, disableCache = false
}) {
  if (cache[cdnUrl] && !disableCache) {
    return cache[cdnUrl];
  }
  updateStyle(cssUrl);
  cache[cdnUrl] = fetchJs({ compName, cdnUrl, declarations });
  return cache[cdnUrl];
}
