<template>
  <view class="store-item" v-if="storeInfo && storeInfo.store_no && pageItem && isShow" :style="itemStyle" :class="{
			'is-swiper': pageItem.type === '轮播图',
			'padding':['疫苗列表'].includes(pageItem.type),
			'bg-transparent': pageItem && ['关联店铺', '通知横幅', '会员卡片', '通用列表', '商品列表'].includes(pageItem.type),
			'noMargin noPadding': pageItem && ['店铺信息2', '通用列表', '会员卡片','悬浮按钮'].includes(pageItem.type)
		}">
    <view class="title" :style="titleStyle"
      v-if="pageItem && pageItem.show_label === '是' && ['通用列表','疫苗列表','商品列表','海报弹窗','悬浮按钮'].indexOf(pageItem.type)==-1"
      @click="toMore">
      <text>{{ pageItem.component_label || '' }}</text>
      <button class="right-btn text-sm text-gray cu-btn bg-white sm" v-if="rightBtn&&rightBtn.label"
        @click="onRightBtn">
        <text>{{rightBtn.label}}</text> <text class="cuIcon-right margin-left-xs"></text>
      </button>
    </view>
    <slide-list v-if="pageItem.type === '轮播图'" ref="swiperList" :storeInfo="storeInfo" :userInfo="userInfo"
      @setHomePage="setHomePage" :pageItem="pageItem" :beforeClick="beforeClick"></slide-list>
    <store-info :storeInfo="storeInfo" :userInfo="userInfo" :bindUserInfo="bindUserInfo" @bindUser="bindStore"
      v-else-if="['店铺信息','店铺信息2','店铺信息3','简洁店铺信息','店铺信息-可切换店铺'].includes(pageItem.type)" :isBind="isBind"
      :isManage="isManage" :pageItem="pageItem" @setHomePage="setHomePage" @addToStore="addToStore"
      @getQrcode="getQrcode" :beforeClick="beforeClick"></store-info>
    <button-list :pageItem="pageItem" :userInfo="userInfo" :bindUserInfo="bindUserInfo" :storeInfo="storeInfo"
      @addToStore="addToStore" v-else-if="pageItem&&pageItem.type === '按钮组'" :button-list="pageItem.listdata"
      ref="buttonGroup">
    </button-list>
    <goods-list v-else-if="pageItem.type === '商品列表'" :storeNo="storeNo" :page-item="pageItem" :storeInfo="storeInfo"
      image="goods_img" name="goods_name" desc="goods_desc" ref="goodsList" :beforeClick="beforeClick">
    </goods-list>
    <vaccine-list :storeInfo="storeInfo" :pageItem="pageItem" v-else-if="pageItem.type === '疫苗列表'" ref="vaccineList">
    </vaccine-list :beforeClick="beforeClick">
    <staff-manage :storeNo="storeNo" :pageItem="pageItem" v-else-if="pageItem.type === '人员列表'"
      @toDoctorDetail="toDoctorDetail" ref="staffList"></staff-manage>
    <news-list :pageItem="pageItem" :website_no="storeInfo && storeInfo.website_no" ref="articleList"
      :article-style="pageItem.article_style" :rownumber="pageItem.row_number" :cateNo="pageItem.category_no"
      :storeInfo="storeInfo" :beforeClick="beforeClick" v-else-if="pageItem.type === '文章列表'"></news-list>
    <notice-list v-else-if="pageItem.type === '通知横幅'&&(!pageItem.store_no||pageItem.store_no===storeInfo.store_no)"
      :beforeClick="beforeClick" ref="noticeList" :storeNo="storeNo" :pageItem="pageItem">
    </notice-list>
    <relation-store v-else-if="pageItem && pageItem.type === '关联店铺'" :beforeClick="beforeClick" ref="relationStore"
      :storeNo="storeNo" :pageItem="pageItem"></relation-store>
    <timeline-list :showProfile="false" :profile="userInfo.profile_url" :beforeClick="beforeClick" :storeNo="storeNo"
      noMargin showMore :condition="timelinecondition" :limit="3" :showPublish="false"
      v-else-if="storeNo && pageItem && pageItem.type === '朋友圈' && userInfo && userInfo.userno"></timeline-list>
    <link-wifi :store_no="storeNo" :beforeClick="beforeClick"
      v-else-if="storeNo && pageItem && pageItem.type === '连接WiFi'">
    </link-wifi>
    <bx-list ref="normalList" v-else-if="storeNo && pageItem && pageItem.type === '通用列表'" :beforeClick="beforeClick"
      :pageItem="pageItem" class="bx-list" />
    <user-card v-else-if="storeNo && pageItem && pageItem.type === '用户卡片'" :page-item="pageItem" :config="moreConfig"
      ref="userCard">
    </user-card>
    <vip-card :config="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '会员卡片'" :beforeClick="beforeClick"
      ref="vipCard">
    </vip-card>
    <avatar-list :storeNo="storeNo" :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '用户展示'"
      :beforeClick="beforeClick"></avatar-list>
    <!-- 公众号关注组件 -->
    <view class="official-account " v-else-if="storeNo && pageItem && pageItem.type === '公众号关注'">
      <text class="text" v-if="pageItem&&pageItem.tip_text">{{pageItem.tip_text}}</text>
      <text class="text" v-else-if="moreConfig&&moreConfig.text">{{moreConfig.text}}</text>
      <text class="text" v-else> 关注公众号，重要消息不再错过~</text>
      <button class="cu-btn bg-white sm round" style="color: #ee7b77;" @click="toOfficial()"
        v-if="pageItem.right_btn_name">{{pageItem.right_btn_name}}</button>
      <button class="cu-btn bg-white sm round" style="color: #ee7b77;" @click="toOfficial()" v-else>立即关注</button>
    </view>
    <!-- 优惠券列表  -->
    <coupon-list :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '优惠券列表'" />
    <!-- 通用多级选择-预约组件 -->
    <multistep-picker :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '通用预约'" />
    <queue-info :config="pageItem.more_config.queueCfg"
      v-else-if="storeNo && pageItem && pageItem.type === '排队信息'&&pageItem.more_config&&pageItem.more_config.queueCfg" />
    <score-input :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '根据高考总分推荐学校'" />
    <float-button :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '悬浮按钮'" />
    <poster-popup :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '海报弹窗'" />
    <data-display :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '数据展示'" />
    <my-earnings :page-item="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '我的收益'" />
    <content-card :queryOptions="queryOptions" :page-item="pageItem"
      v-else-if="storeNo && pageItem && pageItem.type === '内容卡片'" />
  </view>
