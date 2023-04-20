//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll OTH PAY
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************


ng_HRD_App.controller("cPayRegistryOthPay_ctrlr", function ($scope, $compile, $http, $filter) {
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

        h.post("../cPayRegistryOthPay/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.txtb_payroll_year     = d.data.ddl_year
            s.txtb_payroll_month    = d.data.ddl_month
            s.txtb_employment_type  = d.data.empType[0].employmenttype_description
            s.txtb_payroll_template = d.data.payroll_template[0].payrolltemplate_descr
            s.txtb_payroll_type     = d.data.payrolltype.syssetup_type_descr
            init_table_data([]);

            if (d.data.sp_payrollregistryaccounting_dtl_othpay_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_othpay_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_othpay_tbl_list)
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
            h.post("../cPayRegistryOthers/SelectPayrollGroup", { par_ddl_group: lst.payroll_group_nbr, par_registry_nbr: lst.payroll_registry_nbr }).then(function (d) {

                if (d.data.sp_payrollregistryaccounting_dtl_othpay_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_payrollregistryaccounting_dtl_othpay_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_payrollregistryaccounting_dtl_othpay_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }


            });
        }
    }







    s.btn_edit_action = function (id_ss) {


        s.txtb_empl_name = s.datalistgrid[id_ss].employee_name
        s.txtb_empl_id = s.datalistgrid[id_ss].empl_id
        s.txtb_position = s.datalistgrid[id_ss].position_title1
        s.txtb_department = s.datalistgrid[id_ss].department_name1

        if (s.datalistgrid[id_ss].rate_basis_descr == null) {
            s.datalistgrid[id_ss].rate_basis_descr = "";
        }

        s.lbl_rate_basis = s.datalistgrid[id_ss].rate_basis_descr.toString() + " Rate :";


        if (s.datalistgrid[id_ss].rate_basis.toString() == "D" && s.datalistgrid[id_ss].rate_basis != null) {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].daily_rate
        }

        else if (s.datalistgrid[id_ss].rate_basis.toString() == "M" && s.datalistgrid[id_ss].rate_basis != null) {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].monthly_rate;
        }

        else if (s.datalistgrid[id_ss].rate_basis.toString() == "H" && s.datalistgrid[id_ss].rate_basis != null) {
            s.txtb_monthly_rate = s.datalistgrid[id_ss].hourly_rate;
        }

        else {
            s.txtb_monthly_rate = "";
        }

        ToogleDetails(id_ss)


        s.ModalTitle = "View Record | Registry No : " + s.datalistgrid[id_ss].payroll_registry_nbr
        //s.post_status = s.datalistgrid[id_ss].post_status_descr


        $("#main_modal").modal("show")
    }



    function ToogleDetails(id_ss) {
        h.post("../cPayRegistryOthPay/RetrieveDetails", {

            par_empl_id: s.datalistgrid[id_ss].empl_id

        }).then(function (d) {

            $("#div_other_amount1").hide();
            $("#div_other_amount2").hide();
            $("#div_other_amount3").hide();
            $("#div_other_amount4").hide();
            $("#div_other_amount5").hide();
                
            if (d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld1_descr != "")
            {
                $("#div_other_amount1").show();
                s.lbl_other_amount1 = d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld1_descr
                s.txtb_other_amount1 = s.datalistgrid[id_ss].other_amount1;
            }

            if (d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld2_descr != "") {
                $("#div_other_amount2").show();
                s.lbl_other_amount2 = d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld2_descr
                s.txtb_other_amount2 = s.datalistgrid[id_ss].other_amount2;
            }

            if (d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld3_descr != "") {
                $("#div_other_amount3").show();
                s.lbl_other_amount3 = d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld3_descr
                s.txtb_other_amount3 = s.datalistgrid[id_ss].other_amount3;
            }

            if (d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld4_descr != "") {
                $("#div_other_amount4").show();
                s.lbl_other_amount4 = d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld4_descr
                s.txtb_other_amount4 = s.datalistgrid[id_ss].other_amount4;
            }

            if (d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld5_descr != "") {
                $("#div_other_amount5").show();
                s.lbl_other_amount5 = d.data.sp_othrpaysetupaccounting_tbl_list2[0].fld5_descr
                s.txtb_other_amount5 = s.datalistgrid[id_ss].other_amount5;
            }
            
            s.txtb_gross_pay          = s.datalistgrid[id_ss].gross_pay;
            s.txtb_net_pay            = s.datalistgrid[id_ss].net_pay;
            s.txtb_remarks            = s.datalistgrid[id_ss].notes_generic;
                
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



