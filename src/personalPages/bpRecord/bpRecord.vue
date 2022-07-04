<template>
  <view>
    <view class="no-data">
      <image class="image" src="../static/icon/xueya_no_data.jpg" mode="aspectFit"></image>
      <view class="">
        您还没有任何添加记录
      </view>
      <button class="cu-btn " @click="showModal('addModal')">记录血压</button>
    </view>

    <view class="cu-modal bottom-modal" :class="{show:modalName==='addModal'}">
      <view class="cu-dialog">
        <view class="add-modal">
          <view class="title-bar  flex justify-between align-center padding-sm">
            <view class="">

            </view>
            <view class="">
              手动记录
            </view>
            <text class="cuIcon-close text-bold text-lg" @click="showModal()"></text>
          </view>
          <view class="form-box">
            <view class="form-item">
              <text>泡浴前</text>
              <input type="text" placeholder-class="placeholder" placeholder="舒张压(高压)" />
              <text class="text-lg">/</text>
              <input type="text" placeholder-class="placeholder" placeholder="收缩压(低压)" />
              <text class="text-sm text-gray">mmHg</text>
            </view>
            <view class="form-item">
              <text>泡浴后</text>
              <input type="text" placeholder-class="placeholder" placeholder="舒张压(高压)" />
              <text class="text-lg">/</text>
              <input type="text" placeholder-class="placeholder" placeholder="收缩压(低压)" />
              <text class="text-sm text-gray">mmHg</text>
            </view>
          </view>
          <u-number-keyboard></u-number-keyboard>
          <view class="bottom">
            确定
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        noData: false,
        modalName: "addModal"
      }
    },
    methods: {
      showModal(name) {
        this.modalName = name
      },
    }
  }
</script>

<style lang="scss" scoped>
  .no-data {
    width: 100vw;
    height: calc(100vh - var(--window-top));
    text-align: center;
    padding-top: 20vh;
    background-color: #fff;
    color: #999;
    position: relative;

    .image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 10px;
    }

    .cu-btn {
      position: absolute;
      background-color: #DCB081;
      color: #fff;
      border-radius: 5px;
      bottom: 20vh;
      left: calc(50% - 75px);
      width: 150px;
    }
  }

  .add-modal {
    .title-bar{
      border-bottom: 1px solid #f1f1f1;
      margin: 0 10px ;
    }
    .bottom{
      text-align: center;
      color: #fff;
      padding: 15px;
      background-color: #DCB081;
      font-size: 16px;
    }
    .form-box {
      .form-item {
        padding: 10px;
        margin: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        &:first-child{
          border-bottom: 1px solid #f1f1f1;
        }
        input {
          width: 30%;
        }

        .placeholder {
          font-size: 12px;
        }
      }
    }
  }
</style>
