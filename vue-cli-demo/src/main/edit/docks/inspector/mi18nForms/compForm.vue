<template>
  <div>
    <template v-if="!isPageCompType">
      <ConfigForm />
      <StyleForm />
    </template>
    <OptionsForm v-if="supportMi18nForm" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ConfigForm from './configForm';
import StyleForm from './styleForm.vue';
import OptionsForm from './optionFormItem.vue';

export default {
  components: {
    ConfigForm,
    StyleForm,
    OptionsForm
  },
  computed: {
    ...mapGetters(['activeNodePro', 'isPageCompType']),
    supportMi18nForm() {
      return this.activeNodePro.declarations.supportMi18nForm;
    },
  },
};
</script>

<style>
</style>
