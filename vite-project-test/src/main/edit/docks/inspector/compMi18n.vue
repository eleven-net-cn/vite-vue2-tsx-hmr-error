<template>
  <div v-if="canSetMi18n">
    <el-divider content-position="left">
      创建多语言字段
    </el-divider>
    <el-form-item
      v-if="!isPageCompType"
      label="自定义来源："
      label-width="80px"
    >
      <pz-select
        v-model="mi18nFromId"
        filterable
        clearable placeholder="请选择多语言来源"
      >
        <pz-option
          v-for="(item) in sameCompList"
          :key="item.id"
          :label="item.alias"
          :value="item.id"
        >
        </pz-option>
      </pz-select>
    </el-form-item>
    <div class="comp-mi18n">
      <div class="left-item">
        <h3>全选</h3>
        <pz-switch v-model="allChecked" style="margin-left:5px"></pz-switch>
      </div>
      <el-button v-if="!isPageCompType" type="text" @click="createCustomMi18nKey">
        创建共用key
      </el-button>
    </div>
    <CompMi18nFormItem
      v-for="(item) in mi18nList" :key="item.optionName" :label="item.optionLabel"
      :type="item.type"
      :value="getItemMsg(item.optionName)" style="marginBottom:20px"
      @update="itemChange($event,item.optionName)"
    />
    <el-dialog
      :visible.sync="visible"
      title="自定义多语言key面板"
      append-to-body
      :show-close="true"
      :close-on-click-modal="false"
    >
      <el-form
        ref="form" :model="formData" label-width="100px"
      >
        <el-form-item
          v-for="(mi18nMsg, index) in formData.mi18nKeys"
          :key="index"
        >
          <template #label>
            <el-popover
              placement="left"
              width="250"
              trigger="hover"
            >
              <template v-if="mi18nMsg.nodes.length">
                <el-tag v-for="node in mi18nMsg.nodes" :key="node.id" size="mini">
                  {{ node.alias }}
                </el-tag>
              </template>
              <el-tag v-else size="mini">
                暂无组件用到该key
              </el-tag>
              <template #reference>
                <span>key<i class="el-icon-info" /></span>
              </template>
            </el-popover>
          </template>
          <el-col :span="5">
            <el-form-item
              :rules="mi18nMsg.new?[
                { required: true, message: '该参数不能为空', trigger: 'blur' },
                { trigger: 'blur',validator:validatePassKey },
              ]:[]"
              :prop="'mi18nKeys.' + index + '.key'"
            >
              <el-input v-model="mi18nMsg.key" :disabled="mi18nMsg.nodes.length>0" placeholder="多语言key"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2" style="text-align:center">
            -- 类型
          </el-col>
          <el-col :span="5">
            <el-form-item :prop="'mi18nKeys.' + index + '.type'">
              <el-select v-model="mi18nMsg.type" :disabled="mi18nMsg.nodes.length>0" placeholder="多语言资源类型">
                <el-option
                  v-for="item in MI18N_RES_TYPES" :key="item.label" :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2" style="text-align:center">
            -- 描述
          </el-col>
          <el-col :span="5">
            <el-form-item
              :rules="mi18nMsg.new?[
                { required: true, message: '该参数不能为空', trigger: 'blur' },
              ]:[]"
              :prop="'mi18nKeys.' + index + '.desc'"
            >
              <el-input v-model="mi18nMsg.desc" placeholder="描述"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-button type="text" @click="handlerDeleteItem(mi18nMsg)">
              删除
            </el-button>
            <el-button v-if="index === formData.mi18nKeys.length - 1" type="text" @click="addMi18nCustomKey">
              新增参数
            </el-button>
          </el-col>
        </el-form-item>
        <el-button v-if="formData.mi18nKeys.length === 0" type="text" @click="addMi18nCustomKey">
          新增参数
        </el-button>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="updateCustomMi18nKeys">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { MI18N_RES_TYPES } from '@/constants/resource';
import { MI18N_RES_TYPE } from '@/types';
import { compareVersion } from '@/utils/';
import CompMi18nFormItem from './compMi18nFormItem';
import * as utils from '@/utils';

