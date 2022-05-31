<template>
  <video class="video-wrap" :src="src" :autoplay="true">
  </video>
</template>

<script>
  export default {
    data() {
      return {
        src:""
      }
    },
    methods: {
      
    },
    onLoad(option) {
      if(option.src){
        this.src = decodeURIComponent(option.src)
      }
    }
  }
</script>

<style lang="scss">
.video-wrap{
  width: 100vw;
  height: 100vh;
}
</style>
