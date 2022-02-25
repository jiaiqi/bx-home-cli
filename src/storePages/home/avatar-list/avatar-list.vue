<template>
  <view class="user-avatar-list padding-sm" v-else-if="storeNo && pageItem && pageItem.type === '用户展示'">
    <view class="" style="display: flex;align-items: center;">
      <view class="cu-avatar-group">
        <view class="cu-avatar round " v-for="(item, index) in avatarLists" :key="index"
          :style="[{ backgroundImage: 'url(' + avatarLists[index] + ')', 'z-index': avatarLists.length - index }]">
        </view>
      </view>
      <view class="number-tip">
        {{amount||''}}
      </view>
    </view>
    <view class="share-menu">
      <button class="cu-btn bg-blue light round" :open-type="pageItem.btn_type==='分享'?'share':''" :style="{
        'color':pageItem.btn_text_color,
        'background-color':pageItem.btn_bg_color
      }" :class="{
        'sm':pageItem.btn_size==='小',
        'lg':pageItem.btn_size==='大'
      }" v-if="pageItem&&(pageItem.right_btn_name||pageItem.btn_target_url)"><text
          class="text-bold sm">{{pageItem.right_btn_name||'邀请好友'}}</text></button>
      <button class="cu-btn bg-blue light round" open-type="share" v-else><text
          class="text-bold sm">邀请好友</text></button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        avatarLists: [],
        total: 0
      }
    },
    computed: {
      amount() {
        let amount = ''
        if (typeof this.total === 'number' && this.total > 0) {
          if (this.total > 10000) {
            return `1万+成员`
          } else if (this.total > 1000) {
            return `${parseInt(this.total/1000)*1000}+成员`
          } else if (this.total > 100) {
            return `${parseInt(this.total/100)*100}+成员`
          }
        }
      }
    },
    props: {
      storeNo: {
        type: String,
        default: ''
      },
      pageItem: {
        type: Object
      }
    },
    mounted() {
      this.getUserList()
    },
    methods: {
      navTo() {
        if (this.pageItem?.btn_target_url) {
          let url = this.renderStr(this.pageItem?.btn_target_url, this)
          uni.navigateTo({
            url
          })
        }
      },
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
            if (res.data?.page?.total) {
              this.total = res.data?.page?.total
            }
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
      padding-left: 5px;
      // border-left: 1px solid #f1f1f1;
    }

    .number-tip {
      color: #888;
    }
  }
</style>
