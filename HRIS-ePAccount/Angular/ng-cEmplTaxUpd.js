//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Employee Tax Generation
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************

ng_HRD_App.controller("cEmplTaxUpd_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript

    s.year = []
    s.employment_type_data = []
    s.remittance_type_data = []
    s.ddl_employment_type = ""
    s.ddl_remittance_type = ""
    s.ddl_batch_nbr = "S"
    s.batch_disabled = true;
    var d = new Date();
    var n = d.getFullYear().toString();
    s.ddl_remittance_year = n;
    s.ddl_remittance_month = (d.getMonth() + 1).toString();

    s.isAction = "";
    s.employmenttype_list = [
        { employment_type: 'RC', employment_type_descr: 'REGULAR AND CASUAL EMPLOYEE/S' }, { employment_type: 'JO', employment_type_descr: 'JOB ORDER EMPLOYEE/S' }

    ]

    //Initialize Request to backend to get the data for employment type and remittance type
    function init()
    {
        RetrieveYear();
        s.employment_type_data = s.employmenttype_list
        s.ddl_payroll_year =  new Date().getFullYear().toString()
    }

    init()

    //**************************************//
    //***Select-Employment-Type-DropDown****//
    //**************************************// 
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }
    
    

    //**************************************************************//
    //***Occure when btn_generate_remittance is click by the user***//
    //**************************************************************// 
    //s.btn_generate_tax_click = function () {
    //    if (ValidateFields()) {
    //        $("#modal_generating_tax").modal();
    //        setTimeout(function () {
    //            h.post("../cEmplTaxUpd/GenerateTax",
    //                {
    //                    par_year: s.ddl_remittance_year,
    //                    par_empType: s.ddl_employment_type
    //                }).then(function (d) {

    //                    $("#modal_generating_tax").modal('hide');
    //                    if (d.data.message == "success") {
    //                        var icon_display = "";
    //                        icon_display = "success";

    //                        if (s.ddl_employment_type == "RC") 
    //                        {
    //                            swal(d.data.sp_generate_annualtax_tax_rece.result_flag_message, "Generation Message", icon_display);
    //                        }

    //                        else if (s.ddl_employment_type == "JO")
    //                        {
    //                            swal(d.data.sp_generate_payrollemployee_tax_hdr_dtl.result_flag_message, "Generation Message", icon_display);
    //                        }

    //                        }
                        

    //                    else
    //                    {
    //                        icon_display = "warning";
    //                        swal(d.data.message, "Generation Message", icon_display);
    //                    }
                        
                       
    //                })
    //        }, 1500);
    //    }

    //}

    s.btn_generate_tax_click = function () {
        cs.loading("show")
        h.post("../cEmplTaxUpd/GenerateTax",
            {
                par_year: s.ddl_remittance_year,
                par_empType: s.ddl_employment_type
            }).then(function (d) {
               
                
                if (d.data.icon == "success") {
                    
                    if (s.ddl_employment_type == "RC") {
                      
                        swal({ title: "Generation Message", text: d.data.sp_generate_annualtax_tax_rece.result_flag_message, icon: d.data.icon });
                        cs.loading("hide")
                    }
                    else if (s.ddl_employment_type == "JO" || s.ddl_employment_type == "NE" || s.ddl_employment_type == "RX") {
                        
                        swal({ title: "Generation Message", text: d.data.sp_generate_payrollemployee_tax_hdr_dtl.result_msg, icon: d.data.icon });
                        cs.loading("hide")
                    }

                }
                else {
                   // icon_display = "warning";
                    swal({ title: "Generation Message", text: d.data.message, icon: d.data.icon });
                    cs.loading("hide")
                }

               
            })
    
    }


    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if (s.ddl_remittance_year == "")
        {
            ValidationResultColor("ddl_payroll_year", true);
            return_val = false;
        }

        if (s.ddl_employment_type == "") {
            ValidationResultColor("ddl_employment_type", true);
            return_val = false;
        }
        
        return return_val;
    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..

            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else
        {
            //remove of refresh the object form being required

            $("#ddl_payroll_year").removeClass("required");
            $("#lbl_ddl_payroll_year_req").text("");

            $("#ddl_employment_type").removeClass("required");
            $("#lbl_ddl_employment_type_req").text("");
        }
    }
});