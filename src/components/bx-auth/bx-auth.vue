<template>
	<view class="auth-box">
		<view class="logo-box">
			<image :src="getImagePath('20210222171446264100')" mode="aspectFit" class="logo"></image>
			<view class="label text-bold">百想健康</view>
		</view>
		<button type="primary" class="cu-btn bg-green button" lang="zh_CN" v-if="canIUseGetUserProfile"
			@tap="getUserProfile">
			微信登录 </button>
		<button type="primary" class="cu-btn bg-green button" v-else open-type="getUserInfo" @getuserinfo="getUserInfo">
			微信登录
		</button>
		<view class="tips">{{ tips }}</view>
		<!-- <button type="primary" class="cu-btn bg-green" lang="zh_CN" :open-type="openType" @getuserinfo="getuserinfo">微信登录</button> -->
		<!-- <button type="primary" class="cu-btn bg-green button" lang="zh_CN" @click="toAuthPage">去登录</button> -->
		<view class="bottom">
			登录代表您已同意<text class="text-cyan" @click="toArticle('CT2021012816330102')">百想用户协议</text>
			、
			<text class="text-cyan" @click="toArticle('CT2021012816470103')">隐私协议</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				canIUseGetUserProfile: false
			}
		},
		props: {
			openType: {
				type: String,
				default: 'getUserInfo'
			},
			tips: {
				type: String,
				default: '您必须登录后才可体验完整小程序'
			}
		},
		created() {
			if (wx.getUserProfile) {
				this.canIUseGetUserProfile = true
			}
		},
		methods: {
			getUserProfile(e) {
				// 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
				// 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
				wx.getUserProfile({
					desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
					success: (res) => {
						this.$store.commit('SET_AUTH_USER', res)
						this.handleUserInfo(res)
					}
				})
			},
			getUserInfo(e) {
				// 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
				
				this.handleUserInfo(e.detail)
				this.$store.commit('SET_AUTH_USER', e)
				this.$emit('getuserinfo', e);
			},
			async handleUserInfo(res) {
				let self = this
				if (typeof res === 'object' && Object.keys(res).length > 0 && res.userInfo) {
					let rawData = {
						nickname: res.userInfo.nickName,
						sex: res.userInfo.gender,
						country: res.userInfo.country,
						province: res.userInfo.province,
						city: res.userInfo.city,
						headimgurl: res.userInfo.avatarUrl
					};
					self.$store.commit('SET_WX_USERINFO', rawData);
					self.$store.commit('SET_AUTH_USERINFO', true);
					await self.setWxUserInfo(rawData);
					this.$emit('auth-complete')
					return rawData
				}
			},
			toAuthPage(e) {
				this.$store.commit('SET_CURRENT_PAGE', 'publicPages/accountExec/accountExec')
				let pageStack = getCurrentPages()
				if (Array.isArray(pageStack) && pageStack.length >= 1) {
					let currentPage = pageStack[pageStack.length - 1]
					this.$store.commit('SET_PRE_PAGE_URL', currentPage.$page.fullPath)
				}
				uni.redirectTo({
					url: '/publicPages/accountExec/accountExec'
				});
			},
			// getuserinfo(e) {
			// 	this.$emit('getuserinfo', e);
			// }
		}
	};
</script>

<style lang="scss">
	.auth-box {
		width: 100vw;
		height: calc(100vh - var(--window-top) - var(--window-bottom));
		z-index: 1001;
		display: flex;
		align-items: center;
		flex-direction: column;
		background-color: #fff;
		padding-top: 20vh;
		position: relative;
		.bottom{
			position: absolute;
			bottom: 50px;
		}
		.logo-box {
			margin-bottom: 50px;
			letter-spacing: 2px;
		}

		.logo {
			width: 100rpx;
			height: 100rpx;
			margin: 10rpx auto;
		}

		.tips {
			font-size: 28rpx;
			color: #999;
			margin: 20px 0;
		}

		.text {
			padding: 0 40px;
			text-align: left;
			width: 100%;
		}

		.button {
			font-size: 32rpx;
			// color: #fff;
			width: 80%;
			letter-spacing: 2px;
		}
	}
</style>
