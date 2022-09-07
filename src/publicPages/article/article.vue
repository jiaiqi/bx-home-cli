<template>
  <view class="article-wrap">
    <view class="top">
      <view class="head-image" v-if="
  		    articleData.icon_image && articleData.cover_pic_style === '下一'
  		  ">
        <image class="image" :src="getImagePath(articleData.icon_image, true)" mode="aspectFill"></image>
      </view>
      <view class="left">
        <view class="header">
          <view class="title" v-if="articleData.title">{{
            articleData.title
          }}</view>
          <view class="title" v-if="articleData.name">{{
            articleData.name
          }}</view>
        </view>
        <view class="create-time">
          <text class="store-name" @click="toStore" v-if="storeName && storeNo">{{ storeName }}</text>
          <text v-if="articleData.create_time">{{ dayjs(articleData.create_time).format("YYYY-MM-DD") }}</text>
        </view>
      </view>
    </view>

    <view class="content" v-if="articleData.content" :style="[setPadding]">
      <mp-html :content="articleData.content.replace(/\<img/gi, '<img width=100%')" />
    </view>

    <view class="bottom-buttons">
      <button class="bottom-button cu-btn" :class="[setBtnClass(item)]" v-for="item in bottomButtons"
        @click="onBtn(item)">
        <text v-if="item.font_icon" class="margin-right-xs" :class="'cuIcon-'+item.font_icon"></text>
        <text>
          {{item.button_label}}
        </text>
      </button>
    </view>
  </view>

</template>

