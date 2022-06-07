<template>
	<view class="bg-white padding">
		 <!-- 学校详情 -->
		 <view class="text-xl padding-tb-xs padding-lr-xs text-bold">{{detail.name}}(2021) 
		 </view>
		 <view class="text-lg  flex text-xs ">
			 <view class="padding-lr-xs text-xs">{{detail.batch }} </view>
			 <view class="padding-lr-xs text-xs">{{detail.type }} </view>
			 <view class="padding-lr-xs text-xs">{{detail.school_type }} </view>
			 <view class="text-red padding-lr-xs text-xs">{{detail[985] == '否' ? '' : '985   '}} </view>
			 <view  class="text-orange padding-lr-xs text-xs">{{detail[211] == '否' ? '' : '211   '}} </view>
			 <view  class="text-blue padding-lr-xs text-xs">{{detail.double_top == '否' ? '' : '双一流   '}} </view>
			 <view class="padding-lr-xs text-xs">{{detail.province }} </view>
		 </view>
		 <view class="padding-lr-xs text-xs">地址：{{detail.address}}</view>
		 <view class="text-xs text-blue padding-top" v-show="searchVal">
		 	 #{{searchVal}}
		 </view>
			 <u-table :fontSize="'12px'">
			 		<u-tr>
			 			<u-th :width="'50%'">专业</u-th>
			 			<u-th>最高</u-th>
			 			<u-th>最低</u-th>
			 			<u-th>最低位</u-th>
			 			<u-th>人数</u-th>
			 		</u-tr>
			 		<u-tr v-for="(item,index) in major" :key="index" v-show="Number(index) < 10">
			 			<u-td :width="'50%'">{{item.pro_name}}</u-td>
			 			<u-td>{{item.highest_score}}</u-td>
			 			<u-td>{{item.lowest_score}}</u-td>
			 			<u-td>{{item.lowest_quantile}}</u-td>
			 			<u-td>{{item.enroll_number}}</u-td>
			 		</u-tr>
			 	</u-table>
				<view>*注：完整数据暂未开放</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				schoolId:null,
				detail:{},
				major:[],
				searchVal:''
			}
		},
		onLoad(option) {
			this.schoolId = option.id
			
		},
		onShow() {
			this.selectDetail(this.schoolId)
		},
		methods: {
			selectDetail(id){
				let service = 'srvuee_college_info_select'
				let url = this.getServiceUrl('person', service, 'select');
				let req = {
				  "serviceName": service,
				  "colNames": ["*"],
				  "condition": [{
				    "colName": "id",
				    "ruleType": "in",
				    "value": id
				  }],
				  }
				this.$http.post(url, req).then(res => {
				  uni.$emit('goods-cart-change')
				  if (res.data.state === 'SUCCESS') {
				    // this.refresh()
					this.detail = res.data.data[0]
					this.getMajor()
				    uni.showToast({
				      title: '加载成功!',
				      icon: 'none'
				    })
				  }
				})
			},
			getMajor(){
				let self = this
				let service = 'srvuee_pro_score_select'
				let url = this.getServiceUrl('person', service, 'select');
				self.searchVal = uni.getStorageSync('srvuee_college_by_pro_select_searchVal')
				let req = {
				  "serviceName": service,
				  "colNames": ["*"],
				  "condition": [{
				    "colName": "college_name",
				    "ruleType": "in",
				    "value": self.detail.name
				  }
				  // ,{
				  //   "colName": "pro_name",
				  //   "ruleType": "[like]",
				  //   "value": self.searchVal
				  // }
				  
				  ],
				  }
				self.$http.post(url, req).then(res => {
				  uni.$emit('goods-cart-change')
				  if (res.data.state === 'SUCCESS') {
				    // this.refresh()
					self.major = res.data.data
				    uni.showToast({
				      title: '加载成功!',
				      icon: 'none'
				    })
				  }
				})
				
			}
		}
	}
</script>

<style>

</style>
