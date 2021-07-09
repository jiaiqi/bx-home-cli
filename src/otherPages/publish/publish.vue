<template>
  <div class="publish">
    <view class="text-box">
      <textarea
        class="text-area"
        v-model="text_desc"
        placeholder="记录此刻心情~"
        placeholder-class="textarea-placeholder"
      />
      <view class="image-upload-box">
        <robby-image-upload
          :value="imagesUrl"
          :enable-del="true"
          :enable-add="true"
          :server-url="uploadUrl"
          @delete="deleteImage"
          @add="getImagesInfo"
          :form-data="uploadFormData"
          :header="reqHeader"
          :showUploadProgress="true"
          :server-url-delete-image="deleteUrl"
          :limit="9"
        ></robby-image-upload>
      </view>
    </view>
    <view class="other-option">
      <view class="option-item cu-form-group" @click="chooseLocation">
        <view class="picker">
          <text
            class="cuIcon-locationfill margin-right-xs"
            :class="{ 'text-cyan': location && location.name }"
          ></text>
          <text class="text-cyan" v-if="location && location.name">{{
            location.name
          }}</text>
          <text v-else>所在位置</text>
        </view>
        <text class="cuIcon-close" v-if="location && location.name"  @click.stop="clearLocation"></text>
        <text class="cuIcon-right" v-else></text>
      </view>
      <view class="option-item cu-form-group" @click="showModal('areaSelector','家乡')">
        <view class="picker">
          <text
            class="cuIcon-presentfill margin-right-xs"
            :class="{ 'text-cyan': selectHometown && selectHometown.name }"
          ></text>
          <text class="text-cyan" v-if="selectHometown && selectHometown.name">{{
            selectHometown.name
          }}</text>
          <text v-else>选择家乡</text>
        </view>
        <text class="cuIcon-close" v-if="selectHometown && selectHometown.name" @click.stop="claerHomeInfo"></text>
        <text class="cuIcon-right" v-else></text>
      </view>
      <view class="option-item cu-form-group" @click="showModal('companySelector')">
        <view class="picker">
          <text
            class="cuIcon-card margin-right-xs"
            :class="{ 'text-cyan': selectedCompany && selectedCompany.org_name }"
          ></text>
          <text class="text-cyan" v-if="selectedCompany && selectedCompany.org_name">{{
            selectedCompany.org_name
          }}</text>
          <text v-else>选择单位</text>
        </view>
        <text class="cuIcon-close" v-if="selectedCompany && selectedCompany.org_name"  @click.stop="clearCompany"></text>
        <text class="cuIcon-right" v-else></text>
      </view>
    </view>
    <view class="button-box">
      <button @click="goBack" class="cu-btn bg-gray">返回</button>
      <button
        :disabled="disabledPublish"
        type="primary"
        @click="publish"
        class="cu-btn bg-green"
      >
        发表
      </button>
    </view>

    <view class="cu-modal bottom-modal" @click="hideModal" :class="{show:modalName=== 'createOrg'}">
      <view class="cu-dialog" @click.stop="" v-if="modalName=== 'createOrg'">
        <view class="form-view">
          <view class="cu-form-group ">
            <view class="title"><text class="text-red">*</text>单位名称</view>
            <input placeholder="单位名称" name="input" v-model="org_name"></input>
          </view>
          <view class="cu-form-group ">
            <view class="title"><text class="text-red">*</text>所在地区</view>
            <view class="form-input" style="flex:1;" @click="showModal('areaSelector','单位')">
              <text class="text">
                {{selectOrgAddr.name_path||'点击选择单位所在的地区'}}
              </text>
              <text class="cuIcon-close margin-left" v-if="selectOrgAddr.name_path"
                @click.stop="clearOrgAddrInfo"></text>
            </view>
          </view>
          <view class="cu-form-group ">
            <view class="title"><text class="text-red">*</text>详细地址</view>
            <input placeholder="填写单位详细地址" name="input" v-model="org_addr" />
          </view>
          <view class="tips text-red">
            {{createOrgTips}}
          </view>
          <view class="button-box">
            <button type="primary" class="cu-btn bg-blue margin-right" @click="createOrg">确定</button>
            <button class="cu-btn bg-grey" @click.stop="showModal('editInfo')">取消</button>
          </view>
        </view>
      </view>
    </view>

   <view
      class="cu-modal bottom-modal"
      @click="hideModal"
      :class="{ show: modalName === 'companySelector' }"
    >
      <view class="cu-dialog" @click.stop="">
          <view class="company-info">
            	<view class="label ">
								输入单位名称进行搜索
							</view>
							<view class="">
								<view class="form-input">
									<input type="text" class="text" v-model="org_name" placeholder="请输入单位名称"
										@input="onInputCompany" />
									<!-- <text class="cuIcon-close" v-if="org_name" @click.stop="clearAreaInfo"></text> -->
								</view>
							</view>
							<view class="company-list" v-if="companyList&&companyList.length>0">
								<view class="company-item text-blue" v-for="item in companyList" :key="item.id"
									@click="clickCompany(item)">
									{{item.org_name||''}}
								</view>
							</view>
							<!-- <view class="company-list"> -->
							<view class="tips text-red" v-if="createOrgTips">
								{{createOrgTips||''}}
							</view>
							<view class="create-org text-orange" @click.stop="showModal('createOrg')"
								v-if="(companyList&&companyList.length==0)||(!this.selectedCompany.org_no)||this.selectedCompany.org_name!==org_name&&org_name">
								<text class="cuIcon-question margin-right-xs"></text> 未找到您所在的单位？单击此处创建！
							</view>
          </view>
      </view>
   </view>
    <view
      class="cu-modal bottom-modal"
      @click="hideModal"
      :class="{ show: modalName === 'areaSelector' }"
    >
      <view class="cu-dialog" @click.stop="">
        <!-- <tree-selector
          v-show="typeRadio === '所在地'"
          :srvInfo="srvInfo"
          @cancel="showModal('editInfo')"
          :order="areaOrder"
          :current="selectArea"
          @confirm="clickArea"
        >
        </tree-selector> -->
        <tree-selector
          v-show="typeRadio === '家乡'"
          :srvInfo="srvInfo"
          @cancel="showModal('editInfo')"
          :order="areaOrder"
          :current="selectHometown"
          @confirm="clickHome"
        >
        </tree-selector>
        <tree-selector
          v-show="typeRadio === '单位'"
          :srvInfo="srvInfo"
          @cancel="showModal('createOrg')"
          :order="areaOrder"
          :current="selectOrgAddr"
          @confirm="clickOrgAddr"
        >
        </tree-selector>
      </view>
    </view>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      act_no: "",// 活动编号
      storeNo: null,
      org_name: "",
      org_addr: "",
      text_desc: '',
      imagesUrl: [],
      reqHeader: {
        bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
      },
      imageNo: "",
      uploadFormData: {
        serviceName: 'srv_bxfile_service',
        interfaceName: 'add',
        app_no: 'bxportal',
        table_name: 'bxportal_friends_circle',
        columns: 'photos'
      },
      location: {},
      companyList: [],
      selectedCompany: {},
      selectOrgAddr: {},
      selectHometown: {},
      modalName: "",
      fromPage: "",
      typeRadio: "", //家乡、单位
      areaOrder: [ {
        colName: "city_code",
        orderType: "desc"
      } ],
      createOrgTips: "",
      srvInfo: {
        column: 'id',
        parentCol: 'pid',
        showCol: 'name',
        isTree: true,
        serviceName: 'srvportal_city_select',
        appNo: 'bxportal'
      }
    }
  },
  computed: {
    disabledPublish () {
      return !this.text_desc && this.imagesUrl.length === 0
    },
    ...mapState({
      userInfo: state => state.user.userInfo
    }),
    uploadUrl () {
      return this.$api.upload;
    },
    deleteUrl () {
      return this.$api.deleteFile;
    }
  },

  onLoad (option) {
    if (option.activityNo) {
      this.act_no = option.activityNo
    }
    if (option.fromPage) {
      this.fromPage = decodeURIComponent(option.fromPage)
    }
    if (option.storeNo) {
      this.storeNo = option.storeNo
    }
  },
  mounted () {
    uni.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.location = res
      }
    })
  },
  methods: {
    async createOrg () {
      // 创建单位
      if (!this.org_name) {
        uni.showToast({
          title: '请填写单位名称！',
          icon: 'none'
        })
        return
      }
      if (!this.selectOrgAddr || !this.selectOrgAddr.id) {
        this.createOrgTips = '请选择单位所在地区!'
        return
      }
      if (!this.org_addr) {
        this.createOrgTips = '请填写单位详细地址!'
        return
      }
      let reg =
        /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/
      if (reg.test(this.org_name)) {
        this.createOrgTips = '单位名称中不能包含特殊字符或表情!'
        return
      }
      if (reg.test(this.org_addr)) {
        this.createOrgTips = '详细地址中不能包含特殊字符或表情!'
        return
      }
      this.createOrgTips = ''
      let req = [ {
        "serviceName": "srvportal_org_mgmt_add",
        "condition": [],
        "data": [ {
          "org_name": this.org_name,
          "area_id": this.selectOrgAddr.id,
          "org_addr": this.org_addr,
          "org_lng": this.location.longitude,
          "org_lat": this.location.latitude
        } ]
      } ]
      let url = this.getServiceUrl('bxportal', 'srvportal_org_mgmt_add', 'operate');
      let res = await this.$http.post(url, req)
      if (res.data.state === 'SUCCESS') {
        if (
          Array.isArray(res.data.response) &&
          res.data.response.length > 0 &&
          res.data.response[ 0 ].response &&
          Array.isArray(res.data.response[ 0 ].response.effect_data) &&
          res.data.response[ 0 ].response.effect_data.length > 0
        ) {
          let company = res.data.response[ 0 ].response.effect_data[ 0 ]
          this.clickCompany(company)
          this.showModal('editInfo')
        }
      }
    },
    clickCompany (e) {
      this.selectedCompany = e
      this.org_name = ''
      this.companyList = null
      // this.selectOrgInfo()
      this.hideModal()
    },
    onInputCompany (e) {
      let cond = null
      this.createOrgTips = ''
      if (e.detail.value) {
        cond = [ {
          colName: 'org_name',
          ruleType: 'like',
          value: e.detail.value
        } ]
        this.selectCompany(cond)
      } else {
        this.companyList = null
      }
    },
    selectCompany (cond) {
      let url = this.getServiceUrl('bxportal', 'srvportal_org_mgmt_select', 'select');
      let req = {
        "serviceName": "srvportal_org_mgmt_select",
        "colNames": [ "*" ],
        "condition": cond || [],
        "page": {
          "pageNo": 1,
          "rownumber": 3
        },
      }
      this.$http.post(url, req).then(res => {
        if (Array.isArray(res.data.data)) {
          this.companyList = res.data.data
        }
      })
    },
    clickOrgAddr (e) {
      if (e && e.id) {
        this.selectOrgAddr = e
      }
    },
    clickHome (e) {
      if (e && e.id) {
        this.selectHometown = e
        this.hideModal()
        // this.setWXOption();
      }
    },
    clearLocation () {
      uni.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.location = res
        }
      })
    },
    clearCompany () {
      this.selectedCompany = null
    },
    claerHomeInfo () {
      this.selectHometown = null
    },
    clearOrgAddrInfo () {
      this.selectOrgAddr = {
        name: ''
      }
    },
    showModal (name, type) {
      // this.getLocationAuth()
      this.createOrgTips = ''
      this.modalName = name
      if (type) {
        this.typeRadio = type
      }
      if (name === 'companySelector') {
        this.selectCompany()
      }
    },
    clickOrgAddr (e) {
      if (e && e.id) {
        this.selectOrgAddr = e
        this.showModal('createOrg')
      }
    },
    async chooseLocation () {
      const result = await new Promise((resolve) => {
        uni.chooseLocation({
          success: (res) => {

            resolve(res)
          }
        });
      })
      if (result && result.name) {
        this.location = result
      }
    },
    goBack () {
      uni.redirectTo({ url: this.fromPage })
    },
    async deleteImage (e) {
      let res = await this.getFilePath(this.imageNo)
      if (Array.isArray(res)) {
        this.imagesUrl = res.map(item => {
          return this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync(
            'bx_auth_ticket')
        })
      } else {
        this.imagesUrl = []
      }
    },
    async getImagesInfo (e) {
      let img = e.allImages[ 0 ];
      if (typeof img === 'string') {
        try {
          img = JSON.parse(img);
        } catch (e) {
          //TODO handle the exception
        }
      }
      this.imageNo = img.file_no;
      if (this.imageNo) {
        let res = await this.getFilePath(this.imageNo)
        if (Array.isArray(res)) {
          this.imagesUrl = res.map(item => {
            return this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync(
              'bx_auth_ticket')
          })
        } else {
          this.imagesUrl = []
        }
      }
      if (this.imageNo !== '' && this.imageNo !== null && this.imageNo !== undefined) {
        this.uploadFormData[ 'file_no' ] = this.imageNo;
      }
    },
    publish () {
      // 发表
      if (!this.text_desc && !this.imageNo) {
        return
      }
      let req = [
        {
          "serviceName": "srvportal_friends_circle_add",
          "condition": [],
          "data": [
            {
              "fc_type": "活动",
              "act_no": this.act_no || "AT2106110001",
              "user_no": this.userInfo.userno,
              "text_desc": this.text_desc ? this.text_desc.replace(
                /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig,
                "") : null,
              "photos": this.imageNo,
              hometown_id: this.selectHometown?.id || null,
              lat: this.location.latitude,
              lng: this.location.longitude,
              nick_name: this.userInfo.nick_name,
              org_no: this.selectedCompany?.org_no || null,
              org_name: this.selectedCompany?.org_name || null,
              pre_share_user_no: null,
              profile_url: this.userInfo.profile_url,
              share_url: null,
              store_no: this.storeNo,
              unionid: null,
              user_addr: this.location?.name || this.location?.address || null,
              user_area_id: null
            } ]
        }
      ]
      this.$fetch('operate', 'srvportal_friends_circle_add', req, 'bxportal').then(res => {
        if (res.success) {
          this.goBack()
        }
      })
    },
    hideModal () {
      this.modalName = ''
    },
  },
};
</script>

