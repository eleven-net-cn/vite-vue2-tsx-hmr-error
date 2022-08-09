<template>
  <el-form-item label="背景图片">
    <puzzle-upload
      v-model="backgroundImage"
      accept=".png,.jpeg,.jpg,.gif"
    ></puzzle-upload>
  </el-form-item>
</template>

<script>
import * as utils from '@/utils';
import { loadImage } from '@/utils/preloadImages';

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    methods: {
      type: Object,
      default() {
        return {};
      }
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    envList: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    backgroundImage: {
      get() {
        const { backgroundImage } = this.boxStyle;
        return utils.getBgImg(backgroundImage);
      },

      set(newVal) {
        this.updateBackground(newVal);
      }
    },
  },
  methods: {
    updateBackground(newVal) {
      const { updateNodeBoxStyle } = this.methods;
      updateNodeBoxStyle({ options: { backgroundImage: newVal ? `url(${newVal})` : undefined } });
      if (!this.options.suitBGSize || this.envList.noResize) {
        return;
      }
      loadImage(newVal)
        .then(img => {
          const { width, height } = img;
          updateNodeBoxStyle({
            options: {
              width: utils.dpx2rem(width),
              height: utils.dpx2rem(height)
            }
          });
        })
        .catch(err => {
          console.log(`loadImage ${newVal} err: `, err);
        });
    },
  }
};
</script>

<style>
</style>
