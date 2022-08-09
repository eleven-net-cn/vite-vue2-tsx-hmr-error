<template>
  <div class="bd-actions">
    <div v-if="modeType === 'preview'&&compareVersion('ge','2.10.23')">
      <ZoneSelector :value="previewZone" class="zone-container" @change="updatePreviewZone" />
      <ZeroZoneTimeSelector
        :value="previewTime" placeholder="请选择预览时间" class="time-container"
        @input="updatePreviewTime"
      />
    </div>
    <el-radio-group
      v-if="!isPageCompType"
      v-model="modeType"
      size="mini"
    >
      <el-radio-button label="edit">
        编辑模式
      </el-radio-button>
      <el-radio-button label="preview">
        预览模式
      </el-radio-button>
    </el-radio-group>
    <el-select
      v-if="modeType === 'preview'&&compareVersion('ge','2.9.6')"
      ref="select"
      :value="platValueList"
      multiple
      :style="{
        position:isPageCompType?'static':undefined
      }"
      filterable
      collapse-tags
      size="small"
      class="select-container"
      clearable
      placeholder="切换预览渠道"
      @change="previewPlatChange"
    >
      <el-option-group
        v-for="group in platList"
        :key="group.label"
        :label="group.label"
      >
        <el-option
          v-for="item in group.options"
          :key="item.value||item.label"
          :value="item.value||item.label"
        >
          <div class="select-box">
            <div class="left-box">
              <span v-if="!item.value||item.value !== 'pzadd'">{{ item.label }}</span>
              <span v-else style="color:#409EFF"><i class="el-icon-plus"></i>自定义</span>
            </div>
            <div v-if="group.label === '自定义渠道'&&(!item.value||item.value !== 'pzadd')" class="right-box" style="color:#409EFF">
              <i class="el-icon-edit" style="margin-right:10px;" @click.stop="handlerEdit(item)"></i>
              <i class="el-icon-delete" @click.stop="handlerDelete(item.label)"></i>
            </div>
          </div>
        </el-option>
      </el-option-group>
    </el-select>
    <el-dialog
      :visible.sync="visible"
      title="添加预览参数"
      append-to-body
      :show-close="false"
      :close-on-click-modal="false"
    >
      <el-form
        ref="form" :model="formData" label-width="100px"
      >
        <el-form-item
          prop="label"
          label="渠道名"
        >
          <el-input v-model="formData.label" placeholder="请输入渠道命名"></el-input>
        </el-form-item>

        <el-form-item
          v-for="(search, index) in formData.searchs"
          :key="index"
          :label="'参数项' + index"
        >
          <el-col :span="5">
            <el-form-item
              :rules="[
                { required: true, message: '该参数不能为空', trigger: 'blur' },
              ]"
              :prop="'searchs.' + index + '.key'"
            >
              <el-input v-model="search.key" placeholder="参数名"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2" style="text-align:center">
            -
          </el-col>
          <el-col :span="5">
            <el-form-item
              :rules="[
                { required: true, message: '该参数不能为空', trigger: 'blur' },
              ]"
              :prop="'searchs.' + index + '.val'"
            >
              <el-input v-model="search.val" placeholder="参数值"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-button v-if="formData.searchs.length>1" type="text" @click="handlerDeleteItem(search)">
              删除
            </el-button>
            <el-button v-if="index === formData.searchs.length - 1" type="text" @click="addSearch">
              新增参数
            </el-button>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="addPreviewPlatList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  mapActions, mapGetters, mapMutations, mapState
} from 'vuex';
import { pageCompPreviewPlatList, normalPreviewPlatList } from '@/constants/';
import { compareVersion } from '@/utils/';
import ZeroZoneTimeSelector from '@/main/edit/docks/inspector/envLinkForms/zeroZoneTimeSelector.vue';
import ZoneSelector from '@/main/edit/docks/inspector/envLinkForms/zoneSelector.vue';

