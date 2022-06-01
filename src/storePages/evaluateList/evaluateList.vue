<template>
  <view>
    <evaluate-card ref="evaluateCard" :goods_no="no" :rownumber="10" :show-all="true"></evaluate-card>
  </view>
</template>

<script>
  import evaluateCard from '../components/evaluate-card.vue'

  export default {
    components: {
      evaluateCard
    },
    data() {
      return {
        no: ''
      }
    },
    onLoad(option) {
      if (option.no || option.goods_no) {
        this.no = option.no || option.goods_no
      }
    },
    methods: {

    },
    onReachBottom() {
      this.$refs?.evaluateCard?.loadMore?.()
    },
    onPullDownRefresh() {
      this.$refs?.evaluateCard?.refresh?.()
      setTimeout(_ => {
        uni.stopPullDownRefresh()
      }, 1000)
    },
  }
</script>

<style>

</style>
