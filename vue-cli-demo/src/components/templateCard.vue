<template>
  <div
    slot="reference" class="template" :class="size"
    :style="extraStyle"
  >
    <div
      class="template-info__img"
      :style="{backgroundImage: `url(${item.cover || defaultCover})`}"
    >
      <el-form
        class="template-detail-card"
        :model="item"
        label-width="80px"
        @submit.native.prevent
      >
        <el-form-item label="模板id">
          <span>{{ item.id }}</span>
        </el-form-item>
        <el-form-item label="模板名称">
          <span class="txt-inline">{{ item.template_name }}</span>
        </el-form-item>
        <el-form-item label="创建人">
          <span>{{ item.creator }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ item.ctime }}</span>
        </el-form-item>
        <el-form-item label="修改时间">
          <span>{{ item.mtime }}</span>
        </el-form-item>
        <el-form-item label="游戏业务">
          <span>{{ bizMap[item.game_biz] }}</span>
        </el-form-item>
      </el-form>
    </div>
    <p class="template-info__name txt-in2lines">
      {{ item.template_name }}
    </p>
    <!-- <div class="template-info__type">
      <el-tag>{{deviceMode}}</el-tag>
      <el-tag style="margin-left: 6px;">{{screenMode}}</el-tag>
    </div> -->
    <div v-if="showAction" v-mihoyo-auth="{authKey: 'puzzle'}" class="template-action">
      <el-button class="template-action__edit" type="text" @click="handleEditInfo">
        编辑信息
      </el-button>
      <el-button class="template-action__edit" type="text" @click="handleEditTpl">
        编辑模板
      </el-button>
      <el-button class="template-action__del" type="text" @click="handleDel">
        删除
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import constants from '@/constants';

export default {
  name: 'TemplateCard',
  props: {
    item: {
      type: Object,
      default() {
        return {};
      }
    },

    showAction: {
      type: Boolean,
      default: false
    },

    extraStyle: {
      type: Object,
      default() {
        return {};
      }
    },

    size: {
      type: String,
      default: 'normal'
    }
  },
  data() {
    return {
      deviceMap: constants.deviceMap,
      screenMap: constants.screenMap,
      defaultCover: 'https://webstatic-sea.hoyoverse.com/upload/event/2020/12/18/ef3b49863e3203fc87f70363ae0665b8_3444115010630571652.png',
    };
  },
  computed: {
    ...mapGetters([
      'bizMap',
    ]),
    screenMode() {
      return this.screenMap[this.item.screen_mode]?.label;
    },
    deviceMode() {
      return this.deviceMap[this.item.device_mode]?.label;
    },
  },
  methods: {
    handleEditInfo() {
      this.$emit('edit', this.item);
    },

    handleEditTpl() {
      window.open(this.$router.resolve({
        name: 'templateEdit',
        params: {
          templateId: this.item.id,
        },
        query: {
          eventId: this.item.event_id,
        },
      }).href);
    },

    handleDel() {
      this.$emit('delete', this.item);
    }
  }
};
</script>

<style lang="scss" scoped>
.template {
  width: 250px;
  display: inline-block;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-left: 20px;
  margin-bottom: 20px;
  overflow: hidden;

  &.small {
    width: 170px;
    border-radius: 6px;
    margin-left: 10px;
    margin-bottom: 10px;

    .template-info {
      &__img {
        width: 100%;
        height: 170px;
      }

      &__name {
        font-size: 14px;
        padding: 0 10px;
        margin-top: 10px;
        height: 36px;
        line-height: 18px;
        margin-bottom: 10px;
      }
    }
  }

  &-info {
    &__img {
      width: 100%;
      height: 250px;
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      border-bottom: 1px solid #eee;
      background-color: #f2f6fc;

      .template-detail-card {
        width: 100%;
        height: 100%;
        background-color: #f2f6fc;
        display: none;
        ::v-deep {
          .el-form-item {
            margin-bottom: 0px;
          }
        }
      }
      &:hover {
        .template-detail-card {
          display: block;
        }
      }
    }

    &__name {
      font-size: 16px;
      padding: 8px 10px;
      height: 52px;
      box-sizing: border-box;
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &__type {
      display: flex;
      padding: 0 10px 10px;
    }
  }

  &-action {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 0 10px;

    &__del {
      color: #f56c6c;
      margin-left: 20px;
    }
  }
}
</style>
