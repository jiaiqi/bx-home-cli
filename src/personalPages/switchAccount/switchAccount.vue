<template>
	<view class="switch-account">
		<view class="tips">
			点击下方账号列表切换对应账号
		</view>
		<view class="account-item" v-for="item in authorized_users" :key="item.authorized_user"
			@click="confirmSwitch(item)">
			{{item|getUserName}}
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	export default {
		filters: {
			getUserName: function(value) {
				if (value.authorized_user_name && value.authorized_user) {
					return `${value.authorized_user_name}/${value.authorized_user}`
				} else if (!value.authorized_user_name && value.authorized_user) {
					return `未命名用户/${value.authorized_user}`
				} else {
					return ''
				}
			}
		},
		computed: {
			...mapState({
				loginUserInfo: state => state.user.loginUserInfo
			}),
			authorized_users() {
				if (Array.isArray(this.loginUserInfo?.authorized_users)) {
					return this.loginUserInfo.authorized_users
				}
				return []
			},
		},
		data() {
			return {

			}
		},
		methods: {
			confirmSwitch(item) {
				if (item && item.authorized_user) {
					uni.showModal({
						title: '提示',
						content: `确认切换到用户【${item.authorized_user_name||'未命名用户'}】?`,
						success: (res) => {
							if (res.confirm) {
								this.switchUser(item.authorized_user)
							}
						}
					})
				}

			},
			async switchUser(user) {
				const req = [{
					"serviceName": "srvuser_login_account_switch",
					"data": [{
						"authorized_user": user
					}]
				}]
				let res = await this.onRequest("operate", "srvuser_login_account_switch", req, 'sso')
				if (res.data.state === "SUCCESS") {
					if (Array.isArray(res.data.response) && res.data.response.length > 0) {
						let result = res.data.response[0]
						if (result.response) {
							const response = result.response
							uni.clearStorage()
							let expire_timestamp = parseInt(new Date().getTime() / 1000) + response
								.expire_time; //过期时间的时间戳(秒)
							uni.setStorageSync('bx_auth_ticket', response.bx_auth_ticket);
							uni.setStorageSync('expire_time', response.expire_time); // 有效时间
							uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
							if (response.login_user_info.user_no) {
								uni.setStorageSync('login_user_info', response.login_user_info);
							}
							this.$store.commit('SET_LOGIN_STATE', true)
							this.$store.commit('SET_LOGIN_USER', response.login_user_info)
							this.$store.commit('SET_TICKET', response.bx_auth_ticket)
							uni.setStorageSync('isLogin', true);
							uni.reLaunch({
								url: '/pages/home/home'
							})
						}
					}
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.switch-account {
		min-height: calc(100vh - var(--window-top) - var(--window-bottom));
		display: flex;
		flex-direction: column;
		// justify-content: center;
		align-items: center;
		padding: 20rpx;
		background-color: #F1F1F1;

		.tips {
			height: 200rpx;
			text-align: center;
			width: 100%;
			font-size: 36rpx;
			line-height: 200rpx;
		}

		.account-item {
			background-color: #fff;
			box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
			width: 100%;
			padding: 20rpx;
			min-height: 100rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
		}
	}
</style>