<style scoped lang="scss">
.publish {
  padding: 20rpx;
  .text-box {
    min-height: 400rpx;
    border-bottom: 1px solid #f1f1f1;
    margin: 20rpx;
    .text-area {
      width: 100%;
    }
  }
  .other-option {
    margin: 0 20rpx;
    .option-item {
      // border-bottom: 1px solid #f1f1f1;
      display: flex;
      align-items: center;
      min-height: 100rpx;
      justify-content: space-between;
      .picker {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .button-box {
    margin-top: 40rpx;
    text-align: center;
    .cu-btn {
      width: 45%;
    }
  }
}
.company-info {
  min-height: 600rpx;
  padding: 20rpx;
  .label {
    font-weight: bold;
    padding: 10rpx;
  }
  .form-input {
    display: flex;
    align-items: center;
    text-align: left;
    font-size: 30rpx;
    width: 100%;
    padding: 20rpx 40rpx;
    border: 0.5px solid #d0d4d6;
    .text {
      color: #555;
      flex: 1;
    }
  }

  .company-list {
    padding: 20rpx;
    margin: 10rpx 20rpx;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

    & + .company-list {
      margin-top: 0;
    }

    .company-item {
      text-align: center;
      padding: 20rpx;
      border-bottom: 1px solid #d0d4d6;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }
  }
}
</style>
