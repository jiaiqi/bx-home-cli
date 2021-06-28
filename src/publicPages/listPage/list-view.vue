<template>
  <div class="list-view">
    <list-item v-for="item in listData" :key="item.id">
      <view class="img"> </view>
      <view class="content"> </view>
    </list-item>
  </div>
</template>

<script>
import listItem from './list-item.vue'
export default {
  name: "ListView",
  components: {
    listItem
  },
  props: {
    list: {
      type: Array
    },
  },
  data () {
    return {
      listData: []
    }
  },
  watch: {
    list: {
      immediate: true,
      deep: true,
      handler (newValue) {
        if (Array.isArray(newValue)) {
          this.listData = newValue
        }
      }
    }
  },
}
</script>

<style lang="sass" scoped>
</style>