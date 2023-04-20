//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Differential
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************

ng_HRD_App.controller("cPaySalaryDifferential_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    s.allow_edit = true

    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "5"
    function init() {

        $("#loading_data").modal("show")

        h.post("../cPaySalaryDifferential/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year         = d.data.ddl_year
            s.txtb_payroll_month        = d.data.ddl_month
            s.txtb_employment_type      = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template     = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type         = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            if (d.data.sp_payrollregistryaccounting_dtl_diff_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_diff_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_diff_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
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

        h.post("../cPaySalaryDifferential/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

            if (d.data.sp_payrollregistryaccounting_dtl_diff_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_diff_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_diff_tbl_list)
            }
            else
            {
                s.oTable.fnClearTable();
            }


        });
    }




   


    s.btn_edit_action = function (id_ss) {
       

        s.txtb_empl_name        = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id          = s.datalistgrid[id_ss].empl_id
        s.txtb_position         = s.datalistgrid[id_ss].position_title1
        s.txtb_department       = s.datalistgrid[id_ss].department_name1
        s.txtb_sub_department   = s.datalistgrid[id_ss].subdepartment_name1
        s.txtb_division         = s.datalistgrid[id_ss].division_name1
        s.txtb_section          = s.datalistgrid[id_ss].section_name1
        s.txtb_daily_rate       = s.datalistgrid[id_ss].daily_rate
        s.txtb_lwop_amount      = s.datalistgrid[id_ss].lowp_amount
        s.txtb_month_covered    = s.datalistgrid[id_ss].month_covered
        s.txtb_rate_amount      = s.datalistgrid[id_ss].monthly_rate
        s.txtb_old_rate_amount  = s.datalistgrid[id_ss].monthly_rate_old
        s.txtb_no_of_months     = s.datalistgrid[id_ss].no_of_months
        s.txtb_gross_pay        = s.datalistgrid[id_ss].gross_pay
        s.txtb_salary_diff_amt  = s.datalistgrid[id_ss].salary_diff_amount
        s.txtb_net_pay          = s.datalistgrid[id_ss].net_pay
        s.txtb_gsis_gs          = s.datalistgrid[id_ss].gsis_gs
        s.txtb_phic_ps          = s.datalistgrid[id_ss].phic_ps
        s.txtb_gsis_ps          = s.datalistgrid[id_ss].gsis_ps
        s.txtb_bir_tax          = s.datalistgrid[id_ss].wtax
        s.txtb_hdmf_gs          = s.datalistgrid[id_ss].hdmf_gs
        s.txtb_hdmf_ps          = s.datalistgrid[id_ss].hdmf_ps
        s.txtb_phic_gs          = s.datalistgrid[id_ss].phic_gs

        
        mandatory = parseFloat(s.txtb_phic_ps.replace(',', ''))
            + parseFloat(s.txtb_gsis_ps.replace(',', ''))
            + parseFloat(s.txtb_hdmf_ps.replace(',', ''))
            + parseFloat(s.txtb_bir_tax.replace(',', ''))
           
        
        mandatory = mandatory.toFixed(2);

        s.txtb_total_deductions = mandatory.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (mandatory.toString().split('.').length > 1 ? mandatory.toString().split('.')[1] : "00");
        s.ModalTitle = "View Record | Registry No : " + s.datalistgrid[id_ss].payroll_registry_nbr
        //s.post_status = s.datalistgrid[id_ss].post_status_descr


        $("#main_modal").modal("show")
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

