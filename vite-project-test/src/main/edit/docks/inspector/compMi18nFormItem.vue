<template>
  <el-form-item class="comp-mi18n-form-item" :label="label" label-width="70px">
    <pz-collapse>
      <pz-collapse-item>
        <template #title>
          <pz-switch v-model="enabled" style="margin-right:10px" @click.native.stop></pz-switch>
          <el-form-item
            v-if="canSetCustomKey" class="comp-mi18n-form-item-item" label="key："
            label-width="30px"
          >
            <pz-select
              clearable
              :disabled="isPageCompType"
              placeholder="默认自动生成" :value="value.customKey" @input="handlerChange('customKey',$event)"
            >
              <pz-option
                v-for="item in customMi18nKeys"
                :key="item.label"
                filterable
                :value="item.value"
              >
                <div class="comp-mi18n-form-item-select-item">
                  <p class="select-item-text">
                    {{ item.value }}
                  </p>
                  <p class="select-item-text">
                    {{ item.desc }}
                  </p>
                </div>
              </pz-option>
            </pz-select>
          </el-form-item>
        </template>
        <pz-collapse-row>
          <el-form-item class="comp-mi18n-form-item-item" label="自定描述：" label-width="60px">
            <pz-input :disabled="!!value.customKey" :value="desc" @input="handlerChange('desc',$event)"></pz-input>
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
    ...mapGetters(['isPageCompType']),
    enabled: {
      get() {
        return Boolean(this.value.enabled);
      },
      set(newVal) {
        const data = {
          enabled: newVal
        };
        this.$emit('update', data);
      }
    },
    desc() {
      const { customKey, desc } = this.value;
      return customKey ? this.baseInfo.customMi18nKey[customKey]?.desc : desc;
    },
    canSetCustomKey() {
      return this.compareVersion('ge', '2.10.45');
    },
    customMi18nKeys() {
      return Object.keys(this.baseInfo.customMi18nKey).map(key => ({
        ...this.baseInfo.customMi18nKey[key],
        value: key
      })).filter(item => item.type === this.type);
    },
  },
  methods: {
    handlerChange(key, newVal) {
      this.$emit('update', {
        [key]: newVal || ''
      });
    },
    compareVersion(c, v) {
      return compareVersion(this.baseInfo.buildVer, c, v);
    },
  }
};
</script>

<style lang="scss" scoped>
.comp-mi18n-form-item {
  margin-bottom: 16px !important;
  .comp-mi18n-form-item-item {
    margin: unset !important;
  }
}
.comp-mi18n-form-item-select-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 200px;
  .select-item-text {
    flex: none;
    font-size: 12px;
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .select-item-text:last-child {
    color: #8492a6;
  }
}
</style>
