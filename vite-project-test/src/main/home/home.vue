<template>
  <div class="home">
    <el-container>
      <el-aside v-if="!inComponentsPage&&!inMerlin" width="65px" style="background-color: rgb(238, 241, 246);">
        <el-menu :default-active="defaultActive" class="el-menu-vertical-demo" collapse>
          <el-menu-item
            v-for="(page, index) in pages"
            :key="page.name"
            v-mihoyo-auth="{authKey: page.authKey}"
            :index="`${index + 1}`"
            @click="routeTo(page.name)"
          >
            <i :class="page.icon"></i>
            <span slot="title">{{ page.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>

    <dev-panel></dev-panel>
  </div>
</template>

<script>
import { QS } from '@me/utils';
import DevPanel from './devPanel';
import './home.scss';

export default {
  name: 'Home',
  components: { DevPanel },
  data() {
    return {
      inMerlin: !!QS.inMerlin,
      pages: [
        {
          name: 'eventList',
          title: '活动管理',
          icon: 'el-icon-s-order',
        },
        {
          name: 'pageTemplate',
          title: '页面模板管理',
          icon: 'el-icon-document-copy',
        },
      ]
    };
  },
  computed: {
    activePageName() {
      return this.$route.name;
    },
    activeIndex() {
      return this.pages.findIndex(item => item.name === this.activePageName);
    },
    inComponentsPage() {
      return ['templateEdit', 'eventEdit'].includes(this.$route.name);
    },
    defaultActive() {
      return `${this.activeIndex + 1}`;
    }
  },
  created() {
    this.$store.dispatch('getBizList');
  },
  methods: {
    routeTo(name) {
      if (this.$route.name !== name) {
        this.$router.push({ name });
      }
    }
  }
};
</script>
