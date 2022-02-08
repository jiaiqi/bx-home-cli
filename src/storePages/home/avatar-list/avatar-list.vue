<template>
  <view class="user-avatar-list padding-sm" v-else-if="storeNo && pageItem && pageItem.type === '用户展示'">
    <view class="cu-avatar-group">
      <view class="cu-avatar round " v-for="(item, index) in avatarLists" :key="index"
        :style="[{ backgroundImage: 'url(' + avatarLists[index] + ')', 'z-index': avatarLists.length - index }]">
      </view>
    </view>
    <view class="share-menu">
      <button class="cu-btn bg-white sm" open-type="share"><text class="text-blue sm">邀请好友</text></button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        avatarLists: []
      }
    },
    props: {
      storeNo: {
        type: String,
        default: ''
      },
    },
    mounted() {
      this.getUserList()
    },
    methods: {
      getUserList() {
        let serviceName = 'srvhealth_store_user_visitor_select';
        const req = {
          serviceName: 'srvhealth_store_user_visitor_select',
          colNames: ['*'],
          condition: [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeNo
          }],
          page: {
            pageNo: 1,
            rownumber: 8
          },
          order: [],
          draft: false,
          query_source: 'list_page'
        };
        let url = this.getServiceUrl('health', serviceName, 'select');
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data.data)) {
            this.avatarLists = res.data.data.map(item => {
              if (item.profile_url) {
                return this.getImagePath(item.profile_url, true);
              } else if (item.user_image) {
                return this.getImagePath(item.user_image, true);
              }
            });
          }
        });
      },
    },
  }
</script>

<style scoped lang="scss">
  .user-avatar-list {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .share-menu {
      border-left: 1px solid #f1f1f1;
    }
  }
</style>
