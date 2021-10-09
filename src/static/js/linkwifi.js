const app = getApp();
let isOpenWifi = true
let platform;
let wifiList = [];
let callBackFunc;

// 仅 Android 6 与 iOS 11 以上版本支持
function checkPlatform() {
  return new Promise((resolve, reject) => {
    // 检测手机型号
    wx.getSystemInfo({
      success: function(res) {
        let system = '';
        if (res.platform == 'android') system = parseInt(res.system.substr(8));
        if (res.platform == 'ios') system = parseInt(res.system.substr(4));
        if (res.platform == 'android' && system < 6) {
          reject();
        }
        if (res.platform == 'ios' && system < 11) {
          reject();
        }

        platform = res.platform
        resolve(res.platform);
      },
      fail: function(res) {
        wx.showToast({
          title: '请求失败',
          icon: "none",
          duration: 3000
        })
      }
    })
  })
}

// 1. 可直接使用该方法去连接 Wi-Fi
function startConnectWifi(account, password) {
  return new Promise((resolve, reject) => {
    wx.startWifi({
      success(res) {
        connectWifi(account, password).then((res) => {
          uni.showModal({
            title: '提示',
            content: '连接成功',
            showCancel: false
          })
          resolve(res)
        }).catch((res) => {
          console.log('连接失败：', res)
          reject(res)
        })
      },
      fail(res) {
        if (res.errCode) {
          checkWifiErr(res.errCode, res.errMsg)
        } else {
          wx.showToast({
            title: '初始化WiFi失败',
            icon: "none",
            duration: 3000
          })
        }
        uni.hideLoading()
        reject()
      },
      complete: () => {}
    })
  })
}

// 2. 可直接使用该方法去搜索 Wi-Fi
function startSearchWifi(func) {
  callBackFunc = func
  startWifi()
}

// 初始化 WiFi 模块
function startWifi() {
  function toStartWifi() {
    wx.startWifi({
      success(res) {
        getWifiListFunc();
      },
      fail(res) {
        console.error(res)
        if (res.errCode) {
          checkWifiErr(res.errCode, res.errMsg)
        } else {
          wx.showToast({
            title: '初始化WiFi失败',
            icon: "none",
            duration: 3000
          })
        }

      }
    })
  }
  checkPlatform().then(platform => {
    if (platform === 'ios') {
      uni.showModal({
        title: '提示',
        content: '由于系统限制，需要在WiFi设置中等待WiFi扫描完成，然后返回小程序，才能获取到附近WiFi列表，是否跳转到设置页面？',
        success: (res) => {
          if (res.confirm) {
            toStartWifi()
          }
        }
      })
    } else {
      toStartWifi()
    }
  })
}

// 请求获取 WiFi 列表
function getWifiListFunc() {
  if (platform == 'ios') {
    getWifiList();
  } else {
    wx.getSetting({
      success(res) {
        //地理位置
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              getWifiList();
            },
            fail(res) {
              wx.showModal({
                title: '提示',
                content: '定位失败，您未开启定位权限，点击开启定位权限',
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function(res) {
                        if (res.authSetting['scope.userLocation']) {
                          getWifiList();
                        } else {
                          wx.showToast({
                            title: '用户未开启地理位置权限',
                            icon: "none",
                            duration: 3000
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          getWifiList();
        }
      }
    })
  }
}

function getWifiList() {
  wx.getWifiList({
    success: function(res) {
      // 监听获取到 WiFi 列表数据事件
      wx.onGetWifiList(function(res) {
        wifiList = []
        let tmpList = []
        if (res && res.wifiList) {
          res.wifiList.map(item => {
            if (tmpList.indexOf(item.SSID) == -1) {
              tmpList.push(item.SSID)
              wifiList.push(item)
            }
          })
          callBackFunc(wifiList)
        }
      })
    },
    fail: function(res) {
      if (res.errCode) {
        checkWifiErr(res.errCode, res.errMsg)
      } else {
        wx.showToast({
          title: '获取 Wi-Fi 列表数据失败',
          icon: "none",
          duration: 3000
        })
      }
    }
  })
}

// 连接 WiFi。若已知 WiFi 信息，可以直接利用该接口连接。仅 Android 与 iOS 11 以上版本支持
function connectWifi(account, password) {
  return new Promise((resolve, reject) => {
    let wifiCount = 0
    let wifiTimer = setInterval(() => {
      wifiCount++
      if (wifiCount >= 30) {
        clearInterval(wifiTimer)
        reject()
      }
    }, 1000)

    // 获取当前网络的名称
    getConnectedWifi().then((res) => {
      if (res.SSID == account) {
        clearInterval(wifiTimer)
        resolve()
      } else {

        uni.showLoading({
          title: '连接中...'
        })

        // ios 无论连网成功还是失败，都会走 success 方法，所以 ios 需要特别判断一下
        wx.connectWifi({
          SSID: account,
          password: password,
          success(res) {
            uni.hideLoading()
            // ios 判断当前手机已连网账号与要连网的账号是否一致，来确定是否连网成功
            if (platform == 'ios') {
              // 6.监听连接上 WiFi 的事件
              wx.onWifiConnected(function(res) {
                clearInterval(wifiTimer)
                if (res.wifi.SSID == account) {
                  resolve()
                } else {
                  reject()
                }
              })

            } else {
              clearInterval(wifiTimer)
              resolve()
            }
          },
          fail(res) {
            if (res.errCode) {
              checkWifiErr(res.errCode, res.errMsg)
            }
            clearInterval(wifiTimer)
            uni.hideLoading()
            reject(res)
          }
        })
      }
    }).catch((res) => {
      clearInterval(wifiTimer)

      reject(res)
    })
  })
}

// 获取当前网络的名称
function getConnectedWifi() {
  return new Promise((resolve, reject) => {
    wx.getConnectedWifi({
      success: res => {
        resolve(res.wifi)
      },
      fail: res => {
        if (res.errCode) {
          checkWifiErr(res.errCode, res.errMsg)
        }
        resolve(res)
      }
    })
  })
}

const checkWifiErr = (code, msg) => {
  let text = ''
  switch (code) {
    case 12001:
      text = '当前系统不支持相关能力'
      break;
    case 12002:
      text = '密码错误'
      break;
    case 12003:
      text = '连接超时'
      break;
    case 12004:
      text = '重复连接WiFi'
      break;
    case 12005:
      text = '未打开 Wi-Fi 开关'
      isOpenWifi = false
      break;
    case 12006:
      text = '未打开 GPS 定位开关'
      break;
    case 12007:
      text = '用户拒绝授权链接 Wi-Fi'
      break;
    case 12008:
      text = '无效 SSID'
      break;
    case 12009:
      text = '系统运营商配置拒绝连接 Wi-Fi'
      break;
    case 12010:
      console.log(msg);
      if (msg) {
        if (msg.indexOf('gain current wifi')) {
          // text = '当前WiFi已连接'
        }
      }
      break;
    case 12013:
      text = '系统保存的 Wi-Fi 配置过期，建议忘记 Wi-Fi 后重试'
      break;
  }
  if (text) {
    // uni.showToast({
    //   title: text,
    //   icon: 'none',
    //   duration: 3000
    // })
    uni.showModal({
      title: '提示',
      content: text,
      showCancel: false
    })
  }
}

export default {
  checkPlatform, // 检测平台是否支持
  startConnectWifi, // 开始连接已知网络
  startSearchWifi, // 开始搜索周边网络
  connectWifi, // 连接网络
  getConnectedWifi, // 获取当前网络的名称
  checkWifiErr
}
