<template>
  <view class="page-wrap">
    <view class="page-content">
      <view class="top-card">
        <image :src="getImagePath(info.user_image,true)" class="profile" mode="aspectFit" v-if="info.user_image">
        </image>
        <view class="col-list">
          <view class="col-item text-bold">
            {{info.real_name||''}}
          </view>
          <view class="col-item"
            style="background-color: #10c0a8;color: #fff;border-radius: 5px;margin-left: 5px;padding: 2px 5px;font-size: 12px;">
            {{info.my_professional||''}}
          </view>

          <view class="" v-if="info.show_str">
            {{info.show_str}}
          </view>
          <view class="col-item ellipse nowrap width-wrap" v-else>
            {{info.location_addrs||''}}
          </view>
        </view>
      </view>
      <view class="other-col">
        <view class="col-item" v-if="groupInfo.unit_price">
          <view class="label">
            <text> 问询服务</text>
            <view class="value text-orange text-normal">
              <text>{{groupInfo.unit_price}}想豆/条</text>
            </view>
          </view>
        </view>
        <view class="col-item" v-if="groupInfo.unit_price">
          <view class="label">
            个人简介
          </view>
          <view class="value text-gray text-lg">
            {{info.my_descript||''}}
          </view>

        </view>
        <view class="col-item">
          <view class="label">
            个人标签
          </view>
          <view class="value">
            <text class="bx-tag bg-gray round" v-for="item in formatText(info.my_tag_map,'tags')">{{item}}</text>
          </view>
        </view>
        <view class="col-item">
          <view class="label">
            证书
          </view>
          <view class="value">
            <text class="bx-tag bg-gray round" v-for="item in formatText(info.certificat_name,'tags')">{{item}}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="price text-orange">
        <text v-if="groupInfo.unit_price">{{groupInfo.unit_price}}想豆/条</text>
      </view>
      <button class="cu-btn  lg round" @click="toConsult">联系TA</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        info: {},
        service: "",
        app: "",
        idCol: "id",
        idVal: "",
        groupInfo: {}
      }
    },
    computed: {
      appName() {
        return this.app || uni.getStorageSync('activeApp')
      }
    },
    methods: {
      async toConsult() {
        let res = await this.checkSubscribeStatus()
        if (!res) {
          let confirm =await new Promise((resolve)=>{
            uni.showModal({
              title: '提示',
              content: '请先关注百想助理公众号，以便及时收到新消息通知',
              success: (res) => {
                if (res.confirm) {
                  resolve(true)
                }else{
                  resolve(false)
                }
              }
            })
          })
          if(confirm===true){
            this.toOfficial()
          }else{
            return
          }
        }
        if (this.vstoreUser?.store_no && this.groupInfo?.gc_no && this.vstoreUser?.store_user_no) {
          let url =
            `/publicPages/chat/chat?identity=客户&groupNo=${this.groupInfo.gc_no}&type=专题咨询&storeNo=${this.vstoreUser.store_no}&store_user_no=${this.vstoreUser.store_user_no}`
          uni.navigateTo({
            url
          })
        }
      },
      toOfficial() {
        // 跳转到关注公众号页面
        const frontEndAddress = this.$api.frontEndAddress
        let mp_no = 'MP2201210021'
        if (mp_no) {
          let webUrl =
            `${frontEndAddress}storePages/officialIntro/officialIntro?mp_no=${this.moreConfig?.mp_no}`
          let url =
            `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
          uni.navigateTo({
            url
          })
        }
      },
      async getGroup(group_no) {
        // 查找圈子信息
        let req = {
          "serviceName": "srvhealth_group_circle_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "gc_no",
            "ruleType": "eq",
            "value": group_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        if (!group_no) {
          return
        }
        let res = await this.$fetch('select', 'srvhealth_group_circle_select', req, 'health')
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.groupInfo = res.data[0]
        }

      },
      formatText(text, type) {
        let result = ''
        if (text) {
          switch (type) {
            case 'tags':
              result = text.split(',')
              if (text.indexOf('，') !== -1) {
                result = text.split('，')
              }
              break;
            default:
              break;
          }
        }
        return result
      },
      async getInfo() {
        let url = this.getServiceUrl(this.appName, this.service, 'select');
        let req = {
          "serviceName": this.service,
          "condition": [{
            colName: this.idCol,
            ruleType: 'eq',
            value: this.idVal
          }],
          colNames: ['*'],
          page: {
            pageNo: 1,
            rownumber: 1
          }
        }
        let res = await this.$http.post(url, req)
        if (res.data.state == 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.info = res.data.data[0]
          if (this.info?.group_no) {
            this.getGroup(this.info?.group_no)
          }
        }
      },
    },
    onLoad(option) {
      if (option.app) {
        this.app = option.app
      }
      if (option.serviceName) {
        this.service = option.serviceName
      }
      if (option.idCol) {
        this.idCol = option.idCol
      }
      if (option.idVal) {
        this.idVal = option.idVal;
      }
      if (this.idCol && this.idVal && this.service) {
        this.getInfo()
      }
    }
  }
</script>

<style scoped lang="scss">
  .page-wrap {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;

    .page-content {
      flex: 1;
      overflow-y: scroll;
    }
  }

  .top-card {
    padding: 10px 20px;
    background-color: #fff;
    display: flex;

    .col-list {
      flex: 1;
      // display: flex;
      // flex-wrap: wrap;
      // align-items: center;
      overflow: hidden;

      .col-item {
        display: inline-block;

        &.width-wrap {
          width: 100%;
        }

        &.ellipse {
          text-overflow: ellipsis;
        }

        &.nowrap {
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }

    .profile {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 10px;
    }
  }

  .other-col {
    .col-item {
      background-color: #fff;
      margin: 10px 0;
      padding: 10px 20px;


      .label {
        padding: 10px;
        font-size: 16px;
        font-weight: bold;
        position: relative;
        display: flex;
        justify-content: space-between;

        &::before {
          position: absolute;
          content: '';
          left: 0;
          top: calc(50% - 10px);
          width: 2px;
          height: 20px;
          background-color: #10c0a8;
        }
      }

      .value {
        min-height: 30px;

        .bx-tag {
          font-size: 16px;
          display: inline-block;
          min-width: 60px;
          text-align: center;
          padding: 5px;
          margin-right: 5px;
        }
      }
    }
  }

  .bottom-bar {
    padding: 5px 20px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

    // position: absolute;
    // bottom: 0;
    .cu-btn {
      min-width: 120px;
      text-align: center;
      background-color: #34c49b;
      color: #fff;
    }
  }
</style>
