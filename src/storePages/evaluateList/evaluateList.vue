<template>
  <view>
    <evaluate-card ref="evaluateCard" :order_goods_rec_no="order_goods_rec_no" :eval_show_way="eval_show_way"
      :goods_no="no" :rownumber="10" :show-all="true"></evaluate-card>
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
        no: '',
        order_goods_rec_no: "",
        eval_show_way: '全部'
      }
    },
    onLoad(option) {
      if (option.no || option.goods_no) {
        this.no = option.no || option.goods_no
      }
      if (option.eval_show_way) {
        this.eval_show_way = option.eval_show_way
      }
      if (option.order_goods_rec_no) {
        this.order_goods_rec_no = option.order_goods_rec_no
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
