<template>
  <view class="activity">
    <cu-custom-navbar bg-color="none"
      ><u-notice-bar mode="horizontal" :list="noticeList" class="text-white">
      </u-notice-bar
    ></cu-custom-navbar>
    <view class="bg-view" :class="{ fullbg: scene === 1154 }">
      <image
        :src="require('./img/share-img.png')"
        mode="scaleToFill"
        v-if="scene === 1154"
      />
      <image :src="require('./img/bg-bottom.png')" mode="scaleToFill" v-else />
    </view>
    <view>
      <view class="top-bg">
        <image :src="require('./img/100-top.png')" mode="scaleToFill" />
      </view>
      <view class="join-number">
        <text v-if="total">
          已参与
          <text class="number">{{ total }}</text
          >人次
        </text>
      </view>
    </view>
    <view class="chart-content">
      <uni-ec-canvas
      v-if="!modalName"
        class="uni-ec-charts"
        id="uni-ec-charts"
        :ec="chartOption"
      ></uni-ec-canvas>
    </view>
    <view class="button-box">
      <image
        class="present-button"
        :src="require('./img/bottom-btn.png')"
        mode="scaleToFill"
        @click.stop="showModal('editInfo')" v-if="wxUserInfo&&wxUserInfo.unionid"
      />
      <button class="share-btn cu-btn"  open-type="share">
        <text class="cuIcon-share"></text>
      </button>
    </view>
    <timeline-list :profile="wxUserInfo.headimgurl" v-if="wxUserInfo&&userInfo&&userInfo.userno" activityNo="AT2106110001" showMore :limit="3"></timeline-list>
    <!-- <MessageBoard :profile="wxUserInfo.headimgurl" v-if="wxUserInfo&&userInfo&&userInfo.userno"></MessageBoard> -->

    	<view class="cu-modal bottom-modal" @click="hideModal" :class="{show:modalName==='editInfo'}">
				<view class="cu-dialog" @click.stop="">
					<view class="edit-info">
						<view class="form-item">
							<view class="single-row">
								<text class="margin-right-xs">代表</text>
								<view class="radio-button" :class="{active:item===typeRadio}" v-for="item in radioList"
									:key="item" :name="item" @click="changeTypeRadio(item)">
									{{item}}
								</view>
								<text>参加活动</text>
							</view>
						</view>
						<view class="form-item" v-if="typeRadio==='为家乡'||typeRadio==='家乡'||typeRadio==='所在地'">
							<view class="label">
								<text class="text-red">*</text> {{typeRadio==='家乡'?`选择家乡节点`:'选择所在地区'}}
							</view>
							<view class="">
								<view class="form-input" @click="showModal('areaSelector')">
									<text class="text" v-if="typeRadio==='所在地'">
										{{selectArea.name_path||'点击选择您所在的地区'}}
									</text>
									<text class="text" v-if="typeRadio==='家乡'">
										{{selectHometown.name_path||'点击选择家乡所在地区'}}
									</text>
									<text class="cuIcon-close margin-left"
										v-if="typeRadio==='所在地' &&selectArea.name_path"
										@click.stop="clearAreaInfo"></text>
									<text class="cuIcon-close margin-left"
										v-if="typeRadio==='家乡' &&selectHometown.name_path"
										@click.stop="claerHomeInfo"></text>
								</view>
							</view>
						</view>
						<view class="form-item margin-tb-sm" v-if="typeRadio==='为单位'||typeRadio==='单位'">
							<view class="label ">
								输入单位名称
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
							<!-- </view> -->
						</view>
						<view class="form-item">
							<view class="label">
								祝福语
							</view>
							<view class="text-area">
								<textarea class="content" maxlength="100" v-model="blessing"
									placeholder="说出你对党的祝福..." />
							</view>
						</view>
						<view class="button-box" v-if="wxUserInfo&&wxUserInfo.unionid">
							<button class="cu-btn bg-orange lg margin-top" :disabled="disabledButton"
								@click="presentFlower">点击送祝福</button>
						</view>
					</view>
				</view>
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
							<view class="form-input" @click="showModal('areaSelector')">
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

			<view class="cu-modal bottom-modal" @click="hideModal" :class="{show:modalName=== 'orgModal'}">
				<view class="cu-dialog" @click.stop="">
					<view class="edit-info">
						<view class="form-item">
							<view class="label">
								祝福语
							</view>
							<view class="text-area">
								<textarea class="content" maxlength="100" v-model="blessing"
									:placeholder="`在此写下你代表${selectedCompany.org_name}对党的祝福...`" />
							</view>
						</view>
						<view class="button-group">
							<button class="cu-btn bg-red" @click="submitOrgBless">提交</button>
						</view>
					</view>
				</view>
			</view>
			<view class="cu-modal bottom-modal" @click="hideModal" :class="{show:modalName=== 'areaSelector'}">
				<view class="cu-dialog" @click.stop="">
					<tree-selector v-show="typeRadio==='所在地'" :srvInfo="srvInfo" @cancel="showModal('editInfo')"
						:order="areaOrder" :current="selectArea" @confirm="clickArea">
					</tree-selector>
					<tree-selector v-show="typeRadio==='家乡'" :srvInfo="srvInfo" @cancel="showModal('editInfo')"
						:order="areaOrder" :current="selectHometown" @confirm="clickHome">
					</tree-selector>
					<tree-selector v-show="typeRadio==='单位'" :srvInfo="srvInfo" @cancel="showModal('createOrg')"
						:order="areaOrder" :current="selectOrgAddr" @confirm="clickOrgAddr">
					</tree-selector>
				</view>
			</view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from '@/components/uni-ec-canvas/echarts.js'

