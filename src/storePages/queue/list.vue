<template>
  <view class="queue-list-view">
    <view class="add-btn" v-if="type === 'manage'">
      <text
        class="cuIcon-qrcode"
        style="font-size: 30px"
        @click="toPreviewImage(qrcodePath)"
        v-if="qrcodePath"
      ></text>
      <text v-else></text>
      <button class="cu-btn bg-blue" type="primary" @click="addQueue">
        创建队列
      </button>
    </view>
    <view
      class="queue-item"
      v-for="item in queue"
      :key="item.id"
      @click="toQueue(item)"
    >
      <view class="que-header">
        <view class="que-name">
          {{ item.queue_name || "" }}
        </view>
        <view
          class="que-status"
          :class="{
            'text-green':
              item.queue_status === '进行中' || item.queue_status === '开放中',
            'text-red': item.queue_status === '已结束',
            'text-yellow': item.queue_status === '待开始',
          }"
        >
          {{ item.queue_status || "-" }}
        </view>
      </view>
      <view style="display: flex; justify-content: space-between">
        <view class="que-date">
          <text>
            {{ dayjs().format("YYYY-MM-DD") }}
          </text>
          <text> （周{{ localDay }}，今日） </text>
        </view>
        <view class="footer-item" style="display: flex; align-items: center">
          <view class="label">等待人数： </view>
          <view
            class="value text-orange"
            style="font-size: 20px; font-weight: bold"
            >{{ item.wait_amount || " - " }}
          </view>
        </view>
      </view>
      <view class="que-footer">
        <view class="footer-item">
          <view class="label">当前叫号： </view>
          <view class="value text-blue big-font"
            >{{ item.cur_no || " - " }}
          </view>
        </view>
        <view
          class="footer-item"
          v-if="type !== 'manage' && item.queue_status === '进行中'"
        >
          <button class="cu-btn bg-blue shadow-blur">开始排队</button>
        </view>
        <view v-if="type === 'manage'" class="change-status footer-item">
          <button
            class="cu-btn bg-blue light round"
            @click.stop="showSettingModal(item)"
          >
            <text class="cuIcon-settings margin-right-xs"></text>设置
          </button>
          <!-- <text class="label">更改状态：</text> -->
          <!-- <view class="buttons">
            <button
              class="cu-btn bg-red sm round margin-right-xs"
              @click.stop="changeStatus(item, '已结束')"
              v-if="item.queue_status !== '已结束'"
            >
              已结束
            </button>
            <button
              class="cu-btn bg-green sm round margin-right-xs"
              @click.stop="changeStatus(item, '进行中')"
              v-if="item.queue_status !== '进行中'"
            >
              进行中
            </button>
            <button
              class="cu-btn bg-blue sm round margin-right-xs"
              @click.stop="changeStatus(item, '待开始')"
              v-if="item.queue_status !== '待开始'"
            >
              待开始
            </button>
          </view> -->
        </view>
      </view>
    </view>
    <uni-load-more
      :status="loadStatus"
      v-if="
        loadStatus !== 'noMore' ||
        (loadStatus === 'noMore' && queue.length !== 0)
      "
    >
    </uni-load-more>
    <view
      class=""
      style="margin-top: 30vh"
      v-if="loadStatus === 'noMore' && queue.length === 0"
    >
      <u-empty text="未找到今日排队数据" mode="list"> </u-empty>
    </view>
    <view
      class="cu-modal"
      @click="hideModal"
      :class="{ show: modalName === 'settingModal' }"
    >
      <view class="cu-dialog" style="width:60%" @click.stop="">
        <view class="label font-bold margin-tb-xs text-bold">更改状态</view>
        <view class="buttons" v-if="curQue">
          <button
            class="cu-btn bg-red light round margin-right-xs lg"
            @click.stop="changeStatus(curQue, '已结束')"
            v-if="curQue.queue_status !== '已结束'"
          >
            已结束
          </button>
          <button
            class="cu-btn bg-green light round margin-right-xs lg"
            @click.stop="changeStatus(curQue, '进行中')"
            v-if="curQue.queue_status !== '进行中'"
          >
            进行中
          </button>
          <button
            class="cu-btn bg-blue light round margin-right-xs lg"
            @click.stop="changeStatus(curQue, '待开始')"
            v-if="curQue.queue_status !== '待开始'"
          >
            待开始
          </button>
        </view>
      </view>
    </view>
    <view class="qr-code-box" v-if="qrCodeText">
      <uni-qrcode
        cid="qrcodeCanvas"
        :text="qrCodeText"
        :size="codeSize"
        class="qrcode-canvas"
        foregroundColor="#333"
        makeOnLoad
        @makeComplete="qrcodeCanvasComplete"
        v-if="qrCodeText"
      ></uni-qrcode>
      <image
        :src="qrcodePath"
        class="qr-code-image"
        mode="aspectFit"
        v-if="qrcodePath"
        @click="toPreviewImage(qrcodePath)"
      ></image>
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo,
    }),
    qrCodeText() {
      if (this.store_no) {
        return `https://wx2.100xsys.cn/pages/specific/queue/list?store_no=${this.store_no}`;
      }
    },
    localDay() {
      let day = new Date();
      day = day.getDay();
      let result = "";
      switch (day) {
        case 0:
          result = "日";
          break;
        case 1:
          result = "一";
          break;
        case 2:
          result = "二";
          break;
        case 3:
          result = "三";
          break;
        case 4:
          result = "四";
          break;
        case 5:
          result = "五";
          break;
        case 6:
          result = "六";
          break;
      }
      return result;
    },
  },
  data() {
    return {
      codeSize: uni.upx2px(750),
      qrcodePath: "", //图片路径
      type: "", // manage
      store_no: "",
      queue: [],
      curQue: null,
      loadStatus: "more",
      modalName: "",
    };
  },
  methods: {
    hideModal() {
      this.curQue = null;
      this.modalName = "";
    },
    showSettingModal(e) {
      this.curQue = e;
      this.modalName = "settingModal";
    },
    qrcodeCanvasComplete(e) {
      this.qrcodePath = e;
    },
    async changeStatus(e, status) {
      const req = [
        {
          serviceName: "srvhealth_store_queue_up_cfg_update",
          condition: [{ colName: "id", ruleType: "eq", value: e.id }],
          data: [{ queue_status: status }],
        },
      ];
      const confirm = await new Promise((resolve) => {
        uni.showModal({
          title: "提示",
          content: "是否将状态更改为" + status,
          showCancel: true,
          success: ({ confirm, cancel }) => {
            if (confirm) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
        });
      });
      if (!!confirm) {
        let res = await this.$fetch(
          "operate",
          "srvhealth_store_queue_up_cfg_update",
          req,
          "health"
        );
        if (res.success) {
          this.getTodayQue();
        }
      }
    },
    addQueue() {
      let fieldsCond = [
        {
          column: "store_no",
          value: this.store_no,
          display: false,
        },
        {
          column: "user_account",
          value: this.userInfo.userno,
          display: false,
        },
        {
          column: "person_no",
          value: this.userInfo.no,
          display: false,
        },
        {
          column: "person_name",
          value: this.userInfo.name,
          display: false,
        },
        {
          column: "queue_date",
          value: this.dayjs().format("YYYY-MM-DD"),
          display: true,
        },
        {
          column: "queue_status",
          value: "进行中",
          display: true,
        },
        {
          column: "cur_no",
          display: false,
        },
        {
          column: "last_no",
          display: false,
        },
      ];
      let url =
        "/publicPages/formPage/formPage?serviceName=srvhealth_store_queue_up_cfg_add&type=add&addType=onwer&fieldsCond=" +
        decodeURIComponent(JSON.stringify(fieldsCond));
      uni.navigateTo({ url });
    },
    toQueue(e) {
      if (
        this.type !== "manage" &&
        e.queue_no &&
        this.store_no &&
        (e.queue_status === "进行中" || e.queue_status === "开放中")
      ) {
        uni.navigateTo({
          url: `./queue?store_no=${this.store_no}&queue_no=${e.queue_no}`,
        });
      } else if (e.queue_no && this.store_no && this.type === "manage") {
        uni.navigateTo({
          url: `../queueManage/queueManage?store_no=${this.store_no}&queue_no=${e.queue_no}`,
        });
      } else if (e && e.queue_status) {
        uni.showToast({
          title: `该排队目前状态为${e.queue_status}，不可进行排队`,
          icon: "none",
          mask: true,
        });
      }
    },
    async getTodayQue() {
      // 查询当日排队信息
      let req = {
        serviceName: "srvhealth_store_queue_up_cfg_select",
        colNames: ["*"],
        condition: [
          { colName: "store_no", ruleType: "eq", value: this.store_no },
          // { colName: 'queue_status', ruleType: 'in', value: '待开始,进行中' },
          { colName: "queue_date", ruleType: 'like', value: this.dayjs().format("YYYY-MM-DD") }
        ],
        page: { pageNo: 1, rownumber: 20 },
      };
      if (this.type != "manage") {
        req.condition.push({
          colName: "queue_status",
          ruleType: "in",
          value: "待开始,进行中",
        });
      }
      this.loadStatus = "loading";
      let res = await this.$fetch(
        "select",
        "srvhealth_store_queue_up_cfg_select",
        req,
        "health"
      );
      if (res.success) {
        this.queue = res.data.map((item) => {
          item.cur_no = isNaN(Number(item.cur_no)) ? 0 : item.cur_no;
          return item;
        });
        if (res.page.pageNo * res.page.rownumber >= res.page.total) {
          this.loadStatus = "noMore";
        } else {
          this.loadStatus = "more";
        }
      }
    },
  },
  onPullDownRefresh() {
    this.getTodayQue();
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1500);
  },
  onShow() {
    if (this.store_no) {
      this.getTodayQue();
    }
  },
  onLoad(option) {
    if (option.type) {
      this.type = option.type;
    }
    if (option.store_no) {
      this.store_no = option.store_no;
      this.getTodayQue();
    }
  },
};
</script>

