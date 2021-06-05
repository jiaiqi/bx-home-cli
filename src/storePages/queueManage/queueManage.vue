<template>
  <div class="queue-manage">
    <!-- <view class="cur-que-no" v-if="todayQue && todayQue.cur_no">
      <text
        >当前叫号：<text class="text-blue">{{ todayQue.cur_no }}</text></text
      >
      <view v-if="handlerStatus && currentTab === 0">
        <button
          type="primary"
          class="cu-btn round bg-green margin-right"
          @click="multiChangeStatus(handlerStatus)"
        >
          {{ handlerStatus }}
        </button>
        <button class="cu-btn round bg-gray" @click="multiHandler(null)">
          取消
        </button>
      </view>
      <text v-else></text>
      <button
        class="cu-btn round cuIcon-add"
        @click="showHandler"
        v-else-if="currentTab === 0"
      ></button>
    </view> -->

    <view class="button-box top padding-tb-sm" v-if="currentTab === 0">
      <view class="button-group">
        <view class="label"> 批量 </view>
        <view class="buttons">
          <button
           
            class="cu-btn  bg-blue"
            @click="multiHandler('叫号')"
          >
            叫号
          </button>
          <button
           
            class="cu-btn  bg-blue"
            @click="multiHandler('过号')"
          >
            过号
          </button>
          <button
           
            class="cu-btn  bg-blue"
            @click="multiHandler('完成')"
          >
            完成
          </button>
        </view>
        <view class="right" style="font-size: 30px">
          <text class="text-blue line-blue font-bold" style="font-size: 30px">{{
            todayQue.cur_no
          }}</text>
        </view>
      </view>
      <view class="button-group">
        <view class="label">快捷</view>
        <view class="buttons">
          <button
           
            class="cu-btn  bg-blue"
            @click="multiHandler('叫号', 5)"
          >
            叫号5
          </button>
          <button
           
            class="cu-btn  bg-blue"
            @click="multiHandler('叫号', 10)"
          >
            叫号10
          </button>
          <button
            class="cu-btn  bg-blue"
            @click="multiHandler('全部完成')"
          >
            全完成
          </button>
        </view>
        <view class="right">
          <button class="cu-btn  bg-green" type="primary" @click="showAddInfo">抽号</button>
        </view>
      </view>
    </view>

    <u-tabs
      :list="tabList"
      :is-scroll="false"
      :current="currentTab"
      :font-size="36"
      @change="changeTab"
    ></u-tabs>

    <view class="list-wrap">
      <view
        class="list-item"
        v-for="item in listData[currentTab]"
        :key="item.qr_no"
        :class="{'current-number':item.checked}"
        @click="changeCheckStatus(item)"
      >
        <!-- <view class="multi-select" v-if="isShowCheck(item.status)">
          <checkbox
            :value="item.id"
            :checked="item.checked"
            @click="changeCheckStatus(item)"
          />
        </view> -->
        <view>
          <text class="num margin-right" style="font-size:20px;">{{ item.seq }}</text>
        </view>
        <view>
          <image
            class="image"
            :src="getImagePath(item.profile_url)"
            mode="scaleToFill"
            v-if="item.profile_url"
            @click.stop="toPreviewImage(item.profile_url)"
          />
          <image
            class="image"
            v-else
            :src="require('@/static/man-profile.png')"
            mode="scaleToFill"
          />
        </view>
        <view
              style="
                flex: 1;
                margin-right: 20rpx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
              ><text class="title">
                {{ item.person_name || item.nick_name || "" }}</text
              >
              <text class="" v-if="item.sex">（{{ item.sex || "" }}）</text>
            </view>
            <view v-if="item.remark">
              <text
                style="font-size: 20px;margin-right:20rpx;"
                @click.stop="toQrcodeDetail(item)"
                v-if="
                  item.remark && item.remark.indexOf('工作人员帮忙抽号') !== -1
                "
                class="cuIcon-qrcode"
              ></text>
            </view>
            <view class="queue-status  margin-right" :class="{
              'text-blue':item.status==='排队中',
              'text-green':item.status==='叫号中',
              'text-orangen':item.status==='已过号',
              'text-cyan':item.status==='完成',


            }">{{ item.status }}</view>
            <view>
              <button class="cu-btn round bg-blue" @click.stop="showHandlerModal(item)">
              <text class=" cuIcon-add"></text>
              </button>
            </view>
             <!-- <view class="button-box" v-if="currentTab !== 1">
            <button
              class="cu-btn bg-cyan"
              @click="changeStatus(item, '叫号中')"
              v-if="
                currentTab !== 1 &&
                (item.status === '排队中' || item.status === '已过号')
              "
            >
              叫号
            </button>
            <button
              class="cu-btn bg-blue"
              @click="changeStatus(item, '完成')"
              v-if="currentTab !== 2 && item.status === '叫号中'"
            >
              完成
            </button>
            <button
              class="cu-btn bg-orange"
              v-if="
                currentTab !== 2 && currentTab !== 1 && item.status === '叫号中'
              "
              @click="changeStatus(item, '已过号')"
            >
              过号
            </button>
            <button
              class="cu-btn bg-orange"
              v-if="currentTab !== 0 && currentTab !== 1"
              @click="changeStatus(item, '排队中')"
            >
              排队
            </button>
          </view> -->
        <!-- <view style="flex: 1; overflow: hidden">
          <view class="top" @click="showInfo(item)">
            <view
              style="
                flex: 1;
                margin-right: 20rpx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
              ><text class="title">
                {{ item.person_name || item.nick_name || "" }}</text
              >
              <text class="" v-if="item.sex">（{{ item.sex || "" }}）</text>
            </view>
            <view v-if="item.remark">
              <text
                style="font-size: 20px"
                @click="toQrcodeDetail(item)"
                v-if="
                  item.remark && item.remark.indexOf('工作人员帮忙抽号') !== -1
                "
                class="cuIcon-qrcode"
              ></text>
            </view>
          </view>
          <view class="button-box" v-if="currentTab !== 1">
            <view class="queue-status text-blue">{{ item.status }}</view>
            <button
              class="cu-btn bg-cyan"
              @click="changeStatus(item, '叫号中')"
              v-if="
                currentTab !== 1 &&
                (item.status === '排队中' || item.status === '已过号')
              "
            >
              叫号
            </button>
            <button
              class="cu-btn bg-blue"
              @click="changeStatus(item, '完成')"
              v-if="currentTab !== 2 && item.status === '叫号中'"
            >
              完成
            </button>
            <button
              class="cu-btn bg-orange"
              v-if="
                currentTab !== 2 && currentTab !== 1 && item.status === '叫号中'
              "
              @click="changeStatus(item, '已过号')"
            >
              过号
            </button>
            <button
              class="cu-btn bg-orange"
              v-if="currentTab !== 0 && currentTab !== 1"
              @click="changeStatus(item, '排队中')"
            >
              排队
            </button>
          </view>
          <view class="button-box" v-if="currentTab == 1">
            <view class="queue-status text-blue">{{ item.status }}</view>
          </view> -->
        </view>
      </view>
      <uni-load-more
        :status="pages[currentTab].status"
        v-if="
          pages[currentTab].status !== 'noMore' ||
          (pages[currentTab].status === 'noMore' &&
            pages[currentTab].total !== 0)
        "
      >
      </uni-load-more>
      <view
        class=""
        style="margin-top: 30vh"
        v-if="
          pages[currentTab].status === 'noMore' && pages[currentTab].total === 0
        "
      >
        <u-empty text="暂无数据" mode="list"> </u-empty>
      </view>
    </view>
    <view
      class="cu-modal"
      :class="{ show: modalName === 'showAddInfo' }"
    >
      <view class="cu-dialog" @click.stop="" style="    vertical-align: inherit">
        <view >
          <view class="tips margin-top bg-white"> 请填写抽号用户身份信息 </view>
        <view class="user-info">
          <view class="cu-form-group">
            <view class="title"> <text class="text-red">*</text> 用户姓名</view>
            <input
              placeholder="输入用户姓名"
              name="input"
              v-model="personName"
            />
          </view>
          <view class="cu-form-group">
            <view class="title"> 身份证号</view>
            <input placeholder="输入身份证号" name="input" v-model="idcard" />
          </view>
          <view class="cu-form-group">
            <view class="title">手机号</view>
            <input placeholder="输入手机号" name="input" v-model="phone" />
          </view>
        </view>
        <view class="tips padding-top bg-white text-red">
          {{ modalTip || "" }}
        </view>
        <view class="button-box">
          <button class="cu-btn bg-gray lg" @click="hideModal">取消</button>
          <button class="cu-btn bg-blue lg" @click="createNumber">抽号</button>
        </view>
        </view>
      </view>
    </view>
    <view
      class="cu-modal"
      @click="hideModal"
      :class="{ show: modalName === 'handlerModal' }"
    >
      <view class="cu-dialog" style="width: 70%" @click.stop="">
        <view class="handler-modal">
          <view class="">批量操作</view>
          <button class="cu-btn bg-cyan" @click="multiHandler('叫号')">
            叫号(多选)
          </button>
          <button class="cu-btn bg-cyan" @click="multiHandler('叫号', 5)">
            叫号(x5)
          </button>
          <button class="cu-btn bg-cyan" @click="multiHandler('叫号', 10)">
            叫号(x10)
          </button>
          <button class="cu-btn bg-orange" @click="multiHandler('过号')">
            过号(多选)
          </button>
          <button class="cu-btn bg-blue" @click="multiHandler('完成')">
            完成(多选)
          </button>
          <button class="cu-btn bg-blue" @click="multiHandler('全部完成')">
            全部完成
          </button>
        </view>
      </view>
    </view>
    <view class="cu-modal" :class="{ show: modalName === 'curQueInfo' }" @click="hideModal">
      <view class="cu-dialog" style="width:70%">
        <view class="handler-modal2">
          <view class="button-box" v-if="curInfo&&curInfo.id">
            <!-- <view class="queue-status text-blue">{{ curInfo.status }}</view> -->
            <button
              class="cu-btn bg-cyan lg"
              @click="changeStatus(curInfo, '叫号中')"
              v-if="
                currentTab !== 1 &&
                (curInfo.status === '排队中' || curInfo.status === '已过号')
              "
            >
              叫号
            </button>
            <button
              class="cu-btn bg-blue lg"
              @click="changeStatus(curInfo, '完成')"
              v-if="currentTab !== 2 && curInfo.status === '叫号中'"
            >
              完成
            </button>
            <button
              class="cu-btn bg-orange lg"
              v-if="
                currentTab !== 2 && currentTab !== 1 && curInfo.status === '叫号中'
              "
              @click="changeStatus(curInfo, '已过号')"
            >
              过号
            </button>
            <button
              class="cu-btn bg-orange lg"
              v-if="currentTab !== 0 && currentTab !== 1"
              @click="changeStatus(curInfo, '排队中')"
            >
              排队
            </button>
            <button  v-if="
                 curInfo&& curInfo.remark
                "   class="cu-btn bg-blue lg"  @click="toQrcodeDetail(curInfo)">  <text
               
                v-if="
                  curInfo.remark && curInfo.remark.indexOf('工作人员帮忙抽号') !== -1
                "
                class="cuIcon-qrcode"
              ></text>查看排队</button>
          <button  class="cu-btn bg-blue lg" @click="showInfo(curInfo)">查看信息</button>
          </view>
        </view>
      </view>
    </view>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo,
    }),
  },
  data() {
    return {
      todayQue: null,
      store_no: "",
      queue_no: "",
      curPerson: {},
      currentTab: 0,
      pages: [
        {
          pageNo: 1,
          status: "more",
        },
        {
          pageNo: 1,
          status: "more",
        },
        {
          pageNo: 1,
          status: "more",
        },
      ],
      listData: [[], [], []],
      tabList: [
        // {
        //   name: "叫号中",
        //   count: 0
        // },
        {
          name: "排队中",
          count: 0,
        },
        {
          name: "完成",
          count: 0,
        },
        {
          name: "已过号",
          count: 0,
        },
      ],
      modalName: "",
      curInfo: null,
      personName: "",
      idcard: "",
      phone: "",
      modalTip: "",
      handlerStatus: "",
    };
  },
  methods: {
    isShowCheck(e) {
      return (
        this.handlerStatus &&
        e &&
        (((e == "排队中" || e === "已过号") && this.handlerStatus === "叫号") ||
          (e == "叫号中" &&
            (this.handlerStatus === "完成" || this.handlerStatus === "过号")))
      );
    },
    toQrcodeDetail(e) {
      if (e.qr_no) {
        uni.navigateTo({
          url: `/storePages/queue/queue?store_no=${this.store_no}&queue_no=${this.queue_no}&qr_no=${e.qr_no}`,
        });
      }
    },
    showAddInfo() {
      this.modalName = "showAddInfo";
    },
    hideModal() {
      this.curInfo = null;
      this.modalName = "";
    },
    async createNumber() {
      // 工作人员帮忙抽号
      if (this.personName && (this.idcard || this.phone)) {
        let req = [
          {
            serviceName: "srvhealth_store_queue_up_record_add",
            condition: [],
            data: [
              {
                person_name: this.personName,
                nick_name: this.personName,
                queue_no: this.queue_no,
                queue_name: this.todayQue.queue_name,
                status: "排队中",
                phone: this.phone,
                id_no: this.idcard,
                remark: `工作人员帮忙抽号，身份证号:${this.idcard}`,
              },
            ],
          },
        ];
        let res = await this.$fetch(
          "operate",
          "srvhealth_store_queue_up_record_add",
          req,
          "health"
        );
        if (res.success && res.data.length > 0) {
          const data = res.data[0];
          this.currentTab = 0;
          this.getList();
        }
        this.hideModal();
      } else {
        this.modalTip = "请确认信息是否填写完整,身份证号和手机号至少填一项";
      }
    },
    async callNext() {
      let list = this.listData[0];
      let index = 0;
      if (this.curPerson && this.curPerson.seq) {
        index = list.findIndex((item) => item.seq === this.curPerson.seq);
        index++;
      }
      if (list.length > index) {
        this.curPerson = list[index];
      } else {
        this.curPerson = null;
        uni.showModal({
          title: "提示",
          content: "后面已经没有人排队了",
          showCancel: false,
          confirmText: "知道了",
        });
        return;
      }
      if (this.listData[0].length > 0) {
        let req = [
          {
            serviceName: "srvhealth_store_queue_up_cfg_update",
            condition: [{ colName: "id", ruleType: "eq", value: "8" }],
            data: [{ cur_no: this.curPerson.seq }],
          },
        ];
        let res = await this.$fetch(
          "operate",
          "srvhealth_store_queue_up_cfg_update",
          req,
          "health"
        );
        if (res.success) {
        }
      }
      this.getList();
    },
    changeTab(index) {
      this.currentTab = index;
      this.pages[this.currentTab].pageNo = 1;
      this.getList();
    },
    async updateQueueInfo(no) {
      let req = [
        {
          serviceName: "srvhealth_store_queue_up_cfg_update",
          condition: [
            { colName: "id", ruleType: "eq", value: this.todayQue.id },
          ],
          data: [{ cur_no: no }],
        },
      ];
      if (no) {
        await this.$fetch(
          "operate",
          "srvhealth_store_queue_up_cfg_update",
          req,
          "health"
        );
      }
    },
    changeStatus(item, status) {
      let req = [
        {
          serviceName: "srvhealth_store_queue_up_record_update",
          condition: [{ colName: "id", ruleType: "eq", value: item.id }],
          data: [{ status: status }],
        },
      ];
      this.$fetch(
        "operate",
        "srvhealth_store_queue_up_record_update",
        req,
        "health"
      ).then((res) => {
        if (res.success) {
          uni.showToast({
            title: "操作成功",
            icon: "success",
            mask: true,
          });
          if (status === "叫号中" && res.data.length > 0 && res.data[0].seq) {
            // if (this?.todayQue?.id) {
            //   this.updateQueueInfo(res.data[ 0 ].seq)
            // }
          }
        } else if (res.msg) {
          uni.showToast({
            title: res.msg,
            icon: "none",
            mask: true,
          });
        }
        this.getList();
      });
    },
    async getTodayQue() {
      // 查询当前排队信息
      let req = {
        serviceName: "srvhealth_store_queue_up_cfg_select",
        colNames: ["*"],
        condition: [
          { colName: "store_no", ruleType: "eq", value: this.store_no },
          { colName: "queue_no", ruleType: "eq", value: this.queue_no },
          {
            colName: "queue_date",
            ruleType: "like",
            value: this.dayjs().format("YYYY-MM-DD"),
          },
        ],
        page: { pageNo: 1, rownumber: 1 },
      };
      let res = await this.$fetch(
        "select",
        "srvhealth_store_queue_up_cfg_select",
        req,
        "health"
      );
      if (res.success && res.data.length > 0) {
        this.todayQue = res.data[0];
        uni.setNavigationBarTitle({ title: `${this.todayQue.queue_name}` });
        this.getList();
        if (res.data[0].cur_no) {
          this.curPerson = await this.getCurPerson(res.data[0].cur_no);
        }
        this.tabList = this.tabList.map((item, index) => {
          if (item.name === "叫号中") {
            item.count = this.todayQue.call_amount;
            this.$set(this.tabList, index, item);
          } else if (item.name === "排队中") {
            item.count = this.todayQue.wait_amount;
            this.$set(this.tabList, index, item);
          } else if (item.name === "完成") {
            item.count = this.todayQue.finish_amount;
            this.$set(this.tabList, index, item);
          } else if (item.name === "已过号") {
            item.count = this.todayQue.absent_amount;
            this.$set(this.tabList, index, item);
          }
          return item;
        });
      }
    },
    async getCurPerson(no) {
      let req = {
        serviceName: "srvhealth_store_queue_up_record_select",
        colNames: ["*"],
        condition: [
          {
            colName: "queue_no",
            ruleType: "eq",
            value: this.todayQue.queue_no,
          },
          { colName: "seq", ruleType: "eq", value: no },
        ],
        page: { pageNo: this.pages[this.currentTab].pageNo, rownumber: 30 },
      };
      let res = await this.$fetch(
        "select",
        "srvhealth_store_queue_up_record_select",
        req,
        "health"
      );
      if (res.success && res.data.length > 0) {
        return res.data[0];
      }
    },
    async getList(type = "refresh", index) {
      let current = this.currentTab;
      if (index || index === 0) {
        current = index;
      }
      let req = {
        serviceName: "srvhealth_store_queue_up_record_select",
        colNames: ["*"],
        condition: [
          {
            colName: "queue_no",
            ruleType: "eq",
            value: this.todayQue.queue_no,
          },
          {
            colName: "status",
            ruleType: "eq",
            value: this.tabList[current].name,
          },
        ],
        page: { pageNo: this.pages[current].pageNo, rownumber: 30 },
      };
      if (this.tabList[current].name === "排队中") {
        req.condition[1] = {
          colName: "status",
          ruleType: "in",
          value: "叫号中,排队中",
        };
      }
      this.pages[current].status = "loading";
      let res = await this.$fetch(
        "select",
        "srvhealth_store_queue_up_record_select",
        req,
        "health"
      );

      if (res.success) {
        res.data = res.data.map((item) => {
          item.checked = false;
          return item;
        });
        let data =
          type === "loadmore"
            ? [...this.listData[current], ...res.data]
            : res.data;
        this.$set(this.listData, current, data);
        if (res.page.total > res.page.pageNo * res.page.rownumber) {
          this.pages[current].status = "more";
        } else {
          this.pages[current].status = "noMore";
        }
        this.pages[current].total = res.page.total;
        // this.tabList[ current ].count = res.page.total
      }
    },
    multiHandler(e, num = null) {
      let toast = null;
      let text = num ? e + num : e;
      switch (text) {
        case "全部完成":
        case "完成":
        case "过号":
          toast =
            this.listData[0].filter((item) => item.status === "叫号中")
              .length === 0
              ? "没有状态为叫号中的人员"
              : null;
          break;
        case "叫号":
        case "叫号5":
        case "叫号10":
          toast =
            this.listData[0].filter((item) => item.status === "排队中")
              .length === 0
              ? "没有状态为排队中的人员"
              : null;
          break;
      }
      if (toast) {
        uni.showToast({
          title: toast,
          icon: "none",
          mask: true,
        });
        this.hideModal();
        return;
      }
      debugger;
      if (e !== "全部完成") {
        this.handlerStatus = e;
        if (num) {
          this.handlerStatus = "叫号";

          this.multiChangeStatus("叫号", num);
        } else {
          this.multiChangeStatus(e);
        }
        if (e === null) {
          this.currentTab = 0;
          this.pages[this.currentTab].pageNo = 1;
          this.getList();
        }
      } else {
        this.multiChangeStatus("all");
      }
      this.hideModal();
    },
    changeCheckStatus(e) {
      this.listData[0].forEach((item, index) => {
        if (item.id === e.id) {
          item.checked = !item.checked;
          this.$set(this.listData[0], index, item);
        }
      });
    },
    async multiChangeStatus(e, num) {
      let req = [];
      let ids = null;
      debugger;

      switch (e) {
        case "all": // 全部完成
          req[0] = {
            serviceName: "srvhealth_store_queue_up_record_update",
            condition: [
              { colName: "queue_no", ruleType: "eq", value: this.queue_no },
              { colName: "status", ruleType: "eq", value: "叫号中" },
            ],
            data: [{ status: "完成" }],
          };
          break;
        case "完成": //
          ids = this.listData[0]
            .filter((item) => item.checked === true && item.status === "叫号中")
            .map((item) => item.id)
            .toString();
          req[0] = {
            serviceName: "srvhealth_store_queue_up_record_update",
            condition: [
              { colName: "queue_no", ruleType: "eq", value: this.queue_no },
              { colName: "id", ruleType: "in", value: ids },
            ],
            data: [{ status: "完成" }],
          };
          if (!ids) {
            uni.showToast({
              title: "选中数据没有处于叫号中状态的",
              icon: "none",
              duration: 3000,
              mask: true,
            });
            return;
          }
          break;
        case "叫号": //
          ids = this.listData[0]
            .filter((item) => item.checked === true && item.status === "排队中")
            .map((item) => item.id)
            .toString();
          debugger;
          if (num) {
            ids = this.listData[0]
              .filter((item) => item.status === "排队中")
              .slice(0, num)
              .map((item) => item.id)
              .toString();
          }
          if (!ids) {
            uni.showToast({
              title: "选中数据没有处于排队中状态的",
              icon: "none",
              duration: 3000,

              mask: true,
            });
            return;
          }
          debugger;
          req[0] = {
            serviceName: "srvhealth_store_queue_up_record_update",
            condition: [
              { colName: "queue_no", ruleType: "eq", value: this.queue_no },
              { colName: "id", ruleType: "in", value: ids },
            ],
            data: [{ status: "叫号中" }],
          };
          break;
        case "过号": //
          ids = this.listData[0]
            .filter((item) => item.checked === true && item.status === "叫号中")
            .map((item) => item.id)
            .toString();
          req[0] = {
            serviceName: "srvhealth_store_queue_up_record_update",
            condition: [
              { colName: "queue_no", ruleType: "eq", value: this.queue_no },
              { colName: "id", ruleType: "in", value: ids },
            ],
            data: [{ status: "已过号" }],
          };
          if (!ids) {
            uni.showToast({
              title: "选中数据没有处于叫号中状态的",
              duration: 3000,
              icon: "none",
              mask: true,
            });
            return;
          }
          break;
      }
      let res = await this.$fetch(
        "operate",
        "srvhealth_store_queue_up_record_update",
        req,
        "health"
      );
      this.handlerStatus = null;
      if (res.success) {
        uni.showToast({
          title: "操作成功",
          icon: "success",
          mask: true,
        });
        this.currentTab = 0;
        this.pages[this.currentTab].pageNo = 1;
        this.getList();
        this.getTodayQue();
      }
    },
    showHandler() {
      this.modalName = "handlerModal";
    },
    showHandlerModal(e) {
      this.curInfo = e;
      this.modalName = "curQueInfo";
    },
    showInfo(e) {
      // this.curInfo = e
      // this.modalName = 'curQueInfo'
      uni.showModal({
        // title: '用户信息',
        title: `姓名:${e.person_name || e.nick_name}\n${
          e.phone ? "\r\n,手机号：" + e.phone : ""
        }\n${e.id_no ? "\r\n,身份证号：" + e.id_no : ""}`,
        content: "",
        // content: `姓名:${e.person_name || e.nick_name}\n${e.phone ? '\r\n,手机号：' + e.phone : ''}\n${e.id_no ? '\r\n,身份证号：' + e.id_no : ''}`,
        showCancel: false,
        confirmText: "知道了",
      });
    },
  },
  onLoad(option) {
    if (option.store_no && option.queue_no) {
      this.store_no = option.store_no;
      this.queue_no = option.queue_no;
      this.getTodayQue();
    }
  },
  onPullDownRefresh() {
    this.pages.forEach((item) => (item.pageNo = 1));
    this.getTodayQue();
    uni.stopPullDownRefresh();
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom() {
    if (this.pages[this.currentTab].status === "more") {
      this.pages[this.currentTab].pageNo++;
      this.getList("loadmore", this.currentTab);
    }
  },
};
</script>