import chinaMap from '@/static/china.json'
echarts.registerMap('china', chinaMap);
// import MessageBoard from './MessageBoard.vue'
// import TimelineList from '../../components/timeline-list/timeline-list.vue';
export default {
  components: {
    // MessageBoard,
    // TimelineList,
  },
  data () {
    return {
      radioList: [ '所在地', '家乡', '单位' ],
      shareNum: 0,
      blessing: "", //祝福语
      shareJoinNum: 0,
      orgJoinNum: 0,
      shareOrgNo: '', //分享单位编码
      createOrgTips: "",
      total: 0,
      su: "", //share_user_no
      chartOption: { option: {} },
      wxUserInfo: {},
      locationInfo: {},
      selectedCompany: {},//
      selectHometown: {},
      selectOrgAddr: {},
      selectArea: {},
      companyList: null,
      org_name: "",
      org_addr: "",
      srvInfo: {
        column: 'id',
        parentCol: 'pid',
        showCol: 'name',
        isTree: true,
        serviceName: 'srvportal_city_select',
        appNo: 'bxportal'
      },
      typeRadio: "家乡",
      areaOrder: [ {
        colName: "city_code",
        orderType: "desc"
      } ],
      modalName: "",
    }
  },
  computed: {
    ...mapState({
      scene: state => state.app.scene,
      userInfo: state => state.user.userInfo,
      loginUserInfo: state => state.user.loginUserInfo
    }),
    noticeList () {
      if (this.wxUserInfo && (this.wxUserInfo.user_no || this.loginUserInfo.user_no)) {
        if (this.shareNum && !this.shareJoinNum) {
          return [
            `您分享的本活动已被${this.shareNum || '-'}人次浏览`
          ]
        }
        if (!this.shareNum && this.shareJoinNum) {
          return [
            `已有${this.shareNum || '-'}人通过您分享的链接参加本活动`
          ]
        }
        if (this.shareNum && this.shareJoinNum) {
          return [
            `您已传播${this.shareNum || '-'}人，带动${this.shareJoinNum || '-'}人次参加本活动`
          ]
        } else {
          return []
        }
      } else {
        return []
      }
    },
  },
  methods: {
    async getData () {
      let req = {
        "serviceName": "srvportal_city_select",
        "colNames": [ "*" ],
        "condition": [ {
          colName: 'level',
          ruleType: 'eq',
          value: 1
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 99
        },
      }
      let url = this.getServiceUrl('bxportal', 'srvportal_city_select', 'select');
      let res = await this.$http.post(url, req)
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        // this.provinceList = res.data.data
        return res.data.data
      }
    },
    async getUserInfo () {
      await this.toAddPage()
      let url = this.$api.getUserInfo;
      let req = {
        serviceName: 'srvwx_basic_user_info_select',
        colNames: [ '*' ],
        condition: [ {
          colName: 'app_no',
          ruleType: 'eq',
          value: this.$api.appNo.wxmp
        } ]
      };
      let res = await this.$http.post(url, req);
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        const userInfo = res.data.data[ 0 ];
        this.wxUserInfo = userInfo;
        if (this.su || uni.getStorageSync('su')) {
          let share_user_no = this.su || uni.getStorageSync('su')
          if (share_user_no != userInfo.user_no) {
            this.addViewRecord()
          }
        }
        this.getLastRecord()
        this.getPresentResult(userInfo.unionid)
        return res.data
      }
    },
    async getLastRecord () {
      // 查找最后一条祝福记录
      let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select');
      let req = {
        "serviceName": "srvportal_act_atd_rcd_select",
        "colNames": [ "*" ],
        order: [ {
          colName: "id",
          orderType: "desc"
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      let res = await this.$http.post(url, req)
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        this.lastRecord = res.data.data[ 0 ]
        this.total = res.data.data[ 0 ].id
      }
    },
    async getPresentResult (unionid) {
      let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select');
      let req = {
        "serviceName": "srvportal_act_atd_rcd_select",
        "colNames": [ "*" ],
        order: [ {
          colName: "id",
          orderType: "desc"
        } ],
        "condition": [ {
          colName: "unionid",
          ruleType: 'eq',
          value: unionid
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      if (!unionid) {
        return
      }
      let res = await this.$http.post(url, req)
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        this.result = res.data.data[ 0 ]
      }
      this.getShareNum()
      this.getShareJoinNum()
    },
    getShareNum () {
      let req = {
        "serviceName": "srvportal_share_visit_log_select",
        "colNames": [ "*" ],
        "condition": [ {
          colName: "share_user_no",
          ruleType: 'eq',
          value: this.wxUserInfo?.user_no || this.loginUserInfo.user_no
        } ],
        group: [ {
          "colName": "id",
          "type": "count"
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 10
        },
      }
      let url = this.getServiceUrl('bxportal', 'srvportal_share_visit_log_select', 'select');
      this.$http.post(url, req).then(res => {
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          this.shareNum = res.data.data[ 0 ].id
        }
      })
    },
    getShareJoinNum () {
      let req = {
        "serviceName": "srvportal_act_atd_rcd_select",
        "colNames": [ "*" ],
        "condition": [ {
          colName: "share_user_no",
          ruleType: 'eq',
          value: this.wxUserInfo?.user_no || this.loginUserInfo.user_no
        } ],
        group: [ {
          "colName": "id",
          "type": "count"
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 10
        },
      }
      let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select');
      this.$http.post(url, req).then(res => {
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          this.shareJoinNum = res.data.data[ 0 ].id
        }
      })
    },
    async buildOption () {
      // myChart = echarts.init(document.getElementById('echarts'))
      let proData = await this.getData()
      if (!proData) {
        return
      }
      proData = proData.map(item => {
        // item.label = item.name
        item.label = item.name.replace('省', '').replace('市', '')
        return item
      })

      var geoCoordMap = {
        // "陕西": [109.1162, 34.2004]
      };
      let obj = {}
      proData.forEach(item => {
        obj[ item.name ] = [ item.lng, item.lat ]
      })
      geoCoordMap = obj
      var data = [ {
        name: "陕西",
        value: 80
      } ];
      data = proData.map(item => {
        let obj = {}
        obj.name = item.name
        obj.label = item.label
        // obj.name = item.label
        obj.value = item.total_count || 0
        if (isNaN(obj.value)) {
          obj.value = 0
        }
        return obj
      })
      var max = 480,
        min = 9; // todo 
      var maxSize4Pin = 100,
        minSize4Pin = 20;

      var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
          var geoCoord = geoCoordMap[ data[ i ].name ];
          if (geoCoord) {
            res.push({
              name: data[ i ].label,
              value: geoCoord.concat(data[ i ].value)
            });
          }
        }
        return res;
      };

      let option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}',
          // formatter: function (params) {
          //   debugger
          //   if (typeof (params.value)[ 2 ] == "undefined") {
          //     return params.name + ' : ' + params.value;
          //   } else {
          //     return params.name + ' : ' + params.value[ 2 ];
          //   }
          // }
        },
        legend: {
          orient: 'vertical',
          y: 'bottom',
          x: 'right',
          data: [ 'pm2.5' ],
          textStyle: {
            color: '#fff'
          }
        },
        visualMap: {
          show: true,
          textStyle: { color: '#fff' },
          min: 0,
          max: 1000,
          left: ' ',
          text: [ '多', '少' ], // 文本，默认为数值文本
          calculable: true,
          orient: "horizontal",
          type: 'piecewise', // piecewise,continuous
          top: 0,
          seriesIndex: [ 1 ],
          inRange: {
            color: [ '#FFB530', '#FD6330', '#E42028', '#DB0011', '#6E1618' ],
          },
          pieces: [
            {
              gt: 5000,
              label: ">5000人次",
              color: "#5B1113"
            }, {
              gte: 1000,
              lte: 5000,
              label: "1000 - 5000人次",
              color: "#DB0011"
            }, {
              gte: 500,
              lt: 1000,
              label: "500 - 1000人次",
              color: "#f72c33"
            }, {
              gte: 100,
              lt: 500,
              label: "100 - 500人次",
              color: "#E42028"
            },
            {
              gte: 1,
              lt: 100,
              label: "1 - 100人次",
              color: "#FD6330"
            },
            {
              value: 0,
              color: "#EDC266"
            }
          ],
        },
        geo: {
          top: 10,
          bottom: 30,
          right: 10,
          left: 10,
          // map: chinaMap,
          map: 'china',
          show: true,
          roam: true,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false,
            }
          },
          itemStyle: {
            areaColor: '#e12c32',
            normal: {
              areaColor: '#e12c32',
              borderColor: '#8d1b1f', //线
              shadowColor: '#83191d', //外发光
              shadowBlur: 20
            },
            emphasis: {
              areaColor: '#ff3239', //悬浮区背景
            }
          }
        },
        series: [
          {
            symbolSize: 1,
            label: {
              normal: {
                fontSize: 10,
                formatter: '{b}',
                position: 'top',
                show: true
              },
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              normal: {
                color: '#fff'
              }
            },
            name: 'light',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(data)
          },
          {
            type: 'map',
            // map: chinaMap,
            map: 'china',
            geoIndex: 0,
            aspectScale: 0.75, //长宽比
            showLegendSymbol: false, // 存在legend时显示
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false,
                textStyle: {
                  color: '#fff'
                }
              }
            },
            roam: true,
            right: 0,
            top: 0,
            bottom: 0,
            itemStyle: {
              areaColor: '#e12c32',
              normal: {
                areaColor: '#e12c32',
                borderColor: '#FFFFFF',
              },
              emphasis: {
                areaColor: '#83191d'
              }
            },
            animation: true,
            data: data
          }
        ]
      };
      this.chartOption = { option }
    },

    clickOrgAddr (e) {
      if (e && e.id) {
        this.selectOrgAddr = e
        this.showModal('createOrg')
      }
    },
    clickHome (e) {
      if (e && e.id) {
        this.selectHometown = e
        this.showModal('editInfo')
        // this.setWXOption();
      }
    },
    clickArea (e) {
      if (e && e.id) {
        this.selectArea = e
        this.showModal('editInfo')
        // this.setWXOption();
      }
    },
    clickTag (e, notLeaf = false) {
      // if (e && e.id) {
      if (e && (e.is_leaf === '是' || notLeaf)) {
        if (this.typeRadio === '所在地') {
          this.selectArea = e
        } else {
          this.selectHometown = e
        }
        this.showModal('editInfo')
        // this.setWXOption();
      }
    },
    showModal (name) {
      // this.getLocationAuth()
      this.createOrgTips = ''
      this.modalName = name
    },
    hideModal () {
      this.modalName = ''

    },
    changeTypeRadio (e) {
      this.typeRadio = e
    },
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
          "org_lng": this.locationInfo.longitude,
          "org_lat": this.locationInfo.latitude
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
      this.org_name = e.org_name
      this.companyList = null
      this.shareOrgNo = e.org_no
      this.selectOrgInfo()
    },
    async presentFlower () {

      let userInfo = this.wxUserInfo
      let pages = getCurrentPages()
      if (userInfo && userInfo.unionid) {
        let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_add', 'operate');
        let req = [ {
          "serviceName": "srvportal_act_atd_rcd_add",
          "condition": [],
          "data": [ {
            "act_no": "AT2106110001",
            blessing: this.blessing ? this.blessing.replace(
              /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig,
              "") : '',
            "user_no": userInfo.user_no || userInfo.unionid,
            share_user_no: uni.getStorageSync('su') || this.su,
            unionid: userInfo.unionid,
            "nick_name": userInfo.nickname,
            "atd_type": this.typeRadio,
            "lng": this.locationInfo.longitude,
            "lat": this.locationInfo.latitude,
            share_url: pages[ pages.length - 1 ].$page.fullPath,
          } ]
        } ]
        if (this.typeRadio === '所在地') {
          req[ 0 ].data[ 0 ].user_area_id = this.selectArea.id
          req[ 0 ].data[ 0 ].user_addr = this.selectArea.name_path || this.selectArea.name
        } else if (this.typeRadio === '家乡') {
          req[ 0 ].data[ 0 ].hometown_id = this.selectHometown.id
        } else if (this.typeRadio === '单位') {
          req[ 0 ].data[ 0 ].org_no = this.selectedCompany.org_no
          req[ 0 ].data[ 0 ].org_area_id = this.selectedCompany.area_id
          if (!this.selectedCompany?.org_no || (this.selectedCompany && this.selectedCompany.org_no &&
            this.selectedCompany.org_name !== this.org_name)) {
            this.createOrgTips = '系统未查到您输入的单位，请点击下方文字创建单位'
            return
          }
        }
        this.createOrgTips = ''
        let res = await this.$http.post(url, req)
        this.hideModal()
        if (res.data.state === 'SUCCESS') {
          if (this.typeRadio !== '单位') {
            this.org_name = ''
            this.selectedCompany = {}
            this.companyList = null
          }
          if (
            Array.isArray(res.data.response) &&
            res.data.response.length > 0 &&
            res.data.response[ 0 ].response &&
            Array.isArray(res.data.response[ 0 ].response.effect_data) &&
            res.data.response[ 0 ].response.effect_data.length > 0
          ) {
            uni.showModal({
              title: '已成功提交祝福',
              showCancel: false,
              confirmText: '知道了'
            })
            this.getLastRecord()
            this.buildOption()
            this.result = res.data.response[ 0 ].response.effect_data[ 0 ]
            if (this.result.atd_type === '单位') {
              this.selectOrgInfo()
            }
          }
        } else {
          uni.showToast({
            title: res.data.resultMessage,
            icon: 'none'
          })
        }
      }
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
    changeOnshare () {
      this.onshare = !this.onshare
    },
    claerHomeInfo () {
      this.selectHometown = {
        name: ''
      }
    },
    clearAreaInfo () {
      this.selectArea = {
        name: ''
      }
    },
    clearOrgAddrInfo () {
      this.selectOrgAddr = {
        name: ''
      }
    },
    submitOrgBless () {
      if (!this.selectedCompany || (this.selectedCompany && !this.selectedCompany.id)) {
        this.hideModal()
        uni.showToast({
          title: '系统错误,请重新打开此页面或刷新后再试',
          icon: 'none'
        })
        return
      }
      if (!this.blessing) {
        this.hideModal()
        uni.showModal({
          title: '提示',
          content: '你还没有填写祝福语,确定提交?',
          confirmText: '直接提交',
          cancelText: '去填写',
          success: (res) => {
            if (res.confirm) {
              this.presentFlower()
            } else {
              this.showModal('orgModal')
            }
          }
        })
      } else {
        this.presentFlower()
      }
    },
    setShareTitle () {

      let title = `${this.total || 0}人次已为党100周年生日接力送祝福`
      let path = '/otherPages/activity/activity?su=${this.wxUserInfo.user_no || this.wxUserInfo.unionid}'
      if (this.shareOrgNo && this.selectedCompany) {
        if (this.selectedCompany.org_no) {
          path = `${path}&org_no=${this.selectedCompany.org_no}`
        }
        let org_name = this.org_name || this.selectedCompany.org_name
        if (org_name) {
          title = `${title}--${org_name}`
        }
      }
      return {
        title,
        path
      }
    },
  },

  onShareAppMessage () {
    return this.setShareTitle()
  },
  onShareTimeline () {
    return this.setShareTitle()

  },
  // 页面周期函数--监听页面加载
  onLoad (option) {
    if (option.su) {
      this.su = option.su
      uni.setStorageSync('su', option.su)
    }
    this.getUserInfo().then(() => {
      this.buildOption()
    })
    uni.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.locationInfo = res
      }
    });
  },


};
</script>

