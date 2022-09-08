<template>
  <view>
    <view class="layout-4" v-if="pageItem&&pageItem.type==='店铺信息-可切换店铺'">
      <view class="left">
        <view class="top">
          <view class="store-name">
            <view class="store-name">{{ setStoreInfo.name || '' }}</view>
          </view>
          <view class="right-btn" @click.stop="toChangeStore">
            切换
          </view>
        </view>
        <view class="bottom">
          <image class="logo" :src="getImagePath(setStoreInfo.logo)" mode="aspectFit" v-if="setStoreInfo.logo"></image>
          <view class="content">
            <view class="margin-bottom-xs" v-if="setStoreInfo.address">
              <text @click.stop="getCurrentLocation">
                <text class="cuIcon-locationfill margin-right-xs"></text> {{setStoreInfo.address||''}}
              </text>
            </view>
            <view class="">
              <text class="cuIcon-timefill margin-right-xs"></text>
              <text class="text-gray">营业时间：{{setStoreInfo.start_time}}-{{setStoreInfo.end_time}}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="right">
        <view class="right-item bg-red" @click="makePhoneCall()">
          <u-icon name="phone"></u-icon>
        </view>
        <view class="right-item bg-gray" @click="showModal('showQrCode')">
          <text class="cuIcon-qrcode"></text>
        </view>
      </view>
    </view>
    <view class="layout-2" :style="[calcStyle]" v-else-if="pageItem && pageItem.type === '店铺信息2'">
      <view class="image-bg" :style="{ 'background-image': backgroundImage }">
        <view class="store-info" v-if="setStoreInfo">
          <view class="store-icon" v-if="setStoreInfo.logo">
            <image class="store-icon" :src="getImagePath(setStoreInfo.logo)" mode="aspectFill"></image>
          </view>
          <view class="store-intro">
            <view class="store-name">{{ setStoreInfo.name || '' }}</view>
            <view class="store-address can-wrap" @click.stop="getCurrentLocation" v-if="setStoreInfo.address">
              <text class="cuIcon-locationfill margin-right-xs"></text>
              {{ setStoreInfo.address || '' }}
            </view>
          </view>
          <view class="store-button">
            <button class="image-btn margin-right" @click.stop="showModal('showQrCode')">
              <image class="image"
                :src=" pageItem&&pageItem.icon_qrcode?pageItem.icon_qrcode: require('../../static/qrcode1.png')"
                mode=""></image>
            </button>
            <button class="image-btn margin-right" @click.stop="toManage" v-if="isManager && showBtn.manage">
              <image class="image"
                :src="pageItem&&pageItem.icon_manager?pageItem.icon_manager: require('../../static/setting1.png')"
                mode=""></image>
            </button>
            <button class="image-btn margin-right" @click="showShareDialog">
              <image class="image"
                :src="pageItem&&pageItem.icon_share?pageItem.icon_share: require('../../static/share1.png')" mode="">
              </image>
            </button>
          </view>
        </view>
      </view>
    </view>
    <view class="layout-3" :style="[calcStyle]" v-else-if="pageItem && pageItem.type === '店铺信息3'">
      <image class="logo" mode="aspectFit" :src="getImagePath(setStoreInfo.logo)" v-if="setStoreInfo.logo">
      </image>
      <view class="info ">
        <view class=" text-bold">
          {{ setStoreInfo.name || '' }}
        </view>
        <view class="">
          {{ setStoreInfo.address || '' }}
        </view>
        <view class="bottom-buttons">
          <image :src="pageItem.icon_a" mode="aspectFit" class="button-image" v-if="pageItem.icon_a"
            @click="toPages('icon_a')"></image>
          <image :src="pageItem.icon_b" mode="aspectFit" class="button-image" v-if="pageItem.icon_b"
            @click="toPages('icon_b')"></image>
          <image :src="pageItem.icon_c" mode="aspectFit" class="button-image" v-if="pageItem.icon_c"
            @click="toPages('icon_c')"></image>
        </view>
      </view>
    </view>
    <view class="store-info simple-layout" :style="{ 'background-image': backgroundImage }"
      v-else-if="layout === 'simple'||pageItem.type === '简洁店铺信息'" @click="toPages()">
      <view class="store-name">
        <text>{{ setStoreInfo.name || '' }}</text>
        <view class="store-button">
          <button class="image-btn sm margin-left" @click.stop="showModal('showQrCode')" v-if="showIcon('qrcode')">
            <image class="image"
              :src="pageItem&&pageItem.icon_qrcode?pageItem.icon_qrcode:require('../../static/qrcode.png')" mode="">
            </image>
          </button>
          <button class="image-btn sm margin-left" @click.stop="toManage"
            v-if="isManager && showBtn.manage&&showIcon('manage')">
            <image class="image"
              :src="pageItem&&pageItem.icon_manager?pageItem.icon_manager:require('../../static/setting.png')" mode="">
            </image>
          </button>
          <button class="image-btn sm margin-left" @click.stop="showShareDialog" v-if="showIcon('share')">
            <image class="image"
              :src="pageItem&&pageItem.icon_share?pageItem.icon_share:require('../../static/share.png')" mode="">
            </image>
          </button>
        </view>
      </view>
      <image class="logo" mode="aspectFit" :src="getImagePath(setStoreInfo.logo)" v-if="setStoreInfo.logo">
      </image>
      <view class="logo" v-else-if="setStoreInfo.name">{{ setStoreInfo.name.slice(0, 1) }}</view>
      <view class="content-center">
        <view class="store-address text-gray" @click.stop="getCurrentLocation">
          <text class="content" v-if="setStoreInfo.address">
            <text class="cuIcon-locationfill"></text>
            {{ setStoreInfo.address || '' }}
          </text>
        </view>
        <view class="store-address text-gray" @click.stop="showModal"
          v-if="setStoreInfo.introduction&&!setStoreInfo.address">
          <view v-html="setStoreInfo.introduction" class="introduce-content"></view>
        </view>
      </view>
    </view>
    <view class="store-info layout-1" :style="[calcStyle]" v-else>
      <view class="store-top">
        <view class="top">
          <view class="name">{{ setStoreInfo.name || '机构名称' }}</view>
          <view class="bind store-button" v-if="isBind === true">
            <button class="image-btn margin-right" @click.stop="toManage" v-if="isManager && showBtn.manage">
              <image class="image"
                :src="pageItem&&pageItem.icon_qrcode?pageItem.icon_manager:require('../../static/setting1.png')"
                mode=""></image>
            </button>
            <button class="image-btn" @click="showShareDialog">
              <image class="image"
                :src="pageItem&&pageItem.icon_share?pageItem.icon_share:require('../../static/share1.png')" mode="">
              </image>
            </button>
          </view>
          <view class="bind" v-if="isBind === false"><button @click.stop="bindStore(true)" type="primary"
              class="bg-blue cu-btn round shadow-blur">加入</button></view>
        </view>
        <image class="logo" mode="aspectFit" :src="getImagePath(setStoreInfo.logo)" v-if="setStoreInfo.logo">
        </image>
        <view class="logo" v-else-if="setStoreInfo.name">{{ setStoreInfo.name.slice(0, 1) }}</view>
        <view class="left" @click="toPages('instroduce')">
          <view class="bottom" v-if="setStoreInfo.address">
            <view class="address" @click.stop="getCurrentLocation">
              <text class="content">
                <text class="cuIcon-locationfill" style="font-size: 20px"></text>
                {{ setStoreInfo.address || '机构地址' }}
              </text>
            </view>
          </view>
        </view>
      </view>
      <view class="instroduce" @click="showModal">
        <view v-html="setStoreInfo.introduction" class="introduce-content"></view>
      </view>
      <view class="right">
        <view class="qr-code" v-if="qrCodeText">
          <uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" :size="codeSize" class="qrcode-canvas"
            foregroundColor="#333" makeOnLoad @makeComplete="qrcodeCanvasComplete" ref="qrcodeCanvas">
          </uni-qrcode>
          <image :src="qrcodePath" class="qr-code-image" mode="aspectFit" v-if="qrcodePath"
            @click.stop.prevent="showModal('showQrCode')"></image>
          <view class="qr-code-image" v-else @click="makeQrCode"><text class="cuIcon-refresh"></text></view>
        </view>
      </view>

    </view>
    <view class="cu-modal" @click="hideModal" :class="{ show: showNoticeModal }">
      <view class="cu-dialog" @click.stop style="width: 70%;">
        <view class="notice-wrap" v-if="setStoreInfo && setStoreInfo.introduction">
          <view v-html="setStoreInfo.introduction"></view>
          <view class="button-box"><button class="cu-btn bg-cyan round margin-top shadow-blur"
              @click="hideModal">知道了</button></view>
        </view>
      </view>
    </view>

    <view class="cu-modal bottom-modal" :class="{ show: modalName === 'showQrCode' }" @click="hideModal">
      <view class="cu-dialog " @click.stop="">
        <view class="qrcode-box">
          <view class="title">我的推广码</view>
          <image :src="qrcodePath" mode="aspectFit" class="qr-code-image" show-menu-by-longpress
            v-if="setStoreInfo && qrcodePath" @click.stop="toPreviewImage(qrcodePath)"></image>
          <view class="qr-code-image" v-else @click.stop="makeQrCode"><text class="cuIcon-refresh"></text></view>
          <view class="store-name">{{ setStoreInfo.name || '' }}</view>
        </view>
        <view class="button-box"><button @click.stop="hideModal()" class="cu-btn">关闭</button></view>
        <view class="qrcodeCanvas-box" v-if="modalName === 'showQrCode' && qrCodeText">
          <uni-qrcode cid="qrcodeCanvas" style="width: 100px;height: 100px;" :text="qrCodeText" :size="codeSize"
            class="qrcode-canvas" foregroundColor="#333" makeOnLoad @makeComplete="qrcodeCanvasComplete"
            ref="qrcodeCanvas">
          </uni-qrcode>
        </view>
      </view>
    </view>
    <share-dialog ref="shareDialog" :posterNo="posterNo"></share-dialog>
  </view>

