<template>
  <view class="page-wrap">
    <cu-custom :bgColor="'black'" :isBack="true" @onBackHome="onBackHome">
      <block slot="content">团购信息</block>
    </cu-custom>
    <view class="content-box" v-if="tgInfo">
      <view class="top">
        <view class="tz-info">
          <view class="left">
            <image class="profile-image" :src="getImagePath(tgInfo.profile_url)" mode="" v-if="tgInfo.profile_url">
            </image>
            <text class="margin-left-xs">{{tgInfo.person_name||''}}</text>
          </view>
          <view class=" text-gray">
            社区名称:{{tgInfo.community_name||''}}
          </view>
        </view>
        <view class="tg-info">
          <view class="top text-bold">
            <view class="">
              <text class="bg-red round cu-tag margin-right" v-if="tgInfo.act_type==='拼团'&&tgInfo.number">
                {{tgInfo.number||'-'}}人团
              </text>
              <text class="">
                {{tgInfo.name||''}}
              </text>
            </view>
            <view class="text-red" v-if="tgInfo.act_type==='拼团'">
              {{tgInfo.state||''}}
            </view>
          </view>
          <view class="date-tiem" v-if="tgInfo&&tgInfo.act_type&&tgInfo.act_type!=='团购'&&tgInfo.activity_statr_datetime&&tgInfo.activity_end_datetime&&tgInfo.act_type!=='团购'">
            团购起止时间：{{handleDateRange(tgInfo.activity_statr_datetime,tgInfo.activity_end_datetime)}}
          </view>
          <view class="describe" v-if="tgInfo.describe">
            团购描述: {{html2text(tgInfo.describe)}}
          </view>
          <view class="member" v-if="joinMemberAmount">
            <view class="left">
              <view class="cu-avatar-group">
                <view class="cu-avatar round " v-for="(item, index) in avatarLists" :key="index"
                  :style="[{ backgroundImage: 'url(' + item.avatarUrl + ')', 'z-index': avatarLists.length - index }]">
                </view>
              </view>
            </view>
            <view class="right text-gray">
              已参团{{joinMemberAmount||'0'}}人
            </view>
          </view>
          <view class="count-down" v-if="tgInfo.act_type&&tgInfo.act_type!=='团购'&&joinMemberAmount&&tgInfo.number&&joinMemberAmount>=tgInfo.number">
            已成团
          </view>
          <view class="count-down" v-if="tgInfo.act_type&&tgInfo.act_type!=='团购'&&countDown===0">
            当前团购已结束
          </view>
          <view class="count-down" v-else-if="tgInfo&&tgInfo.act_type&&tgInfo.act_type!=='团购'&&countDown!==0&&countDown!=='团购已经结束'&&countDown!=='团购还未开始'">
            距离团购结束还有 <text class="text-red margin-left-xs text-bold">{{countDown||''}}</text>
          </view>
          <view class="count-down text-red" v-else-if="tgInfo.act_type&&tgInfo.act_type!=='团购'&&countDown">
            {{countDown}}
          </view>
        </view>
      </view>
      <view class="sub-title">
        <text class="main" v-if="type==='default'">选择需要的商品</text>
        <text class="main" v-if="type==='view'">商品列表</text>
        <text class="main" v-if="type==='detail'">下单商品</text>
      </view>
      <view class="goods-list">
        <view class="goods-item" v-for=" (item,index) in goodsList" :key="index">
          <view class="check-box" v-if="disabledCancel!==true&&type==='default'&&countDown!==0&&countDown!=='团购已经结束'"
            @click="changeCheck(index)">
            <radio :checked="item.checked" /><text></text>
          </view>
          <image :src="getImagePath(item.goods_img)" class="goods-image" mode="aspectFill"  @click.stop="toDetail(item)"></image>
          <view class="goods-info">
            <view class="" @click.stop="toDetail(item)">
              商品名称:{{item.goods_name||''}}
            </view>
            <view class="text-sm " style="display: flex;justify-content: space-between;align-items: center;"  @click.stop="toDetail(item)">
              <!--    <view class="">
                规格：100g
              </view> -->
              <view class="" v-if="(type==='view'||type==='detail')">
                <text class="text-red margin-right-xs " v-if="item.group_price">￥{{item.group_price}}</text>
                <text class="text-gray line-through text-sm " v-if="item.price"><text v-if="item.group_price">原价</text>
                  ￥{{item.price}}</text>
              </view>
              <view class="text-sm text-gray" v-if="type==='view'&&item.boughtNum">
                已团{{item.boughtNum||'-'}}件
              </view>
              <view class="text-lg text-gray" v-else-if="item.amount&&type!=='default'&&type!=='view'">
                x {{item.amount}}
              </view>
            </view>
            <view class="price" v-if="type==='default'"  @click.stop="toDetail(item)">
              <view class="">
                <text class="text-red margin-right-xs" v-if="item.group_price">￥{{item.group_price}}</text>
                <text class="text-gray line-through text-sm " v-if="item.price"><text
                    v-if="item.group_price">原价</text>￥{{item.price}}</text>
              </view>
              <view class="number-box " v-if="countDown!==0&&countDown!=='团购已经结束'&&item.amount" @click.stop="">
                <u-number-box :value="item.amount" :min="1" :index="index" @change="changeAmount($event,index)">
                </u-number-box>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="tg-form" v-if="tgInfo && (type==='view'||type==='detail')">
        <view class="cu-form-group ">
          <view class="title">收货方式</view>
          <input :placeholder="''" name="input" :value="tgInfo.goods_way" :disabled="true"></input>
        </view>
        <view class="cu-form-group ">
          <view class="title">团长收货地址</view>
          <view class="input" style="flex: 1;">
            {{tgInfo.address_name||tgInfo.address_str|| tgInfo.addr_str||tgInfo.address_no}}
          </view>
          <!-- <input :placeholder="''" name="input"
            :value="tgInfo.address_name||tgInfo.address_str|| tgInfo.addr_str||tgInfo.address_no"
            :disabled="true"></input> -->
        </view>
      </view>

      <view class="tg-form"
        v-if="tgInfo&&tgInfo.act_type&&tgInfo.act_type!=='团购'&&tgInfo&&tgInfo.activity_statr_datetime&&tgInfo.activity_end_datetime && (type==='view'||type==='detail')">
        <view class="cu-form-group ">
          <view class="title">开团时间</view>
          <input :placeholder="''" name="input" :value="tgInfo.activity_statr_datetime" :disabled="true"></input>
        </view>
        <view class="cu-form-group ">
          <view class="title">结束时间</view>
          <input :placeholder="''" name="input" :value="tgInfo.activity_end_datetime" :disabled="true"></input>
        </view>
      </view>

      <view class="button-box" v-if="type==='view'&&tgInfo.state!=='已结束' && countDown!=='团购已经结束'">
        <button class="cu-btn bg-red" open-type="share">立即分享</button>
      </view>
    </view>

    <view class="handler-bar" v-if="type==='default' && countDown!=='团购已经结束'">
      <view class="left">
        合计 <text class="text-red text-bold">￥{{totalPrice||'0'}}</text>
      </view>
      <view class="right">
        <button class="cu-btn round" @click="toOrder" :disabled="totalPrice==0">立即下单</button>
      </view>
    </view>
  </view>