<script>
  import {
    mapState
  } from 'vuex'
  const ColorList = [{
      title: '嫣红',
      name: 'red',
      color: '#e54d42'
    },
    {
      title: '桔橙',
      name: 'orange',
      color: '#f37b1d'
    },
    {
      title: '明黄',
      name: 'yellow',
      color: '#fbbd08'
    },
    {
      title: '橄榄',
      name: 'olive',
      color: '#8dc63f'
    },
    {
      title: '森绿',
      name: 'green',
      color: '#39b54a'
    },
    {
      title: '天青',
      name: 'cyan',
      color: '#1cbbb4'
    },
    {
      title: '海蓝',
      name: 'blue',
      color: '#0081ff'
    },
    {
      title: '姹紫',
      name: 'purple',
      color: '#6739b6'
    },
    {
      title: '木槿',
      name: 'mauve',
      color: '#9c26b0'
    },
    {
      title: '桃粉',
      name: 'pink',
      color: '#e03997'
    },
    {
      title: '棕褐',
      name: 'brown',
      color: '#a5673f'
    },
    {
      title: '玄灰',
      name: 'grey',
      color: '#8799a3'
    },
    {
      title: '草灰',
      name: 'gray',
      color: '#aaaaaa'
    },
    {
      title: '墨黑',
      name: 'black',
      color: '#333333'
    },
    {
      title: '雅白',
      name: 'white',
      color: '#ffffff'
    }
  ]
  export default {
    computed: {
      setPadding() {
        let style = {
          padding: 0
        }
        if (this.articleData?.content_padding) {
          switch (this.articleData?.content_padding) {
            case '小':
              style.padding = '5px'
              break;
            case '中':
              style.padding = '10px'
              break;
            case '大':
              style.padding = '15px'
              break;
            default:
              break;
          }
        }
        return style
      },

    },
    data() {
      return {
        shareLogo: "",
        articleData: {},
        content_no: '',
        cate_name: '',
        serviceName: 'srvdaq_cms_content_select',
        storeName: '',
        storeNo: '',
        // storeInfo: {},
        qrCodeText: "",
        qrcodePath: "",
        codeSize: uni.upx2px(700),
        invite_user_no: "",
        bottomButtons: [
          // {
          //   button_label: '按钮1'
          // },
          // {
          //   button_label: '按钮1'
          // },
          // {
          //   button_label: '按钮按钮按钮按钮按钮1'
          // },
          // {
          //   button_label: '按钮按钮按钮按钮按钮按钮按钮1'
          // },
          // {
          //   button_label: '按钮1'
          // },
          // {
          //   button_label: '按钮1'
          // }
        ]
      };
    },
    methods: {
      async onBtn(e) {
        if ((!this.userInfo.nick_name || this.userInfo.nick_name === '微信用户') && this.userInfo?.userno) {
          let isOk = await this.checkBasicUserInfo()
          if (isOk) {
            await this.initApp()
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
              return
            }
          } else {
            return
          }
        }

        if (e.$orig) {
          e = e.$orig;
        }
        let url = "";
        if (e?.dest_page) {
          url = e.dest_page;
        }

        try {
          let data = {
            storeNo: this.setStoreNo,
            ...this.$data,
            ...this.globalVariable
          }
          url = this.renderStr(url, data);
          url = url.trim();
        } catch (e) {
          //TODO handle the exception
        }

        let navType = "navigateTo";
        if (e.navType) {
          navType = e.navType;
        }
        if(e.navigate_type){
          navType = e.navigate_type;
        }
        if (navType === '视频号主页') {
          // 打开视频号主页 需要视频号id（finderUserName）
          if (e.finder_user_name) {
            wx.openChannelsUserProfile({
              finderUserName: e.finder_user_name,
              fail: (err) => {
                if (err?.errno === 1416103) {
                  uni.showToast({
                    title: '打开视频好主页需要小程序与视频号的主体相同或为关联主体',
                    icon: 'none'
                  })
                }
              }
            })
          } else {
            uni.showToast({
              title: '未配置视频号ID',
              icon: 'none'
            })
          }
          return
        } else if (navType === '视频号视频') {
          // 打开视频号视频 需要视频号id（finderUserName）和视频id（feedId）
          if (e.finder_user_name && e.feed_id) {
            wx.openChannelsActivity({
              finderUserName: e.finder_user_name,
              feedId: e.feed_id,
              fail: (err) => {
                console.log(err)
              }
            })
          }
          return
        } else if (navType === "miniProgram") {
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
          if (e.url && e.url.indexOf('https') == 0) {
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
      setBtnClass(item = {}) {
        let str = `col-${this.bottomButtons.length}`
        if (this.bottomButtons.length > 4) {
          str = 'col-1'
          if (this.bottomButtons.length % 2 === 0) {
            str = 'col-2'
          }
        }
        if (item.bg_color) {
          if(Array.isArray(ColorList)&&ColorList.length>0){
            ColorList.forEach(cur=>{
              const color = `${cur.title}  ${cur.color}`
              if(item.bg_color ===  color){
                str += ` bg-${cur.name}`
              } 
            })
          }
        } else {
          str += ` bg-white`
        }
        return str
      },
      getBottomBtn() {
        // 查找文章底部按钮
        const url = `/health/select/srvhealth_page_item_buttons_select`
        const req = {
          "serviceName": "srvhealth_page_item_buttons_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "article_no",
            "ruleType": "eq",
            "value": this.content_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 20
          },
        }
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            this.bottomButtons = res?.data?.data
          }
        })
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
      },
      toStore() {
        if (this.storeNo) {
          uni.redirectTo({
            url: `/pages/home/home?store_no=${this.storeNo}&invite_user_no=${this.invite_user_no}`
          })
        }
      },
      getArticleData() {
        let app = 'daq';
        let url = this.getServiceUrl(app, this.serviceName, 'select');
        let req = {
          serviceName: this.serviceName,
          colNames: ['*'],
          condition: [{
            colName: 'content_no',
            ruleType: 'in',
            value: this.content_no
          }]
        };
        if (this.serviceName === 'srvsalesroom_shop_select') {
          req.condition = [{
            colName: 'no',
            ruleType: 'eq',
            value: this.content_no
          }];
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
            this.articleData = res.data.data[0];
            if (res.data.data[0].title) {
              uni.setNavigationBarTitle({
                title: res.data.data[0].title
              });
            }
          } else {
            uni.showModal({
              title: '提示',
              content: '未查找到对应文章，即将返回首页',
              success(res) {
                if (res.confirm) {
                  uni.redirectTo({
                    url: '/pages/pedia/pedia'
                  });
                }
              }
            });
          }
        });
      },
    },
    onShareTimeline() {
      let query =
        `from=shareTimeline&content_no=${this.content_no}&share_type=shareArticle`;
      if (this.storeNo) {
        query += `&store_no=${this.storeNo}`
      }
      if (this.storeName) {
        query += `&store_name=${this.storeName}`
      }
      if (this.cate_name) {
        query += `&cate_name=${this.cate_name}`
      }
      if (this.userInfo && this.userInfo.userno) {
        query += `&invite_user_no=${this.userInfo.userno}`
      }
      if (this.shareLogo) {
        query += `&logo=${this.shareLogo}`
      }
      this.saveSharerInfo(this.userInfo, query, 'timeline');
      return {
        imageUrl: this.shareLogo || null,
        title: this.articleData.title,
        query: query
      };
    },
    onShareAppMessage() {
      let path =
        `/publicPages/article/article?from=share&content_no=${this.content_no}&share_type=shareArticle`;
      if (this.storeNo) {
        path += `&store_no=${this.storeNo}`
      }
      if (this.storeName) {
        path += `&store_name=${this.storeName}`
      }
      if (this.cate_name) {
        path += `&cate_name=${this.cate_name}`
      }
      if (this.shareLogo) {
        path += `&logo=${this.shareLogo}`
      }
      if (this.userInfo && this.userInfo.userno) {
        path += `&invite_user_no=${this.userInfo.userno}`
      }
      this.saveSharerInfo(this.userInfo, path);
      let title = this.articleData.title || this.storeName
      title = this.renderEmoji(title)
      return {
        imageUrl: this.shareLogo || null,
        title: title,
        path: path
      };
    },
    async onLoad(option) {
      // #ifdef MP-WEIXIN
      await this.initApp(option)
      //#endif
      if (option.article) {
        this.articleData = JSON.parse(decodeURIComponent(option.article));
      }
      if (option.store_no) {
        this.storeNo = option.store_no
      }
      if (option.logo) {
        this.shareLogo = decodeURIComponent(option.logo)
      }
      if (option.store_name) {
        this.storeName = option.store_name
      }
      if (option.cate_name) {
        this.cate_name = option.cate_name;
      }
      if (option.serviceName) {
        this.serviceName = decodeURIComponent(option.serviceName);
      }
      if (option.invite_user_no) {
        this.invite_user_no = option.invite_user_no
      }
      if (option.q) {
        let text = this.getDecodeUrl(option.q);
        if (text && text.indexOf('https://wx2.100xsys.cn/article/') !== -1) {
          let result = text.split('https://wx2.100xsys.cn/article/')[1];
          if (result.split('/').length >= 2) {
            option.content_no = result.split('/')[0];
            option.invite_user_no = result.split('/')[1];
          } else if (result.split('/').length === 1) {
            option.content_no = result.split('/')[0];
          }
          option.from = 'share'
        }
      }
      this.checkOptionParams(option);

      if (option.content_no) {
        this.content_no = decodeURIComponent(option.content_no);
        this.getArticleData();
        this.getBottomBtn()
        let result = ''
        this.qrCodeText = ''
        this.qrcodePath = ''
        if (this.userInfo && this.userInfo.userno && this.storeInfo && this.storeInfo.store_no) {
          result = `https://wx2.100xsys.cn/article/${option.content_no}/${this.userInfo.userno}`
        } else {
          result = `https://wx2.100xsys.cn/article/${option.content_no}`
        }
        this.qrCodeText = result
      }
    }
  };
