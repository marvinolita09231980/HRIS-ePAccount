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




ng_HRD_App.controller("cSepSet_ctrlr", function ($scope, $compile, $http, $filter) {
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
    s.alphabet_list = [
        { id: 'a', alpha_name: 'A' }, { id: 'b', alpha_name: 'B' }, { id: 'c', alpha_name: 'C' }, { id: 'd', alpha_name: 'D' }, { id: 'e', alpha_name: 'E' }, { id: 'f', alpha_name: 'F' },
        { id: 'g', alpha_name: 'G' }, { id: 'h', alpha_name: 'H' }, { id: 'i', alpha_name: 'I' }, { id: 'j', alpha_name: 'J' }, { id: 'k', alpha_name: 'K' }, { id: 'l', alpha_name: 'L' },
        { id: 'm', alpha_name: 'M' }, { id: 'n', alpha_name: 'N' }, { id: 'o', alpha_name: 'O' }, { id: 'p', alpha_name: 'P' }, { id: 'q', alpha_name: 'Q' }, { id: 'r', alpha_name: 'R' },
        { id: 's', alpha_name: 'S' }, { id: 't', alpha_name: 'T' }, { id: 'u', alpha_name: 'U' }, { id: 'v', alpha_name: 'V' }, { id: 'w', alpha_name: 'W' }, { id: 'x', alpha_name: 'X' },
        { id: 'y', alpha_name: 'Y' }, { id: 'z', alpha_name: 'Z' }

    ]


    function init() {



        $("#loading_data").modal({ keyboard: false, backdrop: "static" })

        $('#div_to_date .input-group.date').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true,
            format: "yyyy-mm-dd"
        });

        RetrieveYear()
        h.post("../cSepSet/InitializeData", { par_empType: s.employeeddl }).then(function (d) {

            s.employeeddl = d.data.empType
            s.ddl_employment_type = d.data.ddl_emp_type
            s.ddl_letter = d.data.ddl_letter
            s.ddl_year = d.data.ddl_year == "" || d.data.ddl_year == null ? s.ddl_year = new Date().getFullYear().toString() : d.data.ddl_year
            s.rowLen = d.data.show_entries

            init_table_data([]);
            $("#ddl_flag").val("false")
            s.ddl_flag = "false"
            s.allow_edit = d.data.um.allow_edit
            s.allow_print = d.data.um.allow_print
            s.allow_delete = d.data.um.allow_delete
            s.allow_print = d.data.um.allow_print
            s.allow_edit_history = d.data.um.allow_edit_history
            s.allow_view = 1


            $("#datalist_grid").DataTable().search("").draw();

            if (d.data.sp_annualtax_separation_tbl_list.length > 0) {

                s.datalistgrid = d.data.sp_annualtax_separation_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid)
            }
            else {
                s.oTable.fnClearTable();
            }


            sort_value = d.data.sort_value
            page_value = d.data.page_value
            sort_order = d.data.sort_order
            s.rowLen = d.data.show_entries

            $("#datalist_grid").DataTable().page.len(s.rowLen).draw();

            s.oTable.fnSort([[sort_value, sort_order]]);
            s.oTable.fnPageChange(page_value);
            s.search_box = d.data.search_value

            if (s.search_box == undefined || s.search_box == '') {
                s.search_box = ''
            }

            else {
                s.search_in_list(s.search_box, 'datalist_grid')
            }

            if (d.data.ddl_emp_type.trim() == "" || d.data.ddl_emp_type.trim() == undefined || d.data.ddl_emp_type.trim() == null) {
                $("#btn_add").hide()
            }

            else {
                $("#btn_add").show()
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
                deferRender: true,
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
                        "mData": "annual_txbl_income", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }

                    },
                    {
                        "mData": "period_from", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },


                    {
                        "mData": "period_to", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "flag", "mRender": function (data, type, full, row) {
                            var status_descr = ""
                            var icon = ""
                            var status_class = ""

                            if (data == true) {
                                status_descr = "Separated"
                                status_class = 'danger'
                                icon = "<i class='fa fa-edit'></i>"
                            }

                            else {
                                status_descr = "Active"
                                status_class = 'success'
                                icon = "<i class='fa fa-check'></i>"
                            }

                               

                            return "<div class='btn-block text-center'><span class='badge badge-" + status_class + "'>" + icon + status_descr +"</span></div>";
                        }
                    },

                    {
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block' style='display: none; border:none;'>" + data.substring(0, 1) + "</span>"
                        }
                    },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'

                             
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i id="edit_icon' + row["row"] + '" class="fa fa-edit"></i>' + '</button>' + '</center >'

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
    s.SelectPayrollYear = function (par_empType, par_year, par_letter) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cSepSet/SelectPayrollYear",
            {
                par_empType: par_empType,
                par_year: par_year,
                par_letter: par_letter

            }).then(function (d) {
                if (d.data.sp_annualtax_separation_tbl_list.length > 0) {

                    s.datalistgrid = d.data.sp_annualtax_separation_tbl_list;
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


    s.SelectLetter = function (value, table) {

        $("#" + table).DataTable().column(6).search(value).draw();
        $("#datalist_grid").DataTable().column(6).search(value).draw();

    }
  


    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectEmploymentType = function (par_empType, par_year, par_letter) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cSepSet/SelectEmploymentType",
            {
                par_empType: par_empType,
                par_year: par_year,
                par_letter: par_letter

            }).then(function (d) {

                if (par_empType.trim() == "" || par_empType.trim() == undefined || par_empType.trim() == null) {
                    $("#btn_add").hide()
                }

                else {
                    $("#btn_add").show()
                }

                if (d.data.sp_annualtax_separation_tbl_list.length > 0) {

                    s.datalistgrid = d.data.sp_annualtax_separation_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable.fnClearTable();
                }

                $("#loading_data").modal("hide")
            })

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
        s.txtb_empl_name = ""
        s.txtb_empl_id = ""
        s.txtb_position = ""
        FieldValidationColorChanged(false, "ALL");
    }

    
    
    
    
    
    


    function updateListGrid() {

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        var flag_value = false
        if ($("#ddl_flag").val() == "true") {
            flag_value = true
        }

        s.datalistgrid[index_update].period_to = $("#txtb_period_to").val()
        s.datalistgrid[index_update].period_from = $("#txtb_period_from").val()


        s.datalistgrid[index_update].flag = flag_value
        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
        page_value = info.page

        s.oTable.fnSort([[sort_value, sort_order]]);

        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
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
        var flag_value = false
        if ($("#ddl_flag").val() == "true") {
            flag_value = true
        }
        var data = {
            payroll_year    : $("#ddl_year").val()
            ,empl_id        : $("#txtb_empl_id").val()
            ,period_from    : $("#txtb_period_from").val()
            ,period_to      : $("#txtb_period_to").val()
            ,flag           : flag_value
        }
        
        if (isdataValidated()) {

            h.post("../cSepSet/SaveEDITInDatabase", {
                data: data
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                    $("#btn_save").removeClass("fa fa-spinner fa-spin");
                    $("#btn_save").addClass("fa fa-save");
                    updateListGrid()
                }

                else {
                    swal("Unable to Update, Data has been Updated by other user/s!", { icon: "warning"});
                    $("#btn_save").removeClass("fa fa-spinner fa-spin");
                    $("#btn_save").addClass("fa fa-save");
                }

                $("#main_modal").modal("hide")
            })
           

        }



    }

    s.btn_edit_action = function (id_ss) {

        $("#btn_save").removeClass("fa fa-spinner fa-spin");
        $("#btn_save").addClass("fa fa-save");

        $("#edit_icon" + id_ss).removeClass("fa fa-edit");
        $("#edit_icon" + id_ss).addClass("fa fa-spinner fa-spin");

        $("#btn_generate").hide()
        s.isShowNameSelect = false;
        s.isShowNameInput = true;
        s.ishowsave = true;
        index_update = id_ss
        clearentry()
        s.isAction = "EDIT"
        s.ModalTitle = "Edit This Record"
        s.txtb_employment_type_val = s.datalistgrid[id_ss].employment_type
        s.txtb_empl_name = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id = s.datalistgrid[id_ss].empl_id
        s.txtb_position = s.datalistgrid[id_ss].position_title1
        s.txtb_employment_type = $("#ddl_employment_type option:selected").text()
        $("#main_modal").modal({ keyboard: false, backdrop: "static" })

        s.txtb_period_from = s.datalistgrid[id_ss].period_from
        s.txtb_period_to = s.datalistgrid[id_ss].period_to
        $("#ddl_flag").val(s.datalistgrid[id_ss].flag.toString())
        $("#edit_icon" + id_ss).removeClass("fa fa-spinner fa-spin");
        $("#edit_icon" + id_ss).addClass("fa fa-edit");
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

                $("#delete_icon" + id_ss).removeClass("fa fa-trash");
                $("#delete_icon" + id_ss).addClass("fa fa-spinner fa-spin");

                h.post("../cSepSet/CheckData", {
                    par_payroll_year: $("#ddl_year option:selected").val()
                    , par_empType: s.datalistgrid[id_ss].employment_type
                    , par_letter: $("#ddl_letter option:selected").val()
                    , par_empl_id: s.datalistgrid[id_ss].empl_id
                    , par_action: s.isAction
                }).then(function (d) {
                    if (d.data.message == "success") {

                        $("#delete_icon" + id_ss).removeClass("fa fa-spinner fa-spin");
                        $("#delete_icon" + id_ss).addClass("fa fa-trash");

                        h.post("../cSepSet/DeleteFromDatabase", {
                            par_empl_id: s.datalistgrid[id_ss].empl_id
                            , par_payroll_year: $("#ddl_year option:selected").val()
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


                        })
                    }

                    else {
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

    //******************************************//
    //***CALCULATE GROSS TAXABLE INCOME     ***//
    //******************************************// 
    function calculatetotaladjst() {
        var total_adjst = 0;
        total_adjst =
            parseFloat(s.txtb_wheld_prst_emplyr.replace(/,/g, ''))
            + parseFloat(s.txtb_wheld_prev_emplyr.replace(/,/g, ''))

        s.txtb_wheld_total = currency(total_adjst).toString()

    }

    //******************************************//
    //***CALCULATE GROSS TAXABLE INCOME     ***//
    //******************************************// 
    function calculategrosstxblincome() {
        var gross_txb_inc = 0;
        gross_txb_inc =
            parseFloat(s.txtb_txbl_inc_prst.replace(/,/g, ''))
            + parseFloat(s.txtb_add_txbl_inc_prst.replace(/,/g, ''))

        s.txtb_gross_txbl_inc = currency(gross_txb_inc).toString()

    }

    //******************************************//
    //***CALCULATE COMPENSATION INCOME PRESENT***//
    //******************************************// 
    function calculatecompincomepresent() {
        var txbl_comp_inc_pres = 0;
        txbl_comp_inc_pres =
            parseFloat(s.txtb_gross_inc_prst.replace(/,/g, ''))
            - parseFloat(s.txtb_non_tax_exmpt.replace(/,/g, ''))

        s.txtb_txbl_inc_prst = currency(txbl_comp_inc_pres).toString()
    }

    //******************************************//
    //***CALCULATE COMPENSATION INCOME PRESENT***//
    //******************************************// 
    function calculatetaxdiff() {
        var tax_diff = 0;
        tax_diff =
            parseFloat(s.txtb_annual_tax_due.replace(/,/g, ''))
            - (parseFloat(s.txtb_wheld_prst_emplyr.replace(/,/g, '')) + parseFloat(s.txtb_wheld_prev_emplyr.replace(/,/g, '')))

        s.txtb_cal_tax_payable = currency(tax_diff).toString()
    }

    //******************************************//
    //***CALCULATE NON TAXABLE***//
    //******************************************// 

    function calculategrossincome() {
        var total_gross = 0;

        total_gross =
            parseFloat(s.txtb_ntx_total.replace(/,/g, ''))
            + parseFloat(s.txtb_txbl_total.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_total.replace(/,/g, ''))

        s.txtb_gross_inc_prst = currency(total_gross).toString()
    }

    //******************************************//
    //***CALCULATE NON TAXABLE***//
    //******************************************// 

    function calculatenontaxable() {
        var total_nontax = 0;

        total_nontax = parseFloat(s.txtb_ntx_basic_sal_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_hol_pay_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_ot_pay_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_night_diff_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_hzrd_pay_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_13th_month.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_deminimis.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_premiums.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_salaries_oth.replace(/,/g, ''))

        s.txtb_ntx_total = currency(total_nontax).toString()
        s.txtb_non_tax_exmpt = currency(total_nontax).toString()
    }

    //******************************************//
    //***CALCULATE TAXABLE***//
    //******************************************// 

    function calculatetaxable() {
        var total_taxable = 0;

        total_taxable = parseFloat(s.txtb_txbl_basic_sal.replace(/,/g, ''))
            + parseFloat(s.txtb_txbl_ra.replace(/,/g, ''))
            + parseFloat(s.txtb_txbl_ta.replace(/,/g, ''))
            + parseFloat(s.txtb_txbl_cola.replace(/,/g, ''))
            + parseFloat(s.txtb_txbl_fxd_hsng_allo.replace(/,/g, ''))
            + parseFloat(s.txtb_txbl_othA.replace(/,/g, ''))
            + parseFloat(s.txtb_txbl_othB.replace(/,/g, ''))

        s.txtb_txbl_total = currency(total_taxable).toString()
    }

    function calculatetaxable_supplementary() {
        var total_taxable_sup = 0;

        total_taxable_sup = parseFloat(s.txbl_sup_com.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_proft_s.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_dir_fee.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_13_oth.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_hzrd_pay.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_ot_pay.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_othA.replace(/,/g, ''))
            + parseFloat(s.txtb_sup_othB.replace(/,/g, ''))

        s.txtb_sup_total = currency(total_taxable_sup).toString()
    }

    s.btn_add_action = function () {
        clearentry()
        s.isShowNameSelect = true;
        s.isShowNameInput = false;
        s.ishowsave = false;
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        s.ModalTitle = "Add New Record"
        s.isAction = "ADD"
        $("#btn_generate").hide()

        $("#btn_add_icon").removeClass("fa fa-plus-circle");
        $("#btn_add_icon").addClass("fa fa-spinner fa-spin");

        h.post("../cSepSet/RetrieveEmployeeList",
            {
                par_empType: $("#ddl_employment_type option:selected").val(),
                par_payroll_year: $("#ddl_year option:selected").val()
            }).then(function (d) {

                if (d.data.message == "success") {
                    if (d.data.sp_personnelnames_annualtax_hdr_combolist.length > 0) {
                        s.employeenames = d.data.sp_personnelnames_annualtax_hdr_combolist
                    }

                    else {
                        s.employeenames = null;
                    }

                }
                $("#loading_data").modal("hide")
                $("#main_modal").modal("show")
                $("#btn_add_icon").removeClass("fa fa-spinner fa-spin");
                $("#btn_add_icon").addClass("fa fa-plus-circle");

            })


    }

    s.btn_extract_action = function (extract_type) {

        //$("#btn_extract_icon").removeClass("fa fa-file-excel-o");
        //$("#btn_extract_icon").addClass("fa fa-spinner fa-spin");
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })

        h.post("../cSepSet/ExtractData",
            {
                par_empType: $("#ddl_employment_type option:selected").val(),
                par_payroll_year: $("#ddl_year option:selected").val(),
                par_extract_type: extract_type
            }).then(function (d) {

                if (d.data.message == "success") {
                    window.open(d.data.filePath, '', '');
                    $("#loading_data").modal("hide")
                    //$("#btn_extract_icon").removeClass("fa fa-spinner fa-spin");
                    //$("#btn_extract_icon").addClass("fa fa-file-excel-o");
                }

                else {
                    //$("#btn_extract_icon").removeClass("fa fa-spinner fa-spin");
                    //$("#btn_extract_icon").addClass("fa fa-file-excel-o");
                    $("#loading_data").modal("hide")
                    swal({
                        title: "Not Data Found!",
                        text: "No Data Found!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
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

        

        if ($("#txtb_period_from").val() == "") {
            FieldValidationColorChanged(true, "txtb_period_from")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        else {
            if (validateDate($("#txtb_period_from").val()) == false) {
                FieldValidationColorChanged("txtb_period_from-invalid", true);
                validatedSaved = false;
                $("#btn_save").removeClass("fa fa-spinner fa-spin");
                $("#btn_save").addClass("fa fa-save");
            }
        }

        if ($("#txtb_period_to").val() == "") {
            FieldValidationColorChanged(true, "txtb_period_to")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }
        else {
            if (validateDate($("#txtb_period_to").val()) == false) {
                FieldValidationColorChanged("txtb_period_to-invalid", true);
                validatedSaved = false;
                $("#btn_save").removeClass("fa fa-spinner fa-spin");
                $("#btn_save").addClass("fa fa-save");
            }
        }
        
        return validatedSaved;

    }

    function validateDate(val) {
        var return_val = false


        var date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
        if (!(date_regex.test(val))) {
            return_val = false;
        }

        else {
            return_val = true;
        }
        return return_val
    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {

        if (pMode) {

            if (pMode == "txtb_period_from-invalid") {
                $("#txtb_period_from").addClass("required");
                $("#lbl_txtb_period_from_req").text("Invalid Date Format!");
            }

            if (pMode == "txtb_period_to-invalid") {
                $("#txtb_period_to").addClass("required");
                $("#lbl_txtb_period_to_req").text("Invalid Date Format!");
            }

            else {
                $("#" + pObjectName).addClass("required");
                $("#lbl_" + pObjectName + "_req").text("Required Field!");
            }
            

            


        }
        else if (!pMode) {
            switch (pObjectName) {

                case "ALL":
                    {
                        $("#txtb_period_to").removeClass("required");
                        $("#lbl_txtb_period_to_req").text("");

                        $("#txtb_period_from").removeClass("required");
                        $("#lbl_txtb_period_from_req").text("");
                       
                        break;
                    }

            }
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

        h.post("../cSepSet/PreviousValuesonPage_cSepSet",
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

                h.post("../cSepSet/ReportCount",
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

    function validatenumber(value) {
        var value = value.split(",").join("")
        return value
    }


    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }



    //***************************Functions end*********************************************************//

})

