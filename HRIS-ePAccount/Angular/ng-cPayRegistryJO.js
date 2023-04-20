//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll JO
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************


ng_HRD_App.controller("cPayRegistryJO_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var userid = "";
    var index_update = "";
    s.allow_edit = true

    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "5"
    function init() {

        $("#loading_data").modal("show")

        h.post("../cPayRegistryJO/initializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year         = d.data.ddl_year
            s.txtb_payroll_month        = d.data.ddl_month
            s.txtb_employment_type      = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template     = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type         = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            if (d.data.sp_payrollregistryaccounting_dtl_jo_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_jo_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_jo_tbl_list)
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
                                + '<i class="fa fa-eye"></i>' + '</button>' +
                                '<button type="button" class="btn btn-primary btn-sm" ng-show="' + true + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-print"></i>' + '</button></div ></center > '

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

        h.post("../cPayRegistryJO/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

            if (d.data.sp_payrollregistryaccounting_dtl_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
            }


        });
    }




    function clearentry() {

        s.txtb_empl_name = ""
        s.txtb_empl_id = ""
        s.txtb_position = ""
        s.txtb_department = ""
        s.txtb_sub_department = ""
        s.txtb_division = ""
        s.txtb_section = ""
        s.txtb_monthly_rate = ""
        s.txtb_lwop_days = ""
        s.txtb_lates_minutes = ""
        s.txtb_remarks = ""
        s.txtb_pera = ""
        s.txtb_lwop_mr = ""
        s.txtb_lwop_pera = ""
        s.txtb_lates_amt = ""
        s.txtb_gross_pay = ""
        s.txtb_net_pay = ""
        s.txtb_net_pay1 = ""
        s.txtb_net_pay2 = ""
        s.txtb_gsis_gs = ""
        s.txtb_hdmf_ps = ""
        s.txtb_gsis_ps = ""
        s.txtb_phic_gs = ""
        s.txtb_sif = ""
        s.txtb_phic_ps = ""
        s.txtb_hdmf_gs = ""
        s.txtb_bir_tax = ""
        s.txtb_gsis_ouli = ""
        s.txtb_gsis_ouli45 = ""
        s.txtb_gsis_ouli50 = ""
        s.txtb_gsis_ouli55 = ""
        s.txtb_gsis_ouli60 = ""
        s.txtb_gsis_ouli65 = ""
        s.txtb_sss = ""
        s.txtb_hdmf_ps2 = ""
        s.txtb_hdmf_mp2 = ""
        s.txtb_hdmf_lcd = ""
        s.txtb_phil_lf = ""
        s.txtb_ehp = ""
        s.txtb_hip = ""
        s.txtb_ceap = ""
        s.txtb_gsis_ai = ""
        s.txtb_reserve1_opt = ""
        s.txtb_reserve2_opt = ""
        s.txtb_reserve3_opt = ""
        s.txtb_reserve4_opt = ""
        s.txtb_reserve5_opt = ""
        s.txtb_consol = ""
        s.txtb_pol_reg = ""
        s.txtb_pol_opt = ""
        s.txtb_ouli_loan = ""
        s.txtb_emergency = ""
        s.txtb_e_card = ""
        s.txtb_educ_asst = ""
        s.txtb_real_state = ""
        s.txtb_sos = ""
        s.txtb_mpl = ""
        s.txtb_housing = ""
        s.txtb_calamity = ""
        s.txtb_ccmpc = ""
        s.txtb_nico = ""
        s.txtb_net_bank = ""
        s.txtb_nhmfc = ""
        s.txtb_nafc = ""
        s.txtb_gsis_help = ""
        s.txtb_gsis_hous = ""
        s.txtb_reserve1_loan = ""
        s.txtb_reserve2_loan = ""
        s.txtb_reserve3_loan = ""
        s.txtb_reserve4_loan = ""
        s.txtb_reserve5_loan = ""
    }



    s.btn_edit_action = function (id_ss) {
        //clearentry()

        s.txtb_empl_name = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id = s.datalistgrid[id_ss].empl_id
        s.txtb_position = s.datalistgrid[id_ss].position_title1
        s.txtb_department = s.datalistgrid[id_ss].department_name1
        s.txtb_sub_department = s.datalistgrid[id_ss].subdepartment_name1
        s.txtb_division = s.datalistgrid[id_ss].division_name1
        s.txtb_section = s.datalistgrid[id_ss].section_name1
        s.txtb_fund_charge = s.datalistgrid[id_ss].fund_description
        s.txtb_daily_rate = s.datalistgrid[id_ss].daily_rate
        s.txtb_days_work = s.datalistgrid[id_ss].days_worked
        s.lbl_rate_basis = s.datalistgrid[id_ss].rate_basis_descr + " Rate :"

        if (s.datalistgrid[id_ss].rate_basis.toString() == "D")
        {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].daily_rate
        }

        else if (s.datalistgrid[id_ss].rate_basis.toString() == "M")
        {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].monthly_rate
        }

        else if (s.datalistgrid[id_ss].rate_basis.toString() == "H")
        {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].hourly_rate
        }

        s.txtb_lates_undertime      = s.datalistgrid[id_ss].lates_mins_hrs
        s.txtb_days_work            = s.datalistgrid[id_ss].days_worked
        s.txtb_hours_work           = s.datalistgrid[id_ss].hours_worked
        s.txtb_gross_pay            = s.datalistgrid[id_ss].gross_pay
        s.txtb_lates_amt            = s.datalistgrid[id_ss].lates_mh_amount
        s.txtb_net_pay              = s.datalistgrid[id_ss].net_pay

        s.txtb_hdmf_gs              = s.datalistgrid[id_ss].hdmf_gs
        s.txtb_bir_tax_3percent     = s.datalistgrid[id_ss].wtax_3perc
        s.txtb_hdmf_ps              = s.datalistgrid[id_ss].hdmf_ps
        s.txtb_bir_tax_5percent     = s.datalistgrid[id_ss].wtax_5perc
        s.txtb_phic_gs              = s.datalistgrid[id_ss].phic_gs
        s.txtb_bir_tax_8percent     = s.datalistgrid[id_ss].wtax_8perc
        s.txtb_phic_ps              = s.datalistgrid[id_ss].phic_ps
        s.txtb_bir_tax_10percent    = s.datalistgrid[id_ss].wtax_10perc
        s.txtb_bir_tax_2percent     = s.datalistgrid[id_ss].wtax_2perc
        s.txtb_bir_tax_15percent    = s.datalistgrid[id_ss].wtax_15perc


        s.txtb_sss                  = s.datalistgrid[id_ss].sss_ps
        s.txtb_reserved1            = s.datalistgrid[id_ss].other_premium1
        s.txtb_hdmf_addtl_ps        = s.datalistgrid[id_ss].hdmf_ps2
        s.txtb_reserved2            = s.datalistgrid[id_ss].other_premium1
        s.txtb_hdmf_mp2             = s.datalistgrid[id_ss].hdmf_mp2
        s.txtb_reserved3            = s.datalistgrid[id_ss].other_premium1
        s.txtb_phil_life            = s.datalistgrid[id_ss].philamlife_ps
        s.txtb_loyalty_card         = s.datalistgrid[id_ss].hdmf_loyalty_card

        s.txtb_hdmf_mpl            = s.datalistgrid[id_ss].hdmf_mpl_ln
        s.txtb_net_bank            = s.datalistgrid[id_ss].network_ln
        s.txtb_hdmf_housing        = s.datalistgrid[id_ss].hdmf_hse_ln
        s.txtb_uniform             = s.datalistgrid[id_ss].uniform_amt
        s.txtb_hdmf_cal            = s.datalistgrid[id_ss].hdmf_cal_ln
        s.txtb_reserved1_loan      = s.datalistgrid[id_ss].other_loan1
        s.txtb_ccmpc_loan          = s.datalistgrid[id_ss].ccmpc_ln
        s.txtb_reserved2_loan      = s.datalistgrid[id_ss].other_loan2
        s.txtb_nico_loan           = s.datalistgrid[id_ss].nico_ln
        s.txtb_reserved3_loan      = s.datalistgrid[id_ss].other_loan3

        

        var mandatory = 0;
        var optional = 0;
        var loan = 0;
        var net_wages = 0;
        var net_wages_deduct = 0;
        var net_wages_pera = 0;
        var net_wages_deduct_pera = 0;

        mandatory = parseFloat(s.txtb_bir_tax_3percent.replace(',', ''))
            + parseFloat(s.txtb_hdmf_ps.replace(',', ''))
            + parseFloat(s.txtb_bir_tax_5percent.replace(',', ''))
            + parseFloat(s.txtb_bir_tax_8percent.replace(',', ''))
            + parseFloat(s.txtb_phic_ps.replace(',', ''))
            + parseFloat(s.txtb_bir_tax_10percent.replace(',', ''))
            + parseFloat(s.txtb_bir_tax_2percent.replace(',', ''))
            + parseFloat(s.txtb_bir_tax_15percent.replace(',', ''))

        optional = parseFloat(s.txtb_sss.replace(',', ''))
            + parseFloat(s.txtb_hdmf_addtl_ps.replace(',', ''))
            + parseFloat(s.txtb_hdmf_mp2.replace(',', ''))
            + parseFloat(s.txtb_phil_life.replace(',', ''))
            + parseFloat(s.txtb_reserved1.replace(',', ''))
            + parseFloat(s.txtb_reserved2.replace(',', ''))
            + parseFloat(s.txtb_reserved3.replace(',', ''))
            + parseFloat(s.txtb_loyalty_card.replace(',', ''))
           

        loan = parseFloat(s.txtb_hdmf_mpl.replace(',', ''))
            + parseFloat(s.txtb_hdmf_housing.replace(',', ''))
            + parseFloat(s.txtb_hdmf_cal.replace(',', ''))
            + parseFloat(s.txtb_ccmpc_loan.replace(',', ''))
            + parseFloat(s.txtb_nico_loan.replace(',', ''))
            + parseFloat(s.txtb_net_bank.replace(',', ''))
            + parseFloat(s.txtb_reserved1_loan.replace(',', ''))
            + parseFloat(s.txtb_reserved2_loan.replace(',', ''))
            + parseFloat(s.txtb_reserved3_loan.replace(',', ''))
            + parseFloat(s.txtb_uniform.replace(',', ''))

            

        
        mandatory = mandatory.toFixed(2);
        optional = optional.toFixed(2);
        loan = loan.toFixed(2);

        s.txtb_mandatory = mandatory.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (mandatory.toString().split('.').length > 1 ? mandatory.toString().split('.')[1] : "00");
        s.txtb_optional = optional.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (optional.toString().split('.').length > 1 ? optional.toString().split('.')[1] : "00");
        s.txtb_loans = loan.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (loan.toString().split('.').length > 1 ? loan.toString().split('.')[1] : "00");
        s.ModalTitle = "View Record | Registry No : " + s.datalistgrid[id_ss].payroll_registry_nbr
        //s.post_status = s.datalistgrid[id_ss].post_status_descr
        $("#main_modal").modal("show")
    }







    Array.prototype.getValue = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] == code
        })
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



