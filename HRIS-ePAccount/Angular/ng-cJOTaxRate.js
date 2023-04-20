//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll POSTING
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************




ng_HRD_App.controller("cJOTaxRate_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var index_update = "";

    s.allow_edit = false
    s.allow_print = false
    s.allow_delete = false
    s.allow_view = false
    s.allow_edit_history = false

    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "5"
    var sort_value = 1
    var sort_order = "asc"
    s.adddetails = null;
    s.isAction = "";
    s.btnAddShow = false;
    s.isShowEffectiveDate_hid = false
    s.isShowEffectiveDate = false
    s.isShowBirSelect = true

    s.currentBIRClass       = ""
    s.isDisabledBIRClass    = false

    s.isDisabledWHeld       = false
    s.isDisabledBTax        = false
    s.isDisabledVat         = false
    s.isDisabledExmpt       = false

    var currentBIRClass = "";
    
    function init() {

        $("#loading_data").modal("show")
        RetrieveYear()
        h.post("../cJOTaxRate/InitializeData", { par_payroll_year: new Date().getFullYear().toString() }).then(function (d) {

            s.employeeddl           = d.data.empType
            s.ddl_employment_type   = d.data.ddl_emp_type
            s.ddl_year              = d.data.ddl_year == "" || d.data.ddl_year == null ? s.ddl_year = new Date().getFullYear().toString() : d.data.ddl_year
            s.ddl_department        = d.data.department_code == "" || d.data.department_code == null ? s.ddl_department = "" : d.data.department_code

            $("#ddl_status").val("N")

            $("#ddl_w_held").val("0")
            $("#ddl_b_tax").val("0")
            $("#ddl_vat").val("0")
            s.ddl_w_held    = "0"
            s.ddl_b_tax     = "0"
            s.ddl_vat       = "0"


            if ($("#ddl_department").val() != "")
            {
                s.btnAddShow = true
            }

            else
            {
                s.btnAddShow = false
            }

            if (s.ddl_department != "")
            {
                s.btnAddShow = true
            }

            s.w_held_data = d.data.taxrate_percentage_tbl_list

            s.ddl_w_held = ""
            $("#ddl_w_held").val("")
            s.ddl_b_tax = ""
            $("#ddl_b_tax").val("")
            s.ddl_vat = ""
            $("#ddl_vat").val("")

            if (d.data.history != "" || d.data.history != null || d.data.history == undefined)
            {
                if (d.data.history == "N")
                {
                    s.chckbx_history = false
                }

                else if (d.data.history == "Y")
                {
                    s.chckbx_history = true
                }
                
            }
            

            init_table_data([]);

            s.allow_edit            = d.data.um.allow_edit
            s.allow_print           = d.data.um.allow_print
            s.allow_delete          = d.data.um.allow_delete
            s.allow_print           = d.data.um.allow_print
            s.allow_edit_history    = d.data.um.allow_edit_history
            s.allow_view            = 1

            s.department_data = d.data.department_list
            s.bir_class_data = d.data.bir_class_list

            $("#datalist_grid").DataTable().search("").draw();

            if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0)
            {
               
                s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid)
            }
            else
            {
                s.oTable.fnClearTable();
            }




           

            sort_value  = d.data.sort_value
            page_value  = d.data.page_value
            sort_order  = d.data.sort_order
            s.rowLen    = d.data.show_entries
            $("#datalist_grid").DataTable().page.len(s.rowLen).draw();
            s.oTable.fnSort([[sort_value, sort_order]]);
            s.oTable.fnPageChange(page_value);
            s.search_box = d.data.search_value

            if (s.search_box == undefined || s.search_box == '')
            {
                s.search_box = ''
            }

            else
            {
                s.search_in_list(s.search_box, 'datalist_grid')
            }

            $("#loading_data").modal("hide")
        })
    }
    init()

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
                        "mData": "empl_id", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "employee_name", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "w_tax_perc", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                    {
                        "mData": "bus_tax_perc", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                    {
                        "mData": "vat_perc", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                  

                    {
                        "mData": "total_gross_pay", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'

                                + '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="Show Details" ng-show="' + s.allow_view + '" ng-click="btn_show_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-plus"></i>' + '</button>'
                                + '<button type="button" class="btn btn-default btn-sm action" style="background-color:blueviolet;color:white;border:1px solid blueviolet;" data-toggle="tooltip" data-placement="left" title="Generate Annualized Tax" ng-show="' + s.allow_edit + '" ng-click="btn_generate_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-clipboard"></i>' + '</button>'

                                + '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Print" ng-show="' + s.allow_print + '" ng-click="btn_print_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-print"></i>' + '</button>' 
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>' + '</button>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

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


    //************************************//
    //***Select-Payroll-Year-DropDown****//
    //************************************// 
    s.SelectPayrollYear = function (par_year)
    {

        if (par_year.toString() != "" && s.ddl_department.toString() != "")
        {
            s.btnAddShow = true;
        }

        else
        {
            s.btnAddShow = false;
        }

        $("#loading_data").modal("show")


        var history = "N"
        if (s.chckbx_history == true)
        {
            var history = "Y"
        }

        else {
            var history = "N"
        }

        if (s.isAction == "ADD")
        {
            effective_date = $("#txtb_effective_date").val()
        }
        

        if ($("#ddl_year").val() != "" && $("#ddl_department").val() != "")
        {
            h.post("../cJOTaxRate/RetrieveDataListGrid",
                {
                    pay_payroll_year: $("#ddl_year").val(),
                    par_department_code: $("#ddl_department").val(),
                    par_history: history

                }).then(function (d) {
                    if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
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

        else
        {
            s.oTable.fnClearTable();
            $("#loading_data").modal("hide")
        }
       
    }

    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectLetter = function (par_empType, par_year, par_letter) {
        $("#loading_data").modal("show")
        h.post("../cJOTaxRate/SelectLetter",
            {
                par_empType: par_empType,
                par_year: par_year,
                par_letter: par_letter

            }).then(function (d) {
                if (d.data.sp_annualtax_hdr_tbl_list.length > 0) {

                    s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable.fnClearTable();
                }


                $("#loading_data").modal("hide")

            })

    }


    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectedDepartment_Change = function (ddl_department) {
        $("#loading_data").modal("show")
        if ($("#ddl_year").val() != "" && ddl_department.toString() != "")
        {
            s.btnAddShow = true;
        }

        else
        {
            s.btnAddShow = false;
        }

        $("#loading_data").modal("show")


        var history = "N"
        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }

        if (s.isAction == "ADD") {
            effective_date = $("#txtb_effective_date").val()
        }


        if ($("#ddl_year").val() != "" && $("#ddl_department").val() != "")
        {
            h.post("../cJOTaxRate/RetrieveDataListGrid",
                {
                    pay_payroll_year: $("#ddl_year").val(),
                    par_department_code: $("#ddl_department").val(),
                    par_history: history

                }).then(function (d)
                {
                    if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0)
                    {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                    }
                    else {
                        s.oTable.fnClearTable();
                    }

                    $("#loading_data").modal("hide")

                })
        }

        else
        {
            s.oTable.fnClearTable();
            $("#loading_data").modal("hide")
        }

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

    




    function clearentry()
    {
        $("#ddl_fixed_rate").val("")
        $("#ddl_with_sworn").val("")
        $("#ddl_bir_class").val("")
        $("#ddl_deduction_status").val("")
        $("#ddl_status").val("")
        $("#txtb_effective_date").val("")
        $("#txtb_effective_date_hid").val("")
        $("#txtb_expt_amt").val("0.00")
        s.txtb_expt_amt = "0.00"
        $("#txtb_gross_pay").val("0.00")
        s.txtb_gross_pay = "0.00"
        s.txtb_position = ""
        s.txtb_empl_id  = ""
        s.isDisabledBIRClass    = false
        s.isDisabledBIRClass    = false
        $("#ddl_w_held").val("0")
        $("#ddl_b_tax").val("0")
        $("#ddl_vat").val("0")
        s.ddl_w_held = "0"
        s.ddl_b_tax = "0"
        s.ddl_vat = "0"
        s.isDisabledWHeld       = false
        s.isDisabledBTax        = false
        s.isDisabledVat         = false
        s.isDisabledExmpt       = false
        s.txtb_empl_name        = ""
        FieldValidationColorChanged(false, "ALL");
    }


    s.btn_generate_action = function (id_ss) {
        index_update = ""
        index_update = id_ss

        swal({
            title: "Are you sure to Update this record?",
            text: "Once generated, data will be updated automatically!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {

                var history = "N"

                if (s.chckbx_history == true) {
                    var history = "Y"
                }

                else
                {
                    var history = "N"
                }

                h.post("../cJOTaxRate/GenerateByEmployee", {
                     par_empl_id: s.datalistgrid[id_ss].empl_id
                    ,par_payroll_year: $("#ddl_year").val()
                    ,par_department_code: $("#ddl_department").val()
                    ,par_history: history
                }).then(function (d) {

                    if (d.data.message == "success")
                    {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list

                        if (s.datalistgrid.length > 0)
                        {
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        else
                        {
                            s.oTable.fnClearTable();
                        }
                        
                        s.oTable.fnSort([[sort_value, sort_order]]);

                        swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                    }

                })

            }
        })
    }

   

    s.btn_show_action = function (id_ss) {
        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        var url = "";

        var history = "N"
        if (s.chckbx_history == true)
        {
            var history = "Y"
        }

        else {
            var history = "N"
        }

        h.post("../cJOTaxRate/PreviousValuesonPage_cJOTaxRate",
            {

                 par_year           : $("#ddl_year option:selected").val()
                ,par_empl_id        : s.datalistgrid[id_ss].empl_id
                ,par_empl_name      : s.datalistgrid[id_ss].employee_name
                ,par_department     : $("#ddl_department option:selected").html()
                ,par_show_entries   : $("#ddl_show_entries option:selected").val()
                ,par_page_nbr       : info.page
                ,par_search         : s.search_box
                ,par_sort_value     : sort_value
                ,par_sort_order     : sort_order
                ,par_position       : s.datalistgrid[id_ss].position_title1
                ,par_effective_date : s.datalistgrid[id_ss].effective_date
                ,par_department_code: $("#ddl_department").val()
                ,par_history        : history
            }).then(function (d) {

                url = "/cJOTaxRateDetails";
                window.location.replace(url);
            })

    }

    s.SelectEmployeeName = function (data)
    {
        s.txtb_empl_id  = data.empl_id
        s.txtb_position = data.position_title1
        s.ddl_bir_class = data.bir_class
        s.txtb_gross_pay = currency(data.total_gross_pay)
        s.currentBIRClass = data.bir_class
        if (data.empl_id != "")
        {
            $("#ddl_employee_name").removeClass("required");
            $("#lbl_ddl_employee_name_req").text("");

            if ($("#ddl_bir_class") != "")
            {
                $("#ddl_bir_class").removeClass("required");
                $("#lbl_ddl_bir_class_req").text("");
            }
        }
       
    }

    s.SelectFixedRate = function (value)
    {
       
        if (value.toString().toUpperCase() == "TRUE")
        {
            s.isDisabledBIRClass = false
            s.isDisabledWHeld    = false
            s.isDisabledBTax     = false
            s.isDisabledVat      = false
        }

        else if (value.toString().toUpperCase() == "FALSE")
        {
            

            var getTaxRate = ""
           
            if (s.txtb_empl_id != "" || s.txtb_empl_id == null)
            {
               
               
                h.post("../cJOTaxRate/GetTaxRate",
                {

                    par_payroll_year: $("#ddl_year option:selected").val()
                    ,par_empl_id    : s.txtb_empl_id
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        
                        getTaxRate = d.data.bir_class.toString()

                        $("#ddl_bir_class").val(getTaxRate.toString())


                        //DIRI ANG LAST PAGKUHA SA JOB ORDER TAX RATE
                        if (getTaxRate != "")
                        {
                            $("#ddl_bir_class").val(getTaxRate.toString())
                           
                        }

                        else
                        {
                            $("#ddl_bir_class").val(s.currentBIRClass.toString())

                        }

                        var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")

                        if ($("#ddl_with_sworn").val().toString() != "") {
                            if (selected != null || selected != undefined || selected != "") {

                                if ($("#ddl_with_sworn").val().toString().toUpperCase() == "TRUE") {
                                    s.ddl_w_held = selected.wi_sworn_perc.toString()
                                    $("#ddl_w_held").val(selected.wi_sworn_perc.toString())
                                    $("#ddl_b_tax").val(selected.tax_perc.toString())
                                    s.ddl_b_tax = selected.tax_perc.toString()
                                    $("#ddl_vat").val(selected.vat_perc.toString())
                                    s.ddl_vat = selected.vat_perc.toString()
                                }

                                else {

                                    //s.txtb_business_tax = selected.wo_sworn_perc.toString();
                                    //s.txtb_wheld_tax    = selected.tax_perc.toString();
                                    console.log(selected)

                                    $("#ddl_w_held").val(selected.wo_sworn_perc.toString())
                                    s.ddl_w_held = selected.wo_sworn_perc.toString()

                                    $("#ddl_b_tax").val(selected.tax_perc.toString())
                                    s.ddl_b_tax = selected.tax_perc.toString()
                                    $("#ddl_vat").val(selected.vat_perc.toString())
                                    s.ddl_vat = selected.vat_perc.toString()

                                }

                            }

                            else {
                                //s.txtb_business_tax = "0";
                                //s.txtb_wheld_tax = "0";
                                $("#ddl_w_held").val("0")
                                s.ddl_w_held = "0"
                                $("#ddl_b_tax").val("0")
                                s.ddl_b_tax = "0"
                                $("#ddl_vat").val("0")
                                s.ddl_vat = "0"
                            }
                        }

                        else {
                            //s.txtb_business_tax = "0";
                            //s.txtb_wheld_tax = "0";
                            $("#ddl_w_held").val("0")
                            s.ddl_w_held = "0"
                            $("#ddl_b_tax").val("0")
                            s.ddl_b_tax = "0"
                            $("#ddl_vat").val("0")
                            s.ddl_vat = "0"
                        }
                    
                    }


                    
                    })
               
            }
            
            
            s.isDisabledBIRClass    = true
            s.isDisabledWHeld       = true
            s.isDisabledBTax        = true
            s.isDisabledVat         = true
        }

        else
        {
            if (value != "")
            {
                $("#ddl_bir_class").val(s.currentBIRClass.toString())
                //$("#ddl_fixed_rate").removeClass("required");
                //$("#lbl_ddl_fixed_rate_req").text("");
            }
            s.isDisabledBIRClass    = true
            s.isDisabledBIRClass    = true
            s.isDisabledWHeld       = true
            s.isDisabledBTax        = true
            s.isDisabledVat         = true
        }
        
        if ($("#ddl_bir_class").val() == "")
        {
            s.isDisabledBIRClass = false
            s.isDisabledBIRClass = false
            s.isDisabledWHeld    = false
            s.isDisabledBTax     = false
            s.isDisabledVat      = false
        }

        if (value != "")
        {
          
            $("#ddl_fixed_rate").removeClass("required");
            $("#lbl_ddl_fixed_rate_req").text("");
        }
       
    }


    Array.prototype.select = function (code, prop)
    {
        var value = this.filter(function (d) {
            return d[prop] == code
        })[0]

        if (value == null || value == undefined)
        {
            value = ""
        }
          
        return value

    }
    

    s.SelectWithSworn = function (value)
    {
        try {

            var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")


            if (value.toString() != "") {
                if (selected != null || selected != undefined) {
                    if (value.toString().toUpperCase() == "TRUE") {
                        //s.txtb_business_tax    = selected.wi_sworn_perc.toString();
                        //s.txtb_wheld_tax       = selected.tax_perc.toString();
                        $("#ddl_w_held").val(selected.wi_sworn_perc.toString())
                        s.ddl_w_held = selected.wi_sworn_perc.toString()
                        $("#ddl_b_tax").val(selected.tax_perc.toString())
                        s.ddl_b_tax = selected.tax_perc.toString()
                        $("#ddl_vat").val(selected.vat_perc.toString())
                        s.ddl_vat = selected.vat_perc.toString()
                    }

                    else {
                        //s.txtb_business_tax     = selected.wo_sworn_perc.toString();
                        //s.txtb_wheld_tax        = selected.tax_perc.toString();
                        $("#ddl_w_held").val(selected.wo_sworn_perc.toString())
                        s.ddl_w_held = selected.wo_sworn_perc.toString()
                        $("#ddl_b_tax").val(selected.tax_perc.toString())
                        s.ddl_b_tax = selected.tax_perc.toString()
                        $("#ddl_vat").val(selected.vat_perc.toString())
                        s.ddl_vat = selected.vat_perc.toString()
                    }

                }

                else {
                    //s.txtb_business_tax = "0";
                    //s.txtb_wheld_tax    = "0";
                    $("#ddl_w_held").val("0")
                    s.ddl_w_held = "0"
                    $("#ddl_b_tax").val("0")
                    s.ddl_b_tax = "0"
                    $("#ddl_vat").val("0")
                    s.ddl_vat = "0"
                }
            }

            else {
                //s.txtb_business_tax = "0";
                //s.txtb_wheld_tax    = "0";
                $("#ddl_w_held").val("0")
                s.ddl_w_held = "0"
                $("#ddl_b_tax").val("0")
                s.ddl_b_tax = "0"
                $("#ddl_vat").val("0")
                s.ddl_vat = "0"
            }

            if (value != "") {

                $("#ddl_with_sworn").removeClass("required");
                $("#lbl_ddl_with_sworn_req").text("");
            }
        }

        catch (e)
        {
            if (value != "")
            {

                $("#ddl_with_sworn").removeClass("required");
                $("#lbl_ddl_with_sworn_req").text("");
            }
        }
        
        
    }

    s.SelectBirClass = function (value)
    {
        var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")

        if ($("#ddl_with_sworn").val().toString() != "")
        {
            if (selected != null || selected != undefined)
            {
                if ($("#ddl_with_sworn").val().toString().toUpperCase() == "TRUE")
                {
                    //s.txtb_business_tax = selected.wi_sworn_perc.toString();
                    //s.txtb_wheld_tax = selected.tax_perc.toString();
                    $("#ddl_w_held").val(selected.wi_sworn_perc.toString())
                    s.ddl_w_held = selected.wi_sworn_perc.toString()
                    $("#ddl_b_tax").val(selected.tax_perc.toString())
                    s.ddl_b_tax = selected.tax_perc.toString()
                    $("#ddl_vat").val(selected.vat_perc.toString())
                    s.ddl_vat = selected.vat_perc.toString()
                }

                else
                {
                    //s.txtb_business_tax = selected.wo_sworn_perc.toString();
                    //s.txtb_wheld_tax = selected.tax_perc.toString();
                    $("#ddl_w_held").val(selected.wo_sworn_perc.toString())
                    s.ddl_w_held = selected.wo_sworn_perc.toString()
                    $("#ddl_b_tax").val(selected.tax_perc.toString())
                    s.ddl_b_tax = selected.tax_perc.toString()
                    $("#ddl_vat").val(selected.vat_perc.toString())
                    s.ddl_vat = selected.vat_perc.toString()
                }

            }

            else
            {
                //s.txtb_business_tax = "0";
                //s.txtb_wheld_tax = "0";
                $("#ddl_w_held").val("0")
                s.ddl_w_held = "0"
                $("#ddl_b_tax").val("0")
                s.ddl_b_tax = "0"
                $("#ddl_vat").val("0")
                s.ddl_vat = "0"
            }
        }

        else
        {
            //s.txtb_business_tax = "0";
            //s.txtb_wheld_tax = "0";
            $("#ddl_w_held").val("0")
            s.ddl_w_held = "0"
            $("#ddl_b_tax").val("0")
            s.ddl_b_tax = "0"
            $("#ddl_vat").val("0")
            s.ddl_vat = "0"
        }
        //alert(value)
        if (value != "")
        {
            $("#ddl_bir_class").removeClass("required");
            $("#lbl_ddl_bir_class_req").text("");
        }
       
    }


    function getFromValue() {



        var data =
        {

            empl_id                                 : s.txtb_empl_id
            ,employee_name                          : $("#ddl_employee_name option:selected").html()
            ,employment_type                        : "JO"
            ,position_title1                        : s.txtb_position
            ,effective_date                         : s.isAction == "ADD" ? $("#txtb_effective_date").val() : $("#txtb_effective_date_hid").val()
            ,bir_class                              : $("#ddl_bir_class").val()
            ,bir_class_descr                        : $("#ddl_bir_class option:selected").html()
            ,with_sworn                             : $("#ddl_with_sworn").val()
            ,fixed_rate                             : $("#ddl_fixed_rate").val()
            ,with_sworn_descr                       : $("#ddl_with_sworn option:selected").html()
            ,fixed_rate_descr                       : $("#ddl_fixed_rate option:selected").html()
            ,wi_sworn_perc                          : $("#ddl_b_tax").val()
            ,wo_sworn_perc                          : $("#ddl_b_tax").val()
            ,tax_perc                               : $("#ddl_w_held").val()
            ,total_gross_pay                        : toDecimalFormat(s.txtb_gross_pay)
            ,dedct_status                           : $("#ddl_deduction_status").val()
            ,rcrd_status                            : $("#ddl_status").val()
            ,rcrd_status_descr                      : $("#ddl_status option:selected").html()
            ,w_tax_perc                             : $("#ddl_w_held").val()
            ,bus_tax_perc                           : $("#ddl_b_tax").val()
            ,vat_perc                               : $("#ddl_vat").val()
            ,exmpt_amt                              : toDecimalFormat($("#txtb_expt_amt").val())
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

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        s.datalistgrid[index_update].bir_class          = $("#ddl_bir_class").val()
        s.datalistgrid[index_update].bir_class_descr    = $("#ddl_bir_class option:selected").html()
        s.datalistgrid[index_update].with_sworn         = $("#ddl_with_sworn").val()
        s.datalistgrid[index_update].fixed_rate         = $("#ddl_fixed_rate").val()
        s.datalistgrid[index_update].with_sworn_descr   = $("#ddl_with_sworn option:selected").html()
        s.datalistgrid[index_update].fixed_rate_descr   = $("#ddl_fixed_rate option:selected").html()
        s.datalistgrid[index_update].wi_sworn_perc      = $("#ddl_b_tax").val()
        s.datalistgrid[index_update].wo_sworn_perc      = $("#ddl_b_tax").val()
        s.datalistgrid[index_update].tax_perc           = $("#ddl_w_held").val()
        s.datalistgrid[index_update].rcrd_status        = $("#ddl_status").val()
        s.datalistgrid[index_update].rcrd_status_descr  = $("#ddl_status option:selected").html()
        s.datalistgrid[index_update].dedct_status       = $("#ddl_deduction_status").val()

        s.datalistgrid[index_update].w_tax_perc         = $("#ddl_w_held").val()
        s.datalistgrid[index_update].bus_tax_perc       = $("#ddl_b_tax").val()
        s.datalistgrid[index_update].vat_perc           = $("#ddl_vat").val()
        s.datalistgrid[index_update].exmpt_amt          = toDecimalFormat($("#txtb_expt_amt").val())

        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
        page_value = info.page

        s.oTable.fnSort([[sort_value, sort_order]]);

        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++)
        {
            if (get_page(s.datalistgrid[index_update].empl_id) == false) {
                s.oTable.fnPageChange(x);
            }
            else {
                break;
            }
        }


    }


    s.btn_save = function () {

       
        $("#btn_save").removeClass("fa fa-save");
        $("#btn_save").addClass("fa fa-spinner fa-spin");
        if (isdataValidated())
        {
            
            var dt = getFromValue()

            var history = "N"
            var effective_date = ""
            if (s.chckbx_history == true) {
                var history = "Y"
            }

            else
            {
                var history = "N"
            }

            if (s.isAction == "ADD")
            {
                effective_date = $("#txtb_effective_date").val()
            }

            else if (s.isAction == "EDIT")
            {
                effective_date = $("#txtb_effective_date_hid").val()
            }
            h.post("../cJOTaxRate/CheckData",
                {
                 par_payroll_year        : $("#ddl_year option:selected").val()
                ,par_department_code    : $("#ddl_department option:selected").val()
                ,par_history            : history
                ,par_action             : s.isAction
                ,par_empl_id            : s.txtb_empl_id
                ,par_effective_date     : effective_date
            }).then(function (d) {

                if (d.data.message == "success") {
                    console.log(dt)
                    h.post("../cJOTaxRate/SaveEDITInDatabase",
                        {
                            data: dt
                            ,par_effective_date: effective_date
                            ,par_empl_id: s.txtb_empl_id
                            ,par_action: s.isAction
                        }).then(function (d) {
                            if (d.data.message = "success") {


                                if (s.isAction == "ADD")
                                {



                                    $("#main_modal").modal("hide")
                                    s.datalistgrid.push(dt)
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid)

                                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                        if (get_page(s.txtb_empl_id) == false)
                                        {
                                            s.oTable.fnPageChange(x);
                                        }
                                        else
                                        {
                                            break;
                                        }
                                    }

                                    var history = "N"

                                    if (s.chckbx_history == true) {
                                        var history = "Y"
                                    }

                                    else {
                                        var history = "N"
                                    }

                                    h.post("../cJOTaxRate/GenerateByEmployee", {
                                        par_empl_id             : s.txtb_empl_id
                                        ,par_payroll_year       : $("#ddl_year").val()
                                        ,par_department_code    : $("#ddl_department").val()
                                        ,par_history            : history
                                    }).then(function (d) {

                                        if (d.data.message == "success")
                                        {

                                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                            $("#btn_save").addClass("fa fa-save");

                                            swal("Successfully Added!", "New record has been successfully added!", "success");
                                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                            $("#btn_save").addClass("fa fa-save");
                                            $("#main_modal").modal("hide")

                                           
                                        }

                                    })

                                    
                                }

                                else if (s.isAction == "EDIT")
                                {
                                    $("#main_modal").modal("hide")
                                    updateListGrid()

                                    swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                                    $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                    $("#btn_save").addClass("fa fa-save");
                                }
                               
                            }

                            else
                            {
                                swal("Saving Error!", "Data not save.", "error");
                                $("#main_modal").modal("hide")
                                $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                $("#btn_save").addClass("fa fa-save");
                            }



                        })

                }

                else {
                    swal("Unable to Add, Data has been Added by other user/s!", { icon: "warning", });


                    //if (d.data.sp_annualtax_hdr_tbl_list != null) {
                    //    s.datalistgrid.push(d.data.sp_annualtax_hdr_tbl_list)
                    //    s.oTable.fnClearTable();
                    //    s.oTable.fnAddData(s.datalistgrid)

                    //}

                    //else {
                    //    s.oTable.fnClearTable();
                    //    s.oTable.fnAddData(s.datalistgrid)
                    //}

                    $("#main_modal").modal("hide")


                }

            })

        }



    }

    s.btn_edit_action = function (id_ss) {

        s.isShowNameSelect = false;
        s.isShowNameInput = true;
        s.isShowEffectiveDate_hid = true
        s.isShowEffectiveDate = false
        $("#ddl_status").val("N")
        s.ishowsave = true;
        index_update = id_ss
        clearentry()
        s.isAction = "EDIT"
        s.ModalTitle = "Edit This Record"

        var history = "N"

        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else
        {
            var history = "N"
        }
        
        h.post("../cJOTaxRate/CheckData", {
            par_payroll_year            : $("#ddl_year option:selected").val()
            ,par_department_code        : $("#ddl_department option:selected").val()
            ,par_history                : history
            ,par_action                 : s.isAction
            ,par_empl_id                : s.datalistgrid[id_ss].empl_id
            ,par_effective_date         : s.datalistgrid[id_ss].effective_date
        }).then(function (d) {

            if (d.data.message == "success")
            {

                $("#main_modal").modal("show")
                s.txtb_employment_type_val = s.datalistgrid[id_ss].employment_type
                s.txtb_empl_name           = s.datalistgrid[id_ss].employee_name
                s.txtb_empl_id             = s.datalistgrid[id_ss].empl_id
                s.txtb_position            = s.datalistgrid[id_ss].position_title1
                $("#txtb_effective_date_hid").val(s.datalistgrid[id_ss].effective_date)
                $("#ddl_bir_class").val(s.datalistgrid[id_ss].bir_class)
                $("#ddl_fixed_rate").val(s.datalistgrid[id_ss].fixed_rate.toString())
                $("#ddl_with_sworn").val(s.datalistgrid[id_ss].with_sworn.toString())
                $("#ddl_deduction_status").val(s.datalistgrid[id_ss].dedct_status.toString())
                $("#ddl_status").val(s.datalistgrid[id_ss].rcrd_status.toString())
                
                $("#ddl_w_held").val(s.datalistgrid[id_ss].w_tax_perc.toString())
                $("#ddl_b_tax").val(s.datalistgrid[id_ss].bus_tax_perc.toString())
                $("#ddl_vat").val(s.datalistgrid[id_ss].vat_perc.toString())
                s.txtb_expt_amt = currency(toDecimalFormat(s.datalistgrid[id_ss].exmpt_amt.toString()))
              
                s.currentBIRClass = s.datalistgrid[id_ss].bir_class


                if ($("#ddl_fixed_rate").val().toUpperCase() == "TRUE" || $("#ddl_fixed_rate").val().toUpperCase() == "1")
                {
                    s.isDisabledBIRClass = false;
                }

                else
                {
                    s.isDisabledBIRClass = true;
                }


                s.txtb_gross_pay = currency(s.datalistgrid[id_ss].total_gross_pay)

            }

            else {
                swal("Unable to Update, Data has been deleted by other user/s!", { icon: "warning", });
                var tname = "oTable";

                var id = s[tname][0].id;
                ////var page = $("#" + id).DataTable().page.info().page

                s[tname].fnDeleteRow(index_update, null, true);
                s.datalistgrid = DataTable_data(tname)


                if (d.data.sp_payrollemployee_tax_hdr_tbl_list != null)
                {
                    s.datalistgrid.push(d.data.sp_payrollemployee_tax_hdr_tbl_list)
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)

                }

                else
                {
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }

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
                
                        h.post("../cJOTaxRate/DeleteFromDatabase", {
                            par_empl_id     : s.datalistgrid[id_ss].empl_id
                            ,effective_date : s.datalistgrid[id_ss].effective_date
                        }).then(function (d) {

                            if (d.data.message = "success") {
                                var id = s[tname][0].id;
                                var page = $("#" + id).DataTable().page.info().page
                                s[tname].fnDeleteRow(id_ss, null, true);
                                s.datalistgrid = DataTable_data(tname)

                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid)
                                //s.oTable.refreshTable("oTable", "")
                                changePage(tname, page, id)

                                swal("Your record has been deleted successfully!", { icon: "success", });
                            }

                            else
                            {
                                swal("Unable to Delete, Data has been deleted by other user/s!", { icon: "warning", });


                                var id = s[tname][0].id;
                                ////var page = $("#" + id).DataTable().page.info().page

                                s[tname].fnDeleteRow(id_ss, null, true);
                                s.datalistgrid = DataTable_data(tname)


                                if (d.data.sp_annualtax_hdr_tbl_list != null) {
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid)

                                }

                                else {
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid)
                                }

                                $("#main_modal").modal("hide")
                            }


                        })
                    }



            })
    }


    
    

   
  

    s.chckbx_history_Change = function (chckbx_history)
    {
        s.chckbx_history = chckbx_history

        var history = "N"
        if (s.chckbx_history == true)
        {
            var history = "Y"
        }

        else
        {
            var history = "N"
        }
        

        if ($("#ddl_year").val() != "" && $("#ddl_department").val() != "") {
            h.post("../cJOTaxRate/RetrieveDataListGrid",
                {
                    pay_payroll_year: $("#ddl_year").val(),
                    par_department_code: $("#ddl_department").val(),
                    par_history: history

                }).then(function (d) {
                    if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                    }
                    else {
                        s.oTable.fnClearTable();
                    }

                    $("#loading_data").modal("hide")

                })
        }

        else
        {
            s.oTable.fnClearTable();
        }

    }

    s.btn_add_action = function ()
    {
        clearentry()
        s.isShowNameSelect = true;
        s.isShowNameInput = false;
        s.ishowsave = true;
        $("#ddl_status").val("N")
        s.isShowEffectiveDate_hid = false
        s.isShowEffectiveDate = true

        s.ModalTitle = "Add New Record"
        //$("#loading_data").modal("show")
        $("#btn_add").removeClass("fa fa-plus-circle");
        $("#btn_add").addClass("fa fa-spinner fa-spin");

        s.isAction = "ADD"
        //var history = "";

        //if (s.chckbx_history == true)
        //{
        //    history = "Y"
        //}

        //else
        //{
        //    history = "N"
        //}



        h.post("../cJOTaxRate/RetrieveEmployeeList",
            {
                par_payroll_year: $("#ddl_year option:selected").val(),
                par_department_code: $("#ddl_department option:selected").val()
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    if (d.data.sp_personnelnames_combolist_tax_jo.length > 0)
                    {
                        
                        s.employeenames = d.data.sp_personnelnames_combolist_tax_jo

                        console.log(s.employeenames)

                    }

                    else
                    {
                        s.employeenames = null;
                    } 
                    //$("#loading_data").modal("hide")
                    $("#main_modal").modal("show")
                    $("#btn_add").removeClass("fa fa-spinner fa-spin");
                    $("#btn_add").addClass("fa fa-plus-circle");

                   //DIRI ANG LAST WALA KA ADD SA DATEPICKER SA MODAL
                   

                }
             

            })
        

    }

    //**************************************//
    //***Get Page Number****//
    //**************************************//
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

    //**************************************//
    //***Data Validated****//
    //**************************************//
    function isdataValidated() {
        FieldValidationColorChanged(false, "ALL");

        var validatedSaved = true

        if ($("#ddl_employee_name").val() == ""  && s.isAction == "ADD")
        {
            FieldValidationColorChanged(true, "ddl_employee_name")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
            
        }

        if ($("#txtb_effective_date").val() == "" && s.isAction == "ADD")
        {
            FieldValidationColorChanged(true, "txtb_effective_date")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_bir_class").val() == "")
        {
            FieldValidationColorChanged(true, "ddl_bir_class")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_fixed_rate").val() == "") {
            FieldValidationColorChanged(true, "ddl_fixed_rate")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_with_sworn").val() == "") {
            FieldValidationColorChanged(true, "ddl_with_sworn")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_deduction_status").val() == "") {

            FieldValidationColorChanged(true, "ddl_deduction_status")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }
        //alert($("#ddl_status").val())
        //if ($("#ddl_status").val() == "") {
        //    alert("AWW7")
        //    FieldValidationColorChanged(true, "ddl_status")
        //    validatedSaved = false;
        //    $("#btn_save").removeClass("fa fa-spinner fa-spin");
        //    $("#btn_save").addClass("fa fa-save");
        //}

        if (isNaN(validatenumber($("#txtb_expt_amt").val())))
        {

            FieldValidationColorChanged(true, "txtb_expt_amt")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        return validatedSaved;

    }

    function validatenumber(value)
    {
        var value = value.split(",").join("")
        return value
    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(par_v_result,par_object_id) {

        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            if (par_object_id == "txtb_expt_amt")
            {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Numeric Values Only!");
            }

            else
            {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }
           
        }
        

        else {
            //remove of refresh the object form being required

            $("#ddl_employee_name").removeClass("required");
            $("#lbl_ddl_employee_name_req").text("");
            
            $("#txtb_effective_date").removeClass("required");
            $("#lbl_txtb_effective_date_req").text("");

            $("#ddl_bir_class").removeClass("required");
            $("#lbl_ddl_bir_class_req").text("");

            $("#ddl_fixed_rate").removeClass("required");
            $("#lbl_ddl_fixed_rate_req").text("");

            $("#ddl_with_sworn").removeClass("required");
            $("#lbl_ddl_with_sworn_req").text("");

            $("#ddl_deduction_status").removeClass("required");
            $("#lbl_ddl_deduction_status_req").text("");

            $("#ddl_status").removeClass("required");
            $("#lbl_ddl_status_req").text("");

            $("#txtb_expt_amt").removeClass("required");
            $("#lbl_txtb_expt_amt_req").text("");
        }
    }




    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_print_action = function (id_ss) {

        index_update = id_ss
        s.ModalTitle = "Report Options"
        //$("#modal_print").modal("show")

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = "~/Reports/cryBIR2316/cryBIR2316.rpt"
        var sp = "sp_annualtax_hdr_tbl_rep"
        var parameters = "p_payroll_year," + $("#ddl_year option:selected").val() + ",p_empl_id," + s.datalistgrid[id_ss].empl_id

        h.post("../cJOTaxRate/PreviousValuesonPage_cBIRAnnualizedTax",
            {
                par_year: $("#ddl_year option:selected").val()
                , par_tax_due: s.datalistgrid[id_ss].monthly_tax_due
                , par_tax_rate: s.datalistgrid[id_ss].tax_rate
                , par_empl_id: s.datalistgrid[id_ss].empl_id
                , par_emp_type: $("#ddl_employment_type option:selected").val()
                , par_emp_type_descr: s.datalistgrid[id_ss].employmenttype_description
                , par_letter: $("#ddl_letter option:selected").val()
                , par_show_entries: $("#ddl_show_entries option:selected").val()
                , par_page_nbr: info.page
                , par_search: s.search_box
                , par_sort_value: sort_value
                , par_sort_order: sort_order
                , par_position: s.datalistgrid[id_ss].position_title1
            }).then(function (d) {

                h.post("../cJOTaxRate/ReportCount",
                    {
                        par_payroll_year: $("#ddl_year option:selected").val(),
                        par_empl_id: s.datalistgrid[id_ss].empl_id
                    }).then(function (d) {

                        if (d.data.reportcount.length > 0) {

                            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                                + "&SaveName=" + SaveName
                                + "&ReportType=" + ReportType
                                + "&ReportPath=" + ReportPath
                                + "&Sp=" + sp + "," + parameters
                        }

                        else {
                            swal({
                                title: "Not Data Found!",
                                text: "No Data for Printing!",
                                icon: "warning",
                                buttons: true,
                                dangerMode: true,
                            })
                        }
                    });


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


    s.RemoveClass = function (value, field)
    {
        if (value != "") {
            $("#" + field).removeClass("required");
            $("#lbl_" + field + "_req").text("");
        }
    }

    //***************************Functions end*********************************************************//

})

function RemoveEffective() {
    
    $("#txtb_effective_date").removeClass("required");
    $("#lbl_txtb_effective_date_req").text("");
    
}

