/*
 * Script created By:       JORGE RUSTOM VILLANUEVA
 * Script created On:       11/13/2019
 * Purpose of this Script:  This is the main angular script for cEmployeeCardRep Printing
 *                          to bind our data from backend to object in the front end design
*/
ng_HRD_App.controller("cEmployeeCardRep_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    s.year = []
    s.employment_type_data = []
    s.remittance_type_data = []
    s.ddl_employment_type = ""
    s.ddl_remittance_type = ""
    s.ddl_remittance_year = ""
    s.ddl_remittance_month = ""

    //Initialize Request to backend to get the data for employment type and remittance type
    function init()
    {
        RetrieveYear();
        //Initialize and request backend data...
        h.post("../cEmployeeCardRep/InitializeData").then(function (d)
        {


           
            s.department_data = d.data.department_list
            $("#ddl_empl_name").select2().on('change', function (e) {
                s.SelectedEmployee_Change()
            })


            s.employee_data = d.data.employee_name
            s.ddl_year = d.data.payroll_year == "" || d.data.payroll_year == null ? s.ddl_year = new Date().getFullYear().toString() : d.data.payroll_year
      
            if (d.data.employment_type.toString() == null || d.data.employment_type.toString() == "")
            {
                $("#ddl_employment_type").val("RC")
                s.ddl_employment_type = "RC"
            }

            else
            {
                $("#ddl_employment_type").val(d.data.employment_type.toString())
                s.ddl_employment_type = d.data.employment_type.toString()
            }

            if (d.data.period_from.toString() == null || d.data.period_from.toString() == "" || d.data.period_from.toString() == "1900-01-01") {
                $("#txtb_period_from").val("")
                s.txtb_period_from = ""
            }

            else
            {
                $("#txtb_period_from").val(d.data.period_from.toString())
                s.txtb_period_from = d.data.period_from.toString()
            }

            if (d.data.period_to.toString() == null || d.data.period_to.toString() == "" || d.data.period_to.toString() == "1900-01-01") {
                $("#txtb_period_to").val("")
                s.txtb_period_to = ""
            }

            else
            {
                $("#txtb_period_to").val(d.data.period_to.toString())
                s.txtb_period_to = d.data.period_to.toString()
            }
            if (d.data.department.toString() != null || d.data.department.toString() != "") {
               
                $("#ddl_department").val(d.data.department.toString())
                s.ddl_department = d.data.department.toString()
            }

            if (d.data.empl_id.toString() == null || d.data.empl_id.toString() == "") {
                //s.employee_data = []
                $("#ddl_empl_name").val("")
                s.ddl_empl_name = ""
                s.txtb_empl_id  = ""
            }

            else
            {
                $("#ddl_empl_name").val(d.data.empl_id.toString()).trigger('change')
                $("#select2-ddl_empl_name-container").text(d.data.employee_name_span.employee_name.toString())
                s.ddl_empl_name = d.data.empl_id.toString()
                s.txtb_empl_id  = d.data.empl_id.toString()
            }
           
         });
    }

    init()

    //**************************************//
    //***Select-Employment-Type-DropDown****//
    //**************************************// 
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }

    //**************************************//
    //***Select-Department-DropDown****//
    //**************************************// 
    s.SelectedDepartment_Change = function (deparment_code)
    {
        $("#ddl_empl_name").val("").trigger('change')
        $("#select2-ddl_empl_name-container").text("--Select here--")

        if (deparment_code != "")
        {
            $("#ddl_department").removeClass("required");
            $("#lbl_ddl_department_req").text("");

            h.post("../cEmployeeCardRep/SelectedDepartment_Change",
                {
                    par_department_code: deparment_code
                    , par_employment_type: $("#ddl_employment_type").val()
                }).then(function (d) {
                    s.employee_data = d.data.employee_name

                })
        }

       
    }


    //**************************************//
    //***Select-Employment-DropDown****//
    //**************************************//
    s.SelectedEmployment_Change = function ()
    { 
        $("#ddl_empl_name").val("").trigger('change')
        $("#select2-ddl_empl_name-container").text("--Select here--")

        h.post("../cEmployeeCardRep/SelectedDepartment_Change",
            {
                par_department_code : $("#ddl_department").val()
                ,par_employment_type: $("#ddl_employment_type").val()
            }).then(function (d) {
                s.employee_data = d.data.employee_name
            })
    }

    //**************************************//
    //***Select-Employee Names-DropDown****//
    //**************************************// 
    s.SelectedEmployee_Change = function ()
    {
        if ($("#ddl_empl_name").val() != "")
        {
            $("#ddl_empl_name").removeClass("required");
            $("span.select2-selection").attr('style', "");
            $("#lbl_ddl_empl_name_req").text("");
        }

        h.post("../cEmployeeCardRep/SelectedEmployee_Change",
            {
                par_empl_id: $("#ddl_empl_name").val()
            }).then(function (d) {
                s.txtb_empl_id = d.data.employee_id
            })
    }



    //**************************************//
    //***PRINT CARD FOR EMPLOYEE        ****//
    //**************************************// 
    s.btn_print_action = function () {
        if (isDataValidated())
        {
            $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })

            var controller = "Reports"
            var action = "Index"
            var ReportName = "CrystalReport"
            var SaveName = "Crystal_Report"
            var ReportType = "inline"
            var ReportPath = "~/Reports/cryEmployeeCard/cryEmployeeCard.rpt"
            var sp = "sp_employeecard_re_ce_rep"
            var parameters = "par_payroll_year," + $("#ddl_year").val() + ",par_empl_id," + $("#ddl_empl_name").val() + ",par_period_from," + $("#txtb_period_from").val() + ",par_period_to," + $("#txtb_period_to").val()

            
            s.Modal_title = "PRINT PREVIEW"

            h.post("../cEmployeeCardRep/ReportCount",
            {
                par_payroll_year    : $("#ddl_year").val(),
                par_empl_id         : $("#ddl_empl_name").val(),
                par_period_from     : $("#txtb_period_from").val(),
                par_period_to       : $("#txtb_period_to").val(),
                par_department      : $("#ddl_department").val(),
                par_employment_type : $("#ddl_employment_type").val()
                }).then(function (d) 
            {
                    
                if (d.data.reportcount > 0)
                {
                   // s.embed_link = "../" + controller + "/" + action + "?ReportName=" + ReportName
                   //+ "&SaveName=" + SaveName
                   //+ "&ReportType=" + ReportType
                   //+ "&ReportPath=" + ReportPath
                   //+ "&Sp=" + sp + "," + parameters

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp + "," + parameters

                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#modal_generating_remittance").modal("hide")

                        };
                    }
                    else if (iframe_page.innerHTML()) {
                        // get and check the Title (and H tags if you want)
                        var ifTitle = iframe_page.contentDocument.title;
                        if (ifTitle.indexOf("404") >= 0) {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";

                            s.loading_r = false;
                            $('#print_preview_modal').modal("hide");
                        }
                        else if (ifTitle != "") {
                            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                            iframe.src = "";

                            s.loading_r = false;
                            $('#print_preview_modal').modal("hide");
                        }
                    }
                    else {
                        iframe.onreadystatechange = function () {
                            if (iframe.readyState == "complete") {
                                iframe.style.visibility = "visible";
                                $("#modal_generating_remittance").modal("hide")

                            }
                        };
                    }

                    s.loading_r = false;
                    console.log(s.embed_link)
                    iframe.src = s.embed_link;
                    $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
                    $('#print_extract_modal').modal("hide");
                 

                    
                }

                else
                {
                    swal({
                        title: "Not Data Found!",
                        text: "No Data for Printing!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                    $("#modal_generating_remittance").modal("hide")
                }
            });

            
        }
       
        
    }
    

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function isDataValidated() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($("#ddl_year").val() == "") {

            ValidationResultColor("ddl_year", true);
            return_val = false;
        }

        if ($("#ddl_empl_name").val() == "") {
            
            ValidationResultColor("ddl_empl_name", true);
            return_val = false;
        }

        //if ($("#ddl_department").val() == "") {
        //    ValidationResultColor("ddl_department", true);
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
            if (par_object_id == "ddl_empl_name")
            {
                $("span.select2-selection").attr("style", "border:1px solid red !important");
                $("#lbl_" + par_object_id + "_req").text("Required Field");
            }


               
            else {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field");
            }
           
            
        }

        

    
        else {
            //remove of refresh the object form being required

            $("#ddl_ddl_year").removeClass("required");
            $("#lbl_ddl_year_req").text("");

            $("#ddl_empl_name").removeClass("required");
            $("#lbl_ddl_empl_name_req").text("");

            $("#ddl_department").removeClass("required");
            $("#lbl_ddl_department_req").text("");

            $("span.select2-selection").attr('style', "");
        }
    }
    
});

function RemoveClass(value, field) {

    if ($("#" + value) != "") {
        $("#" + value).removeClass("required");
        $("#lbl_" + field + "_req").text("");
    }
}