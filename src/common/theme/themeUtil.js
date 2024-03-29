import {
  mapState,
  mapGetters,
  mapMutations
} from 'vuex'
import Vue from 'vue'

let styleVarJson = {
  blue: '--primary-color:#337fff;--primary-color-rgb:rgb(51,127,255);--primary-color-rgb-opacity1:rgba(51,127,255,0.1);--primary-color-rgb-opacity3:rgba(51,127,255,0.3)',
  coffee: '--primary-color:#BFA58B; --primary-color-rgb:rgb(191,165,139); --primary-color-rgb-opacity1:rgba(191,165,139,0.1); --primary-color-rgb-opacity3:rgba(191,165,139,0.3);',
  red: ' --primary-color-rgb:rgb(254,90,63); --primary-color:#FE5A3F; --primary-color-rgb-opacity1:rgba(254,90,63,0.1); --primary-color-rgb-opacity3:rgba(254,90,63,0.3);--primary-btn-shadow: 0px 3px 6px rgba(254, 90, 63, 0.3);'
}

export default {
  install(Vue) {
    Vue.mixin({
      computed: {
        ...mapState({
          vtheme: state => state.app.theme
        })
      },
      methods: {
        ...mapGetters({
          getBtnBg: 'btnBg',
          getBtnColor: 'btnColor'
        }),
        getTheme() {
          return `theme-${this.vtheme}`
        },
        getStyleVar() {
          let styleVar = styleVarJson[this.vtheme]
          return getStyleVar
        },
      }
    })
  }
}
