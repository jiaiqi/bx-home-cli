<template>
  <view>

  </view>
</template>

<script>
  import {
    mapState,
    mapMutations
  } from 'vuex';
  export default {
    name: "bx-login",
    computed: {
      ...mapState({
        showLoginDialog:state=> state.app.showLoginDialog
      }),
    },
    data() {
      return {

      };
    }
  }
</script>

<style lang="scss">

</style>
