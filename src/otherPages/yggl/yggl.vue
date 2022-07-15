<template>
  <view>
    <view class="add-box text-bold" @click="changeModal('add')">
      <text class="cuIcon-add"></text>添加员工
    </view>
    <view class="member-list">
      <view class="member-item" v-for="item in members">
        <image :src="getImagePath(item.user_image)" class="profile" mode="aspectFit"></image>
        <view class="right">
          <view class="">
            <text class="text-bold text-lg margin-right-xs">{{item.person_name}}</text>
            <text class="text-sm">健管师</text>
            <!-- <text class="text-sm">{{item.person_introduce}}</text> -->
          </view>
          <view class="margin-tb-xs">
            <view class="text-sm text-gray">
              排班：
              <text>{{item.schedule_week|splitWeek}}</text>
            </view>
            <view class="margin-left-xxl text-sm text-gray" v-if="item.schedule_start_time&&item.schedule_end_time">
              <text>{{item.schedule_start_time|formatTime}} - {{item.schedule_end_time|formatTime}}</text>
            </view>
            <view class="text-sm text-gray ">
              手机：{{item.user_phone||''}}
            </view>
          </view>
        </view>
        <view class="handler">
          <text class="cuIcon-write" @click="toEdit(item)"></text>
          <text class="cuIcon-delete margin-left" @click="toDel(item)"></text>
        </view>
      </view>
    </view>

    <view class="cu-modal bottom-modal" :class="{show:['add','edit'].includes(modalName)}">
      <view class="cu-dialog" @touchmove="">
        <view class="title padding-tb text-bold flex justify-between">
          <text class="padding-lr">
            <text class="cuIcon-close " style="opacity: 0;"></text>
          </text>
          <text>{{modalName=='add'?'添加员工':'编辑员工信息'}}</text>
          <text class="padding-lr" @click="changeModal()">
            <text class="cuIcon-close "></text>
          </text>
        </view>
        <view class="edit-modal">
          <view class="form-item">
            <view class="label">
              健管师账号
            </view>
            <view class="field" @click="toCustomerSelector">
              {{form.store_user_no}}
            </view>
          </view>
          <view class="form-item">
            <view class="label">
              姓名
            </view>
            <view class="field">
              <input type="text" v-model="form.person_name">
            </view>
          </view>
          <view class="form-item">
            <view class="label">
              头像
            </view>
            <view class="field">
              <bx-image-upload :max-count="1" :custom-btn="true" :clipWidth="300" :clipHeight="300" interfaceName="add"
                appName="health" tableName="bxhealth_store_service_people" :value="form.person_image"
                index="person_image" :action="actionUrl" @change="valChange($event,'person_image')">
                <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
                  <text class="cuIcon-add"></text>
                </view>
              </bx-image-upload>
            </view>
          </view>
          <view class="form-item">
            <view class="label">
              手机
            </view>
            <view class="field">
              <input type="text" v-model="form.user_phone">
            </view>
          </view>
          <view class="form-item">
            <view class="label">
              工作日
            </view>
            <view class="field">
              <u-checkbox-group @change="checkboxGroupChange">
                <u-checkbox v-model="item.checked" v-for="(item, index) in weeks" :key="item.name" :name="item.name">
                  {{item.label}}
                </u-checkbox>
              </u-checkbox-group>
            </view>
          </view>
          <view class="form-item">
            <view class="label">
              排班
            </view>
            <view class="flex align-center flex-1">
              <picker mode="time" v-model="form.schedule_start_time" start="09:01" end="21:01"
                @change="valChange($event,'schedule_start_time')">
                <view class="field">{{form.schedule_start_time||'请选择'}}</view>
              </picker>
              <text class="margin-lr-xs">至</text>
              <picker mode="time" v-model="form.schedule_end_time" start="09:01" end="21:01"
                @change="valChange($event,'schedule_end_time')">
                <view class="field">{{form.schedule_end_time||'请选择'}}</view>
              </picker>
            </view>
          </view>
          <view class="form-item">
            <view class="label">
              可预约数量
            </view>
            <view class="field">
              <input type="number" v-model="form.can_reserve_num">
            </view>
          </view>
          <view class="bottom-button" @click="confirm">
            确定
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        personList: [],
        members: [],
        weeks: [{
            label: '周一',
            name: "1",
            checked: true
          }, {
            label: '周二',
            name: "2",
            checked: true
          },
          {
            label: '周三',
            name: "3",
            checked: true
          }, {
            label: '周四',
            name: "4",
            checked: true
          }, {
            label: '周五',
            name: "5",
            checked: true
          }, {
            label: '周六',
            name: "6",
            checked: false
          }, {
            label: '周日',
            name: "7",
            checked: false
          }
        ],
        form: {
          store_user_no: "",
          person_name: "",
          person_image: "",
          user_phone: "",
          schedule_week: "",
          schedule_start_time: "",
          schedule_end_time: "",
          can_reserve_num: "", //可预约数量
        },
        modalName: "",
        cur: null,
        curType: '',
      }
    },
    computed: {
      actionUrl() {
        return `${this.$api.srvHost}/file/upload`
      }
    },
    onLoad() {
      this.getList()
    },
    filters: {
      formatTime(val) {
        if (val && val.length == 8) {
          return val.slice(0, 5)
        }
      },
      splitWeek: function(value) {
        if (value) {
          let arr = value.split(',')
          let textMap = ['一', '二', '三', '四', '五', '六', '日']
          return arr.reduce((res, cur) => {
            if (!isNaN(Number(cur)) && cur - 1 >= 0) {
              res += `${textMap[Number(cur)-1]} `
            }
            return res
          }, "")
        }
      }
    },
    methods: {
      confirm() {
        this.modalName = ''
        if (!this.form.schedule_week) {
          this.form.schedule_week = this.weeks.filter(item => item.checked).map(item => item.name).toString()
        }
        let data = this.deepClone(this.form)
        data.store_no = data.store_no || this.storeInfo?.store_no
        let hasEmpty = Object.keys(data).filter(key => !data[key]).length !== 0
        if (hasEmpty) {
          uni.showModal({
            title: '提示',
            content: '请检查表单输入项是否完整',
            showCancel: false
          })
          return
        }

        const service = this.curType === 'edit' ? 'srvhealth_store_service_people_update' : this.curType === 'add' ?
          'srvhealth_store_service_people_add' : ""
        const url = `/health/operate/${service}`
        const req = [{
          "serviceName": service,
          "condition": [],
          "data": [data]
        }]
        if (this.curType === 'edit') {
          req[0].condition = [{
            colName: 'id',
            ruleType: 'eq',
            value: this.cur?.id
          }]
          if (!this.cur?.id) {
            uni.showModal({
              title: '提示',
              content: '系统错误，请推出小程序后重新进入页面再试',
              showCancel: false
            })
            return
          }
        }
        if (!service) {
          uni.showModal({
            title: '提示',
            content: '系统错误，请推出小程序后重新进入页面再试',
            showCancel: false
          })
          return
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state === "SUCCESS") {
            uni.showToast({
              title: '操作成功!'
            })
            this.changeModal()
            this.getList()
            this.cur = ''
            this.curType = ''
          } else if (res?.data?.resultMessage) {
            uni.showToast({
              title: res.data.resultMessage,
              icon: 'none'
            })
          }
        })
      },

      toCustomerSelector() {
        let condition = [{
          colName: 'store_no',
          ruleType: 'eq',
          value: this.storeInfo?.store_no
        }]
        let url =
          `/publicPages/list2/list2?disabled=true&selectCol=store_user_no&destApp=health&listType=selectorList&serviceName=srvhealth_store_user_select&cond=${JSON.stringify(condition)}`

        const listConfig = {
          "lp_style": "单行",
          "grid_span": "1",
          "btn_cfg": {
            "wrap_row": null,
            "show_custom_btn": false,
            "show_public_btn": false,
            "show": true,
            "bg_style": "line",
            "radius": "10px",
            "size": "",
            "padding": null
          },
          "img": {
            "col": "profile_url",
            "cfg": {
              "padding": "",
              "margin": "0 10px 0 0",
              "border": "",
              "width": "50px",
              "height": "50px",
              "radius": "50%",
              "position": "top",
              "mode": ""
            }
          },
          "cols": [{
            "col": "person_name||nick_name",
            "cfg": {
              "disp_label": false,
              "align": "left",
              "color": "#333",
              "min_width": "100%",
              "font_size": "14px",
              "font_weight": "bold",
              "padding": "0 10rpx 0 0"
            }
          }, {
            "col": "phone",
            "cfg": {
              "disp_label": false,
              "align": "left",
              "color": "#333",
              "min_width": "50%",
              "font_size": "14px",
              "padding": "0 10rpx 0 0"
            }
          }]
        }
        url += `&listConfig=${JSON.stringify(listConfig)}`
        url += `&idCol=id`

        const uuid = uni.$u.guid()
        url += `&uuid=${uuid}`
        uni.navigateTo({
          url
        })
        uni.$on('confirmSelect', (e) => {
          if (e.uuid === uuid) {
            let data = e.data
            this.form.store_user_no = e.data?.store_user_no
            this.form.person_name = e.data?.person_name
          }
        })
      },
      checkboxGroupChange(e) {
        this.form.schedule_week = e
      },
      valChange(val, col) {
        this.form[col] = val?.detail?.value || val
      },
      changeModal(e) {
        if (e === 'add') {
          Object.keys(this.form).forEach(key => {
            this.form[key] = ''
          })
          this.weeks = this.weeks.map(item => {
            item.checked = false
            return item
          })
        }
        this.curType = e
        this.modalName = e
      },
      toEdit(e) {
        this.cur = e
        Object.keys(e).forEach(key => {
          if (this.form.hasOwnProperty(key) && e[key]) {
            this.form[key] = e[key]
          }
        })
        if (this.form.schedule_week) {
          this.weeks = this.weeks.map(item => {
            if (this.form.schedule_week.indexOf(item.name) !== -1) {
              item.checked = true
            } else {
              item.checked = false
            }
            return item
          })
        }
        this.changeModal('edit')
      },
      toDel(e) {
        if (e?.id) {
          uni.showModal({
            title: '提示',
            content: '确认删除？',
            success: (res) => {
              if (res.confirm) {
                this.delData(e.id)
              }
            }
          })
        }
      },
      delData(id) {
        const service = `srvhealth_store_service_people_delete`
        const req = [{
          "serviceName": "srvhealth_store_service_people_delete",
          "condition": [{
            "colName": "id",
            "ruleType": "in",
            "value": id
          }]
        }]
        const url = `/health/operate/srvhealth_store_service_people_delete`
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            uni.showModal({
              title: '提示',
              content: '删除成功',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  this.getList()
                }
              }
            })
          }
        })
      },
      getList() {
        // 查找员工列表
        const service = `srvhealth_store_service_people_select`
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeInfo.store_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1000
          }
        }
        const url = `/health/select/srvhealth_store_service_people_select`
        this.$http.post(url, req).then(res => {
          if (res?.data?.state == 'SUCCESS') {
            this.members = res.data.data
          }
        })
      },

    }
  }
