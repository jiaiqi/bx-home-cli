<template>
  <view class="container">
    <editor
      class="ql-container"
      :placeholder="placeholder"
      :show-img-size="true"
      :show-img-toolbar="true"
      :show-img-resize="true"
      @ready="onEditorReady"
      id="editor"
      @statuschange="statuschange"
      @focus="editFocus"
      @blur="editBlur"
      ref="editot"
    ></editor>
    <!-- 操作工具 -->
    <view class="tool-view">
      <view class="tool">
        <jinIcon
          class="single"
          type="&#xe6f3;"
          font-size="44rpx"
          title="插入图片"
          @click="insertImage"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6f9;"
          font-size="44rpx"
          title="修改文字样式"
          @click="showMore"
          :color="showMoreTool ? activeColor : '#666666'"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6eb;"
          font-size="44rpx"
          title="分割线"
          @click="insertDivider"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6e8;"
          font-size="44rpx"
          title="撤销"
          @click="undo"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe705;"
          font-size="44rpx"
          title="重做"
          @click="redo"
        ></jinIcon>
        <!-- <jinIcon class="single" type="&#xeb8a;" font-size="44rpx" title="设置" @click="showSetting"></jinIcon> -->
        <jinIcon
          class="single"
          type="&#xeb8a;"
          font-size="44rpx"
          title="确定"
          @click="release(true)"
        ></jinIcon>
        <text
          class="cuIcon-close"
          style="font-size: 46rpx; font-weight: 900"
          @click="release(false)"
        ></text>
      </view>
      <!-- 文字相关操作 -->
      <view class="font-more" :style="{ height: showMoreTool ? '100rpx' : 0 }">
        <jinIcon
          class="single"
          type="&#xe6e7;"
          font-size="44rpx"
          title="加粗"
          @click="setBold"
          :color="showBold ? activeColor : '#666666'"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6fe;"
          font-size="44rpx"
          title="斜体"
          @click="setItalic"
          :color="showItalic ? activeColor : '#666666'"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6f8;"
          font-size="44rpx"
          title="分割线"
          @click="setIns"
          :color="showIns ? activeColor : '#666666'"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6e3;"
          font-size="44rpx"
          title="标题"
          @click="setHeader"
          :color="showHeader ? activeColor : '#666666'"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6f1;"
          font-size="44rpx"
          title="居中"
          @click="setCenter"
          :color="showCenter ? activeColor : '#666666'"
        ></jinIcon>
        <jinIcon
          class="single"
          type="&#xe6ed;"
          font-size="44rpx"
          title="居右"
          @click="setRight"
          :color="showRight ? activeColor : '#666666'"
        ></jinIcon>
      </view>
      <view
        class="setting-layer-mask"
        v-if="showSettingLayer"
        @click="showSetting"
      ></view>
      <view class="setting-layer" v-if="showSettingLayer">
        <view class="single" @click="release(true)">
          <view>保存</view>
          <text class="cuIcon-check margin-left-xs"></text>
        </view>
        <view class="single" @click="release(false)">
          <view>取消</view>
          <text class="cuIcon-close margin-left-xs"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * @description 基于uniapp的移动端富文本编辑器
 * @property {string} uploadFileUrl - 图片上传的服务器地址
 * @property {string} fileKeyName - 图片上传时的name
 * @property {Object} header - 图片上传http请求的header
 * @property {String} html  - 初始化的html 
 * @event {Function(html,text,delta,isPublic)} editOk 点击发布按钮触发
 * @example <jin-edit :html="textareaValue" @editOk="saveRichText" ref="richEditor" />
 */
