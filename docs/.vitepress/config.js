export default {
  title: "百想首页",
  description: "配置说明文档",
  base: "/health/docs/",
  themeConfig: {
    siteTitle: "百想首页",
    logo: "/logo.jpg",
    algolia: {
      appId: "8F5Y6H6WKT",
      apiKey: "53ef09f0a80fe0ad343db5ede491c552",
      indexName: "home",
      container: "#docsearch",
      debug: false,
    },
    nav: [
      { text: "店铺相关", link: "/articles/store/" },
      { text: "首页组件配置", link: "/articles/store/components" },
      { text: "表单页面", link: "/articles/form/" },
      //   {
      //     text: "Drop Menu",
      //     items: [
      //       { text: "Item A", link: "/item-1" },
      //       { text: "Item B", link: "/item-2" },
      //       { text: "Item C", link: "/item-3" },
      //     ],
      //   },
      //   {
      //     text: "Drop Menu2",
      //     items: [
      //       {
      //         items: [
      //           { text: "Item A1", link: "/item-A1" },
      //           { text: "Item A2", link: "/item-A2" },
      //         ],
      //       },
      //       {
      //         items: [
      //           { text: "Item B1", link: "/item-B1" },
      //           { text: "Item B2", link: "/item-B2" },
      //         ],
      //       },
      //     ],
      //   },
      // { text: "gitee", link: "https://gitee.com/jiaiqi" },
    ],
    sidebar: {
      "/articles/": [
        {
          text: "表单页面",
          items: [
            // {
            //   text: "公共",
            //   link: "/articles/form/",
            // },
            { text: "添加", link: "/articles/form/add" },
            { text: "详情", link: "/articles/form/detail" },
          ],
        },
        {
          text: "详情",
          items: [
            // {
            //   text: "公共",
            //   link: "/articles/form/",
            // },
            { text: "模板配置", link: "/articles/detail/template" },
          ],
        },
        {
          text: "列表页面",
          items: [
            {
              text: "列表配置",
              link: "/articles/list/",
            },
            { text: "操作栏", link: "/articles/list/listbar" },
            { text: "快捷筛选", link: "/articles/list/filter-tag" },
            { text: "tabs", link: "/articles/list/tabs" },
            { text: "全屏筛选", link: "/articles/list/full-screen-filter" },
          ],
        },
        {
          text: "店铺相关配置",
          link: "/articles/store/",
          items: [
            {
              text: "创建店铺",
              link: "/articles/store/create",
            },
            { text: "店铺首页组件", link: "/articles/store/components" },
          ],
        },
        {
          text: "店铺首页组件",
          link: "/articles/components/",
          items: [
            {
              text: "轮播图",
              link: "/articles/components/carousel",
            },
            { text: "店铺信息", link: "/articles/components/store-info" },
          ],
        },
        // {
        //   text: "vue教程",
        //   items: [
        //     {
        //       text: "pina和vuex",
        //       link: "/articles/pina和vuex",
        //     },
        //   ],
        // },
      ],
    },
  },
};
