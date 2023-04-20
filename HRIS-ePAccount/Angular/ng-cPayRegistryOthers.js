//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Others
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************



ng_HRD_App.controller("cPayRegistryOthers_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var userid = "";
    var index_update = "";
    s.allow_edit = true
    var employment_type = "";
    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "5"
    function init() {
        
        $("#loading_data").modal("show")

        h.post("../cPayRegistryOthers/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year     = d.data.ddl_year
            s.txtb_payroll_month    = d.data.ddl_month
            s.txtb_employment_type  = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type     = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            if (d.data.sp_payrollregistryaccounting_dtl_oth_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_oth_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_oth_tbl_list)
            }
            else
            {
                s.oTable.fnClearTable();
            }

            if (d.data.payroll_template[0].payrolltemplate_code == "024" || d.data.payroll_template[0].payrolltemplate_code == "043") {
                s.titlename = "Communication Exp.."
            }

            else if (d.data.payroll_template[0].payrolltemplate_code == "027" || d.data.payroll_template[0].payrolltemplate_code == "046")
            {
                s.titlename = "Year-End and Cash.."
            }

            else if (d.data.payroll_template[0].payrolltemplate_code == "031" || d.data.payroll_template[0].payrolltemplate_code == "050") {
                s.titlename = "Productivity Enhance.."
            }
            else
            {
                s.titlename = s.txtb_payroll_template
            }

            $("#loading_data").modal("hide")


        });
    }
    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        var badge_color = "";
        s.oTable = $('#datalist_grid').dataTable(
            {


                data: s.datalistgrid,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [
                    { "mData": "empl_id", "sClass": "text-center" },
                    { "mData": "employee_name" },
                    { "mData": "position_title1" },
                    {
                        "mData": "gross_pay", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "net_pay", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },
                    //{
                    //    "mData": "post_status_descr", "mRender": function (data, type, full, row) {

                    //        if (full["post_status"] != "Y") {
                    //            badge_color = "primary"
                    //        }

                    //        else {
                    //            badge_color = "danger"
                    //        }


                    //        return "<div id='divhtml' class='btn-block text-center' style='padding-top:6px;'><span class='label label-" + badge_color + "'>" + data + "</span></div>";
                    //    }
                    //},
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            var btn_show_review = true

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm" ng-show="' + btn_show_review + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-eye"></i>' + '</button></div ></center > '

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }



    s.BacktoPayrollRegistry = function () {
        url = "/cPayAuditPosting"
        window.location.replace(url);
    }

    //************************************//
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectPayrollGroup = function (lst) {

        if (lst == "") {
            s.oTable.fnClearTable();
        }

        else {
            h.post("../cPayRegistryOthers/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

                if (d.data.sp_payrollregistryaccounting_dtl_oth_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_oth_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_oth_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }


            });
        }
    }







    s.btn_edit_action = function (id_ss) {


        s.txtb_empl_name    = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id      = s.datalistgrid[id_ss].empl_id
        s.txtb_position     = s.datalistgrid[id_ss].position_title1
        s.txtb_department = s.datalistgrid[id_ss].department_name1

        if (s.datalistgrid[id_ss].rate_basis_descr == null)
        {
            s.datalistgrid[id_ss].rate_basis_descr = "";
        }

        s.lbl_rate_basis    = s.datalistgrid[id_ss].rate_basis_descr.toString() + " Rate :";
       

        if (s.datalistgrid[id_ss].rate_basis.toString() == "D" && s.datalistgrid[id_ss].rate_basis != null) {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].daily_rate
        }

        else if (s.datalistgrid[id_ss].rate_basis.toString() == "M" && s.datalistgrid[id_ss].rate_basis != null) {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].monthly_rate;
        }

        else if (s.datalistgrid[id_ss].rate_basis.toString() == "H" && s.datalistgrid[id_ss].rate_basis != null) {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].hourly_rate;
        }

        else
        {
            s.txtb_monthly_rate = "";
        }

        ToogleDetails(id_ss)

       
        s.ModalTitle = "View Record | Registry No : " + s.datalistgrid[id_ss].payroll_registry_nbr
        //s.post_status = s.datalistgrid[id_ss].post_status_descr


        $("#main_modal").modal("show")
    }



    function ToogleDetails(id_ss)
    {
        h.post("../cPayRegistryOthers/EmployeeDetails", {

            par_empl_id: s.datalistgrid[id_ss].empl_id

        }).then(function (d) {

    /* Template Codes And its Value For Casual And Regular Employment Type
         * ----------------------------------------------------------------------------------------
         *  RE TEMPLATE CODES  |   CE TEMPLATE CODES    |   JO TEMPLATE CODES | Description
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  024                |   043                  |                        | Communication Expense Allowance
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  026                |   045                  |                        | Mid Year Bunos
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  027                |   046                  |                        | Year-End And Cash Gift Bunos
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  028                |   047                  |                        | Clothing Allowance
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  029                |   048                  |                        | Loyalty Bunos
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  030                |   049                  |                        | Anniversary Bunos
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  031                |   050                  |                        | Productivity Enhancement Incentive Bunos
         *  -------------------+------------------------+------------------------+------------------------------------------
         *  032                |   051                  |                        | CNA Incentive Bunos
         *  -------------------+------------------------+-------------------------------------------------------------------
         *  ---                |   ---                  |   062                  | Honorarium
         *  -------------------+------------------------+-------------------------------------------------------------------
         *  025                |   044                  |                        | Monetization
         *  ---------------------------------------------------------------------------------------------------------------- */
          

            $("#isShowYearEndBonus").hide();
            //FOR COMMUNICATION EXPENSE
            if (d.data.ddl_template == "043" || d.data.ddl_template == "024") {
                s.lbl_gross_pay_descr = "CEA Amount :";
                s.lbl_generic_note = "CEA Memo :";
                s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay;
                s.txtarea_generic_note = s.datalistgrid[id_ss].notes_generic
                s.isShowGenericTA = true;
                s.isShowGenericTB = false;
                s.isShowMonthly = true;

            }

            //FOR LOYALTY BONUS
            else if (d.data.ddl_template == "029" || d.data.ddl_template == "048")
            {
                s.lbl_gross_pay_descr = "Loyalty Amount :";
                s.lbl_generic_note = "Year's In Service :";
                s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay;
                s.txtb_generic_note = s.datalistgrid[id_ss].notes_generic_descr
                s.isShowGenericTA = false;
                s.isShowGenericTB = true;
                s.isShowMonthly = true;
            }

            //FOR MID YEAR BONUS
            else if (d.data.ddl_template == "026" || d.data.ddl_template == "045") {
                s.lbl_gross_pay_descr = "Mid Year Bonus :";
                s.lbl_generic_note = "Performance Rating :";
                s.txtb_gross_pay = s.datalistgrid[id_ss].net_pay;
                s.txtb_generic_note = s.datalistgrid[id_ss].notes_generic_descr
                s.isShowGenericTA = false;
                s.isShowGenericTB = true;
                s.isShowMonthly = true;
            }

            //FOR YEAR END BONUS
            else if (d.data.ddl_template == "027" || d.data.ddl_template == "046")
            {
                s.lbl_gross_pay_descr = "Year End Amount :";
                s.lbl_generic_note = "";
                s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay;
                s.txtb_ca_amt = s.datalistgrid[id_ss].other_amount;
                s.txtb_year_end_amt = s.datalistgrid[id_ss].net_pay;
                s.txtb_generic_note = s.datalistgrid[id_ss].notes_generic_descr
                s.isShowGenericTA = false;
                s.isShowGenericTB = false;
                s.isShowYearEndBonus = true;
                s.lbl_year_cna1 = "Cash Gift Amount :";
                s.lbl_year_cna2 = "Year-End Net Pay :";
                $("#isShowYearEndBonus").show();
            }

            //FOR CLOTHING ALLOWANCE
            else if (d.data.ddl_template == "028" || d.data.ddl_template == "047") {
                s.lbl_gross_pay_descr = "Clothing Amount :";
                s.lbl_generic_note = "";
                s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay;
                s.txtb_generic_note = s.datalistgrid[id_ss].notes_generic_descr
                s.isShowGenericTA = false;
                s.isShowGenericTB = false;
                s.isShowMonthly = true;
            }

            //FOR ANNIVERSARY BONUS
            else if (d.data.ddl_template == "030" || d.data.ddl_template == "049") {
                s.lbl_gross_pay_descr = "Anniversary Bonus :";
                s.lbl_generic_note = "";
                s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay;
                s.txtb_generic_note = s.datalistgrid[id_ss].notes_generic_descr
                s.isShowGenericTA = false;
                s.isShowGenericTB = false;
                s.isShowMonthly = true;
            }

            //FOR PEI BONUS
            else if (d.data.ddl_template == "031" || d.data.ddl_template == "050")
            {
                s.lbl_gross_pay_descr = "PEI Amount :";
                s.lbl_generic_note = "Performance Rating :";
                s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay;
                s.txtb_generic_note = s.datalistgrid[id_ss].notes_generic_descr
                s.isShowGenericTA = false;
                s.isShowGenericTB = true;
                s.isShowMonthly = true;
            }

            //FOR CNA
            else if (d.data.ddl_template == "032" || d.data.ddl_template == "051") {
                s.lbl_gross_pay_descr = "Incentive Amount :";
                s.lbl_generic_note = "Remarks :";
                s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay;
                s.txtb_ca_amt = s.datalistgrid[id_ss].other_amount;
                s.txtb_year_end_amt = s.datalistgrid[id_ss].net_pay;
                s.txtarea_generic_note = s.datalistgrid[id_ss].notes_generic_descr
                s.isShowGenericTA = true;
                s.isShowGenericTB = false;
                s.isShowYearEndBonus = true;
                s.lbl_year_cna1 = "Agency Fee :";
                s.lbl_year_cna2 = "Net Pay :";
                s.lbl_rate_basis = "";
                $("#div_monthly_rate").show();
                $("#isShowYearEndBonus").show();
            }


        });
    }




    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_print_row = function (lst) {


        $('#Loading_master').modal({
            keyboard: false,
            backdrop: "static"
        });

        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = "~/Reports/cryRemittanceType/cryRemittanceType.rpt"
        var sp = "sp_remittancetype_rep,par_remittancetype_code," + lst.remittancetype_code

        location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&Sp=" + sp

    }




    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }

    //***************************Functions end*********************************************************//

})



