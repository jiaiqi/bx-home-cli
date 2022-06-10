<template>
  <view class="couple-wrap">
    <view class="couple-more-wrap">
      <view class="couple-more-top">
        <text></text>
        <text>体质健康评测</text>
      </view>
      <uni-echarts class="uni-ec-canvas" canvas-id="nutrients-canvas" :ec="radarOption"></uni-echarts>
      <!-- 	<view class="text-center margin-tb-sm text-gray">
				请在下方体质测试问卷选择一个问卷进行评测
			</view> -->
      <view class="text-center margin-tb-sm text-gray"
        v-if="corporeity.find(item=>item.grade>=40)&&corporeity.find(item=>item.grade>=40).name">
        <text> 经评测您的体制为</text><text class="text-bold text-black">【{{corporeity.find(item=>item.grade>=40).name}}】</text>
      </view>
      <view class="more-couple-cen-wrap">
        <view class="couple-cen more-couple-cen">
          <view @click="clickItem(item)" v-for="(item, index) in corporeity" :key="index" :class="{
							'couple-cen-item-active': item.name === currentItem.name && false
						}" class="couple-cen-item ">
            <view class="couple-cen-item-t">
              <text v-if="item.finished && !item.grade && item.grade !== 0" class="text">暂无得分</text>
              <view class="unfilled" @click="toQuestionnaire(item)">
              </view>
            </view>
            <view class="icon" @click="toQuestionnaire(item)">
              <view class="bg-cyan cu-tag pl" v-if="item.grade>=40">符合</view>
              <view class="bg-blue cu-tag badge" v-if="item.grade">{{ item.grade}}分</view>
              <image class="image" :src="item.icon" mode="aspectFill"></image>
            </view>
            <view class="couple-cen-item-b">
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    selectPersonInfo
  } from '@/common/api/login.js'
  import uniEcharts from '@/components/uni-ec-canvas/uni-echart.vue'
  export default {
    components: {
      uniEcharts
    },
    data() {
      return {
        user_no: "",
        // userInfo: '',
        radarOption: {
          option: {}
        },
        corporeity: [{
            name: '阴虚质',
            grade: null,
            no: '20201112110542000192',
            icon: require('../static/icon/体质图标/阴虚质.jpg')
          },
          {
            name: '气郁质',
            grade: null,
            no: '20201112112218000193',
            icon: require('../static/icon/体质图标/气郁质.jpg')
          },
          {
            name: '血瘀质',
            grade: null,
            no: '20201112113200000194',
            icon: require('../static/icon/体质图标/血瘀质.jpg')
          },
          {
            name: '痰湿质',
            grade: null,
            no: '20201112114401000195',
            icon: require('../static/icon/体质图标/痰湿质.jpg')
          },
          {
            name: '湿热质',
            grade: null,
            no: '20201112143740000196',
            icon: require('../static/icon/体质图标/湿热质.jpg')
          },
          {
            name: '特禀质',
            grade: null,
            no: '20201112145435000197',
            icon: require('../static/icon/体质图标/特禀质.jpg')
          },
          {
            name: '阳虚质',
            grade: null,
            no: '20201112105018000191',
            icon: require('../static/icon/体质图标/阳虚质.jpg')
          },
          {
            name: '气虚质',
            grade: null,
            no: '20201112104036000190',
            icon: require('../static/icon/体质图标/气虚质.jpg')
          },
          {
            name: '平和质',
            grade: null,
            no: '20201112103143000189',
            icon: require('../static/icon/体质图标/平和质.jpg')
          }
        ],
        scoreInfo: {},
        currentItem: {},
      };
    },
    filters: {
      fixed1: function(value) {
        if (value) {
          return value.toFixed(1);
        } else {
          return 0;
        }
      }
    },
    computed: {
      bmi() {
        if (this.userInfo.weight && this.userInfo.height) {
          return (Number(this.userInfo.weight) / Math.pow(Number(this.userInfo.height) / 100, 2)).toFixed(1);
        }
      },
      age() {
        if (this.userInfo.birthday) {
          let age = new Date().getFullYear() - new Date(this.userInfo.birthday).getFullYear();
          return age;
        }
      },
    },

    methods: {
      buildRadar() {

      },
      buildRadarData(corporeity) {
        let data = corporeity.map(item => item.grade);
        let indicator = corporeity.map(item => {
          if (item.name === '阴虚质') {
            return {
              axisTick: {
                show: true,
                inside: true,
                lineStyle: {
                  color: "#000"
                }
              },
              axisLabel: {
                show: true,
                inside: true,
                fontSize: 12
              },
              name: item.name,
              max: this.deepClone(data).sort(function(a, b) {
                return b - a;
              })[0] + 3
            };
          }
          return {
            name: item.name,
            max: this.deepClone(data).sort(function(a, b) {
              return b - a;
            })[0] + 3
          };
        });
        let option = {
          normal: {
            top: 200,
            left: 300,
            width: 500,
            height: 400,
            zIndex: 6,
            backgroundColor: ''
          },
          color: ['rgba(245, 166, 35, 1)', 'rgba(19, 173, 255, 1)'],
          radar: {
            // shape: 'circle',
            name: {
              textStyle: {
                color: '#fff',
                backgroundColor: '#999',
                borderRadius: 3,
                padding: [3, 5]
              }
            },
            nameGap: 10,
            center: ['50%', '50%'],
            radius: '70%',
            startAngle: 90,
            splitNumber: 4,
            splitArea: {
              areaStyle: {
                // color: ['transparent']
              }
            },
            axisLabel: {
              show: false,
              fontSize: 14,
              color: '#333',
              fontStyle: 'normal',
              fontWeight: 'normal'
            },

            indicator: indicator
          },
          series: [{
            type: 'radar',
            // areaStyle: {normal: {}},
            data: [data],
            symbol: 'circle',
            label: {
              normal: {
                show: true,
                formatter: params => {
                  return params.value;
                },
                fontSize: 12
              }
            }
          }]
        };
        this.radarOption.option = option;
      },
      toQuestionnaire(item) {
        if (item && item.no) {
          uni.navigateTo({
            url: `/questionnaire/index/index?formType=form&activity_no=${item.no}&status=进行中`
          });
        } else {
          if (item && item.name === '基本信息') {
            // if (item && (item.name !== '体重' || item.name !== '年龄')) {
            let fieldsCond = Object.keys(this.userInfo)
              .filter(key => key && key[0] !== '_')
              .map(key => {
                let obj = {
                  column: key,
                  display: false,
                  value: this.userInfo[key]
                };
                if (['weight', 'birthday', 'height'].includes(key)) {
                  obj.display = true;
                }
                return obj;
              });
            uni.navigateTo({
              url: '/publicPages/newForm/newForm?serviceName=srvhealth_person_info_update&type=update&fieldsCond=' +
                encodeURIComponent(JSON.stringify(fieldsCond))
            });
          } else {
            uni.showToast({
              title: '未知编号，请刷新重试',
              icon: 'none'
            });
          }
        }
      },
      async getScoreFromQuestionRecord(no) {
        // 以user_no和问卷编号为条件拿到最新的问卷填写记录信息
        let url = this.getServiceUrl('daq', 'srvdaq_record_reply_select', 'select');
        let req = {
          serviceName: 'srvdaq_record_reply_select',
          colNames: ['*'],
          condition: [{
              colName: 'activity_no',
              ruleType: 'eq',
              value: no
            },
            {
              colName: 'state',
              ruleType: 'eq',
              value: '完成'
            },
            {
              colName: 'user_no',
              ruleType: 'eq',
              value: this.user_no || this.userInfo.userno
            }
          ],
          page: {
            pageNo: 1,
            rownumber: 10
          },
          order: [{
            colName: 'end_time',
            orderType: 'desc'
          }]
        };
        let res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
          return res.data.data[0];
        } else {
          return false;
        }
      },

      async getCorporeityScore() {
        let scoreInfo = this.scoreInfo || {};
        let corporeity = this.corporeity;
        for (let item of corporeity) {
          if (!item.grade) {
            let res = await this.getScoreFromQuestionRecord(item.no);
            scoreInfo[item.name] = res;
            if (res && (res.score || res.score === 0)) {
              item.grade = res.score;
            }
            if (res.state === '完成') {
              item.finished = true;
            }
          }
        }
        return this.buildRadarData(corporeity);
      },
      clickItem(item) {
        if (item.name === this.currentItem.name) {
          this.currentItem = {};
        } else {
          this.currentItem = item;
        }
      },
      async selectQuestion() {
        let self = this;
        let url = this.getServiceUrl('daq', 'srvdaq_record_reply_select', 'select');
        let req = {
          serviceName: 'srvdaq_record_reply_select',
          colNames: ['*'],
          condition: [{
              colName: 'activity_no',
              ruleType: 'eq',
              value: this.currentItem.no
            },
            {
              colName: 'user_no',
              ruleType: 'eq',
              value: uni.getStorageSync('login_user_info').user_no
            },
            {
              colName: 'state',
              ruleType: 'eq',
              value: '完成'
            }
          ]
        };
        let res = await this.$http.post(url, req);
        return res.data.data;
      }
    },
    async onLoad(option) {
      if(!option.user_no){
        option.user_no = this.userInfo?.userno
      }
      if (option.user_no) {
        this.user_no = option.user_no
        let userInfo = await selectPersonInfo(option.user_no);
        console.log(userInfo, 'userInfo')
        if (userInfo && userInfo.userno) {
          this.userInfo = userInfo;
          this.getCorporeityScore();
        }
      }
    },
    onPullDownRefresh() {
      if(this.userInfo?.userno){
        selectPersonInfo(this.userInfo?.userno).then(userInfo => {
          if (userInfo && userInfo.userno) {
            this.userInfo = userInfo;
            this.getCorporeityScore().then(() => {
              uni.stopPullDownRefresh()
            })
          }
        })
      }
    },
    onShow() {
      if (this.userInfo && this.userInfo.userno) {
        this.getCorporeityScore();
      }
    }
  };
