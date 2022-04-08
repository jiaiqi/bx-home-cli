<template>
  <view class="menu-list" :style="[calcStyle]" v-if="buttons&&buttons.length>0">
    <view class="template-1" v-if="pageItem.button_style==='模板1'&&buttonsIcon.length>=4">
      <view class="left">
        <image lazy-load :src="getImagePath(buttonsIcon[0].icon,true)" mode="aspectFit"></image>
      </view>
      <view class="right">
        <view class="top">
          <image lazy-load :src="getImagePath(buttonsIcon[1].icon,true)" mode="aspectFit"></image>
        </view>
        <view class="bottom">
          <view class="bottom-item">
            <image lazy-load :src="getImagePath(buttonsIcon[2].icon,true)" mode="aspectFit"></image>
          </view>
          <view class="bottom-item">
            <image lazy-load :src="getImagePath(buttonsIcon[3].icon,true)" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>
    <view class="pictuer-button" v-else-if="pageItem.button_style==='仅图片'">
      <view class="picture-item" :style="[getImgButtonStyle(item)]" v-for="item in buttonsIcon" @click="toPages(item)">
      </view>
      <!--      <image :src="getImagePath(item.icon,true)" mode="aspectFit" :style="{
						width: item.imgWidth + 'px',
						height: item.imgHeight + 'px'
					}" v-for="item in buttonsIcon" @click="toPages(item)"></image> -->
    </view>
    <view class="menu-list-box" v-else-if="pageItem.button_style === 'list'">
      <view class="menu-list-item" v-for="(item, index) in buttons" :key="index" @click="toPages(item)">
        <view class="left">
          <button :open-type="item.openType" v-if="item.openType" @getphonenumber="getPhoneNumber"
            class="cu-btn bg-white text">{{item.button_label}}</button>
          <text v-else>{{item.button_label||''}}</text>
        </view>
        <view class="right text-gray">
          <view class="cu-tag badge" v-if="item.num===true"></view>
          <view class="cu-tag badge" v-else-if="item.num">{{
				  item.num || ""
				}}</view>
          <view class="cu-tag badge-left" v-if="item.unbacknum">{{
				  item.unbacknum || ""
				}}</view>
          <text class="cuIcon-right"></text>
        </view>
      </view>
    </view>
    <view class="menu-list-box" v-else-if="pageItem.button_style === 'info-list'">
      <view class="menu-list-item" v-for="(item, index) in buttons" :key="index" @click="toPages(item)">
        <view class="left">
          <image lazy-load class="image" :src="getImagePath(item.icon,true)" mode="aspectFit">
          </image>
          <!--   <button :open-type="item.openType" v-if="item.openType" @getphonenumber="getPhoneNumber"
            class="cu-btn bg-white text">{{item.button_label}}</button>
          <text v-else>{{item.button_label||''}}</text> -->
        </view>
        <view class="right">
          <view class="title">
            {{item.button_label||''}}
          </view>
          <view class="intro">
            {{item.describe||''}}
          </view>
        </view>
      </view>
    </view>
    <swiper class="swiper" :class="{
        'rectangle-dot': pageItem.button_style !== 'grid',
        'grid-style': pageItem.button_style === 'grid',
        'list-style': pageItem.button_style === 'list',
      }" :style="{ height: swiperHeight + 'px' }" indicator-active-color="#00aaff" indicator-color="#ccc"
      :indicator-dots="indicatorDots" :autoplay="false" v-else-if="menuList.length > 1">
      <swiper-item v-for="(swiperItem, swiperIndex) in menuList" :key="swiperIndex">
        <view class="swiper-item">
          <view class="menu-item" :class="{ 'grid-style': pageItem.button_style === 'grid' }" @click="toPages(item)"
            v-for="(item, index) in swiperItem" :key="index">
            <view class="cu-tag badge" v-if="item.num===true"></view>
            <view class="cu-tag badge" v-else-if="item.num">{{
              item.num || ""
            }}</view>
            <view class="cu-tag badge-left" v-if="item.unbacknum">{{
              item.unbacknum || ""
            }}</view>
            <u-icon :name="item.icon" size="60" color="#00aaff" v-if="item.iconType === 'uicon' && !item.custonIcon">
            </u-icon>
            <u-icon custom-prefix="custom-icon" :name="item.icon" size="60" color="#00aaff"
              v-else-if="item.iconType === 'uicon' && item.custonIcon">
            </u-icon>
            <image lazy-load class="icon image" :src="item.icon" mode="aspectFit" v-if="item.iconType === 'image'">
              <text :class="item.icon" style="font-size: 30px; color: #00aaff" v-if="item.iconType === 'font'"></text>
              <text class="title">{{ item.label }}</text>
            </image>
          </view>
        </view>
      </swiper-item>
    </swiper>
    <view class="swiper-item single-layout" v-else-if="menuList.length === 1">
      <!--      <view class="menu-item" @click="toSpeach">
        语音合成
      </view> -->
      <view class="menu-item" :class="{
          'grid-style': pageItem.button_style === 'grid',
          'list-style': pageItem.button_style === 'list',
          'last-row': isLastRow(menuList[0], index),
        }" @click="toPages(item)" v-for="(item, index) in menuList[0]" :key="index">
        <view class="cu-tag badge" v-if="item.num">{{ item.num || "" }}</view>
        <view class="cu-tag badge-left" v-if="item.unbacknum">{{
          item.unbacknum || ""
        }}</view>
        <!-- <view class="cu-tag badge-left" v-if="item.unbacknum">未回复:{{item.unbacknum||''}}</view> -->
        <u-icon :name="item.icon" size="60" color="#00aaff" v-if="item.iconType === 'uicon' && !item.custonIcon">
        </u-icon>
        <u-icon custom-prefix="custom-icon" :name="item.icon" size="60" color="#00aaff"
          v-else-if="item.iconType === 'uicon' && item.custonIcon">
        </u-icon>
        <image lazy-load class="icon image" :src="item.icon" mode="aspectFit" v-if="item.iconType === 'image'">
          <text :class="item.icon" style="font-size: 30px; color: #00aaff" v-if="item.iconType === 'font'"></text>
          <text class="title">{{ item.label }}</text>
        </image>
      </view>
    </view>
    <view class="cu-modal bottom-modal" :class="{show:showQrcode}" @click="hideQrcode">
      <view class="cu-dialog " @click.stop="">
        <view class="qrcode-box">
          <!-- <view class="title">
            我的推广码
          </view> -->
          <!-- <image :src="getImagePath(storeInfo.logo)" mode="aspectFill" class="store-logo"></image> -->
          <image lazy-load :src="qrcodePath" mode="aspectFit" class="qr-code-image" v-if="storeInfo&&qrcodePath"
            @click="toPreviewImage(qrcodePath)">
          </image>
          <view class="qr-code-image" v-else @click="makeQrCode">
            <text class="cuIcon-refresh"></text>
          </view>
        </view>
        <view class="button-box">
          <button @click.stop="hideQrcode" class="cu-btn">关闭</button>
        </view>
      </view>
    </view>

    <view class="qr-code" v-if="qrCodeText&&showQrcode">
      <uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" :size="codeSize" class="qrcode-canvas" foregroundColor="#333"
        makeOnLoad @makeComplete="qrcodeCanvasComplete" ref="qrcodeCanvas">
      </uni-qrcode>
    </view>

    <view class="cu-modal" :class="{'show':modalName==='realname'}" @click="hideModal" @touchmove.prevent>
      <view class="cu-dialog" @click.stop>
        <!-- 实名登记信息 -->
        <view class="modal-title text-bold text-cyan bg-white">
          请先完善实名信息
        </view>
        <form class="realname-form">
          <view class="cu-form-group">
            <view class="title">姓名</view>
            <input class="text-right" placeholder="请输入您的真实姓名" name="input" v-model="formModel.customer_name"></input>
          </view>
          <view class="cu-form-group" v-if="realNameHideId!==true">
            <view class="title">身份证号</view>
            <input class="text-right" placeholder="请输入您的身份证号" name="input" type="idcard"
              v-model="formModel.id_no"></input>
          </view>
          <view class="cu-form-group" v-if="realNameHideBirth!==true">
            <view class="title">出生日期</view>
            <picker mode="date" v-model="formModel.customer_birth_day" start="1930-09-01" end="2022-09-01"
              @change="DateChange">
              <view class="picker birthday text-right">
                {{formModel.customer_birth_day||'请选择'}}
              </view>
            </picker>
          </view>
          <view class="cu-form-group">
            <view class="title">手机号码</view>
            <text v-if="!formModel.phone_xcx">点击右侧按钮获取手机号</text>
            <input class="text-right" placeholder="请先授权获取手机号" name="input" type="number"
              v-model="formModel.customer_phone" v-else></input>
            <view class="cu-capsule radius" v-if="!formModel.phone_xcx">
              <button class="cu-tag bg-blue" type="primary" open-type="getPhoneNumber"
                @getphonenumber="decryptPhoneNumber">
                获取手机号
              </button>
            </view>
          </view>
        </form>
        <view class="bg-white tip text-red" v-if="tip">
          {{tip}}
        </view>
        <view class="button-box margin-tb">
          <button type="primary" class="cu-btn bg-blue" @click="updateUserInfo">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      bindUserInfo: {
        type: Object,
      },
      /*   storeInfo: {
           type: Object,
         },
         userInfo: {
           type: Object,
         }, */
      pageItem: {
        type: Object,
      },
      buttonList: {
        type: Array,
      }
    },
    mounted() {
      let globalData = getApp().globalData
      this.globalData = globalData
    },
    data() {
      return {
        realNameHideId: false,
        realNameHideBirth: false,
        hideRealnameFields: [], //['customer_name','id_no','phone_xcx','customer_phone','customer_birth_day'],
        groupList: [],
        globalData: {},
        showQrcode: false,
        qrcodePath: "",
        qrCodeText: "",
        codeSize: uni.upx2px(700),
        modalName: null,
        tip: '',
        formModel: {
          id_no: '',
          phone_xcx: '',
          customer_name: "",
          customer_birth_day: "",
          customer_phone: '',
          appoint_remark: ''
        },
        buttonsIcon: []
      };
    },

    watch: {
      'pageItem': {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue && Array.isArray(newValue.listdata)) {
            // this.buttons = newValue.listdata.map(item => {
            //   item.url = item.dest_page
            //   if (item.dest_page && item.dest_page.indexOf('getPhoneNumber') !== -1) {
            //     item.openType = 'getPhoneNumber'
            //   }
            //   return item
            // });
          }
        }
      },
      buttons: {
        immediate: true,
        deep: true,
        handler(newValue, oldValue) {
          this.setButtonsIcon()
        }
      },
      storeNo: {
        immediate: true,
        handler(newValue, oldValue) {
          if (
            this.pageItem &&
            this.showPublic &&
            this.pageItem.show_related_group === "是" &&
            this.pageItem.type === "按钮组"
          ) {
            // 查找关联群组
            this.seletGroupList();
          } else {
            this.groupList = [];
          }
        },
      },
    },
    computed: {
      buttons() {
        if (Array.isArray(this.buttonList)) {
          return this.buttonList.map(item => {
            item.url = item.dest_page
            if (item.dest_page && item.dest_page.indexOf('getPhoneNumber') !== -1) {
              item.openType = 'getPhoneNumber'
            }
            // this.getImageInfo({
            //   url: this.getImagePath(item.icon, true)
            // }).then(picInfo => {
            //   if (picInfo.w && picInfo.h) {
            //     let res = this.setPicHeight(picInfo);
            //     if (res.w && res.h) {
            //       this.$set(item, 'imgWidth', res.w);
            //       this.$set(item, 'imgHeight', res.h);
            //     }
            //   }
            // });
            return item
          });
        } else {
          return [];
        }
      },
      calcStyle() {
        let style = {

        }
        if (
          this.pageItem?.margin || this.pageItem?.margin == 0
        ) {
          style.margin = this.pageItem.margin
        }
        if (this.pageItem?.button_style === '仅图片') {
          style.borderRadius = '0'
        }
        return style
      },
      indicatorDots() {
        if (this.pageItem) {
          if (this.menuList.length > 1) {
            return true;
          }
        }
      },
      showPublic() {
        return this.pageItem && this.pageItem.show_public_button === "是";
      },
      storeNo() {
        return this.storeInfo && this.storeInfo.store_no ?
          this.storeInfo.store_no :
          null;
      },
      swiperHeight() {
        if (this.pageItem) {
          let num = this.pageItem.row_number || 1;
          if (this.pageItem.button_style === "grid") {
            return num * 65 + 20;
          } else {
            return num * 85 + 20;
          }
        }
      },
      menuList() {
        let list = [];
        if (Array.isArray(this.groupList)) {
          let groupList = this.groupList.map((item) => {
            return {
              icon: this.getImagePath(item.icon, true),
              iconType: "image",
              label: item.name,
              eventType: "toGroup",
              type: item.gc_no,
              num: item.unreadNum || 0,
            };
          });
          list = [...list, ...groupList];
        }
        if (Array.isArray(this.buttons) && this.buttons.length > 0) {
          this.buttons.forEach((btn) => {
            let num = 0;
            if (btn.notice_attr) {
              const data = this;
              num = Number(this.renderStr(btn.notice_attr, data));
              if (isNaN(num)) {
                num = true;
              }
            }
            list.push({
              prompt: btn.prompt,
              navType: btn.navigate_type,
              icon: this.getImagePath(btn.icon, true),
              iconType: "image",
              label: btn.button_label,
              eventType: "toPage",
              num: num || 0,
              type: "navPage",
              url: btn.dest_page,
              appid: btn.appid,
              phone_number: btn.phone_number,
            });
          });
        }
        let rownumber = this.pageItem.row_number || 1;
        if (Array.isArray(list)) {
          return list.reduce((pre, item) => {
            if (pre.length === 0) {
              pre = [
                [item]
              ];
            } else if (pre[pre.length - 1].length >= rownumber * 4) {
              pre.push([item]);
            } else {
              pre[pre.length - 1].push(item);
            }
            return pre;
          }, []);
        }
      }
    },
    methods: {
      getImgButtonStyle(item) {
        let style = {
          backgroundImage: `url(${this.getImagePath(item.icon,true)})`,
          width: item.imgWidth + 'px',
          height: item.imgHeight + 'px'
        }
        return style
      },
      async setButtonsIcon() {
        this.buttonsIcon = []
        if (Array.isArray(this.buttonList)) {
          for (let item of this.buttonList) {
            item.url = item.dest_page
            if (item.dest_page && item.dest_page.indexOf('getPhoneNumber') !== -1) {
              item.openType = 'getPhoneNumber'
            }
            if (item.icon_origin_width && item.icon_origin_height && item.icon_origin_width !== '100%' && item
              .icon_origin_height !== '100%' && false) {
              let picInfo = {
                w: item.icon_origin_width,
                h: item.icon_origin_height
              }
              let res = this.setPicHeight(picInfo);
              if (res.w && res.h) {
                if (item.button_width && item.button_width.indexOf('%') !== -1) {
                  let ratio = item.button_width.replace('%', '') * 0.01
                  res.w = res.w * ratio
                  res.h = res.h * ratio
                }
                this.$set(item, 'imgWidth', res.w);
                this.$set(item, 'imgHeight', res.h);
              }
            } else {
              this.getImageInfo({
                url: this.getImagePath(item.icon, true)
              }).then(picInfo => {
                if (picInfo && picInfo.w && picInfo.h) {
                  let res = this.setPicHeight(picInfo);
                  if (res.w && res.h) {
                    if (item.button_width && item.button_width.indexOf('%') !== -1) {
                      let ratio = item.button_width.replace('%', '') * 0.01
                      res.w = res.w * ratio
                      res.h = res.h * ratio
                    }
                    this.$set(item, 'imgWidth', res.w);
                    this.$set(item, 'imgHeight', res.h);
                  }
                }
              })
            }
            this.buttonsIcon.push(item)
          }
        }
      },
      setPicHeight(content) {
        let maxW = uni.upx2px(750);
        content.h = ((maxW * content.h) / content.w) * 100 / 100;
        content.w = maxW * 100 / 100;
        return content;
      },
      async syncPhone(phone) {
        // 同步手机号到用户表
        let req = [{
          "serviceName": "srvsso_phone_reset",
          "data": [{
            "mobile": phone
          }]
        }]
        let url = this.getServiceUrl('sso', 'srvsso_phone_reset', 'operate')
        this.$http.post(url, req).then(res => {
          if (res.data.state === "SUCCESS") {
            uni.showToast({
              title: '手机号更新成功！',
            })
          }
        })
      },
      getPhoneNumber(e) {
        console.log('getPhoneNumber', e)
        if (e?.detail?.errMsg && e.detail.errMsg.indexOf('ok') !== -1) {
          let url = this.getServiceUrl('wx', 'srvwx_app_data_decrypt', 'operate')
          let req = [{
            data: [{
              encryptedData: e.detail.encryptedData,
              signature: e.detail.iv
            }],
            serviceName: 'srvwx_app_data_decrypt'
          }]
          this.$http.post(url, req).then(res => {
            if (res.data.resultCode === 'SUCCESS' && Array.isArray(res.data.response) && res.data.response
              .length > 0 && res.data.response[0].response && (res.data.response[0].response.purePhoneNumber || res
                .data.response[0].response.phoneNumber)) {
              console.log(res.data)
              let phoneNumber = res.data.response[0].response.purePhoneNumber || res.data.response[0].response
                .phoneNumber
              if (phoneNumber) {
                // 同步到sso
                this.syncPhone(phoneNumber)
              }

            } else {}
          })

        } else if (e?.detail?.errMsg && e.detail.errMsg.indexOf('no permission')) {
          uni.showToast({
            title: '当前小程序无权获取用户手机号',
            icon: 'none'
          })
        }
        return
        if (e?.detail?.code) {
          let url = `${this.$api?.serverURL}/wx/select/srvwx_app_user_phone_select`
          let req = {
            "serviceName": "srvwx_app_user_phone_select",
            "condition": [{
                "colName": "app_no",
                "ruleType": "eq",
                "value": this.$api?.appNo?.wxmp
              },
              {
                "colName": "code",
                "ruleType": "eq",
                "value": e?.detail?.code
              },
              // {
              //   "colName": "update_phone",
              //   "ruleType": "eq",
              //   "value": "是"
              // }
            ]
          }
          this.$http.post(url, req).then(res => {
            debugger
            console.log("srvwx_app_user_phone_select", res.data)
          })
        }
      },
      // toSpeach() {
      //   var plugin = requirePlugin("WechatSI")
      //   plugin.textToSpeech({
      //     lang: "zh_CN",
      //     tts: true,
      //     content: "支付宝到账一分钱",
      //     success: function(res) {
      //       console.log("succ tts", res.filename)
      //       const bgAudioManager = uni.getBackgroundAudioManager();
      //       bgAudioManager.title = '致爱丽丝';
      //       bgAudioManager.singer = '暂无';
      //       bgAudioManager.coverImgUrl =
      //         'https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/7fbf26a0-4f4a-11eb-b680-7980c8a877b8.png';
      //       bgAudioManager.src = res.filename
      //       bgAudioManager.play()
      //     },
      //     fail: function(res) {
      //       console.log("fail tts", res)
      //     }
      //   })
      // },
      DateChange(e) {
        this.formModel.customer_birth_day = e.detail.value
      },
      hideModal() {
        this.modalName = null
      },
      showRealNameModal() {
        this.formModel.customer_name = this.userInfo.name || this.userInfo.nick_name
        this.formModel.customer_phone = this.userInfo.phone
        this.formModel.customer_birth_day = this.userInfo.birthday
        this.formModel.id_no = this.userInfo.id_no
        this.formModel.phone_xcx = this.userInfo.phone_xcx
        this.modalName = 'realname'
      },
      async updateUserInfo() {
        let data = {}
        if (!this.formModel.customer_name || !this.formModel.customer_phone || !this.formModel
          .customer_birth_day) {
          //  || !this.formModel.phone_xcx 暂不校验是否填写小程序手机号
          this.tip = '请确认所有实名信息已填写完整'
          return
        }
        if (!this.formModel.id_no) {
          if (this.realNameHideId != true) {
            this.tip = '请确认所有实名信息已填写完整'
            return
          }
        }

        this.tip = ''
        if (this.formModel.id_no) {
          data.id_no = this.formModel.id_no
        }
        if (this.formModel.customer_phone) {
          data.phone = this.formModel.customer_phone
        }
        if (this.formModel.phone_xcx) {
          data.phone_xcx = this.formModel.phone_xcx
        }
        if (this.formModel.customer_birth_day) {
          data.birthday = this.formModel.customer_birth_day
        }
        if (this.formModel.customer_name) {
          data.name = this.formModel.customer_name
        }
        let req = [{
          "serviceName": "srvhealth_person_info_real_identity_update",
          "condition": [{
            "colName": "id",
            "ruleType": "eq",
            "value": this.userInfo.id
          }],
          "data": [data]
        }]
        let res = await this.$fetch('operate', 'srvhealth_person_info_real_identity_update', req, 'health')
        if (res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            let info = res.data.find(item => item.no === uni.getStorageSync('cur_user_no'))
            if (info && info.no) {
              this.$store.commit('SET_USERINFO', info)
            } else if (res.data[0].no) {
              uni.setStorageSync('cur_user_no', res.data[0].no)
              this.$store.commit('SET_USERINFO', res.data[0])
            }
          }
        }
        this.hideModal()
      },
      async decryptPhoneNumber(e) {
        // 解密手机号信息
        let self = this
        try {
          let sessionStatus = await wx.checkSession()
        } catch (err) {
          // session_key 已经失效， 需要重新执行登录流程
          if (err) {
            uni.showToast({
              title: err,
              icon: false
            })
          }
          await this.toAddPage()
        }
        if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf('ok') !== -1) {
          let url = this.getServiceUrl('wx', 'srvwx_app_data_decrypt', 'operate')
          let req = [{
            data: [{
              encryptedData: e.detail.encryptedData,
              signature: e.detail.iv
            }],
            serviceName: 'srvwx_app_data_decrypt'
          }]
          let res = await this.$http.post(url, req);
          if (res.data.resultCode === 'SUCCESS' && Array.isArray(res.data.response) && res.data.response
            .length > 0 && res.data.response[0].response && res.data.response[0].response.phoneNumber) {
            this.formModel.phone_xcx = res.data.response[0].response.phoneNumber
            this.formModel.customer_phone = res.data.response[0].response.phoneNumber
          } else {}
        } else if (e?.detail?.errMsg && e.detail.errMsg.indexOf('no permission')) {
          uni.showToast({
            title: '当前小程序无权获取用户手机号',
            icon: 'none'
          })
        }
      },
      makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          this.$refs.qrcodeCanvas.make()
        }
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
      },
      hideQrcode() {
        this.showQrcode = false
      },
      isLastRow(list, index) {
        let row_number = Math.ceil(list.length / 4);
        if (row_number === 1) {
          return true;
        } else {
          // return false
          if (Math.ceil(list.length / 4) === Math.ceil((index + 1) / 4)) {
            return true;
          } else {
            return false;
          }
        }
      },
      getButtons() {
        if (
          this.pageItem &&
          this.showPublic &&
          this.pageItem.show_related_group === "是" &&
          this.pageItem.type === "按钮组"
        ) {
          // 查找关联群组
          this.seletGroupList();
        } else {
          this.groupList = [];
        }
        let req = {
          serviceName: "srvhealth_page_item_buttons_select",
          colNames: ["*"],
          condition: [{
              colName: "item_no",
              ruleType: "eq",
              value: this.pageItem.component_no,
            },
            {
              colName: "button_usage",
              ruleType: "ne",
              value: "管理人员",
            },
          ],
          page: {
            pageNo: 1,
            rownumber: 99,
          },
        };
        this.$fetch(
          "select",
          "srvhealth_page_item_buttons_select",
          req,
          "health"
        ).then((res) => {
          if (res.success) {
            this.buttons = res.data.filter(
              (item) => item.display !== "否" && item.display !== "隐藏"
            );
          }
        });
      },
      async getGroupList() {
        // 查找店铺关联群组
        let req = {
          condition: [{
              colName: "circle_visible",
              ruleType: "ne",
              value: "不开放",
            },
            {
              colName: "store_no",
              ruleType: "eq",
              value: this.storeNo,
            },
          ],
        };
        let res = await this.$fetch(
          "select",
          "srvhealth_group_circle_select",
          req,
          "health"
        );
        if (res.success) {
          return res.data;
        }
      },
      async seletGroupList() {
        // 查找店铺关联群组 - 群成员信息
        if (!this.storeNo) {
          return;
        }
        let groupList = await this.getGroupList();
        if (Array.isArray(groupList) && groupList.length > 0) {
          let groupNoList = groupList.map((item) => item.gc_no);
          let req = {
            condition: [{
                colName: "gc_no",
                ruleType: "in",
                value: groupNoList.toString(),
              },
              {
                colName: "person_no",
                value: this.userInfo.no,
                ruleType: "eq",
              },
            ],
          };
          let res = await this.$fetch(
            "select",
            "srvhealth_person_group_circle_select",
            req,
            "health"
          );
          if (res.success) {
            groupList.forEach((item) => {
              let userInfo = res.data.find((data) => data.gc_no === item.gc_no);
              if (userInfo) {
                item.userInfo = userInfo;
                item.latest_sign_in_time = userInfo.latest_sign_in_time;
                item.unreadNum = userInfo.user_unread_msg;
              }
            });
          }
          this.groupList = groupList;
          return groupList;
        } else {
          this.groupList = [];
        }
      },

      toPages(e) {
        if (this.hasNotRegInfo && navType !== "takePhone") {
          // 除了打电话外 其他操作必须先授权访问用户信息
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        if (e.$orig) {
          e = e.$orig;
        }
        if (e && e.eventType === "toGroup") {
          this.toGroup(e.type);
          return;
        }
        let url = "";
        if (
          e &&
          (!this.bindUserInfo || !this.bindUserInfo.store_user_no) &&
          e.type !== "health-manager" &&
          e.navType
        ) {
          // uni.showModal({
          //   title: "提示",
          //   content: "请先绑定为当前机构用户，点击右上方加入按钮进行绑定",
          //   showCancel: false,
          //   confirmText: "知道了",
          // });
          return;
        }

        if (e.url) {
          if (e.url.indexOf('needRealNameAuth') > -1) {
            // 需要进行实名认证
            if (!this.userInfo?.phone_xcx || !this.userInfo?.id_no) {
              if (e.url.indexOf('realNameHideId') > -1) {
                this.realNameHideId = true
              }
              if (e.url.indexOf('realNameHideBirth') > -1) {
                this.realNameHideBirth = true
              }
              if (!this.userInfo?.phone_xcx || !this.realNameHideId) {
                this.showRealNameModal()
                return
              }

            }
          } else if (e?.url.indexOf('getPhoneNumber') !== -1) {
            return
          }

          try {
            let data = {
              storeNo: this.storeNo,
              ...this.$data,
              storeInfo: this.storeInfo,
              userInfo: this.userInfo,
              bindUserInfo: this.bindUserInfo,
              storeUserInfo:this.bindUserInfo
            }
            e.url = this.renderStr(e.url, data);
            e.url = e.url.trim();
          } catch (e) {
            //TODO handle the exception
          }
        } else if (!e.url && e.prompt) {
          uni.showModal({
            title: '提示',
            content: e.prompt,
            showCancel: false
          })
          return
        }

        if (e.url && e.url.indexOf('showStoreQrcode') !== -1) {
          if (e.url.split('q=').length > 1) {
            let data = {
              storeInfo: this.storeInfo,
              userInfo: this.userInfo,
              bindUserInfo: this.bindUserInfo,
              storeUserInfo:this.bindUserInfo
            }
            this.qrCodeText = this.renderStr(e.url.split('q=')[1], data)
            this.showQrcode = true
          }
          return
        }
        switch (e.type) {
          case "manager":
            url = `/storePages/StoreManager/StoreManager?store_no=${this.storeInfo.store_no}`;
            break;
          case "vaccine-order":
            url = "/storePages/VaccineOrder/VaccineOrder";
            break;
          case "subscsribe":
            url =
              "/publicPages/webviewPage/webviewPage?webUrl=" +
              encodeURIComponent(
                "https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ"
              );
            break;
          case "health-manager":
            url = "/pages/pedia/pedia";
            break;
          case "food":
            url =
              '/otherPages/dietSelect/dietSelect?condType={"type":"food","serviceName":"srvhealth_diet_contents_select","colName":"name","imgCol":"image","wordKey":{"title":"name","unit":"unit","energy":"unit_energy"},"pagetType":"detail"}';
            break;
          case 1: // 就诊登记
            let fieldsCond = [{
                column: "user_info_no",
                display: false,
              },
              {
                column: "name",
                value: this.userInfo.name || this.userInfo.nick_name,
              },
              {
                column: "time",
                value: this.formateDate("", "date"),
              },
              {
                column: "user_no",
                display: false,
                value: this.userInfo.userno,
              },
              {
                column: "store_no",
                display: false,
                value: this.storeInfo.store_no,
              },
            ];
            url =
              "/publicPages/form/form?serviceName=srvhealth_see_doctor_record_add&type=add&fieldsCond=" +
              JSON.stringify(fieldsCond);
            break;
          case 2:
            url =
              '/otherPages/symptomSelect/symptomSelect2?term=%7B"serviceName"%3A"srvhealth_self_symptoms_select","srvApp"%3A"health","key"%3A"name","type"%3A"symptom"%7D';
            break;
          case 3:
            url = "/archivesPages/healthCompose/healthCompose";
            break;
          case "groupChat":
            if (this.storeInfo.member_session_no) {
              url =
                `/publicPages/chat/chat?type=店铺机构全员&session_no=${this.storeInfo.member_session_no}&storeNo=${this.storeInfo.store_no}`;
            } else {
              // url = '/personalPages/chat/chat?type=店铺机构全员&storeNo=' + this.storeNo
            }
            break;
          case "personal":
            url = "/pediaPages/personal/personal?type=shop";
            break;
          case "instroduce":
            url =
              "/storePages/StoreIntroduce/StoreIntroduce?store_no=" +
              this.storeInfo.store_no;
            break;
          case "navPage":
            if (e && e.url) {
              url = e.url;
            }
            break;
        }
        if (!url && e?.dest_page) {
          url = e.dest_page;
        }
        // if (url) {
        // 	if(url==='/pages/pedia/pedia'){
        // 		uni.navigateToMiniProgram({
        // 		  appId: 'wxa8574a1e93d8e8d0',
        // 		  path: 'pages/pedia/pedia',
        // 		  extraData: {
        // 		    'data1': 'test'
        // 		  }
        // 		})
        // 		return
        // 	}
        let navType = "navigateTo";
        if (e.navType) {
          navType = e.navType;
        }
        
       

        if (navType === "miniProgram") {
          // #ifdef MP-WEIXIN
          if (url) {
            url += `&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
          }
          if (e.appid) {
            uni.navigateToMiniProgram({
              appId: e.appid,
              path: url,
            });
          }
          // #endif

        } else if (navType === "takePhone") {
          if (e.phone_number) {
            uni.makePhoneCall({
              phoneNumber: e.phone_number,
              fail(err) {
                console.error(err);
              },
            });
          }
        } else {
          if(e.url&&e.url.indexOf('https')==0){
            url = `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(e.url)}`
          }
          if (
            ["navigateTo", "redirectoTo", "switchTab", "reLaunch"].includes(
              navType
            )
          ) {
            uni[navType]({
              url: url,
              fail(err) {
                uni.switchTab({
                  url: url,
                });
              },
            });
          }
        }


      },
      addToStore() {
        this.$emit("addToStore");
      },
      async selectPersonInGroup(group_no) {
        // 查找当前登录用户有没有在此圈子用户列表中
        let req = {
          condition: [],
        };
        if (group_no) {
          req.condition.push({
            colName: "person_no",
            ruleType: "eq",
            value: this.userInfo.no,
          });
          req.condition.push({
            // {
            colName: "gc_no",
            ruleType: "eq",
            value: group_no,
            // },
          });
        } else {
          return;
        }
        let res = await this.$fetch(
          "select",
          "srvhealth_person_group_circle_select",
          req,
          "health"
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data[0];
        }
      },
      async toGroup(e) {
        if (!this.bindUserInfo || !this.bindUserInfo.store_user_no) {
          // this.bindUserInfo = await this.bindStore()
          this.addToStore()
          // uni.showModal({
          //   title: "提示",
          //   content: "请先绑定为当前机构用户，点击右上方加入按钮进行绑定",
          //   showCancel: false,
          //   confirmText: "知道了",
          // });
          return;
        }
        let data = await this.selectPersonInGroup(e);
        if (data && data.pg_no && data.gc_no) {
          // 跳到聊天页面
          uni.navigateTo({
            url: `/publicPages/chat/chat?type=群组圈子&storeNo=${this.storeNo
            }&groupNo=${data.gc_no}&pg_no=${data.pg_no}&group_role=${data.group_role || "用户"
            }`,
          });
        } else {
          // 跳到圈子信息页面
          uni.navigateTo({
            url: `/publicPages/gropDetail/gropDetail?gc_no=${e}&pb_no=${this.userInfo.no}&storeNo=${this.storeNo}&type=group-detail&from=store-detail`,
          });
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .menu-list {
    display: flex;
    flex-wrap: wrap;
    // margin: 0 20rpx;
    // margin-bottom: 20rpx;
    // background: #FAFBFC;
    border-radius: 20rpx;
    min-width: 300px;

    .template-1 {
      display: flex;
      width: 100%;
      height: 200px;
      padding: 20px;

      image {
        width: 100%;
        height: 100%;
      }

      .left,
      .right {
        flex: 1;
      }

      .right {
        display: flex;
        flex-direction: column;

        .top,
        .bottom {
          flex: 1;
        }

        .bottom {
          display: flex;

          .bottom-item {
            flex: 1;
          }
        }
      }
    }

    .pictuer-button {
      display: flex;
      flex-wrap: wrap;

      .picture-item {
        background-size: 100% 100%;
      }

      .image-item {
        width: 100%;
      }
    }

    .menu-list-box {
      width: 100%;
      padding: 20rpx;

      .menu-list-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;

        .left {
          flex: 1;

          .image {
            width: 50px;
            height: 50px;
            margin-right: 10px;
          }
        }

        .right {
          .title {
            font-weight: bold;
          }

          .intro {
            color: #888;
            font-size: 12px;
          }
        }

        .cu-btn.text {
          padding: 0;
          height: inherit;
          color: currentColor;
          width: 100%;
          text-align: left;
          justify-content: flex-start;
        }

        &:active {
          background: #FAFBFC;
        }
      }
    }

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }

    .swiper {
      width: 100%;
      height: 110px;

      &.grid-style {
        ::v-deep.uni-swiper-dot {
          transition: all 0.5s;
        }

        ::v-deep.uni-swiper-dot-active {
          width: 35rpx;
          border-radius: 10rpx;
          height: 15rpx;
        }

        .menu-item {
          box-shadow: none;
        }
      }

      &.list-style {
        display: flex;
        flex-direction: column;
      }
    }

    .swiper-item {
      width: 100%;
      display: flex;
      /* #ifdef H5 */
      padding: 20rpx;
      /* #endif */
      flex-wrap: wrap;

      &.single-layout {
        padding: 20rpx 0;

        .menu-item.last-row {
          margin-bottom: 0;
        }
      }
    }

    .menu-item {
      width: calc(25% - 15px / 4);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      margin-left: 5px;
      padding: 20rpx;
      margin-bottom: 10px;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

      &:nth-child(4n + 1) {
        margin-left: 0;
      }

      .badge {
        top: 5px;
        right: 10px;
        z-index: 1;
      }

      .badge-left {
        position: absolute;
        background-color: #f37b1d;
        border-radius: 100px;
        top: 10px;
        left: 10px;
        font-size: 10px;
        padding: 0px 5px;
        height: 14px;
        color: #ffffff;
      }

      &.grid-style {
        padding: 0;
        box-shadow: none;
        // padding-top: 20rpx;
      }

      .icon {
        width: 40px;
        height: 40px;
        font-size: 30px;
        text-align: center;
        line-height: 50px;
      }

      .title,
      .label {
        // display: flex;
        // align-items: flex-end;
        text-align: center;
        // min-height: 70rpx;
        margin-top: 10rpx;
        font-size: 12px;
        font-family: 苹方-简;
        font-weight: normal;
        line-height: 22px;
        color: #9092A5;
        color: var(--home-text-color)!important;
      }
    }
  }

  .qrcode-box {
    padding: 80rpx 40rpx;
    text-align: center;
    position: relative;

    .title {
      padding: 10px;
    }

    .store-name {
      margin-top: 10px;
      font-weight: bold;
    }

    .store-logo {
      position: absolute;
      width: 100rpx;
      height: 100rpx;
      left: calc(50% - 50rpx);
      top: 20rpx;
      z-index: 2;
    }

    .qr-code-image {
      width: 500rpx;
      height: 500rpx;
      line-height: 500rpx;
      margin: 0 auto;
      text-align: center;
      font-size: 20px;
      border: 15rpx solid #333;
      padding: 10px;
      border-radius: 20rpx;
    }
  }

  .cu-dialog {
    // width: 100%!important;
  }

  .qrcode-canvas {
    position: fixed;
    top: -999px;
    right: -999px;
  }
</style>
