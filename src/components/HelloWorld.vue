<script lang="tsx">
// If changed lang tsx to ts, It works fine.
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component({
  name: "HelloWorld",
})
export default class HelloWorld extends Vue {
  @Prop()
  readonly msg!: string;

  // changed the get property "test" (e.g.: test to test1), will found the hmr error in the browser console.
  // The error log in the console:
  //  [Vue warn]: Property or method "test1" is not defined on the instance but referenced during render.
  get test() {
    return `${this.msg} ☞ test get property`;
  }
}
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      an error occurred when changed the get property (HelloWorld.vue), e.g.:
      <p>1. changed get property "test" to "test1"</p>
      <p>2. vite hmr</p>
      <p>3. found the hmr error in the browser console</p>
    </h3>
    <div style="margin-top: 100px">{{ test }}</div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 36px;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

.greetings h1,
.greetings h3 {
  display: block;
  text-align: left;
}
</style>
