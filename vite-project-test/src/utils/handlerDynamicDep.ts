/**
 * 搜索动态依赖，并执行相关操作
 */
import store from '@/store/index';
import { accountCnRoleThemeMap, accountSeaRoleThemeMap, uidLoginList } from '@/constants/gameBizConfig';

export const dynamicDepPlat = {
  /**
   * 针对长页面的滚动监听
   */
  scrollListener: {
    // 监听条件
    // 获取打平的节点数组
    condition: ({ node }) => node.otherOptions
      .linkMsgList?.some((linkMsg) => Object.keys(linkMsg.state)
        .some(item => item === 'scrollStart' || item === 'scrollEnd')),
    // 执行动作
    action: () => {
      store.commit('updatePlatMsg', { hasScrollListener: true });
    },
    // 重置
    reset: () => {
      store.commit('updatePlatMsg', { hasScrollListener: false });
    }
  },
  accountRole: {
    condition: ({ node, comp }) => node.name.includes('@puzzle/account-role') || comp?.main?.declarations?.needAccountRole,
    // 执行动作
    action: () => {
      store.commit('updatePlatMsg', { accountRole: true });
    },
    // 重置
    reset: () => {
      store.commit('updatePlatMsg', { accountRole: false });
    }
  },
};

export const dynamicDep = {
  /**
   * 针对长页面的滚动监听
   */
  accountRole: {
    condition: ({ node, comp }) => node.name.includes('@puzzle/account-role') || comp?.main?.declarations?.needAccountRole,
    // 执行动作
    action: () => {
      store.state.baseInfo.accountRole = {
        uidLogin: uidLoginList[store.getters.curBiz] || false,
        theme: {
          sea: accountSeaRoleThemeMap[store.getters.curBiz],
          cn: accountCnRoleThemeMap[store.getters.curBiz],
        }
      };
    },
    // 重置
    reset: () => {
      store.state.baseInfo.accountRole = undefined;
    }
  },
  merlin: {
    before() {
      store.state.baseInfo.merlinList = {};
    },
    callback({ node }) {
      if (node.beData) {
        store.state.baseInfo.merlinList[node.name] = node.beData;
      }
    }
  },
};