</template>

<script>
  import slideList from '../slide-picture/slide-picture.vue';
  import storeInfo from '../store-info/store-info.vue';
  import buttonList from '../button-group/button-group.vue';
  import goodsList from '../goods-list/goods-list.vue';
  import vaccineList from '../vaccine-list/vaccine-list.vue';
  import newsList from '../news-list/news-list.vue';
  import staffManage from '../staff-manage/staff-manage.vue';
  import noticeList from '../notice-list/notice-list.vue';
  import relationStore from '../relation-store/relation-store.vue';
  import timelineList from './timeline-list/timeline-list.vue';
  import linkWifi from '../link-wifi/link-wifi.vue';
  import bxList from '../bx-list/bx-list.vue';
  import vipCard from '../vip-card/vip-card.vue'
  import avatarList from '../avatar-list/avatar-list.vue'
  import userCard from '../user-info/user-info.vue'
  import couponList from '../coupon-list/coupon-list.vue'
  import multistepPicker from '../multistep-picker/multistep-picker.vue'
  import queueInfo from '../queue-info/queue-info.vue'
  import scoreInput from '../score-input/score-input.vue'
  import floatButton from '../float-button/float-button.vue'
  import posterPopup from '../poster-popup/poster-popup.vue'
  import dataDisplay from '../data-display/data-display.vue'
  import myEarnings from '@/storePages/home/my-earnings/my-earnings.vue'
  import contentCard from '@/storePages/home/content-card/content-card.vue'
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
      linkWifi,
      bxList,
      vipCard,
      avatarList,
      userCard,
      couponList,
      multistepPicker,
      queueInfo,
      scoreInput,
      floatButton,
      posterPopup,
      dataDisplay,
      myEarnings, //我的收益
      contentCard
    },
    props: {
      queryOptions: {
        type: Object
      },
      pageItem: {
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
      },
      beforeClick: {
        type: Function,
        default: null
      },
      isManage: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      pageItem: {
        immediate: true,
        deep: true,
        handler(newValue, oldValue) {
          // if (newValue?.type === '用户展示' && this.avatarList.length == 0) {
          //   setTimeout(() => {
          //     this.getUserList();
          //   }, 1000)
          // }
        }
      }
    },
    computed: {
      rightBtn() {
        if (this.pageItem?.button_title_right_label && this.pageItem?.button_title_right_url) {
          return {
            label: this.pageItem?.button_title_right_label,
            url: this.pageItem?.button_title_right_url
          }
        }
        return this.moreConfig?.rightBtn
      },
      moreConfig() {
        return this.pageItem?.more_config
      },
      itemStyle() {
        let style = {}

        if (typeof this.pageItem?.more_config === 'object' && typeof this.pageItem?.more_config?.style === 'object') {
          style = this.pageItem?.more_config?.style || {};
        }

        if (this.pageItem?.type === '用户卡片' && this.pageItem?.user_card_type === '卡包') {
          style['background-color'] = this.pageItem?.component_bg_color ? 'transparent' : "#fff"
        }
        if (this.pageItem?.component_bg_color && this.pageItem?.component_bg_color !== '否') {
          let color = this.pageItem?.component_bg_color;
          if (color == '透明') {
            style['background-color'] = 'transparent'
          } else {
            style['background-color'] = this.pageItem?.component_bg_color
          }
        }
        if (this.pageItem?.component_bg_img && this.pageItem?.component_bg_img !== '否') {
          // style['background-color'] = null
          style['background-image'] = `url(${this.getImagePath(this.pageItem?.component_bg_img,true)})`
          style['background-repeat'] = 'no-repeat'
          style['background-size'] = "100% 100%"
        }
        if (style.background && style.background.indexOf('否') !== -1) {
          style.background = null
          delete style.background
        }
        // style['background-color'] = style.background || '#fff'
        if (style['background-image']) {
          style.background = ''
          delete style.background
        }
        // if(!style['background-color']){
        //   style['background-color'] = '#fff'
        // }
        if (this.pageItem?.button_style === '仅图片') {
          style['border-radius'] = '0'
        }
        if (this.pageItem?.margin) {
          style.margin = this.pageItem?.margin
        }
        if (this.pageItem?.is_radius === '否') {
          style['border-radius'] = '0'
        }
        if (this.pageItem?.is_radius === '是') {
          style['border-radius'] = '10px'
        }
        if (!style['background'] && !style['background-color'] && !style['background-image']) {
          style['background-color'] = '#fff'
        }
        if (this.pageItem.type == '用户卡片' && this.pageItem.user_card_type === '卡包') {
          delete style['background-color']
          style['border-radius'] = '0'
        }
        let str = ''
        if (Object.keys(style).length > 0) {
          Object.keys(style).forEach(key => {
            str += `${key}:${style[key]||''};`
          })
        }
        return str || style
      },
      titleStyle() {
        if (typeof this.pageItem?.more_config === 'object') {
          return this.pageItem?.more_config?.titleStyle || '';
        }
      },
      isShow() {
        if (this.pageItem?.type === '连接WiFi') {
          return this.moreConfig?.alwaysShow == true || this.room_no;
        } else {
          return true;
        }
      },
      room_no() {
        let globalData = getApp().globalData;
        return globalData?.room_no;
      },
      storeNo() {
        return this.storeInfo?.store_no;
      },
      timelinecondition() {
        return [{
          colName: 'store_no',
          ruleType: 'eq',
          value: this.storeNo
        }];
      }
    },
    data() {
      return {
        avatarList: [],
        total: ""
      };
    },
    created() {
      uni.$on('setTotal', (e) => {
        this.total = e
      })

      uni.$on('updateStoreItemData', () => {
        this.onRefresh();
      });
    },
    methods: {
      onRightBtn() {
        let url = this.rightBtn?.url
        let data = {
          storeNo: this.storeNo,
          ...this.$data,
          storeInfo: this.storeInfo,
          userInfo: this.userInfo,
          bindUserInfo: this.bindUserInfo,
          storeUserInfo: this.bindUserInfo
        }

        url = this.renderStr(url, data);

        if (url && url.indexOf('https') == 0) {
          url = `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(url)}`
        }

        uni.navigateTo({
          url
        })

      },
      listLoadMore() {
        if (this.pageItem.type === '通用列表') {
          this.$refs?.normalList?.loadMore?.()
        }
      },
      toOfficial(toSub = false) {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        // 跳转到关注公众号页面
        const frontEndAddress = this.$api.frontEndAddress
        let mp_no = this.pageItem?.mp_no || this.moreConfig?.mp_no
        if (mp_no) {
          let webUrl =
            `${frontEndAddress}storePages/officialIntro/officialIntro?mp_no=${mp_no}`
          let url =
            `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
          uni.navigateTo({
            url
          })
        } else {
          uni.showToast({
            title: '请配置目标应用编号',
            icon: 'none'
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
            this.avatarList = res.data.data.map(item => {
              if (item.profile_url) {
                return this.getImagePath(item.profile_url, true);
              } else if (item.user_image) {
                return this.getImagePath(item.user_image, true);
              }
            });
          }
        });
      },
      toUserDetail() {
        if (this.pageItem?.more_config?.url) {
          uni.navigateTo({
            url: this.pageItem?.more_config?.url
          });
        }
      },
      // toOpenVip() {
      // 	let url = this.pageItem?.more_config?.open_url
      // 	if (url) {
      // 		url = this.renderStr(url, this)
      // 		uni.navigateTo({
      // 			url: url
      // 		});
      // 	}
      // },
      getQrcode(e) {
        this.$emit('getQrcode', e);
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
        this.$emit('setHomePage');
      },
      addToStore() {
        this.$emit('addToStore');
      },
      toConsult() {
        this.$emit('toConsult');
      },
      bindStore() {
        this.$emit('bindStore');
      },
      toDoctorDetail(e) {
        this.$emit('toDoctorDetail', e);
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
                this.$refs.articleList.getTabs();
              }
              break;
            case '疫苗列表':
              if (this.$refs && this.$refs.vaccineList && this.$refs.vaccineList.getVaccineList) {
                this.$refs.vaccineList.getVaccineList();
              }
              break;
            case '轮播图':
              // if (this?.$refs?.swiperList?.getSwiperList) {
              //   debugger
              //   this.$refs.swiperList.getSwiperList?.();
              // }
              break;
              // case '商品列表':
              //   if (this.$refs && this.$refs.goodsList && this.$refs.goodsList.getGoodsListData) {
              //     this.$refs.goodsList.getGoodsListData();
              //   }
              //   break;
            case '通知横幅':
              if (this.$refs && this.$refs.noticeList && this.$refs.noticeList.getList) {
                this.$refs.noticeList.getList();
              }
              break;
            case '用户卡片':
              if (this.$refs && this.$refs.userCard && this.$refs.userCard.getList) {
                // this.$refs.userCard.getList();
              }
              break;
            case '会员卡片':
              if (this.$refs?.vipCard?.getCard) {
                this.$refs.vipCard.getCard();
              }
              break;
          }
        }
      }
    }
  };
</script>

<style scoped lang="scss">
  .store-item {
    // background-color: #fff;
    border-radius: 20rpx;
    margin: 20rpx;
    overflow: hidden;
    // padding: 20rpx;
    box-sizing: border-box;

    &.is-swiper {
      padding: 0;
      margin-top: 10rpx;
      min-width: 300px;
    }

    &.bg-transparent {
      background-color: transparent;
    }

    &.noMargin {
      margin: 0;
      border-radius: 0;
    }

    &.noPadding {
      padding: 0;
      border-radius: 0;
    }
  }

  .title {
    padding: 20rpx;
    position: relative;
    // padding-left: 40rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-family: 苹方-简;
    font-weight: normal;
    color: #474849;
  }

  .right-btn {
    display: flex;
    align-items: center;
  }

  .user-avatar-list {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .share-menu {
      border-left: 1px solid #f1f1f1;
    }
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

  .official-account {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #ee7b77;
    border-radius: 10px;
    color: #fff;

    .text {
      flex: 1;
    }
  }
</style>
