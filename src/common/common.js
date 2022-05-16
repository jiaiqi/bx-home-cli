export default {
  install(Vue, options) {
    Vue.prototype.getQueryString = function(name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      var r = window.location.search.substr(1).match(reg)
      if (r != null) return unescape(r[2]);
      return null
    }

    Vue.prototype.getFooterBtns = function(e) {
      // type : "duplicate" | edit | delete | detail
      let btns = e
      let footerBtns = btns.filter((item) => item.permission === true && (item.button_type === 'edit' || item
        .button_type ===
        'delete' || item.button_type === 'deletedraft' || item.button_type === 'closeproc' || item.button_type ===
        'deleteproc' || item.button_type === 'startproc' || item.button_type === 'customize'))
      return footerBtns
    }

    Vue.prototype.setImgSize = (content, max) => {
      // 让图片最长边等于设置的最大长度，短边等比例缩小，图片控件真实改变，区别于aspectFit方式。
      max = max || 350;
      let maxW = uni.upx2px(max); //max是定义消息图片最大宽度
      let maxH = uni.upx2px(max); //max是定义消息图片最大高度
      if (content.width > maxW || content.height > maxH) {
        let scale = content.width / content.height;
        content.width = scale > 1 ? maxW : maxH * scale;
        content.height = scale > 1 ? maxW / scale : maxH;
      }
      return content;
    }
    Vue.prototype.getImageUrl = async function(fileNo) {
      let self = this
      let req = {}
      req.serviceName = 'srvsys_file_select'
      req.colNames = ['*']
      req.condition = []
      req.condition = [{
        'colName': 'file_no',
        'value': fileNo,
        'ruleType': 'eq'
      }]
      req.page = null
      req.order = null
      const response = await this.$http.post(self.$api.select, req)
      if (response.data.data) {
        let fileurl = response.data.data
        fileurl = fileurl.map((item) => {
          item._url = self.$api.getFilePath + item.fileurl
          return item
        })
        return fileurl
      } else {
        return '查询失败'
      }
    }

    Vue.prototype.deleteRow = async function(srv, cond) { // 删除数据
      let self = this
      let reqs = []
      let req = {}
      req.serviceName = srv
      req.condition = cond
      reqs.push(req)
      const response = await this.$http.post(self.$api.delete, reqs)
      if (response.data.state === 'SUCCESS') {
        return response.data.response
      } else {
        return '删除失败'
      }
    }
  }
}
