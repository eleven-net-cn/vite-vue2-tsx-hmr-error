<template>
  <div id="root">
    <router-view />
  </div>
</template>

<script>
// import { environment } from 'appConfig';

export default {
  name: 'App',
  beforeCreate() {
    // 设备判断
    // const u = navigator && navigator.userAgent;
    // if (u) {
    //   const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    //   this.$root.isiOS = isiOS;
    // }
    // this.$root.environment = environment;
  }
};
</script>
