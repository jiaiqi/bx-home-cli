export default {
  methods: {
    async handleSubmitValidate(submit_validate,data) {
      let result = true
      if (Array.isArray(submit_validate) && submit_validate.length > 0) {
        for (let i = 0; i < submit_validate.length; i++) {
          const item = submit_validate[i]
          if (result === false) {
            break
          }
          if (item.relation && ['lt', 'le', 'gt', 'ge', 'eq'].includes(item
              .relation)) {
            let left_key = item.left_child.no;
            let right_key = item.right_child.no;
            let left_data = this.childListData[left_key]
            let right_data = this.childListData[right_key]
            if (item.right_child.condition && Array.isArray(item.right_child
                .condition) && item
              .right_child.condition.length > 0 && Array.isArray(right_data)
            ) {
              right_data = right_data.filter(rd => {
                let valid = 0;
                item.right_child.condition.forEach(cond => {
                  if (cond.ruleType == 'eq') {
                    if (cond.value === rd[cond
                        .colName]) {
                      valid += 1
                    }
                  }
                })
                if (valid === item.right_child.condition.length) {
                  return true
                }
              })
            }
            let leftCol = item.left_child.col
            let rightCol = item.right_child.col
            let leftVal = left_data.reduce((pre, cur) => {
              if (cur[leftCol]) {
                pre += cur[leftCol]
              }
              return pre
            }, 0)

            let rightVal = right_data.reduce((pre, cur) => {
              if (cur[rightCol]) {
                pre += cur[rightCol]
              }
              return pre
            }, 0)

            switch (item.relation) {
              case 'lt':
                if (leftVal >= rightVal) {
                  result = false
                  uni.showToast({
                    title: item.tip,
                    icon: "none",
                    duration: 3000
                  })
                }
                break;
              case 'le':
                if (leftVal > rightVal) {
                  result = false
                  uni.showToast({
                    title: item.tip,
                    icon: "none",
                    duration: 3000
                  })
                }
                break;
              case 'ge':
                if (leftVal < rightVal) {
                  result = false
                  uni.showToast({
                    title: item.tip,
                    icon: "none",
                    duration: 3000
                  })
                }
                break;
              case 'gt':
                if (leftVal <= rightVal) {
                  result = false
                  uni.showToast({
                    title: item.tip,
                    icon: "none",
                    duration: 3000
                  })
                }
                break;
              case 'eq':
                if (leftVal !== rightVal) {
                  result = false
                  uni.showToast({
                    title: item.tip,
                    icon: "none",
                    duration: 3000
                  })
                }
                break;
            }
          } else if (['all-child-has-data'].includes(item.type)) {
            // 所有子表都必须有数据
            debugger
            if (this.childService.length > data.child_data_list.length) {
              result = false
              let labels = this.childService.map(item => item.label).toString()
              uni.showModal({
                title: '提示',
                content: `请确认${labels||'数据'}均已填写`,
                showCancel: false,
                success: (res) => {
                  if (res.confirm) {
                    // resolve(true)
                  } else {
                    // resolve(false)
                  }
                }
              })
            }
          } else if (['data-empty', 'no-repeat'].includes(item.type)) {
            // 校验重复数据及空数据
            // data-empty:没有数据时不通过；no-repeat：有数据时不通过

            const service = item.service
            let condition = []
            if (Array.isArray(item.condition)) {
              condition = item.condition.map(cond => {
                let obj = {
                  colName: cond.colName,
                  ruleType: cond.ruleType,
                  value: ''
                }
                if (cond?.value?.value_type === 'rowData') {
                  obj.value = data[cond?.value?.value_key]
                } else if (cond?.value?.value_type === 'constant') {
                  obj.value = cond?.value?.value
                }
                return obj
              })
            }
            let url = this.getServiceUrl(item?.app || this.appName || uni
              .getStorageSync('activeApp'), service, 'select');
            let req = {
              "serviceName": service,
              "condition": condition,
              colNames: ['*'],
              page: {
                pageNo: 1,
                rownumber: 1
              }
            }
            let res = await this.$http.post(url, req)
            if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
              let noPass = false
              if (item.type === 'no-repeat') {
                if (res.data.data.length > 0) {
                  result = false
                  noPass = true
                }
              } else {
                if (res.data.data.length <= 0) {
                  result = false
                  noPass = true
                }
              }
              if (noPass && item.fail_tip) {
                uni.showToast({
                  title: item.fail_tip,
                  icon: 'none'
                })
              }
            }
          } else if (item.type === 'followOfficial') {
            // 检查是否关注公众号
            let res = await this.checkSubscribeStatus()
            if (!res) {
              result = false
              let confirm = await new Promise((resolve) => {
                uni.showModal({
                  title: '提示',
                  content: '请先关注百想助理公众号，以便及时收到新消息通知',
                  confirmText: '去关注',
                  success: (res) => {
                    if (res.confirm) {
                      resolve(true)
                    } else {
                      resolve(false)
                    }
                  }
                })
              })
              if (confirm === true) {
                if (this.$api?.env === 'prod') {
                  this.toOfficial()
                  return
                }
              } else {
                return
              }
            }
          }
        }
      }
      return result
    },
  }
}
