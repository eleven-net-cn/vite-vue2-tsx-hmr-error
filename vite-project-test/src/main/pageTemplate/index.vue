<template>
  <div class="puzzle-temp">
    <div class="puzzle-temp__header">
      <el-card>
        <div slot="header" class="clearfix">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>页面模板管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <el-form
          label-position="left"
          label-width="80px"
          :model="queryForm"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="模板名称">
                <el-input v-model="queryForm.search" placeholder="请输入模板名称" @keyup.enter.native="onSearchSubmit"></el-input>
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

    <div class="puzzle-temp__main">
      <el-card class="puzzle-temp__list">
        <template-card
          v-for="item in list"
          :key="item.id"
          show-action
          :item="item"
          @edit="handleEdit"
          @delete="handleDel"
        />

        <el-pagination
          :current-page="pagination.pn"
          :page-size="pagination.ps"
          :total="pagination.total"
          layout="prev, pager, next"
          background
          @current-change="handPageChange"
        />
      </el-card>
    </div>

    <template-add-modal
      title="编辑模板"
      :show="modalVisible"
      :cur-item="tempInfo"
      :loading="isSubmitting"
      @close="modalVisible = false"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script>
import templateModel from '@/models/template';

export default {
  name: 'PageTemplate',
  data() {
    return {
      queryForm: {
        search: ''
      },

      modalVisible: false,

      tempInfo: {
        id: '',
        name: '', // 模板名称
        img: '' // 模板预览图
      },

      isSubmitting: false,

      list: [],
      pagination: {
        ps: 10,
        pn: 1,
        total: 100,
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      try {
        const resp = await templateModel.getTemplateList({
          page: this.pagination.pn,
          limit: this.pagination.limit,
          search: this.queryForm.search,
        });
        console.log('getTemplateList: ', resp);
        this.pagination.total = resp.count;
        this.list = resp.list;
        // const mockCount = 100;
        // this.pagination.total = mockCount;
        // this.list = Array.from(new Array(10)).map((item, idx) => ({
        //   ...resp.list[0],
        //   id: idx + 1,
        // }));
      } catch (err) {
        // nothing
      }
    },
    async handleDel(item) {
      try {
        await this.$confirm(`是否删除模板: ${item.template_name}？`, '提示', {
          type: 'warning'
        });

        await templateModel.deleteTemplate({ id: item.id });
        this.init();
      } catch (e) {
        // do nothing
      }
    },

    handPageChange(curPage) {
      this.pagination.pn = curPage;
      this.init();
    },

    handleEdit(item) {
      this.isSubmitting = false;
      this.modalVisible = true;
      this.tempInfo = item;
    },

    // 搜索
    onSearchSubmit() {
      this.pagination.page = 1;
      this.init();
    },

    async handleEditSubmit(form) {
      this.tempInfo = form;
      this.isSubmitting = true;

      await templateModel.updateTemplate({ ...form });
      this.init();
      this.isSubmitting = false;
      this.modalVisible = false;
    }
  }
};
</script>

<style lang='scss' scoped>
.puzzle-temp {
  min-height: 100%;
  padding: 20px 30px;

  &__header {
    margin-bottom: 20px;
  }

  .flex-right {
    display: flex;
    justify-content: flex-end;
  }

  &__list {
    .el-pagination {
      text-align: right;
      margin-top: 15px;
    }

    ::v-deep .el-card__body {
      margin-left: -20px;
    }
  }
}

</style>
