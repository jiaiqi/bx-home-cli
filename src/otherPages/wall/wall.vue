<template>
	<view class="wall-wrap">
		<view class="map-container" v-if="act_info&&actRecordInfo&&totalStep">
			<map id="wallMap" :latitude="latitude" :longitude="longitude" :polyline="polyline" :markers="markers"
				style="width: 100%;height: 500rpx;" @tap="clickMap" :scale="13.2"></map>
		</view>
		<view class="active-poster" v-else-if="act_info&&act_info.act_poster">
			<image :src="getImagePath(act_info.act_poster,true)" mode="aspectFit"
				@click="toPreviewImage(getImagePath(act_info.act_poster,true))"></image>
		</view>
		<view class="active-info" v-if="act_info">
			<view class="title">
				{{act_info.act_name||''}}
			</view>
			<view class="desc">
				{{act_info.act_desc||''}}
			</view>
			<view class="join-button" v-if="!actRecordInfo" @click="getUserProfile">
				<button class=" bg-blue text-btn" v-if="canIUseGetUserProfile">
					<view class="text-bold">加入活动</view>
					<!-- <view class="tip">（需要获取昵称头像及微信步数）</view> -->
				</button>
				<button class=" bg-blue text-btn" v-else open-type="getUserInfo" @click="getUserInfo">
					<view class="text-bold">加入活动</view>
				</button>
			</view>
		</view>
		<person-info v-if="actRecordInfo" :rankList="personalRankList" :todayStep="totalStep"></person-info>
	
		<view class="rank-container">
			<view class="rank-tab">
				<view class="rank-title" v-for="(item,index) in rankTabList" :key="item.type" @click="changeRankTab(index)">
					{{item.label}}
				</view>
			</view>
			<rank-list :total="rankPageInfo.total" :act_no="act_no" :type="rankTabType" :key="rankTabType">
			</rank-list>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import rankList from './rank-list.vue'
	import personInfo from './person-info.vue'
	export default {
		components: {
			rankList,
			personInfo
		},
		data() {
			return {
				act_no: "AT2108180002", // 活动编号
				act_info: null,
				actRecordInfo: null,
				wxUserInfo: null,
				latitude: 34.26358901033698,
				longitude: 108.94700040367957,
				top: '72%',
				left: "45%",
				step: 0,
				rankTabIndex:1,
				rankTabList:[{
					label:'个人赛况',
					type:'personal'
				},
				{
					label:'小组赛况',
					type:'group'
				}],
				markers: [{
						latitude: 34.25122419619922,
						longitude: 108.94698456143715,
						width: 30,
						height: 40,
						title: "永宁门",
						iconPath: require('./gate.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.25182368811452,
						longitude: 108.93224133506897,
						width: 30,
						height: 40,
						title: "含光门",
						iconPath: require('./gate.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.25173988100353,
						longitude: 108.92528260380709,
						width: 30,
						height: 40,
						title: "西南城角",
						iconPath: require('./turret.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.259378572983685,
						longitude: 108.92533327149931,
						width: 30,
						height: 40,
						title: "安定门",
						iconPath: require('./gate.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.275721173952554,
						longitude: 108.92511381305951,
						width: 30,
						height: 40,
						title: "西北城角",
						iconPath: require('./turret.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.2759093154076,
						longitude: 108.94725746078666,
						width: 30,
						height: 40,
						title: "安远门",
						iconPath: require('./gate.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.276324480085236,
						longitude: 108.9713510595609,
						width: 30,
						height: 40,
						title: "东北城角",
						iconPath: require('./turret.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.26428404821601,
						longitude: 108.97117759452954,
						width: 30,
						height: 40,
						title: "中山门",
						iconPath: require('./gate.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.25932988219592,
						longitude: 108.97116321808574,
						width: 30,
						height: 40,
						title: "长乐门",
						iconPath: require('./gate.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.2524059287666,
						longitude: 108.97132258772899,
						width: 30,
						height: 40,
						title: "东南城角",
						iconPath: require('./turret.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					{
						latitude: 34.251898321998674,
						longitude: 108.95406884455201,
						width: 30,
						height: 40,
						title: "文昌门",
						iconPath: require('./gate.png'),
						alpha: 0.8,
						anchor: {
							x: 0.5,
							y: 0.5
						}
					},
					// {
					// 	latitude: 34.24958506198959,
					// 	longitude: 108.94692576453258,
					// 	width: 30,
					// 	height: 40,
					// 	title: "永宁门"
					// }
				],
				polyline: [{
					points: [{
							latitude: 34.25122419619922,
							longitude: 108.94698456143715,
						},
						{
							latitude: 34.25182368811452,
							longitude: 108.93224133506897
						},
						{
							latitude: 34.25173988100353,
							longitude: 108.92528260380709
						},
						{
							latitude: 34.259378572983685,
							longitude: 108.92533327149931,
						},
						{
							latitude: 34.275721173952554,
							longitude: 108.92511381305951,
						},
						{
							latitude: 34.2759093154076,
							longitude: 108.94725746078666,
						},
						{
							latitude: 34.276324480085236,
							longitude: 108.9713510595609,
						},
						{
							latitude: 34.26428404821601,
							longitude: 108.97117759452954,
						},
						{
							latitude: 34.25932988219592,
							longitude: 108.97116321808574,
						},
						{
							latitude: 34.2524059287666,
							longitude: 108.97132258772899,
						},
						// {
						// 	latitude: 34.251898321998674,
						// 	longitude: 108.95406884455201,
						// },
						// {
						// 	latitude: 34.25122419619922,
						// 	longitude: 108.94698456143715,
						// }
					],
					color: "#fa4609",
					borderColor: "#fae600",
					width: 10,
					strokeWidth: 2,
					arrowLine: true,
					borderWidth: 0 //线的边框宽度
				}],
				mapCtx: null,
				bgImg: null,
				stepInfoList: null,
				canIUseGetUserProfile: false,
				rankList: null,
				rankPageInfo: {
					total: 0,
					pageNo: 1,
					rownumber: 10
				}
			}
		},
		computed: {
			// ...mapState({
			// 	userInfo: state => state.user.userInfo
			// }),
			userInfo() {
				return {
					user_no: 'okMrXs-zyQb_v-wkKRC4ClS8dviA'
				}
			},
			rankTabType(){
				return this.rankTabList[this.rankTabIndex].type
			},
			personalRank() {
				if (Array.isArray(this.rankList) && this.rankList.length > 0) {
					let index = this.rankList.findIndex(item => item.user_no === this.userInfo.user_no)
					if (index > -1) {
						return index + 1
					}
				}
			},
			personalRankList() {
				return [{
						label: '总步数',
						value: this.totalStep
					},
					{
						label: '小队排名',
						value: 0
					},
					{
						label: '个人排名',
						value: this.personalRank
					}
				]
			},
			totalStep() {
				return this?.actRecordInfo?.walk_act_steps_sum
			},
			todayStep() {
				if (Array.isArray(this.stepInfoList) && this.stepInfoList.length > 0) {
					let last = this.stepInfoList.find(item => item.date === this.formateDate())
					if (last && last.date) {
						return last.step
					}
				}
			},
			calcPos() {
				let obj = {
					top: '72%',
					left: "45%"
				}
				const step = this.step // 总步数
				const long = step / 1600 //总距离
				const inLong = long % 13.74 //一圈内的距离
				if (inLong > 0 && inLong <= 1.55) {
					// left:15% top:72
					// left 30
					obj.left = inLong * 30 / 1.55 + '%'
					obj.top = '72%'
				} else if (inLong > 1.55 && inLong <= 2.05) {
					// left:5% top:72
					obj.left = inLong * 10 / 0.5 + '%'
					obj.top = '72%'
				} else if (inLong > 2.05 && inLong <= 2.9) {
					// left:5% top:50
					obj.left = inLong * 10 / 0.5 + '%'
					obj.top = inLong * 22 / 0.85 + '%'
				} else if (inLong > 2.9 && inLong <= 4.72) {
					// left:5% top:10
				} else if (inLong > 4.72 && inLong <= 6.61) {
					// left:45 top:10 
				} else if (inLong > 6.61 && inLong <= 8.91) {
					// left:87 top:10
				} else if (inLong > 8.91 && inLong <= 10.31) {
					// left:87 top:32 
				} else if (inLong > 10.31 && inLong <= 11.59) {
					// left:87 top:49
				} else if (inLong > 10.31 && inLong <= 10.81) {
					// left:87 top:72
				} else if (inLong > 10.81 && inLong <= 13.125) {
					// left:63 top:72
				} else if (inLong > 13.125 && inLong <= 13.73) {
					// left:46 top:72
				}


				obj = {
					...obj,
					step,
					long,
					inLong
				}
				return obj
			}
		},
		onLoad(option) {
			if (wx.getUserProfile) {
				this.canIUseGetUserProfile = true
			}
			if (option.act_no) {
				this.act_no = option.act_no
				this.getActiveInfo().then(_ => {
					this.getTakeInInfo()
					this.handleMap()

				})
			}
		},
		methods: {
			changeRankTab(index){
				this.rankTabIndex = index
			},
			getRankList() {
				let req = {
					"serviceName": "srvportal_act_atd_rcd_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "act_no",
						"ruleType": "eq",
						"value": this.act_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 10
					},
					"order": [{
						colName: "walk_act_steps_sum",
						orderType: "desc"
					}],
				}
				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select')
				this.$http.post(url, req).then(res => {
					if (res.data.state === "SUCCESS" && Array.isArray(res.data.data)) {
						this.rankList = res.data.data
						this.rankPageInfo = res.data.page
					}
				})
			},
			getUserInfo(e) {
				// 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
				this.wxUserInfo = e.detail.userInfo
			},
			getUserProfile() {
				// 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
				// 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
				wx.getUserProfile({
					desc: '用于完善及展示用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
					success: (res) => {
						this.wxUserInfo = res.userInfo
						this.addTakeInRecord(res.userInfo)
					}
				})
			},

			async getStepRecord(stepList) {
				let url = this.getServiceUrl('bxportal', 'srvportal_walking_step_count_rcd_select', 'select')
				let req = {
					"serviceName": "srvportal_walking_step_count_rcd_select",
					"colNames": ["*"],
					"condition": [{
							colName: 'act_no',
							ruleType: 'eq',
							value: this.act_no
						},
						{
							colName: 'atd_no',
							ruleType: 'eq',
							value: this.actRecordInfo.aa_no
						}
					],
					"page": {
						"pageNo": 1,
						"rownumber": 31
					}
				}
				if (stepList) {
					let dates = stepList.map(item => item.date)
					if (Array.isArray(dates) && dates.length > 0) {
						req.condition.push({
							"colName": "walk_date",
							"value": dates.toString(),
							"ruleType": "in"
						})
					}
				}
				let res = await this.$http.post(url, req)
				if (stepList) {
					if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data
						.length > 0) {
						let hasRecordDates = res.data.data.map(item => item.walk_date)
						let noRecordDates = stepList.filter(item => !hasRecordDates.includes(item.date))
						this.addStepRecord(noRecordDates)
						let todayRecord = res.data.data.find(item => item.walk_date === this.formateDate())
						if (todayRecord && todayRecord.walk_date) {
							let todayStep = stepList.find(item => item.date === todayRecord.walk_date)
							if (todayStep && todayStep.date && todayStep.step !== todayRecord.wx_step_count) {
								todayStep.id = todayRecord.id
								this.updateStepRecord(todayStep)
							}
						}
						return noRecordDates
					} else if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data
						.length == 0) {
						this.addStepRecord(stepList)
					}
				} else {
					if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
						this.stepInfoList = res.data.data.map(item => {
							item.date = item.walk_date
							item.step = item.wx_step_count
							return item
						})
					}
				}

			},
			addStepRecord(data) {
				if (Array.isArray(data) && data.length > 0) {
					let req = [{
						"serviceName": "srvportal_walking_step_count_rcd_add",
						"condition": [],
						"data": data.map(item => {
							return {
								"act_no": this.act_no,
								"atd_no": this.actRecordInfo.aa_no,
								"user_no": this.userInfo.user_no,
								"walk_date": item.date,
								"wx_step_count": item.step
							}
						}).reverse()
					}]
					let url = this.getServiceUrl('bxportal', 'srvportal_walking_step_count_rcd_add', 'operate')
					this.$http.post(url, req).then(res => {
						debugger
					})
				}
			},
			updateStepRecord(todayStep) {
				let req = [{
					"serviceName": "srvportal_walking_step_count_rcd_update",
					"condition": [{
						"colName": "id",
						"ruleType": "eq",
						"value": todayStep.id
					}],
					"data": [{
						"wx_step_count": todayStep.step,
					}]
				}]
				let url = this.getServiceUrl('bxportal', 'srvportal_walking_step_count_rcd_update', 'operate')
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						this.getTakeInInfo()
					}
				})
			},
			addTakeInRecord(userInfo) {
				let req = [{
					"serviceName": "srvportal_act_atd_rcd_add",
					"condition": [],
					"data": [{
						"act_no": this.act_no,
						"user_no": this.userInfo.user_no,
						"atd_type": "个人",
						nick_name: userInfo.nickName,
						profile_url: userInfo.avatarUrl
					}]
				}]
				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_add', 'operate')
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						if (
							Array.isArray(res.data.response) &&
							res.data.response.length > 0 &&
							res.data.response[0].response &&
							Array.isArray(res.data.response[0].response.effect_data) &&
							res.data.response[0].response.effect_data.length > 0
						) {
							this.actRecordInfo = res.data.response[0].response.effect_data[0]
						}
					}
				})
			},
			async getTakeInInfo(stepList) {
				// 活动参与记录
				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select')
				let req = {
					"serviceName": "srvportal_act_atd_rcd_select",
					"colNames": ["*"],
					"condition": [{
							"colName": "user_no",
							"value": this.userInfo.user_no,
							"ruleType": "eq"
						},
						{
							"colName": "act_no",
							"value": this.act_no,
							"ruleType": "eq"
						}
					],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					}
				}

				let res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data
					.length > 0) {
					this.actRecordInfo = res.data.data[0]
					this.getRankList()
					this.getStepRecord()
				} else {
					return []
				}
			},
			getActiveInfo() {
				let url = this.getServiceUrl('bxportal', 'srvportal_act_mgmt_select', 'select')
				let req = {
					"serviceName": "srvportal_act_mgmt_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'act_no',
						ruleType: 'eq',
						value: this.act_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					}
				}
				return new Promise((resolve) => {
					this.$http.post(url, req).then(res => {
						if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data
							.length > 0) {
							this.act_info = res.data.data[0]
							resolve(res.data.data)
						}
					})
				})
			},
			async getwxStepInfoList() {
				// 获取微信运动记录
				// #ifdef MP-WEIXIN
				let result = await wx.getWeRunData()
				debugger
				if (result.errMsg === 'getWeRunData:ok') {
					// this.wxRunData = result;
					let data = await this.decryptData(result)
					return data
				}
				// #endif
				return true
			},
			async decryptData(result) {
				// 解密微信加密数据
				if (result.encryptedData && result.iv) {
					let url = this.getServiceUrl('wx', 'srvwx_app_data_decrypt', 'operate')
					let req = [{
						data: [{
							encryptedData: result.encryptedData,
							signature: result.iv
						}],
						serviceName: 'srvwx_app_data_decrypt'
					}]
					let res = await this.$http.post(url, req)
					debugger
					if (res.data.state == 'SUCCESS' && Array.isArray(res.data.response) && res.data.response.length >
						0) {
						let stepList = res.data.response[0].response.stepInfoList
						if (Array.isArray(stepList)) {
							stepList = stepList.map(item => {
								item.date = this.formateDate(item.timestamp * 1000).trim()
								return item
							})
							this.stepInfoList = stepList
							this.getStepRecord(stepList)

							return stepList
						} else {
							return false
						}
					} else {
						return false
					}
				} else {
					return false
				}
			},
			handleMap() {
				this.mapCtx = wx.createMapContext('wallMap', this)
				this.bgImg = {
					id: 1,
					src: require('./wall.png'),
					opacity: 0.9,
					bounds: {
						southwest: {
							latitude: 34.24156412782851,
							longitude: 108.91945843200142
						},
						northeast: {
							latitude: 34.2799651207311,
							longitude: 108.97558733111237
						}
					}
				}
				this.mapCtx.addGroundOverlay(this.bgImg)
			},
			clickMap(e) {
				console.log(e.detail)
			},
		}
	}
