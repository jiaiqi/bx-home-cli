<template>
	<view class="dashboard-wrap">
		<view class="dashboard-title">
			仪表盘标题
		</view>
		<view class="chart-box">
			<view class="chart-item" v-for="item in chartList">
				<!-- #ifdef MP-WEIXIN -->
				<uni-ec-canvas class="uni-ec-charts" :canvasId="item.id"  :ec="item.option"></uni-ec-canvas>
				<!-- #endif -->
				<!-- #ifdef H5 -->
	<!-- 			<uni-echart class="uni-ec-charts" :canvasId="item.id" :ec="item.option">
				</uni-echart> -->
				<!-- #endif -->
				
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				chartOptions: [{
						id: "a",
						option: {
							option: {
								title: {
									// text: '折线图堆叠'
								},
								tooltip: {
									trigger: 'axis'
								},
								legend: {
									data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
								},
								grid: {
									left: '3%',
									right: '4%',
									bottom: '3%',
									containLabel: true
								},
								xAxis: {
									type: 'category',
									boundaryGap: false,
									data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
								},
								yAxis: {
									type: 'value'
								},
								series: [{
										name: '邮件营销',
										type: 'line',
										stack: '总量',
										data: [120, 132, 101, 134, 90, 230, 210]
									},
									{
										name: '联盟广告',
										type: 'line',
										stack: '总量',
										data: [220, 182, 191, 234, 290, 330, 310]
									},
									{
										name: '视频广告',
										type: 'line',
										stack: '总量',
										data: [150, 232, 201, 154, 190, 330, 410]
									},
									{
										name: '直接访问',
										type: 'line',
										stack: '总量',
										data: [320, 332, 301, 334, 390, 330, 320]
									},
									{
										name: '搜索引擎',
										type: 'line',
										stack: '总量',
										data: [820, 932, 901, 934, 1290, 1330, 1320]
									}
								]
							}
						}
					}, {
						id: "b",
						option: {
							option: {
								tooltip: {
									trigger: 'item'
								},
								legend: {
									top: '5%',
									left: 'center'
								},
								series: [{
									name: '访问来源',
									type: 'pie',
									radius: ['40%', '70%'],
									avoidLabelOverlap: false,
									itemStyle: {
										borderRadius: 10,
										borderColor: '#fff',
										borderWidth: 2
									},
									label: {
										show: false,
										position: 'center'
									},
									emphasis: {
										label: {
											show: true,
											fontSize: '40',
											fontWeight: 'bold'
										}
									},
									labelLine: {
										show: false
									},
									data: [{
											value: 1048,
											name: '搜索引擎'
										},
										{
											value: 735,
											name: '直接访问'
										},
										{
											value: 580,
											name: '邮件营销'
										},
										{
											value: 484,
											name: '联盟广告'
										},
										{
											value: 300,
											name: '视频广告'
										}
									]
								}]
							}
						}
					},
					{
						id: "c",
						option: {
							option: {
								title: {
									text: '浏览器占比变化',
									subtext: '纯属虚构',
									top: 10,
									left: 10
								},
								tooltip: {
									trigger: 'item'
								},
								legend: {
									type: 'scroll',
									bottom: 10,
									data: (function() {
										var list = [];
										for (var i = 1; i <= 28; i++) {
											list.push(i + 2000 + '');
										}
										return list;
									})()
								},
								visualMap: {
									top: 'middle',
									right: 10,
									color: ['red', 'yellow'],
									calculable: true
								},
								radar: {
									indicator: [{
											text: 'IE8-',
											max: 400
										},
										{
											text: 'IE9+',
											max: 400
										},
										{
											text: 'Safari',
											max: 400
										},
										{
											text: 'Firefox',
											max: 400
										},
										{
											text: 'Chrome',
											max: 400
										}
									]
								},
								series: (function() {
									var series = [];
									for (var i = 1; i <= 28; i++) {
										series.push({
											name: '浏览器（数据纯属虚构）',
											type: 'radar',
											symbol: 'none',
											lineStyle: {
												width: 1
											},
											emphasis: {
												areaStyle: {
													color: 'rgba(0,250,0,0.3)'
												}
											},
											data: [{
												value: [
													(40 - i) * 10,
													(38 - i) * 4 + 60,
													i * 5 + 10,
													i * 9,
													i * i / 2
												],
												name: i + 2000 + ''
											}]
										});
									}
									return series;
								})()
							}
						}
					},
					{
						id: 'd',
						option: {
							option: {
								// title: {
								// 	text: '漏斗图',
								// 	subtext: '纯属虚构'
								// },
								tooltip: {
									trigger: 'item',
									formatter: "{a} <br/>{b} : {c}%"
								},
								// toolbox: {
								// 	feature: {
								// 		dataView: {
								// 			readOnly: false
								// 		},
								// 		restore: {},
								// 		saveAsImage: {}
								// 	}
								// },
								legend: {
									data: ['展现', '点击', '访问', '咨询', '订单']
								},
								series: [{
										name: '预期',
										type: 'funnel',
										left: '10%',
										width: '80%',
										label: {
											formatter: '{b}预期'
										},
										labelLine: {
											show: false
										},
										itemStyle: {
											opacity: 0.7
										},
										emphasis: {
											label: {
												position: 'inside',
												formatter: '{b}预期: {c}%'
											}
										},
										data: [{
												value: 60,
												name: '访问'
											},
											{
												value: 40,
												name: '咨询'
											},
											{
												value: 20,
												name: '订单'
											},
											{
												value: 80,
												name: '点击'
											},
											{
												value: 100,
												name: '展现'
											}
										]
									},
									{
										name: '实际',
										type: 'funnel',
										left: '10%',
										width: '80%',
										maxSize: '80%',
										label: {
											position: 'inside',
											formatter: '{c}%',
											color: '#fff'
										},
										itemStyle: {
											opacity: 0.5,
											borderColor: '#fff',
											borderWidth: 2
										},
										emphasis: {
											label: {
												position: 'inside',
												formatter: '{b}实际: {c}%'
											}
										},
										data: [{
												value: 30,
												name: '访问'
											},
											{
												value: 10,
												name: '咨询'
											},
											{
												value: 5,
												name: '订单'
											},
											{
												value: 50,
												name: '点击'
											},
											{
												value: 80,
												name: '展现'
											}
										],
										// Ensure outer shape will not be over inner shape when hover.
										z: 100
									}
								]
							}
						}
					},
					{
						id:"e",
						option:{
							option: {
							    xAxis: {
							        type: 'category',
							        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
							    },
							    yAxis: {
							        type: 'value'
							    },
							    series: [{
							        data: [120, 200, 150, 80, 70, 110, 130],
							        type: 'bar'
							    }]
							}
						}
					}
				],
				chartList: []
			}
		},
		methods: {

		},
		onLoad() {
			setTimeout(()=>{
				this.chartList = this.chartOptions
			},500)
		}
	}
</script>

<style scoped lang="scss">
	.dashboard-wrap{
		background-color: #f0f0f0;
		padding: 20rpx 0 ;
	}
	.dashboard-title{
		margin:0 20rpx;
		text-align: center;
		font-size: 40rpx;
		padding: 20rpx 0 10rpx;
		background-color: #fff;
		border-radius: 20rpx;
	}
	.chart-box {
		padding: 20rpx;

		.chart-item {
			background-color: #fff;
			height: 500rpx;
			margin-bottom: 20rpx;
			border-radius: 10rpx;

			.uni-ec-charts {
				height: 100%;
			}
		}
	}
</style>
