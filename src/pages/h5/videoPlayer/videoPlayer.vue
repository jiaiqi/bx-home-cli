<template>
  <view>
    <video :src="src" :autoplay="true" class="video"></video>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        src: ""
      }
    },
    methods: {

    },
    onLoad(option) {
      if (option.url) {
        try{
          this.src = decodeURIComponent(option.url)
        }catch(e){
          this.src = option.url
          //TODO handle the exception
        }
      }
    }
  }
</script>

<style>
.video{
  width: 100vw;
  height: 100vh;
}
</style>