</script>

<style lang="scss">
	.wall-wrap {
		background-color: #F7F7F7;
		height: calc(100vh - var(--window-top));
		padding: 20rpx 0;
		overflow: auto;

		.map-container {
			width: 100%;
			background-color: #fff;
		}

		.active-poster {
			text-align: center;
		}
	}

	.active-info {
		padding: 20rpx;
		text-align: center;
		margin-bottom: 20rpx;
		background-color: #fff;

		.title {
			font-weight: bold;
			font-size: 36rpx;
			line-height: 80rpx;
		}

		.desc {
			color: #666;
		}

		.join-button {
			margin: 20rpx 80rpx;

			.text-btn {
				display: flex;
				flex-direction: column;
				line-height: normal;

				.text-bold {
					font-size: 34rpx;
					padding: 10rpx;
					font-weight: normal;
				}

				.tip {
					font-size: 24rpx;
					color: #F0F0F0;
					margin-bottom: 10rpx;
				}
			}
		}
	}



	.rank-container {
		margin: 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 0 0 20rpx;
		box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

		.rank-tab {
			display: flex;
			background-color: #f7f7f7;

			.rank-title {
				flex: 1;
				text-align: center;
				font-weight: bold;
				padding: 20rpx;

				&.active {
					color: #0bc99d;
					border-radius: 20rpx;
					background-color: #fff;
				}
			}
		}
	}
</style>
