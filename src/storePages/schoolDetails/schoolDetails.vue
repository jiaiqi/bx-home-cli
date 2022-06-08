<template>
  <view class="bg-white padding" v-if="detail">
    <!-- 学校详情 -->
    <view class="text-xl padding-tb-xs padding-lr-xs text-bold">{{detail.name}}(2021)
    </view>
    <view class="text-lg  flex align-center text-xs ">
      <view class="padding-lr-xs text-xs">{{detail.batch }} </view>
      <view class="padding-lr-xs text-xs">{{detail.type }} </view>
      <view class="padding-lr-xs text-xs">{{detail.school_type }} </view>
      <view class="text-red padding-lr-xs text-xs">{{detail[985] == '否' ? '' : '985   '}} </view>
      <view class="text-orange padding-lr-xs text-xs">{{detail[211] == '否' ? '' : '211   '}} </view>
      <view class="text-blue padding-lr-xs text-xs">{{detail.double_top == '否' ? '' : '双一流   '}} </view>
      <view class="padding-lr-xs text-xs">{{detail.province }} </view>
    </view>
    <view class="padding-lr-xs text-xs">地址：{{detail.address}}</view>
    <view class="text-xs text-blue padding-top padding-lr-xs padding-bottom-xs" v-show="searchVal">
      #{{searchVal}}
    </view>
    <u-table :fontSize="'12px'">
      <u-tr>
        <u-th :width="'50%'">专业</u-th>
        <u-th>最高</u-th>
        <u-th>最低</u-th>
        <u-th>最低位</u-th>
        <u-th>人数</u-th>
      </u-tr>
      <u-tr v-for="(item,index) in major" :key="index" v-show="Number(index) < 10">
        <u-td :width="'50%'">{{item.pro_name}}</u-td>
        <u-td>{{item.highest_score}}</u-td>
        <u-td>{{item.lowest_score}}</u-td>
        <u-td>{{item.lowest_quantile}}</u-td>
        <u-td>{{item.enroll_number}}</u-td>
      </u-tr>
    </u-table>
    <view>*注：完整数据暂未开放</view>

    <view class="person-list-box" v-if="personList&&personList.length>0">
      <view class="padding-top-lg text-black text-bold title flex justify-between align-center">
        <text class="text-lg">此类专业学生咨询</text>
        <text class="text-sm text-gray" v-if="totalPerson&&totalPerson>5" @click="toPersonList">
          <text>查看更多</text>
          <text class="cuIcon-right"></text>
        </text>
      </view>
      <view class="person-list">
        <view class="person-item margin-tb margin-right-xs padding-lr-xl padding-tb radius shadow  bg-white"
          v-for="item in personList">
          <image class="profile" :src="getImagePath(item.user_image||item.profile_url)" mode="aspectFit"></image>
          <view class="text-bold padding-tb-xs name">
            {{item.disp_name||item.real_name||'-'}}
          </view>
          <view class="text-blue text-sm" @click="toConsult(item)">
            专业咨询
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
        schoolId: null,
        detail: {},
        major: [],
        searchVal: '',
        personList: [],
        totalPerson: 0,
        professional: ""
      }
    },
    onLoad(option) {
      this.schoolId = option.id
      this.searchVal = option.searchVal === 'null' ? null : option.searchVal
    },
    onShow() {
      this.selectDetail(this.schoolId)
    },
    methods: {
      toPersonList() {
        let cond = [{
          colName: 'professional_name',
          ruleType: 'like',
          value: this.professional
        }]
        let url =
          `/publicPages/list2/list2?serviceName=srvperson_basic_info_show_select&destApp=person&disabled=true&cond=${JSON.stringify(cond)}`
        uni.navigateTo({
          url
        })
      },
      toConsult(e) {
        const url =
          `/personalPages/resume/resume?app=person&serviceName=srvperson_basic_info_preview_select&idCol=id&idVal=${e?.id}`
        if (e?.id) {
          uni.navigateTo({
            url
          })
        }
      },
      getPerson() {
        // searchVal有值时，查找专业为searchVal的人
        let service = 'srvperson_basic_info_show_select'
        let url = this.getServiceUrl('person', service, 'select');
        let professional = this.searchVal
        if (professional) {
          let professionalList = professional.split('/').filter(item => item)
          if (professionalList.length > 0) {
            professional = professionalList[professionalList.length - 1]
          }
        }
        this.professional = professional
        let req = {
          "serviceName": "srvperson_basic_info_show_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'professional_name',
            ruleType: 'like',
            value: professional
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 5
          }
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            this.personList = res.data.data
            this.totalPerson = res?.data?.page?.total
          }
        })

      },
      selectDetail(id) {
        let service = 'srvuee_college_info_select'
        let url = this.getServiceUrl('person', service, 'select');
        let req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            "colName": "id",
            "ruleType": "in",
            "value": id
          }],
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            this.detail = res.data.data[0]
            this.getMajor()
            if (this.searchVal) {
              this.getPerson()
            }
            uni.showToast({
              title: '加载成功!',
              icon: 'none'
            })
          }
        })
      },
      getMajor() {
        let self = this
        let service = 'srvuee_pro_score_select'
        let url = this.getServiceUrl('person', service, 'select');
        // self.searchVal = uni.getStorageSync('srvuee_college_by_pro_select_searchVal')
        let req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
              "colName": "college_name",
              "ruleType": "in",
              "value": self.detail.name
            }, {
              "colName": "pro_name_path",
              "ruleType": "like",
              "value": self.searchVal
            }

          ],
        }
        self.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            self.major = res.data.data
            uni.showToast({
              title: '加载成功!',
              icon: 'none'
            })
          }
        })

      }
    }
  }
</script>

<style lang="scss" scoped>
  .person-list-box {
    .title {
      display: flex;
    }
  }

  .person-list {
    overflow-y: scroll;
    display: flex;
    flex-wrap: nowrap;
  }

  .person-item {
    text-align: center;
    display: inline-block;

    .profile {
      width: 60px;
      height: 60px;
      border-radius: 50%;

    }

    .name {
      width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
