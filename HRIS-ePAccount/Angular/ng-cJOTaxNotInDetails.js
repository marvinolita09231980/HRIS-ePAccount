
//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for JO Tax - Not In Tax Details
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JRV                       03/24/2026      Code Creation
//**********************************************************************************

ng_HRD_App.controller("cJOTaxNotInDetails_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;

    s.oTable      = null;
    s.datalistgrid = [];
    s.rowLen       = "10";
    var sort_value = 0;
    var sort_order = "asc";

    // ─────────────────────────────────────────────
    // Currency formatter
    // ─────────────────────────────────────────────
    function currency(d) {
        if (d === null || d === undefined || d === "") return "0.00";
        var n = parseFloat(d);
        if (isNaN(n)) return "0.00";
        return n.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    function safe(v) {
        return (v === null || v === undefined) ? "" : v;
    }

    function formatDate(val) {
        if (!val) return "";
        // .NET Date(/Date(ms)/) format
        var m = /\d+/.exec(val.toString());
        if (m) {
            var d = new Date(parseInt(m[0]));
            return $filter('date')(d, 'yyyy-MM-dd');
        }
        return val;
    }

    // ─────────────────────────────────────────────
    // DataTable init
    // ─────────────────────────────────────────────
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#tbl_notindetails').dataTable({
            data: s.datalistgrid,
            stateSave: false,
            sDom: 'rt<"bottom"p>',
            pageLength: parseInt(s.rowLen),
            autoWidth: false,
            scrollX: false,
            responsive: true,
            columns: [
                {
                    "mData": "voucher_nbr",
                    "mRender": function (data) {
                        return "<div class='text-center'>" + safe(data) + "</div>";
                    }
                },
                {
                    "mData": "payroll_registry_nbr",
                    "mRender": function (data) {
                        return "<div class='text-center'>" + safe(data) + "</div>";
                    }
                },
                {
                    "mData": "payroll_registry_descr",
                    "mRender": function (data) {
                        return "<div class='text-left'>" + safe(data) + "</div>";
                    }
                },
                {
                    "mData": null,
                    "mRender": function (data, type, full) {
                        return "<div class='text-left'>" + safe(full.payrolltemplate_code) + " - " + safe(full.payrolltemplate_descr) + "</div>";
                    }
                },
                {
                    "mData": "payroll_month",
                    "mRender": function (data) {
                        return "<div class='text-center'>" + safe(data) + "</div>";
                    }
                },
                {
                    "mData": "payroll_year",
                    "mRender": function (data) {
                        return "<div class='text-center'>" + safe(data) + "</div>";
                    }
                },
                {
                    "mData": "period_from",
                    "mRender": function (data) {
                        return "<div class='text-center'>" + formatDate(data) + "</div>";
                    }
                },
                {
                    "mData": "period_to",
                    "mRender": function (data) {
                        return "<div class='text-center'>" + formatDate(data) + "</div>";
                    }
                },
                {
                    "mData": "posted_date",
                    "mRender": function (data) {
                        return "<div class='text-center'>" + formatDate(data) + "</div>";
                    }
                },
                {
                    "mData": "gross_pay",
                    "mRender": function (data) {
                        return "<div class='text-right' style='padding-right:8px;'>" + currency(data) + "</div>";
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "mRender": function (data, type, full, row) {
                        return '<center><div class="btn-group">' +
                            '<button type="button" class="btn btn-info btn-sm" style="font-size:18px;" data-toggle="tooltip" title="View Details" ng-click="btn_view_action(' + row["row"] + ')">' +
                            '<i class="fa fa-eye"></i></button>' +
                            '</div></center>';
                    }
                }
            ],
            "createdRow": function (row, data, index) {
                $(row).attr('id', index);
                $compile(row)($scope);
            }
        });

        s.oTable.fnSort([[sort_value, sort_order]]);
        s.oTable.fnClearTable();
        if (s.datalistgrid.length > 0) {
            s.oTable.fnAddData(s.datalistgrid);
        }
    };

    // ─────────────────────────────────────────────
    // View (modal) action
    // ─────────────────────────────────────────────
    s.btn_view_action = function (rowIndex) {
        var d = s.datalistgrid[rowIndex];

        var UI = {
            text:       "#111827",
            text2:      "#1f2933",
            label:      "#374151",
            muted:      "#6b7280",
            cardBg:     "#f7f8f5",
            inputBg:    "#ffffff",
            border:     "#d1d5db",
            borderSoft: "#e5e7eb"
        };

        function tf(label, value) {
            return '<div class="form-group" style="margin-bottom:10px;">' +
                '<label style="font-size:16px;color:' + UI.label + ';font-weight:600;display:block;">' + label + '</label>' +
                '<input class="form-control" style="height:42px;font-size:18px;border-radius:6px;background:' + UI.inputBg + ';border:1px solid ' + UI.border + ';color:' + UI.text + ';" readonly value="' + safe(value) + '">' +
                '</div>';
        }

        function mf(label, value) {
            return '<div class="form-group" style="margin-bottom:10px;">' +
                '<label style="font-size:16px;color:' + UI.label + ';font-weight:600;display:block;">' + label + '</label>' +
                '<div style="position:relative;">' +
                '<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:' + UI.muted + ';font-size:18px;">&#8369;</span>' +
                '<input class="form-control text-right" style="height:42px;font-size:18px;border-radius:6px;padding-left:28px;background:' + UI.inputBg + ';border:1px solid ' + UI.border + ';font-weight:600;color:' + UI.text + ';" readonly value="' + currency(value) + '">' +
                '</div></div>';
        }

        var html =
            '<div style="text-align:left;max-width:1100px;font-family:\'Segoe UI\',sans-serif;color:' + UI.text2 + ';position:relative;">' +

            '<button onclick="swal.close()" style="position:absolute;top:-10px;right:-10px;background:#fff;border:1px solid ' + UI.border + ';width:32px;height:32px;border-radius:50%;font-size:15px;font-weight:bold;color:#6b7280;cursor:pointer;">&#10005;</button>' +

            '<div style="margin-bottom:12px;">' +
                '<div style="font-size:18px;font-weight:800;color:' + UI.text + ';">Payroll Registry Details</div>' +
                '<div style="font-size:13px;color:' + UI.muted + ';">JO Tax — Not In Tax Details</div>' +
            '</div>' +

            '<div style="background:' + UI.cardBg + ';border:1px solid ' + UI.borderSoft + ';border-radius:12px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,0.04);">' +

                '<div style="font-size:13.5px;font-weight:800;margin-bottom:8px;color:' + UI.text + ';">Identifiers</div>' +
                '<div class="row">' +
                    '<div class="col-md-3">' + tf("Voucher No.", d.voucher_nbr) + '</div>' +
                    '<div class="col-md-3">' + tf("Employee ID", d.empl_id) + '</div>' +
                    '<div class="col-md-3">' + tf("Employment Type", d.employment_type) + '</div>' +
                    '<div class="col-md-3">' + tf("Registry No.", d.payroll_registry_nbr) + '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-md-4">' + tf("Template Code", d.payrolltemplate_code) + '</div>' +
                    '<div class="col-md-4">' + tf("Payroll Month", d.payroll_month) + '</div>' +
                    '<div class="col-md-4">' + tf("Payroll Year", d.payroll_year) + '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-md-4">' + tf("Period From", formatDate(d.period_from)) + '</div>' +
                    '<div class="col-md-4">' + tf("Period To", formatDate(d.period_to)) + '</div>' +
                    '<div class="col-md-4">' + tf("Posted Date", formatDate(d.posted_date)) + '</div>' +
                '</div>' +

                '<div style="border-top:1px solid ' + UI.borderSoft + ';margin:10px 0;"></div>' +
                '<div style="font-size:13.5px;font-weight:800;margin-bottom:8px;color:' + UI.text + ';">Earnings</div>' +
                '<div class="row">' +
                    '<div class="col-md-3">' + mf("Gross Pay", d.gross_pay) + '</div>' +
                    '<div class="col-md-3">' + mf("Net Pay", d.net_pay) + '</div>' +
                    '<div class="col-md-3">' + mf("Wages", d.wages_amt) + '</div>' +
                    '<div class="col-md-3">' + mf("PERA Amt", d.pera_amt) + '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-md-3">' + mf("LOWP Amt (PERA)", d.lowp_amount_pera) + '</div>' +
                    '<div class="col-md-3">' + mf("Lates Amt (PERA)", d.lates_amount_pera) + '</div>' +
                    '<div class="col-md-3">' + mf("LOWP Amt", d.lowp_amount) + '</div>' +
                    '<div class="col-md-3">' + mf("Lates Amt", d.lates_amount) + '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-md-3">' + mf("Cash Gift", d.cash_gift_amt) + '</div>' +
                    '<div class="col-md-3">' + mf("Hazard Pay", d.hazard_pay) + '</div>' +
                    '<div class="col-md-3">' + mf("Subsistence Pay", d.subsistence_pay) + '</div>' +
                    '<div class="col-md-3">' + mf("Laundry Pay", d.laundry_pay) + '</div>' +
                '</div>' +

                '<div style="border-top:1px solid ' + UI.borderSoft + ';margin:10px 0;"></div>' +
                '<div style="font-size:13.5px;font-weight:800;margin-bottom:8px;color:' + UI.text + ';">Deductions</div>' +
                '<div class="row">' +
                    '<div class="col-md-3">' + mf("GSIS PS", d.gsis_ps) + '</div>' +
                    '<div class="col-md-3">' + mf("PHIC PS", d.phic_ps) + '</div>' +
                    '<div class="col-md-3">' + mf("HDMF PS", d.hdmf_ps) + '</div>' +
                    '<div class="col-md-3">' + mf("Other Premium 3", d.other_premium3) + '</div>' +
                '</div>' +

                '<div style="border-top:1px solid ' + UI.borderSoft + ';margin:10px 0;"></div>' +
                '<div style="font-size:13.5px;font-weight:800;margin-bottom:8px;color:' + UI.text + ';">Withholding Tax</div>' +
                '<div class="row">' +
                    '<div class="col-md-3">' + mf("BIR Tax", d.bir_tax) + '</div>' +
                    '<div class="col-md-3">' + mf("WTax", d.wtax) + '</div>' +
                    '<div class="col-md-3">' + mf("WTax 2%", d.wtax_2perc) + '</div>' +
                    '<div class="col-md-3">' + mf("WTax 3%", d.wtax_3perc) + '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-md-3">' + mf("WTax 5%", d.wtax_5perc) + '</div>' +
                    '<div class="col-md-3">' + mf("WTax 8%", d.wtax_8perc) + '</div>' +
                    '<div class="col-md-3">' + mf("WTax 10%", d.wtax_10perc) + '</div>' +
                    '<div class="col-md-3">' + mf("WTax 15%", d.wtax_15perc) + '</div>' +
                '</div>' +

                '<div style="border-top:1px solid ' + UI.borderSoft + ';margin:10px 0;"></div>' +
                '<div style="font-size:13.5px;font-weight:800;margin-bottom:8px;color:' + UI.text + ';">Registry Info</div>' +
                '<div class="row">' +
                    '<div class="col-md-6">' + tf("Registry Description", d.payroll_registry_descr) + '</div>' +
                    '<div class="col-md-6">' + tf("Template Description", d.payrolltemplate_descr) + '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-md-6">' + tf("Posted Date/Time", safe(d.posted_dttm)) + '</div>' +
                '</div>' +

            '</div>' +
            '<div style="font-size:11.5px;color:' + UI.muted + ';text-align:right;margin-top:8px;">View-only record</div>' +
            '</div>';

        swal({
            content: { element: "div", attributes: { innerHTML: html } },
            buttons: false,
            className: "swal-wide"
        });
    };

    // ─────────────────────────────────────────────
    // Search / pagination helpers
    // ─────────────────────────────────────────────
    s.search_in_list = function (value) {
        $("#tbl_notindetails").DataTable().search(value).draw();
    };

    s.setNumOfRow = function (value) {
        s.rowLen = value;
        $("#tbl_notindetails").DataTable().page.len(parseInt(value)).draw();
    };

    s.btn_generate_action = function () {
        swal({
            title: "Regenerate JO Tax?",
            text: "Are you sure you want to regenerate JO tax for " + s.txtb_empl_id + "?",
            icon: "warning",
            buttons: true,
            dangerMode: true
        }).then(function (willGenerate) {
            if (!willGenerate) return;
            $("#gearLoader").fadeIn(200);
            h.post("../cJOTaxRate/GenerateJOTaxSingleEmployee", {
                empl_id        : s.txtb_empl_id,
                payroll_year   : s.txtb_year,
                employment_type: "JO"
            }).then(function (response) {
                var data = response.data;
                if (data.success) {
                    swal(data.result_msg, { icon: "success" });
                    // Reload the list
                    h.post("../cJOTaxNotInDetails/InitializeData", {}).then(function (d) {
                        if (d.data.message === "success") {
                            s.datalistgrid = d.data.data;
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length > 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                        }
                    });
                } else {
                    swal("Generation Failed!", data.message, "error");
                }
            }).catch(function () {
                swal("Error!", "An unexpected error occurred.", "error");
            }).finally(function () {
                $("#gearLoader").fadeOut(200);
            });
        });
    };

    s.BackToJOTaxRate = function () {
        window.location.replace("/cJOTaxRate");
    };

    // ─────────────────────────────────────────────
    // Page init
    // ─────────────────────────────────────────────
    function init() {
        init_table_data([]);
        $("#gearLoader").fadeIn(200);
        h.post("../cJOTaxNotInDetails/InitializeData", {})
            .then(function (d) {
                if (d.data.message === "success") {
                    s.txtb_empl_id    = d.data.empl_id;
                    s.txtb_year       = d.data.payroll_year;
                    s.datalistgrid    = d.data.data;
                    s.oTable.fnClearTable();
                    if (s.datalistgrid.length > 0) {
                        s.oTable.fnAddData(s.datalistgrid);
                    }
                } else {
                    swal("Error", d.data.error || "Failed to load data.", "error");
                }
            })
            .catch(function () {
                swal("Error", "An unexpected error occurred.", "error");
            })
            .finally(function () {
                $("#gearLoader").fadeOut(200);
            });
    }

    init();
});
