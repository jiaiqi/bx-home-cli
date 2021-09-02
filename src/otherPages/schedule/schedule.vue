<template>
	<view class="course" :class="{ rotate: rotate }">
		<view class="header-selector">
			<view class="colhead-selector" v-if="timeRange.start && timeRange.end">
				<text class="cuIcon-back" @click="changeSchedule('prev')"></text>
				<text class="current-select"
					@click="selectCol">{{ getTimeExplain(timeRange.start, timeRange.end) }}</text>
				<text class="cuIcon-right" @click="changeSchedule('next')"></text>
			</view>
		</view>

		<gridTable :config="buildConfig" :table-data="buildTableData" @getQuery="getQuery" :showSummary="false"
			:showTableFilter="false"
			v-if="buildConfig&&buildConfig.length>0&&buildTableData&&buildTableData.length>0&&rowHeadList&&rowHeadList.length>0"
			:scheduleConfig="scheduleConfig" @clickItem="clickItem" />


		<view class="cu-modal" :class="{ show: showModal }" @click.stop.prevent="showModal = false"
			@touchmove.stop.prevent="clear">
			<view class="cu-dialog">
				<view class="modal-list">
					<view class="modal-title" v-if="itemData && itemData.row">
						<text class="row-head"
							:class="{ 'text-blue': scheduleConfig.row_head_key_col === 'user_no' && login_user_info.user_no === itemData['row'][scheduleConfig.row_head_key_col] }">
							{{ itemData['row'][scheduleConfig['row_head_disp_col']] }}
						</text>
						<text
							class="col-head">周{{ colHeadList[itemData['colIndex']][scheduleConfig['col_head_disp_col']] }}</text>
					</view>
					<view class="page-item" v-for="(item, index) in modalList" :key="index">
						<view class="item-title">
							<view class="left">{{ item.group }} ({{ item.data.length }}):</view>
							<text class="btn bg-blue" @click="goPage(item)">进入</text>
						</view>
						<view class="item-content">
							<view class="item-list"
								:class="{ 'border-bottom': Array.isArray(item.data) && item.data.length > 1 }"
								v-for="(task, taskIndex) in item.data" :key="taskIndex">
								{{ item.data.length > 1 ? taskIndex + 1 + '.' : '1. ' }}
								{{ task['labelText'].replace('null','') }}
								<!-- {{ task[task.scheduleConfig.schedule_col] }} -->
							</view>
							<view class="margin-left" v-if="!item.data || item.data.length === 0">无</view>
						</view>
					</view>
				</view>
				<view class="padding-sm" @tap="showModal = false" style="text-align: center;font-size: 20px;">
					<button class="cu-btn bg-red" @tap="showModal = false">关闭</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	let quertData = {}
	const dayjs = require('dayjs');
	require('dayjs/locale/zh-cn');
	dayjs.locale('zh-cn');
	const weekday = require('dayjs/plugin/weekday');
	dayjs.extend(weekday);
	// import gridItem from './schedule-item.vue';
	import gridTable from '../components/gridTable/gridTable.vue'
	import {
		formatDate,
		getMonthDays,
		getQuarterStartMonth,
		getWeekStartDate,
		getWeekEndDate,
		getLastWeekStartDate,
		getLastWeekEndDate,
		getNextWeekStartDate,
		getNextWeekEndDate,
		getMonthStartDate,
		getMonthEndDate,
		getLastMonthStartDate,
		getLastMonthEndDate,
		getQuarterStartDate,
		getQuarterEndDate
	} from '@/common/date_util.js';
	export default {
		components: {
			// gridItem,
			gridTable
		},
		data() {
			return {
				no: "",
				login_user_info: null,
				showCaledar: false,
				scheduleConfig: {},
				scheduleList: [], //
				colHeadList: [], // 列标签
				rowHeadList: [], //行标签
				rotate: false,
				rowLabelWidth: 70,
				scheduleItemList: [],
				showModal: false,
				modalList: [],
				itemData: {},
				queryCond: null
			};
		},
		computed: {
			buildConfig() {
				if (this.scheduleConfig?.row_head_disp_col && this.scheduleConfig?.col_head_disp_col) {
					let result = []
					let fistConfig = {
						label: '',
						key: this.scheduleConfig?.row_head_disp_col,
						width: 160,
						isFixed: true
					}
					result.push(fistConfig)
					if (Array.isArray(this.colHeadList) && this.colHeadList.length > 0) {
						this.colHeadList.forEach((col, index) => {
							let obj = {
								label: col[this.scheduleConfig.col_head_disp_col],
								key: this.scheduleConfig.col_head_disp_col,
								value: col[this.scheduleConfig.col_head_key_col],
								width: 100
							}

							let color = '#F2A19F'
							switch (index) {
								case 0:
									color = '#EC7063'
									break;
								case 1:
									color = '#48C9B0'
									break;
								case 2:
									color = '#58D68D'
									break;
								case 3:
									color = '#5DADE2'
									break;
								case 4:
									color = '#F4D03F'
									break;
								case 5:
									color = '#00d0aa'
									break;
								case 6:
									color = '#F2A19F'
									break;
							}
							obj['bgColor'] = color
							if (this.scheduleConfig.col_head_key_col === "calendar_date" && obj.value) {
								if (obj.value === dayjs().format('YYYY-MM-DD')) {
									obj.value = '今天'
									obj.selfBgColor = '#0bc99d'
									obj.color = '#fff'
								} else {
									obj.value = dayjs(obj.value).format('MM-DD')
								}
							}
							result.push(obj)
						})
					}
					return result
				}
			},
			buildTableData() {
				let colHeadList = this.colHeadList
				let rowHeadList = this.rowHeadList
				let scheduleItemList = this.scheduleItemList
				let config = this.scheduleConfig
				if (Array.isArray(colHeadList) && colHeadList.length > 0 && config
					?.row_head_disp_col && Array.isArray(rowHeadList) && rowHeadList.length >
					0) {
					if (Array.isArray(scheduleItemList) && scheduleItemList.length > 0) {
						let result = []
						scheduleItemList.forEach(scheduleList => {
							scheduleList.data.forEach(schedule => {
								rowHeadList.forEach((row, rowIndex) => {
									let schColVal = schedule[scheduleList.config
										.table_col_head_col]
									let rowVal = row[config.row_head_key_col]
									colHeadList.forEach((col, colIndex) => {
										schedule.scheduleConfig = scheduleList.config
										let table_row_head_col = scheduleList
											.config.table_row_head_col
										let colVal = col[config.col_head_key_col]

										let schRowVal = schedule[table_row_head_col]
										if (rowVal === schRowVal) {
											let obj = {}
											if (colVal === schColVal) {
												obj[config.row_head_disp_col] = row[config
													.row_head_disp_col]
												obj[config.row_head_key_col] = row[config
													.row_head_key_col]
												obj[col[config.col_head_disp_col]] =
													schedule
												let index = result.findIndex(item => item[
														config.row_head_key_col] ===
													row[config.row_head_key_col])
												if (index !== -1) {
													if (!result[index][col[config
															.col_head_disp_col]]) {
														result[index][col[config
															.col_head_disp_col]] = {}
														result[index][col[config
															.col_head_disp_col]][
															scheduleList.config.tag
														] = [schedule]
													} else if (result[index][col[config
															.col_head_disp_col]][
															scheduleList.config.tag
														] && Array.isArray(result[index][
															col[config
																.col_head_disp_col]
														][scheduleList.config.tag])) {
														result[index][col[config
															.col_head_disp_col]][
															scheduleList.config.tag
														].push(schedule)
													} else if (!result[index][col[config
															.col_head_disp_col]][
															scheduleList.config.tag
														]) {
														result[index][col[config
															.col_head_disp_col]][
															scheduleList.config.tag
														] = [schedule]
													}

												} else {
													obj[col[config.col_head_disp_col]] = {}
													if (obj[col[config.col_head_disp_col]][
															scheduleList.config.tag
														] &&
														Array.isArray(obj[col[config
															.col_head_disp_col]][
															scheduleList.config.tag
														])
													) {
														obj[col[config.col_head_disp_col]][
															scheduleList.config.tag
														].push(schedule)
													} else {
														obj[col[config.col_head_disp_col]][
															scheduleList.config.tag
														] = [schedule]
													}
													result.push(obj)
												}
											}
										}
									})
								})
							})
						})
						if (result.length < this.rowHeadList.length) {
							let curArr = result.map(item => item[config.row_head_key_col])
							let arr = this.rowHeadList.filter(item => !curArr.includes(item[config.row_head_key_col]))
							arr.forEach(item => {
								let obj = {
									[config.row_head_disp_col]: item[config.row_head_disp_col],
									[config.row_head_key_col]: item[config.row_head_key_col]
								}
								result.push(obj)
							})
						}
						let arr = []
						this.rowHeadList.forEach(item => {
							result.forEach(res => {
								if (res[config.row_head_key_col] === item[config.row_head_key_col]) {
									arr.push(res)
								}
							})
						})
						return arr
					}
				}
			},
			timeStart() {
				if (Array.isArray(this.colHeadList) && this.colHeadList.length > 0) {
					let startDate = '';
					this.colHeadList.forEach((item, index) => {
						if (item[this.scheduleConfig.col_head_key_col] && index === 0) {
							startDate = item[this.scheduleConfig.col_head_key_col];
						}
					});
					return startDate;
				}
			},
			timeEnd() {
				if (Array.isArray(this.colHeadList) && this.colHeadList.length > 0) {
					let endDate = '';
					this.colHeadList.forEach((item, index) => {
						if (item[this.scheduleConfig.col_head_key_col] && index === this.colHeadList.length - 1) {
							endDate = item[this.scheduleConfig.col_head_key_col];
						}
					});
					return endDate;
				}
			},
			timeRange() {
				let startDate = '';
				let endDate = '';
				if (Array.isArray(this.colHeadList) && this.colHeadList.length > 0) {
					this.colHeadList.forEach((item, index) => {
						if (item[this.scheduleConfig.col_head_key_col] && index === 0) {
							startDate = item[this.scheduleConfig.col_head_key_col];
						}
						if (item[this.scheduleConfig.col_head_key_col] && index === this.colHeadList.length - 1) {
							endDate = item[this.scheduleConfig.col_head_key_col];
						}
					});
				}
				return {
					start: startDate,
					end: endDate
				};
			}
		},
		methods: {
			getQuery(e) {
				console.log(e)
			},
			getTimeExplain(startDate, endDate) {
				const currentWeekStart = dayjs()
					.weekday(0)
					.format('YYYY-MM-DD');
				const prevWeekStart = dayjs()
					.weekday(-7)
					.format('YYYY-MM-DD');
				const nextWeekStart = dayjs()
					.weekday(7)
					.format('YYYY-MM-DD');
				switch (startDate) {
					case currentWeekStart:
						return '本周';
						break;
					case prevWeekStart:
						return '上周';
						break;
					case nextWeekStart:
						return '下周';
						break;
					default:
						return startDate + ' 至 ' + endDate;
						break;
				}
			},
			changeSchedule(operate) {
				debugger
				if (this.scheduleConfig.col_head_disp_col === 'day_of_week_cn') {
					let cond = {};
					if (operate === 'prev') {
						//向前
						cond = {
							start: dayjs(this.timeStart)
								.weekday(-7)
								.format('YYYY-MM-DD'),
							end: dayjs(this.timeStart)
								.weekday(-1)
								.format('YYYY-MM-DD')
						};
					} else if (operate === 'next') {
						//向后
						cond = {
							start: dayjs(this.timeStart)
								.weekday(7)
								.format('YYYY-MM-DD'),
							end: dayjs(this.timeStart)
								.weekday(13)
								.format('YYYY-MM-DD')
						};
					}
					if (this.no) {
						cond['no'] = this.no;
					}
					this.getScheduleConfig(cond);
				}
			},
			goPage(e) {
				let cond = [];
				let scheduleConfig = {};
				debugger
				if (e.data && e.data.length > 0) {
					scheduleConfig = e.data[0].scheduleConfig;
					cond = [{
							colName: scheduleConfig.table_col_head_col,
							ruleType: 'like',
							value: this.itemData['col'][scheduleConfig.tag][0][scheduleConfig.table_col_head_col]
						},
						{
							colName: scheduleConfig.table_row_head_col,
							ruleType: 'like',
							value: this.itemData['col'][scheduleConfig.tag][0][scheduleConfig.table_row_head_col]
						}
					];
				} else if (e.scheduleConfig) {
					scheduleConfig = e.scheduleConfig;
					cond = e.cond;
				}
				const viewTemp = {
					title: scheduleConfig.schedule_col,
					tip: scheduleConfig.table_row_head_col,
					footer: scheduleConfig.table_col_head_col
				};
				if (Array.isArray(scheduleConfig.condition) && scheduleConfig.condition.length > 0) {
					cond = [...cond, ...scheduleConfig.condition]
				}
				let url =
					`/publicPages/list/list?cond=${decodeURIComponent(JSON.stringify(cond))}&serviceName=${scheduleConfig.srv}&pageType=list&viewTemp=${decodeURIComponent(JSON.stringify(viewTemp))}&destApp=${scheduleConfig.app}`
				if (scheduleConfig.page_type && scheduleConfig.page_type === 'proc') {
					url =
						`/publicPages/list/list?cond=${decodeURIComponent(JSON.stringify(cond))}&serviceName=${	scheduleConfig.srv}&pageType=proc&viewTemp=${decodeURIComponent(JSON.stringify(viewTemp))}&destApp=${scheduleConfig.app}`
				}
				if (scheduleConfig.dest_page) {
					if (Array.isArray(scheduleConfig?.custom_condition) && scheduleConfig.custom_condition.length > 0) {
						let custom_condition = this.deepClone(scheduleConfig.custom_condition)
						let data = {}
						if (e.data && e.data.length > 0) {
							data = e.data[0]
						} else if (e.cond && e.cond.length > 0) {
							data = e.cond.reduce((res, cur) => {
								res[cur.colName] = cur.value
								return res
							}, {})
						}
						data = {...quertData,...data}
						cond = custom_condition.map(cond => {
							cond.value = this.renderStr(cond.value, data)
							return cond
						})
					}
					url = `${scheduleConfig.dest_page}&serviceName=${scheduleConfig.srv}&cond=${JSON.stringify(cond)}`
					if (scheduleConfig?.dest_page_srv) {
						url =
							`${scheduleConfig.dest_page}&serviceName=${scheduleConfig.dest_page_srv}&cond=${JSON.stringify(cond)}`
					}

				}
				if (scheduleConfig.dest_column) {
					url += `&columns=${scheduleConfig.dest_column}`
				}
				uni.navigateTo({
					url
				})
			},
			clickItem(col, row, colIndex, rowIndex) {
				let arr = [];
				const self = this;
				row = this.rowHeadList[rowIndex]
				if (col && typeof col === 'object' && Object.keys(col).length > 0) {
					Object.keys(col).forEach(item => {
						let columnData = col[item];
						if (col[item] && Array.isArray(col[item])) {
							col[item].forEach(column => {
								let config = column.scheduleConfig;
								let str = '';
								config.disp_info.forEach(disp => {
									if (typeof disp === 'string') {
										str += disp;
									} else if (typeof disp === 'object' && disp.srv_col_val) {
										let val = column[disp.srv_col_val] || ''
										if (disp.format && ['date', 'time', 'dateTime', 'timeDate']
											.includes(disp.type)) {
											if (disp.type == 'time') {
												val = dayjs().format('YYYY-MM-DD ') + val
											}
											val = dayjs(val).format(disp.format)
										}
										str += val;
									}
								});
								column['labelText'] = str;
							});
						}
						arr.push({
							group: item,
							data: col[item]
						});
					});
					let colData = this.colHeadList[colIndex];
					this.scheduleItemList.forEach(item => {
						let group = arr.map(item => item.group);
						if (!group.includes(item.config.tag)) {
							let cond = [{
									colName: item.config.table_col_head_col,
									ruleType: 'like',
									value: colData[self.scheduleConfig.col_head_key_col]
								},
								{
									colName: item.config.table_row_head_col,
									ruleType: 'like',
									value: row[self.scheduleConfig.row_head_key_col]
								}
							];
							arr.push({
								group: item.config.tag,
								data: [],
								scheduleConfig: item.config,
								cond: cond
							});
						}
					});
					this.modalList = arr;
					this.itemData = {
						col,
						row,
						colIndex,
						rowIndex
					};
					this.showModal = true;
				} else {
					let colData = this.colHeadList[colIndex];
					let arr = [];
					this.scheduleItemList.forEach(item => {
						let cond = [{
								colName: item.config.table_col_head_col,
								ruleType: 'like',
								value: colData[self.scheduleConfig.col_head_key_col]
							},
							{
								colName: item.config.table_row_head_col,
								ruleType: 'like',
								value: row[self.scheduleConfig.row_head_key_col]
							}
						];
						arr.push({
							group: item.config.tag,
							data: [],
							scheduleConfig: item.config,
							cond: cond
						});
					});
					this.modalList = arr;
					this.showModal = true;
				}
				uni.setStorageSync('activeApp', this.scheduleConfig.app);
				const serviceName = this.scheduleConfig.table.replace('bx', 'srv') + '_select';
				const viewTemp = {
					title: this.scheduleConfig.schedule_col,
					tip: this.scheduleConfig.table_row_head_col,
					footer: this.scheduleConfig.table_col_head_col
				};
				return;
				let cond = [];
				if (col && Array.isArray(col) && col.length > 0) {
					console.log(e, 'clickRow');
					cond = [{
							colName: this.scheduleConfig.table_col_head_col,
							ruleType: 'like',
							value: e[0][this.scheduleConfig.table_col_head_col]
						},
						{
							colName: this.scheduleConfig.table_row_head_col,
							ruleType: 'like',
							value: e[0][this.scheduleConfig.table_row_head_col]
						}
					];
					uni.navigateTo({
						url: '/pages/public/list/list?cond=' +
							decodeURIComponent(JSON.stringify(cond)) +
							'&serviceName=' +
							serviceName +
							'&pageType=list&viewTemp=' +
							decodeURIComponent(JSON.stringify(viewTemp))
					});
				} else {
					const colValue = this.colHeadList[colIndex][this.scheduleConfig['col_head_key_col']];
					const rowValue = this.rowHeadList[rowIndex][this.scheduleConfig['row_head_key_col']];
					if (colValue && rowValue) {
						cond = [{
								colName: this.scheduleConfig.table_col_head_col,
								ruleType: 'like',
								value: colValue
							},
							{
								colName: this.scheduleConfig.table_row_head_col,
								ruleType: 'like',
								value: rowValue
							}
						];
						const serviceName = this.scheduleConfig.table.replace('bx', 'srv') + '_add';
						uni.navigateTo({
							url: '/pages/public/formPage/formPage?serviceName=' + serviceName + '&type=add&cond=' +
								decodeURIComponent(JSON.stringify(cond))
						});
					} else {
						uni.showToast({
							title: '数据异常,请刷新后再进行操作',
							icon: 'none'
						});
						return;
					}
				}
			},
			selectCol() {
				uni.showToast({
					icon: 'none',
					title: `${this.timeStart}~${this.timeEnd}`
				});
			},
			change({
				choiceDate,
				dayCount
			}) {
				console.log(choiceDate, dayCount);
			},
			changePopup(e) {},
			async getScheduleConfig(cond = {
				start: '',
				end: '',
				no: ''
			}) {
				// 获取排程配置数据
				const self = this;
				const url = this.getServiceUrl('daq', 'srvdaq_schedule_cfg_select', 'select');
				const req = {
					serviceName: 'srvdaq_schedule_cfg_select',
					colNames: ['*'],
					condition: [],
					order: []
				};
				if (cond && cond.no) {
					req.condition = [{
						colName: 'no',
						value: cond.no,
						ruleType: 'eq'
					}];
				}
				const res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
					this.scheduleConfig = res.data.data[0];
					if (this.scheduleConfig?.name) {
						uni.setNavigationBarTitle({
							title: this.scheduleConfig.name
						})
					}
					const scheduleItemList = await this.getScheduleItemList(cond)
					let rowHeadList = []
					// 获取行标签字段列表
					if (this.scheduleConfig?.row_head_type === '排程结果字段' && this.scheduleConfig?.row_head_sc_col) {
						if (Array.isArray(scheduleItemList) && scheduleItemList.length > 0) {
							const maxLengthData = scheduleItemList.reduce((res, cur) => {
								const data = cur.data
								if (Array.isArray(data) && data.find(item => item[this.scheduleConfig
										.row_head_sc_col])) {
									if (res.length === 0) {
										res = data
									}
								}
								return res
							}, [])
							const data = this.deepClone(maxLengthData)
							let arr = []
							if (data.length > 0) {
								data.forEach(item => {
									if (!arr.find(a => a[this.scheduleConfig.row_head_key_col] === item[this
											.scheduleConfig.row_head_key_col])) {
										arr.push(item)
									}
								})
							}
							rowHeadList = arr.map(item => {
								item[this.scheduleConfig.row_head_disp_col] = item[this.scheduleConfig
									.row_head_sc_col]
								return item
							})
							// }
						}
					} else {
						rowHeadList = await this.getRowHead()
					}
					// rowHeadList = await this.getRowHead()

					rowHeadList.forEach((row, rowIndex) => {
						row['rowDataList'] = [];
						row['newRowDataList'] = [];
						row['rowDataList'].length = 7;
						row['newRowDataList'].length = 7;
					});

					const colHeadList = await self.getColHead(cond)
					// colHeadList.forEach((col, colIndex) => {
					// 	scheduleItemList.forEach(scheduleList => {
					// 		scheduleList.data.forEach(schedule => {
					// 			rowHeadList.forEach((row, rowIndex) => {
					// 				if (col[self.scheduleConfig.col_head_key_col] ===
					// 					schedule[scheduleList.config
					// 						.table_col_head_col] && row[self
					// 						.scheduleConfig.row_head_key_col] ===
					// 					schedule[scheduleList.config
					// 						.table_row_head_col]) {
					// 					let newObj = row['newRowDataList'][colIndex] ||
					// 					{};
					// 					// schedule.scheduleConfig = scheduleList.config;
					// 					// if (newObj[scheduleList.config.tag] && Array
					// 					// 	.isArray(newObj[scheduleList.config.tag])
					// 					// ) {
					// 					// 	newObj[scheduleList.config.tag].push(
					// 					// 		schedule)
					// 					// } else {
					// 					// 	newObj[scheduleList.config.tag] = [
					// 					// 		schedule
					// 					// 	]
					// 					// }
					// 					// row['newRowDataList'][colIndex] = newObj;
					// 					// if (row['rowDataListCol']) {
					// 					// 	row['rowDataListCol'] = row[
					// 					// 		'rowDataListCol'].concat(Object
					// 					// 		.keys(newObj))
					// 					// } else {
					// 					// 	row['rowDataListCol'] = Object.keys(
					// 					// 		newObj);
					// 					// }
					// 					// row['rowDataListCol'] = Array.from(new Set(row[
					// 					// 	'rowDataListCol']));
					// 				}
					// 				// self.$set(self.rowHeadList, rowIndex, row);
					// 			});
					// 		});
					// 	});
					// });
					self.rowHeadList = rowHeadList
					// });
					// });
					// });
				}
			},
			async getScheduleItemList(cond) {
				cond = cond || {
					start: '',
					end: '',
					no: ''
				}
				const scheduleConfig = this.deepClone(this.scheduleConfig);
				let schedule_item_cfg = scheduleConfig.schedule_item_cfg;
				if (schedule_item_cfg && typeof schedule_item_cfg === 'string') {
					schedule_item_cfg = JSON.parse(schedule_item_cfg);
				}
				let scheduleItemList = [];
				let weekStart = getWeekStartDate();
				let weekEnd = getWeekEndDate();
				if (schedule_item_cfg && Array.isArray(schedule_item_cfg)) {
					for (let i of schedule_item_cfg) {
						const url = this.getServiceUrl(i['app'], i['srv'], 'select');
						const req = req = {
							serviceName: i['srv'],
							colNames: ['*'],
							condition: [{
								colName: i['table_col_head_col'],
								ruleType: 'between',
								value: [cond.start || weekStart, cond.end ||
									weekEnd
								]
							}]
						}
						if (Array.isArray(i['condition']) && i['condition'].length > 0) {
							i['condition'].forEach(cond => {
								const data = quertData;
								cond.value = this.renderStr(cond.value, data)
								if (cond.value === 'undefined') {
									cond.value = null
								}
								req['condition'].push(cond)
							})
						}
						req.condition = req.condition.filter(item => {
							if (item.ruleType === 'eq') {
								return item.value
							} else {
								return true
							}
						})
						const res = await this.$http.post(url, req);
						if (res.data.state === 'SUCCESS') {
							scheduleItemList.push({
								config: i,
								data: res.data.data
							});
						}
					}
				}
				this.scheduleItemList = scheduleItemList;
				return scheduleItemList;
			},
			async getScheduleList(cond) {
				cond = cond || {
					start: '',
					end: '',
					no: ''
				}
				const scheduleConfig = this.scheduleConfig;
				let serviceName = '';
				if (scheduleConfig.table) {
					serviceName = scheduleConfig.table.replace('bx', 'srv') + '_select';
					console.log('serviceName', serviceName);
					const url = this.getServiceUrl(scheduleConfig.app, serviceName, 'select');
					let weekStart = getWeekStartDate();
					let weekEnd = getWeekEndDate();
					const req = {
						serviceName: serviceName,
						colNames: ['*'],
						condition: [{
							colName: this.scheduleConfig.table_col_head_col,
							ruleType: 'between',
							value: [cond.start || weekStart, cond.end || weekEnd]
						}],
						order: []
					};
					const res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS') {
						console.log('aaa', res.data.data);
						this.scheduleList = res.data.data;
						return res.data.data;
					}
				}
			},
			async getColHead(cond) {
				cond = cond || {
					start: '',
					end: '',
					no: ''
				}
				const scheduleConfig = this.scheduleConfig;
				const url = this.getServiceUrl(scheduleConfig.col_head_app, scheduleConfig.col_head_service, 'select');
				let weekStart = getWeekStartDate();
				let weekEnd = getWeekEndDate();
				const req = {
					serviceName: scheduleConfig.col_head_service,
					colNames: ['*'],
					condition: [{
						colName: this.scheduleConfig.col_head_key_col,
						ruleType: 'between',
						value: [cond.start || weekStart, cond.end || weekEnd]
					}],
					order: []
				};

				const res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					let list = res.data.data.map(item => item[scheduleConfig.col_head_disp_col]);
					this.colHeadList = res.data.data;
					console.log('bbb', res.data.data, list);
					return res.data.data;
				}
			},
			async getRowHead(rowHead) {
				const scheduleConfig = this.scheduleConfig;
				const url = this.getServiceUrl(scheduleConfig.row_head_app, scheduleConfig.row_head_service, 'select');
				const req = {
					serviceName: scheduleConfig.row_head_service,
					colNames: ['*']
				};
				if (this.scheduleConfig.row_head_srv_cond) {
					let cond = this.scheduleConfig.row_head_srv_cond;
					if (typeof cond === 'string') {
						cond = JSON.parse(cond);
					}
					req.condition = cond;
					//   req.condition = JSON.parse(this.scheduleConfig.row_head_srv_cond);
				}
				const res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					// let list = res.data.data.map(item => item[scheduleConfig.col_head_disp_col]);
					// list = [...new Set(list)];
					// this.rowHeadList = res.data.data;
					return res.data.data;
					// return this.rowHeadList;
				}
			},
			clear(e) {
				// TODO nvue 取消冒泡
				e.stopPropagation();
			}
		},
		watch: {
			scheduleConfig: {
				deep: true,
				handler(newValue, oldValue) {
					if (newValue.schedule_item_cfg && typeof newValue.schedule_item_cfg === 'string') {
						this.scheduleConfig.schedule_item_cfg = JSON.parse(newValue.schedule_item_cfg);
					}
					if (newValue.row_head_srv_cond && typeof newValue.row_head_srv_cond === 'string') {
						this.scheduleConfig.row_head_srv_cond = JSON.parse(newValue.row_head_srv_cond);
					}
				}
			},
			rowHeadList: {
				deep: true,
				handler(newValue, oldValue) {}
			}
		},
		mounted() {
			if (uni.getStorageSync('login_user_info')) {
				this.login_user_info = uni.getStorageSync('login_user_info');
			}
		},
		onLoad(option) {
			quertData = option
			if (option.cond) {
				try {
					let cond = JSON.parse(option.cond)
					if (Array.isArray(cond)) {
						this.queryCond = cond
					} else if (typeof cond === 'object' && Object.keys(cond).length > 0) {
						let arr = []
						Object.keys(cond).forEach(key => {
							let obj = {
								colName: key,
								ruleType: 'eq',
								value: cond[key]
							}
							arr.push(obj)
						})
						this.queryCond = arr
					}
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.no) {
				this.no = option.no
				this.getScheduleConfig({
					no: option.no
				});
			} else {
				this.getScheduleConfig();
			}
		},
	};
