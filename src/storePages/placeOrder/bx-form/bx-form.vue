<template>
  <view>
    <form-item :field="item" v-for="(item,index) in allFields" :key="index"></form-item>
  </view>
</template>

<script>
  import formItem from '../bx-form-item/bx-form-item.vue'
  export default {
    components: {
      formItem
    },
    data() {
      return {
        allFields: []
      }
    },
    props: {
      fields: {
        type: Array
      },
    },
    watch: {
      fields: {
        deep:true,
        immediate:true,
        handler(newValue, oldValue) {
          if(newValue&&Array.isArray(newValue)){
            this.allFields = this.deepClone(newValue)
          }else{
            this.allFields = []
          }
        }
      }
    },
  }
</script>

<style scoped lang="scss">

</style>
