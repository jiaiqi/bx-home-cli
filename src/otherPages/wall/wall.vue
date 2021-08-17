<template>
	<view class="wall-wrap">
		<!-- 		<view class="wall-pic">
			<view class="person-image" :style="{top:calcPos.top,left:calcPos.left}">

			</view>
		</view> -->
		<view class="map-container">
			<map id="wallMap" :latitude="latitude" :longitude="longitude" :polyline="polyline" :markers="markers"
				:include-points="true" style="width: 100%;height: 500rpx;" @tap="clickMap" :scale="13.2"></map>
		</view>
		<view class="person-info">
			<view class="profile-box">
				<view class="profile-image">
					<open-data type="userAvatarUrl"></open-data>
				</view>
				<view class="right-box">
					<view class="nick-name">
						<open-data type="userNickName"></open-data>
					</view>
					<view class="today-step">
						今日行走{{todayStep||'0'}}步
					</view>
				</view>
				<view class="right-button" @click="getwxStepInfoList">
					<text class="refresh-btn">
						<text class="cuIcon-refresh"></text>
					</text>
					<text>更新步数</text>
				</view>
			</view>
			<view class="rank-info">
				<view class="rank-item">
					<view class="label">
						总步数
					</view>
					<view class="value">
						{{totalStep||'-'}}
					</view>
				</view>
				<view class="rank-item">
					<view class="label">
						小队排名
					</view>
					<view class="value">
						-
					</view>
				</view>
				<view class="rank-item">
					<view class="label">
						个人排名
					</view>
					<view class="value">
						-
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
				latitude: 34.26358901033698,
				longitude: 108.94700040367957,
				top: '72%',
				left: "45%",
				distance: "",
				step: 0,
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
				stepInfoList:null
			}
		},
		computed: {
			totalStep(){
				return 0
			},
			todayStep(){
				if(Array.isArray(this.stepInfoList)&&this.stepInfoList.length>0){
					let last = this.stepInfoList[this.stepInfoList.length-1]
					if(last && last.date && last.date===this.formateDate()){
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
		onLoad() {
			this.handleMap()
		},
		methods: {
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
					src: require('./wall-removebg-preview.png'),
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
		height: 100vh;
		.map-container{
			width: 100%;
			background-color: #fff;
		}
	}

	/* #ifdef H5 */
	.wall-pic {
		width: 100%;
		height: 500rpx;
		background-image: url(wall.png);
		background-size: cover;
		background-repeat: no-repeat;
		position: relative;

		.person-image {
			width: 60rpx;
			height: 60rpx;
			background-image: url(boy.png);
			background-size: contain;
			background-repeat: no-repeat;
			position: absolute;
			top: 72%;
			left: 45%;
			z-index: 10;
		}

	}

	/* #endif */

	.person-info {
		margin: 20rpx;
		padding: 20rpx;
		border-radius: 10rpx;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

		.profile-box {
			display: flex;
			align-items: center;
			padding: 20rpx;
			padding: 0 20rpx 20rpx;

			.profile-image {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				overflow: hidden;
			}

			.right-box {
				flex: 1;
				padding-left: 20rpx;

				.nick-name {
					font-weight: bold;
					padding: 10rpx 0;
				}
			}

			.right-button {
				width: 100rpx;
				height: 100rpx;
				font-size: 24rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				color: #09BB07;

				.refresh-btn {
					display: inline-block;
					width: 60rpx;
					height: 60rpx;
					line-height: 60rpx;
					text-align: center;
					background-color: #09BB07;
					border-radius: 50%;
					color: #fff;
					font-size: 40rpx;
					color: #fff;
				}
			}
		}

		.rank-info {
			padding: 20rpx 20rpx 0;
			border-top: 1rpx solid #F1F1F1;
			display: flex;

			.rank-item {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				color: #999;
				flex: 1;

				.value {
					color: #555;
					font-weight: bold;
					font-size: 40rpx;
					margin-top: 10rpx;
				}
			}
		}
	}
</style>
