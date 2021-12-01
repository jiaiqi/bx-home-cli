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
          <text>{{ dayjs(articleData.create_time).format("YYYY-MM-DD") }}</text>
        </view>
      </view>
      <view class="right qr-code">
        <uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" v-if="qrCodeText" :size="codeSize" class="qrcode-canvas"
          foregroundColor="#333" makeOnLoad @makeComplete="qrcodeCanvasComplete">
        </uni-qrcode>
        <image :src="qrcodePath" class="qr-code-image" mode="aspectFit" v-if="qrCodeText && qrcodePath"
          @click="toPreviewImage(qrcodePath)"></image>
      </view>
    </view>

    <view class="content">
      <rich-text :nodes="richTextNodes" space="nbsp"></rich-text>
    </view>

    <view class="footer">
      <!-- #ifdef MP-WEIXIN -->
      <ad unit-id="adunit-7318fe2284dd9c26" ad-type="video" ad-theme="white"></ad>
      <!-- #endif -->

    </view>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  import parseHtml from '@/static/js/html-parser.js'
  export default {
    computed: {
      ...mapState({
        userInfo: state => state.user.userInfo
      }),
      richTextNodes() {
        if (this.articleData) {
          if (this.articleData.content && typeof this.articleData.content === 'string') {
            return parseHtml(this.articleData.content.replace(/\<img/gi, '<img width=100% height=100%'))
          } else if (this.articleData.introduce && typeof this.articleData.content === 'introduce') {
            return parseHtml(this.articleData.introduce.replace(/\<img/gi, '<img width=100% height=100%'))
          }
        }
      }
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
        invite_user_no: ""
      };
    },
    methods: {
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
      },
      toStore() {
        if (this.storeNo) {
          uni.navigateTo({
            url: `/pages/home/home?store_no=${this.storeNo}&invite_user_no=${this.invite_user_no || 'jiaqi'}`
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
      this.saveSharerInfo(this.userInfo, query,'timeline');
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
      return {
        imageUrl: this.shareLogo || null,
        title: this.articleData.title || this.storeName,
        path: path
      };
    },
    onLoad(option) {
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
  .qr-code {
    background-color: #fff;
    width: 150rpx;
    height: 150rpx;
    margin: 0 auto;

    .qrcode-canvas {
      position: fixed;
      top: -999999px;
    }

    .qr-code-image {
      width: 150rpx;
      height: 150rpx;
    }
  }

  .article-wrap {
    background-color: #fff;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    padding: 20upx 20upx 40upx;
    min-height: 100vh;

    .top {
      display: flex;
      flex-wrap: wrap;

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
      // align-items: center;
      flex-direction: column;

      // margin: 20upx 0 0;
      .store-name {
        color: #3d66bc;
      }
    }

    .content {
      min-height: 800upx;
      margin-top: 30upx;
      padding: 30upx 0;
      border-top: dashed 1px #eee;
      line-height: 60upx;
      font-size: 36upx;
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
</style>