<style scoped lang="scss">
.queue-manage {
  .cur-que-no {
    width: 100%;
    text-align: center;
    padding: 20rpx 0;
    margin: 0 30rpx;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f1f1f1;
    .cuIcon-add {
      font-size: 30px;
    }
    .text-blue {
      font-size: 30px;
      font-weight: bold;
    }
  }
  .button-box.top {
    // justify-content: space-around;
    justify-content: flex-start;
    border-bottom: 1px solid #f1f1f1;
    border-top: 1px solid #f1f1f1;
    flex: 1;
    .button-group {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      flex: 1;
      margin-right: 30rpx;
      .right {
        flex: 1;
        text-align: right;
      }
      .buttons {
        // flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-around;
        .cu-btn {
          // min-width: 120rpx;
          min-height: 80rpx;
          font-size: 32rpx;
          font-weight: bold;
        }
      }
    }
    .label {
      margin-right: 10rpx;
    }
    .cu-btn {
      margin-left: 10rpx;
    }
  }
}
.call-name {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx;
}
.list-wrap {
  min-height: calc(100vh - var(--window-top));
  padding: 0 20rpx;
  margin-top: 20rpx;
}
.list-item {
  padding: 10rpx;
  border-radius: 20rpx;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  margin-bottom: 10rpx;
  align-items: center;
  &.current-number {
    border: 1px solid #0bc99d;
  }
  .multi-select {
    display: flex;
    align-items: center;
    margin-right: 20rpx;
  }
  .image {
    width: 80rpx;
    height: 80rpx;
    margin-right: 20rpx;
    border-radius: 10rpx;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .num {
      font-size: 30px;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
    }
  }
  .button-box {
    margin: 0;
    margin-top: 20rpx;
    display: flex;
    justify-content: flex-end;
    // justify-content: center;
    .queue-status {
      flex: 1;
      text-align: left;
      // font-size: 18px;
    }
    .cu-btn {
      margin-right: 10rpx;
      // min-width: 25%;
      height: 50rpx;
    }
  }
}
.button-box {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10rpx;
  margin: 0 20rpx 10rpx;
  // border-bottom: #f1f1f1 1px solid;
}
.cu-dialog {
  .button-box {
    background-color: #fff;
    padding: 20rpx 20rpx 40rpx;
    justify-content: space-around;
    margin: 0;
    .cu-btn {
      width: 40%;
    }
  }
}
.handler-modal2 {
  .button-box {
    display: flex;
    flex-direction: column;
    .cu-btn {
      width: 80%;
      margin-top: 20px;
      letter-spacing: 2px;
      &:last-child {
        margin-bottom: 20rpx;
      }
    }
  }
}
.handler-modal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 20rpx;
  .cu-btn {
    width: 80%;
    margin-top: 20rpx;
    letter-spacing: 2px;
    &:last-child {
      margin-bottom: 20rpx;
    }
  }
}
</style>
