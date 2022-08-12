<template>
  <view class="page-wrap">
    <view class="profile-box">
      <view class="container">
        <view class="top">
          <view class="left">
            <view class="name">
              {{mainData.person_name||'陈阿姨'}}
            </view>
            <view class="golden">
              年龄：{{mainData.age||' - '}}岁
            </view>
            <view class="golden">
              性别：{{mainData.person_sex||' - '}}
            </view>
           <!-- <view class="golden">
              服务等级：标准服务
            </view> -->
          </view>
          <view class="right">
            <image class="image" src="/static/profile.png" mode="aspectFit" v-if="!mainData.person_image"></image>
            <image class="image" :src="getImagePath(mainData.person_image)" mode="aspectFit" v-else></image>
          </view>
        </view>
        <view class="attr-list">
          <view class="attr-item">
            属相：{{mainData.sign_of_the_zodiac||'-'}}
          </view>
          <view class="attr-item">
            服务：{{mainData.service_num||'-'}}户
          </view>
          <view class="attr-item">
            星座：{{mainData.constellation||'-'}}
          </view>
          <view class="attr-item">
            籍贯：{{mainData.rf_hometown_name_path?mainData.rf_hometown_name_path.replaceAll('/',''):'-'}}
          </view>
          <view class="attr-item">
            民族：{{mainData.nationality||'-'}}族
          </view>
          <view class="attr-item">
            学历：{{mainData.education||'-'}}
          </view>
        </view>
      </view>
    </view>
    <view class="content-box">
      <view class="title">
        自我介绍
      </view>
      <view class="tags-box" v-if="tags&&tags.length>0">
        <view class="cu-btn round sm margin-right-xs" v-for="item in tags">
          {{item}}
        </view>
      </view>
      <view class="content">
        {{mainData.self_introduction_content||'-'}}
      </view>
    </view>
    <view class="content-box" v-if="mainData.comments">
      <view class="title">
        考核团评语
      </view>

      <view class="content">
        {{mainData.comments||''}}
      </view>
    </view>
    <view class="content-box bg-white">
      <view class="title">
        视频展示
      </view>

      <view class="content flex flex-wrap justify-center">
        <video :src="src" v-for="src in videos"></video>
      </view>
    </view>

    <view class="content-box bg-white">
      <view class="title">
        服务照片
      </view>

      <view class="content flex flex-wrap">
        <u-image width="220rpx" height="150rpx" :src="src" mode="aspectFit" v-for="src in images"></u-image>
      </view>
    </view>


    <view class="content-box bg-red no-margin">
      <view class="container">
        <view class="title text-white">
          专业证件
        </view>
        <view class="card-list">
          <view class="card-item" v-for="item in certList">
            <text class="cuIcon-card margin-right-xs"></text><text>{{item.documents_name}}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="flex">
      <view class="list-card">
        <view class="card-title">
          <view class="title">
            护理内容
          </view>
          <view class="">

          </view>
        </view>
        <view class="card-list">
          <view class="list-item" v-for="item in serviceList">
            {{item.content_title||''}}
          </view>
      <!--    <view class="list-item">
            宝宝生活照顾
          </view>
          <view class="list-item">
            宝宝生活照顾
          </view> -->
        </view>
      </view>
      <view class="list-card" v-if="skillList&&skillList.length>0">
        <view class="card-title">
          <view class="title">
            服务技能
          </view>
          <view class="">

          </view>
        </view>
        <view class="card-list">
          <view class="list-item" v-for=" item in skillList">
            {{item.skill_name||''}}
          </view>
        </view>
      </view>
    </view>

    <view class="content-box bg-white" style="background-color: #FD7E90;color: #Fff;">
      <view class="title text-white">
        项目列表
      </view>

      <view class="content">
        <view class="goods-item flex justify-between margin-bottom-xs" v-for="item in goodsList">
          <view class="text-white">
            {{item.goods_name||''}}
          </view>
          <button class="cu-btn bg-red light round sm" @click="toOrder(item)">预约</button>
        </view>
      </view>
    </view>
    <view class="bottom-button">
      <!-- <button class="cu-btn bg-blue">立即预约</button> -->
      <button class="cu-btn bg-blue" @click="makePhone" v-if="storeInfo&&storeInfo.telephone">电话咨询</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: null,
        mainData: {},
        images: [],
        videos: [],
        certList: [], //证件
        serviceList: [], //服务内容列表
        skillList: [], //服务技能列表
        goodsList: [], //商品列表
      }
    },
    computed: {
      tags() {
        let res = []
        if (this.mainData.person_label) {
          res = this.mainData.person_label.split(',')
        }
        return res
      }
    },
    methods: {
      toOrder(e) {
        let goodsInfo = {
          goods_name: e.goods_name,
          goods_no: e.goods_no,
          price: e.service_goods_price,
          goods_image: e.service_goods_icon,
          goods_amount: 1,
        }
        let fieldsCond = [{
            column: 'service_people_no',
            value: this.mainData.service_no
          },
          {
            column: 'server_type',
            value: '上门服务',
            display: false
          },
          {
            column: 'service_place_no',
            display: false
          },
          {
            column: 'service_time_no',
            display: false
          },
          {
            column: 'people_work_no',
            display: false
          }
        ]
        let url =
          `/storePages/placeOrder/placeOrder?store_no=${this.storeInfo.store_no}&order_type=服务&show_params_config=服务场地,服务人员&wxMchId=${this.getwxMchId()}&goods_info=${JSON.stringify(goodsInfo)}&fieldsCond=${JSON.stringify(fieldsCond)}`
        uni.navigateTo({
          url
        })
      },
      makePhone() {
        uni.makePhoneCall({
          phoneNumber: this.storeInfo?.telephone || '10086'
        })
      },
      // 查找商品列表
      getGoods() {
        const req = {
          "serviceName": "srvhealth_goods_person_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "service_no",
            "ruleType": "eq",
            "value": this.mainData.service_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 50
          }
        }
        const url = `/health/select/srvhealth_goods_person_select`
        this.$http.post(url, req).then(res => {
          if (res.data?.state === 'SUCCESS') {
            this.goodsList = res.data.data
          }
        })
      },
      // 查找证件列表
      getCert() {
        const url = `/health/select/srvhealth_person_documents_select`
        let req = {
          "serviceName": "srvhealth_person_documents_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "service_no",
            "ruleType": "eq",
            "value": this.mainData.service_no
          }],
          "relation_condition": {},
          "page": {
            "pageNo": 1,
            "rownumber": 8
          },
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data)) {
            this.certList = res.data.data
          }
        })
      },
      // 查找服务内容
      getServiceList() {
        const req = {
          "serviceName": "srvhealth_service_content_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "service_no",
            "ruleType": "eq",
            "value": this.mainData.service_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 20
          },
        }
        const url = `/health/select/srvhealth_service_content_select`
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data)) {
            this.serviceList = res.data.data
          }
        })
      },
      // 查找服务技能列表
      getSkillList() {
        const url = `/health/select/srvhealth_service_skill_select`
        const req = {
          "serviceName": "srvhealth_service_skill_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "service_no",
            "ruleType": "eq",
            "value": this.mainData.service_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 20
          }
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data)) {
            this.skillList = res.data.data
          }
        })
      },
      async getFiles(val) {
        let files = []
        let fileDatas = await this.getFilePath(val);
        if (fileDatas) {
          for (let i = 0; i < fileDatas.length; i++) {
            const url =
              `${this.$api.getFilePath}${fileDatas[ i ].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`;
            files.push(url);
          }
        }
        return files
      },
      getMainData() {
        const service = 'srvhealth_technician_list_select'
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            "colName": "id",
            "ruleType": "eq",
            "value": this.id
          }]
        }
        const url = `/health/select/${service}`
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
            this.mainData = res.data.data[0]
            if (this.mainData.service_no) {
              this.getCert()
              this.getServiceList()
              this.getSkillList()
              this.getGoods()
            }
            if (this.mainData.service_image) {
              this.getFiles(this.mainData.service_image).then(res => {
                this.images = res
              })
            }
            if (this.mainData.service_video) {
              this.getFiles(this.mainData.service_video).then(res => {
                this.videos = res
              })
            }
          }
        })
      },
    },
    onLoad(option) {
      if (option.id) {
        this.id = option.id;
        this.getMainData()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .profile-box {
    // background-color: #FF96A4;
    height: 320px;
    // background-image: linear-gradient(180deg, #FF96A4, #FC7387);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      width: 180%;
      height: calc(100% - 5px);
      position: absolute;
      left: -50%;
      top: 0;
      border-radius: 0 0 50% 100%;
      background-image: linear-gradient(180deg, #FF96A4 30%, #FC7387);
      z-index: 2;
    }

    &::after {
      content: '';
      width: 200%;
      height: 100%;
      position: absolute;
      left: -50%;
      top: 0;
      border-radius: 0 0 50% 50%;
      // background: #1496f1;
      background-image: linear-gradient(0, #FF96A4, #FC7387);
      z-index: 1;
    }

    .container {
      width: calc(100% - 20px);
      height: calc(100% - 80px);
      border-radius: 20px;
      position: absolute;
      left: 10px;
      top: 30px;
      z-index: 5;
      padding: 10px;
      background-color: #fff;
      padding: 25px 20px;

      .top {
        display: flex;

        .left {
          flex: 1;

          .name {
            font-size: 24px;
            padding: 10px 0;
          }

          .golden {
            line-height: 25px;
            font-size: 16px;
            color: #804826;
          }
        }

        .right {
          width: 120px;
          height: 150px;
          border-radius: 10px;
          position: absolute;
          top: -20px;
          right: 15px;
          box-shadow: 0px 0px 10px 0px rgba(50, 50, 50, 0.5);
          // background: #fff;
          overflow: hidden;

          .image {
            background: #fff;
            border-radius: 10px;
            border: 3px solid #fff;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        }
      }

      .attr-list {
        padding-top: 20px;
        color: #2E0106;
        min-height: 110px;

        .attr-item {
          width: 50%;
          padding: 2px 0 2px 20px;
          display: inline-block;
          position: relative;

          &:before {
            content: '';
            width: 5px;
            left: 0;
            top: calc(50% - 5px);
            position: absolute;
            height: 5px;
            border: 2px solid #EFEFEF;
            border-radius: 50%;
          }
        }
      }
    }
  }

  .content-box {
    padding: 20px 10px;
    margin: 10px;
    border-radius: 10px;
    border: 2px solid #FFE2E8;
    background-color: #FFF3F3;

    &.bg-red {
      background-color: transparent;
      border: none;
      height: 280px;
      position: relative;

      &::before {
        content: '';
        width: 180%;
        height: calc(100% - 5px);
        position: absolute;
        left: -50%;
        top: 0;
        border-radius: 0 0 50% 100%;
        background-image: linear-gradient(180deg, #FF96A4 30%, #FC7387);
        z-index: 2;
      }

      &::after {
        content: '';
        width: 200%;
        height: 100%;
        position: absolute;
        left: -50%;
        top: 0;
        border-radius: 0 0 50% 50%;
        // background: #1496f1;
        background-image: linear-gradient(0, #FF96A4, #FC7387);
        z-index: 1;
      }

    }

    &.no-margin {
      margin: 0;
    }

    &.bg-white {
      background-color: #fff;
      border: none;
    }

    .title {
      text-align: center;
      font-size: 20px;
      color: #702335;
      position: relative;
      margin-bottom: 10px;

      &:before {
        content: '';
        width: 10px;
        height: 2px;
        display: inline-block;
        background-color: #702335;
        margin-bottom: 5px;
        margin-right: 10px;
      }

      &:after {
        content: '';
        width: 10px;
        height: 2px;
        display: inline-block;
        background-color: #702335;
        margin-bottom: 5px;
        margin-left: 10px;
      }

      &.text-white {
        color: #fff;

        &:before {
          background-color: #FFF;
        }

        &:after {
          background-color: #FFF;
        }
      }
    }

    .container {
      position: relative;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      padding: 10px;
      z-index: 5;
    }

    .card-list {
      display: flex;
      flex-wrap: wrap;
      z-index: 5;
      padding: 20px;

      .card-item {
        min-width: 50%;
        padding: 5px 10px;
        font-size: 16px;
      }
    }

    .tags-box {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;

      .cu-btn {
        background-color: #FF7886;
        color: #fff;
      }
    }

    .content {
      color: #433537;
      padding: 10px 0;
      letter-spacing: 2px;
      line-height: 20px;
    }
  }

  .list-card {
    flex: 1;
    margin: 20px 0;
    margin-right: 5px;
    background-image: linear-gradient(90deg, #FFFCF7, #FEF1EB);
    padding: 10px 0;

    &:last-child {
      margin-right: 0;
      background-image: linear-gradient(90deg, #FFF3F5, #FEE3E8);

      .card-title {
        .title {
          background-image: linear-gradient(#FD78A3, #F9588D);
          color: #fff;
        }
      }
    }

    .card-title {
      .title {
        background-image: linear-gradient(#FEE8D0, #F5DBBA);
        width: 70%;
        max-width: 130px;
        padding: 5px 10px;
        border-radius: 0 20px 20px 0;
        color: #410311;
        font-size: 18px;
      }

    }

    .card-list {
      padding: 15px;

      .list-item {
        padding: 5px 15px;
        position: relative;

        &:before {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 4px;
          background-color: #410311;
          position: absolute;
          left: 0;
          top: calc(50% - 2px);

        }
      }
    }
  }

  .bottom-button {
    display: flex;
    justify-content: center;
    padding: 0;
    position: fixed;
    bottom: 0;
    z-index: 10;
    width: 100%;

    .cu-btn {
      border-radius: 0;
      flex: 1;
      padding: 15px 0;
      height: auto;
      color: #410311;
      background-image: linear-gradient(#FEE8D0, #F5DBBA);

      &:last-child {
        color: #fff;
        background-image: linear-gradient(#FD78A3, #F9588D);
      }
    }
  }

  .page-wrap {
    padding-bottom: 80px;

  }
</style>
