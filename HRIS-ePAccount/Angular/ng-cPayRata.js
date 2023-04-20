//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll RATA
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************



ng_HRD_App.controller("cPayRata_ctrlr", function ($scope, $compile, $http, $filter) {
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

        h.post("../cPayRata/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year     = d.data.ddl_year
            s.txtb_payroll_month    = d.data.ddl_month
            s.txtb_employment_type  = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type     = d.data.payrolltype.syssetup_type_descr
            s.txtb_payroll_type     = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            employment_type = d.data.empType.employment_type

            if (d.data.sp_payrollregistryaccounting_dtl_rata_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_rata_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_rata_tbl_list)
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
        
        if (lst == "") {
            s.oTable.fnClearTable();
        }

        else {
            h.post("../cPayRata/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

                if (d.data.sp_payrollregistryaccounting_dtl_rata_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_rata_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_rata_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }


            });
        }
    }







    s.btn_edit_action = function (id_ss) {
        
        h.post("../cPayRata/EmployeeDetails", {

            par_empl_id     : s.datalistgrid[id_ss].empl_id,
            par_no_of_days  : s.datalistgrid[id_ss].days_wo_vehicle
          
        }).then(function (d) {
            var with_vehicle = "";
            var wo_vehicle = 0

            wo_vehicle = s.datalistgrid[id_ss].days_wo_vehicle
            
            with_vehicle          = d.data.sp_personnelnamesaccounting_combolist_rata.vehicle_flag.toString();
            s.txtb_net_qa_amount  = d.data.sp_personnelnamesaccounting_combolist_rata.qa_amount.toString();
            s.txtb_ta_amount_dspl = d.data.sp_personnelnamesaccounting_combolist_rata.ta_amount.toString();
            s.txtb_ra_amount_dspl = d.data.sp_personnelnamesaccounting_combolist_rata.ra_amount.toString();

            s.txtb_net_qa_amount  = s.txtb_net_qa_amount.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (s.txtb_net_qa_amount.toString().split('.').length > 1 ? s.txtb_net_qa_amount.toString().split('.')[1] : "00");
            s.txtb_ta_amount_dspl = s.txtb_ta_amount_dspl.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (s.txtb_ta_amount_dspl.toString().split('.').length > 1 ? s.txtb_ta_amount_dspl.toString().split('.')[1] : "00");
            s.txtb_ra_amount_dspl = s.txtb_ra_amount_dspl.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (s.txtb_ra_amount_dspl.toString().split('.').length > 1 ? s.txtb_ra_amount_dspl.toString().split('.')[1] : "00");

            s.txtb_empl_name        = s.datalistgrid[id_ss].employee_name
            s.txtb_empl_id          = s.datalistgrid[id_ss].empl_id
            s.txtb_position         = s.datalistgrid[id_ss].position_title1
            s.txtb_department       = s.datalistgrid[id_ss].department_name1

            s.txtb_monthly_rate     = s.datalistgrid[id_ss].monthly_rate
            s.txtb_no_days_worked   = s.datalistgrid[id_ss].days_worked
            s.txtb_no_days_leave    = s.datalistgrid[id_ss].days_leaved
            s.txtb_wo_vehicle       = s.datalistgrid[id_ss].days_wo_vehicle
            s.txtb_rata_sked_perc   = s.datalistgrid[id_ss].rate_percentage

                     
            if (with_vehicle == "Y")
            {
                if (d.data.sp_accountingrata_rate_sked_tbl_list2_v.length > 0 && wo_vehicle > 0)
                {
                    
                    s.txtb_rata_sked_perc_v = d.data.sp_accountingrata_rate_sked_tbl_list2_v[0].rate_percentage
                }

                else
                {
                    if (wo_vehicle <= 0) {
                        s.txtb_rata_sked_perc_v = "0";
                    }

                    else
                    {
                        s.txtb_rata_sked_perc_v = "100";
                    }
                }
                
            }

            
            

            s.txtb_net_ra_amount    = s.datalistgrid[id_ss].ra_amount
            s.txtb_net_ta_amount    = s.datalistgrid[id_ss].ta_amount
            s.txtb_net_qa_amount    = s.datalistgrid[id_ss].qa_amount
            s.txtb_gross_pay        = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay          = s.datalistgrid[id_ss].net_pay
            

        });

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



