﻿//**********************************************************************************
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




ng_HRD_App.controller("cPHICShareTaxRate_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    s.year = []
    var index_update = "";

    s.tablereference = "datalist_grid";

    s.allow_edit = false
    s.allow_print = false
    s.allow_delete = false
    s.allow_view = false
    s.allow_edit_history = false
    s.selected_payroll_year = ""

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
    s.currentOptionValue = ""

    s.currentBIRClass = ""
    s.isDisabledBIRClass = false

    s.isDisabledWHeld = false
    s.isDisabledBTax = false
    s.isDisabledVat = false
    s.isDisabledExmpt = false

    var currentBIRClass = "";

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;

        s.oTable1 = $('#datalist_grid').dataTable(
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
                        "mData": "rcrd_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center>'
                                + '<div class="btn-group tooltip-demo" ng-hide="' + NotAddedInSelectedYear(full["tax_year"]) + '">'
                                + '<button type="button" class="btn btn-warning btn-sm action" style="background-color:blueviolet;color:white;border:1px solid blueviolet;" data-toggle="tooltip" data-placement="left" title="Generate Tax" ng-show="' + s.allow_edit + '" ng-click="btn_generate_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-clipboard"></i>' + '</button>'
                                + '<button type="button" class="btn btn-success btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-click="btn_show_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-plus"></i>' + '</button>'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>' + '</button>'

                                + '</div>'

                                + '<div ng-show="' + NotAddedInSelectedYear(full["tax_year"]) + '">'
                                + '<button type="button" class="btn btn-warning" data-toggle="tooltip" data-placement="left" title="Show Details" ng-show="' + s.allow_view + '" ng-click="btn_add_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-plus"></i> Add Tax Details'
                                + '</button>'
                                + '</div>'

                                + '</center> '

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTable1.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }



    var init_table_data_rc = function (par_data) {
        s.datalistgrid_rc = par_data;

        s.oTable2 = $('#datalist_grid_rc').dataTable(
            {

                data: s.datalistgrid_rc,
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
                        "mData": "employment_type", "mRender": function (data, type, full, row) {
                            var employment_type_descr = "";
                            if (data == "RE") {
                                employment_type_descr = "Regular"
                            }
                            else {
                                employment_type_descr = "Casual"
                            }
                            return "<div class='btn-block text-left text-center'>" + employment_type_descr + "</div>";
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
                        "mData": "rcrd_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center>'
                                + '<div class="btn-group tooltip-demo" ng-hide="' + NotAddedInSelectedYear(full["tax_year"]) + '">'
                                + '<button type="button" class="btn btn-warning btn-sm action" style="background-color:blueviolet;color:white;border:1px solid blueviolet;" data-toggle="tooltip" data-placement="left" title="Generate Tax" ng-show="' + s.allow_edit + '" ng-click="btn_generate_action_2(' + row["row"] + ')" > '
                                + '<i class="fa fa-clipboard"></i>' + '</button>'
                                + '<button type="button" class="btn btn-success btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-click="btn_show_action_2(' + row["row"] + ')" > '
                                + '<i class="fa fa-plus"></i>' + '</button>'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action_2(' + full["empl_id"] + ')" > '
                                + '<i class="fa fa-edit"></i>' + '</button>'

                                + '</div>'

                                + '<div ng-show="' + NotAddedInSelectedYear(full["tax_year"]) + '">'
                                + '<button type="button" class="btn btn-warning" data-toggle="tooltip" data-placement="left" title="Show Details" ng-show="' + s.allow_view + '" ng-click="btn_add_action_2(' + full["empl_id"] + ')" > '
                                + '<i class="fa fa-plus"></i> Add Tax Details'
                                + '</button>'
                                + '</div>'

                                + '</center> '

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTable2.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    init_table_data([]);
    init_table_data_rc([]);
   
 

    function init() {

        $("#loading_data").modal("show")
        RetrieveYear()
        h.post("../cPHICShareTaxRate/InitializeData", { par_payroll_year: new Date().getFullYear().toString() }).then(function (d) {

            s.employeeddl = d.data.empType
            s.ddl_employment_type = d.data.ddl_emp_type

            s.ddl_year = d.data.ddl_year == "" || d.data.ddl_year == null ? s.ddl_year = new Date().getFullYear().toString() : d.data.ddl_year
            s.ddl_department = d.data.department_code == "" || d.data.department_code == null ? s.ddl_department = "" : d.data.department_code

           

            $("#ddl_status").val("N")

            $("#ddl_w_held").val("0")
            $("#ddl_b_tax").val("0")
            $("#ddl_vat").val("0")
            s.ddl_w_held = "0"
            s.ddl_b_tax = "0"
            s.ddl_vat = "0"


            if ($("#ddl_department").val() != "") {
                s.btnAddShow = true
            }

            else {
                s.btnAddShow = false
            }

            if (s.ddl_department != "") {
                s.btnAddShow = true
            }

            s.w_held_data = d.data.taxrate_percentage_tbl_list
            s.w_held_data_2 = d.data.taxrate_percentage_tbl_list

            s.ddl_w_held = ""
            $("#ddl_w_held").val("")
            s.ddl_b_tax = ""
            $("#ddl_b_tax").val("")
            s.ddl_vat = ""
            $("#ddl_vat").val("")

            if (d.data.history != "" || d.data.history != null || d.data.history == undefined) {
                if (d.data.history == "N") {
                    s.chckbx_history = false
                }

                else if (d.data.history == "Y") {
                    s.chckbx_history = true
                }

            }


            

            s.allow_edit = d.data.um.allow_edit
            s.allow_print = d.data.um.allow_print
            s.allow_delete = d.data.um.allow_delete
            s.allow_print = d.data.um.allow_print
            s.allow_edit_history = d.data.um.allow_edit_history
            s.allow_view = 1

            s.department_data = d.data.department_list
            s.bir_class_data = d.data.bir_class_list

            $("#datalist_grid").DataTable().search("").draw();
            
            
            if (d.data.tabindex == "1") {

                s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list.refreshTable("datalist_grid", d.data.empl_id);
                $('.nav-tabs a[href="#tab-1"]').tab('show');

            }
            else if (d.data.tabindex == "2"){
               
                s.datalistgrid_rc = d.data.sp_payrollemployee_tax_hdr_tbl_list.refreshTable("datalist_grid_rc", d.data.empl_id);
                s.employeenames_2 = d.data.sp_payrollemployee_tax_hdr_tbl_list;

                $('.nav-tabs a[href="#tab-2"]').tab('show');
            }

            if (d.data.ddl_year != undefined) {
                d.data.ddl_year.populateFormField("header_form", "year")
            }
            $("#ddl_employment_type").val(d.data.employment_type)





            sort_value = d.data.sort_value
            page_value = d.data.page_value
            sort_order = d.data.sort_order
            s.rowLen = d.data.show_entries
            $("#datalist_grid").DataTable().page.len(s.rowLen).draw();
            s.oTable1.fnSort([[sort_value, sort_order]]);
            s.oTable1.fnPageChange(page_value);
            s.search_box = d.data.search_value

            if (s.search_box == undefined || s.search_box == '') {
                s.search_box = ''
            }

            else {
                s.search_in_list(s.search_box, 'datalist_grid')
            }

            $("#loading_data").modal("hide")
        })
    }
    init()

    function RetrieveDataPhicJO() {
        h.post("../cPHICShareTaxRate/RetrieveDataListGrid",
            {
                par_department_code: $("#ddl_department").val(),
            }).then(function (d) {
                if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {

                    s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                    s.oTable1.fnClearTable();
                    s.oTable1.fnAddData(s.datalistgrid)
                    s.employeenames = d.data.sp_payrollemployee_tax_hdr_tbl_list
                }
                else {
                    s.oTable1.fnClearTable();
                }
                $("#loading_data").modal("hide")
            })
    }

    var RetrieveDataPhicReCe = function () {
        var employment_type = $("#ddl_employment_type").val() 
        h.post("../cPHICShareTaxRate/RetrieveDataPhicReCe",
            {
                par_employment_type: employment_type,
                par_department_code: $("#ddl_department").val(),
                par_history: "0"

            }).then(function (d) {

                if (d.data.icon = "success") {
                    if (d.data.vw_phic_share_rece_tbl_ACT.length > 0) {
                        s.datalistgrid_rc = d.data.vw_phic_share_rece_tbl_ACT;
                        s.oTable2.fnClearTable();
                        s.oTable2.fnAddData(s.datalistgrid_rc)
                        s.employeenames_2 = d.data.vw_phic_share_rece_tbl_ACT
                    }
                    else {
                        s.oTable1.fnClearTable();
                    }
                    
                }
                else {
                    s.oTable1.fnClearTable();
                }

                $("#loading_data").modal("hide")

            })
    }

    s.opentab = function(tab) {
        
        if (tab == 2) {
            
            s.tablereference = "datalist_grid_rc"
            RetrieveDataPhicReCe();
        }
        else {
           
            s.tablereference = "datalist_grid"
            $("#search_box2").addClass("hidden");
            $("#search_box").removeClass("hidden");
            RetrieveDataPhicJO()
        }
    }


    function NotAddedInSelectedYear(data) {

        var selectedyear = s.selected_payroll_year


        if (data == selectedyear) {
            return true
        }
        else {
            return false
        }
    }

    function approvedOrnew(data) {
        if (data == "A") {
            return true
        }
        else {
            return false
        }
    }

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined || isNaN(d) == true) {
            return retdata = "0.00"
        }
        else {

            retdata = parseFloat(d).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            //retdata = parseFloat(d).toFixed(2)
            return retdata
        }

    }





    //************************************//
    //***Select-Payroll-Year-DropDown****//
    //************************************// 
    s.SelectEmployment_type = function () {
        s.tablereference
        var employment_type = $("#ddl_employment_type").val()

        if (employment_type.toString() != "" && s.ddl_department.toString() != "") {
            s.btnAddShow = true;
        }

        else {
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


        if (employment_type != "" && $("#ddl_department").val() != "") {

            RetrieveDataPhicReCe();
        }

        else {
            s.oTable2.fnClearTable();
            $("#loading_data").modal("hide")
        }

    }

    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectLetter = function (par_empType, par_year, par_letter) {
        $("#loading_data").modal("show")
        h.post("../cPHICShareTaxRate/SelectLetter",
            {
                par_empType: par_empType,
                par_year: par_year,
                par_letter: par_letter

            }).then(function (d) {
                if (d.data.sp_annualtax_hdr_tbl_list.length > 0) {

                    s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list;
                    s.oTable1.fnClearTable();
                    s.oTable1.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable1.fnClearTable();
                }


                $("#loading_data").modal("hide")

            })

    }


    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 


    s.SelectedDepartment_Change = function (ddl_department) {
        console.log(cs.getFormDataByFieldName("header_form", "employment_type"))
        var formdata = cs.getFormDataByFieldName("header_form","employment_type")
        $("#loading_data").modal("show")
        if (ddl_department.toString() != "") {
            s.btnAddShow = true;
        }
        else {
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


        if ($("#ddl_department").val() != "") {
            if (s.tablereference == "datalist_grid") {
                RetrieveDataPhicJO()
            }
            else {
                RetrieveDataPhicReCe()
            }
        }

        else {
            s.oTable1.fnClearTable();
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






    function clearentry() {
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
        s.txtb_empl_id = ""
        s.isDisabledBIRClass = false
        s.isDisabledBIRClass = false
        $("#ddl_w_held").val("0")
        $("#ddl_b_tax").val("0")
        $("#ddl_vat").val("0")
        s.ddl_w_held = "0"
        s.ddl_b_tax = "0"
        s.ddl_vat = "0"
        s.isDisabledWHeld = false
        s.isDisabledBTax = false
        s.isDisabledVat = false
        s.isDisabledExmpt = false
        s.txtb_empl_name = ""
        FieldValidationColorChanged(false, "ALL");
    }


    s.btn_generate_action = function (id_ss) {
        index_update = ""
        index_update = id_ss
        var year = "";
        if (cs.getFormDataByFieldName("header_form", "year")) {
            year = cs.getFormDataByFieldName("header_form", "year").year;
        }
        else {
            return;
        }
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

                else {
                    var history = "N"
                }
                $("#loading_data").modal("show")
                h.post("../cPHICShareTaxRate/GenerateByEmployee_ne", {
                    par_empl_id: s.datalistgrid[id_ss].empl_id
                    , par_payroll_year: year
                    , par_department_code: $("#ddl_department").val()
                    , par_history: history
                }).then(function (d) {

                    if (d.data.message == "success") {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list.refreshTable("datalist_grid", s.datalistgrid[id_ss].empl_id);

                        //if (s.datalistgrid.length > 0) {
                        //    s.oTable1.fnClearTable();
                        //    s.oTable1.fnAddData(s.datalistgrid);
                        //}

                        //else {
                        //    s.oTable1.fnClearTable();
                        //}

                        s.oTable1.fnSort([[sort_value, sort_order]]);

                        swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                    }
                    $("#loading_data").modal("hide")

                })

            }
        })

    }

    s.btn_generate_action_2 = function (id_ss) {
        index_update = ""
        index_update = id_ss

        var year = "";
        var employment_type = $("#ddl_employment_type").val()

        if (cs.getFormDataByFieldName("header_form", "year")) {
            year = cs.getFormDataByFieldName("header_form", "year").year;
        }
        else {
            return;
        }
        if (s.datalistgrid_rc[id_ss].rcrd_status == "A") {
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

                    else {
                        var history = "N"
                    }
                    $("#loading_data").modal("show")
                    h.post("../cPHICShareTaxRate/GenerateByEmployee_rece_phic", {
                         par_empl_id: s.datalistgrid_rc[id_ss].empl_id
                        , par_payroll_year: year
                        , par_department_code: $("#ddl_department").val()
                        , par_rcrd_status: s.datalistgrid_rc[id_ss].rcrd_status
                        , par_history: history
                        , employment_type: employment_type
                    }).then(function (d) {

                        if (d.data.message == "success") {

                           
                            s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list.refreshTable("datalist_grid_rc", s.datalistgrid_rc[id_ss].empl_id);

                            //if (s.datalistgrid.length > 0) {
                            //    s.oTable1.fnClearTable();
                            //    s.oTable1.fnAddData(s.datalistgrid);
                            //}

                            //else {
                            //    s.oTable1.fnClearTable();
                            //}

                            //s.oTable2.fnSort([[sort_value, sort_order]]);

                            swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                        }
                       
                        $("#loading_data").modal("hide")

                    })

                }
            })
        }
        else {
            swal({ title: "Tax Generation Restricted", text: "Tax not approved", icon: "error" })
        }
    }


    s.btn_show_action = function (id_ss) {
        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        var url = "";
        var year = "";
        var history = "N"

        if (s.chckbx_history == true)
        {
            var history = "Y"
        }
        else
        {
            var history = "N"
        }
       
        if (cs.getFormDataByFieldName("header_form", "year"))
        {
            year = cs.getFormDataByFieldName("header_form", "year").year;
        }
        else
        {
            return;
        }

        
            h.post("../cPHICShareTaxRate/PreviousValuesonPage_cJOTaxRate",
            {
                  par_year: year
                , par_empl_id: s.datalistgrid[id_ss].empl_id
                , par_empl_name: s.datalistgrid[id_ss].employee_name
                , par_department: $("#ddl_department option:selected").html()
                , par_show_entries: $("#ddl_show_entries option:selected").val()
                , par_page_nbr: info.page
                , par_search: s.search_box
                , par_sort_value: sort_value
                , par_sort_order: sort_order
                , par_position: s.datalistgrid[id_ss].position_title1
                , par_effective_date: s.datalistgrid[id_ss].effective_date
                , par_department_code: $("#ddl_department").val()
                , par_employment_type: $("#ddl_employment_type").val()
                , par_tabindex: 1
                , par_history: history
               
            }).then(function (d) {
                
                if (d.data.icon == "success") {
                    url = "/cJOTaxRateDetails";
                    window.location.replace(url);
                }
                else {
                    swal(d.data.message, {icon:d.data.icon})
                }
            })

    }



    s.btn_show_action_2 = function (id_ss) {
        var table = $('#datalist_grid_rc').DataTable();
        var info = table.page.info();
        var year = "";
        var url = "";

        var history = "N"
        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }


        
        if (cs.getFormDataByFieldName("header_form", "year")) {
            year = cs.getFormDataByFieldName("header_form", "year").year;
        }
        else {
            return;
        }

        

        h.post("../cPHICShareTaxRate/PreviousValuesonPage_cJOTaxRate",
            {

                  par_year: year
                , par_empl_id: s.datalistgrid_rc[id_ss].empl_id
                , par_empl_name: s.datalistgrid_rc[id_ss].employee_name
                , par_department: $("#ddl_department option:selected").html()
                , par_show_entries: $("#ddl_show_entries option:selected").val()
                , par_page_nbr: info.page
                , par_search: s.search_box
                , par_sort_value: sort_value
                , par_sort_order: sort_order
                , par_position: s.datalistgrid_rc[id_ss].position_long_title
                , par_effective_date: s.datalistgrid_rc[id_ss].tax_year_effective_date
                , par_department_code: $("#ddl_department").val()
                , par_employment_type: $("#ddl_employment_type").val()
                , par_tabindex: 2
                , par_history: history
                
            }).then(function (d) {

                if (d.data.icon == "success") {
                    url = "/cJOTaxRateDetails";
                    window.location.replace(url);
                }
                else {
                    swal(d.data.message, { icon: d.data.icon })
                }
            })

    }

    s.SelectEmployeeName = function (data) {
        s.txtb_empl_id = data.empl_id
        s.txtb_position = data.position_title1
        s.ddl_bir_class = data.bir_class
        s.txtb_gross_pay = currency(data.total_gross_pay)
        s.currentBIRClass = data.bir_class
        if (data.empl_id != "") {
            $("#ddl_employee_name").removeClass("required");
            $("#lbl_ddl_employee_name_req").text("");

            if ($("#ddl_bir_class") != "") {
                $("#ddl_bir_class").removeClass("required");
                $("#lbl_ddl_bir_class_req").text("");
            }
        }

    }

    s.SelectEmployeeName_2 = function (data) {
        s.txtb_empl_id_2 = data.empl_id
        s.txtb_position_2 = data.position_title1
        s.ddl_bir_class_2 = data.bir_class
        s.txtb_gross_pay_2 = currency(data.total_gross_pay)
        s.currentBIRClass_2 = data.bir_class
        if (data.empl_id != "") {
            $("#ddl_employee_name_2").removeClass("required");
            $("#lbl_ddl_employee_name_req_2").text("");

            if ($("#ddl_bir_class_2") != "") {
                $("#ddl_bir_class_2").removeClass("required");
                $("#lbl_ddl_bir_class_req_2").text("");
            }
        }

    }

    s.SelectFixedRate = function (value) {

        if (value.toString().toUpperCase() == "TRUE") {
            s.isDisabledBIRClass = false
            s.isDisabledWHeld = false
            s.isDisabledBTax = false
            s.isDisabledVat = false
        }

        else if (value.toString().toUpperCase() == "FALSE") {


            var getTaxRate = ""

            if (s.txtb_empl_id != "" || s.txtb_empl_id == null) {


                h.post("../cPHICShareTaxRate/GetTaxRate",
                    {

                        par_payroll_year: $("#ddl_year option:selected").val()
                        , par_empl_id: s.txtb_empl_id
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            getTaxRate = d.data.bir_class.toString()

                            $("#ddl_bir_class").val(getTaxRate.toString())


                            //DIRI ANG LAST PAGKUHA SA JOB ORDER TAX RATE
                            if (getTaxRate != "") {
                                $("#ddl_bir_class").val(getTaxRate.toString())

                            }

                            else {
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


            s.isDisabledBIRClass = true
            s.isDisabledWHeld = true
            s.isDisabledBTax = true
            s.isDisabledVat = true
        }

        else {
            if (value != "") {
                $("#ddl_bir_class").val(s.currentBIRClass.toString())
                //$("#ddl_fixed_rate").removeClass("required");
                //$("#lbl_ddl_fixed_rate_req").text("");
            }
            s.isDisabledBIRClass = true
            s.isDisabledBIRClass = true
            s.isDisabledWHeld = true
            s.isDisabledBTax = true
            s.isDisabledVat = true
        }

        if ($("#ddl_bir_class").val() == "") {
            s.isDisabledBIRClass = false
            s.isDisabledBIRClass = false
            s.isDisabledWHeld = false
            s.isDisabledBTax = false
            s.isDisabledVat = false
        }

        if (value != "") {

            $("#ddl_fixed_rate").removeClass("required");
            $("#lbl_ddl_fixed_rate_req").text("");
        }

    }

    s.SelectFixedRate_2 = function (value) {

        if (value.toString().toUpperCase() == "TRUE") {
            s.isDisabledBIRClass_2 = false
            s.isDisabledWHeld_2 = false
            s.isDisabledBTax_2 = false
            s.isDisabledVat_2 = false
        }

        else if (value.toString().toUpperCase() == "FALSE") {


            var getTaxRate = ""

            if (s.txtb_empl_id_2 != "" || s.txtb_empl_id_2 == null) {


                h.post("../cPHICShareTaxRate/GetTaxRate",
                    {
                         par_payroll_year: $("#ddl_year option:selected").val()
                        ,par_empl_id: s.txtb_empl_id
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            getTaxRate = d.data.bir_class.toString()

                            $("#ddl_bir_class").val(getTaxRate.toString())


                            //DIRI ANG LAST PAGKUHA SA JOB ORDER TAX RATE
                            if (getTaxRate != "") {
                                $("#ddl_bir_class").val(getTaxRate.toString())

                            }

                            else {
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


            s.isDisabledBIRClass = true
            s.isDisabledWHeld = true
            s.isDisabledBTax = true
            s.isDisabledVat = true
        }

        else {
            if (value != "") {
                $("#ddl_bir_class").val(s.currentBIRClass.toString())
                //$("#ddl_fixed_rate").removeClass("required");
                //$("#lbl_ddl_fixed_rate_req").text("");
            }
            s.isDisabledBIRClass = true
            s.isDisabledBIRClass = true
            s.isDisabledWHeld = true
            s.isDisabledBTax = true
            s.isDisabledVat = true
        }

        if ($("#ddl_bir_class").val() == "") {
            s.isDisabledBIRClass = false
            s.isDisabledBIRClass = false
            s.isDisabledWHeld = false
            s.isDisabledBTax = false
            s.isDisabledVat = false
        }

        if (value != "") {

            $("#ddl_fixed_rate").removeClass("required");
            $("#lbl_ddl_fixed_rate_req").text("");
        }

    }


    Array.prototype.select = function (code, prop) {
        var value = this.filter(function (d) {
            return d[prop] == code
        })[0]

        if (value == null || value == undefined) {
            value = ""
        }

        return value

    }


    s.SelectWithSworn = function (value) {
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

        catch (e) {
            if (value != "") {

                $("#ddl_with_sworn").removeClass("required");
                $("#lbl_ddl_with_sworn_req").text("");
            }
        }


    }

    s.SelectWithSworn_2 = function (value) {
        try {

            var selected = s.bir_class_data.select($("#ddl_bir_class_2").val(), "bir_class")


            if (value.toString() != "") {
                if (selected != null || selected != undefined) {
                    if (value.toString().toUpperCase() == "TRUE") {
                        //s.txtb_business_tax    = selected.wi_sworn_perc.toString();
                        //s.txtb_wheld_tax       = selected.tax_perc.toString();
                        $("#ddl_w_held_2").val(selected.wi_sworn_perc.toString())
                        s.ddl_w_held_2 = selected.wi_sworn_perc.toString()
                        $("#ddl_b_tax_2").val(selected.tax_perc.toString())
                        s.ddl_b_tax_2 = selected.tax_perc.toString()
                        $("#ddl_vat_2").val(selected.vat_perc.toString())
                        s.ddl_vat_2 = selected.vat_perc.toString()
                    }

                    else {
                        //s.txtb_business_tax     = selected.wo_sworn_perc.toString();
                        //s.txtb_wheld_tax        = selected.tax_perc.toString();
                        $("#ddl_w_held_2").val(selected.wo_sworn_perc.toString())
                        s.ddl_w_held_2 = selected.wo_sworn_perc.toString()
                        $("#ddl_b_tax_2").val(selected.tax_perc.toString())
                        s.ddl_b_tax_2 = selected.tax_perc.toString()
                        $("#ddl_vat_2").val(selected.vat_perc.toString())
                        s.ddl_vat_2 = selected.vat_perc.toString()
                    }

                }

                else {
                    //s.txtb_business_tax = "0";
                    //s.txtb_wheld_tax    = "0";
                    $("#ddl_w_held_2").val("0")
                    s.ddl_w_held_2 = "0"
                    $("#ddl_b_tax_2").val("0")
                    s.ddl_b_tax_2 = "0"
                    $("#ddl_vat_2").val("0")
                    s.ddl_vat_2 = "0"
                }
            }

            else {
                //s.txtb_business_tax = "0";
                //s.txtb_wheld_tax    = "0";
                $("#ddl_w_held_2").val("0")
                s.ddl_w_held_2 = "0"
                $("#ddl_b_tax_2").val("0")
                s.ddl_b_tax_2 = "0"
                $("#ddl_vat").val("0")
                s.ddl_vat_2 = "0"
            }

            if (value != "") {

                $("#ddl_with_sworn_2").removeClass("required");
                $("#lbl_ddl_with_sworn_req_2").text("");
            }
        }

        catch (e) {
            if (value != "") {

                $("#ddl_with_sworn_2").removeClass("required");
                $("#lbl_ddl_with_sworn_req_2").text("");
            }
        }


    }

    s.SelectBirClass = function (value) {
        var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")

        if ($("#ddl_with_sworn").val().toString() != "") {
            if (selected != null || selected != undefined) {
                if ($("#ddl_with_sworn").val().toString().toUpperCase() == "TRUE") {
                    //s.txtb_business_tax = selected.wi_sworn_perc.toString();
                    //s.txtb_wheld_tax = selected.tax_perc.toString();
                    $("#ddl_w_held").val(selected.wi_sworn_perc.toString())
                    s.ddl_w_held = selected.wi_sworn_perc.toString()
                    $("#ddl_b_tax").val(selected.tax_perc.toString())
                    s.ddl_b_tax = selected.tax_perc.toString()
                    $("#ddl_vat").val(selected.vat_perc.toString())
                    s.ddl_vat = selected.vat_perc.toString()
                }

                else {
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
        //alert(value)
        if (value != "") {
            $("#ddl_bir_class").removeClass("required");
            $("#lbl_ddl_bir_class_req").text("");
        }

    }

    s.SelectBirClass_2 = function (value) {

        var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")

        if ($("#ddl_with_sworn").val().toString() != "") {
            if (selected != null || selected != undefined) {
                if ($("#ddl_with_sworn_2").val().toString().toUpperCase() == "TRUE") {
                    //s.txtb_business_tax = selected.wi_sworn_perc.toString();
                    //s.txtb_wheld_tax = selected.tax_perc.toString();
                    $("#ddl_w_held_2").val(selected.wi_sworn_perc.toString())
                    s.ddl_w_held_2 = selected.wi_sworn_perc.toString()
                    $("#ddl_b_tax_2").val(selected.tax_perc.toString())
                    s.ddl_b_tax_2 = selected.tax_perc.toString()
                    $("#ddl_vat_2").val(selected.vat_perc.toString())
                    s.ddl_vat_2 = selected.vat_perc.toString()
                }

                else {
                    //s.txtb_business_tax = selected.wo_sworn_perc.toString();
                    //s.txtb_wheld_tax = selected.tax_perc.toString();
                    $("#ddl_w_held_2").val(selected.wo_sworn_perc.toString())
                    s.ddl_w_held_2 = selected.wo_sworn_perc.toString()
                    $("#ddl_b_tax_2").val(selected.tax_perc.toString())
                    s.ddl_b_tax_2 = selected.tax_perc.toString()
                    $("#ddl_vat_2").val(selected.vat_perc.toString())
                    s.ddl_vat_2 = selected.vat_perc.toString()
                }

            }

            else {
                //s.txtb_business_tax = "0";
                //s.txtb_wheld_tax = "0";
                $("#ddl_w_held_2").val("0")
                s.ddl_w_held_2 = "0"
                $("#ddl_b_tax_2").val("0")
                s.ddl_b_tax_2 = "0"
                $("#ddl_vat_2").val("0")
                s.ddl_vat_2 = "0"
            }
        }

        else {
            //s.txtb_business_tax = "0";
            //s.txtb_wheld_tax = "0";
            $("#ddl_w_held_2").val("0")
            s.ddl_w_held_2 = "0"
            $("#ddl_b_tax_2").val("0")
            s.ddl_b_tax_2 = "0"
            $("#ddl_vat_2").val("0")
            s.ddl_vat_2 = "0"
        }
        //alert(value)
        if (value != "") {
            $("#ddl_bir_class_2").removeClass("required");
            $("#lbl_ddl_bir_class_req_2").text("");
        }

    }


    function getFromValue() {



        var data =
        {

              empl_id: $("#txtb_empl_id").val()
            , employee_name: $("#ddl_employee_name option:selected").html()
            , employment_type: "JO"
            , position_title1: s.txtb_position
            , effective_date: s.isAction == "ADD" ? $("#txtb_effective_date").val() : $("#txtb_effective_date_hid").val()
            , bir_class: $("#ddl_bir_class").val()
            , bir_class_descr: $("#ddl_bir_class option:selected").html()
            , with_sworn: $("#ddl_with_sworn").val()
            , fixed_rate: $("#ddl_fixed_rate").val()
            , with_sworn_descr: $("#ddl_with_sworn option:selected").html()
            , fixed_rate_descr: $("#ddl_fixed_rate option:selected").html()
            , wi_sworn_perc: $("#ddl_b_tax").val()
            , wo_sworn_perc: $("#ddl_b_tax").val()
            , tax_perc: $("#ddl_w_held").val()
            , total_gross_pay: toDecimalFormat(s.txtb_gross_pay)
            , dedct_status: $("#ddl_deduction_status").val()
            , rcrd_status: $("#ddl_status").val()
            , rcrd_status_descr: $("#ddl_status option:selected").html()
            , w_tax_perc: $("#ddl_w_held").val()
            , bus_tax_perc: $("#ddl_b_tax").val()
            , vat_perc: $("#ddl_vat").val()
            , exmpt_amt: toDecimalFormat($("#txtb_expt_amt").val())
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
        s.datalistgrid[index_update].bir_class = $("#ddl_bir_class").val()
        s.datalistgrid[index_update].bir_class_descr = $("#ddl_bir_class option:selected").html()
        s.datalistgrid[index_update].with_sworn = $("#ddl_with_sworn").val()
        s.datalistgrid[index_update].fixed_rate = $("#ddl_fixed_rate").val()
        s.datalistgrid[index_update].with_sworn_descr = $("#ddl_with_sworn option:selected").html()
        s.datalistgrid[index_update].fixed_rate_descr = $("#ddl_fixed_rate option:selected").html()
        s.datalistgrid[index_update].wi_sworn_perc = $("#ddl_b_tax").val()
        s.datalistgrid[index_update].wo_sworn_perc = $("#ddl_b_tax").val()
        s.datalistgrid[index_update].tax_perc = $("#ddl_w_held").val()
        s.datalistgrid[index_update].rcrd_status = $("#ddl_status").val()
        s.datalistgrid[index_update].rcrd_status_descr = $("#ddl_status option:selected").html()
        s.datalistgrid[index_update].dedct_status = $("#ddl_deduction_status").val()

        s.datalistgrid[index_update].w_tax_perc = $("#ddl_w_held").val()
        s.datalistgrid[index_update].bus_tax_perc = $("#ddl_b_tax").val()
        s.datalistgrid[index_update].vat_perc = $("#ddl_vat").val()
        s.datalistgrid[index_update].exmpt_amt = toDecimalFormat($("#txtb_expt_amt").val())



        s.oTable1.fnClearTable();
        s.oTable1.fnAddData(s.datalistgrid);
        page_value = info.page

        s.oTable1.fnSort([[sort_value, sort_order]]);

        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
            if (get_page(s.datalistgrid[index_update].empl_id) == false) {
                s.oTable1.fnPageChange(x);
            }
            else {
                break;
            }
        }


    }


    s.btn_save = function () {

        var department_code = $("#ddl_department").val()
        var empl_id = $("#txtb_empl_id").val()
        $("#btn_save").removeClass("fa fa-save");
        $("#btn_save").addClass("fa fa-spinner fa-spin");
        if (isdataValidated()) {

            var dt = getFromValue()


            var history = "N"

            var effective_date = $("#txtb_effective_date").val()

            //console.log({
            //    data: dt
            //    , par_effective_date: effective_date
            //    , par_empl_id: empl_id
            //    , par_action: "ADD"
            //    , department_code: department_code
            //})
           
            h.post("../cPHICShareTaxRate/SaveEDITInDatabase",
            {
                  data: dt
                , par_effective_date: effective_date
                , par_empl_id: empl_id
                , par_action: s.isAction 
                , department_code: department_code
            }).then(function (d) {
                    if (d.data.message = "success") {
                                    if (s.isAction == "ADD") {
                                        $("#main_modal").modal("hide")

                                        s.datalistgrid = d.data.vw_phic_share_empl_tbl_ACT;
                                        s.oTable1.fnClearTable();
                                        s.oTable1.fnAddData(s.datalistgrid)
                                      
                                        //s.oTable.fnClearTable();
                                        //s.oTable.fnAddData(d.data.vw_phic_share_empl_tbl_ACT)

                                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                            if (get_page(s.txtb_empl_id) == false) {
                                                s.oTable1.fnPageChange(x);
                                            }
                                            else {
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
                                        $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                        $("#btn_save").addClass("fa fa-save");
                                    }
                                    else if (s.isAction == "EDIT") {
                                        $("#main_modal").modal("hide")
                                        updateListGrid()

                                        swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                                        $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                        $("#btn_save").addClass("fa fa-save");
                                    }
                                }
                    else {

                        swal("Saving Error!", "Data not save.", "error");
                        $("#main_modal").modal("hide")
                        $("#btn_save").removeClass("fa fa-spinner fa-spin");
                        $("#btn_save").addClass("fa fa-save");

                    }
             })

        }
    }


    s.btn_save_2 = function () {
        console.log(s.datalistgrid_rc_rowlist[0])
        var old_effective_date = s.datalistgrid_rc_rowlist[0].tax_year_effective_date; 
        var dt = cs.getFormData("tax_form_rece")
        if (dt) {
            var department_code = $("#ddl_department").val()
            var empl_id = dt.empl_id
            var employment_type = $("#ddl_employment_type").val()
            $("#btn_save_2").removeClass("fa fa-save");
            $("#btn_save_2").addClass("fa fa-spinner fa-spin");

            var history = "N"
            var effective_date = $("#txtb_effective_date").val()
                

                if (old_effective_date == dt.effective_date) {
                    s.isAction_2 = "EDIT"
                }
                else {
                    s.isAction_2 = "ADD"
                }

                h.post("../cPHICShareTaxRate/SaveEDITInDatabaseRECEPhic",
                {
                      data: dt
                    , par_action: s.isAction_2
                    , department_code: department_code
                    , employment_type: employment_type
                }).then(function (d) {
                    if (d.data.message == "success") {
                           s.datalistgrid_rc = d.data.vw_phic_share_empl_tbl_ACT.refreshTable("datalist_grid_rc", empl_id);
                         
                            var history = "N"
                            if (s.chckbx_history == true) {
                                var history = "Y"
                            }
                            else {
                                var history = "N"
                            }

                        $("#btn_save_2").removeClass("fa fa-spinner fa-spin");
                        $("#btn_save_2").addClass("fa fa-save");
                       
                        if (s.isAction_2 == "ADD") {
                            swal("Successfully Added!", "Employee tax successufully added!", "success")
                        }

                        else if (s.isAction_2 == "EDIT") {
                            swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                        }

                        $("#main_modal_2").modal("hide")
                    }
                    else {
                        swal("Data Not Save",d.data.message , "error");
                        $("#main_modal_2").modal("hide")
                        $("#btn_save_2").removeClass("fa fa-spinner fa-spin");
                        $("#btn_save_2").addClass("fa fa-save");
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

        else {
            var history = "N"
        }

        console.log(s.datalistgrid[id_ss])

        $("#main_modal").modal("show")
        s.txtb_employment_type_val = s.datalistgrid[id_ss].employment_type
        s.txtb_empl_name = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id = s.datalistgrid[id_ss].empl_id
        s.txtb_position = s.datalistgrid[id_ss].position_long_title
        $("#txtb_effective_date").val(s.datalistgrid[id_ss].tax_year_effective_date)
        $("#txtb_effective_date_hid").val(s.datalistgrid[id_ss].tax_year_effective_date)
        $("#ddl_fixed_rate").val(s.datalistgrid[id_ss].fixed_rate.toString())
        $("#ddl_with_sworn").val(s.datalistgrid[id_ss].with_sworn.toString())
        $("#ddl_deduction_status").val(s.datalistgrid[id_ss].dedct_status.toString())
        $("#ddl_status").val(s.datalistgrid[id_ss].rcrd_status.toString())



        setTimeout(function () {
            $("#ddl_bir_class").val(s.datalistgrid[id_ss].bir_class)
            $("#ddl_w_held").val(s.datalistgrid[id_ss].w_tax_perc.toString())
            $("#ddl_b_tax").val(s.datalistgrid[id_ss].bus_tax_perc.toString())
            $("#ddl_vat").val(s.datalistgrid[id_ss].vat_perc.toString())
        }, 500)
       

        s.txtb_expt_amt = currency(toDecimalFormat(s.datalistgrid[id_ss].exmpt_amt.toString()))

        s.currentBIRClass = s.datalistgrid[id_ss].bir_class

        s.isDisabledBIRClass = false;



        //if ($("#ddl_fixed_rate").val().toUpperCase() == "TRUE" || $("#ddl_fixed_rate").val().toUpperCase() == "1") {
        //    s.isDisabledBIRClass = false;
        //}

        //else {
        //    s.isDisabledBIRClass = true;
        //}

        //console.log(s.isDisabledBIRClass )


        s.txtb_gross_pay = currency(s.datalistgrid[id_ss].total_gross_pay)



    }


    s.btn_edit_action_2 = function (empl_id) {
        
        s.datalistgrid_rc_rowlist = s.datalistgrid_rc.filter(function (k) {
            return k.empl_id == empl_id
        })
        
        s.isShowNameSelect = false;
        s.isShowNameInput = true;
        s.isShowEffectiveDate_hid = true
        s.isShowEffectiveDate = false
        $("#ddl_status").val("N")
        s.ishowsave = true;
        
        clearentry()
        s.isAction = "EDIT"
        s.ModalTitle = "Edit This Record"

        var history = "N"

        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }

        setInterval(s.datalistgrid_rc_rowlist.populateForm("tax_form_rece"), 1000)
       

        $("#txtb_effective_date_2").val(s.datalistgrid_rc_rowlist[0].tax_year_effective_date)
        $("#txtb_position_2").val(s.datalistgrid_rc_rowlist[0].position_long_title)
        s.txtb_expt_amt = currency(toDecimalFormat(s.datalistgrid_rc_rowlist[0].exmpt_amt.toString()))

        s.currentBIRClass = s.datalistgrid_rc_rowlist[0].bir_class

        s.isDisabledBIRClass = false;
      
        s.txtb_gross_pay = currency(s.datalistgrid_rc_rowlist[0].total_gross_pay)

        $("#main_modal_2").modal("show")

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
        var tname = "oTable1"
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {

                h.post("../cPHICShareTaxRate/DeleteFromDatabase", {
                    par_empl_id: s.datalistgrid[id_ss].empl_id
                    , effective_date: s.datalistgrid[id_ss].effective_date
                }).then(function (d) {

                    if (d.data.message = "success") {
                        var id = s[tname][0].id;
                        var page = $("#" + id).DataTable().page.info().page
                        s[tname].fnDeleteRow(id_ss, null, true);
                        s.datalistgrid = DataTable_data(tname)

                        s.oTable1.fnClearTable();
                        s.oTable1.fnAddData(s.datalistgrid)
                        //s.oTable.refreshTable("oTable", "")
                        changePage(tname, page, id)

                        swal("Your record has been deleted successfully!", { icon: "success", });
                    }

                    else {
                        swal("Unable to Delete, Data has been deleted by other user/s!", { icon: "warning", });


                        var id = s[tname][0].id;
                        ////var page = $("#" + id).DataTable().page.info().page

                        s[tname].fnDeleteRow(id_ss, null, true);
                        s.datalistgrid = DataTable_data(tname)


                        if (d.data.sp_annualtax_hdr_tbl_list != null) {
                            s.oTable1.fnClearTable();
                            s.oTable1.fnAddData(s.datalistgrid)

                        }

                        else {
                            s.oTable1.fnClearTable();
                            s.oTable1.fnAddData(s.datalistgrid)
                        }

                        $("#main_modal").modal("hide")
                    }


                })
            }



        })
    }


    s.chckbx_history_Change = function (chckbx_history) {
        s.chckbx_history = chckbx_history

        var history = "N"
        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }


        if ($("#ddl_year").val() != "" && $("#ddl_department").val() != "") {
            h.post("../cPHICShareTaxRate/RetrieveDataListGrid",
                {
                    pay_payroll_year: $("#ddl_year").val(),
                    par_department_code: $("#ddl_department").val(),
                    par_history: history

                }).then(function (d) {
                    if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s.oTable1.fnClearTable();
                        s.oTable1.fnAddData(s.datalistgrid)
                    }
                    else {
                        s.oTable1.fnClearTable();
                    }

                    $("#loading_data").modal("hide")

                })
        }

        else {
            s.oTable1.fnClearTable();
        }

    }

    s.btn_add_action = function (row) {
        s.isShowNameSelect = true;
        s.isShowNameInput = false;
        s.ishowsave = true;
        $("#ddl_status").val("N")
        s.isShowEffectiveDate_hid = false
        s.isShowEffectiveDate = true

        s.ModalTitle_2 = "Add New Record"
        //$("#loading_data").modal("show")
        $("#btn_add_2").removeClass("fa fa-plus-circle");
        $("#btn_add_2").addClass("fa fa-spinner fa-spin");

        s.isAction = "ADD"

        var dt = s.datalistgrid[row]

        $("#ddl_employee_name").val(dt.empl_id)
        $("#txtb_empl_id").val(dt.empl_id)
        $("#txtb_position").val(dt.position_long_title)

        s.txtb_employment_type_val = dt.employment_type
        s.txtb_empl_name = dt.employee_name
        s.txtb_empl_id = dt.empl_id
        s.txtb_position = dt.position_long_title





        //$("#loading_data").modal("hide")
        $("#main_modal").modal("show")
        $("#btn_add").removeClass("fa fa-spinner fa-spin");
        $("#btn_add").addClass("fa fa-plus-circle");

        clear_main_modal()
       
        
        //DIRI ANG LAST WALA KA ADD SA DATEPICKER SA MODAL


    }

    s.btn_add_action_2 = function (empl_id) {
        clear_main_modal_2()
        s.datalistgrid_rc_rowlist = s.datalistgrid_rc.filter(function (k) {
            return k.empl_id == empl_id
        })
        s.isShowNameSelect_2 = true;
        s.isShowNameInput_2 = false;
        s.ishowsave_2 = true;
        $("#ddl_status_2").val("N")
        s.isShowEffectiveDate_hid_2 = false
        s.isShowEffectiveDate_2 = true

        s.ModalTitle_2 = "Add New Record"
        //$("#loading_data").modal("show")
        $("#btn_add_2").removeClass("fa fa-plus-circle");
        $("#btn_add_2").addClass("fa fa-spinner fa-spin");

        s.isAction_2 = "ADD"

        s.datalistgrid_rc_rowlist.populateForm("tax_form_rece")
        $("#txtb_position_2").val(s.datalistgrid_rc_rowlist[0].position_long_title)
        $("#txtb_effective_date_2").val(s.datalistgrid_rc_rowlist[0].tax_year_effective_date)
       
        
       
        $("#main_modal_2").modal("show")
        $("#btn_add_2").removeClass("fa fa-spinner fa-spin");
        $("#btn_add_2").addClass("fa fa-plus-circle");

        


        //DIRI ANG LAST WALA KA ADD SA DATEPICKER SA MODAL


    }

    function clear_main_modal_2() {
        $("#txtb_effective_date_2").val("")
        $("#txtb_effective_date_hid_2").val("")
        $("#ddl_fixed_rate_2").val("")
        $("#ddl_with_sworn_2").val("")
        $("#ddl_deduction_status_2").val("")
        $("#ddl_status_2").val("")
        $("#ddl_bir_class_2").val("")
        $("#ddl_w_held_2").val("")
        $("#ddl_b_tax_2").val("")
        $("#ddl_vat_2").val("")
        s.txtb_expt_amt_2 = currency(toDecimalFormat("0.00"))
        s.currentBIRClass_2 = ""
        s.isDisabledBIRClass_2 = false;
    }

    function clear_main_modal() {
        $("#txtb_effective_date").val("")
        $("#txtb_effective_date_hid").val("")
        $("#ddl_fixed_rate").val("")
        $("#ddl_with_sworn").val("")
        $("#ddl_deduction_status").val("")
        $("#ddl_status").val("")
        $("#ddl_bir_class").val("")
        $("#ddl_w_held").val("")
        $("#ddl_b_tax").val("")
        $("#ddl_vat").val("")
        s.txtb_expt_amt = currency(toDecimalFormat("0.00"))
        s.currentBIRClass = ""
        s.isDisabledBIRClass = false;
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

        if ($("#ddl_employee_name").val() == "" && s.isAction == "ADD") {
            FieldValidationColorChanged(true, "ddl_employee_name")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");

        }

        if ($("#txtb_effective_date").val() == "" && s.isAction == "ADD") {
            FieldValidationColorChanged(true, "txtb_effective_date")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_bir_class").val() == "") {
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

        if (isNaN(validatenumber($("#txtb_expt_amt").val()))) {

            FieldValidationColorChanged(true, "txtb_expt_amt")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        return validatedSaved;

    }

    function validatenumber(value) {
        var value = value.split(",").join("")
        return value
    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(par_v_result, par_object_id) {

        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            if (par_object_id == "txtb_expt_amt") {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Numeric Values Only!");
            }

            else {
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

        h.post("../cPHICShareTaxRate/PreviousValuesonPage_cBIRAnnualizedTax",
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

                h.post("../cPHICShareTaxRate/ReportCount",
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


    s.RemoveClass = function (value, field) {
        if (value != "") {
            $("#" + field).removeClass("required");
            $("#lbl_" + field + "_req").text("");
        }
    }

    //***************************Functions end*********************************************************//
    

    s.Select_Effective_date = function(value) {
        
        $("#txtb_effective_date_2").removeClass("required");
        $("#lbl_txtb_effective_date_req_2").text("");

    }

    s.getCurrentOptionValue = function(value) {
        s.currentOptionValue = value
    }
})

function RemoveEffective() {
    
    $("#txtb_effective_date").removeClass("required");
    $("#lbl_txtb_effective_date_req").text("");

}


