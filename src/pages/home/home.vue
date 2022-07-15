<template>
	<view class="">
	</view>
</template>
<script>
	export default {
		onLoad(option) {
			let pageStack = getCurrentPages()
			if (Array.isArray(pageStack) && pageStack.length >= 1) {
				let currentPage = pageStack[pageStack.length - 1]
				if (currentPage.$page.fullPath) {
					let url = currentPage.$page.fullPath.replace('pages', 'storePages')
          if((option.store_no||option.storeNo)&&url.indexOf('store_no')==-1){
            if(url.indexOf('?')==-1){
              url+=`?store_no=${option.store_no||option.storeNo}`
            }else{
              url+=`&store_no=${option.store_no||option.storeNo}`
            }
          }
					uni.redirectTo({
						url,
						fail() {
							url = `/${url}`
							uni.redirectTo({
								url
							})
						}
					})
					this.$store.commit('SET_CURRENT_PAGE', url)
				}
			} else {
        debugger
        let url = '/storePages/home/home'
        
     
				uni.redirectTo({
					url
				})
			}
		},
	}
</script>
