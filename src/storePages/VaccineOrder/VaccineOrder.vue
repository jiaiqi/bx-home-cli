<template>
	<view class="page-wrap">
		<view class="vaccine-list">
			<view class="vaccine-item animation-slide-top " v-for="(item,index) in list" :key="item.id">
				<view class="badge-ribbon" v-if="item.app_time_start&&item.app_time_end">
					<image class="icon"
						src="data:image/png;base64,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"
						mode="aspectFit"></image>
					<text class="tips">{{item.app_state}}</text>
				</view>

				<view class="badge-ribbon notice need-set"
					v-else-if="!subscsribeStatus&&!item.app_time_start&&!item.app_time_end">
					<text class="tips">已预约,未设置通知提醒</text>
				</view>
				<view class="badge-ribbon notice"
					v-else-if="subscsribeStatus&&!item.app_time_start&&!item.app_time_end">
					<text class="tips">通知已预约</text>
				</view>
				<view class="content">
					<view class="name">
						<view class="label">
							{{item.appoint_name}}
							<!-- 		<view class="badge" v-if="item.app_state">
								<text v-if="item.app_state==='待到场'&&item.app_time_start&&item.app_time_end">
									{{item.app_state|| ''}}
								</text>
								<text v-else>
									通知已预约
								</text>
							</view> -->
						</view>
					</view>
					<view class="desc ">
						<view class="desc-item">
							<view class="desc-value" v-if="item.app_time_start&&item.app_time_end">
								{{dayjs(item.app_date).format('MM-DD')}}
                {{dayjs(item.app_date+' '+ item.app_time_start).format("hh:mm")}}-
                {{dayjs(item.app_date+' '+ item.app_time_end).format("hh:mm")}}
							</view>
						</view>
					</view>
					<view class="subscribe-detail">
						<view class="subscribe-item">
							<view class="label">
								就诊人
							</view>
							<view class="value">
								{{item.customer_name}}
							</view>
						</view>
						<view class="subscribe-item" v-if="item.customer_birth_day">
							<view class="label">
								出生日期
							</view>
							<view class="value">
								{{item.customer_birth_day||''}}
							</view>
						</view>
						<view class="subscribe-item" v-if="item.customer_phone">
							<view class="label">
								电话
							</view>
							<view class="value">
								{{item.customer_phone}}
							</view>
						</view>
						<view class="subscribe-item" v-if="item.appoint_remark">
							<view class="label">
								预约说明
							</view>
							<view class="value">
								{{item.appoint_remark}}
							</view>
						</view>
						<view class="subscribe-item" v-if="item.create_time">
							<view class="label">
								提交时间
							</view>
							<view class="value">
								{{item.create_time}}
							</view>
						</view>
					</view>
					<view class="button-box">
						<button class="cu-btn bg-red margin-right" @click="cancel(item)"><text
								class="cuIcon-delete margin-right-xs"></text> 取消预约</button>
						<button type="primary" class="cu-btn bg-blue" @click="edit(item)"><text
								class="cuIcon-edit margin-right-xs"></text>修改信息</button>
					</view>
				</view>
			</view>
		</view>
		<view class="cu-modal bottom-modal" :class="{show:modalName==='editInfo'}" @click="hideModal">
			<view class="cu-dialog" @click.stop>
				<view class="edit-modal">
					<view class="cu-form-group">
						<view class="title"><text class="text-red">*</text>就诊人</view>
						<input placeholder="输入就诊人姓名" name="input" v-model="curVac.customer_name"></input>
					</view>
					<view class="cu-form-group">
						<view class="title"><text class="text-red">*</text>出生日期</view>
						<picker mode="date" v-model="curVac.customer_birth_day" start="1950-09-01" end="2030-09-01"
							@change="DateChange">
							<view class="picker date">
								{{curVac.customer_birth_day||'请选择就诊人出生日期'}}
							</view>
						</picker>
					</view>
					<view class="cu-form-group">
						<view class="title"><text class="text-red">*</text>手机号码</view>
						<input placeholder="输入手机号码" name="input" v-model="curVac.customer_phone"></input>
						<view class="cu-capsule radius">
							<view class='cu-tag bg-blue '>
								+86
							</view>
							<view class="cu-tag line-blue">
								中国大陆
							</view>
						</view>
					</view>
					<view class="cu-form-group">
						<view class="title">预约说明</view>
						<textarea v-model="curVac.appoint_remark" placeholder="预约说明" class="remark" />
					</view>
					<button type="primary" class="cu-btn bg-blue margin-bottom" @click="update"><text
							class="cuIcon-post margin-right-xs"></text> 保存</button>
				</view>
			</view>
		</view>
		<view class="" style="margin-top:30vh;"
			v-if="loadStatus==='noMore'&&vaccineList.length===0&&noticeList.length===0">
			<u-empty text="数据为空" mode="list">
			</u-empty>
		</view>
	</view>
</template>

