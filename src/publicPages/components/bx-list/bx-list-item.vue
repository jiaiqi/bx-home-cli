<template>
  <view class="list-item-wrap bg-white" :class="{ 'grid-layout-item': layout === 'grid' }">
    <view class="list-item flex" v-if="viewType === 'normal'">
      <view class="main-image" v-if="itemData[viewTemp['img']]">
        <image class="image" :src="getImagePath(itemData[viewTemp['img']],true)" @click.stop="listItemClick"
          mode="aspectFill"></image>
      </view>
      <view class="main-image" v-else-if="viewTemp['img']">
        <text class="cuIcon-pic text"></text>
      </view>
      <view class="content-box flex-twice" v-if="listType === 'proc' && pageType === 'proc'">
        <view class="content-header">
          <view class="title" @click.stop="listItemClick">{{
            itemData[viewTemp.title]
          }}</view>
          <view class="status" v-if="itemData.proc_status" @click.stop="listItemClick">
            <text class="bg-red text">{{ itemData.proc_status }}</text>
          </view>
        </view>
        <view class="sub-title" v-if="itemData['executor_user']" @click.stop="listItemClick">
          <view class="lable">责任人：</view>
          <view class="value">{{ itemData["executor_user"] }}</view>
        </view>
        <view class="content proc-content" @click.stop="listItemClick">
          <view class="content-item">
            <view class="label">创建时间：</view>
            <view class="value">{{ itemData.create_time.slice(0, 10) }}</view>
          </view>
          <view class="content-item">
            <view class="label">创建人：</view>
            <view class="value">{{ itemData.create_user_disp }}</view>
          </view>
          <view class="content-item">
            <view class="label">修改时间：</view>
            <view class="value">{{ itemData.modify_time.slice(0, 10) }}</view>
          </view>
        </view>
        <view class="footer" v-if="rowButton.length > 0">
          <view class="footer-btn" v-if="showFootBtn">
            <text v-if="deRowButDisplay(itemData, item,index) && !detailList"
              class="cu-btn round sm text-blue line-blue" :class="'cuIcon-' + item.button_type"
              v-for="(item ,index) in theRowbutton" :key="item.id" @click.stop="footBtnClick(item)">
              {{ item.button_name }}
            </text>
          </view>
        </view>
      </view>
      <view class="content-box flex-twice" v-else-if="
          listType === 'list' &&
          pageType === 'proc' &&
          (itemData.issue_name || itemData.task_name)
        ">
        <view class="content-header">
          <view class="title" @click.stop="listItemClick">{{
            itemData[viewTemp.title]
          }}</view>
          <view class="status" v-if="itemData.proc_status" @click.stop="listItemClick">
            <text class="bg-red text">{{ itemData.proc_status }}</text>
          </view>
        </view>
        <view class="sub-title" v-if="itemData['executor_user']" @click.stop="listItemClick">
          <view class="lable">责任人：</view>
          <view class="value">{{ itemData["executor_user"] }}</view>
        </view>
        <view class="content proc-content" @click.stop="listItemClick">
          <view class="content-item">
            <view class="label">创建时间：</view>
            <view class="value">{{ itemData.create_time.slice(0, 10) }}</view>
          </view>
          <view class="content-item">
            <view class="label">创建人：</view>
            <view class="value">{{ itemData.create_user_disp }}</view>
          </view>
          <view class="content-item">
            <view class="label">修改时间：</view>
            <view class="value">{{ itemData.modify_time.slice(0, 10) }}</view>
          </view>
        </view>
        <view class="footer" v-if="rowButton.length > 0 && showFootBtn">
          <view class="footer-btn" v-if="showFootBtn">
            <text v-if="deRowButDisplay(itemData, item,index) && !detailList"
              class="cu-btn round sm text-blue line-blue" :class="'cuIcon-' + item.button_type"
              v-for="(item ,index) in theRowbutton" :key="item.id" @click.stop="footBtnClick(item)">
              {{ item.button_name }}
            </text>
          </view>
        </view>
      </view>
      <view class="content-box flex-twice" v-else>
        <view class="title" @click.stop="listItemClick">
          <view class="main-title">
            <text class="label" v-if="showLabel['title']">
              {{ showLabel["title"] }}:
            </text>
            <text v-if="itemData[setViewTemp.title]">
              {{ itemData[setViewTemp.title]  | html2text }}
            </text>
            <text v-else-if="goodsData.title">
              {{ goodsData.title | html2text }}
            </text>
          </view>
          <view class="title-tip line-blue  radius" v-if="itemData[setViewTemp.tip]">
            {{ itemData[setViewTemp.tip]  | html2text }}
          </view>
        </view>
        <view class="sub-title" @click.stop="listItemClick">
          <text class="label" v-if="showLabel['subTitle']">
            {{ showLabel["subTitle"] }}:
          </text>
          {{ itemData[setViewTemp.subTitle] | html2text }}
        </view>
        <view class="numbers" v-if="viewTemp && viewTemp.price">
          <text class="label" v-if="showLabel['price']">
            {{ showLabel["price"] }}:
          </text>
          <text class="unit" v-if="
				      !isNaN(Number(goodsData.price)) &&
				      viewTemp.price &&
				      viewTemp.price.indexOf('price') !== -1
				    ">￥</text>
          <text v-if=" itemData[setViewTemp.price]">
            {{ itemData[setViewTemp.price]|| 0 }}
          </text>
        </view>
        <view class="content" @click.stop="listItemClick">
          <view class="content-item">
            <text class="label" v-if="showLabel['left']">
              {{ showLabel["left"] }}:
            </text>
            <text class="value">
              {{ itemData[setViewTemp.left]| html2text }}
            </text>
          </view>
          <view class="content-item">
            <text class="label" v-if="showLabel['right']">
              {{ showLabel["right"] }}:
            </text>
            <text class="value">
              {{ itemData[setViewTemp.right] | html2text }}
            </text>
          </view>
        </view>

        <view class="footer">
          <text class="foot-name" v-if="goodsData.footer || goodsData.footer === 0" @click.stop="listItemClick">
            <text class="label" v-if="showLabel['footer']">
              {{ showLabel["footer"] }}:
            </text>
            {{ goodsData.footer | html2text }}</text>
          <view class="foot-button" v-if="showFootBtn">
            <view class="cu-btn round sm text-blue line-blue" :class="'cuIcon-' + item.button_type"
              v-show="deRowButDisplay(itemData, item,index)&&!detailList" v-for="(item ,index) in theRowbutton"
              :key="item.id" @click.stop="footBtnClick(item)">
              <text v-if="">{{
                item.button_name
              }}</text>
            </view>
            <text v-if="detailList" class="text-gray" :class="'cuIcon-more'"></text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'ListItem',
    filters: {
      html2text: function(value) {
        if (value && typeof value === 'string') {
          return value
            .replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '')
            .replace(/<[^>]+?>/g, '')
            .replace(/\s+/g, ' ')
            .replace(/ /g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/>/g, ' ');
        } else {
          if (value === 0) {
            return value
          }
          return value || ''
        }
      },
    },
    computed: {
      setViewTemp() {
        let self = this
        let viewTemp = this.deepClone(this.viewTemp)
        if (typeof viewTemp === 'object') {
          let keys = Object.keys(viewTemp)
          if (keys.length > 0) {
            keys.forEach(key => {
              if (self.itemData[`_${viewTemp[key]}_disp`]) {
                viewTemp[key] = `_${viewTemp[key]}_disp`
              }
            })
          } else {
            if (Array.isArray(this.srv_cols) && this.srv_cols.length > 0) {
              let viewTemp = {
                title: '', // 标题
                tip: '', // 标题右侧提示
                subTitle: "", // 下方小标题
                price: '',
                left: '', // 
                right: '',
                footer: ''
              }
              let srvCols = this.srv_cols.filter(col => col.columns !== 'id')
              srvCols.forEach((column, colIndex) => {
                Object.keys(viewTemp).forEach((key, index) => {
                  if (index === colIndex && this.itemData[column.columns]) {
                    viewTemp[key] = column.columns
                  }
                })
              })
              if (this.showLabel) {
                viewTemp['_showLabel'] = true
              }
              return viewTemp
            }
          }
        }
        return viewTemp
      },
      detailBtn() {
        return this.rowButton.find(item => item.button_type === 'detail')
      },
      theRowbutton() {
        if (Array.isArray(this.rowButton) && this.rowButton.length > 0) {
          return this.rowButton.filter((button, index) => {
            return true
            // let reg = /^data\..*$/
            // if (Array.isArray(this.itemData?._buttons)) {

            //   return this.itemData._buttons[index] == 1
            // }else{
            //   return true
            // }
            // if (button.disp_exps && reg.test(button.disp_exps)) {
            //   if (Array.isArray(this.itemData?._buttons) && this.itemData?._buttons.length === this.rowButton
            //     .length) {
            //       debugger
            //     return this.itemData._buttons[index] !== 0
            //   }
            //   // let disp_exps = button.disp_exps.replace(/\'|\s/g, '')
            //   // let keys = disp_exps.split('data.')[1].split('==')[0]
            //   // let value = disp_exps.split('data.')[1].split('==')[1]
            //   // if (this.itemData[keys] === value) {
            //   // 	return true
            //   // } else {
            //   // 	return false
            //   // }
            // } else {
            //   return true
            // }
          })
        }
      }
    },
    data() {
      return {
        picUrl: '',
        goodsData: {
          title: '',
          tip: '',
          subTitle: "",
          img: '',
          price: '',
          footer: ''
        },
        showLabel: {
          title: "",
          tip: "",
          subTitle: "",
          img: "",
          price: "",
          footer: ""
        },
      };
    },
    methods: {
      listItemClick() {
        // this.$emit('click-list-item', this.itemData);
        this.$emit('click-foot-btn', {
          button: this.detailBtn,
          row: this.itemData
        });
      },
      footBtnClick(btn) {
        this.$emit('click-foot-btn', {
          button: btn,
          row: this.itemData
        });
      },
      async getPicture(file_no) {
        const serviceName = 'srvfile_attachment_select';
        const url = this.getServiceUrl('file', serviceName, 'select');
        const req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: [{
            colName: 'file_no',
            value: file_no,
            ruleType: 'eq'
          }]
        };
        req.colNames = ["columns", "fileurlsmall", "remark", "table_name", "src_name", "file_no", "file_size",
          "file_type", "fileurl", "id", "app_no"
        ]
        if (file_no !== null && file_no !== '' && file_no !== undefined) {
          let res = await this.$http.post(url, req);
          if (res.data.state === 'SUCCESS') {
            const data = res.data.data[0];
            if (data) {
              const fileurl = this.$api.fileSrv + '/file/download?filePath=' + data.fileurl;
              // const fileurl = this.$api.srvHost + '/file/download?filePath=' + data.fileurl + '&thumbnailType=' + this.$api.imgThumbnailType;
              return fileurl;
            }
          }
        }
      },
      deRowButDisplay: function(item, button, index) {
        if (this.rowButtonDisp && this.rowButtonDisp[button.button_type] === false) {
          return false
        }
        if (Array.isArray(this.itemData._buttons)) {
          if (typeof index === 'number' && (index || index === 0)) {
            return this.itemData._buttons[index]
          }
        }
        if (item && button.hasOwnProperty('isShow') && button['isShow'].length > 0) {
          let isShow = [];
          for (let key in button['isShow']) {
            switch (button['isShow'][key].ruleType) {
              case 'eq':
                if (item[button['isShow'][key].colName] === button['isShow'][key].value) {
                  isShow.push(true);
                }
                break;
              case 'nq':
                if (item[button['isShow'][key].colName] !== button['isShow'][key].value) {
                  isShow.push(true);
                }
                break;
              default:
                break;
            }
          }
          if (isShow.length === button['isShow'].length) {
            return true;
          } else {
            return false;
          }
        } else {
          // let reg = /^data\..*$/ 
          // if(button.disp_exps&&reg.test(button.disp_exps)){
          // 	let disp_exps = button.disp_exps.replace(/\'|\s/g,'')
          // 	let keys = disp_exps.split('data.')[1].split('==')[0]
          // 	let value =  disp_exps.split('data.')[1].split('==')[1]
          // 	if(item[keys]===value){
          // 		return true
          // 	}else {
          // 		return false
          // 	}
          // }
          return true;
        }
      }
    },
    props: {
      //是否是详情列表
      detailList: {
        type: Boolean,
        default: false
      },
      viewType: {
        type: String,
        default: 'normal'
      },
      viewTemp: {
        type: Object
      },
      imageNum: {
        type: Number,
        default: 1
      },
      gridRowNum: {
        type: Number,
        default: 2
      },
      rowKey: {
        type: String,
        default: 'id'
      },
      serviceName: {
        type: String,
        default: ''
      },
      condition: {
        type: Array,
        default: () => {
          [];
        }
      },
      rownumber: {
        type: Number,
        default: 10
      },
      order: {
        type: Array,
        default: () => {
          [];
        }
      },
      showSearchBar: {
        type: Boolean,
        default: false
      },
      rowButton: {
        type: Array,
        default: () => {
          [];
        }
      },
      srv_cols: {
        type: Array,
        default: () => {
          [];
        }
      },
      itemData: {
        type: Object,
        default: () => {
          return {};
        }
      },
      listType: {
        type: String, //列表类型 list||proc
        default: 'list'
      },
      pageType: {
        type: String, //列表类型 list||proc
        default: 'list'
      },
      showFootBtn: {
        type: Boolean, //是否显示底部按钮
        default: true
      },
      layout: {
        type: String, //布局 normal-普通列表 grid-宫格
        default: 'normal'
      },
      labels: { //要显示label的字段
        type: Array
      },
      gridButtonDisp: {
        type: Object
      },
      rowButtonDisp: {
        type: Object
      },
      formButtonDisp: {
        type: Object
      },
    },
    watch: {
      srv_cols: {
        deep: true,
        immediate: true,
        handler(newVal) {
          let arr = Object.values(this.viewTemp);
          if (arr.length === 0 && this.srv_cols && this.srv_cols.length > 0) {
            let arr2 = this.srv_cols.map(item => item.columns);
            Object.keys(this.goodsData).forEach((item, index) => {
              this.goodsData[item] = this.itemData[arr2[index]];
            });
            this.goodsData['img'] = '';
          }
        }
      },
      itemData: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          let self = this
          if (Array.isArray(this.labels) && this.labels.length > 0 && Array.isArray(this.srv_cols)) {
            let cols = self.srv_cols.filter(item => self.labels.includes(item.columns))
            cols.forEach(col => {
              if (col && col.columns) {
                // this.setViewTemp
                Object.keys(self.setViewTemp).forEach(key => {
                  if (Array.isArray(self.setViewTemp[key])) {
                    if (self.setViewTemp[key].includes(col.columns)) {
                      self.showLabel[key] = col.label
                    }
                  } else {
                    if (self.setViewTemp[key] === col.columns) {
                      self.showLabel[key] = col.label
                    }
                  }
                })
              }
            })
          }

          if (newValue[self.viewTemp.img]) {
            this.goodsData.img = this.getImagePath(newValue[this.viewTemp.img]);
          }

          if (this.viewTemp.title && this.viewTemp.title.indexOf('||') !== -1 && Array.isArray(this.viewTemp
              .title.split('||'))) {
            let arr = this.viewTemp.title.split('||')
            if (arr.length > 0) {
              arr = arr.reverse()
              arr.forEach(key => {
                if (newValue[key]) {
                  this.goodsData.title = newValue[key]
                }
              })
            }
          } else {
            if (newValue[this.viewTemp.title]) {
              this.goodsData.title = newValue[this.viewTemp.title];
            }
          }
          if (Array.isArray(this.viewTemp.tip)) {
            this.goodsData.tip = this.viewTemp.tip.reduce((pre, cur) => {
              let val = cur
              if (![':', ' ', '', '-'].includes(cur) && newValue[cur]) {
                val = newValue[cur]
              }
              if (pre) {
                return pre + ' ' + val
              } else {
                return val
              }
            }, '')
          } else {
            if (newValue[this.viewTemp.tip]) {
              this.goodsData.tip = newValue[this.viewTemp.tip];
            }
          }
          if (newValue[this.viewTemp.price]) {
            this.goodsData.price = newValue[this.viewTemp.price];
          }
          if (Array.isArray(this.viewTemp.footer)) {
            this.goodsData.footer = this.viewTemp.footer.reduce((pre, cur) => {
              let val = cur
              if (![':', ' ', '', '-'].includes(cur) && newValue[cur]) {
                val = newValue[cur]
              }
              if (pre) {
                return pre + ' ' + val
              } else {
                return val
              }
            }, '')
          } else {
            if (newValue[this.viewTemp.footer] || newValue[this.viewTemp.footer] === 0) {
              this.goodsData.footer = newValue[this.viewTemp.footer];
            }
          }

        }
      }
    }
  };
