<template>
  <view @click.stop="onTap" v-if="type==='debounce'">
    <slot></slot>
  </view>
  <view @click.stop="onThrottle" v-else>
    <slot></slot>
  </view>
</template>

<script>
  import {
    debounce,
    throttle
  } from '@/common/func/util.js'
  var self = {};
  export default {
    name: "debounce-view",
    props: {
      type: {
        type: String,
        default: 'debounce' // throttle
      },
      delay: {
        type: Number,
        default: 200
      },
      immediate: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      self = this
    },
    methods: {
      onThrottle: throttle(function() {
        this.$emit('onThrottle')
      }, 5000),
      onTap: debounce(function() {
        this.$emit('onTap')
      }, 5000, false)
    },
  }
</script>
