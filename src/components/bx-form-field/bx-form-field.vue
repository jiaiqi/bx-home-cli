<template>
  <view>

  </view>
</template>

<script>
  import Emitter from '@/common/mixins/emitter.js';
  export default {
    // 表单输入组件
    name: "bxFormField",
    mixins: [Emitter],
    props: {
      value: {
        type: [String, Number, Array],
        default: ''
      },
    },
    data() {
      return {
        currentValue: this.value
      }
    },
    watch: {
      value(val) {
        this.currentValue = val;
      }
    },
    methods: {
      handleInput(event) {
        const value = event.target.value;
        this.currentValue = value;
        this.$emit('input', value);
        this.dispatch('bxFormItem', 'on-form-change', value);
      },
      handleBlur() {
        this.dispatch('bxFormItem', 'on-form-blur', this.currentValue);
      }
    },
  }
</script>

<style lang="scss">

</style>
