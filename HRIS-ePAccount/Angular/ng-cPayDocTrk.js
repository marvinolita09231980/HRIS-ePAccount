
ng_HRD_App.controller("cPayDocTrk_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    s.LV = ""
    s.rel_rec_ret = ""
    s.rel_rec_ret_hist = ""
    s.docs_type = ""
    s.list_type = "V"
    s.doc_ctrl_nbr = ""
    s.D = {}
    s.exec_block = false
    s.doc_nbr_lbl = "Document Number"
    s.department = true;
    s.data_vl = []
    s.actionfield = "";
    s.detail = false
    s.collapseIn1 = ""
    s.a_flag = ""
    s.doc_nbr_list = []
    s.year = []
    s.route = []
    s.ca_voucher_list = []
    s.to_release_route = []
    s.ToRecieve_Data_orig = []
    s.ToRelease_Data_orig = []
    s.hs                = {}
    s.change_date       = false;

    s.temp_date_serv    = ""
    s.temp_date_front   = ""
    s.route_desc        = ""
    s.route_name        = ""
    s.doc_nbr_show      = false;
    s.dis_in_review     = false;
    s.dis_v_nbr         = false;
    s.dis_cfo_nbr       = false;
    s.doc_type1_show    = true;
    s.corrent_row = [];
    s.payroll_registry_descr = ""
    function paytrk_authority(data) {

        if (data == "ADMIN") {
            $("#dttm").prop('disabled', false)

            s.allow_edit_date = true
            s.show_receive_grid = true
            s.show_release_grid = true
            s.action_btn_receive_disb = false
            s.action_btn_release_disb = false

        }
        else if (data == "ADM-RC") {
            $("#dttm").prop('disabled', false)
            //s.show_receive_btn          = true
            //s.show_release_btn          = false
            //s.show_return_btn           = true
            s.allow_edit_date = true
            s.show_receive_grid = true
            s.show_release_grid = false
            s.action_btn_receive_disb = false
            s.action_btn_release_disb = false
            change_grid_class("div_received", "col-lg-12", "col-lg-6")

        }
        else if (data == "ADM-RL") {
            $("#dttm").prop('disabled', false)

            s.allow_edit_date = true
            s.show_receive_grid = false
            s.show_release_grid = true
            s.action_btn_receive_disb = true
            s.action_btn_release_disb = true
            change_grid_class("div_released", "col-lg-12", "col-lg-6")
        }
        else if (data == "RC-RL") {
            $("#dttm").prop('disabled', true)
            s.allow_edit_date = false
            s.show_receive_grid = true
            s.show_release_grid = true
            s.action_btn_receive_disb = false
            s.action_btn_release_disb = false
            change_grid_class("div_received", "col-lg-6", "col-lg-12")
            change_grid_class("div_released", "col-lg-6", "col-lg-12")
        }
        else if (data == "RC-ONL") {
            $("#dttm").prop('disabled', true)

            s.allow_edit_date = false
            s.show_receive_grid = true
            s.show_release_grid = false
            s.action_btn_receive_disb = false
            s.action_btn_release_disb = false
            change_grid_class("div_received", "col-lg-12", "col-lg-6")
        }
        else if (data == "RL-ONL") {
            $("#dttm").prop('disabled', true)
            //s.show_receive_btn          = false
            //s.show_release_btn          = true
            //s.show_return_btn           = true
            s.allow_edit_date = false
            s.show_receive_grid = false
            s.show_release_grid = true
            s.action_btn_receive_disb = false
            s.action_btn_release_disb = false
            change_grid_class("div_released", "col-lg-12", "col-lg-6")
        }
        else if (data == "VW - ONL") {
            $("#dttm").prop('disabled', true)
            //s.show_receive_btn          = false
            //s.show_release_btn          = false
            //s.show_return_btn           = false
            s.allow_edit_date = false
            s.show_receive_grid = true
            s.show_release_grid = true
            s.action_btn_receive_disb = true
            s.action_btn_release_disb = true
            change_grid_class("div_received", "col-lg-6", "col-lg-12")
            change_grid_class("div_released", "col-lg-6", "col-lg-12")
        }
    }

    function change_grid_class(el, cls1, cls2) {
        $("#" + el).removeClass(cls2);
        $("#" + el).addClass(cls1);

    }
    s.doc_voucher_nbr_show = false     // this variable value depending on require_doc_voucher_nbr value 
    s.doc_obr_nbr_show = false     // this variable value depending on require_doc_obr_nbr value 
    s.doc_other_info_show = false     //  this variable value depending on require_doc_addnl_info value



    s.action_status = ""
    s.dd_ToRelease_route = ""
    s.dd_ToReturn_route = ""
    s.doc_voucher_nbr = ""
    s.doc_obr_nbr = ""

    s.saveMode = "ADD";
    s.rowLen = "10";
    s.newRow = 0;
    s.editRow = 0;
    s.SaveOpen = false;

    s.di = {}


    s.ds = {}

    s.di.doc_nbr = ""
    s.di.doc_fund_subcode = ""




    function CheckedRequiredFields() {
        var flag = 0;
        if (elEmpty(s.di.remarks)) {
            $("#remarks").css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            });

            flag = 1
        }
        else {
            $("#remarks").css({
                "border": "",
            });

        }

        if (s.doc_nbr_show == true)
        {
            if (elEmpty(s.di.doc_nbr) && s.a_flag != "T") {
                $("#doc_nbr").css({
                    "border-color": "red",
                    "border-width": "1px",
                    "border-style": "solid"
                });

                flag = 1
            }
            else {

                $("#doc_nbr").css({
                    "border": "",
                });
            }
        }

        if (s.doc_funcode_show == true && s.a_flag != "T") {


            if (elEmpty($("#doc_fund_subcode").val().toString().trim())) {
                $("#doc_fund_subcode").css({
                    "border-color": "red",
                    "border-width": "1px",
                    "border-style": "solid"
                });
                flag = 1
            }
            else {
                $("#doc_fund_subcode").css({
                    "border": "",
                });
            }
        }


        return flag
    }

    var Init_ToRecieve = function (par_data) {
        s.ToRecieve_Data = par_data;
        s.ToRecieve_Table = $('#torecieve').dataTable(
            {
                data: s.ToRecieve_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<span class='details-control' style='float:left;' ng-click='btn_show_details(" + '"torecieve"' + ")' >"
                        }
                    },
                    {
                        "mData": "doc_ctrl_nbr",
                        "mRender": function (data, type, full, row) {
                            return " <span class='text-center btn-block' >" + data + " </span>"
                        }
                    },

                    //{
                    //    "mData": "doc_ctrl_nbr",
                    //    "mRender": function (data, type, full, row) {
                    //        return "<span  class='details-control' style='padding-top:10px;padding-left:10px;float:left' ng-click='btn_show_details(" + '"torecieve"' + ")'></span> <span style='float:right;padding-left:30px;width:90px !important'> " + data + " </span>"
                    //    }
                    //},

                    {
                        "mData": "payroll_registry_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm action" ng-click="btn_view_ledger(\'' + full["doc_ctrl_nbr"] + '\')"  data-toggle="tooltip" data-placement="top" title="View Employee"> <i class="fa fa-file-text"></i> </button>' +  
                                //'<button type="button" class="btn btn-success btn-sm action" ng-click="btn_receive(' + row["row"] + ',1)" ng-disabled="action_btn_receive_disb"  data-toggle="tooltip" data-placement="top" title="Receive Document">   <i id="del_row' + row["row"] + '" class="fa fa-mail-reply"></i></button>' +
                                '<button type="button" class="btn btn-warning btn-sm action" ng-click="btn_print_history_grid(' + row["row"] + ',' + '\'ToRecieve_Data\'' + ')"  data-toggle="tooltip" data-placement="top" title="Document History"> <i class="fa fa-history"></i> </button>' +
                                '<button type="button" class="btn btn-primary btn-sm action" ng-click="btn_print_action2(' + row["row"] + ',' + '\'V\'' + ')"  data-toggle="tooltip" data-placement="top" title="Document Details"> <i class="fa fa-print"></i> </button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope);  //add this to compile the DOM
                },
                scrollY: "50vh",
                scrollCollapse: true,

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }


    var Init_ToRelease = function (par_data) {
        s.ToRelease_Data = par_data;
        s.ToRelease_Table = $('#torelease').dataTable(
            {

                scrollY: "50vh",
                scrollCollapse: true,
                data: s.ToRelease_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<span class='details-control' style='float:left;' ng-click='btn_show_details(" + '"torelease"' + ")' >"
                        }
                    },
                    {
                        "mData": "doc_ctrl_nbr",
                        "mRender": function (data, type, full, row) {
                            return " <span class='text-center btn-block' >" + data + " </span>"
                        }
                    },

                    {
                        "mData": "payroll_registry_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left' >" + data + "</span>"
                        }
                    },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center ><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm action" ng-click="btn_view_ledger(\'' + full["doc_ctrl_nbr"] + '\')"  data-toggle="tooltip" data-placement="top" title="View Employee"> <i class="fa fa-file-text"></i> </button>' +  
                                //'<button type="button" class="btn btn-primary btn-sm action" ng-click="btn_release(' + row["row"] + ',1)" ng-disabled="action_btn_release_disb" data-toggle="tooltip" data-placement="top" title="Release Document">   <i id="del_row' + row["row"] + '" class="fa fa-mail-forward"></i></button>' +
                                '<button type="button" class="btn btn-warning btn-sm action" ng-click="btn_print_history_grid(' + row["row"] + ',' + '\'ToRelease_Data\'' + ')"  data-toggle="tooltip" data-placement="top" title="Document History"> <i class="fa fa-history"></i> </button>' +
                                '<button type="button" class="btn btn-primary btn-sm action" ng-click="btn_print_action2(' + row["row"] + ',' + '\'L\'' + ')"  data-toggle="tooltip" data-placement="top" title="Document Details"> <i class="fa fa-print"></i> </button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope);  //add this to compile the DOM
                },

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var Init_search_docs = function (par_data) {
        s.search_docs_Data = par_data;
        s.search_docs_Table = $('#search_docs_table').dataTable(
            {
                //scrollY: "50vh",
                //scrollCollapse: true,
                data: s.search_docs_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 20,
                columns: [

                    //{
                    //    "mData": "doc_ctrl_nbr",
                    //    "mRender": function (data, type, full, row) {
                    //        return "<span class='details-control text-center btn-block' style='padding-top:10px;float:left' ng-click='btn_show_details_search(" + '"search_docs_table"' + ")' ></span> <span style='float:right;padding-right:50px;padding-left:10px;width:50px !important'> " + data + " </span>"
                    //    }
                    //},

                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<span class='details-control' style='float:left;' ng-click='btn_show_details(" + '"search_docs_table"' + ")' >"
                        }
                    },
                    {
                        "mData": "doc_ctrl_nbr",
                        "mRender": function (data, type, full, row) {
                            return " <span class='text-center btn-block'>" + data + " </span>"
                        }
                    },

                    {
                        "mData": "payroll_registry_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    //{
                    //    "mData": "document_status_descr",
                    //    "mRender": function (data, type, full, row) {
                    //        return "<span class='text-center btn-block'>" + data + "</span>"
                    //    }
                    //},

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center ><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm action" ng-click="btn_print_history_grid(' + row["row"] + ',' + '\'search_docs_Data\'' + ')" data-toggle="tooltip" data-placement="top" title="Document History"> <i class="fa fa-history"></i> </button>' +
                                '<button type="button" class="btn btn-primary btn-sm action" ng-click="btn_print_doc_details(' + row["row"] + ',' + '\'search_docs_Data\'' + ')" data-toggle="tooltip" data-placement="top" title="Payroll Document Posting Details"> <i class="fa fa-plus"></i> </button>' +
                                '</div></center>';

                        }
                    }


                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope); //add this to compile the DOM
                },

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }


    var Init_view_legdger = function (par_data) {
        s.ViewLegdger_Data = par_data;
        s.ViewLegdger_Table = $('#view_legdger_grid').dataTable(
            {
                data: s.ToRelease_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return " <span class='text-center btn-block' >" + data + " </span>"
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return " <span class='text-left btn-block' >" + data + " </span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center ><div class="btn-group">' +

                                '<button type="button" class="btn btn-primary btn-sm action" ng-click="btn_print_card(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Print Employee Card"> <i class="fa fa-print"></i> </button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope);  //add this to compile the DOM
                },

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }
    function isnull(data) {
        if (elEmpty(data)) {
            return "";
        }
        else {
            return data
        }
    }
    function addvalue(id,value) {
        $("#" + id).val(value)
        s[id] = value
    }
   


    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }

    function init() {

        $("#loading_data").modal({ keyboard: false, backdrop: "static" })

        s.ds = {}
        s.ds.doc_status = "V"



        s.currentMonth = (new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()

        s.ddl_docs_type = "2"

        RetrieveYear()

        Init_ToRecieve([])
        Init_ToRelease([])
        Init_search_docs([])
        Init_view_legdger([])

        h.post("../cPayDocTrk/Initialize").then(function (d) {
          
            if (d.data.message == "success") {
                s.role_id = d.data.role_id

                if (d.data.route[0] == undefined)
                {
                    

                    swal("You're not Authorized for this Page", "You are not Authorized for this Page", {
                        buttons: {
                            go_back: "Go Back to main Page!",
                        }
                        , icon: "warning"
                    }
                    ).then((value) => {
                        switch (value)
                        {
                            case "go_back":
                                window.location = '/cMainPage';
                                break;
                            default:
                                swal("Got away safely!");
                        }
                    });

                   //  swal("You're not Authorized for this Page", "You are not Authorized for this Page", { icon: "warning" })
                    return;
                }

                s.route = d.data.route
                addvalue("route_desc", s.route[0].rte_code.toString());
                cs.DisabledField("route_desc");

                //Updated By Joseph
                //if (s.route.length == 1)
                //{
                //
                //    addvalue("route_desc", s.route[0].rte_code.toString())
                //    cs.DisabledField("route_desc")
                //}
                //else if(s.route.length > 1)
                //{
                //    addvalue("route_desc", s.route[0].rte_code.toString())
                //    cs.EnabledField("route_desc")
                //}


                if (s.role_id == "500") {
                    $("#dttm").prop("disabled", false)
                }
                else {
                    $("#dttm").prop("disabled", true)
                }
                s.docfundcode = d.data.docfundcode;
                //s.paytrk_auth = d.data.paytrk_auth;
                //paytrk_authority(s.paytrk_auth)

                s.ToRecieve_Data_orig = d.data.ToReceive;
                s.ToRelease_Data_orig = d.data.ToRelease;
                s.ToRecieve_Data = d.data.ToReceive.select("rte_code", s.route_desc)
                s.ToRelease_Data = d.data.ToRelease.select("rte_code", s.route_desc);
                s.ToRecieve_Data.refreshTable('ToRecieve_Table', '');
                s.ToRelease_Data.refreshTable('ToRelease_Table', '');
                

                s.departmentnames = d.data.departments


                s.total_count_received = d.data.ToReceive.length
                s.total_count_released = d.data.ToRelease.length

                s.ds.department_code = d.data.department_code

                //---------------------------------------
                //s.employmenttypelist = d.data.employmenttype
                //s.payrolltemplate_list = d.data.payrolltemplate
                //---------------------------------------

                $("#loading_data").modal("hide");
                $("#id_document_info").modal({ keyboard: false, backdrop: "static" })
                $("#doc_ctrl_nbr").focus();

            }
            else {
                alert(d.data.message)
                $("#loading_data").modal("hide")
            }
            document.getElementById("doc_ctrl_nbr").focus();
           
        })
    }

    init()

    function Today() {


        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        var time = today.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        var hour = time.split(':')[0] < 10 ? '0' + time.split(':')[0] : time.split(':')[0];
        var min = time.split(':')[1].split(' ')[0];
        var sec = today.getSeconds();
        var milli = today.getMilliseconds();
        var mrdm = time.slice(-2);
        today = yyyy + '-' + mm + '-' + dd + ' ' + hour + ':' + min + ':' + sec;

        return today;
    }
    //for Document Control  number "doc_ctrl_nbr" ng-keyup -
    //Search documents in Receive and Release list via doc_ctrl_nbr


    s.scan_doc_ctrl_nbr = function (val) {
        var doc_len = 0

        if (val.charAt(4) == "-") {
            doc_len = 12
        }
        else {

            doc_len = 6
        }

        if (val.length == doc_len || val.length == doc_len)
        {
            loading("show")
            //h.post("../cPayDocTrk/FETCH_DATA", { doc_ctrl_nbr: val }).then(function (d) {

            //    s.ToRecieve_Data = d.data.ToReceive.refreshTable('ToRecieve_Table', '');
            //    s.ToRelease_Data = d.data.ToRelease.refreshTable('ToRelease_Table', '');
            //    FETCH_DATA(d.data.dtl, d.data.t)
            //})
            
            FETCH_DATA(val)
        }
        else {
            docctrlnbrNotFound();
        }
    }

    var FETCH_DATA = function (nbr)
    {

        try
        {
            var dtl = [];
            s.corrent_row = [];
            var rec = s.ToRecieve_Data.filter(function (d) {
                return d.doc_ctrl_nbr == nbr
            })

            var rel = s.ToRelease_Data.filter(function (d) {
                return d.doc_ctrl_nbr == nbr
            })

            
            if (rec.length > 0)
            {
                dtl = rec
                s.corrent_row  = rec
            }
            else if (rel.length > 0)
            {
                dtl = rel
                s.corrent_row  = rel
            }

            var t = dtl[0].doc_status.substring(0, 1)

            if ((dtl[0].rcvd_req_doc == 1 || dtl[0].rlsd_req_doc == 1)) {
                s.doc_nbr_show = true;
            }
            else
            {
                s.doc_nbr_show = true;
            }

            if (dtl[0].docmnt_type == "02")
            {
                s.doc_type1_show = false;
            }
            else
            {
                s.doc_type1_show = true;
            }

            if (dtl[0].rte_code == "05" || dtl[0].rte_code == "04")
            {
                s.dis_in_review = true;
                s.dis_v_nbr     = true;
                s.dis_cfo_nbr   = true;
            }
            else
            {
                s.dis_in_review = false;
                if (dtl[0].rte_code == "03")
                {
                    s.dis_v_nbr     = false;
                    s.dis_cfo_nbr   = false;
                }
                else if(dtl[0].rte_code == "02")
                {
                    s.dis_v_nbr     = true;
                    s.dis_cfo_nbr   = false;
                }
                else
                {
                    s.dis_v_nbr = false;
                }
            }
           

            if (t == "V")
            {
                s.list_type     = "V"
                s.rel_rec_ret   = "Received"
                s.allow_receive = true
                s.allow_release = false
                s.allow_return  = false
                var orig_route  = dtl[0].rte_code
                var docctrlnbr  = dtl[0].doc_ctrl_nbr
                h.post("../cPayDocTrk/ReturnReleaseRouting", { rte_code: dtl[0].rte_code,docctrlnbr: docctrlnbr }).then(function (d) {
                    s.temp_date_serv    = d.data.dt_tm;
                    s.change_date       = false;
                    s.doc_nbr_list      = d.data.nbr_list
                    var paytrk_auth     = d.data.paytrk_auth
                    s.ca_voucher_list   = d.data.ca_voucher_list
                    paytrk_authority(paytrk_auth)
                    //s.to_return_route = d.data.return_route
                    //s.to_release_route = d.data.release_route
                    //s.t_len = s.to_return_route.length
                    //s.l_len = s.to_release_route.length
                    //s.di.dd_ToRelease_route = data_v[0].rlsd_retd_2_route_ctrl_nbr.toString();
                    
                    s.action_status             = "RV"
                    s.di.payroll_registry_descr = dtl[0].payroll_registry_descr
                    s.di.remarks    = isnull(dtl[0].doc_remarks)
                    s.di.dttm       = d.data.dt_tm
                  
                    s.data_vl       = dtl
                    Required_Docs(dtl[0])
                    $("#barcode_notfound").addClass("hidden")
                    s.allow_receive = true

                    s.Data_Mode(dtl[0], 'V')
                    if ($("#a_collapse").hasClass("collapsed")) {
                        $('#collapseOne').collapse("show")
                    }
                    s.di.doc_fund_subcode = dtl[0].doc_fund_subcode;
                    loading("hide")

                })
            }
            else if (t == "L" || t == "T")
            {
                s.list_type     = "L"
                s.rel_rec_ret   = "Released"
                s.allow_receive = false
                s.allow_release = true;
                s.allow_return  = false;
                var orig_route  = dtl[0].rte_code
                var docctrlnbr  = dtl[0].doc_ctrl_nbr
                h.post("../cPayDocTrk/ReturnReleaseRouting", { rte_code: dtl[0].rte_code,docctrlnbr: docctrlnbr }).then(function (d) {
                    s.change_date   = false;
                    s.temp_date_serv    = d.data.dt_tm;
                    var paytrk_auth     = d.data.paytrk_auth
                    s.doc_nbr_list      = d.data.nbr_list
                    s.ca_voucher_list   = d.data.ca_voucher_list
                    s.di.doc_fund_subcode = dtl[0].doc_fund_subcode;
                    paytrk_authority(paytrk_auth)

                    s.to_return_route   = d.data.return_route
                    s.to_release_route = d.data.release_route
                    s.doc_nbr           = "";
                    s.t_len             = s.to_return_route.length
                    s.l_len             = s.to_release_route.length

                    
                    //s.di.dd_ToRelease_route = dtl[0].rlsd_retd_2_route_ctrl_nbr.toString();
                   

                    s.action_status = "RT"
                    s.di.payroll_registry_descr = dtl[0].payroll_registry_descr
                    s.di.remarks = isnull(dtl[0].doc_remarks);
                    if (dtl[0].rte_code != "05" && dtl[0].rte_code != "06")
                    {
                        s.di.dd_ToRelease_route = dtl[0].vlt_code.toString();
                        //s.ToReleaseRouteSelect(s.di.dd_ToRelease_route);
                    }
                  
                    s.di.dttm = d.data.dt_tm
                    s.data_vl = dtl
                    Required_Docs(dtl[0])
                    $("#barcode_notfound").addClass("hidden")

                    s.Data_Mode(dtl[0], 'L')

                    if ($("#a_collapse").hasClass("collapsed")) {
                        $('#collapseOne').collapse("show")
                    }
                    //Updated By: Joseph 03-18-2021
                    //if (s.to_release_route.length > 0 && s.di.dd_ToRelease_route == "")
                    //{
                    //    s.di.dd_ToRelease_route = s.to_release_route[0].rte_code.toString()
                    //}

                    loading("hide")


                })
            }
            else
            {
                loading("hide")
            }
        }
        catch (e)
        {
            FetchDataAgain();
        }
    }

    
    
    s.select_ddl_route_desc = function (route_desc) {
        h.post("../cPayDocTrk/SetRouteSession", { route_ctrl_nbr: route_desc }).then(function (d) {
            if(d.data.icon == "success")
            {
                s.ToRecieve_Data = s.ToRecieve_Data_orig.select("rte_code", route_desc);
                s.ToRelease_Data = s.ToRelease_Data_orig.select("rte_code", route_desc);
                s.ToRecieve_Data.refreshTable('ToRecieve_Table', '');
                s.ToRelease_Data.refreshTable('ToRelease_Table', '');
            }
        })
    }


    function initRelease_object(dtl)
    {
        //var dtl_ret =
        //{
        //     doc_check_nbr              : dtl.doc_check_nbr             
        //    ,doc_ctrl_nbr               : dtl.doc_ctrl_nbr              
        //    ,doc_dttm                   : dtl.doc_dttm                  
        //    ,doc_fund_subcode           : dtl.doc_fund_subcode          
        //    ,doc_obr_nbr                : dtl.doc_obr_nbr               
        //    ,doc_othr_info              : dtl.doc_othr_info             
        //    ,doc_voucher_nbr            : (s.doc_nbr_show == true ? s.di.doc_nbr:dtl.doc_voucher_nbr)           
        //    ,docmnt_type_source         : dtl.docmnt_type_source        
        //    ,document_status            : ("L"+dtl.doc_status.substring(1,2))           
        //    ,document_status_descr      : dtl.route_descr.replace("Receiving","Releasing")     
        //    ,document_status_ret        : ("T"+dtl.doc_status.substring(1,2))       
        //    ,gross_pay                  : dtl.gross_pay                 
        //    ,net_pay                    : dtl.net_pay                   
        //    ,obr_tot_amt                : dtl.obr_tot_amt               
        //    ,payroll_month              : dtl.payroll_month             
        //    ,payroll_registry_descr     : dtl.payroll_registry_descr    
        //    ,payroll_year               : dtl.payroll_year              
        //    ,payrolltemplate_code       : dtl.payrolltemplate_code      
        //    ,payrolltemplate_descr      : dtl.payrolltemplate_descr     
        //    ,remarks                    : dtl.doc_remarks.replace("Received","Released")                   
        //    ,remarks_ret                : dtl.doc_remarks.replace("Received","Returned")              
        //    ,rlsd_retd_2_route_ctrl_nbr : dtl.rlsd_retd_2_route_ctrl_nbr
        //    ,role_id                    : dtl.role_id                   
        //    ,rte_code                   : dtl.rte_code            
        //    ,route_seq                  : (parseInt(dtl.route_seq) + 1)                 
        //}
        var pad     = "00";
        var dtl_ret =
        {
             doc_ctrl_nbr           :dtl.doc_ctrl_nbr
            ,route_seq              :(parseInt(dtl.route_seq) + 1)
            ,rte_code               :dtl.rte_code
            ,vlt_code               :"0"+(parseInt(dtl.rte_code)+1).toString()
            ,route_descr            :""
            ,doc_dttm               :dtl.doc_dttm
            ,doc_remarks            :dtl.doc_remarks.replace("Received","Released") 
            ,doc_status             :"L"
            ,doc_user_id            :dtl.doc_user_id           
            ,document_status_descr  :dtl.document_status_descr 
            ,rcvd_req_doc           :dtl.rcvd_req_doc          
            ,rlsd_req_doc           :dtl.rlsd_req_doc          
            ,required_doc_type      :dtl.required_doc_type     
            ,role_id                :dtl.role_id               
            ,payroll_registry_descr :dtl.payroll_registry_descr
            ,gross_pay              :dtl.gross_pay             
            ,net_pay                :dtl.net_pay               
            ,payrolltemplate_code   :dtl.payrolltemplate_code  
            ,payrolltemplate_descr  :dtl.payrolltemplate_descr 
            ,payroll_year           :dtl.payroll_year          
            ,payroll_month          :dtl.payroll_month         
            ,docmnt_type            :dtl.docmnt_type           
            ,doc_fund_subcode       :dtl.doc_fund_subcode      
            ,doc_pbo_nbr            :dtl.doc_pbo_nbr           
            ,doc_cafoa              :dtl.doc_cafoa             
            ,doc_voucher_nbr        :dtl.doc_voucher_nbr       
            ,doc_pto_nbr            :dtl.doc_pto_nbr           
        }


        return dtl_ret;
    }

    var docctrlnbrNotFound = function () {
        s.di.dttm                   = ""
        s.di.payroll_registry_descr = ""
        s.di.remarks                = ""
        s.di.doc_voucher_nbr        = ""
        s.di.doc_obr_nbr            = ""
        s.di.doc_othr_info          = ""
        s.di.dd_ToRelease_route     = ""
        s.di.dd_ToReturn_route      = ""
        s.data_vl                   = []
        $("#barcode_notfound").removeClass("hidden")
    }



    // scan document control number for history start ----------------- marvin
    s.scan_doc_ctrl_nbr_history = function (val) {

        h.post("../cPayDocTrk/getHistory", { docctrlnbr: val }).then(function (d) {

            if (d.data.message == "success") {
                var dh = d.data.doc_xtory


                if (dh.length > 0) {
                    if (dh.document_status == "T") {
                        s.rel_rec_ret_hist = "Returned"
                    }
                    else if (dh.document_status == "L") {
                        s.rel_rec_ret_hist = "Released"
                    }
                    else {
                        s.rel_rec_ret_hist = "Received"
                    }

                    s.hs.dttm = dh.doc_dttm
                    s.hs.payroll_registry_descr = ""
                    s.hs.remarks = dh.doc_remarks
                    $("#barcode_notfound_hist").addClass("hidden")
                }
                else {


                    s.hs.dttm = ""
                    s.hs.payroll_registry_descr = ""
                    s.hs.remarks = ""
                    $("#barcode_notfound_hist").removeClass("hidden")
                }

            }
            else {
                swal("Server Request Failed:n\\" + d.data.message, "List of Received Document not found", { icon: "warning", })
            }

        })


    }



    // scan document control number for history start ----------------- marvin



    //for Init_ToRecieve DataTable Grid action button - 
    // Search documents in Receive list via doc_ctrl_nbr
    s.btn_receive = function (row_id)
    {
        s.list_type     = "V"
        s.rel_rec_ret   = "Received"
        s.allow_receive = true
        s.allow_release = false
        s.allow_return  = false

        var data_v = s.ToRecieve_Data[row_id]

        var orig_route = data_v.rte_code
        var docctrlnbr = data_v.doc_ctrl_nbr
        h.post("../cPayDocTrk/ReturnReleaseRouting", { rte_code: data_v.rte_code, docctrlnbr: docctrlnbr }).then(function (d) {
            s.change_date       = false;
            s.temp_date_serv    = d.data.dt_tm;
            var paytrk_auth     = d.data.paytrk_auth
            s.doc_nbr_list      = d.data.nbr_list
            s.ca_voucher_list = d.data.ca_voucher_list
            paytrk_authority(paytrk_auth)
            //s.to_return_route = d.data.return_route
            //s.to_release_route = d.data.release_route

            //s.t_len = s.to_return_route.length
            //s.l_len = s.to_release_route.length

            //s.di.dd_ToRelease_route = data_v.rlsd_retd_2_route_ctrl_nbr.toString();
            s.doc_ctrl_nbr              = data_v.doc_ctrl_nbr
            s.di.payroll_registry_descr = data_v.payroll_registry_descr
            s.di.remarks                = data_v.remarks



            s.di.dttm       = d.data.dt_tm
            s.data_vl       = [data_v]
            s.allow_receive = true
            s.Data_Mode(data_v, 'V')
            Required_Docs(data_v)

            $('#collapseOne').collapse('show')
            $("#id_document_info").modal({ keyboard: false, backdrop: "static" })
        })
    }

    //for Init_ToRelease DataTable Grid action button - 
    // Search documents in Receive list via doc_ctrl_nbr
    s.btn_release = function (row_id) {
        s.list_type     = "L"
        s.rel_rec_ret   = "Released"
        s.allow_receive = false
        s.allow_release = true;
        s.allow_return  = false;
        var data_l = s.ToRelease_Data[row_id]
        var orig_route = data_l.rte_code
        var docctrlnbr = data_l.doc_ctrl_nbr
        h.post("../cPayDocTrk/ReturnReleaseRouting", { rte_code: data_l.rte_code,docctrlnbr: docctrlnbr }).then(function (d) {
            s.change_date       = false;
            s.temp_date_serv    = d.data.dt_tm;
            var paytrk_auth     = d.data.paytrk_auth
            s.doc_nbr_list      = d.data.nbr_list
            s.ca_voucher_list   = d.data.ca_voucher_list
            paytrk_authority(paytrk_auth)
            s.to_return_route   = d.data.return_route
            s.to_release_route  = d.data.release_route

            s.t_len                 = s.to_return_route.length
            s.l_len                 = s.to_release_route.length
            s.di.dd_ToRelease_route = data_l.rlsd_retd_2_route_ctrl_nbr.toString();
            s.doc_ctrl_nbr = data_l.doc_ctrl_nbr
            s.di.payroll_registry_descr = data_l.payroll_registry_descr
            s.di.remarks = isnull(data_l.remarks)
            s.di.dttm = d.data.dt_tm
            s.data_vl = [data_l]
            s.Data_Mode(data_l, 'L')
            Required_Docs(data_l)
            $('#collapseOne').collapse('show')

            if (s.to_release_route.length > 0) {
                s.di.dd_ToRelease_route = s.to_release_route[0].rte_code.toString()
            }

            $("#id_document_info").modal({ keyboard: false, backdrop: "static" })

        })

    }

    function resetModal() {
        s.doc_ctrl_nbr              = ""
        s.di.payroll_registry_descr = ""
        s.di.remarks                = ""
        s.di.doc_nbr                = ""
        s.di.doc_fund_subcode       = ""
        s.show_release_btn          = false
        s.show_return_btn           = false
        s.doc_funcode_show          = false
        s.doc_nbr_show              = false
        s.allow_release             = false
        s.allow_receive             = false
        s.allow_return              = false
    }


    function SaveRoute(dt)
    {
        var nextroute = ""
        s.temp_date_front = $("#dttm").val().trim()

        if (s.temp_date_front == s.temp_date_serv) {
            s.change_date = false;
        }
        else {
            s.change_date = true;
        }

        if (s.allow_release == true)
        {
            nextroute = s.di.dd_ToRelease_route
        }
        else if (s.allow_return == true)
        {
            
            nextroute = s.di.dd_ToReturn_route;
        }
        else {
            //nextroute = s.data_vl[0].rlsd_retd_2_route_ctrl_nbr
            nextroute = s.data_vl[0].vlt_code
        }
        //Added by Joseph M. Tombo JR 10-21-2021
        //$("button#rlsd").prop('disabled', true);
        //$("button#rcvd").prop('disabled', true);
        //$("button#retd").prop('disabled', true);

        h.post("../cPayDocTrk/sp_document_tracking_nbrs_tbl_update", { det: s.data_vl[0], dt: dt, doc_nbr_show: s.doc_nbr_show }).then(function (d)
        {
            if (d.data.message == "success")
            {
                h.post("../cPayDocTrk/sp_cashadv_hdr_tbl_update", { det: s.data_vl[0], dt: dt }).then(function (d)
                {
                    h.post("../cPayDocTrk/SaveRoute",
                    {
                          det        : s.data_vl[0]
                        , dt         : dt
                        , change_date: s.change_date
                        , nextroute  : nextroute
                    }).then(function (d) 
                    {
                        if (d.data.icon == "success")
                        {

                            //Added by Joseph M. Tombo JR 10-21-2021
                            $("button#rlsd").prop('disabled', false);
                            $("button#rcvd").prop('disabled', false);
                            $("button#retd").prop('disabled', false);

                            //s.route_desc            = d.data.rte_code;
                            //s.ToRecieve_Data_orig   = d.data.ToReceive;
                            //s.ToRelease_Data_orig = d.data.ToRelease;

                            //Added By: Joseph M. Tombo Jr. 12-15-2020 if refresh flag is Y then it will refresh all the table source
                            if (d.data.refresh_grid == "Y")
                            {
                                s.ToRelease_Data_orig = d.data.ToRelease;
                                s.ToRecieve_Data_orig = d.data.ToReceive;
                            }
                            else if (s.a_flag == "V")
                            {

                                s.ToRecieve_Data_orig = s.ToRecieve_Data_orig.delete2(s.doc_ctrl_nbr);
                                s.ToRelease_Data_orig.push(initRelease_object(s.data_vl[0]));

                            }
                            else
                            {
                                s.ToRelease_Data_orig = s.ToRelease_Data_orig.delete2(s.doc_ctrl_nbr);
                            }

                            s.total_count_received = s.ToRecieve_Data_orig.length
                            s.total_count_released = s.ToRelease_Data_orig.length
                            //-----------------------------------------------


                            s.ToRecieve_Data = s.ToRecieve_Data_orig.select("rte_code", s.data_vl[0].rte_code);
                            s.ToRelease_Data = s.ToRelease_Data_orig.select("rte_code", s.data_vl[0].rte_code);

                            //s.total_count_received = d.data.ToReceive.length
                            //s.total_count_released = d.data.ToRelease.length
                            s.ToRecieve_Data.refreshTable('ToRecieve_Table', '');
                            s.ToRelease_Data.refreshTable('ToRelease_Table', '');

                            swal(d.data.message, { icon: "success", });
                            ClearDocInfoFields();
                            resetModal()
                        }
                        else {
                            resetModal()
                            swal(d.data.message, { icon: d.data.icon });
                        }
                        cs.spinnerRemove("btn_rcvd", "fa-forward")
                        cs.spinnerRemove("btn_rlsd", "fa-backward")
                        cs.spinnerRemove("btn_retd", "fa-times")
                    })
                })

            }
        })
    }

    s.ReceiveRoute = function (D)
    {
        $("button#rcvd").prop('disabled', true);
        cs.spinnerAdd("btn_rcvd", "fa-backward")
        var date_dttm       = ""
        s.a_flag            = 'V'
        date_dttm           = $("#dttm").val().trim();
        var doc_ctrl_nbr = $("#doc_ctrl_nbr").val().trim()
        var vnbr    = "";
        var cfonbr  = "";
        //date_dttm = $("#datetimepicker1").data("DateTimePicker").date();
        var split_date = s.di.dttm.split(' ')[0] + ' ' + s.di.dttm.split(' ')[1]

        var route = s.data_vl[0].rte_code
        

        if (elEmpty($("#dttm").val().trim())) {
            cs.required3("dttm", "Required Field");
        }
        else {
            cs.notrequired3("dttm");
        }
        if (elEmpty($("#payroll_registry_descr").val().trim())) {
            cs.required3("payroll_registry_descr", "Required Field");
        }
        else {
            cs.notrequired3("payroll_registry_descr");
        }
        if (elEmpty($("#remarks").val().trim())) {
            cs.required3("remarks", "Required Field");
        }
        else {
            cs.notrequired3("remarks");
        }

        if (s.doc_nbr_show == true && elEmpty($("#doc_nbr").val().trim()) && s.data_vl[0].rte_code == "03") {
            cs.required3("doc_nbr", "Required Field")
            return
        }
        else {
            cs.notrequired3("doc_nbr")
            vnbr = $("#doc_nbr").val().trim()
        }

        if (s.doc_nbr_show == true && elEmpty($("#doc_cafoa_nbr").val().trim()) && s.data_vl[0].rte_code == "02")
        {
            cs.required3("doc_cafoa_nbr", "Required Field")
            return
        }
        else {
            cs.notrequired3("doc_cafoa_nbr")
            cfonbr = $("#doc_cafoa_nbr").val().trim()
        }

        if (s.doc_funcode_show == true && elEmpty($("#doc_fund_subcode").val().trim())) {

            cs.required3("doc_fund_subcode", "Required Field")
            return
        }
        else {
            cs.notrequired3("doc_fund_subcode")
        }
      
        
        if (s.doc_nbr_show == false)
        {
            cs.notrequired3("doc_nbr")
          //  s.a_flag = 'L'
            var dt =
            {
                dttm                : date_dttm,
                remarks             : D.remarks,
                doc_nbr             : s.di.doc_nbr,
                doc_cafoa           : s.di.doc_cafoa_nbr,
                doc_fund_subcode    : D.doc_fund_subcode,
                a_flag              : s.a_flag,
                ToRelease_route     : D.dd_ToRelease_route,
                ToReturn_route      : D.dd_ToReturn_route,
            }

            SaveRoute(dt)
        }
        else {
            h.post("../cPayDocTrk/validateVoucherNbr", { voucher_nbr: vnbr, doc_ctrl_nbr: doc_ctrl_nbr, cafoa_nbr: cfonbr }).then(function (d) {

                if (d.data.icon == "success")
                {

                    if (d.data.voucher_exist == true && s.data_vl[0].rte_code == "03")
                    {
                        cs.required3("doc_nbr", "Voucher number already exist!")
                        if (d.data.cafoa_exist == true && s.data_vl[0].rte_code == "03")
                        {
                            cs.required3("doc_cafoa_nbr", "Cafoa number already exist!")
                        }
                    }
                    else if (s.data_vl[0].rte_code == "02" && d.data.cafoa_exist == true)
                    {
                        cs.required3("doc_cafoa_nbr", "Cafoa number already exist!")
                    }
                    else
                    {
                        cs.notrequired3("doc_nbr")
                        cs.notrequired3("doc_cafoa_nbr")
                      //  s.a_flag = 'L'
                        var dt =
                        {
                            dttm            : date_dttm,
                            remarks         : D.remarks,
                            doc_nbr         : s.di.doc_nbr,
                            doc_cafoa       : s.di.doc_cafoa_nbr,
                            //doc_fund_subcode: D.doc_fund_subcode,
                            doc_fund_subcode: s.di.doc_fund_subcode,
                            a_flag          : s.a_flag,
                            ToRelease_route : D.dd_ToRelease_route,
                            ToReturn_route  : D.dd_ToReturn_route,
                        }
                        SaveRoute(dt)
                    }
                }
                else {

                    swal("Encountered error in validating voucher numbers", { icon: "error" })
                }


            })
        }

      
        
    }
    s.nbr_onkeyup = function (id, data) {

        var dtl = s.doc_nbr_list.filter(function (d) {
            return d.doc_ctrl_nbr != s.doc_ctrl_nbr
        })
        var ca_dtl = s.ca_voucher_list.filter(function (d) {
            return d.ca_ctrl_nbr != s.doc_ctrl_nbr
        })
        s.exec_block = false
        //if (!elEmpty(data)) {
        //    $("#" + id).css({ "border-color": "red" })
        //}
        if (!elEmpty(data)) {
            if (s.doctype == "01") {
                var dt = dtl.filter(function (d) {
                    return d.doc_voucher_nbr == data
                })
                if (dt.length > 0) {
                    swal("Voucher number already used!", { icon: "warning", })
                    s.exec_block = true
                }

            }
            else if (s.doctype == "02") {
                var dt = ca_dtl.filter(function (d) {
                    return d.ca_voucher_nbr == data
                })
                if (dt.length > 0) {
                    swal("CA Voucher number already used!", { icon: "warning", })
                    s.exec_block = true
                }

            }
        }


    }
    function ClearDocInfoFields() {
        s.doc_ctrl_nbr = ""
        s.di.dttm = ""
        s.di.payroll_registry_descr = ""
        s.di.remarks = ""
        s.di.doc_nbr = ""
        s.di.doc_fund_subcode = ""
        s.di.dd_ToRelease_route = ""
        s.di.dd_ToReturn_route = ""

    }





    ////for btn_release ng-click 
    s.ReleaseRoute = function (D)
    {
        $("button#rlsd").prop('disabled', true);
        cs.spinnerAdd("btn_rlsd", "fa-forward")
        var vnbr    = "";
        var cfonbr  = "";
        var doc_ctrl_nbr = $("#doc_ctrl_nbr").val().trim()
      
        //var dt = s.ToRelease_Data.select("doc_ctrl_nbr", $("#doc_ctrl_nbr").val())
        //var document_type = dt[0].docmnt_type_source
      
        if(s.show_release_btn == false)
        {
            return
        }
        if (!cs.Validate1Field2("dd_ToRelease_route"))
        {
            return
        }
        var date_dttm = ""
        date_dttm = $("#dttm").val().trim();
        //date_dttm = $("#datetimepicker1").data("DateTimePicker").date();
        var split_date = s.di.dttm.split(' ')[0] + ' ' + s.di.dttm.split(' ')[1]

        var route = s.data_vl[0].rte_code

        //if (CheckedRequiredFields() == 1) {
        //    cs.required3("doc_nbr", "Required Field")
        //    //$("#requirefields").removeClass('hidden')
        //    return
        //}
     
        if (elEmpty($("#dttm").val().trim())) {
            cs.required3("dttm", "Required Field");
        }
        else {
            cs.notrequired3("dttm");
        }
        if (elEmpty($("#payroll_registry_descr").val().trim())) {
            cs.required3("payroll_registry_descr", "Required Field");
        }
        else {
            cs.notrequired3("payroll_registry_descr");
        }
        if (elEmpty($("#remarks").val().trim()))
        {
            cs.required3("remarks", "Required Field");
        }
        else
        {
            cs.notrequired3("remarks");
        }

        if (s.doc_nbr_show == true && elEmpty($("#doc_nbr").val().trim()) && s.data_vl[0].rte_code == "03")
        {
            cs.required3("doc_nbr", "Required Field")
            return
        }
        else
        {
            cs.notrequired3("doc_nbr")
            vnbr = $("#doc_nbr").val().trim()
        }

        if (s.doc_nbr_show == true && elEmpty($("#doc_cafoa_nbr").val().trim()) && s.data_vl[0].rte_code == "02") {
            cs.required3("doc_cafoa_nbr", "Required Field")
            return
        }
        else {
            cs.notrequired3("doc_cafoa_nbr")
            cfonbr = $("#doc_cafoa_nbr").val().trim()
        }
        //if (s.doc_funcode_show == true && elEmpty($("#doc_fund_subcode").val().trim()))
        //{

        //    cs.required3("doc_fund_subcode", "Required Field")
        //    return
        //}
        //else
        //{
        //    cs.notrequired3("doc_fund_subcode")
        //}


        if (s.doc_nbr_show == false)
        {
            cs.notrequired3("doc_nbr")
            s.a_flag = 'L'
            var dt =
            {
                dttm            : date_dttm,
                remarks         : s.di.remarks,
                doc_nbr         : s.di.doc_nbr,
                doc_cafoa       : s.di.doc_cafoa_nbr,
                doc_fund_subcode: s.di.doc_fund_subcode,
                a_flag          : s.a_flag,
            }
            SaveRoute(dt)
        } else {
            h.post("../cPayDocTrk/validateVoucherNbr", { voucher_nbr: vnbr, doc_ctrl_nbr: doc_ctrl_nbr, cafoa_nbr: cfonbr }).then(function (d) {
                if (d.data.icon == "success")
                {
                    if (d.data.voucher_exist == true && s.data_vl[0].rte_code == "03")
                    {
                        cs.required3("doc_nbr", "Voucher number already exist!")
                        if (d.data.cafoa_exist == true && s.data_vl[0].rte_code == "03")
                        {
                            cs.required3("doc_cafoa_nbr", "Cafoa number already exist!")
                        }
                    }
                    else if (s.data_vl[0].rte_code == "02" && d.data.cafoa_exist == true)
                    {
                        cs.required3("doc_cafoa_nbr", "Cafoa number already exist!")
                    }
                    else {
                       
                        cs.notrequired3("doc_nbr")
                        cs.notrequired3("doc_cafoa_nbr")
                        s.a_flag = 'L'
                        var dt = {
                            dttm            : date_dttm,
                            remarks         : s.di.remarks,
                            doc_nbr         : s.di.doc_nbr,
                            doc_cafoa       : s.di.doc_cafoa_nbr,
                            doc_fund_subcode: s.di.doc_fund_subcode,
                            a_flag          : s.a_flag,
                        }
                        SaveRoute(dt)
                    }
                }
                else {

                    swal("Encountered error in validating voucher numbers", { icon: "error" })
                }

            })
        }
       
    }




    function setButton()
    {
        s.allow_return      = false;
        s.allow_release     = false;
        s.show_return_btn   = false;
        s.show_release_btn = false;

        if (s.to_release_route.length > 0 && s.to_return_route.length > 0)
        {
            if (s.corrent_row[0].rte_code == "06")
            {
                s.rel_rec_ret = "Return"
                s.allow_return = true
                s.show_return_btn = true
            }
            else
            {
                s.rel_rec_ret = "Release"
                s.allow_release = true;
                s.show_release_btn = true;
                s.rel_rec_ret = "Return"
                // s.allow_return = true
                s.show_return_btn = true
            }
            
        }
        else if (s.to_release_route.length > 0)
        {
            if (s.corrent_row[0].rte_code == "06")
            {
                s.rel_rec_ret       = "Return"
                s.allow_return      = true
                s.show_return_btn   = true
            }
            else {
                s.rel_rec_ret = "Release"
                s.allow_release = true;
                s.show_release_btn = true;
            }
        }
        else if (s.to_return_route.length > 0) {
            s.rel_rec_ret       = "Return"
            s.allow_return      = true
            s.show_return_btn   = true
        }
    }

    function changeButton() {

        if (!elEmpty(s.di.dd_ToRelease_route) && s.to_release_route.length > 0) {
            s.rel_rec_ret = "Release"
            s.allow_return = false
            s.allow_release = true;
        }
        else if (!elEmpty(s.di.dd_ToReturn_route) && s.to_return_route.length > 0) {
            s.rel_rec_ret = "Return"
            s.allow_return = true
            s.allow_release = false
        }
    }

    function changeButton(val,A) {

       
        if (!elEmpty(val) && s.to_release_route.length > 0 && A == "L")
        {
            s.rel_rec_ret   = "Release"
            s.allow_return  = false
            s.allow_release = true;
            var row_index   = $('#dd_ToRelease_route option:selected').attr("ngx-index");
            s.di.remarks    = s.to_release_route[row_index].doc_remarks;
        }
        else if (!elEmpty(val) && s.to_return_route.length > 0 && A == "T")
        {
          
            s.rel_rec_ret   = "Return"
            s.allow_return  = true
            s.allow_release = false
            var row_index = $('#dd_ToReturn_route option:selected').attr("ngx-index");
            s.di.remarks = s.to_return_route[row_index].doc_remarks;
        }
    }

    //for btn_return ng-click 
    s.ReturnRoute = function (D)
    {
        $("button#retd").prop('disabled', true);
        cs.spinnerAdd("btn_retd", "fa-times")
        if (s.show_return_btn == false)
        {
            return
        }
        if (!cs.Validate1Field2("dd_ToReturn_route")) {
            return
        }

        var date_dttm   = ""
        s.a_flag        = 'T'
        date_dttm       = $("#dttm").val().trim();
        //date_dttm = $("#datetimepicker1").data("DateTimePicker").date();
        var split_date  = s.di.dttm.split(' ')[0] + ' ' + s.di.dttm.split(' ')[1]

        var route   = s.data_vl[0].rte_code
        if (CheckedRequiredFields() == 1) {
            $("#requirefields").removeClass('hidden')
            return
        }
        if (s.exec_block == true) {
            swal("Number already used!", { icon: "warning", })
            $("#doc_nbr").css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            });
            return
        }
        $("#doc_nbr").css({
            "border": ""
        });
        if (s.show_return_btn == true && elEmpty(s.di.dd_ToReturn_route)) {
            $("#dd_ToReturn_route").css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            });

            $("#requirefields").removeClass('hidden')
            return
        }
        $("#requirefields").addClass('hidden')
        //$("#retd").removeClass("fa fa-forward")
        //$("#retd").addClass("fa fa-spinner fa-spin")
        //$("#btn_retd").prop('disabled', true)
        var dt = {
            dttm            : date_dttm,
            remarks         : s.di.remarks,
            doc_nbr         : s.di.doc_nbr,
            doc_cafoa       : s.di.doc_cafoa_nbr,
            doc_fund_subcode: s.di.doc_fund_subcode,
            a_flag          : s.a_flag,
        }

        SaveRoute(dt)
    }

    //for dd_ToReturn_route dropdown -
    //Get the list of offices that a certain documents is allowed to return.
    s.ToReturnRoute = function (data) {

        var orig_route = data.rte_code
        var docctrlnbr = data.doc_ctrl_nbr
        h.post("../cPayDocTrk/ToReturnRoute", { orig_route: orig_route, docctrlnbr: docctrlnbr }).then(function (d) {
            s.to_return_route = d.data.route

            if (s.to_return_route.length < 1) {
                s.t_len = 0
            }

        })
    }


    //for dd_ToRelease_route dropdown -
    //Get the list of offices that a certain documents is allowed to release.
    s.ToReleaseRoute = function (data) {
        var orig_route = data.rte_code
        var docctrlnbr = data.doc_ctrl_nbr
        h.post("../cPayDocTrk/ToReleaseRoute", { orig_route: orig_route, docctrlnbr: docctrlnbr }).then(function (d) {
            s.to_release_route = d.data.route
            if (s.to_release_route.length < 1) {
                s.di.dd_ToRelease_route = d.data.route[0].rte_code;
                s.l_len = 0

            }

        })
    }

    //for dd_ToRelease_route ng-change -
    s.ToReleaseRouteSelect = function (val) {
       
        addvalue("dd_ToReturn_route", "")
        s.di.dd_ToReturn_route = ""
        changeButton(val,"L")
        
    }

    //for dd_ToReturn_route ng-change -
    s.ToReturnRouteSelect = function (val, A) {

        addvalue("dd_ToRelease_route","")
        s.di.dd_ToRelease_route     = "";
        changeButton(val,"T")

    }


    $('#id_document_info').on('shown.bs.modal', function () {
        $("#doc_ctrl_nbr").focus();
        $("#doc_fund_subcode").css({
            "border": "",
        });
        $("#doc_nbr").css({
            "border": "",
        });
        $("#remarks").css({
            "border": "",
        });

        s.di.doc_fund_subcode = ""
        $("#requirefields").addClass('hidden')

        $("#dd_ToReturn_route").css({
            "border": "",
        });
        $("#dd_ToRelease_route").css({
            "border": "",
        });
        cs.notrequired3("dttm");
        cs.notrequired3("payroll_registry_descr");
        cs.notrequired3("remarks");
        cs.notrequired3("doc_nbr")
        cs.notrequired3("doc_fund_subcode")
        cs.notrequired3("dd_ToRelease_route")
        cs.notrequired3("dd_ToReturn_route")
    })

    $('#id_document_info').on('show.bs.modal', function () {

        $("#dd_ToRelease_route option:first").attr('selected', 'selected');
    })

    $('#id_document_info').on('hidden.bs.modal', function () {
        s.di.doc_nbr = ""
        s.allow_release = false;
        s.allow_return = false;
    })


    Array.prototype.refreshTable = function (table, id) {

        if (this.length == 0) {

            s[table].fnClearTable();
        }
        else {

            s[table].fnClearTable();
            s[table].fnAddData(this);
        }

        var el_id = s[table][0].id
        if (id != "") {
            for (var x = 1; x <= $("#" + el_id).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    s[table].fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }
        $("#spinner_load").modal("hide")
        return this
    }

    function elEmpty(data) {
        if (data == null || data == "" || data == undefined) {
            return true
        }
        else {
            return false
        }

    }

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = parseFloat(d).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')

            return retdata

        }
    }

    function Required_Docs(data) {
        console.log(data)
        s.docs_type = data.required_doc_type
        //s.doctype = data.docmnt_type_source.split('-')[0]

        s.doctype = data.docmnt_type.split('-')[0]//Updated By: Joseph
        //if (data.document_status == "VA" || data.document_status == "LA")
        console.log(data.rcvd_req_doc)
        if (data.doc_status == "V" || data.doc_status == "L")
        {
            if (s.doctype == "01")
            {
             
                //added By: Joseph M. Tombo Jr.
                if (data.rcvd_req_doc == true && data.rte_code == "03" && data.doc_status == "V") {
                    s.doc_nbr_lbl = "Voucher Number"
                    s.doc_nbr_show = true
                }
                else if (data.rlsd_req_doc == true && data.rte_code == "03" && data.doc_status == "L") {
                    s.doc_nbr_lbl = "Voucher Number"
                    s.doc_nbr_show = true
                }
                else {
                       s.doc_nbr_lbl = "Document Number"
                       s.doc_nbr_show = false
                }


                //Updated By: Joseph M. Tombo Jr. 03-17-2021
                //s.doc_nbr_lbl = "Voucher Number"
                //s.doc_nbr_show = true

                if (!elEmpty(data.doc_voucher_nbr))
                {
                    s.di.doc_nbr = data.doc_voucher_nbr
                }

                if (!elEmpty(data.doc_cafoa)) {
                    s.di.doc_cafoa_nbr = data.doc_cafoa
                }

                //if (elEmpty(data.doc_fund_subcode))
                //{
                //    s.doc_funcode_show = true
                //    s.di.doc_fund_subcode = data.doc_fund_subcode
                //}
                //else
                //{
                //    s.doc_funcode_show      = false
                //    s.di.doc_fund_subcode   = ""
                //}
            }
            else if (s.doctype == "02")
            {
                s.doc_nbr_lbl   = "CA Voucher Number"
                s.doc_nbr_show  = true
                if (!elEmpty(data.doc_voucher_nbr))
                {
                    s.di.doc_nbr = data.doc_voucher_nbr
                }
            }
            
        }
        else {
            s.doc_nbr_show      = false
            s.doc_funcode_show  = false
        }

    }

    s.Data_Mode = function (data, act) {

        if (act == 'L')
        {

            if (data.doc_status.trim() == "")
            {
                s.allow_return      = true;
                s.allow_release     = false;
                s.allow_receive     = false;
                s.show_return_btn   = true;
                s.show_release_btn  = false;

            }
            else
            {

                setButton()

            }


        }
        else {
            s.show_release_btn = false;
            s.show_return_btn = false;
            s.allow_receive = true;
        }


    }


    //***********************************//
    //***Print-Button-on-Grid*****VJA***//
    //***********************************// 
    s.btn_print_action2 = function (lst, G)
    {
        var dt = [];
        if (G == 'V') {
            dt = s.ToRecieve_Data[lst];
        }
        else if (G == 'L') {
            dt = s.ToRelease_Data[lst];
        }
     
        s.payroll_registry_descr = dt.payroll_registry_descr
        s.reports = [];
      
        //if (dt.docmnt_type_source == "01-P") {
        if (dt.docmnt_type == "01-P") {//Updated By: Joseph

            h.post("../cPayDocTrk/RetrieveTemplate", { par_payrolltemplate_code: dt.payrolltemplate_code, }).then(function (d)
            {
                s.reports = d.data.sp_payrollregistry_template_combolist_TRK
            })

            s.ShowSelected = true;
            s.txtb_descr = dt.payroll_registry_descr
            s.txtb_ctrl_no = dt.doc_ctrl_nbr
            s.txtb_payroll_year = dt.payroll_year
            s.txtb_payroll_month = dt.payroll_month
            s.txtb_orig_template_code = dt.payrolltemplate_code
            $('#modalLabelSmall').html("PAYROLL REPORT OPTIONS");
            $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        }
        else if (dt.docmnt_type == "01-V")
        {
            
            h.post("../cPayDocTrk/RetrieveTemplate", { par_payrolltemplate_code: dt.payrolltemplate_code }).then(function (d) {
                s.reports = d.data.sp_payrollregistry_template_combolist_TRK
            })
            s.ShowSelected = true;
            s.txtb_descr = dt.payroll_registry_descr
            s.txtb_ctrl_no = dt.doc_ctrl_nbr
            s.txtb_payroll_year = dt.payroll_year
            s.txtb_payroll_month = dt.payroll_month
            s.txtb_orig_template_code = dt.payrolltemplate_code
            $('#modalLabelSmall').html("VOUCHER REPORT OPTIONS");
            $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        }
        else if (dt.docmnt_type == "02") {

            h.post("../cPayDocTrk/PreviousValuesonPage_cMainPage", {

                par_doc_ctrl_nbr: s.doc_ctrl_nbr
                , par_ddl_doc_status: s.ddl_doc_status
                , par_track_year: s.track_year
                , par_track_month: s.track_month
                , par_ddl_reports: s.ddl_reports
            }).then(function (d) { })

            var controller = "Reports"
            var action = "Index"
            var ReportName = "CrystalReport"
            var SaveName = "Crystal_Report"
            var ReportType = "inline"
            var ReportPath = "~/Reports/cryCashAdv/cryCashAdv.rpt"
            var sp = "sp_cashadv_rep,p_ca_voucher_nbr," + dt.doc_ctrl_nbr

            // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
            //     + "&SaveName=" + SaveName
            //     + "&ReportType=" + ReportType
            //     + "&ReportPath=" + ReportPath
            //     + "&Sp=" + sp

            // *******************************************************
            // *** VJA : 2021-07-14 - Validation and Loading hide ****
            // *******************************************************
            $("#loading_data").modal({ keyboard: false, backdrop: "static" })
            var iframe = document.getElementById('iframe_print_preview');
            var iframe_page = $("#iframe_print_preview")[0];
            iframe.style.visibility = "hidden";

            s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                + "&ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&id=" + sp // + "," + parameters

            if (!/*@cc_on!@*/0) { //if not IE
                iframe.onload = function () {
                    iframe.style.visibility = "visible";
                    $("#loading_data").modal("hide")
                };
            }
            else if (iframe_page.innerHTML()) {
                // get and check the Title (and H tags if you want)
                var ifTitle = iframe_page.contentDocument.title;
                if (ifTitle.indexOf("404") >= 0) {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                }
                else if (ifTitle != "") {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                }
            }
            else {
                iframe.onreadystatechange = function () {
                    if (iframe.readyState == "complete") {
                        iframe.style.visibility = "visible";
                        $("#loading_data").modal("hide")
                    }
                };
            }

            iframe.src = s.embed_link;
            $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
        // *******************************************************
        // *******************************************************

        }

        // VJA : 2020-09-21 - Update for Extract to Excel

        if (dt.payrolltemplate_code == "007" || // Regular
            dt.payrolltemplate_code == "008" || // Casual
            dt.payrolltemplate_code == "009" || // Job-Order - Monthly Payroll
            dt.payrolltemplate_code == "010" || // Job-Order - 1st Quincena Payroll
            dt.payrolltemplate_code == "011")   // Job-Order - 2nd Quincena Payroll
        {
            s.show_extract_data = true;
        }
        else {
            s.show_extract_data = false;
        }

    }


    //***********************************//
    //***Extract-To-Excel*****VJA***//
    //***********************************// 
    s.btn_extract_to_excel = function () {
        if (s.txtb_orig_template_code == "007")         // Salary Regular Template Code
        {
            $("#loading_data").modal({ keyboard: false, backdrop: "static" })
            s.loading_descr = "Extracting Data"
            h.post("../cPayDocTrk/ExtractSalaryRegular", {

                par_payroll_year: s.txtb_payroll_year,
                par_payrollregistry_nbr: s.txtb_ctrl_no

            }).then(function (d) {
                if (d.data.message == "success") {

                    if (d.data.Count > 0) {
                        $("#loading_data").modal("hide")
                        window.open(d.data.filePath, '', '');
                    }
                    else {
                        $("#loading_data").modal("hide")
                        swal("No Data Extracted", { icon: "error" });
                    }

                }
                else {
                    $("#extracting_data").modal("hide")
                    swal(d.data.message, { icon: "error" });
                }
            })
        }
        else if (s.txtb_orig_template_code == "008")  // Salary Casual Template Code
        {
            $("#loading_data").modal({ keyboard: false, backdrop: "static" })
            s.loading_descr = "Extracting Data"
            h.post("../cPayDocTrk/ExtractSalaryCasual", {

                par_payroll_year: s.txtb_payroll_year,
                par_payrollregistry_nbr: s.txtb_ctrl_no

            }).then(function (d) {
                if (d.data.message == "success") {

                    if (d.data.Count > 0) {
                        $("#loading_data").modal("hide")
                        window.open(d.data.filePath, '', '');
                    }
                    else {
                        $("#loading_data").modal("hide")
                        swal("No Data Extracted", { icon: "error" });
                    }

                }
                else {
                    $("#extracting_data").modal("hide")
                    swal(d.data.message, { icon: "error" });
                }
            })
        }
        else if (s.txtb_orig_template_code == "009" || // Job-Order - Monthly Salary
                 s.txtb_orig_template_code == "010" || // Job-Order - 1st Quincena
                 s.txtb_orig_template_code == "011")  // Job-Order - 2nd Quincena
        {
            $("#loading_data").modal({ keyboard: false, backdrop: "static" })
            s.loading_descr = "Extracting Data"
            h.post("../cPayDocTrk/ExtractSalaryJobOrder", {

                par_payroll_year: s.txtb_payroll_year,
                par_payrollregistry_nbr: s.txtb_ctrl_no,
                par_payrolltemplate_code: s.txtb_orig_template_code

            }).then(function (d) {
                if (d.data.message == "success") {

                    if (d.data.Count > 0) {
                        $("#loading_data").modal("hide")
                        window.open(d.data.filePath, '', '');
                    }
                    else {
                        $("#loading_data").modal("hide")
                        swal("No Data Extracted", { icon: "error" });
                    }

                }
                else {
                    $("#extracting_data").modal("hide")
                    swal(d.data.message, { icon: "error" });
                }
            })
        }
        else {
            swal("No Data Extracted", { icon: "error" });
        }


    }


    //************************************//
    //*Select-Print-Action-on-Modal*VJA***//
    //***********************************// 
    s.select_ddl_reports = function ()
    {
        var index_par = $('#ddl_reports option:selected').attr('ngx-id')
        if ($('#ddl_reports option:selected').val() != '')
        {
            s.txtb_report_filename = s.reports[index_par].report_filename 
        }

        // h.post("../cPayDocTrk/SelectReportFile", {
        //     par_payrolltemplate_code    : s.txtb_orig_template_code
        //     ,par_payrolltemplate_code1  : $('#ddl_reports option:selected').val()
        // }).then(function (d) {
        //     s.txtb_report_filename = d.data.reportfile[0].report_filename
        //     console.log(d.data.reportfile[0].report_filename)
        // })

    }

    //***********************************//
    //***Print-Action-on-Modal*****VJA***//
    //***********************************// 
    s.btn_print_click = function () {
        //var id_ss
        //id_ss = index_updateReportDocuments
        if (elEmpty(s.ddl_reports)) {
            $("#ddl_reports").css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            });
            $(".ddl_reports").removeClass("hidden");
            return
        }
        else {
            $("#ddl_reports").css({
                "border": "none",
            });
            $(".ddl_reports").addClass("hidden");
        }
        h.post("../cPayDocTrk/PreviousValuesonPage_cMainPage", {

            par_doc_ctrl_nbr: s.doc_ctrl_nbr
            , par_ddl_doc_status: s.ddl_doc_status
            , par_track_year: s.track_year
            , par_track_month: s.track_month
            , par_ddl_reports: s.ddl_reports
        }).then(function (d) { })


        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"

        var ReportPath = "~/Reports/"
        var sp = ""
        var parameters = ""

        ReportPath = ReportPath + s.txtb_report_filename
        console.log($('#ddl_reports option:selected').val().trim())
        switch ($('#ddl_reports option:selected').val().trim()) {
            case "007": // Summary Monthly Salary  - For Regular 
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                break;


            case "105": // Obligation Request (OBR) - For Regular 
            case "205": // Obligation Request (OBR) - For Casual
            case "305": // Obligation Request (OBR) - For Job-Order
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_obr_rep_ACT";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + s.txtb_orig_template_code;

                break;

            //---- START OF REGULAR REPORTS

            case "007": // Summary Monthly Salary  - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "101": // Mandatory Deduction  - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "102": // Optional Deduction Page 1 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "106": // Optional Deduction Page 2 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "103": // Loan Deduction Page 1 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "107": // Loan Deduction Page 2 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "104": // Attachment - For Monthly Salary
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_attach_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no;

                break;

            case "033": // Salary Differential - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_diff_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            //---- END OF REGULAR REPORTS

            //---- START OF CASUAL REPORTS

            case "008": // Summary Monthly Salary  - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "206": // Mandatory Deduction  -  For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "207": // Optional Deduction Page 1 - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "208": // Optional Deduction Page 2 - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "209": // Loan Deduction Page 1 - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "210": // Loan Deduction Page 2 - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "211": // Attachment - For Monthly Salary - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_ce_attach_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no;

                break;

            case "044": // Monetization Payroll - For Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            //---- END OF CASUAL REPORTS

            //---- START OF JOB-ORDER REPORTS

            case "009": // Summary Salary Monthly - For Job-Order 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "010": // Summary Salary 1st Quincemna - For Job-Order 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "011": // Summary Salary 2nd Quincemna - For Job-Order 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "306": // Contributions/Deductions Page 1 - For Job-Order 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val().trim()

                break;

            case "307": // Contributions/Deductions Page 1 - For Job-Order 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "308": // Attachment - For Monthly Salary
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_re_attach_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no;

                break;

            case "061": // Overtime Payroll - For Job-Order 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_ovtm_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "062": // Honorarium Payroll - For Job-Order 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;


            //---- END OF JOB-ORDER REPORTS
            //---- START OF OTHER PAYROLL REPORTS

            case "024": // Communication Expense Allowance - Regular
            case "043": // Communication Expense Allowance - Casual
            case "063": // Communication Expense Allowance - Job Order
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "026": // Mid Year Bonus  - Regular        
            case "045": // Mid Year Bonus  - Casual       
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "027": // Year-End And Cash Gift Bonus - Regular
            case "046": // Year-End And Cash Gift Bonus - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "028": // Clothing Allowance - Regular
            case "047": // Clothing Allowance - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "029": // Loyalty Bonus        - Regular
            case "048": // Loyalty Bonus        - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "030": // Anniversary Bonus    - Regular
            case "049": // Anniversary Bonus    - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "031": // Productivity Enhancement Incentive Bonus  - Regular
            case "050": // Productivity Enhancement Incentive Bonus  - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "023": // RATA 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_rata_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "108": // RATA - OBR Breakdown
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_obr_rata_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + $("#ddl_empl_type").SelectedValue.ToString().Trim();

                break;

            case "021": // Subsistence, HA and LA      - Regular
            case "041": // Subsistence, HA and LA      - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_subs_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "022": // Overtime - Regular
            case "042": // Overtime - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_ovtm_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "032": // CNA INCENTIVE - Regular
            case "051": // CNA INCENTIVE - Casual
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "025": // Monetization Payroll - For Regular
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "901": // Other Payroll 1 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "902": // Other Payroll 2 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "903": // Other Payroll 3 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "904": // Other Payroll 4 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "905": // Other Payroll 5 - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            case "941": // Other Payroll 5 - For Regular 
			case "947": //	MAT - JO
            case "959": //	MAT - CE
            case "964": //	MAT - RE

                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports//cryOtherPayroll/cryOthPay/cryOthPay3.rpt"
                break;
            case "945": // Other Payroll 5 - For Regular 
			case "928":
			case "979":
			case "980":
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports//cryOtherPayroll/cryOthPay/cryOthPay2.rpt"
                break;

            case "109": // Communicatio Expense - OBR Breakdown
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_obr_commx_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + ddl_empl_type.SelectedValue.ToString().Trim();

                break;

            case "": // Direct Print to Printer
                parameters = "/View/cDirectToPrinter/cDirectToPrinter.aspx";
                break;

            case "111": // Attachment - FOR RATA PAYROLL
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_RATA_attach_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no;

                break;

            case "212": // PaySLip  - For Regular 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_payslip_re_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + ddl_month.SelectedValue.ToString().Trim() + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + ddl_select_report.SelectedValue.ToString().Trim() + ",par_empl_id," + "";

                break;

            case "214": // PaySLip  - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_payslip_ce_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + ddl_month.SelectedValue.ToString().Trim() + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + ddl_select_report.SelectedValue.ToString().Trim() + ",par_empl_id," + "";

                break;

            case "034": // Honorarium  - For Regular 
            case "035": // Honorarium  - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;
            case "033": // Honorarium  - For Casual 
            //printreport = hidden_report_filename.Text;
            case "052":
                sp = "sp_payrollregistry_salary_diff_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                break;
            case "950": // Honorarium  - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_phic_share_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no
                //if (s.payroll_registry_descr == "NON-MEDICAL JOB ORDER #1" ||
                //    s.payroll_registry_descr == "MEDICAL JOB ORDER #1" ||
                //    s.payroll_registry_descr == "VISITING MEDICAL PERSONNEL JO" ||
                //    s.payroll_registry_descr == "VISITING NON-MEDICAL PERSONNEL JO" ||
                //    s.payroll_registry_descr == "PERSONAL CLAIMS - MEDICAL - JO" ||
                //    s.payroll_registry_descr == "PERSONAL CLAIMS - NON-MEDICAL - JO") {
                //    ReportPath = "/Reports/cryPHIC/cryPHICPayroll_JO.rpt";
                //}
                if (s.payroll_registry_descr    == "MEDICAL JOB ORDER"
                    || s.payroll_registry_descr == "NON-MEDICAL JOB ORDER #1"
                    || s.payroll_registry_descr == "NON-MEDICAL JOB ORDER #2"
                    || s.payroll_registry_descr == "PERSONAL CLAIMS - MEDICAL - JO"
                    || s.payroll_registry_descr == "PERSONAL CLAIMS - NON-MEDICAL - JO"
                    || s.payroll_registry_descr == "VISITING MEDICAL PERSONNEL JO"
                    || s.payroll_registry_descr == "VISITING NON-MEDICAL PERSONNEL JO")
                {
                    ReportPath = "/Reports/cryPHIC/cryPHICPayroll_JO.rpt";
                }

                break;
            case "951": // Honorarium  - For Casual 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_bac_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no

                break;
            case "116": // Monthly Payroll - For JO 
                //printreport = hidden_report_filename.Text;
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;

            // *****************************************************
            // ****************** N E W L Y    A D D E D ***********
            // ****************** 2020-11-14 ***********************
            //******************************************************

            case "309":  // Obligation Request - Details coming from CAFOA - RE
            case "310":  // Obligation Request - Details coming from CAFOA - CE
            case "311":  // Obligation Request - Details coming from CAFOA - JO
                sp = "sp_payrollregistry_cafao_rep_new";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + s.txtb_orig_template_code

                break;


            case "223": // W/Tax Remittance for Subsistence - CE
            case "224": // W/Tax Remittance for Subsistence - RE
            case "225": // W/Tax Remittance for Subsistence - JO
                sp = "sp_payrollregistry_ovtm_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()

                break;
            // *****************************************************
            // ****************** N E W L Y    A D D E D ***********
            // ****************** 2020-11-14 ***********************
            //******************************************************
            case "923":  // Special Risk Allowance II - RE
            case "933":  // Special Risk Allowance II - CE
            case "943":  // Special Risk Allowance II - JO
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay_SRA.rpt";
                break;

            case "924":  // COVID-19 Hazard Pay - RE
            case "934":  // COVID-19 Hazard Pay - CE
            case "944":  // COVID-19 Hazard Pay - JO

                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay_HZD.rpt";
                break;
            case "925":  // Special Risk Allowance II - CE
            case "935":  // Special Risk Allowance II - JO
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay1.rpt";
                break;
            case "708":  //MATERNITY VOUCHER
            case "608":
                var emp_type = $('#ddl_reports option:selected').val().trim() == "708" ? "CE" : "RE";
                sp = "sp_voucher_tbl_repo";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + s.txtb_payroll_month + ",par_voucher_ctrl_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + emp_type;
                break;
            case "605":
            case "705":
            case "805":
            case "603":
            case "703":
            case "803":
                var emp_type = "";
                if ($('#ddl_reports option:selected').val().trim() == "605" || $('#ddl_reports option:selected').val().trim() == "603") {
                    emp_type = "RE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "705" || $('#ddl_reports option:selected').val().trim() == "703") {
                    emp_type = "CE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "805" || $('#ddl_reports option:selected').val().trim() == "803") {
                    emp_type = "JO";
                }
                sp = "sp_voucher_tbl_repo2";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + s.txtb_payroll_month + ",par_voucher_ctrl_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + emp_type;
                break;
            case "601":
            case "701":
            case "801":
                var emp_type = "";
                if ($('#ddl_reports option:selected').val().trim() == "601") {
                    emp_type = "RE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "701") {
                    emp_type = "CE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "801") {
                    emp_type = "JO";
                }
                sp = "sp_voucher_tbl_repo";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + s.txtb_payroll_month + ",par_voucher_ctrl_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + emp_type;
                break;
            case "609":  //OTHER CLAIMS
            case "709":
            case "809":

                sp = "voucher_dtl_oth_claims_tbl_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + s.txtb_payroll_month + ",par_voucher_ctrl_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val();
                break;

            case "226": // Template Code for : Maternity - Remittance (CE)
            case "227": // Template Code for : Maternity - Remittance (RE)
            case "228": // Template Code for : Maternity - Remittance (JO)
                var emp_type = "";
                if ($('#ddl_reports option:selected').val().trim() == "227") {
                    emp_type = "RE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "226") {
                    emp_type = "CE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "228") {
                    emp_type = "JO";
                }
                sp = "sp_voucher_dtl_tbl_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_voucher_ctrl_nbr," + s.txtb_ctrl_no + ",par_payrolltempalte_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + emp_type;
                break;

            case "229": // Template Code for : Voucher - Remittance (CE)
            case "230": // Template Code for : Voucher - Remittance (RE)
            case "231": // Template Code for : Voucher - Remittance (JO)
                var emp_type = "";
                if ($('#ddl_reports option:selected').val().trim() == "230") {
                    emp_type = "RE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "229") {
                    emp_type = "CE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "231") {
                    emp_type = "JO";
                }
                sp = "sp_voucher_tbl_repo";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + s.txtb_payroll_month + ",par_voucher_ctrl_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + emp_type;
                break;
				
			case "937":  // Tax Refund - Casual
            case "927":  // Tax Refund - Regular
            case "925":  //	GSIS REFUND	- RE
            case "935":  //	GSIS REFUND	- CE
            case "936":  //	HDMF REFUND	- CE
            case "926":  //	HDMF REFUND	- RE
            case "946":  //	HDMF REFUND	- JO
            case "931":  //	SSS REFUND	- CE
            case "921":  //	PHIC REFUND	- CE
            case "966":  //	 ONB	- RE
            case "973":  //	LBP REFUND
		    case "949":  //	SSS REFUND	- JO
		    case "965":  //	SSS REFUND	- RE
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay1.rpt";
                break;
            case "939":  //	HDMF REFUND	- JO
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay_PBB.rpt";
                break;
			case "962":  //	SRI
            case "957":  //	SRI
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay_SRI.rpt";
                break;
			case "939":  //	PBB
            case "929":  //	PBB
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay_PBB.rpt";
                break;
            case "974":  //	HEA
            case "975":  //	HEA
            case "976":  //	HEA
            case "977":  //	TAGUM REFUND
            case "978":  //	TAGUM REFUND
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay_HEA.rpt";
                break;
            case "981":  //	RATA DIFF
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_registry_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val()
                ReportPath = "/Reports/cryOtherPayroll/cryOthPay/cryOthPay5_RATADiff.rpt";
                break;
            case "610":  //	Other Claims / Refund v2	RE
            case "611":  //	Other Claims / Refund v2	CE
            case "612":  //	Other Claims / Refund v2	JO
                var emp_type = "";
                if ($('#ddl_reports option:selected').val().trim() == "610") {
                    emp_type = "RE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "611") {
                    emp_type = "CE";
                }
                if ($('#ddl_reports option:selected').val().trim() == "612") {
                    emp_type = "JO";
                }
                sp         = "voucher_dtl_oth_claims_tbl_rep2";
                parameters = "par_payroll_year," + s.txtb_payroll_year + ",par_payroll_month," + s.txtb_payroll_month + ",par_voucher_ctrl_nbr," + s.txtb_ctrl_no + ",par_payrolltemplate_code," + $('#ddl_reports option:selected').val() + ",par_employment_type," + emp_type;
                ReportPath = "/Reports/cryVoucher/cryOthClaimsV2/cryOthClaimsV2.rpt";
                break;
        }
        
        //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //    + "&SaveName=" + SaveName
        //    + "&ReportType=" + ReportType
        //    + "&ReportPath=" + ReportPath
        //    + "&Sp=" + sp + "," + parameters


        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        var iframe      = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";
        
        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName="   + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp + "," + parameters

        if (!/*@cc_on!@*/0)
        { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#loading_data").modal("hide")
            };
        }
        else if (iframe_page.innerHTML()) {
            // get and check the Title (and H tags if you want)
            var ifTitle = iframe_page.contentDocument.title;
            if (ifTitle.indexOf("404") >= 0) {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";
            }
            else if (ifTitle != "")
            {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";
            }
        }
        else {
            iframe.onreadystatechange = function () {
                if (iframe.readyState == "complete")
                {
                    iframe.style.visibility = "visible";
                    $("#loading_data").modal("hide")
                }
            };
        }
        
        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
        // *******************************************************
        // *******************************************************

    }

    //***********************************//
    //***View-Document-on-Modal*****VJA***//
    //***********************************// 
    s.btn_view_docs = function () {
        $("#doc_fund_subcode").css({
            "border": "",
        });
        $("#doc_nbr").css({
            "border": "",
        });
        $("#remarks").css({
            "border": "",
        });
        s.doc_ctrl_nbr = ""
        s.di.dttm = ""
        s.di.payroll_registry_descr = ""
        s.di.remarks = ""
        s.di.doc_nbr = ""
        s.di.doc_fund_subcode = ""
        s.di.dd_ToRelease_route = ""
        s.di.dd_ToReturn_route = ""
        s.di.doc_cafoa_nbr = ""

        $("#id_document_info").modal({ keyboard: false, backdrop: "static" })
        document.getElementById("doc_ctrl_nbr").focus();
    }


    s.select_fund_code = function (fundcode) {

    }

    //***********************************//
    //***View-Document-history*****MARVIN***//
    //***********************************// 
    s.btn_view_docs_history = function () {

        $("#id_document_history").modal({ keyboard: false, backdrop: "static" })
        document.getElementById("doc_ctrl_nbr_hist").focus();
    }

    //***********************************//
    //***Print-Document-on-Modal*****VJA***//
    // Update Date and By : VJA - 2021-03-18 
    //***********************************//
    s.btn_print_document = function (ds) {
        
        // V - Received Documents
        // L - Released Documents
        // T - Returned Documents
        var periodfrom  = $("#periodfrom").val().trim();
        var periodto    = $("#periodto").val().trim();

        if (elEmpty(periodfrom)) {
            $("#periodfrom").css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            });
            $(".periodfrom").removeClass("hidden")
            return
        }
        else {

            $("#periodfrom").css({
                "border": "none",
            });
            $(".periodfrom").addClass("hidden")
        }
        if (elEmpty(periodto)) {
            $("#periodto").css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            });
            $(".periodto").removeClass("hidden")
            return
        }
        else {

            $("#periodto").css({
                "border": "none",
            });
            $(".periodto").addClass("hidden")
        }
        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = "~/Reports/"
        var sp = ""
        var parameters = ""

        if (ds.doc_status == "V") {
            h.post("../cPayDocTrk/ReportDocuments", {
                par_doc_status: ds.doc_status,
                periodfrom: $("#periodfrom").val().trim(),
                periodto: $("#periodto").val().trim()
            }).then(function (d) {
                if (d.data.data.length > 0) {
                    sp = "sp_idoc_trk_tbl_rcvd_list";
                    parameters = "p_date_from," + periodfrom + ",p_date_to," + periodto
                    ReportPath = ReportPath + "cryDocTracking/cryReceivedDocs.rpt"
                    // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //     + "&SaveName=" + SaveName
                    //     + "&ReportType=" + ReportType
                    //     + "&ReportPath=" + ReportPath
                    //     + "&Sp=" + sp + "," + parameters

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp  + "," + parameters

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#loading_data").modal("hide")
                        };
                    }
                    else if (iframe_page.innerHTML()) {
                        // get and check the Title (and H tags if you want)
                        var ifTitle = iframe_page.contentDocument.title;
                        if (ifTitle.indexOf("404") >= 0) {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                        else if (ifTitle != "") {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                    }
                    else {
                        iframe.onreadystatechange = function () {
                            if (iframe.readyState == "complete") {
                                iframe.style.visibility = "visible";
                                $("#loading_data").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    // *******************************************************
                    // *******************************************************
                } else {
                    swal("No Data Found !", "List of Received Document not found", { icon: "warning", })
                }

            })

        }
        else if (ds.doc_status == "L") {

            h.post("../cPayDocTrk/ReportDocuments", {
                par_doc_status: ds.doc_status,
                periodfrom: periodfrom,
                periodto: periodto
            }).then(function (d) {
                if (d.data.data.length > 0) {
                    sp = "sp_idoc_trk_tbl_rlsd_list";
                    parameters = "p_date_from," + periodfrom + ",p_date_to," + periodto
                    ReportPath = ReportPath + "cryDocTracking/cryReleasedDocs.rpt"
                    // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //     + "&SaveName=" + SaveName
                    //     + "&ReportType=" + ReportType
                    //     + "&ReportPath=" + ReportPath
                    //     + "&Sp=" + sp + "," + parameters

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp  + "," + parameters

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#loading_data").modal("hide")
                        };
                    }
                    else if (iframe_page.innerHTML()) {
                        // get and check the Title (and H tags if you want)
                        var ifTitle = iframe_page.contentDocument.title;
                        if (ifTitle.indexOf("404") >= 0) {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                        else if (ifTitle != "") {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                    }
                    else {
                        iframe.onreadystatechange = function () {
                            if (iframe.readyState == "complete") {
                                iframe.style.visibility = "visible";
                                $("#loading_data").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    // *******************************************************
                    // *******************************************************
                } else {
                    swal("No Data Found !", "List of Released Document not found", { icon: "warning", })
                }
            })
        }
        else if (ds.doc_status == "T") {
            h.post("../cPayDocTrk/ReportDocuments", {
                par_doc_status: ds.doc_status,
                periodfrom: periodfrom,
                periodto: periodto
            }).then(function (d) {
                if (d.data.data.length > 0) {
                    sp = "sp_idoc_trk_tbl_retd_list";
                    parameters = "p_date_from," + periodfrom + ",p_date_to," + periodto
                    ReportPath = ReportPath + "cryDocTracking/cryReturnedDocs.rpt"
                    // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //     + "&SaveName=" + SaveName
                    //     + "&ReportType=" + ReportType
                    //     + "&ReportPath=" + ReportPath
                    //     + "&Sp=" + sp + "," + parameters

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp  + "," + parameters

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#loading_data").modal("hide")
                        };
                    }
                    else if (iframe_page.innerHTML()) {
                        // get and check the Title (and H tags if you want)
                        var ifTitle = iframe_page.contentDocument.title;
                        if (ifTitle.indexOf("404") >= 0) {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                        else if (ifTitle != "") {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                    }
                    else {
                        iframe.onreadystatechange = function () {
                            if (iframe.readyState == "complete") {
                                iframe.style.visibility = "visible";
                                $("#loading_data").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    // *******************************************************
                    // *******************************************************
                } else {
                    swal("No Data Found !", "List of Returned Document not found", { icon: "warning", })
                }

            })
        }

        //if (ds.doc_status != "") {
        //    location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //        + "&SaveName=" + SaveName
        //        + "&ReportType=" + ReportType
        //        + "&ReportPath=" + ReportPath
        //        + "&Sp=" + sp + "," + parameters
        //}
    }

    //*********************************************//
    //***Prit-Document-History-on-Modal*****VJA***//
    // Update Date and By : VJA - 2021-03-18 
    //*******************************************//
    s.btn_print_dochistory = function () {

        if (elEmpty(s.doc_ctrl_nbr_print_history)) {
            swal("Document Control Number is required !", "", "warning")
        }
        else {
            //h.post("../cMainPage/PreviousValuesonPage_cMainPage", {

            //    par_doc_ctrl_nbr: s.doc_ctrl_nbr
            //    , par_ddl_doc_status: s.ddl_doc_status
            //    , par_track_year: s.track_year
            //    , par_track_month: s.track_month
            //    , par_ddl_reports: s.ddl_reports
            //}).then(function (d) {

            //    var controller = "Reports"
            //    var action = "Index"
            //    var ReportName = "CrystalReport"
            //    var SaveName = "Crystal_Report"
            //    var ReportType = "inline"

            //    var ReportPath = "~/Reports/"
            //    var sp = ""
            //    var parameters = ""

            //    sp = "sp_document_tracking_tbl_history";
            //    parameters = "p_doc_ctrl_nbr," + s.doc_ctrl_nbr + ",p_docmnt_type," + "01"
            //    ReportPath = ReportPath + "cryDocTracking/cryDocsHistory.rpt"


            //    location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
            //        + "&SaveName=" + SaveName
            //        + "&ReportType=" + ReportType
            //        + "&ReportPath=" + ReportPath
            //        + "&Sp=" + sp + "," + parameters
            //})

            h.post("../cPayDocTrk/RetrieveDocHistory", {

                p_doc_ctrl_nbr: s.doc_ctrl_nbr_print_history
            }).then(function (d) {
                //alert(s.doc_ctrl_nbr_print_history)
                if (d.data.message == "success") {
                    var controller = "Reports"
                    var action = "Index"
                    var ReportName = "CrystalReport"
                    var SaveName = "Crystal_Report"
                    var ReportType = "inline"

                    var ReportPath = "~/Reports/"
                    var sp = ""
                    var parameters = ""

                    sp = "sp_edocument_trk_tbl_history";
                    parameters = "p_doc_ctrl_nbr," + s.doc_ctrl_nbr_print_history + ",p_docmnt_type," + d.data.doc_type
                    ReportPath = ReportPath + "cryDocTracking/cryDocsHistory.rpt"


                    // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //     + "&SaveName=" + SaveName
                    //     + "&ReportType=" + ReportType
                    //     + "&ReportPath=" + ReportPath
                    //     + "&Sp=" + sp + "," + parameters

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp + "," + parameters

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#loading_data").modal("hide")
                        };
                    }
                    else if (iframe_page.innerHTML()) {
                        // get and check the Title (and H tags if you want)
                        var ifTitle = iframe_page.contentDocument.title;
                        if (ifTitle.indexOf("404") >= 0) {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                        else if (ifTitle != "") {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";
                        }
                    }
                    else {
                        iframe.onreadystatechange = function () {
                            if (iframe.readyState == "complete") {
                                iframe.style.visibility = "visible";
                                $("#loading_data").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    // *******************************************************
                    // *******************************************************
                } else
                {
                    swal("No Data Found !", d.data.message, "warning")
                }

            })

        }

    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_code').val().trim() == "" && s.saveMode == "ADD") {
            ValidationResultColor("txtb_code", true);
            return_val = false;
        }

        if ($('#txtb_description').val().trim() == "") {
            ValidationResultColor("txtb_description", true);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_code").removeClass("required");
            $("#lbl_txtb_code_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");
        }
    }
    //***********************************************************//
    //*** Highlight Table Row
    //***********************************************************// 
    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#docType_datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == empl_id) {
                        nakit_an = true;
                        return false;
                    }
                }
            });
            if (nakit_an) {
                $(this).addClass("selected");
                return false;
            }
            rowx++;
        });
        return nakit_an;
    }
    function clearentry() {
        s.txtb_code = "";
        s.txtb_description = "";

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");
    }

    //************************************//
    //*** Add New Row To Table
    //************************************//
    s.addNewRow = function () {
        var table = $('#docType_datalist_grid').DataTable();

        // Sort by column 1 and then re-draw
        table
            .order([0, 'asc'])
            .draw();

        //var temp = 0;
        //var table = $('#docType_datalist_grid').DataTable();
        //table.page(temp).draw(false);

        if (ValidateFields()) { }
        if (s.SaveOpen == true) {
            swal("Save your work before doing other action!", { icon: "warning", });
        }
        else {

            s.saveMode = "ADD"
            clearentry();
            s.newRow = 1;
            var t = $('#docType_datalist_grid').DataTable();
            var counter = 1;

            t.row.add({
                "docmnt_type": "<input class='form-control text-center' maxlength='2'  placeholder ='Enter Code' id='txtb_code' ng-model='txtb_code' />",
                "docmnt_type_descr": "<input class='form-control' maxlength='50'  placeholder ='Enter Description' id='txtb_description' ng-model='txtb_description' />",
                "IsActive": '1'
            }).draw(false);

            $("#txtb_code").focus();
            s.SaveOpen = true;
        }
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function (row_id) {
        if (ValidateFields()) {
            if (s.saveMode == "ADD") {

                h.post("../cPayDocTrk/CheckExist", {
                    docmnt_type: s.txtb_code
                }).then(function (d) {
                    if (d.data.message == "success") {
                        s.newRow = 0;
                        btn = document.getElementById('addFinal');
                        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i>';
                        var data = {
                            docmnt_type: s.txtb_code
                            , docmnt_type_descr: s.txtb_description
                        }

                        h.post("../cPayDocTrk/Save", { data: data }).then(function (d) {
                            if (d.data.message == "success") {
                                s.DocType_Data.push(data)
                                s.DocType_Table.fnClearTable();
                                s.DocType_Table.fnAddData(s.DocType_Data);
                                for (var x = 1; x <= $('#docType_datalist_grid').DataTable().page.info().pages; x++) {
                                    if (get_page(s.txtb_code) == false) {
                                        s.DocType_Table.fnPageChange(x);
                                    }
                                    else {
                                        break;
                                    }
                                }
                                swal("Your record has been saved!", { icon: "success", });
                                s.SaveOpen = false;
                            }
                            else {
                                swal(d.data.message, { icon: "warning", });
                            }
                        })
                    }
                    else {
                        swal("Data already exist!", { icon: "warning", });
                        for (var x = 1; x <= $('#docType_datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_code) == false) {
                                s.DocType_Table.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }
                    }
                });
            }
            else if (s.saveMode == "EDIT") {

                s.newRow = 0;
                btn = document.getElementById('addFinal');
                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i>';

                var data = {
                    docmnt_type: s.txtb_code
                    , docmnt_type_descr: s.txtb_description
                }

                h.post("../cPayDocTrk/SaveEdit", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        s.DocType_Data.push(data);
                        s.DocType_Table.fnClearTable();
                        s.DocType_Table.fnAddData(s.DocType_Data);

                        for (var x = 1; x <= $('#docType_datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_code) == false) {
                                s.DocType_Table.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }
                        s.SaveOpen = false;

                        swal("Your record successfully updated!", { icon: "success", });
                    }
                    else {
                        swal(d.data.message, { icon: "warning", });
                    }
                });
            }
        }
        else {

        }
    }
    //************************************// 
    //*** Edit Row         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        if (s.SaveOpen == true) {
            swal("Save your work before doing other action!", { icon: "warning", });
        }
        else {
            s.saveMode = "EDIT"
            s.SaveOpen = true;
            var temp_code = s.DocType_Data[row_id].docmnt_type;
            var temp_descr = s.DocType_Data[row_id].docmnt_type_descr;
            s.txtb_code = temp_code;
            s.txtb_description = temp_descr;
            s.DocType_Data = s.DocType_Data.delete(row_id);
            s.DocType_Table.fnClearTable();
            if (s.DocType_Data.length != 0) {
                s.DocType_Table.fnAddData(s.DocType_Data);
            }

            s.newRow = 1;
            var t = $('#docType_datalist_grid').DataTable();

            t.row.add({
                "docmnt_type": temp_code,
                "docmnt_type_descr": "<input class='form-control' maxlength='50'  placeholder ='Enter Description' id='txtb_description' ng-model='txtb_description' />",
                "IsActive": '1'
            }).draw(false);

            $("#txtb_description").focus();
        }

    }
    //************************************// 
    //*** Delete Row              
    //**********************************// 
    s.btn_cancel_row = function (row_index) {
        if (s.saveMode == "ADD") {
            s.newRow = 0;
            s.DocType_Data = s.DocType_Data.delete(row_index);
            s.DocType_Table.fnClearTable();
            if (s.DocType_Data.length != 0) {
                s.DocType_Table.fnAddData(s.DocType_Data);
            }
            s.SaveOpen = false;
        }
        else if (s.saveMode == "EDIT") {
            s.newRow = 0;
            h.post("../cPayDocTrk/Initialize").then(function (d) {
                if (d.data.message == "success") {
                    s.DocType_Data = d.data.DocType
                    d.data.DocType.refreshTable('DocType_Table', '');
                    s.SaveOpen = false;
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index) {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cPayDocTrk/Delete", {
                        docmnt_type: s.DocType_Data[row_index].docmnt_type
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            s.DocType_Data = s.DocType_Data.delete(row_index);
                            s.DocType_Table.fnClearTable();
                            if (s.DocType_Data.length != 0) {
                                s.DocType_Table.fnAddData(s.DocType_Data);
                            }
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            swal("Data already deleted by other user/s!", { icon: "warning", });
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.DocType_Data = d.data.DocType
                            d.data.DocType.refreshTable('DocType_Table', '');
                        }
                    })
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }


    Array.prototype.delete2 = function (code) {
        return this.filter(function (d, k) {

            return d.doc_ctrl_nbr != code
        })
    }

    //-----------------UPDATE BY JADE -------------------------------------------------------------

    /* Formatting function for row details - modify as you need */

    /* Formatting function for row details - modify as you need */
    function format(d) {

        // `d` is the original data object for the row
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" id="table_show_details"> ' +
            '<tr>' +
            '<td style="width:30% !important;padding:0px 0px 0px 10px">Document Status:</td>' +
            '<td style="padding:0px" >' + d.document_status_descr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Document Remarks </td>' +
            '<td style="padding:0px">' + d.doc_remarks + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:30% !important;padding:0px 0px 0px 10px">Payroll Template :</td>' +
            '<td style="padding:0px">' + d.payrolltemplate_descr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:30% !important;padding:0px 0px 0px 10px">OBR Ctrl Nbr :</td>' +
            '<td style="padding:0px">' + d.doc_pbo_nbr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Voucher Ctrl Nbr :</td>' +
            '<td style="padding:0px">' + d.doc_voucher_nbr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Total Net Pay:</td>' +
            '<td style="padding:0px"> ' + currency(d.net_pay) + ' </td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Gross Pay :</td>' +
            '<td style="padding:0px">' + currency(d.gross_pay) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">OBR Amount :</td>' +
            '<td style="padding:0px">' + currency(d.obr_tot_amt) + '</td>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Payroll Month:</td>' +
            '<td style="padding:0px">' + d.payroll_month + '</td>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Payroll Year:</td>' +
            '<td style="padding:0px">' + d.payroll_year + '</td>' +
            '<tr>' +
            
            '</table>';
    }



    //s.btn_show_details = function (table_id, row_index) {
    //    // Add event listener for opening and closing details
    //    $('#' + table_id + ' tbody').on('click', 'span.details-control', function () {
    //        var tr = $(this).closest('tr');
    //        var row = $('#' + table_id + ' ').DataTable().row(tr);

    //        if (row.child.isShown()) {
    //            // This row is already open - close it
    //            row.child.hide();
    //            tr.removeClass('shown');
    //        }
    //        else {
    //            // Open this row
    //            row.child(format(row.data())).show();
    //            tr.addClass('shown');

    //        }

    //    });
    //}


    $('#torecieve tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#torecieve').DataTable().row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');

        }

    });

    $('#torelease tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#torelease').DataTable().row(tr);
        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');

        }

    });


    $('#search_docs_table tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#search_docs_table').DataTable().row(tr);
        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child(format_search(row.data())).show();
            tr.addClass('shown');

        }

    });

    //s.btn_search_document = function (row_id, type) {

    //    var data = []
    //    if (type == 1) {
    //        type
    //    }
    //    h.post("../cPayDocTrk/RetriveDocumentSearch",
    //        {
    //            p_doc_ctrl_nbr: s.txtb_search_doc_ctrl_nbr == null ? '' : '',
    //            p_doc_descr: s.txtb_search_doc_descr == null ? '' : '',
    //            p_payrolltemplate_code: $('#ddl_payrolltemplate_code option:selected').val()
    //        }).then(function (d) {
    //            if (d.data.message == "success") {
    //                s.search_docs_Data = d.data.search_docs_data;
    //                s.search_docs_Data.refreshTable('search_docs_Table', '');

    //                $("#search_docs_modal").modal({ keyboard: false, backdrop: "static" })
    //            }
    //            else {
    //                swal(d.data.message, { icon: "warning" })
    //            }
    //        })

    //}

    s.btn_search_document = function (row_id, type) {
        //Init_search_docs([])
        h.post("../cPayDocTrk/RetriveDocumentSearch",
            {
                p_search_type: $('#ddl_docs_type option:selected').val().trim(),
                p_search_text: s.txtb_search_doc_descr
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.search_docs_Data = d.data.search_docs_data;
                    s.search_docs_Data.refreshTable('search_docs_Table', '');

                    $("#search_docs_modal").modal({ keyboard: false, backdrop: "static" })

                    var table = $('#search_docs_table').dataTable();
                    $('#search_docs_table').css('background-color', 'red');
                    table.columns.adjust().draw();


                }
                else {
                    swal(d.data.message, { icon: "warning" })
                }
            })

    }


    function format_search(d) {
        // `d` is the original data object for the row
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" > ' +
            '<tr>' +
            '<td style="width:30% !important;padding:0px 0px 0px 10px">Payroll Template </td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + d.payrolltemplate_descr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:30% !important;padding:0px 0px 0px 10px">OBR Ctrl Nbr </td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + d.doc_obr_nbr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Voucher Ctrl Nbr</td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + d.doc_voucher_nbr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Total Net Pay</td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + currency(d.net_pay) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Gross Pay </td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + currency(d.gross_pay) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Document Date Time </td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + d.doc_dttm + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Document Remarks </td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + d.doc_remarks + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Document Type </td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + d.docmnt_type_descr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:30% !important;padding:0px 0px 0px 10px">Route To  </td>' +
            '<td style="padding:0px !important">:</td>' +
            '<td style="padding:0px">' + d.routed_2_descr + '</td>' +
            '</tr>' +
            '</table>';
    }

    s.btn_show_details_search = function (table_id, row_index) {
        // Add event listener for opening and closing details
        $('#' + table_id + ' tbody').on('click', 'span.details-control', function () {
            var tr = $(this).closest('tr');
            var row = $('#' + table_id + ' ').DataTable().row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                // Open this row
                row.child(format_search(row.data())).show();
                tr.addClass('shown');

            }

        });
    }
    s.ddl_employment_type_select = function () {
        h.post("../cPayDocTrk/RetrieveTemplate_Search",
            {
                par_employment_type: s.ddl_employment_type
            }).then(function (d) {

                s.payrolltemplate_list = d.data.data;

            })
    }


    s.ddl_docs_type_select = function () {
        if ($('#ddl_docs_type option:selected').val().trim() == "03") {
            s.ddl_payrolltemplate_code = "";
            s.hide_docs_type = true;
        }
        else {
            s.hide_docs_type = false;
        }
    }

    s.btn_search_docs = function () {
        $("#periodfrom").val("")
        $("#periodto").val("")
        $('#id_modal_search_docs').modal({ keyboard: false, backdrop: "static" })
    }



    //***********************************//
    //***Print-Button-on-Grid*****VJA***//
    //***********************************// 
    s.btn_ca_link_action = function (lst, table_data) {

        if (s[table_data][lst].with_data_link == "Y")
        {

            h.post("../cPayDocTrk/RetrieveCALink", { p_doc_ctrl_nbr: s[table_data][lst].doc_ctrl_nbr }).then(function (d) {

                if (d.data.message == "success")
                {

                    s.CA_Link_Data = d.data.sp_document_tracking_tbl_CA_link_list;
                    s.CA_Link_Data.refreshTable('CA_Link_Table', '');

                    $("#ca_link_modal").modal({ keyboard: false, backdrop: "static" })
                }
                else {
                    swal(d.data.message, { icon: "warning" })
                }


            })
        } else {
            swal("No Data Link from Cash Advance", { icon: "warning" })
        }

    }

    //***********************************//
    //***Print-Button-on-Grid*****VJA***//
    // Update Date and By : VJA - 2021-03-18 
    //***********************************// 
    s.btn_print_history_grid = function (lst, table_data) {
        h.post("../cPayDocTrk/RetrieveDocHistory", {

            p_doc_ctrl_nbr: s[table_data][lst].doc_ctrl_nbr
        }).then(function (d) {

            if (d.data.message = "success") {
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"

                var ReportPath = "~/Reports/"
                var sp = ""
                var parameters = ""

                sp = "sp_edocument_trk_tbl_history";
                parameters = "p_doc_ctrl_nbr," + s[table_data][lst].doc_ctrl_nbr + ",p_docmnt_type," + d.data.doc_type
                ReportPath = ReportPath + "cryDocTracking/cryDocsHistory.rpt"

               // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
               //     + "&SaveName=" + SaveName
               //     + "&ReportType=" + ReportType
               //     + "&ReportPath=" + ReportPath
               //     + "&Sp=" + sp + "," + parameters

                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview');
                var iframe_page = $("#iframe_print_preview")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#loading_data").modal("hide")
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#loading_data").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                // *******************************************************
                // *******************************************************

            } else {
                swal("No Data Found !", "", "warning")
            }

        })

    }



    //***************************************//
    //***Print-Payroll-Details**2020-02-25***//
    // Update Date and By : VJA - 2021-03-18 
    //***************************************//
    s.btn_print_doc_details = function (lst, table_data) {
        h.post("../cPayDocTrk/RetrieveRegistryDetails", {

            p_doc_ctrl_nbr: s[table_data][lst].doc_ctrl_nbr
        }).then(function (d) {

            if (d.data.message == "success") {
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"

                var ReportPath = "~/Reports/"
                var sp = ""
                var parameters = ""

                sp = "sp_idoc_trk_tbl_details";
                parameters = "p_doc_ctrl_nbr," + s[table_data][lst].doc_ctrl_nbr
                ReportPath = ReportPath + "cryDocTracking/cryPayrollDetails.rpt"

                // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                //     + "&SaveName=" + SaveName
                //     + "&ReportType=" + ReportType
                //     + "&ReportPath=" + ReportPath
                //     + "&Sp=" + sp + "," + parameters

                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview');
                var iframe_page = $("#iframe_print_preview")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#loading_data").modal("hide")
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#loading_data").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                // *******************************************************
                // *******************************************************

            } else {
                swal("No Data Found !", "", "warning")
            }
        })
    }
    function loading(action) {
        $("#loading_data").modal(action)
    }

    //**********************************************************//
    //***VJA - 2020-12-15 - Fetch Data Again*******************//
    //********************************************************//
    function FetchDataAgain()
    {
        h.post("../cPayDocTrk/FETCH_DATA", { doc_ctrl_nbr: s.doc_ctrl_nbr }).then(function (d)
        {
            if (d.data.message == "success")
            {

                s.ToRecieve_Data = d.data.ToReceive.refreshTable('ToRecieve_Table', '');
                s.ToRelease_Data = d.data.ToRelease.refreshTable('ToRelease_Table', '');

                var dtl = []
                s.corrent_row = [];
                var rec = s.ToRecieve_Data.filter(function (d) {
                    return d.doc_ctrl_nbr == s.doc_ctrl_nbr
                })

                var rel = s.ToRelease_Data.filter(function (d) {
                    return d.doc_ctrl_nbr == s.doc_ctrl_nbr
                })

                
                if (rec.length > 0) {
                    dtl = rec
                    s.corrent_row = rec
                }
                else if (rel.length > 0) {
                    dtl = rel
                    s.corrent_row = rel
                }

                else if (rec.length <= 0 && rel.length <= 0) {
                    docctrlnbrNotFound();
                    loading("hide");
                    return;
                }
                var t = dtl[0].doc_status.substring(0, 1)

                if ((dtl[0].rcvd_req_doc == 1 || dtl[0].rlsd_req_doc == 1))
                {
                    s.doc_nbr_show = true;
                }
                else {
                    s.doc_nbr_show = true;
                }

                if (dtl[0].docmnt_type == "02") {
                    s.doc_type1_show = false;
                }
                else {
                    s.doc_type1_show = true;
                }

                if (dtl[0].rte_code == "05" || dtl[0].rte_code == "04")
                {
                    s.dis_in_review = true;
                    s.dis_v_nbr     = true;
                    s.dis_cfo_nbr   = true;
                }
                else
                {
                    s.dis_in_review = false;
                    if (dtl[0].rte_code == "03")
                    {
                        s.dis_v_nbr     = false;
                        s.dis_cfo_nbr   = false;
                    }
                    else if(dtl[0].rte_code == "02")
                    {
                        s.dis_v_nbr     = true;
                        s.dis_cfo_nbr   = false;
                    }
                    else
                    {
                        s.dis_v_nbr = false;
                    }
                }

                if (t == "V")
                {
                    s.list_type     = "V"
                    s.rel_rec_ret   = "Received"
                    s.allow_receive = true
                    s.allow_release = false
                    s.allow_return  = false
                    var orig_route  = dtl[0].rte_code
                    var docctrlnbr  = dtl[0].doc_ctrl_nbr
                    h.post("../cPayDocTrk/ReturnReleaseRouting",
                        { rte_code: dtl[0].rte_code, docctrlnbr: docctrlnbr })
                        .then(function (d2)
                        {
                        s.temp_date_serv = d2.data.dt_tm;
                        s.change_date       = false;
                        s.doc_nbr_list      = d2.data.nbr_list
                        var paytrk_auth     = d2.data.paytrk_auth
                        s.ca_voucher_list   = d2.data.ca_voucher_list
                        paytrk_authority(paytrk_auth)
                        //s.to_return_route = d.data.return_route
                        //s.to_release_route = d.data.release_route
                        //s.t_len = s.to_return_route.length
                        //s.l_len = s.to_release_route.length
                        //s.di.dd_ToRelease_route = data_v[0].rlsd_retd_2_route_ctrl_nbr.toString();

                        s.action_status             = "RV"
                        s.di.payroll_registry_descr = dtl[0].payroll_registry_descr
                        s.di.remarks                = isnull(dtl[0].doc_remarks)
                        s.di.dttm                   = d2.data.dt_tm

                        s.data_vl = dtl;
                        s.di.doc_fund_subcode = dtl[0].doc_fund_subcode;
                        Required_Docs(dtl[0]);
                        $("#barcode_notfound").addClass("hidden")
                        s.allow_receive = true

                        s.Data_Mode(dtl[0], 'V')
                        if ($("#a_collapse").hasClass("collapsed")) {
                            $('#collapseOne').collapse("show")
                        }

                        loading("hide")

                    })
                }
                else if (t == "L")
                {
                    s.list_type     = "L"
                    s.rel_rec_ret   = "Released"
                    s.allow_receive = false
                    s.allow_release = true;
                    s.allow_return  = false;
                    var orig_route  = dtl[0].rte_code
                    var docctrlnbr  = dtl[0].doc_ctrl_nbr
                    h.post("../cPayDocTrk/ReturnReleaseRouting",
                        { rte_code: dtl[0].rte_code, docctrlnbr: docctrlnbr }).then(function (d2) {
                        s.change_date       = false;
                        s.temp_date_serv    = d2.data.dt_tm;
                        var paytrk_auth     = d2.data.paytrk_auth
                        s.doc_nbr_list      = d2.data.nbr_list
                        s.ca_voucher_list   = d2.data.ca_voucher_list
                        paytrk_authority(paytrk_auth)
                        s.to_return_route   = d2.data.return_route
                        s.to_release_route  = d2.data.release_route

                        s.t_len = s.to_return_route.length
                        s.l_len = s.to_release_route.length

                        ///s.di.dd_ToRelease_route = dtl[0].rlsd_retd_2_route_ctrl_nbr.toString();
                        s.di.dd_ToRelease_route = d.data.dtl[0].vlt_code.toString();

                        s.action_status = "RT"
                        s.di.payroll_registry_descr = dtl[0].payroll_registry_descr
                        s.di.remarks    = isnull(dtl[0].doc_remarks)

                        s.di.dttm   = d2.data.dt_tm
                        s.data_vl   = dtl
                        Required_Docs(dtl[0])
                        $("#barcode_notfound").addClass("hidden")

                        s.Data_Mode(dtl[0], 'L')
                        s.di.doc_fund_subcode = dtl[0].doc_fund_subcode;
                        if ($("#a_collapse").hasClass("collapsed")) {
                            $('#collapseOne').collapse("show")
                        }
                        if (s.to_release_route.length > 0) {
                            s.di.dd_ToRelease_route = s.to_release_route[0].rte_code.toString()
                        }
                        loading("hide")


                    })
                }
                else {
                    loading("hide")
                }
            }
            else {
                alert(d.data.message)
            }

        })

    }

    s.btn_print_card = function (row) {

        var info = s.ViewLegdger_Data[row]
       
        var payroll_period_from = ""
        var payroll_period_to = ""
        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = "~/Reports/cryEmployeeCard/cryEmployeeCard.rpt"
        var sp = "sp_employeecard_re_ce_nocard_rep"
        var parameters = "par_payroll_registry_nbr," + info.payroll_registry_nbr +" ,par_payroll_year," + info.payroll_year + ",par_empl_id," + info.empl_id + ",par_period_from," + payroll_period_from + ",par_period_to," + payroll_period_to


        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp + "," + parameters

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#loading_data").modal("hide")
            };
        }
        else if (iframe_page.innerHTML()) {
            // get and check the Title (and H tags if you want)
            var ifTitle = iframe_page.contentDocument.title;
            if (ifTitle.indexOf("404") >= 0) {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";
            }
            else if (ifTitle != "") {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";
            }
        }
        else {
            iframe.onreadystatechange = function () {
                if (iframe.readyState == "complete") {
                    iframe.style.visibility = "visible";
                    $("#loading_data").modal("hide")
                }
            };
        }
        console.log(s.embed_link)
        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

    }

    s.btn_view_ledger = function (doc_ctrl_nbr)
    {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cPayDocTrk/getEmployeeInRegistry", { doc_ctrl_nbr: doc_ctrl_nbr }).then(function (d) {
            if (d.data.icon == "success") {
                s.ViewLegdger_Data = d.data.EmployeeInRegistry.refreshTable('ViewLegdger_Table', '');
                $("#loading_data").modal("hide")
            }
            $("#view_ledger_modal").modal({ keyboard: false, backdrop: "static" })
        })

    }



})

