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




ng_HRD_App.controller("cJOTaxRate_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var index_update = "";

    s.allow_edit = false
    s.allow_print = false
    s.allow_delete = false
    s.allow_view = false
    s.allow_edit_history = false

    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "5"
    var sort_value = 1
    var sort_order = "asc"
    s.adddetails = null;
    s.isAction = "";
    s.btnAddShow = false;
    s.isShowEffectiveDate_hid = false
    s.isShowEffectiveDate = false
    s.isShowBirSelect = true

    s.currentBIRClass = ""
    s.isDisabledBIRClass = false

    s.isDisabledWHeld = false
    s.isDisabledBTax = false
    s.isDisabledVat = false
    s.isDisabledExmpt = false
    s.pending_gen_count = 0;
    s.failed_gen_count = 0;

    toastr.options = {
        closeButton: true,
        progressBar: true,
        newestOnTop: true,
        timeOut: 3000,
        extendedTimeOut: 1000,
        positionClass: "toast-top-right",
        preventDuplicates: true
    };

    var currentBIRClass = "";

    var queuePoller = null;
    s.pending_gen_count = 0;
    s.failed_gen_count = 0;
    s.running_gen_count = 0;

    // Generation Status tab variables
    s.search_box_gen = "";
    s.txtb_gen_date = new Date();
    s.filterWithErrors = false;
    s.gen_rows_count = 0;
    s.gen_success_count = 0;
    s.gen_fails_count = 0;
    s.datalistgrid_gen = [];
    s.progressPercent = 0;
    s.filteredRowsCount = 0;
    s.filteredSuccessCount = 0;
    s.filteredFailsCount = 0;
    s.lastRefreshTime = "";
    var oTableGen = null;

    s.refreshQueueCounts = function () {
        if (!$("#ddl_year").val() || !$("#ddl_department").val()) return;

        h.post("../cJOTaxRate/GetQueueCounts", {
            par_payroll_year: $("#ddl_year").val(),
            par_department_code: $("#ddl_department").val()
        }).then(function (d) {
            if (d.data.message === "success") {
                s.pending_gen_count = d.data.pending_count || 0;
                s.failed_gen_count = d.data.failed_count || 0;
                s.running_gen_count = d.data.running_count || 0;
            }
        });
    };

    // start polling every 5 seconds

    s.startQueuePolling = function () {
        if (queuePoller) clearInterval(queuePoller);
        queuePoller = setInterval(function () {
            s.refreshQueueCounts();
            if (!s.$$phase) s.$apply();
        }, 5000);
    };

    // stop polling on controller destroy (avoid leaks)
    s.$on("$destroy", function () {
        if (queuePoller) clearInterval(queuePoller);
    });


    $('#main_modal').on('shown.bs.modal', function () {
        var $ddl = $('#ddl_employee_name');

        if ($ddl.hasClass('select2-hidden-accessible')) {
            $ddl.select2('destroy');
        }

        $ddl.select2({
            width: '100%',
            dropdownParent: $('#main_modal')
        });

        $ddl.off('change').on('change', function () {
            if (s._syncingEmployeeSelect2) return; // ✅ prevent loop
            s.selectEmployee();
            if (!s.$$phase) s.$apply();
        });

        // IMPORTANT: call AFTER select2()
        toggleEmployeeSelect2UI(!s.isShowNameInput);
    });


    function init() {
        //$("#ddl_employee_name").select2().on('change', function (e) {
        //    s.selectEmployee();
        //})
        $("#gearLoader").fadeIn(200)
        RetrieveYear()
        h.post("../cJOTaxRate/InitializeData", { par_payroll_year: new Date().getFullYear().toString() }).then(function (d) {

            s.employeeddl = d.data.empType
            s.ddl_employment_type = d.data.ddl_emp_type
            s.ddl_year = d.data.ddl_year == "" || d.data.ddl_year == null ? s.ddl_year = new Date().getFullYear().toString() : d.data.ddl_year
            s.ddl_department = d.data.department_code == "" || d.data.department_code == null ? s.ddl_department = "" : d.data.department_code

            $("#ddl_status").val("N")

            $("#ddl_w_held").val("0")
            $("#ddl_b_tax").val("0")
            $("#ddl_vat").val("0")
            s.ddl_w_held = "0"
            s.ddl_b_tax = "0"
            s.ddl_vat = "0"


            if ($("#ddl_department").val() != "") {
                s.btnAddShow = true
            }

            else {
                s.btnAddShow = false
            }

            if (s.ddl_department != "") {
                s.btnAddShow = true
            }

            s.w_held_data = d.data.taxrate_percentage_tbl_list

            s.ddl_w_held = ""
            $("#ddl_w_held").val("")
            s.ddl_b_tax = ""
            $("#ddl_b_tax").val("")
            s.ddl_vat = ""
            $("#ddl_vat").val("")

            if (d.data.history != "" || d.data.history != null || d.data.history == undefined) {
                if (d.data.history == "N") {
                    s.chckbx_history = false
                }

                else if (d.data.history == "Y") {
                    s.chckbx_history = true
                }

            }


            init_table_data([]);

            s.allow_edit = d.data.um.allow_edit
            s.allow_print = d.data.um.allow_print
            s.allow_delete = d.data.um.allow_delete
            s.allow_print = d.data.um.allow_print
            s.allow_edit_history = d.data.um.allow_edit_history
            s.allow_view = 1

            s.department_data = d.data.department_list
            s.bir_class_data = d.data.bir_class_list

            $("#datalist_grid").DataTable().search("").draw();

            if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {

                s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                s._datalistgrid_master = s.datalistgrid;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid)
            }
            else {
                s.datalistgrid = [];
                s._datalistgrid_master = [];
                s.oTable.fnClearTable();
            }






            sort_value = d.data.sort_value
            page_value = d.data.page_value
            sort_order = d.data.sort_order
            s.rowLen = d.data.show_entries
            $("#datalist_grid").DataTable().page.len(s.rowLen).draw();
            s.oTable.fnSort([[sort_value, sort_order]]);
            s.oTable.fnPageChange(page_value);
            s.search_box = d.data.search_value

            if (s.search_box == undefined || s.search_box == '') {
                s.search_box = ''
            }

            else {
                s.search_in_list(s.search_box, 'datalist_grid')
            }

            $("#gearLoader").fadeOut(200)
        })
    }
    init()

    s.jotax_count = 0;
    s.loadJOTaxCount = function () {
        h.get("../Menu/GetTaxToUpdate").then(function (d) {
            if (d.data.message === "Success") {
                s.jotax_count = d.data.jotax || 0;
            }
        });
    };
    s.loadJOTaxCount();

    s.startQueuePolling();
    s.refreshQueueCounts();

    // Refresh list (triggered by toolbar button)
    s.btn_refresh_list = function () {
        $("#btn_refresh_icon").removeClass("fa fa-refresh");
        $("#btn_refresh_icon").addClass("fa fa-spinner fa-spin");
        var year = s.ddl_year || new Date().getFullYear().toString();
        h.post("../cJOTaxRate/InitializeData", { par_payroll_year: year }).then(function (d) {
            if (d.data.sp_payrollemployee_tax_hdr_tbl_list && d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                s._datalistgrid_master = s.datalistgrid;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid);
            } else {
                s.datalistgrid = [];
                s._datalistgrid_master = [];
                s.oTable.fnClearTable();
            }
            $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
            $("#btn_refresh_icon").addClass("fa fa-refresh");
        }).catch(function (err) {
            console.error(err);
            $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
            $("#btn_refresh_icon").addClass("fa fa-refresh");
        });
    }

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "empl_id", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "employee_name", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "w_tax_perc", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                    {
                        "mData": "bus_tax_perc", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                    {
                        "mData": "vat_perc", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },



                    {
                        "mData": "total_gross_pay", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<div class='btn-block text-right'>" + retdata + "</div>";
                        }
                    },

                    {
                        "mData": "vat",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            if (data !== null && data !== undefined && parseFloat(data) !== 0) {
                                return "<div class='btn-block text-right'>" + currency(data) + "</div>";
                            }
                            return "<div class='btn-block text-center'>-</div>";
                        }
                    },

                    {
                        "mData": "cnt",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var count = data || 0;
                            return "<center><button type='button' class='btn btn-info btn-xs' ng-click=\"btn_cnt_action(" + row["row"] + ")\">" + count + "</button></center>";
                        }
                    },

                    {
                        "mData": "rcrd_status_descr", "mRender": function (data, type, full, row) {
                            var style = "font-size:10px; padding:2px 5px;";
                            var statusText = (data || '').toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
                            var statusBadgeClass = statusText === 'New' ? 'badge-danger' : 'badge-info';
                            var badges = "<span class='badge " + statusBadgeClass + "' style='" + style + "'>" + statusText + "</span>";
                            if (full["fixed_rate"] == true || full["fixed_rate"] == 1) {
                                badges += " <span class='badge badge-warning' style='" + style + "'>Fixed Rate</span>";
                            }
                            if (full["with_sworn"] == true || full["with_sworn"] == 1) {
                                badges += " <span class='badge badge-success' style='" + style + "'>With Sworn</span>";
                            }
                            return "<div class='btn-block text-center'>" + badges + "</div>";
                        }
                    },

                    {
                        "mData": "rcrd_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'

                                + '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="Show Details" ng-show="' + s.allow_view + '" ng-click="btn_show_action(' + full["empl_id"] + ')" > '
                                + '<i class="fa fa-plus"></i>' + '</button>'
                               // + '<button type="button" class="btn btn-default btn-sm action" style="background-color:blueviolet;color:white;border:1px solid blueviolet;" data-toggle="tooltip" data-placement="left" title="Generate Annualized Tax" ng-show="' + s.allow_edit + '" ng-click="btn_generate_action(' + row["row"] + ')" > '
                               //*+ '<i class="fa fa-clipboard"></i>' + '</button>'*/

                                + '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Print" ng-show="' + s.allow_print + '" ng-click="btn_print_action(' + full["empl_id"] + ')" > '
                                + '<i class="fa fa-print"></i>' + '</button>'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + full["empl_id"] + ')" > '
                                + '<i class="fa fa-edit"></i>' + '</button>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + full["empl_id"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button>'
                                + '<button type="button" class="btn btn-success btn-sm action" data-toggle="tooltip" data-placement="left" title="VAT Setup" ng-click="btn_vat_action(' + full["empl_id"] + ')" > '
                                + '<i class="fa fa-arrow-right"></i>' + '</button>'
                              // + '<button type="button" class="btn btn-sm action" style="background-color:#e67e22;color:white;border:1px solid #e67e22;" data-toggle="tooltip" data-placement="left" title="Generate JO Tax" ng-show="' + s.allow_edit + '" ng-click="btn_generate_jo_tax_action(' + row["row"] + ')" > '
                             //  + '<i class="fa fa-file-text"></i>' + '</button>'
                                + '</div ></center > '

                        }
                    }

                ],
                "fnRowCallback": function (row, data, index) {
                    $(row).attr('id', index);
                    if (data.rcrd_status === 'N') {
                        $(row).css('background-color', '#fdecea');
                        $(row).css('color', '#a93226');
                    }
                    $compile(row)($scope);
                },

                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTable.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    function approvedOrnew(data) {
        if (data == "A") {
            return true
        }
        else {
            return false
        }
    }

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined || isNaN(d) == true) {
            return retdata = "0.00"
        }
        else {

            retdata = parseFloat(d).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            //retdata = parseFloat(d).toFixed(2)
            return retdata
        }

    }





    //************************************//
    //***Select-Payroll-Year-DropDown****//
    //************************************// 
    s.SelectPayrollYear = function (par_year) {

        if (par_year.toString() != "" && s.ddl_department.toString() != "") {
            s.btnAddShow = true;
        }

        else {
            s.btnAddShow = false;
        }

        // Save selected year to jo_tax_gen_job_params for the SQL Agent job
        if (par_year.toString() != "") {
            h.post("../cJOTaxRate/SaveJobParams", { par_payroll_year: par_year });
        }

        $("#gearLoader").fadeIn(200)


        var history = "N"
        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }

        if (s.isAction == "ADD") {
            effective_date = $("#txtb_effective_date").val()
        }


        if ($("#ddl_year").val() != "" && $("#ddl_department").val() != "") {
            h.post("../cJOTaxRate/RetrieveDataListGrid",
                {
                    pay_payroll_year: $("#ddl_year").val(),
                    par_department_code: $("#ddl_department").val(),
                    par_history: history

                }).then(function (d) {
                    if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {
                        console.log(d.data.sp_payrollemployee_tax_hdr_tbl_list)
                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s._datalistgrid_master = s.datalistgrid;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                    }
                    else {
                        s.oTable.fnClearTable();
                    }

                    $("#gearLoader").fadeOut(200)

                })
        }

        else {
            s.oTable.fnClearTable();
            $("#gearLoader").fadeOut(200)
        }

    }

    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectLetter = function (par_empType, par_year, par_letter) {
        $("#gearLoader").fadeIn(200)
        h.post("../cJOTaxRate/SelectLetter",
            {
                par_empType: par_empType,
                par_year: par_year,
                par_letter: par_letter

            }).then(function (d) {
                if (d.data.sp_annualtax_hdr_tbl_list.length > 0) {

                    s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable.fnClearTable();
                }


                $("#gearLoader").fadeOut(200)

            })

    }


    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectedDepartment_Change = function (ddl_department) {
        s.chckbx_unapproved_tax_rate = false;
        s.chckbx_fixed_rate = false;
        s.chckbx_vat_val = false;
        s.chckbx_with_sworn = false;
        s.chckbx_without_sworn = false;
        s._datalistgrid_master = null;
        s._datalistgrid_full = null;
        s._datalistgrid_full_fr = null;
        s._datalistgrid_full_vv = null;

        $("#gearLoader").fadeIn(200)
        if ($("#ddl_year").val() != "" && ddl_department.toString() != "") {
            s.btnAddShow = true;
        }

        else {
            s.btnAddShow = false;
        }

        $("#gearLoader").fadeIn(200)


        var history = "N"
        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }

        if (s.isAction == "ADD") {
            effective_date = $("#txtb_effective_date").val()
        }


        if ($("#ddl_year").val() != "" && $("#ddl_department").val() != "") {
            h.post("../RetrieveReadOnlyData/RetrieveDataListGrid",
                {
                    pay_payroll_year: $("#ddl_year").val(),
                    par_department_code: $("#ddl_department").val(),
                    par_history: history

                }).then(function (d) {

                    if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {
                        s.loadQueueCounts();

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s._datalistgrid_master = s.datalistgrid;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)

                        // Populate JO_job_param_list with the loaded empl_ids
                        var empl_ids = s.datalistgrid.map(function (x) { return x.empl_id; });

                        h.post("../cJOTaxRate/SaveJobParamList", {
                            par_payroll_year: $("#ddl_year").val(),
                            par_empl_ids: empl_ids
                        });
                    }
                    else {
                        s.oTable.fnClearTable();
                    }

                    $("#gearLoader").fadeOut(200)

                })
        }

        else {
            s.oTable.fnClearTable();
            $("#gearLoader").fadeOut(200)
        }

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




    s.loadPendingGenCount = function () {

        var yr = s.ddl_year || $("#ddl_year").val();
        if (!yr) return;

        var department = s.ddl_department || $("#ddl_department").val();
        if (!department) return;

        h.post("../cJOTaxRate/GetPendingGenCount", {
            par_payroll_year: yr,
            par_department_code: department
        }).then(function (d) {

            if (d.data.message === "success") {
                s.pending_gen_count = d.data.pending_count || 0;
            } else {
                s.pending_gen_count = 0;
            }



        });
    };

    s.confirmRunPendingGeneration = function () {

        if (s.pending_gen_count <= 0) return;

        swal({
            title: "Run Pending Tax Generation?",
            text: "There are " + s.pending_gen_count +
                " pending employee tax generation(s).\n\nDo you want to proceed?",
            icon: "warning",
            buttons: {
                cancel: {
                    text: "Cancel",
                    visible: true,
                    className: "btn-danger"
                },
                confirm: {
                    text: "Yes, Generate Now",
                    className: "btn-success"
                }
            },
            dangerMode: false
        }).then(function (willRun) {

            if (willRun) {
                s.runPendingGeneration();
            }
        });
    };

    s.runPendingGeneration = function () {

        var yr = s.ddl_year || $("#ddl_year").val();
        var dept = s.ddl_department || $("#ddl_department").val();

        if (!yr || !dept) {
            swal("Missing Filter",
                "Payroll year and department are required.",
                "warning");
            return;
        }

        // Optional: show spinner
        s.isPendingCountLoading = true;

        h.post("../cJOTaxRate/RunPendingGeneration", {
            par_payroll_year: yr,
            par_department_code: dept
        }).then(function (d) {

            if (d.data.message === "success") {
                swal("Generation Started",
                    "Pending tax generation is now processing.",
                    "success");

                // refresh pending count
                s.refreshQueueCounts();
                s.loadQueueCounts();
            }
            else {
                swal("Error",
                    d.data.message || "Unable to start generation.",
                    "error");
            }

            s.isPendingCountLoading = false;

        }, function () {
            s.isPendingCountLoading = false;
            swal("Error",
                "Server error while starting generation.",
                "error");
        });
    };


    s.confirmRetryFailedGeneration = function () {
        swal({
            title: "Retry failed generations?",
            text: "This will re-queue failed items and run the background job.",
            icon: "warning",
            buttons: true
        }).then(function (ok) {
            if (!ok) return;

            h.post("../cJOTaxRate/RetryFailed", {
                par_payroll_year: $("#ddl_year").val(),
                par_department_code: $("#ddl_department").val()
            }).then(function (d) {
                if (d.data.message === "success") {
                    toastr.success("Failed items re-queued. Background job started.");
                } else {
                    toastr.error(d.data.message);
                }
            });
        });
    };


    s.loadQueueCounts = function () {
        h.post("../cJOTaxRate/GetQueueCounts", {
            par_payroll_year: $("#ddl_year").val(),
            par_department_code: $("#ddl_department").val()
        }).then(function (d) {
            if (d.data.message === "success") {
                s.pending_gen_count = d.data.pending_count || 0;
                s.failed_gen_count = d.data.failed_count || 0;
            }
        });
    };



    function clearentry() {

        s.ddl_employee_name = "";
        $("#ddl_employee_name").val("")
        s.txtb_empl_id = ""
        $("#txtb_empl_id").val("")
        s.txtb_position = ""
        $("#txtb_position").val("")
        s.txtb_effective_date = ""
        $("#txtb_effective_date").val("")
        $("#ddl_fixed_rate").val("")
        $("#ddl_with_sworn").val("")
        $("#ddl_bir_class").val("")
        $("#ddl_deduction_status").val("")
        $("#ddl_status").val("")
        $("#txtb_effective_date").val("")
        $("#txtb_effective_date_hid").val("")
        $("#txtb_expt_amt").val("0.00")
        s.txtb_expt_amt = "0.00"
        $("#txtb_gross_pay").val("0.00")
        s.txtb_gross_pay = "0.00"
        s.txtb_position = ""
        s.txtb_empl_id = ""
        s.isDisabledBIRClass = false
        s.isDisabledBIRClass = false
        $("#ddl_w_held").val("0")
        $("#ddl_b_tax").val("0")
        $("#ddl_vat").val("0")
        s.ddl_w_held = "0"
        s.ddl_b_tax = "0"
        s.ddl_vat = "0"
        s.isDisabledWHeld = false
        s.isDisabledBTax = false
        s.isDisabledVat = false
        s.isDisabledExmpt = false
        s.txtb_empl_name = ""
        FieldValidationColorChanged(false, "ALL");
    }


    s.btn_generate_action = function (id_ss) {
        index_update = ""
        index_update = id_ss

        swal({
            title: "Are you sure to Update this record?",
            text: "Once generated, data will be updated automatically!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {

                var history = "N"

                if (s.chckbx_history == true) {
                    var history = "Y"
                }

                else {
                    var history = "N"
                }

                h.post("../cJOTaxRate/GenerateByEmployee", {
                    par_empl_id: s.datalistgrid[id_ss].empl_id
                    , par_payroll_year: $("#ddl_year").val()
                    , par_department_code: $("#ddl_department").val()
                    , par_history: history
                }).then(function (d) {

                    if (d.data.message == "success") {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s._datalistgrid_master = s.datalistgrid;

                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        else {
                            s.oTable.fnClearTable();
                        }

                        s.oTable.fnSort([[sort_value, sort_order]]);

                        swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                    }

                })

            }
        })
    }



    s.btn_generate_all_jo_tax = function () {
        swal({
            title: "Generate Tax for All JO Employees?",
            text: "This will generate the tax header and detail for all Job Order employees in the selected payroll year.",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willGenerate) {
            if (willGenerate) {

                var history = s.chckbx_history == true ? "Y" : "N"

                $("#gearLoader").fadeIn(200)
                h.post("../cJOTaxRate/GenerateAllJOTax", {
                    par_payroll_year: $("#ddl_year").val()
                    , par_department_code: $("#ddl_department").val()
                    , par_history: history
                }).then(function (d) {

                    $("#gearLoader").fadeOut(200)
                    console.log(d.data.message)
                    if (d.data.message == "success") {

                        toastr.success(d.data.result_msg, "Generation Complete!")
                    }
                    else {
                        toastr.error(d.data.result_msg, "Generation Failed!")
                    }

                }).catch(function () {
                    $("#gearLoader").fadeOut(200)
                    toastr.error("An unexpected error occurred during generation.", "Generation Failed!")
                })
            }
        })
    }


    s.btn_generate_jo_tax_action = function (id_ss) {
        index_update = ""
        index_update = id_ss

        swal({
            title: "Generate JO Tax?",
            text: "This will generate the tax header and detail for the selected employee.",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willGenerate) {
            if (willGenerate) {

                var history = s.chckbx_history == true ? "Y" : "N"

                h.post("../cJOTaxRate/GenerateJOTax", {
                    par_empl_id: s.datalistgrid[id_ss].empl_id
                    , par_payroll_year: $("#ddl_year").val()
                    , par_department_code: $("#ddl_department").val()
                    , par_history: history
                }).then(function (d) {

                    if (d.data.message == "success") {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s._datalistgrid_master = s.datalistgrid;

                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);
                        }
                        else {
                            s.oTable.fnClearTable();
                        }

                        s.oTable.fnSort([[sort_value, sort_order]]);
                        swal("Successfully Generated!", "JO Tax has been successfully generated!", "success")
                    }
                    else {
                        swal("Error!", d.data.Message, "error")
                    }

                })
            }
        })
    }

    function getDateFromBatchId(batchId) {

        // ✅ Stop immediately if invalid
        if (!batchId || typeof batchId !== "string") {
            return null;
        }

        // Trim just in case
        batchId = batchId.trim();

        if (batchId.length < 8) {
            return null;
        }

        var year = parseInt(batchId.slice(0, 4), 10);
        var month = parseInt(batchId.slice(4, 6), 10) - 1;
        var day = parseInt(batchId.slice(6, 8), 10);

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return null;
        }

        var date = new Date(year, month, day);

        // ✅ Validate actual date
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }
    function toDateOnly(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    function escapeQuotes(str) {
        if (str == null || str == undefined) return '';
        return str.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ').replace(/\r/g, '');
    }

    function truncateText(text, maxLength) {
        if (text == null || text == undefined) return '';
        text = text.toString();
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }
    function text_color(d) {
        if (d == "E") {
            return "text-danger"
        } else {
            return ""
        }
    }

    s.showDetailModal = function (title, content) {
        s.modalDetailTitle = title;
        s.modalDetailContent = content;
        $('#modal_cell_detail').modal('show');
    }

    // ── Generation Status Tab ──────────────────────────────────────────────────

    var init_table_gen_data = function (par_data) {
        s.datalistgrid_gen = par_data || [];

        if (oTableGen) {
            oTableGen.fnClearTable();
            if (s.datalistgrid_gen.length > 0) oTableGen.fnAddData(s.datalistgrid_gen);
            return;
        }

        oTableGen = $('#datalist_grid_gen').dataTable({
            data: s.datalistgrid_gen,
            stateSave: false,
            sDom: 'rt<"bottom"p>',
            pageLength: 10,
            "fnDrawCallback": function (oSettings) {

                var api = this.api ? this.api() : table;

                // ✅ Get filtered rows
                var filteredData = api.rows({ filter: 'applied' }).data();

                var filteredRows = filteredData.length;
                var successCount = 0;
                var failsCount = 0;

                // ✅ Count rows where dtl_status == "SUCCESS"
                for (var i = 0; i < filteredData.length; i++) {
                    if (filteredData[i].dtl_status === "SUCCESS") {
                        successCount++;
                    }
                }
                // ✅ Count rows where dtl_status == "SUCCESS"
                for (var i = 0; i < filteredData.length; i++) {
                    if (filteredData[i].dtl_status === "ERROR") {
                        failsCount++;
                    }
                }

                // ✅ Set filtered success count
                s.filteredRowsCount = filteredRows;
                s.filteredSuccessCount = successCount;
                s.filteredFailsCount = failsCount

                // ✅ Compute percentage (avoid divide by zero)
                if (filteredRows > 0) {
                    s.progressPercent = Math.round(
                        (successCount / filteredRows) * 100
                    );
                } else {
                    s.progressPercent = 0;
                }

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            },
            rowCallback: function (row, data, index) {

                if ($scope.txtb_gen_date) {

                    var batchId = data.batch_id; // adjust column index if needed
                    var rowDate = getDateFromBatchId(batchId);

                    var filterDate = toDateOnly(new Date(s.txtb_gen_date));


                    if (rowDate < filterDate) {
                        $('td:eq(2)', row).css('color', '#d9534f'); // red
                        $('td:eq(3)', row).css('color', '#d9534f'); // red
                        var td4 = $('td:eq(4)', row);
                        td4.html("<div class='text-danger' style='cursor:pointer;' title='Click to view' ng-click=\"showDetailModal('Status', 'Not generated today : see last DTL generated time')\">Not generated today : see last DTL generated time</div>");
                        $compile(td4.contents())($scope);
                        if (data.dtl_status !== "ERROR") {
                            data.dtl_status = "ERROR";
                        }
                    }
                }


            },
            columns: [
                {
                    "mData": "empl_id", "mRender": function (data) {
                        return "<div class='text-center'>" + data + "</div>";
                    }
                },
                {
                    "mData": "employee_name", "mRender": function (data, type, full, row) {
                        var displayText = truncateText(data, 30);
                        var hasMore = (data && data.length > 30);
                        if (hasMore) {
                            return "<div class='cell-truncate " + text_color(full["prc_status"]) + "' ng-click=\"showDetailModal('Employee Name', '" + escapeQuotes(data) + "')\" style='cursor:pointer;' title='Click to view full content'>" + displayText + "</div>";
                        }
                        return "<div class='btn-block text-left " + text_color(full["prc_status"]) + "'>" + data + "</div>";
                    }
                },
                {
                    "mData": "dtl_generated_datetime", "mRender": function (data, type, full, row) {
                        return "<div class='btn-block text-center " + text_color(full["prc_status"]) + "'>" + data + "</div>";
                    }
                },
                {
                    "mData": "hdr_generated_datetime", "mRender": function (data, type, full, row) {
                        return "<div class='btn-block text-center " + text_color(full["prc_status"]) + "'>" + data + "</div>";
                    }
                },
                {
                    "mData": "latest_error_msg", "mRender": function (data, type, full, row) {
                        var displayText = truncateText(data, 40);
                        var hasMore = (data && data.length > 40);
                        if (hasMore) {
                            return "<div class='cell-truncate text-danger' ng-click=\"showDetailModal('Error Message', '" + escapeQuotes(data) + "')\" style='cursor:pointer;' title='Click to view full content'>" + displayText + "</div>";
                        }
                        return "<div class='btn-block text-center " + text_color(full["prc_status"]) + "' ng-click=\"showDetailModal('Error Message', '" + escapeQuotes(data) + "')\" style='cursor:pointer;' title='Click to view full content'>" + (data || '') + "</div>";
                    }
                },
                {
                    "mData": "empl_id", "mRender": function (data, type, full) {
                        return "<button class='btn btn-xs btn-warning' ng-click=\"btn_regenerate_from_status('" + data + "', '" + (full["employee_name"] || "").replace(/'/g, "\\'") + "')\" title='Regenerate JO Tax'>" +
                            "<i class='fa fa-refresh'></i> Regenerate" +
                            "</button>";
                    }
                }
            ],
            "createdRow": function (row) {
                $compile(row)($scope);
            }
        });
    };

    init_table_gen_data([]);

    s.btn_refresh_generation_status = function (target_empl_id) {
        var year = $("#ddl_year").val();
        var dept = $("#ddl_department").val();

        if (!year || !dept) {
            toastr.warning("Please select a Payroll Year and Department first.", "Warning");
            return;
        }

        $("#gearLoaderWithQuickStat").fadeIn(200);
        $("#btn_refresh_icon").removeClass("fa fa-refresh");
        $("#btn_refresh_icon").addClass("fa fa-spinner fa-spin");

        function pollStatus() {
            h.post("../cJOTaxRate/Get_Generation_Status_List", {
                payroll_year:    year,
                department_code: dept
            }).then(function (d) {

                if (d.data.result && d.data.result.length > 0) {
                    s.datalistgrid_gen = d.data.result;
                    if (oTableGen) {
                        oTableGen.fnClearTable();
                        oTableGen.fnAddData(s.datalistgrid_gen);
                    }
                } else {
                    s.datalistgrid_gen = [];
                    if (oTableGen) { oTableGen.fnClearTable(); }
                }

                var now = new Date();
                s.lastRefreshTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                if (d.data.jobIsRunning) {
                    setTimeout(pollStatus, 3000);
                } else {

                    $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
                    $("#btn_refresh_icon").addClass("fa fa-refresh");
                    $("#gearLoaderWithQuickStat").fadeOut(200);

                    if (target_empl_id && s.datalistgrid_gen.length > 0) {
                        s.datalistgrid_gen.refreshTable("datalist_grid_gen", target_empl_id);
                    }
                }
            }).catch(function (error) {

                console.error('Error refreshing generation status:', error);
                $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
                $("#btn_refresh_icon").addClass("fa fa-refresh");
                $("#gearLoaderWithQuickStat").fadeOut(200);
            });
        }

        pollStatus();
    };


    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex, full) {
        if (settings.nTable.id !== "datalist_grid_gen") {
            return true;
        }

       
        var dtlDate = data[2]; // dtl_generated_datetime column index


        /* -------------------------
           1️⃣ FILTER WITH ERRORS
        ------------------------- */
        if (s.txtb_gen_date) {

            var batchId = full.batch_id; // adjust column index if needed
            var rowDate = getDateFromBatchId(batchId);

            var filterDate = toDateOnly(new Date(s.txtb_gen_date));


            if (rowDate < filterDate) {
                if (full.dtl_status !== "ERROR") {
                    full.dtl_status = "ERROR";
                }
            }
        }

        if (s.filterWithErrors) {
            if (full.dtl_status !== "ERROR") {
                return false;
            }
        }

        return true;
    });

    s.filterErrors = function () {
        console.log(oTableGen)
        if (oTableGen) {
            oTableGen.fnDraw();   // redraw table
        }

    };
    s.applyGenDateFilter = function () {
        // Optional safety: normalize empty value
        if (!s.txtb_gen_date) {
            s.txtb_gen_date = "";
        }

        // Coerce to string and trim safely
        var txtDateStr = String(s.txtb_gen_date).trim();

        // If empty, set to empty string
        if (txtDateStr === "") {
            s.txtb_gen_date = "";
        } else {
            // Keep the trimmed string
            s.txtb_gen_date = txtDateStr;
        }


        // Redraw DataTable to re-trigger ext.search filter
        if (oTableGen) {
            oTableGen.fnDraw();
        }
    };

    s.getWithErrorsEmplIdList = function () {

        var ddlyear = $("#ddl_year").val();
        var ddldept = $("#ddl_department").val();
        var errorList = [];
        var errorsOnly = false;

        // Read all rows from the generation status datatable
        var dt = $('#datalist_grid_gen').DataTable();

        dt.rows().every(function () {
            var rowData = this.data();
            var dtl_status = rowData.dtl_status;

            if (!s.filterWithErrors) {
                errorList.push({
                    empl_id:        rowData.empl_id,
                    payroll_year:   ddlyear,
                    employment_type: 'JO',
                    processed:      false
                });
            } else {
                if (dtl_status === "ERROR") {
                    errorList.push({
                        empl_id:        rowData.empl_id,
                        payroll_year:   ddlyear,
                        employment_type: 'JO',
                        processed:      false
                    });
                }
                errorsOnly = true;
            }
        });

        if (errorList.length === 0) {
            swal("List is empty!", { icon: "error" });
            return;
        }

        $("#gearLoaderWithQuickStat").fadeIn(200);
        $("#btn_refresh_icon").removeClass("fa fa-refresh");
        $("#btn_refresh_icon").addClass("fa fa-spinner fa-spin");

        h.post("../cJOTaxRate/StartAnnualTaxJob", {
            payrollYear:    ddlyear,
            departmentCode: ddldept,
            datalist:       errorList,
            errorsOnly:     errorsOnly
        }).then(function (response) {

            var data = response.data;

            if (data.success) {
                swal(data.message, { icon: "success" });
                s.btn_refresh_generation_status();
            } else {
                swal("Generation Failed!", data.message, "error");
                $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
                $("#btn_refresh_icon").addClass("fa fa-refresh");
                $("#gearLoaderWithQuickStat").fadeOut(200);
            }

        }).catch(function () {
            swal("Error!", "An unexpected error occurred.", "error");
            $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
            $("#btn_refresh_icon").addClass("fa fa-refresh");
            $("#gearLoaderWithQuickStat").fadeOut(200);
        });
    };



    s.btn_regenerate_from_status = function (empl_id, employee_name) {

        
        var ddlyear = $("#ddl_year").val();
        
        swal({
            title: "Regenerate JO Tax?",
            text: "Are you sure you want to regenerate JO tax for " + employee_name + "?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willGenerate) {
            if (willGenerate) {
              
                h.post("../cJOTaxRate/GenerateJOTaxSingleEmployee", {
                    empl_id: empl_id,
                    payroll_year: ddlyear,
                    employment_type: "JO",
                }).then(function (response) {

                    var data = response.data;
                   
                    if (data.success) {
                        
                        swal(data.result_msg, { icon: "success" });
                      
                       s.btn_refresh_generation_status(empl_id);
                        
                    } else {
                        swal("Generation Failed!", data.message, "error");
                        $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
                        $("#btn_refresh_icon").addClass("fa fa-refresh");
                        $("#gearLoaderWithQuickStat").fadeOut(200);
                    }

                }).catch(function () {
                    swal("Error!", "An unexpected error occurred.", "error");
                });
            }
        });
    };

    // ──────────────────────────────────────────────────────────────────────────

    s.btn_show_action = function (id_ss) {
        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        var url = "";
        var dtlg = s.datalistgrid.filter(function (i) {

            return i.empl_id == id_ss
        })[0]

        var history = "N"
        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }

        h.post("../cJOTaxRate/PreviousValuesonPage_cJOTaxRate",
            {

                par_year: $("#ddl_year option:selected").val()
                , par_empl_id: dtlg.empl_id
                , par_empl_name: dtlg.employee_name
                , par_department: $("#ddl_department option:selected").html()
                , par_show_entries: $("#ddl_show_entries option:selected").val()
                , par_page_nbr: info.page
                , par_search: s.search_box
                , par_sort_value: sort_value
                , par_sort_order: sort_order
                , par_position: dtlg.position_title1
                , par_effective_date: dtlg.effective_date
                , par_department_code: $("#ddl_department").val()
                , par_history: history
            }).then(function (d) {

                url = "/cJOTaxRateDetails";
                window.location.replace(url);
            })

    }

    s.btn_cnt_action = function (id_ss) {
        var table = $('#datalist_grid').DataTable();
        var info  = table.page.info();
        var history = (s.chckbx_history == true) ? "Y" : "N";

        h.post("../cJOTaxRate/PreviousValuesonPage_cJOTaxRate", {
              par_year           : s.ddl_year
            , par_empl_id: dtlg.empl_id
            , par_empl_name: dtlg.employee_name
            , par_department     : $("#ddl_department option:selected").html()
            , par_show_entries   : $("#ddl_show_entries option:selected").val()
            , par_page_nbr       : info.page
            , par_search         : s.search_box
            , par_sort_value     : sort_value
            , par_sort_order     : sort_order
            , par_position: dtlg.position_title1
            , par_effective_date: dtlg.effective_date
            , par_department_code: $("#ddl_department").val()
            , par_history        : history
        }).then(function () {
            return h.post("../cJOTaxRate/PreviousValuesonPage_cJOTaxNotInDetails", {
                par_empl_id: dtlg.empl_id,
                par_year   : s.ddl_year
            });
        }).then(function () {
            window.location.replace("/cJOTaxNotInDetails");
        });
    };

    s.txtb_empl_id_keyup = function () {
        var typedId = (s.txtb_empl_id || "").toString().trim();

        if (!typedId) {
            $("#txtb_empl_id").addClass("required");
            $("#lbl_ddl_employee_name_req").text("Required!");
            s.txtb_empl_name = "";
            s.txtb_position  = "";
            return;
        }

        var found = s.employeenames
            ? s.employeenames.filter(function (x) { return x.empl_id === typedId; })[0]
            : null;

        if (!found) {
            $("#txtb_empl_id").addClass("required");
            $("#lbl_ddl_employee_name_req").text("Employee not exist!");
            s.txtb_empl_name = "";
            s.txtb_position  = "";
        } else {
            $("#txtb_empl_id").removeClass("required");
            $("#lbl_ddl_employee_name_req").text("");
        }
    }

    s.btn_add_group = function (empl_id) {

        if (!empl_id || empl_id.toString().trim() === "") {
            $("#txtb_empl_id").addClass("required");
            $("#lbl_ddl_employee_name_req").text("Required!");
            return;
        }

        var data = s.employeenames.filter(function (x) {
            return x.empl_id === empl_id
        })[0];

        if (!data || data.length === 0) {
            $("#txtb_empl_id").addClass("required");
            $("#lbl_ddl_employee_name_req").text("Employee not exist!");
            return;
        }

        $("#txtb_empl_id").removeClass("required");
        $("#lbl_ddl_employee_name_req").text("");

        s.txtb_empl_id = data.empl_id
        s.txtb_position = data.position_title1
        s.txtb_empl_name = data.employee_name
        s.ddl_bir_class = data.bir_class
        s.txtb_gross_pay = currency(data.total_gross_pay)
        s.currentBIRClass = data.bir_class

        if ($("#ddl_bir_class") != "") {
            $("#ddl_bir_class").removeClass("required");
            $("#lbl_ddl_bir_class_req").text("");
        }

    }

    s.SelectEmployeeName = function (data) {
        s.txtb_empl_id = data.empl_id
        s.txtb_position = data.position_title1
        s.ddl_bir_class = data.bir_class
        s.txtb_gross_pay = currency(data.total_gross_pay)
        s.currentBIRClass = data.bir_class
        if (data.empl_id != "") {
            $("#ddl_employee_name").removeClass("required");
            $("#lbl_ddl_employee_name_req").text("");

            if ($("#ddl_bir_class") != "") {
                $("#ddl_bir_class").removeClass("required");
                $("#lbl_ddl_bir_class_req").text("");
            }
        }

    }

    s.SelectFixedRate = function (value) {

        if (value.toString().toUpperCase() == "TRUE") {
            s.isDisabledBIRClass = false
            s.isDisabledWHeld = false
            s.isDisabledBTax = false
            s.isDisabledVat = false
        }

        else if (value.toString().toUpperCase() == "FALSE") {


            var getTaxRate = ""

            if (s.txtb_empl_id != "" || s.txtb_empl_id == null) {


                h.post("../cJOTaxRate/GetTaxRate",
                    {

                        par_payroll_year: $("#ddl_year option:selected").val()
                        , par_empl_id: s.txtb_empl_id
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            getTaxRate = d.data.bir_class.toString()

                            $("#ddl_bir_class").val(getTaxRate.toString())


                            //DIRI ANG LAST PAGKUHA SA JOB ORDER TAX RATE
                            if (getTaxRate != "") {
                                $("#ddl_bir_class").val(getTaxRate.toString())

                            }

                            else {
                                $("#ddl_bir_class").val(s.currentBIRClass.toString())

                            }

                            var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")

                            if ($("#ddl_with_sworn").val().toString() != "") {
                                if (selected != null || selected != undefined || selected != "") {

                                    if ($("#ddl_with_sworn").val().toString().toUpperCase() == "TRUE") {
                                        s.ddl_w_held = selected.wi_sworn_perc.toString()
                                        $("#ddl_w_held").val(selected.wi_sworn_perc.toString())
                                        $("#ddl_b_tax").val(selected.tax_perc.toString())
                                        s.ddl_b_tax = selected.tax_perc.toString()
                                        $("#ddl_vat").val(selected.vat_perc.toString())
                                        s.ddl_vat = selected.vat_perc.toString()
                                    }

                                    else {

                                        //s.txtb_business_tax = selected.wo_sworn_perc.toString();
                                        //s.txtb_wheld_tax    = selected.tax_perc.toString();
                                        console.log(selected)

                                        $("#ddl_w_held").val(selected.wo_sworn_perc.toString())
                                        s.ddl_w_held = selected.wo_sworn_perc.toString()

                                        $("#ddl_b_tax").val(selected.tax_perc.toString())
                                        s.ddl_b_tax = selected.tax_perc.toString()
                                        $("#ddl_vat").val(selected.vat_perc.toString())
                                        s.ddl_vat = selected.vat_perc.toString()

                                    }

                                }

                                else {
                                    //s.txtb_business_tax = "0";
                                    //s.txtb_wheld_tax = "0";
                                    $("#ddl_w_held").val("0")
                                    s.ddl_w_held = "0"
                                    $("#ddl_b_tax").val("0")
                                    s.ddl_b_tax = "0"
                                    $("#ddl_vat").val("0")
                                    s.ddl_vat = "0"
                                }
                            }

                            else {
                                //s.txtb_business_tax = "0";
                                //s.txtb_wheld_tax = "0";
                                $("#ddl_w_held").val("0")
                                s.ddl_w_held = "0"
                                $("#ddl_b_tax").val("0")
                                s.ddl_b_tax = "0"
                                $("#ddl_vat").val("0")
                                s.ddl_vat = "0"
                            }

                        }



                    })

            }


            s.isDisabledBIRClass = true
            s.isDisabledWHeld = true
            s.isDisabledBTax = true
            s.isDisabledVat = true
        }

        else {
            if (value != "") {
                $("#ddl_bir_class").val(s.currentBIRClass.toString())
                //$("#ddl_fixed_rate").removeClass("required");
                //$("#lbl_ddl_fixed_rate_req").text("");
            }
            s.isDisabledBIRClass = true
            s.isDisabledBIRClass = true
            s.isDisabledWHeld = true
            s.isDisabledBTax = true
            s.isDisabledVat = true
        }

        if ($("#ddl_bir_class").val() == "") {
            s.isDisabledBIRClass = false
            s.isDisabledBIRClass = false
            s.isDisabledWHeld = false
            s.isDisabledBTax = false
            s.isDisabledVat = false
        }

        if (value != "") {

            $("#ddl_fixed_rate").removeClass("required");
            $("#lbl_ddl_fixed_rate_req").text("");
        }

    }


    Array.prototype.select = function (code, prop) {
        var value = this.filter(function (d) {
            return d[prop] == code
        })[0]

        if (value == null || value == undefined) {
            value = ""
        }

        return value

    }


    s.SelectWithSworn = function (value) {
        try {

            var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")


            if (value.toString() != "") {
                if (selected != null || selected != undefined) {
                    if (value.toString().toUpperCase() == "TRUE") {
                        //s.txtb_business_tax    = selected.wi_sworn_perc.toString();
                        //s.txtb_wheld_tax       = selected.tax_perc.toString();
                        $("#ddl_w_held").val(selected.wi_sworn_perc.toString())
                        s.ddl_w_held = selected.wi_sworn_perc.toString()
                        $("#ddl_b_tax").val(selected.tax_perc.toString())
                        s.ddl_b_tax = selected.tax_perc.toString()
                        $("#ddl_vat").val(selected.vat_perc.toString())
                        s.ddl_vat = selected.vat_perc.toString()
                    }

                    else {
                        //s.txtb_business_tax     = selected.wo_sworn_perc.toString();
                        //s.txtb_wheld_tax        = selected.tax_perc.toString();
                        $("#ddl_w_held").val(selected.wo_sworn_perc.toString())
                        s.ddl_w_held = selected.wo_sworn_perc.toString()
                        $("#ddl_b_tax").val(selected.tax_perc.toString())
                        s.ddl_b_tax = selected.tax_perc.toString()
                        $("#ddl_vat").val(selected.vat_perc.toString())
                        s.ddl_vat = selected.vat_perc.toString()
                    }

                }

                else {
                    //s.txtb_business_tax = "0";
                    //s.txtb_wheld_tax    = "0";
                    $("#ddl_w_held").val("0")
                    s.ddl_w_held = "0"
                    $("#ddl_b_tax").val("0")
                    s.ddl_b_tax = "0"
                    $("#ddl_vat").val("0")
                    s.ddl_vat = "0"
                }
            }

            else {
                //s.txtb_business_tax = "0";
                //s.txtb_wheld_tax    = "0";
                $("#ddl_w_held").val("0")
                s.ddl_w_held = "0"
                $("#ddl_b_tax").val("0")
                s.ddl_b_tax = "0"
                $("#ddl_vat").val("0")
                s.ddl_vat = "0"
            }

            if (value != "") {

                $("#ddl_with_sworn").removeClass("required");
                $("#lbl_ddl_with_sworn_req").text("");
            }
        }

        catch (e) {
            if (value != "") {

                $("#ddl_with_sworn").removeClass("required");
                $("#lbl_ddl_with_sworn_req").text("");
            }
        }


    }

    s.SelectBirClass = function (value) {
        var selected = s.bir_class_data.select($("#ddl_bir_class").val(), "bir_class")

        if ($("#ddl_with_sworn").val().toString() != "") {
            if (selected != null || selected != undefined) {
                if ($("#ddl_with_sworn").val().toString().toUpperCase() == "TRUE") {
                    //s.txtb_business_tax = selected.wi_sworn_perc.toString();
                    //s.txtb_wheld_tax = selected.tax_perc.toString();
                    $("#ddl_w_held").val(selected.wi_sworn_perc.toString())
                    s.ddl_w_held = selected.wi_sworn_perc.toString()
                    $("#ddl_b_tax").val(selected.tax_perc.toString())
                    s.ddl_b_tax = selected.tax_perc.toString()
                    $("#ddl_vat").val(selected.vat_perc.toString())
                    s.ddl_vat = selected.vat_perc.toString()
                }

                else {
                    //s.txtb_business_tax = selected.wo_sworn_perc.toString();
                    //s.txtb_wheld_tax = selected.tax_perc.toString();
                    $("#ddl_w_held").val(selected.wo_sworn_perc.toString())
                    s.ddl_w_held = selected.wo_sworn_perc.toString()
                    $("#ddl_b_tax").val(selected.tax_perc.toString())
                    s.ddl_b_tax = selected.tax_perc.toString()
                    $("#ddl_vat").val(selected.vat_perc.toString())
                    s.ddl_vat = selected.vat_perc.toString()
                }

            }

            else {
                //s.txtb_business_tax = "0";
                //s.txtb_wheld_tax = "0";
                $("#ddl_w_held").val("0")
                s.ddl_w_held = "0"
                $("#ddl_b_tax").val("0")
                s.ddl_b_tax = "0"
                $("#ddl_vat").val("0")
                s.ddl_vat = "0"
            }
        }

        else {
            //s.txtb_business_tax = "0";
            //s.txtb_wheld_tax = "0";
            $("#ddl_w_held").val("0")
            s.ddl_w_held = "0"
            $("#ddl_b_tax").val("0")
            s.ddl_b_tax = "0"
            $("#ddl_vat").val("0")
            s.ddl_vat = "0"
        }
        //alert(value)
        if (value != "") {
            $("#ddl_bir_class").removeClass("required");
            $("#lbl_ddl_bir_class_req").text("");
        }

    }


    function getFromValue() {

        var employeename = $("#ddl_employee_name option:selected")
            .text()
            .split(" - ")
            .slice(1)
            .join(" - ");

        var data =
        {

            empl_id: s.txtb_empl_id
            , employee_name: employeename
            , employment_type: "JO"
            , position_title1: s.txtb_position
            , effective_date: s.isAction == "ADD" ? $("#txtb_effective_date").val() : $("#txtb_effective_date_hid").val()
            , bir_class: $("#ddl_bir_class").val()
            , bir_class_descr: $("#ddl_bir_class option:selected").html()
            , with_sworn: $("#ddl_with_sworn").val()
            , fixed_rate: $("#ddl_fixed_rate").val()
            , with_sworn_descr: $("#ddl_with_sworn option:selected").html()
            , fixed_rate_descr: $("#ddl_fixed_rate option:selected").html()
            , wi_sworn_perc: $("#ddl_b_tax").val()
            , wo_sworn_perc: $("#ddl_b_tax").val()
            , tax_perc: $("#ddl_w_held").val()
            , total_gross_pay: toDecimalFormat(s.txtb_gross_pay)
            , dedct_status: $("#ddl_deduction_status").val()
            , rcrd_status: $("#ddl_status").val()
            , rcrd_status_descr: $("#ddl_status option:selected").html()
            , w_tax_perc: $("#ddl_w_held").val()
            , bus_tax_perc: $("#ddl_b_tax").val()
            , vat_perc: $("#ddl_vat").val()
            , exmpt_amt: toDecimalFormat($("#txtb_expt_amt").val())
        }

        return data
    }

    function toDecimalFormat(data) {
        var value = 0.00
        if (data == "" || data == undefined) {
            return value
        }


        var val = parseFloat(data.replace(/,/g, ''))

        if (isNaN(val)) {
            return value;
        }
        else {
            return val;
        }
    }


    function updateListGrid() {

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        var record = s.datalistgrid.filter(function (r) { return r.empl_id == index_update; })[0];
        if (!record) return;

        record.bir_class       = $("#ddl_bir_class").val();
        record.bir_class_descr = $("#ddl_bir_class option:selected").html();
        record.with_sworn      = $("#ddl_with_sworn").val();
        record.fixed_rate      = $("#ddl_fixed_rate").val();
        record.with_sworn_descr = $("#ddl_with_sworn option:selected").html();
        record.fixed_rate_descr = $("#ddl_fixed_rate option:selected").html();
        record.wi_sworn_perc   = $("#ddl_b_tax").val();
        record.wo_sworn_perc   = $("#ddl_b_tax").val();
        record.tax_perc        = $("#ddl_w_held").val();
        record.rcrd_status     = $("#ddl_status").val();
        record.rcrd_status_descr = $("#ddl_status option:selected").html();
        record.dedct_status    = $("#ddl_deduction_status").val();
        record.w_tax_perc      = $("#ddl_w_held").val();
        record.bus_tax_perc    = $("#ddl_b_tax").val();
        record.vat_perc        = $("#ddl_vat").val();
        record.exmpt_amt       = toDecimalFormat($("#txtb_expt_amt").val());

        s._datalistgrid_master = s.datalistgrid;

        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
        page_value = info.page;

        s.oTable.fnSort([[sort_value, sort_order]]);

        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
            if (get_page(record.empl_id) == false) {
                s.oTable.fnPageChange(x);
            }
            else {
                break;
            }
        }
    }


    s.btn_save = function () {

        $("#btn_save_tx_edit").prop("disabled", true);
        $("#btn_save").removeClass("fa fa-save");
        $("#btn_save").addClass("fa fa-spinner fa-spin");
        $("#modal_saving_overlay").css("display", "flex");

        if (isdataValidated()) {

            var dt = getFromValue()

            var payroll_year = $("#ddl_year").val()
            var department_code = $("#ddl_department").val()

            var history = "N"
            var effective_date = ""

            if (s.chckbx_history == true) {
                var history = "Y"
            }

            else {
                var history = "N"
            }

            if (s.isAction == "ADD") {
                effective_date = $("#txtb_effective_date").val()
            }

            else if (s.isAction == "EDIT") {
                effective_date = $("#txtb_effective_date_hid").val()
            }

            h.post("../cJOTaxRate/SaveEDITInDatabase",
                {
                      data: dt
                    , par_effective_date: effective_date
                    , par_empl_id: s.txtb_empl_id
                    , par_action: s.isAction
                    , par_payroll_year: payroll_year
                    , par_department_code: department_code
                }).then(function (d) {
                    if (d.data.message == "success") {


                        if (s.isAction == "ADD") {
                            dt.total_gross_pay = d.data.gp.total_gross_pay;
                            var addedEmplId = s.txtb_empl_id;
                            _refreshGridAndHighlight(addedEmplId, 'success', 'Record Added!', 'New record saved successfully', 'The new tax rate record has been added.');
                        }

                        else if (s.isAction == "EDIT") {
                            var editedEmplId = s.txtb_empl_id;
                            _refreshGridAndHighlight(editedEmplId, 'success', 'Record Updated!', 'Changes saved successfully', 'The tax rate record has been updated.');
                        }
                        s.loadQueueCounts();
                    }

                    else {
                        $("#btn_save").removeClass("fa fa-spinner fa-spin");
                        $("#btn_save").addClass("fa fa-save");
                        $("#btn_save_tx_edit").prop("disabled", false);
                        $("#modal_saving_overlay").hide();
                        $("#main_modal").modal("hide");
                        showSaveNotif('error', 'Save Failed', 'Something went wrong', 'The record could not be saved. Please check the data and try again.');
                    }



                })

            //h.post("../cJOTaxRate/CheckData",
            //    {
            //          par_payroll_year: $("#ddl_year option:selected").val()
            //        , par_department_code: $("#ddl_department option:selected").val()
            //        , par_history: history
            //        , par_action: s.isAction
            //        , par_empl_id: s.txtb_empl_id
            //        , par_effective_date: effective_date
            //    }).then(function (d) {

            //        if (d.data.message == "success") {

            //            h.post("../cJOTaxRate/SaveEDITInDatabase",
            //                {
            //                      data: dt
            //                    , par_effective_date: effective_date
            //                    , par_empl_id: s.txtb_empl_id
            //                    , par_action: s.isAction
            //                    , par_payroll_year: payroll_year
            //                    , par_department_code: department_code
            //                }).then(function (d) {
            //                    if (d.data.message == "success") {


            //                        if (s.isAction == "ADD") {


            //                            dt.total_gross_pay = d.data.gp.total_gross_pay
            //                            $("#main_modal").modal("hide")
            //                            s.datalistgrid.push(dt)
            //                            s.oTable.fnClearTable();
            //                            s.oTable.fnAddData(s.datalistgrid)

            //                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
            //                                if (get_page(s.txtb_empl_id) == false) {
            //                                    s.oTable.fnPageChange(x);
            //                                }
            //                                else {
            //                                    break;
            //                                }
            //                            }

            //                            var history = "N"

            //                            if (s.chckbx_history == true) {
            //                                var history = "Y"
            //                            }

            //                            else {
            //                                var history = "N"
            //                            }
            //                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            //                            $("#btn_save").addClass("fa fa-save");
            //                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            //                            $("#btn_save").addClass("fa fa-save");
            //                            $("#main_modal").modal("hide")


            //                            //h.post("../cJOTaxRate/GenerateByEmployee", {
            //                            //    par_empl_id             : s.txtb_empl_id
            //                            //    ,par_payroll_year       : $("#ddl_year").val()
            //                            //    ,par_department_code    : $("#ddl_department").val()
            //                            //    ,par_history            : history
            //                            //}).then(function (d) {

            //                            //    if (d.data.message == "success")
            //                            //    {

            //                            //        toastr.success("New record has been successfully added!", "Successfully Added!");

            //                            //    }

            //                            //})


            //                        }

            //                        else if (s.isAction == "EDIT") {
            //                            $("#main_modal").modal("hide")
            //                            updateListGrid()

            //                            swal("Successfully Updated!", "Existing record successfully Updated!", "success")
            //                            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            //                            $("#btn_save").addClass("fa fa-save");
            //                        }
            //                        s.loadQueueCounts();
            //                    }

            //                    else {
            //                        swal("Saving Error!", "Data not save.", "error");
            //                        $("#main_modal").modal("hide")
            //                        $("#btn_save").removeClass("fa fa-spinner fa-spin");
            //                        $("#btn_save").addClass("fa fa-save");
            //                    }



            //                })

            //        }

            //        else {

            //            swal(d.data.message, { icon: "warning", });
            //            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            //            $("#btn_save").addClass("fa fa-save");

            //            //if (d.data.sp_annualtax_hdr_tbl_list != null) {
            //            //    s.datalistgrid.push(d.data.sp_annualtax_hdr_tbl_list)
            //            //    s.oTable.fnClearTable();
            //            //    s.oTable.fnAddData(s.datalistgrid)

            //            //}

            //            //else {
            //            //    s.oTable.fnClearTable();
            //            //    s.oTable.fnAddData(s.datalistgrid)
            //            //}

            //            $("#main_modal").modal("hide")


            //        }

            //    })

        }

        else {
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
            $("#btn_save_tx_edit").prop("disabled", false);
            $("#modal_saving_overlay").hide();
        }

    }

    s.btn_edit_action = function (id_ss) {

        var dtlg = s.datalistgrid.filter(function (i) {

            return i.empl_id == id_ss
        })[0]


        s.isShowNameSelect = false;
        s.isShowNameInput = true;
        setTimeout(function () {
            toggleEmployeeSelect2UI(false);
        }, 0);
        s.isShowEffectiveDate_hid = true
        s.isShowEffectiveDate = false

        $("#ddl_status").val("N")
        s.ishowsave = true;
        index_update = id_ss
        clearentry()
        s.isAction = "EDIT"
        s.ModalTitle = "Edit This Record"



        var history = "N"

        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }
        console.log(dtlg.effective_date)
        h.post("../cJOTaxRate/CheckData", {
              par_payroll_year: $("#ddl_year option:selected").val()
            , par_department_code: $("#ddl_department option:selected").val()
            , par_history: history
            , par_action: s.isAction
            , par_empl_id: dtlg.empl_id
            , par_effective_date: dtlg.effective_date
        }).then(function (d) {

            if (d.data.message == "success") {

                $("#main_modal").modal("show")
                s.txtb_employment_type_val = dtlg.employment_type
                s.txtb_empl_name = dtlg.employee_name
                s.txtb_empl_id = dtlg.empl_id
                s.txtb_position = dtlg.position_title1

                console.log(dtlg)
                var var_fixed_rate = dtlg.fixed_rate == 0 ? "false" : "true"
                var var_with_sworn = dtlg.with_sworn == 0 ? "false" : "true"
                var var_dedct_status = dtlg.dedct_status == 0 ? "false" : "true"

                $("#txtb_effective_date_hid").val(dtlg.effective_date)
                $("#ddl_bir_class").val(dtlg.bir_class)
                $("#ddl_fixed_rate").val(var_fixed_rate)
                $("#ddl_with_sworn").val(var_with_sworn)
                $("#ddl_deduction_status").val(var_dedct_status)
                $("#ddl_status").val(dtlg.rcrd_status.toString())

                $("#ddl_w_held").val(dtlg.w_tax_perc.toString())
                $("#ddl_b_tax").val(dtlg.bus_tax_perc.toString())
                $("#ddl_vat").val(dtlg.vat_perc.toString())
                s.txtb_expt_amt = currency(toDecimalFormat(dtlg.exmpt_amt.toString()))
                s.currentBIRClass = dtlg.bir_class

                if (var_fixed_rate.toUpperCase() == "TRUE" || $("#ddl_fixed_rate").val().toUpperCase() == "1") {
                    s.isDisabledBIRClass = false;
                }
                else {
                    s.isDisabledBIRClass = true;
                }

                s.txtb_gross_pay = currency(dtlg.total_gross_pay)

            }

            else {
                swal("Unable to Update, Data has been deleted by other user/s!", { icon: "warning", });
                var tname = "oTable";

                var id = s[tname][0].id;
                ////var page = $("#" + id).DataTable().page.info().page

                s[tname].fnDeleteRow(index_update, null, true);
                s.datalistgrid = DataTable_data(tname)


                if (d.data.sp_payrollemployee_tax_hdr_tbl_list != null) {
                    s.datalistgrid.push(d.data.sp_payrollemployee_tax_hdr_tbl_list)
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }

                $("#main_modal").modal("hide")


            }
        })

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


    Array.prototype.refreshTable = function (table, id) {

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
                    s.oTable.fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }


    }

    String.prototype.get_page = function (table) {
        id = this;
        var nakit_an = false;
        var rowx = 0;
        var el_id = s[table][0].id
        $("#" + el_id + " tr").each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == id) {
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

    //This function is called to extract the DataTable rows data
    function DataTable_data(tname) {
        var data = []
        var id = s[tname][0].id;
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x) {
            data.push(dtrw[x])
        }
        return data
    }

    //delete row in dataTable
    //s.btn_delete_action = function (id_ss) {
    //    s.isAction = "DELETE"
    //    var tname = "oTable"
    //    swal({
    //        title: "Are you sure to delete this record?",
    //        text: "Once deleted, you will not be able to recover this record!",
    //        icon: "warning",
    //        buttons: true,
    //        dangerMode: true,
    //    }).then(function (willDelete) {
    //        if (willDelete) {

    //                    h.post("../cJOTaxRate/DeleteFromDatabase", {
    //                        par_empl_id     : s.datalistgrid[id_ss].empl_id
    //                        ,effective_date : s.datalistgrid[id_ss].effective_date
    //                    }).then(function (d) {

    //                        if (d.data.icon = "success") {
    //                            var id = s[tname][0].id;
    //                            var page = $("#" + id).DataTable().page.info().page
    //                            s[tname].fnDeleteRow(id_ss, null, true);
    //                            s.datalistgrid = DataTable_data(tname)

    //                            s.oTable.fnClearTable();
    //                            s.oTable.fnAddData(s.datalistgrid)
    //                            //s.oTable.refreshTable("oTable", "")
    //                            changePage(tname, page, id)

    //                            swal("Your record has been deleted successfully!", { icon: "success", });
    //                        }

    //                        else
    //                        {
    //                            swal("Unable to Delete, Data has been deleted by other user/s!", { icon: "warning", });


    //                            var id = s[tname][0].id;
    //                            ////var page = $("#" + id).DataTable().page.info().page

    //                            s[tname].fnDeleteRow(id_ss, null, true);
    //                            s.datalistgrid = DataTable_data(tname)


    //                            if (d.data.sp_annualtax_hdr_tbl_list != null) {
    //                                s.oTable.fnClearTable();
    //                                s.oTable.fnAddData(s.datalistgrid)

    //                            }

    //                            else {
    //                                s.oTable.fnClearTable();
    //                                s.oTable.fnAddData(s.datalistgrid)
    //                            }

    //                            $("#main_modal").modal("hide")
    //                        }


    //                    })
    //                }



    //        })
    //}


    s.btn_delete_action = function (id_ss) {
        s.isAction = "DELETE";
        var tname = "oTable";

        var dtlg = s.datalistgrid.filter(function (i) { 
            return i.empl_id == id_ss
        })[0]

        swal({
            title: "Delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: {
                cancel: {
                    text: "Cancel",
                    visible: true,
                    closeModal: true
                },
                confirm: {
                    text: "Yes, delete",
                    value: true,
                    closeModal: false // keep swal open, we will show loading
                }
            },
            dangerMode: true
        }).then(function (willDelete) {
            if (!willDelete) return;

            // ✅ Loading state (pro)
            swal({
                title: "Deleting…",
                text: "Please wait while we remove the record.",
                buttons: false,
                closeOnClickOutside: false,
                closeOnEsc: false
            });

            var row = dtlg;

            if (!row) {
                swal("Error", "Row not found. Please refresh the page.", "error");
                return;
            }

            h.post("../cJOTaxRate/DeleteFromDatabase", {
                par_empl_id: row.empl_id,
                effective_date: row.effective_date
            }).then(function (d) {

                // ✅ FIX: use comparison, not assignment
                if (d.data && d.data.icon === "success") {

                    // keep current page before rebind
                    var id = s[tname][0].id;
                    var page = $("#" + id).DataTable().page.info().page;

                    // remove row and rebuild datalistgrid
                    s[tname].fnDeleteRow(id_ss, null, true);
                    s.datalistgrid = DataTable_data(tname);

                    // rebind (your existing pattern)
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    // restore page
                    changePage(tname, page, id);

                    swal({
                        title: "Deleted!",
                        text: "Your record has been deleted successfully.",
                        icon: "success",
                        timer: 1500,
                        buttons: false
                    });

                    // ✅ Optional: update badges immediately
                    if (typeof s.refreshQueueCounts === "function") {
                        s.refreshQueueCounts();
                    }
                }
                else {

                    // server returned warning/error message
                    var msg = (d.data && d.data.message) ? d.data.message
                        : "Unable to delete. It may have already been deleted by another user.";

                    // remove row locally if it’s already gone (your original behavior)
                    var id = s[tname][0].id;
                    var page = $("#" + id).DataTable().page.info().page;

                    s[tname].fnDeleteRow(id_ss, null, true);
                    s.datalistgrid = DataTable_data(tname);

                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    changePage(tname, page, id);

                    swal({
                        title: "Delete not completed",
                        text: msg,
                        icon: "warning"
                    });

                    $("#main_modal").modal("hide");
                }
            }).catch(function (err) {

                // ✅ always close loading and show a clean error
                var msg = "Server error occurred while deleting. Please try again.";

                // if your backend returns { message = "...", icon="error" }
                if (err && err.data) {
                    if (typeof err.data === "object" && err.data.message) msg = err.data.message;
                }

                swal({
                    title: "Error",
                    text: msg,
                    icon: "error"
                });
            });
        });
    };






    s.chckbx_history_Change = function (chckbx_history) {
        s.chckbx_history = chckbx_history

        var history = "N"
        if (s.chckbx_history == true) {
            var history = "Y"
        }

        else {
            var history = "N"
        }


        if ($("#ddl_year").val() != "" && $("#ddl_department").val() != "") {
            h.post("../cJOTaxRate/RetrieveDataListGrid",
                {
                    pay_payroll_year: $("#ddl_year").val(),
                    par_department_code: $("#ddl_department").val(),
                    par_history: history

                }).then(function (d) {
                    if (d.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {

                        s.datalistgrid = d.data.sp_payrollemployee_tax_hdr_tbl_list;
                        s._datalistgrid_master = s.datalistgrid;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                    }
                    else {
                        s.oTable.fnClearTable();
                    }

                    $("#gearLoader").fadeOut(200)

                })
        }

        else {
            s.oTable.fnClearTable();
        }

    }

    var _notifTimer = null;
    var showSaveNotif = function (type, title, subtitle, message) {
        var isSuccess = type === 'success';
        var bg = isSuccess
            ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
            : 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)';
        var icon = isSuccess ? 'fa fa-check' : 'fa fa-times';
        var progressColor = isSuccess ? '#27ae60' : '#c0392b';
        var btnColor = isSuccess ? '#27ae60' : '#c0392b';
        var duration = isSuccess ? 3000 : 0;

        document.getElementById('save_notif_header').style.background = bg;
        document.getElementById('save_notif_icon_wrap').style.background = 'rgba(255,255,255,0.25)';
        document.getElementById('save_notif_icon').className = icon;
        document.getElementById('save_notif_title').textContent = title;
        document.getElementById('save_notif_subtitle').textContent = subtitle || '';
        document.getElementById('save_notif_msg').textContent = message || '';
        document.getElementById('save_notif_progress').style.background = progressColor;
        document.getElementById('save_notif_progress').style.transition = 'none';
        document.getElementById('save_notif_progress').style.width = '100%';
        document.getElementById('save_notif_btn').style.background = btnColor;
        document.getElementById('save_notif_btn').style.color = '#fff';

        var overlay = document.getElementById('save_notif_overlay');
        overlay.style.display = 'flex';

        if (_notifTimer) clearTimeout(_notifTimer);

        if (duration > 0) {
            setTimeout(function () {
                document.getElementById('save_notif_progress').style.transition = 'width ' + duration + 'ms linear';
                document.getElementById('save_notif_progress').style.width = '0%';
            }, 50);
            _notifTimer = setTimeout(function () { hideSaveNotif(); }, duration);
        } else {
            document.getElementById('save_notif_progress_wrap').style.display = 'none';
        }
    };

    window.hideSaveNotif = function () {
        document.getElementById('save_notif_overlay').style.display = 'none';
        document.getElementById('save_notif_progress_wrap').style.display = '';
        if (_notifTimer) { clearTimeout(_notifTimer); _notifTimer = null; }
    };

    var _navigateAndHighlight = function (emplId) {
        var nodes = s.oTable.fnGetNodes();
        var targetNode = null;
        var displayIndex = -1;

        for (var i = 0; i < nodes.length; i++) {
            var rowData = s.oTable.fnGetData(nodes[i]);
            if (rowData && String(rowData.empl_id) === String(emplId)) {
                targetNode = nodes[i];
                displayIndex = i;
                break;
            }
        }

        if (!targetNode) { s.oTable.fnPageChange(0); return; }

        var pageLen = $('#datalist_grid').DataTable().page.len();
        s.oTable.fnPageChange(Math.floor(displayIndex / pageLen));

        $(targetNode).stop(true).css({ 'background-color': '#d4f1c0', transition: 'none' });
        setTimeout(function () {
            $(targetNode).css({ transition: 'background-color 1.8s ease', 'background-color': '' });
        }, 1800);
    };

    var _refreshGridAndHighlight = function (emplId, notifType, notifTitle, notifSub, notifMsg) {
        var history = s.chckbx_history ? "Y" : "N";
        h.post("../cJOTaxRate/RetrieveDataListGrid", {
            pay_payroll_year: $("#ddl_year").val(),
            par_department_code: $("#ddl_department").val(),
            par_history: history
        }).then(function (rd) {
            if (rd.data.sp_payrollemployee_tax_hdr_tbl_list && rd.data.sp_payrollemployee_tax_hdr_tbl_list.length > 0) {
                s.datalistgrid = rd.data.sp_payrollemployee_tax_hdr_tbl_list;
                s._datalistgrid_master = s.datalistgrid;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid);
                s.oTable.fnSort([[sort_value, sort_order]]);
                _navigateAndHighlight(emplId);
            }
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
            $("#btn_save_tx_edit").prop("disabled", false);
            $("#modal_saving_overlay").hide();
            $("#main_modal").modal("hide");
            showSaveNotif(notifType, notifTitle, notifSub, notifMsg);
        });
    };

    var _applyFilters = function () {
        var filtered = s._datalistgrid_master || s.datalistgrid || [];

        if (s.chckbx_unapproved_tax_rate) {
            filtered = filtered.filter(function (row) { return row.rcrd_status === 'N'; });
        }
        if (s.chckbx_fixed_rate) {
            filtered = filtered.filter(function (row) { return row.fixed_rate == true || row.fixed_rate == 1 || row.fixed_rate === 'true'; });
        }
        if (s.chckbx_vat_val) {
            filtered = filtered.filter(function (row) { return row.vat !== null && row.vat !== undefined && row.vat !== '' && row.vat != 0; });
        }
        if (s.chckbx_with_sworn) {
            filtered = filtered.filter(function (row) { return row.with_sworn == true || row.with_sworn == 1 || row.with_sworn === 'true'; });
        } else if (s.chckbx_without_sworn) {
            filtered = filtered.filter(function (row) { return !(row.with_sworn == true || row.with_sworn == 1 || row.with_sworn === 'true'); });
        }

        s.oTable.fnClearTable();
        if (filtered.length > 0) s.oTable.fnAddData(filtered);
    };

    s.chckbx_unapproved_tax_rate_Change = function (checked) {
        s.chckbx_unapproved_tax_rate = checked;
        _applyFilters();
    }

    s.chckbx_vat_val_Change = function (checked) {
        s.chckbx_vat_val = checked;
        _applyFilters();
    }

    s.chckbx_fixed_rate_Change = function (checked) {
        s.chckbx_fixed_rate = checked;
        _applyFilters();
    }

    s.chckbx_with_sworn_Change = function (checked) {
        s.chckbx_with_sworn = checked;
        if (checked) s.chckbx_without_sworn = false;
        _applyFilters();
    }

    s.chckbx_without_sworn_Change = function (checked) {
        s.chckbx_without_sworn = checked;
        if (checked) s.chckbx_with_sworn = false;
        _applyFilters();
    }

    s.btn_add_action = function () {
        clearentry()

        s.isShowNameSelect = true;
        s.isShowNameInput = false;
        setTimeout(function () {
            toggleEmployeeSelect2UI(true);
        }, 0);
        s.ishowsave = true;
        $("#ddl_status").val("N")
        s.isShowEffectiveDate_hid = false
        s.isShowEffectiveDate = true

        s.ModalTitle = "Add New Record"
        //$("#gearLoader").fadeIn(200)
        $("#btn_add").removeClass("fa fa-plus-circle");
        $("#btn_add").addClass("fa fa-spinner fa-spin");

        s.isAction = "ADD"


        h.post("../RetrieveReadOnlyData/RetrieveEmployeeList",
            {
                par_payroll_year: $("#ddl_year option:selected").val(),
                par_department_code: $("#ddl_department option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    if (d.data.sp_personnelnames_combolist_tax_jo.length > 0) {

                        s.employeenames = separateEffctiveDate(d.data.sp_personnelnames_combolist_tax_jo)
                    }

                    else {
                        s.employeenames = null;
                    }
                    //$("#gearLoader").fadeOut(200)
                    $("#main_modal").modal("show")
                    $("#btn_add").removeClass("fa fa-spinner fa-spin");
                    $("#btn_add").addClass("fa fa-plus-circle");

                    //DIRI ANG LAST WALA KA ADD SA DATEPICKER SA MODAL

                }
                else {
                    $("#btn_add").removeClass("fa fa-spinner fa-spin");
                    $("#btn_add").addClass("fa fa-plus-circle");
                }

            })

    }


    function separateEffctiveDate(data) {
        const personnel = data;
        const updatedData = personnel.map(item => {

            const [namePart, datePart] = item.employee_name.split(':');

            return {
                ...item,
                employee_name: namePart.trim(),
                effective_date: (datePart || '').trim()
            };
        });
        return updatedData;
    }

    function forceSingleSelect2ByNgxIndex(selectId, ngxIndex) {
        var $sel = $("#" + selectId);

        // find the target option by ngx-data
        var $target = $sel.find("option[ngx-data='" + ngxIndex + "']");
        if (!$target.length) return;

        var val = $target.val();
        var text = $target.text();

        // Guard ON so our .trigger("change") won't re-run your handler
        s._syncingEmployeeSelect2 = true;

        // ✅ The important part: set value (Select2 listens to this)
        $sel.val(val);

        // (Optional) also clean selected attrs if you really want
        $sel.find("option").prop("selected", false).removeAttr("selected");
        $target.prop("selected", true).attr("selected", "selected");

        // ✅ refresh Select2 UI
        if ($sel.hasClass("select2-hidden-accessible")) {
            $sel.trigger("change");          // this updates the rendered <span>
        } else {
            $sel.trigger("change");
        }

        // Guard OFF after Select2 finishes updating
        setTimeout(function () {
            s._syncingEmployeeSelect2 = false;

            // Extra safety: if UI still shows old text, force it (rare)
            var s2 = $sel.data("select2");
            if (s2 && s2.$selection) {
                s2.$selection.find(".select2-selection__rendered")
                    .text(text)
                    .attr("title", text);
            }
        }, 0);
    }


    s.selectEmployee = function () {

        var $sel = $("#ddl_employee_name");
        var ngxIndex = $sel.find("option:selected").attr("ngx-data");
        forceSingleSelect2ByNgxIndex("ddl_employee_name", ngxIndex);

        var id = $sel.val();
        if (!id) return;
        empl = s.employeenames.filter(function (d) {
            return d.empl_id == id
        })

        if (!empl || empl.length === 0) return;

        $("#txtb_empl_id").val(empl[0].empl_id)
        s.txtb_empl_id = empl[0].empl_id
        $("#txtb_position").val(empl[0].position_title1)
        s.txtb_position = empl[0].position_title1

        var effDate = new Date(empl[0].effective_date);
        var currentYear = $("#ddl_year").val();

        if (effDate.getFullYear() < currentYear) {
            effDate = new Date(currentYear, 0, 1); // Jan 1 of current year
        }

        // format as yyyy-mm-dd for input[type=date]
        var yyyy = effDate.getFullYear();
        var mm = String(effDate.getMonth() + 1).padStart(2, '0');
        var dd = String(effDate.getDate()).padStart(2, '0');

        var formattedDate = yyyy + '-' + mm + '-' + dd;

        // set both jQuery and Angular model
        $("#txtb_effective_date").val(formattedDate);
        s.txtb_effective_date = formattedDate;

    }

    function toggleEmployeeSelect2UI(show) {
        var $sel = $("#ddl_employee_name");

        // get the actual select2 container (reliable)
        var s2 = $sel.data("select2");
        var $container = s2 ? s2.$container : $sel.next(".select2-container");

        if (show) {
            $sel.prop("disabled", false);
            $sel.removeClass("ng-hide");     // just in case
            if ($container && $container.length) $container.show();
        } else {
            $sel.prop("disabled", true);
            if ($container && $container.length) $container.hide();
        }
    }



    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == empl_id) {
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

        if ($("#ddl_employee_name").val() == "" && s.isAction == "ADD") {
            FieldValidationColorChanged(true, "ddl_employee_name")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");

        }

        if ($("#txtb_effective_date").val() == "" && s.isAction == "ADD") {
            FieldValidationColorChanged(true, "txtb_effective_date")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_bir_class").val() == "") {
            FieldValidationColorChanged(true, "ddl_bir_class")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_fixed_rate").val() == "") {
            FieldValidationColorChanged(true, "ddl_fixed_rate")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_with_sworn").val() == "") {
            FieldValidationColorChanged(true, "ddl_with_sworn")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#ddl_deduction_status").val() == "") {

            FieldValidationColorChanged(true, "ddl_deduction_status")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }
        //alert($("#ddl_status").val())
        //if ($("#ddl_status").val() == "") {
        //    alert("AWW7")
        //    FieldValidationColorChanged(true, "ddl_status")
        //    validatedSaved = false;
        //    $("#btn_save").removeClass("fa fa-spinner fa-spin");
        //    $("#btn_save").addClass("fa fa-save");
        //}

        if (isNaN(validatenumber($("#txtb_expt_amt").val()))) {

            FieldValidationColorChanged(true, "txtb_expt_amt")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        return validatedSaved;

    }

    function validatenumber(value) {
        var value = value.split(",").join("")
        return value
    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(par_v_result, par_object_id) {

        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            if (par_object_id == "txtb_expt_amt") {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Numeric Values Only!");
            }

            else {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

        }


        else {
            //remove of refresh the object form being required

            $("#ddl_employee_name").removeClass("required");
            $("#lbl_ddl_employee_name_req").text("");

            $("#txtb_effective_date").removeClass("required");
            $("#lbl_txtb_effective_date_req").text("");

            $("#ddl_bir_class").removeClass("required");
            $("#lbl_ddl_bir_class_req").text("");

            $("#ddl_fixed_rate").removeClass("required");
            $("#lbl_ddl_fixed_rate_req").text("");

            $("#ddl_with_sworn").removeClass("required");
            $("#lbl_ddl_with_sworn_req").text("");

            $("#ddl_deduction_status").removeClass("required");
            $("#lbl_ddl_deduction_status_req").text("");

            $("#ddl_status").removeClass("required");
            $("#lbl_ddl_status_req").text("");

            $("#txtb_expt_amt").removeClass("required");
            $("#lbl_txtb_expt_amt_req").text("");
        }
    }




    //***********************************//
    //***VAT Employee Setup            **//
    //***********************************//
    var vat_original_vat_value    = "";
    var vat_original_status       = "";
    var vat_original_effective_date = "";
    var vat_isEdit                = false;

    s.btn_vat_action = function (id_ss) {
        var dtlg = s.datalistgrid.filter(function (i) {
            return i.empl_id == id_ss
        })[0]

        var empl_id   = dtlg.empl_id;
        var empl_name = dtlg.employee_name;

        s.vat_empl_id       = empl_id;
        s.vat_empl_name     = empl_name;
        s.vat_effective_date = "";
        s.vat_value          = "";
        s.vat_status         = "";
        clearVatValidation();

        h.get("../cJOTaxRate/GetVatEmployee?empl_id=" + encodeURIComponent(empl_id)).then(function (d) {
            if (d.data.success) {
                vat_isEdit                  = true;
                vat_original_vat_value      = d.data.data.vat_value.toString();
                vat_original_status         = d.data.data.status;
                vat_original_effective_date = d.data.data.effective_date;
                s.vat_effective_date        = d.data.data.effective_date;
                s.vat_value                 = d.data.data.vat_value;
                s.vat_status                = d.data.data.status;
                s.vat_modal_title           = "Edit VAT Employee";
            } else {
                vat_isEdit                  = false;
                vat_original_vat_value      = "";
                vat_original_status         = "";
                vat_original_effective_date = "";
                var today = new Date();
                s.vat_effective_date = today.getFullYear() + "-"
                    + String(today.getMonth() + 1).padStart(2, "0") + "-"
                    + String(today.getDate()).padStart(2, "0");
                s.vat_value  = 1.12;
                s.vat_status = "";
                s.vat_modal_title = "Add VAT Employee";
            }
            $("#vat_modal").modal("show");
        });
    }

    s.vat_field_changed = function () {
        if (!vat_isEdit) return;
        var vat_changed    = s.vat_value.toString() !== vat_original_vat_value;
        var status_changed = s.vat_status !== vat_original_status;
        if (vat_changed || status_changed) {
            var today = new Date();
            s.vat_effective_date = today.getFullYear() + "-"
                + String(today.getMonth() + 1).padStart(2, "0") + "-"
                + String(today.getDate()).padStart(2, "0");
        } else {
            s.vat_effective_date = vat_original_effective_date;
        }
    }

    function clearVatValidation() {
        $("#vat_empl_id").removeClass("required");
        $("#lbl_vat_empl_id_req").text("");
        $("#vat_effective_date").removeClass("required");
        $("#lbl_vat_effective_date_req").text("");
        $("#vat_value").removeClass("required");
        $("#lbl_vat_value_req").text("");
        $("#vat_status").removeClass("required");
        $("#lbl_vat_status_req").text("");
    }

    function isVatDataValidated() {
        clearVatValidation();
        var valid = true;

        if (!s.vat_empl_id || s.vat_empl_id.toString().trim() === "") {
            $("#vat_empl_id").addClass("required");
            $("#lbl_vat_empl_id_req").text("Required Field!");
            valid = false;
        }
        if (!s.vat_effective_date || s.vat_effective_date.toString().trim() === "") {
            $("#vat_effective_date").addClass("required");
            $("#lbl_vat_effective_date_req").text("Required Field!");
            valid = false;
        }
        if (s.vat_value === "" || s.vat_value === null || s.vat_value === undefined) {
            $("#vat_value").addClass("required");
            $("#lbl_vat_value_req").text("Required Field!");
            valid = false;
        }
        if (!s.vat_status || s.vat_status.toString().trim() === "") {
            $("#vat_status").addClass("required");
            $("#lbl_vat_status_req").text("Required Field!");
            valid = false;
        }
        return valid;
    }

    s.btn_save_vat = function () {
        if (!isVatDataValidated()) return;

        if (vat_isEdit) {
            var vat_changed    = s.vat_value.toString() !== vat_original_vat_value;
            var status_changed = s.vat_status !== vat_original_status;
            if (!vat_changed && !status_changed) {
                swal("No Changes Detected!", "Please modify VAT Value or Status before saving.", "warning");
                return;
            }
        }

        var status_bool  = (s.vat_status === "Active");
        var action_url   = vat_isEdit ? "../cJOTaxRate/UpdateVATEmployee" : "../cJOTaxRate/SaveVATEmployee";

        h.post(action_url, {
            empl_id        : s.vat_empl_id,
            effective_date : s.vat_effective_date,
            vat_value      : parseFloat(s.vat_value),
            status         : status_bool
        }).then(function (d) {
            if (d.data.success) {
                swal("Success!", vat_isEdit ? "VAT record updated successfully!" : "VAT record added successfully!", "success");
                $("#vat_modal").modal("hide");
            } else {
                swal("Error!", d.data.message, "error");
            }
        });
    }

    //***********************************//
    //***1.12 VAT List Modal          **//
    //***********************************//
    var oTable_vat112  = null;
    var vat112_pending = [];

    $("#vat_list_modal").on("shown.bs.modal", function () {
        if (oTable_vat112) {
            oTable_vat112.fnDestroy();
            oTable_vat112 = null;
        }

        oTable_vat112 = $("#vat112_grid").dataTable({
            data: vat112_pending,
            stateSave: false,
            sDom: 'rt<"bottom"p>',
            pageLength: 20,
            columns: [
                { "mData": "empl_id",         "mRender": function (data, type, full, row) { return "<div class='btn-block text-center'>" + (data || "") + "</div>"; } },
                { "mData": "employee_name",   "mRender": function (data, type, full, row) { return "<div class='btn-block text-left'>"   + (data || "") + "</div>"; } },
                { "mData": "department_name", "mRender": function (data, type, full, row) { return "<div class='btn-block text-left'>"   + (data || "") + "</div>"; } },
                { "mData": "vat_value",       "mRender": function (data, type, full, row) { return "<div class='btn-block text-right'>"  + currency(data) + "</div>"; } },
                { "mData": "bus_tax_perc",    "mRender": function (data, type, full, row) { return "<div class='btn-block text-right'>"  + currency(data) + "</div>"; } },
                { "mData": "w_tax_perc",      "mRender": function (data, type, full, row) { return "<div class='btn-block text-right'>"  + currency(data) + "</div>"; } },
                { "mData": "vat_perc",        "mRender": function (data, type, full, row) { return "<div class='btn-block text-right'>"  + currency(data) + "</div>"; } },
                { "mData": "exmpt_amt",       "mRender": function (data, type, full, row) { return "<div class='btn-block text-right'>"  + currency(data) + "</div>"; } },
                { "mData": "effective_date",  "mRender": function (data, type, full, row) { return "<div class='btn-block text-center'>" + (data || "") + "</div>"; } },
               
                {
                    "mData": "status", "bSortable": false,
                    "mRender": function (data, type, full, row) {
                      
                        var btnClass = data === "Active" ? "btn-primary" : "btn-danger";
                        var btnLabel = data === "Active" ? "Set Inactive" : "Set Active";
                        return '<center><button type="button" class="btn ' + btnClass + ' btn-sm" ng-click="btn_vat112_update_status(' + row["row"] + ')">' + data + '</button></center>';
                    }
                }
            ],
            "createdRow": function (row, data, index) {
                $compile(row)($scope);
            }
        });

        oTable_vat112.fnSort([[1, "asc"]]);
    });

    s.btn_toggle_vat112 = function () {
        $("#gearLoader").fadeIn(200);
        h.get("../cJOTaxRate/GetVatEmployeeList").then(function (d) {
            vat112_pending = d.data.success && d.data.data ? d.data.data : [];
            $("#gearLoader").fadeOut(200);
            $("#vat_list_modal").modal("show");
        });
    }

    s.btn_vat112_update_status = function (rowIdx) {
        var rowData     = vat112_pending[rowIdx];
        var newStatus   = rowData.status === "Active" ? false : true;
        var newLabel    = rowData.status === "Active" ? "Inactive" : "Active";

        swal({
            title: "Update Status",
            text: "Set " + rowData.employee_name + " to " + newLabel + "?",
            icon: "warning",
            buttons: true,
            dangerMode: true
        }).then(function (confirmed) {
            if (!confirmed) return;

            $("#gearLoader").fadeIn(200);
            h.post("../cJOTaxRate/UpdateVATStatus", { empl_id: rowData.empl_id, status: newStatus }).then(function (d) {
                if (d.data.success) {
                    h.get("../cJOTaxRate/GetVatEmployeeList").then(function (r) {
                        vat112_pending = r.data.success && r.data.data ? r.data.data : [];
                        oTable_vat112.fnClearTable();
                        oTable_vat112.fnAddData(vat112_pending);
                        $("#gearLoader").fadeOut(200);
                        swal("Success!", d.data.message, "success");
                    });
                } else {
                    $("#gearLoader").fadeOut(200);
                    swal("Error!", d.data.message, "error");
                }
            });
        });
    }

    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************//
    s.btn_print_action = function (id_ss) {

        index_update = id_ss
        s.ModalTitle = "Report Options"
        //$("#modal_print").modal("show")
        var dtlg = s.datalistgrid.filter(function (i) {
            return i.empl_id == id_ss
        })[0]

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = "~/Reports/cryBIR2316/cryBIR2316.rpt"
        var sp = "sp_annualtax_hdr_tbl_rep"
        var parameters = "p_payroll_year," + $("#ddl_year option:selected").val() + ",p_empl_id," + dtlg.empl_id

        //h.post("../cJOTaxRate/PreviousValuesonPage_cBIRAnnualizedTax",
        //    {
        //          par_year: $("#ddl_year option:selected").val()
        //        , par_tax_due: s.datalistgrid[id_ss].monthly_tax_due
        //        , par_tax_rate: s.datalistgrid[id_ss].tax_rate
        //        , par_empl_id: s.datalistgrid[id_ss].empl_id
        //        , par_emp_type: $("#ddl_employment_type option:selected").val()
        //        , par_emp_type_descr: s.datalistgrid[id_ss].employmenttype_description
        //        , par_letter: $("#ddl_letter option:selected").val()
        //        , par_show_entries: $("#ddl_show_entries option:selected").val()
        //        , par_page_nbr: info.page
        //        , par_search: s.search_box
        //        , par_sort_value: sort_value
        //        , par_sort_order: sort_order
        //        , par_position: s.datalistgrid[id_ss].position_title1
        //    }).then(function (d) {

        h.post("../cJOTaxRate/ReportCount",
            {
                par_payroll_year: $("#ddl_year option:selected").val(),
                par_empl_id: dtlg.empl_id
            }).then(function (d) {

                if (d.data.reportcount.length > 0) {

                    location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&Sp=" + sp + "," + parameters
                }

                else {
                    swal({
                        title: "Not Data Found!",
                        text: "No Data for Printing!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                }
            });


        //});





    }









    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })

    }



    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }


    s.RemoveClass = function (value, field) {
        if (value != "") {
            $("#" + field).removeClass("required");
            $("#lbl_" + field + "_req").text("");
        }
    }

    //***************************Functions end*********************************************************//

})

function RemoveEffective() {

    $("#txtb_effective_date").removeClass("required");
    $("#lbl_txtb_effective_date_req").text("");

}

