//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Voucher
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************

ng_HRD_App.controller("cPayVoucher_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    s.allow_edit = true
    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "5"

    var department    = null;
    var subdepartment = null;
    var division      = null;
    var section       = null;

    function init() {

        $("#loading_data").modal("show")

        h.post("../cPayVoucher/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year         = d.data.ddl_year
            s.txtb_payroll_month        = d.data.ddl_month
            s.txtb_employment_type      = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template     = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type         = d.data.payrolltype.syssetup_type_descr
            department                  = d.data.department_list
            subdepartment               = d.data.sub_department_list 
            division                    = d.data.division_list 
            section                     = d.data.section_list 

            init_table_data([]);

            employment_type = d.data.empType.employment_type

            if (d.data.sp_voucheraccounting_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_voucheraccounting_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_voucheraccounting_tbl_list)
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

                    //        if (full["post_status"] != "Y")
                    //        {
                    //            badge_color = "primary"
                    //        }

                    //        else
                    //        {
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
            h.post("../cPayVoucher/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

                if (d.data.sp_voucheraccounting_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_voucheraccounting_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_voucheraccounting_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }


            });
        }
    }




    Array.prototype.select = function (code, prop)

    {

        return this.filter(function (d)
        {
            return d[prop] == code
        })[0]


    }


    s.btn_edit_action = function (id_ss) {
        

        var departments_select    = department.select(s.datalistgrid[id_ss].department_code, "department_code")
        var subdepartments_select = subdepartment.select(s.datalistgrid[id_ss].subdepartment_code, "subdepartment_code")
        var divisions_select      = division.select(s.datalistgrid[id_ss].division_code, "division_code")
        var sections_select       = section.select(s.datalistgrid[id_ss].section_code, "section_code")

        if (s.datalistgrid[id_ss].department_code.toString() != "")
        {
            s.txtb_department = departments_select.department_name1
        }

        if (s.datalistgrid[id_ss].subdepartment_code.toString() != "")
        {
            s.txtb_sub_department = subdepartments_select.subdepartment_short_name
        }


        if (s.datalistgrid[id_ss].division_code.toString() != "")
        {
            s.txtb_division = divisions_select.division_name1
        }


        if (s.datalistgrid[id_ss].section_code.toString() != "")
        {
            s.txtb_section = sections_select.section_name1
        }

        

      

        s.txtb_empl_name    = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id      = s.datalistgrid[id_ss].empl_id
        s.txtb_position     = s.datalistgrid[id_ss].position_title1

        s.txtb_prepared_name        = s.datalistgrid[id_ss].preparedby_name
        s.txtb_prepared_design      = s.datalistgrid[id_ss].preparedby_designation
        s.txtb_monthly_rate         = s.datalistgrid[id_ss].monthly_rate
        s.txtb_lwo_pay              = s.datalistgrid[id_ss].lowp_amount_salary
        s.txtb_lwop_amount_pera     = s.datalistgrid[id_ss].lowp_amount_pera
        //s.txtb_total_mandatory           = s.datalistgrid[id_ss].
        //s.txtb_total_optional            = s.datalistgrid[id_ss].
        //s.txtb_total_loans               = s.datalistgrid[id_ss].
        s.txtb_net_pay              = s.datalistgrid[id_ss].net_pay
        s.txtb_period_from          = s.datalistgrid[id_ss].voucher_period_from
        s.txtb_period_to            = s.datalistgrid[id_ss].voucher_period_to
        s.txtb_voucher_descr1       = s.datalistgrid[id_ss].voucher_descr1
        s.txtb_voucher_descr2       = s.datalistgrid[id_ss].voucher_descr2
        s.txtb_gsis_gs              = s.datalistgrid[id_ss].gsis_gs
        s.txtb_hdmf_ps              = s.datalistgrid[id_ss].hdmf_ps
        s.txtb_gsis_ps              = s.datalistgrid[id_ss].gsis_ps
        s.txtb_phic_gs              = s.datalistgrid[id_ss].phic_gs
        s.txtb_gsis_sif             = s.datalistgrid[id_ss].sif_gs
        s.txtb_phic_ps              = s.datalistgrid[id_ss].phic_ps
        s.txtb_hdmf_gs              = s.datalistgrid[id_ss].hdmf_gs
        s.txtb_bir_tax              = s.datalistgrid[id_ss].wtax
        s.txtb_sss                  = s.datalistgrid[id_ss].sss_ps
        s.txtb_gsis_ehp             = s.datalistgrid[id_ss].gsis_ehp
        s.txtb_hdmf_addl            = s.datalistgrid[id_ss].hdmf_ps2
        s.txtb_gsis_hip             = s.datalistgrid[id_ss].gsis_hip
        s.txtb_hdmf_mp2             = s.datalistgrid[id_ss].hdmf_mp2
        s.txtb_gsis_ceap            = s.datalistgrid[id_ss].gsis_ceap
        s.txtb_hdmf_loyalty_card    = s.datalistgrid[id_ss].hdmf_loyalty_card
        s.txtb_gsis_add             = s.datalistgrid[id_ss].gsis_addl_ins
        s.txtb_philam               = s.datalistgrid[id_ss].philamlife_ps
        s.txtb_gsis_consolidated    = s.datalistgrid[id_ss].gsis_conso_ln
        s.txtb_gsis_real_loan       = s.datalistgrid[id_ss].gsis_real_state_ln
        s.txtb_networkbank_loan     = s.datalistgrid[id_ss].network_ln
        s.txtb_gsis_policy_regular  = s.datalistgrid[id_ss].gsis_policy_reg_ln
        s.txtb_gsis_sos_loan        = s.datalistgrid[id_ss].gsis_sos_ln
        s.txtb_nhmfc_hsng           = s.datalistgrid[id_ss].nhmfc_hsing
        s.txtb_gsis_policy_optional = s.datalistgrid[id_ss].gsis_policy_opt_ln
        s.txtb_hdmf_mpl_loan        = s.datalistgrid[id_ss].hdmf_mpl_ln
        s.txtb_nafc                 = s.datalistgrid[id_ss].nafc_svlf
        s.txtb_gsis_ouli_loan       = s.datalistgrid[id_ss].gsis_uoli_ln
        s.txtb_hdmf_house_loan      = s.datalistgrid[id_ss].hdmf_hse_ln
        s.txtb_gsis_help            = s.datalistgrid[id_ss].gsis_help
        s.txtb_gsis_emer_loan       = s.datalistgrid[id_ss].gsis_emergency_ln
        s.txtb_hdmf_cal_loan        = s.datalistgrid[id_ss].hdmf_cal_ln
        s.txtb_gsis_housing_loan    = s.datalistgrid[id_ss].gsis_housing_ln
        s.txtb_gsis_ecard_loan      = s.datalistgrid[id_ss].gsis_ecard_ln
        s.txtb_ccmpc_loan           = s.datalistgrid[id_ss].ccmpc_ln
        s.txtb_gsis_educ_loan       = s.datalistgrid[id_ss].gsis_educ_asst_ln
        s.txtb_nico_loan            = s.datalistgrid[id_ss].nico_ln


        s.txtb_gross_pay            = s.datalistgrid[id_ss].gross_pay

        s.txtb_birtax_summary       = s.datalistgrid[id_ss].wtax
        s.txtb_no_of_days = s.datalistgrid[id_ss].no_of_days

        s.txtb_other_amount1        = s.datalistgrid[id_ss].other_amt1
        s.txtb_other_amount2        = s.datalistgrid[id_ss].other_amt2
        s.txtb_other_amount3        = s.datalistgrid[id_ss].other_amt3

        calculate_mandatory(id_ss)
        calculate_optional(id_ss)
        calculate_loans(id_ss)
        calculate_netpays(id_ss)
        s.ModalTitle = "View Record | Voucher Ctrl Nbr. : " + s.datalistgrid[id_ss].voucher_ctrl_nbr
        //s.post_status = s.datalistgrid[id_ss].post_status_descr


        $("#main_modal").modal("show")
        ToogleModal(id_ss)
    }

    function calculate_mandatory(id_ss)
    {
        var total_mandatory = 0;
        if (s.datalistgrid[id_ss].payrolltemplate_code == "603" ||
            s.datalistgrid[id_ss].payrolltemplate_code == "703" ||
            s.datalistgrid[id_ss].payrolltemplate_code == "803") {

            total_mandatory = total_mandatory + parseFloat(s.txtb_gsis_ps.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_hdmf_ps.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_phic_ps.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_bir_tax.replace(',', ''));

        }

        else {
            total_mandatory = total_mandatory + parseFloat(s.txtb_gsis_ps.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_gsis_gs.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_gsis_sif.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_hdmf_ps.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_hdmf_gs.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_phic_ps.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_phic_gs.replace(',', ''));
            total_mandatory = total_mandatory + parseFloat(s.txtb_bir_tax.replace(',', ''));
        }

        total_mandatory = total_mandatory.toFixed(2);
        s.txtb_total_mandatory = total_mandatory.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (total_mandatory.toString().split('.').length > 1 ? total_mandatory.toString().split('.')[1] : "00");


    }

    function calculate_optional(id_ss)
    {

        var total_optional = 0;

        total_optional = total_optional + parseFloat(s.txtb_sss.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_hdmf_addl.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_philam.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_gsis_ehp.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_gsis_hip.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_gsis_ceap.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_gsis_add.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_hdmf_mp2.replace(',', ''));
        total_optional = total_optional + parseFloat(s.txtb_hdmf_loyalty_card.replace(',', ''));

        total_optional = total_optional.toFixed(2);
        s.txtb_total_optional = total_optional.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (total_optional.toString().split('.').length > 1 ? total_optional.toString().split('.')[1] : "00");

    }


    function calculate_loans(id_ss)
    {

        var total_loans = 0;

        total_loans = total_loans + parseFloat(s.txtb_gsis_consolidated.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_policy_regular.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_policy_optional.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_ouli_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_emer_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_ecard_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_educ_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_real_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_sos_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_hdmf_mpl_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_hdmf_house_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_hdmf_cal_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_ccmpc_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_nico_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_networkbank_loan.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_nhmfc_hsng.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_nafc.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_help.replace(',', ''));
        total_loans = total_loans + parseFloat(s.txtb_gsis_housing_loan.replace(',', ''));

        total_loans = total_loans.toFixed(2);
        s.txtb_total_loans = total_loans.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (total_loans.toString().split('.').length > 1 ? total_loans.toString().split('.')[1] : "00");

    }

    function calculate_netpays(id_ss)
    {
        var total_netpay = 0

        switch (s.datalistgrid[id_ss].payrolltemplate_code) {
            // Template Code for Refund To Employee - Lwop's amount + Deductions
            case "601":
            case "701":
            case "801":
                total_netpay = total_netpay + parseFloat(s.txtb_lwo_pay.replace(',', ''));
                total_netpay = total_netpay + parseFloat(s.txtb_lwop_amount_pera.replace(',', ''));
                total_netpay = total_netpay + parseFloat(s.txtb_total_mandatory.replace(',', ''));
                total_netpay = total_netpay + parseFloat(s.txtb_total_optional.replace(',', ''));
                total_netpay = total_netpay + parseFloat(s.txtb_total_loans.replace(',', ''));
                break;

            // Template Code for Honorarium - Gross pay - Tax Hidden
            case "604":
            case "704":
            case "804":

                total_netpay = parseFloat(s.txtb_gross_pay.replace(',', '')) - parseFloat(s.txtb_birtax_summary.replace(',', ''));
                
                break;

            // Template Code for Terminal Leave - Gross Pay - Deductions
            case "603":
            case "703":
            case "803":
                total_netpay = parseFloat(s.txtb_gross_pay.replace(',', '')) - (parseFloat(s.txtb_total_mandatory.replace(',', '')) + parseFloat(s.txtb_total_optional.replace(',', '')) + parseFloat(s.txtb_total_loans.replace(',', '')));
                break;

            //// Template Code for Other Salaries - ( Gross Pay + PERA (amount1) ) - (Deductions + LWOP Amount)
            //case "605":
            //case "705":
            //case "805":
               
            //    total_netpay = parseFloat(s.txtb_gross_pay.replace(',', '')) + parseFloat(s.txtb_other_amount1.replace(',', ''));
            //    total_netpay = total_netpay - (parseFloat(s.txtb_total_mandatory.replace(',', '')) + parseFloat(s.txtb_total_optional.replace(',', '')) + parseFloat(s.txtb_total_loans.replace(',', '')) + parseFloat(s.txtb_lwo_pay.replace(',', '')) + parseFloat(s.txtb_lwop_amount_pera.replace(',', '')));
            //    break;

            // Template Code for Refund to Employeer - MidYear Bonus (Amount1 = Net Pay)
            case "606":
            case "706":
            case "806":
                total_netpay = parseFloat(s.txtb_other_amount1.replace(',', ''));
                break;

            // Template Code for Refund to Employeer - YearEnd Bonus (Amount1 + Amount2 = Net Pay)
            case "607":
            case "707":
            case "807":
                total_netpay = parseFloat(s.txtb_other_amount1.replace(',', '')) + parseFloat(s.txtb_other_amount2.replace(',', ''));
                break;

            // Template Code for Maternity
            case "608":
            case "708":
            case "808":
                total_netpay = parseFloat(s.txtb_gross_pay.replace(',', '')) + parseFloat(s.txtb_other_amount1.replace(',', ''));
                total_netpay = total_netpay - (parseFloat(s.txtb_total_mandatory.replace(',', '')) + parseFloat(s.txtb_total_optional.replace(',', '')) + parseFloat(s.txtb_total_loans.replace(',', '')));
                break;
        }

        total_netpay = total_netpay.toFixed(2);
        s.txtb_net_pay = total_netpay.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (total_netpay.toString().split('.').length > 1 ? total_netpay.toString().split('.')[1] : "00");

    }


      //*************************************************************************
      //  BEGIN - VJA- 06/06/2019 - Toogle Modal During Add Or Edit
      //*************************************************************************
       function ToogleModal(id_ss)
        {
           switch (s.datalistgrid[id_ss].payrolltemplate_code)
           {
               // Template Code for : Refund To Employee 
               case "601":
               case "701":
               case "801":
                   $("#div_no_of_days").hide()
                   $("#div_gross_pay").hide()
                   $("#div_tax").hide()
                   $("#div_amount1").hide()
                   $("#div_amount2").hide()
                   $("#div_amount3").hide()
                   s.lbl_net_pay = "Refund Total :"
                   break;

               // Template Code for : Refund To Employer
               case "602":
               case "702":
               case "802":
                   swal("PAGE NOT FOUND!!", "Error: 404", "error");
                   $("#main_modal").modal("hide")
                   break

               // Template Code for : Honorarium
               case "604":
               case "704":
               case "804":
                   
                   $("#div_lwop").hide()
                   $("#div_lwop_pera").hide()
                   $("#div_deductions").hide()
                   $("#div_optional").hide()
                   $("#div_loan").hide()
                   $("#id_mandatory").hide()
                   $("#id_optional").hide()
                   $("#id_loans").hide()
                   $("#div_no_of_days").hide()
                   $("#div_amount1").hide()
                   $("#div_amount2").hide()
                   $("#div_amount3").hide()
                   s.lbl_net_pay = "Net Pay (Hon.):"
                   
                   break;

               // Template Code for : Terminal Leave
               case "603":
               case "703":
               case "803":
                   $("#div_lwop").hide()
                   $("#div_lwop_pera").hide()
                   $("#div_tax").hide()
                   $("#div_amount1").hide()
                   $("#div_amount2").hide()
                   $("#div_amount3").hide()
                   s.lbl_net_pay = "Net Pay (Term.):"
                   break;


               // Template Code for : Other Salaries
               case "605":
               case "705":
               case "805":
                   swal("PAGE NOT FOUND!!", "Error: 404", "error");
                   $("#main_modal").modal("hide")
                   break;

               // Template Code for : Refund to Employeer - Mid Year Bonus
               case "606":
               case "706":
               case "806":

                   $("#div_lwop").hide()
                   $("#div_lwop_pera").hide()
                   $("#div_deductions").hide()
                   $("#div_optional").hide()
                   $("#div_loan").hide()
                   $("#id_mandatory").hide()
                   $("#id_optional").hide()
                   $("#id_loans").hide()
                   $("#div_no_of_days").hide()
                   $("#div_gross_pay").hide()
                   $("#div_tax").hide()
                   //$("#div_amount1").hide()
                   $("#div_amount2").hide()
                   $("#div_amount3").hide()

                   $("#div_net_pay").hide()
                   s.lbl_other_amount1_descr = "Mid Year Amount:"
                   break;

               // Template Code for : Refund to Employeer - Year End Bonus
               case "607":
               case "707":
               case "807":
                   $("#div_lwop").hide()
                   $("#div_lwop_pera").hide()
                   $("#div_deductions").hide()
                   $("#div_optional").hide()
                   $("#div_loan").hide()
                   $("#id_mandatory").hide()
                   $("#id_optional").hide()
                   $("#id_loans").hide()
                   $("#div_no_of_days").hide()
                   $("#div_gross_pay").hide()
                   $("#div_tax").hide()
                   //$("#div_amount1").hide()
                   //$("#div_amount2").hide()
                   $("#div_amount3").hide()
                   s.lbl_other_amount1_descr = "Year-End Amt. :"
                   s.lbl_other_amount2_descr = "Cash Gift Amt. :"
                   s.lbl_net_pay = "Net Pay :"
                   break;

               // Template Code for : Maternity
               case "608":
               case "708":
               case "808":

                   $("#div_lwop").hide()
                   $("#div_lwop_pera").hide()
                   $("#div_deductions").hide()
                   $("#div_amount2").hide()
                   $("#div_amount3").hide()
                   $("#div_no_of_days").hide()
                   s.lbl_other_amount1_descr = "PERA Amount:"
                   s.lbl_net_pay = "Net Pay (Mat.) :"
                  
                   break;
           }
               
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



