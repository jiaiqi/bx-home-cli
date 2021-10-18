<template>
  <view class="page-wrap">
    <view class="main-form-edit">
      <a-form v-if="colsV2Data && isArray(fields)" :fields="fields" :srvApp="appName" :pageType="'add'"
        :formType="'add'" ref="bxForm" @value-blur="valueChange">
      </a-form>
    </view>
        <batch-add ref="batchAdd" :main-data="mainData" :selectColInfo="selectColInfo" @submit="batchSubmit">
        </batch-add>
  </view>
</template>

<script>
  import batchAdd from '@/publicPages/components/batch-add/batch-add.vue'
  export default {
    components: {
      batchAdd
    },
    data() {
      return {
        colsV2Data: null,
        mainData:{"hotel_no":"S2109260002"},
        fields: [{
          "column": "hotel_no",
          "label": "酒店编号",
          "defaultValue": "S2109260002",
          "isRequire": true,
          "type": "Selector",
          "moreConfig": {},
          "service_name": "srvhotel_item_sweep_add",
          "columns": "hotel_no",
          "table_name": "bxhotel_item_sweep",
          "table_column": "hotel_no",
          "bx_col_type": "fk",
          "col_type": "bxstore_hotel_info",
          "in_add": 2,
          "in_list": 2,
          "in_detail": 2,
          "in_update": 2,
          "in_cond": 0,
          "in_cond_def": 1,
          "updatable": 0,
          "col_span": 0.25,
          "pattern": "",
          "required": "否",
          "option_data_type": "remote",
          "option_list_v2": {
            "refed_col": "hotel_no",
            "serviceName": "srvstore_hotel_info_select",
            "key_disp_col": "hotel_name",
            "is_tree": false
          },
          "redundant": {
            "refedCol": "hotel_no",
            "dependField": "hotel_no",
            "trigger": "always"
          },
          "showExp": false,
          "display": false,
          "disabled": true,
          "_validators": {
            "max": 50,
            "min": null,
            "reg": "",
            "required": true,
            "msg": "",
            "isType": {}
          },
          "value": "S2109260002",
          "colData": {
            "id": 12,
            "hotel_no": "S2109260002",
            "hotel_name": "西安林豪酒店",
            "hotel_address": "陕西省西安市雁塔区长安南路196号(近国展中心)",
            "hotel_cert": "20210927131428903100",
            "hotel_tel": "029-89354211",
            "hotel_account": "PB21082910075333",
            "hotel_img": "20210927131432877100",
            "hotel_introduce": "西安林豪酒店位于西安市雁塔区长安南路，临近国展中心，交通便利，毗邻陕西师范大学等高校，学院气氛浓郁。酒店装修成古风，配设精致的圈椅，陶瓷茶具等衬托了沉静内敛的风格。宾馆另外配备会议厅宴会厅等专业设施，是您商务出行的优选。",
            "create_user": "okMrXs3Xbh5_v5c1CVU9RgJ-E258",
            "create_time": "2021-09-27 13:14:38",
            "create_user_disp": "高洋",
            "modify_time": "2021-10-09 15:54:39",
            "modify_user": "okMrXs3Xbh5_v5c1CVU9RgJ-E258",
            "modify_user_disp": "高洋",
            "del_flag": "否",
            "label": "西安林豪酒店/S2109260002",
            "value": "S2109260002"
          }
        }, {
          "column": "room_no",
          "label": "房间号",
          "isRequire": true,
          "type": "Selector",
          "moreConfig": {},
          "service_name": "srvhotel_item_sweep_add",
          "columns": "room_no",
          "table_name": "bxhotel_item_sweep",
          "table_column": "room_no",
          "bx_col_type": "fk",
          "col_type": "bxstore_hotel_room",
          "in_add": 1,
          "in_list": 1,
          "in_detail": 1,
          "in_update": 1,
          "in_cond": 0,
          "in_cond_def": 1,
          "updatable": 1,
          "list_min_width": null,
          "option_list": "{\n        \"serviceName\": 'srvstore_hotel_room_select',\n        \"srv_app\": 'store',\n        \"refed_col\": 'room_no',\n        \"key_disp_col\": 'room_no',\"show_as_pair\": false,\n        \"conditions\":[\n          {\n            \"colName\": \"hotel_no\",\n            \"value\": \"data.hotel_no\",\n            \"ruleType\": \"eq\"\n          }        ]\n}",
          "required": "否",
          "validators": ";required;ngMaxlength=50",
          "option_data_type": "remote",
          "option_list_v2": {
            "refed_col": "room_no",
            "show_as_pair": false,
            "srv_app": "store",
            "serviceName": "srvstore_hotel_room_select",
            "conditions": [{
              "colName": "hotel_no",
              "ruleType": "eq",
              "value": "S2109260002"
            }],
            "key_disp_col": "room_no"
          },
          "redundant": {
            "refedCol": "room_no",
            "dependField": "room_no",
            "trigger": "always"
          },
          "id": "__vue_devtool_undefined__",
          "showExp": true,
          "display": true,
          "disabled": false,
          "_validators": {
            "max": 50,
            "min": null,
            "reg": "",
            "required": true,
            "msg": "",
            "isType": {}
          },
          "value": null,
        }, {
          "column": "type",
          "label": "配送类型",
          "defaultValue": "立即配送",
          "isRequire": false,
          "type": "Selector",
          "moreConfig": {},
          "service_name": "srvhotel_item_sweep_add",
          "columns": "type",
          "table_name": "bxhotel_item_sweep",
          "table_column": "type",
          "bx_col_type": "String",
          "col_type": "Enum",
          "in_add": 1,
          "in_list": 1,
          "in_detail": 1,
          "in_update": 1,
          "in_cond": 1,
          "in_cond_def": 1,
          "updatable": 1,
          "required": "否",
          "generate_time": "草稿",
          "init_expr": "'立即配送'",
          "more_config": null,
          "remark": null,
          "option_data_type": "local",
          "option_list_v2": [{
            "label": "立即配送",
            "value": "立即配送",
            "checked": true
          }, {
            "label": "预约时间",
            "value": "预约时间",
            "checked": false
          }],
          "value": "立即配送",
          "showSearch": false,
          "options": [{
            "label": "立即配送",
            "value": "立即配送"
          }, {
            "label": "预约时间",
            "value": "预约时间"
          }],
          "showExp": true,
          "display": true,
          "disabled": false,
          "_validators": {
            "max": null,
            "min": null,
            "reg": "",
            "required": false,
            "msg": "",
            "isType": {}
          }
        }, {
          "column": "send_date",
          "label": "配送时间",
          "isRequire": false,
          "type": "time",
          "moreConfig": {},
          "service_name": "srvhotel_item_sweep_add",
          "columns": "send_date",
          "table_name": "bxhotel_item_sweep",
          "table_column": "send_date",
          "bx_col_type": "time",
          "col_type": "Time",
          "section_list": null,
          "seq": 1400,
          "in_add": 1,
          "in_list": 1,
          "in_detail": 1,
          "in_update": 1,
          "in_cond": 1,
          "in_cond_def": 1,
          "updatable": 1,
          "required": "否",
          "x_if": "function xxx(row) { return row.type== '预约时间';}",
          "showExp": true,
          "display": false,
          "disabled": false,
          "_validators": {
            "max": null,
            "min": null,
            "reg": "",
            "required": false,
            "msg": "",
            "isType": {}
          },
          "value": null,
        }, {
          "column": "remark",
          "label": "备注",
          "isRequire": false,
          "type": "textarea",
          "service_name": "srvhotel_item_sweep_add",
          "columns": "remark",
          "table_name": "bxhotel_item_sweep",
          "table_column": "remark",
          "col_type": "MultilineText",
          "in_add": 1,
          "in_list": 1,
          "in_detail": 1,
          "col_span": 1,
          "showExp": true,
          "display": true,
          "disabled": false,
          "_validators": {
            "max": 30000,
            "min": null,
            "reg": "",
            "required": false,
            "msg": "",
            "isType": {}
          },
          "value": null,
          
        }],
        appName: "",
        srvType: "add",
        use_type: "add"
      }
    },
    methods: {
      valueChange(e) {

      },
    }
  }
</script>

<style>

</style>
