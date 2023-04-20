/*
 * Script created By:       Joseph M.Tombo Jr.
 * Script created On:       12/02/2019
 * Purpose of this Script:  
 *                          
*/
ng_HRD_App.controller("cTransPostPayDetails_ctrlr", function ($scope, $compile, $http, $filter) {
    var s                           = $scope;
    var h                           = $http;
    s.rowLen                        = "10";
    s.datalistgrid                  = null;
    s.year                          = [];
    s.ca_pay_voucher_list           = [];
    s.payroll_template_list         = [];
    s.ADDEDITMODE                   = "";
    s.txtb_payroll_year_dspl        = "";
    s.txtb_payroll_month_dspl       = "";
    s.txtb_employment_type_dspl     = "";
    s.txtb_ca_voucher_nbr_dspl      = "";
    s.txtb_batch_nbr_dspl           = "";
    s.ddl_ca_voucher_nbr            = "";
    s.ddl_payroll_template          = "";
    s.txtb_payroll_template         = "";
    s.authority                     = [];
    s.lbl_net_pay                   = "Payroll Net Pay:";
    //Added By: Joseph M. Tombo Jr. 01/21/2020
    //New Update AS OF 01/21/2020
    s.ddl_pay_period_enable         = true;
    s.ddl_pay_period                = "01";
    s.div_pay_period                = false;
    s.can_delete                    = "";
    s.c_allow_override              = false;
    s.txtb_override_reason          = "";
    //Initialize Request to backend to get the data for employment type and remittance type
    function init() {
        //Initialize and request backend data...
        $('#loading_msg').html("LOADING");
        $("#modal_generating_remittance").modal();

        h.post("../cTransPostPayDetails/InitializeData").then(function (d)
        {
            s.authority = d.data.um;
            if (d.data.override_data != null)
            {
                s.txtb_override_reason = d.data.override_data.override_reason;
                $("#btn_override").removeClass("btn-warning");
                $("#btn_override").addClass("btn-primary");
                $("#btn_override").html("<i class='fa fa-eye'> </i> View Override Reason");
            }
            else
            {
                $("#btn_override").addClass("btn-warning");
                $("#btn_override").removeClass("btn-primary");
                s.txtb_override_reason = "";
                $("#btn_override").html("<i class='fa fa-recycle'> </i> Override Transmittal");
            }

            if (d.data.prevValues != null)
            {
                s.txtb_payroll_year_dspl    = d.data.prevValues[0].toString();
                s.txtb_payroll_month_dspl   = d.data.prevValues[2].toString();
                s.txtb_employment_type_dspl = d.data.prevValues[4].toString();
                $('#txtb_employment_type_dspl').attr('ngx-data',d.data.prevValues[3].toString());
                s.txtb_batch_nbr_dspl       = d.data.prevValues[5].toString();
                s.txtb_ca_voucher_nbr_dspl  = d.data.prevValues[6].toString();
                s.can_delete                = d.data.prevValues[10].toString();
            }
            else
            {
                s.ddl_payroll_year  = new Date().getFullYear().toString();
                s.ddl_payroll_month = (new Date().getMonth() - 1) < 10 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString();

            }

            s.employment_type_list  = d.data.employment_type;
            s.payroll_template_list = d.data.payrolltemplate_list;
            if (d.data.listgrid != null && d.data.listgrid.length > 0)
            {
                s.datalistgrid = d.data.listgrid;
                init_table_data(s.datalistgrid);
            }
            else  init_table_data([]);
            if (d.data.prevValues[10].toString() == "N")
            {
                s.c_allow_override = true;
            }
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
                pageLength: s.rowLen,
                columns: [
                    { "mData": "voucher_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "payroll_registry_descr" },
                    { "mData": "payrolltemplate_descr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "pay_period_descr" },
                    { "mData": "total_net_pay", "mRender": function (data, type, full, row) { return "<span class='text-right btn-block' style='padding-right:10px;'>" + data + "</span>" } },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var editable = false;
                            var deletable = false;
                            //if (s.can_delete != "Y" && full["exist_in_override"] == "N")
                            //{
                            //    deletable = true;
                            //}
                            var edit_object = "";
                            //if (full["exist_in_override"] == "Y") {

                            //    edit_object = '<button type="button" class="btn btn-success btn-sm"  ng-show="authority.allow_edit   == 1" ng-disabled="' + editable + '" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >'
                            //}
                            //else
                            //{
                                edit_object = '<button type="button" class="btn btn-success btn-sm"  ng-show="authority.allow_edit   == 1" ng-disabled="' + editable + '" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View">  <i class="fa fa-eye"></i></button >'
                            //}

                            return '<center><div class="btn-group">' +
                                edit_object +
                                '<button type="button" class="btn btn-danger  btn-sm"  ng-show="authority.allow_delete == 1" ng-disabled="' + deletable + '" ng-click="btn_delete_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '<button type="button" class="btn btn-primary btn-sm"  ng-show="authority.allow_print  == 1" ng-click="btn_individual_print(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i></button>' +
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
        showdetailsInfo(table);
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
        s.show_in_add       = true;
        s.show_in_edit      = false;
        s.div_pay_period    = false;
        s.ddl_pay_period    = "01";

        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        s.ModalTitle = "DATA EXPORT INFO";
        ValidationResultColor("ALL", false);

        s.ADDEDITMODE = "ADD";
        //$('#main_modal').modal({ keyboard: false, backdrop: "static" });
        h.post("../cTransPostPayDetails/GetCAVoucher",
            {
                 p_ca_voucher_nbr       : s.txtb_ca_voucher_nbr_dspl
                , p_batch_nbr           : s.txtb_batch_nbr_dspl
                , p_payrolltemplate_code: s.ddl_payroll_template
            }
        ).then(function (d)
        {
            s.ca_pay_voucher_list = d.data.payroll_vouchers_list
            $('#main_modal').modal({ keyboard: false, backdrop: "static" });
        });

    }

    //***********************************************************//
    //***Occure when add button is clicked and initialize the objects
    //***********************************************************// 
    s.btn_add_override_click = function ()
    {
        s.ModalTitle_override = "OVERRIDE DETAILS";
        $('#main_modal_override').modal({ keyboard: false, backdrop: "static" });
    }

    //***********************************************************//
    //***Edit Action Occurred function click
    //***********************************************************// 
    s.btn_edit_action = function (row_index)
    {
        ClearEntry();
        $('#btn_save').attr('ngx-data', row_index);
        ValidationResultColor("ALL", false);
        var getIndividualData   = [];
        s.show_in_add           = false;
        s.show_in_edit          = true;

        s.ADDEDITMODE           = "EDIT";
        s.ModalTitle            = "SHOW DETAILS DATA FOR EXPORT";

        ClearEntry();

        $('#txtb_ca_voucher_nbr').attr('ngx-data', s.datalistgrid[row_index].ca_voucher_nbr);
        s.txtb_ca_voucher_nbr           = s.datalistgrid[row_index].voucher_nbr + '-' + s.datalistgrid[row_index].payroll_registry_descr;
        s.div_pay_period                = true;
        s.ddl_pay_period                = s.datalistgrid[row_index].pay_period;
        s.ddl_pay_period_enable         = true;
        s.txtb_payroll_registry_descr   = s.datalistgrid[row_index].payroll_registry_descr;
        s.txtb_payroll_registry_dspl    = s.datalistgrid[row_index].payroll_registry;
        s.txtb_net_pay                  = s.datalistgrid[row_index].total_net_pay;
        s.txtb_voucher_nbr_dspl         = s.datalistgrid[row_index].voucher_nbr;
        s.txtb_payroll_registry_dspl    = s.datalistgrid[row_index].payroll_registry_nbr;
        s.txtb_payroll_template         = s.datalistgrid[row_index].payrolltemplate_descr;

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
                    h.post("../cTransPostPayDetails/btn_delete_action", {
                        data: dt
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length > 0)
                            {
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

    //***********************************************************//
    //***Occure when save button is clicked and save data to remittance_dtl_sss_tbl
    //***********************************************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            var data =
            {
                    batch_nbr       : s.txtb_batch_nbr_dspl
                ,   voucher_nbr     : s.ddl_ca_voucher_nbr
                ,   total_net_pay : (s.txtb_net_pay).toString().replace(',', '').replace(',', '')
                ,   pay_period    : s.ddl_pay_period
            };
          
            //Request save in backend
            if (s.ADDEDITMODE == "ADD")
            {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cTransPostPayDetails/btn_save_action", { data: data }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        var template_index                      = $('#ddl_payroll_template option:selected').attr('ngx-data');
                        d.data.save_data.total_net_pay          = s.txtb_net_pay;
                        d.data.save_data.payrolltemplate_code   = s.payroll_template_list[template_index].payrolltemplate_code;
                        d.data.save_data.payroll_registry_descr = s.txtb_payroll_registry_descr;
                        d.data.save_data.report_filename        = s.payroll_template_list[template_index].report_filename;
                        d.data.save_data.payrolltemplate_descr  = s.payroll_template_list[template_index].payrolltemplate_descr;
                        d.data.save_data.pay_period             = s.ddl_pay_period;
                        d.data.save_data.pay_period_descr       = $('#ddl_pay_period option:selected').html();

                        s.datalistgrid.push(d.data.save_data);
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++)
                        {
                            if (get_page(d.data.save_data.voucher_nbr) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", { icon: "success", });

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

                h.post("../cTransPostPayDetails/btn_save_edit_action", { data: data }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        d.data.save_data.summary_total = d.data.summary_total.toString();
                        setUpdatedData($('#btn_save').attr('ngx-data'), d.data.save_data);
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++)
                        {
                            if (get_page(d.data.save_data.batch_nbr) == false)
                            {
                                s.oTable.fnPageChange(x);
                            }
                            else
                            {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", { icon: "success", });
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

    //***********************************************************//
    //***Occure when save button is clicked and save data to remittance_dtl_sss_tbl
    //***********************************************************// 
    s.btn_save_override_click = function () {
        if (s.txtb_override_reason != "")
        {
            var data =
            {
                 batch_nbr       : s.txtb_batch_nbr_dspl
                ,voucher_nbr     : s.txtb_ca_voucher_nbr_dspl
                ,override_reason : s.txtb_override_reason
                ,created_dttm    : moment().format('YYYY-MM-DD HH:mm:ss')
                , updated_dttm   : moment().format('YYYY-MM-DD HH:mm:ss')
                , created_user_id: ""
                , updated_user_id: ""
            };

            //Request save in backend
            //if (s.ADDEDITMODE == "ADD") {
                $('#i_save_override').removeClass('fa-save');
                $('#i_save_override').addClass('fa-spinner fa-spin');
                h.post("../cTransPostPayDetails/btn_save_override_action", { data: data }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        $('#main_modal_override').modal("hide");
                        swal("Your record has been saved!", { icon: "success", });
                        s.txtb_override_reason = s.txtb_override_reason;
                        $("#btn_override").removeClass("btn-warning");
                        $("#btn_override").addClass("btn-primary");
                        $("#btn_override").html("<i class='fa fa-eye'> </i> View Override Reason");
                        $('#hdmf_modal').modal("hide");

                        s.oTable.fnClearTable();
                        
                        for (var x = 0;x < s.datalistgrid.length; x++)
                        {
                            s.datalistgrid[x].exist_in_override = "Y";
                        }
                        //console.log(s.datalistgrid);
                        //console.log(s.datalistgrid[0].exist_in_override);
                        if (s.datalistgrid.length > 0)
                        {
                            console.log(s.datalistgrid);
                            s.oTable.fnAddData(s.datalistgrid);
                        }
                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save_override').addClass('fa-save');
                    $('#i_save_override').removeClass('fa-spinner fa-spin');
                });
           // }
            //else if (s.ADDEDITMODE == "EDIT")
            //{
            //    $('#i_save').removeClass('fa-save');
            //    $('#i_save').addClass('fa-spinner fa-spin');
            //    //h.post("../cTransPostPayDetails/btn_save_edit_action", { data: data }).then(function (d) {
            //    //    if (d.data.message == "success")
            //    //    {

            //    //        $('#main_modal_override').modal("hide");
            //    //        swal("Your record has been saved!", { icon: "success", });
            //    //    }
            //    //    else {
            //    //        swal(d.data.message, { icon: "error", });
            //    //    }

            //    //    $('#i_save_override').addClass('fa-save');
            //    //    $('#i_save_override').removeClass('fa-spinner fa-spin');
            //    //});
            //    $('#i_save_override').addClass('fa-save');
            //    $('#i_save_override').removeClass('fa-spinner fa-spin');
            //}
        }

    }

    s.btn_show_details_action = function (lst) {
       
        h.post("../cTransPostPayDetails/PreviousValuesonPage_cTransPostPay",
            {
                p_payroll_year: s.ddl_payroll_year,
                p_payroll_month: s.ddl_payroll_month,
                p_payroll_month_descr: $('#ddl_payroll_month option:selected').html(),
                p_employment_type: s.ddl_employment_type,
                p_employment_type_descr: $('#ddl_employment_type option:selected').html(),
                p_batch_nbr: s.datalistgrid[lst].batch_nbr,
                p_ca_voucher_nbr: s.datalistgrid[lst].ca_voucher_nbr,
                par_show_entries: s.rowLen,
                par_page_nbr: $('#datalist_grid').DataTable().page.info().page,
                par_search: s.search_box,


            }).then(function (d) {
                var url = "";
                url = "../cTransPostPayDetails/"
                if (url != "") {
                    window.location.href = url;
                }
            })

    }



    function setUpdatedData(row_id, saved_data) {
        s.datalistgrid[row_id].summary_total = saved_data.summary_total;
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
            var row_index = $('#ddl_ca_voucher_nbr option:selected').attr('ngx-data');
            s.txtb_payroll_registry_descr   = s.ca_pay_voucher_list[row_index].payroll_registry_descr;
            s.txtb_net_pay                  = s.ca_pay_voucher_list[row_index].net_pay;
            s.txtb_payroll_registry_dspl    = s.ca_pay_voucher_list[row_index].payroll_registry_nbr;
            s.txtb_voucher_nbr_dspl         = s.ca_pay_voucher_list[row_index].voucher_nbr;
            if (s.ddl_payroll_template == "007" || s.ddl_payroll_template == "008" || s.ddl_payroll_template == "009")
            {
                s.div_pay_period = true;
                if (s.ca_pay_voucher_list[row_index].pay_period == "01")
                {
                    s.ddl_pay_period_enable = true;
                    s.ddl_pay_period = "01";
                    s.ddl_pay_period_changed();
                }
                else if (s.ca_pay_voucher_list[row_index].pay_period == "02")
                {
                    s.ddl_pay_period_enable = true;
                    s.ddl_pay_period = "02";
                    s.ddl_pay_period_changed();
                }
                else if (s.ca_pay_voucher_list[row_index].pay_period == "03")
                {
                    s.ddl_pay_period_enable = true;
                    s.ddl_pay_period = "03";
                    s.ddl_pay_period_changed();
                }
                
            }
       
           
        }
        else {
            s.txtb_net_pay                  = "";
            s.txtb_payroll_registry_descr = "";
            s.div_pay_period = false;
        }
    }


    s.ddl_payroll_template_change = function ()
    {
            getVouchers();
    }

    s.ddl_pay_period_changed = function ()
    {
        var row_index                   = $('#ddl_ca_voucher_nbr option:selected').attr('ngx-data');
        s.txtb_payroll_registry_descr   = s.ca_pay_voucher_list[row_index].payroll_registry_descr;
        s.txtb_net_pay                  = s.ca_pay_voucher_list[row_index].net_pay;
        s.txtb_payroll_registry_dspl    = s.ca_pay_voucher_list[row_index].payroll_registry_nbr;
        s.txtb_voucher_nbr_dspl         = s.ca_pay_voucher_list[row_index].voucher_nbr;

        if (s.ddl_pay_period == "01")
        {
            s.lbl_net_pay   = "Payroll Net Pay:";
            s.txtb_net_pay  = s.ca_pay_voucher_list[row_index].net_pay;
        }
        else if (s.ddl_pay_period == "02")
        {
            s.lbl_net_pay   = "Payroll Net Pay 1:";
            s.txtb_net_pay  = s.ca_pay_voucher_list[row_index].net_pay1;
        }
        else if (s.ddl_pay_period == "03")
        {
            s.lbl_net_pay   = "Payroll Net Pay 2:";
            s.txtb_net_pay  = s.ca_pay_voucher_list[row_index].net_pay2;
        }
    }

    function getVouchers()
    {
        h.post("../cTransPostPayDetails/GetCAVoucher",
            {
                p_ca_voucher_nbr: s.txtb_ca_voucher_nbr_dspl
                , p_batch_nbr: s.txtb_batch_nbr_dspl
                , p_payrolltemplate_code: s.ddl_payroll_template
            }
        ).then(function (d) {
            s.ca_pay_voucher_list           = d.data.payroll_vouchers_list
            s.txtb_net_pay                  = "";
            s.txtb_payroll_registry_descr   = "";
            s.txtb_payroll_registry_dspl    = "";
            s.txtb_voucher_nbr_dspl         = "";
            s.div_pay_period                = false;
            $('#main_modal').modal({ keyboard: false, backdrop: "static" });
        });
    }

    //Clear Entry Object in add/Edit Modal
    function ClearEntry() {
        s.ddl_ca_voucher_nbr            = "";
        s.txtb_net_pay                  = "";
        s.txtb_payroll_registry_descr   = "";
        s.ddl_payroll_template          = "";
        s.txtb_payroll_registry_dspl    = "";
        s.txtb_voucher_nbr_dspl         = "";
    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if (s.ddl_payroll_template == "" && s.ADDEDITMODE == "ADD")
        {
            ValidationResultColor("ddl_payroll_template", true);
            return_val = false;
        }

        if (s.ddl_ca_voucher_nbr == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_ca_voucher_nbr", true);
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
            $("#lbl_txtb_batch_nbr_req").text("");

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

            $("#ddl_payroll_template").removeClass("required");
            $("#lbl_ddl_payroll_template_req").text("");
        }
    }

    s.btn_individual_print = function (row_id)
    {
        var controller  = "Reports"
        var action      = "Index"
        var ReportName  = "CrystalReport"
        var SaveName    = "Crystal_Report"
        var ReportType  = "inline"

        var ReportPath  = "~/Reports/" + s.datalistgrid[row_id].report_filename
        var sp          = ""
        var parameters  = ""

        switch (s.datalistgrid[row_id].payrolltemplate_code)
        {
            case "105": // Obligation Request (OBR) - For Regular 
            case "205": // Obligation Request (OBR) - For Casual
            case "305": // Obligation Request (OBR) - For Job-Order
                sp = "sp_payrollregistry_obr_rep";
                //url = "/printView/printView.aspx?id=~/Reports/" + printreport + "," + procedure + ",par_payroll_year," + ddl_year.SelectedValue.ToString().Trim() + ",par_payroll_registry_nbr," + lnkPrint.CommandArgument.Split(',')[0].ToString().Trim() + ",par_payrolltemplate_code," + ddl_payroll_template.SelectedValue.ToString().Trim();
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            //---- START OF REGULAR REPORTS

            case "007": // Summary Monthly Salary  - For Regular 
                sp = "sp_payrollregistry_salary_re_ce_rep";
                //url = "/printView/printView.aspx?id=~/Reports/" + printreport + "," + procedure + ",par_payroll_year," + ddl_year.SelectedValue.ToString().Trim() + ",par_payroll_registry_nbr," + lnkPrint.CommandArgument.Split(',')[0].ToString().Trim() + ",par_payrolltemplate_code," + ddl_select_report.SelectedValue.ToString().Trim();
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "101": // Mandatory Deduction  - For Regular 

                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "102": // Optional Deduction Page 1 - For Regular 
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "106": // Optional Deduction Page 2 - For Regular 
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "103": // Loan Deduction Page 1 - For Regular 
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "107": // Loan Deduction Page 2 - For Regular 
                sp = "sp_payrollregistry_salary_re_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "104": // Attachment - For Monthly Salary
                sp = "sp_payrollregistry_salary_re_attach_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "033": // Salary Differential - For Regular 
                sp = "sp_payrollregistry_salary_diff_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            //---- END OF REGULAR REPORTS

            //---- START OF CASUAL REPORTS

            case "008": // Summary Monthly Salary  - For Casual 
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "206": // Mandatory Deduction  -  For Casual 
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "207": // Optional Deduction Page 1 - For Casual 
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "208": // Optional Deduction Page 2 - For Casual 
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "209": // Loan Deduction Page 1 - For Casual 
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "210": // Loan Deduction Page 2 - For Casual 
                sp = "sp_payrollregistry_salary_ce_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code

            case "211": // Attachment - For Monthly Salary - For Casual 
                sp = "sp_payrollregistry_salary_re_attach_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "044": // Monetization Payroll - For Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            //---- END OF CASUAL REPORTS

            //---- START OF JOB-ORDER REPORTS

            case "009": // Summary Salary Monthly - For Job-Order 
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "010": // Summary Salary 1st Quincemna - For Job-Order 
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "011": // Summary Salary 2nd Quincemna - For Job-Order 
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "306": // Contributions/Deductions Page 1 - For Job-Order 
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "307": // Contributions/Deductions Page 1 - For Job-Order 
                sp = "sp_payrollregistry_salary_jo_rep";
                parameters = ",par_payroll_year" + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr" + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code" + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "308": // Attachment - For Monthly Salary
                sp = "sp_payrollregistry_salary_re_attach_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "061": // Overtime Payroll - For Job-Order 
                sp = "sp_payrollregistry_ovtm_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "062": // Honorarium Payroll - For Job-Order 
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;


            //---- END OF JOB-ORDER REPORTS
            //---- START OF OTHER PAYROLL REPORTS

            case "024": // Communication Expense Allowance - Regular
            case "043": // Communication Expense Allowance - Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "026": // Mid Year Bonus  - Regular        
            case "045": // Mid Year Bonus  - Casual       
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "027": // Year-End And Cash Gift Bonus - Regular
            case "046": // Year-End And Cash Gift Bonus - Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "028": // Clothing Allowance - Regular
            case "047": // Clothing Allowance - Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "029": // Loyalty Bonus        - Regular
            case "048": // Loyalty Bonus        - Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "030": // Anniversary Bonus    - Regular
            case "049": // Anniversary Bonus    - Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "031": // Productivity Enhancement Incentive Bonus  - Regular
            case "050": // Productivity Enhancement Incentive Bonus  - Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "023": // RATA 
                sp = "sp_payrollregistry_rata_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "108": // RATA - OBR Breakdown
                sp = "sp_payrollregistry_obr_rata_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "021": // Subsistence, HA and LA      - Regular
            case "041": // Subsistence, HA and LA      - Casual
                sp = "sp_payrollregistry_subs_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "022": // Overtime - Regular
            case "042": // Overtime - Casual
                sp = "sp_payrollregistry_ovtm_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "032": // CNA INCENTIVE - Regular
            case "051": // CNA INCENTIVE - Casual
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "025": // Monetization Payroll - For Regular
                sp = "sp_payrollregistry_oth1_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "901": // Other Payroll 1 - For Regular 
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "902": // Other Payroll 2 - For Regular 
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "903": // Other Payroll 3 - For Regular 
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "904": // Other Payroll 4 - For Regular 
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "905": // Other Payroll 5 - For Regular 
                sp = "sp_payrollregistry_othpay_rep";
                parameters = "par_payroll_year," + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code," + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "109": // Communicatio Expense - OBR Breakdown
                sp = "sp_payrollregistry_obr_commx_rep";
                parameters = ",par_payroll_year" + s.datalistgrid[row_id].payroll_year + ",par_payroll_registry_nbr" + s.datalistgrid[row_id].payroll_registry_nbr + ",par_payrolltemplate_code" + s.datalistgrid[row_id].payrolltemplate_code
                break;

            case "": // Direct Print to Printer
                url = "/View/cDirectToPrinter/cDirectToPrinter.aspx";

                break;
        }

        h.post("../cTransPostPayDetails/set_history_page",
            {
                page_name: "../cTransPostPayDetails/"

            }).then(function (d) {
                if (d.data.message == "success") {
                    location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&Sp=" + sp + "," + parameters
                }

            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
});