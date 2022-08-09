<template>
  <el-form
    size="mini"
    label-position="left"
    class="background-form-index"
    label-width="80px"
    @submit.native.prevent
  >
    <el-divider content-position="left">
      背景图
    </el-divider>
    <!-- 单背景图配置 -->
    <bg-config-item :value="value" :is-show-del="false" @update-bg-data="handleUpdateSingle"></bg-config-item>
    <!-- 这里是组件支持多背景的配置列表 -->
    <!-- <el-row v-if="type === 'comp'" ref="sortable-wrapper"> -->
    <el-row ref="sortable-wrapper" style="margin-bottom: 10px;">
      <el-collapse class="more-collapse">
        <el-collapse-item title="更多背景">
          <el-button
            type="success" size="mini" style="margin-bottom: 10px;"
            @click="addBgConfig"
          >
            添加背景
          </el-button>
          <!-- 多背景图配置 -->
          <bg-config-item
            v-for="bg in bgConfigList"
            :key="bg.id" :value="bg"
            @update-bg-data="handleUpdateMutil($event, bg.id)"
          ></bg-config-item>
        </el-collapse-item>
      </el-collapse>
    </el-row>
    <el-form-item label="背景色">
      <el-color-picker v-model="backgroundColor" show-alpha>
      </el-color-picker>
    </el-form-item>
  </el-form>
</template>

<script>
import { omit } from 'lodash';
import bgConfigItem from './backgroundConfigItem.vue';

export default {
  name: 'CommonBackgroundForm',
  components: {
    bgConfigItem
  },
  props: {
    // 第一个固定背景位置的值
    value: {
      type: [Object, Array],
      default: (() => {}),
    },
  },
  computed: {
    // 多背景图的列表配置
    bgConfigList: {
      get() {
        const nowPropsBgListConfig = this.value?.backgroundListConfig;
        const hasMutilBg = nowPropsBgListConfig && nowPropsBgListConfig?.length !== 0;
        // 添加一个id作为key
        const processBgList = nowPropsBgListConfig?.map((b, id) => ({ ...b, id }));
        return hasMutilBg ? processBgList : [];
      },
      set(val) {
        // 向外传递最新的多图配置列表
        this.$emit('update-mutil', val);
      }
    },
    backgroundColor: {
      get() {
        const backgroundColor = this.value.backgroundColor;
        return backgroundColor || '';
      },
      set(val) {
        this.handleUpdateSingle({ key: 'backgroundColor', val });
      },
    },
  },
  methods: {
    // 添加背景配置
    addBgConfig() {
      const curId = (this.bgConfigList[this.bgConfigList.length - 1]?.id || 0) + 1;
      this.bgConfigList = [...this.bgConfigList, { id: curId }].map(bg => omit(bg, ['id']));
    },
    // 单图处理逻辑
    handleUpdateSingle({ key, val }) {
      // console.log('----单图---');
      // console.log(key, val);
      this.$emit('update-single', key, val);
    },
    // 多图处理逻辑
    handleUpdateMutil({ key, val, del } = { del: false }, id) {
      // console.log('---多图---');
      // console.log({ key, val, del }, id);
      const idx = this.bgConfigList.findIndex(bg => bg.id === id);
      if (idx === -1) return;
      const nowIdxData = this.bgConfigList[idx];
      const nowBgConfigList = [...this.bgConfigList];
      if (del) {
        nowBgConfigList.splice(idx, 1);
      } else {
        // 更新传入的数据
        nowIdxData[key] = val;
        nowBgConfigList.splice(idx, 1, nowIdxData);
      }
      this.bgConfigList = nowBgConfigList.map(bg => omit(bg, ['id']));
    },

  },

};
</script>

<style lang="scss" scoped>
.background-form-index {
  .more-collapse {
    ::v-deep .el-collapse-item__header {
      font-size: 12px;
      height: 30px;
      font-weight: normal;
    }
  }
}
</style>
