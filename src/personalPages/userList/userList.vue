<template>
	<view>
		<cu-custom :isBack="true" @onBack="onBack">
			<block slot="content">用户管理</block>
		</cu-custom>
		<bx-filter ref="filter" :searchArg="searchArg" v-if="searchArg" :menuAgList="menuAgList" @toMessage="toMessage"
			@clickItem="toPages('patients', $event)" @click-add-item="clickAddItem"></bx-filter>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import bxFilter from '@/components/bx-filtrate/bx-filtrate';
	export default {
		components: {
			bxFilter
		},
		computed: {
			...mapState({
				userInfo: state => state.user.userInfo
			})
		},
		data() {
			return {
				currentUser: {},
				doctorInfo: {},
				searchArg: null,
				menuAgList: null
			};
		},
		methods: {
			onBack() {},
			toMessage(e) {
				if (e && e.userb_person_no && e.row_no) {
					// type: 121 - 一对一
					uni.navigateTo({
						// url:'/personalPages/myDoctor/doctorChat?no='+e.userb_person_no
						url: '/publicPages/chat/chat?type=用户间&identity=医生&row_no=' + e.row_no
					})
				}
			},
			toPages(type, item) {
				if (type === 'patients') {
					uni.navigateTo({
						url: `/personalPages/patientsInfo/patientsInfo?customer_no=${item.userb_person_no}&dp_no=${item.row_no}`
					});
				}
			},
			clickAddItem() {
				uni.navigateTo({
					url: '/publicPages/nameCard/nameCard'
				});
			},
			async getDoctorInfo() {
				// 查找医生信息
				let url = this.getServiceUrl('health', 'srvhealth_doctor_select', 'select');
				let req = {
					serviceName: 'srvhealth_doctor_select',
					colNames: ['*'],
					condition: [{
						colName: 'owner_account',
						ruleType: 'like',
						value: this.userInfo.user_no ? this.userInfo.user_no : this.currentUser.userno
					}]
				};
				if (req.condition[0].value) {
					let res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
						return res.data.data[0];
					} else {
						return false;
					}
				}
			},
			buildMenuAgList() {
				let obj = {
					classify_name: '性别',
					type: 'food',
					colunn: 'userb_sex',
					children: [{
							title: '全部',
							value: '全部',
							choose: true
						},
						{
							title: '男',
							value: '男',
							choose: false
						},
						{
							title: '女',
							value: '女',
							choose: false
						}
					]
				};
				this.menuAgList = [obj];
			},
			buildSearchArg(doctorInfo) {
				this.searchArg = {
					serviceName: 'srvhealth_person_relation_select',
					imgCol: 'userb_profile_url',
					isShowCouple: true,
					pageRowNumber: 20,
					topNum: 250,
					condition: [{
						colName: 'usera_person_no',
						ruleType: 'like',
						value: this.currentUser.no
					}],
					wordKey: {
						title: 'userb_name'
					}
				};
			}
		},
		onShow() {
			let userList = uni.getStorageSync('user_info_list');
			let current_user = uni.getStorageSync('current_user_info');
			// if (userList && current_user) {
			if (this.userInfo && this.userInfo.no) {
				this.currentUser = this.userInfo;
				// this.getDoctorInfo().then(res => {
				// 	if (res && res.dt_no) {
				// 		this.doctorInfo = res;
				// 	}
				// 	this.buildSearchArg(res);
				// 	this.buildMenuAgList();
				// });
				this.buildSearchArg();
				this.buildMenuAgList();
			}
		},
		mounted() {
			uni.$on('updateUnread', _ => {
				this.$refs.filter && this.$refs.filter.onRefresh();
			})
			uni.$on('backPage', () => {
				this.$refs.filter && this.$refs.filter.onRefresh();
			});
			console.log('--mounted---');
		}
	};
</script>

<style></style>
