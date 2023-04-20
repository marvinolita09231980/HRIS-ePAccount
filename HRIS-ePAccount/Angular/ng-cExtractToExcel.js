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
ng_HRD_App.controller("cExtractToExcel_ctrlr", function ($scope, $compile, $http, $filter, $q) {

    var s = $scope;
    var h = $http;

    s.year = [];

    s.ddl_report_type   ="REFUND"  ;
    s.ddl_payroll_month =""        ;

    //Initialize Request to backend to get the data for employment type and remittance type
    function init()
    {
        RetrieveYear();
        s.ddl_payroll_year = new Date().getFullYear().toString();
    }

    init();

    //**************************************//
    //***Select-Employment-Type-DropDown****//
    //**************************************// 
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year };
            s.year.push(data);
            prev_year++;
        }
    }
    
    

    //**************************************************************//
    //***Occure when btn_generate_remittance is click by the user***//
    //**************************************************************// 
    s.btn_extract = function ()
    {
        if (ValidateFields())
        {
            $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" });
            h.post("../cExtractToExcel/ExtractExcel",
            {
                par_extract_type : s.ddl_report_type,
                par_year         : s.ddl_payroll_year,
                par_month        : s.ddl_payroll_month,
                par_month_descr  : $("#ddl_payroll_month option:selected").text().toString().trim()

            }).then(function (d)
            { 
                if (d.data.message == "success")
                {
                    window.open(d.data.filePath, '', '');
                    //swal("Successfully Extracted", "Generation Message", "success");
                    $("#modal_generating_tax").modal("hide");
                }
                else if (d.data.message == "no-data-found")
                {
                    $("#modal_generating_tax").modal("hide");
                    swal("No Data Found!", "Generation Message", "warning");
                }
                else
                {
                    $("#modal_generating_tax").modal("hide");
                    swal(d.data.message, "Generation Message", "error");
                }
            })
        }

    }




    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        

        //if (s.ddl_employment_type == "") {
        //    ValidationResultColor("ddl_employment_type", true);
        //    return_val = false;
        //}
        
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
            //$("#ddl_payroll_year").removeClass("required");
            //$("#lbl_ddl_payroll_year_req").text("");
        }
    }
});