</script>

<style lang="scss">
  .article-wrap {
    background-color: #fff;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    // padding: 20upx 0 40upx;
    min-height: 100vh;

    .top {
      display: flex;
      flex-wrap: wrap;
      padding: 20rpx;

      .left {
        flex: 1;
      }
    }

    .head-image {
      width: 100%;
      height: 250rpx;
      margin-bottom: 20rpx;
      border-radius: 20rpx;
      overflow: hidden;

      .image {
        width: 100%;
        height: 100%;
      }
    }

    // box-shadow: -5px -20px 5px rgba(0, 0, 100, 0.27), 1px 0px 10px rgba(0, 100, 100, 0.1) inset;
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;

      .title {
        min-height: 100upx;
        font-weight: 600;
        font-size: 40upx;
        display: flex;
        align-items: center;
        flex: 1;
      }
    }

    .category {
      width: 100%;
      font-size: 24upx;
      margin-left: 20upx;
      line-height: 60upx;
      height: 60upx;
      display: flex;
      justify-content: flex-end;
      padding-right: 30upx;
      color: #0081ff;
      align-items: flex-end;
    }

    .create-time {
      color: #888;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      // flex-direction: column;

      // margin: 20upx 0 0;
      .store-name {
        color: #3d66bc;
      }
    }

    .content {
      min-height: 800upx;
      // margin-top: 30upx;
      padding: 0;
      border-top: dashed 1px #eee;
      line-height: 60upx;
      font-size: 36upx;
      word-break: break-all;
    }

    .footer {
      display: flex;
      flex-direction: column;
      width: 100%;
      align-items: center;
      line-height: 60upx;
      margin-top: 60px;

      // justify-content: space-around;
      .modify-time {
        color: #999;
      }
    }
  }

  .hospital-top {
    background-color: #fff;
    display: flex;
    margin-bottom: 20rpx;
    position: relative;
    padding-top: 20rpx;
    flex-wrap: wrap;

    .logo {
      width: 120rpx;
      height: 120rpx;
      border-radius: 20rpx;
      margin-right: 20rpx;
      font-size: 60rpx;
      font-weight: bold;
      line-height: 100rpx;
      text-align: center;
      // position: absolute;
      border: 4rpx solid #fff;
    }

    .left {
      display: flex;
      flex-direction: column;
      width: calc(100% - 150rpx);

      .top {
        display: flex;
        justify-content: space-between;
        padding-right: 20rpx;

        .name {
          width: 500rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: wrap;
          font-size: 32rpx;
          color: #333;
          font-weight: bold;
          flex: 1;
        }
      }

      .bottom {
        padding-top: 10rpx;
        color: #aaa;

        display: flex;

        .cuIcon-locationfill {
          position: relative;
          top: -10px;
        }

        .address {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
          flex: 1;
          font-size: 14px;
        }
      }
    }
  }

  .bottom-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    text-align: center;
    padding: 10px;
    margin-bottom: 20px;
    position: fixed;
    bottom: 20px;
    width: 100%;
    .bottom-button {
      padding: 6px;
      min-height: 36px;
      border: 1px solid #f1f1f1;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: auto;
      margin-bottom: 5px;
    }

    .col-1 {
      width: 100%;
      border-radius: 20px;
    }

    .col-2 {
      width: 50%;
      border-radius: 20px 0 0 20px;

      &:nth-child(2n) {
        border-radius: 0 20px 20px 0;
        border-left: none;
      }
    }

    .col-3 {
      // width: 30%;
      flex: 1;
      margin-right: 10px;

      &:last-child {
        margin-right: 0;
      }
    }

    .col-4 {
      width: 25%;
      margin: 0;
      border-left: none;
      border-radius: 0;

      &:first-child {
        border-left: 1px solid #f1f1f1;
      }
    }

  }
</style>
