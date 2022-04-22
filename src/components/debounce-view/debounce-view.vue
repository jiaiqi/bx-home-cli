<template>
  <view @click.stop="onTap">
    <slot></slot>
  </view>
</template>

<script>
  import {
    debounce
  } from '@/common/func/util.js'
  var self = {};
  export default {
    name: "debounce-view",
    methods: {
      onTap: debounce(function() {
        this.$emit('onTap')
      }, 5000, true)
    },
  }
</script>
