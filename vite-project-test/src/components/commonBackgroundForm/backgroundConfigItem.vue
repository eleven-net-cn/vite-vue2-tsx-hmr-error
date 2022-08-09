<template>
  <el-row :gutter="10" style="margin-bottom: 20px;">
    <el-col :span="18">
      <puzzle-upload
        v-model="backgroundImage"
        class="bg-pz-upload"
        accept=".png,.jpeg,.jpg,.gif"
      >
      </puzzle-upload>
    </el-col>
    <el-col :span="6" class="bg-handle-pannel">
      <!-- 出现编辑区域 -->
      <bg-form :value="value" @update-data="handleUpdateData">
        <el-button type="primary" size="mini">
          编辑
        </el-button>
      </bg-form>
      <el-button
        v-if="isShowDel" type="danger" size="mini"
        @click="handleUpdateData({del: true })"
      >
        删除
      </el-button>
    </el-col>
  </el-row>
</template>

<script>
import bgForm from './backgroundForm.vue';

export default {
  // 一行背景的配置项
  name: 'BackgroundConfigItem',
  components: {
    bgForm,
  },
  props: {
    value: {
      type: [Object, Array],
      required: true,
      default: (() => {}),
    },
    isShowDel: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    backgroundImage: {
      get() {
        return this.value.backgroundImage || '';
      },
      set(val) {
        this.handleUpdateData({ key: 'backgroundImage', val });
      },
    },
  },
  methods: {
    // 向外传递数据变更
    handleUpdateData(bg) {
      this.$emit('update-bg-data', bg);
    }
  },

};
</script>

<style lang="scss" scoped>
.bg-handle-pannel {
  height: 80px;
  display: flex;
  justify-content: space-around;
  align-content: center;
  flex-direction: column;

  // 去掉data-xx的hash，不然第三方组件样式设置失效
  ::v-deep .el-button {
    margin: 0 !important;
  }
}
</style>
