/*
 * Script created By:       Joseph M.Tombo Jr.
 * Script created On:       11/27/2019
 * Purpose of this Script:  
 *                          
*/
ng_HRD_App.controller("cTransPostPay_ctrlr", function ($scope, $compile, $http, $filter) {
    var s                   = $scope;
    var h                   = $http;
    s.rowLen                = "10";
    s.datalistgrid          = null;
    s.year                  = [];
    s.ca_voucher_list       = [];
    s.authority             = [];
    s.ADDEDITMODE           = "";
    s.employment_type_list  = null;
    s.ddl_payroll_year      = "";
    s.ddl_payroll_month     = "";
    s.ddl_employment_type   = "";
    s.ddl_ca_voucher_nbr    = "";
    s.txtb_batch_nbr        = "";
    //Initialize Request to backend to get the data for employment type and remittance type
    function init()
    {
        //Initialize and request backend data...
        $('#loading_msg').html("LOADING");
        $("#modal_generating_remittance").modal();
        
        h.post("../cTransPostPay/InitializeData",
            {
                p_payroll_year: s.ddl_payroll_year,
                p_payroll_month: s.ddl_payroll_month,
                p_payroll_employment_type: s.ddl_employment_type
            }).then(function (d)
            {
                //Page Authority from a user;
                s.authority = d.data.um;
                if (d.data.prevValues != null)
                {
                    s.ddl_payroll_year = d.data.prevValues[0];
                    s.ddl_payroll_month = d.data.prevValues[1];
                    s.ddl_employment_type = d.data.prevValues[3];
                    s.ddl_employment_type_selected_change();
                }
                else
                {
                    s.ddl_payroll_year  = new Date().getFullYear().toString();
                    s.ddl_payroll_month = (new Date().getMonth() - 1) < 10 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString();
                }

                s.employment_type_list = d.data.employment_type;
                if (d.data.listgrid != null && d.data.listgrid.length > 0)
                {
                    s.datalistgrid = d.data.listgrid;
                    init_table_data(s.datalistgrid);
                }
                else init_table_data([]);
                
                
                RetrieveYear();
            });
    }

    init()

    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip><"toolbar">',
                pageLength: 10,
                columns: [
                    { "mData": "batch_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "ca_voucher_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "batch_description" },
                    { "mData": "summary_total", "mRender": function (data, type, full, row) { return "<span class='text-right btn-block' style='padding-right:10px;'>" + data + "</span>" } },
                    {
                        "mData": "batch_nbr",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) 
                        {
                            var editable = false;
                            var deletable = false;
                            if (full["ca_allow_delete"] != "Y")
                            {
                                deletable = true;
                            }

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" class="btn btn-success btn-sm" ng-show="authority.allow_edit == 1" ng-disabled="' + editable + '" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-show="authority.allow_delete == 1" ng-disabled="' + deletable + '" ng-click="btn_delete_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '<button type="button" class="btn btn-primary btn-sm" ng-click="btn_export_batch(\'' + data + '\')" data-toggle="tooltip" data-placement="top" title="Export To Findes"><i class="fa fa-share-square-o"></i></button>' +
                                '</div></center>';
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
        $("#modal_generating_remittance").modal('hide');
    }

    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

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
        //showdetailsInfo(table);
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(value).draw();
        //showdetailsInfo(table);
    }
    function show_date() {
        $('.datepicker').datepicker({ format: 'yyyy-mm-dd' });
    }

    //***********************************************************//
    //***Occure when add button is clicked and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function ()
    {
        s.show_in_add   = true;
        s.show_in_edit  = false;

        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        s.ModalTitle = "DATA EXPORT INFO";
        ValidationResultColor("ALL", false);
        if (validateFilter() == false)
        {
            return false;
        }

        s.ADDEDITMODE = "ADD";
        //$('#main_modal').modal({ keyboard: false, backdrop: "static" });
        h.post("../cTransPostPay/GetCAVoucher",
            {
                p_payroll_year:     s.ddl_payroll_year,
                p_payroll_month:    s.ddl_payroll_month,
                p_employment_type:  s.ddl_employment_type
            }
        ).then(function (d)
        {
            s.txtb_batch_nbr            = d.data.batch_nbr_s;
            s.ca_voucher_list           = d.data.ca_vouchers_list
            s.txtb_payroll_year_dspl    = s.ddl_payroll_year;
            s.txtb_payroll_month_dspl   = $('#ddl_payroll_month option:selected').html();
            s.txtb_employment_type_dspl = $('#ddl_employment_type option:selected').html();
            //$("#modal_generating_remittance").modal('toggle');
            $('#main_modal').modal({ keyboard: false, backdrop: "static" });
            s.ddl_remittance_status = "N"
        });

    }

    function validateFilter()
    {
        var return_value = true;
        $("#ddl_payroll_year").removeClass("required");
        $("#lbl_ddl_payroll_year_req").text("");
        $("#ddl_payroll_month").removeClass("required");
        $("#lbl_ddl_payroll_month_req").text("");
        $("#ddl_employment_type").removeClass("required");
        $("#lbl_ddl_employment_type_req").text("");

        if (s.ddl_payroll_year == "") {
            ValidationResultColor("ddl_payroll_year", true);
            return_value = false;
        }
        if (s.ddl_payroll_month == "") {
            ValidationResultColor("ddl_payroll_month", true);
            return_value = false;
        }
        if (s.ddl_employment_type == "")
        {
            ValidationResultColor("ddl_employment_type", true);
            return_value = false;
        }
        return return_value;
    }

    //***********************************************************//
    //***Edit Action Occurred function click
    //***********************************************************// 
    s.btn_edit_action = function (row_index) {
        ClearEntry();
        $('#btn_save').attr('ngx-data',row_index);
        ValidationResultColor("ALL", false);
        var getIndividualData = [];
        s.show_in_add   = false;
        s.show_in_edit  = true;

        s.ADDEDITMODE   = "EDIT";
        s.ModalTitle    = "EDIT DATA FOR EXPORT";

        ClearEntry();
        s.txtb_payroll_year_dspl    = s.ddl_payroll_year;
        s.txtb_payroll_month_dspl   = $('#ddl_payroll_month option:selected').html();
        s.txtb_employment_type_dspl = $('#ddl_employment_type option:selected').html();

        $('#txtb_ca_voucher_nbr').attr('ngx-data', s.datalistgrid[row_index].ca_voucher_nbr);
        s.txtb_ca_voucher_nbr = s.datalistgrid[row_index].ca_voucher_nbr + '-' + s.datalistgrid[row_index].ca_short_descr;
        s.txtb_batch_nbr        = s.datalistgrid[row_index].batch_nbr;
        s.txtb_batch_descr      = s.datalistgrid[row_index].batch_description;
        s.txtb_summary_total    = s.datalistgrid[row_index].summary_total;


        $('#main_modal').modal({ keyboard: false, backdrop: "static" });

        //h.post("../cRemitLedgerSSS/GetVoucher",
        //    {
        //        p_batch_nbr: s.ddl_batch_nbr
        //    }).then(function (d) {
                
        //        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
               
        //    });

    }

    s.btn_delete_row = function (row_index)
    {
        var dt  = null;
            dt  = s.datalistgrid[row_index]
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cTransPostPay/btn_delete_action", {
                        data: dt
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            if (s.datalistgrid.length > 0) {
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            else {
                                s.oTable.fnClearTable();
                            }
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            alert(d.data.message)
                        }
                    })
                }
            });
    }

    //***********************************************************//
    //***Occure when save button is clicked and save data to remittance_dtl_sss_tbl
    //***********************************************************// 
    s.btn_save_click = function () {
        if (ValidateFields())
        {
            var data =
            {
                    batch_nbr           : s.txtb_batch_nbr
                ,   ca_voucher_nbr      : s.ADDEDITMODE == "ADD" ? s.ddl_ca_voucher_nbr : $('#txtb_ca_voucher_nbr').attr('ngx-data')
                ,   batch_description   : s.txtb_batch_descr
                ,   created_by          : ""
                , created_dttm          : ""
                
            };
            //Request save in backend
            if (s.ADDEDITMODE == "ADD")
            {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                var ca_voucher_index = $('#ddl_ca_voucher_nbr option:selected').attr('ngx-data');

                h.post("../cTransPostPay/btn_save_action", { data: data }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        d.data.save_data.summary_total = "0.00";
                        d.data.save_data.ca_short_descr = s.ca_voucher_list[ca_voucher_index].ca_short_descr;
                        d.data.save_data.ca_allow_delete        = "Y"
                        s.datalistgrid.push(d.data.save_data);
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++)
                        {
                            if (get_page(d.data.save_data.batch_nbr) == false)
                            {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("New record successfully added!", { icon: "success", });

                        $('#hdmf_modal').modal("hide")
                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT")
            {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cTransPostPay/btn_save_edit_action", { data: data }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        d.data.save_data.summary_total = d.data.summary_total.toString();
                        //d.data.save_data.ca_allow_delete = "Y"
                        setUpdatedData($('#btn_save').attr('ngx-data'), d.data.save_data);
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(d.data.save_data.batch_nbr) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Existing Record Successfully Updated!", { icon: "success", });

                        $('#hdmf_modal').modal("hide")
                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
        }

    }

    s.btn_show_details_action = function (lst) {
        // return
        h.post("../cTransPostPay/PreviousValuesonPage_cTransPostPay",
            {
                p_payroll_year          : s.ddl_payroll_year,//[0]
                p_payroll_month         : s.ddl_payroll_month,//[1]
                p_payroll_month_descr   : $('#ddl_payroll_month option:selected').html(),//[2]
                p_employment_type       : s.ddl_employment_type,//[3]
                p_employment_type_descr : $('#ddl_employment_type option:selected').html(),//[4]
                p_batch_nbr             : s.datalistgrid[lst].batch_nbr,//[5]
                p_ca_voucher_nbr        : s.datalistgrid[lst].ca_voucher_nbr,//[6]
                par_show_entries        : s.rowLen,//[7]
                par_page_nbr            : $('#datalist_grid').DataTable().page.info().page,//[8]
                par_search              : s.search_box,//[9]
                par_can_delete          : s.datalistgrid[lst].ca_allow_delete

            }).then(function (d)
            {
                var url = "";
                    url = "../cTransPostPayDetails/"
                if (url != "") {
                    window.location.href = url;
                }
            })

    }



    function setUpdatedData(row_id,saved_data)
    {
        s.datalistgrid[row_id].summary_total     = saved_data.summary_total;
        s.datalistgrid[row_id].batch_description = saved_data.batch_description;

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

    s.set_ca_voucher_index = function()
    {
        if (s.ddl_ca_voucher_nbr != "")
        {
            var row_index           = $('#ddl_ca_voucher_nbr option:selected').attr('ngx-data');
            s.txtb_batch_descr      = s.ca_voucher_list[row_index].ca_descr;
            s.txtb_summary_total    = s.ca_voucher_list[row_index].ca_voucher_net_total;
        }
        else
        {
            s.txtb_summary_total = "";
        }
    }

    //Clear Entry Object in add/Edit Modal
    function ClearEntry() {
        s.ddl_ca_voucher_nbr = "";
        s.txtb_summary_total = "";
        s.txtb_batch_descr   = "";
    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if (s.ddl_ca_voucher_nbr == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_ca_voucher_nbr", true);
            return_val = false;
        }
        if (s.txtb_batch_descr == "")
        {
            ValidationResultColor("txtb_batch_descr", true);
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

            $("#txtb_batch_nbr").removeClass("required");
            $("#txtb_batch_descr").removeClass("required");
            $("#lbl_txtb_batch_nbr_req").text("");
            $("#lbl_txtb_batch_descr_req").text("");

            $("#ddl_ca_voucher_nbr").removeClass("required");
            $("#lbl_ddl_ca_voucher_nbr_req").text("");

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

    s.ddl_employment_type_selected_change = function ()
    {
        if (validateFilter() != false)
        {
            h.post("../cTransPostPay/RetrieveDataListGrid",
                {
                    p_payroll_year      : s.ddl_payroll_year,
                    p_payroll_month     : s.ddl_payroll_month,
                    p_employment_type   : s.ddl_employment_type
                }).then(function (d) {
                    console.log(d.data.datalistgrid);
                    if (d.data.datalistgrid != null && d.data.datalistgrid.length > 0) {
                        s.datalistgrid = d.data.datalistgrid;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                    }
                    else s.oTable.fnClearTable();

                });
        }
        
    }

    s.btn_export_batch = function (batch_nbr)
    {
        h.post("../cTransPostPay/btn_export_to_findes_click",
            {
                p_batch_nbr: batch_nbr
            }).then(function (d) 
            {
                if (d.data.message == "success")
                {
                    if (d.data.export_message.created_flag == "Y")
                    {
                        window.open(d.data.output_path,'','');
                    }
                    else
                    {
                        swal(d.data.export_message.result_msg, { icon: "error" });
                    }
                }
                else
                {
                    swal(d.data.message, { icon: "error", });
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
});