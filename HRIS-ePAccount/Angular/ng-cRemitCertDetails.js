ng_HRD_App.controller("cRemitCertDetails_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid      = "";
    s.rowLen        = "5";
    s.tempName      = "";
    s.temprTypeCd   = "";
    s.existed       = "";
    s.year          = [];
    s.prevValues    = [];

    function init() {
        $("#modal_generating_remittance").modal();
        RetrieveYear();
        s.ddl_year              = new Date().getFullYear().toString();
        s.currentMonth          = new Date().getMonth() + 1;
        s.ddl_month             = s.currentMonth.toString();

        s.defaultYear           = new Date().getFullYear().toString();
        s.defaultMonth          = new Date().getMonth() + 1;
        s.defaultDate           = new Date().getDate().toString();
        s.defaultDatePickerVal  = s.defaultYear + '-' + s.defaultMonth.toString() + '-' + s.defaultDate;
        s.lastday               = s.defaultYear + '-' + s.defaultMonth.toString() + '-' + new Date(s.defaultYear, s.defaultMonth, 0).getDate();

        s.txtb_or_date          = s.defaultDatePickerVal
        s.txtb_period_from      = s.defaultDatePickerVal
        s.txtb_period_to        = s.lastday
        s.isEdit                = false
        s.isDisAble             = false


        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cRemitCertDetails/initializeData",
            {
                
            }).then(function (d) {
                
                s.prevValues            = d.data.prevValues;
                s.txtb_remittance_type  = d.data.prevValues[7];
                s.txtb_empl_type        = d.data.prevValues[8];
                s.txtb_dept             = d.data.prevValues[9];
                s.txtb_empl_name        = d.data.prevValues[4] + "," + d.data.prevValues[5];
                s.txtb_id_nbr           = d.data.prevValues[3];
                if (d.data.empl_data.length > 0) {
                    init_table_data(d.data.empl_data);
                }
                else {
                    init_table_data([]);
                }
                userid = d.data.userid;
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
                columns: [
                    {
                        "mData": "remittance_month",
                        "mRender": function (data, type, full, row)
                        {
                            if (full["remittance_month"] == "01") {
                                data = "January";
                            }
                            else if (full["remittance_month"] == "02") {
                                data = "February";
                            }
                            else if (full["remittance_month"] == "03") {
                                data = "March";
                            }
                            else if (full["remittance_month"] == "04") {
                                data = "April";
                            }
                            else if (full["remittance_month"] == "05") {
                                data = "May";
                            }
                            else if (full["remittance_month"] == "06") {
                                data = "June";
                            }
                            else if (full["remittance_month"] == "07") {
                                data = "July";
                            }
                            else if (full["remittance_month"] == "08") {
                                data = "August";
                            }
                            else if (full["remittance_month"] == "09") {
                                data = "September";
                            }
                            else if (full["remittance_month"] == "10") {
                                data = "October";
                            }
                            else if (full["remittance_month"] == "11") {
                                data = "November";
                            }
                            else if (full["remittance_month"] == "12") {
                                data = "December";
                            }
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "remittance_year",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "or_nbr",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "or_date",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "amount_ps",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>{{" + data + " | number:2}}</span>" }
                    },
                    {
                        "mData": "amount_gs",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>{{" + data + " | number:2}}</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                //'<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
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

        if ($('#txtb_or_nbr').val() == "") {
            ValidationResultColor2("txtb_or_nbr", true);
            return_val = false;
        }

        if ($('#txtb_amount_ps').val() == "") {
            ValidationResultColor2("txtb_amount_ps", true);
            return_val = false;
        }

        if ($('#txtb_amount_gs').val() == "") {
            ValidationResultColor2("txtb_amount_gs", true);
            return_val = false;
        }

        if ($('#ddl_empl_name').val() == "") {
            ValidationResultColor2("ddl_empl_name", true);
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

            $("#txtb_or_nbr").removeClass("required");
            $("#lbl_txtb_or_nbr_req").text("");

            $("#txtb_amount_ps").removeClass("required");
            $("#lbl_txtb_amount_ps_req").text("");

            $("#txtb_amount_gs").removeClass("required");
            $("#lbl_txtb_amount_gs_req").text("");

            $("#ddl_empl_name").removeClass("required");
            $("#lbl_ddl_empl_name_req").text("");
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
                clearentry();
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
            h.post("../cRemitCertDetails/GetEmplData", {
                p_remitType_code    : s.prevValues[0],
                p_empl_id           : s.txtb_id_nbr
            }).then(function (d) {
                if (d.data.message == "success")
                {
                   
                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page2(s.txtb_or_nbr) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    if (s.existed == "existed") {
                        swal("OR Nbr for " + s.txtb_empl_name + " already exist!", { icon: "warning", });
                        $('#main_modal').modal("hide");
                        s.existed = "";
                    }
                    else {
                        //swal("Not Existed", { icon: "warning", });
                        btn = document.getElementById('addFinal');
                        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';

                        var ps_amount = s.txtb_amount_ps.replace(/,/g, "");
                        var gs_amount = s.txtb_amount_gs.replace(/,/g, "");
                        var data = {
                            empl_id                 : s.txtb_id_nbr
                            , remittancetype_code   : s.prevValues[0]
                            , or_nbr                : s.txtb_or_nbr
                            , or_date               : $("#txtb_or_date").val()
                            , remittance_year       : s.ddl_year
                            , remittance_month      : s.ddl_month
                            , amount_ps             : ps_amount
                            , amount_gs             : gs_amount
                            , cert_status           : "U"
                            , created_by_user       : userid
                            , created_by_dttm       : new Date().toLocaleString()
                        }
                        h.post("../cRemitCertDetails/SaveRemitCert", { data: data }).then(function (d) {
                            if (d.data.message == "success") {
                                s.datalistgrid.push(data)
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
                                swal("Your record has been saved!", { icon: "success", });
                                btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                            }
                            else {
                               
                            }
                        })
                    }
                }
                else {
                   
                }
            })
        }
    }

    function get_page(empl_id) {
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
            empl_id                 : s.txtb_id_nbr
            , remittancetype_code   : s.prevValues[0]
            , or_nbr                : s.datalistgrid[row_index].or_nbr
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
                    h.post("../cRemitCertDetails/DeleteRemitCert", {
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
        clearentry();
        s.txtb_or_date  = ""
        s.isEdit        = true;
        s.ModalTitle    = "Edit Existing Record";
        s.isDisAble     = true
        $('#main_modal').modal("show");

        //var amount_ps = parseFloat(d.data.empl_data[0].amount_ps);
        //var amount_gs = parseFloat(d.data.empl_data[0].amount_gs);
        //var ps_decimal = AddCommas(amount_ps.toFixed(2));
        //var gs_decimal = AddCommas(amount_gs.toFixed(2));

        //s.withComma = AddCommas(s.txtb_payroll_amount)

        s.txtb_or_nbr       = s.datalistgrid[row_id].or_nbr;
        s.txtb_or_date      = s.datalistgrid[row_id].or_date;
        s.ddl_year          = s.datalistgrid[row_id].remittance_year;
        s.ddl_month         = s.datalistgrid[row_id].remittance_month;
        s.txtb_amount_ps    = s.datalistgrid[row_id].amount_ps;
        s.txtb_amount_gs    = s.datalistgrid[row_id].amount_gs;
        
        $('#edit').attr('ngx-data', row_id);
        var row_edited = $('#edit').attr("ngx-data");
        s.datalistgrid[row_edited].remittance_month     = s.ddl_month;
        s.datalistgrid[row_edited].remittance_year      = s.ddl_year;
        s.datalistgrid[row_edited].or_nbr               = s.txtb_or_nbr;
        s.datalistgrid[row_edited].or_date              = $("#txtb_or_date").val();
        s.datalistgrid[row_edited].amount_ps            = s.txtb_amount_ps;
        s.datalistgrid[row_edited].amount_gs            = s.txtb_amount_gs;
    }

    s.SaveEdit = function () {
        btn = document.getElementById('edit');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';

        var ps_amount = s.txtb_amount_ps.toString().replace(/,/g, "");
        var gs_amount = s.txtb_amount_gs.toString().replace(/,/g, "");
        ps_amount = parseFloat(ps_amount);
        gs_amount = parseFloat(gs_amount);

        var data = {
            empl_id                 : s.txtb_id_nbr
            , remittancetype_code   : s.prevValues[0]
            , or_nbr                : s.txtb_or_nbr
            , or_date               : $("#txtb_or_date").val()
            , remittance_year       : s.ddl_year
            , remittance_month      : s.ddl_month
            , amount_ps             : ps_amount
            , amount_gs             : gs_amount
            , updated_by_user       : userid
            , updated_by_dttm       : new Date().toLocaleString()
        }
       
        h.post("../cRemitCertDetails/SaveEditRemitCert", { data: data }).then(function (d) {
            if (d.data.message == "success") {
                var row_edited = $('#edit').attr("ngx-data");
                //s.datalistgrid[row_edited].or_date = $("#txtb_or_date").val();

                s.datalistgrid[row_edited].remittance_month     = s.ddl_month;
                s.datalistgrid[row_edited].remittance_year      = s.ddl_year;
                s.datalistgrid[row_edited].or_nbr               = s.txtb_or_nbr;
                s.datalistgrid[row_edited].or_date              = $("#txtb_or_date").val();
                s.datalistgrid[row_edited].amount_ps            = ps_amount;
                s.datalistgrid[row_edited].amount_gs            = gs_amount
                
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

        $('#print_extract_modal').modal("show");
        h.post("../cRemitCertDetails/PrintBack").then(function (d) {
            
        });
    }

    s.btn_print_click = function () {

        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })

        //btn = document.getElementById('printFinal');
        //btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Print';
       
        var remittance      = s.prevValues[0];
        var empl_id         = s.txtb_id_nbr;
        var period_from     = $("#txtb_period_from").val()
        var period_to       = $("#txtb_period_to").val()
        

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

    s.btn_extract_click = function () {
        //var period_from = new Date($("#txtb_period_from").val()).format('yyyy-MM-dd');
        //var period_to = new Date($("#txtb_period_to").val()).format('yyyy-MM-dd');
        var data = {
            p_remitType_code    : s.prevValues[0],
            p_empl_id           : s.txtb_id_nbr,
            p_date_from         : $("#txtb_period_from").val(),
            p_date_to           : $("#txtb_period_to").val(),
            p_userid            : userid
        }
       
        btn = document.getElementById('extractFinal');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Extract';

        h.post("../cRemitCertDetails/ExtractData", {
            p_remitType_code    : s.prevValues[0],
            p_empl_id           : s.txtb_id_nbr,
            p_date_from         : $("#txtb_period_from").val(),
            p_date_to           : $("#txtb_period_to").val(),
            p_userid            : userid
        }).then(function (d) {
            if (d.data.message == "success") {
                
                if (d.data.extracted[0].result_value == "Y") {
                    swal(d.data.extracted[0].result_msg, { icon: "success", });
                    h.post("../cRemitCertDetails/GetEmplData", {
                        p_remitType_code    : s.prevValues[0],
                        p_empl_id           : s.txtb_id_nbr
                    }).then(function (d) {
                        if (d.data.message == "success") {
                           
                            s.oTable.fnClearTable();
                            s.datalistgrid = d.data.empl_data
                            if (d.data.empl_data.length > 0) {
                                s.oTable.fnAddData(d.data.empl_data);
                            }
                        }
                    })
                }
                else {
                    swal(d.data.extracted[0].result_msg, { icon: "error", });
                }
                $('#print_extract_modal').modal("hide");
                btn.innerHTML = '<i class="fa fa-download"> </i> Extract';
            }
            else {
                swal(d.data.message, { icon: "error", });
            }
        });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentry() {
        s.txtb_or_nbr    = ""
        s.txtb_amount_ps = ""
        s.txtb_amount_gs = ""

        $("#lbl_txtb_or_nbr_req").text("");
        $("#lbl_txtb_amount_ps_req").text("");
        $("#lbl_txtb_amount_gs_req").text("");
        $("#lbl_ddl_empl_name_req").text("");
    }

})

