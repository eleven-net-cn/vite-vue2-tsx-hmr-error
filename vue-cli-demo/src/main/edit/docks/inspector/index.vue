<template>
  <div class="puzzle-setting" :style="{width:formWidth}">
    <el-tabs
      v-model="activeTab" type="border-card"
      class="tab-header"
    >
      <el-tab-pane
        v-if="!lang" key="page" label="页面"
        name="page"
      >
        <div class="puzzle-setting__container">
          <div class="puzzle-setting-page">
            <pageForm></pageForm>
          </div>
        </div>
      </el-tab-pane>
      <!-- 页面级组件选项 -->
      <el-tab-pane
        v-if="isPageCompType" key="component" label="组件"
        name="component"
      >
        <template v-if="!lang">
          <el-form
            ref="PageCompForm"
            size="mini"
            label-position="left"
            label-width="80px"
            @submit.native.prevent
          >
            <!-- 组件自己的选项 -->
            <CompOptionsForm />
            <!-- 组件有自己的initMi18n就用自己的init，没有就用系统的init -->
            <CompMi18n v-if="!isPageCompInitMi18n" />
          </el-form>
        </template>
        <Mi18nForm v-else />
      </el-tab-pane>
      <template v-else-if="activeNode">
        <el-tab-pane key="component" label="组件" name="component">
          <el-form
            v-if="activeTab === 'component'"
            ref="compForm"
            size="mini"
            label-position="left"
            label-width="80px"
            @submit.native.prevent
          >
            <el-form-item label="组件类型">
              <el-tooltip
                class="item" effect="dark" :content="activeNode.id"
                placement="top-start"
              >
                <el-tag size="small" :disable-transitions="true">
                  {{ activeNode.label }}
                </el-tag>
              </el-tooltip>
              <el-tag size="small" :disable-transitions="true">
                {{ `${activeNode.version === 'latest' ? '' : 'v'}` + activeNode.version }}
              </el-tag>
            </el-form-item>
            <el-form-item label="节点名称">
              <el-input v-model="alias" size="mini" @change="setAlias"></el-input>
            </el-form-item>
            <div :key="formKey" class="drag-form-box">
              <OtherStateCompForm v-if="activeNodeStateKey" />
              <compForm v-else-if="!lang" :methods="methods" />
              <Mi18nForm v-else />
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane
          v-if="!lang&&!activeNodeStateKey" key="event" label="行为"
          name="event"
        >
          <template v-if="activeTab === 'event'">
            <EventForm />
            <!-- 环境和组件联动在版本大于等于2.7.15前禁止 -->
            <EnvLinkForm v-if="compareVersion('ge','2.7.15')" />
            <LinkForm v-if="compareVersion('ge','2.7.15')" />
          </template>
        </el-tab-pane>
        <el-tab-pane
          v-if="!lang&&showTransitionForm" key="transition" label="动效"
          name="transition"
        >
          <template v-if="activeTab === 'transition'">
            <TransitionForm />
            <TransitionEnterLeave />
            <AnimationForm />
          </template>
        </el-tab-pane>
      </template>
      <el-tab-pane
        v-else key="component-none" label="组件"
        name="component"
      >
        请选择组件
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { compareVersion } from '@/utils/';
import CompOptionsForm from './compOptionsForm.vue';
import pageForm from './pageForm';
import compForm from './compForm';
import CompMi18n from './compMi18n';
import Mi18nForm from './mi18nForms/compForm.vue';
import OtherStateCompForm from './multipleStateForms/compForm.vue';
import LinkForm from './linkForm.vue';
import EnvLinkForm from './envLinkForms/envLinkForm';
import EventForm from './eventForm';
import TransitionForm from './transitionForm.vue';
import TransitionEnterLeave from './transitionForms/transitionEnterLeaveForm.vue';
import AnimationForm from './animationForm.vue';

export default {
  components: {
    pageForm,
    compForm,
    OtherStateCompForm,
    LinkForm,
    EnvLinkForm,
    EventForm,
    Mi18nForm,
    TransitionForm,
    AnimationForm,
    TransitionEnterLeave,
    CompOptionsForm,
    CompMi18n
  },
  props: {
    eventName: String,
    templateName: String,
  },
  data() {
    return {
      activeTab: 'page',
      alias: '',
    };
  },
  computed: {
    isPageCompInitMi18n() {
      return this.pageComp?.main?.initMi18n;
    },
    ...mapState([
      'compList',
      'activeNodeId',
      'activeNodeStateKey',
      'baseInfo',
      'lang'
    ]),
    ...mapGetters([
      'activeNode',
      'activeNodePro',
      'isPageCompType',
      'pageComp'
    ]),
    formKey() {
      // 大于这个版本的，表单就不会再进行重绘
      if (this.compareVersion('gt', '2.7.15')) {
        return 1;
      }
      return this.activeNode.id;
    },
    methods() {
      return {
        compareVersion: this.compareVersion
      };
    },
    formWidth() {
      const width = this.pageComp?.main?.declarations?.formMsg?.width;
      return width ? `${width + 30}px` : undefined;
    },
    showTransitionForm() {
      const { noPosition, noEditStyle } = this.activeNodePro?.editOptions || {};
      return this.activeNodePro?.editOptions && !noEditStyle && !noPosition && this.compareVersion('ge', '2.7.22');
    },
  },
  watch: {
    activeNode: {
      handler(val) {
        if (val && this.activeTab === 'page') {
          this.activeTab = 'component';
          return;
        }

        if (!val && !this.lang) {
          this.activeTab = 'page';
        }
        // if (!val) {
        //   return;
        // }
        // const comp = this.compList?.[val.name];
        // if (!comp?.main) {
        //   this.$store.dispatch('fetchCompModule', {
        //     compName: val.name,
        //     version: val.version,
        //   });
        // }
      },
      immediate: true
    },
    lang(newVal) {
      if (newVal) {
        this.activeTab = 'component';
      }
    },
    comp: {
      handler(newVal) {
        if (!this.activeNode) {
          return;
        }
        // console.log('comp change: ', newVal, oldVal);
        if (!newVal?.main) {
          this.$store.dispatch('fetchCompModule', {
            compName: this.activeNode?.name,
            version: this.activeNode?.version,
          });
        }
      },
      immediate: false
    },
    'activeNode.alias': {
      handler(newVal) {
        this.alias = newVal;
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['updateNodeConfig']),
    compareVersion(c, v) {
      return compareVersion(this.baseInfo.buildVer, c, v);
    },
    setAlias(newVal) {
      this.updateNodeConfig({
        options: {
          alias: newVal
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.puzzle-setting {
  .tab-header {
    height: 100%;
  }

  ::v-deep .el-tabs__content {
    height: calc(100% - 40px);
    overflow: auto;
  }
}
</style>
