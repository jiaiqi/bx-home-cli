<!--
 * @Description: 生成海报组件
 * @Version: 1.0.0
 * @Autor: hch
 * @Date: 2020-08-07 14:48:41
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-07-31 18:11:35
 * 保存海报按钮和关闭按钮 在html代码中写出来 绑定点击方法然后透明 再用canvas 覆盖
-->

<template>
  <view class="canvas-content" v-show="canvasShow"
    :style="'width:' + poster.w + 'px; height:' + poster.h + 'px;top:'+poster.y+system.menuButtonTop+'px;left:'+poster.x+'px;'">
    <!-- :style="'width:' + system.w + 'px; height:' + system.h + 'px;top:'+system.menuButtonTop+'px'"> -->
    <!-- 遮罩层 -->
    <view class="canvas-mask"></view>
    <!-- 海报 -->
    <!-- :width="system.w" :height="system.h" 支付宝必须要这样设置宽高才有效果 -->
    <canvas class="canvas" canvas-id="myCanvas" id="myCanvas"
      :style="'width:' + poster.w + 'px; height:' + poster.h + 'px;'" :width="poster.w"
      :height="poster.h"></canvas>
    <view class="button-wrapper" :style="'width:' + poster.w + 'px;'">
      <!-- 保存海报按钮 -->
      <!-- #ifndef MP-QQ -->
      <!-- cover-view 标签qq小程序有问题 -->
      <cover-view class="save-btn" @tap="handleSaveCanvasImage">保存海报</cover-view>
      <cover-view class="save-btn cancel-btn" @tap="handleCanvasCancel">取消</cover-view>
      <!-- #endif -->
      <!-- #ifdef MP-QQ -->
      <view class="save-btn" @tap="handleSaveCanvasImage">保存海报</view>
      <view class="save-btn cancel-btn" @tap="handleCanvasCancel">取消</view>
      <!-- #endif -->
    </view>

    <uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" :size="codeSize" class="qrcode-canvas" foregroundColor="#333"
      makeOnLoad @makeComplete="qrcodeCanvasComplete" ref="qrcodeCanvas" v-if="qrCodeText">
    </uni-qrcode>
  </view>
</template>