</script>

<style lang="scss">
	.rotate {
		transform: rotate(90deg);
	}

	.cu-dialog {
		// width: 96%;
		height: auto;
		// left: 2%;
		min-height: 500upx;
		background-color: #fff;

		.modal-list {
			display: flex;
			padding: 0 20upx 20upx;
			flex-direction: column;

			.modal-title {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 30upx;
				height: 60upx;

				.col-head {
					margin: 0 20upx;
				}
			}

			.page-item {
				padding: 20upx 0 10upx;

				.item-title {
					color: #333;
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 10upx;
					letter-spacing: 2upx;

					.left {
						display: flex;
						align-items: center;
						border-left: 3px solid #e54d42;
						text-indent: 20upx;
						font-weight: 600;
						color: #666;
					}

					.btn {
						margin-top: 5upx;
						padding: 10upx 10upx 10upx 20upx;
						letter-spacing: 10upx;
						border-radius: 10upx;
					}
				}

				.item-content {
					padding-left: 40upx;
					font-size: 32upx;

					.item-list {
						text-align: left;
						padding-bottom: 10upx;
						line-height: 60upx;
					}

					.item-list.border-bottom {
						&:last-child {
							border: none;
						}
					}
				}
			}
		}
	}

	.header-selector {
		font-size: 32upx;
		line-height: 80upx;
		text-align: center;
		background-color: #0bc99d;
		color: #fff;
		display: flex;
		justify-content: center;
		position: fixed;
		top: var(--window-top);
		width: 100%;
		max-width: 1000px;
		z-index: 1;

		.colhead-selector {
			min-width: 80%;
			display: flex;
			justify-content: space-around;

			.current-select {
				display: inline-block;
				margin: 0 10upx;
				min-width: 100upx;
				text-align: center;
			}
		}

	}

	.course-wrap {
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
		min-height: 100vh;
		padding-top: 80upx;
		// max-height: 100vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: #fff;

		.header {
			font-size: 32upx;
			line-height: 80upx;
			text-align: center;
			background-color: #2980b9;
			color: #fff;
			display: flex;
			justify-content: center;
			position: fixed;
			top: var(--window-top);
			width: 100%;
			max-width: 1000px;

			.colhead-selector {
				min-width: 80%;
				display: flex;
				justify-content: space-around;

				.current-select {
					display: inline-block;
					margin: 0 10upx;
					min-width: 100upx;
					text-align: center;
				}
			}
		}

		.week {
			display: flex;
			background-color: #2980b9;
			color: #efefef;

			.week-item {
				min-width: 150upx;
				width: 150upx;
				flex: 1;
				height: 40upx;
				text-align: center;
				background-color: #2980b9;
			}
		}

		.course {
			display: flex;
			background-color: #fff;
			// overflow: scroll;
			// flex-direction: column;
			margin-bottom: 20upx;

			.time-area {
				display: flex;
				flex-direction: column;

				.week {
					margin: 0;
					padding: 0;
					height: 40upx;
					margin-bottom: 10upx;
				}

				.time-item {
					height: 200upx;
					margin-bottom: 2px;
					display: flex;
					flex-direction: column;
					text-align: center;
					justify-content: center;

					.index {
						font-size: 30upx;
						line-height: 40upx;
					}

					.time {
						overflow: hidden;
						writing-mode: vertical-rl;
						display: flex;
						align-items: center;
						justify-content: space-between;
						letter-spacing: 5px;
					}
				}
			}

			.course-area {
				flex: 1;
				overflow: scroll;

				// padding-top: 25px;
				.week {
					margin-bottom: 10upx;
					// position: fixed;
					// top: 40px;
				}
			}

			.course-row {
				display: flex;
				width: 15 0%;
				flex: 1;

				.course-row-item {
					overflow-y: scroll;
					box-sizing: border-box;
					min-width: calc(150upx - 2px);
					font-size: 20upx;
					height: 200upx;
					margin-left: 2px;
					margin-bottom: 2px;
					padding: 5px;
					// background-color: rgba($color: #e64340, $alpha: 0.5);
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					color: #fff;
					flex: 1;

					// &:first-child {
					// 	background-color: #EC7063;
					// 	// background-color: rgba($color: #e74c3c, $alpha: 0.8);
					// }
					&:nth-child(1) {
						background-color: #EC7063;
					}


					&:nth-child(2) {
						background-color: #48C9B0;
						// background-color: rgba($color: #1abc9c, $alpha: 0.8);
					}

					&:nth-child(3) {
						background-color: #58D68D;
						// background-color: rgba($color: #2ecc71, $alpha: 0.8);
					}

					&:nth-child(4) {
						background-color: #5DADE2;
						// background-color: rgba($color: #3498db, $alpha: 0.8);
					}

					&:nth-child(5) {
						background-color: #F4D03F;
						// background-color: rgba($color: #f1c40f, $alpha: 0.8);
					}

					&:nth-child(6) {
						background-color: #00d0aa;
						// background-color: rgba($color: #00d0aa, $alpha: 0.8);
					}

					&:nth-child(7) {
						background-color: #F2A19F;
						// background-color: rgba($color: #00b294, $alpha: 0.8);
					}

					&.no-bg {
						background-color: #F0F0F0;
						// background-color: rgba($color: #efefef, $alpha: 0.5);
						// border: 1px dashed #efefef;
						// color: rgba($color: #333, $alpha: 0.5);
						color: #666;
						display: flex;
						justify-content: center;
						align-items: center;
					}
				}
			}
		}
	}
</style>
