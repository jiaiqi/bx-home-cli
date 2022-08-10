<template>
  <view class="u-upload" v-if="!disabled">
    <view v-if="showUploadList" class="u-list-item u-preview-wrap" v-for="(item, index) in lists" :key="index" :style="{
				width: $u.addUnit(width),
				height: $u.addUnit(height)
			}">
      <view v-if="deletable" class="u-delete-icon" @tap.stop="deleteItem(index)" :style="{
					background: delBgColor
				}">
        <u-icon class="u-icon" :name="delIcon" size="20" :color="delColor"></u-icon>
      </view>
      <u-line-progress v-if="showProgress && item.progress > 0&&item.progress!==100 && !item.error"
        :show-percent="false" height="16" class="u-progress" :percent="item.progress"
        :active-color="item.progress<100?'#ff9900':'#19BE6B'"></u-line-progress>
      <view @tap.stop="retry(index)" v-if="item.error" class="u-error-btn">点击重试</view>
      <image @tap.stop="doPreviewImage(item.url || item.path, index)" class="u-preview-image" v-if="!item.isImage"
        :src="item.url || item.path" :mode="imageMode"></image>
    </view>
    <slot name="file" :file="lists"></slot>
    <!-- #ifdef MP-WEIXIN -->
    <button @chooseavatar="chooseavatar" open-type="chooseAvatar"
      v-if="openType==='chooseAvatar'&&maxCount > lists.length" class="add-btn">
      <slot name="addBtn"></slot>
      <view v-if="!customBtn" class="u-list-item u-add-wrap" hover-class="u-add-wrap__hover" hover-stay-time="150"
        :style="{
    			width: $u.addUnit(width),
    			height: $u.addUnit(height)
    		}">
        <u-icon name="plus" class="u-add-btn" size="40"></u-icon>
        <view class="u-add-tips">{{ uploadText }}</view>
      </view>
    </button>
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="" v-if="openType==='chooseAvatar'&&false">

    </view>
    <!-- #endif -->
    <view class="add-btn" @tap="selectFile" v-else-if="maxCount > lists.length">
      <slot name="addBtn"></slot>
      <view v-if="!customBtn" class="u-list-item u-add-wrap" hover-class="u-add-wrap__hover" hover-stay-time="150"
        :style="{
					width: $u.addUnit(width),
					height: $u.addUnit(height)
				}">
        <u-icon name="plus" class="u-add-btn" size="40"></u-icon>
        <view class="u-add-tips">{{ uploadText }}</view>
      </view>
    </view>

    <view class="cropper-box" v-if="curClipUrl">
      <ksp-cropper :mode="clipMode" :width="clipWidth" :maxHeight="clipMaxHeight" :maxWidth="clipMaxWidth"
        :height="clipHeight" :url="curClipUrl" @cancel="oncancel" @ok="oncliped"></ksp-cropper>
    </view>
  </view>
</template>

