<template>
  <view class="content">
    <r-canvas ref="rCanvas"></r-canvas>
  </view>
</template>

<script>
  export default {
    props: {
      qrcodeText: {
        type: String
      },
      mainImage: {
        type: String
      },
      title: {
        type: String
      },
      price: {
        type: [String, Number]
      },
      oldPrice: {
        type: [String, Number]
      }
    },
    mounted() {
      // this.init()
    },
    methods: {
      error(msg) {
        uni.showModal({
          title: '错误信息',
          content: msg,
          showCancel: false
        })
      },
      init() {
        this.$nextTick(async () => {
          uni.showLoading({
            title: '绘制中',
            mask: true
          })
          let that = this
          await this.$refs.rCanvas.init({
            canvas_id: 'rCanvas',
            background_color: '#fff',
            canvas_width: 375,
            canvas_height: 510,
            scale: 1
          }).catch(err => {
            this.error(err)
          })

          // await this.$refs.rCanvas.drawImage({
          //   url: that.getImagePath(that.mainImage,true),
          //   x: 0,
          //   y: 0,
          //   w: 375,
          //   h: 375,
          //   border_radius: 4
          // }).catch(err => {
          //   this.error(err)
          // })

          await this.$refs.rCanvas.drawRect({
            w: 34,
            h: 20,
            x: 20,
            y: 395,
            color: 'red',
            font_size: 12,
            border_radius: 5
          }).catch(err => {
            this.error(err)
          })

          await this.$refs.rCanvas.drawText({
            text: '活动',
            x: 26,
            y: 410,
            font_size: 12,
            font_color: 'rgba(255,255,255,1)'
          }).catch(err => {
            this.error(err)
          })

          await this.$refs.rCanvas.drawText({
            text: that.title || '小米10【顺丰当天发+选无线充】xiaomi/小米10 5g手机骁龙865智能手机小米官方旗舰店5G手机正品小米10尊享版',
            x: 20,
            y: 412,
            max_width: 220,
            font_size: 18,
            line_height: 20,
            line_clamp: 2,
            font_color: 'black'
          }).catch(err => {
            this.error(err)
          })

          // await this.$refs.rCanvas.drawImage({
          //   url: './b.jpg',
          //   x: 260,
          //   y: 390,
          //   w: 100,
          //   h: 100,
          //   border_radius: 4
          // }).catch(err => {
          //   this.error(err)
          // })

          let textList = [{
              text: '￥',
              font_color: 'red',
              font_size: 15
            },
            {
              text: this.price,
              font_color: 'red',
              font_size: 24
            },

          ]

          await this.$refs.rCanvas.drawSpecialText({
            general: {
              x: 20,
              y: 480,
            },
            list: textList
          }).catch(err => {
            this.error(err)
          })

          // 生成海报
          await this.$refs.rCanvas.draw((result) => {
            uni.hideLoading()
            uni.showModal({
              title: '提示',
              content: '是否下载当前生成的海报？',
              success: (res) => {
                if (res.confirm) {
                  // 保存图片
                  this.$refs.rCanvas.saveImage(result.tempFilePath).catch(err => {
                    this.error(err)
                  })
                }
              }
            })
          }).catch(err => {
            this.error(err)
          })
        })
      }
    },
  }
</script>

<style scoped>

</style>
