<template>
  <view>

  </view>
</template>

<script>
  import Emitter from '@/common/mixins/emitter.js';
  export default {
    name: "bxFormItem",
    mixins: [Emitter],
    props: {
      prop: {
        type: String
      },
      label: {
        type: String
      },
    },
    data() {
      return {

      };
    },
    // 组件渲染时，将实例缓存在 Form 中
    mounted() {
      // 如果没有传入 prop，则无需校验，也就无需缓存
      if (this.prop) {
        this.dispatch('bxForm', 'on-form-item-add', this);
      }
    },
    // 组件销毁前，将实例从 Form 的缓存中移除
    beforeDestroy() {
      this.dispatch('bxForm', 'on-form-item-remove', this);
    }
  }
</script>

<style lang="scss">

</style>
