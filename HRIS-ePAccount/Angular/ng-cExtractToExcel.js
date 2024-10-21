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
    var excelExportServer = "";
    s.year = [];

    s.show_deduction        = false
    s.ddl_report_type       = "TAX-PAYABLE";
    s.ddl_payroll_month     = "";
    s.ddl_deduction         = ""
    
    //Initialize Request to backend to get the data for employment type and remittance type
    function init()
    {
        RetrieveYear();
        s.ddl_payroll_year = new Date().getFullYear().toString();
        h.post("../cExtractToExcel/Initialize").then(function (d) {

               excelExportServer = d.data.excelExportServer;

        })
    }

    init();

    //**************************************//
    //***Select-Employment-Type-DropDown****//
    //**************************************// 
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++)
        {
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
            if (s.ddl_report_type == "REFUND")
            {
                $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" });

                h.post("../Menu/GetToken").then(function (d) {
                    var token = { token: d.data.token }

                    console.log(excelExportServer)

                    h.post(excelExportServer + "/api/remittance/verify-token", token, { responseType: 'arraybuffer' }
                    ).then(function (response) {
                        if (response.data) {
                            h.post("../cExtractToExcel/ExtractExcel_PHP",
                                {
                                    par_extract_type: s.ddl_report_type,
                                    par_year: s.ddl_payroll_year,
                                    par_month: s.ddl_payroll_month,
                                    par_month_descr: $("#ddl_payroll_month option:selected").text().toString().trim()
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        var data_extract = d.data.data_extract
                                    h.post(excelExportServer + "/api/export/hris-refund-export", {
                                            data: data_extract
                                        }, { responseType: 'arraybuffer' }
                                        ).then(function (response2) {
                                            console.log(response2)
                                            // Check the response data
                                            if (response2.data) {
                                                // Create a Blob from the response data
                                                const csvBlob = new Blob([response2.data], { type: 'text/csv;charset=utf-8;' });
                                                // Generate a URL for the Blob
                                                const downloadUrl = window.URL.createObjectURL(csvBlob);

                                                // Create an anchor element and set its href attribute to the Blob URL
                                                const link = document.createElement('a');
                                                link.href = downloadUrl;

                                                // Set the download attribute with a dynamic filename
                                                //const name = new Date().toLocaleString().replace(/[/,\\:*?"<>|]/g, '_');
                                                const name = "HRIS-Refund-" + s.ddl_payroll_year + "-" + s.ddl_payroll_month + ".xlsx"
                                                link.setAttribute('download', name);
                                                console.log(link)
                                                // Append the link to the document body and click it to initiate the download
                                                document.body.appendChild(link);
                                                link.click();

                                                // Clean up by removing the link element and revoking the Blob URL
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(downloadUrl);
                                                $("#modal_generating_tax").modal("hide");
                                            } else {
                                                console.error('The response data is empty or undefined.');
                                                $("#modal_generating_tax").modal("hide");
                                            }
                                        }).catch(function (error) {
                                            console.error('There was a problem with the POST request:', error);
                                            $("#modal_generating_tax").modal("hide");
                                        });
                                }
                                else {
                                    $("#modal_generating_tax").modal("hide");
                                    swal(d.data.message, { icon: "success" });
                                }



                            })
                        }

                    }).catch(function (error, response) {
                        swal("Token expired! please generate new token.", { icon: "error" })
                        $("#modal_generating_tax").modal("hide");
                    });


                })

                
            }
            if (s.ddl_report_type == "TAX-PAYABLE")
            {
                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"
                var ReportPath = "~/Reports/cryTaxPayable/cryTaxPayable.rpt"
                var sp = "sp_extract_tax_payable,p_posted_year," + s.ddl_payroll_year + ",p_posted_month," + s.ddl_payroll_month 
                
                
                $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview');
                var iframe_page = $("#iframe_print_preview")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp // + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_generating_tax").modal("hide")
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#modal_generating_tax").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************
            }

            if (s.ddl_report_type == "TAX-PAYABLE-2023") {
                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"
                var ReportPath = "~/Reports/cryTaxPayable/cryTaxPayable.rpt"
                var sp = "sp_extract_tax_payable_2,p_posted_year," + s.ddl_payroll_year + ",p_posted_month," + s.ddl_payroll_month


                $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview');
                var iframe_page = $("#iframe_print_preview")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp // + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_generating_tax").modal("hide")
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#modal_generating_tax").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************
            }

            if (s.ddl_report_type == "TAX-RATE-AMOUNT")
            {
                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"
                var ReportPath = "~/Reports/cryTaxRate_TaxAmount/cryTaxRate_TaxAmount.rpt"
                var sp = "sp_extract_taxrate_taxamount,p_payroll_year," + s.ddl_payroll_year + ",p_payroll_month," + s.ddl_payroll_month 
                
                
                $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview');
                var iframe_page = $("#iframe_print_preview")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp // + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_generating_tax").modal("hide")
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#modal_generating_tax").modal("hide")
                        }
                    };
                }
                console.log(iframe.src)
                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************

            }

            if (s.ddl_report_type == "DEDUCTIONS")
            {
                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"
                var ReportPath = "~/Reports/cryPayrollDeductions/cryPayrollDeductions.rpt"
                var sp = "sp_extract_payrolldeductions,p_created_payroll_year," + s.ddl_payroll_year + ",p_created_payroll_month," + s.ddl_payroll_month + ",p_deduc_descr," + s.ddl_deduction 
                
                
                $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview');
                var iframe_page = $("#iframe_print_preview")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp // + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_generating_tax").modal("hide")
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#modal_generating_tax").modal("hide")
                        }
                    };
                }
                console.log(iframe.src)
                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

                // *******************************************************
                // *** VJA : 2023-04-28 - Validation and Loading hide ****
                // *******************************************************

            }
        }

    }




    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        if (s.ddl_report_type == "TAX-RATE-AMOUNT" || s.ddl_report_type == "TAX-PAYABLE" || s.ddl_report_type == "DEDUCTIONS" )
        {
            if ($("#ddl_payroll_month option:selected").val() == "")
            {
                swal("Payroll Month is Required", { icon: "warning" });
                return_val = false;
            }
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
            //$("#ddl_payroll_year").removeClass("required");
            //$("#lbl_ddl_payroll_year_req").text("");
        }
    }

    s.ReportType = function ()
    {
        s.show_deduction = false
        $('#id_lbl_year').text("POSTED YEAR:");
        $('#id_lbl_month').text("POSTED MONTH:");
        if (s.ddl_report_type == "TAX-RATE-AMOUNT")
        {
            $('#id_lbl_year').text("YEAR:");
            $('#id_lbl_month').text("MONTH:");
        } else if (s.ddl_report_type == "DEDUCTIONS")
        {
            $('#id_lbl_year').text("YEAR:");
            $('#id_lbl_month').text("MONTH:");
            s.show_deduction = true
        }
    }
});