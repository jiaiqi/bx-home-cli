<template>
  <view class="score-input">
    <view class="content">
      <view class="top">
        <view class="area-select">
          <!-- <text>陕西</text> -->
          <!-- <picker @change="regionChange" mode="selector" :value="region" :range-key="'name'" :range="regionData"> -->
          <text class="cuIcon-locationfill"></text>{{regionData[region].name}}
          <!-- </picker> -->
          <picker @change="levleChange" mode="selector" :value="level" :range="levelData">
            <text class="margin-left text-blue"> {{levelData[level]}}</text>
          </picker>
        </view>
        <view class="subject-select" :class="{
          'wen':subject === '文',
          'li':subject === '理'
        }" v-if="showSubject">
          <text class="sub-item" @click="changeSub('文')">文</text>
          <text class="sub-item" @click="changeSub('理')">理</text>
        </view>
        <view class="tip-text" v-if="showSubject">
          高考/模考总分
        </view>
      </view>
      <view class="bottom">
        <input type="digit" placeholder-class="hint" class="input" :placeholder="'请输入'+placeholder"
          v-model.number="score" @confirm="queryRank" @blur="queryRank">
        <input type="digit" placeholder-class="hint" class="input" :placeholder="'预估排名'" v-model.number="rank">
      </view>
    </view>
    <view class="button-area" @click="toDetail">
      <text>智能</text>
      <text>查询</text>
    </view>
  </view>
</template>

<script>
  import {
    regionData
  } from '@/storePages/static/province.js'
  export default {
    data() {
      return {
        rank: null,
        regionData: regionData,
        subject: '理',
        showSubject: true,
        region: 26,
        score: null,
        level: 0,
        levelData: ['全部', '本科一批', '本科二批', '专科']
      }
    },
    props: {
      pageItem: {
        type: Object
      },
    },
    computed: {
      detailUrl() {
        return this.pageItem?.more_config?.detailUrl || '/storePages/scoreInputDetail/scoreInputDetail'
      },
      placeholder() {
        return this.showSubject ? `(${this.subject}科)总分` : '总分'
      }
    },
    methods: {
      
      async queryRank(e) {
        let value = e?.detail?.value;
        if (value && !isNaN(Number(value))) {
          value = Number(value)
          let between = [value - 3, value + 3]
          const url = `/person/select/srvuee_pro_score_select`
          const req = {
            "serviceName": "srvuee_pro_score_select",
            "colNames": ["*"],
            "condition": [{
              "colName": "avg_score",
              "ruleType": "between",
              "value": between
            }],
            "page": {
              "pageNo": 1,
              "rownumber": 1
            }
          }
          const res = await this.$http.post(url, req);
          if (res?.data?.state === 'SUCCESS' && Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
            this.rank = res.data.data[0].lowest_quantile
          }
        }
      },
      levleChange(e) {
        this.level = e?.detail?.value
      },
      regionChange(e) {
        this.region = e?.detail?.value
        const list = ['上海', '浙江', '山东', '江西', '海南', '北京', '天津', '青海', '湖南', '广东', '河北', '四川', '黑龙江', '辽宁', '贵州', '西藏',
          '江苏', '吉林', '重庆', '山西', '湖北', '福建', '甘肃', '宁夏', '广西'
        ]
        if (list.includes(this.regionData[this.region].name)) {
          this.showSubject = false
        } else {
          this.showSubject = true
        }
      },
      changeSub(e) {
        this.subject = e
      },
      async insertGaokaoInfo(e) {
        const url = `/person/operate/srvperson_query_info_add`
        const req = [{
          "serviceName": "srvperson_query_info_add",
          "condition": [],
          "data": [{
            "edu_levels": e?.level,
            "rank": e?.rank,
            results_val: e?.score,
            province: e?.regionName,
          }]
        }]
        const res = await this.$http.post(url, req);
        if (res?.data?.state === 'SUCCESS') {
          return res.data
        }
      },
      async toDetail() {
        // 检查是否关注公众号
        let res = await this.checkSubscribeStatus()
        if (!res) {
          let confirm = await new Promise((resolve) => {
            uni.showModal({
              title: '提示',
              content: '请先关注百想助理公众号，以便及时收到新消息通知',
              confirmText: '去关注',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  resolve(true)
                } else {
                  resolve(false)
                }
              }
            })
          })
          if (confirm === true) {
            if (this.$api?.env === 'prod') {
              this.toOfficial()
              return
            }
          }
        }
        if (!this.score) {
          uni.showModal({
            title: '提示',
            content: '请先输入分数',
            showCancel: false
          })
          return
        }

        if (!this.rank) {
          uni.showModal({
            title: '提示',
            content: '请先输入在省内排名',
            showCancel: false
          })
          return
        }
        const gaokaoInfo = uni.getStorageSync('gaokaoInfo')
        const newGaokaoInfo = {
          region: this.regionData[this.region].code,
          regionName: this.regionData[this.region].name,
          level: this.levelData[this.level],
          rank: this.rank,
          score: this.score,
          subject: this.subject
        }
        const data = {
          ...newGaokaoInfo,
          storeUser: this.vstoreUser,
          storeInfo: this.storeInfo,
        }


        let detailUrl = this.detailUrl;

        if (detailUrl) {
          detailUrl = this.renderStr(detailUrl, data)
          detailUrl = `${detailUrl}?query=${JSON.stringify(newGaokaoInfo)}`
          const url =
            `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent('https://login.100xsys.cn/health/#'+detailUrl)}`
          uni.navigateTo({
            url: url,
            success: () => {
              // if ((gaokaoInfo?.region && (gaokaoInfo.region !== newGaokaoInfo.region || gaokaoInfo.level !== newGaokaoInfo
              //     .level || gaokaoInfo.tank !== newGaokaoInfo.tank)) || !gaokaoInfo?.region) {
              // 信息变更
              this.insertGaokaoInfo(newGaokaoInfo)
              // }

              uni.setStorageSync('gaokaoInfo', data)
            }
          })
        }

      },
    },
  }
