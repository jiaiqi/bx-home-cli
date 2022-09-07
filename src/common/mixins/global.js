import store from '@/store'
import api from '@/common/api.js'
import {
  selectPersonInfo
} from '@/common/api/login.js'
import {
  mapState
} from 'vuex'
export default {
  computed: {
    ...mapState({
      themeConfig: state => state.app.themeConfig,
      globalTextFontSize: state => state.app['globalTextFontSize'],
      globalLabelFontSize: state => state.app.globalLabelFontSize,
      isAttention: state => state.app.subscsribeStatus, //是否关注公众号
      userInfo: state => state.user.userInfo,
      storeInfo: state => state.app.storeInfo,
      vcart: state => state.order.cartInfo,
      vstoreUser: state => state.user.storeUserInfo,
      vloginUser: state => state.user.loginUserInfo,
      scene: state => state.app.scene,
      hasNotRegInfo: state => state.app.hasNotRegInfo, //授权访问用户信息
      isLogin: state => state.app.isLogin,
      vvipCard: state => state.user.vipCard, //用户会员卡信息（充值卡）
      curStoreNo: state => state.app.curStoreNo, //当前店铺编号
      placeInfo: state => state.app.placeInfo,
      inviterInfo: state => state.app.inviterInfo,
    }),
    $api() {
      return api
    },
    hasVipCard() {
      return !!this.vvipCard?.card_no
    },
    globalVariable() {
      return {
        loginUser: this.vloginUser, //登录返回的用户信息
        userInfo: this.userInfo, //人员基本信息
        storeInfo: this.storeInfo, //店铺信息
        vstoreUser: this.vstoreUser, //店铺用户信息
        bindUserInfo: this.vstoreUser, //店铺用户信息
        storeUser: this.vstoreUser, //店铺用户信息
      }
    },
    setStoreNo() {
      return this.storeNo || this.store_no || this.curStoreNo || this.goodsInfo?.store_no || this.storeInfo?.store_no
    },
    showBackHome() {
      if (this.storeNo === "S0000000000") {
        return false
      } else {
        let pages = getCurrentPages();
        if (pages.length === 1) {
          return true
        }
      }
    },
  },
  data() {
    return {
      pageUUID: '',
      _pageScrollTop: 0
    }
  },
  async onLoad(option) {
    this.pageUUID = uni.$u.guid(20)
    if (option.storeNo || option.store_no) {
      this.$store.commit('setStateAttr', {
        key: "curStoreNo",
        val: option.storeNo || option.store_no
      })
    }
    // #ifdef MP-WEIXIN
    // await this.initApp()
    //#endif
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    renderStr(str, obj = {}) {
      obj = {
        ...this.globalVariable,
        ...obj
      }
      if (typeof obj === 'object' && str && typeof str === 'string') {
        str = str.replace(/\$\{(.*?)\}/g, (match, key) => {
          key = key.trim()
          let result = obj[key]
          if (key === 'today') {
            result = dayjs().format("YYYY-MM-DD")
          }
          let arr = key.split('.')
          if (arr.length > 1) {
            result = obj
            arr.forEach(item => {
              try {
                result = result[item] ?? '';
                if (result === 0) {
                  result = '0'
                }
              } catch (e) {
                //TODO handle the exception
              }
            })
          }
          return result
        })
      }
      return str
    },

    downloadFile(e) {
      return new Promise((resolve) => {
        uni.showLoading({
          title: "下载中..."
        })
        uni.downloadFile({
          url: this.getImagePath(e, true), //仅为示例，并非真实接口地址。
          complete: (e) => {
            uni.hideLoading()
            if (e?.tempFilePath) {
              resolve(e.tempFilePath)
            } else {
              uni.showToast({
                title: '下载失败！',
                icon: 'none'
              })
              resolve(false)
            }
          }
        });
      })
    },
    openDocument(e) {
      if (e) {
        let path = this.getImagePath(e, true)
        // #ifdef MP-WEIXIN
        uni.downloadFile({
          url: path,
          success: function(res) {
            var filePath = res.tempFilePath;
            uni.openDocument({
              filePath: filePath,
              showMenu: true,
              success: function(res) {
                console.log('打开文档成功');
              }
            });
          }
        });
        // #endif
        // #ifdef H5
        window.open(path)
        // #endif
      }
    },
    async saveFile(e) {
      if (e) {
        let tempFilePath = await this.downloadFile(e)
        if (tempFilePath) {
          uni.saveFile({
            tempFilePath: tempFilePath,
            success: function(res) {
              var savedFilePath = res.savedFilePath;
              uni.showModal({
                title: "提示",
                content: `文件已保存到${savedFilePath}`,
                showCancel: false,
                success: (e) => {
                  if (e.confirm) {
                    uni.getSavedFileList({
                      success: function(f) {
                        console.log(f.fileList);
                        uni.showModal({
                          title: 'fileList',
                          content: JSON.stringify(f.fileList)
                        })
                      }
                    });
                  }
                }
              })
            }
          });
        }
      }
    },
    getUserImage() {
      // 获取用户头像
      let img = this.userInfo?.user_image || this.userInfo.profile_url || '20220728150847232100';
      return this.getImagePath(img, true)
    },
    async unbindWxUser() {
      const result = await new Promise((resolve) => {
        uni.showModal({
          title: '提示',
          content: '确认解绑账号？',
          success: (res) => {
            if (res.confirm) {
              resolve(true)
            } else {
              resolve(false)
            }
          },
          fail() {
            resolve(false)
          }
        })
      })
      if (result !== true) {
        return
      }
      const url = this.$api.unbindWxUser;
      const req = [{
        serviceName: 'srvwx_user_unbind'
      }];
      const response = await this.$http.post(url, req);
      if (response?.data?.state === 'SUCCESS') {
        uni.showModal({
          title: '提示',
          content: '解绑成功,即将清除缓存，重新进入小程序',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              uni.clearStorageSync()
              this.initClientEnv();
              this.$store.commit('SET_LOGIN_STATE', false);
              uni.reLaunch({
                url: '/pages/home/home'
              })
            }
          }
        })
      }
    },
    async bindWxUser(e) {
      console.log('bindWxUser', e);
      let that = this;
      let url = that.$api.bindWxUser;
      let req = [{
        serviceName: 'srvwx_user_bind',
        data: [e]
      }];
      if (that.isInvalid(e?.user_no) && that.isInvalid(e?.pwd)) {
        let response = await that.$http.post(url, req);
        console.log('bindWxUser', response);
        if (response.data.state === 'SUCCESS' && response.data.response[0].response) {
          let res = response.data.response[0].response;
          let expire_timestamp = parseInt(new Date().getTime() / 1000) + res.expire_time; //过期时间的时间戳(秒)
          uni.setStorageSync('bx_auth_ticket', res.bx_auth_ticket);
          uni.setStorageSync('expire_time', res.expire_time); // 有效时间
          uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
          if (res && res?.login_user_info?.user_no) {
            uni.setStorageSync('login_user_info', res.login_user_info);
            console.log('res.login_user_info', res.login_user_info);
            that.$store.commit('SET_LOGIN_USER', res.login_user_info);
          }
          if (res?.login_user_info?.data) {
            uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
          }
          uni.setStorageSync('isLogin', true);
          that.$store.commit('SET_LOGIN_STATE', true);
          uni.showModal({
            title: "提示",
            content: '绑定成功,即将清除缓存，重新进入小程序',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.clearStorageSync()
                this.initClientEnv();
                uni.reLaunch({
                  url: '/pages/home/home'
                })
              }
            }
          })
        } else {
          if (response?.data?.resultMessage === '非移动端用户登录') {
            uni.showToast({
              title: '当前微信账号已经绑定过系统账号',
              duration: 2000,
              icon: 'none'
            });
            return
          }
          uni.showToast({
            title: response.data.resultMessage,
            duration: 2000,
            icon: 'none'
          });
        }
      } else {
        uni.showToast({
          title: '帐号或密码错误',
          duration: 2000
        });
      }

    },
    async getAddressByLocation(location = {}) {
      const {
        lat,
        lng
      } = location;
      if (lat && lng && this.$api?.qqmapKey) {
        const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${this.$api.qqmapKey}`
        let res = await this.$http.get(url)
        return res?.data?.result
      }
    },
    async setDefaultValueForAddressCol(columns, colMap) {
      const res = await new Promise(resolve => {
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            resolve(res)
          },
          fail: (err) => {
            resolve(err)
          }
        })
      })
      const {
        longitude,
        latitude
      } = res || {}
      if (longitude && latitude) {
        const result = await this.getAddressByLocation({
          lat: latitude,
          lng: longitude
        })
        if (result?.address_component) {
          const {
            province,
            city,
            district
          } = result?.address_component || {}
          return columns.map(item => {
            if (colMap?.pro && item.column === colMap.pro && province) {
              item.value = item.value || province
            }
            if (colMap?.city && item.column === colMap.city && city) {
              item.value = item.value || city
            }
            if (colMap?.district && item.column === colMap.district && district) {
              item.value = item.value || district
            }
            if (colMap?.lat && item.column === colMap.lat && latitude) {
              item.value = item.value || latitude
            }
            if (colMap?.lng && item.column === colMap.lng && longitude) {
              item.value = item.value || longitude
            }
            return item
          })
        }
      }

    },

    async checkUserInfo() {
      if (this.userInfo?.userno && (!this.userInfo.nick_name)) {
        await selectPersonInfo(this.userInfo?.userno, true)
      }
      if ((!this.userInfo.nick_name) && this.userInfo?.id) {
        let res = await new Promise((resolve) => {
          uni.showModal({
            title: '提示',
            content: '请先完善您的基本信息，然后再进行其它操作',
            success: (res) => {
              if (res.confirm) {
                toEditUserInfo.then(result => {
                  resolve(result)
                })
              }
            }
          })
        })
        if (res == true) {
          const res1 = await new Promise(resolve => {
            uni.showModal({
              title: '提示',
              content: '是否继续之前的操作？',
              success: (handler) => {
                if (handler.confirm) {
                  resolve(true)
                } else {
                  resolve(false)
                }
              }
            })
          })
          if (res1 === false) {
            return false
          } else {
            return true
          }
        } else {
          return false
        }
      }

    },

    toEditUserInfo() {
      return new Promise(resolve => {
        const uuid = uni.$u.guid()
        let url =
          `/publicPages/formPage/formPage?type=update&hideChildTable=true&serviceName=srvhealth_person_profile_nickname_update&id=${this.userInfo.id}&uuid=${uuid}`
        if (this.userInfo?.id) {
          uni.navigateTo({
            url,
            success: () => {
              uni.$on('onBack', (e) => {
                if (e?.uuid === uuid && e?.service ===
                  'srvhealth_person_info_profile_nickname_update') {
                  this.initApp().then(_ => {
                    resolve(true)
                  })
                }
              })
            }
          })
        } else {
          uni.showModal({
            title: '提示',
            content: '系统错误,请重新进入小程序',
            showCancel: false
          })
          resolve(false)
        }
      })
    },
    toTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
        success: () => {
          this.reachBottomnum = 1
        },
      });
    },

    async checkBasicUserInfo() {
      let result = false
      if (this.userInfo?.userno) {
        await selectPersonInfo(this.userInfo?.userno, true)
      }
      if (this.userInfo?.userno && (this.userInfo?.nick_name === '微信用户' || !this.userInfo.nick_name)) {
        result = await new Promise((resolve) => {
          uni.showModal({
            title: '提示',
            content: '请先完善您的基本信息，然后再进行其它操作',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                const uuid = uni.$u.guid()
                let url =
                  `/publicPages/formPage/formPage?type=update&hideChildTable=true&serviceName=srvhealth_person_profile_nickname_update&id=${this.userInfo.id}&uuid=${uuid}&disabledBack=true`
                let fieldsCond = [{
                  column: "nick_name",
                  value: ""
                }]
                url += `&fieldsCond=${JSON.stringify(fieldsCond)}`
                const pages = getCurrentPages();
                const path = pages[pages.length - 1]?.$page?.fullPath;
                uni.navigateTo({
                  url,
                  success: () => {
                    uni.$on('onBack', (e) => {
                      if (e?.uuid === uuid && e.service && (
                          'srvhealth_person_info_profile_nickname_update'.indexOf(e.service) > -
                          1 ||
                          'srvhealth_person_profile_nickname_update'.indexOf(e.service) > -1)) {
                        resolve(true)
                      }
                    })
                  }
                })
              }
            }
          })
        })
      }
      return result
    },

    async setSessionInfo(storeNo) {
      const url = `/health/operate/srvsys_session_info_set`
      const req = [{
        "serviceName": "srvsys_session_info_set",
        "data": [{
          "info_type": "store_info",
          "info_value": storeNo
        }]
      }]
      if (storeNo) {
        return await this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.response) && res?.data?.response.length > 0) {
            const {
              response
            } = res?.data?.response[0] || {} 
            if (Array.isArray(response?.collect_cfg) && response?.collect_cfg.length > 0) {
              this.$store.commit('setStateAttr', {
                key: 'collectPages',
                value: response?.collect_cfg
              })
            }
          }
        })
      }
    },
    async initApp(option = {}) {
      // 初始化小程序
      // 1. 登录检测、用户信息查找
      if (option) {
        this.checkOptionParams(option);
      }
      await this.toAddPage()

      // 没有用户昵称和头像 初次进入小程序

      // if (option.invite_user_no && (!this.userInfo?.nick_name || this.userInfo?.nick_name == '微信用户') && !this
      //   .userInfo?.name) {
      //   let res = await this.checkBasicUserInfo()
      //   if (res == false) {
      //     return
      //   }
      // }

      // 2. 店铺信息查找
      let storeInfo = await this.getStore_()
      if (storeInfo?.store_no) {
        // 3. 店铺用户信息查找
        await this.getStoreUser_()
        // 4. vipcard信息查找
        await this.getVipCard()
      }
    },
    async getStore_() {
      if (!this.setStoreNo) {
        return this.storeInfo
      }
      let req = {
        condition: [{
          colName: 'store_no',
          ruleType: 'eq',
          value: this.setStoreNo
        }],
        page: {
          pageNo: 1,
          rownumber: 1
        }
      };
      if (this.storeInfo?.store_no === this.setStoreNo) {
        return this.storeInfo
      }
      let serviceName = 'srvhealth_store_list_select';
      // serviceName = 'srvhealth_store_mgmt_select'
      serviceName = 'srvhealth_store_cus_niming_detail_select'
      await this.setSessionInfo(this.setStoreNo)
      let res = await this.$fetch('select', serviceName, req, 'health');
      if (Array.isArray(res.data) && res.data.length > 0) {
        this.$store.commit('setStateAttr', {
          key: 'storeInfo',
          val: res.data[0]
        });
        let theme = 'blue';
        if (res.data[0].para_cfg) {
          try {
            let moreConfig = JSON.parse(res.data[0].para_cfg);
            res.data[0].moreConfig = moreConfig;
            if (moreConfig.theme) {
              theme = moreConfig.theme;
            }
          } catch (err) {
            console.log(err);
          }
        }
        this.$store.commit('setStateAttr', {
          key: 'theme',
          val: theme
        });
        return res.data[0]
      }
      return false
    },
    async add2Store() {
      // 将当前登录用户添加到店铺用户列表，角色为用户
      if (!this.userInfo || !this.userInfo.no) {
        await this.toAddPage();
      }

      if (this.bindUserInfo?.member_status === '退出') {
        this.joinStore();
        return;
      }
      if (!this.userInfo?.no) {
        return
      }
      let req = [{
        serviceName: 'srvhealth_store_user_add',
        condition: [],
        data: [{
          store_no: this.storeInfo?.store_no || this.storeNo || this.setStoreNo,
          name: this.storeInfo?.name,
          image: this.storeInfo?.image,
          type: this.storeInfo?.type,
          person_no: this.userInfo.no,
          person_name: this.userInfo && this.userInfo.name ? this.userInfo.name.replace(
            /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, '') : '',
          user_account: this.userInfo.userno,
          nick_name: this.userInfo && this.userInfo.nick_name ? this.userInfo.nick_name
            .replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, '') : '',
          profile_url: this.userInfo.profile_url,
          // user_image: this.userInfo.user_image,
          sex: this.userInfo.sex,
          user_role: '用户',
          add_url: this.userInfo?.add_url || this.inviterInfo?.add_url,
          invite_user_no: this.invite_user_no || this.userInfo?.invite_user_no || this
            .inviterInfo?.invite_user_no
        }]
      }];
      if (!req[0].data[0].store_no) {
        return
      }
      let invite_user_no = this.invite_user_no || this.inviterInfo?.invite_user_no || this.userInfo
        ?.invite_user_no;
      try {
        let inviterStoreUser = await this.getInviteStoreUser(invite_user_no);
        if (inviterStoreUser && inviterStoreUser.store_user_no) {
          req[0].data[0].invite_store_user_no = inviterStoreUser.store_user_no;
        }
      } catch (err) {
        console.log(err);
      }
      if (this.userInfo?.user_image) {
        if (this.userInfo?.user_image.indexOf('http') == -1) {
          req[0].data[0].user_image = this.userInfo?.user_image
        }
      }

      let res = await this.$fetch('operate', 'srvhealth_store_user_add', req, 'health');
      if (res.success) {
        if (res.data.length > 0) {
          this.bindUserInfo = res.data[0];
          this.$store.commit('SET_STORE_USER', this.bindUserInfo);
          return this.bindUserInfo;
        }
      } else {
        return res;
      }
    },
    async getInviteStoreUser(user_no) {
      let storeNo = this.curStoreNo
      if (!storeNo) {
        return
      }
      let url = this.getServiceUrl('health', 'srvhealth_store_user_share_select', 'select');
      let req = {
        colNames: ['*'],
        serviceName: 'srvhealth_store_user_share_select',
        condition: [{
            colName: 'user_account',
            ruleType: 'eq',
            value: user_no
          },
          {
            colName: 'store_no',
            ruleType: 'eq',
            value: storeNo
          }
        ],
        page: {
          rownumber: 1
        }
      };
      if (!user_no) {
        return;
      }
      let res = await this.$http.post(url, req);
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data[0];
      }
    },
    async updatePersonInfo(data = {}) {
      const service = 'srvhealth_person_info_update'
      const url = `/health/operate/${service}`
      if (!this.userInfo?.id) {
        return
      }
      const req = [{
        "serviceName": service,
        "condition": [{
          colName: 'id',
          ruleType: 'eq',
          value: this.userInfo?.id
        }],
        "data": [data]
      }]
      const res = await this.$http.post(url, req)
      return res
    },
    async updateStoreUser(data, showToast) {
      if (!this.vstoreUser?.id) {
        return
      }
      let req = [{
        serviceName: 'srvhealth_store_user_update',
        condition: [{
          colName: 'id',
          ruleType: 'eq',
          value: this.vstoreUser?.id
        }],
        data: [data]
      }];
      let res = await this.$fetch('operate', 'srvhealth_store_user_update', req, 'health');
      if (res.success) {
        if (showToast) {
          uni.showToast({
            title: '操作成功'
          });
        }
        await this.getStoreUser_();
      }
      return
    },

    async getStoreUser_() {
      let storeNo = this.setStoreNo
      let invite_user_no = this.invite_user_no || this.inviterInfo?.invite_user_no
      if (invite_user_no && invite_user_no !== this.userInfo?.userno && storeNo) {
        // if (invite_user_no && invite_user_no !== this.userInfo?.userno && !this.userInfo?.invite_user_no && storeNo) {
        if (this.storeInfo?.standard == '更新') {
          // 更新店铺用户的邀请人编码
          let data = {
            invite_user_no: invite_user_no
          };
          if (!this.userInfo?.invite_user_no) {
            await this.updatePersonInfo(data);
          }
          let inviterStoreUser = await this.getInviteStoreUser(invite_user_no);
          if (inviterStoreUser && inviterStoreUser.store_user_no && inviterStoreUser
            .store_user_no !== this
            .vstoreUser?.store_user_no) {
            data.invite_store_user_no = inviterStoreUser.store_user_no;
          }
          await this.updateStoreUser(data)
        }
      }
      if (this.userInfo?.no && storeNo) {
        let url = this.getServiceUrl('health', 'srvhealth_store_user_select', 'select');
        let req = {
          serviceName: 'srvhealth_store_user_select',
          colNames: ['*'],
          condition: [{
              colName: 'person_no',
              ruleType: 'eq',
              value: this.userInfo.no
            },
            {
              colName: 'store_no',
              ruleType: 'eq',
              value: storeNo
            }
          ]
        };
        if (this.vstoreUser?.store_no === storeNo) {
          this.bindUserInfo = this.vstoreUser
          return [this.vstoreUser]
        }
        let res = await this.$http.post(url, req);
        if (Array.isArray(res.data.data)) {
          if (res.data.data.length > 0) {
            // this.bindUserInfo = res.data.data[0]
            this.$store.commit('SET_STORE_USER', res.data.data[0]);
            return res.data.data;
          } else if (res.data.data.length == 0) {
            // 没有查找到店铺用户
            await this.add2Store()
            await this.getStoreUser_()
          }
        }
        return res
      }
    },

    getwxMchId() {
      // 获取商户号
      return this.storeInfo?.wx_mch_id || this.$api?.wxMchId || '1485038452'
    },
    getOrderShowParams(orderType = '') {
      let showParams = ''
      if (orderType) {
        if (orderType.indexOf('餐饮') > -1) {
          showParams = '服务场地'
        }
        if (orderType && orderType.indexOf('服务') !== -1) {
          showParams = `服务场地,服务人员`
        }
      }
      return showParams
    },
    getOrderType(list = []) {
      // list-商品列表
      let order_type = ''
      switch (this.storeInfo?.type) {
        case '饭馆':
          order_type = '餐饮'
          break;
        case '酒店':
          order_type = '酒店'
          break;
        default:
          order_type = '普通商品'
      }
      let goodsType = Array.from(new Set(list.map(item => item.goods_type)))

      if (goodsType.includes('现制餐饮') && order_type.indexOf('餐饮') == -1) {
        order_type += ',餐饮'
      }

      if (goodsType.includes('充值卡') || goodsType.includes('想豆卡') || goodsType.includes('课程') || goodsType
        .includes('活动') || goodsType.includes('提货卡') || goodsType.includes('套餐卡') || goodsType.includes(
          '面额卡') || goodsType.includes('体验产品') || goodsType.includes('在线服务')) {
        order_type = '虚拟商品'
      }

      if (goodsType.includes('线下服务')) {
        order_type = '服务'
      }

      return order_type
    },
    async getPlaceInfo(service_place_no) {
      // 查找服务场地信息
      let url = this.getServiceUrl('health', 'srvhealth_store_place_join_select', 'select');
      const req = {
        "serviceName": "srvhealth_store_place_join_select",
        "colNames": ["*"],
        "condition": [{
          "colName": "store_no",
          "ruleType": "eq",
          "value": this.storeInfo?.store_no
        }, {
          "colName": "place_no",
          "ruleType": "like",
          "value": service_place_no
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        }
      }
      const res = await this.$http.post(url, req)
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {

        this.$store.commit('SET_PLACE', res.data.data[0])

        return res.data.data[0]
      }
    },
    toOfficial(mp_no) {
      // 跳转到关注公众号页面
      const frontEndAddress = this.$api.frontEndAddress
      mp_no = mp_no || 'MP2201210021'
      if (mp_no) {
        let webUrl =
          `${frontEndAddress}storePages/officialIntro/officialIntro?mp_no=${mp_no}`
        let url =
          `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
        uni.navigateTo({
          url
        })
      }
    },
    async getVipCard(no) {
      no = no || this.vstoreUser?.store_user_no
      if (!no) {
        return
      }

      // if (no === this.vvipCard?.attr_store_user_no) {
      //   return this.vvipCard
      // }
      if (!this.vstoreUser?.member_card_no) {
        await this.getStoreUser_()
        // return
      }

      let service = 'srvhealth_store_card_case_select'
      const req = {
        "serviceName": service,
        "colNames": ["*"],
        "condition": [{
          "colName": "attr_store_user_no",
          "ruleType": "eq",
          "value": no
        }, {
          "colName": "card_type",
          "ruleType": "eq",
          "value": "充值卡"
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        }
      }
      let url = this.getServiceUrl('health', service, 'select');
      let res = await this.$http.post(url, req);
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        this.$store.commit('SET_VIP_CARD', res.data.data[0])
      }
      return
    },

    getServiceName(srv) {
      let len = srv.lastIndexOf('_');
      let serviceName = srv.slice(0, len) + '_';
      if (this.srvType === 'list' || this.srvType === 'detail') {
        serviceName += 'select';
      } else {
        serviceName += this.srvType;
      }
      return serviceName;
    },

    async handleAfterSubmit(handler, effect_data) {
      const self = this
      const afterSubmit = handler;
      if (Array.isArray(afterSubmit) && afterSubmit.length > 0) {
        const globalData = {
          data: effect_data || {},
          storeInfo: self.storeInfo,
          userInfo: self.userInfo,
          storeUser: self.vstoreUser
        }
        const actionResult = new Array(afterSubmit.length)
        for (let i = 0; i < afterSubmit.length; i++) {
          let item = afterSubmit[i];
          if ((i > 0 && actionResult[i - 1]) || i == 0) {
            if (effect_data && effect_data.id && ['redirectTo', 'navigateTo'].includes(item.type)) {
              if (item.url) {
                let url = this.renderStr(item.url, globalData)
                uni[item.type]({
                  url: url,
                  success: () => {
                    actionResult[i] = true
                  }
                })
              }
            } else if (item.type === 'wx_pay') {
              if (item.money_col && item.order_no_col && effect_data && effect_data[
                  item.order_no_col]) {
                const totalMoney = effect_data[item.money_col] || 0
                if (totalMoney == 0) {
                  actionResult[i] = true
                } else {
                  const wxMchId = this.getwxMchId()
                  const orderData = {
                    order_no: effect_data[item.order_no_col]
                  }
                  const result = await this.toPlaceOrder(totalMoney * 100, '',
                    orderData, wxMchId);
                  if (result && result.prepay_id) {
                    let res = await this.getPayParams(result.prepay_id, wxMchId);
                    const resData = await new Promise((resolve) => {
                      wx.requestPayment({
                        timeStamp: res.timeStamp.toString(),
                        nonceStr: res.nonceStr,
                        package: res.package,
                        signType: 'MD5',
                        paySign: res.paySign,
                        success(res) {
                          // 支付成功
                          resolve(true)
                        },
                        fail(res) {
                          // 支付失败/取消支付
                          resolve('支付失败/取消支付')
                        }
                      });
                    })
                    actionResult[i] = resData
                  }
                }
              } else {
                actionResult[i] === true
              }
            } else if (item.type === 'update_call_back') {
              if (item.service && item.app && Array.isArray(item.data) && item
                .cond) {
                let url = this.getServiceUrl(item.app, item.service, 'operate');
                let req = [{
                  serviceName: item.service,
                  condition: [],
                  data: item.data
                }]
                if (Array.isArray(item.cond)) {
                  req[0].condition = item.cond.map(c => {
                    c.value = self.renderStr(c.value, globalData)
                    return c
                  })
                }
                const res = await self.$http.post(url, req);
                if (res.data.state == 'SUCCESS') {
                  actionResult[i] = true
                } else {
                  actionResult[i] = res.data.resultMessage
                }
              }
            } else if (item.type === 'toDetail') {
              if (item.trigger) {
                if (item.trigger.type == 'condition') {
                  let isPass = true;
                  if (Array.isArray(item.trigger?.rule) && item.trigger.rule.length > 0) {
                    item.trigger.rule.forEach(a => {
                      a = JSON.parse(this.renderStr(JSON.stringify(a), globalData))
                      if (a.result && a.value === a.result) {

                      } else {
                        isPass = false
                      }
                    })
                  }
                  if (isPass === false) {
                    return
                  }
                }
              }

              this.srvType = 'detail'

              let serviceName = this.addV2?.select_service_name || this.colV2?.select_service_name || this
                .getServiceName(this.serviceName)
              let fieldsCond = [{
                column: 'id',
                value: effect_data.id,
                display: false
              }]
              let url =
                `/publicPages/formPage/formPage?type=detail&serviceName=${serviceName}&fieldsCond=${encodeURIComponent(JSON.stringify(this.fieldsCond))}`
              if (this.appName) {
                url += `&appName=${this.appName}`
              }

              if (item.hideChildTable) {
                url += `&hideChildTable=true`
              }

              if (item.custom_url) {
                url = this.renderStr(item.custom_url, globalData);
              }

              if (item.view_cfg) {
                url += `&view_cfg=${encodeURIComponent(JSON.stringify(item.view_cfg))}`
              }

              uni.redirectTo({
                url
              })
              actionResult[i] = true
            }
          }
        }
        if (actionResult.length === afterSubmit.length && !actionResult.every(item =>
            item == true)) {
          self.srvType === 'detail'
          self.srvType === 'use_type'
          self.formButtons = []
        } else {
          actionResult.forEach(item => {
            if (item && typeof item === 'string') {
              uni.showModal({
                title: "提示",
                content: item,
                showCancel: false
              })
            }
          })
        }
        return actionResult
      }
    }
  }
}