import jinIcon from './jin-icons.vue';
export default {
  props: {
    // 点击图片时显示图片大小控件
    showImgSize: {
      type: Boolean,
      default: false
    },
    // 点击图片时显示工具栏控件
    showImgToolbar: {
      type: Boolean,
      default: false
    },
    // 点击图片时显示修改尺寸控件
    showImgResize: {
      type: Boolean,
      default: false
    },
    // 占位符
    placeholder: {
      type: String,
      default: '开始输入...'
    },
    // 图片上传的地址
    uploadFileUrl: {
      type: String,
      default: '#'
    },
    // 上传文件时的name
    fileKeyName: {
      type: String,
      default: 'file'
    },
    // 上传图片时，http请求的header
    header: {
      type: Object
    },
    formData: {
      // 上传图片时携带的formData
      type: Object
    },
    res2Url: {
      // 处理上传后返回的结果，返回值：图片的url
      type: Function
    },
    // 初始化html
    html: {
      type: String
    }
  },
  data () {
    return {
      showMoreTool: false,
      showBold: false,
      showItalic: false,
      showIns: false,
      showHeader: false,
      showCenter: false,
      showRight: false,
      showSettingLayer: false,
      activeColor: '#F56C6C',
      editorCtx: ""
    };
  },
  watch: {
    html (newValue, oldValue) {
      if (this.editorCtx) {
        this.editorCtx.setContents({
          html: newValue
        });
      }
    }
  },
  components: {
    jinIcon
  },
  methods: {
    uploadRes2Url (e) {
      if (e.errMsg === "uploadFile:ok") {
        let data = {}
        if (typeof e.data === 'string') {
          data = JSON.parse(e.data)
        }
        if (data.fileurl) {
          return `${this.$api.getFilePath}${data.fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
        } else {
          return false
        }
      } else {
        return false
      }
    },
    resetContent (html) {
      if (this.editorCtx) {
        this.editorCtx.setContents({
          html: html
        });
      }
    },
    onEditorReady (e) {
      uni.createSelectorQuery().in(this).select('.ql-container').fields({
          size: true,
          context: true
        },
          res => {
            this.editorCtx = res.context;
            this.editorCtx.setContents({
              html: this.html
            });
          }
        )
        .exec();
    },
    undo () {
      this.editorCtx.undo();
    },
    // 插入图片
    insertImage () {
      let self = this
      uni.chooseImage({
        count: 9, //默认9
        sizeType: [ 'original', 'compressed' ], //可以指定是原图还是压缩图，默认二者都有
        sourceType: [ 'album', 'camera' ], //从相册选择
        success: async res => {
          var tempFilePaths = res.tempFilePaths;
          var tempFiles = res.tempFiles
          uni.showLoading({
            title: '正在上传中...'
          });
          for (let temp of tempFiles) {
            // 图片上传服务器
            await uni.uploadFile({
              url: this.uploadFileUrl,
              filePath: temp.path,
              name: this.fileKeyName || temp.name,
              header: this.header,
              formData: this.formData,
              success: res => {
                // 上传完成后处理
                if (res.errMsg === "uploadFile:ok") {
                  let url = this.uploadRes2Url(res) || temp
                  this.editorCtx.insertImage({
                    src: url, // 此处需要将图片地址切换成服务器返回的真实图片地址
                    alt: '图片',
                    success: function (e) { }
                  });
                }
                uni.hideLoading();
              }
            });
          }
        }
      });
    },
    insertDivider () {
      this.editorCtx.insertDivider();
    },
    redo () {
      this.editorCtx.redo();
    },
    showMore () {
      this.showMoreTool = !this.showMoreTool;
      this.editorCtx.setContents();
    },
    setBold () {
      this.showBold = !this.showBold;
      this.editorCtx.format('bold');
    },
    setItalic () {
      this.showItalic = !this.showItalic;
      this.editorCtx.format('italic');
    },
    checkStatus (name, detail, obj) {
      if (detail.hasOwnProperty(name)) {
        this[ obj ] = true;
      } else {
        this[ obj ] = false;
      }
    },
    statuschange (e) {
      var detail = e.detail;
      this.checkStatus('bold', detail, 'showBold');
      this.checkStatus('italic', detail, 'showItalic');
      this.checkStatus('ins', detail, 'showIns');
      this.checkStatus('header', detail, 'showHeader');
      if (detail.hasOwnProperty('align')) {
        if (detail.align == 'center') {
          this.showCenter = true;
          this.showRight = false;
        } else if (detail.align == 'right') {
          this.showCenter = false;
          this.showRight = true;
        } else {
          this.showCenter = false;
          this.showRight = false;
        }
      } else {
        this.showCenter = false;
        this.showRight = false;
      }
    },
    setIns () {
      this.showIns = !this.showIns;
      this.editorCtx.format('ins');
    },
    setHeader () {
      this.showHeader = !this.showHeader;
      this.editorCtx.format('header', this.showHeader ? 'H2' : false);
    },
    setCenter () {
      this.showCenter = !this.showCenter;
      this.editorCtx.format('align', this.showCenter ? 'center' : false);
    },
    setRight () {
      this.showRight = !this.showRight;
      this.editorCtx.format('align', this.showRight ? 'right' : false);
    },
    showSetting () {
      this.showSettingLayer = !this.showSettingLayer;
    },
    async editFocus () { },
    editBlur () { },
    release (isSave) {
      // this.showSettingLayer = false;
      this.editorCtx.getContents({
        success: res => {
          Object.assign(res, {
            isSave: isSave,
            type: 'richtext'
          });
          this.$emit('editOk', res);
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  box-sizing: border-box;
}

.ql-container {
  line-height: 160%;
  font-size: 34rpx;
  max-height: 60vh;
  min-height: 200px;
  padding: 20rpx 10rpx;
  overflow: scroll;
  height: auto;
  margin: 0 auto;
  background-color: #f8f8f8;
}

.tool-view {
  /* 	width: 100vw;
	position: fixed;
	bottom: 0;
	left: 0; */
}

.tool {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  background: #eee;
}

.font-more {
  /* position: absolute; */
  left: 0;
  bottom: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  background: rgb(235, 235, 235);
  overflow: hidden;
  transition: all 0.15s;
}

.setting-layer {
  position: absolute;
  bottom: 100rpx;
  background: #fff;
  width: 250rpx;
  right: 20rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8rpx;
}

.setting-layer .single {
  height: 80rpx;
  font-size: 32rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  line-height: 80rpx;
  flex-direction: row;
  color: #666;
  justify-content: center;
}

.setting-layer .single .icon {
  margin-right: 20rpx;
}

.setting-layer-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
}
</style>
