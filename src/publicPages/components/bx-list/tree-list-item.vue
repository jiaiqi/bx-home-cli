<template>
  <view class="list-item-wrap bg-white" :class="{'grid-layout-item':layout==='grid'}">
    <u-action-sheet :list="groupRowButton.groupBtn" v-model="showGroupBtn" @click="clickGroupBtn"></u-action-sheet>
    <view class="list-item flex" v-if="itemViewType === 'normal'">
      <imgLazy class="main-image" v-if="setViewTemp['img']" :item="itemData" :imgColName="setViewTemp['img']">
      </imgLazy>
      <view class="content-box flex-twice"
        v-if="(listType === 'proc' && pageType === 'proc')||(listType === 'list' && pageType === 'list')">
        <view class="content-header">
          <view class="title" @click="listItemClick">
            <text class="label" v-if="setViewTemp['_showLabel']&&itemViewType === 'normal'">
              {{colNameToLabel(srv_cols,setViewTemp.title)}}：
            </text>
            {{ itemData[setViewTemp.title] }}
          </view>
          <view class="status" v-if="itemData[setViewTemp.tip]" @click="listItemClick">
            <view class="">
              <view class="cu-tag line-blue round">
                {{ sliceString(itemData[setViewTemp.tip],6,null,true) }}
              </view>
            </view>
          </view>
        </view>
        <view class="title-tip" v-if="itemData[setViewTemp.subTitle]" @click="listItemClick">
          <text class="lable" v-show="setViewTemp['_showLabel']&&itemViewType === 'normal'">
            {{colNameToLabel(srv_cols,setViewTemp.subTitle)}}：
          </text>
          <text class="value">{{ itemData[setViewTemp.subTitle] }}</text>
        </view>
        <view class="content proc-content" @click="listItemClick">
          <view class="content-item" v-if="itemData[setViewTemp.left] ">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.left)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.left],10,null,true) }}</view>
          </view>
          <view class="content-item" v-if="itemData[setViewTemp.right] ">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.right)}}：
            </view>
            <view class="value">{{ itemData[setViewTemp.right] }}</view>
          </view>
          <view class="content-item" v-if="itemData[setViewTemp.footer]">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.footer)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.footer],20,null,true) }}</view>
          </view>
        </view>

        <view class="footer" v-if="rowButton.length > 0">
          <view class="footer-btn" v-if="showFootBtn&&!detailList">
            <button class="cu-btn bx-btn radius bg-blue" :data-row="itemData" :data-shareTitle="item.shareTitle"
              :data-shareurl="item.shareUrl" :open-type="item.type" v-for="item in setCustomBtn"
              @click="footBtnClick(item)">{{item.name}}</button>
            <button v-for="(item,index) in groupRowButton.otherBtn" :key="item.id" class="cu-btn bx-btn radius  bg-blue"
              :class="'cuIcon-' + item.button_type" @click="footBtnClick(item)">
              {{ item.button_name }}
            </button>
            <button class="cu-btn bx-btn bg-blue light " @click="showGroupBtn=true"
              v-if="groupRowButton.groupBtn.length>0">
              <text class="cuIcon-settingsfill margin-right-xs"></text>
              <text class="text-black">{{groupRowButton.groupTitle||'操作'}}</text>
              <text class="cuIcon-triangledownfill margin-left-xs"></text>
            </button>
          </view>
          <button v-else-if="deRowButDisplay(itemData, item,index) && !detailList"
            class="cu-btn bx-btn radius  bg-blue " :class="'cuIcon-' + item.button_type"
            v-for="(item,index) in rowButton" :key="item.id" @click="footBtnClick(item)">
            {{ item.button_name }}
          </button>
        </view>
      </view>
      <view class="content-box flex-twice"
        v-else-if="listType === 'list' && pageType === 'proc' && (itemData.issue_name || itemData.task_name)">
        <view class="content-header">
          <view class="title" @click="listItemClick">{{ itemData[setViewTemp.title] }}</view>
          <view class="status" v-if="itemData.proc_status" @click="listItemClick">
            <text class="bg-red text">{{ itemData.proc_status }}</text>
          </view>
        </view>
        <view class="title-tip" v-if="itemData['executor_user']" @click="listItemClick">
          <view class="lable">责任人：</view>
          <view class="value">{{ itemData['executor_user'] }}</view>
        </view>
        <view class="content proc-content" @click="listItemClick">
          <view class="content-item">
            <view class="label">创建时间：</view>
            <view class="value">{{ sliceString(itemData[setViewTemp.create_time],10,null,true) }}</view>
          </view>
          <view class="content-item">
            <view class="label">创建人：</view>
            <view class="value">{{ itemData.create_user_disp }}</view>
          </view>
          <view class="content-item">
            <view class="label">修改时间：</view>
            <view class="value">{{ sliceString(itemData[setViewTemp.modify_time],10,null,true) }}</view>
          </view>
        </view>
        <view class="footer" v-if="rowButton.length > 0 && showFootBtn">
          <view class="footer-btn" v-if="showFootBtn">
            <view
              v-if="groupRowButton&&groupRowButton.groupTitle&&groupRowButton.groupBtn&&groupRowButton.groupBtn.length>0">
              <button v-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue"
                :class="'cuIcon-' + item.button_type" v-for="(item,index) in groupRowButton.otherBtn" :key="item.id"
                @click="footBtnClick(item)">
                {{ item.button_name }}
              </button>
              <button class="cu-btn bg-blue light " @click="showGroupBtn=true"><text
                  class="cuIcon-unfold margin-right-xs"></text>
                {{groupRowButton.groupTitle||'操作'}}</button>
            </view>
            <button v-else-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue "
              :class="'cuIcon-' + item.button_type" v-for="(item,index) in rowButton" :key="item.id"
              @click="footBtnClick(item)">
              {{ item.button_name }}
            </button>
          </view>
        </view>
      </view>
      <view class="content-box flex-twice" v-else>
        <view class="title" @click="listItemClick">{{ itemData.title ||''}}</view>
        <view class="title-tip" v-if="itemData.tip" @click="listItemClick">{{ itemData.tip }}</view>
        <view class="content" v-if="itemData.price" @click="listItemClick">
          <view class="numbers">
            {{ itemData.price }}
          </view>
          <view class="tags"></view>
        </view>
        <view class="footer">
          <text class="foot-name" v-if="itemData.footer" @click="listItemClick">{{ itemData.footer }}</text>
          <view class="foot-button" v-if="showFootBtn">
            <view class="cu-btn bg-blue round sm" :class="'cuIcon-' + item.button_type"
              v-for="(item,index) in rowButton" :key="item.id" @click="footBtnClick(item)">
              <text v-if="deRowButDisplay(itemData, item,index) && !detailList">{{ item.button_name }}</text>
            </view>
            <text v-if="detailList" class="text-gray" :class="'cuIcon-more'"></text>
            <!-- <text class="lg text-blue cuIcon-delete"></text> -->
          </view>
        </view>
      </view>
    </view>
    <view class="list-item flex" v-else-if="itemViewType === 'info'">
      <imgLazy class="main-image" v-if="itemData[setViewTemp['img']]" :item="itemData" :imgColName="'img'">
      </imgLazy>
      <view class="content-box flex-twice" v-if="listType === 'proc' && pageType === 'proc'">
        <view class="content-header">
          <view class="title" @click="listItemClick">{{ itemData[setViewTemp.title]||'' }}</view>
          <view class="status" v-if="itemData[setViewTemp.tip]" @click="listItemClick">
            <view class="">
              <view class="cu-tag line-blue round">
                {{ sliceString(itemData[setViewTemp.tip],6,null,true) }}
              </view>
            </view>
          </view>
        </view>
        <view class="title-tip" v-if="itemData[setViewTemp.subTitle]" @click="listItemClick">
          <view class="value"> <text class="lable" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.subTitle)}}：
            </text>{{ itemData[setViewTemp.subTitle] }}</view>
        </view>
        <view class="content proc-content" @click="listItemClick">
          <view class="content-item" v-if="setViewTemp.price" @click="listItemClick">
            <view class="numbers">
              {{ itemData[setViewTemp.price] }}
            </view>
          </view>
          <view class="content-item" v-if="setViewTemp.left">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.left)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.left],10,null,true) }}</view>
          </view>
          <view class="content-item" v-if="setViewTemp.right">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.right)}}：
            </view>
            <view class="value">{{ itemData[setViewTemp.right] }}</view>
          </view>
          <view class="content-item" v-if="setViewTemp.footer">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.footer)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.footer],20,null,true) }}</view>
          </view>
        </view>
        <view class="footer" v-if="rowButton.length > 0">
          <view class="footer-btn " v-if="showFootBtn">
            <view
              v-if="groupRowButton&&groupRowButton.groupTitle&&groupRowButton.groupBtn&&groupRowButton.groupBtn.length>0">
              <button v-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue"
                :class="'cuIcon-' + item.button_type" v-for="(item,index) in groupRowButton.otherBtn" :key="item.id"
                @click="footBtnClick(item)">
                {{ item.button_name }}
              </button>
              <button class="cu-btn bg-blue light " @click="showGroupBtn=true"><text
                  class="cuIcon-unfold margin-right-xs"></text>
                {{groupRowButton.groupTitle||'操作'}}</button>
            </view>
            <button v-else-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue "
              :class="'cuIcon-' + item.button_type" v-for="(item,index) in rowButton" :key="item.id"
              @click="footBtnClick(item)">
              {{ item.button_name }}
            </button>
          </view>
        </view>
      </view>
      <view class="content-box flex-twice"
        v-else-if="listType === 'list'||listType === 'detaillist'||listType==='procdetaillist'">
        <view class="content-header">
          <view class="title" @click="listItemClick">{{ itemData[setViewTemp.title] }}</view>
          <view class="status " v-if="itemData[setViewTemp.tip]" @click="listItemClick">
            <text class="cu-tag line-blue round">{{ sliceString(itemData[setViewTemp.tip],6,null,true) }}</text>
          </view>
        </view>
        <view class="title-tip" v-if="itemData[setViewTemp.subTitle]" @click="listItemClick">
          <view class="lable" v-show="setViewTemp['_showLabel']">
            {{colNameToLabel(srv_cols,setViewTemp.subTitle)}}：
          </view>
          <view class="value">{{ itemData[setViewTemp.subTitle] }}</view>
        </view>
        <view class="content proc-content" @click="listItemClick">
          <view class="content-item" v-if="setViewTemp.left">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.left)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.left],10,null,true) }}</view>
          </view>
          <view class="content-item" v-if="setViewTemp.right">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.right)}}：
            </view>
            <view class="value">{{ itemData[setViewTemp.right] }}</view>
          </view>
          <view class="content-item" v-if="setViewTemp.footer">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.footer)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.footer],20,null,true) }}</view>
          </view>
        </view>
        <view class="footer" v-if="rowButton.length > 0">
          <view class="footer-btn" v-if="showFootBtn">
            <view
              v-if="groupRowButton&&groupRowButton.groupTitle&&groupRowButton.groupBtn&&groupRowButton.groupBtn.length>0">
              <button v-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue"
                :class="'cuIcon-' + item.button_type" v-for="(item,index) in groupRowButton.otherBtn" :key="item.id"
                @click="footBtnClick(item)">
                {{ item.button_name }}
              </button>
              <button class="cu-btn bg-blue light " @click="showGroupBtn=true"><text
                  class="cuIcon-unfold margin-right-xs"></text>
                {{groupRowButton.groupTitle||'操作'}}</button>
            </view>
            <button v-else-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue "
              :class="'cuIcon-' + item.button_type" v-for="(item,index) in rowButton" :key="item.id"
              @click="footBtnClick(item)">
              {{ item.button_name }}
            </button>
          </view>
        </view>
      </view>
    </view>
    <view class="list-item flex" v-else-if="itemViewType === 'custom'">
      <imgLazy class="main-image" v-if="itemData[setViewTemp['img']]" :item="itemData" :imgColName="'img'">
      </imgLazy>
      <view class="content-box flex-twice" v-if="listType === 'proc' && pageType === 'proc'">
        <view class="content-header">
          <view class="title" @click="listItemClick">{{ itemData[setViewTemp.title] }}</view>
          <view class="status" v-if="itemData[setViewTemp.tip]" @click="listItemClick">
            <view class="">
              <view class="cu-tag round line-blue">
                {{ sliceString(itemData[setViewTemp.tip],6,null,true) }}
              </view>
            </view>
          </view>
        </view>
        <view class="title-tip" v-if="itemData[setViewTemp.subTitle]" @click="listItemClick">
          <view class="lable" v-show="setViewTemp['_showLabel']">
            {{colNameToLabel(srv_cols,setViewTemp.subTitle)}}：
          </view>
          <view class="value">{{ itemData[setViewTemp.subTitle] }}</view>
        </view>
        <view class="content proc-content" @click="listItemClick">
          <view v-for="(row,index) in setViewTemp['row']" :key="index">
            <view class="content-item" v-if="setViewTemp.right" v-for="(item,num) in arrTransformStrRun(row,'array')"
              :key="num">
              <view class="label" v-show="setViewTemp['_showLabel']">{{colNameToLabel(srv_cols,item)}}：
              </view>
              <view class="value">{{ itemData[item] }}</view>
            </view>
          </view>
          <view class="content-item" v-if="setViewTemp.footer">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.footer)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.footer],20,null,true) }}</view>
          </view>
        </view>
        <view class="footer" v-if="rowButton.length > 0">
          <view class="footer-btn" v-if="showFootBtn">
            <view
              v-if="groupRowButton&&groupRowButton.groupTitle&&groupRowButton.groupBtn&&groupRowButton.groupBtn.length>0">
              <button v-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue"
                :class="'cuIcon-' + item.button_type" v-for="(item,index) in groupRowButton.otherBtn" :key="item.id"
                @click="footBtnClick(item)">
                {{ item.button_name }}
              </button>
              <button class="cu-btn bg-blue light " @click="showGroupBtn=true"><text
                  class="cuIcon-unfold margin-right-xs"></text>
                {{groupRowButton.groupTitle||'操作'}}</button>
            </view>
            <button v-else-if="deRowButDisplay(itemData, item,index) && !detailList" class="cu-btn radius  bg-blue "
              :class="'cuIcon-' + item.button_type" v-for="(item,index) in rowButton" :key="item.id"
              @click="footBtnClick(item)">
              {{ item.button_name }}
            </button>
          </view>
        </view>
      </view>
      <view class="content-box flex-twice"
        v-else-if="listType === 'list'||listType === 'detaillist'||listType==='procdetaillist'">
        <view class="content-header">
          <view class="title" @click="listItemClick">{{ itemData[setViewTemp.title] }}</view>
          <view class="status" v-if="itemData[setViewTemp.tip]" @click="listItemClick">
            <text class="cu-tag  round line-blue">{{ sliceString(itemData[setViewTemp.tip],6,null,true) }}</text>
          </view>
        </view>
        <view class="title-tip" v-if="itemData[setViewTemp.subTitle]" @click="listItemClick">
          <view class="lable" v-show="setViewTemp['_showLabel']">
            {{colNameToLabel(srv_cols,setViewTemp.subTitle)}}：
          </view>
          <view class="value">{{ itemData[setViewTemp.subTitle] }}</view>
        </view>
        <view class="content proc-content" @click="listItemClick">
          <view class="row-view" v-for="(row,index) in setViewTemp['row']" :key="index">
            <view class="content-item" v-if="setViewTemp['row']" v-for="(item,num) in arrTransformStrRun(row,'array')"
              :key="num">
              <view class="label" v-show="setViewTemp['_showLabel']">{{colNameToLabel(srv_cols,item)}}：
              </view>
              <view class="value">{{ itemData[item] }}</view>
            </view>
          </view>
          <view class="content-item" v-if="setViewTemp.footer">
            <view class="label" v-show="setViewTemp['_showLabel']">
              {{colNameToLabel(srv_cols,setViewTemp.footer)}}：
            </view>
            <view class="value">{{ sliceString(itemData[setViewTemp.footer],20,null,true) }}</view>
          </view>
        </view>
        <view class="footer" v-if="rowButton.length > 0">
          <view class="footer-btn" v-if="showFootBtn">
            <view
              v-if="groupRowButton&&groupRowButton.groupTitle&&groupRowButton.groupBtn&&groupRowButton.groupBtn.length>0">
              <button v-if="deRowButDisplay(itemData, item,index) && !detailList"
                class=" cu-btn bx-btn  radius  bg-blue" :class="'cuIcon-' + item.button_type"
                v-for="(item,index) in groupRowButton.otherBtn" :key="item.id" @click="footBtnClick(item)">
                {{ item.button_name }}
              </button>
              <button class="cu-btn bg-blue light " @click="showGroupBtn=true"><text
                  class="cuIcon-unfold margin-right-xs"></text>
                {{groupRowButton.groupTitle||'操作'}}</button>
            </view>
            <button v-else-if="deRowButDisplay(itemData, item,index) && !detailList"
              class="cu-btn bx-btn radius  bg-blue " :class="'cuIcon-' + item.button_type"
              v-for="(item,index) in rowButton" :key="item.id" @click="footBtnClick(item)">
              {{ item.button_name }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import imgLazy from '../bx-lazy-img/bx-lazy-img.vue'
  export default {
    name: 'ListItem',
    data() {
      return {
        showGroupBtn: false,
        picUrl: '',
        user: uni.getStorageSync('login_user_info').user_no
      };
    },
    components: {
      imgLazy
    },
    methods: {
      clickGroupBtn(index) {
        let buttons = this.groupRowButton.groupBtn
        if (Array.isArray(buttons) && buttons.length > 0) {
          let btn = buttons[index]
          this.footBtnClick(btn)
        }
      },
      arrTransformStrRun(val, type, d) {
        let res = this.arrTransformStr(val, type, d)
        return res
      },
      listItemClick() {
        // this.$emit('click-list-item', this.itemData);
        this.$emit('click-foot-btn', {
          button: this.detailBtn,
          row: this.itemData
        });
      },
      footBtnClick(btn) {
        if (btn && btn.type === 'share') {
          // let url = btn.url
          // let _data = {
          //   rowData:this.itemData,
          //   userInfo:this.$store?.state?.user?.userInfo,
          //   storeInfo:this.$store?.state?.app?.storeInfo
          // }
          // url = this.renderStr(url,_data)
          // this.shareUrl = url
          return
        } else {
          this.$emit('click-foot-btn', {
            button: btn,
            row: this.itemData
          });
        }

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
        if (file_no !== null && file_no !== '' && file_no !== undefined) {
          let res = await this.$http.post(url, req);
          if (res.data.state === 'SUCCESS') {
            const data = res.data.data[0];
            if (data) {
              const fileurl = this.$api.srvHost + '/file/download?filePath=' + data.fileurl;
              return fileurl;
            }
          }
        }
      },
      deRowButDisplay: function(item, button, index) {
        if (!button) {
          return false
        }
        if (Array.isArray(this.itemData._buttons)) {
          if (typeof index === 'number' && (index || index === 0)) {
            return this.itemData._buttons[index]
          }
        }
        if (button && button.button_type == 'customize') {
          if (button.disp_exps) {
            // #ifdef H5
            return this.evalBtnDispExps(button.disp_exps, item)
            // let testFun = new Function('e', `let data = e ; return (${button.disp_exps})`)
            // let result = testFun(item)
            // return result
            // #endif
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
          return true;
        }
      }
    },
    computed: {
      setCustomBtn() {
        if (Array.isArray(this.customBtn) && this.customBtn.length > 0) {
          return this.customBtn.map(btn => {
            let url = btn.url
            let _data = {
              rowData: this.itemData,
              userInfo: this.$store?.state?.user?.userInfo,
              storeInfo: this.$store?.state?.app?.storeInfo
            }
            url = this.renderStr(url, _data)
            btn.shareUrl = url
            if (btn.share_title) {
              btn.shareTitle = this.renderStr(btn.share_title, _data)
            }
            return btn
          })
        }
      },
      detailBtn() {
        return this.rowButton.find(item => item.button_type === 'detail')
      },
      groupRowButton() {
        const itemData = this.itemData
        const login_user_info = uni.getStorageSync('login_user_info')
        let buttons = this.deepClone(this.rowButton)
        buttons = buttons.filter((btn, index) => {
          //催办按钮只在 我的申请页面显示
          if (this.proc_data_type != "mine" && btn.button_type == 'urge') {
            return false;
          }
          if (btn.disp_exps) {
            // #ifdef H5
            return this.evalBtnDispExps(btn.disp_exps, itemData)
            // #endif
          } else {
            return this.deRowButDisplay(this.itemData, btn, index)
            // return true
          }
        })
        let groupBtn = buttons.filter(btn => {
          if (btn.moreConfig?.button_para?.group_tag) {
            btn.text = btn.button_name
            // return this.deRowButDisplay(this.itemData,btn,index)
            return true
          }
        })

        let otherBtn = buttons.filter(btn => !groupBtn.find(item => item.id === btn.id))
        let req = this.itemData.is_leaf
        if (Array.isArray(this.showBtn) && this.showBtn.length > 0 && req !== '是') {
          otherBtn = otherBtn.concat(this.showBtn)
        }

        let groupTitle = '操作'
        if (Array.isArray(groupBtn) && groupBtn.length > 0) {
          groupTitle = groupBtn[0]?.moreConfig?.button_para?.group_tag
        }
        return {
          groupBtn,
          otherBtn,
          groupTitle
        }
      },
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
                title: '',
                subTitle: "",
                left: '',
                right: '',
                tip: '',
                price: '',
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
        if (this.showLabel) {
          viewTemp['_showLabel'] = true
        }
        return viewTemp
      },
      itemViewType: function() {
        let viewTemp = this.viewTemp
        if (viewTemp) {
          let type = viewTemp['_type'] || 'normal'
          return type
        }
        if (this.viewType) {
          return this.viewType
        }
      },
      viewTempRun: function() {
        let viewTempRun = this.viewTemp
        let cfgTemp = {
          colName: "", // string 字段名  
          fontSize: "", // string  css 字体大小有效值。 px, rem 等
          fontColor: "", // string  css 支持的颜色值，六位、三位、RGB, 既定默认颜色 ： text-red || text-orange || text-black || text-blue || text-green || text-grey ||  text-white
          textAlign: "", // left || center || right
          border: "", //boolean  true || false
          styleType: "", // text || tips ||  capsule || tag || avatar || file   字段及风格基本样式，如，普通文字，tips, 标前等
          bgType: "", // string   bg-red || bg-orange || bg-black || bg-blue || bg-green || bg-grey ||  bg-white
          size: "", // lg  || md || xs 
          showLabel: false, // true || false
          valueType: "", //  money || dete || string || number || fk || dict || note || file
        }
        return viewTempRun
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
        type: Object,
        default: () => {}
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
      proc_data_type: {
        type: String //流程tab类型 wait|myall|mine|processed|
      },
      showFootBtn: {
        type: Boolean, //是否显示底部按钮
        default: true
      },
      layout: {
        type: String, //布局 normal-普通列表 grid-宫格
        default: 'normal'
      },
      showLabel: {
        type: Boolean, //是否显示标签
        default: false
      },
      showBtn: {
        type: Array,
      },
      customBtn: {
        type: Array,
      }
    },
    watch: {
      srv_cols: {
        deep: true,
        immediate: true,
        handler(newVal) {
          if (this.viewTemp) {
            let arr = Object.values(this.viewTemp);
          }
        }
      },
      itemData: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          let viewTemp = this.viewTempRun || this.viewTemp
          if (!viewTemp) {
            return
          }
        }
      }
    }
  };
