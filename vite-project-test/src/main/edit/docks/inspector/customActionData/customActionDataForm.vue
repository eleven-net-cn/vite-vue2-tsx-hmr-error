<template>
  <el-form
    size="mini"
    label-position="left"
    class="customActionDataForm"
    label-width="80px"
    @submit.native.prevent
  >
    <el-form-item label="响应数据">
      <el-tooltip content="可以通过${QS.xxx}来获取地址栏上的xxx参数，以及${data}的形式来插入动态内容" placement="top">
        <i class="el-icon-info" />
      </el-tooltip>
    </el-form-item>

    <!-- 埋点 -->
    <template v-if="eventType === 'statTrackEvent'">
      <el-form-item label="Category">
        <el-input :value="statVal[0]" placeholder="" @input="handleInputStat($event, 0)"></el-input>
      </el-form-item>
      <el-form-item label="Action">
        <el-input :value="statVal[1]" placeholder="" @input="handleInputStat($event, 1)"></el-input>
      </el-form-item>
      <el-form-item label="Label">
        <el-input :value="statVal[2]" placeholder="" @input="handleInputStat($event, 2)"></el-input>
      </el-form-item>
      <el-form-item label="Value">
        <el-input :value="statVal[3]" placeholder="" @input="handleInputStat($event, 3)"></el-input>
      </el-form-item>
    </template>
    <!-- 复制文字 -->
    <template v-else-if="eventType === 'copy'">
      <el-form-item label="复制文本">
        <el-input :value="copyVal.text" placeholder="" @input="handleInputCopy($event, 'text')"></el-input>
      </el-form-item>
      <el-form-item label="复制成功提示">
        <el-input :value="copyVal.stext" placeholder="" @input="handleInputCopy($event, 'stext')"></el-input>
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item label="数据">
        <el-input :value="value" placeholder="" @input="$emit('input', $event);"></el-input>
      </el-form-item>
    </template>
  </el-form>
</template>

<script>
export default {
  // 响应数据的自定义表单
  name: 'CustomActionDataForm',
  props: {
    // 事件类型（就是全局事件—）
    eventType: {
      type: String,
      // 默认是一个输入框的”响应数据“，其他值看：https://platgit.mihoyo.com/plat/event/mee/puzzle-ui/wrapper/-/blob/master/src/main/declarations.js#L64
      default: 'default'
    },
    // 值
    value: {
      type: [String, Object],
      default: ''
    }

    // 本次要用：statTrackEvent、copy
  },
  data() {
    return {
    };
  },
  computed: {
    // 管理输入和输出
    /**
     * 数据埋点的字符串
     * 埋点：in：string、out：string
     */
    statVal: {
      get() {
        if (this.eventType === 'statTrackEvent' && this.value) {
          return this.value.split(',').concat(Array(4).fill('')).slice(0, 4);
        }

        return Array(4).fill('');
      },
      set(val) {
        const str = val.join(',');
        this.$emit('input', str);
      }
    },
    /**
     * 复制文字
     * in：object，out：object
     */
    copyVal: {
      get() {
        if (this.eventType === 'copy' && this.value) {
          return ({ ...this.value });
        }
        return {
          text: '',
          stext: '',
        };
      },
      set(val) {
        this.$emit('input', val);
      },
    }

  },
  mounted() {

  },
  methods: {
    handleInputStat(val, idx) {
      const arr = [...this.statVal];
      arr[idx] = val;
      this.statVal = arr;
    },
    handleInputCopy(val, key) {
      this.copyVal = { ...this.copyVal, [key]: val };
    }
  },

};
</script>

<style lang="scss" scoped>
</style>
