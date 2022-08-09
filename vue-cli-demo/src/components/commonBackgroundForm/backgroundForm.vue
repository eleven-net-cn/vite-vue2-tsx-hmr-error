<template>
  <el-popover placement="left-end" :width="400" trigger="click">
    <template #reference>
      <slot></slot>
    </template>

    <el-form
      size="mini"
      label-position="left"
      class="background-form"
      label-width="100px"
      :model="value"
      @submit.native.prevent
    >
      <el-form-item>
        <el-tooltip slot="label" content="背景的对齐方式" placement="top">
          <span>背景位置 <i class="el-icon-info" /></span>
        </el-tooltip>
        <el-select
          v-model="backgroundPosition" size="mini" placeholder="请选择背景对齐位置"
        >
          <el-option
            v-for="item in backgroundPositionList" :key="item.value" :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="适应方式">
        <el-radio-group v-model="backgroundSize" size="mini">
          <el-radio-button label="cover">
            覆盖
          </el-radio-button>
          <el-radio-button label="contain">
            适应
          </el-radio-button>
          <el-radio-button label="100% 100%">
            拉伸
          </el-radio-button>
          <el-radio-button label="custom">
            自定
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <template v-if="backgroundSize === 'custom'">
        <el-form-item label="自定背景宽">
          <el-input-number
            style="min-width: 140px"
            :value="custombackgroundSizeWidth"
            controls-position="right"
            :min="0"
            size="mini"
            @change="(val) => (custombackgroundSizeWidth = val)"
          ></el-input-number>px
        </el-form-item>
        <el-form-item label="自定背景高">
          <el-input-number
            style="min-width: 140px"
            :value="custombackgroundSizeHeight"
            controls-position="right"
            :min="0"
            size="mini"
            @change="(val) => (custombackgroundSizeHeight = val)"
          ></el-input-number>px
        </el-form-item>
      </template>
      <el-form-item label="背景重复">
        <el-select v-model="backgroundRepeat" size="mini" placeholder="请选择是否背景重复">
          <el-option
            v-for="item in backgroundRepeatList" :key="item.value" :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-collapse class="more-collapse">
        <el-collapse-item title="高级属性">
          <!-- 以下不常用----- -->
          <el-form-item v-if="platform === 'pc'" label="背景附属">
            <el-select v-model="backgroundAttachment" size="mini" placeholder="请选择">
              <el-option
                v-for="item in backgroundAttachmentList" :key="item.value" :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="背景范围">
            <el-select v-model="backgroundClip" size="mini" placeholder="请选择">
              <el-option
                v-for="item in backgroundClipList" :key="item.value" :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="背景原点范围">
            <el-select v-model="backgroundOrigin" size="mini" placeholder="请选择复">
              <el-option
                v-for="item in backgroundOriginList" :key="item.value" :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </el-popover>
</template>

<script>
import {
  mapState
} from 'vuex';

export default {
  // 这里是公共的背景表单配置区域
  name: 'BackgroundForm',
  props: {
    value: {
      type: Object,
      required: true,
      default: (() => {})
    },
  },
  data() {
    return {
      backgroundPositionList: [
        {
          value: 'top',
          label: '上',
        },
        {
          value: 'bottom',
          label: '下',
        },
        {
          value: 'left',
          label: '左',
        },
        {
          value: 'right',
          label: '右',
        },
        {
          value: 'center',
          label: '居中',
        },
      ],
      backgroundRepeatList: [
        {
          value: 'no-repeat',
          label: '不重复',
        },
        {
          value: 'repeat-y',
          label: 'y轴重复',
        },
        {
          value: 'repeat-x',
          label: 'x轴重复',
        },
        {
          value: 'repeat',
          label: '两轴重复',
        },
      ],
      backgroundAttachmentList: [
        {
          value: 'scroll',
          label: '相对元素内容固定'
        },
        {
          value: 'local',
          label: '相对元素固定'
        },
      ],
      backgroundClipList: [
        {
          value: 'border-box',
          label: '背景延伸至边框外沿'
        },
        {
          value: 'padding-box',
          label: '背景延伸至内边距'
        },
        {
          value: 'content-box',
          label: '背景被裁剪至内容区外沿'
        }
      ],
      backgroundOriginList: [
        {
          value: 'border-box',
          label: '背景图片的摆放以 border 区域为参考'
        },
        {
          value: 'padding-box',
          label: '背景图片的摆放以 padding 区域为参考'
        },
        {
          value: 'content-box',
          label: '背景图片的摆放以 content 区域为参考'
        },
      ],
    };
  },
  computed: {
    ...mapState([
      'platform',
    ]),
    backgroundPosition: {
      get() {
        return this.value.backgroundPosition || 'center';
      },
      set(newVal) {
        this.emitUpdateData('backgroundPosition', newVal);
      },
    },

    backgroundSize: {
      get() {
        return this.value.backgroundSize || 'cover';
      },
      set(newVal) {
        this.emitUpdateData('backgroundSize', newVal);
      },
    },

    custombackgroundSizeHeight: {
      get() {
        const custombackgroundSizeHeight = this.value.custombackgroundSizeHeight || 0;
        return Math.round(custombackgroundSizeHeight * 100);
      },
      set(newval) {
        // eslint-disable-next-line no-param-reassign
        newval = (newval / 100).toFixed(2);
        this.emitUpdateData('custombackgroundSizeHeight', newval);
      },
    },
    custombackgroundSizeWidth: {
      get() {
        const custombackgroundSizeWidth = this.value.custombackgroundSizeWidth || 0;
        return Math.round(custombackgroundSizeWidth * 100);
      },
      set(newval) {
        // eslint-disable-next-line no-param-reassign
        newval = (newval / 100).toFixed(2);
        this.emitUpdateData('custombackgroundSizeWidth', newval);
      },
    },
    backgroundRepeat: {
      get() {
        return this.value.backgroundRepeat || 'no-repeat';
      },
      set(newVal) {
        this.emitUpdateData('backgroundRepeat', newVal);
      },
    },

    backgroundAttachment: {
      get() {
        return this.value.backgroundAttachment || 'scroll';
      },
      set(newVal) {
        this.emitUpdateData('backgroundAttachment', newVal);
      },
    },
    backgroundClip: {
      get() {
        return this.value.backgroundClip || 'border-box';
      },
      set(newVal) {
        this.emitUpdateData('backgroundClip', newVal);
      },
    },
    backgroundOrigin: {
      get() {
        return this.value.backgroundOrigin || 'padding-box';
      },
      set(newVal) {
        this.emitUpdateData('backgroundOrigin', newVal);
      },
    },
  },
  methods: {
    emitUpdateData(key, val) {
      this.$emit('update-data', { key, val });
    }
  },

};
</script>

<style lang="scss" scoped>
</style>
