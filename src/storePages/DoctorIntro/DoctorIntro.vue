<template>
	<view class="hospital-wrap">
		<view class="hospital-top">
			<view class="leftimage">
				<image class="image" :src="topBgImg" mode="aspectFit"></image>
			</view>
			<view class="left">
				<view class="name" v-if="storeUserInfo&&storeUserInfo.person_name">{{ storeUserInfo.person_name ||''}}
				</view>
				<view class="" v-if="storeUserInfo&&storeUserInfo.name">
					{{storeUserInfo.name}}
				</view>
			</view>
			<view class="right phone" v-if="doctorInfo.phone||doctorInfo.phone_xcx">
				<text class="cuIcon-phone" @click="makePhoneCall" v-if="doctorInfo.phone||doctorInfo.phone_xcx"></text>
			</view>
		</view>
		<view class="introduction" v-if="storeUserInfo.staff_introduction">
			<view class="introduce" v-if="storeUserInfo.staff_introduction">
				<text class="title">
					简介：
				</text>{{ storeUserInfo.staff_introduction||'暂无简介' }}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				store_user_no: '',
				doctorNo: '',
				doctorInfo: {},
				storeNo: '',
				relationInfo: {},
				// storeInfo: {},
				doctorStoreList: [],
				modalName: ''
			};
		},
		computed: {
			topBgImg() {
				if (this.storeUserInfo && this.storeUserInfo.user_image) {
					return this.getImagePath(this.storeUserInfo.user_image);
				} else if (this.storeUserInfo && this.storeUserInfo.profile_url) {
					return this.getImagePath(this.storeUserInfo.profile_url);
				}
			},
			storeUserInfo() {
				if (Array.isArray(this.doctorStoreList) && this.doctorStoreList.length > 0) {
					return this.doctorStoreList[0]
				} else {
					return {}
				}
			},
			...mapState({
				userInfo: state => state.user.userInfo,
				inviterInfo: state => state.app.inviterInfo
			})
		},
		methods: {
			makePhoneCall() {
				uni.makePhoneCall({
					phoneNumber: this.doctorInfo.phone || this.doctorInfo.phone_xcx
				});
			},
			async getStoreUserInfo(no) {
				let url = this.getServiceUrl('health', 'srvhealth_store_user_select', 'select');
				let req = {
					serviceName: 'srvhealth_store_user_select',
					colNames: ['*'],
					condition: [{
						colName: 'person_no',
						ruleType: 'eq',
						value: this.doctorInfo.no || no
					}]
				};
				if (this.storeNo) {
					req.condition.push({
						colName: 'store_no',
						ruleType: 'eq',
						value: this.storeNo
					});
				}
				let res = await this.$http.post(url, req);
				if (Array.isArray(res.data.data)) {
					this.doctorStoreList = res.data.data;
					return res.data.data;
				}
			},
		},
		async onLoad(option) {
			this.checkOptionParams(option);
			await this.toAddPage();
			if (option.store_no) {
				this.storeNo = option.store_no;
			}
			if (option.store_user_no) {
				this.store_user_no = option.store_user_no
			}
			if (option.person_no) {
				this.getStoreUserInfo(option.person_no)
        
			}
		}
	};
</script>

<style scoped lang="scss">
	@import './style.scss';
</style>
