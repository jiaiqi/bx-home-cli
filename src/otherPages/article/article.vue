<template>
  <view class="page-wrap">
    <view class="article-content">
      <!-- <video src=""></video> -->
      <view class="video-box" v-if="videoSrc">
        <video class="video" :src="videoSrc" :style="[{height:videoHeight}]"></video>
      </view>
      <view class="content-box">
        <mp-html :content="content" />
      </view>
    </view>
    <view class="loading-box" v-if="loading">
      <u-loading :show="true"></u-loading>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        userAliyun: false,
        service: '',
        app: '',
        idCol: '',
        idVal: '',
        videoCol: '',
        textCol: '',
        titleCol: '',
        data: null,
        loading: false,
        videoInfo: null,
        videoSrc: ''
      }
    },
    computed: {
      videoHeight() {
        if (this.videoInfo?.width && this.videoInfo?.height) {
          let screenWidth = uni.upx2px(750)
          let res = screenWidth * this.videoInfo?.height / this.videoInfo?.width
          if (!isNaN(Number(res))) {
            return `${res}px`
          }
        }
      },

      content() {
        let res = ''
        if (this.textCol && this.data && this.data[this.textCol]) {
          res = this.data[this.textCol].replace(/\<img/gi, '<img width=100%').replace(/\<video/gi, '<video width=100%')
        }
        return res
      }
    },
    methods: {
      async getVideoSrc() {
        if (this.videoCol && this.data && this.data[this.videoCol]) {
          if (this.userAliyun) {
            return await this.getAliyunSrc()
          } else {
            return this.getImagePath(this.data[this.videoCol], true)
          }
        }
      },
      async getAliyunSrc() {
        const url = `${this.$api.serverURL}/file/getPlayAddress?fileNo=${this.data[this.videoCol]}`
        let res = await this.$http.get(url)
        if (Array.isArray(res?.data?.data?.playUrl)&&res?.data?.data?.playUrl.length>0) {
          return res?.data?.data?.playUrl[0]
        }
      },
      async getData() {
        const {
          service,
          app,
          idCol,
          idVal
        } = this
        if (service && idCol && idVal) {
          const req = {
            condition: [{
              colName: idCol,
              ruleType: 'eq',
              value: idVal
            }],
            page: {
              pageNo: 1,
              rownumber: 1
            }
          };
          this.loading = true
          const res = await this.$fetch('select', service, req, app);
          this.loading = false
          if (res.success && res.data.length > 0) {
            this.data = res.data[0]
            this.videoSrc = await this.getVideoSrc()
            if (this.videoSrc) {
              uni.getVideoInfo({
                src: this.videoSrc,
                success: (res) => {
                  this.videoInfo = res
                }
              })
            }
            if (this.titleCol && this.data[this.titleCol]) {
              uni.setNavigationBarTitle({
                title: this.data[this.titleCol]
              })
            }
          }
        }
      },
    },
    onLoad(option) {
      const {
        service,
        app,
        idCol,
        idVal,
        textCol,
        videoCol,
        titleCol,
        userAliyun
      } = option
      if (service) {
        this.service = service
        if (app) {
          this.app = app
        }
        if (idCol) {
          this.idCol = idCol
        }
        if (idVal) {
          this.idVal = idVal
        }
        if (textCol) {
          this.textCol = textCol
        }
        if (videoCol) {
          this.videoCol = videoCol
        }
        if (titleCol) {
          this.titleCol = titleCol
        }
        if (userAliyun) {
          this.userAliyun = userAliyun
        }
        this.getData()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .loading-box {
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-wrap {
    background-color: #f8f8f8;
  }

  .video-box {
    width: 100%;

    .video {
      width: 100%;
    }
  }

  .content-box {
    padding: 20px;
    background-color: #fff;
  }
</style>
