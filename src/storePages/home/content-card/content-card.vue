<template>
  <view class="content-card" v-if="data">
    <view class="title" v-if="colsMap.title">
      <text class="text">{{data[colsMap.title]||''}}</text>
      <text class="cuIcon-qr_code" v-if="colsMap.qrcode&&data[colsMap.qrcode]" @click="toPreview('qrcode')"></text>
    </view>
    <view class="content">
      <image :src="getImagePath(data[colsMap.icon])" mode="aspectFill" class="icon"
        v-if="colsMap.icon&&data[colsMap.icon]" @click="toPreview('icon')"></image>
      <view class="right-content">
        <view class="desc" v-html="data[colsMap.desc]" v-if="colsMap.desc">
        </view>
        <view class="address" v-if="colsMap.address">
          <text>地址：</text>
          <text v-html="data[colsMap.address]"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        data: null,
        icons: [],
        qrcodes: []
      }
    },
    props: {
      queryOptions: {
        type: Object
      },
      pageItem: {
        type: Object
      },
    },
    computed: {
      cfg() {
        return this.pageItem?.more_config?.content_cfg
      },
      app() {
        return this.pageItem?.more_config?.content_cfg?.app || uni.getStorageSync('activeApp')
      },
      service() {
        return this.pageItem?.more_config?.content_cfg?.service
      },
      condition() {
        let cond = this.queryOptions.card_condition || this.pageItem?.more_config?.content_cfg?.condition;
        if (typeof cond === 'string') {
          try {
            cond = JSON.parse(cond)
          } catch (e) {
            //TODO handle the exception
          }
        }
        if (Array.isArray(cond) && cond.length > 0) {
          cond = cond.map(item => {
            if (item.value && typeof item.value === 'string') {
              item.value = this.renderStr(item.value, {
                ...this.globalVariable
              })
            }
            return item
          })
        }
        return cond
      },
      colsMap() {
        return this.cfg?.cols_map || {}
      },
    },
    created() {
      this.getData()
    },
    methods: {
      async loadImages(type) {
        let imgs = []
        let value = ''
        if (type === 'icon' && this.icons.length === 0) {
          value = this.data[this.colsMap.icon]
        } else if (this.qrcodes.length === 0) {
          value = this.data[this.colsMap.qrcode]
        }
        let imgList = await this.getFilePath(value);
        if (Array.isArray(imgList) && imgList.length > 0) {
          imgList = imgList.reverse()
          for (let i = 0; i < imgList.length; i++) {
            const url =
              `${this.$api.getFilePath}${imgList[ i ].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`;
            imgs.push(url)
          }
        }
        if (type === 'icon' && this.icons.length === 0) {
          this.icons = imgs
        } else if (type === 'qrcode' && this.qrcodes.length === 0) {
          this.qrcodes = imgs
        }
        return imgs
      },
      toPreview(e) {
        this.loadImages(e).then(res => {
          uni.previewImage({
            urls: res
          })
        })
      },
      getData() {
        const url = `/${this.app}/select/${this.service}`
        const req = {
          colNames: ['*'],
          serviceName: this.service,
          condition: this.condition || [],
          page: {
            pageNo: 1,
            rownumber: 1
          }
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.data = res.data.data[0]
          }
        })
      }
    },
  }
</script>

<style scoped lang="scss">
  .content-card {
    padding: 10px;

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;

      .text {
        font-size: 16px;
        font-weight: bold;
      }
    }

    .content {
      // display: flex;
      color: #666;

      .icon {
        width: 60px;
        height: 60px;
        margin-right: 10px;
        float: left;
      }

      .right-content {
        flex: 1;

        .desc {
          margin-bottom: 5px;
        }
      }
    }
  }
</style>
