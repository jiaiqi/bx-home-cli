<template>
	<view class="page-wrap">
		<view class="calendar-box" v-if="dateList.length>0">
			<!-- 	<view class="date-select-box cu-btn line-blue radius" @click="showCalendar"
				:class="{'readonly':dateReadonly}">
				<view class="place-holder " v-if="!date">点击选择日期</view>
				<view class="value text-black" v-else>{{ date||'' }}</view>
				<text class="cuIcon-calendar margin-left-xs text-black"></text>
			</view> -->
			<view class="">
				选择日期
			</view>
			<view class="date-box">
			<!-- 	<view class="handler-icon" style="transform: rotate(180deg);margin: 5px;" @click="changeLeft(-100)">
					<text class="cuIcon-right"></text>
				</view> -->
				<scroll-view scroll-x="true" class="scroll-view_H" :scroll-left="scrollLeft" 
					:scroll-with-animation="true" @scrolltolower="scrolltolower" @scrolltoupper="scrolltoupper">
					<view class="date-item" :class="{active:date==item.month_day}" :id="index+'aaa'"
						v-for="(item,index) in dateList" :key="index" @click="selectDate(item.month_day)">
						{{item.month_day}}({{week2CN(item.day_week)}})
					</view>
				</scroll-view>
			<!-- 	<view class="handler-icon" style="margin-left: 5px;" @click="changeLeft(100)">
					<text class="cuIcon-right"></text>
				</view> -->
			</view>
		</view>
		<view class="main">
			<view class="time-selector">
				<view class="" style="padding-left: 10px;margin-bottom: 10px;" v-if="timeList.length>0">
					选择时间段
				</view>
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
				show: false,
				date: "",
				maxDate: "",
				minDate: "",
				timeList: [],
				data: {},
				dateList: [],
				scrollLeft: 0,
				scrolId: '',
				isLower:false
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
			num2Str(e){
				return ''+e
			},
			scrolltoupper(e) {
				console.log('scrolltoupper', e)
			},
			scrolltolower(e) {
				console.log('scrolltolower', e)
				debugger
				this.isLower = true
			},
			changeLeft(num = 0) {
				if(num<0){
					this.isLower = false
				}
				if(this.isLower){
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
					this.date = e
					this.getTimeRange()
				} else {
					uni.showToast({
						title: '不可编辑',
						icon: 'none'
					})
				}

			},
			week2CN(e) {
				let weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				if ([0, 1, 2, 3, 4, 5, 6].indexOf(e) > -1) {
					return weekMap[e]
				}
				return ''
			},
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
						if (item.colName === 'app_date') {
							item.value = `2022-${item.value}`
						}
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
		padding: 10px;
		// background-color: #fff;
		margin-bottom: 10px;
		// flex-wrap: wrap;
		// overflow-y: scroll;
		overflow: hidden;



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
				width: calc(100% - 60px);
				// flex:1;
			}
		}

		.date-item {
			margin: 0 10px 0 0;
			padding: 10px;
			background-color: #d2e6f8;
			color: #63bccc;
			border-radius: 10px;
			display: inline-block;

			&.active {
				color: #fff;
				background-color: #63bccc;
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
			color: #63bccc;

			&:nth-child(3n) {
				margin-right: 0;
			}

			&.active {
				.time-box {
					background-color: #62bdcd;
					color: #fff;
					// border: 1px solid #007AFF;
				}
			}

			.time-box {
				// border: 1px solid #fff;
				// background-color: #fff;
				background-color: #d2e6f8;
				border-radius: 5px;
				padding: 10px;
				width: 100%;

			}
		}
	}

	.button-box {

		.cu-btn {
			width: 80%;
			background-color: #63bccc;
		}
	}
</style>
