<template>
  <view class="activity">
    <u-notice-bar
      mode="horizontal"
      :list="noticeList"
      class="text-white"
      v-if="noticeList && noticeList.length > 0"
    >
    </u-notice-bar>
    <view>
      <view class="top-bg"> </view>
      <view class="join-number">
        <text v-if="total">
          已参与
          <text class="number">{{ total }}</text
          >人次
        </text>
      </view>
    </view>
    <view class="chart-content" v-if="chartOption">
      <uniEcCharts
        class="uni-ec-charts"
        id="uni-ec-charts"
        :ec="chartOption"
      ></uniEcCharts>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from '@/components/uni-ec-canvas/echarts.js'
import chinaMap from '@/static/china.json'
echarts.registerMap('china', chinaMap);
export default {
  data () {
    return {
      shareNum: 0,
      shareJoinNum: 0,
      total: 0,
      su: "", //share_user_no
      chartOption: { option: {} },
      wxUserInfo: {},
    }
  },
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      loginUserInfo: state => state.user.loginUserInfo
    }),
    noticeList () {
      if (this.wxUserInfo && (this.wxUserInfo.user_no || this.loginUserInfo.user_no)) {
        if (this.shareNum && !this.shareJoinNum) {
          return [
            `您分享的本活动已被${this.shareNum || '-'}人次浏览`
          ]
        }
        if (!this.shareNum && this.shareJoinNum) {
          return [
            `已有${this.shareNum || '-'}人通过您分享的链接参加本活动`
          ]
        }
        if (this.shareNum && this.shareJoinNum) {
          return [
            `您已传播${this.shareNum || '-'}人，带动${this.shareJoinNum || '-'}人次参加本活动`
          ]
        }
      } else {
        return []
      }
    },
  },
  methods: {
    async getData () {
      let req = {
        "serviceName": "srvportal_city_select",
        "colNames": [ "*" ],
        "condition": [ {
          colName: 'level',
          ruleType: 'eq',
          value: 1
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 99
        },
      }
      let url = this.getServiceUrl('bxportal', 'srvportal_city_select', 'select');
      let res = await this.$http.post(url, req)
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        // this.provinceList = res.data.data
        return res.data.data
      }
    },
    async getUserInfo () {
      let url = this.$api.getUserInfo;
      let req = {
        serviceName: 'srvwx_basic_user_info_select',
        colNames: [ '*' ],
        condition: [ {
          colName: 'app_no',
          ruleType: 'eq',
          value: this.$api.appNo.wxmp
        } ]
      };
      let res = await this.$http.post(url, req);
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        const userInfo = res.data.data[ 0 ];
        this.wxUserInfo = userInfo;

        if (this.su || uni.getStorageSync('su')) {
          let share_user_no = this.su || uni.getStorageSync('su')
          if (share_user_no != userInfo.user_no) {
            this.addViewRecord()
          }
        }
        this.getLastRecord()
        this.getPresentResult(userInfo.unionid)
      }
    },
    async getLastRecord () {
      // 查找最后一条祝福记录
      let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select');
      let req = {
        "serviceName": "srvportal_act_atd_rcd_select",
        "colNames": [ "*" ],
        order: [ {
          colName: "id",
          orderType: "desc"
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      let res = await this.$http.post(url, req)
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        this.lastRecord = res.data.data[ 0 ]
        this.total = res.data.data[ 0 ].id
      }
    },
    async getPresentResult (unionid) {
      let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select');
      let req = {
        "serviceName": "srvportal_act_atd_rcd_select",
        "colNames": [ "*" ],
        order: [ {
          colName: "id",
          orderType: "desc"
        } ],
        "condition": [ {
          colName: "unionid",
          ruleType: 'eq',
          value: unionid
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      if (!unionid) {
        return
      }
      let res = await this.$http.post(url, req)
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        this.result = res.data.data[ 0 ]
      }
      this.getShareNum()
      this.getShareJoinNum()
    },
    getShareNum () {
      let req = {
        "serviceName": "srvportal_share_visit_log_select",
        "colNames": [ "*" ],
        "condition": [ {
          colName: "share_user_no",
          ruleType: 'eq',
          value: this.wxUserInfo?.user_no || this.loginUserInfo.user_no
        } ],
        group: [ {
          "colName": "id",
          "type": "count"
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 10
        },
      }
      let url = this.getServiceUrl('bxportal', 'srvportal_share_visit_log_select', 'select');
      this.$http.post(url, req).then(res => {
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          this.shareNum = res.data.data[ 0 ].id
        }
      })
    },
    getShareJoinNum () {
      let req = {
        "serviceName": "srvportal_act_atd_rcd_select",
        "colNames": [ "*" ],
        "condition": [ {
          colName: "share_user_no",
          ruleType: 'eq',
          value: this.wxUserInfo?.user_no || this.loginUserInfo.user_no
        } ],
        group: [ {
          "colName": "id",
          "type": "count"
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 10
        },
      }
      let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select');
      this.$http.post(url, req).then(res => {
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          this.shareJoinNum = res.data.data[ 0 ].id
        }
      })
    },
    async buildOption () {
      // myChart = echarts.init(document.getElementById('echarts'))
      let proData = await this.getData()
      proData = proData.map(item => {
        item.label = item.name
        item.name = item.name.replace('省', '').replace('市', '')
        return item
      })

      var geoCoordMap = {
        // "陕西": [109.1162, 34.2004]
      };
      let obj = {}
      proData.forEach(item => {
        obj[ item.name ] = [ item.lng, item.lat ]
      })
      geoCoordMap = obj
      var data = [ {
        name: "陕西",
        value: 80
      } ];
      data = proData.map(item => {
        let obj = {}
        obj.name = item.name
        obj.value = item.total_count || 0
        return obj
      }).filter(item => item.value)
      var max = 480,
        min = 9; // todo 
      var maxSize4Pin = 100,
        minSize4Pin = 20;

      var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
          var geoCoord = geoCoordMap[ data[ i ].name ];
          if (geoCoord) {
            res.push({
              name: data[ i ].name,
              value: geoCoord.concat(data[ i ].value)
            });
          }
        }
        return res;
      };

      let option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            if (typeof (params.value)[ 2 ] == "undefined") {
              return params.name + ' : ' + params.value;
            } else {
              return params.name + ' : ' + params.value[ 2 ];
            }
          }
        },
        legend: {
          orient: 'vertical',
          y: 'bottom',
          x: 'right',
          data: [ 'pm2.5' ],
          textStyle: {
            color: '#fff'
          }
        },
        visualMap: {
          show: true,
          textStyle: { color: '#fff' },
          min: 0,
          max: 10000,
          left: ' ',
          text: [ '多', '少' ], // 文本，默认为数值文本
          calculable: true,
          orient: "horizontal",
          type: 'continuous',
          bottom: 0,
          seriesIndex: [ 1 ],
          inRange: {
            color: [ '#e14e4e', '#5B1113' ],
          },
          pieces: [ {
            gt: 10000,
            label: ">10000人次",
            color: "#5B1113"
          }, {
            gte: 1000,
            lte: 10000,
            label: "1000 - 10000人次",
            color: "#A71F22"
          }, {
            gte: 100,
            lt: 1000,
            label: "100 - 1000人次",
            color: "#f72c33"
          }, {
            gte: 30,
            lt: 100,
            label: "1 - 100人次",
            color: "#ff3d3d"
          },
          {
            gte: 1,
            lt: 30,
            label: "1 - 100人次",
            color: "#e14e4e"
          },

          {
            value: 0,
            color: "#ffffff"
          }
          ],
        },
        geo: {
          top: 10,
          bottom: 30,
          right: 10,
          left: 10,
          // map: chinaMap,
          map: 'china',
          show: true,
          roam: true,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false,
            }
          },
          itemStyle: {
            areaColor: '#e12c32',
            normal: {
              areaColor: '#e12c32',
              borderColor: '#8d1b1f', //线
              shadowColor: '#83191d', //外发光
              shadowBlur: 20
            },
            emphasis: {
              areaColor: '#ff3239', //悬浮区背景
            }
          }
        },
        series: [
          {
            symbolSize: 1,
            label: {
              normal: {
                fontSize: 10,
                formatter: '{b}',
                position: 'top',
                show: true
              },
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              normal: {
                color: '#fff'
              }
            },
            name: 'light',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(data)
          },
          {
            type: 'map',
            // map: chinaMap,
            map: 'china',
            geoIndex: 0,
            aspectScale: 0.75, //长宽比
            showLegendSymbol: false, // 存在legend时显示
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false,
                textStyle: {
                  color: '#fff'
                }
              }
            },
            roam: true,
            right: 0,
            top: 0,
            bottom: 0,
            itemStyle: {
              areaColor: '#e12c32',
              normal: {
                areaColor: '#e12c32',
                borderColor: '#FFFFFF',
              },
              emphasis: {
                areaColor: '#83191d'
              }
            },
            animation: true,
            data: data
          }
        ]
      };
      this.chartOption = { option }
    },
  },

  // 页面周期函数--监听页面加载
  onLoad (option) {
    if (option.su) {
      this.su = option.su
      uni.setStorageSync('su', option.su)
    }
    this.getUserInfo()

  },
  mounted () {
    setTimeout(() => {
      this.buildOption()
    }, 200);
  },

};
</script>

<style lang="scss">
.activity {
  background-color: #8a1b1f;
  min-height: calc(100vh - var(--window-top));
  .chart-content {
    width: 100%;
    height: 600rpx;
    .uni-ec-charts {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
