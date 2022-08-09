<template>
  <el-form
    size="mini"
    label-position="left"
    class="event-form"
    label-width="80px"
    @submit.native.prevent
  >
    <el-form-item label="触发组件">
      <el-select
        v-model="source" filterable
        placeholder="请选择"
      >
        <el-option
          v-for="item in eventNodes"
          :key="item.id"
          :label="item.alias"
          :value="item.id"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="触发时机">
      <el-select
        v-model="emitter" filterable
        placeholder="请选择"
      >
        <el-option
          v-for="item in sourceDeclarationsEmitters"
          :key="item.name"
          :label="item.label"
          :value="item.name"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="触发条件">
      <el-switch
        v-model="compareEnable"
      >
      </el-switch>
    </el-form-item>
    <template v-if="compareEnable">
      <el-select
        v-model="value.compare.compareSymbol" class="compare-select" size="mini"
        placeholder="对比方式"
      >
        <el-option
          v-for="item in compareSymbolMap"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-input
        v-model="value.compare.compareValue" placeholder="对比值" size="mini"
        class="compare-value"
      />
    </template>
    <el-form-item label="响应组件">
      <el-select
        v-model="target" filterable
        placeholder="请选择"
      >
        <el-option
          v-for="item in eventNodes"
          :key="item.id"
          :label="item.alias"
          :value="item.id"
        >
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="响应方法">
      <el-select
        v-model="listener" filterable
        placeholder="请选择"
      >
        <el-option
          v-for="item in targetDeclarationsMethods"
          :key="item.name"
          :label="item.label"
          :value="item.name"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="延迟时长">
      <!-- 它初始默认会修改一次参数所以v-model换成change -->
      <el-input-number
        :value="delay"
        size="small"
        :precision="0"
        :step="1"
        :min="0"
        @change="(num)=> delay = num"
      ></el-input-number>
      <span style="margin-left: 6px;">/ms</span>
    </el-form-item>

    <!-- <el-form-item v-if="targetDeclarationsMethods && listener" label="响应数据">
      <el-input v-model="eventData" placeholder=""></el-input>
    </el-form-item> -->
    <customActionDataForm v-if="targetDeclarationsMethods && listener" v-model="eventData" :event-type="listener"></customActionDataForm>
    <el-form-item v-if="showMi18nButton" label="加入多语言">
      <el-switch
        v-model="mi18n"
      >
      </el-switch>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { compareVersion } from '@/utils/';
import customActionDataForm from './customActionData/customActionDataForm.vue';

