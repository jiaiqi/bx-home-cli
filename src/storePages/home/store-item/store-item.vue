<template>
  <view class="store-item" v-if="storeInfo && storeInfo.store_no&&pageItem&&isShow"
    :class="{ 'bg-transparent': pageItem && pageItem.type === '关联店铺','noMargin':pageItem&&(pageItem.type === '店铺信息2') }">
    <view class="title" v-if="pageItem&&pageItem.show_label === '是'&& pageItem.type !== '疫苗列表'" @click="toMore">
      <text>{{ pageItem.component_label || "" }}</text>
      <!-- <view class="cu-btn bg-white" v-if="pageItem.type === '朋友圈'">
        查看更多
        <text class="cuIcon-right"></text>
      </view> -->
    </view>
    <slide-list v-if="pageItem.type === '轮播图'" ref="swiperList" :storeInfo="storeInfo" :userInfo="userInfo"
      @setHomePage="setHomePage" :pageItem="pageItem"></slide-list>
    <store-info :storeInfo="storeInfo" :userInfo="userInfo" :bindUserInfo="bindUserInfo" @bindUser="bindStore"
      v-else-if="pageItem.type === '店铺信息'||pageItem.type === '店铺信息2'" :isBind="isBind" :pageItem="pageItem"
      @setHomePage="setHomePage" @addToStore="addToStore" @toConsult="toConsult" @toSetting="toSetting"
      @getQrcode="getQrcode"></store-info>
    <button-list :pageItem="pageItem" :userInfo="userInfo" :bindUserInfo="bindUserInfo" :storeInfo="storeInfo"
      @addToStore="addToStore" v-else-if="pageItem.type === '按钮组'" ref="buttonGroup"></button-list>
    <goods-list v-else-if="pageItem.type === '商品列表' && goodsListData.length > 0" :storeNo="storeNo"
      :storeInfo="storeInfo" image="goods_img" name="goods_name" desc="goods_desc" ref="goodsList"></goods-list>
    <vaccine-list :storeInfo="storeInfo" :pageItem="pageItem" v-else-if="pageItem.type === '疫苗列表'" ref="vaccineList">
    </vaccine-list>
    <staff-manage :storeNo="storeNo" :pageItem="pageItem" v-else-if="pageItem.type === '人员列表'"
      @toDoctorDetail="toDoctorDetail" ref="staffList">
    </staff-manage>
    <news-list :pageItem="pageItem" :website_no="storeInfo && storeInfo.website_no" ref="articleList"
      :article-style="pageItem.article_style" :rownumber="pageItem.row_number" :cateNo="pageItem.category_no"
      :storeInfo="storeInfo" v-else-if="pageItem.type === '文章列表'">
    </news-list>
    <notice-list v-else-if="pageItem.type === '通知横幅'" ref="noticeList" :storeNo="storeNo" :pageItem="pageItem">
    </notice-list>
    <relation-store v-else-if="pageItem && pageItem.type === '关联店铺'" ref="relationStore" :storeNo="storeNo"
      :pageItem="pageItem"></relation-store>
    <timeline-list :showProfile="false" :profile="userInfo.profile_url" :storeNo="storeNo" noMargin showMore
      :condition="timelinecondition" :limit="3" :showPublish="false" v-else-if="
        storeNo &&
        pageItem &&
        pageItem.type === '朋友圈' &&
        userInfo &&
        userInfo.userno
      "></timeline-list>
    <link-wifi :store_no="storeNo" v-else-if="
        storeNo &&
        pageItem &&
        pageItem.type === '连接WiFi'&&room_no
      "></link-wifi>
  </view>
</template>