<style lang="scss" scoped>
.add-btn {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10rpx;
  margin-bottom: 10rpx;
  border-bottom: #f1f1f1 1px solid;
}
.queue-list-view {
  padding: 20rpx;
  background-color: #F8F8F8;
  .queue-item {
    padding: 20rpx;
    background-color: #f9f9f9;
    border-bottom: 1px #f1f1f1 solid;
    .que-header {
      display: flex;
      justify-content: space-between;
      .que-status {
        // font-weight: bold;
        font-size: 18px;
      }
      .que-name {
        font-weight: bold;
        font-size: 18px;
      }
    }
    .que-date {
      padding: 20rpx 0;
      color: #888;
    }
    .change-status {
      display: flex;
      padding: 10rpx 0;
      // justify-content: space-between;
      .label {
        // flex: 1;
      }
      .cu-btn {
        margin-right: 0;
      }
    }
    .que-footer {
      display: flex;
      justify-content: space-between;
      .footer-item {
        // margin-left: 20px;
        display: flex;
        align-items: center;
        .value {
          font-size: 30px;
          font-weight: bold;
          &.big-font {
            // font-size: 40px;
          }
        }
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
}
.qr-code-box {
  background-color: #fff;
  // width: 700rpx;
  // height: 700rpx;
  // margin: 0 auto 50px;
  // padding: 10px;
  position: fixed;
  top: -999999px;
  // .qrcode-canvas {
  //   position: fixed;
  //   top: -999999px;
  // }
  // .qr-code-image {
  //   width: 680rpx;
  //   height: 680rpx;
  // }
}
.buttons{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
   .cu-btn {
      width: 80%;
      margin-top: 20px;
      letter-spacing: 2px;
      &:last-child {
        margin-bottom: 20rpx;
      }
    }
}
</style>