<script>
  /**
   * upload 图片上传
   * @description 该组件用于上传图片场景
   * @tutorial https://www.uviewui.com/components/upload.html
   * @property {String} action 服务器上传地址
   * @property {String Number} max-count 最大选择图片的数量（默认99）
   * @property {Boolean} custom-btn 如果需要自定义选择图片的按钮，设置为true（默认false）
   * @property {Boolean} show-progress 是否显示进度条（默认true）
   * @property {Boolean} disabled 是否启用(显示/移仓)组件（默认false）
   * @property {String} image-mode 预览图片等显示模式，可选值为uni的image的mode属性值（默认aspectFill）
   * @property {String} del-icon 右上角删除图标名称，只能为uView内置图标
   * @property {String} del-bg-color 右上角关闭按钮的背景颜色
   * @property {String | Number} index 在各个回调事件中的最后一个参数返回，用于区别是哪一个组件的事件
   * @property {String} del-color 右上角关闭按钮图标的颜色
   * @property {Object} header 上传携带的头信息，对象形式
   * @property {Object} form-data 上传额外携带的参数
   * @property {String} name 上传文件的字段名，供后端获取使用（默认file）
   * @property {Array<String>} size-type original 原图，compressed 压缩图，默认二者都有（默认['original', 'compressed']）
   * @property {Array<String>} source-type 选择图片的来源，album-从相册选图，camera-使用相机，默认二者都有（默认['album', 'camera']）
   * @property {Boolean} preview-full-image	是否可以通过uni.previewImage预览已选择的图片（默认true）
   * @property {Boolean} multiple	是否开启图片多选，部分安卓机型不支持（默认true）
   * @property {Boolean} deletable 是否显示删除图片的按钮（默认true）
   * @property {String Number} max-size 选择单个文件的最大大小，单位B(byte)，默认不限制（默认Number.MAX_VALUE）
   * @property {Array<Object>} file-list 默认显示的图片列表，数组元素为对象，必须提供url属性
   * @property {Boolean} upload-text 选择图片按钮的提示文字（默认“选择图片”）
   * @property {Boolean} auto-upload 选择完图片是否自动上传，见上方说明（默认true）
   * @property {Boolean} show-tips 特殊情况下是否自动提示toast，见上方说明（默认true）
   * @property {Boolean} show-upload-list 是否显示组件内部的图片预览（默认true）
   * @event {Function} on-oversize 图片大小超出最大允许大小
   * @event {Function} on-preview 全屏预览图片时触发
   * @event {Function} on-remove 移除图片时触发
   * @event {Function} on-success 图片上传成功时触发
   * @event {Function} on-change 图片上传后，无论成功或者失败都会触发
   * @event {Function} on-error 图片上传失败时触发
   * @event {Function} on-progress 图片上传过程中的进度变化过程触发
   * @event {Function} on-uploaded 所有图片上传完毕触发
   * @event {Function} on-choose-complete 每次选择图片后触发，只是让外部可以得知每次选择后，内部的文件列表
   * @example <u-upload :action="action" :file-list="fileList" ></u-upload>
   */
  export default {
    name: 'bx-image-upload',
    model: {
      prop: 'value',
      event: 'change'
    },
    props: {
      openType: {
        type: String, // chooseAvatar
      },
      // 组件绑定的值,一般为上传文件编号（file_no）
      value: {
        type: String
      },
      //是否显示组件自带的图片预览功能
      showUploadList: {
        type: Boolean,
        default: true
      },
      // 后端地址
      action: {
        type: String,
        default: ''
      },
      // 最大上传数量
      maxCount: {
        type: [String, Number],
        default: 52
      },
      //  是否显示进度条
      showProgress: {
        type: Boolean,
        default: true
      },
      // 是否启用
      disabled: {
        type: Boolean,
        default: false
      },
      // 预览上传的图片时的裁剪模式，和image组件mode属性一致
      imageMode: {
        type: String,
        default: 'aspectFit'
      },
      tableName: String,
      interfaceName: {
        type: String,
        default: "add"
      },
      appName: {
        type: String,
        default: () => {
          return uni.getStorageSync('activeApp')
        }
      },
      // 上传的文件字段名
      name: {
        type: String,
        default: 'file'
      },
      // 所选的图片的尺寸, 可选值为original compressed
      sizeType: {
        type: Array,
        default () {
          return ['original', 'compressed'];
        }
      },
      sourceType: {
        type: Array,
        default () {
          return ['album', 'camera'];
        }
      },
      // 是否在点击预览图后展示全屏图片预览
      previewFullImage: {
        type: Boolean,
        default: true
      },
      // 是否开启图片多选，部分安卓机型不支持
      multiple: {
        type: Boolean,
        default: true
      },
      // 是否展示删除按钮
      deletable: {
        type: Boolean,
        default: true
      },
      // 文件大小限制，单位为byte
      maxSize: {
        type: [String, Number],
        default: Number.MAX_VALUE
      },
      // 上传区域的提示文字
      uploadText: {
        type: String,
        default: '选择图片'
      },
      // 是否显示toast消息提示
      showTips: {
        type: Boolean,
        default: true
      },
      // 是否通过slot自定义传入选择图标的按钮
      customBtn: {
        type: Boolean,
        default: false
      },
      // 内部预览图片区域和选择图片按钮的区域宽度
      width: {
        type: [String, Number],
        default: 200
      },
      // 内部预览图片区域和选择图片按钮的区域高度
      height: {
        type: [String, Number],
        default: 200
      },
      // 右上角关闭按钮的背景颜色
      delBgColor: {
        type: String,
        default: '#fa3534'
      },
      // 右上角关闭按钮的叉号图标的颜色
      delColor: {
        type: String,
        default: '#ffffff'
      },
      // 右上角删除图标名称，只能为uView内置图标
      delIcon: {
        type: String,
        default: 'close'
      },
      // 如果上传后的返回值为json字符串，是否自动转json
      toJson: {
        type: Boolean,
        default: true
      },
      // 上传前的钩子，每个文件上传前都会执行
      beforeUpload: {
        type: Function,
        default: null
      },
      // 移除文件前的钩子
      beforeRemove: {
        type: Function,
        default: null
      },
      // 允许上传的图片后缀
      limitType: {
        type: Array,
        default () {
          // 支付宝小程序真机选择图片的后缀为"image"
          // https://opendocs.alipay.com/mini/api/media-image
          return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'image'];
        }
      },
      // 在各个回调事件中的最后一个参数返回，用于区别是哪一个组件的事件
      index: {
        type: [Number, String],
        default: ''
      },
      // 图片裁剪相关参数
      // 是否开启上传前裁剪图片
      isClip: {
        type: Boolean,
        default: false,
      },
      // 裁剪模式
      clipMode: {
        type: String,
        default: 'fixed',
        validator: function(value) {
          // 这个值必须匹配下列字符串中的一个
          // 模式	    值	  说明
          // 固定模式	fixed	裁剪出指定大小的图片，一般用于头像上传
          // 等比缩放	ratio	限定宽高比，裁剪大小不固定
          // 自由模式	free	不限定宽高比，裁剪大小不固定
          return value && ['fixed', 'ratio', 'free'].includes(value)
        }
      },
      // 裁剪宽度 固定大小(fixed)时有效
      clipWidth: {
        type: Number,
      },
      // 裁剪高度 固定大小(fixed)时有效
      clipHeight: {
        type: Number,
      },
      // 裁剪最大宽度 
      clipMaxWidth: {
        type: Number,
        default: 1024
      },
      // 裁剪最大高度
      clipMaxHeight: {
        type: Number,
        default: 1024
      }
    },
    data() {
      return {
        fileNo: null,
        fileList: [], // 已上传的文件列表
        lists: [],
        isInCount: true,
        uploading: false,
        curClipUrl: "", //当前正在裁剪的图片
      };
    },
    watch: {
      fileNo: {
        handler(val) {
          this.$emit('change', val)
        }
      },
      value: {
        immediate: true,
        handler(val) {
          this.fileNo = val || "";
          this.loadInitImages()
        }
      },
      fileList: {
        immediate: true,
        handler(val) {
          val.map(value => {
            // 首先检查内部是否已经添加过这张图片，因为外部绑定了一个对象给fileList的话(对象引用)，进行修改外部fileList
            // 时，会触发watch，导致重新把原来的图片再次添加到this.lists
            // 数组的some方法意思是，只要数组元素有任意一个元素条件符合，就返回true，而另一个数组的every方法的意思是数组所有元素都符合条件才返回true
            let tmp = this.lists.some(val => {
                return val.url == value.url;
              })
              // 如果内部没有这个图片(tmp为false)，则添加到内部
              !tmp && this.lists.push({
                url: value.url,
                error: false,
                progress: 100
              });
          });
        }
      },
      // 监听lists的变化，发出事件
      lists(n) {
        this.$emit('on-list-change', n, this.index);
      }
    },
    computed: {
      autoUpload() {
        if (this.clipWidth && this.clipHeight) {
          return false
        }
        return true
      },
      header() {
        return {
          'bx_auth_ticket': uni.getStorageSync('bx_auth_ticket')
        }
      },
      setFormData() {
        return {
          // 上传文件时携带的参数
          "serviceName": "srv_bxfile_service",
          "interfaceName": this.interfaceName,
          "thumbnailType": "fwsu_100",
          "app_no": this.appName,
          "table_name": this.tableName,
          "columns": this.index || this.column,
          "file_no": this.fileNo || ''
        }
      }
    },
    mounted() {
      this.fileNo = this.value
      if (this.fileNo) {
        this.loadInitImages()
      }
    },
    methods: {
      chooseavatar(e) {
        const avatarUrl = e?.detail?.avatarUrl;
        if (avatarUrl) {
          const listOldLength = this.lists.length
          this.lists.push({
            url: avatarUrl,
            progress: 0,
            error: false,
            file: {
              path: avatarUrl
            }
          });
          this.uploadFile(listOldLength);
        }
      },
      async loadInitImages() {
        if (!this.value) {
          this.lists = []
          return
        }
        let imgList = await this.getFilePath(this.value);
        if (Array.isArray(imgList) && imgList.length > 0) {
          imgList = imgList.reverse()
          this.lists = [];
          for (let i = 0; i < imgList.length; i++) {
            const url =
              `${this.$api.getFilePath}${imgList[ i ].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`;
            this.lists.push({
              url: url,
              response: imgList[i],
              progress: 100,
              error: false,
              file: url
            });
          }
        }
      },
      oncliped(val) {
        // 裁剪完成
        this.curClipUrl = "";
        const listOldLength = this.lists.length
        this.lists.push({
          url: val.path,
          progress: 0,
          error: false,
          file: val
        });
        this.uploadFile(listOldLength);
      },
      oncancel() {
        // 取消裁剪 url设置为空，隐藏控件
        this.curClipUrl = "";
      },
      // 清除列表
      clear() {
        this.lists = [];
      },
      // 重新上传队列中上传失败的所有文件
      reUpload() {
        this.uploadFile();
      },
      // 选择图片
      selectFile() {
        if (this.disabled) return;
        const {
          name = '', maxCount, multiple, maxSize, sizeType, lists, camera, compressed, maxDuration, sourceType
        } = this;
        let chooseFile = null;
        const newMaxCount = maxCount - lists.length;
        const isClip = this.clipHeight && this.clipWidth;
        // 设置为只选择图片的时候使用 chooseImage 来实现
        chooseFile = new Promise((resolve, reject) => {
          uni.chooseImage({
            count: !isClip && multiple ? (newMaxCount > 9 ? 9 : newMaxCount) : 1,
            sourceType: sourceType,
            sizeType,
            success: resolve,
            fail: reject
          });
        });
        chooseFile
          .then(res => {
            let file = null;
            let listOldLength = this.lists.length;
            res.tempFiles.map((val, index) => {
              // 检查文件后缀是否允许，如果不在this.limitType内，就会返回false
              if (!this.checkFileExt(val)) return;
              if (isClip) {
                this.curClipUrl = val.path
                return
              }
              // 如果是非多选，index大于等于1或者超出最大限制数量时，不处理
              if (!multiple && index >= 1) return;
              if (val.size > maxSize) {
                this.$emit('on-oversize', val, this.lists, this.index);
                this.showToast('超出允许的文件大小');
              } else {
                if (maxCount <= lists.length) {
                  this.$emit('on-exceed', val, this.lists, this.index);
                  this.showToast('超出最大允许的文件个数');
                  return;
                }
                this.lists.push({
                  url: val.path,
                  progress: 0,
                  error: false,
                  file: val
                });
              }
            });
            // 每次图片选择完，抛出一个事件，并将当前内部选择的图片数组抛出去
            this.$emit('on-choose-complete', this.lists, this.index);
            if (this.autoUpload) this.uploadFile(listOldLength);
          })
          .catch(error => {
            this.$emit('on-choose-fail', error);
          });
      },
      // 提示用户消息
      showToast(message, force = false) {
        if (this.showTips || force) {
          uni.showToast({
            title: message,
            icon: 'none'
          });
        }
      },
      // 该方法供用户通过ref调用，手动上传
      upload() {
        this.uploadFile();
      },
      // 对失败的图片重新上传
      retry(index) {
        this.lists[index].progress = 0;
        this.lists[index].error = false;
        this.lists[index].response = null;
        uni.showLoading({
          title: '重新上传'
        });
        this.uploadFile(index);
      },
      // 上传图片
      async uploadFile(index = 0) {
        if (this.disabled) return;
        if (this.uploading) return;
        // 全部上传完成
        if (index >= this.lists.length) {
          this.$emit('on-uploaded', this.lists, this.index);
          return;
        }
        // 检查是否是已上传或者正在上传中
        if (this.lists[index].progress == 100) {
          if (this.autoUpload == false) this.uploadFile(index + 1);
          return;
        }
        // 执行before-upload钩子
        if (this.beforeUpload && typeof(this.beforeUpload) === 'function') {
          // 执行回调，同时传入索引和文件列表当作参数
          // 在微信，支付宝等环境(H5正常)，会导致父组件定义的customBack()函数体中的this变成子组件的this
          // 通过bind()方法，绑定父组件的this，让this.customBack()的this为父组件的上下文
          // 因为upload组件可能会被嵌套在其他组件内，比如u-form，这时this.$parent其实为u-form的this，
          // 非页面的this，所以这里需要往上历遍，一直寻找到最顶端的$parent，这里用了this.$u.$parent.call(this)
          // 明白意思即可，无需纠结this.$u.$parent.call(this)的细节
          let beforeResponse = this.beforeUpload.bind(this.$u.$parent.call(this))(index, this.lists);
          // 判断是否返回了promise
          if (!!beforeResponse && typeof beforeResponse.then === 'function') {
            await beforeResponse.then(res => {
              // promise返回成功，不进行动作，继续上传
            }).catch(err => {
              // 进入catch回调的话，继续下一张
              return this.uploadFile(index + 1);
            })
          } else if (beforeResponse === false) {
            // 如果返回false，继续下一张图片的上传
            return this.uploadFile(index + 1);
          } else {
            // 此处为返回"true"的情形，这里不写代码，就跳过此处，继续执行当前的上传逻辑
          }
        }
        // 检查上传地址
        if (!this.action) {
          this.showToast('请配置上传地址', true);
          return;
        }
        this.lists[index].error = false;
        this.uploading = true;

        // 创建上传对象
        const task = uni.uploadFile({
          url: this.action,
          filePath: this.lists[index].url,
          name: this.name,
          formData: this.setFormData,
          header: this.header,
          success: res => {
            // 判断是否json字符串，将其转为json格式
            let data = this.toJson && this.$u.test.jsonString(res.data) ? JSON.parse(res.data) : res.data;
            if (![200, 201, 204].includes(res.statusCode)) {
              this.uploadError(index, data);
            } else {
              // 上传成功
              this.lists[index].response = data;
              this.lists[index].progress = 100;
              this.lists[index].error = false;
              this.fileNo = data?.file_no
              this.$emit('on-success', data, index, this.lists, this.index);
            }
          },
          fail: e => {
            this.uploadError(index, e);
          },
          complete: res => {
            uni.hideLoading();
            this.uploading = false;
            this.uploadFile(index + 1);
            this.$emit('on-change', res, index, this.lists, this.index);
          }
        });
        task.onProgressUpdate(res => {
          if (res.progress > 0) {
            this.lists[index].progress = res.progress;
            this.$emit('on-progress', res, index, this.lists, this.index);
          }
        });
      },
      // 上传失败
      uploadError(index, err) {
        this.lists[index].progress = 0;
        this.lists[index].error = true;
        this.lists[index].response = null;
        this.$emit('on-error', err, index, this.lists, this.index);
        this.showToast('上传失败，请重试');
      },
      // 删除一个图片
      deleteItem(index) {
        uni.showModal({
          title: '提示',
          content: '您确定要删除此项吗？',
          success: async (res) => {
            if (res.confirm) {
              // 先检查是否有定义before-remove移除前钩子
              // 执行before-remove钩子
              if (this.beforeRemove && typeof(this.beforeRemove) === 'function') {
                // 此处钩子执行 原理同before-remove参数，见上方注释
                let beforeResponse = this.beforeRemove.bind(this.$u.$parent.call(this))(index, this.lists);
                // 判断是否返回了promise
                if (!!beforeResponse && typeof beforeResponse.then === 'function') {
                  await beforeResponse.then(res => {
                    // promise返回成功，不进行动作，继续上传
                    this.handlerDeleteItem(index);
                  }).catch(err => {
                    // 如果进入promise的reject，终止删除操作
                    this.showToast('已终止移除');
                  })
                } else if (beforeResponse === false) {
                  // 返回false，终止删除
                  this.showToast('已终止移除');
                } else {
                  // 如果返回true，执行删除操作
                  this.handlerDeleteItem(index);
                }
              } else {
                // 如果不存在before-remove钩子，
                this.handlerDeleteItem(index);
              }
            }
          }
        });
      },
      // 执行移除图片的动作，上方代码只是判断是否可以移除
      handlerDeleteItem(index) {
        // 如果文件正在上传中，终止上传任务，进度在0 < progress < 100则意味着正在上传
        if (this.lists[index].process < 100 && this.lists[index].process > 0) {
          typeof this.lists[index].uploadTask != 'undefined' && this.lists[index].uploadTask.abort();
        }
        const deleteAction = `${this.$api.srvHost}/file/delete`
        const fileUrl = this.lists[index]?.response?.fileurl || this.lists[index]?.url
        const req = {
          "fileurl": fileUrl
        }
        this.$http.post(deleteAction, req).then(res => {
          if (res?.data?.resultCode === 'SUCCESS') {
            this.lists.splice(index, 1);
            this.$forceUpdate();
            this.$emit('on-remove', index, this.lists, this.index);
            if (this.lists.length === 0) {
              this.fileNo = ''
            }
            this.showToast(res?.data?.state || '移除成功');
          } else {
            this.showToast('移除失败,请重试');
          }
        })

      },
      // 用户通过ref手动的形式，移除一张图片
      remove(index) {
        // 判断索引的合法范围
        if (index >= 0 && index < this.lists.length) {
          this.lists.splice(index, 1);
          this.$emit('on-list-change', this.lists, this.index);
        }
      },
      // 预览图片
      doPreviewImage(url, index) {
        if (!this.previewFullImage) return;
        const images = this.lists.map(item => item.url || item.path);
        uni.previewImage({
          urls: images,
          current: url,
          success: () => {
            this.$emit('on-preview', url, this.lists, this.index);
          },
          fail: () => {
            uni.showToast({
              title: '预览图片失败',
              icon: 'none'
            });
          }
        });
      },
      // 判断文件后缀是否允许
      checkFileExt(file) {
        // 检查是否在允许的后缀中
        let noArrowExt = false;
        // 获取后缀名
        let fileExt = '';
        const reg = /.+\./;
        // 如果是H5，需要从name中判断
        // #ifdef H5
        fileExt = file.name.replace(reg, "").toLowerCase();
        // #endif
        // 非H5，需要从path中读取后缀
        // #ifndef H5
        fileExt = file.path.replace(reg, "").toLowerCase();
        // #endif
        // 使用数组的some方法，只要符合limitType中的一个，就返回true
        noArrowExt = this.limitType.some(ext => {
          // 转为小写
          return ext.toLowerCase() === fileExt;
        })
        if (!noArrowExt) this.showToast(`不允许选择${fileExt}格式的文件`);
        return noArrowExt;
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@/uview-ui/libs/css/style.components.scss';

  .add-btn {
    display: inline-block;
    background-color: transparent;
    padding: 0;
    margin: 0;
    border: none;

    &::after {
      border: none;
    }
  }

  .u-upload {
    @include vue-flex;
    flex-wrap: wrap;
    align-items: center;
    position: relative;
  }

  .u-list-item {
    width: 200rpx;
    height: 200rpx;
    overflow: hidden;
    margin-right: 10rpx;
    margin-bottom: 10rpx;
    background: rgb(244, 245, 246);
    position: relative;
    border-radius: 10rpx;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    align-items: center;
    justify-content: center;
  }

  .u-preview-wrap {
    border: 1px solid rgb(235, 236, 238);
  }

  .u-add-wrap {
    flex-direction: column;
    color: $u-content-color;
    font-size: 26rpx;
  }

  .u-add-tips {
    margin-top: 20rpx;
    line-height: 40rpx;
  }

  .u-add-wrap__hover {
    background-color: rgb(235, 236, 238);
  }

  .u-preview-image {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
    background-color: #f8f8f8;
    background-image: linear-gradient(transparent 15px, #eee 0), linear-gradient(to right, transparent 15px, #eee 0);
    background-size: 16px 16px;
  }

  .u-delete-icon {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    z-index: 10;
    background-color: $u-type-error;
    border-radius: 100rpx;
    width: 44rpx;
    height: 44rpx;
    @include vue-flex;
    align-items: center;
    justify-content: center;
  }

  .u-icon {
    @include vue-flex;
    align-items: center;
    justify-content: center;
  }

  .u-progress {
    position: absolute;
    bottom: 10rpx;
    left: 8rpx;
    right: 8rpx;
    z-index: 9;
    width: auto;
  }

  .u-error-btn {
    color: #ffffff;
    background-color: $u-type-error;
    font-size: 20rpx;
    padding: 4px 0;
    text-align: center;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9;
    line-height: 1;
  }

  .cropper-box {
    // width: 100vw;
    // height: 100vh;
    // position: fixed;
    // left: 0;
    // top: 0;
    // z-index: 9999999;
  }
</style>