</script>

<style lang="scss">
  .list-item-wrap {
    width: auto;
    margin: 10rpx 0;
    box-sizing: border-box;

    // width: calc(1 * 100% / 6);
    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10upx;
      box-sizing: border-box;

      .main-image {
        width: 180rpx;
        height: 180rpx;
        border-radius: 5upx 5rpx;
        margin-right: 20upx;
        border-radius: 10rpx;
        overflow: hidden;
        // flex: 1;
        text-align: center;
        border: 1px solid #f1f1f1;

        .text {
          font-size: 50px;
          line-height: 180rpx;
          font-weight: 200;
        }

        .image {
          width: 100%;
          height: 100%;
        }
      }

      .content-box {
        transition: all 1s ease-out;
        box-sizing: border-box;
        max-width: 100%;
        flex: 2;
        overflow: hidden;
        color: #666;

        .title {
          width: 100%;
          margin-bottom: 10upx;
          overflow: hidden;
          // text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-flex;
          justify-content: space-between;

          .main-title {
            color: #333;
            font-weight: bold;
            font-size: 32rpx;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
          }

          .title-tip {
            padding: 5rpx 10rpx;
            border: 1px solid;
            max-width: 200rpx;
            overflow: hidden;
            height: 50rpx;
            margin-left: 20rpx;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .content-header {
          display: flex;
          justify-content: space-between;

          .title {
            width: 60%;
            line-height: 40upx;
            color: #333;
            font-weight: bold;
            margin-bottom: 10upx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .status {
            width: 35%;
            text-align: right;

            .text {
              padding: 5upx 10upx;
              border-radius: 5upx;
            }
          }
        }

        .lable {
          font-weight: normal;
          font-size: 28upx;
          color: #333;
        }

        .sub-title {
          font-size: 24upx;
          word-break: break-all;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          /**指定行数*/
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .numbers {
          color: #e93b3d;
          line-height: 40upx;
          font-size: 36upx;

          .label {
            color: #333;
            font-size: 14px;
          }

          .unit {
            font-size: 30upx;
          }
        }

        .content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;

          .content-item {
            max-width: 50%;
            min-width: 45%;
            display: flex;
            min-height: 50upx;
            align-items: center;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:last-child {
              // justify-content: flex-end;
            }

            .label {
              font-weight: normal;
              font-size: 28upx;
              color: #333;
            }

            .value {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }

        .footer {
          display: flex;
          justify-content: space-between;
          min-height: 40upx;
          flex-direction: column;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          .foot-name {
            max-width: 95%;
            position: relative;
            display: inline-block;
            padding-right: 28upx;
            line-height: 44upx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &::after {
              content: "";
              display: block;
              width: 8px;
              height: 8px;
              border-top: 1px solid #999;
              border-left: 1px solid #999;
              transform-origin: 50%;
              transform: rotate(135deg);
              position: absolute;
              width: 6px;
              height: 6px;
              right: 5px;
              top: 50%;
              margin-top: -3px;
            }
          }

          .foot-button {
            width: 100%;
            display: flex;
            font-size: 40upx;
            justify-content: flex-end;
            flex-wrap: wrap;

            .cu-btn {
              margin-right: 10rpx;
              margin-bottom: 10rpx;
            }
          }

          .footer-btn {
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
        }
      }
    }
  }

  .list-item-wrap.grid-layout-item {
    margin: 10rpx 0 0;
    padding: 0;
    border-radius: 10rpx;
    box-shadow: 6px 5px 13px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .cu-btn.sm {
      padding: 0 2px;
    }

    ::v-deep .list-item {
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;

      .main-image {
        width: 100% !important;
        border-radius: 5rpx 5rpx 0 0 !important;
        margin: 0;
        border-radius: 10rpx;
        overflow: hidden;
        height: 100rpx !important;
        border-bottom: 1rpx solid #f1f1f1;
        flex: auto;

        .text {
          font-size: 85rpx;
          line-height: 100rpx;
        }
      }

      .content-box {
        min-height: 50rpx;
        display: flex;
        flex-wrap: wrap;

        .title {
          margin: 0;
          text-overflow: clip;
          width: 100%;
          font-size: 24rpx;
          flex: 1;
          padding: 4rpx 8rpx;
          font-weight: normal;
        }

        .footer {
          align-items: flex-end;
          justify-content: flex-end;
          min-height: 0;
          margin-bottom: 10rpx;

          .foot-button {
            flex-wrap: wrap;
            justify-content: space-between;

            .cu-btn {
              margin-right: 0;

              // padding:0 10rpx;
              &[class*="line"]::after {
                content: none;
              }
            }
          }
        }
      }
    }
  }
</style>
