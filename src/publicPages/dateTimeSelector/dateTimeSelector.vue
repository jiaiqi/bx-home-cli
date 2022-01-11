<template>
	<view class="page-wrap">
		<view class="calendar-box">
			<view class="date-select-box cu-btn line-blue radius" @click="showCalendar"
				:class="{'readonly':dateReadonly}">
				<view class="place-holder " v-if="!date">点击选择日期</view>
				<view class="value text-black" v-else>{{ date||'' }}</view>
				<text class="cuIcon-calendar margin-left-xs text-black"></text>
			</view>
		</view>
		<view class="main">
			<view class="time-selector">
				<view class="time-list">
					<view class="time-item" :class="{active:item.checked===true}" @tap="tapTime(item)"
						v-for="item in timeList">
						<view class="time-box">
							<view class="head">
								{{renderTemplate(item,'head')||''}}
							</view>
							<view class="content">
								{{renderTemplate(item,'content')||''}}
							</view>
							<view class="content">
								{{renderTemplate(item,'bottom')||''}}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="button-box">
			<button class="cu-btn bg-blue round xl" @click="confirm" :disabled="!isChecked">确定</button>
		</view>
		<u-calendar v-model="show" @change="changeDate" :max-date="maxDate" :min-date="minDate" :defaultDate="date">
		</u-calendar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cfg: {},
				show: true,
				date: "",
				maxDate: "",
				minDate: "",
				timeList: [],
				data: {}
			}
		},
		computed: {
			dateReadonly() {
				return this.cfg?.date_readonly == true
			},
			isChecked() {
				return this.date && this.timeList.find(item => item.checked === true)
			},
		},
		created() {
			// this.date = this.dayjs().format("YYYY-MM-DD")
			this.maxDate = this.dayjs().add(1, 'month').format("YYYY-MM-DD")
			this.minDate = this.dayjs().add(-1, 'day').format("YYYY-MM-DD")
		},
		methods: {
			confirm() {
				const data = {
					col: this.cfg.date_col,
					value: this.date,
					time: this.timeList.find(item => item.checked === true)
				}
				uni.$emit('dateTimeSelectorConfirm', data)
				uni.navigateBack()
			},
			tapTime(e) {
				const idCol = this.cfg?.range_cfg?.id_col;
				if (idCol) {
					this.timeList = this.timeList.map(item => {
						const keys = Object.keys(item);
						if (keys.length > 0) {
							let num = 0
							keys.forEach(key => {
								if (key !== 'checked' && item[key] === e[key]) {
									num++
								}
							})
							if (num === keys.length - 1) {
								item.checked = true
							} else {
								item.checked = false
							}
						}
						// if(item[idCol]&&item[idCol]===e[idCol]){
						// 	item.checked = true
						// }else{
						// 	item.checked = false
						// }
						return item
					})
				}
			},
			renderTemplate(item, key) {
				const self = this
				const globalData = {
					mainData: this.data,
					data: item,
					date: this.date,
					storeInfo: self.storeInfo,
					userInfo: self.userInfo,
					storeUser: self.vstoreUser
				}
				const temp = this.cfg?.range_cfg?.template;
				if (temp && key && temp[key]) {
					return this.renderStr(temp[key], globalData)
				}
			},
			changeDate(e) {
				console.log(e)
				this.date = e.result;
				this.getTimeRange()
			},
			showCalendar() {
				if (!this.dateReadonly) {
					this.show = true
				}else{
					uni.showToast({
						title:'不可编辑',
						icon:'none'
					})
				}
			},

			async getTimeRange() {
				const self = this
				let range_cfg = {}
				if (this.cfg?.range_cfg && typeof this.cfg?.range_cfg === 'object') {
					range_cfg = this.deepClone(this.cfg?.range_cfg)
				}
				const appName = range_cfg?.app || uni.getStorageSync('activeApp')
				const globalData = {
					data: this.data,
					date: this.date,
					storeInfo: self.storeInfo,
					userInfo: self.userInfo,
					storeUser: self.vstoreUser
				}
				let url = this.getServiceUrl(appName, range_cfg.service, 'select');
				const req = {
					"serviceName": range_cfg.service,
					"colNames": [
						"*"
					],
					"condition": []
				}
				if (Array.isArray(range_cfg.condition) && range_cfg.condition.length > 0) {
					req.condition = range_cfg.condition.map(item => {
						item.value = this.renderStr(item.value, globalData)
						if (!item.value && item.ruleType === 'eq') {
							item.ruleType = 'like'
						}
						return item
					})
				}
				const res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS') {
					this.timeList = res.data.data.map(item => {
						item.checked = false;
						return item
					})
				}
			},
		},
		onLoad(option) {

			if (option.cfg) {
				try {
					this.cfg = JSON.parse(option.cfg)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.defaultVal) {
				this.date = option.defaultVal
				this.show = false
				this.getTimeRange()
			}
			if (option.data) {
				try {
					this.data = JSON.parse(option.data)
				} catch (e) {
					//TODO handle the exception
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-wrap {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--window-top));

		.main {
			flex: 1;
			overflow-y: scroll;
		}

		.button-box {
			padding: 20px;

		}
	}

	.calendar-box {
		// width: 100%;
		display: flex;
		padding: 10px;
		// background-color: #fff;
		margin-bottom: 10px;

		.date-select-box {
			// width: 100%;
			display: flex;
			align-items: center;
			background-color: #fff;
			border-radius: 5px;
			padding: 10px 20px;
			// justify-content: flex-end;
			&.readonly{
				color: #fff;
				// opacity: 0.7;
				background-color: #fff;
				// cursor: not-allowed;
			}
		}
	}

	.time-list {
		display: flex;
		flex-wrap: wrap;
		padding-left: 10px;

		.time-item {
			width: 30%;
			// flex: 1;
			display: flex;
			justify-content: center;
			margin-right: 10px;
			margin-bottom: 10px;

			&.active {
				.time-box {
					border: 1px solid #007AFF;
				}
			}

			.time-box {
				border: 1px solid #fff;
				background-color: #fff;
				border-radius: 5px;
				padding: 5px;
			}
		}
	}

	.button-box {

		.cu-btn {
			width: 80%;
		}
	}
</style>
