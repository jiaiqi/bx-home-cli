<template>
  <view class="clock-in-wrap">
    <view class="top-bar">
      <view class="top-item" v-for="item in clockTypes" :key="item.name" :class="{active:curType===item.name}"
        @click="changeType(item.name)">
        {{item.name}}
      </view>
    </view>
    <view class="clock-content">
      <view class="top-card">
        <view class="title">
          今日打卡
        </view>
        <view class="card">
          <view class="text">
            上班 8:56
          </view>
          <view class="text">
            <text>已打卡</text>
            <button class="cu-btn bg-white sm round"><text
                class="margin-right-xs cuIcon-refresh text-lg text-blue "></text>更新</button>
          </view>
        </view>
        <view class="card">
          <view class="text">
            上班 8:56
          </view>
          <view class="text">
            <text>已打卡</text>
            <button class="cu-btn bg-white sm round"><text
                class="cuIcon-refresh margin-right-xs text-lg text-blue "></text>更新</button>
          </view>
        </view>
      </view>
      <view class="clock-card" v-if="curType === '上下班打卡'">
        <image :src="require('../static/org_icon.png')" mode="" class="store-icon "></image>
        <view class="text-bold padding-bottom-xs">
          {{locationTip||''}}
        </view>
        <view class="store-name text-light">
          {{storeInfo.name||''}}
        </view>
        <!--  <view class="clock-check-type text-light">
          WiFi/蓝牙：XXXX
        </view> -->
        <view class="clock-button-box">
          <view class="clock-button">
            <view class="text padding-tb-xs">
              下班打卡
            </view>
            <view class="text-lg">
              {{curTime||''}}
            </view>
          </view>
        </view>
        <view class="text-light ">
          请在18：00之后进行打卡
        </view>
      </view>
      <view class="clock-card" v-if="curType === '外出打卡'">
        <view class="map-box">
          <map style="width: 100%; height: 100%;filter: blur(3px);" :latitude="locationInfo.latitude"
            :longitude="locationInfo.longitude" v-if="locationInfo"></map>
        </view>
        <view class="map-box-top">
          <view class="text-bold padding-bottom-xs" v-if="addressName">
            <!-- 你已在打卡范围内 -->
            {{addressName}}
          </view>
          <view class="store-name text-light" v-if="addressName">
            当前定位
          </view>
          <view class="clock-check-type text-light">
            <!-- WiFi/蓝牙：XXXX -->
          </view>

          <view class="clock-button-box green wrap">
            <view class="clock-button">
              <view class="text padding-tb-xs">
                外出打卡
              </view>
              <view class="text-lg">
                {{curTime||''}}
              </view>
            </view>
          </view>
          <view class="text-light ">
            请在18：00之后进行打卡
          </view>
        </view>
      </view>
      <view class="record-card">
        <view class="cu-timeline">
          <!-- <view class="cu-time">06-17</view> -->
          <view class="cu-item text-blue">
            <view class="content bg-white shadow-blur">
              <view class="text-lg">
                打卡时间 08:59
              </view>
              <view class="text-gray">
                <text class="cuIcon-locationfill margin-right-xs"></text>
                <text>打卡地点</text>
              </view>
            </view>
          </view>
          <view class="cu-item text-blue ">
            <view class="content bg-white shadow-blur">
              <view class="text-lg">
                打卡时间 08:59
              </view>
              <view class="text-gray">
                <text class="cuIcon-locationfill margin-right-xs"></text>
                <text>打卡地点</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  let interVal = null
  let dayjs = require('@/static/js/dayjs.min.js')
  //#ifdef MP-WEIXIN
  let QQMapWX = require('@/static/js/qqmap-wx-jssdk.min.js');
  let qqmapsdk;
  //#endif
  // 引入腾讯地图SDK核心类

  export default {
    data() {
      return {
        curType: '上下班打卡',
        clockTypes: [{
            name: '上下班打卡'
          },
          {
            name: '外出打卡'
          }
        ],
        curTime: "",
        locationInfo: null,
        locationTip: "", //提示信息
        addressInfo: null,
        clockLocation: null, //打卡地点信息
        locationNo: 'DD202203031915590003',
        disableClockIn: false,
        distance: '', //定位距离打卡点的距离
      }
    },
    computed: {
      distanceClockIn() {
        return this.clockLocation?.clock_in_scope
      },
      addressName() {
        if (this.addressInfo && Array.isArray(this.addressInfo.markers) && this.addressInfo.markers.length > 0 && this
          .addressInfo?.markers?. [0]?.title) {
          return this.addressInfo?.markers?. [0]?.title
        } else {
          return ''
        }
      }
    },
    methods: {
      countDistance() {
        let clockLat = this.clockLocation?.location_latitude
        let clockLng = this.clockLocation?.location_longitude
        let userLat = this.locationInfo?.latitude
        let userLng = this.locationInfo?.longitude
        if (!this.distanceClockIn) {
          this.locationTip = '打卡点范围设置错误，无法进行打卡'
          this.disableClockIn = true
          return
        }
        if (!clockLat || !clockLng) {
          this.locationTip = '打卡点经纬度设置错误，无法进行打卡'
          this.disableClockIn = true
          return
        }
        if (!userLat || !userLng) {
          this.locationTip = '用户位置信息错误'
          this.disableClockIn = true
          return
        }
        this.distance = this.getDistance(userLat, userLng, clockLat, clockLng)
        if (this.distance <= this.distanceClockIn) {
          this.locationTip = '您已在打卡范围内'
          this.disableClockIn = false
        }
        if (this.distance > this.distanceClockIn) {
          this.locationTip = '您不在打卡范围内'
          this.disableClockIn = true
        }
      },
      //计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
      getDistance(lat1, lng1, lat2, lng2) {
        //进行经纬度转换为距离的计算
        function rad(d) {
          return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
        }
        const radLat1 = rad(lat1);
        const radLat2 = rad(lat2);
        const a = radLat1 - radLat2;
        const b = rad(lng1) - rad(lng2);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        console.log('s', s)
        // 输出为公里
        // s = Math.round(s * 10000) / 10000;
        // // 输出为米
        s = Math.round(s * 1000);
        s = s.toFixed(4);
        uni.showToast({
          title: `距离打卡点:${s }米`,
          icon: 'none'
        })
        return s;
      },
      async getClockLocation() {
        // 查找打卡点信息
        let serviceName = 'srvcorp_attend_office_location_select'
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            colName: 'location_no',
            ruleType: 'eq',
            value: this.locationNo
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const res = await this.$fetch('select', serviceName, req, 'corp')
        if (res.success && res.data?. [0]) {
          this.clockLocation = res.data[0]
        }
      },
      changeType(e) {
        this.curType = e
      },
      getLocation() {
        let _this = this
        return new Promise((resolve, reject) => {
          uni.getLocation({
            type: 'wgs84',
            isHighAccuracy: true, //开启高精度
            success: (res) => {
              console.log('当前位置的经度：' + res.longitude);
              console.log('当前位置的纬度：' + res.latitude);
              this.locationInfo = res
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                // location: '34.21439,108.91062',
                //位置坐标，默认获取当前位置，非必须参数
                /**
                 * 
                 //Object格式
                  location: {
                    latitude: 39.984060,
                    longitude: 116.307520
                  },
                */
                /**
                 *
                 //String格式
                  location: '39.984060,116.307520',
                */
                // get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认),非必须参数
                success: function(res1) { //成功后的回调
                  console.log(res1);
                  var result = res1.result;
                  var mks = [];
                  /**
                   *  当get_poi为1时，检索当前位置或者location周边poi数据并在地图显示，可根据需求是否使用
                   *
                      for (var i = 0; i < result.pois.length; i++) {
                      mks.push({ // 获取返回结果，放到mks数组中
                          title: result.pois[i].title,
                          id: result.pois[i].id,
                          latitude: result.pois[i].location.lat,
                          longitude: result.pois[i].location.lng,
                          iconPath: './resources/placeholder.png', //图标路径
                          width: 20,
                          height: 20
                      })
                      }
                  *
                  **/
                  //当get_poi为0时或者为不填默认值时，检索目标位置，按需使用
                  mks.push({ // 获取返回结果，放到mks数组中
                    title: result.address,
                    id: 0,
                    latitude: result.location.lat,
                    longitude: result.location.lng,
                    iconPath: './resources/placeholder.png', //图标路径
                    width: 20,
                    height: 20,
                    callout: { //在markers上展示地址名称，根据需求是否需要
                      content: result.address,
                      color: '#000',
                      display: 'ALWAYS'
                    }
                  });
                  _this.addressInfo = { //设置markers属性和地图位置poi，将结果在地图展示
                    markers: mks,
                    poi: {
                      latitude: result.location.lat,
                      longitude: result.location.lng
                    }
                  }
                  resolve()
                },
                fail: function(error) {
                  console.error(error);
                },
                complete: function(res) {
                  console.log(res);
                }
              })
            }
          });
        })

      },
    },
    async onLoad() {
      interVal = setInterval(() => {
        this.curTime = dayjs().format("HH:mm")
      }, 1000)

      //#ifdef MP-WEIXIN
      qqmapsdk = new QQMapWX({
        key: 'MHABZ-CHOKF-YBFJZ-JJYCQ-OSI75-YABF4'
      });
      await this.getLocation()
      //#endif
      await this.getClockLocation()
      await this.countDistance()
    },
    onUnload() {
      clearInterval(interVal)
      interVal = null
    }
  }
