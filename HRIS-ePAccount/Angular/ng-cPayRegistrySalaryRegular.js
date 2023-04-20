//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Regular
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************

ng_HRD_App.controller("cPayRegistrySalaryRegular_ctrlr", function ($scope, $compile, $http, $filter) {
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
        
        h.post("../cPayRegistrySalaryRegular/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year     = d.data.ddl_year
            s.txtb_payroll_month    = d.data.ddl_month
            s.txtb_employment_type  = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template = d.data.payroll_template[0].payrolltemplate_descr
            department              = d.data.department_list
            subdepartment           = d.data.sub_department_list
            division                = d.data.division_list
            section                 = d.data.section_list

            s.txtb_payroll_type     = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            if (d.data.sp_payrollregistryaccounting_dtl_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_tbl_list)
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

    
    
    s.BacktoPayrollRegistry = function ()
    {
        url = "/cPayAuditPosting"
        window.location.replace(url);
    }

    //************************************//
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectPayrollGroup = function (lst) {

        h.post("../cPayRegistrySalaryRegular/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

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

        s.txtb_empl_name    = ""
        s.txtb_empl_id      = ""
        s.txtb_position     = ""
        s.txtb_department   = ""
        s.txtb_sub_department = ""
        s.txtb_division      =""
        s.txtb_section       = ""
        s.txtb_monthly_rate  = ""
        s.txtb_lwop_days     = ""
        s.txtb_lates_minutes = ""
        s.txtb_remarks       = ""
        s.txtb_pera          = ""
        s.txtb_lwop_mr       = ""
        s.txtb_lwop_pera     = ""
        s.txtb_lates_amt     = ""
        s.txtb_gross_pay     = ""
        s.txtb_net_pay       = ""
        s.txtb_net_pay1      = ""
        s.txtb_net_pay2      = ""
        s.txtb_gsis_gs       = ""
        s.txtb_hdmf_ps       = ""
        s.txtb_gsis_ps       = ""
        s.txtb_phic_gs       = ""
        s.txtb_sif           = ""
        s.txtb_phic_ps       = ""
        s.txtb_hdmf_gs       = ""
        s.txtb_bir_tax       = ""
        s.txtb_gsis_ouli     = ""
        s.txtb_gsis_ouli45   = ""
        s.txtb_gsis_ouli50   = ""
        s.txtb_gsis_ouli55   = ""
        s.txtb_gsis_ouli60   = ""
        s.txtb_gsis_ouli65   = ""
        s.txtb_sss           = ""
        s.txtb_hdmf_ps2      = ""
        s.txtb_hdmf_mp2      = ""
        s.txtb_hdmf_lcd      = ""
        s.txtb_phil_lf       = ""
        s.txtb_ehp           = ""
        s.txtb_hip           = ""
        s.txtb_ceap          = ""
        s.txtb_gsis_ai       = ""
        s.txtb_reserve1_opt  = ""
        s.txtb_reserve2_opt  = ""
        s.txtb_reserve3_opt  = ""
        s.txtb_reserve4_opt  = ""
        s.txtb_reserve5_opt  = ""
        s.txtb_consol        = ""
        s.txtb_pol_reg       = ""
        s.txtb_pol_opt       = ""
        s.txtb_ouli_loan     = ""
        s.txtb_emergency     = ""
        s.txtb_e_card        = ""
        s.txtb_educ_asst     = ""
        s.txtb_real_state    = ""
        s.txtb_sos           = ""
        s.txtb_mpl           = ""
        s.txtb_housing       = ""
        s.txtb_calamity      = ""
        s.txtb_ccmpc         = ""
        s.txtb_nico          = ""
        s.txtb_net_bank      = ""
        s.txtb_nhmfc         = ""
        s.txtb_nafc          = ""
        s.txtb_gsis_help     = ""
        s.txtb_gsis_hous     = ""
        s.txtb_reserve1_loan = ""
        s.txtb_reserve2_loan = ""
        s.txtb_reserve3_loan = ""
        s.txtb_reserve4_loan = ""
        s.txtb_reserve5_loan = ""
    }

    Array.prototype.select = function (code, prop) {

        return this.filter(function (d) {
            return d[prop] == code
        })[0]


    }

    

    s.btn_edit_action = function (id_ss) {

        clearentry()

        var departments_select = department.select(s.datalistgrid[id_ss].department_code, "department_code")
        var subdepartments_select = subdepartment.select(s.datalistgrid[id_ss].subdepartment_code, "subdepartment_code")
        var divisions_select = division.select(s.datalistgrid[id_ss].division_code, "division_code")
        var sections_select = section.select(s.datalistgrid[id_ss].section_code, "section_code")

        if (s.datalistgrid[id_ss].department_code.toString() != "") {
            s.txtb_department = departments_select.department_name1
        }

        if (s.datalistgrid[id_ss].subdepartment_code.toString() != "") {
            s.txtb_sub_department = subdepartments_select.subdepartment_short_name
        }


        if (s.datalistgrid[id_ss].division_code.toString() != "") {
            s.txtb_division = divisions_select.division_name1
        }


        if (s.datalistgrid[id_ss].section_code.toString() != "") {
            s.txtb_section = sections_select.section_name1
        }

        s.txtb_empl_name            = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id              = s.datalistgrid[id_ss].empl_id
        s.txtb_position             = s.datalistgrid[id_ss].position_title1
        
        s.txtb_monthly_rate         = s.datalistgrid[id_ss].monthly_rate
        s.txtb_lwop_days            = s.datalistgrid[id_ss].lowpay_day
        s.txtb_lates_minutes        = s.datalistgrid[id_ss].lates_mins_hrs
        s.txtb_remarks              = s.datalistgrid[id_ss].remarks
        s.txtb_pera                 = s.datalistgrid[id_ss].pera_amt
        s.txtb_lwop_mr              = s.datalistgrid[id_ss].lowp_amount
        s.txtb_lwop_pera            = s.datalistgrid[id_ss].lowp_amount_pera
        s.txtb_lates_amt            = s.datalistgrid[id_ss].lates_amount
        s.txtb_gross_pay            = s.datalistgrid[id_ss].gross_pay
        s.txtb_net_pay              = s.datalistgrid[id_ss].net_pay
        s.txtb_net_pay1             = s.datalistgrid[id_ss].net_pay1
        s.txtb_net_pay2             = s.datalistgrid[id_ss].net_pay2
        s.txtb_gsis_gs              = s.datalistgrid[id_ss].gsis_gs
        s.txtb_hdmf_ps              = s.datalistgrid[id_ss].hdmf_ps
        s.txtb_gsis_ps              = s.datalistgrid[id_ss].gsis_ps
        s.txtb_phic_gs              = s.datalistgrid[id_ss].phic_gs
        s.txtb_sif                  = s.datalistgrid[id_ss].sif_gs
        s.txtb_phic_ps              = s.datalistgrid[id_ss].phic_ps
        s.txtb_hdmf_gs              = s.datalistgrid[id_ss].hdmf_gs
        s.txtb_bir_tax              = s.datalistgrid[id_ss].wtax
        s.txtb_gsis_ouli            = s.datalistgrid[id_ss].gsis_uoli
        s.txtb_gsis_ouli45          = s.datalistgrid[id_ss].gsis_uoli45
        s.txtb_gsis_ouli50          = s.datalistgrid[id_ss].gsis_uoli50
        s.txtb_gsis_ouli55          = s.datalistgrid[id_ss].gsis_uoli55
        s.txtb_gsis_ouli60          = s.datalistgrid[id_ss].gsis_uoli60
        s.txtb_gsis_ouli65          = s.datalistgrid[id_ss].gsis_uoli65
        s.txtb_sss                  = s.datalistgrid[id_ss].sss_ps
        s.txtb_hdmf_ps2             = s.datalistgrid[id_ss].hdmf_ps2
        s.txtb_hdmf_mp2             = s.datalistgrid[id_ss].hdmf_mp2
        s.txtb_hdmf_lcd             = s.datalistgrid[id_ss].hdmf_loyalty_card
        s.txtb_phil_lf              = s.datalistgrid[id_ss].philamlife_ps
        s.txtb_ehp                  = s.datalistgrid[id_ss].gsis_ehp
        s.txtb_hip                  = s.datalistgrid[id_ss].gsis_hip
        s.txtb_ceap                 = s.datalistgrid[id_ss].gsis_ceap
        s.txtb_gsis_ai              = s.datalistgrid[id_ss].gsis_addl_ins
        s.txtb_reserve1_opt         = s.datalistgrid[id_ss].other_premium1
        s.txtb_reserve2_opt         = s.datalistgrid[id_ss].other_premium2
        s.txtb_reserve3_opt         = s.datalistgrid[id_ss].other_premium3
        s.txtb_reserve4_opt         = s.datalistgrid[id_ss].other_premium4
        s.txtb_reserve5_opt         = s.datalistgrid[id_ss].other_premium5
        s.txtb_consol               = s.datalistgrid[id_ss].gsis_conso_ln
        s.txtb_pol_reg              = s.datalistgrid[id_ss].gsis_policy_reg_ln
        s.txtb_pol_opt              = s.datalistgrid[id_ss].gsis_policy_opt_ln
        s.txtb_ouli_loan            = s.datalistgrid[id_ss].gsis_uoli_ln
        s.txtb_emergency            = s.datalistgrid[id_ss].gsis_emergency_ln
        s.txtb_e_card               = s.datalistgrid[id_ss].gsis_ecard_ln
        s.txtb_educ_asst            = s.datalistgrid[id_ss].gsis_educ_asst_ln
        s.txtb_real_state           = s.datalistgrid[id_ss].gsis_real_state_ln
        s.txtb_sos                  = s.datalistgrid[id_ss].gsis_sos_ln
        s.txtb_mpl                  = s.datalistgrid[id_ss].hdmf_mpl_ln
        s.txtb_housing              = s.datalistgrid[id_ss].hdmf_hse_ln
        s.txtb_calamity             = s.datalistgrid[id_ss].hdmf_cal_ln
        s.txtb_ccmpc                = s.datalistgrid[id_ss].ccmpc_ln
        s.txtb_nico                 = s.datalistgrid[id_ss].nico_ln
        s.txtb_net_bank             = s.datalistgrid[id_ss].network_ln
        s.txtb_nhmfc                = s.datalistgrid[id_ss].nhmfc_hsing
        s.txtb_nafc                 = s.datalistgrid[id_ss].nafc_svlf
        s.txtb_gsis_help            = s.datalistgrid[id_ss].gsis_help
        s.txtb_gsis_hous            = s.datalistgrid[id_ss].gsis_housing_ln
        s.txtb_reserve1_loan        = s.datalistgrid[id_ss].other_loan1
        s.txtb_reserve2_loan        = s.datalistgrid[id_ss].other_loan2
        s.txtb_reserve3_loan        = s.datalistgrid[id_ss].other_loan3
        s.txtb_reserve4_loan        = s.datalistgrid[id_ss].other_loan4
        s.txtb_reserve5_loan        = s.datalistgrid[id_ss].other_loan5

        calculate_mandatory()
        calculate_optional()
        calculate_loan()

       
       
        
        s.ModalTitle = "View Record | Registry No : " + s.datalistgrid[id_ss].payroll_registry_nbr

        //s.post_status = s.datalistgrid[id_ss].post_status_descr

        $("#main_modal").modal("show")
    }

    function calculate_mandatory()
    {
        var mandatory = 0;

        mandatory = parseFloat(s.txtb_gsis_gs.replace(',', ''))
            + parseFloat(s.txtb_hdmf_ps.replace(',', ''))
            + parseFloat(s.txtb_gsis_ps.replace(',', ''))
            + parseFloat(s.txtb_phic_gs.replace(',', ''))
            + parseFloat(s.txtb_sif.replace(',', ''))
            + parseFloat(s.txtb_phic_ps.replace(',', ''))
            + parseFloat(s.txtb_hdmf_gs.replace(',', ''))
            + parseFloat(s.txtb_bir_tax.replace(',', ''))
        mandatory = mandatory.toFixed(2);

        s.txtb_mandatory = mandatory.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (mandatory.toString().split('.').length > 1 ? mandatory.toString().split('.')[1] : "00");

    }

    function calculate_optional()
    {

        var optional = 0;
        optional = parseFloat(s.txtb_gsis_ouli.replace(',', ''))
            + parseFloat(s.txtb_gsis_ouli45.replace(',', ''))
            + parseFloat(s.txtb_gsis_ouli50.replace(',', ''))
            + parseFloat(s.txtb_gsis_ouli55.replace(',', ''))
            + parseFloat(s.txtb_gsis_ouli60.replace(',', ''))
            + parseFloat(s.txtb_gsis_ouli65.replace(',', ''))
            + parseFloat(s.txtb_sss.replace(',', ''))
            + parseFloat(s.txtb_hdmf_ps2.replace(',', ''))
            + parseFloat(s.txtb_hdmf_mp2.replace(',', ''))
            + parseFloat(s.txtb_hdmf_lcd.replace(',', ''))
            + parseFloat(s.txtb_phil_lf.replace(',', ''))
            + parseFloat(s.txtb_ehp.replace(',', ''))
            + parseFloat(s.txtb_hip.replace(',', ''))
            + parseFloat(s.txtb_ceap.replace(',', ''))
            + parseFloat(s.txtb_gsis_ai.replace(',', ''))
            + parseFloat(s.txtb_reserve1_opt.replace(',', ''))
            + parseFloat(s.txtb_reserve2_opt.replace(',', ''))
            + parseFloat(s.txtb_reserve3_opt.replace(',', ''))
            + parseFloat(s.txtb_reserve4_opt.replace(',', ''))
            + parseFloat(s.txtb_reserve5_opt.replace(',', ''))

        optional = optional.toFixed(2);
        s.txtb_optional = optional.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (optional.toString().split('.').length > 1 ? optional.toString().split('.')[1] : "00");

    }

    function calculate_loan()
    {

        var loan = 0;



        loan = parseFloat(s.txtb_consol.replace(',', ''))
            + parseFloat(s.txtb_pol_reg.replace(',', ''))
            + parseFloat(s.txtb_pol_opt.replace(',', ''))
            + parseFloat(s.txtb_ouli_loan.replace(',', ''))
            + parseFloat(s.txtb_emergency.replace(',', ''))
            + parseFloat(s.txtb_e_card.replace(',', ''))
            + parseFloat(s.txtb_educ_asst.replace(',', ''))
            + parseFloat(s.txtb_real_state.replace(',', ''))
            + parseFloat(s.txtb_sos.replace(',', ''))
            + parseFloat(s.txtb_mpl.replace(',', ''))
            + parseFloat(s.txtb_housing.replace(',', ''))
            + parseFloat(s.txtb_calamity.replace(',', ''))
            + parseFloat(s.txtb_ccmpc.replace(',', ''))
            + parseFloat(s.txtb_nico.replace(',', ''))
            + parseFloat(s.txtb_net_bank.replace(',', ''))
            + parseFloat(s.txtb_nhmfc.replace(',', ''))
            + parseFloat(s.txtb_nafc.replace(',', ''))
            + parseFloat(s.txtb_gsis_help.replace(',', ''))
            + parseFloat(s.txtb_gsis_hous.replace(',', ''))
            + parseFloat(s.txtb_reserve1_loan.replace(',', ''))
            + parseFloat(s.txtb_reserve2_loan.replace(',', ''))
            + parseFloat(s.txtb_reserve3_loan.replace(',', ''))
            + parseFloat(s.txtb_reserve4_loan.replace(',', ''))
            + parseFloat(s.txtb_reserve5_loan.replace(',', ''))


        loan = loan.toFixed(2)
        s.txtb_loans = loan.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (loan.toString().split('.').length > 1 ? loan.toString().split('.')[1] : "00");


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

