<template>
  <div class="puzzle-component">
    <div class="puzzle-component__query">
      <el-card>
        <div slot="header" class="clearfix">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>组件管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-form
          label-position="left"
          label-width="80px"
          :model="queryForm"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="组件名">
                <el-input v-model="queryForm.search" placeholder="请输入组件名或中文名" @keyup.enter.native="onSearchSubmit"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" @click="onSearchSubmit">
                  查询
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <div class="puzzle-component__list">
      <el-card>
        <div slot="header" class="flex-right">
          <el-button v-mihoyo-auth="{authKey: 'module'}" type="primary" @click="handleAdd">
            新增组件
          </el-button>
        </div>
        <el-table
          :data="compList"
          style="width: 100%;"
        >
          <!-- <el-table-column
            type="index"
            label="序号"
            width="50">
          </el-table-column> -->
          <el-table-column
            prop="id"
            label="组件id"
            width="80"
          >
          </el-table-column>
          <el-table-column
            prop="module_name"
            label="组件名"
            min-width="120"
            width="180"
          >
          </el-table-column>
          <el-table-column
            prop="show_name"
            label="中文名"
            width="120"
          >
          </el-table-column>
          <el-table-column
            label="支持平台"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag
                v-for="plat in row.platform" :key="plat" :disable-transitions="true"
                type="success"
              >
                {{ plat }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="正式版本号"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag type="success" :disable-transitions="true">
                {{ row.module_ver }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="module_ver_dev"
            label="开发版本号"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag :disable-transitions="true">
                {{ row.module_ver_dev }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="latest_ver"
            label="最新版本号"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag :disable-transitions="true">
                {{ row.latest_ver }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="is_publish"
            label="是否已发布"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag :disable-transitions="true" :type="row.is_publish ? 'success' : 'warning'">
                {{ row.is_publish ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            width="80"
          >
            <template slot-scope="{ row }">
              <el-tag :disable-transitions="true" :type="row.status === 1 ? 'success' : 'warning'">
                {{ row.status === 1 ? '可用' : '不可用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="图标"
            width="80"
          >
            <template slot-scope="{ row }">
              <i :class="row.module_icon"></i>
            </template>
          </el-table-column>
          <el-table-column
            prop="module_desc"
            label="描述"
            min-width="120"
          >
          </el-table-column>
          <el-table-column
            prop="ctime"
            label="创建时间"
            min-width="150"
          >
          </el-table-column>
          <el-table-column
            prop="mtime"
            label="最后修改时间"
            min-width="150"
          >
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="260"
          >
            <template slot-scope="{ row }">
              <el-button
                v-mihoyo-auth="{authKey: 'module'}" type="text" size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-mihoyo-auth="{authKey: 'module_release'}"
                :disabled="row.module_ver === row.module_ver_dev"
                type="text"
                size="small"
                @click="publishComp(row)"
              >
                发布到正式
              </el-button>
              <el-button
                v-mihoyo-auth="{authKey: 'module_release'}" type="text" size="small"
                :disabled="row.status !== 1"
                @click="disableComp(row)"
              >
                禁用
              </el-button>
              <el-button
                v-mihoyo-auth="{authKey: 'module_release'}"
                :disabled="row.module_ver_dev === row.latest_ver"
                type="text" size="small" @click="upgradeComp(row)"
              >
                升级
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="total > limit"
          background
          :current-page="page"
          layout="prev, pager, next"
          :total="total"
          @current-change="onPageChange"
        >
        </el-pagination>
      </el-card>
    </div>

    <el-dialog
      :title="dialogType === 'create' ? '新增组件' : '编辑组件' "
      :visible.sync="dialogFormVisible"
      width="1000px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="compForm"
        :model="compForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="组件名称" prop="module_name" required>
          <el-input
            v-model="compForm.module_name" placeholder="请输入组件的npm包名" autocomplete="off"
            :disabled="dialogType !== 'create'"
          ></el-input>
        </el-form-item>
        <el-form-item label="中文名称" prop="show_name" required>
          <el-input v-model="compForm.show_name" placeholder="请输入组件的中文名称" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备模式" prop="platform" required>
          <el-checkbox-group v-model="compForm.platform">
            <el-checkbox label="pc"></el-checkbox>
            <el-checkbox label="h5"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="组件类型" prop="module_type" required>
          <el-radio-group v-model="compForm.module_type" :disabled="dialogType !== 'create'">
            <el-radio :label="'ModuleTypeFE'">
              前端组件
            </el-radio>
            <el-radio :label="'ModuleTypeBE'">
              后端组件
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开发版本号" prop="module_ver">
          <el-input v-model="compForm.module_ver" placeholder="请输入符合semver规范的版本号" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="module_icon" required>
          <el-select v-model="compForm.module_icon" filterable placeholder="请选择">
            <el-option
              v-for="icon in iconList"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <i :class="icon"></i>
            </el-option>
          </el-select>
          <i :class="compForm.module_icon" class="el-icon--right"></i>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="compForm.module_desc" placeholder="简单描述下组件时做什么的" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取 消
        </el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">
          提 交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import * as utils from '@/utils';
import compModel from '@/models/component';

import iconList from '@/constants/icons';

const getInitCompForm = () => ({
  platform: [],
  module_name: '',
  show_name: '',
  module_ver: '',
  module_type: 'ModuleTypeFE',
  module_icon: 'el-icon-picture',
  module_desc: ''
});

export default {
  data() {
    return {
      iconList,
      queryForm: {
        search: ''
      },
      compForm: getInitCompForm(),
      isSubmitting: false,
      dialogFormVisible: false,
      dialogType: 'create',
      compList: [],
      total: 0,
      page: 1,
      limit: 10,
      rules: {},
    };
  },
  watch: {
    page(newV, oldV) {
      console.log('page change: ', newV, oldV);
      this.getCompList();
    }
  },
  mounted() {
    this.getCompList();
  },

  methods: {
    onSearchSubmit() {
      this.page = 1;
      this.getCompList();
    },

    handleEdit(comp) {
      this.compForm = {
        ...comp,
        module_ver: comp.module_ver_dev
      };
      this.dialogType = 'edit';
      this.dialogFormVisible = true;
    },

    handleAdd() {
      if (this.compForm.id) {
        this.compForm = getInitCompForm();
      }
      this.dialogType = 'create';
      this.dialogFormVisible = true;
    },

    async handleSubmit() {
      if (this.isSubmitting) return;
      this.$refs.compForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        this.isSubmitting = true;
        try {
          await this.$confirm(
            `确认提交："${`${this.compForm.show_name}-${this.compForm.module_name}`}"?`,
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          );
          if (this.dialogType === 'create') {
            await this.addComponent();
          } else {
            await this.updateComponent(this.compForm);
          }
          this.dialogFormVisible = false;
          this.getCompList();
        } catch (err) {
          console.warn(err);
        }
        this.isSubmitting = false;
      });
    },

    async addComponent() {
      const {
        platform
      } = this.compForm;
      const params = {
        ...this.compForm,
        is_pc: platform.includes('pc'),
        is_h5: platform.includes('h5')
      };
      await compModel.addModule(params);
    },
    async updateComponent(comp) {
      const {
        platform
      } = comp;
      const params = {
        ...comp,
        is_pc: platform.includes('pc'),
        is_h5: platform.includes('h5')
      };
      await compModel.updateModule(params);
    },

    async upgradeComp(comp) {
      await this.$confirm(
        `确认更新："${`${comp.show_name}-${comp.module_name}`}"?`,
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      await this.updateComponent({
        ...comp,
        module_ver_dev: comp.latest_ver,
        module_ver: comp.latest_ver
      });
      this.getCompList();
    },

    async getCompList() {
      try {
        const params = {
          page: this.page,
          limit: this.limit,
          search: this.queryForm.search,
        };
        const [compList, latestModules] = await Promise.all([
          compModel.getModuleList(params),
          compModel.getLatestVersions()
        ]);
        this.compList = compList.list.map(x => {
          const platform = [];
          if (x.is_pc) {
            platform.push('pc');
          }
          if (x.is_h5) {
            platform.push('h5');
          }
          const item = {
            ...x,
            latest_ver: latestModules?.find?.(mdl => mdl.name === x.module_name)?.version,
            platform
          };
          return item;
        });
        this.total = compList.count;
      } catch (error) {
        console.warn(error);
      }
    },

    onPageChange(newPage) {
      this.page = newPage;
    },
    publishComp(comp) {
      this.$confirm(`确认发布组件："${`${comp.show_name}-${comp.module_name}`}"?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          id: comp.id
        };
        compModel.publishModule(params)
          .then(() => {
            this.$message({
              type: 'success',
              message: '发布成功!'
            });
            this.getCompList();
          })
          .catch(err => {
            console.warn(err);
          });
      });
    },
    disableComp(comp) {
      this.$confirm(`确认禁用组件："${`${comp.show_name}-${comp.module_name}`}"?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          id: comp.id
        };
        compModel.disableModule(params)
          .then(() => {
            this.$message({
              type: 'success',
              message: '禁用成功!'
            });
            this.getCompList();
          })
          .catch(err => {
            console.warn(err);
          });
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.puzzle-component {
  min-height: 100%;
  // background: #fff;
  padding: 20px 30px;

  .line {
    text-align: center;
  }

  .flex-right {
    display: flex;
    justify-content: flex-end;
  }

  &__query {
    margin-bottom: 20px;
  }

  &__list {
    .el-table {
      margin-bottom: 15px;
    }

    .el-pagination {
      text-align: right;
    }
  }
}
</style>
