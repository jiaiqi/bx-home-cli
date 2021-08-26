<template>
	<view class="date-range-picker">
		<view class="date-range-box" @click="showModal()">
			<view class="date-value">
				{{range.start||'开始'}}
			</view>
			<view class="separator">
				{{rangeSeparator||'至'}}
			</view>
			<view class="date-value">
				{{range.end||'结束'}}
			</view>
			<text class="cuIcon-calendar"></text>
		</view>
		<u-calendar v-model="show" :mode="'range'" @change="change" max-date="2050-01-01" v-if="mode==='date'"></u-calendar>
		<view class="cu-modal bottom-modal" :class="{show:show&&mode==='time'}" @click="hideModal">
			<view class="cu-dialog" @click.stop="">
				<smh-time-range :time="[12,30,0,17,30]" @confrim="change" @cancel="cancel" v-if="show&&mode==='time'"></smh-time-range>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "date-range-picker",
		 model: {
		    prop: 'value',
		    event: 'change'
		  },
		props: {
			rangeSeparator: {
				type: String,
				default: '至'
			},
			mode:{
				type: String,
				default: 'date'
			},
			value:{
				type:Array
			}
		},
		data() {
			return {
				show: false,
				modalName:'',
				start: '',
				end: ''
			};
		},
		computed: {
			range(){
				let obj = {
					start:"",
					end:""
				}
				if(Array.isArray(this.value)&&this.value.length===2){
					obj.start = this.value[0]
					obj.end = this.value[1]
				}
				return obj
			}
		},
		methods: {
			cancel(e){
				debugger
			},
			change(e){
				if(e.startDate&&e.endDate){
					// this.start = e.startDate
					// this.end = e.endDate
					this.$emit('change',[e.startDate,e.endDate])
				}else if(e.time){
					this.hideModal()
					let arr  = e.time.split('-')
					if(Array.isArray(arr)&&arr.length==2){
						e.startTime = arr[0]
						e.endTime = arr[1]
						// this.start = e.startTime
						// this.end = e.endTime
						this.$emit('change',[e.startTime,e.endTime])
					}

				}
			},
			showModal(){
				this.show  = true
			},
			hideModal() {
				this.show = false
			}
		},
	}
</script>

<style  lang="scss">
	.date-range-picker{
		width: 100%;
	}
.date-range-box{
	display: flex;
	justify-content: space-between;
	width: 100%;
	padding: 10rpx;
	text-align: center;
	align-items: center;
	border: 1rpx #f1f1f1 solid;
	border-radius: 10rpx;
	 .u-row-center {
		display: flex;
		justify-content: center;
	}
	.date-value{
		flex: 1;
		background-color: rgba($color: #f1f1f1, $alpha: 0.2);
		padding: 10rpx;
		color: #666;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.cuIcon-calendar{
		margin-left: 10rpx;
	}
	.separator{
		flex: 0.5;
	}
}
</style>
