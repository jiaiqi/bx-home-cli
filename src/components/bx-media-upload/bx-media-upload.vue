<template>
  <view class="image-video-box">
    <template class="" v-if="enableAdd||enableDel">
      <view class="media-select-box" v-for="(item,index) in uploadFiles" v-if="mediaType">
        <image class="media" :src="item.fileUrl" mode="aspectFill" v-if="['png','jpg','gif'].includes(item.file_type)"
          @click.stop=" toPreviewImage(item.fileUrl)">
        </image>
        <video class="media" :controls="false" :show-center-play-btn="false" @click.stop="toOpenVideo(item)"
          :src="item.fileUrl" mode="aspectFill" v-if="['mp4'].includes(item.file_type) "></video>
        <text class="cuIcon-playfill icon" v-if="['mp4'].includes(item.file_type) "
          @click.stop="toOpenVideo(item)"></text>
        <view class="u-delete-icon" @tap.stop="deleteItem(index)" :style="{background:'#fa3534' }">
          <u-icon class="u-icon" name="close" size="20" color="#fff"></u-icon>
        </view>
      </view>
      <!--    <view class="media-select-box" v-for="item in tempFiles" v-if="mediaType">
        <image class="media" :src="item.tempFilePath" mode="aspectFill" v-if="item.fileType==='image'"></image>
        <image class="media" :src="item.thumbTempFilePath" mode="aspectFill" v-else-if="item.fileType==='video'">
        </image>
        <text class="cuIcon-playfill icon" v-if="item.fileType==='video'" @click.stop="toOpenVideo(item)"></text>
      </view> -->
      <view class="file-list" v-else>
        <view class="file" v-for="(item,index) in tempFiles">
          <text class="cuIcon-file"></text>
          <text> {{item.name||''}}</text>
          <!-- <text class="cuIcon-close" @click="del(index)"></text> -->
        </view>
      </view>
    </template>
    <template v-else>
      <view class="media-select-box" v-for="item in uploadFiles">
        <image class="media" :src="item.fileUrl" mode="aspectFill" v-if="['png','jpg','gif'].includes(item.file_type)"
          @click.stop=" toPreviewImage(item.fileUrl)">
        </image>
        <video class="media" :controls="false" :show-center-play-btn="false" @click.stop="toOpenVideo(item)"
          :src="item.fileUrl" mode="aspectFill" v-if="['mp4'].includes(item.file_type) "></video>
        <text class="cuIcon-playfill icon" v-if="['mp4'].includes(item.file_type) "
          @click.stop="toOpenVideo(item)"></text>
      </view>
    </template>
    <view class="media-select-box radius" style="background-color: #F4F5F6;" @click="chooseMedia" v-if="enableAdd">
      <text class="cuIcon-add text-bold text-lg text-black"></text>
    </view>
  </view>
</template>

