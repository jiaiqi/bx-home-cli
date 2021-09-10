<template>
	<view class="rank-list">
		<view class="total-count">
			{{totalCount||''}}
		</view>
		<view class="rank-item" v-for="(item,index) in rankList" @click="toDetail(item,index+1)">
			<view class="index">
				{{index+1}}
			</view>
			<view class="profile-box">
				<image :src="item.profile_url" mode="aspectFill" class="profile-image" v-if="item.profile_url">
				</image>
				<image :src="getImagePath(item.org_logo,true)" mode="aspectFill" class="profile-image"
					v-else-if="item.org_logo">
				</image>
				<image mode="aspectFill" class="profile-image" v-else></image>
			</view>
			<view class="rank-content">
				<view class="nick-name">
					{{item.nick_name||item.org_name||'-'}}
				</view>
				<view class="step-count">
					前进{{item.walk_act_steps_sum||0}}步
				</view>
			</view>
		</view>
		<view class="button-box" v-if="type==='group'&&!groupInfo">
			<!-- 			<button class="cu-btn border line-blue" @click="joinInOrg"><text
					class="cuIcon-search margin-right-xs"></text>加入小队 </button> -->
			<button class="cu-btn border line-cyan" @click="showModal('createGroup')">创建团队</button>
		</view>

		<view class="cu-modal bottom-modal" :class="{show:modalName==='createGroup'}" @click="hideModal">
			<view class="cu-dialog" @click.stop="">
				<view class="create-group">
					<a-form :fields="addOrgFields" :pageType="'add'" :formType="'add'" ref="addOrgForm"></a-form>
					<view class="button-box">
						<button class="cu-btn bg-blue" @click="createOrg">创建</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			act_no: {
				type: String,
				default: ''
			},
			type: {
				type: String,
				default: 'personal' //personal,group
			},
			total: {
				type: Number,
				default: 0
			},
		},
		watch: {
			type(newValue, oldValue) {
				if (newValue !== oldValue) {
					this.rankList = []
					this.pageInfo.total = 0
					this.pageInfo.pageNo = 1
					if (newValue === 'group') {
						this.getGroupInfo().then(_ => {
							this.getRankList()
						})
					} else {
						this.getRankList()
					}
				}
			}
		},
		data() {
			return {
				modalName: null,
				pageInfo: {
					total: 0,
					rownumber: 10,
					pageNo: 1
				},
				rankList: [],
				groupRankList: [],
				groupInfo: null,
				addOrgFields: [{
					"column": "org_name",
					"label": "小队名称",
					"isRequire": true,
					"type": "text",
					"service_name": "srvportal_org_mgmt_add",
					"columns": "org_name",
					"table_name": "bxportal_org_mgmt",
					"table_column": "org_name",
					"bx_col_type": "string",
					"col_type": "String",
					"in_add": 1,
					"in_list": 1,
					"in_detail": 1,
					"in_update": 1,
					"in_cond": 1,
					"in_cond_def": 1,
					"updatable": 1,
					"required": "否",
					"validators": "ngMaxlength=50",
					"showExp": true,
					"display": true,
					"disabled": false,
					"_validators": {
						"max": 50,
						"min": null,
						"reg": "",
						"required": false,
						"msg": "",
						"isType": {}
					},
					"value": null,
				}, {
					"column": "org_logo",
					"label": "小队logo",
					fileNum: 2,
					"isRequire": false,
					"type": "images",
					"moreConfig": {},
					"service_name": "srvportal_org_mgmt_add",
					"columns": "org_logo",
					"table_name": "bxportal_org_mgmt",
					"table_column": "org_logo",
					"table_var": null,
					"bx_col_type": "String",
					"col_type": "Image",
					"in_add": 1,
					"in_list": 1,
					"in_detail": 1,
					"in_update": 1,
					"in_cond": 1,
					"validators": "ngMaxlength=255",
					"validators_message": "",
					"srvInfo": {
						"tableName": "bxportal_org_mgmt",
						"appNo": "portal"
					},
					"showExp": true,
					"display": true,
					"disabled": false,
					"_validators": {
						"max": 255,
						"min": null,
						"reg": "",
						"required": false,
						"msg": "",
						"isType": {}
					},
					"value": null,
				}]
			}
		},
		computed: {
			totalCount() {
				// 总共参加人数/队伍数
				return `${this.pageInfo?.total||0}${this.type=='personal'?'人':'个小队'}正在参与此活动`
			}
		},
		mounted() {
			this.getRankList()
		},
		methods: {
			toDetail(e,index){
				if(e.org_no&&index){
					this.$emit('toGroup', {info:e,index} )
				}
			},
			showModal(e) {
				this.modalName = e
			},
			hideModal() {
				this.modalName = null
			},
			async getGroupInfo() {
				let req = {
					"serviceName": "srvportal_act_atd_rcd_select",
					"colNames": ["*"],
					"condition": [{
							colName: 'org_no',
							ruleType: 'notnull'
						},
						{
							colName: 'user_no',
							ruleType: 'eq',
							value: uni.getStorageSync('login_user_info').user_no
						},
						{
							colName:"act_no",
							ruleType:"eq",
							value: this.act_no
						}
					],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					},
				}
				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select')
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
						this.groupInfo = res.data.data[0]
					}
				})
			},
			async createOrg() {
				let modal = this.$refs.addOrgForm.getFieldModel();
				if (modal) {
					let url = this.getServiceUrl('bxportal', 'srvportal_org_mgmt_add', 'operate')
					let req = [{
						"serviceName": "srvportal_org_mgmt_add",
						"condition": [],
						"data": [modal]
					}]
					let res = await this.$http.post(url, req)
					if (res.data.state === 'SUCCESS') {
						if (Array.isArray(res.data.response) && res.data.response
							.length > 0 && res.data.response[0].response?.effect_data?.[0]?.org_no) {
							let result = res.data.response[0].response.effect_data[0]
							await this.createGroup(result.org_no)
							this.getGroupInfo()
						}
					}
					this.hideModal()
				}
			},
			async createGroup(no) {
				// uni.showToast({
				// 	title: '此功能正在开发中',
				// 	icon: 'none'
				// })
				let req = [{
					"serviceName": "srvportal_act_atd_rcd_add",
					"condition": [],
					"data": [{
						"act_no": this.act_no,
						"atd_type": "单位",
						"user_no": uni.getStorageSync('login_user_info').user_no,
						"org_no": no,
						"walk_act_steps_sum": 0
					}]
				}]
				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_add', 'operate')
				let res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS') {
					uni.showToast({
						title: '创建成功！'
					})
					this.getRankList()
				} else {
					uni.showToast({
						title: res.data.resultMessage,
						icon: 'none'
					})
				}
				return res

			},
			joinInOrg() {

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
						"pageNo": this.pageInfo.pageNo,
						"rownumber": this.pageInfo.rownumber
					},
					"order": [{
						colName: "walk_act_steps_sum",
						orderType: "desc"
					}],
				}

				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select')
				if (this.type === 'group') {
					req.condition.push({
						"colName": "atd_type",
						"ruleType": "eq",
						"value": '单位'
					})
					req.group = [{
							"colName": "org_no",
							"type": "by"
						},
						{
							"colName": "org_name",
							"type": "by"
						},
						{
							"colName": "org_logo",
							"type": "by"
						},
						// {
						// 	"colName": "profile_url",
						// 	"type": "by"
						// },
						{
							"colName": 'user_no',
							"type": "count"
						}, {
							"colName": "walk_act_steps_sum",
							"type": "sum"
						}
					]
					this.getGroupInfo()
				} else {
					req.condition.push({
						"colName": "atd_type",
						"ruleType": "eq",
						"value": '个人'
					})
				}
				let res = await this.$http.post(url, req)
				if (res.data.state === "SUCCESS" && Array.isArray(res.data.data)) {
					this.rankList = res.data.data
					this.pageInfo.total = res?.data?.page?.total || 0
				}
				let obj = {
					page:res?.data?.page,
					data:res?.data?.data
				}
				this.$emit('loaded',obj)
				return obj
			},
		},
	}
</script>

<style scoped lang="scss">
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

	.rank-list {
		.total-count {
			text-align: center;
			padding: 20rpx;
			color: #626f76;
		}

		.rank-item {
			display: flex;
			margin-top: 20rpx;

			.index {
				width: 100rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 36rpx;
				font-weight: bold;
			}

			.profile-box {
				width: 100rpx;
				height: 100rpx;
				margin-right: 20rpx;

				.profile-image {
					width: 100%;
					height: 100%;
					border-radius: 50%;
					border: 1rpx solid #f1f1f1;
				}
			}

			.rank-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;

				.nick-name {
					font-weight: bold;
					font-size: 32rpx;
				}

				.step-count {
					color: #666;
					margin-top: 10rpx;
				}
			}
		}

		.button-box {
			padding: 20rpx 0 0;

			.cu-btn {
				width: 40%;
			}
		}
	}

	.create-group {
		min-height: 30vh;
		padding: 20rpx;
	}
</style>