export default {
  components: {
    customActionDataForm,
  },
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    resetCompareData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapState([
      'activeNodeId',
      'compList',
      'baseInfo',
      'platMsg'
    ]),

    ...mapGetters([
      'activeCompMain',
      'compListArray',
      'dfsNodes',
      'mapNodes',
      'activeNode',
      'declarations',
      'isFullScreen'
    ]),
    compareSymbolMap() {
      return this.declarations.compareSymbolMap || {};
    },
    // 触发时机列表
    sourceDeclarationsEmitters() {
      if (this.source === this.baseInfo.publish_key) {
        let globalDeclarationsEmitters = this.declarations.globalEvents?.allPage?.emitters || [];
        if (this.isFullScreen) {
          const fullpageEmitters = this.declarations.globalEvents?.fullScreen?.emitters || [];
          globalDeclarationsEmitters = [...fullpageEmitters, ...globalDeclarationsEmitters];
        }
        return globalDeclarationsEmitters;
      }
      const sourceNode = this.mapNodes[this.source];
      if (!sourceNode) return [];
      return this.compList[sourceNode.name].main.declarations?.event?.emitters || [];
    },
    // 目标-响应方法列表
    // 根据选择的 响应组件 来过滤不同的响应方法
    targetDeclarationsMethods() {
      const globalEvents = this.declarations.globalEvents;
      // 当选择全局
      if (this.target === this.baseInfo.publish_key) {
        // 所有页面公用的方法
        let globalDeclarationsMethods = globalEvents?.allPage?.methods || [];
        // 全屏单页滚动
        if (this.isFullScreen) {
          const fullpageMethods = globalEvents?.fullScreen?.methods || [];
          globalDeclarationsMethods = [...fullpageMethods, ...globalDeclarationsMethods];
        } else {
          // 长页面
          const longpageMethods = globalEvents?.normalPage?.methods || [];
          globalDeclarationsMethods = [...longpageMethods, ...globalDeclarationsMethods];
        }
        return globalDeclarationsMethods.filter(item => !item.version || compareVersion(this.baseInfo.buildVer, 'ge', item.version));
      }
      const targetNode = this.mapNodes[this.target];
      // 当用户删除了组件后
      if (!targetNode) return [];
      // 返回组件公共的methods和本身的event组合
      return this.compList[targetNode.name].main.declarations?.event?.methods || [];
    },
    // 当前所有的响应组件列表
    eventNodes() {
      const allNodes = [...this.dfsNodes];
      // 替换当前节点名称为 “当前节点”
      allNodes.unshift({ ...allNodes.splice(allNodes.indexOf(this.activeNode), 1)[0], alias: '【当前节点】' });
      // 把全局加上
      return [{
        id: this.baseInfo.publish_key,
        alias: '【全局】',
      }, ...allNodes];
    },
    // 事件触发源默认为当前节点
    source: {
      get() {
        return this.value.source || this.activeNode.id;
      },
      set(newVal) {
        this.$emit('input', {
          ...this.value,
          // 将事件与对比参数清空
          emitter: undefined,
          source: newVal
        });
      }
    },
    compareSymbol: {
      get() {
        return this.value.compare.compareSymbol;
      },
      set(newVal) {
        this.$emit('input', {
          ...this.value,
          compare: {
            ...this.value.compare,
            compareSymbol: newVal
          }
        });
      }
    },
    compareValue: {
      get() {
        return this.value.compare.compareValue;
      },
      set(newVal) {
        this.$emit('input', {
          ...this.value,
          compare: {
            ...this.value.compare,
            compareValue: typeof newVal === 'string' ? newVal.trim() : newVal
          }
        });
      }
    },

    emitter: {
      get() {
        // console.log(this.value, 'emitter.get');
        return this.value?.emitter;
      },

      set(v) {
        this.$emit('input', {
          ...this.value,
          emitter: v
        });
        if (v === 'click' && this.activeNodeId === this.source && !this.activeNode.boxStyle.cursor) {
          this.updateNodeBoxStyle({
            options: {
              cursor: 'pointer'
            }
          });
        }
      }
    },
    compareEnable: {
      get() {
        return this.value.compare.enable;
      },
      set(newVal) {
        // 兼容没有对比对象的项目
        if (!this.value.compare) {
          this.$emit('input', {
            ...this.value,
            compare: { ...this.resetCompareData },
          });
        }
        this.value.compare.enable = newVal;
      }
    },
    target: {
      get() {
        return this.value?.target;
      },

      set(v) {
        this.$emit('input', {
          ...this.value,
          listener: undefined,
          target: v
        });
      }
    },

    listener: {
      get() {
        return this.value?.listener;
      },

      set(v) {
        this.$emit('input', {
          ...this.value,
          // 监听相应方法，重置data，不然格式不兼容报错
          data: undefined,
          listener: v
        });
      }
    },

    eventData: {
      get() {
        return this.value?.data;
      },

      set(v) {
        this.$emit('input', {
          ...this.value,
          data: v
        });
      }
    },
    delay: {
      get() {
        return this.value?.delay || 0;
      },

      set(v) {
        this.$emit('input', {
          ...this.value,
          delay: v || undefined
        });
      }
    },
    showMi18nButton() {
      // 有mi18nkey && 事件的数据格式不是object（目前不支持object设置多语言，之后支持）
      return this.baseInfo.mi18n.key && this.nowListenerType !== 'object';
    },
    mi18n: {
      get() {
        return Boolean(this.value.mi18n);
      },
      set(v) {
        this.$emit('input', {
          ...this.value,
          mi18n: v
        });
      }
    },
    // 返回当前方法的数据类型
    nowListenerType() {
      return this.targetDeclarationsMethods.find((d) => d.name === this.listener)?.dataType || 'string';
    }
  },
  methods: {
    ...mapActions(['updateNodeBoxStyle'])
  }
};
</script>
<style lang="scss" scoped>
.event-form {
  .compare-select,
  .compare-value {
    margin-bottom: 10px;
  }
  .compare-select {
    width: 100px;
  }
  .compare-value {
    width: 148px;
  }
}
</style>