</template>

<script>
  import shareDialog from '@/storePages/components/share-dialog/share-dialog.vue'
  export default {
    components: {
      shareDialog
    },
    props: {
      pageItem: {
        type: Object
      },
      bindUserInfo: {
        type: Object
      },
      isBind: {
        type: Boolean,
        default: true
      },
      isManage: {
        type: Boolean,
        default: false
      },
    },
    watch: {
      qrcodePath(newValue) {
        if (!newValue) {
          this.makeQrCode();
        }
      },
      storeInfo: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          let result = '';
          this.qrCodeText = '';
          this.qrcodePath = '';
          this.setStoreInfo = false
          if (newValue?.logo) {
            this.qrCodeLogo = this.getImagePath(newValue?.logo, true)
            // this.getFilePath(newValue?.logo).then(res => {
            //   if (Array.isArray(res) && res.length > 0) {
            //     const item = res[0];
            //     this.qrCodeLogo = this.$api.getFilePath + item.fileurl;
            //   }
            // });
          }

          if (this.userInfo && this.userInfo.userno && newValue && newValue.store_no) {
            result =
              `https://wx2.100xsys.cn/${this.$api.customQrcodeFolder?this.$api.customQrcodeFolder+'/home':'shareClinic'}/${newValue.store_no}/${this.userInfo.userno}`;
          } else {
            result =
              `https://wx2.100xsys.cn/${this.$api.customQrcodeFolder?this.$api.customQrcodeFolder+'/home':'shareClinic'}/${newValue?.store_no}`;
          }
          this.qrCodeText = result;
          // this.$nextTick(()=>{
          this.setStoreInfo = newValue || false
          // })
        }
      }
    },

    computed: {
      iconDisplay() {
        return this.pageItem?.more_config?.iconDisplay
      },
      posterNo() {
        return this.setStoreInfo?.share_bill_pic_no || this.pageItem?.more_config?.posterNo
      },
      layout() {
        return this.pageItem?.more_config?.style;
      },
      backgroundImage() {
        // if(this.pageItem?.component_bg_img){
        //   let path = this.getImagePath(this.pageItem?.component_bg_img, true);
        //   return `url(${path})`;
        // }
        // if (this.setStoreInfo?.image) {
        //   let path = this.getImagePath(this.setStoreInfo.image, true);
        //   return `url(${path})`;
        // }
      },
      isAttention() {
        // 是否关注公众号
        if (this.$store.state?.app?.subscsribeStatus) {
          return true;
        }
      },
      showBtn() {
        let obj = {
          manage: true,
          person: true
        };
        let userRole = this.bindUserInfo?.user_role;
        let disp_role = this.pageItem?.more_config?.btn_disp_role;
        Object.keys(obj).forEach(key => {
          if (disp_role && disp_role[key]) {
            // 如果配置了自定义显示隐藏，则默认隐藏
            obj[key] = false;
            if (userRole) {
              let arr = userRole.split(',');
              if (Array.isArray(arr) && arr.length > 0) {
                arr.forEach(role => {
                  if (disp_role[key].indexOf(role) !== -1) {
                    obj[key] = true;
                  }
                });
              }
            }
          }
        });
        return obj;
      },
      isManager() {
        // 是否为用户之外的角色
        if (!this.bindUserInfo?.user_role) {
          return false;
        }
        let showManager = false;
        let arr = this.bindUserInfo?.user_role
          .split(',')
          .map(item => item.trim())
          .filter(item => item && item !== '用户');
        if (arr.length > 0) {
          showManager = true;
        }
        if (this.hasManageBtn) {
          return showManager;
        }
      },
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          };
        }
      },
      msgNum() {
        if (this.bindUserInfo && this.bindUserInfo.kefu_session_user_unread_msg) {
          return this.bindUserInfo.kefu_session_user_unread_msg;
        } else return 0;
      },
      introduction() {
        if (this.setStoreInfo && this.setStoreInfo.introduction && this.setStoreInfo.introduction.length > 80) {
          return this.setStoreInfo.introduction.slice(0, 80) + '...';
        } else {
          return this.setStoreInfo && this.setStoreInfo.introduction ? this.setStoreInfo.introduction : '';
        }
      }
    },
    data() {
      return {
        modalName: '',
        hasManageBtn: false,
        qrCodeText: '',
        codeSize: uni.upx2px(1024),
        qrcodePath: '', //图片url
        qrCodeLogo: '',
        showNoticeModal: false,
        postPath: '',
        setStoreInfo: null
      };
    },
    methods: {

      showIcon(e) {
        if (e && this.iconDisplay?. [e] !== false) {
          return true
        }
      },
      toChangeStore() {
        const listConfig = {
          "lp_style": "单行",
          "navTitle": "切换店铺",
          "listBarReadonly": true,
          "show_public_btn": false,
          "padding": "0px",
          "margin": "5px 10px 0",
          "detailPage": "/storePages/home/home?store_no=${data.store_no}",
          "navType": "reLaunch",
          "img": {
            "col": "image",
            "cfg": {
              "position": "left",
              "width": "50px",
              "height": "50px",
              "radius": "5px"
            }
          },
          "cols": [{
            "col": "name",
            "cfg": {
              "disp_label": false,
              "font_weight": 600,
            }
          }, {
            "col": "user_role",
            "cfg": {
              "disp_label": true,
              "font_size": "12px",
              "color": "#666"
            }
          }]
        }

        let rCond = {
          relation: "OR",
          data: [{
              "colName": "path",
              "ruleType": "like",
              "value": this.setStoreInfo.path
            },
            {
              "colName": "parent_no",
              "ruleType": "like",
              "value": this.setStoreInfo.parent_no
            },
            {
              "colName": "store_no",
              "ruleType": "like",
              "value": this.setStoreInfo.parent_no
            }
          ]
        }
        let url =
          `/publicPages/list2/list2?serviceName=srvhealth_store_cus_niming_detail_select&destApp=health&rCond=${JSON.stringify(rCond)}`

        url += `&idCol=store_no`

        const uuid = uni.$u.guid()

        url += `&uuid=${uuid}`

        url += `&listType=selectorList&listConfig=${encodeURIComponent(JSON.stringify(listConfig))}`

        uni.navigateTo({
          url,
          success: () => {
            uni.$on('confirmSelect', (e) => {
              if (e.val) {
                const url = `/storePages/home/home?store_no=${e.val}`
                uni.redirectTo({
                  url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(url)}`,
                  success: () => {
                    uni.reLaunch({
                      url,
                    })
                  }
                })
                // uni.navigateBack({
                //   success: () => {
                //     uni.reLaunch({
                //       url:`/storePages/home/home?store_no=${e.val}`
                //     })
                //   }
                // })
              }
            })
          }
        })
      },
      async makePoster() {
        let posterNo = this.pageItem?.more_config?.posterNo;
        if (!posterNo) {
          uni.showToast({
            title: '未配置海报模板！',
            icon: 'none'
          })
          return
        }
        let resultText = ''
        if (this.userInfo?.userno && this.setStoreInfo?.store_no) {
          resultText =
            `https://wx2.100xsys.cn/shareClinic/${this.setStoreInfo.store_no}/${this.userInfo.userno}`;
        } else {
          resultText = `https://wx2.100xsys.cn/shareClinic/${this.setStoreInfo.store_no}`;
        }
        if (resultText) {
          resultText = encodeURIComponent(resultText)
        }

        const postUrl = await this.getPosterUrl(posterNo, resultText)
        this.postPath = postUrl
        this.modalName = 'sharePoster'
      },
      showShareDialog() {
        //  显示分享弹框
        this.$refs.shareDialog.open()
        // this.modalName = 'shareStore'
      },
      async getButtonGroup() {
        if (this.isManage) {
          this.hasManageBtn = true;
          return
        }
        const req = {
          serviceName: 'srvhealth_store_home_component_select',
          colNames: ['*'],
          condition: [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.setStoreInfo?.store_no
            },
            {
              colName: 'button_usage',
              ruleType: 'eq',
              value: '管理人员'
            }
          ],
          page: {
            pageNo: 1,
            rownumber: 10
          }
        };
        const res = await this.$fetch('select', 'srvhealth_store_home_component_select', req, 'health');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.hasManageBtn = true;
        }
      },
      toManage() {
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        let url = `/storePages/StoreManager/StoreManager?store_no=${this.setStoreInfo.store_no}`;
        if (this.setStoreInfo.store_no) {
          uni.navigateTo({
            url
          });
        }
      },
      toAttention() {
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        let url = '/publicPages/webviewPage/webviewPage';
        url += `?webUrl=${encodeURIComponent('https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ')}`;
        uni.navigateTo({
          url
        });
      },
      hideModal() {
        this.modalName = '';
        this.showNoticeModal = false;
      },
      showModal(e) {
        if (e) {
          if (e === 'showQrCode') {
            this.makeQrCode()
          }
          this.modalName = e;

        } else {
          this.showNoticeModal = true;
        }
      },

      makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          this.$refs.qrcodeCanvas.make();
        }
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
        // this.qrcodePath = this.setStoreInfo?.barcode_pic || e;
        this.$emit('getQrcode', e);
      },
      makePhoneCall(telephone) {
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        uni.makePhoneCall({
          phoneNumber: telephone || this.setStoreInfo && this.setStoreInfo.telephone ? this.setStoreInfo.telephone :
            '10086'
        });
      },
      getCurrentLocation() {
        uni.openLocation({
          latitude: this.setStoreInfo.latitude ? Number(this.setStoreInfo.latitude) : '',
          longitude: this.setStoreInfo.longitude ? Number(this.setStoreInfo.longitude) : '',
          name: this.setStoreInfo.name,
          address: this.setStoreInfo.address,
          success: function() {
            console.log('success');
          },
          fail(err) {
            console.log('err', err);
          }
        });
      },
      setHomePage() {
        this.$emit('setHomePage');
      },
      toPages(e, info) {
        let url = '';
        debugger
        if (!e) {
          if (this.pageItem?.navigate_type) {
            let navType = this.pageItem?.navigate_type
            switch (navType) {
              // 路由跳转
              case 'navigateTo':
              case 'redirectTo':
              case 'switchTab':
              case 'reLaunch':
              case 'navigateTo':
                url = this.pageItem.btn_target_url
                uni[navType]({
                  url
                })
                break;
                // 打开地图到目标定位
                // 打电话
              case '打电话':
                uni.showToast({
                  title: '未配置电话号码...',
                  icon: 'none'
                })
                break;

            }
          }
          return
        }
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        const globalData = {
          userInfo: this.userInfo,
          storeUser: this.vstoreUser,
          storeInfo: this.setStoreInfo
        }
        if ((!this.bindUserInfo || !this.bindUserInfo.store_user_no) && e !== 'health-manager') {
          this.$emit('addToStore');
          return;
        }
        switch (e) {
          case 'instroduce':
            url = '/storePages/StoreIntroduce/StoreIntroduce?store_no=' + this.setStoreInfo.store_no;
            break;
          case 'icon_a':
          case 'icon_b':
          case 'icon_c':
            let cfg = this.pageItem[`${e}_url`]
            try {
              cfg = this.renderStr(cfg, globalData)
              cfg = JSON.parse(cfg)
              if (cfg?.type) {
                switch (cfg.type) {
                  // 路由跳转
                  case 'navigateTo':
                    url = cfg.url
                    break;
                    // 打开地图到目标定位
                  case 'openLocation':
                    if (cfg?.longitude && cfg?.latitude) {
                      uni.openLocation({
                        latitude: Number(cfg.latitude),
                        longitude: Number(cfg.longitude),
                        success: function() {
                          console.log('success');
                        }
                      });
                    } else {
                      uni.showToast({
                        title: '未配置经纬度...',
                        icon: 'none'
                      })
                    }
                    break;
                    // 打电话
                  case 'makePhoneCall':
                    if (cfg?.phoneNumber || this.storeInfo?.telephone) {
                      this.makePhoneCall(cfg.phoneNumber || this.storeInfo?.telephone)
                    } else {
                      uni.showToast({
                        title: '未配置电话号码...',
                        icon: 'none'
                      })
                    }
                    break;
                }
              }
            } catch (err) {
              console.log(err)
            }
            break;
        }
        if (url) {
          uni.navigateTo({
            url: url,
            fail() {
              uni.switchTab({
                url: url
              });
            }
          });
        }
      },
      async bindStore() {
        // 将当前登录用户添加到店铺用户列表，角色为用户
        this.$emit('bindUser');
      },
    },
    mounted() {
      this.getButtonGroup();
    }
  };
</script>

<style scoped lang="scss">
  .layout-4 {
    display: flex;

    .left {
      flex: 1;
      padding: 10px;

      .top {
        display: flex;
        align-items: center;
        padding-bottom: 5px;

        .store-name {
          max-width: 600rpx;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .right-btn {
          margin-left: 10px;
          padding: 0 10px;
          color: blue;
          border-left: 1px solid #f1f1f1;

          &:active {
            transform: translate(1px, 1px);
          }
        }
      }

      .bottom {
        display: flex;

        .logo {
          width: 60px;
          height: 60px;
          border-radius: 5px;
        }

        .content {
          padding-left: 5px;
          font-size: 12px;
        }
      }
    }

    .right {
      background-color: transparent;
      width: 30px;
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;

      .bg-red {
        background-color: #F90000;
      }

      .right-item {
        display: flex;
        flex: 1;
        justify-content: center;
        align-items: center;
        font-size: 20px;

        &:active {
          opacity: 0.8;
        }
      }
    }
  }

  .layout-2 {
    min-width: 300px;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }

    .store-button {
      top: -10%;

      .image-btn {
        border-radius: 50%;
        background-color: #fff;
      }
    }

    .image-bg {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-size: 100%;
      padding: 340rpx 0 0;
      display: flex;
      flex-direction: column;

      .store-info {
        background-image: url(../../../static/img/wave-bg.png);
        background-position-y: bottom;
        background-size: 100%;
        background-repeat: no-repeat;
        // width: calc(100% - 60rpx);
        width: 100%;
        flex: 1;
        padding-left: 60rpx;
        display: flex;
        align-items: center;
        min-height: 220rpx;
        position: relative;
        margin-bottom: -2rpx;
        box-sizing: border-box;

        .store-icon {
          width: 160rpx;
          height: 160rpx;
          border-radius: 50%;
        }

        .store-intro {
          padding-left: 60rpx;
          padding-top: 60rpx;
          padding-right: 40rpx;
          flex: 1;

          .store-name {
            height: 50rpx;
            width: 90%;
            font-size: 18px;
            font-family: 苹方-简;
            font-weight: normal;
            color: #474849;
          }

          .store-address {
            width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            font-family: 苹方-简;
            font-weight: normal;
            // color: #b8bac0;
            margin-top: 10rpx;

            &.can-wrap {
              width: 100%;
              overflow: auto;
              text-overflow: initial;
              white-space: initial;
            }
          }
        }
      }
    }
  }

  .store-button {
    position: absolute;
    // top: -10%;
    right: 0;
    display: flex;

    .image-btn {
      width: 40px;
      height: 40px;
      outline: none;
      border: none;
      background-color: transparent;
      padding: 0;
      margin: 0;

      // margin-right: 40rpx;
      &.margin-right {
        margin-right: 20rpx;
      }

      &.margin-left {
        margin-left: 20rpx;
      }

      &.margin-right-xs {
        margin-right: 10rpx;
      }

      &.margin-left-xs {
        margin-left: 10rpx;
      }

      &::after {
        border: none;
      }

      .image {
        width: 100%;
        height: 100%;
      }

      // .image {
      //   width: 90rpx;
      //   height: 90rpx;
      // }
    }
  }

  .layout-1,
  .simple-layout {
    flex-wrap: wrap;
    background-repeat: no-repeat;
    background-size: 100% 100%;

    .store-name {
      width: 100%;
      font-size: 16px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      // align-items: center;
      padding-bottom: 5px;
    }

    .store-button {
      position: relative;
      display: flex;
      align-items: flex-end;

      .image-btn {
        &.sm {
          width: 25px;
          height: 25px;
        }

        font-size: inherit;

        .image {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .qrcodeCanvas-box {
    position: fixed;
    top: -9999;
  }

  .notice-wrap {
    width: 100%;
    padding: 30rpx;
    color: #666;

    // background-image: linear-gradient(to right, #EBF9FA, #EEF0FE);
    .button-box {
      margin-bottom: 0;

      .cu-btn {
        // background-image: linear-gradient(to right, #EBF9FA, #EEF0FE);
      }
    }
  }

  .right {
    padding: 10rpx;
    background-color: #ebf9fa;
    border-radius: 10rpx;
    margin-bottom: 10rpx;
  }

  .qr-code {
    background-color: #fff;
    padding: 10rpx;
    width: 170rpx;
    height: 170rpx;
    margin: 0 auto;

    .qrcode-canvas {
      position: fixed;
      top: -999999px;
    }

    .qr-code-image {
      width: 150rpx;
      height: 150rpx;
      line-height: 150rpx;
      text-align: center;
    }
  }

  .store-info.simple-layout {
    display: flex;
    background-color: transparent;
    padding: 10px;

    .logo {
      width: 50px;
      height: 50px;
    }

    .content-center {
      flex: 1;
      padding-left: 10px;

      .store-address {
        // color: #888;
        font-size: 14px;
        margin-top: 3px;
      }

    }

    .store-button {}
  }

  .store-info.layout-1 {
    background-color: #fff;
    padding: 30rpx 28rpx 0;
    display: flex;
    margin-bottom: 20rpx;
    position: relative;
    padding-top: 20rpx;
    flex-wrap: wrap;
    border-radius: 20rpx;
    overflow: hidden;

    min-width: 300px;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }

    .top {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 10rpx 0;

      .name {
        width: 500rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: wrap;
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
        flex: 1;
        display: flex;
        align-items: center;
      }

      .tags {
        display: flex;

        .tag {
          display: inline-block;
          margin-left: 10rpx;
          padding: 5rpx 10rpx;
          background-color: #0ea8ff;
          color: #fff;
          border-radius: 10rpx;
        }
      }
    }

    .store-top {
      width: 100%;
      display: flex;
      margin-bottom: 20rpx;
      justify-content: space-between;
      flex-wrap: wrap;

      .name {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
      }

      .top {
        .bind {
          .cu-btn {
            padding: 0 20rpx;
            background-image: linear-gradient(to right, #eaf9f8, #edeefe);
            color: #cf79ee;
            font-size: 24rpx;
            margin-right: 10rpx;
            position: relative;

            .unread {
              min-width: 20px;
              font-size: 12px;
              padding: 3px;
              position: absolute;
              top: -10px;
              right: -10px;
            }

            &.notice-setting {
              color: #ffba2f;

              .badge {
                transform: scale(0.8);
                right: -30rpx;
                top: -15rpx;
                font-size: 24rpx;
              }
            }
          }

          [class*='cuIcon-'] {
            font-size: 40rpx;
          }
        }
      }

      .logo {
        width: 130rpx;
        height: 130rpx;
        // border-radius: 20rpx;
        margin-right: 20rpx;
        font-size: 60rpx;
        font-weight: bold;
        line-height: 100rpx;
        text-align: center;
        border: 4rpx solid #ebf9fa;
      }

      .left {
        display: flex;
        flex-direction: column;
        width: calc(100% - 150rpx);
        // padding-right: 20rpx;

        .bottom {
          padding-top: 10rpx;
          color: #aaa;

          .address {
            width: 100%;
            display: flex;
            align-items: center;
            font-size: 16px;
            font-family: 苹方-简;
            font-weight: normal;
            color: #9092a5;

            .content {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              // white-space: nowrap;
            }
          }
        }
      }
    }

    .instroduce {
      width: 65%;
      // background-color: #EBF9FA;
      // background: linear-gradient(to right, #EBF9FA, #EEF0FE);
      background-color: #f7f8ff;
      border-radius: 20rpx;
      padding: 10rpx 20rpx;
      margin: 0 0 10rpx;
      flex: 1;
      // max-height: 180rpx;

      position: relative;
      color: #666;

      &::after {
        position: absolute;
        left: 20px;
        top: -20px;
        content: '';
        border: 10px solid;
        border-color: transparent transparent #ebf9fa transparent;
      }

      .introduce-content {
        overflow: hidden;
        word-break: break-all;
        display: -webkit-box;
        color: var(--home-text-color) !important;
        -webkit-line-clamp: 4;
        /**指定行数*/
        -webkit-box-orient: vertical;
      }
    }

    .home-btn {
      font-weight: bold;
      text-align: center;
      position: absolute;
      height: 30px;
      top: -32px;
      right: 0px;

      .cu-btn {
        // border-radius: 20px 0 0 20px;
        font-size: 20px;
        font-weight: 300;
      }

      &.like-btn {
        top: -70px;
      }
    }

    .right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      margin-left: 20rpx;

      .right-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;
        position: relative;
      }

      .image-box {
        position: relative;
      }

      .image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        font-size: 20px;
        color: #00aaff;
        padding: 5px;
      }
    }
  }

  .qrcode-box {
    padding: 80rpx 40rpx;
    text-align: center;
    position: relative;

    .title {
      padding: 0 0 10px;
      font-size: 20px;
      font-weight: bold;
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
      // border-radius: 20rpx;
    }
  }

  .cu-modal.bottom-modal {
    z-index: 9999;
  }

  .introduce-content {
    overflow: hidden;
    word-break: break-all;
    display: -webkit-box;
    color: var(--home-text-color) !important;
    -webkit-line-clamp: 4;
    /**指定行数*/
    -webkit-box-orient: vertical;
  }

  .layout-3 {
    display: flex;

    .logo {
      width: 75px;
      height: 75px;
      border-radius: 50%;
      margin-right: 10px;
      border: 2px solid #fff;
    }

    .info {
      flex: 1;
    }

    .bottom-buttons {
      padding: 10rpx 0 0;
      text-align: right;

      .button-image {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-left: 10px;
      }
    }
  }
</style>
