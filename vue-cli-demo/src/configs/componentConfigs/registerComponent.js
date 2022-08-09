/* eslint no-unused-vars:off */
import draggable from 'vuedraggable';
import VueClipboard from 'vue-clipboard2';
import mihoyoAuth from 'mihoyo-auth';
import { QS } from '@me/utils';
import mihoyoAdminCookie from 'mihoyo-admin-cookie';
import mihoyoStaffSelector from 'mihoyo-staff-selector';
import { baseAppKey } from 'appConfig';

import puzzleUpload from '@puzzle-admin/upload';
import ClickOutside from 'vue-click-outside';
import dialog from 'mihoyo-common-modal';
import mihoyoTtr from 'mihoyo-tiptap-rich-text';
import core from '@puzzle/core';
import asyncWrap from '@/utils/asyncWrap';
import toolsBar from '../../components/toolsBar';
import templateCard from '../../components/templateCard';
import templateAddModal from '../../components/templateAddModal';
import commonBackgroundForm from '../../components/commonBackgroundForm/index';
import pzUi from '../../components/pz-ui';
// 注册组件
export default (Vue) => {
  const inMerlin = !!QS.inMerlin;
  Vue.use(core);
  Vue.use(mihoyoAuth, {
    loading: false,
    appKey: baseAppKey,
    member: mihoyoAdminCookie.getOpUserName(),
    showAuthFailMessage: !inMerlin
  });
  Vue.use(mihoyoTtr);
  // 组件
  Vue.component('MihoyoStaffSelector', mihoyoStaffSelector);
  Vue.component('Draggable', draggable);
  Vue.component('PuzzleUpload', puzzleUpload);
  Vue.component('ToolsBar', toolsBar);
  Vue.component('TemplateCard', templateCard);
  Vue.component('TemplateAddModal', templateAddModal);
  Vue.component('PzBackgroundForm', commonBackgroundForm);
  Vue.use(dialog);
  // 指令
  Vue.directive('ClickOutside', ClickOutside);
  Vue.use(pzUi);
  VueClipboard.config.autoSetContainer = true;// add this line
  Vue.use(VueClipboard);
  Vue.prototype.$async = asyncWrap;
};
