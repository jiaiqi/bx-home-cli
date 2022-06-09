<template>
  <view class=" cu-modal bottom-modal" :class="{show:display}" @click="">
    <view class="cu-dialog">
      <view class="public-module">

      </view>
    </view>
  </view>
</template>

<script>
  // 全局公共弹窗模块
  export default {
    name: "public-module",
    data() {
      return {
        display: false,
        fields: [{
            column: 'name',
            label: '姓名'
          }, {
            column: 'phone_xcx',
            label: '手机号'
          },
          {
            column: 'id_no',
            label: '身份证号'
          },
          {
            column: 'phone',
            label: '手机号'
          }
        ],
        formData: {
          name: '',
          id_no: "",
          phone_xcx: "",
          phone: ''
        }
      };
    },
    methods: {  
      show() {
        this.display = true
      },
      hide() {
        this.display = false
      },
    },
  }
</script>

<style lang="scss" scoped>

</style>
