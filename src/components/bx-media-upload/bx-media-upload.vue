<template>
  <view class="image-video-box">
    <template class="" v-if="enableAdd||enableDel">
      <view class="media-select-box" v-for="item in tempFiles">
        <image class="media" :src="item.tempFilePath" mode="aspectFill" v-if="item.fileType==='image'"></image>
        <image class="media" :src="item.thumbTempFilePath" :poster="item.thumbTempFilePath" v-else
          @click.stop="toOpenVideo(item)">
        </image>
        <text class="cuIcon-playfill icon" v-if="item.fileType==='video'" @click.stop="toOpenVideo(item)"></text>
      </view>
    </template>
    <template v-else>
      <view class="media-select-box" v-for="item in uploadFiles">
        <image class="media" :src="item.fileUrl" mode="aspectFill"
          v-if="['png','jpg','gif'].includes(item.file_type)"  @click.stop=" toPreviewImage(item.fileUrl)">
        </image>
        <video class="media" :controls="false" :show-center-play-btn="false" @click.stop="toOpenVideo(item)"
          :src="item.fileUrl" mode="aspectFill" v-if="['mp4'].includes(item.file_type) "></video>
        <text class="cuIcon-playfill icon" v-if="['mp4'].includes(item.file_type) "
          @click.stop="toOpenVideo(item)"></text>
      </view>
    </template>
    <view class="media-select-box" @click="chooseMedia" v-if="enableAdd">
      <text class="cuIcon-pic "></text>
    </view>
  </view>
</template>

<script>
  export default {
    name: "bx-media-upload",
    props: ['value', 'enableDel', 'enableAdd', 'enableDrag', 'serverUrl', 'formData', 'header', 'limit', 'fileKeyName',
      'showUploadProgress', 'serverUrlDeleteImage', 'eventType', 'fileNo'
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
        return new Promise(resolve => {
          uni.chooseMedia({
            count: 9,
            mediaType: ['image', 'video'],
            sourceType: ['album', 'camera'],
            maxDuration: 30,
            camera: 'back',
            success(res) {
              console.log(res.type) // 文件类型，有效值有 image 、video、mix
              console.log(res.tempFiles) // 文件类型，有效值有 image 、video、mix
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

      &:first-child,
      &:nth-child(3n+1) {
        margin-left: 0;
      }

      .icon {
        position: absolute;
        top: 0;
        right: calc(50% - 30rpx);
      }

      .media {
        width: 100%;
        height: 100%;
      }
    }

  }
</style>
