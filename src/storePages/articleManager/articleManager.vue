<template>
  <view class="manager-box">
    <view class="box-item" v-for="(item,index) in gridList" :key="index" @click="goNoticeList(item)">
      <view class="box-item-content">
        <text class="cu-tag badge" v-if="item.num">{{ item.num }}</text>
        <text class="cu-tag badge-left" v-if="item.unback">{{
          item.unback
        }}</text>
        <!-- <image src="../static/links.png" class="icon" mode="" v-if="!item.icon"></image> -->
        <text
          class="icon"
          v-else
          :class="[
            'cuIcon-' + item.icon,
            item.color ? 'text-' + item.color : '',
          ]"
        ></text>
        <view class="label">{{ item.label }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      storeNo: "",
      gridList: [],
      StoreInfo:{}
    }
  },
  methods: {
    goNoticeList (item) {
      let viewTemp = {
        price: "content_status",
        // price:"create_time",
        tip: 'content',
        footer: 'create_time',
        title: 'title',
        img: 'icon_image'
      };
      let cond = [ {
        colName: "no",
        ruleType: "like",
        value: item.no
      } ]
      let url =
        `/publicPages/list2/list2?pageType=list&appName=daq&serviceName=srvdaq_cms_content_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
      uni.navigateTo({
        url: url
      })
    },
    async getStoreInfo () {
      let req = {
        condition: [ {
          colName: 'store_no',
          ruleType: 'in',
          value: this.storeNo
        } ]
      };
      let storeInfo = await this.$fetch('select', 'srvhealth_store_mgmt_select', req, 'health');
      if (storeInfo.success && Array.isArray(storeInfo.data) && storeInfo.data.length > 0) {
        this.StoreInfo = storeInfo.data[ 0 ];
        this.getStoreArticleColumns()
      }
    },
    getStoreArticleColumns () {
      // 查找此店铺关联的文章栏目
      let req = {
        condition: [ {
          colName: 'website_no',
          ruleType: 'eq',
          value: this.StoreInfo.website_no
        },
        {
          colName: 'is_leaf',
          ruleType: 'eq',
          value: '是'
        }
        ]
      };
      this.$fetch('select', 'srvdaq_cms_category_select', req, 'daq').then(cate => {
        if (cate.success && cate.data.length > 0) {
          let types = cate.data.reduce((pre, cur) => {
            let obj = {
              name: cur.cate_name,
              no: cur.no,
              icon: 'read',
              color: 'blue',
              type: 'article-list'
            }
            pre.push(obj)
            return pre
          }, [])
          if (types.length > 0) {
            types.forEach(type => {
              type.label = type.name + '管理'
              if (!this.gridList.find(item => item.no && item.no === type.no)) {
                this.gridList.push(type)
              }
            })
          }
        }
      });
    },
  },
  onLoad (option) {
    if (option.store_no) {
      this.storeNo = option.store_no
      this.getStoreInfo()
    }
  }
}
</script>

<style scoped lang="scss">
.manager-box {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;

  .box-item {
    padding: 40rpx 20rpx;
    width: 33.33%;
    box-sizing: border-box;
    border: 1px solid #f1f1f1;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .amount {
      position: absolute;
      right: 0;
      top: 0;
    }

    .badge-left {
      position: absolute;
      background-color: #f37b1d;
      border-radius: 100px;
      top: -10rpx;
      left: -10rpx;
      font-size: 10px;
      padding: 0px 5px;
      height: 14px;
      color: #ffffff;
    }

    .box-item-content {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .tit-label {
        font-size: 12px;
        position: absolute;
        bottom: -20px;
      }
    }

    .icon {
      width: 80rpx;
      height: 80rpx;
      font-size: 30px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }

    .label {
      margin-top: 10px;
    }
  }
}
</style>