</script>

<style scoped lang="scss">
  .score-input {
    background-color: #fff;
    color: #999999;
    padding: 10px;
    position: relative;

    .button-area {
      position: absolute;
      top: 10px;
      right: 10px;
      height: 80px;
      width: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      flex-direction: column;
      font-size: 16px;
      text-align: center;
      border-radius: 100px;
      background: linear-gradient(#8f73f3, #2e77e4);
      box-shadow: 0 0 5px #8f73f3, 0 0 5px #2e77e4;

      &:active {
        opacity: 0.9;
      }
    }

    .top {
      display: flex;
      align-items: center;

      .area-select {
        display: flex;
        align-items: center;
      }
    }

    .bottom {
      padding: 10px 80px 10px 20px;
      background-color: #f8f8f8;
      margin: 10px 0;
      border-radius: 50px;
      text-align: center;
      display: flex;

      .input {
        flex: 1;
        border-bottom: 1px #f1f1f1 solid;
        margin-right: 5px;
      }

      .hint {
        font-size: 14px;
      }
    }

    .area-select,
    .subject-select {
      margin-right: 10px;
    }

    .tip-text {
      color: #0074fd;

    }

    .subject-select {
      display: flex;
      justify-content: space-between;
      width: 50px;
      height: 25px;
      // padding: 5px 10px;
      background-color: #ccc;
      border-radius: 20px;
      color: #fff;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        width: 25px;
        height: 25px;
        border-radius: 20px;
        background-color: #0074fd;
        transition: left ease-in .1s;
      }

      &.wen {
        &:after {
          left: 0;
        }
      }

      &.li {
        &:after {
          left: calc(100% - 25px);
        }
      }

      .sub-item {
        z-index: 1;
        font-size: 12px;
        display: inline-block;
        width: 25px;
        height: 25px;
        text-align: center;
        line-height: 25px;
      }
    }
  }
</style>