</script>

<style lang="scss" scoped>
  .couple-wrap {
    background-color: white;
    min-height: 100vh;
    padding-top: 20rpx;

    .tips {
      padding: 20rpx;
      color: #67c23a;
      background: #f0f9eb;
      border-color: #c2e7b0;
      margin: 20rpx;
    }

    .total-score {
      width: 50%;
      margin: 0 auto 0;
      text-align: center;
      padding: 40rpx 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      font-size: 80rpx;
      border-radius: 100rpx;

      .unit {
        font-size: 28rpx;
      }
    }

    .couple-cen {
      position: relative;
      transition: all 1s;
      display: flex;
      flex-wrap: wrap;
      margin: 0 20rpx;
      padding-bottom: 20rpx;

      .couple-cen-item {
        width: 33%;
        box-sizing: border-box;
        min-height: 150rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10rpx;
        border: 1px solid transparent;
        border: 1px solid #f1f1f1;
        position: relative;
        border-top: none;

        &:nth-child(1),
        &:nth-child(2),
        &:nth-child(3) {
          border-top: 1px solid #f1f1f1;
        }

        .couple-cen-item-t {
          position: relative;
          font-size: 72rpx;
          color: #ccc;
          font-weight: 600;
          display: flex;
          width: 100%;
          flex: 1;
          justify-content: center;
          align-items: flex-end;
          z-index: 2;

          .score-detail {
            position: relative;

            .unit {
              font-size: 24rpx;
              font-weight: normal;
              position: absolute;
              bottom: 0;
            }
          }

          .text {
            font-size: 14rpx;
          }

          .unfilled {
            font-size: 24rpx;
            color: #999;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-weight: normal;

            .text-icon {
              font-size: 48rpx;
            }
          }
        }

        .risk {
          color: #e54d42;
        }

        .normal {
          color: #39b54a;
        }

        .icon {
          width: 150rpx;
          height: 150rpx;
          position: relative;

          .badge {
            z-index: 2;
            right: -20px;
            border-radius: 0;
          }

          .pl {
            position: absolute;
            left: -15px;
            top: calc(50% - 10px);
            z-index: 2;
            border-radius: 20px;
            margin: 0;
            padding: 5px;
            height: auto;
            font-size: 12px;
            width: 20px;
            white-space: break-spaces;

          }

          .image {
            width: 150rpx;
            height: 150rpx;
          }
        }

        .couple-cen-item-b {
          font-size: 30rpx;
          font-weight: 700;
          position: relative;
          text-align: center;
          margin-top: 10rpx;
          width: 100%;

          .ratio {
            font-weight: normal;
            font-size: 24rpx;
            color: #999;
          }
        }

        .item-total-score {
          font-weight: normal;
          font-size: 24rpx;
          color: #999;
        }
      }

      .couple-cen-item-active {
        height: 300rpx;
        z-index: 10;
        background-color: #fff;
        grid-column-start: 1;
        grid-column-end: 4;
        grid-row-start: 1;
        animation: 1s overview;
      }
    }

    @keyframes overview {
      0% {
        transform: scale(0);
      }

      100% {
        transform: scale(1);
      }
    }

    .couple-more-wrap {
      .couple-more-top {
        padding: 15px;
        font-size: 16px;
        font-weight: 800;
        display: flex;
        align-items: center;

        text {
          &:first-child {
            width: 8rpx;
            height: 32rpx;
            background-color: #0081ff;
            border-radius: 8rpx;
            margin-right: 10rpx;
          }
        }
      }

      .health-box {
        display: flex;
        flex-wrap: wrap;
        padding: 0 20rpx;

        .health-item {
          width: 33.33%;
          height: calc((100vw - 150rpx) / 3);
          box-sizing: border-box;
          padding-top: 20rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          border-right: 1px solid #f1f1f1;
          border-bottom: 1px solid #f1f1f1;
          position: relative;

          &:active {
            background-color: #f1f1f1;
          }

          &:nth-child(3n + 1) {
            border-left: 1px solid #f1f1f1;
          }

          &:nth-child(1),
          &:nth-child(2),
          &:nth-child(3) {
            border-top: 1px solid #f1f1f1;
          }

          .grade {
            font-size: 12px;
            display: inline-block;
            padding: 2px 0;
            position: absolute;
            width: 150rpx;
            left: calc(50% - 75rpx);
            text-align: center;
            top: 0;
          }

          .image {
            padding: 10rpx;
            width: 40px;
            height: 40px;
          }
        }
      }
    }
  }

  .uni-ec-canvas {
    width: calc(100% - 40rpx);
    height: 500rpx;
    padding: 0 20rpx 20rpx 20rpx;
    display: block;
  }
</style>
