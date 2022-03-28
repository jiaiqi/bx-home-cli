<template>
  <view v-if="config" class="view-wrap">
    <view class="top-box" :style="[getStyle(config)]">
      <image class="logo" :src="getImagePath(config.top_block_image,true)" mode="" v-if="config.top_block_image">
      </image>
      <view class="title">
        {{config.top_block_remind_txt||''}}
      </view>
      <view class="tip">
        {{config.navigation_remind_txt||''}}
      </view>
    </view>
    <view class="official-box">
      <view class="title">
        关注百想助理公众号，消息通知不错过
      </view>
      <view class="hint">
        为了您的相关通知消息、咨询信息能及时提醒、需要您关注“百想助理”公众号
      </view>
    </view>
    <view class="official-nav">
      <view class="main-title">
        点击下方卡片即可前往
      </view>
      <view class="official-card">
        <view class="top">
          <view class="icon-box">
            <image src="../../static/basicprofile.jpg" class="icon" mode=""></image>
            <view class="text">
              百想科技
            </view>
          </view>
          <view class="content">
            <view class="title">
              <text>百想助理</text>
              <text class="cuIcon-right margin-left-xs"></text>
            </view>
            <view class="tip">
              为用户提供定制化的<text class="text-blue">“助理”</text>功能软件服务，包括个人服务工具、协同工具、健康管理工具等，按用户需求定制的个性化工具。
            </view>
          </view>
        </view>
        <view class="bottom">
          公众号
        </view>
      </view>
    </view>

    <view class="button-box">
      <button class="cu-btn lg" v-for="(btn,index) in buttons" :style="[getStyle(btn)]" :key="index"
        @click="onClick(btn)">{{btn.button_name||''}}</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        page_no: "",
        config: '',
        buttons: []
      }
    },
    computed: {
    },
    methods: {
      getStyle(e) {
        let style = {}
        if (e?.top_block_bg_color) {
          style.background = e.top_block_bg_color
        }
        if(e?.button_font_color){
          style.color = e.button_font_color
        }
        if(e?.button_border_color){
          style.border = `1px solid ${e.button_border_color}`
        }
        if(e?.button_bg_color){
          style.background = e.button_bg_color
        }
        
        return style
      },
      onClick(e) {
        let {
          button_goto_path
        } = e
        if(button_goto_path){
          let data = {
            storeInfo:this.storeInfo,
            bindUserInfo:this.vstoreUser,
          }
          button_goto_path = this.renderStr(button_goto_path,data)
          uni.redirectTo({
            url:button_goto_path
          })
        }
      },
      async getButtons() {
        let req = {
          serviceName: 'srvhealth_store_page_button_select',
          condition: [{
            colName: 'page_no',
            ruleType: 'eq',
            value: this.page_no
          }]
        };
        let res = await this.$fetch('select', 'srvhealth_store_page_button_select', req, 'health');
        if (res.data.length > 0) {
          this.buttons = res.data
        }
      },
      async getConfig() {
        let req = {
          serviceName: 'srvhealth_store_page_config_select',
          condition: [{
            colName: 'page_no',
            ruleType: 'eq',
            value: this.page_no
          }]
        };
        let res = await this.$fetch('select', 'srvhealth_store_page_config_select', req, 'health');
        if (res.data.length > 0) {
          this.config = res.data[0]
        }
      },
    },
    onLoad(option) {
      if (option.page_no) {
        this.page_no = option.page_no
        this.getConfig()
        this.getButtons()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .view-wrap {
    min-height: 100vh;
    overflow-y: scroll;
    background-color: #f8f8f8;
    display: flex;
    flex-direction: column;
  }

  .top-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    color: #fff;

    .logo {
      width: 80px;
      height: 80px;
      margin: 15px auto;
    }

    .title {
      margin-bottom: 20px;
      font-size: 18px;
    }
  }

  .official-box {
    padding: 15px;
    background-color: #fff;
    margin-top: 10px;

    .title {
      font-weight: bold;
      font-size: 16px;
    }

    .hint {
      color: #c3c3c6;
      padding-top: 10px;
    }
  }

  .official-nav {
    padding: 15px;
    background-color: #fff;
    margin-top: 10px;

    .main-title {
      padding-bottom: 20px;
      text-align: center;
      font-size: 18px;
      color: #3c99ff;
      font-weight: bold;
      position: relative;
      z-index: 1;

      &::after {
        content: '';
        width: 80%;
        height: 20px;
        background-color: #cce4ff;
        border-radius: 10px;
        position: absolute;
        bottom: 15px;
        left: 10%;
        z-index: -1;
      }
    }

    .official-card {
      background-color: #f8f8fa;
      border-radius: 10px;
      padding: 20px;

      .top {
        display: flex;
        align-items: flex-start;

        .icon-box {
          background-color: #fff;
          border-radius: 5px;
          margin-right: 10px;
          padding: 5px;
          text-align: center;
          width: 60px;
          height: 60px;

          .text {
            color: #b9bbc7;
            font-size: 10px;
            transform: scale(0.8) translateY(-10px);
          }
        }

        .icon {
          width: 40px;
          height: 40px;
          border-radius: 5px;
        }

        .content {
          flex: 1;

          .title {
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }

          .tip {
            color: #b9bbc7;
            display: -webkit-box;
            overflow: hidden;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }

      .bottom {
        margin-top: 10px;
        padding: 5px;
        border-top: 1px solid #F1F1F1;
        color: #b9bbc7;
      }
    }
  }

  .button-box {
    margin: 20px 0;
    flex:1;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    .cu-btn{
      border-radius: 20px;
      margin-right: 10px;
      &:last-child{
        margin-right: 0;
      }
    }
  }
</style>
