export default {
  title: "百想首页",
  description: "配置说明文档",
  themeConfig: {
    siteTitle: "百想首页",
    logo: "/logo.jpg",
    nav: [
      { text: "店铺相关", link: "/articles/store/" },
      { text: "首页组件配置", link: "/articles/store/components" },
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
      { text: "gitee", link: "https://gitee.com/jiaiqi" },
    ],
    sidebar: {
      "/articles/": [
        {
          text: "店铺相关配置",
          items: [
            {
              text: "创建店铺",
              link: "/articles/store/create",
            },
            { text: "店铺首页组件", link: "/articles/store/components" },
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
