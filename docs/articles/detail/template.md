# 详情页面模板

## 配置一

```js
{
 "detail_config":{
     "img":{
         "col":"img", //字段名
         "cfg":{
            "radius":"50%" 
         }    
     },
     "top_col":[
          {
             "col":"person_name",
             "label":false,
             "color":"#333333",
             "font_size":"16px",
             "width":"100%"
         },
         {
               "col":"person_phone",
             "label":"联系方式",
             "color":"#ADAEBB",
             "font_size":"14px",
             "width":"100%"  
         }
     ],
     "cols":[
         {
             "col":"introduction",
             "label":{ // label属性配置 false不显示
               "font_size":"16px",
               "color":"#333",
               "position":"top"  
             },
             "color":"#ADAEBB",
             "font_size":"14px",
             "width":"100%"  
         }
     ]
 }

}
```

## 配置二

```js
{
  "appTempColMap":{
     "img": "goods_img",
     "title": "goods_name",
     "tip": "online_state",
     "subTitle": "store_name",
     "price": "amount",
     "left": "price_cost",
     "right": "price",
     "footer": "goods_desc"
 }
}
// 没有在appTempColMap中配置的字段都会在展开详情中显示
```