</script>

<style lang="scss">
  .bx-btn {
    // min-width: 150rpx;
    padding: 6rpx 32rpx;
    background: #F8F8FA;
    opacity: 1;
    border-radius: 20px;
    font-size: 24rpx;
    color: #0088FE;

    &.text-blue {
      color: #0088FE;
    }

    &.text-black {
      color: #333;
    }
  }

  .list-item-wrap {
    width: auto;
    margin: 20rpx;
    box-sizing: border-box;
    border-radius: 16rpx;
    overflow: hidden;

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      padding: 20rpx;

      .main-image {
        width: 112rpx;
        height: 112rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        overflow: hidden;
      }

      .content-box {
        transition: all 1s ease-out;
        box-sizing: border-box;
        max-width: 100%;
        flex: 2;
        overflow: hidden;
        color: #6a6a6a;

        .title {
          // width: 60%;
          min-width: 60%;
          max-width: 100%;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 16px;
          font-family: 苹方-简;
          font-weight: normal;
          line-height: 0px;
          color: #333333;
          opacity: 1;
        }

        .content-header {
          display: flex;
          justify-content: space-between;

          .title {
            // min-width: 60%;
            // max-width: 100%;
            flex: 1;
            line-height: 40upx;
            color: #333;
            font-weight: bold;
            margin-bottom: 10upx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .label {
              font-weight: normal;
            }
          }

          .status {
            // width: 35%;
            text-align: right;
            margin-right: 2px;

            .text {
              padding: 5upx 10upx;
              border-radius: 5upx;
            }
          }
        }

        .lable {
          font-weight: normal;
          font-size: 28upx;
          color: #55557f;
        }

        .title-tip {
          font-size: 28upx;
          display: flex;
          align-items: center;
          overflow: hidden;
          word-break: break-all;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          /**指定行数*/
          -webkit-box-orient: vertical;

          .value.label {
            font-weight: bold;
          }

          .label {
            font-weight: bold;

          }

          // .value{
          // 	flex: 1;
          // 	word-break: break-all;
          // 	display: -webkit-box;
          // 	-webkit-line-clamp: 3; /**指定行数*/
          // 	-webkit-box-orient: vertical;
          // }
        }

        .content {

          // text-overflow: ellipsis;
          // white-space: nowrap;
          // overflow: hidden;
          .numbers {
            color: #e93b3d;
            line-height: 40upx;
            margin-top: 20upx;
            font-size: 36upx;
          }

          .unit {
            font-size: 30upx;
          }

          &.proc-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            padding: 0;

            .row-view {
              width: 100%;
              display: flex;
              flex-direction: row;

              .content-item {
                flex: 1;
              }
            }

            .content-item {
              // max-width: 50%;
              min-width: 45%;
              flex: 1;
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
                color: #55557f;
              }

              .value {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }

        .footer {
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 5rpx 0;

          .foot-name {
            max-width: 95%;
            position: relative;
            display: inline-block;
            padding-right: 28upx;
            line-height: 44upx;

            &::after {
              content: '';
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

            .cu-btn {
              margin-right: 20upx;
            }
          }

          .footer-btn {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            flex-wrap: wrap;
            padding-top: 10rpx;

            .cu-btn {
              margin-right: 10rpx;
              margin-bottom: 10rpx;
            }
          }
        }
      }
    }
  }

  .list-item-wrap.grid-layout-item {
    margin: 0;
    padding: 0;
    border-radius: 20rpx;
    box-shadow: 6px 5px 13px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    overflow: hidden;

    ::v-deep .list-item {
      margin: 0;
      padding: 0;

      .content-box {
        min-height: 150rpx;
        display: flex;
        flex-direction: column;

        .title {
          margin: 0;
          width: 100%;
          font-size: 32rpx;
          flex: 1;
          padding: 20rpx;
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
              &[class*='line']::after {
                content: none;
              }
            }
          }
        }
      }
    }
  }
</style>
