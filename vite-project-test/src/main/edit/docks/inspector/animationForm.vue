<template>
  <div>
    <el-divider content-position="left">
      驻场动画
    </el-divider>
    <AnimationForm
      :value="animation" @updateParams="updateParams"
      @initConfig="initConfig"
      @updateConfig="updateConfig"
    />
  </div>
</template>

<script>
import {
  mapGetters, mapActions
} from 'vuex';

import AnimationForm from './animationForms/animationForm.vue';

export default {
  components: {
    AnimationForm
  },
  computed: {
    ...mapGetters([
      'activeNode',
    ]),
    otherOptions() {
      return this.activeNode.otherOptions || {};
    },
    animation() {
      return this.otherOptions.animation || {};
    },
  },
  methods: {
    ...mapActions(['updateNodeOtherOptions']),
    updateParams(params = {}) {
      const preConfig = this.otherOptions.animation || {};
      this.updateNodeOtherOptions({
        options: {
          animation: {
            ...preConfig,
            params: {
              ...(preConfig.params || {}),
              ...params
            }
          }
        }
      });
    },
    updateConfig(config = {}) {
      const preConfig = this.otherOptions.animation || {};
      this.updateNodeOtherOptions({
        options: {
          animation: {
            ...preConfig,
            ...config
          }
        }
      });
    },
    initConfig(config) {
      this.updateNodeOtherOptions({
        options: {
          animation: config
        }
      });
    },
  }
};
</script>
