<template>
  <view>
    <checkbox-group @change="checkboxChange">
      <view class="goods-list">
        <view class="list-item" v-for="item in list">
          <checkbox color="#0BC99D" :value="item.id+''" :checked="item.checked" v-if="showCheckBox"
            style="transform:scale(0.7)" />
          <view class="left-image">


          </view>
          <view class="content">
            
          </view>
        </view>
      </view>
    </checkbox-group>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        pageNo: 1,
        total: 0,
        list: [],
        showCheckBox: true
      }
    },
    methods: {
      checkboxChange(e) {
        var items = this.list,
          values = e.detail.value;
        for (var i = 0, lenI = items.length; i < lenI; ++i) {
          const item = items[i]
          if (values.includes(item.id) || values.includes(item.id.toString())) {
            this.$set(item, 'checked', true)
          } else {
            this.$set(item, 'checked', false)
          }
        }
      },
      async getList() {
        let serviceName = 'srvhealth_store_shopping_cart_goods_detail_select'
        let req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.vstoreUser?.store_no
            },
            {
              colName: 'store_user_no',
              ruleType: 'eq',
              value: this.vstoreUser?.store_user_no
            }
          ],
          "page": {
            "pageNo": this.pageNo,
            "rownumber": 99
          }
        }
        let res = await this.$fetch('select', service, req, 'health')
        if (res.success) {
          this.list = res.data
        }
      },
    },
    onLoad(option) {
      if (this.vstoreUser?.store_no && this.vstoreUser?.store_user_no) {
        this.getList()
      }
    },
    onPullDownRefresh() {
      this.pageNo = 1;
      this.getList();
    }

  }
</script>

<style>

</style>
