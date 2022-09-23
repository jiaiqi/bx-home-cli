<template>
  <view>

  </view>
</template>

<script>
  export default {
    name: "bxForm",
    props: {
      model: {
        type: Object
      },
      rules: {
        type: Object
      }
    },
    data() {
      return {

      };
    }
    created() {
      this.$on('on-form-item-add', (field) => {
        if (field) this.fields.push(field);
      });
      this.$on('on-form-item-remove', (field) => {
        if (field.prop) this.fields.splice(this.fields.indexOf(field), 1);
      });
    }
  }
</script>

<style lang="scss">

</style>
