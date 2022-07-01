<template>
  <view class="data-display">
    <view class="data-item" v-for="item in list">
      <view class="label" v-if="labelPosition=='top'">
        {{item.label||'-'}}
      </view>
      <view class="data">
        {{item.data||item.mockData||'-'}}
      </view>
      <view class="label" v-if="labelPosition==='bottom'">
        {{item.label||'-'}}
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        list: []
      }
    },
    mounted() {
      if (this.more_config?.dataMap) {
        this.list = this.more_config?.dataMap
      }
      if (this.more_config?.serviceName) {
        this.getList()
      }
    },
    computed: {
      labelPosition() {
        return this.more_config?.labelPosition === 'bottom' ? 'bottom' : 'top'
      },
      more_config() {
        let res = this.pageItem?.more_config
        if (this.pageItem?.more_config) {
          if (typeof this.pageItem?.more_config === 'string') {
            try {
              res = JSON.parse(this.pageItem?.more_config)
            } catch (e) {

              //TODO handle the exception
            }
          }
        }
        return res
      }
    },
    methods: {
      async getList() {
        let service = this.more_config?.serviceName;
        const app = this.more_config?.app || uni.getStorageSync('activeApp') || 'health'
        let req = {
          serviceName: service,
          condition: []
        }
        if (this.more_config?.condition) {
          const globalData = {
            storeInfo: this.storeInfo,
            storeUser: this.vstoreUser,
            userInfo: this.userInfo
          }
          if (Array.isArray(this.more_config?.condition) && this.more_config?.condition.length > 0) {
            this.more_config.condition.forEach(item => {
              item.value = this.renderStr(item.value, globalData)
              req.condition.push(item)
            })
          }
        }
        let res = await this.$fetch('select', service, req, app);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.list = this.list.map(item => {
            item.data = res.data[0][item.column]
            return item
          })
        }
      }
    },
    props: {
      pageItem: {
        type: Object
      },
    },
  }
</script>

<style scoped lang="scss">
  .data-display {
    .data-item {
      min-width: 25%;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;

      .label {
        font-size: 12px;
        color: #666;
      }

      .data {
        font-weight: bold;
        padding: 5px;
        font-size: 14px;
      }
    }
  }
</style>
