<script>
import {
  mapActions, mapGetters, mapMutations, mapState
} from 'vuex';

export default {
  name: 'DevPanel',
  data() {
    return {
      visible: false,
      devServer: {
        ...this.$store.state.dev.server,
      },
      activeCollapses: ['forms', 'interceptingCompList', 'devCompList'],
      devCompType: this.$store.state.dev.devCompType,
    };
  },
  computed: {
    ...mapGetters('dev', ['compListArray', 'compsToBeReplaced', 'interceptingComps', 'interceptedCompArray']),
    ...mapState('dev', {
      devServerError: (state) => state.error,
    }),
    ...mapState({
      allComps: (state) => state.compList,
    }),
    devCompList() {
      return this.compListArray.map(({ __dev__: dev, ...comp }) => ({
        comp,
        name: comp.name,
        oriName: dev.oriName,
        state: dev.state,
        loading: dev.state === 'compiling',
        buttonType: this.mapStateToButtonType(dev.state),
        intercepting: !!this.interceptingComps[dev.oriName] || false,
        __dev__: dev,
      }));
    },
    enabled: {
      get() {
        return this.$store.state.dev.enabled;
      },
      set(enabled) {
        this.$store.commit('dev/enable', enabled);
      },
    },
  },
  mounted() {
    const unwatch = this.$watch(() => {
      if (this.interceptedCompArray.length > 0) {
        this.showPanel();
        unwatch();
      }
    },);
  },
  methods: {
    ...mapMutations('dev', ['setInterceptingComp', 'setDevCompType']),
    ...mapActions('dev', { refreshDevCompList: 'refreshCompList' }),
    showPanel() {
      this.visible = true;
    },
    loadComp(name) {
      this.$store.dispatch('fetchCompModule', {
        compName: name,
        version: 'latest',
      });
    },
    mapStateToButtonType(state) {
      switch (state) {
      case 'error':
        return 'danger';
      case 'done':
        return 'success';
      default:
        return 'primary';
      }
    },
    onChangeDevCompType(val) {
      this.setDevCompType(val);
    }
  },
};
</script>

<template>
  <div v-show="enabled" class="dev-panel">
    <div class="switch" @click="showPanel"></div>
    <el-drawer
      class="drawer" title="本地组件调试面板" size="60%"
      direction="rtl" :visible.sync="visible" :append-to-body="true"
    >
      <el-collapse v-model="activeCollapses" class="collapse-container">
        <el-collapse-item name="forms">
          <template #title>
            <el-tag>调试组件类型</el-tag>
          </template>
          <el-radio-group v-model="devCompType" @change="onChangeDevCompType">
            <el-radio label="component">默认</el-radio>
            <el-radio label="page">页面级组件</el-radio>
          </el-radio-group>
        </el-collapse-item>
        <el-collapse-item name="interceptingCompList" class="intercepting-comp-container">
          <template #title>
            <el-tag>组件替换列表</el-tag>
          </template>
          <el-table
            class="comp-list" :data="interceptedCompArray" style="width: 100%"
            :row-key="({ compName, version }) => `${compName}@${version}`"
            border
          >
            <el-table-column
              prop="compName"
              label="线上组件"
              width="300"
            >
            </el-table-column>
            <el-table-column
              prop="version"
              label="线上版本"
              width="180"
            >
            </el-table-column>
            <el-table-column
              prop="devCompName"
              label="本地组件"
              width="300"
            >
            </el-table-column>
            <el-table-column
              prop="cnt"
              label="加载次数"
            >
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item name="devCompList" class="dev-comp-container">
          <template #title>
            <el-tag>本地组件列表</el-tag>
          </template>
          <el-input v-model="devServer.baseURL" placeholder="请输入 dev 服务 url" class="input-with-select">
            <el-select slot="prepend" v-model="devServer.protocol" placeholder="请选择">
              <el-option label="HTTP://" value="http"></el-option>
              <el-option label="HTTPS://" value="https"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-refresh-right" @click="refreshDevCompList(devServer)"></el-button>
          </el-input>

          <el-table
            class="comp-list" :data="devCompList" style="width: 100%"
            :empty-text="devServerError && devServerError.message || '暂无数据'"
            border
          >
            <el-table-column
              prop="name"
              label="本地组件"
              width="300"
            >
            </el-table-column>
            <el-table-column
              prop="oriName"
              label="线上组件"
              width="300"
            >
            </el-table-column>
            <el-table-column
              prop="comp.version"
              label="线上版本"
              width="180"
            >
            </el-table-column>
            <el-table-column
              label="状态"
              width="180"
            >
              <template v-slot="{ row: { buttonType, state } }">
                <el-tag :type="buttonType">
                  {{ state || '未加载' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="替换线上同名组件"
            >
              <template v-slot="{ row: { name, oriName, intercepting } }">
                <el-switch
                  name="开启"
                  :value="intercepting"
                  @change="(enabled) => setInterceptingComp({ compName: oriName, devCompName: enabled ? name : undefined })"
                >
                </el-switch>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.dev-panel {
  position: fixed;
  z-index: 10;
  top: 0;
  right: 0;

  .switch {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 40px;
    height: 40px;
    background: #f00;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.6s;

    &:hover {
      transform: scale(1.5);
    }
  }
}

.drawer {
  font-size: 16px;

  h3 {
    margin-bottom: 1.2em;
  }

  .collapse-container {
    padding: 20px;
    height: 100%;
  }

  .dev-comp-container {
    .comp-list {
      margin-top: 20px;
    }
  }
}
</style>
