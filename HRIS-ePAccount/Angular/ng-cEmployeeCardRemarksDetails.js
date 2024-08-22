ng_HRD_App.controller("cEmployeeCardRemarksDetails_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid = "";
    s.rowLen = "5";
    s.tempName = "";
    s.temprTypeCd = "";
    s.existed = "";
    s.year = [];
    s.prevValues = [];
    s.tmp_row_id = "";
    function init() {
        $("#modal_generating_remittance").modal();
        RetrieveYear();
        s.ddl_year = new Date().getFullYear().toString();
        s.currentMonth = new Date().getMonth() + 1;
        s.ddl_month = s.currentMonth.toString();

        s.defaultYear = new Date().getFullYear().toString();
        s.defaultMonth = new Date().getMonth() + 1;
        s.defaultDate = new Date().getDate().toString();
        s.defaultDatePickerVal = s.defaultYear + '-' + s.defaultMonth.toString() + '-' + s.defaultDate;
        s.lastday = s.defaultYear + '-' + s.defaultMonth.toString() + '-' + new Date(s.defaultYear, s.defaultMonth, 0).getDate();

        s.txtb_or_date = s.defaultDatePickerVal
        s.txtb_period_from = s.defaultDatePickerVal
        s.txtb_period_to = s.lastday
        s.isEdit = false
        s.isDisAble = false


        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cEmployeeCardRemarksDetails/initializeData",
            {

            }).then(function (d) {

                s.prevValues = d.data.prevValues;
                s.txtb_empl_name = d.data.prevValues[1] + "," + d.data.prevValues[2];

                $("#ddl_month").val("00")
                s.ddl_month = "00"
                if (d.data.empl_data.length > 0) {
                    init_table_data(d.data.empl_data);
                }
                else {
                    init_table_data([]);
                }
                userid = d.data.userid;
                s.txtb_empl_id = d.data.prevValues[0]
               
                showdetailsInfo("datalist_grid");
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                s.allowAdd = d.data.allowAdd
                s.allowDelete = d.data.allowDelete
                s.allowEdit = d.data.allowEdit
                s.allowView = d.data.allowView

                if (s.allowAdd == "1") {
                    s.ShowAdd = true
                }
                else {
                    s.ShowAdd = false
                }

                if (s.allowDelete == "1") {
                    s.ShowDelete = true
                }
                else {
                    s.ShowDelete == false
                }

                if (s.allowEdit == "1") {
                    s.ShowView = true
                }
                else {
                    s.ShowView = false
                }
                $("#modal_generating_remittance").modal("hide");
            });
    }
    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                order: [[2, 'asc']],
                columns: [
                    {
                        "mData": "payroll_registry_nbr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "voucher_nbr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_year",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_month",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center hidden'>" + data + "</span>"
                        }
                    },
                 
                    {
                        "mData": "date_posted",
                        "mRender": function (data, type, full, row) {
                            //if (full["payroll_month"] == "01") {
                            //    data = "January";
                            //}
                            //else if (full["payroll_month"] == "02") {
                            //    data = "February";
                            //}
                            //else if (full["payroll_month"] == "03") {
                            //    data = "March";
                            //}
                            //else if (full["payroll_month"] == "04") {
                            //    data = "April";
                            //}
                            //else if (full["payroll_month"] == "05") {
                            //    data = "May";
                            //}
                            //else if (full["payroll_month"] == "06") {
                            //    data = "June";
                            //}
                            //else if (full["payroll_month"] == "07") {
                            //    data = "July";
                            //}
                            //else if (full["payroll_month"] == "08") {
                            //    data = "August";
                            //}
                            //else if (full["payroll_month"] == "09") {
                            //    data = "September";
                            //}
                            //else if (full["payroll_month"] == "10") {
                            //    data = "October";
                            //}
                            //else if (full["payroll_month"] == "11") {
                            //    data = "November";
                            //}
                            //else if (full["payroll_month"] == "12") {
                            //    data = "December";
                            //}
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    
                    {
                        "mData": "payrolltemplate_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "remarks",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "gross_pay",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "net_pay",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                //'<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                           
                                //'<button type="button" class="btn btn-primary btn-sm" ng-click="btn_print_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print" ><i class="fa fa-print"></i></button>' +
                                //'<button type="button" class="btn btn-info btn-sm" ><i class="fa fa-eye" data-toggle="tooltip" data-placement="top" title="Show OR Breakdwon"></i></button>'  +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    function showdetailsInfo(table_id) {
        var info = $('#' + table_id).DataTable().page.info();
        $("div.toolbar").html("<b>Showing Page: " + (info.page + 1) + "</b> of <b>" + info.pages + " <i>pages</i></b>");
        $("div.toolbar").css("padding-top", "9px");
    }

    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data);
            prev_year++;
        }
    }
    s.search_in_list = function (value, table) {
        try {
            $("#" + table).DataTable().search(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }
    s.setNumOfRow = function (value, table) {
        try {
            $("#" + table).DataTable().page.len(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }
    ////***********************************************************//
    ////***Field validation for or nbr, amount ps and gs before saving to database
    ////***********************************************************// 
    function ValidateFields2() {
        var return_val = true;
        ValidationResultColor2("ALL", false);

        if ($('#txtb_remarks').val().trim() == "") {
            ValidationResultColor2("txtb_remarks", true);
            return_val = false;
        }
        
        return return_val;
    }

    //***********************************************************//
    //***Field validation 
    //***********************************************************// 
    function ValidationResultColor2(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");
        }
    }
    ////************************************//
    ////*** Validate amount_ps and amount_gs fields
    ////************************************// 
    s.validate = function () {
        var amount_ps = parseFloat($("#txtb_amount_ps").val());
        var amount_gs = parseFloat($("#txtb_amount_gs").val());
        var ps_decimal = amount_ps.toFixed(2);
        var gs_decimal = amount_gs.toFixed(2);
    }
    //************************************//
    //*** Add comma to amount
    //************************************// 
    function AddCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
    //************************************//
    //*** Open Add Modal        
    //************************************// 
    s.btn_open_modal = function () {
        try {
            if ($("#ddl_remit_type").val() != "") {
            
                s.isEdit = false;
                s.isDisAble = false;

                s.ModalTitle = "Add New Record";

                //btn = document.getElementById('add');
                //btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
                s.oTable.fnClearTable();
                if (s.datalistgrid.length != 0) {
                    s.oTable.fnAddData(s.datalistgrid);
                }
                setTimeout(function () {

                    $('#main_modal').modal("show");
                }, 300);
            }
        }
        catch (err) {
            alert(err.message)
        }
    }
    //******************************************//
    //*** Save to remittance certification table
    //*****************************************// 
    s.btn_save = function () {


        if (ValidateFields2()) {

            var data = {

                empl_id                         : s.datalistgrid[s.tmp_row_id].empl_id
                ,payroll_year                   : s.datalistgrid[s.tmp_row_id].payroll_year
                ,payroll_month                  : s.datalistgrid[s.tmp_row_id].payroll_month
                ,voucher_nbr                    : s.datalistgrid[s.tmp_row_id].voucher_nbr
                ,payroll_registry_nbr           : s.datalistgrid[s.tmp_row_id].payroll_registry_nbr
                ,addl_remarks                   : $("#txtb_remarks").val()
                ,user_id_created_by             :""
                ,created_dttm                   :""
            }

            h.post("../cEmployeeCardRemarksDetails/SaveRemarks",
            {
                data: data
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.datalistgrid[s.tmp_row_id].remarks = $("#txtb_remarks").val()
                    s.oTable.fnClearTable();

                    if (s.datalistgrid.length != 0)
                    {
                        s.oTable.fnAddData(s.datalistgrid);
                    }

                    swal("Successfully Added!", "Existing record has been updated successfully!", "success")
                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(s.datalistgrid[s.tmp_row_id].voucher_nbr) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    $('#main_modal').modal("hide");
                }
                else
                {
                    swal(d.data.message, { icon: "error", });
                }
           })
        }
    }

    function get_page(voucher_nbr) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 2) {
                    if ($(this).text() == voucher_nbr) {
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

    function get_page2(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 2) {
                    if ($(this).text() == empl_id) {
                        nakit_an = true;
                        return false;
                    }
                }
            });
            if (nakit_an) {
                $(this).addClass("selected");
                s.existed = "existed";
                return false;
            }
            rowx++;
        });
        return nakit_an;
    }

    s.btn_del_row = function (row_index) {
        var data = {
            empl_id: s.txtb_id_nbr
            , remittancetype_code: s.prevValues[0]
            , or_nbr: s.datalistgrid[row_index].or_nbr
        }
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cEmployeeCardRemarksDetails/DeleteRemitCert", {
                        data: data
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            swal(d.data.message, { icon: "danger", });
                        }
                    })
                }
            });
    }

    s.btn_edit_action = function (row_id) {
     
        s.txtb_or_date = ""
        s.isEdit = true;
        s.tmp_row_id = row_id
        s.ModalTitle = "Edit Existing Record";
        s.isDisAble = true
        $('#main_modal').modal("show");
        var remarks_value = s.datalistgrid[row_id].remarks.replace("Accounting Remarks by: " + userid + ": ", "")
        $("#txtb_remarks").val(remarks_value)
        $("#txtb_posted_date").val(s.datalistgrid[row_id].date_posted)
        $("#txtb_covered_date").val(s.datalistgrid[row_id].payroll_period_descr)
        $("#txtb_voucher_nbr").val(s.datalistgrid[row_id].voucher_nbr)
        $("#txtb_registry_nbr").val(s.datalistgrid[row_id].payroll_registry_nbr)
     
    }

    s.SaveEdit = function () {
        btn = document.getElementById('edit');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';

        var ps_amount = s.txtb_amount_ps.toString().replace(/,/g, "");
        var gs_amount = s.txtb_amount_gs.toString().replace(/,/g, "");
        ps_amount = parseFloat(ps_amount);
        gs_amount = parseFloat(gs_amount);

        var data = {
            empl_id: s.txtb_id_nbr
            , remittancetype_code: s.prevValues[0]
            , or_nbr: s.txtb_or_nbr
            , or_date: $("#txtb_or_date").val()
            , remittance_year: s.ddl_year
            , remittance_month: s.ddl_month
            , amount_ps: ps_amount
            , amount_gs: gs_amount
            , updated_by_user: userid
            , updated_by_dttm: new Date().toLocaleString()
        }

        h.post("../cEmployeeCardRemarksDetails/SaveEditRemitCert", { data: data }).then(function (d) {
            if (d.data.message == "success") {
                var row_edited = $('#edit').attr("ngx-data");
                //s.datalistgrid[row_edited].or_date = $("#txtb_or_date").val();

                s.datalistgrid[row_edited].remittance_month = s.ddl_month;
                s.datalistgrid[row_edited].remittance_year = s.ddl_year;
                s.datalistgrid[row_edited].or_nbr = s.txtb_or_nbr;
                s.datalistgrid[row_edited].or_date = $("#txtb_or_date").val();
                s.datalistgrid[row_edited].amount_ps = ps_amount;
                s.datalistgrid[row_edited].amount_gs = gs_amount

                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid);


                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                    if (get_page(s.txtb_or_nbr) == false) {
                        s.oTable.fnPageChange(x);
                    }
                    else {
                        break;
                    }
                }
                $('#main_modal').modal("hide");
                swal("Your record successfully updated!", { icon: "success", });
                btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
            }
            else {
                swal(d.data.message, { icon: "error", });
            }
        });
    }

    s.btn_print_open = function (row_id) {
        s.printShow = true;
        s.ModalTitle = "Print Record";

        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })

        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = "~/Reports/cryEmployeeCard/cryEmployeeCard.rpt"
        var sp = "sp_employeecard_re_ce_rep"
        var parameters = "par_payroll_year," + $("#ddl_year").val() + ",par_empl_id," + s.txtb_empl_id + ",par_period_from," + "" + ",par_period_to," + ""


        s.Modal_title = "PRINT PREVIEW"

        h.post("../cEmployeeCardRemarksDetails/ReportCount",
            {
                par_payroll_year: $("#ddl_year").val(),
                par_empl_id: s.txtb_empl_id,
                par_period_from: "",
                par_period_to: "",
                par_department: "",
                par_employment_type: ""
            }).then(function (d) {

                if (d.data.reportcount.length > 0) {
                  

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp + "," + parameters

                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#modal_generating_remittance").modal("hide")

                        };
                    }
                    else if (iframe_page.innerHTML()) {
                        // get and check the Title (and H tags if you want)
                        var ifTitle = iframe_page.contentDocument.title;
                        if (ifTitle.indexOf("404") >= 0) {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";

                            s.loading_r = false;
                            $('#print_preview_modal').modal("hide");
                        }
                        else if (ifTitle != "") {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";

                            s.loading_r = false;
                            $('#print_preview_modal').modal("hide");
                        }
                    }
                    else {
                        iframe.onreadystatechange = function () {
                            if (iframe.readyState == "complete") {
                                iframe.style.visibility = "visible";
                                $("#modal_generating_remittance").modal("hide")

                            }
                        };
                    }

                    s.loading_r = false;

                    iframe.src = s.embed_link;
                    $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
                    $('#print_extract_modal').modal("hide");



                }

                else {
                    swal({
                        title: "Not Data Found!",
                        text: "No Data for Printing!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                    $("#modal_generating_remittance").modal("hide")
                }
            });
        
    }

    s.btn_print_click = function () {

        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })

        //btn = document.getElementById('printFinal');
        //btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Print';

        var remittance = s.prevValues[0];
        var empl_id = s.txtb_id_nbr;
        var period_from = $("#txtb_period_from").val()
        var period_to = $("#txtb_period_to").val()


        var controller = "Reports"
        var action = "Index"
        var ReportName = "cryRemittanceCERT"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = ""
        var sp = ""

        ReportPath = "~/Reports/cryRemittanceCERT/cryRemittanceCERT.rpt"
        sp = "sp_remittance_cert_rep,p_remittancetype_code," + remittance + ",p_empl_id," + empl_id + ",p_period_from," + period_from + ",p_period_to," + period_to;
        s.Modal_title = "PRINT PREVIEW";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp //+ parameters


        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#modal_generating_remittance").modal("hide")

            };
        }
        else if (iframe_page.innerHTML()) {
            // get and check the Title (and H tags if you want)
            var ifTitle = iframe_page.contentDocument.title;
            if (ifTitle.indexOf("404") >= 0) {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";

                s.loading_r = false;
                $('#print_preview_modal').modal("hide");
            }
            else if (ifTitle != "") {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";

                s.loading_r = false;
                $('#print_preview_modal').modal("hide");
            }
        }
        else {
            iframe.onreadystatechange = function () {
                if (iframe.readyState == "complete") {
                    iframe.style.visibility = "visible";
                    $("#modal_generating_remittance").modal("hide")

                }
            };
        }

        s.loading_r = false;

        iframe.src = s.embed_link;
        $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
        $('#print_extract_modal').modal("hide");
        //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //    + "&SaveName=" + SaveName
        //    + "&ReportType=" + ReportType
        //    + "&ReportPath=" + ReportPath
        //    + "&Sp=" + sp

        //$('#print_extract_modal').modal("hide");
        //btn.innerHTML = '<i class="fa fa-print"> </i> Print';
    }

    s.btn_extract_open = function () {
        s.printShow = false;
        s.ModalTitle = "Extract Data From Remittance";
        $('#print_extract_modal').modal("show");
    }

   

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    

    s.FilterGrid = function () {
        $("#modal_generating_remittance").modal();
        h.post("../cEmployeeCardRemarksDetails/FilterGrid",
            {
                p_year: $("#ddl_year").val(),
                p_empl_id: s.txtb_empl_id
            }).then(function (d)
            {
                s.oTable.fnClearTable();

                if (d.data.empl_data.length != 0)
                {
                    s.datalistgrid = d.data.empl_data
                    s.oTable.fnAddData(s.datalistgrid);
                }

                $("#modal_generating_remittance").modal("hide")
            })
    }

    s.FilterGridMonth = function (value, table) {

        if (value.trim() != "00") {
            $("#" + table).DataTable().column(2).search(value).draw();
            $("#datalist_grid").DataTable().column(2).search(value).draw();
        }
        else {
            $("#" + table).DataTable().column(2).search("").draw();
            $("#datalist_grid").DataTable().column(2).search("").draw();
          
        }
       
    }

})

