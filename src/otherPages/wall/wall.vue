<template>
	<view class="wall-wrap">
		<view class="map-container" v-if="act_info">
			<map id="wallMap" :latitude="latitude" :longitude="longitude" :polyline="polyline" :markers="markers"
				style="width: 100%;height: 500rpx;" @tap="clickMap" :scale="13.2"></map>
			<!-- 	<cover-view class="success-tip" v-if="totalStep&&totalStep>=22000">
				🏆🏆 恭喜您，已成功完成此活动！🏆🏆
			</cover-view> -->
		</view>
		<view class="active-poster" v-else-if="act_info&&act_info.act_poster">
			<image :src="getImagePath( act_info.act_poster,true)" mode="aspectFit"
				@click="toPreviewImage(getImagePath(act_info.act_poster,true))"></image>
		</view>
		<view class="active-info" v-if="act_info">
			<view class="title">
				{{act_info.act_name||''}}
			</view>
			<view class="slogan">
				{{act_info.act_slogan||''}}
			</view>
			<view class="date">
				<view class="cu-btn sm round bg-blue light margin-tb-sm">
					{{act_info.start_date||''}} - {{act_info.end_date||''}}
				</view>
			</view>
			<view class="desc">
				{{act_info.act_desc||''}}
			</view>
			<scroll-view scroll-x="true">
				<view class="active-photos">
					<view class="image-box" v-for="(item,index) in relatedPhotots">
						<image class="image" @click="toPreviewImage(allRelationPhoto,getPhotoIndex(index))"
							:src="item.imgUrl" mode="aspectFill"></image>
						<view class="label">
							{{item.shooting_place||''}}
						</view>
					</view>
				</view>
			</scroll-view>
			<!-- 	<view class="join-button" v-if="!isLogin">
				<button type="primary" class="cu-btn" @click="toAddPage">请先登录</button>
			</view> -->
			<view class="join-button" v-if="!inActivity" @click="getUserProfile">
				<button class=" bg-blue text-btn" v-if="canIUseGetUserProfile">
					<view class="text-bold">加入活动</view>
					<!-- <view class="tip">（需要获取昵称头像及微信步数）</view> -->
				</button>
				<button class="bg-blue text-btn" v-else open-type="getUserInfo" @click="getUserInfo">
					<view class="text-bold">加入活动</view>
				</button>
			</view>
		</view>
		<person-info v-if="actRecordInfo" :rankList="personalRankList" :todayStep="todayStep"
			@refresh-step="getwxStepInfoList"></person-info>
		<view class="rank-container" v-if="isLogin">
			<view class="rank-tab">
				<view class="rank-title" :class="{'active':index===rankTabIndex}" v-for="(item,index) in rankTabList"
					:key="item.type" @click="changeRankTab(index)">
					{{item.label}}
				</view>
			</view>
			<rank-list ref="rankList" @loaded="listLoaded" @toGroup="toGroup" :total="rankPageInfo.total"
				:act_no="act_no" :type="rankTabType" :key="rankTabType">
			</rank-list>
		</view>
	</view>
	<!-- 	<view class="login-button-box" v-else>
	</view> -->
</template>

