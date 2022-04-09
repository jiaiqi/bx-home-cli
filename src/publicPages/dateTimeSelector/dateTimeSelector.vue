<template>
	<view class="page-wrap">
		<view class="calendar-box" v-if="dateList.length>0">
			<view class="date-box">
				<scroll-view scroll-x="true" class="scroll-view_H" :class="{'full':fullDate}" :scroll-left="scrollLeft"
					:scroll-with-animation="true" @scrolltolower="scrolltolower" @scrolltoupper="scrolltoupper"
					v-if="cfg&&cfg.disp_date_col&&cfg.week_col&&cfg.val_date_col">
					<view class="date-item" :class="{active:date==item[cfg.val_date_col]}" :id="item[cfg.val_date_col]"
						v-for="(item,index) in dateList" :key="index" @click="selectDate(item)">
						<view>{{week2CN(item[cfg.week_col],item)}}</view>
						<view>{{item[cfg.disp_date_col]||''}}
						</view>
					</view>
				</scroll-view>
				<scroll-view scroll-x="true" class="scroll-view_H" :class="{'full':fullDate}" :scroll-left="scrollLeft"
					:scroll-with-animation="true" @scrolltolower="scrolltolower" @scrolltoupper="scrolltoupper" v-else>
					<view class="date-item" :class="{active:date==item.month_day}" :id="item.month_day"
						v-for="(item,index) in dateList" :key="index" @click="selectDate(item)">
						<view class="">
							{{week2CN(item.day_week,item)}}
						</view>
						<view>{{item.month_day}}</view>

					</view>
				</scroll-view>
			</view>
		</view>
		<view class="main">
			<view class="time-selector">
				<!-- 	<view class="" style="padding-left: 10px;margin-bottom:5px;" v-if="timeList.length>0">
					选择时间段
				</view> -->
				<view class="time-list">
					<view class="time-item" :class="{active:item.checked===true}" @tap="tapTime(item)"
						v-for="(item,index) in timeList" :key="index">
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
							<text class="cuIcon-roundcheckfill checked-icon" v-if="item.checked===true"></text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="button-box">
			<button class="cu-btn bg-blue round xl" @click="confirm" :disabled="!isChecked">确定</button>
		</view>
		<!-- 		<u-calendar v-model="show" @change="changeDate" :max-date="maxDate" :min-date="minDate" :defaultDate="date">
		</u-calendar> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cfg: {},
				show: false,
				date: "",
				maxDate: "",
				minDate: "",
				timeList: [],
				data: {},
				dateList: [],
				scrollLeft: 0,
				scrolId: '',
				isLower: false,
				fullDate: false,
				selectedDate: {},
				selectedTime: {}
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
			this.minDate = this.dayjs().format("YYYY-MM-DD")
		},
		methods: {
			num2Str(e) {
				return '' + e
			},
			scrolltoupper(e) {
				console.log('scrolltoupper', e)
			},
			scrolltolower(e) {
				console.log('scrolltolower', e)
				this.isLower = true
			},
			changeLeft(num = 0) {
				// this.fullDate = true
				// return 
				if (num < 0) {
					this.isLower = false
				}
				if (this.isLower) {
					return
				}
				let scrollLeft = this.scrollLeft + num
				if (scrollLeft < 0) {
					scrollLeft = 0
				}

				this.scrollLeft = scrollLeft
			},
			selectDate(e) {
				if (!this.dateReadonly) {
					this.selectedDate = e
					this.date = e?.month_day
					if (this.cfg?.val_date_col) {
						this.date = e[this.cfg?.val_date_col]
					}
					this.getTimeRange()
				} else {
					uni.showToast({
						title: '不可编辑',
						icon: 'none'
					})
				}

			},
			week2CN(day, e) {
				let weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				if ([0, 1, 2, 3, 4, 5, 6].indexOf(day) > -1) {
					if (e?.year_month_day === this.dayjs().format('YYYY-MM-DD')) {
						return '今天'
					}
					return weekMap[day]
				}
				return ''
			},
			confirm() {
				let data = {
					col: this.cfg.date_col,
					value: this.selectedDate?.year_month_day,
					time: this.timeList.find(item => item.checked === true)
				}
				if (this.cfg?.val_date_col && this.selectedDate && this.selectedDate[this.cfg?.val_date_col]) {
					data.value = this.selectedDate[this.cfg?.val_date_col]
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
				} else {
					uni.showToast({
						title: '不可编辑',
						icon: 'none'
					})
				}
			},
			async getDateList() {
				const appName = this.cfg?.app || uni.getStorageSync('activeApp')
				const serviceName = this.cfg?.service;
				const req = {
					"serviceName": serviceName,
					"colNames": [
						"*"
					],
					"condition": []
				}
				let url = this.getServiceUrl(appName, serviceName, 'select');
				const res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS') {
					this.dateList = res.data.data
					if (res.data.data.length > 0) {
						this.selectDate(res.data.data[0])
					}
					// .map(item => {
					// 	item.checked = false;
					// 	return item
					// })
				}
			},
			async getTimeRange() {
				const self = this
				let range_cfg = {}
				if (this.cfg?.range_cfg && typeof this.cfg?.range_cfg === 'object') {
					range_cfg = this.deepClone(this.cfg?.range_cfg)
				}
				const appName = range_cfg?.app || uni.getStorageSync('activeApp')
				let globalData = {
					data: this.data,
					date: this.selectedDate?.year_month_day,
					storeInfo: self.storeInfo,
					userInfo: self.userInfo,
					storeUser: self.vstoreUser
				}
				if (this.cfg?.val_date_col && this.selectedDate) {
					globalData.date = this.selectedDate[this.cfg?.val_date_col]
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
						// if (item.colName === 'app_date') {
						// 	item.value = `2022-${item.value}`
						// }
						return item
					})
				}
				const res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS') {
					if (res.data.data.length === 0) {
						this.timeList = [];
						if (range_cfg?.warningtext) {
							uni.showToast({
								title: range_cfg?.warningtext,
								icon: 'none'
							})
						}
					}
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
			if (this.cfg?.service) {
				this.getDateList()
			}
			if (option.defaultVal) {
				this.date = option.defaultVal
				// this.show = false
				// this.getTimeRange()
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
		background-color: #fff;
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
		width: 100%;
		// display: flex;
		padding: 10px 10px 0;
		padding-right: 0;
		// background-color: #fff;
		margin-bottom: 10px;
		// flex-wrap: wrap;
		// overflow-y: scroll;
		overflow: hidden;
		box-shadow: 0px 3px 6px rgba(216, 217, 223, 0.26);


		.date-box {
			// width: 100%;
			// overflow-x: auto;
			// overflow-y: hidden;
			display: flex;
			align-items: center;

			.handler-icon {
				display: flex;
				align-items: center;
				width: 30px;
				text-align: center;
				height: 40px;
				justify-content: center;
				background-color: #fff;
				border-radius: 5px;

				&:first-child {
					margin-right: 5px;
				}

				&:last-child {
					margin-left: 5px;
				}

			}

			.scroll-view_H {
				white-space: nowrap;
				width: 100%;

				&.full {
					white-space: inherit;
				}

				// width: calc(100% - 60px);
				// flex:1;
			}
		}

		.date-item {
			margin: 0;
			padding: 10px;
			display: inline-block;
			text-align: center;

			&.active {
				position: relative;

				&::after {
					position: absolute;
					content: '';
					width: 80%;
					left: 10%;
					height: 3px;
					background-color: #3ACBC6;
					bottom: 0;
				}

				// border-bottom: 2px solid #63bccc;
				// background-color: #63bccc;
			}
		}

		.date-select-box {
			// width: 100%;
			display: flex;
			align-items: center;
			background-color: #fff;
			border-radius: 5px;
			padding: 10px 20px;

			// justify-content: flex-end;
			&.readonly {
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
			background-color: #F6F6F8;
			position: relative;
			border-radius: 10px;
			.checked-icon{
				color: #3ACBC6;
				font-size: 25px;
				position: absolute;
				right: -2px;
				bottom: -2px;
			}
			&:nth-child(3n) {
				margin-right: 0;
			}

			&.active {
				.time-box {
					background: rgba(58, 203, 198, 0.1);
					border: 1px solid #3ACBC6;
					// border: 1px solid #007AFF;
				}
			}

			.time-box {
				// border: 1px solid #fff;
				// background-color: #fff;
				border-radius: 10px;
				border: 1px solid #f6f6f8;
				padding: 10px;
				width: 100%;

			}
		}
	}

	.button-box {

		.cu-btn {
			width: 80%;
			background-color: #3ACBC6;
		}
	}
</style>
