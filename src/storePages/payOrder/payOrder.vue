<template>
	<view class="pay-order" :class="['theme-'+theme]" v-if="orderInfo&&orderInfo.order_state">
		<view class="address-box" @click="chooseAddress"
			v-if="(!room_no&&(storeInfo&&storeInfo.type!=='酒店')&&(!orderInfo||!orderInfo.order_no))&&['快递','卖家配送'].includes(delivery_type)&&needAddress">
			<view class="left"
				v-if="(addressInfo && addressInfo.userName && addressInfo.telNumber)||orderInfo&&orderInfo.rcv_addr_str">
				<text class="cuIcon-locationfill"></text>
			</view>
			<view class="left" v-else><text class="cuIcon-warnfill"></text></view>
			<view class="center" v-if="orderInfo&&orderInfo.rcv_addr_str">
				<view class="">
					<text class="name">{{ orderInfo.rcv_name || "-" }}</text>
					<text class="phone">{{ orderInfo.rcv_telephone || "-" }}</text>
				</view>
				<view class="address">{{ orderInfo.rcv_addr_str|| "-" }}</view>
			</view>
			<view class="center" v-else-if="addressInfo && addressInfo.userName && addressInfo.telNumber">
				<view class="">
					<text class="name">{{ addressInfo.userName || "-" }}</text>
					<text class="phone">{{ addressInfo.phone || "-" }}</text>
				</view>
				<view class="address">{{ addressInfo.fullAddress || "-" }}</view>
			</view>
			<view class="center" v-else>
				<view class="center-select"> 请先选择地址 </view>
			</view>
			<view class="right" v-if="!orderInfo||!orderInfo.rcv_addr_str"><text class="cuIcon-right"></text></view>
		</view>

		<view class="order-detail">
			<view class="person-info" v-if="orderType==='团购'">
				<view class="cu-form-group">
					<view class="title">姓名</view>
					<input :placeholder="'请输入姓名'" name="input" v-model="addressInfo.userName"
						placeholder-style="fontSize:12px;" :disabled="!!orderInfo.order_no"></input>
					<text class="cuIcon-write" style="fontSize:14px;" v-if="!orderInfo.order_no"></text>
				</view>
				<view class="cu-form-group ">
					<view class="title">手机号</view>
					<input :placeholder="'请输入手机号'" name="input" v-model="addressInfo.telNumber"
						placeholder-style="fontSize:12px;" :disabled="!!orderInfo.order_no"></input>
					<text class="cuIcon-write" style="fontSize:14px;" v-if="!orderInfo.order_no"></text>
				</view>
			</view>
			<view class="order-info">
				<view class="title-bar text-bold" v-if="orderType==='团购'">
					已选商品
				</view>
				<view class="title-bar" v-else>
					<image class="store-logo" :src="getImagePath(orderInfo.image)" mode="aspectFill"
						v-if="orderInfo.image">
					</image>
					<text class="store-logo cuIcon-shop" v-else></text>
					<text class="store-name">{{
            orderInfo.store_name ? orderInfo.store_name : orderInfo.name || ""
          }}</text>
				</view>
				<view class="goods-list">
					<goods-item :goods="goods" v-for="(goods,idx) in orderInfo.goodsList" :key="idx"></goods-item>
				</view>
				<view class="order-remark">
					<textarea class="textarea" v-model="order_remark" placeholder="订单备注"
						:disabled="orderInfo&&orderInfo.order_no" />
				</view>
				<view class="id-number-edit" v-if="needIdNum">
					<view class="cu-form-group ">
						<view class="title">身份证号</view>
						<input :placeholder="'请输入身份证号'" name="input" v-model="idNum"
							placeholder-style="fontSize:24rpx;"></input>
					</view>
					<view class="remark text-cyan">
						<text class="cuIcon-info"></text> {{needIdRemark||''}}
					</view>
				</view>
			</view>
			<view class="room-selector" v-if="storeInfo&&storeInfo.type==='酒店'" @click="showSelector">
				<view class="place-holder" v-if="!room_no">
					点击选择房间号
				</view>
				<view class="" v-else>
					{{room_no||''}}
				</view>
				<text class="cuIcon-right place-holder"></text>
			</view>

			<view class="pay-mode" style="margin-top: 10px;margin-bottom: 10px;" v-if="needAddress&&orderType!=='团购'">
				<view class="pay-mode-item ">
					<view class="">
						<text class="cuIcon-deliver text-yellow  icon"></text>
						提货方式
					</view>
					<view class="" v-if="orderInfo.delivery_type">
						<text>{{orderInfo.delivery_type||''}}</text>
						<!-- <text class="cuIcon-right"></text> -->
					</view>
				</view>
				<view class="pay-mode-item" v-if="!orderInfo.delivery_type">
					<view class="" style="width: 100%;">
						<u-subsection :list="deliveryList" :current="curDelivery" @change="changeDelivery">
						</u-subsection>
					</view>
				</view>
			</view>
			<view class="pay-mode" v-if="!orderInfo||(orderInfo&& orderInfo.pay_state==='待支付'&&( orderInfo.order_state==='待支付'|| orderInfo.order_state==='待提交'))">
				<radio-group @change="payModeChange" style="width: 100%;">
					<view class="pay-mode-item" v-if="couponList&&couponList.length>0" @click="toCouponSelector">
						<view class="">
							<text class="cuIcon-card text-red  icon"></text>
							卡券支付
						</view>
						<view class="" style="display: flex;align-items: center;">
							<view class="coupon-info" v-if="couponInfo">
								<view class="coupon-name">
									{{couponInfo.card_name||''}}
								</view>
								<view class="amount" v-if="couponInfo.card_last_amount">
									剩余金额:{{couponInfo.card_last_amount||''}}
								</view>
							</view>
							<!-- <radio :checked="payMode==='coupon'" value="coupon" @change="payModeChange('coupon')" /> -->
							<text class="cuIcon-right"></text>
						</view>
					</view>
					<view class="pay-mode-item" @click="payModeChange({detail:{value:'wx'}})" v-if="!pay_method">
						<view class="">
							<text class="cuIcon-weixin text-green  icon"></text>
							微信支付
						</view>
						<view class="">
							<radio :checked="payMode==='wx'" value="wx" />
							<!-- <text class="cuIcon-right"></text> -->
						</view>
					</view>
				</radio-group>
			</view>


		</view>


		<view class="handler-bar">
			<text class="amount">共{{ totalAmount }}件</text>
			<text class="text" v-if="totalMoney&&!pay_method">合计:</text>
			<text class="money-amount" v-if="totalMoney&&!pay_method">
				<text class="money-operate">￥</text>
				<text>{{ totalMoney || "" }}</text>
			</text>
			<button class="cu-btn bg-gradual-orange round" :class="'bx-bg-'+theme" @click="submitOrder"
				v-if="orderInfo.order_state === '待提交'">
				<text v-if="pay_method">确认核销</text>
				<text v-else> 提交订单</text>
			</button>
			<button class="cu-btn bg-gradual-orange round" @click="toPay" v-if="(
          orderInfo.order_state === '待支付' &&
          (orderInfo.pay_state === '取消支付' ||
            orderInfo.pay_state === '待支付'))&&payMode !== 'coupon'
        ">
				付款
			</button>
		</view>
		<view class="cu-modal bottom-modal" :class="{
     show: modalName === 'Selector'
   }" @click="hideModal">
			<view class="cu-dialog" @tap.stop="">
				<view class="tree-selector">
					<view class="content">
						<view class="cu-bar search bg-white" v-if="modalName === 'Selector'">
							<view class="search-form round">
								<input @input="searchFKDataWithKey" type="text" placeholder="搜索"
									confirm-type="search" />
							</view>
							<text class="cu-btn cuIcon-refresh line-blue shadow round margin-right-xs"
								@click="getSelectorData(null, null, null)"></text>
							<text class="cu-btn cuIcon-add line-blue shadow round margin-right-xs" @click="toFkAdd">
							</text>
						</view>
						<bx-radio-group class="form-item-content_value radio-group" v-model="room_no" mode="button"
							@change="pickerChange">
							<bx-radio v-for="item in selectorData" :key="item.value" :name="item.value">{{ item.label }}
							</bx-radio>
						</bx-radio-group>
					</view>
					<view class="dialog-button">
						<!--       <view class="cu-btn bg-blue shadow" @tap="hideModal" v-if="modalName === 'MultiSelector'">确定
            </view> -->
						<view class="cu-btn bg-grey shadow margin round" @tap="hideModal"
							v-if="modalName === 'Selector'">取消</view>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import goodsItem from './goods-item.vue'
	export default {
		components: {
			goodsItem
		},
		data() {
			return {
				curDelivery: 0,
				deliveryList: [{
						name: '快递'
					},
					{
						name: '自提'
					},
					{
						name: '卖家配送'
					},
					{
						name: '当面交易'
					}
				],
				delivery_type: "快递", //提货方式
				payMode: 'wx',
				couponList: [], //卡券列表
				store_no: "",
				room_no: "",
				orderNo: '', //订单编号
				orderInfo: {},
				order_remark: "",
				addressInfo: {
					fullAddress: '',
					userName: "",
					telNumber: ""
				},
				wxMchId: "", //商户号
				idNum: '', //身份证号
				modalName: "",
				selectorData: [],
				roomOptionList: {},
				roomService: "",
				roomApp: "",
				roomPageNo: 1,
				roomV2: {
					"refed_col": "room_no",
					"show_as_pair": false,
					"srv_app": "store",
					"serviceName": "srvstore_hotel_room_select",
					"conditions": [{
						"colName": "hotel_no",
						"ruleType": "eq",
						"value": "${storeInfo.store_no}"
					}],
					"key_disp_col": "room_no"
				},
				couponInfo: null,
				pay_method: "",
				orderType: '', //普通，团购
				tgNo: "", //团购编号
				goodsWay: "", //团购收货方式
			};
		},
		computed: {
			...mapState({
				userInfo: state => state.user.userInfo,
				loginUserInfo: state => state.user.loginUserInfo,
				cartInfo: state => state.order.cartInfo,
				storeInfo: state => state.app.storeInfo,
				storeUserInfo: state => state.user.storeUserInfo,
				theme: state => state.app.theme
			}),
			needIdNum() {
				let goods = this.orderInfo.goodsList;
				if (Array.isArray(goods) && goods.length > 0) {
					return goods.some(item => item.need_id_num == '是')
				}
			},
			needIdRemark() {
				let goods = this.orderInfo.goodsList;
				if (Array.isArray(goods) && goods.length > 0) {
					let good = goods.find(item => item.need_id_num == '是')
					if (good && good.remark) {
						return good.remark
					}
				}
			},
			needAddress() {
				return this.orderInfo?.goodsList && this.orderInfo.goodsList.length > 0 && this.orderInfo.goodsList.find(
					item => ['现制餐饮', '产品'].includes(item.goods_type))
			},
			totalAmount() {
				if (Array.isArray(this.orderInfo.goodsList)) {
					return this.orderInfo.goodsList.reduce((pre, cur) => {
						if (cur.goods_amount) {
							pre += cur.goods_amount;
						} else if (cur.car_num) {
							pre += cur.car_num;
						}
						return pre;
					}, 0);
				}
			},
			totalMoney() {
				if (Array.isArray(this.orderInfo.goodsList)) {
					return this.orderInfo.goodsList.reduce((pre, cur) => {
						if (cur.goods_amount && cur.unit_price) {
							pre += cur.goods_amount * cur.unit_price;
						} else if (cur.price && cur.car_num) {
							pre += cur.car_num * cur.price;
						}
						return pre;
						// }, 0)
					}, 0)
				}
			}
		},
		methods: {
			async addVerRecord(order_no, childData) {
				// 增加核销记录
				let goodsList = childData || this.orderInfo.goodsList
				let serviceName = 'srvhealth_store_package_approval_add'
				let req = [{
					"serviceName": serviceName,
					"condition": [],
					"data": []
				}]
				req[0].data = goodsList.map(item => {
					let obj = {
						"order_goods_no": item.order_goods_rec_no,
						"card_case_detail_no": item.card_case_detail_no,
						"card_no": this.card_no || this.couponInfo?.card_no,
						"order_no": order_no,
						"goods_no": item.goods_no,
						"goods_name": item.goods_name,
						"approval_num": item.car_num || item.goods_amount,
						"store_no": this.store_no || this.storeInfo?.store_no
					}
					return obj
				})
				let res = await this.$fetch('operate', 'srvhealth_store_package_approval_add', req, 'health')
				if (res.success) {
					return res.data
				} else if (res.msg) {
					uni.showModal({
						title: '提示',
						content: res.msg,
						showCancel: false
					})
				}
				return res
			},
			async addPayRecord(order_no) {
				let req = [{
					"serviceName": "srvhealth_store_order_payment_detail_add",
					"condition": [],
					"data": [{
						"pay_type": "支付",
						"order_no": order_no,
						"pay_way": this.couponInfo?.card_type
					}]
				}]
				let res = await this.$fetch('operate', 'srvhealth_store_order_payment_detail_add', req, 'health')
				if (res.success) {
					uni.showModal({
						title: "提示",
						content: '操作成功',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								// if (this.uuid) {
								// 	uni.$emit(this.uuid)
								// }
								// 					uni.navigateBack({

								// 					})
							}
						}
					})
				} else if (res.msg) {
					uni.showModal({
						title: '提示',
						content: res.msg,
						showCancel: false
					})
				}
				return res
			},
			changeDelivery(e) {
				console.log(e)
				this.delivery_type = this.deliveryList[e].name
			},
			toCouponSelector() {
				if (this.pay_method) {

					return
				}
				this.payMode = 'coupon'
				let url =
					'/storePages/coupon/coupon?serviceName=srvhealth_store_card_case_select&app=health&mode=selector&pageTitle=支付方式'
				let condition = [{
						colName: 'card_type',
						ruleType: 'in',
						value: '充值卡,面额卡'
					},
					{
						colName: 'use_states',
						ruleType: 'eq',
						value: '使用中'
					},
					// {
					// 	colName: 'use_start_date',
					// 	ruleType: 'le',
					// 	value: this.dayjs().format("YYYY-MM-DD")
					// }, {
					// 	colName: 'use_end_date',
					// 	ruleType: 'ge',
					// 	value: this.dayjs().format("YYYY-MM-DD")
					// },
					{
						colName: 'card_last_amount',
						ruleType: 'ge',
						value: this.totalMoney
					},
					{
						colName: 'useing_store_user_no',
						ruleType: 'eq',
						value: this.vstoreUser?.store_user_no
					}
				]
				let emitId = uni.$u.guid()
				url += `&cond=${JSON.stringify(condition)}&emitId=${emitId}`
				uni.$on(emitId, (e) => {
					this.couponInfo = e
				})
				uni.navigateTo({
					url
				})
			},
			payModeChange(e) {
				this.payMode = e.detail.value
			},
			getCouponList() {
				const serviceName = 'srvhealth_store_card_case_select'
				const req = {
					"serviceName": serviceName,
					"colNames": ["*"],
					"condition": [{
							colName: 'card_type',
							ruleType: 'in',
							value: '充值卡,面额卡'
						}, {
							colName: 'use_states',
							ruleType: 'eq',
							value: '使用中'
						},
						// {
						// 	colName: 'use_start_date',
						// 	ruleType: 'le',
						// 	value: this.dayjs().format("YYYY-MM-DD")
						// }, {
						// 	colName: 'use_end_date',
						// 	ruleType: 'ge',
						// 	value: this.dayjs().format("YYYY-MM-DD")
						// }, 
						{
							colName: 'card_last_amount',
							ruleType: 'ge',
							value: this.totalMoney
						}, {
							colName: 'useing_store_user_no',
							ruleType: 'eq',
							value: this.vstoreUser?.store_user_no
						}
					],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					},
					"query_source": "list_page"
				}
				const app = this.detailCfg?.app || uni.getStorageSync('activeApp')
				const url = this.getServiceUrl(app, serviceName, 'select');
				if(!this.totalMoney){
					return
				}
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
						this.couponList = res.data.data
					}
				})
			},
			hideModal() {
				this.modalName = ''
			},
			showSelector() {
				this.modalName = 'Selector'
			},
			pickerChange(e) {
				this.room_no = e
				this.modalName = ''
			},
			searchFKDataWithKey(e) {
				if (e && e.detail && e.detail.value) {
					let option = this.roomV2;
					if (Array.isArray(option?.conditions) && option.conditions.length > 0) {
						option.conditions = option.conditions.map(item => {
							if (item.value) {
								item.value = this.renderStr(item.value, this)
							}
							return item
						})
					}
					let relation_condition = {
						relation: 'OR',
						data: []
					};
					if (!option?.key_disp_col && !option?.refed_col) {
						return;
					}

					if (option.key_disp_col) {
						relation_condition.data.push({
							colName: option.key_disp_col,
							value: e.detail.value,
							ruleType: '[like]'
						})
					}
					if (option.refed_col) {
						relation_condition.data.push({
							colName: option.refed_col,
							value: e.detail.value,
							ruleType: '[like]'
						})
					}
					if (Array.isArray(option.conditions) && option.conditions.length > 0) {
						let data = this.deepClone(relation_condition.data)
						relation_condition = {
							relation: 'AND',
							data: [...option.conditions, {
								relation: 'OR',
								data: data
							}]
						}
					}
					this.getSelectorData(null, null, relation_condition);
				} else {
					this.getSelectorData();
				}
			},
			async getSelectorData(cond, serv, relation_condition) {
				let self = this;
				let roomV2 = {
					"refed_col": this.roomV2?.refed_col || "room_no",
					"show_as_pair": this.roomV2?.show_as_pair || false,
					"srv_app": this.roomV2?.srv_app || "store",
					"serviceName": this.roomV2?.serviceName || "srvstore_hotel_room_select",
					"conditions": [{
						"colName": "hotel_no",
						"ruleType": "eq",
						"value": this.store_no
					}],
					"key_disp_col": this.roomV2?.key_disp_col || "room_no"
				}
				let req = {
					serviceName: roomV2.serviceName,
					colNames: ['*'],
					page: {
						pageNo: this.roomPageNo,
						rownumber: 30
					}
				};

				let globalData = getApp().globalData
				let appName = roomV2.srv_app || uni.getStorageSync('activeApp');

				if (cond) {
					req.condition = cond;
				} else if (roomV2 && Array.isArray(roomV2.conditions) &&
					roomV2.conditions.length > 0) {
					let condition = self.deepClone(roomV2.conditions);
					condition = condition.map(item => {
						if (item.value && item.value.indexOf('data.') !== -1) {
							let colName = item.value.slice(item.value.indexOf('data.') + 5);
							if (fieldModelsData[colName]) {
								item.value = fieldModelsData[colName];
							}
						} else if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
							item.value = uni.getStorageSync('login_user_info').user_no;
						} else if (item.value && item.value.indexOf('globalData.') !== -1) {
							let colName = item.value.slice(item.value.indexOf('globalData.') + 10);
							if (globalData && globalData[colName]) {
								item.value = globalData[colName];
							}
						} else if (item.value && item.value.indexOf("'") === 0 && item.value.lastIndexOf(
								"'") === item.value
							.length - 1) {
							item.value = item.value.replace(/\'/gi, '');
						}
						if (item.value_exp) {
							delete item.value_exp;
						}
						return item;
					});
					if (Array.isArray(condition) && condition.length > 0) {
						req.condition = condition;
					} else {
						return;
					}
				}

				if (relation_condition && typeof relation_condition === 'object') {
					req.relation_condition = relation_condition;
					delete req.condition;
				}
				if (!req.serviceName) {
					return;
				}
				if (!appName) {
					return
				}
				let res = await self.onRequest('select', req.serviceName, req, appName);

				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {

					if (res.data.page && res.data.page.pageNo > 1) {
						let data = res.data.data;
						self.selectorData = [...self.selectorData, ...data];
					} else {
						self.selectorData = res.data.data;
					}
					self.selectorData = self.selectorData.map(item => {
						item.label = roomV2.show_as_pair === true ?
							`${item[ roomV2.key_disp_col||'' ]}/${item[ roomV2.refed_col ]}` : item[roomV2
								.key_disp_col]
						// item.label = roomV2.key_disp_col ? item[roomV2.key_disp_col] : '';
						item.value = roomV2.refed_col ? item[roomV2.refed_col] : '';
						return item;
					});
				} else if (res.data.state === 'SUCCESS' && res.data.data.length == 0) {
					self.selectorData = []
				}
			},
			updateOrderState(order_state, pay_state, prepay_id, order_no) {
				let serviceName = 'srvhealth_store_order_state_update'
				// srvhealth_store_order_update
				let req = [{
					serviceName: serviceName,
					condition: [{
						colName: 'order_no',
						ruleType: 'eq',
						value: this.orderInfo.order_no
					}],
					data: [{
						pay_state: pay_state
					}]
				}];
				if (order_state) {
					req[0].data[0].order_state = order_state
				}
				if (prepay_id) {
					req[0].data[0].prepay_id = prepay_id
				}
				this.$fetch('operate', serviceName, req, 'health').then(res => {
					// 支付成功后修改订单状态和支付状态
					this.getOrderInfo()
				});
			},
			chooseAddress() {
				if (this.orderInfo?.rcv_addr_str) {
					return
				}
				let self = this;
				// #ifdef MP-WEIXIN
				uni.chooseAddress({
					success(res) {
						self.addressInfo = res;
						self.addressInfo.phone = res.telNumber; // 手机号
						self.addressInfo.fullAddress = res.provinceName + res.cityName + res.countyName + res
							.detailInfo;
					}
				});
				// #endif
			},
			async getOrderInfo() {
				let req = {
					condition: [{
						colName: 'order_no',
						ruleType: 'in',
						value: this.orderNo
					}]
				};
				let orderInfo = await this.$fetch('select', 'srvhealth_store_order_select', req, 'health');
				if (orderInfo && orderInfo.success && orderInfo.data.length > 0) {
					this.orderInfo = orderInfo.data[0];
					this.order_remark = this.orderInfo.order_remark || ''
					if (this.orderInfo.order_state === '待支付' && this.orderInfo.pay_state === '取消支付') {
						uni.setNavigationBarTitle({
							title: '等待买家付款'
						});
					}
					let goods = await this.getGoodsList();
					return this.orderInfo;
				}
			},
			async getGoodsList() {
				let req = {
					condition: [{
						colName: 'order_no',
						ruleType: 'in',
						value: this.orderNo
					}]
				};
				let goodsList = await this.$fetch('select', 'srvhealth_store_order_goods_detail_select', req,
					'health');
				if (goodsList.success) {
					this.$set(this.orderInfo, 'goodsList', goodsList.data);
				}
			},
			async submitOrder() {
				if (this.needIdNum && !this.idNum) {
					uni.showModal({
						title: '提示',
						content: '请输入身份证号',
						showCancel: false,
						confirmText: '知道了'
					})
					return
				}
				if (this.storeInfo?.type === '酒店' && !this.room_no) {
					uni.showToast({
						title: '请选择房间号',
						icon: 'none',
						duration: 3000,
						mask: true
					})
					return
				}
				if (!this.addressInfo.fullAddress && !this.room_no && ['快递', '卖家配送'].includes(this.delivery_type) &&
					this.needAddress) {
					uni.showToast({
						title: '请先选择您的地址信息',
						icon: 'none',
						mask: true
					})
					return
				}

				if ((!this.addressInfo.telNumber || !this.addressInfo.userName) && !this.room_no && ['快递', '卖家配送']
					.includes(this.delivery_type) && this.needAddress) {
					uni.showToast({
						title: '请确认您的姓名、地址、手机号是否填写完善',
						icon: 'none',
						duration: 3000,
						mask: true
					})
					return
				}
				let req = [{
					serviceName: 'srvhealth_store_order_add',
					condition: [],
					data: [{
						store_no: this.orderInfo.store_no,
						store_name: this.orderInfo.name,
						image: this.orderInfo.image,
						type: this.orderInfo.type,
						rcv_addr_str: this.addressInfo.fullAddress,
						rcv_name: this.addressInfo.userName,
						rcv_telephone: this.addressInfo.telNumber,
						person_no: this.userInfo.no,
						person_name: this.userInfo.name,
						user_account: this.userInfo.userno,
						store_user_no: this.storeUserInfo.store_user_no,
						nick_name: this.userInfo.nick_name ? this.userInfo.nick_name.replace(
							/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : '',
						profile_url: this.userInfo.profile_url,
						user_image: this.userInfo.user_image,
						sex: this.userInfo.sex,
						user_role: this.userInfo.user_role,
						order_amount: this.totalMoney,
						order_remark: this.order_remark || '',
						pay_state: '待支付',
						order_state: '待支付',
						child_data_list: [{
							serviceName: 'srvhealth_store_order_goods_detail_add',
							condition: [],
							depend_keys: [{
								type: 'column',
								add_col: 'order_no',
								depend_key: 'order_no'
							}],
							data: this.orderInfo.goodsList.map(item => {
								let obj = {
									goods_no: item.meal_no || item.goods_no,
									goods_amount: item.car_num,
									goods_desc: item.name,
									store_no: this.orderInfo.store_no,
									sum_price: item.car_num * item.unit_price,
									unit_price: Number(item.price || item
										.unit_price)
								};
								// debugger
								if (item.child_data_list) {
									obj.child_data_list = item.child_data_list
								}
								if (item.goods_source) {
									obj.goods_source = item.goods_source
									// if (item.goods_source === '店铺SKU') {
									// 	obj.goods_no = item.sku_no
									// }
								}
								if (item.image) {
									obj.goods_image = item.image;
								}
								if (item.goods_type) {
									obj.goods_type = item.goods_type;
								}
								if (item.goods_image) {
									obj.goods_image = item.goods_image;
								}
								if (item.goods_img) {
									obj.goods_image = item.goods_img;
								}
								if (item.card_case_detail_no) {
									obj.card_case_detail_no = item.card_case_detail_no
								}
								return obj;
							})
						}]
					}]
				}];
				if (this.needIdNum && this.idNum) {
					req[0].data[0].id_num = this.idNum
				}
				if (this.room_no) {
					req[0].data[0].rcv_hotel_room_no = this.room_no
				}
				if (this.couponInfo?.card_type) {
					req[0].data[0].pay_method = this.couponInfo?.card_type
				}
				if (this.couponInfo?.card_no) {
					req[0].data[0].card_no = this.couponInfo?.card_no
				}
				if (this.couponInfo?.useing_store_user_no) {
					req[0].data[0].store_user_no = this.couponInfo?.useing_store_user_no
				}

				if (this.couponInfo?.user_image) {
					req[0].data[0].user_image = this.couponInfo?.user_image
				}
				if (this.couponInfo?.sex) {
					req[0].data[0].sex = this.couponInfo?.sex
				}
				if (this.couponInfo?.using_person) {
					req[0].data[0].person_name = this.couponInfo?.using_person
				}
				if (this.delivery_type && this.needAddress) {
					req[0].data[0].delivery_type = this.delivery_type
					// if(this.delivery_type==='当面交易'){
					// 	req[0].data[0].order_state = '已发货'
					// }
				}

				if (this.couponInfo?.card_no && this.pay_method) {
					req[0].data[0].pay_state = '已支付'
				}
				if (!this.needAddress && this.delivery_type !== '自提') {
					// 非快递非自提
					this.delivery_type = '当面交易'
					this.curDelivery = 3
					req[0].data[0].delivery_type = '当面交易'
				}

				if (this.tgNo) {
					// 团长开团编号
					req[0].data[0].regimental_dumpling_no = this.tgNo
					if (this.goodsWay === '快递') {
						req[0].data[0].delivery_type = '快递'
					} else {
						// 团长代收
						req[0].data[0].delivery_type = '自提'
					}
				}

				let res = await this.$fetch('operate', 'srvhealth_store_order_add', req, 'health')
				if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
					console.log(res.data[0]);
					this.orderNo = res.data[0].order_no;
					let childData = res.childData
					let cartGoodsList = this.orderInfo.goodsList.filter(item => !!item.cart_goods_rec_no)
					if (cartGoodsList.length > 0) {
						let ids = cartGoodsList.map(item => item.id).toString()
						if (ids) {
							this.clearOrderCartGoods(ids)
						}
					}
					const orderData = await this.getOrderInfo()
					if (!this.pay_method) {
						// 微信支付、充值卡、面额卡支付
						this.toPay();
					} else {
						// 卡券核销
						if (res.data[0].order_no) {
							// 创建核销记录
							await this.addVerRecord(res.data[0].order_no, childData)
							// .then(_ => {
							// 创建订单支付记录
							await this.addPayRecord(res.data[0].order_no, childData)
							// 更新订单状态和支付状态
							if (this.delivery_type !== '当面交易') {
								this.updateOrderState('待发货', '已支付');
							} else {
								// this.updateOrderState('', '已支付');
							}
						}
					}
				} else if (res.success == false && res.msg) {
					uni.showModal({
						title: '提示',
						content: res.msg,
						showCancel: false
					})
				}
				// });
			},
			clearOrderCartGoods(ids) {
				// 清除购物车中在订单中的商品
				let serviceName = 'srvhealth_store_shopping_cart_goods_detail_delete';
				let req = [{
					"serviceName": serviceName,
					"condition": [{
						"colName": "id",
						"ruleType": "in",
						"value": ids
					}]
				}]
				let url = this.getServiceUrl('health', serviceName, 'operate');
				this.$http.post(url, req)
			},
			async payByCoupon(orderData = {}, card_no = "") {
				// 卡券支付
				let req = [{
					"serviceName": "srvhealth_store_card_recharge_detail_add",
					"condition": [],
					"data": [{
						"bill_money": orderData.order_amount,
						bill_type: "消费",
						card_no: card_no,
						"order_no": orderData.order_no
					}]
				}]
				let url = this.getServiceUrl('health', 'srvhealth_store_card_recharge_detail_add', 'add');
				let res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS') {
					uni.showModal({
						title: '提示',
						showCancel: false,
						content: res.data.resultMessage,
						success: (res) => {
							// if(res.confirm){
							// 	uni.navigateBack({})
							// }
						}
					})
					if (this.delivery_type !== '当面交易') {
						this.updateOrderState('待发货', '已支付');
					} else {
						this.updateOrderState('', '已支付');
					}
				} else {
					uni.showModal({
						title: '提示',
						showCancel: false,
						content: res.data.resultMessage
					})
				}
			},
			async toPay() {
				// if (this.storeInfo?.wx_mch_id) {
				// 	this.wxMchId = this.storeInfo?.wx_mch_id
				// }
        this.wxMchId = this.getwxMchId()
				let self = this;
				let orderData = this.deepClone(this.orderInfo);
				let goodsData = this.deepClone(this.orderInfo.goodsList);
				let totalMoney = orderData.order_amount || this.totalMoney
				if (typeof totalMoney !== 'number' || totalMoney.toString() === 'NaN') {
					uni.showModal({
						title: '提示',
						content: '订单状态有误',
						showCancel: false
					});
					return;
				}
				if (this.payMode == 'coupon') {
					if (this.couponInfo?.card_no && orderData.order_no) {
						this.payByCoupon(orderData, this.couponInfo?.card_no)
					}
					return
				}
        
        if (Array.isArray(this.vloginUser?.roles) && this.vloginUser.roles.includes('health_admin')) {
          if (totalMoney >= 10) {
            totalMoney = totalMoney / 1000
          } else {
            totalMoney = totalMoney / 100
          }
        }
        
        
        
        
				let result = {};
        
				if (orderData.prepay_id) {
					result.prepay_id = orderData.prepay_id;
				} else {
					result = await this.toPlaceOrder(totalMoney * 100, this.loginUserInfo?.login_user_type,
						orderData, this.wxMchId);
				}
				if (result && result.prepay_id) {
					let res = await this.getPayParams(result.prepay_id, this.wxMchId);
					wx.requestPayment({
						timeStamp: res.timeStamp.toString(),
						nonceStr: res.nonceStr,
						package: res.package,
						signType: 'MD5',
						paySign: res.paySign,
						success(res) {
							// 支付成功
							self.orderInfo.order_state = '待发货';
							self.updateOrderState('待发货', '已支付', result.prepay_id);
							self.orderInfo.pay_state = '已支付';
							let webUrl =
								'https://login.100xsys.cn/health/#/storePages/successPay/successPay?order_no=' +
								orderData
								.order_no + '&totalMoney=' + self.totalMoney
							let url =
								`/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
							uni.redirectTo({
								url
							});
							// uni.redirectTo({
							//   url: '/storePages/successPay/successPay?order_no=' + orderData
							//     .order_no + '&totalMoney=' + self.totalMoney
							// });

						},
						fail(res) {
							// 支付失败/取消支付
							self.orderInfo.pay_state = '取消支付';
							self.updateOrderState('待支付', '取消支付', result.prepay_id);
						}
					});
				}
			}
		},
		onLoad(option) {
			if (option.tgNo) {
				// 团购编号
				this.tgNo = option.tgNo
				this.addressInfo.telNumber = this.userInfo?.phone || this.userInfo?.phone_xcx || ''
				this.addressInfo.userName = this.userInfo?.name || ''
			}
			if (option.goodsWay) {
				this.goodsWay = option.goodsWay
			}
			if (option.orderType) {
				this.orderType = option.orderType
			}
			if (option.wxMchId) {
				this.wxMchId = option.wxMchId
			}
			if (option.pay_method) {
				this.payMode = 'coupon'
				this.pay_method = option.pay_method
			}
			if (option.cardInfo) {
				try {
					this.couponInfo = JSON.parse(option.cardInfo)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.store_no && option.goods_info) {
				this.store_no = option.store_no
				if (this.cartInfo[option.store_no]) {
					this.orderInfo = this.cartInfo[option.store_no].storeInfo;
					option.goods_info = JSON.parse(decodeURIComponent(option.goods_info));
					if (!option.goods_info.car_num) {
						option.goods_info.car_num = 1;
					}
					this.orderInfo.goodsList = [option.goods_info];
					if (!this.orderInfo.order_state && !this.orderInfo.pay_state) {
						this.orderInfo.order_state = '待提交';
						this.orderInfo.pay_state = '待支付';
					}
				}
			} else if (option.store_no && !option.order_no) {
				// 从购物车进入 还未生成订单
				this.store_no = option.store_no
				if (this.cartInfo[option.store_no] && Array.isArray(this.cartInfo[option.store_no].cart)) {
					this.orderInfo = this.cartInfo[option.store_no].storeInfo;
					this.orderInfo.goodsList = this.cartInfo[option.store_no].cart.map(item => {
						if (!item.car_num) {
							item.car_num = 1;
						}
						return item;
					});
					this.orderInfo.order_state = '待提交';
					this.orderInfo.pay_state = '待支付';
				}
			} else if (option.order_no) {
				this.orderNo = option.order_no;
				this.getOrderInfo();
			}
			if (this?.storeInfo?.type === '酒店') {
				let room_no = getApp().globalData?.room_no
				if (room_no) {
					this.room_no = room_no
				}
				this.getSelectorData()
			}

			this.getCouponList()
		}
	};
</script>

<style lang="scss" scoped>
	.tree-selector {
		padding: 20rpx 20rpx 40rpx;
	}

	.pay-order {
		height: calc(100vh - var(--window-top));
		display: flex;
		flex-direction: column;

		.room-selector {
			padding: 20rpx 40rpx;
			line-height: 40rpx;
			font-size: 16px;
			margin-bottom: 100rpx;
			display: flex;
			justify-content: flex-end;
			align-items: center;

			.place-holder {
				color: #666;
				margin-left: 20rpx;
			}
		}

		.address-box {
			margin: 20rpx;
			margin-bottom: 0;
			padding: 20rpx;
			display: flex;
			background-color: #fff;
			border-radius: 5px;
			align-items: center;

			.left {
				height: 50px;
				width: 50px;
				text-align: center;
				line-height: 50px;
				font-size: 30px;
				background: linear-gradient(#ff9700, #ed1c24);
				color: #fff;
				border-radius: 50px;
			}

			.center {
				flex: 1;
				padding: 20rpx;

				.center-select {
					display: flex;
					align-items: center;
				}

				.name {
					line-height: 30px;
					font-size: 16px;
					margin-right: 20rpx;
					font-weight: bold;
				}
			}

			.right {
				font-size: 20px;
				color: #999;
			}
		}

		.person-info {
			// 团购用户信息
			margin: 10px;
			border-radius: 5px;
			overflow: hidden;

			.cu-form-group {
				.title {
					min-width: 80px;
				}

				input {
					text-align: right;
				}
			}
		}

		.order-detail {
			flex: 1;
			margin-top: 10px;
			overflow-y: scroll;
		}

		.order-info {
			margin: 20rpx;
			margin-top: 0;
			background-color: #fff;
			padding: 20rpx 20rpx 40rpx;
			border-radius: 5px;

			.title-bar {
				padding: 0px 0 5px;
				margin-bottom: 10px;
				border-bottom: 1px solid #f1f1f1;
			}

			.order-remark {
				background-color: #F8F8FA;
				border-radius: 5px;
				margin-top: 20rpx;

				.textarea {
					box-sizing: border-box;
					width: calc(100% - 40rpx);
					padding: 20rpx;
					height: 200rpx;
				}
			}

			.id-number-edit {
				margin-top: 20rpx;

				.cu-form-group {
					border: 1rpx solid #f1f1f1;
					min-height: 80rpx;
				}

				.remark {
					font-size: 24rpx;
					padding: 10rpx 20rpx;

				}

				.text-cyan {
					color: #0bc99d;
				}
			}

			.store-logo {
				width: 20px;
				height: 20px;
			}

			.store-name {
				font-weight: bold;
				margin-left: 10rpx;
			}

			.goods-item {
				display: flex;

				&+.goods-item {
					margin-top: 20px;
				}

				.goods-image {
					width: 100rpx;
					height: 100rpx;
					background-color: #f1f1f1;
					border-radius: 5px;
				}

				.content {
					flex: 1;
					padding: 0 20rpx;
					font-weight: bold;
				}

				.num {
					width: 100px;
					text-align: right;
					margin-bottom: 5px;

					.price {
						font-weight: bold;
						color: #f76260;
						font-size: 18px;
						margin-bottom: 5px;

						.money-operate {
							font-size: 12px;
						}
					}

					.amount {
						font-size: 12px;
						color: #999;
					}
				}
			}
		}

		.pay-mode {
			margin: 0 20rpx;
			border-radius: 5px;
			overflow: hidden;

			.pay-mode-item {
				background-color: #fff;
				// border-radius: 10rpx;
				min-height: 50px;
				padding: 5px 10px;
				display: flex;
				align-items: center;
				border-bottom: 1px solid #f1f1f1;
				justify-content: space-between;

				.coupon-info {
					text-align: right;
					margin-right: 10px;

					.amount {
						font-size: 12px;
					}
				}

				.icon {
					font-size: 18px;
					margin-right: 10px;
				}
			}

		}

		.handler-bar {
			background-color: #fff;
			height: 50px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			padding-right: 20rpx;

			.amount {
				font-size: 12px;
				color: #999;
				margin-right: 10px;
			}

			.text {
				font-weight: bold;
			}

			.money-amount {
				padding-right: 10px;
				font-size: 18px;
				color: #E95955;

				.money-operate {
					font-size: 12px;
				}
			}
		}
	}
</style>
