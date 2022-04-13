<template>
  <view class="cu-modal transparent" :class="{show:modalName==='shareDialog'}" @click="hideModal"
    v-if="modalName==='shareDialog'">
    <view class="cu-dialog transparent" @click.stop="hideModal">
      <view class="share-dialog" v-if="storeInfo" @click.stop="">
        <view class="preview-img">
          <view class="title">
            分享预览
          </view>
          <view class="share-preview">
            <view class="share-top text-left sm padding-bottom-xs">
              <image class="app-logo" :src="getImagePath(storeInfo.logo,true)" mode="aspectFit"
                v-if="storeInfo&&storeInfo.logo&&miniProgramName!=='百想首页'"></image>
              <image class="app-logo" src="/static/basicprofile.jpg" mode="" v-else></image>
              <text>{{miniProgramName||''}}</text>
            </view>
            <view class="share-title">
              {{storeUser.person_name||storeUser.user_name||''}}邀请您使用【{{storeInfo.name}}】
            </view>
            <image class="share-image" v-if="storeInfo.wx_share_img||storeInfo.image||storeInfo.logo"
              :src="getImagePath(storeInfo.wx_share_img||storeInfo.image||storeInfo.logo,true)" mode="aspectFill">
            </image>
          </view>
          <view class="share-bottom">
            <text class="cuIcon-link margin-right-xs text-purple"></text>小程序
          </view>
        </view>
        <view class="bottom-bar">
          <view class="share-list">
            <view class="share-item">
              <button class="cu-btn bg-transparent" open-type="share">
                <view class="share-icon bg-orange">
                  <text class="cuIcon-weixin"></text>
                </view>
              </button>
              <view class="share-label">
                微信
              </view>
            </view>
            <view class="share-item" @click="makePoster" v-if="posterNo">
              <button class="cu-btn bg-transparent">
                <view class="share-icon bg-orange">
                  <text class="cuIcon-picfill"></text>
                </view>
              </button>
              <view class="share-label">
                生成海报
              </view>
            </view>
          </view>
          <view class="bottom-button">
            <button class="cu-btn bg-white" @click="hideModal()">取消分享</button>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view class="cu-modal transparent" :class="{show:modalName==='sharePoster'}" @click="hideModal()"
    v-else-if="modalName==='sharePoster'">
    <view class="cu-dialog transparent" @click.stop="hideModal">
      <view class="share-poster" @click.stop="">
        <image :src="postPath" mode="aspectFit" show-menu-by-longpress class="poster-image" :lazy-load="true"></image>
        <view class="margin-tb">
          <button class="cu-btn bg-blue round" style="width: 60%;" type="primary" @click="saveTolbum">保存到相册</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    name: "share-dialog",
    data() {
      return {
        modalName: "",
        postPath: "", //海报图片地址
        resultText: "", //二维码内容
        shareTitle: ''
      };
    },
    props: {
      posterNo: {
        type: String,
        default: ''
      },
    },
    computed: {
      miniProgramName() {
        return this?.$api?.miniProgramName || '百想首页'
      },
      storeInfo() {
        return this.$store?.state?.app?.storeInfo || {}
      },
      storeUser() {
        return this.$store?.state?.user?.storeUserInfo || {}
      }
    },
    methods: {
      open(e) {
        this.modalName = 'shareDialog'
        if (e?.text) {
          this.resultText = e.text
        }
        if (e?.title) {
          this.shareTitle = e.title
        }
      },
      saveTolbum() {
        // 保存海报到相册
        const postUrl = this.postPath
        const self = this
        console.log(postUrl)
        uni.authorize({
          scope: 'scope.writePhotosAlbum',
          success: () => {
            uni.showLoading({
              title: '下载中...'
            })
            uni.downloadFile({
              url: postUrl,
              success: (res) => {
                if (res.statusCode === 200) {
                  console.log('下载成功', res);
                  const filePath = res.tempFilePath
                  uni.saveImageToPhotosAlbum({
                    filePath: filePath,
                    success: function(res) {
                      uni.hideLoading()
                      console.log('save success', res);
                      uni.showToast({
                        title: '图片已成功保存到相册'
                      })
                      self.hideModal()
                    },
                    fail: (res) => {
                      console.log(res)
                      uni.hideLoading()
                    }
                  });
                }
              },
              complete() {
                uni.hideLoading()
              }
            });

          },
          complete() {}
        })
      },
      async makePoster() {
        // 生成海报
        let posterNo = this.posterNo;
        if (!posterNo) {
          uni.showToast({
            title: '未配置海报模板！',
            icon: 'none'
          })
          return
        }
        let resultText = ''
        if (this.userInfo?.userno && this.storeInfo?.store_no) {
          resultText =
            `https://wx2.100xsys.cn/shareClinic/${this.storeInfo.store_no}/${this.userInfo.userno}`;
        } else {
          resultText = `https://wx2.100xsys.cn/shareClinic/${this.storeInfo.store_no}`;
        }
        if (resultText) {
          resultText = encodeURIComponent(resultText)
        }
        resultText = this.resultText || resultText
        const postUrl = await this.getPosterUrl(posterNo, resultText)
        this.postPath = postUrl
        this.modalName = 'sharePoster'
      },
      hideModal() {
        this.modalName = ''
      }
    },
  }
</script>

<style lang="scss" scoped>
  .cu-modal.transparent {
    z-index: 9999;
  }

  .cu-dialog.transparent {
    background-color: transparent;
    z-index: 9999;
    width: 100vw !important;
    border-radius: 0;
  }

  .share-dialog {
    position: relative;
    height: 100vh;
    display: flex;
    align-items: center;
    // justify-content: center;
    flex-direction: column;

    .preview-img {
      padding: 10px;
      // margin-top: 200rpx;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .share-top {
        display: flex;
        align-items: center;
        font-size: 12px;
      }

      .app-logo {
        width: 20px;
        height: 20px;

        margin-right: 5px;
      }

      .share-title {
        font-size: 16px;
        text-align: left;
        padding: 0px 10px 10px;
      }

      .title {
        padding: 20px;
        font-size: 16px;
        color: #fff;
      }

      .share-preview {
        background-color: #fff;
        border-radius: 10px 10px 0 0;
        padding: 10px;
      }

      .share-image {
        width: 300px;
        height: 200px;
      }

      .share-bottom {
        background-color: #fff;
        text-align: left;
        color: #888;
        border-radius: 0 0 10px 10px;
        padding: 10px;
      }
    }

    .bottom-bar {
      // position: absolute;
      // bottom: 0;
      width: 100vw;
      background-color: #fff;

      .share-list {
        display: flex;
        justify-content: center;
        padding: 20px;

        .share-item {
          width: 100px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;

          .bg-transparent {
            height: 50px;
            width: 50px;
            padding: 0;
            margin: 0;
            background-color: transparent;
          }

          .share-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 30px;

            &.bg-green {
              background-color: #6cca58;
            }
          }

          .share-label {
            text-align: center;
            margin-top: 5px;
          }
        }
      }

      .bottom-button {
        padding: 10px;
        border-top: 1px solid #f1f1f1;

      }
    }
  }

  .poster-image {
    // width: 100%;
    width: 90vw;
    height: 70vh;
    // background-color: #F1f1f1;
  }
</style>
