<template>
  <view>
    <list-bar @change="changeSerchVal" :listType="listType" :filterCols="filterCols" :srvApp="appName"
      :gridButtonDisp="gridButtonDisp" :rowButtonDisp="rowButtonDisp" :formButtonDisp="formButtonDisp" placholder="输入桌号进行搜索"
      @search="onSearch">
    </list-bar>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        
      }
    },
    methods: {
      onSearch(e){
        
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
