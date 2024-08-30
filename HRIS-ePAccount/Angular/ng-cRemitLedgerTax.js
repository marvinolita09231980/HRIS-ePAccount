/*
 * Script created By:       Joseph M.Tombo Jr.
 * Script created On:       10/21/2019
 * Purpose of this Script:  This is the main angular script for cRemittance SSS details/info
 *                          to bind our data from backend to object in the front end design
*/
ng_HRD_App.controller("cRemitLedgerTax_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.rowLen = "10"
    s.datalistgrid = null;
    s.voucher_list = null;
    s.employee_list = null;
    s.department_list = null;
    s.ddl_voucher = "";
    s.ddl_employee = "";
    s.voucher_index = "";
    s.ADDEDITMODE = "";
    s.added_id = "";
    s.added_index = "";
    s.ddl_departments = "";
    s.ddl_lastname_letter = "";
    s.ddl_batch_nbr = "0";
    s.show_extract = false;
    s.show_view_report = false;
    s.show_rec_report = false;
    //Initialize Request to backend to get the data for employment type and remittance type
    function init() {
        //Initialize and request backend data...

        $('#loading_msg').html("Initializing data");
        $("#modal_generating_remittance").modal();


        h.post("../cRemitLedgerTax/InitializeData",
            {
                p_department_code: s.ddl_departments,
                p_starts_letter: s.ddl_lastname_letter,
                p_batch_nbr: s.ddl_batch_nbr
            }).then(function (d) {
             
                s.txtb_remittance_year = d.data.prevValues[0];
                s.txtb_remittance_month = d.data.prevValues[2];
                s.txtb_employment_type = d.data.prevValues[4];
                s.txtb_employment_type_code = d.data.prevValues[3];
                s.txtb_remittance_ctrl_nbr = d.data.prevValues[7];
                s.txtb_remittance_status = d.data.prevValues[9]; //set sa ug blank kay wala pa na apil
                s.tax_label = ""

                s.txtb_remit_year_print = d.data.prevValues[0];
                s.txtb_remit_month_print = d.data.prevValues[2];

                s.department_data = d.data.department_list

                if (s.txtb_employment_type_code == "JO") {
                    s.tax_label         = "TOTAL TAX"
                    s.show_extract      = true;
                    s.show_view_report  = false;
                    s.show_rec_report   = false;
                }

                else {
                    s.tax_label         = "BASIC TAX"
                    s.show_extract      = false;
                    s.show_view_report  = true;
                    s.show_rec_report   = true;
                }
                getLetterList();
                switch (d.data.prevValues[8].toString().trim()) {
                    case "N":
                        $('#txtb_remittance_status').switchClass('text-danger', 'text-warning');
                        break;
                    case "P":
                        $('#txtb_remittance_status').switchClass('text-warning', 'text-danger');
                        break;
                    case "R":
                        $('#txtb_remittance_status').switchClass('text-danger', 'text-success');
                        break;
                }
                s.department_list = d.data.department_list
                if (d.data.listgrid.length > 0) {
                    init_table_data(d.data.listgrid);
                }
                else {
                    init_table_data([]);
                }

                

                showdetailsInfo("datalist_grid");

            });
    }

    init()

    var getLetterList = function () {
        h.post("../cRemitLedgerTax/LetterList",
            {
                p_remit_nbr: s.txtb_remittance_ctrl_nbr
            }).then(function (d) {
                s.letters = d.data.letter_list
            });
    }

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                "order": [[2, "asc"]],
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<center><span class='details-control' style='display:block;' ng-click='btn_show_details(" + '"details_info"' + ")' ></center>"
                        }
                    },

                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "voucher_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "employee_name" },
                    { "mData": "payroll_year", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "payroll_month", "mRender": function (data, type, full, row) {
                            var dateM = new Date(data + "/1/2019");
                            return "<span class='text-center btn-block'>" + dateM.toLocaleString('en-us', { month: 'long' }) + "</span>"
                        }
                    },
                    {
                        
                        "mData": "wtax", "mRender": function (data, type, full, row) {
                            return "<span class='text-right btn-block'>{{" + data + " | number:2}}</span>"
                        }
                    },

                    {
                        
                        "mData": "wtax_ovtm", "mRender": function (data, type, full, row) {
                            return "<span class='text-right btn-block'>{{" + data + " | number:2}}</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var editable = false;
                            var deletable = false;
                            if (full["remittance_status_dtl"] == "R") {
                                //editable = true;
                                deletable = true;
                            }

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm" ng-disabled="' + editable + '" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Details">  <i class="fa fa-eye"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-disabled="' + deletable + '" ng-click="btn_delete_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                               
                                '</div></center>';
                        }
                    },
                    {
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data.substring(0, 1) + "</span>"
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
        $("#modal_generating_remittance").modal('hide');
    }

    function showdetailsInfo(table_id) {
        //var info = $('#' + table_id).DataTable().page.info();
        ////$("div.toolbar").html("<b>Showing Page: " + (info.page + 1) + "</b> of <b>" + info.pages + " <i>pages</i></b>");
        //$("div.toolbar").css("padding-top", "9px");
    }


    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..

            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#ddl_remittance_month").removeClass("required");
            $("#lbl_ddl_remittance_month_req").text("");

            $("#ddl_remittance_year").removeClass("required");
            $("#lbl_ddl_remittance_year_req").text("");

            $("#ddl_employment_type").removeClass("required");
            $("#lbl_ddl_employment_type_req").text("");

            $("#ddl_remittance_type").removeClass("required");
            $("#lbl_ddl_remittance_type_req").text("");
        }
    }

    //Basic DataTable functions
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
        showdetailsInfo(table);
    }

    s.lbl_payroll_month = "Payroll Month"
    s.search_in_list_month = function (value, table) {
        s.lbl_payroll_month = value
        if (value == "") {
            s.lbl_payroll_month = "Payroll Month"
        }
        $("#" + table).DataTable().column(5).search(value).draw();
        $("#rejected_grid").DataTable().column(5).search(value).draw();
    }

    s.search_in_list_letter = function (value, table) {

        $("#" + table).DataTable().column(9).search(value).draw();
        $("#rejected_grid").DataTable().column(9).search(value).draw();


    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(value).draw();
        showdetailsInfo(table);
    }
    function show_date() {
        $('.datepicker').datepicker({ format: 'yyyy-mm-dd' });
    }

    //***********************************************************//
    //***Occure when add button is clicked and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function () {
        s.show_in_add = true;
        s.show_in_edit = false;
        s.showNR = true;
        s.showR = false;
        //$("#modal_generating_remittance").modal();
        //$('#loading_msg').html("Initialize Modal");
        ClearEntry();
        s.ModalTitle = "Add SSS Remittance Data";
        ValidationResultColor("ALL", false);
        s.ADDEDITMODE = "ADD";
        h.post("../cRemitLedgerTax/GetVoucher",
            {
                p_batch_nbr: s.ddl_batch_nbr
            }
        ).then(function (d) {
            s.voucher_list = d.data.voucher_list
            //$("#modal_generating_remittance").modal('toggle');
            $('#main_modal').modal({ keyboard: false, backdrop: "static" });
            s.ddl_remittance_status = "N"
        });

    }

    //***********************************************************//
    //***Edit Action Occurred function click
    //***********************************************************// 
    s.btn_edit_action = function (par_row_index) {
        ClearEntry();
        ValidationResultColor("ALL", false);
        var getIndividualData = [];
        s.show_in_add = false;
        s.show_in_edit = true;
        s.ADDEDITMODE = "EDIT";
        s.ModalTitle = "View Tax Remittance Data";

        if (s.txtb_employment_type_code == "JO") {
            s.amount_decimal         = "0.00";
            s.txtb_wtax_amount = "0.00";
            s.amount_decimal2 = "0.00";
            s.txtb_wtax_ovtm_amount = "0.00";
        }

        else {
            s.amount_decimal = parseFloat(s.datalistgrid[par_row_index].wtax).toFixed(2);
            s.txtb_wtax_amount = s.amount_decimal;
            s.amount_decimal2 = parseFloat(s.datalistgrid[par_row_index].wtax_ovtm).toFixed(2);
            s.txtb_wtax_ovtm_amount = s.amount_decimal2;
        }

        $('#txtb_payroll_descr').val(s.datalistgrid[par_row_index].voucher_nbr + " - " + s.datalistgrid[par_row_index].payroll_registry_descr);
        s.txtb_registry_nbr = s.datalistgrid[par_row_index].payroll_registry_nbr;
        s.txtb_sss_number = s.datalistgrid[par_row_index].sss_nbr;


        s.txtb_wtax2_amount = currency(s.datalistgrid[par_row_index].wtax_2perc);
        s.txtb_wtax3_amount = currency(s.datalistgrid[par_row_index].wtax_3perc);
        s.txtb_wtax5_amount = currency(s.datalistgrid[par_row_index].wtax_5perc);
        s.txtb_wtax8_amount = currency(s.datalistgrid[par_row_index].wtax_8perc);
        s.txtb_wtax10_amount = currency(s.datalistgrid[par_row_index].wtax_10perc);
        s.txtb_wtax15_amount = currency(s.datalistgrid[par_row_index].wtax_15perc);

        s.txtb_empl_id = s.datalistgrid[par_row_index].empl_id;
        s.txtb_employee_name = s.datalistgrid[par_row_index].employee_name;
        $('#ddl_remittance_status').val(s.datalistgrid[par_row_index].remittance_status_dtl);
        $('#txtb_payroll_descr').attr("ngx-data", s.datalistgrid[par_row_index].voucher_nbr);
        s.txtb_payroll_year = s.datalistgrid[par_row_index].payroll_year;
        var dateM = new Date(s.datalistgrid[par_row_index].payroll_month + "/1/2019");
        s.txtb_payroll_month = dateM.toLocaleString('en-us', { month: 'long' });

        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }

    s.btn_delete_row = function (row_index) {
        var dt = null;
        dt = s.datalistgrid[row_index]
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cRemitLedgerTax/DeleteTAXDetails", {
                         data: dt
                        ,par_payroll_month: s.datalistgrid[row_index].payroll_month
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            getLetterList();
                            showdetailsInfo("datalist_grid");
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            alert(d.data.message)
                        }
                    })
                }
            });
    }

    s.ddl_department_selected_change = function (par_value) {
        $("#modal_generating_remittance").modal();
        if ((s.ddl_lastname_letter != "" || s.ddl_departments != "") && s.ddl_batch_nbr != "") {
            h.post("../cRemitLedgerTax/RetrieveListGrid",
                {
                    p_department_code: s.ddl_departments,
                    p_starts_letter: s.ddl_lastname_letter,
                    p_batch_nbr: s.ddl_batch_nbr
                }).then(function (d) {

                    if (d.data.listgrid.length > 0) {
                        s.datalistgrid = d.data.listgrid
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        showdetailsInfo("datalist_grid");
                    }
                    else {
                        s.oTable.fnClearTable();
                    }
                    $("#modal_generating_remittance").modal("hide");
                });
        }
        else {
            h.post("../cRemitLedgerTax/RetrieveListGrid",
                {
                    p_department_code: "",
                    p_starts_letter: "",
                    p_batch_nbr: s.ddl_batch_nbr
                }).then(function (d) {

                    if (d.data.listgrid.length > 0) {
                        s.datalistgrid = d.data.listgrid
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        showdetailsInfo("datalist_grid");
                    }
                    else {
                        s.oTable.fnClearTable();
                    }
                    $("#modal_generating_remittance").modal("hide");
                });
            //s.oTable.fnClearTable();
            //$("#modal_generating_remittance").modal("hide");
        }

    }

    //***********************************************************//
    //***Occure when voucher value change
    //***********************************************************// 
    s.set_voucher_index = function (par_voucher_index) {
        if (par_voucher_index != "") {
            s.txtb_voucher_nbr = s.voucher_list[par_voucher_index].voucher_nbr;
            s.txtb_registry_nbr = s.voucher_list[par_voucher_index].payroll_registry_nbr;
            s.txtb_payroll_year = s.voucher_list[par_voucher_index].payroll_year;
            var dateM = new Date([parseInt(s.voucher_list[par_voucher_index].payroll_month)] + "/01/2019");
            s.txtb_payroll_month = dateM.toLocaleString('en-us', { month: 'long' });

            //Request employee in backend
            h.post("../cRemitLedgerTax/RetrieveEmployees", {
                par_payrollregistry_nbr: s.txtb_registry_nbr,
                p_batch_nbr: s.ddl_batch_nbr
            }).then(function (d) {
                s.ddl_employee = "";
                s.employee_list = null;
                s.txtb_empl_id = "";
                s.txtb_sss_number = "";
                s.txtb_sss_amount = "";
                s.employee_list = d.data.employee_names
            });
        }
        else {
            s.ddl_employee = "";
            s.employee_list = null;
            s.txtb_voucher_nbr = "";
            s.txtb_registry_nbr = "";
            s.txtb_empl_id = "";
            s.txtb_sss_number = "";
            s.txtb_sss_amount = "";
            s.txtb_payroll_year = "";
            s.txtb_payroll_month = "";
        }
    }

    //***********************************************************//
    //***Occure when save button is clicked and save data to remittance_dtl_sss_tbl
    //***********************************************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            var data =
            {
                remittance_ctrl_nbr: s.txtb_remittance_ctrl_nbr
                , empl_id: s.txtb_empl_id
                , voucher_nbr: (s.ADDEDITMODE == "ADD" ? s.voucher_list[s.ddl_voucher].voucher_nbr : $('#txtb_payroll_descr').attr("ngx-data"))
                , payroll_amount: s.txtb_sss_amount
                , remittance_ctrl_ref: ""
                , remittance_status: $("#ddl_remittance_status option:selected").val()
            };

            //Request save in backend
            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cRemitLedgerTax/SaveADDSSSInDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        data.employee_name = $("#ddl_employee option:selected").html();
                        data.sss_nbr = s.txtb_sss_number;
                        data.employment_type = $("#txtb_employment_type").attr("ngx-data");
                        data.payroll_year = s.txtb_payroll_year;
                        data.payroll_registry_nbr = s.txtb_registry_nbr;
                        data.voucher_registry_descr = $("#ddl_voucher option:selected").html();
                        data.payroll_registry_descr = $("#ddl_voucher option:selected").attr("ngx-data");
                        var dateM = new Date(s.voucher_list[s.ddl_voucher].payroll_month + "/1/2019");
                        data.payroll_month = [dateM.getMonth() + 1];

                        data.remittance_status_dtl = $("#ddl_remittance_status option:selected").val();

                        s.datalistgrid.push(data)
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_empl_id) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", { icon: "success", });

                        $('#hdmf_modal').modal("hide")
                        showdetailsInfo("datalist_grid");
                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cRemitLedgerTax/SaveEDITSSSInDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        //data.employee_name  = $("#ddl_employee option:selected").html();
                        //data.sss_nbr        = s.txtb_sss_number;
                        //data.payroll_year   = s.txtb_payroll_year;
                        //var dateM           = new Date(s.voucher_list[s.ddl_voucher].payroll_month + "/1/2019");
                        //data.payroll_month  = [dateM.getMonth() + 1];
                        //s.datalistgrid.push(data)
                        var edit_row_index =
                            $('#datalist_grid').DataTable().rows(function (idx, data, node) {
                                if (data.empl_id == s.txtb_empl_id) {
                                    edit_row_index = idx;
                                    return true;
                                }
                                else return false;
                            }).indexes()[0];
                        s.datalistgrid[edit_row_index].sss_nbr = s.txtb_sss_number;
                        s.datalistgrid[edit_row_index].payroll_amount = s.txtb_sss_amount;
                        s.datalistgrid[edit_row_index].remittance_status_dtl = $("#ddl_remittance_status option:selected").val();

                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_empl_id) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been edited!", { icon: "success", });

                        $('#hdmf_modal').modal("hide")
                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }
                });
                $('#i_save').addClass('fa-save');
                $('#i_save').removeClass('fa-spinner fa-spin');
            }
        }

    }

    //SELECT THE CURRENT ADDED/EDITED ROW OF THE DATALISTGRID
    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
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

    //***********************************************************//
    //***Occure when ddl employee name change, assign the values
    //***the value that are needed
    //***********************************************************// 
    s.ddl_employeename_change = function (par_index) {
        if (par_index != "") {
            s.txtb_empl_id = s.employee_list[par_index].empl_id;
            s.txtb_sss_number = s.employee_list[par_index].sss_nbr;
            s.txtb_sss_amount = s.employee_list[par_index].sss_ps.toFixed(2);
        }
        else {
            s.txtb_empl_id = "";
            s.txtb_sss_number = "";
            s.txtb_sss_amount = "";
        }

    }

    //Clear Entry Object in add/Edit Modal
    function ClearEntry() {
        s.voucher_list = null;
        s.ddl_voucher = "";
        s.ddl_employee = "";
        s.employee_list = null;

        s.txtb_voucher_nbr = "";
        s.txtb_registry_nbr = "";
        s.txtb_empl_id = "";
        s.txtb_sss_number = "";
        s.txtb_sss_amount = "";
        s.txtb_payroll_month = "";
        s.txtb_payroll_year = "";
        s.txtb_sss_amount = "";
        $('#txtb_payroll_descr').val("");

    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if (s.ddl_voucher == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_voucher", true);
            return_val = false;
        }

        //if (s.txtb_voucher_nbr == "") {
        //    ValidationResultColor("txtb_voucher_nbr", true);
        //    return_val = false;
        //}

        if ($('#ddl_employee option:selected').val() == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_employee", true);
            return_val = false;
        }

        if (s.txtb_empl_id == "") {
            ValidationResultColor("txtb_empl_id", true);
            return_val = false;
        }

        if (s.txtb_sss_amount == "") {
            ValidationResultColor("txtb_sss_amount", true);
            return_val = false;
        }

        if (s.ddl_remittance_status == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_remittance_status", true);
            return_val = false;
        }
        return return_val;
    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#txtb_voucher_nbr").removeClass("required");
            $("#lbl_txtb_voucher_nbr_req").text("");

            $("#ddl_voucher").removeClass("required");
            $("#lbl_ddl_voucher_req").text("");

            $("#ddl_employee").removeClass("required");
            $("#lbl_ddl_employee_req").text("");

            $("#txtb_empl_id").removeClass("required");
            $("#lbl_txtb_empl_id_req").text("");

            $("#txtb_sss_amount").removeClass("required");
            $("#lbl_txtb_sss_amount_req").text("");

            $("#ddl_remittance_status").removeClass("required");
            $("#lbl_ddl_remittance_status_req").text("");
        }
    }

    //***********************************************************//
    //***FUNCTION FOR PRINTING TEST FUCNTION***//
    //***********************************************************// 
    s.btn_print_click = function () {
        $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        var par_row_id = $('#btn_print_rs5').attr("ngx-data");
        var p_employment_type = s.datalistgrid[par_row_id].employment_type;
        var p_remittance_year = s.datalistgrid[par_row_id].payroll_year;
        var p_quarter_rep = getQuarterByMonth(s.datalistgrid[par_row_id].payroll_month);
        var p_empl_id = s.datalistgrid[par_row_id].empl_id;
        var p_batch_nbr = s.ddl_batch_nbr;

        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryRemittanceSSSRs5";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryRemittanceSSS/cryRemittanceSSSRs5.rpt"
        var sp = "sp_remittance_SSS_qtrly_rep,p_employment_type," + p_employment_type + ",p_remittance_year," + p_remittance_year + ",p_quarter_rep," + p_quarter_rep + ",p_empl_id," + p_empl_id + ",p_batch_nbr," + p_batch_nbr

        setTimeout(function () {
            $('#modal_generating_report').modal("hide");
        }, 1200);
        location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&Sp=" + sp
    }

    //***********************************************************//
    //***FUNCTION FOR INDIVIDUAL PRINTING ex.(RS5 FORM FOR SSS)***//
    //***********************************************************// 
    s.btn_individual_print = function (row_id) {
        h.post("../cRemitLedgerTax/PrintBack").then(function (d) {

        });
        $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        DisplayQuarterByMonth(s.datalistgrid[row_id].payroll_month);

        $('#txtb_rpt_employee_name').val(s.datalistgrid[row_id].employee_name);
        $('#btn_print_rs5').attr("ngx-data", row_id);

        //$('#modal_generating_report').modal({ keyboard: false, backdrop: "static" });

        //var p_employment_type   = "RE";
        //var p_remittance_year   = "2019";
        //var p_quarter_rep       = "1";
        //var p_empl_id           = "1";
        //var controller          = "Reports";
        //var action              = "Index";
        //var ReportName          = "cryRemittanceSSSRs5";
        //var SaveName            = "Crystal_Report";
        //var ReportType          = "inline";
        //var ReportPath = "~/Reports/cryRemittanceSSS/cryRemittanceSSSRs5.rpt"
        //var sp = "sp_remittance_SSS_qtrly_rep,p_employment_type," + p_employment_type + ",p_remittance_year," + p_remittance_year + ",p_quarter_rep," + p_quarter_rep + ",p_empl_id," + p_empl_id + ""
        //setTimeout(function () {
        //    $('#modal_generating_report').modal("hide");
        //}, 1200);

        //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //    + "&SaveName=" + SaveName
        //    + "&ReportType=" + ReportType
        //    + "&ReportPath=" + ReportPath
        //    + "&Sp=" + sp
    }
    function AddCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
    function getQuarterByMonth(par_month) {
        var quarter = "";
        if (par_month == 1 || par_month == 2 || par_month == 3) {
            quarter = 1;
        }
        else if (par_month == 4 || par_month == 5 || par_month == 6) {
            quarter = 2;
        }
        else if (par_month == 7 || par_month == 8 || par_month == 9) {
            quarter = 3;
        }
        else if (par_month == 10 || par_month == 11 || par_month == 12) {
            quarter = 4;
        }

        return quarter;
    }

    s.ddl_department_selected_change = function (par_value) {
        $("#modal_generating_remittance").modal();
       
        if (s.ddl_letter != "") {
            h.post("../cRemitLedgerTax/RetrieveListGrid",
                {
                    p_department_code: "",
                    p_starts_letter: s.ddl_letter
                }).then(function (d) {

                    if (d.data.listgrid.length > 0) {
                        s.datalistgrid = d.data.listgrid
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        showdetailsInfo("datalist_grid");
                    }
                    else {
                        s.oTable.fnClearTable();
                    }
                    $("#modal_generating_remittance").modal("hide");
                });
        }
        else {
            h.post("../cRemitLedgerTax/RetrieveListGrid",
                {
                    p_department_code: "",
                    p_starts_letter: "",
                }).then(function (d) {

                    if (d.data.listgrid.length > 0) {
                        s.datalistgrid = d.data.listgrid
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        showdetailsInfo("datalist_grid");
                    }
                    else {
                        s.oTable.fnClearTable();
                    }
                    $("#modal_generating_remittance").modal("hide");
                });
            //s.oTable.fnClearTable();
            //$("#modal_generating_remittance").modal("hide");
        }

    }

    s.ExctractToExcel = function (year, month)
    {
        $('#loading_msg').html("Extracting data");
        $('#modal_generating_remittance').modal({ keyboard: false, backdrop: "static" });
        h.post("../cRemitLedgerTax/ExctractToExcelTAX",
            {
                p_remittance_ctrl_nbr: s.txtb_remittance_ctrl_nbr,
                p_year: year,
                p_month: month
            }
        ).then(function (d) {
            if (d.data.message == "success") {
                $("#modal_generating_remittance").modal("hide")
                window.open(d.data.filePath, '', '');
            }
            else {
                $("#modal_generating_remittance").modal("hide")
                swal(d.data.message, { icon: "success" });
            }
        })

    }

    s.btn_extract_exceldata = function (year, month) {


        $('#loading_msg').html("Extracting data");
        $('#modal_generating_remittance').modal({ keyboard: false, backdrop: "static" });
        h.post("../cRemitLedgerTax/ExctractToExcelTAXDepartment",
            {
                p_employment_type: s.txtb_employment_type_code,
                p_department_code: $("#ddl_department").val(),
                p_year: year,
                p_month: month
            }
        ).then(function (d) {
            if (d.data.message == "success") {
                $("#modal_generating_remittance").modal("hide")
                window.open(d.data.filePath, '', '');
            }
            else {
                $("#modal_generating_remittance").modal("hide")
                swal(d.data.message, { icon: "success" });
            }
        })

    }

    s.ExctractToExcelDepartment = function (year, month) {
        $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });

        $("#ddl_department").val("")
        s.ddl_department = ""
      

    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    



    //********************************************************************/
    //*** JRV : 2021-07-21 - This Function is for Monthly Report****//
    //********************************************************************/
    s.btn_view_report = function (year,month)
    {
        
        h.post("../cRemitAutoGen/PrintBIRMonthly").then(function (d)
        {
            if (d.data.message == "success") {

              
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"
                var ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittanceTAXMonthly.rpt"
                var sp = "sp_monthly_remittance_tax_rep"
                var parameters = "p_remittancetype_code," + "14" + ",p_employment_type," + s.txtb_employment_type_code + ",p_remit_year," + year + ",p_remit_month," + month + ",p_remittance_ctrl_nbr," + s.txtb_remittance_ctrl_nbr


                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp + "," + parameters
            }

        })
    }

    //********************************************************************/
    //*** JRV : 2021-07-21 - This Function is for Monthly Report****//
    //********************************************************************/
    s.btn_view_rec_report = function (year, month) {

        h.post("../cRemitAutoGen/PrintBIRMonthly").then(function (d) {
            if (d.data.message == "success") {


                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"
                var ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittanceTAXMonthlyRecon.rpt"
                var sp = "sp_monthly_remittance_tax_rep"
                var parameters = "p_remittancetype_code," + "14" + ",p_employment_type," + s.txtb_employment_type_code + ",p_remit_year," + year + ",p_remit_month," + month + ",p_remittance_ctrl_nbr," + s.txtb_remittance_ctrl_nbr


                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp + "," + parameters
            }

        })
    }

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

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }
    //********************************************************************/
    //*** VJA : 2021-07-21 - This Function is for Grand Total Viewing****//
    //********************************************************************/
    s.btn_view_grand_total = function (id_ss) {
        h.post("../cRemitLedger/RetrieveGrandTotal",
            {
                par_remittance_ctrl_nbr: s.txtb_remittance_ctrl_nbr
            }).then(function (d) {
                if (d.data.message == "success") {
                    console.log(d.data.data)

                    // **********************************************************
                    // ********** Show the Div on Index *************************
                    // **********************************************************
                    s.show_div_gsis = false;
                    s.show_div_phic_hdmf = false;
                    s.show_div_sss_oth = false
                    s.show_div_tax = false

                    if (d.data.data.remittancetype_code == "01")       // GSIS 
                    {
                        s.show_div_gsis = true;
                    }


                    else if (d.data.data.remittancetype_code == "02" || // HDMF
                        d.data.data.remittancetype_code == "03" || // HDMF
                        d.data.data.remittancetype_code == "04" || // HDMF
                        d.data.data.remittancetype_code == "05" || // HDMF
                        d.data.data.remittancetype_code == "06" || // HDMF 
                        d.data.data.remittancetype_code == "07")   // PHIC
                    {
                        s.show_div_phic_hdmf = true;
                        var total_proccessed_hdmf
                        total_proccessed_hdmf = 0
                        var total_uploaded_hdmf
                        total_uploaded_hdmf = 0
                        var total_override_hdmf
                        total_override_hdmf = 0

                        total_proccessed_hdmf = toDecimalFormat(d.data.data.payroll_amount_gs)
                            + toDecimalFormat(d.data.data.payroll_amount_ps)
                        s.txtb_total_processed_hdmf = currency(total_proccessed_hdmf)

                        total_uploaded_hdmf = toDecimalFormat(d.data.data.uploaded_amount_gs)
                            + toDecimalFormat(d.data.data.uploaded_amount_ps)
                        s.txtb_total_uploaded_hdmf = currency(total_uploaded_hdmf)

                        total_override_hdmf = toDecimalFormat(d.data.data.override_amount_gs)
                            + toDecimalFormat(d.data.data.override_amount_gs)
                        s.txtb_total_override_hdmf = currency(total_override_hdmf)


                    }

                    else if (d.data.data.remittancetype_code == "14") {

                        s.show_div_tax = true
                        var total_processed_tax
                        total_processed_tax = 0
                        total_processed_tax = toDecimalFormat(d.data.data.p_gsis_gs)
                            + toDecimalFormat(d.data.data.p_gsis_ps)
                            + toDecimalFormat(d.data.data.p_sif_gs)
                            + toDecimalFormat(d.data.data.p_gsis_uoli)
                            + toDecimalFormat(d.data.data.p_gsis_ehp)
                            + toDecimalFormat(d.data.data.p_gsis_hip)
                            + toDecimalFormat(d.data.data.p_gsis_ceap)
                            + toDecimalFormat(d.data.data.p_gsis_addl_ins)

                        s.txtb_total_tax = currency(total_processed_tax)

                        s.txtb_basic_tax_amount = d.data.data.p_gsis_gs
                        s.txtb_basic_ovtm_amount = d.data.data.p_gsis_ps
                        s.txtb_basic_2perc_amount = d.data.data.p_sif_gs
                        s.txtb_basic_3perc_amount = d.data.data.p_gsis_uoli
                        s.txtb_basic_5perc_amount = d.data.data.p_gsis_ehp
                        s.txtb_basic_8perc_amount = d.data.data.p_gsis_hip
                        s.txtb_basic_10perc_amount = d.data.data.p_gsis_ceap
                        s.txtb_basic_15perc_amount = d.data.data.p_gsis_addl_ins

                    }
                    else                                                // SSS and Others
                    {
                        s.show_div_sss_oth = true;
                    }
                    // **********************************************************
                    // **********************************************************

                    // **********************************************************
                    // ****** Clear the Textboxes *******************************
                    // **********************************************************
                    s.txtb_remittance_ctrl_no = "";
                    s.txtb_description = "";
                    s.ddl_remittancetype = "";
                    s.txtb_remittancetype = "";
                    s.txtb_year = "";
                    s.txtb_month = "";
                    s.txtb_date_created = "";
                    s.txtb_created_by = "";
                    s.txtb_p_gsis_gs = "0.00";
                    s.txtb_p_gsis_ps = "0.00";
                    s.txtb_p_sif_gs = "0.00";
                    s.txtb_p_gsis_uoli = "0.00";
                    s.txtb_p_gsis_ehp = "0.00";
                    s.txtb_p_gsis_hip = "0.00";
                    s.txtb_p_gsis_ceap = "0.00";
                    s.txtb_p_gsis_addl_ins = "0.00";
                    s.txtb_p_gsis_conso_ln = "0.00";
                    s.txtb_p_gsis_policy_reg_ln = "0.00";
                    s.txtb_p_gsis_policy_opt_ln = "0.00";
                    s.txtb_p_gsis_emergency_ln = "0.00";
                    s.txtb_p_gsis_ecard_ln = "0.00";
                    s.txtb_p_gsis_educ_asst_ln = "0.00";
                    s.txtb_p_gsis_real_state_ln = "0.00";
                    s.txtb_p_gsis_sos_ln = "0.00";
                    s.txtb_p_gsis_help = "0.00";
                    s.txtb_u_gsis_gs = "0.00";
                    s.txtb_u_gsis_ps = "0.00";
                    s.txtb_u_sif_gs = "0.00";
                    s.txtb_u_gsis_uoli = "0.00";
                    s.txtb_u_gsis_ehp = "0.00";
                    s.txtb_u_gsis_hip = "0.00";
                    s.txtb_u_gsis_ceap = "0.00";
                    s.txtb_u_gsis_addl_ins = "0.00";
                    s.txtb_u_gsis_conso_ln = "0.00";
                    s.txtb_u_gsis_policy_reg_ln = "0.00";
                    s.txtb_u_gsis_policy_opt_ln = "0.00";
                    s.txtb_u_gsis_emergency_ln = "0.00";
                    s.txtb_u_gsis_ecard_ln = "0.00";
                    s.txtb_u_gsis_educ_asst_ln = "0.00";
                    s.txtb_u_gsis_real_state_ln = "0.00";
                    s.txtb_u_gsis_sos_ln = "0.00";
                    s.txtb_u_gsis_help = "0.00";
                    s.txtb_o_gsis_gs = "0.00";
                    s.txtb_o_gsis_ps = "0.00";
                    s.txtb_p_other_loan1 = "0.00";
                    s.txtb_p_other_loan2 = "0.00";
                    s.txtb_u_other_loan1 = "0.00";
                    s.txtb_u_other_loan2 = "0.00";
                    s.txtb_o_other_loan1 = "0.00";
                    s.txtb_o_other_loan2 = "0.00";
                    s.txtb_p_other_loan3 = "0.00";
                    s.txtb_u_other_loan3 = "0.00";
                    s.txtb_o_other_loan3 = "0.00";
                    s.txtb_payroll_amount_gs = "0.00";
                    s.txtb_payroll_amount_ps = "0.00";
                    s.txtb_uploaded_amount_gs = "0.00";
                    s.txtb_uploaded_amount_ps = "0.00";
                    s.txtb_override_amount_gs = "0.00";
                    s.txtb_override_amount_ps = "0.00";
                    s.txtb_payroll_amount = "0.00";
                    s.txtb_uploaded_amount = "0.00";

                    // **********************************************************
                    // **********************************************************

                    s.txtb_remittance_ctrl_no = d.data.data.remittance_ctrl_nbr;
                    s.txtb_description = d.data.data.remittance_descr;
                    s.txtb_remittancetype = d.data.data.remittancetype_descr;
                    s.txtb_year = $('#txtb_remittance_year').val();
                    s.txtb_month = $('#txtb_remittance_month').val();

                    s.txtb_p_gsis_gs = d.data.data.p_gsis_gs
                    s.txtb_p_gsis_ps = d.data.data.p_gsis_ps
                    s.txtb_p_sif_gs = d.data.data.p_sif_gs
                    s.txtb_p_gsis_uoli = d.data.data.p_gsis_uoli
                    s.txtb_p_gsis_ehp = d.data.data.p_gsis_ehp
                    s.txtb_p_gsis_hip = d.data.data.p_gsis_hip
                    s.txtb_p_gsis_ceap = d.data.data.p_gsis_ceap
                    s.txtb_p_gsis_addl_ins = d.data.data.p_gsis_addl_ins
                    s.txtb_p_gsis_conso_ln = d.data.data.p_gsis_conso_ln
                    s.txtb_p_gsis_policy_reg_ln = d.data.data.p_gsis_policy_reg_ln
                    s.txtb_p_gsis_policy_opt_ln = d.data.data.p_gsis_policy_opt_ln
                    s.txtb_p_gsis_emergency_ln = d.data.data.p_gsis_emergency_ln
                    s.txtb_p_gsis_ecard_ln = d.data.data.p_gsis_ecard_ln
                    s.txtb_p_gsis_educ_asst_ln = d.data.data.p_gsis_educ_asst_ln
                    s.txtb_p_gsis_real_state_ln = d.data.data.p_gsis_real_state_ln
                    s.txtb_p_gsis_sos_ln = d.data.data.p_gsis_sos_ln
                    s.txtb_p_gsis_help = d.data.data.p_gsis_help
                    s.txtb_u_gsis_gs = d.data.data.u_gsis_gs
                    s.txtb_u_gsis_ps = d.data.data.u_gsis_ps
                    s.txtb_u_sif_gs = d.data.data.u_sif_gs
                    s.txtb_u_gsis_uoli = d.data.data.u_gsis_uoli
                    s.txtb_u_gsis_ehp = d.data.data.u_gsis_ehp
                    s.txtb_u_gsis_hip = d.data.data.u_gsis_hip
                    s.txtb_u_gsis_ceap = d.data.data.u_gsis_ceap
                    s.txtb_u_gsis_addl_ins = d.data.data.u_gsis_addl_ins
                    s.txtb_u_gsis_conso_ln = d.data.data.u_gsis_conso_ln
                    s.txtb_u_gsis_policy_reg_ln = d.data.data.u_gsis_policy_reg_ln
                    s.txtb_u_gsis_policy_opt_ln = d.data.data.u_gsis_policy_opt_ln
                    s.txtb_u_gsis_emergency_ln = d.data.data.u_gsis_emergency_ln
                    s.txtb_u_gsis_ecard_ln = d.data.data.u_gsis_ecard_ln
                    s.txtb_u_gsis_educ_asst_ln = d.data.data.u_gsis_educ_asst_ln
                    s.txtb_u_gsis_real_state_ln = d.data.data.u_gsis_real_state_ln
                    s.txtb_u_gsis_sos_ln = d.data.data.u_gsis_sos_ln
                    s.txtb_u_gsis_help = d.data.data.u_gsis_help
                    s.txtb_o_gsis_gs = d.data.data.o_gsis_gs
                    s.txtb_o_gsis_ps = d.data.data.o_gsis_ps
                    s.txtb_p_other_loan1 = d.data.data.p_other_loan1
                    s.txtb_p_other_loan2 = d.data.data.p_other_loan2
                    s.txtb_u_other_loan1 = d.data.data.u_other_loan1
                    s.txtb_u_other_loan2 = d.data.data.u_other_loan2
                    s.txtb_o_other_loan1 = d.data.data.o_other_loan1
                    s.txtb_o_other_loan2 = d.data.data.o_other_loan2
                    s.txtb_p_other_loan3 = d.data.data.p_other_loan3
                    s.txtb_u_other_loan3 = d.data.data.u_other_loan3
                    s.txtb_o_other_loan3 = d.data.data.o_other_loan3
                    s.txtb_payroll_amount_gs = d.data.data.payroll_amount_gs
                    s.txtb_payroll_amount_ps = d.data.data.payroll_amount_ps
                    s.txtb_uploaded_amount_gs = d.data.data.uploaded_amount_gs
                    s.txtb_uploaded_amount_ps = d.data.data.uploaded_amount_ps
                    s.txtb_override_amount_gs = d.data.data.override_amount_gs
                    s.txtb_override_amount_ps = d.data.data.override_amount_ps
                    s.txtb_payroll_amount = d.data.data.payroll_amount
                    s.txtb_uploaded_amount = d.data.data.uploaded_amount




                    // s.txtb_remittance_ctrl_no = s.datalistgrid[id_ss].remittance_ctrl_nbr;
                    $('#modal_grand_total').modal({ keyboard: false, backdrop: "static" });

                    var total_processed
                    var total_uploaded
                    var total_override
                    total_processed = 0
                    total_uploaded = 0
                    total_override = 0

                    total_processed =
                        toDecimalFormat(d.data.data.p_gsis_gs)
                        + toDecimalFormat(d.data.data.p_gsis_ps)
                        + toDecimalFormat(d.data.data.p_sif_gs)
                        + toDecimalFormat(d.data.data.p_gsis_uoli)
                        + toDecimalFormat(d.data.data.p_gsis_ehp)
                        + toDecimalFormat(d.data.data.p_gsis_hip)
                        + toDecimalFormat(d.data.data.p_gsis_ceap)
                        + toDecimalFormat(d.data.data.p_gsis_addl_ins)
                        + toDecimalFormat(d.data.data.p_gsis_conso_ln)
                        + toDecimalFormat(d.data.data.p_gsis_policy_reg_ln)
                        + toDecimalFormat(d.data.data.p_gsis_policy_opt_ln)
                        + toDecimalFormat(d.data.data.p_gsis_emergency_ln)
                        + toDecimalFormat(d.data.data.p_gsis_ecard_ln)
                        + toDecimalFormat(d.data.data.p_gsis_educ_asst_ln)
                        + toDecimalFormat(d.data.data.p_gsis_real_state_ln)
                        + toDecimalFormat(d.data.data.p_gsis_sos_ln)
                        + toDecimalFormat(d.data.data.p_gsis_help)
                        + toDecimalFormat(d.data.data.p_other_loan1)
                        + toDecimalFormat(d.data.data.p_other_loan2)
                        + toDecimalFormat(d.data.data.p_other_loan3)

                    total_uploaded =

                        toDecimalFormat(d.data.data.u_gsis_gs)
                        + toDecimalFormat(d.data.data.u_gsis_ps)
                        + toDecimalFormat(d.data.data.u_sif_gs)
                        + toDecimalFormat(d.data.data.u_gsis_uoli)
                        + toDecimalFormat(d.data.data.u_gsis_ehp)
                        + toDecimalFormat(d.data.data.u_gsis_hip)
                        + toDecimalFormat(d.data.data.u_gsis_ceap)
                        + toDecimalFormat(d.data.data.u_gsis_addl_ins)
                        + toDecimalFormat(d.data.data.u_gsis_conso_ln)
                        + toDecimalFormat(d.data.data.u_gsis_policy_reg_ln)
                        + toDecimalFormat(d.data.data.u_gsis_policy_opt_ln)
                        + toDecimalFormat(d.data.data.u_gsis_emergency_ln)
                        + toDecimalFormat(d.data.data.u_gsis_ecard_ln)
                        + toDecimalFormat(d.data.data.u_gsis_educ_asst_ln)
                        + toDecimalFormat(d.data.data.u_gsis_real_state_ln)
                        + toDecimalFormat(d.data.data.u_gsis_sos_ln)
                        + toDecimalFormat(d.data.data.u_gsis_help)
                        + toDecimalFormat(d.data.data.u_other_loan3)
                        + toDecimalFormat(d.data.data.u_other_loan1)
                        + toDecimalFormat(d.data.data.u_other_loan2)

                    total_override =
                        toDecimalFormat(d.data.data.o_gsis_gs)
                        + toDecimalFormat(d.data.data.o_gsis_ps)
                        + toDecimalFormat(d.data.data.o_other_loan1)
                        + toDecimalFormat(d.data.data.o_other_loan2)
                        + toDecimalFormat(d.data.data.o_other_loan3)


                    s.txtb_total_processed = currency(total_processed)
                    s.txtb_total_uploaded = currency(total_uploaded)
                    s.txtb_total_override = currency(total_override)
                }
                else if (d.data.message == "error") {
                    swal("Something Went wrong!", "No Accounting Header", "warning");
                }
                else {
                    swal("You Cannot View", d.data.message, "warning");
                }

            })
    }

    $('#datalist_grid tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#datalist_grid').DataTable().row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            //console.log(row.data())
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');

        }

    });

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }

    //-----------------UPDATE BY JADE -------------------------------------------------------------

    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18

    /* Formatting function for row details - modify as you need */

    /* Formatting function for row details - modify as you need */
    function format(d) {

        // `d` is the original data object for the row

        var total_tax = 0
        var basic_tax = 0
       

        if (d.employment_type == "JO") {
            total_tax = parseFloat(d.wtax_3perc) + parseFloat(d.wtax_5perc) + parseFloat(d.wtax_8perc)
            basic_tax = 0
        }

        else {
            total_tax = d.wtax + d.wtax_ovtm
            basic_tax = d.wtax
        }
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" id="table_show_details"> ' +
           
            '<tr>' +
            '<td  style="width:24% !important;padding:0px 0px 0px 10px"><i>withholding tax 3%: </i></td>' +
            '<td style="padding:0px">'  + currency(d.wtax_3perc)  + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:24% !important;padding:0px 0px 0px 10px"><i>withholding tax 5%: </i></td>' +
            '<td style="padding:0px">' + currency(d.wtax_5perc) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:24% !important;padding:0px 0px 0px 10px"><i>Withholding tax 8%: </i></td>' +
            '<td style="padding:0px">' + currency(d.wtax_8perc)+ '</td>' +
            '</tr>' +

            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px;"><i>Basic tax:</i></td>' +
            '<td style="padding:0px;">' + currency(basic_tax) + '</td>' +
            '</tr>' +

            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px;"><i>Overtime tax:</i></td>' +
            '<td style="padding:0px;">' + currency(d.wtax_ovtm) + '</td>' +
            '</tr>' +

            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px;"><b class="text-danger">Total withholding tax:</b></td>' +
            '<td style="padding:0px;">' + currency(total_tax) + '</td>' +
            '</tr>' +
           
            //'<tr>' +
            //'<td style="width:30% !important;padding:0px 0px 0px 10px">OBR Ctrl Nbr :</td>' +
            //'<td style="padding:0px">' + d.doc_obr_nbr + '</td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px">Voucher Ctrl Nbr :</td>' +
            //'<td style="padding:0px">' + d.doc_voucher_nbr + '</td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px">Total Net Pay:</td>' +
            //'<td style="padding:0px"> ' + currency(d.net_pay) + ' </td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px; display:none;">Gross Pay :</td>' +
            //'<td style="padding:0px;display:none;">' + currency(d.gross_pay) + '</td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px">OBR Amount :</td>' +
            //'<td style="padding:0px">' + currency(d.obr_tot_amt) + '</td>' +
            '</table>';
    }
});