</script>

<style lang="scss">
  .clock-in-wrap {
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--window-top));
    background-color: #F8F8FA;

    .text-light {
      font-size: 12px;
      font-family: 苹方-简;
      font-weight: normal;
      color: #ADAEBB;
      padding: 2px;
    }

    .top-bar {
      height: 50px;
      display: flex;
      align-items: center;
      background-color: #fff;

      .top-item {
        flex: 1;
        line-height: 50px;
        text-align: center;
        color: #ADAEBB;

        &.active {
          position: relative;
          color: #313131;

          &::after {
            content: '';
            width: 0;
            height: 0;
            border: 6px solid transparent;
            border-bottom-color: #0088FE;
            position: absolute;
            bottom: 0;
            left: calc(50% - 3px);
          }
        }
      }
    }

    .clock-content {
      padding: 10px 15px;
      flex: 1;
      overflow-y: scroll;

      .top-card {
        background-color: #fff;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-wrap: wrap;

        .title {
          width: 100%;
          padding-bottom: 10px;
          font-weight: bold;
        }

        .card {
          background-color: #F8F8FA;
          padding: 10px;
          margin-right: 10px;
          border-radius: 10px;
          color: #474849;
          flex: 1;

          &:last-child {
            margin-right: 0;
          }

          .text {
            padding: 3px 0;
            display: flex;
            justify-content: space-between;

            .text-lg {
              font-size: 16px;
            }
          }
        }
      }
    }

    .clock-card {
      background-color: #fff;
      border-radius: 10px;
      margin-top: 10px;
      text-align: center;
      overflow: hidden;
      padding: 10px 0;
      position: relative;
      min-height: 300px;

      .store-icon {
        width: 50px;
        height: 50px;
        margin: 0 auto;
      }

      .map-box-top {
        width: 100%;
        height: 300px;
        position: absolute;
        top: 0;
        left: 0;
        background-image: linear-gradient(transparent, #fff);
        z-index: 100;
        padding: 40px 0 10px;

        .clock-button-box {
          // padding: 10px;
        }

        .text-light {
          color: #333;
        }
      }

      .map-box {
        height: 340px;
        width: 100%;
        position: absolute;
        padding: 20px;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        // filter: blur(5px);
      }

      .clock-button-box {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        padding: 30px;

        &.green {
          .clock-button {
            background-color: #D0F2DD;
            color: #00B043;

            &::after {
              border-color: rgba($color: #D0F2DD, $alpha: 0.8);
            }

            &::before {
              border-color: rgba($color: #00B043, $alpha: 0.1);
            }
          }
        }

        .clock-button {
          width: 120px;
          height: 120px;
          background-color: #CEE1FF;
          border-radius: 50%;
          color: #0088FE;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          &::after {
            content: '';
            width: 140px;
            height: 140px;
            border-radius: 50%;
            border: 1px solid rgba($color: #CEE1FF, $alpha: 0.8);
            position: absolute;
            top: calc(50% - 70px);
            left: calc(50% - 70px);
          }

          &::before {
            content: '';
            width: 160px;
            height: 160px;
            border-radius: 50%;
            border: 1px solid rgba($color: #6DA5F7, $alpha: 0.1);
            position: absolute;
            top: calc(50% - 80px);
            left: calc(50% - 80px);
          }

          .text {
            font-size: 16px;
          }

          .text-lg {
            font-size: 28px;
            line-height: 34px;
          }
        }
      }
    }

    .record-card {
      margin-top: 10px;

      .cu-timeline {
        background-color: transparent;

        &>.cu-item {
          padding: 0px 0px 10px 40px;

          .content {
            border-radius: 10px;
          }

          &::before {
            background-color: transparent;
            top: calc(50% - 12.5px);
            left: 8px;
          }

          &::after {
            top: calc(50% + 12.5px);
            height: calc(100% - 25px);
            left: 20px;
          }

          &:last-child::after {
            content: none;
          }
        }
      }

    }
  }
</style>
