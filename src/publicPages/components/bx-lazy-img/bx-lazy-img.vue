<template>
  <view>
    <!-- <image mode="scaleToFill" class="image-lazy-view no-load" ref="vref" onerror="this.src='/static/noneImg.png'"
			src="/static/img/load.gif" :data-src="imgSrc"></image> -->
    <image mode="scaleToFill" class="image-lazy-view " :src="imgSrc" v-if="imgSrc"></image>
    <view class="image-lazy-view " v-else>
      <u-icon name="photo"></u-icon>
      <!-- <text class="cuIcon-photo"></text> -->
    </view>
  </view>
</template>
<script>
  export default {
    props: {
      item: {
        type: Object,
        default () {
          return {}
        }
      },
      imgColName: {
        type: String,
        default: "img"
      },
      className: {
        type: String,
        default: "main-image"
      }
    },
    computed: {
      imgSrc() {
        if (this.item) {
          let val = this.item[this.imgColName]
          if (val) {
            if (val.indexOf('http') !== -1) {
              return val
            } else {
              return this.getImagePath(val, true)
            }
          }
        }

      }
    },
    data() {
      return {
        imageElements: []
      }
    },
    methods: {
      getImagePath(no, notThumb) {
        if (no && (no.indexOf('http://') !== -1 || no.indexOf('https://') !== -1)) {
          return no
        } else if (no) {
          if (no.indexOf('&bx_auth_ticket') !== -1) {
            no = no.split('&bx_auth_ticket')[0]
          }
          if (notThumb) {
            return this.$api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
              'bx_auth_ticket');
          } else {
            return this.$api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
                'bx_auth_ticket') +
              '&thumbnailType=fwsu_100';
          }
        } else {
          return ''
        }
      },
      throttle(fn, delay = 15, mustRun = 30) {
        let t_start = null
        let timer = null
        let context = this
        return function() {
          let t_current = +(new Date())
          let args = Array.prototype.slice.call(arguments)
          clearTimeout(timer)
          if (!t_start) {
            t_start = t_current
          }
          if (t_current - t_start > mustRun) {
            fn.apply(context, args)
            t_start = t_current
          } else {
            timer = setTimeout(() => {
              fn.apply(context, args)
            }, delay)
          }
        }
      },
      inViewShow() {
        let len = this.imageElements.length
        for (let i = 0; i < len; i++) {
          let imageElement = this.imageElements[i]
          const rect = imageElement.getBoundingClientRect()
          // 出现在视野的时候加载图片        
          if (rect.top < document.documentElement.clientHeight) {
            imageElement.src = imageElement.dataset.src
            // 移除掉已经显示的          
            this.imageElements.splice(i, 1)
            len--
            i--
            if (this.imageElements.length === 0) {
              // 如果全部都加载完 则去掉滚动事件监听            
              document.removeEventListener('scroll', this._throttleFn)
            }
          }
        }
      },
      imageLazy: function(e) {
        let self = this
        this.imageElements = Array.prototype.slice.call(document.querySelectorAll('.no-load'))
        if ("IntersectionObserver" in window) {
          let child = this.$refs.vref;
          let observer = new IntersectionObserver(entries => {
            entries.forEach(item => {
              let lazyImage = item.target
              let imgUrl = item.target.dataset.src
              if (item.isIntersecting) {


                // item.target.childNodes[0].style.backgroundImage =  "url("+ item.target.dataset.src +")"
                if (imgUrl) {
                  item.target.classList.remove("no-load")
                  item.target.src = imgUrl
                  item.target.childNodes[0].style.backgroundImage = "url(" + imgUrl +
                    ")"
                  item.target.childNodes[1].src = imgUrl
                }

                // observer.unobserve(lazyImage)       
              } else {}
            })
          })
          observer.observe(child._vnode.elm)

          // let lazyImageObserver = new IntersectionObserver((entries, observer) => {          
          //     entries.forEach((entry, index) => {            
          //         // 如果元素可见   
          // 	 console.log("lazyImage",entry)
          //         if (entry.intersectionRatio > 0) {              
          //             let lazyImage = entry.target      
          // 		console.log("lazyImage",lazyImage)
          //             lazyImage.src = lazyImage.dataset.src              
          //             lazyImage.classList.remove("no-load")              
          //             lazyImageObserver.unobserve(lazyImage)              
          //             // this.lazyImages.splice(index, 1)            
          //         }          
          //     })        
          // })        
          // lazyImageObserver.observe(lazyImage);       
        } else {
          self.inViewShow()
          self._throttleFn = self.throttle(self.inViewShow)
          window.addEventListener('scroll', self._throttleFn.bind(self))
        }

      }
    },
    // watch: {
    // 	"item": {
    // 		handler: function(nVal, oVal) {
    // 			this.imageLazy()
    // 		},
    // 		deep: true
    // 	}
    // }
  }
</script>
<style lang="scss" scoped>
  .image-lazy-view {
    height: 100%;
    width: 100% !important;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    // border: 1px solid #f1f1f1;
    border-radius: 50%;
    overflow: hidden;
  }
</style>
