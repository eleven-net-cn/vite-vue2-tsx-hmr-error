<template>
  <div>
    <el-button
      type="primary" size="mini" icon="el-icon-arrow-left"
      @click="updateActiveNodeStateKey('')"
    >
      返回正常状态配置
    </el-button>
    <el-divider content-position="left">
      {{ activeState.stateName }}状态配置
    </el-divider>
    <ConfigForm />
    <StyleForm />
    <OptionsForm v-if="!lang" />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
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
    ...mapState(['lang']),
    ...mapGetters(['activeState'])
  },
  methods: {
    ...mapMutations(['updateActiveNodeStateKey'])
  }
};
</script>