export default {
  components: {
    ZeroZoneTimeSelector,
    ZoneSelector
  },
  data() {
    return {
      platValueList: [],
      visible: false,
      formType: '',
      editLabel: '',
      formData: {
        label: '',
        searchs: [
          {
            key: '',
            val: ''
          }
        ]
      }
    };
  },
  computed: {
    ...mapState(['baseInfo', 'platform', 'canvasTransformData', 'previewZone', 'previewTime']),
    ...mapGetters(['isPageCompType']),
    modeType: {
      get() {
        return this.$store.state.modeType;
      },
      set(newVal) {
        if (newVal === 'preview') {
          this.searchDep();
          this.searchDepPlat();
        }
        this.changeModeType(newVal);
      }
    },
    platList() {
      let platList = [];
      if (this.isPageCompType) {
        platList = platList.concat(pageCompPreviewPlatList);
      }
      const isMobile = this.checkIsMobile(this.platValueList);
      normalPreviewPlatList.forEach(item => {
        if (item.plat === 'h5' && isMobile) {
          platList.push(item);
        }
        if (item.plat === 'pc' && !isMobile) {
          platList.push(item);
        }
        if (item.plat === 'all') {
          platList.push(item);
        }
      });
      if (platList.length) {
        platList = [
          {
            label: '渠道',
            options: platList
          }
        ];
      }

      platList.push({
        label: '自定义渠道',
        options: [
          ...this.baseInfo.previewPlatList,
          {
            value: 'pzadd',
          }
        ]
      });
      return platList;
    },
    extraParams() {
      if (!this.platValueList.length) return [];
      console.log(this.platValueList, this.platList);
      let extraParams = [];
      this.platValueList.forEach(key => {
        let urlSearchList;
        this.platList.some(plat => plat.options.some(item => {
          let _key = item.value;
          if (!_key) {
            _key = item.label;
          }
          urlSearchList = item.urlSearchList;
          return _key === key;
        }));
        if (!urlSearchList?.length) return;
        extraParams = extraParams.concat(urlSearchList);
      });
      return extraParams;
    }
  },
  watch: {
    extraParams(newVal) {
      this.updatePreviewExtraParams(newVal);
    },
    platform() {
      this.platValueList = [];
    }
  },
  methods: {
    ...mapMutations(['setCanvasScale', 'changeModeType', 'updatePreviewPlatList', 'updatePreviewExtraParams', 'updatePreviewZone', 'updatePreviewTime']),
    ...mapActions(['searchDepPlat', 'searchDep']),
    // 添加参数
    addSearch() {
      this.formData.searchs.push({
        key: '',
        val: ''
      });
    },
    compareVersion(c, v) {
      if (!this.baseInfo.buildVer) return false;
      return compareVersion(this.baseInfo.buildVer, c, v);
    },
    checkIsMobile(platValueList) {
      let isMobile;
      if (this.isPageCompType) {
        isMobile = true;
        if (platValueList.includes('isPC')) {
          isMobile = false;
        }
      } else {
        // 普通搭建活动下直接通过当前渠道判定是不是移动端
        isMobile = this.platform === 'h5';
      }
      return isMobile;
    },
    handlerEdit({ label, urlSearchList }) {
      this.formType = 'edit';
      this.editLabel = label;
      this.visible = true;
      this.formData = {
        label,
        searchs: JSON.parse(JSON.stringify(urlSearchList))
      };
      setTimeout(() => {
        this.$refs.select.blur();
      }, 0);
    },
    handlerDelete(label) {
      this.$confirm('是否删除该渠道', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const newList = [...this.baseInfo.previewPlatList];
        newList.some((item, index) => {
          if (item.label === label) {
            newList.splice(index, 1);
          }
        });
        this.updatePreviewPlatList(newList);
      });
    },
    handlerDeleteItem(search) {
      this.formData.searchs.splice(this.formData.searchs.indexOf(search), 1);
    },
    handleClose() {
      this.visible = false;
      this.formData = {
        label: '',
        searchs: [
          {
            key: '',
            val: ''
          }
        ]
      };
    },
    addPreviewPlatList() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const label = this.formData.label || this.formData.searchs.map(item => `${item.key}=${item.val}`).join('&');
          const itemNewVal = {
            label,
            urlSearchList: this.formData.searchs
          };
          if (this.formType === 'add') {
            if (this.baseInfo.previewPlatList.find(item => item.label === label)) {
              this.$message({
                type: 'error',
                message: `渠道名称【${label}】已存在，请重新命名`
              });
              return;
            }
            this.updatePreviewPlatList([...this.baseInfo.previewPlatList, itemNewVal]);
            this.handleClose();
            return;
          }
          if (this.baseInfo.previewPlatList.find(item => item.label !== this.editLabel && item.label === label)) {
            this.$message({
              type: 'error',
              message: `渠道名称【${label}】已存在，请重新命名`
            });
            return;
          }
          const newLsit = [...this.baseInfo.previewPlatList];
          newLsit.some((item, index) => {
            if (item.label === this.editLabel) {
              newLsit[index] = itemNewVal;
            }
          });
          this.updatePreviewPlatList(newLsit);
          this.handleClose();
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    previewPlatChange(newVal) {
      const isMobile = this.checkIsMobile(newVal);
      const preIsMobile = this.checkIsMobile(this.platValueList);
      // 页面级别组件并且移动端和pc端的标识变化的时候，重新缩放canvas
      if (this.isPageCompType && isMobile !== preIsMobile) {
        let curScale = this.canvasTransformData.scale;
        if (isMobile) {
          curScale *= 2;
        } else {
          curScale /= 2;
        }
        this.setCanvasScale(curScale);
      }
      const curPlat = isMobile ? 'h5' : 'pc';
      this.platValueList = newVal.filter(item => {
        // 找到不符合当前pc/移动端的渠道，并删除
        const invalidItem = normalPreviewPlatList.find(platMsg => platMsg.value === item && curPlat !== platMsg.plat && platMsg.plat !== 'all');
        if (invalidItem) return false;
        if (item === 'pzadd') {
          this.visible = true;
          this.formType = 'add';
          setTimeout(() => {
            this.$refs.select.blur();
          }, 0);
          return false;
        }
        return true;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.bd-actions {
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  .preview-reflash {
    font-size: 24px;
    cursor: pointer;
  }
}
.select-container {
  position: absolute;
  width: 200px;
  right: -220px;
  top: 0;
}
.select-box {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  flex-wrap: nowrap;
  white-space: nowrap;
  align-items: center;
  width: 200px;
  .left-box {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .right-box {
    margin-left: 30px;
    white-space: nowrap;
  }
}
.time-container {
  position: absolute;
  width: 300px;
  left: 50%;
  transform: translate(-50%);
  top: 40px;
}
.zone-container {
  position: absolute;
  width: 120px;
  left: -140px;
  top: 0px;
}
</style>