<script>
  import slideList from '../slide-picture/slide-picture.vue'
  import storeInfo from '../store-info/store-info.vue'
  import buttonList from '../button-group/button-group.vue'
  import goodsList from '../goods-list/goods-list.vue';
  import vaccineList from '../vaccine-list/vaccine-list.vue'
  import newsList from '../news-list/news-list.vue'
  import staffManage from '../staff-manage/staff-manage.vue'
  import noticeList from '../notice-list/notice-list.vue'
  import relationStore from '../relation-store/relation-store.vue'
  import timelineList from './timeline-list/timeline-list.vue'
  import linkWifi from '../link-wifi/link-wifi.vue'

  export default {
    components: {
      slideList,
      storeInfo,
      buttonList,
      goodsList,
      vaccineList,
      staffManage,
      newsList,
      noticeList,
      relationStore,
      timelineList,
      linkWifi
    },
    props: {
      pageItem: {
        type: Object
      },
      storeInfo: {
        type: Object
      },
      userInfo: {
        type: Object
      },
      bindUserInfo: {
        type: Object
      },
      mainMenuList: {
        type: Array
      },
      goodsListData: {
        type: Array
      },
      isBind: {
        type: Boolean
      }
    },
    computed: {
      isShow(){
        if(this.pageItem?.type==='连接WiFi'){
          return this.room_no
        }else{
          return true
        }
      },
      room_no() {
        let globalData = getApp().globalData;
        return globalData?.room_no
      },
      storeNo() {
        return this.storeInfo && this.storeInfo.store_no ? this.storeInfo.store_no : ''
      },
      timelinecondition() {
        return [{
          colName: 'store_no',
          ruleType: 'eq',
          value: this.storeNo
        }, ]
      },
      // isBind () {
      //   return this.bindUserInfo && this.bindUserInfo.id ? true : false
      // },
    },
    data() {
      return {}
    },
    created() {
      uni.$on('updateStoreItemData', () => {
        this.onRefresh()
      })
    },
    methods: {
      getQrcode(e) {
        this.$emit('getQrcode', e)
      },
      toSetting() {
        this.$emit('toSetting')
      },
      toMore() {
        // let url = '/otherPages/timeline/timeline'
        // if (this.storeNo) {
        //   url = `${url}?storeNo=${this.storeNo}`
        // }
        // uni.navigateTo({
        //   url
        // })
      },
      setHomePage() {
        this.$emit('setHomePage')
      },
      addToStore() {
        this.$emit('addToStore')
      },
      toConsult() {
        this.$emit('toConsult')
      },
      bindStore() {
        this.$emit('bindStore')
      },
      toDoctorDetail(e) {
        this.$emit('toDoctorDetail', e)
      },

      onRefresh() {
        if (this.pageItem) {
          switch (this.pageItem.type) {
            // case '按钮组':
            //   if (this.$refs.buttonGroup && this.$refs.buttonGroup.getButtons) {
            //     // this.$refs.buttonGroup.buttons = []
            //     this.$refs.buttonGroup.getButtons()
            //   }
            //   break;
            // case '人员列表':
            //   if (this.$refs && this.$refs.staffList && this.$refs.staffList.getStoreUserList) {
            //     this.$refs.staffList.getStoreUserList()
            //   }
            //   break;
            case '文章列表':
              if (this.$refs && this.$refs.articleList && this.$refs.articleList.getTabs) {
                this.$refs.articleList.getTabs()
              }
              break;
            case '疫苗列表':
              if (this.$refs && this.$refs.vaccineList && this.$refs.vaccineList.getVaccineList) {
                this.$refs.vaccineList.getVaccineList()
              }
              break;
            case '轮播图':
              if (this.$refs && this.$refs.swiperList && this.$refs.swiperList.getSwiperList) {
                this.$refs.swiperList.getSwiperList()
              }
              break;
            case '商品列表':
              if (this.$refs && this.$refs.goodsList && this.$refs.goodsList.getGoodsListData) {
                this.$refs.goodsList.getGoodsListData()
              }
              break;
            case '通知横幅':
              if (this.$refs && this.$refs.noticeList && this.$refs.noticeList.getList) {
                this.$refs.noticeList.getList()
              }
              break;
          }
        }
      },
    },
  }
</script>

<style scoped lang="scss">
  .store-item {
    background-color: #fff;
    border-radius: 20rpx;
    margin: 20rpx;
    overflow: hidden;

    &.bg-transparent {
      background-color: transparent;
    }

    &.noMargin {
      margin: 0;
      border-radius: 0;
    }
  }

  .title {
    padding: 20rpx;
    position: relative;
    padding-left: 40rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-family: 苹方-简;
    font-weight: normal;
    color: #474849;
  }

  // .title::before {
  //   content: "";
  //   width: 10rpx;
  //   height: 30rpx;
  //   background-color: #0bc99d;
  //   position: absolute;
  //   left: 20rpx;
  //   top: calc(50% - 15rpx);
  //   border-radius: 20rpx;
  // }
</style>
