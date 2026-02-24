ng_HRD_App.controller("cPayrollNotInAnnualTaxDetails_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;

    s.oTable = null;
    s.datalistgrid = [];
    s.rowLen = "10";
    s.allow_view = true;
    s.allow_print = false;
    s.allow_edit = false;
    s.allow_delete = false;
    var sort_value = 0;
    var sort_order = "asc";

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#pnia_table').dataTable({
            data: s.datalistgrid,
            stateSave: false,
            sDom: 'rt<"bottom"p>',
            pageLength: parseInt(s.rowLen),
            autoWidth: false,     // ✅ stop DataTables from guessing widths
            scrollX: false,
            // ✅ force column widths + classes
            columnDefs: [
                { targets: 0, width: "140px", className: "dt-nowrap dt-center" },  // Voucher
                { targets: 1, width: "90px", className: "dt-nowrap dt-center" },  // Month
                { targets: 2, width: "90px", className: "dt-nowrap dt-center" },  // Month
                { targets: 3, width: "140px", className: "dt-nowrap dt-right" },   // Basic
                { targets: 4, width: "140px", className: "dt-nowrap dt-right" },   // WTAX
                { targets: 5, width: "45%", className: "dt-remarks dt-left" },   // ✅ Remarks
                { targets: 6, width: "90px", className: "dt-nowrap dt-center" }   // Action
            ],
            // keep it clean; turn true only if you need horizontal scroll
            columns: [
                
                {
                    "mData": "voucher_nbr", "mRender": function (data) {
                        return "<div class='btn-block text-center'>" + (data || "") + "</div>";
                    }
                },
                {
                    "mData": "payroll_month", "mRender": function (data) {
                        return "<div class='btn-block text-center'>" + (data || "") + "</div>";
                    }
                },
                {
                    "mData": "payrolltemplate_code", "mRender": function (data) {
                        return "<div class='btn-block text-center'>" + (data || "") + "</div>";
                    }
                },
                {
                    "mData": "gross_pay", "mRender": function (data) {
                        return "<div class='btn-block text-right' style='padding-right:10px;'>" + currency(data) + "</div>";
                    }
                },
                {
                    "mData": "wtax_amt", "mRender": function (data) {
                        return "<div class='btn-block text-right' style='padding-right:10px;'>" + currency(data) + "</div>";
                    }
                },
                {
                    "mData": "remarks", "mRender": function (data) {
                        return "<div class='btn-block text-left dt-remarks-cell' style='padding-left:10px;'>"
                            + (data || "") +
                            "</div>";
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "mRender": function (data, type, full, row) {
                        // show a View button similar to other controllers
                        return '<center><div class="btn-group tooltip-demo">' +
                            '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="View" ng-click="btn_view_action(' + row["row"] + ')">' +
                            '<i class="fa fa-eye"></i></button>' +
                            '</div></center>';
                    }
                }
            ],
            "createdRow": function (row, data, index) {
                $(row).attr('id', index);
                $compile(row)($scope);  // compile angular bindings inside DataTable rows
            }
        });

        // initial sort
        s.oTable.fnSort([[sort_value, sort_order]]);

        // clear or fill table
        s.oTable.fnClearTable();
        if (s.datalistgrid.length > 0) {
            s.oTable.fnAddData(s.datalistgrid);
        }

    };

    function currency(d) {
        if (d == null || d === "" || d == undefined) {
            return "0.00";
        }
        var n = parseFloat(d);
        if (isNaN(n)) return "0.00";
        return n.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    // reload using explicit params (called when navigated from cBIRAnnualizedTax)


    s.btn_view_action = function (rowIndex) {

        var data = s.datalistgrid[rowIndex];

        function safe(v) {
            return (v === null || v === undefined) ? "" : v;
        }

        function formatDate(dotNetDate) {
            if (!dotNetDate) return "";
            var millis = parseInt(dotNetDate.toString().replace(/[^0-9]/g, ""), 10);
            if (isNaN(millis)) return "";
            return $filter('date')(new Date(millis), 'MMMM dd, yyyy');
        }

        var UI = {
            text: "#111827",
            text2: "#1f2933",
            label: "#374151",
            muted: "#6b7280",
            cardBg: "#f7f8f5",
            inputBg: "#ffffff",
            border: "#d1d5db",
            borderSoft: "#e5e7eb"
        };

        function textField(label, value) {
            return `
            <div class="form-group" style="margin-bottom:12px;">
                <label style="font-size:13.5px;color:${UI.label};font-weight:600;display:block;">
                    ${label}
                </label>
                <input class="form-control"
                       style="height:38px;font-size:14.5px;border-radius:8px;background:${UI.inputBg};border:1px solid ${UI.border};color:${UI.text};"
                       readonly value="${safe(value)}">
            </div>
        `;
        }

        function moneyField(label, value) {
            return `
            <div class="form-group" style="margin-bottom:12px;">
                <label style="font-size:13.5px;color:${UI.label};font-weight:600;display:block;">
                    ${label}
                </label>
                <div style="position:relative;">
                    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:${UI.muted};font-size:14px;">₱</span>
                    <input class="form-control text-right"
                           style="height:38px;font-size:14.5px;border-radius:8px;padding-left:28px;background:${UI.inputBg};border:1px solid ${UI.border};font-weight:700;color:${UI.text};"
                           readonly value="${currency(value)}">
                </div>
            </div>
        `;
        }

        var html = `
        <div style="text-align:left; max-width:1100px; font-family:'Segoe UI',sans-serif; color:${UI.text2}; position:relative;">

            <!-- Close Button -->
            <button onclick="swal.close()" 
                    style="
                        position:absolute;
                        top:-10px;
                        right:-10px;
                        background:#ffffff;
                        border:1px solid ${UI.border};
                        width:34px;
                        height:34px;
                        border-radius:50%;
                        font-size:16px;
                        font-weight:bold;
                        color:#6b7280;
                        cursor:pointer;
                        box-shadow:0 3px 8px rgba(0,0,0,0.08);
                    ">✕</button>

            <div style="margin-bottom:14px;">
                <div style="font-size:20px;font-weight:800;color:${UI.text};">Payroll Details</div>
                <div style="font-size:14px;color:${UI.muted};">Payroll Not Included in Annual Tax Computation</div>
            </div>

            <div style="background:${UI.cardBg};border:1px solid ${UI.borderSoft};border-radius:14px;padding:20px;box-shadow:0 8px 22px rgba(0,0,0,0.04);">

                <div style="font-size:14.5px;font-weight:800;margin-bottom:10px;color:${UI.text};">Identifiers</div>

                <div class="row">
                    <div class="col-md-4">${textField("Voucher No.", data.voucher_nbr)}</div>
                    <div class="col-md-4">${textField("Employee ID", data.empl_id)}</div>
                    <div class="col-md-4">${textField("Template Code", data.payrolltemplate_code)}</div>
                </div>

                <div class="row">
                    <div class="col-md-6">${textField("Payroll Year", data.payroll_year)}</div>
                    <div class="col-md-6">${textField("Payroll Month", data.payroll_month)}</div>
                </div>

                <div style="border-top:1px solid ${UI.borderSoft};margin:12px 0;"></div>

                <div style="font-size:14.5px;font-weight:800;margin-bottom:10px;color:${UI.text};">Amounts</div>

                <div class="row">
                    <div class="col-md-6">${moneyField("Gross Pay", data.gross_pay)}</div>
                    <div class="col-md-6">${moneyField("Withholding Tax", data.wtax_amt)}</div>
                </div>

                <div class="row">
                    <div class="col-md-4">${moneyField("PERA CA", data.pera_ca_amt)}</div>
                    <div class="col-md-4">${moneyField("GSIS PS", data.gsis_ps)}</div>
                    <div class="col-md-4">${moneyField("PHIC PS", data.phic_ps)}</div>
                </div>

                <div class="row">
                    <div class="col-md-4">${moneyField("HDMF PS", data.hdmf_ps)}</div>
                    <div class="col-md-4">${moneyField("Hazard Pay", data.hazard_pay)}</div>
                    <div class="col-md-4">${moneyField("Subsistence Allowance", data.subsistence_allowance)}</div>
                </div>

                <div class="row">
                    <div class="col-md-4">${moneyField("Laundry Allowance", data.laundry_allowance)}</div>
                    <div class="col-md-4">${textField("Account Class", data.acctclass_code)}</div>
                    <div class="col-md-4">${textField("Record Status", data.rcrd_status)}</div>
                </div>

                <div style="border-top:1px solid ${UI.borderSoft};margin:12px 0;"></div>

                <div style="font-size:14.5px;font-weight:800;margin-bottom:10px;color:${UI.text};">Coverage & Remarks</div>

                <div class="row">
                    <div class="col-md-6">${textField("Period From", formatDate(data.period_from))}</div>
                    <div class="col-md-6">${textField("Period To", formatDate(data.period_to))}</div>
                </div>

                <div class="form-group">
                    <label style="font-size:13.5px;color:${UI.label};font-weight:600;">Remarks</label>
                    <textarea class="form-control" rows="2" readonly
                        style="font-size:14.5px;border-radius:8px;background:${UI.inputBg};border:1px solid ${UI.border};color:${UI.text};resize:none;">${safe(data.remarks)}</textarea>
                </div>

            </div>

            <div style="font-size:12.5px;color:${UI.muted};text-align:right;margin-top:10px;">
                View-only record • Verify before annual tax processing
            </div>

        </div>
    `;

        swal({
            content: { element: "div", attributes: { innerHTML: html } },
            buttons: false,   // remove default bottom button
            className: "swal-wide"
        });
    };







    s.search_in_list = function (value) {
        $("#pnia_table").DataTable().search(value).draw();
    };

    s.setNumOfRow = function (value) {
        s.rowLen = value;
        $("#pnia_table").DataTable().page.len(parseInt(value)).draw();
    };

   
    function init() {
        init_table_data([]);
      
        $("#gearLoader").fadeIn(200);
        h.post("../cPayrollNotInAnnualTaxDetails/InitializeData", { par_payroll_year: "", par_empl_id: "" })
            .then(function (d) {
                s.datalistgrid = d.data.sp_annualtax_dtl_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid)

                s.txtb_empl_id = d.data.empl_id
                s.txtb_empl_type_hdr = d.data.emp_type_descr
                s.txtb_ddl_year = d.data.payroll_year
                s.txtb_empl_name_hdr = d.data.empl_master_details.employee_name
               /* $("#loading_data").modal("hide");*/
            }).catch(function (d) {
                console.log(d.data.error)
            }).finally(function () {

                // ❌ HIDE LOADER
                $("#gearLoader").fadeOut(200);

            });
    }

    
    init();

    s.btn_generate_action = function () {

        if (!s.txtb_ddl_year) {
            swal("Payroll year is required.", { icon: "warning" });
            return;
        }

        swal({
            title: "Generate Payroll Not In Annual Tax Details?",
            text: "This will process the selected employee's payroll records.",
            icon: "warning",
            buttons: true,
            dangerMode: false
        }).then(function (willProceed) {

            if (willProceed) {
                $("#gearLoader").fadeIn(200);
                h.post("../cPayrollNotInAnnualTaxDetails/GeneratePayrollNotInAnnual", {
                    payroll_year: s.txtb_ddl_year,
                    empl_id: s.txtb_empl_id || ""
                }).then(function (d) {

                    var msg = d.data.message;
                    var icon = d.data.icon || "success";

                    s.datalistgrid = d.data.sp_annualtax_dtl_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)

                    swal({
                        title: icon === "success" ? "Success" :
                            icon === "error" ? "Error" :
                                icon === "warning" ? "Warning" : "Notice",

                        text: msg,
                        icon: icon,

                        button: {
                            text: "OK",
                            className: "swal-btn-pro"
                        },

                        closeOnClickOutside: false,
                        closeOnEsc: true
                    });

                }).catch(function () {

                    swal("Server connection error.", { icon: "error" });

                }).finally(function () {

                    // ❌ HIDE LOADER
                    $("#gearLoader").fadeOut(200);

                });

            }
        });
    };


    
    //************************************//
    //***Back to BIR Tax Header****//
    //************************************// 

    s.BacktoTaxHeader = function () {
        url = "/cBIRAnnualizedTax"
        window.location.replace(url);
    }

});
    