<script>
	import geoData from './geoData.js'
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
				relatedPhotots: [],
				act_info: null,
				actRecordInfo: null,
				wxUserInfo: null,
				latitude: 34.26358901033698,
				longitude: 108.94700040367957,
				top: '72%',
				left: "45%",
				step: 0,
				rankTabIndex: 0,
				rankTabList: [{
						label: '个人赛况',
						type: 'personal'
					},
					{
						label: '团队赛况',
						type: 'group'
					}
				],
				markers: geoData.markers,
				polyline: geoData.polyline,
				mapCtx: null,
				bgImg: null,
				stepInfoList: null,
				canIUseGetUserProfile: false,
				rankList: null,
				rankPageInfo: {
					total: 0,
					pageNo: 1,
					rownumber: 10
				},
				inActivity: true, //是否参加了活动
			}
		},
		watch: {
			user_no: {
				handler(newValue, oldValue) {
					if (newValue) {
						this.getTakeInInfo()
					}
				}
			}
		},
		computed: {
			isLogin() {
				return this.$store?.state?.app?.isLogin
			},
			userInfo() {
				return this.$store?.state?.user?.userInfo
			},
			user_no() {
				return this.userInfo?.userno || uni.getStorageSync('login_user_info')?.user_no
			},
			rankTabType() {
				return this.rankTabList[this.rankTabIndex].type
			},
			personalRank() {
				if (Array.isArray(this.rankList) && this.rankList.length > 0) {
					let index = this.rankList.findIndex(item => item.user_no === this.user_no)
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
						label: '团队排名',
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
			allRelationPhoto() {
				return this.relatedPhotots.reduce((res, cur) => {
					if (Array.isArray(cur.imgList)) {
						res = [...res, ...cur.imgList]
					}
					return res
				}, [])
			},

		},
		onShareAppMessage() {
			let path =
				`otherPages/wall/wall?from=share&act_no=${this.act_no}&invite_user_no=${this.user_no}`;
			let title = `您的好友邀请您参加【${act_info.act_name}】`;
			let imageUrl = this.getImagePath(this.act_info?.act_poster, true);
			return {
				imageUrl: imageUrl,
				title: title,
				path: path
			};
		},
		onShareTimeline() {
			let query = `from=share&act_no=${this.act_no}&invite_user_no=${this.user_no}`
			let imageUrl = this.getImagePath(this.act_info?.act_poster, true);
			let title = `您的好友邀请您参加【${act_info.act_name}】`;
			return {
				imageUrl: imageUrl,
				title: title,
				query: query
			};
		},

		async onLoad(option) {
			this.checkOptionParams(option)
			if (wx.getUserProfile) {
				this.canIUseGetUserProfile = true
			}
			if (option.act_no) {
				this.act_no = option.act_no
			}
			await this.toAddPage()
			await this.initPage()
		},
		methods: {
			initPage() {
				this.getActiveInfo().then(_ => {
					if (this.user_no) {
						this.getTakeInInfo().then(_ => {
							this.handleMap()
						})
					}
				})
			},
			toGroup(e) {
				let {
					info,
					index
				} = e
				uni.navigateTo({
					url: `../groupRanking/groupRanking?act_no=${this.act_no}&rank=${index}&org_no=${info.org_no}&total=${info.walk_act_steps_sum}`
				})
			},
			listLoaded(e) {
				if (e?.data) {
					this.rankList = e.data
				}
			},
			getPhotoIndex(index) {
				let num = 0
				this.relatedPhotots.forEach((item, i) => {
					if (i < index) {
						num += item.fileList.length
					}
				})
				return num
			},
			async getActiveRelatedPhotos() {
				const req = {
					"serviceName": "srvportal_walking_related_picture_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "act_no",
						"ruleType": "eq",
						"value": this.act_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 20
					},
					"order": [{
						"colName": "order_col",
						"orderType": "asc"
					}],
				}
				let step = this.actRecordInfo?.walk_act_steps_sum
				if (step) {
					req.condition.push({
						"colName": "target_step_number",
						"ruleType": "le",
						"value": step
					})
				}
				let url = this.getServiceUrl('bxportal', 'srvportal_walking_related_picture_select', 'select')
				let res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS') {
					if (Array.isArray(res.data.data)) {
						for (let item of res.data.data) {
							let photoCol = item.pictures
							if (photoCol) {
								let fileList = await this.getFilePath(photoCol)
								fileList = fileList.map(file => {
									file.imgUrl = this.$api.getFilePath + file.fileurl + '&bx_auth_ticket=' +
										uni.getStorageSync('bx_auth_ticket')
									return file
								})
								item.imgUrl = this.getImagePath(photoCol)
								item.fileList = fileList
								item.imgList = fileList.map(file => file.imgUrl)
							}
						}
						this.relatedPhotots = res.data.data
					}
				}
			},
			buildLinePoint() {
				this.polyline.length = 1
				this.markers.length = 11
				let zoomRatio = 1
				let ratio = 16 * zoomRatio
				let arr = []
				let marker = {
					latitude: 34.25122419619922,
					longitude: 108.94698456143715,
					width: 30,
					height: 30,
					title: this.actRecordInfo?.nick_name || '',
					iconPath: this.actRecordInfo?.profile_url || require('./gate.png'),
					alpha: 1,
					borderRadius: 100,
					// label: {
					// 	textAlign: 'center',
					// 	content: this.userInfo?.nick_name || '',
					// 	color: "#000",
					// 	bgColor: "#fff",
					// 	padding: 5
					// },
					anchor: {
						x: 0.5,
						y: 0.5
					}
				}
				let step = this.totalStep
				if (step > 0) {
					arr.push({
						latitude: 34.25122419619922,
						longitude: 108.94698456143715
					})
					if (step <= 1550 * ratio) {
						marker.longitude = 108.94698456143715 - (step / (1550 * ratio)) * (0.01474322636818 / zoomRatio)
						// marker.latitude = 34.25122419619922;
						// marker.longitude = 108.94698456143715
					}
				}
				if (step > 1550 * ratio) {
					arr.push({
						latitude: 34.25182368811452,
						longitude: 108.93224133506897,
					})
					if (step <= 2050 * ratio) {
						marker.longitude = 108.93224133506897 - ((2050 * ratio - step) / (500 * ratio)) * (
							0.00695873126188 / zoomRatio)
					}
				}
				if (step > 2050 * ratio) {
					arr.push({
						latitude: 34.25173988100353,
						longitude: 108.92528260380709,
					})
					if (step <= 2900 * ratio) {
						marker.longitude = 108.92528260380709
						marker.latitude = 34.259378572983685 - ((2900 * ratio - step) / (850 * ratio)) * (
							0.007638691980155 / zoomRatio)
					}
				}
				if (step > 2900 * ratio) {
					arr.push({
						latitude: 34.259378572983685,
						longitude: 108.92533327149931,
					})
					if (step <= 4720 * ratio) {
						marker.longitude = 108.92528260380709
						marker.latitude = 34.275721173952554 - ((4720 * ratio - step) / (1820 * ratio)) * (
							0.016342600968869 / zoomRatio)
					}
				}
				if (step > 4720 * ratio) {
					arr.push({
						latitude: 34.275721173952554,
						longitude: 108.92511381305951,
					})
					if (step <= 6610 * ratio) {
						marker.latitude = 34.275721173952554
						marker.longitude = 108.94725746078666 - ((6610 * ratio - step) / (1890 * ratio)) * (
							0.02214364772715 / zoomRatio)
					}
				}
				if (step > 6610 * ratio) {
					arr.push({
						latitude: 34.2759093154076,
						longitude: 108.94725746078666,
					})
					if (step <= 8910 * ratio) {
						marker.latitude = 34.275721173952554
						marker.longitude = 108.9713510595609 - ((8910 * ratio - step) / (2300 * ratio)) * (
							0.02409359877424 / zoomRatio)

					}
				}
				if (step > 8910 * ratio) {
					arr.push({
						latitude: 34.276324480085236,
						longitude: 108.9713510595609,
					})
					if (step <= 10310 * ratio) {
						marker.latitude = 34.276324480085236 - ((10310 * ratio - step) / (1400 * ratio)) * (
							0.012040431869226 / zoomRatio)
						marker.longitude = 108.9713510595609
						marker.textAlign = 'left'
						// arr.push({
						// 	latitude: marker.latitude,
						// 	longitude: 108.9713510595609,
						// })
					}
				}
				if (step > 10310 * ratio) {
					arr.push({
						latitude: 34.26428404821601,
						longitude: 108.97117759452954,
					})
					if (step <= 10810 * ratio) {
						marker.latitude = 34.26428404821601 - ((10810 * ratio - step) / (500 * ratio)) * (
							0.00495416602009 / zoomRatio)
						marker.longitude = 108.97117759452954
					}
				}
				if (step > 10810 * ratio) {
					arr.push({
						latitude: 34.25932988219592,
						longitude: 108.97116321808574,
					})
					if (step <= 11590 * ratio) {
						marker.latitude = 34.2524059287666 + ((11590 * ratio - step) / (780 * ratio)) * (0.00692395342932 /
							zoomRatio)
						marker.longitude = 108.97117759452954
					}
				}
				if (step > 11590 * ratio) {
					arr.push({
						latitude: 34.2524059287666,
						longitude: 108.97132258772899,
					})
					if (step <= 13125 * ratio) {
						marker.latitude = 34.2524059287666
						marker.longitude = 108.95406884455201 + ((13125 * ratio - step) / (1535 * ratio)) * (
							0.01725374317698 / zoomRatio)
					}
				}
				if (step > 13125 * ratio) {
					arr.push({
						latitude: 34.251898321998674,
						longitude: 108.95406884455201,
					})
					if (step <= 13730 * ratio) {
						marker.latitude = 34.251898321998674
						marker.longitude = 108.95406884455201 - ((13730 * ratio - step) / (605 * ratio)) * (
							0.00714308001943 / zoomRatio)
					}
				}
				if (step > 13730 * ratio) {

				}
				let obj = {
					points: arr,
					color: "#e30000",
					width: 5,
					strokeWidth: 2,
					arrowLine: true,
					borderWidth: 0 //线的边框宽度
				}
				arr.push({
					latitude: marker.latitude,
					longitude: marker.longitude,
				})
				this.markers.push(marker)
				// this.polyline[1] = obj 
				this.polyline.push(obj)
			},
			changeRankTab(index) {
				this.rankTabIndex = index
			},
			async getRankList() {
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
				let res = await this.$http.post(url, req)
				if (res.data.state === "SUCCESS" && Array.isArray(res.data.data)) {
					this.rankList = res.data.data
					this.rankPageInfo = res.data.page
				}
				return
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
						// this.addStepRecord(stepList)
						this.addStepRecord(noRecordDates)
						let todayRecord = res.data.data.find(item => item.walk_date === this.formateDate())
						if (todayRecord && todayRecord.walk_date) {
							let todayStep = stepList.find(item => item.date === todayRecord.walk_date)
							if (todayStep && todayStep.date && todayStep.step !== todayRecord.wx_step_count) {
								todayStep.id = todayRecord.id
								await this.updateStepRecord(todayStep)
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
				return
			},
			async addStepRecord(data) {
				if (Array.isArray(data) && data.length > 0) {
					let req = [{
						"serviceName": "srvportal_walking_step_count_rcd_add",
						"condition": [],
						"data": data.map(item => {
							return {
								"act_no": this.act_no,
								"atd_no": this.actRecordInfo.aa_no,
								"user_no": this.user_no,
								"walk_date": item.date,
								"wx_step_count": item.step
							}
						}).reverse()
					}]
					let url = this.getServiceUrl('bxportal', 'srvportal_walking_step_count_rcd_add', 'operate')
					return await this.$http.post(url, req)
				}
			},
			async updateStepRecord(todayStep) {
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
				let res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS') {
					await this.getTakeInInfo()
				}
				return res
			},
			addTakeInRecord(userInfo) {
				let req = [{
					"serviceName": "srvportal_act_atd_rcd_add",
					"condition": [],
					"data": [{
						"act_no": this.act_no,
						"user_no": this.user_no,
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
							this.inActivity = true
							this.buildLinePoint()
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
							"value": this.user_no,
							"ruleType": "eq"
						},
						{
							"colName": "atd_type",
							"value": '个人',
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
					this.inActivity = true
					await this.getStepRecord()
					this.buildLinePoint()
					this.getActiveRelatedPhotos()
				} else if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data
					.length === 0) {
					this.inActivity = false
				}
				return

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
				uni.showLoading({
					title: '更新中...'
				})
				if (result.errMsg === 'getWeRunData:ok') {
					// this.wxRunData = result;
					let data = await this.decryptData(result)
					// this.getRankList()
					return data
				} else {
					uni.showModal({
						title: '提示',
						content: result.errMsg,
						showCancel: false
					})
				}
				uni.hideLoading()
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
					if (res.data.state == 'SUCCESS' && Array.isArray(res.data.response) && res.data.response.length >
						0) {
						let stepList = res.data.response[0].response.stepInfoList
						if (Array.isArray(stepList)) {
							stepList = stepList.map(item => {
								item.date = this.formateDate(item.timestamp * 1000).trim()
								return item
							})
							this.stepInfoList = stepList
							await this.getStepRecord(stepList)
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
		overflow: auto;

		.map-container {
			width: 100%;
			background-color: #fff;
			position: relative;

			.success-tip {
				position: absolute;
				top: 0;
				left: 0;
				width: 750rpx;
				height: 500rpx;
				line-height: 500rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: rgba($color: #000000, $alpha: 0.5);
				color: #fff;
				font-weight: bold;
			}
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

		.slogan {
			color: #666;
		}

		.desc {
			color: #666;
		}

		.active-photos {
			display: flex;
			// flex-wrap: wrap;
			padding: 20rpx;

			.image-box {
				margin-right: 10rpx;
				margin-bottom: 10rpx;

				.label {
					color: #666;
				}
			}

			.image {
				border: 1rpx solid #f1f1f1;
				width: 100rpx;
				height: 100rpx;
			}
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
					border-radius: 20rpx 20rpx 0 0;
					background-color: #fff;
				}
			}
		}
	}
</style>
