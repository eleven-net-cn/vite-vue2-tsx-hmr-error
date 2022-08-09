<template>
  <el-form-item class="comp-mi18n-form-item" :label="label" label-width="70px">
    <pz-collapse>
      <pz-collapse-item>
        <template #title>
          <el-tooltip :disabled="!curName" placement="top">
            <div slot="content">
              数据源：{{ curName }}<br />数据内容：{{ curKeyName||'无' }}<div v-if="value.params&&typeof value.params === 'string'">
                数据属性：{{ value.params }}
              </div>
            </div>
            <span class="comp-mi18n-form-item-title" style="white-space:nowrap">{{ curName||'暂未定义，点击展开配置' }}{{ curKeyName?`>${curKeyName}`:'' }}{{ value.params?`>${value.params}`:'' }}</span>
          </el-tooltip>
        </template>
        <pz-collapse-row>
          <el-form-item
            class="comp-mi18n-form-item-item" label="数据源："
            label-width="60px"
          >
            <pz-select
              v-model="curId"
              filterable
              clearable placeholder="请选择数据源"
            >
              <pz-option
                v-for="(item,id) in globalStateList"
                :key="id"
                :label="item.node.alias"
                :value="id"
              >
              </pz-option>
            </pz-select>
          </el-form-item>
        </pz-collapse-row>
        <pz-collapse-row>
          <el-form-item
            class="comp-mi18n-form-item-item" label="数据内容："
            label-width="60px"
          >
            <pz-select
              v-model="curKey"
              filterable
              clearable placeholder="请选择数据内容"
            >
              <template v-for="(item,key) in (curNodeMsg.linkStateMsg||{})">
                <!-- 目前先按照stringType去设置，后续会加入boolean等 -->
                <pz-option
                  v-if="item.stringType === type||item.stringType === 'any'"
                  :key="key"
                  :label="item.label"
                  :value="key"
                >
                </pz-option>
              </template>
            </pz-select>
          </el-form-item>
        </pz-collapse-row>
        <pz-collapse-row v-if="value.customPropName">
          <el-form-item
            class="comp-mi18n-form-item-item" label="数据属性："
            label-width="60px"
          >
            <pz-input v-model="curParams"></pz-input>
          </el-form-item>
        </pz-collapse-row>
      </pz-collapse-item>
    </pz-collapse>
  </el-form-item>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { compareVersion } from '@/utils/';

export default {
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    }
  },
  computed: {
    ...mapState(['baseInfo']),
    ...mapGetters(['globalStateList']),
    curId: {
      get() {
        return this.value.id;
      },
      set(newVal) {
        this.$emit('update', {
          ...this.value,
          key: undefined,
          params: undefined,
          customPropName: undefined,
          id: newVal || undefined
        });
      }
    },
    curKey: {
      get() {
        return this.value.key;
      },
      set(newVal) {
        const customPropName = (this.curNodeMsg?.linkStateMsg?.[newVal]?.customPropName) || undefined;
        this.$emit('update', {
          ...this.value,
          customPropName,
          key: newVal || undefined,
          params: undefined,
        });
      }
    },
    curName() {
      return this.globalStateList[this.curId]?.node.alias;
    },
    curKeyName() {
      return this.curNodeMsg.linkStateMsg?.[this.curKey]?.label;
    },
    curParams: {
      get() {
        return this.value.params;
      },
      set(newVal) {
        this.$emit('update', {
          ...this.value,
          params: newVal || undefined,
        });
      }
    },
    // 当前的类型列表
    curNodeMsg() {
      return this.globalStateList[this.curId] || {};
    }
  },
  methods: {
    compareVersion(c, v) {
      return compareVersion(this.baseInfo.buildVer, c, v);
    },
  }
};
</script>

<style lang="scss" scoped>
.comp-mi18n-form-item {
  margin-bottom: 16px !important;
  .comp-mi18n-form-item-title {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .comp-mi18n-form-item-item {
    margin: unset !important;
  }
}
</style>