</template>

<script>
  let coundDownTimer = null
  export default {
    data() {
      return {
        type: "default", // manage -管理员查看页面，view -团长查看页面,default -消费者进行团购的页面，detail-消费者团购成功后查看的页面
        no: '',
        id: "",
        tgInfo: null,
        goodsList: [],
        haveBoughtGoods: [], // 消费者点详情进来, 已购商品
        joinMember: [],
        joinMemberAmount: 0,
        countDown: '',
        wxMchId: "", //自定义商户号
        storeNo: "",
        orderNo: "", //消费者点详情进来 传入订单编号
        shareStoreUser: null, // 分享人店铺用户信息
        share_store_user_no: '', //分享人店铺用户编号
        disabledCancel:false, //禁止选择 只能每种商品都下单 最低一件
      }
    },
    computed: {
      avatarLists() {
        if (Array.isArray(this.joinMember)) {
          return this.joinMember.map(item => {
            item.avatarUrl = this.getImagePath(item.profile_url || item.user_image)
            return item
          })
        }
      },
      totalPrice() {
        let total = this.goodsList.reduce((res, cur) => {
          if (cur.checked && cur.amount > 0) {
            res += cur.group_price * cur.amount
          }
          return res
        }, 0)
        if (total) {
          total = Number(total.toFixed(2))
        }
        return total || '0'
      }
    },
    methods: {
      toDetail(e){
        // 团购商品 进入商品详情 禁用
        if(e?.goods_no){
          uni.navigateTo({
            url:`/storePages/GoodsDetail/GoodsDetail?goods_no=${e.goods_no}&disabled=true`
          })
        }
      },
      onBackHome() {
        let url = `/storePages/home/home?store_no=S0000000000`
        if (this.storeNo) {
          url = `/storePages/home/home?store_no=${this.storeNo}`
        }
        uni.reLaunch({
          url
        })
      },
      toOrder() {
        // 跳转到下单页面
        let list = this.goodsList.filter(item => item.checked === true && item.amount);
        list = this.deepClone(list)
        if (list.length > 0) {
          list = list.map(goodsInfo => {
            goodsInfo.car_num = goodsInfo.amount
            goodsInfo.price = goodsInfo.group_price
            goodsInfo.goods_image = goodsInfo.goods_img
            return goodsInfo
          })
          this.$store.commit('SET_STORE_CART', {
            storeInfo: this.storeInfo,
            store_no: this.storeInfo?.store_no,
            list: list
          });
          let url =
            `/storePages/placeOrder/placeOrder?store_no=${this.storeInfo?.store_no}&goodsWay=${this.tgInfo.goods_way}&tgNo=${this.tgInfo.regimental_dumpling_no}`
          let orderType = this.getOrderType(list)
          url += `&order_type=${orderType}&show_params_config=${this.getOrderShowParams(orderType)}&delivery_type=快递`
          // if (this.tgInfo?.goods_way) {
          //   let delivery_type = this.tgInfo?.goods_way === '快递' ? '快递' : '自提'
          //   url += `&delivery_type=${delivery_type}`
          // }
          if (this.wxMchId) {
            url += `&wxMchId=${this.wxMchId}`
          }
          uni.navigateTo({
            url
          });
        }

      },
      changeCheck(index) {
        let item = this.goodsList[index]
        this.goodsList[index].checked = !item.checked
        if(this.disabledCancel==true){
          this.goodsList[index].checked = true
        }
        if (item.amount <= 0) {
          item.amount = 1
          // this.goodsList[index].amount = 1
          this.$set(this.goodsList, index, item)
        }
      },
      changeAmount(e, index) {
        this.goodsList[index].amount = e.value
        if (e.value === 0) {
          this.goodsList[e.index].checked = false
        } else {
          this.goodsList[e.index].checked = true
        }
      },
      getCountDown() {
        // 团购倒计时
        if(this.tgInfo?.audit_state&&this.tgInfo?.audit_state!=='审核通过'){
          return '团购已经结束'
        }
        if(this.tgInfo?.state==='已结束'){
          return '团购已经结束'
        }
        let start = this.tgInfo?.activity_statr_datetime
        let end = this.tgInfo?.activity_end_datetime
        if (start && end) {
          start = start.replace(/-/g, '/')
          end = end.replace(/-/g, '/')
          let seconds = new Date(end) - new Date()
          seconds = seconds / 1000
          let startFromNow = new Date(start) - new Date()
          let endFromNow = new Date(end) - new Date()
          if (startFromNow > 0) {
            return '团购还未开始'
          }
          if (endFromNow <= 0) {
            return '团购已经结束'
          }
          if (seconds < 0) {
            return false
          }
          let day = parseInt(seconds / (3600 * 24))
          let hour = parseInt(seconds % (3600 * 24) / 3600)
          let time = parseInt(seconds % (3600 * 24) % 3600 / 60)
          let second = parseInt(seconds % (3600 * 24) % 3600 % 60)
          if (hour && hour < 10) {
            hour = `0${hour}`
          } else if (!hour) {
            hour = '00'
          }
          if (time && time < 10) {
            time = `0${time}`
          } else if (!time) {
            time = '00'
          }
          if (second && second < 10) {
            second = `0${second}`
          } else if (!second) {
            second = '00'
          }
          if (day) {
            return `${day}天${hour}:${time}:${second}`
          }
          return `${hour}:${time}:${second}`
        } else {
          return false
        }
      },
      handleDateRange(start, end, operator = '-', includeTime = false) {
        if (start && end) {
          if (includeTime == false) {
            // 不包含时分
            return `${ this.dayjs(start).format("YYYY年MM月DD日")}${operator}${ this.dayjs(end).format("MM月DD日")}`
          } else {
            return `${ this.dayjs(start).format("YYYY年MM月DD日HH时mm分")} ${operator} ${ this.dayjs(end).format("MM月DD日HH时mm分")}`
          }

        } else {
          return '-'
        }
      },
      getJoinMember() {
        // 查找参团人数
        const req = {
          "serviceName": "srvhealth_store_order_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "regimental_dumpling_no",
            "ruleType": "like",
            "value": this.tgInfo?.regimental_dumpling_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
        }
        const url = this.getServiceUrl('health', 'srvhealth_store_order_select', 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state == 'SUCCESS') {
            this.joinMember = res.data.data;
            this.joinMemberAmount = res.data?.page?.total
          }
        })
      },
      getTgInfo() {
        let service = 'srvhealth_store_regimental_dumpling_select'
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            colName: 'regimental_dumpling_no',
            ruleType: 'eq',
            value: this.no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        if (!this.no && this.id) {
          req.condition = [{
            colName: 'id',
            ruleType: 'eq',
            value: this.id
          }]
        }
        let url = this.getServiceUrl('health', service, 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.tgInfo = res.data.data[0]
            if(this.tgInfo?.state==='已结束'){
              uni.showModal({
                title:'提示',
                content:'当前团购已结束',
                showCancel:false
              })
            }
            this.getJoinMember()
            if (this.tgInfo?.dumpling_no) {
              this.getTgGoods()
            }
            clearInterval(coundDownTimer);
            coundDownTimer = setInterval(() => {
              let countDown = this.getCountDown();
              if (!countDown) {
                clearInterval(coundDownTimer)
              } else {
                this.countDown = countDown
              }
            }, 1000)
          }
        })
      },
      async getGoodsBoughtNum() {
        // 查找团购商品已团次数
        const req = {
          "serviceName": "srvhealth_store_order_goods_num_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "regimental_dumpling_no",
              "ruleType": "eq",
              "value": this.tgInfo?.regimental_dumpling_no
            },
            {
              "colName": "dumpling_no",
              "ruleType": "eq",
              "value": this.tgInfo?.dumpling_no
            }
          ],
          "page": {
            "rownumber": 100,
            "pageNo": 1
          },
        }
        const url = this.getServiceUrl('health', 'srvhealth_store_order_goods_num_select', 'select');
        const res = await this.$http.post(url, req)
        if (res?.data?.state === 'SUCCESS') {
          this.goodsList = this.goodsList.map(item => {
            let goods = res.data.data.find(e => item.goods_no === e.goods_no)
            if (goods?.goods_amount) {
              item.boughtNum = goods?.goods_amount
            }
            return item
          })
        }
      },
      getTgGoods() {
        // 查找团购商品列表
        const req = {
          "serviceName": "srvhealth_store_dumpling_goods_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "dumpling_no",
            "ruleType": "eq",
            "value": this.tgInfo?.dumpling_no
          }],
          "page": {
            "rownumber": 100,
            "pageNo": 1
          },
        }
        let url = this.getServiceUrl('health', 'srvhealth_store_dumpling_goods_select', 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            let data = res.data.data.map(item => {
              item.amount = item.amount || 1
              item.checked = false
              if(this.disabledCancel){
                item.checked = true
              }
              return item
            })

            this.goodsList = data
            this.getGoodsBoughtNum()
            if (this.orderNo) {
              this.getBoughtGoods()
            }
          }
        })
      },

      getBoughtGoods() {
        // 查找订单中的商品列表
        const req = {
          "serviceName": "srvhealth_store_order_goods_detail_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "order_no",
            "ruleType": "eq",
            "value": this.orderNo
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 50
          }
        }
        let url = this.getServiceUrl('health', 'srvhealth_store_order_goods_detail_select', 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            this.goodsList = this.goodsList.map(item => {
              let goods = res.data.data.find(e => e.goods_no === item.goods_no)
              item.amount = goods?.goods_amount || 1
              return item
            })
          }
        })
      },
    },
    onShareAppMessage() {
      let pages = getCurrentPages();
      let path = pages[pages.length - 1]?.$page?.fullPath;
      path += '&from=share';
      path += '&type=default';
      if (this.userInfo?.userno) {
        path += `&invite_user_no=${this.userInfo?.userno}`;
      }
      if (this.storeNo) {
        path += `&store_no=${this.storeNo}`;
      } else if (this.storeInfo?.store_no) {
        path += `&store_no=${this.storeInfo?.store_no}`
      }else if(this.setStoreNo){
        path += `&store_no=${this.setStoreNo}`;
      }
      let title = `${this.tgInfo.name||'团购分享'}`;
      let imageUrl = '';

      if (this.storeInfo?.logo) {
        imageUrl = this.getImagePath(this.storeInfo.logo, true);
      }

      if (this.tgInfo?.wx_share_icon) {
        imageUrl = this.getImagePath(this.tgInfo.wx_share_icon, true);
      }
      console.log(path)
      this.saveSharerInfo(this.userInfo, path, 'appMessage');
      title = this.renderEmoji(title)
      return {
        imageUrl: imageUrl,
        title: title,
        path: path
      };
    },

    onUnload() {
      clearInterval(coundDownTimer)
    },

    async onLoad(option) {
      if(option.disabledCancel){
        this.disabledCancel = true
      }
      // #ifdef MP-WEIXIN
      await this.initApp(option)
      //#endif
      if (option.share_store_user_no) {
        this.share_store_user_no = option.share_store_user_no
      }

      if (option.orderNo) {
        this.orderNo = option.orderNo
        this.type = 'detail'
      }

      if (option.storeNo || option.store_no) {
        this.storeNo = option.storeNo || option.store_no
      }

      if (option.type) {
        this.type = option.type
      }

      if (option.id) {
        this.id = option.id;
        this.getTgInfo()
      }

      if (option.no) {
        this.no = option.no;
        this.getTgInfo()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @mixin flex-between-center {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  .text-gray {
    color: #747774;
  }

  .page-wrap {
    width: 100%;
    height: calc(100vh - var(--window-top) - var(--window-bottom));
    display: flex;
    flex-direction: column;

    .content-box {
      flex: 1;
      overflow: scroll;
      padding-bottom: 20px;

      .top {
        background-color: #fff;

        .tz-info {
          padding: 10px 20px;
          border-bottom: 1px solid #F1F1F1;
          @include flex-between-center;

          .left {
            @include flex-between-center;
          }

          .profile-image {
            width: 25px;
            height: 25px;
            border-radius: 50%;
          }
        }

        .tg-info {
          padding: 10px 20px;
          @include flex-between-center;

          .top {
            width: 100%;
            font-size: 16px;
            @include flex-between-center;
          }

          .date-tiem {
            width: 100%;
            padding: 5px 0;
          }

          .describe {
            width: 100%;
            padding: 0 0 5px;
          }

          .member {
            width: 100%;
            @include flex-between-center;
          }

          .count-down {
            width: 100%;
            text-align: center;
            background-color: #ffebea;
            border-radius: 5px;
            padding: 5px;
            margin-top: 10px;
            font-size: 12px;
          }
        }
      }

      .sub-title {
        padding: 10px;
        margin: 10px 10px 1px;
        background-color: #fff;
        border-radius: 5px 5px 0 0;

        .main {
          font-weight: bold;
          font-size: 16px;
        }
      }

      .goods-list {
        padding: 0 10px;

        .goods-item {
          display: flex;
          align-items: center;
          padding: 10px;
          padding-left: 5px;
          margin-bottom: 1px;
          // border-radius: 5px;
          background-color: #fff;

          .check-box {
            transform: scale(0.7);
          }

          .goods-image {
            width: 80px;
            height: 60px;
            border-radius: 5px;
            margin: 0 10px 0 5px;
          }

          .goods-info {
            flex: 1;

            .line-through {
              text-decoration: line-through;
            }

            .price {
              @include flex-between-center;

              .number-box {
                flex: 1;
                text-align: right;
              }
            }
          }

          // .number-box{
          //   display: flex;
          //   height: 60px;
          //   align-items: flex-end;
          // }
        }
      }

      .tg-form {
        margin: 10px;
        font-weight: bold;

        input {
          text-align: right;
        }
      }

      .button-box {
        margin-top: 30px;

        .cu-btn {
          width: 80%;
          border-radius: 30px;
          height: 40px;
          line-height: 40px;
        }
      }
    }

    .handler-bar {
      height: 50px;
      padding: 0 20px;
      background-color: #fff;
      @include flex-between-center;

      .right {
        display: flex;

        .cu-btn {
          background-color: #ff3a30;
          color: #fff;

        }
      }

    }
  }
</style>