<style lang="scss">
@import "./style.scss";

.activity {
  min-height: 100vh;
  overflow-y: scroll;
  background-color: #8a1b1f;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  .bg-view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    margin-top: 100rpx;
    &.fullbg {
      z-index: 999;
    }
    image {
      width: 100%;
      height: 100%;
    }
  }
  .top-bg {
    width: 100vw;
    height: 300rpx;
    z-index: 0;
    image {
      width: 100%;
      height: 100%;
    }
  }

  .join-number {
    color: #fff;
    font-size: 16px;
    text-align: center;
    min-height: 70rpx;
    background-color: #6e1618;
    padding: 10rpx;
    color: #f0a600;

    .number {
      font-size: 20px;
      font-weight: bold;
      margin: 0 10rpx;
    }
  }

  .chart-content {
    width: 100%;
    height: 600rpx;
    .uni-ec-charts {
      width: 100%;
      height: 100%;
    }
  }
  .button-box {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .share-btn {
      position: absolute;
      right: 20rpx;
      background-image: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      background-color: transparent;
      border: none;
      color: #ccc;
      font-size: 20px;
      border: 1px solid #ccc;
      border-radius: 30rpx;
    }
    .present-button {
      width: 400rpx;
      height: 70rpx;
    }
  }
}
</style>
