# 列表全屏筛选配置

```js
// 列表全屏筛选配置 需要在url上传入参数`topQueryMode=true`
    {
    "float_query_cfg": {
            "query_cols": [
                {
                    "column":"policy_industry",
                    "add":"industry" //添加服务中对应的字段
                }
            ],
            "use_add_v2":true,//查询字段的配置是否使用add服务的
            "add_cfg":{
                "send_request":true, //是否在点击查询时发送add请求
                "service":"srvcosvc_corp_user_querys_add",
                "app":"fyzhmd"
            }
        }
    }
```
