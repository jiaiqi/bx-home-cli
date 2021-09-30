<template>
  <view>
    <view class="list-wrap">
      <list-item v-for="(item,index) in list" :key="index" :viewTemp="viewTemp" :rowData="item" :rowButton="rowButton"
        :labelMap="labelMap">
      </list-item>
    </view>
  </view>
</template>

<script>
  import listItem from './list-item.vue'
  export default {
    components: {
      listItem
    },
    props: {
      list: {
        type: Array
      },
      colV2: {
        type: Object
      },
      appName: {
        type: String
      },

    },
    computed: {
      rowButton() {
        return this.colV2?.rowButton
      },
      moreConfig() {
        let result = null
        if (this.colV2?.more_config) {
          if (typeof this.colV2.more_config === 'string') {
            try {
              result = JSON.parse(this.colV2.more_config)
            } catch (e) {
              //TODO handle the exception
            }
          } else if (typeof this.colV2.more_config === 'object') {
            result = this.colV2.more_config
          }
        }
        return result
      },
      viewTemp() {
        return this.moreConfig?.list_config
      },
      labelMap() {
        if (Array.isArray(this.colV2?._fieldInfo)) {
          return this.colV2._fieldInfo.reduce((res, cur) => {
            res[cur.columns] = cur.label
            return res
          }, {})
        }
      },
    },
    data() {
      return {

      }
    },
    methods: {
      clickItem(e) {
        this.$emit('clickItem', e)
      },
    }
  }
</script>

<style>

</style>
