<template>
  <view class="page-wrap">
    <view class="content-box" v-if="tgInfo">
      <view class="top">
        <view class="tz-info">
          <view class="">
            <image class="profile-image" :src="getImagePath(tgInfo.profile_url)" mode="" v-if="tgInfo.profile_url">
            </image>
            <text>{{tgInfo.person_name||''}}</text>
          </view>
          <view class=" text-gray" >
            社区名称:{{tgInfo.community_name||''}}
          </view>
        </view>
        <view class="tg-info">
          <view class="">
            <view class="">
              {{tgInfo.number}}人团
            </view>
            <view class="">
              {{tgInfo.name||''}}
            </view>
            <view class="">
              {{tgInfo.state||''}}
            </view>
          </view>
        </view>
      </view>
      <view class="sub-title">

      </view>
      <view class="goods-list">

      </view>
    </view>
    <view class="handler-bar">
      <view class="left">
        合计：{{totalPrice||'0'}}
      </view>
      <view class="right">
        <button class="cu-bnt round"></button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        type: "default", // manage-管理员查看页面，view-团长查看页面,default-消费者进行团购的页面，detail-消费者团购成功后查看的页面
        id: '',
        tgInfo: null
      }
    },
    computed: {
      totalPrice() {
        return '0'
      }
    },
    methods: {
      getTgInfo() {
        let service = 'srvhealth_store_regimental_dumpling_select'
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            colName: 'id',
            ruleType: 'eq',
            value: this.id
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let url = this.getServiceUrl('health', service, 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.tgInfo = res.data.data[0]
          }
        })
      }
    },
    onLoad(option) {
      if (option.id) {
        this.id = option.id;
        this.getTgInfo()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    width: 100%;
    height: calc(100vh - var(--window-top) - var(--window-bottom));
    display: flex;
    flex-direction: column;

    .content-box {
      flex: 1;
      overflow: scroll;

      .top {
        background-color: #fff;
        padding: 10px;

        .tz-info {
          display: flex;
          justify-content: space-between;

          .profile-image {
            width: 25px;
            height: 25px;
            border-radius: 50%;
          }
        }
      }
    }

    .handler-bar {
      height: 50px;

      .cu-btn {
        background-color: #ff3a30;
        color: #fff;
      }
    }
  }
</style>
