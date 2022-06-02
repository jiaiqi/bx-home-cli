<template>
  <view v-if="filePath">
    <image class="image" style="width: 100vw;height: 100vh" :src="filePath" mode="aspectFit"></image>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        file_no: ''
      }
    },
    computed: {
      filePath() {
        return this.file_no ? this.getImagePath(this.file_no) : false
      }
    },
    methods: {

    },
    onLoad(option) {
      if (option.file_no) {
        this.file_no = option.file_no
      }
    }
  }
</script>

<style lang="scss" scoped>
.image{
  width: 100vw;
  height: calc(100vh - var(--window-top));
}
</style>
