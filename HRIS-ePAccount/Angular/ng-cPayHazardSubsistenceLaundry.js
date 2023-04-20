//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Hazard
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************

ng_HRD_App.controller("cPayHazardSubsistenceLaundry_ctrlr", function ($scope, $compile, $http, $filter) {
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
        s.titlename = "Hazard, Subsistence..."
        $("#loading_data").modal("show")

        h.post("../cPayHazardSubsistenceLaundry/initializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year     = d.data.ddl_year
            s.txtb_payroll_month    = d.data.ddl_month
            s.txtb_employment_type  = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type     = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            employment_type = d.data.empType.employment_type

            if (d.data.sp_payrollregistryaccounting_dtl_subs_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_subs_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_subs_tbl_list)
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

                            return '<center><div class="btn-group tooltip-demo">' +
                                '<button type="button" class="btn btn-success btn-sm" data-toggle="tooltip" data-placement="left" title="Review Registry Details" ng-show="' + btn_show_review + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
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

        h.post("../cPayHazardSubsistenceLaundry/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

            if (d.data.sp_payrollregistryaccounting_dtl_subs_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_subs_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_subs_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
            }


        });
    }







    s.btn_edit_action = function (id_ss) {

        


        s.txtb_empl_name                = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id                  = s.datalistgrid[id_ss].empl_id
        s.txtb_position                 = s.datalistgrid[id_ss].position_title1
        s.txtb_department               = s.datalistgrid[id_ss].department_name1


        s.txtb_monthly_rate             = s.datalistgrid[id_ss].monthly_rate
        s.txtb_working_days             = s.datalistgrid[id_ss].days_working 
        s.txtb_no_days_worked           = s.datalistgrid[id_ss].days_plohuh 
        s.txtb_no_days_subsistence      = s.datalistgrid[id_ss].days_subsistence 
        s.txtb_with_laundry             = s.datalistgrid[id_ss].days_laundry
        s.txtb_days_not_exposed         = s.datalistgrid[id_ss].days_not_exposed
        s.txtb_hazard_perc              = s.datalistgrid[id_ss].hazard_rate 
        s.txtb_withhel_tax_perc         = s.datalistgrid[id_ss].bir_tax_rate
        s.txtb_remarks                  = s.datalistgrid[id_ss].remarks 
        s.txtb_daily_rate               = s.datalistgrid[id_ss].daily_rate 
        s.txtb_subs_daily_dspl          = s.datalistgrid[id_ss].subsistence_daily_rate 
        s.txtb_luandry_daily_dspl       = s.datalistgrid[id_ss].laundry_daily_rate 
        s.txtb_net_subs_amount          = s.datalistgrid[id_ss].subsistence_pay 
        s.txtb_net_laundry_amount       = s.datalistgrid[id_ss].laundry_pay 
        s.txtb_net_hazard_amount        = s.datalistgrid[id_ss].hazard_pay 
       
        s.txtb_with_tax_held_amount     = s.datalistgrid[id_ss].bir_tax 
        s.txtb_gross_pay                = s.datalistgrid[id_ss].gross_pay 
        s.txtb_nico_loan                = s.datalistgrid[id_ss].nico_ln 
        s.txtb_ccmpc_loan               = s.datalistgrid[id_ss].ccmpc_ln 
        s.txtb_network_bank_loan        = s.datalistgrid[id_ss].network_ln 
        s.txtb_other_loan               = s.datalistgrid[id_ss].other_loan 
        s.txtb_net_pay                  = s.datalistgrid[id_ss].net_pay 
        

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



