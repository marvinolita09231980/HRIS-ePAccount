ng_HRD_App.controller("cRemitLedgerGSIS_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var L = "length"
    var und = "undefined"
    var nl = null
    var ov = "isOverride"
    var y = "year"
    var dos = "ddl_override_status"
    var mn = "month_nbr"
    var hdr_dtl = []
    var voucher_nbr = ""
    var empl_id = ""
    var prevVal = []
    var wdc = new w_dc([])
    s.fd = []
    s.fd.txtb_year = ""
    s.fd.txtb_month = ""
    s.fd.txtb_empl_type = ""
    s.remit_status = ""
    s.isEdit = false
    s.fc = []
    s.listgridUpdate_Check = []

    s.rowLen = "5"

    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    var alp = "alphabet_list"
    s.alphabet_list = [
        { id: 'a', alpha_name: 'A' }, { id: 'b', alpha_name: 'B' }, { id: 'c', alpha_name: 'C' }, { id: 'd', alpha_name: 'D' }, { id: 'e', alpha_name: 'E' }, { id: 'f', alpha_name: 'F' },
        { id: 'g', alpha_name: 'G' }, { id: 'h', alpha_name: 'H' }, { id: 'i', alpha_name: 'I' }, { id: 'j', alpha_name: 'J' }, { id: 'k', alpha_name: 'K' }, { id: 'l', alpha_name: 'L' },
        { id: 'm', alpha_name: 'M' }, { id: 'n', alpha_name: 'N' }, { id: 'o', alpha_name: 'O' }, { id: 'p', alpha_name: 'P' }, { id: 'q', alpha_name: 'Q' }, { id: 'r', alpha_name: 'R' },
        { id: 's', alpha_name: 'S' }, { id: 't', alpha_name: 'T' }, { id: 'u', alpha_name: 'U' }, { id: 'v', alpha_name: 'V' }, { id: 'w', alpha_name: 'W' }, { id: 'x', alpha_name: 'X' },
        { id: 'y', alpha_name: 'Y' }, { id: 'z', alpha_name: 'Z' }

    ]

    var month = ["January  ", "February ", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December "]

    var osl = "override_status_list"
    var os = "override_status"


    var Init_ORPOST_Data = function (par_data) {
        s.ORPOST_Table_Data = par_data;
        s.ORPOSTTable = $('#or_grid').dataTable(
            {
                data: s.ORPOST_Table_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "isPosted",
                        "mRender": function (data, type, full, row) {

                            return '<input type="checkbox" ng-disabled="' + data + ' == 1 || check_action' + row["row"] + '== true" class="form-control cb_check" ng-model="checkbx' + row["row"] + '" ng-click="check_one(' + row["row"] + ')" ng-checked="' + data + ' == 1"/>'


                        }
                    },
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_year",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    }, {
                        "mData": "payroll_month",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + month[parseInt(data) - 1] + "</span>"
                        }
                    },
                    {
                        "mData": "grid_amount_ps",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "grid_amount_gs",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "or_nbr",
                        "mRender": function (data, type, full, row) {

                            return '<span class="text-center btn-block" ng-hide="or_nbr_show' + row["row"] + '">' + data + '</span>' +
                                '<input type="text" placeholder="OR Number" ng-show="or_nbr_show' + row["row"] + '" class="form-control block " ng-model="or_nbr' + row["row"] + '"/>'


                        }
                    },
                    {
                        "mData": "or_date",
                        "mRender": function (data, type, full, row) {

                            return '<span class="text-center btn-block" ng-hide="or_date_show' + row["row"] + '">' + data + '</span>' +
                                //'<div class="input-group date" ng-show="or_date_show' + row["row"] + '" data-provide="datepicker" style="">' +
                                //'<input type="text" id="txtb_period_to" class="form-control text-center" ng-model="or_date' + row["row"] + '">' +
                                //'<div class="input-group-addon">'+
                                //'<span class="fa fa-calendar"></span></div></div>'
                                '<input type="date" data-date="" data-date-format="YYYY-MM-DD" ng-show="or_date_show' + row["row"] + '" class="form-control block dp_date" ng-model="or_date' + row["row"] + '"/>'

                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var dsble = false
                            if (full["ischecked"] == '1') {
                                dsble = true
                            }
                            else {
                                dsble = false
                            }
                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-disabled="action_btn' + row["row"] + '" class="btn btn-info btn-sm action" ng-click="btn_post(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Post OR">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-disabled="' + full["isPosted"] + ' == 0" class="btn btn-danger btn-sm action" ng-click="btn_unpost(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="cancel Post">   <i id="del_row' + row["row"] + '" class="fa fa-times"></i></button>' +
                                '</div></center>';


                        }
                    }

                    , {
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data.substring(0, 1) + "</span>"
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



    function init() {
        s.rowLen = "10";
        s.ckall = false
        $("#spinner_load").modal("show")
        s.ddl_dept = ""
        s.ddl_letter = ""
        s.fd[dos] = "N"
        s.search_name = ""
        s.cb_check_all = false
        s.view_option = "1"
        s.ddl_batch_nbr = "0"
        h.post("../cRemitLedgerORDetail/initializeData", { ltr: s.ddl_letter, v_opt: s.view_option, batch: s.ddl_batch_nbr }).then(function (d) {

            s.department_list = d.data.department_list
            s.ORPOST_Table_Data = d.data.details
            prevVal = d.data.prevVal
            Init_ORPOST_Data(d.data.details)

            angular.forEach(s.ORPOST_Table_Data, function (v, k) {
                s["action_btn" + k] = true
                s["check_action" + k] = false
            })


            console.log(d.data.details)

            if (d.data.details.isPostedAll()) {
                s.chk_all_disable = true
                s.chk_all_chk = true
            }
            // STATUS DESCRIPTION
            // N = 'Not Remitted'
            // R = 'Remitted'
            // P = 'Partially Remitted'

            RemittanceStatus(d.data.remittance_status);


            $("#spinner_load").modal("hide")
        })
    }

    init()

    s.search_in_list = function (value, table) {

        $("#or_grid").DataTable().search(value).draw();
    }

    s.lbl_payroll_month = "Payroll Month"
    s.search_in_list_month = function (value, table) {
        s.lbl_payroll_month = value
        if (value == "") {
            s.lbl_payroll_month = "Payroll Month"
        }
        $("#" + table).DataTable().column(4).search(value).draw();
        $("#or_grid").DataTable().column(4).search(value).draw();
    }

    s.search_in_list_letter = function (value, table) {

        $("#" + table).DataTable().column(10).search(value).draw();
        $("#or_grid").DataTable().column(10).search(value).draw();


    }

    s.setNumOfRow = function (value, table) {


        $("#or_grid").DataTable().page.len(s.rowLen).draw();

    }

    $("input").on("change", function () {
        this.setAttribute(
            "data-date",
            moment(this.value, "YYYY-MM-DD")
                .format(this.getAttribute("data-date-format"))
        )
    }).trigger("change");

    function RemittanceStatus(n) {

        switch (n.toString().trim()) {
            case "N":
                s.remit_status_class = "text-danger"
                s.txtb_remittance_status = "NOT REMITTED"
                break;
            case "P":
                s.remit_status_class = "text-warning"
                s.txtb_remittance_status = "PARTIALLY REMITTED"
                break;
            case "R":
                s.remit_status_class = "text-success"
                s.txtb_remittance_status = "REMITTED"
                break;
        }
    }

    //this function is called after refreshTable to return to the current dataTable page
    function changePage(tname, page, id) {

        var npage = page

        var pageLen = $("#" + id).DataTable().page.info().length
        if (page < 2 && pageLen == 0) {
            npage = page + 1
        }
        else if (page > 1 && pageLen == 0) {
            npage = page - 1
        }

        if (npage != 0) {
            s[tname].fnPageChange(npage)
        }
    }
    Array.prototype.isPostedAll = function () {

        var retval = false
        var l = this.length
        var pl = this.filter(function (d) {
            return d.remittance_dtl_status == "R"
        }).length

        if (l == pl) {
            retval = true
        }
        return retval
    }

    //This function is called to extract the DataTable rows data

    function DataTable_data(tname) {
        var data = []
        var id = s[tname][0].id;
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x) {
            data.push(dtrw[x])
        }
        return data
    }


    s.ToLedgerHeader = function () {
        location.href = "../cRemitLedgerOR/Index"
    }

    s.HideRejectedGrid = function () {
        s.rejected = false
    }

    s.CheckAll = function (val) {
        if (val == false) {

            s.ckall = true
            angular.forEach(s.ORPOST_Table_Data, function (v, k) {
                if (v.isPosted != 1) {
                    s["checkbx" + k] = true
                    s["or_nbr_show" + k] = true
                    s["or_date_show" + k] = true
                }
            })

            s.fd.txtb_or_nbr = ""
            s.fd.txtb_or_date = ""
            $("#post_all_modal").modal("show")
        }
        else {

            angular.forEach(s.ORPOST_Table_Data, function (v, k) {
                if (v.isPosted != 1) {
                    s["checkbx" + k] = false
                    s["or_nbr_show" + k] = false
                    s["or_date_show" + k] = false
                }
            })

            //s.ORPOST_Table_Data.refreshTable("ORPOSTTable", "")
        }


    }
    s.check_one = function (row_id) {

        if (s["checkbx" + row_id] == false || s["checkbx" + row_id] == undefined) {
            s["or_date" + row_id] = ""
            s["or_nbr" + row_id] = ""
            s["action_btn" + row_id] = false
            s["or_nbr_show" + row_id] = true
            s["or_date_show" + row_id] = true
        }
        else {

            s["or_date" + row_id] = ""
            s["or_nbr" + row_id] = ""
            s["action_btn" + row_id] = true
            s["or_nbr_show" + row_id] = false
            s["or_date_show" + row_id] = false
        }

    }
    s.btn_post = function (row_id) {


        if (elEmpty(s["or_nbr" + row_id])) {
            alert("Provide OR Number")
            return
        }
        if (elEmpty(s["or_date" + row_id])) {
            alert("Provide Date")
            return
        }
        var dt = s.ORPOST_Table_Data[row_id]
        var data = {
            remittance_ctrl_nbr: dt.remittance_ctrl_nbr
            , empl_id: dt.empl_id
            , voucher_nbr: dt.voucher_nbr
            , or_nbr: s["or_nbr" + row_id]
            , or_date: s["or_date" + row_id]
            , payroll_month: dt.payroll_month
        }

        h.post("../cRemitLedgerORDetail/Post_One", { dta: data }).then(function (d) {

            if (d.data.message == "success") {
                RemittanceStatus(d.data.remit_status);
                s.remit_status = d.data.remit_status
                angular.forEach(s.ORPOST_Table_Data, function (v, k) {
                    if (k == row_id) {
                        v.or_nbr = s["or_nbr" + row_id]
                        v.or_date = d.data.returndate
                        v.isPosted = 1;
                    }
                })

                s.ORPOST_Table_Data.refreshTable("ORPOSTTable", empl_id)

                s["check_action" + row_id] = true
                s["action_btn" + row_id] = true
                s["or_nbr_show" + row_id] = false
                s["or_date_show" + row_id] = false

                if (s.ORPOST_Table_Data.isPostedAll()) {
                    s.chk_all_disable = true
                    s.chk_all_chk = true
                }
                else {
                    s.chk_all_disable = false
                    s.chk_all_chk = false
                }

                swal("Successfully Updated!", "Existing record has been posted successfully!", "success")
            }
            else {

            }
        })


    }
    s.btn_unpost = function (row_id) {

        var dt = s.ORPOST_Table_Data[row_id]
        var data = {
            remittance_ctrl_nbr: dt.remittance_ctrl_nbr
            , empl_id: dt.empl_id
            , voucher_nbr: dt.voucher_nbr

        }
        swal({
            title: "Are you sure you want to unpost this remittance?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cRemitLedgerORDetail/UnPost", {
                        dta: dt
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            s.remit_status = d.data.remit_status
                            RemittanceStatus(d.data.remit_status);
                            angular.forEach(s.ORPOST_Table_Data, function (v, k) {
                                if (k == row_id) {
                                    v.or_nbr = ""
                                    v.or_date = "1900-01-01"
                                    v.isPosted = 0;
                                }
                            })
                            s["checkbx" + row_id] = false
                            s.chk_all_disable = false
                            s.chk_all_chk = false
                            s["check_action" + row_id] = false
                            s.ORPOST_Table_Data.refreshTable("ORPOSTTable", empl_id)
                            swal("Successfully Updated!", "Existing record has been unposted successfully!", "success")
                        }
                        else {
                            swal(d.data.message, { icon: "error", });
                        }
                    })
                }
                else {

                }
            })


    }
    s.btn_save_cancel = function () {

        //angular.forEach(s.ORPOST_Table_Data, function (v, k) {
        //    if (v.isPosted != 1) {
        //        s["checkbx" + k] = false
        //        s["or_nbr_show" + k] = false
        //        s["or_date_show" + k] = false
        //    }
        //})
        //s.cb_check_all = false
    }
    function computeFloat(v1, v2) {
        var result = 0;

        result = v1 - v2;
        return result;
    }


    s.SelectMonth = function () {

        //for (var x = 0; x < s.ORPOST_Table_Data.length; x++) {
        //    console.log(s.ORPOST_Table_Data[x].isPosted)
        //    if (s.ORPOST_Table_Data[x].isPosted == 0 && s.ORPOST_Table_Data[x].payroll_month == $("#ddl_month option:selected").val()) {

        //        s["checkbx" + x] = true
        //        s["or_nbr_show" + x] = true
        //        s["or_date_show" + x] = true
        //        //v.or_nbr = ""
        //        //v.or_date = "1900-01-01"
        //        s.ORPOST_Table_Data[x].isPosted = 1;
        //    }
            
           
        //}

        angular.forEach(s.ORPOST_Table_Data, function (v, k) {

            if (v.isPosted == 0 && v.payroll_month == $("#ddl_month option:selected").val())
            {
                console.log("OKAY")
                s["checkbx" + k] = true
                s["or_nbr_show" + k] = true
                s["or_date_show" + k] = true
                //v.or_nbr = ""
                //v.or_date = "1900-01-01"
                v.isPosted = 1;
            }
            //else
            //{
            //    s["checkbx" + k] = false
            //    s["or_nbr_show" + k] = false
            //    s["or_date_show" + k] = false
            //    v.isPosted = 0;
            //}
        })
        //alert($("#ddl_month option:selected").val())
    }

    s.btn_checked_all = function (fc) {
       
        if (s.remit_status == "R") {
            swal("No data to post", { icon: "warning", });
            return
        }
        if (elEmpty(fc.txtb_or_nbr)) {
            require_warning(true, "orReq", "orWng", "require-field")
            return
        }
        else {
            require_warning(false, "orReq", "orWng", "require-field")
        }
        if (elEmpty(fc.txtb_or_date)) {
            require_warning(true, "odReq", "odWng", "require-field")
            return
        }
        else {
            require_warning(false, "odReq", "odWng", "require-field")
        }
      
        s.listgridUpdate_Check = []

        angular.forEach(s.ORPOST_Table_Data, function (v, k) {

            if (s["checkbx" + k] == true && v.isPosted == 0) {
                s.listgridUpdate_Check.push(s.ORPOST_Table_Data[k])
            }

        })
            
        var format_date = fc.txtb_or_date.getFullYear() + "-" + String(fc.txtb_or_date.getMonth() + 1).padStart(2, '0') + "-"+ String(fc.txtb_or_date.getDate()).padStart(2, '0');

        h.post("../cRemitLedgerORDetail/Post_Checked", { or_nbr: fc.txtb_or_nbr, or_date: format_date, all_dtl_data: s.listgridUpdate_Check, action: "CP", payroll_month: $("#ddl_month option:selected").val() }).then(function (d) {
                        if (d.data.message == "success") {
                            s.remit_status = d.data.remit_status

                            RemittanceStatus(d.data.remit_status);

                            angular.forEach(s.ORPOST_Table_Data, function (v, k) {
                                if (s["checkbx" + k] == true && v.isPosted == 0) {
                                    v.or_nbr = fc.txtb_or_nbr
                                    v.or_date = format_date
                                    v.isPosted = 1;
                                    s["check_action" + k] = true
                                    s["action_btn" + k] = true
                                    s["or_nbr_show" + k] = false
                                    s["or_date_show" + k] = false
                                }
                            })
                            s.chk_all_disable = true
                            s.chk_all_chk = true
                            s.ORPOST_Table_Data.refreshTable("ORPOSTTable", empl_id)
                            swal("Successfully Updated!", "Existing record has been posted successfully!", "success")
                            $("#post_all_modal").modal("hide")
                           
                        }
                        else {
                            swal(d.data.message, { icon: "error" });
                        }
                    })

    }


    s.btn_post_all = function (fd) {

        btn_post.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
        $('#btn_post').attr("disabled", true);

        if (s.remit_status == "R") {
            swal("No data to post", { icon: "warning", });
            btn_post.innerHTML = '<i class="fa fa-save"> </i>Save ';
            $('#btn_post').attr("disabled", false);
            return
        }
        if (elEmpty(fd.txtb_or_nbr)) {
            require_warning(true, "orReq", "orWng", "require-field")
            btn_post.innerHTML = '<i class="fa fa-save"> </i>Save ';
            $('#btn_post').attr("disabled", false);
            return
        }
        else {
            require_warning(false, "orReq", "orWng", "require-field")
        }
        if (elEmpty(fd.txtb_or_date)) {
            require_warning(true, "odReq", "odWng", "require-field")
            btn_post.innerHTML = '<i class="fa fa-save"> </i>Save ';
            $('#btn_post').attr("disabled", false);
            return
        }
        else {
            require_warning(false, "odReq", "odWng", "require-field")
        }
        

        h.post("../cRemitLedgerORDetail/Post_All", { or_nbr: fd.txtb_or_nbr, or_date: fd.txtb_or_date, action: "PO", payroll_month: $("#ddl_month option:selected").val() }).then(function (d) {
            if(d.data.message == "success")
            {
               //LAST 2020-11-02
                RemittanceStatus(d.data.remit_status);
                s.remit_status = d.data.remit_status

                var counter_check_post = 0
                var counter_check_unpost = s.ORPOST_Table_Data.length
                angular.forEach(s.ORPOST_Table_Data, function (v, k)
                {
                    if (v.isPosted == 1 && v.payroll_month == $("#ddl_month option:selected").val())
                    {
                        v.or_nbr = fd.txtb_or_nbr
                        v.or_date = d.data.returndate
                        //v.isPosted = 1;
                        s["check_action" + k] = true
                        s["action_btn"   + k] = true
                        s["or_nbr_show"  + k] = false
                        s["or_date_show" + k] = false
                        counter_check_post = counter_check_post + 1
                    }
                })

                if (counter_check_unpost == counter_check_post) {
                    s.chk_all_disable = true
                    s.chk_all_chk = true
                }
                else {
                    s.chk_all_disable = false
                    s.chk_all_chk = false
                }
               
                

                

                s.ORPOST_Table_Data.refreshTable("ORPOSTTable", empl_id)
                btn_post.innerHTML = '<i class="fa fa-save"> </i>Save ';
                $('#btn_post').attr("disabled", false);

                $("#post_all_modal").modal("hide")
                swal("Successfully Updated!", "Existing record has been posted successfully!", "success")
            }
            else
            {
                swal(d.data.message, { icon: "error" });
                btn_post.innerHTML = '<i class="fa fa-save"> </i>Save ';
                $('#btn_post').attr("disabled", false);
            }
        })

    }
    s.btn_unpost_all = function ()
    {
        if (s.remit_status == "N") {
            swal("No data to unpost", { icon: "warning", });
            return
        }
        swal({
            title: "Are you sure you want to unpost this remittances?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
                .then(function (willDelete) {
                    if (willDelete) {
                        h.post("../cRemitLedgerORDetail/Post_All", { or_nbr: "", or_date: "", action: "UP", payroll_month: $("#ddl_month option:selected").val() }).then(function (d) {
                               if (d.data.message == "success") {
                               s.remit_status = d.data.remit_status

                               RemittanceStatus(d.data.remit_status);

                                 
                                angular.forEach(s.ORPOST_Table_Data, function (v, k) {
                                    //if (v.isPosted == 1) {
                                       
                                    //}

                                    v.or_nbr = ""
                                    v.or_date = "1900-01-01"
                                    v.isPosted = 0;
                                    s["check_action" + k] = false
                                    s["action_btn" + k] = true
                                    s["checkbx" + k] = false
                                    
                                   
                                   })

                                  
                                   var list_grid = s.ORPOST_Table_Data

                                   s.chk_all_disable = false
                                   s.chk_all_chk = false
                                   
                                   //$('input[disabled="false"]').prop('disabled', false)
                                   s.ORPOSTTable.fnClearTable()
                                   s.ORPOSTTable.fnAddData(list_grid)

                                //s.ORPOST_Table_Data.refreshTable("ORPOSTTable", empl_id)

                                   $("#post_all_modal").modal("hide")
                                   swal("Successfully Updated!", "Existing record has been unposted successfully!", "success")
                            }
                            else {
                                swal(d.data.message, { icon: "error" });
                            }
                        })
                    }
                    else {

                    }
                })
    }


    s.btn_post_checked = function ()
    {
        $("#ddl_month").val("")
        s.ddl_month = ""
        s.fd.txtb_or_nbr = ""
        s.fd.txtb_or_date = ""

        swal({
            title: "Are you sure you want to post this remittances?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(function (willDelete) {
                if (willDelete) {

                    
                    s.fc.txtb_or_nbr = ""
                    s.fc.txtb_or_date = ""
                    $("#post_all_modal").modal("show")

                   
                }
                else {

                }
            })
    }

    s.btn_check = function (row_id) {
        s.GSIS_Rej_Data[row_id].isChecked = 1;
       
    }


    //this function is called to filter employee name in dataTable data that start with the specific alphabet
    s.FILTER = function () {

        $("#spinner_load").modal("show")
        getFilterDetails()
    }

    function getFilterDetails() {
        
        h.post("../cRemitLedgerORDetail/GetInfoResult", {
            dep: s.ddl_dept,
            letter: s.ddl_letter,
            v_opt: s.view_option,
            batch: s.ddl_batch_nbr
        }).then(function (d) {
            if (d.data.message == "success") {
                s.ORPOST_Table_Data = d.data.details
                s.ORPOST_Table_Data.refreshTable("ORPOSTTable", "")
                $("#spinner_load").modal("hide")
            }
        })
    }
    

   

    

    s.Employment_Status = function (t) {
        s.emp_status = t
        if (t == "RE") {
            $("#ce").removeClass("active-tab")
            $("#re").addClass("active-tab")
            getFilterResult()
        }
        else {
            $("#re").removeClass("active-tab")
            $("#ce").addClass("active-tab")
            getFilterResult()
        }
    }

    function overrideHasVal() {
        if (elEmpty(s.fd.txtb_PS_override) == false || elEmpty(s.fd.txtb_GS_override) == false) {
            return true
        }
        else {
            return false
        }
    }

    //*** format overrides value into money with two decimal zeros onblur***
    function w_dc(n) {
        s.o_invalid = false
        s.val = ""
        var dot = 0
        var c = 0
        var nu = 0
        var v = 0
        var fDot = false
        var nl = n[L]
        for (var i = 0; i < nl ; i++) {
            if (i == 0 && n[i] == ".") {
                fDot = true
            }

            if (isNaN(n[i])) {
                c += 1
            }
            else {
                nu += 1
            }
            if (n[i] == '.') {
                nu += 1
                dot += 1
            }
        }

        if (elEmpty(n)) {

            s.val = "0.00"
            return "0.00"
        }
        else if (fDot) {

            s.val = "0" + n

            return "0" + n
        }
        else if (nu == nl && dot == 0) {

            s.val = n + ".00"
            return n + ".00"
        }
        else if (nu == nl && dot == 1) {

            s.val = n
            return n

        }
        else {
            s.o_invalid = true
            return "invalid"
        }


    }


    //*** test if overrides value is a valid money value****
    function isCurrency(nbr) {
        var regex = /^\d+(?:\.\d{0,2})$/;

        if (regex.test(nbr)) {
            return true
        }
        else {
            return false
        }

    }






    // allow saving if overrides and remitance status is validated
    function alw_sve_ov() {

        var retVal = false

        var o_ps = s.fd.txtb_override_ps
        var o_gs = s.fd.txtb_override_gs
        var ps_st = (!elEmpty(o_ps) && s[ov])
        var gs_st = (!elEmpty(o_gs) && s[ov])
        var gp_st = (!elEmpty(o_ps) && !elEmpty(o_gs) && s[ov])
        var gp_st_nt = (elEmpty(o_ps) && elEmpty(o_gs) && !s[ov])

        if (ps_st) {
            retval = true
        }
        else if (gs_st) {
            retval = true

        }
        else if (gp_st) {
            retval = true

        }
        else if (gp_st_nt) {
            retval = true

        }
        else {
            retval = false

        }
        return retval
    }

    //**** Enable disbale remittance status field if oveerrides value is not empty ******
    function alw_rmt_st() {
        var o_ps = s.fd.txtb_PS_override
        var o_gs = s.fd.txtb_GS_override

        var eps = elEmpty(o_ps)
        var egs = elEmpty(o_gs)

        var pv = s.ps_vld
        var gv = s.gs_vld
        var ps_v = (!eps && pv == 1)
        var gs_v = (!egs && gv == 1)


        if (eps && egs) {
            s.fd[dos] = "N"
            s.isOverride = false
        }
        else {
            s.isOverride = true
        }
        

    }


   


    // define late or current remittance
    function L_or_C(ob) // 
    {
        s.override_status_list = []
        var L = "late"
        var C = "current"
        var py = parseInt(ob.payroll_year)
        var pm = parseInt(ob.payroll_month)
        var ry = parseInt(s[y]) //remittance year
        var rm = parseInt(s[mn]) //remittance month

        var cycm = (py < ry && pm < rm) //current
        var lylm = (py > ry && pm > rm) //late
        var lycm = (py > ry && pm < rm) //late
        var cylm = (py < ry && pm > rm) //late
        var ccylm = (py == ry && pm > rm) // late
        var ccycm = (py == ry && pm < rm) // current
        var ccyccm = (py == ry && pm == rm)
        var retval = ""
        var list = []

        if (cycm) {
            list = ov_lst("C")
            retval = C
        }
        else if (lylm) {
            list = ov_lst("L")
            retval = L
        }
        else if (lycm) {
            list = ov_lst("L")
            retval = L
        }
        else if (cylm) {
            list = ov_lst("L")
            reval = L
        }
        else if (ccylm) {
            list = ov_lst("L")
            retval = L
        }
        else if (ccycm) {
            list = ov_lst("C")
            retval = C
        }
        else if (ccyccm) {
            list = ov_lst("C")
            retval = C
        }

        s.override_status_list = list
       
        return retval
    }


    // filter overrride status list 
    function ov_lst(t) {
        var lst = []
        if (t == "L") {
            lst = s[os].deletebyprop("2", "id")
        }
        else if (t == "C") {
            lst = s[os].deletebyprop("1", "id")
        }
        return lst
    }


    Array.prototype.populate_DT = function () {


        s.GSIS_Table_Data = this
        s.GSIS_Table_Data.refreshTable("GSISTable", "")



    }
    function validateEmpty(data) {

        if (data == null || data == "" || data == undefined) {
            return ""
        }
        else {
            return data
        }

    }
    function vNumber(data) {

        if (data == null || data == "" || data == undefined) {
            return 0
        }
        else {
            return data
        }

    }

    function formatNumber(d) {
        return d.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    function elEmpty(data) {

        if (data == null || data == "" || data == undefined) {
            return true
        }
        else {
            return false
        }

    }

    function require_warning(bol, fieldClass, txtclass, classname) {
        if (bol) {
           
            s[txtclass] = true
            s[fieldClass] = classname
        }
        else {
            s[txtclass] = false
            s[fieldClass] = ""

        }


    }

    function currency(d) {
        
        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = parseFloat(d).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }



    Array.prototype.setIfNotempty = function (prop, val, row) {
        var data = this[row]
        var prop2 = ""
        var retbval = ""


        if (prop == "ps") {
            prop2 = "payroll_amount_ps"
        }
        else {
            prop2 = "payroll_amount_gs"

        }
        var retval = ""

        if (val == null || val == "" || val == undefined || val == 0) {
            retval = data[prop2]
        }
        else {
            retval = val
        }
        return retval
    }


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


    }

    String.prototype.get_page = function (table) {
        id = this;
        var nakit_an = false;
        var rowx = 0;
        var el_id = s[table][0].id
        $("#" + el_id + " tr").each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == id) {
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

    Array.prototype.select = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] == code
        })
    }
    Array.prototype.delete = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    Array.prototype.deletebyprop = function (code, prop) {
       
        return this.filter(function (d) {
            return d[prop] != code
        })
    }

    $('#post_all_modal').on('hidden.bs.modal', function (e) {
        
    })

   


  


    

    function toDecimalFormat(data) {
        var value = 0.00
        if (data == "" || data == undefined) {
            return value
        }


        var val = parseFloat(data.replace(/,/g, ''))

        if (isNaN(val)) {
            return value;
        }
        else {
            return val;
        }
    }

   
    s.ToLedgerHeader = function () {
        location.href = "../cRemitLedgerOR/Index"
    }
})
