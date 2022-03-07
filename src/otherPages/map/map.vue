<template>
	<view class="map-view">
		<map
			id="map"
			style="width: 100%;height: 100%;"
			:latitude="latitude"
			:longitude="longitude"
			:show-location="true"
			:show-compass="true"
			:enable-3D="true"
			:markers="markData"
			@regionchange="regionchange"
		></map>
	</view>
</template>

<script>
export default {
	data() {
		return {
			mapCtx: null,
			longitude: '',
			latitude: '',
			markData: [],
			cfgNo: '',
			cfg: {}
		};
	},
	methods: {
		async getConfig() {
			let serviceName = 'srvsys_page_def_select';
			const appName = 'health';
			const url = this.getServiceUrl(appName, serviceName, 'select');
			const req = { serviceName: 'srvsys_page_def_select', colNames: ['*'], condition: [{ colName: 'pt_no', ruleType: 'eq', value: this.pt_no }] };
			const res = await this.$http.post(url, req);
			if (Array.isArray(res.data.data) && res.data.data.length > 0) {
				let resData = res.data.data[0];
				this.cfg = resData;
				this.initMap()
			}
		},
		regionchange(e) {
			this.initMap();
		},
		async getData(data = {}) {
			let serviceName = data.serviceName || 'srvportal_community_select';
			const appName = data.app || 'bxportal';
			const url = this.getServiceUrl(appName, serviceName, 'select');
			const req = data.req;
			if (!req) {
				return;
			}

			const res = await this.$http.post(url, req);

			if (res.data.state == 'SUCCESS') {
				this.markData = res.data.data.map(item => {
					const obj = {
						id: item.id,
						title: item.name,
						label: {
							content: item.name,
							display: 'ALWAYS',
							// anchorX:-(item.name.length*6),
							anchor: 0,
							fontSize: 12,
							// bgColor:'#fff',
							color: '#333'
						},
						latitude: item.latitude,
						longitude: item.longitude
					};
					if(data.cfg&&data.cfg.lat_col&&data.cfg.lng_col){
						if(item[data.cfg.lat_col]&&item[data.cfg.lng_col]){
							obj.latitude = item[data.cfg.lat_col]
							obj.longitude = item[data.cfg.lng_col]
						}
					}
					if (item.name) {
						obj.label.anchorX = -1 * item.name.length * 6;
					}
					return obj;
				});
				// if(this.markData.length>0){
				// 	this.mapCtx.addMarkers({
				// 		markers:this.markData,
				// 		success:res=>{
				// 			console.log(res)
				// 		}
				// 	})
				// }
			}
		},
		getRange() {
			return new Promise(resolve => {
				this.mapCtx.getRegion({
					success: res => {
						console.log(res, 'getRegion');
						const screenSw = res.southwest;
						const screenNe = res.northeast;
						resolve({
							success: true,
							data: { longitude: `${screenSw.longitude},${screenNe.longitude}`, latitude: `${screenSw.latitude},${screenNe.latitude}` }
						});
						// const rightTop = {
						// 	latitude:screenNe.latitude,
						// 	longitude:screenNe.longitude
						// }
						// const leftTop = {
						// 	latitude:screenSw.latitude,
						// 	longitude:screenNe.longitude
						// }

						// const rightBottom = {
						// 	latitude:screenSw.latitude,
						// 	longitude:screenNe.longitude
						// }

						// const leftBottom = {
						// 	latitude:screenNe.latitude,
						// 	longitude:screenSw.longitude
						// }

						// const screenHeight = wx.getSystemInfoSync().windowHeight;
						// const screenWidth = wx.getSystemInfoSync().windowWidth;
						// var point = {
						// 	latitude: this.latitude,
						// 	longitude: this.longitude
						// };
						// var x = (screenWidth / (screenNe.longitude - screenSw.longitude)) * (point.longitude - screenSw.longitude);
						// var y = (screenHeight / (screenSw.latitude - screenNe.latitude)) * (point.latitude - screenNe.latitude);
					},
					fail: err => {
						resolve({
							success: false,
							data: err
						});
						console.log('失败', err);
					}
				});
			});
		},
		async initMap() {
			let resData = this.cfg;
			let reqData = resData.service_json;
			let cfgData = resData.merge_json
			try {
				reqData = JSON.parse(reqData);
			} catch (e) {
				//TODO handle the exception
			}
			try {
				cfgData = JSON.parse(cfgData);
			} catch (e) {
				//TODO handle the exception
			}
			if (typeof reqData === 'object') {
				if (Array.isArray(reqData.condition) && reqData.condition.length > 0) {
					let rangeData = await this.getRange();
					if (rangeData.success) {
						reqData.condition.forEach(cond => {
							cond.value = this.renderStr(cond.value, { range: rangeData.data });
						});
						let obj = {
							serviceName: resData.service,
							app: resData.app,
							req: reqData
						};
						if(cfgData&&cfgData.map_cfg){
							obj.cfg=cfgData.map_cfg
						}
						this.getData(obj);
					}
				}
			}
		}
	},
	onLoad(option) {
		let self = this
		uni.getLocation({
		    type: 'gcj02',
		    success: function (res) {
		        console.log('当前位置的经度：' + res.longitude);
		        console.log('当前位置的纬度：' + res.latitude);
				self.longitude = res.longitude;
				self.latitude = res.latitude
		    }
		});
		this.mapCtx = wx.createMapContext('map', this);
		if (option.pt_no) {
			self.pt_no = option.pt_no;
			self.getConfig();
		}
		// this.initMap()
		// this.mapCtx.on('markerClusterCreate', (res) => {
		// 	console.log('markerClusterCreate',res)
		// })
	},
	onShareAppMessage() {
		
	},
	onShareTimeline() {
		
	}
};
</script>

<style>
.map-view {
	width: 100vw;
	height: calc(100vh - var(--window-top));
}
</style>