<script>
import {
  mapState
} from 'vuex'
export default {
  data () {
    return {
      current: 0, //当前tab
      noticeList: [], // 通知列表
      vaccineList: [], //疫苗列表
      vaccineRecord: [], //疫苗预约记录
      modalName: '',
      curVac: {},
      loadStatus: 'more',
      noticePage: {
        rownumber: 10,
        total: 0,
        pageNo: 1
      },
      page: {
        rownumber: 10,
        total: 0,
        pageNo: 1
      }
    }
  },
  computed: {
    ...mapState({
      subscsribeStatus: state => state.app.subscsribeStatus,
      userInfo: state => state.user.userInfo,

    }),
    list () {
      return [ ...this.vaccineList, ...this.noticeList ]
      if (this.current === 0) {
        return this.vaccineList
      } else {
        return this.noticeList
      }
    }
  },
  methods: {
    DateChange (e) {
      this.curVac.customer_birth_day = e.detail.value
    },
    hideModal () {
      this.modalName = ''
    },
    update () {
      let req = [ {
        "serviceName": "srvhealth_store_vaccination_appoint_record_update",
        "condition": [ {
          "colName": "id",
          "ruleType": "eq",
          "value": this.curVac.id
        } ],
        "data": [ this.curVac ]
      } ]
      if (!this.curVac.customer_name || !this.curVac.customer_phone || !this.curVac.customer_birth_day) {
        uni.showToast({
          title: '请确认预约信息是否填写完整',
          icon: 'none'
        })
        return
      }
      let self = this
      uni.showModal({
        title: '提示',
        content: '确定提交修改内容?',
        success (res) {
          if (res.confirm) {
            if (self.curVac && self.curVac.id) {
              self.$fetch('operate', 'srvhealth_store_vaccination_appoint_record_update', req,
                'health').then(res => {
                  if (res.success) {
                    self.modalName = ''
                    self.curVac = {}
                    uni.showToast({
                      title: '修改成功'
                    })
                    uni.startPullDownRefresh({

                    })
                  }
                })
            }
          }
        }
      })

    },
    cancel (e) {
      // 取消预约
      // const serviceName = 'srvhealth_store_vaccination_appoint_record_result_update'
      const serviceName = 'srvhealth_store_vaccination_appoint_record_result_cancel_update'
      let req = [ {
        "serviceName": serviceName,
        "condition": [ {
          "colName": "id",
          "ruleType": "eq",
          "value": e.id
        } ],
        "data": [ {
          "app_state": "取消"
        } ]
      } ]
      let self = this
      uni.showModal({
        title: '确定取消预约?',
        content: '',
        success (res) {
          if (res.confirm) {
            self.$fetch('operate', serviceName, req,
              'health').then(result => {
                if (result.success) {
                  uni.showToast({
                    title: '已成功取消预约'
                  })
                  uni.startPullDownRefresh()
                }
              })
          }
        }
      })
    },
    edit (e) {
      // 修改预约信息
      this.modalName = 'editInfo'
      this.curVac = this.deepClone(e)
    },
    async getVaccineRecord (type = 'refresh', tabIndex) {
      // 查找已预约疫苗列表
      let req = {
        "condition": [ {
          "colName": "person_no",
          "ruleType": "eq",
          "value": this.userInfo.no
        },
        {
          "colName": "app_state",
          "ruleType": "ne",
          "value": '取消'
        } ],
        order: [ {
          "colName": "app_date",
          "orderType": "asc" // asc升序  desc降序
        } ],
        "page": {
          "pageNo": this.page.pageNo,
          "rownumber": this.page.rownumber
        },
      }
      if (tabIndex && tabIndex === 1) {
        req.condition.push({
          "colName": "app_date",
          "ruleType": "isnull",
          "value": ''
        })
      } else {
        req.condition.push({
          "colName": "app_date",
          "ruleType": "ge",
          "value": this.formateDate()
        })
      }
      let res = await this.$fetch('select', 'srvhealth_store_vaccination_appoint_record_select', req,
        'health')
      if (res.success) {
        if (tabIndex && tabIndex === 1) {
          if (type === 'refresh') {
            this.noticePage.pageNo = 1
            this.noticeList = res.data
          } else {
            this.noticeList = [ ...this.noticeList, ...res.data ]
          }
          if (res.page) {
            if (res.page.total > res.page.rownumber * res.page.pageNo) {
              this.loadStatus = 'more'
              this.noticePage.pageNo++
            } else {
              this.loadStatus = 'noMore'
            }
          }
        } else {
          if (type === 'refresh') {
            this.page.pageNo = 1
            this.vaccineList = res.data
          } else {
            this.vaccineList = [ ...this.vaccineList, ...res.data ]
          }
          if (res.page) {
            if (res.page.total > res.page.rownumber * res.page.pageNo) {
              this.loadStatus = 'more'
              this.page.pageNo++
            } else {
              this.loadStatus = 'noMore'
            }
          }
        }
      }
    },
    toSetNotice () {
      uni.showModal({
        title: '提示',
        content: '请关注百想助理公众号，否则无法接收到消息通知，是否跳转到公众号关注引导页面？',
        success (res) {
          if (res.confirm) {
            uni.navigateTo({
              url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent('https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ')}`
            })
          }
        }
      })
    }
  },
  onReachBottom () {
    if (this.loadStatus !== 'noMore') {
      this.getVaccineRecord('loadmore')
    }
  },
  onPullDownRefresh () {
    this.getVaccineRecord('refresh', 0).then(_ => {
      this.getVaccineRecord('refresh', 1).then(_ => {
        uni.stopPullDownRefresh()
      })
    })
  },
  mounted () {
    setTimeout(() => {
      if (!this.subscsribeStatus) {
        this.toSetNotice()
      }
    }, 1000)
  },
  created () {
    uni.$on('vaccineSuccess', () => {
      this.getVaccineRecord('refresh', 0).then(_ => {
        this.getVaccineRecord('refresh', 1).then(_ => {
          uni.stopPullDownRefresh()
        })
      })
    })
    this.getVaccineRecord('refresh', 0)
    this.getVaccineRecord('refresh', 1)
  }
}
</script>

<style lang="scss" scoped>
@import "@/colorui/animation.css";

.page-wrap {
  position: relative;
  min-height: calc(100vh - var(--window-bottom) - var(--window-top));

  // padding-top: 40px;
  .tabs {
    height: 40px;
    position: absolute;
    top: 0;
    width: 100%;
  }
}

.button-box {
  display: flex;
  justify-content: center;
  margin-top: 10px;

  .cu-btn {
    color: #fff;

    &.bg-blue {
      background-color: #0bc99d;
    }
  }
}

.vaccine-list {
  display: flex;
  flex-direction: column;
  padding: 40rpx 20rpx;
  overflow: auto;

  .vaccine-item {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    display: flex;
    background-color: #fff;
    border-radius: 5px;
    padding: 20rpx 20rpx 0;
    margin-bottom: 20px;
    position: relative;

    .content {
      width: 100%;
    }

    .name {
      font-weight: bold;
      font-size: 16px;
      padding: 10rpx 20rpx;
      display: flex;

      .label {
        position: relative;

        .badge {
          position: absolute;
          top: 0;
          right: -120rpx;
          font-size: 12px;
          background-color: #f1f1f1;
          padding: 5rpx 10rpx;
          border-radius: 20px;
        }
      }
    }

    .badge-ribbon {
      position: absolute;
      right: 0;
      top: -15px;
      width: 100px;
      height: 100px;
      z-index: 2;
      transform: rotate(65deg);

      .image {
        width: 100px;
        height: 100px;
      }

      .icon {
        width: 100px;
        height: 100px;
      }

      .tips {
        color: #0bc99d;
        position: absolute;
        right: 43px;
        top: 41px;
        font-size: 12px;
        transform: rotate(337deg) scale(1.2);
      }

      // &::after {
      // 	color: #0bc99d;
      // 	content: '已预约';
      // 	position: absolute;
      // 	right: 43px;
      // 	top: 41px;
      // 	font-size: 12px;
      // 	transform: rotate(337deg) scale(1.2);
      // }

      &.notice {
        .tips {
          width: 75px;
          color: #ffaa00;
          // content: '【到货通知】';
          right: 20px;
          top: 40px;
          // content: '';
          transform: rotate(295deg) scale(1);
        }

        // &::after {
        // 	width: 75px;
        // 	color: #ffaa00;
        // 	content: '【到货通知】';
        // 	right: 20px;
        // 	top: 40px;
        // 	// content: '';
        // 	transform: rotate(295deg) scale(1);
        // }

        &.need-set {
          
          // &::after {
          //   width: 125px;
          //   right: 20px;
          //   color: #ff5500;
          //   content: "【未设置通知提醒】";
          // }
        }
      }

      &.no-sub {
        &::after {
          color: #ccc;
          content: "待预约";
          position: absolute;
        }
      }
    }

    .desc {
      padding: 10rpx 20rpx;
      border-radius: 10rpx;
      overflow: hidden;
      display: flex;

      & + .desc {
        margin-top: 10rpx;
      }

      .desc-item {
        display: flex;

        & + .desc-item {
          margin-left: 10px;
        }

        .desc-value {
          font-weight: bold;
          color: #666;
        }

        .desc-label {
          margin-right: 10px;
          font-size: 12px;
        }
      }
    }

    .subscribe-detail {
      padding: 0 20rpx;
      border-radius: 10rpx;
      display: flex;
      flex-wrap: wrap;

      .subscribe-item {
        min-width: 50%;
        display: flex;
        padding: 4px;
        align-items: center;
        text-align: justify;
        text-align-last: justify;
        text-justify: inter-ideograph;

        .label {
          margin-right: 10px;
          font-size: 12px;
          min-width: 50px;
          display: inline-block;
        }

        .value {
          font-weight: bold;
        }
      }
    }
  }
}

.cu-modal {
  z-index: 20;
}

.edit-modal {
  background-color: #fff;

  .margin-bottom {
    margin-bottom: 50rpx;
  }

  .cu-form-group {
    text-align: left;

    .picker {
      text-align: left;
    }
  }

  .title {
    min-width: 150rpx;
    text-align: justify;
    text-align-last: justify;
  }

  .remark {
    width: 100%;
    padding: 20rpx 40rpx;
    background-color: #f1f1f1;
    border-radius: 10rpx;
  }
}
</style>