export default {
  components: {
    CompMi18nFormItem
  },
  data() {
    return {
      visible: false,
      MI18N_RES_TYPES,
      formData: {
        mi18nKeys: [],
      }
    };
  },
  computed: {
    ...mapState(['baseInfo']),
    ...mapGetters(['activeNodePro', 'hasMi18n', 'activeNode', 'allMi18nMsgList', 'isPageCompType', 'pageConfig']),
    declarations() {
      return this.activeNodePro.declarations;
    },
    mi18nList() {
      return this.declarations.mi18n || [];
    },
    canSetMi18n() {
      return this.hasMi18n && this.mi18nList?.length && this.compareVersion('ge', '2.7.22');
    },
    compMi18nMsg() {
      return this.activeNode.otherOptions.mi18n || {};
    },
    allChecked: {
      get() {
        const compMi18nList = Object.values(this.compMi18nMsg);
        return compMi18nList.length === this.mi18nList.length && compMi18nList.every(item => item.enabled);
      },
      set(newVal) {
        this.multiChange(newVal);
      }
    },
    sameCompList() {
      const sameCompList = {};
      const pushNode = (node, plat) => {
        if (node === this.activeNode) return;
        if (node.name !== this.activeNode.name) return;
        const { id, alias } = node;
        sameCompList[id] = { alias, id, plat };
      };
      utils.dfsNodes(this.pageConfig.h5?.nodes || [], (node) => {
        pushNode(node, 'h5');
      });
      utils.dfsNodes(this.pageConfig.pc?.nodes || [], (node) => {
        pushNode(node, 'pc');
      });
      return sameCompList;
    },
    mi18nFromId: {
      get() {
        return this.activeNode.otherOptions.mi18nFrom?.id;
      },
      set(newVal) {
        const config = {
          mi18nFrom: undefined
        };
        if (newVal) {
          config.mi18nFrom = {
            id: newVal,
            plat: this.sameCompList[newVal].plat
          };
        }
        this.updateNodeOtherOptions({
          options: config
        });
      }
    },
  },
  methods: {
    ...mapActions(['updateNodeOtherOptions', 'updateNodeMi18n']),
    updateCustomMi18nKeys() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.visible = false;
          const customMi18nKey = {};
          this.formData.mi18nKeys.forEach(item => {
            const { desc, key, type } = item;
            customMi18nKey[key] = {
              desc,
              type
            };
          });
          this.baseInfo.customMi18nKey = customMi18nKey;
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    validatePassKey(rule, value, callback) {
      if (this.formData.mi18nKeys.filter(item => item.key === value).length >= 2) {
        callback(new Error('不能与其他项重复'));
      }
      callback();
    },
    getItemMsg(name) {
      return this.compMi18nMsg[name];
    },
    createDefaultKeyMsg() {
      return {
        key: '',
        nodes: [],
        desc: '',
        type: MI18N_RES_TYPE.TEXT
      };
    },
    addMi18nCustomKey() {
      this.formData.mi18nKeys.push({ ...this.createDefaultKeyMsg(), new: true });
    },
    handlerDeleteItem(mi18nMsg) {
      this.formData.mi18nKeys.splice(this.formData.mi18nKeys.indexOf(mi18nMsg), 1);
    },
    getCustomMi18nKey() {
      const customMi18nKey = [];
      this.formData.mi18nKeys = Object.keys(this.baseInfo.customMi18nKey).forEach(key => {
        const defaultData = {
          ...this.createDefaultKeyMsg(),
          // type 和 desc
          ...this.baseInfo.customMi18nKey[key],
          key
        };
        customMi18nKey.push(defaultData);
        this.allMi18nMsgList.forEach(mi18nMsg => {
          if (mi18nMsg.customKey === key) {
            if (mi18nMsg.node && !defaultData.nodes.includes(mi18nMsg.node)) {
              defaultData.nodes.push(mi18nMsg.node);
            }
          }
        });
      });
      return customMi18nKey;
    },
    createCustomMi18nKey() {
      this.formData.mi18nKeys = this.getCustomMi18nKey();
      if (!this.formData.mi18nKeys.length) {
        this.addMi18nCustomKey();
      }
      this.visible = true;
    },
    multiChange(enabled) {
      const newCompMi18nMsg = {};
      this.mi18nList.forEach(({ optionName }) => {
        newCompMi18nMsg[optionName] = {
          enabled
        };
        const desc = this.compMi18nMsg[optionName]?.desc;
        if (desc) {
          newCompMi18nMsg[optionName].desc = desc;
        }
      });
      this.updateNodeOtherOptions({
        options: {
          mi18n: newCompMi18nMsg
        }
      });
    },
    itemChange(options, name) {
      this.updateNodeMi18n({
        options,
        name,
      });
    },
    compareVersion(c, v) {
      return compareVersion(this.baseInfo.buildVer, c, v);
    },
  }
};
</script>
<style lang="scss" scoped>
.comp-mi18n {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .left-item {
    display: flex;
    align-items: center;
  }
}
</style>
