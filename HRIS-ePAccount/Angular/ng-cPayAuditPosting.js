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




ng_HRD_App.controller("cPayAuditPosting_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var userid = "";
    var index_update = "";
    s.allow_edit = true
    var useraction = "";
    var useraction2 = "";
    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "5"
    var sort_value = 1
    var page_value = 0
    var modalheader = "";
    var sort_order = "asc"
    var isAction = "";
    var prev_status = "";
    function init()
    {

        $("#loading_data").modal("show")
        RetrieveYear()
        h.post("../cPayAuditPosting/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.employeeddl           = d.data.empType
            s.ddl_employment_type   = d.data.ddl_emp_type
            s.payrolltemplate       = d.data.payroll_template
            s.ddl_payrolltemplate   = d.data.ddl_template
            s.payrolltype           = d.data.payrolltype
            s.ddl_payrolltype       = d.data.ddl_payrolltype

           


            init_table_data([]);

            s.ddl_year   = d.data.ddl_year == "" || d.data.ddl_year == null ? s.ddl_year = new Date().getFullYear().toString() : d.data.ddl_year
            s.ddl_month  = d.data.ddl_month == "" || d.data.ddl_month == null ? s.ddl_month = MonthFormat((new Date().getMonth() + 1)) : d.data.ddl_month
            
            if (d.data.userid == "" || d.data.userid == null) {
                location.href = "../Login/Index"
            }
            else
            {

                userid = d.data.userid
            }

           
            

            $("#datalist_grid").DataTable().search("").draw();

            if (d.data.sp_payrollregistryaccounting_hdr_tbl_list.length > 0)
            {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_hdr_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid)
                
            }

            else
            {
                s.oTable.fnClearTable();
            }

            sort_value = d.data.sort_value_cs
            page_value = d.data.page_value
            sort_order = d.data.sort_order
            s.rowLen   = d.data.show_entries
            
            s.oTable.fnSort([[sort_value, sort_order]]);
            s.oTable.fnPageChange(page_value);
            
            $("#loading_data").modal("hide")

            document.getElementById("txtb_search_scan").focus()
        })
    }
    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        var badge_color = "";

        s.oTable = $('#datalist_grid').dataTable(
            {
                
                data: s.datalistgrid,
                "order": [[sort_value, sort_order]],
                stateSave: true,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [
                    { "mData": "voucher_nbr","sClass":"text-center"},
                    { "mData": "payroll_registry_descr" },
                    { "mData": "payroll_period_descr","sClass": "text-center" },
                    {
                        "mData": "gross_pay", "mRender": function (data, type, full, row)
                        {
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "net_pay", "mRender": function (data, type, full, row)
                        {
                            return "<div class='btn-block text-right'>"+data+"</div>";
                        }
                    },

                    {
                        "mData": "post_status_descr", "mRender": function (data, type, full, row)
                        {
                            //RELEASED STATUS
                            if (full["post_status"] == "R")
                            {
                                badge_color = "primary"
                            }
                            //WITH REMITTANCE STATUS
                            else if (full["post_status"] == "W")
                            {
                                badge_color = "success"
                            }
                            //POSTED STATUS
                            else if (full["post_status"] == "Y") {
                                badge_color = "danger"
                            }


                                

                            
                            return "<div id='divhtml' class='btn-block text-center' style='padding-top:6px;'><span class='label label-" + badge_color + "'>" + data + "</span></div>";
                        }
                    },
                    
                    
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {

                            var btn_show_details    = true;
                            var btn_show_rcvd       = false;
                            var btn_show_rcvd_audit = false;
                            var btn_show_audit      = false;
                            var btn_show_rcvd_post  = false;
                            var btn_show_post       = false;
                            var btn_show_review     = false;
                            var btn_show_release    = false;
                            var btn_show_unpost     = false;


                            var IsDisabledshow       = false;
                            var IsDisabledrcvd       = true;
                            var IsDisabledrcvd_audit = true;
                            var IsDisabledaudit      = true;
                            var IsDisabledrcvd_post  = true;
                            var IsDisabledpost       = true;
                            var IsDisabledreview     = true;
                            var IsDisabledrelease    = true;
                            var IsDisabledunpost     = true;

                            var IsDisabledprint      = false

                            if (full["rcvd_dttm"] == "" && full["rcvd_flag"] == true)
                            {
                                btn_show_rcvd       = true;
                                IsDisabledrcvd      = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit      = true;
                                btn_show_rcvd_post  = false;
                                btn_show_review     = false;
                                btn_show_post       = false;
                                btn_show_release    = false;
                                btn_show_unpost     = false;
                            }

                            else if (full["audit_rcvd_dttm"] == "" && full["rcvd_audit_flag"] == true)
                            {
                                btn_show_rcvd        = false;
                                btn_show_rcvd_audit  = true;
                                IsDisabledrcvd_audit = false;
                                btn_show_audit       = false;
                                btn_show_rcvd_post   = false;
                                btn_show_post        = true;
                                btn_show_review      = false;
                                btn_show_release     = false;
                                btn_show_unpost      = false;
                            }

                            else if (full["audited_dttm"] == "" && full["audit_flag"] == true)
                            {
                                btn_show_rcvd       = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit      = true;
                                IsDisabledaudit     = false;
                                btn_show_rcvd_post  = false;
                                btn_show_post       = true;
                                btn_show_review     = false;
                                btn_show_release    = false;
                                btn_show_unpost     = false;
                            }

                            else if (full["posting_rcvd_dttm"] == "" && full["rcvd_post_flag"] == true) {
                                btn_show_rcvd       = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit      = false;
                                btn_show_rcvd_post  = true;
                                IsDisabledrcvd_post = false;
                                btn_show_post       = false;
                                btn_show_review     = true;
                                btn_show_release    = false;
                                btn_show_unpost     = false;
                            }

                            else if (full["posted_dttm"] == "" && full["post_flag"] == true) {
                                btn_show_rcvd       = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit      = false;
                                btn_show_rcvd_post  = false;
                                btn_show_post       = true;
                                IsDisabledpost      = false;
                                btn_show_review     = true;
                                btn_show_release    = false;
                                btn_show_unpost     = false;
                            }

                            else if (full["review_dttm"] == "") {
                                btn_show_rcvd       = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit      = false;
                                btn_show_rcvd_post  = false;
                                btn_show_post       = false;
                                btn_show_review     = true;
                                IsDisabledreview    = false;
                                btn_show_release    = false;
                                btn_show_unpost     = false;
                            }

                            else if (full["rlsd_dttm"] == "" && full["release_flag"] == true)
                            {
                                btn_show_rcvd       = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit      = false;
                                btn_show_rcvd_post  = false;
                                btn_show_post       = false;
                                btn_show_review     = true;
                                btn_show_release    = true;
                                IsDisabledrelease   = false;
                                btn_show_unpost     = false;
                            }
                            else {
                                btn_show_rcvd = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit = false;
                                btn_show_rcvd_post = false;
                                btn_show_post = false;
                                btn_show_review = true;
                                btn_show_release = true;
                                btn_show_unpost = false;
                                IsDisabledprint = true;
                            }

                           

                            if (full["unposted_dttm"] == "" && full["posted_dttm"] != "" && full["review_dttm"] == "" && full["unpost_flag"] == true) {
                                btn_show_rcvd       = false;
                                btn_show_rcvd_audit = false;
                                btn_show_audit      = false;
                                btn_show_rcvd_post  = false;
                                btn_show_post       = false;
                                btn_show_release    = false;
                                btn_show_unpost     = true;
                                IsDisabledunpost    = false;

                                if (full["review_dttm"] == "") {
                                    btn_show_review = true;
                                }



                            }
                            
                            

                            return '<center><div class="btn-group tooltip-demo"><button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="Show Registry Details"  ng-show="'
                                + btn_show_details + '" ng-click="btn_show_action (' + row["row"] + ')" ng-disabled="' + IsDisabledshow + '">'
                                + '<i class="fa fa-plus"></i>' + '</button>' +
                                '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Return to HR" ng-show="true" ng-click="btn_return_action(' + row["row"] + ')" ng-disabled="' + IsDisabledprint + '" > '
                                + '<i class="fa fa-backward"></i>' + '</button>' +
                                '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Print" ng-show="true" ng-click="btn_print_action(' + row["row"] + ')" ng-disabled="' + IsDisabledprint + '" > '
                                + '<i class="fa fa-print"></i>' + '</button>' +
                                '<button type="button" class="btn btn-sm action" style="background-color:blueviolet;color:white;" data-toggle="tooltip" data-placement="left" title="Review Payroll Registry" ng-show="' + btn_show_review + '" ng-click="btn_edit_action(' + row["row"] + ')" ng-disabled="' + IsDisabledreview + '" > '
                                + '<i class="fa fa-eye"></i>' + '</button>' +
                                '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Release Payroll Registry" ng-show="' + btn_show_release + '" ng-click="btn_edit_action(' + row["row"] + ')"  ng-disabled="' + IsDisabledrelease + '"> '
                                + '<i class="fa fa-check-square-o"></i>' + '</button>' +
                                '<button type="button" class="btn btn-sm action" style="background-color:limegreen;color:white;" data-toggle="tooltip" data-placement="left" title="Post Payroll Registry" ng-show="' + btn_show_post + '" ng-click="btn_edit_action(' + row["row"] + ')" ng-disabled="' + IsDisabledpost + '" > '
                                + '<i class="fa fa-chain"></i>' + '</button>' +
                                '<button type="button" class="btn btn-success btn-sm action" data-toggle="tooltip" data-placement="left" title="Receive Payroll Registry" ng-show="' + btn_show_rcvd_post + '" ng-click="btn_edit_action(' + row["row"] + ')"  ng-disabled="' + IsDisabledrcvd_post + '"> '
                                + '<i class="fa fa-suitcase"></i>' + '</button>' +
                                '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Audit Payroll Registry" ng-show="' + btn_show_audit + '" ng-click="btn_edit_action(' + row["row"] + ')" ng-disabled="' + IsDisabledaudit + '" > '
                                + '<i class="fa fa-calculator"></i>' + '</button>' +
                                '<button type="button" class="btn btn-success btn-sm action" data-toggle="tooltip" data-placement="left" title="Receive Payroll Registry" ng-show="' + btn_show_rcvd_audit + '" ng-click="btn_edit_action(' + row["row"] + ')" ng-disabled="' + IsDisabledrcvd_audit + '" > '
                                + '<i class="fa fa-folder"></i>' + '</button>' +
                                '<button type="button" class="btn btn-success btn-sm action" data-toggle="tooltip" data-placement="left" title="Receive Payroll Registry" ng-show="' + btn_show_rcvd + '" ng-click="btn_edit_action(' + row["row"] + ')" ng-disabled="' + IsDisabledrcvd + '" > '
                                + '<i class="fa fa-folder-open"></i>' + '</button>' +
                                '<button type="button" class="btn btn-sm action" data-toggle="tooltip" data-placement="left" title="Unpost Payroll Registry" style="background-color:red;color:white;" ng-show="' + btn_show_unpost + '" ng-click="btn_edit_action_unpost(' + row["row"] + ')" ng-disabled="' + IsDisabledunpost + '" > '
                                + '<i class="fa fa-chain-broken"></i>' + '</button> </div></center>';
                                
                                //'<button type="button" class="btn btn-danger btn-sm" ng-show="' + btn_show_return +'" ng-click="btn_return_action(' + row["row"] + ')">'
                                //+ '<i class="fa fa-mail-reply-all"></i>' + '</button></div></center>';
                        }


                    },

                    {
                        "mData": "payroll_registry_nbr", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-right' style='display:none;'>" + data + "</div>";
                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

            $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }
    


    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectEmploymentType = function (empType, payType) {

        h.post("../cPayAuditPosting/SelectEmploymentType",
            {
                par_empType: empType,
                par_payType: payType

            }).then(function (d) {

                s.payrolltemplate = d.data.payroll_template
                s.ddl_department = "";
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

    function MonthFormat(number)
    {
        return (number < 10 ? '0' : '') + number
    }

    s.btn_show = function (rcvd_dttm) 
    {
        var isShow = false
        
        if (rcvd_dttm == "")
        {
             isShow = true
        }
            
        
        return isShow
    }


    //************************************//
    //***Select-Payroll-Type-DropDown****//
    //************************************// 
    s.SelectPayrollType = function (empType,payType) {
        h.post("../cPayAuditPosting/SelectPayrollType",
            {
                par_empType: empType,
                par_payType: payType

            }).then(function (d) {

                s.payrolltemplate = d.data.payroll_template
                
                s.oTable.fnClearTable();
                s.ddl_department = "";
            })
    };


    //************************************//
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectTemplateType = function (par_year, par_month, par_template, par_payrolltype, par_employment_type) {
        h.post("../cPayAuditPosting/SelectTemplateType",
            {
                 par_year: par_year
                ,par_month: par_month
                ,par_template: par_template
                ,par_payrolltype: par_payrolltype
                ,par_employment_type: par_employment_type 
            }).then(function (d) {

                if (par_payrolltype == "01") {

                    if (d.data.sp_payrollregistryaccounting_hdr_tbl_list.length > 0)
                    {
                        s.datalistgrid = d.data.sp_payrollregistryaccounting_hdr_tbl_list;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                        $("#datalist_grid").DataTable().search("").draw();
                    }
                    else
                    {
                        s.oTable.fnClearTable();
                    }

                }

                else if (par_payrolltype == "02")
                {
                    if (d.data.sp_payrollregistryaccounting_hdr_tbl_list.length > 0) {
                        s.datalistgrid = d.data.sp_payrollregistryaccounting_hdr_tbl_list;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                    }
                    else {
                        s.oTable.fnClearTable();
                    }
                }
                
                
                
                

            })
    };

    //************************************//
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectDepartment = function (par_year, par_month, par_template, par_payrolltype,par_employment_type) {
        h.post("../cPayAuditPosting/SelectDepartment",
            {
                par_year: par_year
                ,par_month: par_month
                ,par_template: par_template
                ,par_payrolltype: par_payrolltype
                ,par_employment_type: par_employment_type

            }).then(function (d) {
                
                if (d.data.sp_payrollregistryaccounting_hdr_tbl_list.length > 0)
                {
                        s.datalistgrid = d.data.sp_payrollregistryaccounting_hdr_tbl_list;
                        s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else
                {
                        s.oTable.fnClearTable();
                }
                






            })
    };


    

    /************************************/
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectMonth = function (par_year, par_month, par_template, par_payrolltype,par_employment_type) {
        h.post("../cPayAuditPosting/SelectMonth",
            {
                 par_year: par_year
                ,par_month: par_month
                ,par_template: par_template
                ,par_payrolltype: par_payrolltype
                ,par_employment_type: par_employment_type
            }).then(function (d) {

                $("#datalist_grid").DataTable().search("").draw();
                if (d.data.sp_payrollregistryaccounting_hdr_tbl_list.length > 0)
                {
                    s.datalistgrid = d.data.sp_payrollregistryaccounting_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else
                {
                    s.oTable.fnClearTable();
                }

            })
    }

    /************************************/
    //***Select-Year-DropDown****//
    //************************************// 
    s.SelectYear = function (par_year, par_month, par_template,par_payrolltype,par_employment_type) {
        h.post("../cPayAuditPosting/SelectYear",
            {
                par_year            : par_year
                ,par_month          : par_month
                ,par_template       : par_template
                ,par_payrolltype    : par_payrolltype
                ,par_employment_type: par_employment_type
            }).then(function (d)
            {
                $("#datalist_grid").DataTable().search("").draw();
                if (d.data.sp_payrollregistryaccounting_hdr_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_payrollregistryaccounting_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable.fnClearTable();
                }

            })
    }
    
    function clearentry()
    {

        s.txtb_registry_nbr     = ""
        s.txtb_group_descr      = ""
        s.txtb_registry_descr   = ""
        s.txtb_period_from      = ""
        s.txtb_period_to        = ""
        s.txtb_remarks          = ""
        //s.lbl_registry_voucher = ""
        FieldValidationColorChanged(false, "ALL");

       

        
    }

    

    s.btn_show_action = function (id_ss)
    {

       //$("#Loading_master").modal("show");
        var url = "";

        var table = $('#datalist_grid').DataTable();
        var info  = table.page.info();

        h.post("../cPayAuditPosting/PreviousValuesonPage_cPayRegistry",
            {
                 par_year: s.ddl_year
                ,par_month: s.ddl_month
                ,par_registry_nbr: s.datalistgrid[id_ss].payroll_registry_nbr
                ,par_emp_type: $('#ddl_employment_type').val()
                ,par_template: s.ddl_payrolltemplate
                ,par_group: s.datalistgrid[id_ss].payroll_group_nbr
                ,par_payrolltype: $('#ddl_payrolltype').val()
                ,par_department: s.datalistgrid[id_ss].department_code
                ,par_show_entries: $('#ddl_show_entries').val()
                ,par_page_nbr: info.page
                ,par_search: s.search_box
                ,par_sort_value: sort_value
                ,par_sort_order: sort_order
            }).then(function (d) {

                switch (s.ddl_payrolltemplate) {
                    case "007":  // Monthly Salary                      - For Regular
                        url = "/cPayRegistrySalaryRegular";
                        break;

                    case "008": // Monthly Salary                        - For Casual
                        url = "/cPayRegistrySalaryCasual";
                        break;

                    case "009": // Monthly Salary                       - For Job-Order
                    case "010": // 1st Quicena Salary                   - For Job-Order
                    case "011": // 2nd Quicena Salary                   - For Job-Order
                        url = "/cPayRegistryJO";
                        break;

                    case "022":  // Overtime Payroll                    - For Regular
                    case "042":  // Overtime Payroll                    - For Casual
                    case "061":  // Overtime Payroll                     - For Job-Order
                        url = "/cPayOvertime";
                        break;

                    case "062": // Honorarium                           - For Job-Order
                        url = "/cPayRegistryOthers";
                        break;

                    case "901": //  Additional Bonus For Regular
                    case "902": //  Additional Bonus For Regular
                    case "903": //  Additional Bonus For Regular
                    case "904": //  Additional Bonus For Regular
                    case "905": //  Additional Bonus For Regular
                        url = "/cPayRegistryOthPay";
                        break;

                    case "024": // Communication Expense Allowance     - For Regular
                    case "025": // Monetization                        - For Regular
                    case "026": // Mid Year Bonus                      - For Regular
                    case "027": // Year-End and Cash Gift Bonus        - For Regular
                    case "028": // Clothing Allowances                 - For Regular
                    case "029": // Loyalty Bonus                       - For Regular
                    case "030": // Anniversary Bonus                   - For Regular
                    case "031": // Productivity Enhancement Incentive  - For Regular
                    case "032": // C. N. A. Incentive                  - For Regular

                    case "043":  // Communication Expense Allowance    - For Casual
                    case "044":  // Monetization                       - For Casual
                    case "045":  // Mid Year Bonus                     - For Casual
                    case "046":  // Year - End and Cash Gift Bonus     - For Casual
                    case "047":  // Clothing Allowances                - For Casual
                    case "048":  // Loyalty Bonus                      - For Casual
                    case "049":  // Anniversary Bonus                  - For Casual
                    case "050":  // Productivity Enhancement Incentive - For Casual
                    case "051":  // C.N.A.Incentive                    - For Casual
                        url = "/cPayRegistryOthers";
                        break;

                    case "033": // Salary Differential                   - For Regular
                    case "052": // Salary Differential                   - For Casual
                        url = "/cPaySalaryDifferential";
                        break;

                    case "023": // RATA                                  - For Regular
                        url = "/cPayRata";
                        break;

                    case "021": // Subsistence, HA and LA      - Regular
                    case "041": // Subsistence, HA and LA      - Casual
                        url = "/cPayHazardSubsistenceLaundry";
                        break;

                }

                if ($("#ddl_payrolltype option:selected").val() == "02")
                {
                    
                    url = "/cPayVoucher";

                }

                if (url != "")
                {
                    window.location.replace(url);
                }

            })

        
    }
    
    s.btn_edit_action_unpost = function (id_ss) {

        //document.getElementById("txtb_remarks").focus()
        clearentry()
        index_update = ""
        index_update = id_ss
        s.txtb_voucher_nbr = s.datalistgrid[id_ss].voucher_nbr;
        s.txtb_registry_nbr = s.datalistgrid[id_ss].payroll_registry_nbr;
       
        var dt = s.datalistgrid[id_ss]

        if (s.ddl_payrolltype == "01")
        {
            s.lbl_registry_voucher = "Registry Nbr.:"
            modalheader = "Registry Nbr | "
        }

        else if (s.ddl_payrolltype == "02")
        {
            
            s.lbl_registry_voucher = "Voucher Ctrl Nbr.:"
            modalheader = "Voucher Ctrl Nbr | "
        }
        Toogle_post(id_ss) //Toogle Actions for Receiving,Audit,Posting,Releasing
        
        h.post("../cPayAuditPosting/CheckData",
            {
                data: dt,
                par_payroll_template: s.ddl_payrolltemplate,
                par_payroll_source:   s.ddl_payrolltype,
                par_employment_type:  s.ddl_employment_type,
                par_action: isAction
            }).then(function (d) {


                if (d.data.message == "success") {
                    $("#main_modal").modal("show");

                    $('#main_modal').on('shown.bs.modal', function () {
                        $('#txtb_remarks').focus();

                    });
                }

              

                else {
                    if (d.data.message == "fail")
                    {
                        swal("Unable to Update!", "Data has been Updated by Other User/s.", "warning").then(function (willClose) {
                            if (willClose) {
                                document.getElementById("txtb_search_scan").focus()
                                s.txtb_search_scan = ""
                            }
                        });


                        var tname = "oTable";

                        //var id = s[tname][0].id;
                        var page = $("#datalist_grid").DataTable().page.info().page

                        s[tname].fnDeleteRow(index_update, null, true);
                        s.datalistgrid = DataTable_data(tname)


                        if (d.data.sp_payrollregistryaccounting_hdr_tbl_list != null)
                        {
                            s.datalistgrid.push(d.data.sp_payrollregistryaccounting_hdr_tbl_list)
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid)
                        }

                        s.oTable.fnPageChange(page)


                        $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd").addClass("fa fa-folder-open");

                        $("#btn_rcvd_audit").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd_audit").addClass("fa fa-folder");

                        $("#btn_audit").removeClass("fa fa-spinner fa-spin");
                        $("#btn_audit").addClass("fa fa-calculator");

                        $("#btn_rcvd_post").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd_post").addClass("fa fa-suitcase");

                        $("#btn_post").removeClass("fa fa-spinner fa-spin");
                        $("#btn_post").addClass("fa fa-chain");

                        $("#btn_review").removeClass("fa fa-spinner fa-spin");
                        $("#btn_review").addClass("fa fa-eye");

                        $("#btn_release").removeClass("fa fa-spinner fa-spin");
                        $("#btn_release").addClass("fa fa-check-square-o");

                        $("#btn_unpost").removeClass("fa fa-spinner fa-spin");
                        $("#btn_unpost").addClass("fa fa-chain-broken");
                        $("#main_modal").modal("hide");
                    }
                    
                }


            })


    }

    function Toogle_post(id_ss)
    {

        s.isVisibleDateReturn = true
        s.ishowreturn         = false
        if (s.datalistgrid[id_ss].unposted_dttm == "" && s.datalistgrid[id_ss].unpost_flag == true)
        {

            s.ishowrcvd         = false
            s.ishowrcvd_audit   = false
            s.ishow_audit       = false
            s.ishowrcvd_post    = false
            s.ishow_post        = false
            s.ishow_review      = false
            s.ishowrelease      = false
            s.ishowunpost       = true
            
            s.ModalTitle = "Unpost Record | " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle       = "Unpost Date"

            s.isDisabled = true;


            s.isVisibleDateReceived     = true
            s.isVisibleDateRcvdAudit    = true
            s.isVisibleDateAudit        = true
            s.isVisibleDateRcvdPost     = true
            s.isVisibleDatePosted       = true
            s.isVisibleDateReviewed     = true
            s.isVisibleDateRlsd         = true

            s.isVisibleDateReturn       = true
            s.isVisibleDateUnpost       = false

            s.txtb_date_rcvd            = s.datalistgrid[id_ss].rcvd_dttm
            s.txtb_audit_rcvd           = s.datalistgrid[id_ss].audit_rcvd_dttm
            s.txtb_date_audited         = s.datalistgrid[id_ss].audited_dttm
            s.txtb_post_rcvd            = s.datalistgrid[id_ss].posting_rcvd_dttm
            s.txtb_date_posted          = s.datalistgrid[id_ss].posted_dttm
            s.txtb_date_reviewed        = s.datalistgrid[id_ss].review_dttm
            s.txtb_date_rlsd            = s.datalistgrid[id_ss].rlsd_dttm
            s.txtb_date_unpost          = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');

            s.rcvd_by_user              = s.datalistgrid[id_ss].rcvd_by_user
            s.audit_rcvd_user           = s.datalistgrid[id_ss].audit_rcvd_user
            s.audited_by_user           = s.datalistgrid[id_ss].audited_by_user
            s.posting_rcvd_by_user      = s.datalistgrid[id_ss].posting_rcvd_by_user
            s.posted_by_user            = s.datalistgrid[id_ss].posted_by_user
            s.reviewed_by_user          = s.datalistgrid[id_ss].reviewed_by_user
            s.rlsd_by_user              = s.datalistgrid[id_ss].rlsd_by_user
            s.unposted_by_user          = userid

            s.txtb_group_descr          = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template     = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr       = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from          = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to            = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay            = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay              = s.datalistgrid[id_ss].net_pay
            s.isShowRemarks             = true
            useraction                  = "Unposted"
            useraction2                 = ""
            isAction                    = "unposted"
            s.txtb_voucher_nbr          = s.datalistgrid[id_ss].voucher_nbr
        }
    }

    function Toogle_return(id_ss)
    {
        s.ishowrcvd         = false
        s.ishowrcvd_audit   = false
        s.ishow_audit       = false
        s.ishowrcvd_post    = false
        s.ishow_post        = false
        s.ishow_review      = false
        s.ishowrelease      = false
        s.ishowunpost       = false
        s.ishowreturn       = true
        s.isDisabled        = true
        s.ModalTitle        = "Return Record | " + modalheader + " : " + s.datalistgrid[id_ss].payroll_registry_nbr
        s.LabelToggle       = "Return Date"

        s.isVisibleDateReceived     = true
        s.isVisibleDateRcvdAudit    = true
        s.isVisibleDateAudit        = true
        s.isVisibleDateRcvdPost     = true
        s.isVisibleDatePosted       = true
        s.isVisibleDateReviewed     = true
        s.isVisibleDateRlsd         = true
        s.isVisibleDateUnpost       = true
        s.isVisibleDateReturn       = false
        s.isShowRemarks             = true
        useraction = "Returned"
        useraction2 = ""
        isAction = "returned"

        s.txtb_voucher_nbr          = s.datalistgrid[id_ss].voucher_nbr
        s.txtb_payroll_template     = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
        s.txtb_date_returned        = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
        s.txtb_registry_descr       = s.datalistgrid[id_ss].payroll_registry_descr
        s.txtb_period_from          = s.datalistgrid[id_ss].payroll_period_from
        s.txtb_period_to            = s.datalistgrid[id_ss].payroll_period_to
        s.txtb_gross_pay            = s.datalistgrid[id_ss].gross_pay
        s.txtb_net_pay              = s.datalistgrid[id_ss].net_pay
       
    }

    s.btn_edit_action = function (id_ss) {
        clearentry()

      
        index_update = ""
        index_update = id_ss
        s.txtb_voucher_nbr = s.datalistgrid[id_ss].voucher_nbr;
        s.txtb_registry_nbr = s.datalistgrid[id_ss].payroll_registry_nbr;
        s.isShowRemarks = false
        var dt = s.datalistgrid[id_ss]

        if (s.ddl_payrolltype == "01")
        {
            s.lbl_registry_voucher = "Registry Nbr.:"
            modalheader = "Registry Nbr | "
        }

        else if (s.ddl_payrolltype == "02") {

            s.lbl_registry_voucher = "Voucher Ctrl Nbr.:"
            modalheader = "Voucher Ctrl Nbr | "
        }

        Toogle(id_ss) //Toogle Actions for Receiving,Audit,Posting,Releasing
        
      

        h.post("../cPayAuditPosting/CheckData",
            {
                data: dt, 
                par_payroll_template    : s.ddl_payrolltemplate,
                par_payroll_source      : s.ddl_payrolltype,
                par_employment_type     : s.ddl_employment_type,
                par_action: isAction
            }).then(function (d)
            {

                if (d.data.message == "success")
                {

                    $("#main_modal").modal("show");
                    $('#main_modal').on('shown.bs.modal', function () {
                        $('#txtb_voucher_nbr').focus();

                    });

                    if (s.txtb_voucher_nbr == '')
                    {
                        s.txtb_voucher_nbr = d.data.voucher_nbr
                    }
                    
                }
                

                else
                {
                    if (d.data.message == "fail")
                    {
                        swal("Unable to Update!", "Data has been Updated by Other User/s.", "warning").then(function (willClose) {
                            if (willClose) {
                                document.getElementById("txtb_search_scan").focus()
                                s.txtb_search_scan = ""
                            }
                        });
                    }

                    var tname = "oTable";

                    //var id = s[tname][0].id;

                   

                    var page = $("#datalist_grid").DataTable().page.info().page
                    
                    s[tname].fnDeleteRow(index_update, null, true);
                    s.datalistgrid = DataTable_data(tname)

                    s.datalistgrid.push(d.data.sp_payrollregistryaccounting_hdr_tbl_list)
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)

                    s.oTable.fnPageChange(page)

                    $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                    $("#btn_rcvd").addClass("fa fa-folder-open");

                    $("#btn_rcvd_audit").removeClass("fa fa-spinner fa-spin");
                    $("#btn_rcvd_audit").addClass("fa fa-folder");

                    $("#btn_audit").removeClass("fa fa-spinner fa-spin");
                    $("#btn_audit").addClass("fa fa-calculator");

                    $("#btn_rcvd_post").removeClass("fa fa-spinner fa-spin");
                    $("#btn_rcvd_post").addClass("fa fa-suitcase");

                    $("#btn_post").removeClass("fa fa-spinner fa-spin");
                    $("#btn_post").addClass("fa fa-chain");

                    $("#btn_review").removeClass("fa fa-spinner fa-spin");
                    $("#btn_review").addClass("fa fa-eye");

                    $("#btn_release").removeClass("fa fa-spinner fa-spin");
                    $("#btn_release").addClass("fa fa-check-square-o");

                    $("#btn_unpost").removeClass("fa fa-spinner fa-spin");
                    $("#btn_unpost").addClass("fa fa-chain-broken");
                    $("#main_modal").modal("hide");

                }


            })

        
        
    }

    
    //******************************************//
    //***Toogle Function for Receiving,Audit,Posting and Releasing****//
    //******************************************// 
    function Toogle(id_ss)
    {
        s.isVisibleDateReturn = true
        s.ishowreturn = false
        if (s.datalistgrid[id_ss].rcvd_dttm == "" && s.datalistgrid[id_ss].rcvd_flag == true) {
            s.ishowrcvd              = true
            s.ishowrcvd_audit        = false
            s.ishow_audit            = false
            s.ishowrcvd_post         = false
            s.ishow_post             = false
            s.ishow_review           = false
            s.ishowrelease           = false
            s.ishowunpost            = false
            s.ModalTitle             = "Receive Record " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle            = "Date Received"
            s.isDisabled             = false
            s.isVisibleDateReceived  = false
            s.isVisibleDateRcvdAudit = true
            s.isVisibleDateAudit     = true
            s.isVisibleDateRcvdPost  = true
            s.isVisibleDatePosted    = true
            s.isVisibleDateReviewed  = true
            s.isVisibleDateRlsd      = true
            s.isVisibleDateUnpost    = true

            

            s.txtb_date_rcvd = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
            s.txtb_audit_rcvd        = ""
            s.txtb_date_audited      = ""
            s.txtb_post_rcvd         = ""
            s.txtb_date_posted       = ""
            s.txtb_date_reviewed     = ""
            s.txtb_date_rlsd         = ""
            s.txtb_date_unpost       = ""

            s.rcvd_by_user           = userid
            s.audit_rcvd_user        = ""      
            s.audited_by_user        = ""
            s.posting_rcvd_by_user   = ""
            s.posted_by_user         = ""
            s.reviewed_by_user       = ""
            s.rlsd_by_user           = ""
            s.unposted_by_user       = ""

            s.txtb_group_descr       = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr    = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from       = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to         = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay         = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay           = s.datalistgrid[id_ss].net_pay

            useraction = "Received"
            useraction2 = ""
            isAction = "receive"

        }

        else if (s.datalistgrid[id_ss].audit_rcvd_dttm == "" && s.datalistgrid[id_ss].rcvd_audit_flag == true) {
            s.ishowrcvd              = false
            s.ishowrcvd_audit        = true
            s.ishow_audit            = false
            s.ishowrcvd_post         = false
            s.ishow_post             = false
            s.ishow_review           = false
            s.ishowrelease           = false
            s.ishowunpost            = false
            s.ModalTitle             = "Receive Record for Auditing | " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle            = "Received for Auditing"
            s.isDisabled             = true;

            s.isVisibleDateReceived  = true
            s.isVisibleDateRcvdAudit = false
            s.isVisibleDateAudit     = true
            s.isVisibleDateRcvdPost  = true
            s.isVisibleDateReviewed  = true
            s.isVisibleDatePosted    = true
            s.isVisibleDateRlsd      = true
            s.isVisibleDateUnpost    = true


            s.txtb_date_rcvd        = s.datalistgrid[id_ss].rcvd_dttm
            s.txtb_audit_rcvd       = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
            s.txtb_date_audited     = ""
            s.txtb_post_rcvd        = ""
            s.txtb_date_posted      = ""
            s.txtb_date_reviewed    = ""
            s.txtb_date_rlsd        = ""
            s.txtb_date_unpost      = ""

            s.rcvd_by_user          = s.datalistgrid[id_ss].rcvd_by_user
            s.audit_rcvd_user       = userid
            s.audited_by_user       = ""
            s.posting_rcvd_by_user  = ""
            s.posted_by_user        = ""
            s.reviewed_by_user      = ""
            s.rlsd_by_user          = ""
            s.unposted_by_user      = ""

            s.txtb_group_descr      = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr   = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from      = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to        = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay        = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay          = s.datalistgrid[id_ss].net_pay
            

            useraction              = "Received"
            useraction2             = "For Auditing"
            isAction                = "receive_audit"
        }

        else if (s.datalistgrid[id_ss].audited_dttm == "" && s.datalistgrid[id_ss].audit_flag == true) {
            s.ishowrcvd             = false
            s.ishowrcvd_audit       = false
            s.ishow_audit           = true
            s.ishowrcvd_post        = false
            s.ishow_post            = false
            s.ishow_review          = false
            s.ishowrelease          = false
            s.ishowunpost           = false
            s.ModalTitle            = "Audit Record | " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle           = "Date Audited"
            s.isDisabled            = true;

            s.isVisibleDateReceived  = true
            s.isVisibleDateRcvdAudit = true
            s.isVisibleDateAudit     = false
            s.isVisibleDateRcvdPost  = true
            s.isVisibleDatePosted    = true
            s.isVisibleDateReviewed    = true
            s.isVisibleDateRlsd      = true
            s.isVisibleDateUnpost    = true

            s.txtb_date_rcvd        = s.datalistgrid[id_ss].rcvd_dttm
            s.txtb_audit_rcvd       = s.datalistgrid[id_ss].audit_rcvd_dttm
            s.txtb_date_audited     = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
            s.txtb_post_rcvd        = ""
            s.txtb_date_posted      = ""
            s.txtb_date_reviewed      = ""
            s.txtb_date_rlsd        = ""
            s.txtb_date_unpost      = ""

            s.rcvd_by_user          = s.datalistgrid[id_ss].rcvd_by_user
            s.audit_rcvd_user       = s.datalistgrid[id_ss].audit_rcvd_user
            s.audited_by_user       = userid
            s.posting_rcvd_by_user  = ""
            s.posted_by_user        = ""
            s.reviewed_by_user      = ""
            s.rlsd_by_user          = ""
            s.unposted_by_user      = ""


            s.txtb_group_descr      = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr   = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from      = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to        = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay        = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay          = s.datalistgrid[id_ss].net_pay

            useraction = "Audited"
            useraction2 = ""
            isAction = "audit"
        }

        else if (s.datalistgrid[id_ss].posting_rcvd_dttm == "" && s.datalistgrid[id_ss].rcvd_post_flag == true) {
            s.ishowrcvd            = false
            s.ishowrcvd_audit      = false
            s.ishow_audit          = false
            s.ishowrcvd_post       = true
            s.ishow_post           = false
            s.ishow_review         = false
            s.ishowrelease         = false
            s.ishowunpost          = false
            s.ModalTitle           = "Receive Record for Posting | " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle          = "Received for Posting"
            s.isDisabled           = true;

            s.isVisibleDateReceived  = true
            s.isVisibleDateRcvdAudit = true
            s.isVisibleDateAudit     = true
            s.isVisibleDateRcvdPost  = false
            s.isVisibleDatePosted    = true
            s.isVisibleDateReviewed  = true
            s.isVisibleDateRlsd      = true
            s.isVisibleDateUnpost    = true

            s.txtb_date_rcvd         = s.datalistgrid[id_ss].rcvd_dttm
            s.txtb_audit_rcvd        = s.datalistgrid[id_ss].audit_rcvd_dttm
            s.txtb_date_audited      = s.datalistgrid[id_ss].audited_dttm
            s.txtb_post_rcvd         = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
            s.txtb_date_posted       = ""
            s.txtb_date_posted         = ""
            s.txtb_date_rlsd         = ""
            s.txtb_date_unpost       = ""

            s.rcvd_by_user           = s.datalistgrid[id_ss].rcvd_by_user
            s.audit_rcvd_user        = s.datalistgrid[id_ss].audit_rcvd_user
            s.audited_by_user        = s.datalistgrid[id_ss].audited_by_user
            s.posting_rcvd_by_user   = userid
            s.posted_by_user         = ""
            s.reviewed_by_user       = ""
            s.rlsd_by_user           = ""
            s.unposted_by_user       = ""

            s.txtb_group_descr      = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr   = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from      = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to        = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay        = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay          = s.datalistgrid[id_ss].net_pay

            useraction              = "Received"
            useraction2             = "For Posting"
            isAction                = "receive_post"
            prev_status             = s.datalistgrid[id_ss].post_status
        }

        else if (s.datalistgrid[id_ss].posted_dttm == "" && s.datalistgrid[id_ss].post_flag == true) {
            s.ishowrcvd             = false
            s.ishowrcvd_audit       = false
            s.ishow_audit           = false
            s.ishowrcvd_post        = false
            s.ishow_post            = true
            s.ishow_review          = false
            s.ishowrelease          = false
            s.ishowunpost           = false
            s.ModalTitle            = "Post Record | " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle           = "Date Posted"
            s.isDisabled            = true;

            s.isVisibleDateReceived  = true
            s.isVisibleDateRcvdAudit = true
            s.isVisibleDateAudit     = true
            s.isVisibleDateRcvdPost  = true
            s.isVisibleDatePosted    = false
            s.isVisibleDateReviewed  = true
            s.isVisibleDateRlsd      = true
            s.isVisibleDateUnpost    = true
            

            s.txtb_date_rcvd        = s.datalistgrid[id_ss].rcvd_dttm
            s.txtb_audit_rcvd       = s.datalistgrid[id_ss].audit_rcvd_dttm
            s.txtb_date_audited     = s.datalistgrid[id_ss].audited_dttm
            s.txtb_post_rcvd        = s.datalistgrid[id_ss].posting_rcvd_dttm
            s.txtb_date_posted      = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
            s.txtb_date_reviewed    = ""
            s.txtb_date_rlsd        = ""
            s.txtb_date_unpost      = ""

            s.rcvd_by_user          = s.datalistgrid[id_ss].rcvd_by_user
            s.audit_rcvd_user       = s.datalistgrid[id_ss].audit_rcvd_user
            s.audited_by_user       = s.datalistgrid[id_ss].audited_by_user
            s.posting_rcvd_by_user  = s.datalistgrid[id_ss].posting_rcvd_by_user
            s.posted_by_user        = userid
            s.reviewed_by_user      = ""
            s.rlsd_by_user          = ""
            s.unposted_by_user      = ""

            s.txtb_group_descr      = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr   = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from      = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to        = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay        = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay          = s.datalistgrid[id_ss].net_pay

            useraction = "Posted"
            useraction2 = ""
            isAction = "post"

        }

        

        else if (s.datalistgrid[id_ss].review_dttm == "") {
            s.ishowrcvd             = false
            s.ishowrcvd_audit       = false
            s.ishow_audit           = false
            s.ishowrcvd_post        = false
            s.ishow_post            = false
            s.ishow_review          = true
            s.ishowrelease          = false
            s.ishowunpost           = false
            s.ModalTitle            = "Review Record | " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle           = "Reviewed Date"

            s.isDisabled = true;


            s.isVisibleDateReceived  = true
            s.isVisibleDateRcvdAudit = true
            s.isVisibleDateAudit     = true
            s.isVisibleDateRcvdPost  = true
            s.isVisibleDatePosted    = true
            s.isVisibleDateReviewed  = false
            s.isVisibleDateRlsd      = true
            s.isVisibleDateUnpost    = true


            s.txtb_date_rcvd        = s.datalistgrid[id_ss].rcvd_dttm
            s.txtb_audit_rcvd       = s.datalistgrid[id_ss].audit_rcvd_dttm
            s.txtb_date_audited     = s.datalistgrid[id_ss].audited_dttm
            s.txtb_post_rcvd        = s.datalistgrid[id_ss].posting_rcvd_dttm
            s.txtb_date_posted      = s.datalistgrid[id_ss].posted_dttm
            s.txtb_date_reviewed    = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
            s.txtb_date_rlsd        = ""
            s.txtb_date_unpost      = ""

            s.rcvd_by_user          = s.datalistgrid[id_ss].rcvd_by_user
            s.audit_rcvd_user       = s.datalistgrid[id_ss].audit_rcvd_user
            s.audited_by_user       = s.datalistgrid[id_ss].audited_by_user
            s.posting_rcvd_by_user  = s.datalistgrid[id_ss].posting_rcvd_by_user
            s.posted_by_user        = s.datalistgrid[id_ss].posted_by_user
            s.reviewed_by_user      = userid
            s.rlsd_by_user          = ""
            s.unposted_by_user      = ""

            s.txtb_group_descr = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay = s.datalistgrid[id_ss].net_pay
            useraction = "Reviewed"
            useraction2 = ""
            isAction = "review"

        }

        else if (s.datalistgrid[id_ss].rlsd_dttm == "" && s.datalistgrid[id_ss].release_flag == true) {
            s.ishowrcvd             = false
            s.ishowrcvd_audit       = false
            s.ishow_audit           = false
            s.ishowrcvd_post        = false
            s.ishow_post            = false
            s.ishow_review          = false
            s.ishowrelease          = true
            s.ishowunpost           = false
            s.ModalTitle            = "Release Record | " + modalheader +" : " + s.datalistgrid[id_ss].payroll_registry_nbr
            s.LabelToggle           = "Released Date"

            s.isDisabled            = true;


            s.isVisibleDateReceived     = true
            s.isVisibleDateRcvdAudit    = true
            s.isVisibleDateAudit        = true
            s.isVisibleDateRcvdPost     = true
            s.isVisibleDatePosted       = true
            s.isVisibleDateReviewed     = true
            s.isVisibleDateRlsd         = false
            s.isVisibleDateUnpost       = true


            s.txtb_date_rcvd            = s.datalistgrid[id_ss].rcvd_dttm
            s.txtb_audit_rcvd           = s.datalistgrid[id_ss].audit_rcvd_dttm
            s.txtb_date_audited         = s.datalistgrid[id_ss].audited_dttm
            s.txtb_post_rcvd            = s.datalistgrid[id_ss].posting_rcvd_dttm
            s.txtb_date_posted          = s.datalistgrid[id_ss].posted_dttm
            s.txtb_date_reviewed        = s.datalistgrid[id_ss].review_dttm
            s.txtb_date_rlsd            = $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
            s.txtb_date_unpost          = ""

            s.rcvd_by_user              = s.datalistgrid[id_ss].rcvd_by_user
            s.audit_rcvd_user           = s.datalistgrid[id_ss].audit_rcvd_user
            s.audited_by_user           = s.datalistgrid[id_ss].audited_by_user
            s.posting_rcvd_by_user      = s.datalistgrid[id_ss].posting_rcvd_by_user
            s.posted_by_user            = s.datalistgrid[id_ss].posted_by_user
            s.reviewed_by_user          = s.datalistgrid[id_ss].reviewed_by_user
            s.rlsd_by_user              = userid
            s.unposted_by_user          = ""

            s.txtb_group_descr = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_payroll_template = (s.payrolltemplate.select(s.ddl_payrolltemplate, "payrolltemplate_code").payrolltemplate_descr)
            s.txtb_registry_descr = s.datalistgrid[id_ss].payroll_registry_descr
            s.txtb_period_from = s.datalistgrid[id_ss].payroll_period_from
            s.txtb_period_to = s.datalistgrid[id_ss].payroll_period_to
            s.txtb_gross_pay = s.datalistgrid[id_ss].gross_pay
            s.txtb_net_pay = s.datalistgrid[id_ss].net_pay
            useraction = "Released"
            useraction2 = ""
            isAction = "release"

        }

        else {
            swal({
                title: "Not Available",
                text: "This payroll is no longer available!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
        }
        
    }

    //******************************************//
    //***Action Button for Sorting****//
    //******************************************// 
   
    s.isSortValue = function (sort_val)
    {

        if (sort_value != sort_val) {
            sort_order = "asc"
        }

        else
        {
            if (sort_order == "asc")
            {
                sort_order = "desc"

            }

            else
            {
                sort_order = "asc"
            }
        }

        if (sort_val == 2)
        {
            if (sort_order == "asc")
            {
                sort_order = "desc"

            }

            else
            {
                sort_order = "asc"
            }

            sort_val = 1
        }


        sort_value = sort_val


    }
    


  
    //**************************************//
    //***Update-Database-Function****//
    //**************************************//
    s.UpdateFromDatabase = function () {

        var dt = s.datalistgrid[index_update]
       

        if (isdataValidated()) {



            $("#btn_rcvd").removeClass("fa fa-folder-open");
            $("#btn_rcvd").addClass("fa fa-spinner fa-spin");

            $("#btn_rcvd_audit").removeClass("fa fa-folder");
            $("#btn_rcvd_audit").addClass("fa fa-spinner fa-spin");

            $("#btn_audit").removeClass("fa fa-calculator");
            $("#btn_audit").addClass("fa fa-spinner fa-spin");


            $("#btn_rcvd_post").removeClass("fa fa-suitcase");
            $("#btn_rcvd_post").addClass("fa fa-spinner fa-spin");

            $("#btn_post").removeClass("fa fa-chain");
            $("#btn_post").addClass("fa fa-spinner fa-spin");
            
            $("#btn_review").removeClass("fa fa-eye");
            $("#btn_review").addClass("fa fa-spinner fa-spin");
            
            $("#btn_release").removeClass("fa fa-check-square-o");
            $("#btn_release").addClass("fa fa-spinner fa-spin");

            $("#btn_unpost").removeClass("fa fa-chain-broken");
            $("#btn_unpost").addClass("fa fa-spinner fa-spin");

            
            if (s.datalistgrid[index_update].tran_year == "")
            {
                s.datalistgrid[index_update].tran_year = new Date().getFullYear().toString()
            }

            h.post("../cPayAuditPosting/CheckData",
                {
                    data: dt,
                    par_payroll_template: $('#ddl_payrolltemplate').val(),
                    par_payroll_source: $('#ddl_payrolltype').val(),
                    par_employment_type: $('#ddl_employment_type').val(),
                    par_action: isAction
                }).then(function (d)
                {

                    if (d.data.message == "success") {

                        h.post("../cPayAuditPosting/UpdateFromDatabase", {

                            par_voucher_nbr: s.txtb_voucher_nbr
                            , par_tran_year: s.datalistgrid[index_update].tran_year
                            , par_payroll_registry_nbr: s.txtb_registry_nbr
                            , par_payroll_registry_descr: s.txtb_registry_descr
                            , par_payroll_group_nbr: s.datalistgrid[index_update].payroll_group_nbr
                            , par_department_code: s.datalistgrid[index_update].department_code
                            , par_rcvd_dttm: s.txtb_date_rcvd
                            , par_rcvd_by_user: s.rcvd_by_user
                            , par_audit_rcvd_dttm: s.txtb_audit_rcvd
                            , par_audit_rcvd_user: s.audit_rcvd_user
                            , par_audited_dttm: s.txtb_date_audited
                            , par_audited_by_user: s.audited_by_user
                            , par_posting_rcvd_dttm: s.txtb_post_rcvd
                            , par_posting_rcvd_by_user: s.posting_rcvd_by_user
                            , par_posted_dttm: s.txtb_date_posted
                            , par_posted_by_user: s.posted_by_user
                            , par_review_dttm: s.txtb_date_reviewed
                            , par_reviewed_by_user: s.reviewed_by_user
                            , par_rlsd_dttm: s.txtb_date_rlsd
                            , par_rlsd_by_user: s.rlsd_by_user
                            , par_unposted_dttm: s.txtb_date_unpost
                            , par_unposted_by_user: s.unposted_by_user
                            , par_remarks: s.txtb_remarks
                            , par_payroll_source: $('#ddl_payrolltype').val()
                            , par_employment_type: $('#ddl_employment_type').val()
                            , par_payroll_template: $('#ddl_payrolltemplate').val()
                            , par_payroll_year: $('#ddl_year').val()
                            , par_payroll_month: $('#ddl_month').val()

                        }).then(function (d) {

                            var space = "";
                                
                            if (useraction2 == "")
                            {
                                space = "";
                            }

                            else
                            {
                                space = " ";
                            }
                            
                            if (d.data.message == "success")
                            {
                                swal("Successfully " + useraction + "!", "Existing record successfully " + useraction + space + useraction2 + "!", "success")
                                    .then(function (willClose) {
                                        if (willClose)
                                        {
                                            document.getElementById("txtb_search_scan").focus()
                                            s.txtb_search_scan = ""
                                        }
                                    });

                                $("#main_modal").modal("hide");

                                $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                                $("#btn_rcvd").addClass("fa fa-folder-open");

                                $("#btn_rcvd_audit").removeClass("fa fa-spinner fa-spin");
                                $("#btn_rcvd_audit").addClass("fa fa-folder");

                                $("#btn_audit").removeClass("fa fa-spinner fa-spin");
                                $("#btn_audit").addClass("fa fa-calculator");

                                $("#btn_rcvd_post").removeClass("fa fa-spinner fa-spin");
                                $("#btn_rcvd_post").addClass("fa fa-suitcase");

                                $("#btn_post").removeClass("fa fa-spinner fa-spin");
                                $("#btn_post").addClass("fa fa-chain");

                                $("#btn_review").removeClass("fa fa-spinner fa-spin");
                                $("#btn_review").addClass("fa fa-eye");

                                $("#btn_release").removeClass("fa fa-spinner fa-spin");
                                $("#btn_release").addClass("fa fa-check-square-o");

                                $("#btn_unpost").removeClass("fa fa-spinner fa-spin");
                                $("#btn_unpost").addClass("fa fa-chain-broken");
                                updateListGrid()

                                
                            }
                            

                            //else if (d.data.message == "fail_receive") {
                            //    swal("Saving error!", "Data not save another User Already Received this Record.", "error");

                            //    $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                            //    $("#btn_rcvd").addClass("fa fa-folder-open");

                            //}

                            //else if (d.data.message == "fail_update") {
                            //    swal("Saving error!", "Data not save another User Already Updated this Record.", "error");

                            //    $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                            //    $("#btn_rcvd").addClass("fa fa-folder-open");
                            //}

                            else
                            {
                                swal("Saving error!", "Data not save duplicate Voucher Number", "error");

                                $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                                $("#btn_rcvd").addClass("fa fa-folder-open");

                                $("#btn_rcvd_audit").removeClass("fa fa-spinner fa-spin");
                                $("#btn_rcvd_audit").addClass("fa fa-folder");

                                $("#btn_audit").removeClass("fa fa-spinner fa-spin");
                                $("#btn_audit").addClass("fa fa-calculator");

                                $("#btn_rcvd_post").removeClass("fa fa-spinner fa-spin");
                                $("#btn_rcvd_post").addClass("fa fa-suitcase");

                                $("#btn_post").removeClass("fa fa-spinner fa-spin");
                                $("#btn_post").addClass("fa fa-chain");

                                $("#btn_review").removeClass("fa fa-spinner fa-spin");
                                $("#btn_review").addClass("fa fa-eye");

                                $("#btn_release").removeClass("fa fa-spinner fa-spin");
                                $("#btn_release").addClass("fa fa-check-square-o");

                                $("#btn_unpost").removeClass("fa fa-spinner fa-spin");
                                $("#btn_unpost").addClass("fa fa-chain-broken");
                                $("#main_modal").modal("hide");
                            }
                        })

                    }

                    else {
                        if (d.data.message == "fail") {
                            swal("Unable to Update!", "Data has been Updated by Other User/s.", "warning").then(function (willClose) {
                                if (willClose) {
                                    document.getElementById("txtb_search_scan").focus()
                                    s.txtb_search_scan = ""
                                }
                            });
                        }

                        var tname = "oTable";

                        var id = s[tname][0].id;
                        //var page = $("#" + id).DataTable().page.info().page

                        s[tname].fnDeleteRow(index_update, null, true);
                        s.datalistgrid = DataTable_data(tname)

                        s.datalistgrid.push(d.data.sp_payrollregistryaccounting_hdr_tbl_list)
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)

                        $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd").addClass("fa fa-folder-open");

                        $("#btn_rcvd_audit").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd_audit").addClass("fa fa-folder");

                        $("#btn_audit").removeClass("fa fa-spinner fa-spin");
                        $("#btn_audit").addClass("fa fa-calculator");

                        $("#btn_rcvd_post").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd_post").addClass("fa fa-suitcase");

                        $("#btn_post").removeClass("fa fa-spinner fa-spin");
                        $("#btn_post").addClass("fa fa-chain");

                        $("#btn_review").removeClass("fa fa-spinner fa-spin");
                        $("#btn_review").addClass("fa fa-eye");

                        $("#btn_release").removeClass("fa fa-spinner fa-spin");
                        $("#btn_release").addClass("fa fa-check-square-o");

                        $("#btn_unpost").removeClass("fa fa-spinner fa-spin");
                        $("#btn_unpost").addClass("fa fa-chain-broken");
                        $("#main_modal").modal("hide");

                    }


                })
           
            
        }

        

    }

    function updateListGrid()
    {

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        var post_status_descrupdate = "";
        var post_status_update = "";
        
        s.datalistgrid[index_update].voucher_nbr            = s.txtb_voucher_nbr
        s.datalistgrid[index_update].payroll_registry_nbr   = s.txtb_registry_nbr
        s.datalistgrid[index_update].rcvd_dttm              = s.txtb_date_rcvd
        s.datalistgrid[index_update].rcvd_by_user           = s.rcvd_by_user
        s.datalistgrid[index_update].audit_rcvd_dttm        = s.txtb_audit_rcvd
        s.datalistgrid[index_update].audit_rcvd_user        = s.audit_rcvd_user
        s.datalistgrid[index_update].audited_dttm           = s.txtb_date_audited
        s.datalistgrid[index_update].audited_by_user        = s.audited_by_user
        s.datalistgrid[index_update].posting_rcvd_dttm      = s.txtb_post_rcvd
        s.datalistgrid[index_update].posting_rcvd_by_user   = s.posting_rcvd_by_user
        s.datalistgrid[index_update].posted_dttm            = s.txtb_date_posted
        s.datalistgrid[index_update].posted_by_user         = s.posted_by_user
        s.datalistgrid[index_update].review_dttm            = s.txtb_date_reviewed
        s.datalistgrid[index_update].reviewed_by_user       = s.reviewed_by_user
        s.datalistgrid[index_update].rlsd_dttm              = s.txtb_date_rlsd
        s.datalistgrid[index_update].rlsd_by_user           = s.rlsd_by_user
        

        s.datalistgrid[index_update].unposted_dttm          = s.txtb_date_unpost
        s.datalistgrid[index_update].unposted_by_user       = s.unposted_by_user

        if (s.txtb_date_unpost != "")
        {
            
            s.datalistgrid[index_update].posting_rcvd_dttm    = ""
            s.datalistgrid[index_update].posting_rcvd_by_user = ""
            s.datalistgrid[index_update].posted_dttm          = ""
            s.datalistgrid[index_update].posted_by_user       = ""
            s.datalistgrid[index_update].review_dttm          = ""
            s.datalistgrid[index_update].reviewed_by_user     = ""
        }


        if (s.datalistgrid[index_update].posted_dttm != "")
        {
            post_status_descrupdate = ""


            
            post_status_update = "Y"
            if (s.datalistgrid[index_update].review_dttm != "" && s.datalistgrid[index_update].rlsd_dttm == "")
            {
                post_status_descrupdate = "REVIEWED"
            }

            else if (s.datalistgrid[index_update].rlsd_dttm != "")
            {
                post_status_descrupdate = "RELEASED"
            }

            else
            {
                post_status_descrupdate = "POSTED"
            }
            

            if (prev_status == "W")
            {
                post_status_descrupdate = "W/RMT. " + post_status_descrupdate
                
            }
            

            
            

        }

        else
        {
            
            if (s.datalistgrid[index_update].post_status == "W")
            {
                post_status_update = "W"

                if (s.datalistgrid[index_update].rcvd_dttm != "" || s.datalistgrid[index_update].audit_rcvd_dttm != "" || s.datalistgrid[index_update].posting_rcvd_dttm != "") {
                    post_status_descrupdate = "W/RMT. RECEIVED"
                }

                if (s.datalistgrid[index_update].audited_dttm != "" && s.datalistgrid[index_update].posting_rcvd_dttm == "") {
                    post_status_descrupdate = "W/RMT. AUDITED"
                }
                
            }

            else
            {
               
                post_status_descrupdate = ""
                if ((prev_status == "R" || prev_status == "") && s.datalistgrid[index_update].post_status != "W")
                {
                    post_status_update = "R"
                }
                else
                {
                    post_status_update = "W"
                }
                
               
                post_status_descrupdate = post_status_descrupdate + "RELEASED"

                if (s.datalistgrid[index_update].rcvd_dttm != "" || s.datalistgrid[index_update].audit_rcvd_dttm != "" || s.datalistgrid[index_update].posting_rcvd_dttm != "")
                {
                    post_status_descrupdate = "RECEIVED"
                }

                if (s.datalistgrid[index_update].audited_dttm != "" && s.datalistgrid[index_update].posting_rcvd_dttm == "")
                {
                    post_status_descrupdate = "AUDITED"
                }
                

                if (post_status_update == "W")
                {
                    post_status_descrupdate = "W/RMT." + post_status_descrupdate
                }
                
                
                

            }
            
        }

        s.datalistgrid[index_update].payroll_registry_descr = s.txtb_registry_descr
        
        s.datalistgrid[index_update].post_status        = post_status_update
        s.datalistgrid[index_update].post_status_descr  = post_status_descrupdate

        s.oTable.fnClearTable();

        page_value = info.page

        s.oTable.fnSort([[sort_value, sort_order]]);
        
        s.oTable.fnAddData(s.datalistgrid);

        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) 
        {
            if (get_page(s.txtb_voucher_nbr) == false)
            {
                s.oTable.fnPageChange(x);
            }
            else
            {
                break;
            }
        }

        //s.search_box = s.txtb_voucher_nbr
    }
    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(voucher_nbr) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0)
                {
                    if ($(this).text() == voucher_nbr)
                    {
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
        if (s.txtb_voucher_nbr == "")
        {
            FieldValidationColorChanged(true, "txtb_voucher_nbr")
            validatedSaved = false;
        }
        if (s.txtb_date_rcvd == "" && s.isVisibleDateReceived == false) {
            FieldValidationColorChanged(true, "txtb_date_rcvd")
            validatedSaved = false;
        }

        else if (s.txtb_audit_rcvd == "" && s.isVisibleDateRcvdAudit == false) {
            FieldValidationColorChanged(true, "txtb_audit_rcvd")
            validatedSaved = false;
        }

        else if (s.txtb_date_audited == "" && s.isVisibleDateAudit == false) {
            FieldValidationColorChanged(true, "txtb_date_audited")
            validatedSaved = false;
        }

        else if (s.txtb_post_rcvd == "" && s.isVisibleDateRcvdPost == false) {
            FieldValidationColorChanged(true, "txtb_post_rcvd")
            validatedSaved = false;
        }

        else if (s.txtb_date_posted == "" && s.isVisibleDatePosted == false) {
            FieldValidationColorChanged(true, "txtb_date_posted")
            validatedSaved = false;
        }

        else if (s.txtb_date_reviewed == "" && s.isVisibleDateReviewed == false) {
            FieldValidationColorChanged(true, "txtb_date_reviewed")
            validatedSaved = false;
        }

        else if (s.txtb_date_rlsd == "" && s.isVisibleDateRlsd == false)
        {
            FieldValidationColorChanged(true, "txtb_date_rlsd")
            validatedSaved = false;

        }

        else if (s.txtb_date_unpost == "" && s.isVisibleDateUnpost == false)
        {
            FieldValidationColorChanged(true, "txtb_date_unpost")
            validatedSaved = false;
        }

        else if (s.txtb_date_returned == "" && s.isVisibleDateReturn == false) {
            FieldValidationColorChanged(true, "txtb_date_returned")
            validatedSaved = false;
        }
        
        return validatedSaved;

    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {
       
        if (pMode)
            switch (pObjectName)
            {
                case "txtb_voucher_nbr":
                    {
                        $("#txtb_voucher_nbr").addClass('require-field')
                        s.lbl_requiredfield1 = "required field!"
                        break;
                    }

                case "txtb_date_rcvd":
                    {
                        $("#txtb_date_rcvd").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "txtb_audit_rcvd":
                    {
                        $("#txtb_audit_rcvd").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }
                case "txtb_date_audited":
                    {
                        $("#txtb_date_audited").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "txtb_post_rcvd":
                    {
                        $("#txtb_post_rcvd").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "txtb_date_posted":
                    {
                        $("#txtb_date_posted").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "txtb_date_reviewed":
                    {
                        $("#txtb_date_reviewed").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "txtb_date_rlsd":
                    {
                        $("#txtb_date_rlsd").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "txtb_date_unpost":
                    {
                        $("#txtb_date_unpost").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

                case "txtb_date_returned":
                    {
                        $("#txtb_date_returned").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }

            }
        else if (!pMode) {
            switch (pObjectName) {

                case "ALL":
                    {
                        s.lbl_requiredfield1 = "";
                        $("#txtb_voucher_nbr").removeClass('require-field')

                        s.lbl_requiredfield2 = "";
                        $("#txtb_date_rcvd").removeClass('require-field')
                        
                        $("#txtb_audit_rcvd").removeClass('require-field')
                        
                        $("#txtb_date_audited").removeClass('require-field')

                        $("#txtb_post_rcvd").removeClass('require-field')
                        
                        $("#txtb_date_posted").removeClass('require-field')
                        
                        $("#txtb_date_reviewed").removeClass('require-field')
                        
                        $("#txtb_date_rlsd").removeClass('require-field')
                        
                        $("#txtb_date_unpost").removeClass('require-field')
                        
                        $("#txtb_date_returned").removeClass('require-field')


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
        $("#modal_print").modal("show")
        
        //$("#loading_data").modal("show")


        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        h.post("../cPayAuditPosting/PreviousValuesonPage_cPayRegistry",
            {
                par_year: s.ddl_year
                , par_month: s.ddl_month
                , par_registry_nbr: s.datalistgrid[id_ss].payroll_registry_nbr
                , par_emp_type: $('#ddl_employment_type').val()
                , par_template: s.ddl_payrolltemplate
                , par_group: s.datalistgrid[id_ss].payroll_group_nbr
                , par_payrolltype: $('#ddl_payrolltype').val()
                , par_department: s.datalistgrid[id_ss].department_code
                , par_show_entries: $('#ddl_show_entries').val()
                , par_page_nbr: info.page
                , par_search: s.search_box
                , par_sort_value: sort_value
                , par_sort_order: sort_order
            }).then(function (d) {

                h.post("../cPayAuditPosting/RetrieveReportFile",
                    {
                        par_template_code: $('#ddl_payrolltemplate option:selected').val()
                    }).then(function (d) {

                        s.reporttemplate = d.data.reportfile
                    })
            })



        

    }

    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_print_action2 = function ()
    {
        var id_ss
        id_ss = index_update


        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"

        var ReportPath = "~/Reports/"
        var sp = ""
        var parameters = ""


        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        h.post("../cPayAuditPosting/PreviousValuesonPage_cPayRegistry",
            {
                par_year: s.ddl_year
                , par_month: s.ddl_month
                , par_registry_nbr: s.datalistgrid[id_ss].payroll_registry_nbr
                , par_emp_type: $('#ddl_employment_type').val()
                , par_template: s.ddl_payrolltemplate
                , par_group: s.datalistgrid[id_ss].payroll_group_nbr
                , par_payrolltype: $('#ddl_payrolltype').val()
                , par_department: s.datalistgrid[id_ss].department_code
                , par_show_entries: $('#ddl_show_entries').val()
                , par_page_nbr: info.page
                , par_search: s.search_box
                , par_sort_value: sort_value
                , par_sort_order: sort_order
            }).then(function (d) {

                h.post("../cPayAuditPosting/SelectReportFile",
                    {

                        par_template_code: $('#ddl_reporttemplate option:selected').val()

                    }).then(function (d) {

                        //s.reporttemplate = d.data.reportfile

                        ReportPath = ReportPath + d.data.reportfile.report_filename

                        switch ($('#ddl_reporttemplate option:selected').val()) {
                            case "105": // Obligation Request (OBR) - For Regular 
                            case "205": // Obligation Request (OBR) - For Casual
                            case "305": // Obligation Request (OBR) - For Job-Order
                                sp = "sp_payrollregistry_obr_rep";
                                //url = "/printView/printView.aspx?id=~/Reports/" + printreport + "," + procedure + ",par_payroll_year," + ddl_year.SelectedValue.ToString().Trim() + ",par_payroll_registry_nbr," + lnkPrint.CommandArgument.Split(',')[0].ToString().Trim() + ",par_payrolltemplate_code," + ddl_payroll_template.SelectedValue.ToString().Trim();
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            //---- START OF REGULAR REPORTS

                            case "007": // Summary Monthly Salary  - For Regular 
                                sp = "sp_payrollregistry_salary_re_ce_rep";
                                //url = "/printView/printView.aspx?id=~/Reports/" + printreport + "," + procedure + ",par_payroll_year," + ddl_year.SelectedValue.ToString().Trim() + ",par_payroll_registry_nbr," + lnkPrint.CommandArgument.Split(',')[0].ToString().Trim() + ",par_payrolltemplate_code," + ddl_select_report.SelectedValue.ToString().Trim();
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "101": // Mandatory Deduction  - For Regular 

                                sp = "sp_payrollregistry_salary_re_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "102": // Optional Deduction Page 1 - For Regular 
                                sp = "sp_payrollregistry_salary_re_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "106": // Optional Deduction Page 2 - For Regular 
                                sp = "sp_payrollregistry_salary_re_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "103": // Loan Deduction Page 1 - For Regular 
                                sp = "sp_payrollregistry_salary_re_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "107": // Loan Deduction Page 2 - For Regular 
                                sp = "sp_payrollregistry_salary_re_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "104": // Attachment - For Monthly Salary
                                sp = "sp_payrollregistry_salary_re_attach_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "033": // Salary Differential - For Regular 
                                sp = "sp_payrollregistry_salary_diff_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            //---- END OF REGULAR REPORTS

                            //---- START OF CASUAL REPORTS

                            case "008": // Summary Monthly Salary  - For Casual 
                                sp = "sp_payrollregistry_salary_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "206": // Mandatory Deduction  -  For Casual 
                                sp = "sp_payrollregistry_salary_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "207": // Optional Deduction Page 1 - For Casual 
                                sp = "sp_payrollregistry_salary_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "208": // Optional Deduction Page 2 - For Casual 
                                sp = "sp_payrollregistry_salary_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "209": // Loan Deduction Page 1 - For Casual 
                                sp = "sp_payrollregistry_salary_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "210": // Loan Deduction Page 2 - For Casual 
                                sp = "sp_payrollregistry_salary_ce_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "211": // Attachment - For Monthly Salary - For Casual 
                                sp = "sp_payrollregistry_salary_re_attach_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "044": // Monetization Payroll - For Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            //---- END OF CASUAL REPORTS

                            //---- START OF JOB-ORDER REPORTS

                            case "009": // Summary Salary Monthly - For Job-Order 
                                sp = "sp_payrollregistry_salary_jo_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "010": // Summary Salary 1st Quincemna - For Job-Order 
                                sp = "sp_payrollregistry_salary_jo_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "011": // Summary Salary 2nd Quincemna - For Job-Order 
                                sp = "sp_payrollregistry_salary_jo_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "306": // Contributions/Deductions Page 1 - For Job-Order 
                                sp = "sp_payrollregistry_salary_jo_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "307": // Contributions/Deductions Page 1 - For Job-Order 
                                sp = "sp_payrollregistry_salary_jo_rep";
                                parameters = ",par_payroll_year" + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr" + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code" + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "308": // Attachment - For Monthly Salary
                                sp = "sp_payrollregistry_salary_re_attach_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "061": // Overtime Payroll - For Job-Order 
                                sp = "sp_payrollregistry_ovtm_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "062": // Honorarium Payroll - For Job-Order 
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;


                            //---- END OF JOB-ORDER REPORTS
                            //---- START OF OTHER PAYROLL REPORTS

                            case "024": // Communication Expense Allowance - Regular
                            case "043": // Communication Expense Allowance - Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "026": // Mid Year Bonus  - Regular        
                            case "045": // Mid Year Bonus  - Casual       
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "027": // Year-End And Cash Gift Bonus - Regular
                            case "046": // Year-End And Cash Gift Bonus - Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "028": // Clothing Allowance - Regular
                            case "047": // Clothing Allowance - Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "029": // Loyalty Bonus        - Regular
                            case "048": // Loyalty Bonus        - Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "030": // Anniversary Bonus    - Regular
                            case "049": // Anniversary Bonus    - Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "031": // Productivity Enhancement Incentive Bonus  - Regular
                            case "050": // Productivity Enhancement Incentive Bonus  - Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "023": // RATA 
                                sp = "sp_payrollregistry_rata_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "108": // RATA - OBR Breakdown
                                sp = "sp_payrollregistry_obr_rata_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "021": // Subsistence, HA and LA      - Regular
                            case "041": // Subsistence, HA and LA      - Casual
                                sp = "sp_payrollregistry_subs_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "022": // Overtime - Regular
                            case "042": // Overtime - Casual
                                sp = "sp_payrollregistry_ovtm_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "032": // CNA INCENTIVE - Regular
                            case "051": // CNA INCENTIVE - Casual
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "025": // Monetization Payroll - For Regular
                                sp = "sp_payrollregistry_oth1_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "901": // Other Payroll 1 - For Regular 
                                sp = "sp_payrollregistry_othpay_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "902": // Other Payroll 2 - For Regular 
                                sp = "sp_payrollregistry_othpay_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "903": // Other Payroll 3 - For Regular 
                                sp = "sp_payrollregistry_othpay_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "904": // Other Payroll 4 - For Regular 
                                sp = "sp_payrollregistry_othpay_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "905": // Other Payroll 5 - For Regular 
                                sp = "sp_payrollregistry_othpay_rep";
                                parameters = "par_payroll_year," + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code," + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "109": // Communicatio Expense - OBR Breakdown
                                sp = "sp_payrollregistry_obr_commx_rep";
                                parameters = ",par_payroll_year" + s.datalistgrid[id_ss].payroll_year + ",par_payroll_registry_nbr" + s.datalistgrid[id_ss].payroll_registry_nbr + ",par_payrolltemplate_code" + $('#ddl_reporttemplate option:selected').val()
                                break;

                            case "": // Direct Print to Printer
                                url = "/View/cDirectToPrinter/cDirectToPrinter.aspx";

                                break;
                        }


                        //var sp = "sp_payrollregistry_salary_re_ce_rep,par_payroll_year," + s.datalistgrid[id_ss].payroll_year
                        //    + ",par_payroll_registry_nbr," + s.datalistgrid[id_ss].payroll_registry_nbr
                        //    + ",par_payrolltemplate_code," + $('#ddl_payrolltemplate option:selected').val()


                        h.post("../cPayAuditPosting/PreviousValuesonPage_cPayRegistry",
                            {
                                par_year: s.ddl_year
                                , par_month: s.ddl_month
                                , par_registry_nbr: s.datalistgrid[id_ss].payroll_registry_nbr
                                , par_emp_type: $('#ddl_employment_type').val()
                                , par_template: s.ddl_payrolltemplate
                                , par_group: s.datalistgrid[id_ss].payroll_group_nbr
                                , par_payrolltype: $('#ddl_payrolltype').val()
                                , par_department: s.datalistgrid[id_ss].department_code
                                , par_show_entries: $('#ddl_show_entries').val()
                                , par_page_nbr: info.page
                                , par_search: s.search_box
                                , par_sort_value: sort_value
                                , par_sort_order: sort_order
                            }).then(function (d) {



                                $("#loading_data").modal("hide")
                                if (ReportPath != "~/Reports/") {

                                    location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                                        + "&SaveName=" + SaveName
                                        + "&ReportType=" + ReportType
                                        + "&ReportPath=" + ReportPath
                                        + "&Sp=" + sp + "," + parameters
                                }

                                else {

                                    swal({
                                        title: "Not Available!",
                                        text: "This Report File Is Not Yet Available!",
                                        icon: "warning",
                                        buttons: true,
                                        dangerMode: true,
                                    })
                                }




                            })




                    })

            })
       

    }

    //This function is called to extract the DataTable rows data
    function DataTable_data(tname)
    {
        var data = []
        var id = s[tname][0].id;
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x)
        {
           data.push(dtrw[x])
        }
        return data
    }

    Array.prototype.refreshTable = function (table, id)
    {
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
                    s[table].fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }


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


    //**************************************//
    //***Update-Database-Function****//
    //**************************************//
    s.UpdateFromDatabaseReturn = function ()
    {

        var tname = "oTable"
        
        swal({
            title: "Are you sure to Return this Record?",
            text: "Once Returned, You will not be able to Post this Record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(function (willReturn) {
                if (willReturn) {

                    if (s.datalistgrid[index_update].tran_year == "") {
                        s.datalistgrid[index_update].tran_year = new Date().getFullYear().toString()
                    }


                    

                    h.post("../cPayAuditPosting/UpdateFromDatabaseReturn", {

                        par_voucher_nbr: s.txtb_voucher_nbr
                        ,par_tran_year: s.datalistgrid[index_update].tran_year
                        ,par_payroll_registry_nbr: s.txtb_registry_nbr
                        ,par_payroll_registry_descr: s.txtb_registry_descr
                        ,par_payroll_group_nbr: s.datalistgrid[index_update].payroll_group_nbr
                        ,par_department_code: s.datalistgrid[index_update].department_code
                        ,par_rcvd_dttm: s.txtb_date_rcvd
                        ,par_rcvd_by_user: s.rcvd_by_user
                        ,par_audit_rcvd_dttm: s.txtb_audit_rcvd
                        ,par_audit_rcvd_user: s.audit_rcvd_user
                        ,par_audited_dttm: s.txtb_date_audited
                        ,par_audited_by_user: s.audited_by_user
                        ,par_posting_rcvd_dttm: s.txtb_post_rcvd
                        ,par_posting_rcvd_by_user: s.posting_rcvd_by_user
                        ,par_posted_dttm: s.txtb_date_posted
                        ,par_posted_by_user: s.posted_by_user
                        ,par_review_dttm: s.txtb_date_reviewed
                        ,par_reviewed_by_user: s.reviewed_by_user
                        ,par_rlsd_dttm: s.txtb_date_rlsd
                        ,par_rlsd_by_user: s.rlsd_by_user
                        ,par_unposted_dttm: s.txtb_date_unpost
                        ,par_unposted_by_user: s.unposted_by_user
                        ,par_remarks: s.txtb_remarks
                        ,par_payroll_source: $('#ddl_payrolltype').val()
                        ,par_employment_type: $('#ddl_employment_type').val()
                        ,par_payroll_template: $('#ddl_payrolltemplate').val()
                        ,par_payroll_year: $('#ddl_year').val()
                        ,par_payroll_month: $('#ddl_month').val()
                        ,par_status: s.datalistgrid[index_update].post_status
                    }).then(function (d) {


                        if (d.data.message == "success") {

                            var id = s[tname][0].id;
                            var page = $("#" + id).DataTable().page.info().page

                            s[tname].fnDeleteRow(index_update, null, true);
                            s.datalistgrid = DataTable_data(tname)
                            

                            if (s.datalistgrid == null || s.datalistgrid == "")
                            {
                                s.oTable.fnClearTable();
                            }

                            else
                            {
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid)
                            }


                            
                            //s.datalistgrid.refreshTable("oTable", "")
                            changePage(tname, page, id)
                            swal("Successfully " + useraction + "!", "Existing record successfully " + useraction + useraction2 + "!", "success").then(function (willClose) {
                                if (willClose) {
                                    document.getElementById("txtb_search_scan").focus()
                                    s.txtb_search_scan = ""
                                }
                            });
                            $("#main_modal").modal("hide");
                           
                        }
                        else
                        {

                            if (s.txtb_voucher_nbr == "") {
                                swal("Unable to Return!", "Please Receive/Specify Voucher Number.", "warning").then(function (willClose) {
                                    if (willClose) {
                                        document.getElementById("txtb_search_scan").focus()
                                        s.txtb_search_scan = ""
                                    }
                                });
                            }

                            else
                            {
                                swal("Unable to Return!", " Data has been Updated by Other User/s.", "warning").then(function (willClose) {
                                    if (willClose) {
                                        document.getElementById("txtb_search_scan").focus()
                                        s.txtb_search_scan = ""
                                    }
                                });
                            }
                            
                            $("#main_modal").modal("hide");
                        }
                        
                    })

                    //swal("Record has been Returned to Human Resource!", { icon: "success", });



                }
            });

    }
    

    
    

    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })

    }


    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_return_action = function (id_ss)
    {
        clearentry()
        index_update = ""
        index_update = id_ss
        s.txtb_voucher_nbr = s.datalistgrid[id_ss].voucher_nbr;
        s.txtb_registry_nbr = s.datalistgrid[id_ss].payroll_registry_nbr;
        s.isShowRemarks = false
        var dt = s.datalistgrid[id_ss]

        if ($('#ddl_payrolltype').val() == "01")
        {
            s.lbl_registry_voucher = "Registry Nbr.:"
            modalheader = "Registry Nbr | "
        }

        else if ($('#ddl_payrolltype').val() == "02") {

            s.lbl_registry_voucher = "Voucher Ctrl Nbr.:"
            modalheader = "Voucher Ctrl Nbr | "
        }



        Toogle_return(id_ss) //Toogle Actions for Receiving,Audit,Posting,Releasing
        
        h.post("../cPayAuditPosting/CheckData",
            {
                data: dt,
                par_payroll_template    : s.ddl_payrolltemplate,
                par_payroll_source      : s.ddl_payrolltype,
                par_employment_type     : s.ddl_employment_type,
                par_action: isAction
            }).then(function (d) {
                
                if (d.data.message == "success") {
                    if (s.txtb_voucher_nbr == '' || s.txtb_voucher_nbr == null)
                    {
                        swal("Unable to Return!", "Please Receive/Specify Voucher Number.", "warning").then(function (willClose) {
                            if (willClose) {
                                document.getElementById("txtb_search_scan").focus()
                                s.txtb_search_scan = ""
                            }
                        });
                    }

                    else
                    {
                        $("#main_modal").modal("show");

                        $('#main_modal').on('shown.bs.modal', function () {
                            $('#txtb_remarks').focus();

                        });
                    }
                   
                }
                

              

                else {
                    if (d.data.message == "fail")
                    {
                        swal("Unable to Update!", "Data has been Updated by Other User/s.", "warning").then(function (willClose) {
                            if (willClose) {
                                document.getElementById("txtb_search_scan").focus()
                                s.txtb_search_scan = ""
                            }
                        });;


                        var tname = "oTable";

                        var id = s[tname][0].id;
                        ////var page = $("#" + id).DataTable().page.info().page

                        s[tname].fnDeleteRow(index_update, null, true);
                        s.datalistgrid = DataTable_data(tname)

                        var page = $("#datalist_grid").DataTable().page.info().page
                       
                        if (d.data.sp_payrollregistryaccounting_hdr_tbl_list != null)
                        {
                            s.datalistgrid.push(d.data.sp_payrollregistryaccounting_hdr_tbl_list)
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid)
                        }

                        s.oTable.fnPageChange(page)
                        

                        $("#btn_rcvd").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd").addClass("fa fa-folder-open");

                        $("#btn_rcvd_audit").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd_audit").addClass("fa fa-folder");

                        $("#btn_audit").removeClass("fa fa-spinner fa-spin");
                        $("#btn_audit").addClass("fa fa-calculator");

                        $("#btn_rcvd_post").removeClass("fa fa-spinner fa-spin");
                        $("#btn_rcvd_post").addClass("fa fa-suitcase");

                        $("#btn_post").removeClass("fa fa-spinner fa-spin");
                        $("#btn_post").addClass("fa fa-chain");

                        $("#btn_review").removeClass("fa fa-spinner fa-spin");
                        $("#btn_review").addClass("fa fa-eye");

                        $("#btn_release").removeClass("fa fa-spinner fa-spin");
                        $("#btn_release").addClass("fa fa-check-square-o");

                        $("#btn_unpost").removeClass("fa fa-spinner fa-spin");
                        $("#btn_unpost").addClass("fa fa-chain-broken");
                        $("#main_modal").modal("hide");
                    }
                }


            })
        

    }

    Array.prototype.select = function (code, prop) {

        return this.filter(function (d) {
            return d[prop] == code
        })[0]


    }
    

    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }

    s.search_in_list_scan = function (value, table)
    {
        var templist = null
        h.post("../cPayAuditPosting/RetrieveDataScan", {
            par_payroll_registry_nbr: s.txtb_search_scan
        }).then(function (d) {

            if (d.data.message == "success")
            {
                
               
                if (d.data.sp_payrollregistryaccounting_hdr_tbl_list != null)
                {
                    s.datalistgrid[0] = d.data.sp_payrollregistryaccounting_hdr_tbl_list
                    templist = s.datalistgrid[0]
                    s.ddl_year  = d.data.sp_payrollregistryaccounting_hdr_tbl_list.payroll_year
                    s.ddl_employment_type = d.data.sp_payrollregistryaccounting_hdr_tbl_list.employment_type
                    s.ddl_month = d.data.sp_payrollregistryaccounting_hdr_tbl_list.payroll_month
                    s.ddl_payrolltype = d.data.sp_payrollregistryaccounting_hdr_tbl_list.payrolltemplate_type
                   
                    s.payrolltemplate = d.data.payroll_template

                    s.ddl_payrolltemplate = d.data.sp_payrollregistryaccounting_hdr_tbl_list.payrolltemplate_code

                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)

                    s.btn_edit_action(0)
                    index_update = 0
                        
                    
                }
                
            }
            

            })
        
        s.datalistgrid = [{}]
        $("#" + table).DataTable().search(value).draw();
    }
    

    //***************************Functions end*********************************************************//

})