</script>

<style lang="scss" scoped>
  .add-box {
    padding: 5px;
    text-align: center;
    background-color: #fff;
    margin: 10px 0;

    .cuIcon-add {
      width: 25px;
      height: 25px;
      border: 1px solid #333;
      border-radius: 50%;
      text-align: center;
      line-height: 25px;
      margin-right: 5px;
      font-size: 16px;
    }
  }

  .member-list {
    .member-item {
      padding: 10px;
      margin: 5px;
      background-color: #fff;
      display: flex;
      align-items: center;

      .profile {
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }

      .right {
        padding-left: 10px;
        flex: 1;

        .margin-left-xxl {
          margin-left: 40px;
        }
      }

      .handler {}
    }
  }

  .edit-modal {
    .bottom-button {
      background-color: #DCB081;
      color: #fff;
      line-height: 40px;
      margin-top: 20px;
    }

    .form-item {
      padding: 0 20px;
      display: flex;
      align-items: center;
      margin: 5px 0;

      .flex-1 {
        flex: 1;
      }

      .label {
        min-width: 80px;

        &:before {
          content: '*';
          color: #ff0000;
          margin-right: 2px;
        }
      }

      .field {
        border-radius: 5px;
        border: 1px solid #f1f1f1;
        margin-left: 10px;
        min-height: 25px;
        padding: 2px 5px;
        flex: 1;
        min-width: 100px;

        .slot-btn {
          width: 100rpx;
          height: 100rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #f1f1f1;
          border-radius: 5px;
          margin-right: 5px;


          .cuIcon-add {
            font-size: 30px;
            color: #999;
          }
        }
      }
    }
  }
</style>