<script>
  // import VODUpload from '@/static/js/aliyun-upload-sdk-1.0.0.min.js'
  export default {
    name: "bx-media-upload",
    props: ['value', 'enableDel', 'enableAdd', 'enableDrag', 'serverUrl', 'formData', 'header', 'limit', 'fileKeyName',
      'showUploadProgress', 'serverUrlDeleteImage', 'eventType', 'fileNo', "mediaType", 'minRatio', 'maxRatio'
    ],
    data() {
      return {
        uploadFiles: [], // 已上传文件
        tempFiles: [], // 本地读取的文件
      };
    },
    mounted() {
      if (this.fileNo) {
        this.getFiles()
      }
    },
    methods: {
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
      // 提示用户消息
      showToast(message, force = false) {
        if (this.showTips || force) {
          uni.showToast({
            title: message,
            icon: 'none'
          });
        }
      },
      // 执行移除图片的动作，上方代码只是判断是否可以移除
      handlerDeleteItem(index) {
        // // 如果文件正在上传中，终止上传任务，进度在0 < progress < 100则意味着正在上传
        // if (this.lists[index].process < 100 && this.lists[index].process > 0) {
        //   typeof this.lists[index].uploadTask != 'undefined' && this.lists[index].uploadTask.abort();
        // }
        const deleteAction = `${this.$api.srvHost}/file/delete`
        const fileUrl = this.uploadFiles[index]?.fileurl
        const req = {
          "fileurl": fileUrl
        }
        this.$http.post(deleteAction, req).then(res => {
          if (res?.data?.resultCode === 'SUCCESS') {
            this.uploadFiles.splice(index, 1);
            this.$forceUpdate();
            this.$emit('on-remove', index, this.uploadFiles, this.index);
            if (this.uploadFiles.length === 0) {
              this.fileNo = ''
            }
            this.showToast(res?.data?.state || '移除成功');
          } else {
            this.showToast('移除失败,请重试');
          }
        })

      },
      async getFiles() {
        let url = this.getServiceUrl('file', 'srvfile_attachment_select', 'select')
        let req = {
          "serviceName": "srvfile_attachment_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "file_no",
            "value": this.fileNo,
            "ruleType": "in",
          }]
        }
        if (this.fileNo) {
          let response = await this.$http.post(url, req);

          if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {

            let data = response.data.data.map(item => {
              item.fileUrl =
                `${this.$api.getFilePath}${item.fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`;
              return item
            })
            this.uploadFiles = data
          }
        }


      },
      toOpenVideo(e) {
        let {
          tempFilePath
        } = e;
        tempFilePath = tempFilePath || e.fileUrl
        if (tempFilePath) {
          // uni.navigateTo({
          //   url: `/pages/h5/videoPlayer/videoPlayer?url=${encodeURIComponent(tempFilePath)}`
          // })
          uni.navigateTo({
            url: `/otherPages/tVideoPlayer/tVideoPlayer?src=${encodeURIComponent(tempFilePath)}`
          })
        }
      },
      uploadMedia(tempFiles) {
        const _self = this

        if (this.serverUrl && Array.isArray(tempFiles) && tempFiles.length > 0) {

          var promiseWorkList = [];
          uni.showLoading({
            title: '上传中...',
            mask: true
          })
          var completeImages = 0;
          var remoteIndexStart = _self.tempFiles.length - _self.uploadFiles.length;
          for (let index = 0; index < tempFiles.length; index++) {
            promiseWorkList.push(
              new Promise((resolve, reject) => {
                let remoteUrlIndex = remoteIndexStart + index;
                uni.uploadFile({
                  url: _self.serverUrl,
                  header: {
                    bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
                  },
                  formData: _self.formData,
                  filePath: tempFiles[index].tempFilePath,
                  name: 'file',
                  success: function(res) {
                    console.log(res);
                    if (res.statusCode === 200) {
                      // if (_self.isDestroyed) {
                      //   return;
                      // }
                      completeImages++;
                      // if (_self.showUploadProgress) {
                      uni.showToast({
                        title: '上传进度：' + completeImages + '/' + tempFiles.length,
                        icon: 'none',
                        mask: true,
                        duration: 500
                      });
                      // }
                      console.log('success to upload image: ' + res.data);
                      if (typeof res.data === 'string') {
                        try {
                          // res.data = JSON.parse(res.data)
                        } catch (e) {
                          //TODO handle the exception
                          console.log(e);
                        }
                      }
                      resolve(res.data);
                    } else {
                      console.log('fail to upload image:' + res.data);
                      reject('fail to upload image:' + remoteUrlIndex);
                    }
                  },
                  fail: function(res) {
                    console.log('fail to upload image:' + res);
                    reject('fail to upload image:' + remoteUrlIndex);
                  }
                });
              })
            );
          }

          Promise.all(promiseWorkList).then(result => {
            uni.hideLoading()
            for (let i = 0; i < result.length; i++) {
              try {
                result[i] = JSON.parse(result[i])
                if (result[i].fileurl) {
                  result[i].fileUrl =
                    `${_self.$api.getFilePath}${result[i].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`;
                }
              } catch (e) {
                //TODO handle the exception
              }
              _self.uploadFiles.push(result[i]);
            }
            _self.$emit('add', {
              currentImages: tempFiles,
              allImages: _self.uploadFiles
            });
            _self.$emit('input', _self.uploadFiles);
          });
        }
      },
      chooseMedia() {
        let self = this
        if (this.mediaType && this.mediaType.length === 1 && this.mediaType.includes('video')) {
          return new Promise(resolve => {
            uni.chooseVideo({
              sourceType: ['camera', 'album'],
              success: function(res) {
                let obj = {
                  duration: res.duration,
                  fileType: "video",
                  height: res.height,
                  size: res.size,
                  tempFilePath: res.tempFilePath,
                  thumbTempFilePath: res.thumbTempFilePath,
                  width: res.width,
                  name: res.name
                }

                if (res?.width && res?.height) {
                  let ratio = res?.width / res?.height
                  if (self.minRatio && self.minRatio > ratio) {
                    uni.showModal({
                      title: '提示',
                      content: `视频宽高比例必须大于${self.minRatio}`,
                      showCancel: false
                    })
                    return
                  }

                  if (self.maxRatio && self.maxRatio < ratio) {
                    uni.showModal({
                      title: '提示',
                      content: `视频宽高比例必须小于${self.maxRatio}`,
                      showCancel: false
                    })
                    return
                  }
                }

                self.uploadMedia([obj])
                self.tempFiles = [...self.tempFiles, obj]
                resolve([obj]) // 数组
              }
            });
          })
        }
        // #ifdef H5
        uni.chooseFile({
          // count: 6, //默认100
          // extension:['.zip','.doc'],
          success: function(res) {
            let arr = res.tempFiles
            if (Array.isArray(arr) && arr.length > 0) {
              arr = arr.map((item, index) => {
                let obj = {
                  file: item,
                  type: item.type,
                  size: item.size,
                  name: item.name,
                  tempFilePath: res.tempFilePaths[index]
                }
                return obj
              })

              if (arr[0]?.width && arr[0]?.height) {
                let ratio = arr[0]?.width / arr[0]?.height
                if (self.minRatio && self.minRatio > ratio) {
                  uni.showModal({
                    title: '提示',
                    content: `视频宽高比例必须大于${self.minRatio}`,
                    showCancel: false
                  })
                  return
                }

                if (self.maxRatio && self.maxRatio < ratio) {
                  uni.showModal({
                    title: '提示',
                    content: `视频宽高比例必须小于${self.maxRatio}`,
                    showCancel: false
                  })
                  return
                }

              }

              self.tempFiles = [...self.tempFiles, ...arr]
              // self.uploadMedia(arr)
              resolve(arr) // 数组
            }
            console.log(JSON.stringify(res.tempFilePaths));
          }
        });
        // #endif

        // #ifdef MP-WEIXIN
        return new Promise(resolve => {
          uni.chooseMedia({
            count: 9,
            mediaType: self.mediaType || ['image', 'video'],
            sourceType: ['album', 'camera'],
            maxDuration: 30,
            camera: 'back',
            success(res) {

              console.log(res.type) // 文件类型，有效值有 image 、video、mix
              console.log(res.tempFiles) // 文件类型，有效值有 image 、video、mix

              if (Array.isArray(res.tempFiles) && res.tempFiles.length > 0) {

                if (res.tempFiles[0]?.width && res.tempFiles[0]?.height) {

                  let ratio = res.tempFiles[0]?.width / res.tempFiles[0]?.height

                  if (self.minRatio && self.minRatio > ratio) {
                    uni.showModal({
                      title: '提示',
                      content: `视频宽高比例必须大于${self.minRatio}`,
                      showCancel: false
                    })
                    return
                  }

                  if (self.maxRatio && self.maxRatio < ratio) {
                    uni.showModal({
                      title: '提示',
                      content: `视频宽高比例必须小于${self.maxRatio}`,
                      showCancel: false
                    })
                    return
                  }

                }
              }
              self.tempFiles = [...self.tempFiles, ...res.tempFiles]
              self.uploadMedia(res.tempFiles)
              resolve(res.tempFiles) // 数组 
              // tempFilePath	String	本地临时文件路径 (本地路径)
              // size	Number	本地临时文件大小，单位 B
              // duration	Number	视频的时间长度
              // height	Number	视频的高度
              // width	Number	视频的宽度
              // thumbTempFilePath	String	视频缩略图临时文件路径
              // fileType	String	文件类型 video\image
              // {
              //   fileType: "image",
              //   size: 6818,
              //   tempFilePath: "http://tmp/Ad0n2V0SSMDJcda5cf3699b2bfbade62efb7446242aa.png"
              // }
              // {
              //   duration: 219.077,
              //   fileType: "video",
              //   height: 720,
              //   size: 22462913,
              //   tempFilePath: "http://tmp/FWs024LIDinb87685224f5ed6ae2b52fae4659b81055.mp4",
              //   thumbTempFilePath: "http://tmp/M9Kfqg4vEsMTafbc481c67752caa696bb023c13e45f4.jpg",
              //   width: 1280
              // }
            }
          })
        })
        // #endif
      },
    },
  }
</script>

<style lang="scss" scoped>
  .image-video-box {
    width: 100%;
    min-height: 80px;
    display: flex;
    flex-wrap: wrap;

    .file-list {
      width: 100%;
      margin-bottom: 10px;

      .file {
        padding: 5px 10px;
        background-color: #F4F5F6;
        display: flex;
        justify-content: space-between;
      }
    }

    .media-select-box {
      width: 200rpx;
      height: 200rpx;
      line-height: 200rpx;
      text-align: center;
      margin-left: 10rpx;
      margin-bottom: 10rpx;
      border: 1rpx solid #F1F1F1;
      color: #ececec;
      font-size: 30px;
      display: inline-block;
      position: relative;
      .u-delete-icon {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        z-index: 10;
        background-color: $u-type-error;
        border-radius: 100rpx;
        width: 44rpx;
        height: 44rpx;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
      &:first-child,
      &:nth-child(3n+1) {
        margin-left: 0;
      }

      .icon {
        position: absolute;
        top: 0;
        right: calc(50% - 30rpx);
        color: #fff;
      }

      .media {
        width: 100%;
        height: 100%;
        background-color: #000;
        color: #333;
      }
    }

  }
</style>
