<template>
  <div class="pz-collapse-row">
    <slot />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>

<style lang="scss" scoped>
.pz-collapse-row {
  padding: 2px 4px;
  padding-left: 10px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #eeeeee;
  }
}
</style>
