<template>
  <el-dialog
    :visible.sync="visible"
    width="1150px"
    top="40px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="选择模板"
    @close="$emit('close')"
  >
    <div class="template-dialog">
      <div class="template-dialog__list">
        <el-radio-group v-model="tempInfo">
          <el-radio
            v-for="item in list"
            :key="item.id"
            :label="item"
          >
            <template-card :item="item" :extra-style="{marginLeft: 0}" />
          </el-radio>
        </el-radio-group>
      </div>
      <el-pagination
        v-if="pagination.total > pagination.limit"
        :current-page="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        layout="prev, pager, next"
        background
        @current-change="handPageChange"
      />
    </div>

    <div slot="footer" class="puzzle-event__tempFoot">
      <el-button @click="$emit('close')">
        取 消
      </el-button>
      <el-button type="primary" :disabled="!tempInfo" @click="confirm">
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import templateModel from '@/models/template';

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },

    curItem: {
      type: [Object, null],
      default() {
        return {};
      }
    }
  },

  data() {
    return {
      visible: this.show,
      list: [],
      pagination: {
        limit: 12,
        page: 1,
        total: 0,
      },
      tempInfo: this.curItem
    };
  },

  watch: {
    show(newVal) {
      if (newVal === this.visible) return;

      this.visible = newVal;
    },

    curItem(newVal) {
      this.tempInfo = newVal;
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      try {
        const resp = await templateModel.getTemplateList({
          loading: false,
          page: this.pagination.page,
          limit: this.pagination.limit,
        });
        this.pagination.total = resp.count;
        this.list = resp.list;
      } catch (err) {
        // nothing
      }
    },
    confirm() {
      this.$emit('select', this.tempInfo);
      this.$emit('close');
    },
    handPageChange(curPage) {
      this.pagination.pn = curPage;
      this.init();
    },
  }
};
</script>

<style lang="scss">
.template-dialog {
  .el-pagination {
    text-align: right;
  }

  &__list {
    height: 650px;
    overflow-y: scroll;

    .el-radio {
      position: relative;
      margin-right: 0;

      &.is-checked {
        .template {
          border: 1px solid #409eff;
        }
      }

      &__input {
        position: absolute;
        left: 10px;
        top: 10px;
      }

      &__label {
        padding-left: 0;
        margin-right: 20px;
      }
    }
  }
}
</style>
