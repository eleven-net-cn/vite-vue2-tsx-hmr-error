<template>
  <el-form
    size="mini"
    label-position="left"
    label-width="140px"
    @submit.native.prevent
  >
    <el-form-item label="过渡种类">
      <el-select
        v-model="transitionName" filterable size="mini"
        placeholder="请选择过渡效果种类"
      >
        <el-option
          v-for="(item,name) in formList" :key="item.label" :label="item.label"
          :value="name"
        ></el-option>
      </el-select>
    </el-form-item>
    <template v-if="curComponent">
      <component
        :is="curComponent.is"
        :value="styles"
        @updateStyles="e=>{$emit('updateStyles',e)}"
      ></component>
      <el-form-item label="过渡时间(ms)">
        <el-input-number
          :value="duration"
          style="width:100%"
          :min="0"
          :step="50"
          size="mini"
          placeholder="请输入过渡时间(ms)" @change="num => duration = num"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="贝塞尔曲线">
        <el-select
          v-model="timingFunction" filterable size="mini"
          placeholder="请选择符合规格的贝塞尔曲线"
          allow-create
          default-first-option
        >
          <el-option
            v-for="(item) in timingFunctionList" :key="item.label" :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </template>
  </el-form>
</template>

<script>
import formList from './formList';

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      formList: {
        none: {
          label: '无'
        },
        ...formList,
      },
      timingFunctionList: [
        {
          label: '默认',
          value: 'ease'
        },
        {
          label: '缓入',
          value: 'ease-in'
        },
        {
          label: '缓出',
          value: 'ease-out'
        },
        {
          label: '缓入缓出',
          value: 'ease-in-out'
        },
      ]
    };
  },
  computed: {
    styles() {
      return this.value.styles;
    },
    curComponent() {
      if (this.transitionName === 'none') return;
      return {
        is: require(`./${this.transitionName}`).default
      };
    },
    duration: {
      get() {
        return Number(this.value.duration) || 300;
      },
      set(newVal) {
        this.$emit('updateConfig', { duration: String(newVal) });
      }
    },
    transitionName: {
      get() {
        return this.value.name || 'none';
      },
      set(newVal) {
        let initConfig;
        if (newVal !== 'none') {
          initConfig = {
            ...this.formList[newVal]?.initConfig, name: newVal, duration: String(this.duration), timingFunction: this.timingFunction
          };
        }
        this.$emit('initConfig', initConfig);
      }
    },
    timingFunction: {
      get() {
        return this.value.timingFunction || '';
      },
      set(newVal) {
        this.$emit('updateConfig', { timingFunction: newVal || 'ease-in-out' });
      }
    }
  }
};
</script>
