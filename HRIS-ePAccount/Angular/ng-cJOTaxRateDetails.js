//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Tax Details
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************




ng_HRD_App.controller("cJOTaxRateDetails_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var index_update = "";

    s.allow_edit = false
    s.allow_print = false
    s.allow_delete = false
    s.allow_view = false
    s.allow_edit_history = false
    s.previouspage_employment_type = ""
    s.isDisabledPERACA = true;
    s.isDisabledHazard = true;
    s.isDisabledSub = true;
    s.isDisabledLau = true;
    s.isDisabledGSIS = true;
    s.isDisabledPHIC = true;
    s.isDisabledHDMF = true;
    s.isDisabledTAX = true;
    s.isDisabledGROSS = true;
    s.oTable = null;
    s.datalistgrid = null
    s.isShowTextPayTemplate = false;
    s.isShowDdlPayTemplate = false;
    templatelist_to_add = []
    payroll_template_list = [];
    classfication_list = [];
    s.isShowEmploymentVal = false
    s.rowLen = "5"
    var sort_value = 1
    var sort_order = "asc"
    s.adddetails = null;
    s.isAction = "";
    function init() {

        $("#loading_data").modal("show")

        h.post("../cJOTaxRateDetails/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            
            s.txtb_ddl_year         = d.data.year
            s.txtb_empl_name_hdr    = d.data.emp_name

            if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "TRUE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "1")
            {
                s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                s.txtb_bus_tax     = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
            }

            else if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "FALSE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "0")
            {
                s.txtb_bus_tax_hdr  = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                s.txtb_bus_tax      = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
            }
            
            s.txtb_w_tax_hdr        = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.tax_perc))
            s.txtb_w_tax            = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.tax_perc))

            s.txtb_empl_id          = d.data.empl_id
            s.txtb_empl_name        = d.data.emp_name
            s.txtb_position         = d.data.position
            s.txtb_department       = d.data.department_name
            s.txtb_department_hdr   = d.data.department_name

            s.payrolltemplate = d.data.sp_payrolltemplate_tbl_list7
            s.previouspage_employment_type = d.data.previouspage_employment_type

            if (d.data.sp_payrolltemplate_tbl_list7.length > 0)
            {
                var count = d.data.sp_payrolltemplate_tbl_list7.length;
                for (var i = 0; i < count; i++)
                {
                    templatelist_to_add[i] = s.payrolltemplate[i].payrolltemplate_code
                }
            }
            
            
            s.ddl_month = MonthFormat((new Date().getMonth() + 1))
            payroll_template_list = d.data.sp_payrolltemplate_tbl_list7
            
            //s.txtb_employment_type_val = d.data.empl_type
            ////s.txtb_employment_type  = d.data.emp_type_descr
            //s.txtb_monthly_tax_due = currency(parseFloat(d.data.tax_due))
            //s.txtb_monthly_tax_rate = currency(parseFloat(d.data.tax_rate))


            init_table_data([]);

            s.allow_edit            = d.data.um.allow_edit
            s.allow_print           = d.data.um.allow_print
            s.allow_delete          = d.data.um.allow_delete
            s.allow_print           = d.data.um.allow_print
            s.allow_edit_history    = d.data.um.allow_edit_history
            s.allow_view = 1
            

            $("#datalist_grid").DataTable().search("").draw();

            if (d.data.sp_payrollemployee_tax_dtl_tbl_list.length > 0)
            {

                s.datalistgrid = d.data.sp_payrollemployee_tax_dtl_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid)
            }
            else
            {
                s.oTable.fnClearTable();
            }

            $("#loading_data").modal("hide")
        })
    }
    init()

    function MonthFormat(number) {
        return (number < 10 ? '0' : '') + number
    }

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;

        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "voucher_nbr", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "payroll_period_descr", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "remarks", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "gross_pay", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                    {
                        "mData": "gsis_ps", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }

                    },

                    {
                        "mData": "hdmf_ps", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }

                    },

                    {
                        "mData": "phic_ps", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }

                    },

                    {
                        "mData": "rcrd_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            var isCheckStatus = false

                            if (data == "1") {
                                isCheckStatus = true;
                            }

                            else {
                                isCheckStatus = false;
                            }
                            

                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-disabled = "' + isCheckStatus + '" ng-show="' + s.allow_edit + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button>' +
                                '</div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTable.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
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

    Array.prototype.select = function (code, prop) {
      
        if (this.filter(function (d) {
            return d[prop] == code
        })[0] == "" || this.filter(function (d) {
            return d[prop] == code
            })[0] == null || this.filter(function (d) {
                return d[prop] == code
            })[0] == undefined)
        {
            value = "";
        }

        else
        {
          value = this.filter(function (d) {
              return d[prop] == code
          })[0]
        }

        return value


    }

    //************************************//
    //***Back to BIR Tax Header****//
    //************************************// 

    s.BacktoTaxHeader = function () {
        if (s.previouspage_employment_type == "JO") {
            url = "/cJOTaxRate"
            window.location.replace(url);
        }
        else if (s.previouspage_employment_type == "NE") {
            url = "/cNonEmployeeTaxRate"
            window.location.replace(url);
        }
        
    }

    
    






    function clearentry() {
        s.ddl_payrolltemplate = "";
        s.txtb_voucher_descr = "";
        s.txtb_voucher_nbr = "";
        s.txtb_pera_ca = "0.00";
        s.txtb_hazard_pay = "0.00";
        s.txtb_subs_pay = "0.00";
        s.txtb_laundry_pay = "0.00";
        s.txtb_gsis_ps = "0.00";
        s.txtb_phic_ps = "0.00";
        s.txtb_hdmf_ps = "0.00";
        s.txtb_wtax = "0.00";
        s.txtb_gross_pay = "0.00";

        s.isDisabledPERACA = true
        s.isDisabledHazard = true
        s.isDisabledSub = true
        s.isDisabledLau = true
        s.isDisabledGSIS = true
        s.isDisabledPHIC = true
        s.isDisabledHDMF = true
        s.isDisabledTAX = true
        s.isDisabledGROSS = true


        FieldValidationColorChanged(false, "ALL");
    }

    function isInArray(value, array)
    {
        return array.indexOf(value) > -1;
    }

    function ToogleTextbox(template_code)
    {
        var templatelist = isInArray(template_code,templatelist_to_add)

        if (templatelist)
        {

            s.isDisabledPERACA  = false;
            s.isDisabledHazard  = false;
            s.isDisabledSub     = false;
            s.isDisabledLau     = false;
            s.isDisabledGSIS    = false;
            s.isDisabledPHIC    = false;
            s.isDisabledHDMF    = false;
            s.isDisabledTAX     = false;
            s.isDisabledGROSS   = false;
            s.ishowsave         = true;
            s.isDisabledVchDesc = false
        }
        

        else
        {
            s.isDisabledPERACA  = true;
            s.isDisabledHazard  = true;
            s.isDisabledSub     = true;
            s.isDisabledLau     = true;
            s.isDisabledGSIS    = true;
            s.isDisabledPHIC    = true;
            s.isDisabledHDMF    = true;
            s.isDisabledTAX     = true;
            s.isDisabledGROSS   = true;
            s.ishowsave         = false;
            s.isDisabledVchDesc = true;
        }

    }


    s.SelectTemplateType = function (par_year, par_month, par_empl_id, par_templatecode) {

        if (par_month == null || par_month == 'undefined')
        {
            par_month = ''
        }

        ToogleTextbox($("#ddl_payrolltemplate option:selected").val())



    }

    function getFromValue() {
        var rcrd_status = ""

        if (s.isAction == "EDIT" || s.isAction == "ADD")
        {
            rcrd_status = "2"
        }

        var lastDay = new Date(parseInt(s.txtb_ddl_year), parseInt($("#ddl_month option:selected").val()), 0)
        var lastDate = lastDay.getDate()
        var data =
        {

             voucher_nbr: s.txtb_voucher_nbr
            ,empl_id: s.txtb_empl_id
            ,payroll_year: s.txtb_ddl_year
            ,payroll_period_descr: $("#ddl_month option:selected").val() + "/" + "01 - " + $("#ddl_month option:selected").val() + "/" + lastDate.toString() + "/" + s.txtb_ddl_year
            ,payroll_month: $("#ddl_month option:selected").val()
            ,payrolltemplate_code: $("#ddl_payrolltemplate option:selected").val()
            ,payrolltemplate_descr: $("#ddl_payrolltemplate option:selected").html()
            , pera_ca_amt: toDecimalFormat(s.txtb_pera_ca)
            ,gsis_ps: toDecimalFormat(s.txtb_gsis_ps)
            ,phic_ps: toDecimalFormat(s.txtb_phic_ps)
            ,hdmf_ps: toDecimalFormat(s.txtb_hdmf_ps)
            ,hazard_pay: toDecimalFormat(s.txtb_hazard_pay)
            ,subsistence_allowance: toDecimalFormat(s.txtb_subs_pay)
            ,laundry_allowance: toDecimalFormat(s.txtb_laundry_pay)
            ,gross_pay: toDecimalFormat(s.txtb_gross_pay)
            ,wtax_amt: toDecimalFormat(s.txtb_wtax)
            ,remarks: s.txtb_voucher_descr
            ,rcrd_status: rcrd_status
            ,acctclass_code: "01"
        }


        return data
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

    function updateListGrid() {
        //LAST
        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();



        s.datalistgrid[index_update].pera_ca_amt = toDecimalFormat(s.txtb_pera_ca)
        s.datalistgrid[index_update].gsis_ps = toDecimalFormat(s.txtb_gsis_ps)
        s.datalistgrid[index_update].phic_ps = toDecimalFormat(s.txtb_phic_ps)
        s.datalistgrid[index_update].hdmf_ps = toDecimalFormat(s.txtb_hdmf_ps)
        s.datalistgrid[index_update].hazard_pay = toDecimalFormat(s.txtb_hazard_pay)
        s.datalistgrid[index_update].subsistence_allowance = toDecimalFormat(s.txtb_subs_pay)
        s.datalistgrid[index_update].laundry_allowance = toDecimalFormat(s.txtb_laundry_pay)
        s.datalistgrid[index_update].gross_pay = toDecimalFormat(s.txtb_gross_pay)
        s.datalistgrid[index_update].wtax_amt = toDecimalFormat(s.txtb_wtax)
        s.datalistgrid[index_update].remarks = s.txtb_voucher_descr
        s.datalistgrid[index_update].rcrd_status = "2"

        var lastDay = new Date(parseInt(s.txtb_ddl_year), parseInt($("#ddl_month option:selected").val()), 0)
        var lastDate = lastDay.getDate()

        s.datalistgrid[index_update].payroll_period_descr = $("#ddl_month option:selected").val() + "/" + "01 - " + $("#ddl_month option:selected").val() + "/" + lastDate.toString() + "/" + s.txtb_ddl_year

        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
        page_value = info.page

        s.oTable.fnSort([[sort_value, sort_order]]);


        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
            if (get_page(s.txtb_voucher_nbr) == false) {
                s.oTable.fnPageChange(x);
            }
            else {
                break;
            }
        }


    }


    s.btn_save = function () {

        var dt = getFromValue()
        var tname = "oTable"
        $("#btn_save").removeClass("fa fa-save");
        $("#btn_save").addClass("fa fa-spinner fa-spin");
        if (isdataValidated()) {

            h.post("../cJOTaxRateDetails/CheckData", {
                par_payroll_year: dt.payroll_year
                , par_empl_id: dt.empl_id
                , par_action: s.isAction
                , par_voucher_nbr: dt.voucher_nbr
            }).then(function (d) {
                if (d.data.message == "success") {

                    if (s.isAction == "ADD") {

                        h.post("../cJOTaxRateDetails/SaveEDITInDatabase",
                            {
                                
                                data: dt
                                ,par_action: s.isAction
                            }).then(function (d) {
                                if (d.data.message = "success") {

                                    s.datalistgrid.push(dt)
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid)

                                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                        if (get_page(s.txtb_voucher_nbr) == false) {
                                            s.oTable.fnPageChange(x);
                                        }
                                        else
                                        {
                                            break;
                                        }
                                    }

                                    h.post("../cJOTaxRateDetails/GenerateByEmployee",
                                        {
                                        par_payroll_year: s.txtb_ddl_year
                                        ,par_empl_id: s.txtb_empl_id
                                    }).then(function (d) {

                                        if (d.data.message == "success")
                                        {

                                            if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "TRUE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "1")
                                            {
                                                s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                                                s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                                            }

                                            else if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "FALSE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "0")
                                            {
                                                s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                                                s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                                            }

                                            s.txtb_w_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.tax_perc))
                                            
                                            swal("Successfully Added!", "New record has been successfully added!", "success");
                                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                            $("#btn_save").addClass("fa fa-save");
                                            $("#main_modal").modal("hide")



                                        }

                                        else {
                                            swal("Saving Error!", "Data not save.", "error");
                                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                            $("#btn_save").addClass("fa fa-save");
                                        }

                                    })



                                }

                                else {
                                    swal("Saving Error!", "Data not save.", "error");
                                    $("#main_modal").modal("hide")
                                    $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                    $("#btn_save").addClass("fa fa-save");
                                }





                            })

                    }

                    else if (s.isAction == "EDIT") {

                        h.post("../cJOTaxRateDetails/SaveEDITInDatabase",
                            {
                                data: dt
                                ,par_action: s.isAction
                            }).then(function (d) {

                                if (d.data.message == "success") {

                                    h.post("../cJOTaxRateDetails/GenerateByEmployee", {
                                        par_payroll_year: s.datalistgrid[index_update].payroll_year
                                        ,par_empl_id: s.datalistgrid[index_update].empl_id
                                    }).then(function (d) {

                                        if (d.data.message == "success") {
                                            updateListGrid()
                                            if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "TRUE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "1") {
                                                s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                                                s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                                            }

                                            else if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "FALSE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "0") {
                                                s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                                                s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                                            }

                                            s.txtb_w_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.tax_perc))

                                            $("#main_modal").modal("hide")
                                            swal("Successfully Updated!", "Current record has been successfully Updated!", "success");
                                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                            $("#btn_save").addClass("fa fa-save");

                                        }

                                    })



                                }

                                else {
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid)
                                    swal("Saving error!", "Data has been Deleted by Other User/s!", "error");
                                    $("#main_modal").modal("hide")
                                }

                            })
                    }


                }

                else {


                    if (d.data.sp_payrollemployee_tax_dtl_tbl_list != null) {



                        if (Object.values(s.datalistgrid).indexOf(d.data.sp_payrollemployee_tax_dtl_tbl_list).voucher_nbr >= 0) {

                            s.datalistgrid.push(d.data.sp_payrollemployee_tax_dtl_tbl_list)
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid)
                        }

                        else
                        {
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid)
                        }


                        $("#btn_save").removeClass("fa fa-spinner fa-spin");
                        $("#btn_save").addClass("fa fa-save");

                        swal("Saving error!", "Data not save Duplicate Voucher Number!", "error");
                    }

                    else {
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                        swal("Saving error!", "Data has been Deleted by Other User/s!", "error");
                        $("#main_modal").modal("hide")
                    }



                }

            })

        }



    }

    s.btn_edit_action = function (id_ss) {
        s.isShowTextPayTemplate = true;
        s.isShowDdlPayTemplate = false;
        clearentry()
        s.isAction = "EDIT"
        s.isShowNameInput = true;
        s.ishowsave = true;
        s.isDisabledVchNbr = true;
        s.isShowDdlPayClass = true
        index_update = ""
        index_update = id_ss

        s.txtb_bus_tax  = s.txtb_bus_tax_hdr
        s.txtb_w_tax    = s.txtb_w_tax_hdr

        if (s.datalistgrid[id_ss].payroll_month == null || s.datalistgrid[id_ss].payroll_month == '')
        {
            s.ddl_month = ''
        }
        else
        {
            s.ddl_month = s.datalistgrid[id_ss].payroll_month
        }
        
        ToogleTextbox(s.datalistgrid[id_ss].payrolltemplate_code)

        s.ModalTitle = "Edit Record"
        $("#main_modal").modal("show")

        h.post("../cJOTaxRateDetails/CheckData", {
            par_payroll_year    : s.datalistgrid[id_ss].payroll_year
            , par_empl_id       : s.datalistgrid[id_ss].empl_id
            , par_action        : s.isAction
            , par_voucher_nbr   : s.datalistgrid[id_ss].voucher_nbr

        }).then(function (d) {

            if (d.data.message == "success") {
                s.ddl_payrolltemplate       = s.datalistgrid[id_ss].payrolltemplate_code
                s.txtb_voucher_nbr          = s.datalistgrid[id_ss].voucher_nbr;
                s.txtb_payroll_template     = s.datalistgrid[id_ss].payrolltemplate_descr
                s.txtb_voucher_descr        = s.datalistgrid[id_ss].remarks;
                s.txtb_pera_ca = currency(s.datalistgrid[id_ss].pera_ca_amt)
                s.txtb_hazard_pay = currency(s.datalistgrid[id_ss].hazard_pay)
                s.txtb_subs_pay = currency(s.datalistgrid[id_ss].subsistence_allowance)
                s.txtb_laundry_pay = currency(s.datalistgrid[id_ss].laundry_allowance)
                s.txtb_gsis_ps = currency(s.datalistgrid[id_ss].gsis_ps)
                s.txtb_phic_ps = currency(s.datalistgrid[id_ss].phic_ps)
                s.txtb_hdmf_ps = currency(s.datalistgrid[id_ss].hdmf_ps)
                s.txtb_wtax = currency(s.datalistgrid[id_ss].wtax_amt)
                s.txtb_gross_pay = currency(s.datalistgrid[id_ss].gross_pay)
                if (s.datalistgrid[id_ss].rcrd_status != "2") {
                    s.isDisabledClass = true
                }

                else {
                    s.isDisabledClass = false
                }
            }

            else {
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid)
                swal("Saving error!", "Data has been Deleted by Other User/s!", "error");
                $("#main_modal").modal("hide")

            }


        })


    }

    //this fucntion is called after refreshTable to return to the current dataTable page
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


    Array.prototype.refreshTable = function (table, id) {

        if (this.length == 0) {
            s.oTable.fnClearTable();

        }
        else {
            s.oTable.fnClearTable();
            s.oTable.fnAddData(this);
        }

        var el_id = s[table][0].id

        if (id != "") {
            for (var x = 1; x <= $("#" + el_id).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    s.oTable.fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }


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

    //delete row in dataTable
    s.btn_delete_action = function (id_ss) {
        s.isAction = "DELETE"
        var tname = "oTable"
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {

                h.post("../cJOTaxRateDetails/CheckData", {
                    par_payroll_year    : s.datalistgrid[id_ss].payroll_year
                    ,par_empl_id        : s.datalistgrid[id_ss].empl_id
                    ,par_action         : s.isAction
                    ,par_voucher_nbr    : s.datalistgrid[id_ss].voucher_nbr
                }).then(function (d) {
                    if (d.data.message == "success") {

                        h.post("../cJOTaxRateDetails/DeleteFromDatabase", {
                            par_voucher_nbr: s.datalistgrid[id_ss].voucher_nbr
                            ,par_empl_id: s.datalistgrid[id_ss].empl_id
                        }).then(function (d) {

                            if (d.data.message = "success")
                            {

                                h.post("../cJOTaxRateDetails/GenerateByEmployee", {
                                    par_payroll_year: s.datalistgrid[id_ss].payroll_year
                                    ,par_empl_id: s.datalistgrid[id_ss].empl_id
                                }).then(function (d)
                                {

                                    if (d.data.message == "success") {
                                        var id = s[tname][0].id;
                                        var page = $("#" + id).DataTable().page.info().page
                                        s[tname].fnDeleteRow(id_ss, null, true);
                                        s.datalistgrid = DataTable_data(tname)

                                        if (s.datalistgrid.length > 0)
                                        {
                                            s.oTable.fnClearTable();
                                            s.oTable.fnAddData(s.datalistgrid)
                                        }

                                        else
                                        {
                                            s.oTable.fnClearTable();
                                        }
                                        changePage(tname, page, id)



                                        if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "TRUE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "1")
                                        {
                                            s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                                            s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                                        }

                                        else if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "FALSE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "0")
                                        {
                                            s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                                            s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                                        }

                                        s.txtb_w_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.tax_perc))

                                        swal("Your record has been deleted successfully!", { icon: "success", });
                                    }

                                })

                            }

                            else {
                                swal("Unable to Delete, Data has been deleted by other user/s!", { icon: "warning", });


                                s[tname].fnDeleteRow(id_ss, null, true);
                                s.datalistgrid = DataTable_data(tname)
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid)

                            }


                        })
                    }

                    else {
                        swal("Unable to Delete, Data has been deleted by other user/s!", { icon: "warning", });


                        s[tname].fnDeleteRow(id_ss, null, true);
                        s.datalistgrid = DataTable_data(tname)
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)


                        $("#main_modal").modal("hide")
                    }
                })



            }

        })
    }


    s.btn_add_action = function () {
        clearentry()
        s.isShowTextPayTemplate = false;
        s.isShowDdlPayTemplate  = true;
        s.isAction              = "ADD"
        s.isShowNameInput       = true;
        s.ishowsave             = true;
        s.isDisabledVchNbr      = false;
        s.isDisabledClass       = false;
        s.isShowDdlPayClass     = true
        s.ModalTitle = "Add New Record"


        $("#loading_data").modal("hide")
        $("#main_modal").modal("show")


    }


    function validatenumber(value) {
        var value = value.split(",").join("")
        return value
    }


    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(voucher_nbr) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
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

    //**************************************//
    //***Data Validated****//
    //**************************************//
    function isdataValidated() {
        FieldValidationColorChanged(false, "ALL");

        var validatedSaved = true
        if ($("#ddl_employment_type option:selected").val() == "") {
            FieldValidationColorChanged(true, "ddl_employment_type")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_payrolltemplate option:selected").val() == "") {
            FieldValidationColorChanged(true, "ddl_payrolltemplate")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_month option:selected").val() == "") {
            FieldValidationColorChanged(true, "ddl_month")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_voucher_nbr").val() == "") {
            FieldValidationColorChanged(true, "txtb_voucher_nbr")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }




        if (isNaN(validatenumber($("#txtb_pera_ca").val()))) {
            FieldValidationColorChanged(true, "txtb_pera_ca")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_hazard_pay").val()))) {
            FieldValidationColorChanged(true, "txtb_hazard_pay")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_subs_pay").val()))) {
            FieldValidationColorChanged(true, "txtb_subs_pay")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_laundry_pay").val()))) {
            FieldValidationColorChanged(true, "txtb_laundry_pay")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_gsis_ps").val()))) {
            FieldValidationColorChanged(true, "txtb_gsis_ps")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_phic_ps").val()))) {
            FieldValidationColorChanged(true, "txtb_phic_ps")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_hdmf_ps").val()))) {
            FieldValidationColorChanged(true, "txtb_hdmf_ps")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_wtax").val()))) {
            FieldValidationColorChanged(true, "txtb_wtax")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_gross_pay").val()))) {
            FieldValidationColorChanged(true, "txtb_gross_pay")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        return validatedSaved;

    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {

        if (pMode)
            switch (pObjectName) {

                case "ddl_employment_type":
                    {
                        $("#ddl_employment_type").addClass('require-field')
                        s.lbl_requiredfield1 = "required field!"
                        break;
                    }

                case "ddl_payrolltemplate":
                    {
                        $("#ddl_payrolltemplate").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "ddl_month":
                    {
                        $("#ddl_month").addClass('require-field')
                        s.lbl_requiredfield3 = "required field!"
                        break;
                    }

                case "txtb_voucher_nbr":
                    {
                        $("#txtb_voucher_nbr").addClass('require-field')
                        s.lbl_requiredfield4 = "required field!"
                        break;
                    }

                case "txtb_pera_ca":
                    {
                        $("#txtb_pera_ca").addClass('require-field')
                        s.lbl_requiredfield5 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_hazard_pay":
                    {
                        $("#txtb_hazard_pay").addClass('require-field')
                        s.lbl_requiredfield6 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_subs_pay":
                    {
                        $("#txtb_subs_pay").addClass('require-field')
                        s.lbl_requiredfield7 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_laundry_pay":
                    {
                        $("#txtb_laundry_pay").addClass('require-field')
                        s.lbl_requiredfield8 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_gsis_ps":
                    {
                        $("#txtb_gsis_ps").addClass('require-field')
                        s.lbl_requiredfield9 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_phic_ps":
                    {
                        $("#txtb_phic_ps").addClass('require-field')
                        s.lbl_requiredfield10 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_hdmf_ps":
                    {
                        $("#txtb_hdmf_ps").addClass('require-field')
                        s.lbl_requiredfield11 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_wtax":
                    {
                        $("#txtb_wtax").addClass('require-field')
                        s.lbl_requiredfield12 = "Numeric Values Only!"
                        break;
                    }

                case "txtb_gross_pay":
                    {
                        $("#txtb_gross_pay").addClass('require-field')
                        s.lbl_requiredfield12 = "Numeric Values Only!"
                        break;
                    }



            }
        else if (!pMode) {
            switch (pObjectName) {

                case "ALL":
                    {
                        s.lbl_requiredfield1 = "";
                        s.lbl_requiredfield2 = "";
                        s.lbl_requiredfield3 = "";
                        s.lbl_requiredfield4 = "";
                        s.lbl_requiredfield5 = "";
                        s.lbl_requiredfield6 = "";
                        s.lbl_requiredfield7 = "";
                        s.lbl_requiredfield8 = "";
                        s.lbl_requiredfield9 = "";
                        s.lbl_requiredfield10 = "";
                        s.lbl_requiredfield11 = "";
                        s.lbl_requiredfield12 = ""
                        s.lbl_requiredfield13 = ""
                        $("#ddl_employment_type").removeClass('require-field')
                        $("#ddl_payrolltemplate").removeClass('require-field')
                        $("#ddl_month").removeClass('require-field')
                        $("#txtb_voucher_nbr").removeClass('require-field')
                        $("#txtb_pera_ca").removeClass('require-field')
                        $("#txtb_hazard_pay").removeClass('require-field')
                        $("#txtb_subs_pay").removeClass('require-field')
                        $("#txtb_laundry_pay").removeClass('require-field')
                        $("#txtb_gsis_ps").removeClass('require-field')
                        $("#txtb_phic_ps").removeClass('require-field')
                        $("#txtb_hdmf_ps").removeClass('require-field')
                        $("#txtb_wtax").removeClass('require-field')
                        $("#txtb_gross_pay").removeClass('require-field')
                        break;
                    }

            }
        }
    }

    s.btn_generate_action = function ()
    {

        swal({
            title: "Are you sure to Update this record?",
            text: "Once generated, data will be updated automatically!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {
                h.post("../cJOTaxRateDetails/GenerateByEmployee", {
                    par_payroll_year: s.txtb_ddl_year
                    ,par_empl_id: s.txtb_empl_id
                }).then(function (d) {

                    if (d.data.message == "success") {


                        s.datalistgrid = d.data.sp_payrollemployee_tax_dtl_tbl_list

                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnClearTable()
                            s.oTable.fnAddData(s.datalistgrid)
                        }

                        else
                        {
                            s.oTable.fnClearTable()

                        }

                       

                        if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "TRUE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "1") {
                            s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                            s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wi_sworn_perc))
                        }

                        else if (d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "FALSE" || d.data.sp_payrollemployee_tax_hdr_tbl_list.with_sworn.toString().toUpperCase() == "0") {
                            s.txtb_bus_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                            s.txtb_bus_tax = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.wo_sworn_perc))
                        }

                        s.txtb_w_tax_hdr = currency(parseFloat(d.data.sp_payrollemployee_tax_hdr_tbl_list.tax_perc))

                        swal("Successfully Generated!", "Existing Record Successfully Generated!", "success")
                    }

                })

            }
        })
    }



    


    









    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })

    }


    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }



    //***************************Functions end*********************************************************//

})

