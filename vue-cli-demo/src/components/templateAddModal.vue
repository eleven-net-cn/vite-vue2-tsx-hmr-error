<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="600px"
    class="template-add"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <el-form
      ref="form"
      :model="templateForm"
      :rules="formRules"
      label-width="100px"
      @submit.native.prevent
    >
      <el-form-item label="模板名称" prop="template_name">
        <el-input
          v-model="templateForm.template_name" autocomplete="off" placeholder="请输入模板名称"
          maxlength="30"
        />
      </el-form-item>
      <el-form-item label="模板封面" prop="cover">
        <puzzle-upload
          v-model="templateForm.cover"
          accept=".png,.jpeg,.jpg,gif"
        >
        </puzzle-upload>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('close')">
        取 消
      </el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        提 交
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'TemplateAddModal',
  props: {
    curItem: {
      type: Object,
      default() {
        return {};
      }
    },

    title: String,

    show: {
      type: Boolean,
      default: false
    },

    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      templateForm: {
        id: this.curItem.id || 0,
        template_name: this.curItem.template_name || '',
        cover: this.curItem.cover || '',
      },

      formRules: {
        template_name: [
          { required: true, message: '请填写模板名称', trigger: 'blur' }
        ],
        cover: [
          { required: false, message: '请填写模板封面', trigger: 'blur' }
        ],
      },

      visible: this.show
    };
  },

  watch: {
    curItem(newVal) {
      if (!newVal) {
        this.resetForm();
        return;
      }

      const { id, template_name, cover } = newVal;
      this.templateForm.id = id;
      this.templateForm.template_name = template_name;
      this.templateForm.cover = cover;
    },

    show(newVal) {
      this.visible = newVal;
    }
  },

  methods: {
    resetForm() {
      this.templateForm.template_name = '';
      this.templateForm.cover = '';
    },

    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        this.$emit('submit', this.templateForm);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.template-add ::v-deep {
  .el-form-item__label {
    padding-right: 12px !important;
  }

  .el-form-item {
    margin-bottom: 22px !important;
  }
}
</style>
