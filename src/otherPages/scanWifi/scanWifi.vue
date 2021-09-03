<template>
	<view class="scan-wifi-wrap">
		<view class="wifi-status-box" v-if="connectedWifi&&connectedWifi.SSID">
			<view class="wifi-info">
				当前连接：{{connectedWifi.SSID}}
			</view>
		</view>
		<view class="wifi-status-box scan-code" @click="scanCode">
			<text class="cuIcon-scan">扫码连接</text>
		</view>
		<view class="wifi-list">
			<view class="label">
				一键连接
			</view>
			<scroll-view class="device-list" scroll-y>
				<view class="wifi-item" v-for="(item,index) in hasPwd" :key="index" @click="selectWifi(item)">
					<view class="list">
						<text>{{ item.SSID }}</text>
						<span class="wifi-icon has-pwd">
							<span class="wifi-1"></span>
							<span class="wifi-2" :class="item.strength < 2 ? 'off' : ''"></span>
							<span class="wifi-3 " :class="item.strength < 3 ? 'off' : ''"></span>
							<span class="wifi-4 " :class="item.strength < 4 ? 'off' : ''"></span>
							<!-- <span class="key" v-if="item.password"></span> -->
						</span>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="wifi-list">
			<view class="label">
				<text>其它wifi </text>
				<text class="" @click="startSearch">刷新</text>
			</view>
			<scroll-view class="device-list" scroll-y>
				<view class="wifi-item" v-for="(item,index) in otherWifi" :key="index"
					@click="selectUndefinedWifi(item)">
					<view class="list">
						<text>{{ item.SSID }}</text>
						<span class="wifi-icon">
							<span class="wifi-1"></span>
							<span class="wifi-2" :class="item.strength < 2 ? 'off' : ''"></span>
							<span class="wifi-3 " :class="item.strength < 3 ? 'off' : ''"></span>
							<span class="wifi-4 " :class="item.strength < 4 ? 'off' : ''"></span>
							<span class="lock" v-if="item.secure"></span>
						</span>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="cu-modal bottom-modal" @click="hideModal()" :class="{show:modalName==='link-wifi-info'}">
			<view class="cu-dialog" @tap.stop>
				<view class="link-wifi-info">
					<view class="title">
						<text class="cuIcon-close" style="opacity: 0;" @click.stop="hideModal()"></text>
						<view class="label">
							识别结果
						</view>
						<text class="cuIcon-close" @click.stop="hideModal()"></text>
					</view>
					<view class="logo">
						<view class="wifi-logo">
							<text class="cuIcon-wifi"></text>
						</view>
						<view class="margin-top-xs">
							wifi
						</view>
					</view>
					<view class="wifi-info" v-if="curWifi&&curWifi.SSID">
						<view class="info-item">
							<view class="label">
								wifi名称:
							</view>
							<view class="value">
								{{curWifi.SSID}}
							</view>
						</view>
						<view class="info-item" v-if="curWifi.password">
							<view class="label">
								密码:
							</view>
							<view class="value">
								********
							</view>
						</view>
						<!-- 			<view class="info-item">
							<view class="label">
								安全性:
							</view>
							<view class="value">
								WPA
							</view>
						</view> -->
					</view>
					<view class="wifi-info" v-else-if="decodeQrcode&&decodeQrcode.SSID">
						<view class="info-item">
							<view class="label">
								wifi名称:
							</view>
							<view class="value">
								{{decodeQrcode.SSID}}
							</view>
						</view>
						<view class="info-item" v-if="decodeQrcode.password">
							<view class="label">
								密码:
							</view>
							<view class="value">
								********
							</view>
						</view>
						<!-- 			<view class="info-item">
							<view class="label">
								安全性:
							</view>
							<view class="value">
								WPA
							</view>
						</view> -->
					</view>
					<view class="wifi-info" v-else-if="undefinedWifi&&undefinedWifi.SSID">
						<view class="info-item">
							<view class="label">
								:
							</view>
							<view class="value">
								{{undefinedWifi.SSID}}
							</view>
						</view>
						<view class="info-item">
							<view class="cu-form-group ">
								<view class="title">wifi名称:</view>
								<input placeholder="请输入wifi密码" name="input" :value="undefinedWifi.SSID"
									:disabled="true"></input>
							</view>
						</view>
						<view class="info-item">
							<view class="cu-form-group ">
								<view class="title">wifi密码:</view>
								<input placeholder="请输入wifi密码" name="input" v-model="undefinedPassword"></input>
							</view>
						</view>
					</view>
					<view class="handel-bottom">
						<button class="button cu-btn text-white"
							:disabled="undefinedWifi&&undefinedWifi.SSID&&!undefinedPassword"
							@click="connectWifi(decodeQrcode)">
							<text v-if="undefinedWifi&&undefinedWifi.SSID">点击连接</text>
							<text v-else>点击一键直连</text>
						</button>
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
				connectedWifi: null, //当前连接的wifi信息
				isIOS: false,
				modalName: "",
				curWifi: null,
				undefinedWifi: null,
				undefinedPassword: null,
				pwdList: [{
						BSSID: "50:fa:84:7c:bf:9c",
						SSID: "100x_ap",
						frequency: 2412, // 频段 单位MHz
						secure: true,
						signalStrength: 99, //信号强度
						strength: 396,
						password: '100x_ap;'
					},
					{
						BSSID: "50:fa:84:7c:bf:9c",
						SSID: "100xap3",
						frequency: 2412, // 频段 单位MHz
						secure: true,
						signalStrength: 99, //信号强度
						strength: 396,
						password: '100x_ap;'
					}
				],
				wifiList: [],
				wifiQrcodeText: "",
			}
		},
		computed: {
			decodeQrcode() {
				let text = this.wifiQrcodeText
				if (text) {
					if (text.indexOf('WIFI:') !== -1) {
						let SSID = text.slice(text.indexOf('S:') + 2, text.indexOf(';P:'))
						let password = text.slice(text.indexOf('P:') + 2, text.lastIndexOf(';'))
						return {
							SSID,
							password
						}
					}
				}
			},
			hasPwd() {
				let ssidList = this.wifiList.map(item => item.SSID)
				return this.pwdList
				return this.pwdList.filter(item => ssidList.includes(item.SSID))
			},
			otherWifi() {
				let ssidList = this.pwdList.map(item => item.SSID)
				return this.wifiList.filter(item => !ssidList.includes(item.SSID))
			},
		},
		onLoad() {
			// #ifdef MP-WEIXIN
			this.checkLocationAuth()
			// #endif
		},
		// onShareAppMessage() {
		// 	let title = ''
		// 	let path = ''

		// },
		methods: {
			getConnectedWifi() {
				wx.getConnectedWifi({
					success: (e) => {
						if (e && e.wifi) {
							this.connectedWifi = e.wifi
						}
					}
				})
			},
			selectWifi(e) {
				this.curWifi = e
				this.showModal()
			},
			selectUndefinedWifi(e) {
				this.undefinedWifi = e
				this.showModal()
			},
			hideModal() {
				this.modalName = null
				this.curWifi = null
				this.undefinedWifi = null
				this.undefinedPassword = ''
			},
			showModal() {
				this.modalName = 'link-wifi-info'
			},
			scanCode() {
				// 只允许从相机扫码
				uni.showLoading({
					title: '识别中...'
				})
				wx.scanCode({
					onlyFromCamera: true,
					success: (res) => {
						console.log(res)
						if (res && res.result) {
							this.wifiQrcodeText = res.result
							this.showModal()
						}
					},
					complete: () => {
						uni.hideLoading()
					}
				})
			},
			connectWifi(e) {
				// 连接wifi
				if (!e || (e && !e.SSID)) {
					if (this.undefinedWifi && this.undefinedWifi.SSID && this.undefinedPassword) {
						if (this.undefinedPassword.length >= 8) {
							e = {
								SSID: this.undefinedWifi.SSID,
								password: this.undefinedPassword
							}
						} else {
							uni.showToast({
								title: 'wifi密码必须大于8位',
								icon: 'none'
							})
						}
					} else {
						return
					}
				}
				let {
					SSID,
					password
				} = e
				var self = this

				wx.connectWifi({
					SSID,
					// BSSID: '',
					password,
					success(e) {
						console.log(e)
						if (self.isIOS) { // 是否是IOS可通过提前调用getSystemInfo知道
							wx.onWifiConnected(result => {
								self.hideModal()
								if (result.wifi.SSID === SSID) {
									// 连接成功
									uni.showToast({
										title: '连接成功'
									})
								} else {
									// 连接失败
									uni.showToast({
										title: '连接失败，密码不正确',
										icon: 'none'
									})
								}
							})
						} else {
							// 连接成功
							self.hideModal()
							uni.showToast({
								title: '连接成功'
							})
						}
					},
					fail(err) {
						// 连接失败
						console.log(err)
						self.hideModal()
						uni.showToast({
							title: '连接失败',
							icon: 'none'
						})
					}
				})
			},
			startSearch() {
				// 搜索wifi列表
				var self = this
				const getWifiList = () => {
					uni.showLoading({
						title: 'wifi列表加载中...'
					})
					wx.getWifiList({
						success: (res) => {
							self.getConnectedWifi()
							wx.onGetWifiList((res) => {
								const wifiList = res.wifiList
									.sort((a, b) => b.signalStrength - a.signalStrength)
									.map(wifi => {
										const strength = Math.ceil(wifi.signalStrength * 4)
										return Object.assign(wifi, {
											strength
										})
									})
								this.wifiList = wifiList
							})
						},
						fail(err) {
							console.error(err);
						},
						complete: () => {
							uni.hideLoading()
						}
					})
				}

				const startWifi = () => {
					wx.startWifi({
						success: getWifiList,
						fail(err) {
							console.error(err);
						}
					})
				}

				wx.getSystemInfo({
					success(res) {
						const isIOS = res.platform === 'ios'
						self.isIOS = isIOS
						if (isIOS) {
							wx.showModal({
								title: '提示',
								content: '由于系统限制，iOS用户请手动进入系统WiFi页面，然后返回小程序。',
								showCancel: false,
								success() {
									startWifi()

								}
							})
							return
						}
						startWifi()
					}
				})
			},
			stopSearch() {
				wx.stopWifi({
					success(res) {
						console.log(res);
					},
					fail(err) {
						console.error(err);
					}
				})
			},
			checkLocationAuth() {
				// 检测用户是否授权访问地理位置信息
				let self = this
				wx.getSetting({
					success(res) {
						if (!res.authSetting['scope.userLocation']) {
							wx.authorize({
								scope: 'scope.userLocation',
								success() {
									self.startSearch()
								}
							})
						} else {
							self.startSearch()
						}
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.scan-wifi-wrap {
		min-height: calc(100vh - var(--window-top));
		padding: 20rpx;

		.wifi-status-box {
			color: #fff;
			font-size: 36rpx;
			background-image: linear-gradient(to right bottom, #30DAA9, #00D197);
			min-height: 100rpx;
			margin-bottom: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			text-align: center;
		}

		.link-wifi-info {
			padding: 40rpx;

			.title {
				display: flex;
				justify-content: space-between;
				padding: 0 20rpx 20rpx;
			}

			.logo {
				display: flex;
				min-height: 200rpx;
				justify-content: center;
				align-items: center;
				flex-direction: column;

				.wifi-logo {
					width: 100rpx;
					height: 100rpx;
					background-color: #0bc99d;
					line-height: 100rpx;
					text-align: center;
					font-size: 80rpx;
					color: #fff;
					border-radius: 20rpx;
				}
			}

			.wifi-info {
				padding: 20rpx 0;

				.info-item {
					display: flex;
					align-items: center;
					justify-content: center;

					.label {
						margin-right: 10rpx;
					}
				}
			}

			.handel-bottom {
				display: flex;
				padding: 40rpx 20rpx;
				justify-content: center;

				.button {
					display: flex;
					flex-direction: column;
					background-color: #0bc99d;

				}
			}
		}
	}

	.wifi-list {
		background-color: #fff;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		padding: 20rpx 40rpx;
		margin-bottom: 20rpx;

		.label {
			line-height: 80rpx;
			font-size: 36rpx;
			display: flex;
			justify-content: space-between;
		}

		.wifi-item {
			line-height: 80rpx;
			font-size: 32rpx;
		}
	}

	.list {
		width: 100%;
		text-align: left;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		font-size: 30rpx;
	}

	.list text {
		display: inline-block;
		max-width: 80%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.strength-ready {
		color: #26a69a;
	}

	.strength-no {
		color: #37474f;
	}

	.wifi-icon {
		width: 20px;
		height: 20px;
		display: inline-block;
		position: relative;
		overflow: hidden;
		margin: 0 10px;
		float: right;

		&.has-pwd {
			color: #0bc99d;
		}
	}

	.wifi-icon span {
		display: block;
		position: absolute;
		border-radius: 50%;
	}

	.wifi-icon .wifi-1 {
		// width: 4px;
		// height: 4px;
		// left: 8px;
		// bottom: 3px;
		background: currentcolor;
		width: 4px;
		height: 4px;
		left: 6px;
		bottom: 0px;
	}

	.wifi-icon .wifi-2,
	.wifi-icon .wifi-3,
	.wifi-icon .wifi-4 {
		border: 2px solid;
		border-color: currentcolor transparent transparent;
	}

	.wifi-icon .wifi-2 {
		width: 12px;
		height: 12px;
		left: 2px;
		bottom: -4px;
	}

	.wifi-icon .wifi-3 {
		width: 20px;
		height: 20px;
		left: -2px;
		bottom: -8px;
	}

	.wifi-icon .wifi-4 {
		width: 28px;
		height: 28px;
		left: -6px;
		bottom: -12px;
	}

	.wifi-icon span:after {
		content: "";
		display: block;
		position: absolute;
	}

	.wifi-icon .lock {
		width: 6px;
		height: 5px;
		background: currentcolor;
		display: block;
		right: 1px;
		bottom: 2px;
		border-radius: 0;
	}

	.wifi-icon .lock:after {
		width: 4px;
		height: 3px;
		border: 1px solid;
		border-radius: 100px 100px 0 0;
		border-bottom: none;
		left: 0px;
		bottom: 100%;
	}


	.off {
		border-color: #b0bec5 transparent transparent !important;
	}
</style>
