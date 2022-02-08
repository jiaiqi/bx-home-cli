<template>
	<view class="">
	</view>
</template>
<script>
	export default {
		onLoad() {
      debugger
			let pageStack = getCurrentPages()
			if (Array.isArray(pageStack) && pageStack.length >= 1) {
				let currentPage = pageStack[pageStack.length - 1]
				if (currentPage.$page.fullPath) {
					let url = currentPage.$page.fullPath.replace('pages', 'storePages')
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
				uni.redirectTo({
					url: '/storePages/home/home'
				})
			}
		},
	}
</script>
