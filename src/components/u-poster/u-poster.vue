<template>
  <view>
    <view class="button" @tap="drawPoster">绘制分享图</view>
    <canvas class="canvas" :id="canvasId" :canvas-id="canvasId" :style="[canvasStyle]" />
    <u-show-poster v-model="showPoster" :image="posterImage" />
  </view>
</template>
<script>
  // https://ext.dcloud.net.cn/plugin?id=5291
  import Draw from '@/uni_modules/sakura-canvas/js_sdk/index'
  export default {
    data() {
      return {
        canvasStyle: {
          width: '750rpx',
          height: '1225rpx'
        },
        showPoster: false,
        posterImage: '',
        canvasId: 'poster'
      }
    },
    props: {
      qrcodeText: {
        type: String,
        default: ''
      },
      imgPath: {
        type: String,
        default: ''
      },
      posterData: {
        type: Object,
        default: () => {
          return {
            // userhead: '/static/head.jpg',
            image: '', //上方图片
            // qrCode: '/static/qrCode.jpg',
            title: '推荐: 李宁卫衣男女同款套头无帽2021秋季训练系列情侣款刺绣加绒加厚长袖上衣外套官方店AWDRB76 威廉蓝-5 XXL', //商品名称
            price: '￥179.00', //价格
            line: '￥155.00', //历史价格
          }
        }
      }
    },
    mounted() {
      this.createDraw()
    },
    methods: {
      createDraw() {
        const draw = new Draw({
          width: 750,
          height: 1225,
          canvasId: this.canvasId,
          _this: this,
          // 绘制单位 px/rpx
          unit: 'rpx',
          // default: 默认绘制模式 2d: 2d绘制模式(只在下小程序上使用, H5/APP会自定转成default)
          type: 'default',
          background: {
            type: 'color',
            // 宽度, 不填默认为画布的宽度
            w: 750,
            // 高度，不填默认为画布的高度
            h: 1225,
            color: '#00C621',
            r: 30
          },
          // 绘制时的延迟时间
          drawDelayTime: 200,
          // 导出图片时的延迟时间
          exportImageDelayTime: 400,
        })
        this.draw = draw
        // 目前绘制需要先监听draw抛出的监听事件
        // init: 初始化完成可以绘制画布背景(现在画布背景需要自行调用方法绘制)
        draw.$on('init', async () => {
          // 绘制画布背景
          await draw.drawBackground()
          // 当需要直接绘制内容是就这里/background的监听回调里面调用
          // await this.drawPoster()
        })
      },
      async drawPoster() {
        // 绘制内容
        const posterData = {
          userhead: '/static/head.jpg',
          image: '/static/img.jpg',
          qrCode: '/static/qrCode.jpg',
          title: '推荐: 李宁卫衣男女同款套头无帽2021秋季训练系列情侣款刺绣加绒加厚长袖上衣外套官方店AWDRB76 威廉蓝-5 XXL',
          price: '￥179.00',
          line: '￥155.00',
        }
        // console.log(draw)
        const {
          userhead,
          image,
          qrCode,
          title,
          price,
          line
        } = posterData
        const res = await this.draw.drawPoster(({
          ctxObj,
          bgObj
        }) => {
          const {
            width,
            height
          } = ctxObj
          // 距离x轴的距离
          const offsetX = 25
          // 白色背景
          const background = {
            name: 'background',
            type: 'rect',
            w: width - 50,
            h: height - 50,
            x: offsetX,
            y: offsetX,
            color: '#ffffff',
            r: 30,
            shadow: {
              show: false,
              blur: 30,
              color: 'rgba(0, 0, 0, .15)'
            },
          }
          // 商品图
          const goodsImg = {
            type: 'image',
            drawType: 'rect',
            src: image,
            r: 30,
            color: 'pink',
            callback: (before) => {
              const {
                sx,
                w,
                sy
              } = before
              return {
                x: sx + 14,
                y: sy + 14,
                w: w - 30,
                h: w - 30
              }
            }
          }
          // 商品标题
          const goodsTitle = {
            type: 'text',
            text: title,
            font: {
              size: 32
            },
            line: {
              height: 42,
              num: 2,
            },
            textIndent: 72,
            // highlightText: [{
            // 	text: '推荐: ',
            // 	color: 'red'
            // }, {
            // 	text: '男',
            // 	color: 'red'
            // }, {
            // 	text: '女',
            // 	color: 'blue'
            // }, {
            // 	text: '情侣',
            // 	color: 'green'
            // }],
            callback: (before) => {
              const {
                sx,
                w,
                ey
              } = before
              return {
                w: w - 10,
                x: sx + 5,
                y: ey + offsetX
              }
            }
          }
          // 商品售价
          const goodsPrice = {
            name: 'goodsPrice',
            type: 'text',
            text: price,
            color: '#F23B55',
            font: {
              size: 50,
              weight: 'bold'
            },
            callback: (before) => {
              const {
                sx,
                ey
              } = before
              return {
                x: sx,
                y: ey + offsetX
              }
            }
          }
          // 商品划线价
          const goodsLine = {
            type: 'text',
            text: line,
            color: '#9E9E9E',
            font: {
              size: 36,
              weight: 'bold'
            },
            line: {
              style: 'lineThrough',
              width: 2
            },
            callback: (before) => {
              const {
                sy,
                ex
              } = before
              return {
                x: ex + 20,
                y: sy + 10
              }
            }
          }
          // 绘制两个小圆
          const leftCircle = {
            name: 'leftCircle',
            type: 'arc',
            color: '#00C621',
            r: offsetX,
            x: 0,
            callback: (before, all) => {
              const goodsPrice = all.find(item => item.name === 'goodsPrice')
              const {
                ey
              } = goodsPrice
              return {
                y: ey + 30
              }
            }
          }
          const rightCircle = {
            type: 'arc',
            color: '#00C621',
            r: offsetX,
            callback: (before, all) => {
              const leftCircle = all.find(item => item.name === 'leftCircle')
              const {
                sy
              } = leftCircle
              return {
                y: sy,
                x: width - 50
              }
            }
          }
          // 绘制虚线
          const dashedLine = {
            name: 'dashedLine',
            type: 'line',
            color: '#CECECE',
            w: width,
            lineWidth: 2,
            lineType: 'dashed',
            callback: (before, all) => {
              const {
                w
              } = all.find(item => item.name === 'background')
              const {
                ex,
                sy
              } = all.find(item => item.name === 'leftCircle')
              return {
                w: w - 60,
                x: ex,
                y: sy + offsetX
              }
            }
          }
          // 二维码图
          const qcCode = {
            name: 'qcCode',
            type: 'qrcode',
            text: 'https://ext.dcloud.net.cn/plugin?id=5291',
            size: 200,
            // image: {
            // 	src: userhead,
            // 	size: 100,
            // 	r: 10,
            // 	borderWidth: 14,
            // 	borderColor: '#ffffff'
            // },
            callback: (before, all) => {
              const {
                sx
              } = all.find(item => item.name === 'background')
              const {
                ey
              } = all.find(item => item.name === 'dashedLine')
              return {
                x: sx + 50,
                y: ey + offsetX
              }
            }
          }
          // 分享语句
          const shareText = {
            type: 'text',
            text: '长按识别小程序码查看详情',
            color: '#9E9E9E',
            font: {
              size: 32
            },
            callback: (before, all) => {
              const {
                ex,
                sy
              } = all.find(item => item.name === 'qcCode')
              // console.log('all', all)
              return {
                x: ex + 30,
                y: sy + 80
              }
            }
          }
          return [background, goodsImg, goodsTitle, goodsPrice, goodsLine, leftCircle, rightCircle, dashedLine,
            qcCode, shareText
          ]
        })
        if (!res.success) return
        this.showPoster = true
        this.posterImage = res.data
      }
    }
  }
</script>

<style scoped lang="scss">
  .canvas {
    position: fixed;
    left: -999999rpx;
    top: -999999rpx;
  }
</style>
