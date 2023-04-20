//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Overtime
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************


ng_HRD_App.controller("cPayOvertime_ctrlr", function ($scope, $compile, $http, $filter) {
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

        h.post("../cPayOvertime/initializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year     = d.data.ddl_year
            s.txtb_payroll_month    = d.data.ddl_month
            s.txtb_employment_type  = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type     = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            employment_type = d.data.empType.employment_type

            if (d.data.sp_payrollregistryaccounting_dtl_ovtm_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_ovtm_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_ovtm_tbl_list)
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

        h.post("../cPayOvertime/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

            if (d.data.sp_payrollregistryaccounting_dtl_ovtm_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_ovtm_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_ovtm_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
            }


        });
    }







    s.btn_edit_action = function (id_ss) {

        if (employment_type == "RE" || employment_type == "CE")
        {

            $("#isShowOTRECE").show();
            $("#isShowOTJO").hide();
            s.txtb_bir_tax  = s.datalistgrid[id_ss].bir_tax
        }

        else
        {
            $("#isShowOTRECE").hide();
            $("#isShowOTJO").show();
            s.txtb_tax2      = s.datalistgrid[id_ss].bir_tax2
            s.txtb_tax3      = s.datalistgrid[id_ss].bir_tax3
            s.txtb_tax5      = s.datalistgrid[id_ss].bir_tax5
            s.txtb_tax8      = s.datalistgrid[id_ss].bir_tax8
            s.txtb_tax10     = s.datalistgrid[id_ss].bir_tax10
            s.txtb_tax15     = s.datalistgrid[id_ss].bir_tax15
        }
       
        
        s.txtb_empl_name             = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id               = s.datalistgrid[id_ss].empl_id
        s.txtb_position              = s.datalistgrid[id_ss].position_title1
        s.txtb_department            = s.datalistgrid[id_ss].department_name1
        s.txtb_sub_department        = s.datalistgrid[id_ss].subdepartment_name1
        s.txtb_division              = s.datalistgrid[id_ss].division_name1
        s.txtb_section               = s.datalistgrid[id_ss].section_name1
        s.txtb_monthly_rate          = s.datalistgrid[id_ss].monthly_rate
        s.txtb_daily_rate            = s.datalistgrid[id_ss].daily_rate

        s.txtb_hourly_rate_actual    = s.datalistgrid[id_ss].hourly_rate
        s.txtb_hr_actual             = s.datalistgrid[id_ss].ot_hour_reg
        s.txtb_hourly_rate_25        = s.datalistgrid[id_ss].hourly_rate_25
        s.txtb_hr_25                 = s.datalistgrid[id_ss].ot_hour_25
        s.txtb_hourly_rate_50        = s.datalistgrid[id_ss].hourly_rate_50
        s.txtb_hr_50                 = s.datalistgrid[id_ss].ot_hour_50
        
        s.txtb_gross_pay             = s.datalistgrid[id_ss].gross_pay
        s.txtb_net_pay               = s.datalistgrid[id_ss].net_pay
        s.txtb_remarks               = s.datalistgrid[id_ss].remarks

        s.ModalTitle = "View Record | Registry No : " + s.datalistgrid[id_ss].payroll_registry_nbr

        //s.post_status = s.datalistgrid[id_ss].post_status_descr

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