<script>
  import {
    drawSquarePic,
    drawTextReturnH,
    getSystem
  } from './utils'
  export default {
    data() {
      return {
        codeSize: uni.upx2px(700),
        qrcodePath: "",
        system: {},
        canvasShow: false
      }
    },
    props: {
      posterData: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      qrCodeText() {
        return this.posterData?.codeImg?.text
      },
      /**
       * @description: 计算海报背景数据
       * @param {*}
       * @return {*}
       * @author: hch
       */
      poster() {
        let data = this.posterData
        let system = this.system
        let posterBg = {
          url: data.poster.url,
          r: data.poster.r * system.scale,
          w: data.poster.w * system.scale,
          h: data.poster.h * system.scale,
          x: (system.w - data.poster.w * system.scale) / 2,
          y: (system.h - data.poster.h * system.scale) / 2,
          p: data.poster.p * system.scale
        }
        return posterBg
      },
      /**
       * @description: 计算海报头部主图
       * @param {*}
       * @return {*}
       * @author: hch
       */
      mainImg() {
        let data = this.posterData
        let system = this.system
        let posterMain = {
          url: data.mainImg.url,
          r: data.mainImg.r * system.scale,
          w: data.mainImg.w * system.scale,
          h: data.mainImg.h * system.scale,
          x: data.mainImg.x ? data.mainImg.x * system.scale : (system.w - data.mainImg.w * system.scale) / 2,
          y: data.mainImg.y ? data.mainImg.y * system.scale : this.poster.y + data.poster.p * system.scale
        }
        return posterMain
      },
      /**
       * @description: 计算海报标题
       * @param {*}
       * @return {*}
       * @author: hch
       */
      title() {
        let data = this.posterData
        let system = this.system
        let posterTitle = data.title
        posterTitle.x = posterTitle.x ? posterTitle.x * system.scale : this.mainImg.x
        posterTitle.y = posterTitle.y ? posterTitle.y * system.scale : this.mainImg.y + this.mainImg.h + data.title.mt *
          system.scale
        return posterTitle
      },
      /**
       * @description: 计算小程序码
       * @param {*}
       * @return {*}
       * @author: hch
       */
      codeImg() {
        let data = this.posterData
        let system = this.system
        let posterCode = {
          url: data.codeImg.url,
          r: data.codeImg.r * system.scale,
          w: data.codeImg.w * system.scale,
          h: data.codeImg.h * system.scale,
          x: data.codeImg.x ? data.codeImg.x * system.scale : (system.w - data.codeImg.w * system.scale) / 2,
          y: data.codeImg.y ? data.codeImg.y * system.scale : data.codeImg.mt * system.scale //y需要加上绘图后文本的y
        }
        return posterCode
      }
    },
    created() {
      // 获取设备信息
      this.system = getSystem()
    },
    methods: {
      /**
       * @description: 生成二维码图片地址
       * 
       */
      async makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          let qrcodePath = await this.$refs.qrcodeCanvas.make()
          return qrcodePath
        }
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
      },
      /**
       * @description: 展示海报
       * @param {type}
       * @return {type}
       * @author: hch
       */
      posterShow() {
        this.canvasShow = true
        this.creatPoster()
      },
      /**
       * @description: 将base64图片转网络图片
       */
      sendCode(code) {
        /*code是指图片base64格式数据*/
        //声明文件系统
        const fs = wx.getFileSystemManager();
        //随机定义路径名称
        var times = new Date().getTime();
        var imgPath = wx.env.USER_DATA_PATH + '/' + times + '.png';
        //将base64图片写入
        return new Promise(resolve => {
          fs.writeFile({
            filePath: imgPath,
            data: code.slice(22),
            encoding: 'base64',
            success: () => {
              //写入成功了的话，新的图片路径就能用了
              resolve(imgPath)
            }
          });
        })
      },
      /**
       * @description: 生成海报
       * @author: hch
       */
      async creatPoster() {
        uni.showLoading({
          title: '生成海报中...'
        })
        let qrcodePath = await this.makeQrCode()
        const ctx = uni.createCanvasContext('myCanvas', this)
        this.ctx = ctx
        ctx.clearRect(0, 0, this.system.w, this.system.h) //清空之前的海报
        ctx.draw() //清空之前的海报
        // 根据设备屏幕大小和距离屏幕上下左右距离，及圆角绘制背景
        let poster = this.poster
        let mainImg = this.mainImg
        let codeImg = this.codeImg
        let title = this.title
        await drawSquarePic(ctx, 0, 0, poster.w, poster.h, poster.r, poster.url)
        // await drawSquarePic(ctx, poster.x, poster.y, poster.w, poster.h, poster.r, poster.url)
        await drawSquarePic(ctx, mainImg.x, mainImg.y, mainImg.w, mainImg.h, mainImg.r, mainImg.url)
        // 绘制标题 textY 绘制文本的y位置
        console.log('creatPoster -> title.x', title.x)
        console.log('creatPoster -> title.w', title.w)
        let textY = drawTextReturnH(
          ctx,
          title.text,
          title.x,
          title.y,
          title.w,
          title.fontSize,
          title.color,
          title.lineHeight,
        )
        // 绘制小程序码
        // #ifdef MP-WEIXIN
        qrcodePath = await this.sendCode(qrcodePath)
        // #endif
        if (qrcodePath) {
          await drawSquarePic(
            ctx,
            codeImg.x,
            codeImg.y + textY,
            codeImg.w,
            codeImg.h,
            codeImg.r,
            qrcodePath
          )
        }
        // 小程序的名称
        // 长按/扫描识别查看商品
        let y = 0
        if (Array.isArray(this.posterData.tips) && this.posterData.tips.length > 0) {
          this.posterData.tips.forEach((element, i) => {
            if (i == 0) {
              y = codeImg.y + textY + element.mt + codeImg.h
            } else {
              y += element.mt
            }
            y = drawTextReturnH(
              ctx,
              element.text,
              title.x,
              y,
              title.w || mainImg.w,
              element.fontSize,
              element.color,
              element.lineHeight,
              element.align
            )
          })
        }
        uni.hideLoading()
      },
      /**
       * @description: 保存到系统相册
       * @param {type}
       * @return {type}
       * @author: hch
       */
      handleSaveCanvasImage() {
        uni.showLoading({
          title: '保存中...'
        })
        let _this = this
        // 把画布转化成临时文件
        // #ifndef MP-ALIPAY
        // 支付宝小程序外，其他都是用这个方法 canvasToTempFilePath
        uni.canvasToTempFilePath({
            // x: this.poster.x,
            // y: this.poster.y,
            width: this.poster.w, // 画布的宽
            height: this.poster.h, // 画布的高
            destWidth: this.poster.w * 5,
            destHeight: this.poster.h * 5,
            canvasId: 'myCanvas',
            success(res) {
              //保存图片至相册
              // #ifndef H5
              // 除了h5以外的其他端
              uni.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success(res) {
                  uni.hideLoading()
                  uni.showToast({
                    title: '图片保存成功，可以去分享啦~',
                    duration: 2000,
                    icon: 'none'
                  })
                  _this.handleCanvasCancel()
                },
                fail() {
                  uni.showToast({
                    title: '保存失败，稍后再试',
                    duration: 2000,
                    icon: 'none'
                  })
                  uni.hideLoading()
                }
              })
              // #endif

              // #ifdef H5
              // h5的时候
              uni.showToast({
                title: '请长按保存',
                duration: 3000,
                icon: 'none'
              })
              _this.handleCanvasCancel()
              _this.$emit('previewImage', res.tempFilePath)
              // #endif
            },
            fail(res) {
              console.log('fail -> res', res)
              uni.showToast({
                title: '保存失败，稍后再试',
                duration: 2000,
                icon: 'none'
              })
              uni.hideLoading()
            }
          },_this
        )
        // #endif
        // #ifdef MP-ALIPAY
        // 支付宝小程序条件下 toTempFilePath
        this.ctx.toTempFilePath({
            x: this.poster.x,
            y: this.poster.y,
            width: this.poster.w, // 画布的宽
            height: this.poster.h, // 画布的高
            destWidth: this.poster.w * 5,
            destHeight: this.poster.h * 5,
            success(res) {
              //保存图片至相册
              my.saveImage({
                url: res.apFilePath,
                showActionSheet: true,
                success(res) {
                  uni.hideLoading()
                  uni.showToast({
                    title: '图片保存成功，可以去分享啦~',
                    duration: 2000,
                    icon: 'none'
                  })
                  _this.handleCanvasCancel()
                },
                fail() {
                  uni.showToast({
                    title: '保存失败，稍后再试',
                    duration: 2000,
                    icon: 'none'
                  })
                  uni.hideLoading()
                }
              })
            },
            fail(res) {
              console.log('fail -> res', res)
              uni.showToast({
                title: '保存失败，稍后再试',
                duration: 2000,
                icon: 'none'
              })
              uni.hideLoading()
            }
          },_this
        )
        // #endif
      },
      /**
       * @description: 取消海报
       * @param {type}
       * @return {type}
       * @author: hch
       */
      handleCanvasCancel() {
        this.canvasShow = false
        this.$emit('cancel', true)
      }
    }
  }
</script>

<style lang="scss">
  .content {
    height: 100%;
    text-align: center;
  }

  .canvas-content {
    position: absolute;
    top: 0;
    left: 0;

    .canvas-mask {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 9;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }

    .canvas {
      z-index: 10;
      width: 100%;
      height: 100%;
    }

    .button-wrapper {
      position: fixed;
      bottom: 20rpx;
      z-index: 16;
      display: flex;
      width: 100%;
      height: 72rpx;
      justify-content: space-around;
    }

    .save-btn {
      z-index: 16;
      width: 40%;
      height: 100%;
      font-size: 30rpx;
      line-height: 72rpx;
      color: #fff;
      text-align: center;
      background: $uni-color-primary;
      border-radius: 45rpx;
      border-radius: 36rpx;
    }

    .cancel-btn {
      color: $uni-color-primary;
      background: #fff;
    }

    .canvas-close-btn {
      position: fixed;
      top: 30rpx;
      right: 0;
      z-index: 12;
      width: 60rpx;
      height: 60rpx;
      padding: 20rpx;
    }
  }

  .qrcode-canvas {
    position: fixed;
    top: -999px;
    right: -999px;
  }
</style>
