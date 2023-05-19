/*
 * Script created By:       Joseph M.Tombo Jr.
 * Script created On:       10/18/2019
 * Purpose of this Script:  This is the main angular script for cRemittance Auto Generation
 *                          to bind our data from backend to object in the front end design
*/
ng_HRD_App.controller("cRemitAutoGen_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    s.year = []
    s.employment_type_data  = []
    s.remittance_type_data  = []
    s.ddl_employment_type   = ""
    s.ddl_remittance_type   = ""
    s.ddl_batch_nbr         = "S"
    s.batch_disabled        = true;
    var d = new Date();
    var n = d.getFullYear().toString();
    s.ddl_remittance_year   = n;
    s.ddl_remittance_month  = (d.getMonth() + 1).toString();
    //Initialize Request to backend to get the data for employment type and remittance type
    function init()
    {
        RetrieveYear();

        //Initialize and request backend data...
        //Initialize and request backend data...
        h.post("../cRemitAutoGen/initializeData", { par_empType: s.ddl_employment_type }).then(function (d) {
            s.employment_type_data = d.data.empType;
            s.remittance_type_data = d.data.sp_remittance;
           
        });
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

    //**************************************//
    //***Select-Employment-Type-DropDown****//
    //**************************************// 
    s.SelectedEmploymentType_Change = function (empType)
    {
        h.post("../cRemitAutoGen/SelectedEmploymentType_Change",
            {
               par_empType: empType
            }).then(function (d) {
                s.remittance_type_data = d.data.sp_remittance
            })
    }

    //**************************************//
    //***Select-Remittance-Type-DropDown****//
    //**************************************// 
    s.SelectedRemittanceType_Change = function (remittance_code)
    {
        ValidationResultColor("ALL", false);
        if (remittance_code == "08")
        {
            s.batch_disabled = false;
        }
        else
        {
            s.ddl_batch_nbr = "S";
            s.batch_disabled = true;
        }
    }

     //**************************************************************//
    //***Occure when btn_generate_remittance is click by the user***//
   //**************************************************************// 
    s.btn_generate_remittance_click = function ()
    {
        if (ValidateFields()) {
            $("#modal_generating_remittance").modal();


            if (s.ddl_remittance_type == '14')
            {
                if (s.ddl_employment_type == "RC")
                {
                    h.post("../cRemitAutoGen/PrintBIRMonthly").then(function (d) {
                        if (d.data.message == "success") {
                            var controller = "Reports"
                            var action = "Index"
                            var ReportName = "CrystalReport"
                            var SaveName = "Crystal_Report"
                            var ReportType = "inline"
                            var ReportPath = "~/Reports/cryRemittanceBIR/cryRemittanceBIR.rpt"
                            var sp = "sp_calculate_monthly_income_all_rep"
                            var parameters = "par_payroll_year," + s.ddl_remittance_year + ",par_payroll_month," + s.ddl_remittance_month + ",par_employment_type," + s.ddl_employment_type


                            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                                + "&SaveName=" + SaveName
                                + "&ReportType=" + ReportType
                                + "&ReportPath=" + ReportPath
                                + "&Sp=" + sp + "," + parameters
                        }

                    })
                }
                else
                {
                    console.log(s.ddl_remittance_year, s.ddl_remittance_month, s.ddl_employment_type, s.ddl_remittance_type, s.ddl_batch_nbr)
                    setTimeout(function () {
                        h.post("../cRemitAutoGen/GenerateRemittance",
                            {
                                par_year: s.ddl_remittance_year,
                                par_month: s.ddl_remittance_month,
                                par_empType: s.ddl_employment_type,
                                par_remittance_type: s.ddl_remittance_type,
                                par_batch_nbr: s.ddl_batch_nbr == "S" ? 0 : s.ddl_batch_nbr
                            }).then(function (d) {
                                $("#modal_generating_remittance").modal('hide');


                                var icon_display = "";
                                switch (d.data.generation_result[0].result_value) {
                                    case "0":
                                        icon_display = "warning";
                                        break;
                                    case "Y":
                                        icon_display = "success";
                                        break;
                                    case "N":
                                        icon_display = "error";
                                        break;

                                }
                                swal(d.data.generation_result[0].result_value_descr, "Generation Message", icon_display);
                            })
                    }, 1500);
                }
                
                
            }

            else {
            setTimeout(function () {
                h.post("../cRemitAutoGen/GenerateRemittance",
                    {
                        par_year: s.ddl_remittance_year,
                        par_month: s.ddl_remittance_month,
                        par_empType: s.ddl_employment_type,
                        par_remittance_type: s.ddl_remittance_type,
                        par_batch_nbr: s.ddl_batch_nbr == "S" ? 0 : s.ddl_batch_nbr
                    }).then(function (d) {
                        $("#modal_generating_remittance").modal('hide');


                        var icon_display = "";
                        switch (d.data.generation_result[0].result_value) {
                            case "0":
                                icon_display = "warning";
                                break;
                            case "Y":
                                icon_display = "success";
                                break;
                            case "N":
                                icon_display = "error";
                                break;

                        }
                        swal(d.data.generation_result[0].result_value_descr, "Generation Message", icon_display);
                    })
            }, 1500);

        }
        }
        
    }

     //***********************************************************//
    //***Field validation everytime generation button is click***//
   //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if (s.ddl_remittance_year == "")
        {
            ValidationResultColor("ddl_remittance_year", true);
            return_val = false;
        }

        if (s.ddl_remittance_month == "")
        {
            ValidationResultColor("ddl_remittance_month", true);
            return_val = false;
        }

        if (s.ddl_employment_type == "") {
            ValidationResultColor("ddl_employment_type", true);
            return_val = false;
        }
        
        if (s.ddl_remittance_type == "")
        {
            ValidationResultColor("ddl_remittance_type", true);
            return_val = false;
        }

        if (s.ddl_remittance_type == "08" && s.ddl_batch_nbr == "S")
        {
            ValidationResultColor("ddl_batch_nbr", true);
            return_val = false;
        }
        return return_val;
    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id,par_v_result)
    {
        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id+"_req").text("Required Field");
        }
        else
        {
            //remove of refresh the object form being required
            $("#ddl_remittance_month").removeClass("required");
            $("#lbl_ddl_remittance_month_req").text("");

            $("#ddl_remittance_year").removeClass("required");
            $("#lbl_ddl_remittance_year_req").text("");

            $("#ddl_employment_type").removeClass("required");
            $("#lbl_ddl_employment_type_req").text("");

            $("#ddl_remittance_type").removeClass("required");
            $("#lbl_ddl_remittance_type_req").text("");

            $("#ddl_batch_nbr").removeClass("required");
            $("#lbl_ddl_batch_nbr_req").text("");
        }
    }
});