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




ng_HRD_App.controller("cBIRAnnualizedTax_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var index_update = "";

    s.allow_edit         = false
    s.allow_print        = false
    s.allow_delete       = false
    s.allow_view         = false
    s.allow_edit_history = false
    s.excelExportServer = "";
    s.tax_empl_id = ""
    s.tax_employee_name = ""
    s.tax_tin = ""
    s.oTable = null;
    s.datalistgrid = null
    s.datalistgrid_raw = []
    s.sp_check_annualized_tax_dtl = []
    s.rowLen = "5"
    var sort_value = 1
    var sort_order = "asc"
    s.adddetails = null;
    s.isAction = "";
    var employee_generate_action = true;
    s.pnia_employee_count = 0;
    s.lastRefreshTime = "";
    s.search_box_gen = "";
    s.modalDetailTitle = "";
    s.modalDetailContent = "";
    s.txtb_gen_date = new Date();
    s.alphabet_list = [
        { id: 'a', alpha_name: 'A' }, { id: 'b', alpha_name: 'B' }, { id: 'c', alpha_name: 'C' }, { id: 'd', alpha_name: 'D' }, { id: 'e', alpha_name: 'E' }, { id: 'f', alpha_name: 'F' },
        { id: 'g', alpha_name: 'G' }, { id: 'h', alpha_name: 'H' }, { id: 'i', alpha_name: 'I' }, { id: 'j', alpha_name: 'J' }, { id: 'k', alpha_name: 'K' }, { id: 'l', alpha_name: 'L' },
        { id: 'm', alpha_name: 'M' }, { id: 'n', alpha_name: 'N' }, { id: 'o', alpha_name: 'O' }, { id: 'p', alpha_name: 'P' }, { id: 'q', alpha_name: 'Q' }, { id: 'r', alpha_name: 'R' },
        { id: 's', alpha_name: 'S' }, { id: 't', alpha_name: 'T' }, { id: 'u', alpha_name: 'U' }, { id: 'v', alpha_name: 'V' }, { id: 'w', alpha_name: 'W' }, { id: 'x', alpha_name: 'X' },
        { id: 'y', alpha_name: 'Y' }, { id: 'z', alpha_name: 'Z' }

    ]



    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;

        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                deferRender: true,
                columns: [
                    {
                        data: "check_for_descrepancy",
                        visible: false,   // not displayed
                        searchable: true  // still searchable
                    },
                    {
                        "mData": "empl_id", "mRender": function (data, type, full, row) {
                            var taxable_warning = ""
                            var hr_tax_rate_warning = ""
                            if (full["taxable"] == true) {
                                taxable_warning = "text-warning"
                            } 

                            if (full["tax_rate"] == full["hr_tax_rate"]) {
                                hr_tax_rate_warning = "text-warning"
                            } 
                            return "<span class='btn-block text-left'>ID&nbsp;&nbsp;: " + data + "</span>" +
                                "<span class='d-block text-left small " + taxable_warning + "'>AC TAX RATE :" + full["tax_rate"] + "%</span> <br>" +
                                "<span class='d-block text-left small " + hr_tax_rate_warning + "'>HR TAX RATE :" + full["hr_tax_rate"] + "%</span>";
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='d-block text-left font-weight-bold'>" + data + "</span><br>" +
                                "<span class='d-block text-left text-muted small'>TIN: " + full["account_id_nbr_ref"] + "</span>";
                        }
                    },
                    {
                        "mData": "annual_txbl_income", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            var retdata2 = currency(full["monthly_tax_due"])
                            var retdata3 = currency(full["hr_tax_due"])
                            var taxable_warning = ""
                            var txblamt_warning = ""
                            var hr_tax_due_warning = ""
                            if (full["taxable"] == true) {
                                taxable_warning = "text-warning"
                                txblamt_warning = "text-warning"
                            } 

                            if (full["taxable"] == true) {
                                if (full["cur_mo"] == 1) {
                                    if (parseFloat(full["jan"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 2) {
                                    if (parseFloat(full["feb"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 3) {
                                    if (parseFloat(full["mar"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 4) {
                                    if (parseFloat(full["apr"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 5) {
                                    if (parseFloat(full["may"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 6) {
                                    if (parseFloat(full["jun"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 7) {
                                    if (parseFloat(full["july"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 8) {
                                    if (parseFloat(full["aug"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 9) {
                                    if (parseFloat(full["sep"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 10) {
                                    if (parseFloat(full["oct"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 11) {
                                    if (parseFloat(full["nov"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                                else if (full["cur_mo"] == 12) {
                                    if (parseFloat(full["dec"]) > parseFloat(full["monthly_tax_due"])) {
                                        taxable_warning = "text-danger"
                                    }
                                }
                            } 


                            if (full["monthly_tax_due"] != full["hr_tax_due"]) {
                                hr_tax_due_warning = "text-danger"
                            }

                            return "<span class='d-block text-left " + txblamt_warning +"'>TXBL AMT: " + retdata + "</span><br>" +
                                "<span class='d-block text-left small " + taxable_warning + "'>AC TAX DUE&nbsp;&nbsp;: " + retdata2 + "</span><br>" +
                                   "<span class='d-block text-left small " + hr_tax_due_warning + "'>HR TAX DUE&nbsp;&nbsp;: " + retdata3 + "</span>";
                        }

                    },
                    {
                        "mData": "jan", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            var retdata2 = currency(full["feb"])
                            var warning_jan = ""
                            var warning_feb = ""
                          
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 1 || full["cur_mo"] == 1)) {
                                warning_jan = "text-danger"
                            }
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 2 || full["cur_mo"] == 2)) {
                                warning_feb = "text-danger"
                            }
                            return "<span class='btn-block text-left " + warning_jan +"'>JAN: " + retdata + "</span>" +
                                "<span class='btn-block text-left " + warning_feb +"'>FEB&nbsp;: " + retdata2 + "</span>";
                        }
                    },
                    
                    {
                        "mData": "mar", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            var retdata2 = currency(full["apr"])

                            var warning_mar = ""
                            var warning_apr = ""

                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 3 || full["cur_mo"] == 3)) {
                                warning_mar = "text-danger"
                            }
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 4 || full["cur_mo"] == 4)) {
                                warning_apr = "text-danger"
                            }

                            return "<span class='btn-block text-left " + warning_mar +"'>MAR: " + retdata + "</span>" +
                                "<span class='btn-block text-left " + warning_apr +"'>APR&nbsp;: " + retdata2 + "</span>";
                        }
                    },
                    {
                        "mData": "may", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            var retdata2 = currency(full["jun"])

                            var warning_may = ""
                            var warning_jun = ""

                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 5 || full["cur_mo"] == 5)) {
                                warning_may = "text-danger"
                            }
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 6 || full["cur_mo"] == 6)) {
                                warning_jun = "text-danger"
                            }

                            return "<span class='btn-block text-left " + warning_may +"'>MAY: " + retdata + "</span>" +
                                "<span class='btn-block text-left " + warning_jun +"'>JUN&nbsp;: " + retdata2 + "</span>";
                        }
                    },
                    {
                        "mData": "july", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            var retdata2 = currency(full["aug"])

                            var warning_july = ""
                            var warning_aug = ""
                          
                           
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 7 || full["cur_mo"] == 7)) {
                                warning_july = "text-danger"
                            }
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 8 || full["cur_mo"] == 8)) {
                                warning_aug = "text-danger"
                            }


                            return "<span class='btn-block text-left " + warning_july +"'>JUL&nbsp;&nbsp;: " + retdata + "</span>" +
                                "<span class='btn-block text-left " + warning_aug +"'>AUG: " + retdata2 + "</span>";
                        }
                    },
                    
                    {
                        "mData": "sep", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            var retdata2 = currency(full["oct"])

                            var warning_sep = ""
                            var warning_oct = ""

                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 9 || full["cur_mo"] == 9)) {
                                warning_sep = "text-danger"
                            }
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 10 || full["cur_mo"] == 10)) {
                                warning_oct = "text-danger"
                            }

                            return "<span class='btn-block text-left " + warning_sep +"'>SEP&nbsp;: " + retdata + "</span>" +
                                "<span class='btn-block text-left " + warning_oct +"'>OCT: " + retdata2 + "</span>";
                        }
                    },
                    {
                        "mData": "nov", "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            var retdata2 = currency(full["dec"])

                            var warning_nov = ""
                            var warning_dec = ""

                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 11 || full["cur_mo"] == 11)) {
                                warning_nov = "text-danger"
                            }
                            if (full["check_for_descrepancy"] == true && (full["prev_mo"] == 12 || full["cur_mo"] == 12)) {
                                warning_dec = "text-danger"
                            }

                            return "<span class='btn-block text-left " + warning_nov +"'>NOV: " + retdata + "</span>" +
                                "<span class='btn-block text-left " + warning_dec +"'>DEC&nbsp;: " + retdata2 + "</span>";
                        }
                    },
                    //////
                    {
                        "mData": "cnt_pnia",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center><div class="btn-group tooltip-demo">'

                                + '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="Show Details" ng-show="' + s.allow_view + '" ng-click="btn_show_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-plus"></i></button>'

                                + '<button type="button" class="btn btn-primary btn-sm action" style="background-color:blueviolet;color:white;border:1px solid blueviolet;" data-toggle="tooltip" data-placement="left" title="Generate Annualized Tax" ng-show="' + s.allow_edit + '" ng-click="btn_generate_action(' + row["row"] + ')" > '
                                + '<i id="generate_icon_dtl' + row["row"] + '" class="fa fa-clipboard"></i></button>'

                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i id="edit_icon' + row["row"] + '" class="fa fa-edit"></i></button>'

                                + '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="Check" ng-show="' + s.allow_edit + '" ng-click="btn_check_action(' + row["row"] + ')" > '
                                + '<i id="check_icon' + row["row"] + '" class="fa fa-check"></i></button>'

                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i id="delete_icon' + row["row"] + '" class="fa fa-trash"></i></button>'

                                + '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Print" ng-show="' + s.allow_print + '" ng-click="btn_print_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-print"></i></button>'
                                // 🔴 NEW WARNING / PNIA COUNT BUTTON
                                // + '<button type="button" class="btn btn-danger btn-sm action" style="padding-right:10px !important;" data-toggle="tooltip" data-placement="left" title="Payroll Not In Annual Count" '
                                ///* + 'ng-show="' + data +' > 0" '*/
                                // + 'ng-click="btn_pnia_action(' + row["row"] + ')" > '
                                // + '<i class="fa fa-exclamation-triangle"></i> ' + isnull_0(data) + '</button>'
                                + '<button type="button" class="btn btn-danger btn-sm action btn-pnia" '
                                + 'data-toggle="tooltip" data-placement="left" title="Payroll Not In Annual Count" '
                                + 'ng-click="btn_pnia_action(' + row["row"] + ')" > '
                                + '<span class="pnia-count">' + isnull_0(data) + '</span>'
                                + '</button>'


                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTable.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }


    function isnull_0(data) {
       
        // return the count wrapped in a span with left/right padding so button shows padded value
        var value = (data == null) ? 0 : data;
        return value;
    }
    
    s.FilterPageGridShowAction = function () {
        var show_action = $('#chk_show_descrep').prop("checked") == true ? "Y" : "N"
        if (show_action == "Y") {
            var data = s.datalistgrid_raw.filter(function (d) {
                return d.check_for_descrepancy == true
            })

            s.datalistgrid = data.refreshTable("datalist_grid", "");
        }
        else {
            s.datalistgrid = s.datalistgrid_raw.refreshTable("datalist_grid", "");
        }

    }

    s.FilterPageGridShowPNIA = function () {
        var show_action = $('#chk_show_pnia').prop("checked") == true ? "Y" : "N"
        if (show_action == "Y") {
            var data = s.datalistgrid_raw.filter(function (d) {
                return d.cnt_pnia != null && d.cnt_pnia > 0
            });

            // Sort by cnt_pnia from highest to lowest
            data.sort(function (a, b) {
                return (parseInt(b.cnt_pnia) || 0) - (parseInt(a.cnt_pnia) || 0);
            });

            // Get the DataTable API instance
            var table = $('#datalist_grid').DataTable();
            
            // Destroy current data and ordering state
            table.clear();
            
            // Reset ordering to none (empty array means no sorting)
            table.order([]);
            
            // Add the pre-sorted rows
            table.rows.add(data);
            
            // Draw without paging reset and without re-sorting
            table.draw(false);
            
            s.datalistgrid = data;
        }
        else {
            s.datalistgrid = s.datalistgrid_raw.refreshTable("datalist_grid", "");
            
            // Restore default sort by ID NBR (column 1) ascending
            s.oTable.fnSort([[1, 'asc']]);
        }
    }

    s.btn_pnia_action = function (id_ss) {
        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        var data = s.datalistgrid[id_ss];

        h.post("../cBIRAnnualizedTax/PreviousValuesonPage_cBIRAnnualizedTax",
            {
                 par_year           : data.payroll_year
                ,par_tax_due        : data.monthly_tax_due
                ,par_tax_rate       : data.tax_rate
                ,par_empl_id        : data.empl_id
                ,par_emp_type       : $("#ddl_employment_type option:selected").val()
                ,par_emp_type_descr : data.employmenttype_description
                ,par_letter         : $("#ddl_letter option:selected").val()
                ,par_show_entries   : $("#ddl_show_entries option:selected").val()
                ,par_page_nbr       : info.page
                ,par_search         : s.search_box
                ,par_sort_value     : sort_value
                ,par_sort_order     : sort_order
                ,par_position       : data.position_title1
            }).then(function (d) {
                console.log(d);
                window.location.replace("/cPayrollNotInAnnualTaxDetails");
            })
    }

    s.btn_check_action = function (row) {
        var data = s.datalistgrid[row]
        var payroll_year = data.payroll_year
        var empl_id = data.empl_id
        h.post("../cBIRAnnualizedTax/Check_Tax", { par_payroll_year: payroll_year, par_empl_id: empl_id }).then(function (d) {
            s.sp_check_annualized_tax_dtl = d.data.sp_check_annualized_tax_dtl
            s.tax_empl_id = s.datalistgrid[row].empl_id
            s.tax_employee_name = s.datalistgrid[row].employee_name
            s.tax_tin = s.datalistgrid[row].account_id_nbr_ref
            $('a[href="#tab-12"]').tab('show');

        })
    }
	
    function init() {
		
     //   init_table_data_checktaxes([]);

        $("#gearLoader").fadeIn(200);
        RetrieveYear()
        h.post("../cBIRAnnualizedTax/InitializeData", { par_empType: s.employeeddl }).then(function (d) {

            s.excelExportServer     = d.data.excelExportServer
            s.employeeddl           = d.data.empType
            s.ddl_employment_type   = d.data.ddl_emp_type
            s.ddl_letter            = d.data.ddl_letter
            s.ddl_year              = d.data.ddl_year == "" || d.data.ddl_year == null ? s.ddl_year = new Date().getFullYear().toString() : d.data.ddl_year
            s.rowLen                = d.data.show_entries

            init_table_data([]);
            init_table_data2([]);

            s.allow_edit            = d.data.um.allow_edit
            s.allow_print           = d.data.um.allow_print
            s.allow_delete          = d.data.um.allow_delete
            s.allow_print           = d.data.um.allow_print
            s.allow_edit_history    = d.data.um.allow_edit_history
            s.allow_view            = 1
            

            $("#datalist_grid").DataTable().search("").draw();

         
            //if (d.data.sp_annualtax_hdr_tbl_list_wtaxpmos.length > 0) {

            //    s.datalist_grid_checktaxes = d.data.sp_annualtax_hdr_tbl_list_wtaxpmos;
            //    s.oTable_checktaxes.fnAddData(s.datalist_grid_checktaxes );
            //}


            if (d.data.sp_annualtax_hdr_tbl_list.length > 0) {
                s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list
                s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list.refreshTable("datalist_grid",d.data.empl_id);
                //s.oTable.fnClearTable();
                //s.oTable.fnAddData(s.datalistgrid)
            }
            else
            {
                s.oTable.fnClearTable();
            }

            
            sort_value  = d.data.sort_value
            page_value  = d.data.page_value
            sort_order  = d.data.sort_order
            s.rowLen    = d.data.show_entries

            $("#datalist_grid").DataTable().page.len(s.rowLen).draw();

            s.oTable.fnSort([[sort_value, sort_order]]);
            s.oTable.fnPageChange(page_value);
            s.search_box = d.data.search_value
            
            if (s.search_box == undefined || s.search_box == '')
            {
                s.search_box = ''
            }

            else
            {
                s.search_in_list(s.search_box, 'datalist_grid')
            }

            if (d.data.ddl_emp_type.trim() == "" || d.data.ddl_emp_type.trim() == undefined || d.data.ddl_emp_type.trim() == null) {
                $("#btn_add").hide()
            }

            else
            {
                $("#btn_add").show()
            }

            // Reset filter checkboxes to unchecked state on page load
            $('#chk_show_pnia').prop('checked', false);
            $('#chk_show_descrep').prop('checked', false);

            // Set initial counts for discrepancy and PNIA
            set_pnia_count();

            $("#gearLoader").fadeOut(200);
        })
    }
    init()
    get_generation_status_list()

    //var init_table_data = function (par_data) {
    //    s.datalistgrid = par_data;

    //    s.oTable = $('#datalist_grid').dataTable(
    //        {

    //            data: s.datalistgrid,
    //            stateSave: false,
    //            sDom: 'rt<"bottom"p>',
    //            pageLength: 5,
				//deferRender:true,
    //            columns: [
    //                {
    //                    "mData": "empl_id", "mRender": function (data, type, full, row) {
    //                        return "<div class='btn-block text-center'>" + data + "</div>";
    //                    }
    //                },
    //                {
    //                    "mData": "employee_name", "mRender": function (data, type, full, row) {
    //                        return "<div class='btn-block text-left'>" + data + "</div>";
    //                    }
    //                },

    //                {
    //                    "mData": "account_id_nbr_ref", "mRender": function (data, type, full, row) {
    //                        return "<div class='btn-block text-center'>" + data + "</div>";
    //                    }
    //                },
    //                {
    //                    "mData": "annual_txbl_income", "mRender": function (data, type, full, row) {
    //                        var retdata = currency(data)
    //                        return "<div class='btn-block text-right'>" + retdata + "</div>";
    //                    }
                        
    //                },
    //                {
    //                    "mData": "tax_rate", "mRender": function (data, type, full, row) {
    //                        return "<div class='btn-block text-center'>" + data + "%</div>";
    //                    }
    //                },

                  
    //                {
    //                    "mData": null,
    //                    "bSortable": false,
    //                    "mRender": function (data, type, full, row)
    //                    {

    //                        return '<center><div class="btn-group tooltip-demo">'
    //                            + '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="Show Details" ng-show="' + s.allow_view + '" ng-click="btn_show_action(' + row["row"] + ')" > '
    //                            + '<i class="fa fa-plus"></i>' + '</button>'
    //                            + '<button type="button" class="btn btn-primary btn-sm action" style="background-color:blueviolet;color:white;border:1px solid blueviolet;" data-toggle="tooltip" data-placement="left" title="Generate Annualized Tax" ng-show="' + s.allow_edit + '" ng-click="btn_generate_action(' + row["row"] + ')" > '
    //                            + '<i id="generate_icon_dtl' + row["row"] + '" class="fa fa-clipboard"></i>' + '</button>' 
    //                            + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
    //                            + '<i id="edit_icon' + row["row"] + '" class="fa fa-edit"></i>' + '</button>' +
    //                             '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
    //                            + '<i id="delete_icon' + row["row"] + '" class="fa fa-trash"></i>' +
    //                            '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Print" ng-show="' + s.allow_print + '" ng-click="btn_print_action(' + row["row"] + ')" > '
    //                            + '<i class="fa fa-print"></i>' + '</button>' +
    //                            '</button></div ></center >'

    //                    }
    //                }

    //            ],


    //            "createdRow": function (row, data, index) {
    //                $(row).attr('id', index);
    //                $compile(row)($scope);  //add this to compile the DOM
    //            }
    //        });

    //    s.oTable.fnSort([[1, 'asc']]);

    //    $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    //}



    // Helper function to truncate text and add ellipsis
    function truncateText(text, maxLength) {
        if (text == null || text == undefined) return '';
        text = text.toString();
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }

    // Helper function to escape quotes for inline onclick
    function escapeQuotes(str) {
        if (str == null || str == undefined) return '';
        return str.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ').replace(/\r/g, '');
    }

    // Function to show detail modal
    s.showDetailModal = function (title, content) {
        s.modalDetailTitle = title;
        s.modalDetailContent = content;
        $('#modal_cell_detail').modal('show');
    }

    function toDateOnly(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    var init_table_data2 = function (par_data) {
        s.datalistgrid2 = par_data;

        s.gTable = $('#datalist_grid_2').dataTable(
            {

                data: s.datalistgrid2,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                deferRender: true,
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
                            $('td:eq(4)', row).css('color', '#d9534f'); // red
                            $('td:eq(4)', row).html('Not generated today : see last DTL generated time');
                            if (data.dtl_status !== "ERROR") {
                                data.dtl_status = "ERROR";
                            }
                        }   
                    }       

                    
                },
                columns: [

                    {
                        "mData": "empl_id", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center " + text_color(full["prc_status"])+"'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "employee_name", "mRender": function (data, type, full, row) {
                            var displayText = truncateText(data, 30);
                            var hasMore = (data && data.length > 30);
                            if (hasMore) {
                                return "<div class='cell-truncate " + text_color(full["prc_status"]) + "' ng-click=\"showDetailModal('Employee Name', '" + escapeQuotes(data) + "')\" style='cursor:pointer;' title='Click to view full content'>" + displayText + "</div>";
                            }
                            return "<div class='btn-block text-left " + text_color(full["prc_status"]) +"'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "dtl_generated_datetime", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center " + text_color(full["prc_status"]) +"'>" + data + "</div>";
                        }

                    },

                    {
                        "mData": "hdr_generated_datetime", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center " + text_color(full["prc_status"]) +"'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "latest_error_msg", "mRender": function (data, type, full, row) {
                            var displayText = truncateText(data, 40);
                            var hasMore = (data && data.length > 40);
                            if (hasMore) {
                                return "<div class='cell-truncate text-danger' ng-click=\"showDetailModal('Error Message', '" + escapeQuotes(data) + "')\" style='cursor:pointer;' title='Click to view full content'>" + displayText + "</div>";
                            }
                            return "<div class='btn-block text-center " + text_color(full["prc_status"]) + "'>" + (data || '') + "</div>";
                        }
                    },
                    {
                        "mData": "null", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" +
                                "<button class='btn btn-xs btn-warning' ng-click=\"btn_regenerate_from_status('" + full["empl_id"] + "', '" + escapeQuotes(full["employee_name"]) + "')\" title='Regenerate tax for this employee'>" +
                                "<i class='fa fa-refresh'></i> Regenerate" +
                                "</button>" +
                                "</div>";
                        }
                    },
                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.gTable.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }
    function getDateFromBatchId(batchId) {
        var datePart = batchId.substring(0, 8); // "20260224"

        var year = parseInt(datePart.substring(0, 4));
        var month = parseInt(datePart.substring(4, 6)) - 1; // JS month is 0-based
        var day = parseInt(datePart.substring(6, 8));

        return new Date(year, month, day);
    }

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex,full) {

        if (settings.nTable.id !== "datalist_grid_2") {
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
            if (full.dtl_status !=="ERROR") {
                return false;
            }
        }


        return true;
    });

    s.filterErrors = function () {

        if (s.gTable) {
            s.gTable.fnDraw();   // redraw table
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
        if (s.gTable) {
            s.gTable.fnDraw();
        }
    };

    s.getWithErrorsEmplIdList = function () {


        var ddlyear = $("#ddl_year option:selected").val();
        var ddlemploymenttype = $("#ddl_employment_type option:selected").val();
        var errorList = [];

        // Get ALL rows from internal data (not only visible rows)
        var dt = $('#datalist_grid_2').DataTable();;
        
            dt.rows().every(function () {

                var rowData = this.data();
                var dtl_status = rowData.dtl_status;

            
                if (!s.filterWithErrors) {
                    errorList.push({
                        empl_id: rowData.empl_id,
                        payroll_year: ddlyear,
                        employment_type: ddlemploymenttype,
                        processed: true
                    });
                }
                else {
                    if (dtl_status == "ERROR" ) {
                        errorList.push({
                            empl_id: rowData.empl_id,
                            payroll_year: ddlyear,
                            employment_type: ddlemploymenttype,
                            processed: true
                        });
                    }
                }
                

        });
        
        if (errorList.length == 0) {
            swal("List is emplty!", { icon: "error" });
           
            return;
        }

        $("#gearLoader").fadeIn(200);

        h.post("../cBIRAnnualizedTax/StartAnnualTaxJob", {
            payrollYear: ddlyear,
            employmentType: ddlemploymenttype,
            datalist: errorList
        }).then(function (response) {

            var data = response.data;
            console.log(data)
            if (data.success) {
               
                h.post("../cBIRAnnualizedTax/Get_Generation_Status_List", {
                    payroll_year: ddlyear,
                    employment_type: ddlemploymenttype
                }).then(function (d) {

                    if (d.data.result && d.data.result.length > 0) {
                        s.datalistgrid2 = d.data.result.refreshTable("datalist_grid_2", "")
                    }

                    swal(data.message, { icon: "success" });
                   
                    $("#gearLoader").fadeOut(200);
                })

            } else {
                if (data.failedEmplIds && data.failedEmplIds.length > 0) {
                    swal("Generation Failed!", "Employees with errors: " + data.failedEmplIds.join(", "), "error");
                } else {
                    swal("Generation Failed!", data.message, "error");
                }
                $("#gearLoader").fadeOut(200);
            }

        })
        
    };


    function currency(d)
    {

        var retdata = ""
        if (d == null || d == "" || d == undefined)
        {
            return retdata = "0.00"
        }
        else
        {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }

    s.fn_currency = function(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }

    function text_color(d) {
        if (d == "E") {
            return "text-danger"
        } else {
            return ""
        }
    }

    function get_generation_status_list() {  
        var ddlyear = $("#ddl_year option:selected").val()
        var ddlemploymenttype = $("#ddl_employment_type option:selected").val()
        h.post("../cBIRAnnualizedTax/Get_Generation_Status_List", {
            payroll_year: ddlyear,  
            employment_type: ddlemploymenttype
        }).then(function (d) {

            if (d.data.result && d.data.result.length > 0) {
                s.datalistgrid2 = d.data.result
                s.gTable.fnClearTable()
                s.gTable.fnAddData(s.datalistgrid2)
            }

        })
    }

    // Regenerate tax for a specific employee from the Generation Status list
    s.btn_regenerate_from_status = function (empl_id, employee_name) {
        var ddlyear = $("#ddl_year option:selected").val();
        var ddlemploymenttype = $("#ddl_employment_type option:selected").val();

        if (!ddlyear || !ddlemploymenttype) {
            swal("Please select Year and Employment Type first.", { icon: "warning" });
            return;
        }

        swal({
            title: "Regenerate Tax?",
            text: "Are you sure you want to regenerate tax for " + employee_name + "?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willProceed) {
            if (willProceed) {
                $("#gearLoader").fadeIn(200);

                h.post("../cBIRAnnualizedTax/GenerateByEmployee", {
                    par_empl_id: empl_id,
                    par_payroll_year: ddlyear,
                    par_letter: $("#ddl_letter option:selected").val() || "",
                    par_employment: ddlemploymenttype
                }).then(function (d) {
                    if (d.data.message == "success") {
                        // Update main employee grid if data returned
                        if (d.data.sp_annualtax_hdr_tbl_list && d.data.sp_annualtax_hdr_tbl_list.length > 0) {
                            s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list;
                            s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list;
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);
                            set_descrepancy_count();
                            set_pnia_count();
                        }

                        // Refresh generation status list
                        
                        h.post("../cBIRAnnualizedTax/Get_Generation_Status_List", {
                            payroll_year: ddlyear,
                            employment_type: ddlemploymenttype
                        }).then(function (d) {

                            if (d.data.result && d.data.result.length > 0) {
                                s.datalistgrid2 = d.data.result.refreshTable("datalist_grid_2", empl_id)
                            }
                            swal("Successfully Regenerated!", "Tax for " + employee_name + " has been regenerated.", "success");
                            $("#gearLoader").fadeOut(200);
                        })

                        
                    } else {
                        swal(d.data.message || "An error occurred.", { icon: "error" });
                        $("#gearLoader").fadeOut(200);
                        console.log(d.data)
                    }
                   
                }).catch(function (error) {
                    console.error('Error regenerating tax:', error);
                    swal("Error", "An error occurred while regenerating tax.", "error");
                    $("#gearLoader").fadeOut(200);
                });
            }
        });
    }

    // Expose refresh function to scope for button click
    s.btn_refresh_generation_status = function () {
        $("#gearLoader").fadeIn(200);
        $("#btn_refresh_icon").removeClass("fa fa-refresh");
        $("#btn_refresh_icon").addClass("fa fa-spinner fa-spin");
        
        var ddlyear = $("#ddl_year option:selected").val()
        var ddlemploymenttype = $("#ddl_employment_type option:selected").val()
        h.post("../cBIRAnnualizedTax/Get_Generation_Status_List", {
            payroll_year: ddlyear,  
            employment_type: ddlemploymenttype
        }).then(function (d) {
            if (d.data.result && d.data.result.length > 0) {
                s.datalistgrid2 = d.data.result
                s.gTable.fnClearTable()
                s.gTable.fnAddData(s.datalistgrid2)
            } else {
                s.datalistgrid2 = []
                s.gTable.fnClearTable()
            }
            
            // Update last refresh timestamp
            var now = new Date();
            s.lastRefreshTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
            $("#btn_refresh_icon").addClass("fa fa-refresh");
            $("#gearLoader").fadeOut(200);
        }).catch(function (error) {
            console.error('Error refreshing generation status:', error);
            $("#btn_refresh_icon").removeClass("fa fa-spinner fa-spin");
            $("#btn_refresh_icon").addClass("fa fa-refresh");
            $("#gearLoader").fadeOut(200);
        })
    }
                    


    //************************************//
    //***Select-Payroll-Year-DropDown****//
    //************************************// 
    s.SelectPayrollYear = function (par_empType, par_year, par_letter) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        get_generation_status_list()
        h.post("../cBIRAnnualizedTax/SelectPayrollYear",
            {
                par_empType: par_empType,
                par_year: par_year,
                par_letter: par_letter

            }).then(function (d) {
                if (d.data.sp_annualtax_hdr_tbl_list.length > 0) {
                    s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list
                    s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable.fnClearTable();
                }

                $("#loading_data").modal("hide")

            })
    }

    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectLetter = function (par_empType, par_year, par_letter) {
       $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cBIRAnnualizedTax/SelectLetter",
            {
                par_empType: par_empType,
                par_year: par_year,
                par_letter: par_letter

            }).then(function (d) {
                if (d.data.sp_annualtax_hdr_tbl_list.length > 0) {

                    s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list;
                    s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else {
                    s.oTable.fnClearTable();
                }


                $("#loading_data").modal("hide")

            })

    }

    function set_descrepancy_count() {
        var ndata = s.datalistgrid_raw.filter(function (d) {
            return d.check_for_descrepancy == true
        })
        var ln = ndata.length;
        var descrepancy_count = document.getElementById("descrepancy_count");
        descrepancy_count.innerHTML = ln.toString()
    }

    function set_pnia_count() {
        var pniaData = s.datalistgrid_raw.filter(function (d) {
            return d.cnt_pnia != null && d.cnt_pnia > 0
        })
        s.pnia_employee_count = pniaData.length;
    }


    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectEmploymentType = function (par_empType, par_year,par_letter) {
        $("#gearLoader").fadeIn(200);
        get_generation_status_list()
        h.post("../cBIRAnnualizedTax/SelectEmploymentType",
            {
                par_empType : par_empType,
                par_year    : par_year,
                par_letter  : par_letter

            }).then(function (d)
            {
                
                if (par_empType.trim() == "" || par_empType.trim() == undefined || par_empType.trim() == null) {
                    $("#btn_add").hide()
                }

                else
                {
                    $("#btn_add").show()
                }

                if (d.data.sp_annualtax_hdr_tbl_list_wtaxpmos.length > 0)
                {
                   
                    s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list_wtaxpmos;
                    s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list_wtaxpmos;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid)
                }
                else
                {
                    s.oTable.fnClearTable();
                }

                if (d.data.sp_prcmonitor_tbl.length > 0) {

                    s.datalistgrid2 = d.data.sp_prcmonitor_tbl;
                    s.gTable.fnClearTable();
                    s.gTable.fnAddData(s.datalistgrid2)
                }
                else {
                    //s.gTable   
                }
                set_descrepancy_count()
                set_pnia_count()
                $("#gearLoader").fadeOut(200);
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
    

    

    function clearentry() {
        s.txtb_empl_name            = ""
        s.txtb_empl_id              = ""
        s.txtb_position             = ""
        s.txtb_monthly_tax_due      = "0.00"
        s.txtb_employment_type      = ""
        s.txtb_monthly_tax_rate     = "0.00"
        s.txtb_gross_inc_prst       = "0.00"
        s.txtb_non_tax_exmpt        = "0.00"
        s.txtb_txbl_inc_prst        = "0.00"
        s.txtb_add_txbl_inc_prst    = "0.00"
        s.txtb_gross_txbl_inc       = "0.00"
        s.txtb_annual_tax_due       = "0.00"
        s.txtb_wheld_prst_emplyr    = "0.00"
        s.txtb_wheld_prev_emplyr    = "0.00"
        s.txtb_wheld_total          = "0.00"
        s.txtb_ntx_basic_sal_mwe      = "0.00"
        s.txtb_ntx_hol_pay_mwe      = "0.00"
        s.txtb_ntx_ot_pay_mwe       = "0.00"
        s.txtb_ntx_night_diff_mwe   = "0.00"
        s.txtb_ntx_hzrd_pay_mwe     = "0.00"
        s.txtb_ntx_13th_month       = "0.00"
        s.txtb_ntx_deminimis        = "0.00"
        s.txtb_ntx_premiums         = "0.00"
        s.txtb_ntx_salaries_oth     = "0.00"
        s.txtb_ntx_total            = "0.00"
        s.txtb_txbl_basic_sal       = "0.00"
        s.txtb_txbl_ra              = "0.00"
        s.txtb_txbl_ta              = "0.00"
        s.txtb_txbl_cola            = "0.00"
        s.txtb_txbl_fxd_hsng_allo   = "0.00"
        s.txtb_txbl_othA            = "0.00"
        s.txtb_txbl_othB            = "0.00"
        s.txtb_txbl_total           = "0.00"
        s.txbl_sup_com              = "0.00"
        s.txtb_sup_proft_s          = "0.00"
        s.txtb_sup_dir_fee          = "0.00"
        s.txtb_sup_13_oth           = "0.00"
        s.txtb_sup_hzrd_pay         = "0.00"
        s.txtb_sup_ot_pay           = "0.00"
        s.txtb_sup_othA             = "0.00"
        s.txtb_sup_othB             = "0.00"
        s.txtb_sup_total            = "0.00"
        FieldValidationColorChanged(false, "ALL");
    }


    s.btn_generate_action = function (id_ss)
    {
        if (employee_generate_action == false) { return };
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

                // Show loading modal
                $("#gearLoader").fadeIn(200);
                
                //$("#generate_icon_dtl" + id_ss).removeClass("fa fa-clipboard");
                //$("#generate_icon_dtl" + id_ss).addClass("fa fa-spinner fa-spin");

                employee_generate_action = false
                h.post("../cBIRAnnualizedTax/GenerateByEmployee", {
                     par_empl_id        : s.datalistgrid[id_ss].empl_id
                    ,par_payroll_year   : s.datalistgrid[id_ss].payroll_year
                    ,par_letter         : $("#ddl_letter option:selected").val()
                    ,par_employment     : $("#ddl_employment_type").val()
                }).then(function (d) {
                    employee_generate_action = true
                    if (d.data.message == "success") {
                       



                        if (d.data.sp_annualtax_hdr_tbl_list.length > 0) {
                            s.txtb_monthly_tax_due = currency(d.data.sp_annualtax_hdr_tbl_list2.monthly_tax_due)
                            s.txtb_employment_type = d.data.sp_annualtax_hdr_tbl_list2.employmenttype_description
                            s.txtb_monthly_tax_rate = currency(d.data.sp_annualtax_hdr_tbl_list2.tax_rate)

                            s.txtb_add_txbl_inc_prst = currency(d.data.sp_annualtax_hdr_tbl_list2.addl_txbl_comp_prsnt)

                            s.txtb_annual_tax_due = currency(d.data.sp_annualtax_hdr_tbl_list2.annual_tax_due)
                            s.txtb_wheld_prst_emplyr = currency(d.data.sp_annualtax_hdr_tbl_list2.wtax_prsnt_emplyr)
                            s.txtb_wheld_prev_emplyr = currency(d.data.sp_annualtax_hdr_tbl_list2.wtax_prev_emplyr)

                            ///s.txtb_non_tax_exmpt
                            s.txtb_ntx_basic_sal_mwe = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_basic_salary)
                            s.txtb_ntx_hol_pay_mwe = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_hol_pay_mwe)
                            s.txtb_ntx_ot_pay_mwe = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_ot_pay_mwe)
                            s.txtb_ntx_night_diff_mwe = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_night_diff_mwe)
                            s.txtb_ntx_hzrd_pay_mwe = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_hzrd_pay_mwe)
                            s.txtb_ntx_13th_month = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_13th_14th)
                            s.txtb_ntx_deminimis = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_de_minimis)
                            s.txtb_ntx_premiums = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_gsis_phic_hdmf)
                            s.txtb_ntx_salaries_oth = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_salaries_oth)
                            ///s.txtb_non_tax_exmpt


                            s.txtb_txbl_basic_sal = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_basic_salary)
                            s.txtb_txbl_ra = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_representation)
                            s.txtb_txbl_ta = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_transportation)
                            s.txtb_txbl_cola = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_cola)
                            s.txtb_txbl_fxd_hsng_allo = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_fh_allowance)
                            s.txtb_txbl_othA = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_otherA)
                            s.txtb_txbl_othB = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_otherB)


                            s.txbl_sup_com = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_commission)
                            s.txtb_sup_proft_s = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_prof_sharing)
                            s.txtb_sup_dir_fee = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_fi_drctr_fees)
                            s.txtb_sup_13_oth = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_13th_14th)
                            s.txtb_sup_hzrd_pay = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_hzrd_pay)
                            s.txtb_sup_ot_pay = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_ot_pay)
                            s.txtb_sup_othA = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_otherA)
                            s.txtb_sup_othB = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_otherB)
                            $("#ddl_employer_type").val(d.data.sp_annualtax_hdr_tbl_list2.employer_type)
                            s.txtb_foreign_add = d.data.sp_annualtax_hdr_tbl_list2.foreign_address
                            s.txtb_stat_daily = currency(d.data.sp_annualtax_hdr_tbl_list2.stat_daily_rate)
                            s.txtb_stat_monthly = currency(d.data.sp_annualtax_hdr_tbl_list2.stat_monthly_rate)
                            $("#ddl_wage_earner").val(d.data.sp_annualtax_hdr_tbl_list2.min_wage_earner.toString().toUpperCase())
                            s.txtb_tin_prev = d.data.sp_annualtax_hdr_tbl_list2.tin_employer_prev
                            s.txtb_empl_name_prev = d.data.sp_annualtax_hdr_tbl_list2.employer_name_prev
                            s.txtb_address_prev = d.data.sp_annualtax_hdr_tbl_list2.employer_add_prev
                            s.txtb_zip_prev = d.data.sp_annualtax_hdr_tbl_list2.employer_zip_prev
                            calculatetaxable()
                            calculatenontaxable()
                            calculatetaxable_supplementary()
                            calculategrossincome()
                            calculatecompincomepresent()
                            calculategrosstxblincome()
                            calculatetotaladjst()
                            calculatetaxdiff()

                            // Update only the specific employee row in the data arrays
                            var updatedEmployee = d.data.sp_annualtax_hdr_tbl_list2;
                            var empl_id = s.datalistgrid[id_ss].empl_id;
                            
                            // Update the row in datalistgrid
                            s.datalistgrid[id_ss] = updatedEmployee;
                                
                            // Update the same employee in datalistgrid_raw
                            for (var i = 0; i < s.datalistgrid_raw.length; i++) {
                                if (s.datalistgrid_raw[i].empl_id == empl_id) {
                                    s.datalistgrid_raw[i] = updatedEmployee;
                                    break;
                                }
                            }
                            
                            // Redraw only the updated row in the DataTable
                            var table = $('#datalist_grid').DataTable();
                            table.row(id_ss).data(updatedEmployee).invalidate().draw(false);
                        }

                        swal("Successfully Updated!", "Existing record successfully Updated!", "success")

                        //$("#generate_icon_dtl" + id_ss).removeClass("fa fa-spinner fa-spin");
                        //$("#generate_icon_dtl" + id_ss).addClass("fa fa-clipboard");
                        $("#gearLoader").fadeOut(200);

                    }
                    else {
                        swal(d.data.message, { icon: "error" })
                        //$("#generate_icon_dtl" + id_ss).removeClass("fa fa-spinner fa-spin");
                        //$("#generate_icon_dtl" + id_ss).addClass("fa fa-clipboard");
                        $("#gearLoader").fadeOut(200);
                    }

                 })

            }
        })
    }

    s.btn_generate_action_add = function () {
        swal({
            title: "Are you sure to Add this record?",
            text: "Once generated, data will be updated automatically!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {
                $("#btn_generate_icon").removeClass("fa fa-share-square-o");
                $("#btn_generate_icon").addClass("fa fa-spinner fa-spin");

                h.post("../cBIRAnnualizedTax/GenerateByEmployee", {
                     par_empl_id     : $("#ddl_employee_name").val()
                    ,par_payroll_year: $("#ddl_year").val()
                    ,par_letter      : $("#ddl_letter option:selected").val()
                    ,par_employment  : $("#ddl_employment_type option:selected").val()
                }).then(function (d) {

                    if (d.data.message == "success")
                    {

                        s.ishowsave = true;
                        //updateListGrid()
                        if (d.data.sp_annualtax_hdr_tbl_list2.length > 0)
                        {
                            s.txtb_monthly_tax_due      = currency(d.data.sp_annualtax_hdr_tbl_list2.monthly_tax_due)
                            s.txtb_employment_type      = d.data.sp_annualtax_hdr_tbl_list2.employmenttype_description
                            s.txtb_monthly_tax_rate     = currency(d.data.sp_annualtax_hdr_tbl_list2.tax_rate)

                            s.txtb_add_txbl_inc_prst    = currency(d.data.sp_annualtax_hdr_tbl_list2.addl_txbl_comp_prsnt)

                            s.txtb_annual_tax_due       = currency(d.data.sp_annualtax_hdr_tbl_list2.annual_tax_due)
                            s.txtb_wheld_prst_emplyr    = currency(d.data.sp_annualtax_hdr_tbl_list2.wtax_prsnt_emplyr)
                            s.txtb_wheld_prev_emplyr    = currency(d.data.sp_annualtax_hdr_tbl_list2.wtax_prev_emplyr)

                            s.txtb_ntx_basic_sal_mwe    = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_basic_salary)
                            s.txtb_ntx_hol_pay_mwe      = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_hol_pay_mwe)
                            s.txtb_ntx_ot_pay_mwe       = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_ot_pay_mwe)
                            s.txtb_ntx_night_diff_mwe   = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_night_diff_mwe)
                            s.txtb_ntx_hzrd_pay_mwe     = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_hzrd_pay_mwe)
                            s.txtb_ntx_13th_month       = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_13th_14th)
                            s.txtb_ntx_deminimis        = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_de_minimis)
                            s.txtb_ntx_premiums         = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_gsis_phic_hdmf)
                            s.txtb_ntx_salaries_oth     = currency(d.data.sp_annualtax_hdr_tbl_list2.ntx_salaries_oth)



                            s.txtb_txbl_basic_sal       = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_basic_salary)
                            s.txtb_txbl_ra              = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_representation)
                            s.txtb_txbl_ta              = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_transportation)
                            s.txtb_txbl_cola            = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_cola)
                            s.txtb_txbl_fxd_hsng_allo   = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_fh_allowance)
                            s.txtb_txbl_othA            = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_otherA)
                            s.txtb_txbl_othB            = currency(d.data.sp_annualtax_hdr_tbl_list2.txbl_otherB)


                            s.txbl_sup_com              = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_commission)
                            s.txtb_sup_proft_s          = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_prof_sharing)
                            s.txtb_sup_dir_fee          = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_fi_drctr_fees)
                            s.txtb_sup_13_oth           = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_13th_14th)
                            s.txtb_sup_hzrd_pay         = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_hzrd_pay)
                            s.txtb_sup_ot_pay           = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_ot_pay)
                            s.txtb_sup_othA             = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_otherA)
                            s.txtb_sup_othB             = currency(d.data.sp_annualtax_hdr_tbl_list2.sup_otherB)
                            $("#ddl_employer_type").val(d.data.sp_annualtax_hdr_tbl_list2.employer_type)
                            s.txtb_foreign_add          = d.data.sp_annualtax_hdr_tbl_list2.foreign_address
                            s.txtb_stat_daily           = currency(d.data.sp_annualtax_hdr_tbl_list2.stat_daily_rate)
                            s.txtb_stat_monthly         = currency(d.data.sp_annualtax_hdr_tbl_list2.stat_monthly_rate)
                            $("#ddl_wage_earner").val(d.data.sp_annualtax_hdr_tbl_list2.min_wage_earner.toString().toUpperCase())
                            s.txtb_tin_prev             = d.data.sp_annualtax_hdr_tbl_list2.tin_employer_prev
                            s.txtb_empl_name_prev       = d.data.sp_annualtax_hdr_tbl_list2.employer_name_prev
                            s.txtb_address_prev         = d.data.sp_annualtax_hdr_tbl_list2.employer_add_prev
                            s.txtb_zip_prev             = d.data.sp_annualtax_hdr_tbl_list2.employer_zip_prev
                            calculatetaxable()
                            calculatenontaxable()
                            calculatetaxable_supplementary()
                            calculategrossincome()
                            calculatecompincomepresent()
                            calculategrosstxblincome()
                            calculatetotaladjst()
                            calculatetaxdiff()

                            s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list2

                            s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list2;
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid)
                        }
                        else
                        {
                            s.oTable.fnClearTable();
                        }

                        swal("Successfully Added!", "New record successfully Added!", "success")

                        $("#btn_generate_icon").removeClass("fa fa-spinner fa-spin");
                        $("#btn_generate_icon").addClass("fa fa-share-square-o");

                    }

                })

            }
        })
    }

    s.btn_generateALL_action = function () {
        swal({
            title: "Are you sure to Update All records?",
            text: "Once generated, data will be updated automatically!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {

               $("#loading_data").modal({ keyboard: false, backdrop: "static" })

                h.post("../cBIRAnnualizedTax/GenerateByEmployee", {
                     par_empl_id: ""
                    ,par_payroll_year: $("#ddl_year option:selected").val()
                    ,par_letter: $("#ddl_letter option:selected").val()
                }).then(function (d) {

                    if (d.data.message == "success")
                    {
                        s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list
                        s.datalistgrid = d.data.sp_annualtax_hdr_tbl_list
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        s.oTable.fnSort([[sort_value, sort_order]]);
                        
                        swal("Successfully Updated!", "All records successfully Updated!", "success")
                    }

                    $("#loading_data").modal("hide")

                })

            }
        })
    }

    s.btn_show_action = function (id_ss)
    {
        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        var url = "";
        h.post("../cBIRAnnualizedTax/PreviousValuesonPage_cBIRAnnualizedTax",
            {

                 par_year           : $("#ddl_year option:selected").val()
                ,par_tax_due        : s.datalistgrid[id_ss].monthly_tax_due
                ,par_tax_rate       : s.datalistgrid[id_ss].tax_rate
                ,par_empl_id        : s.datalistgrid[id_ss].empl_id
                ,par_emp_type       : $("#ddl_employment_type option:selected").val()
                ,par_emp_type_descr : s.datalistgrid[id_ss].employmenttype_description
                ,par_letter         : $("#ddl_letter option:selected").val()
                ,par_show_entries   : $("#ddl_show_entries option:selected").val()
                ,par_page_nbr       : info.page
                ,par_search         : s.search_box
                ,par_sort_value     : sort_value
                ,par_sort_order     : sort_order
                ,par_position       : s.datalistgrid[id_ss].position_title1
            }).then(function (d) {

                url = "/cBIRAnnualizedTaxDetails";
                window.location.replace(url);
            })

    }

    s.btn_show_action2 = function (id_ss) {
        var table = $('#datalist_grid_checktaxes').DataTable();
        var info = table.page.info();
        var url = "";
        h.post("../cBIRAnnualizedTax/PreviousValuesonPage_cBIRAnnualizedTax",
            {

                par_year: $("#ddl_year option:selected").val()
                , par_tax_due: s.datalist_grid_checktaxes[id_ss].monthly_tax_due
                , par_tax_rate: s.datalist_grid_checktaxes[id_ss].tax_rate
                , par_empl_id: s.datalist_grid_checktaxes[id_ss].empl_id
                , par_emp_type: $("#ddl_employment_type option:selected").val()
                , par_emp_type_descr: s.datalist_grid_checktaxes[id_ss].employmenttype_description
                , par_letter: $("#ddl_letter option:selected").val()
                , par_show_entries: $("#ddl_show_entries option:selected").val()
                , par_page_nbr: info.page
                , par_search: s.search_box
                , par_sort_value: sort_value
                , par_sort_order: sort_order
                , par_position: s.datalist_grid_checktaxes[id_ss].position_title1
            }).then(function (d) {

                url = "/cBIRAnnualizedTaxDetails";
                window.location.replace(url);
            })

    }

    s.SelectEmployeeNameClear = function ()
    {
        s.txtb_empl_id              = ""
        s.txtb_position             = ""
        s.txtb_employment_type      = ""
        s.txtb_employment_type_val  = ""
        $("#btn_generate").hide()
    }

    s.SelectEmployeeName = function (data)
    {

        $("#btn_generate").show()
        s.txtb_empl_id = data.empl_id
        s.txtb_position = data.position_title1
        s.txtb_employment_type = data.employmenttype_description
        s.txtb_employment_type_val = data.employment_type

       

        //h.post("../cBIRAnnualizedTax/SelectEmployeeName",
        //    {

        //        par_payroll_year: $("#ddl_year option:selected").val(),
        //        par_empType     : $("#ddl_employment_type option:selected").val(),
        //        par_empl_id     : data.empl_id

        //    }).then(function (d) {
                
        //        if (d.data.message == "success") {
                    
        //            if (d.data.sp_tax_prjtd_per_empl_id != null) {
                        
        //                s.txtb_empl_id = d.data.sp_tax_prjtd_per_empl_id.empl_id
        //                s.txtb_monthly_tax_due = currency(d.data.sp_tax_prjtd_per_empl_id.monthly_tax_due)
                        
        //                s.txtb_monthly_tax_rate = currency(d.data.sp_tax_prjtd_per_empl_id.tax_rate)
                        
        //                s.txtb_add_txbl_inc_prst = currency(d.data.sp_tax_prjtd_per_empl_id.addl_txbl_comp_prsnt)

        //                s.txtb_annual_tax_due = currency(d.data.sp_tax_prjtd_per_empl_id.annual_tax_due)
        //                s.txtb_wheld_prst_emplyr = currency(d.data.sp_tax_prjtd_per_empl_id.wtax_prsnt_emplyr)
        //                s.txtb_wheld_prev_emplyr = currency(d.data.sp_tax_prjtd_per_empl_id.wtax_prev_emplyr)

        //                ///s.txtb_non_tax_exmpt
        //                s.txtb_ntx_basic_sal_mwe = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_basic_salary)
        //                s.txtb_ntx_hol_pay_mwe = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_hol_pay_mwe)
        //                s.txtb_ntx_ot_pay_mwe = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_ot_pay_mwe)
        //                s.txtb_ntx_night_diff_mwe = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_night_diff_mwe)
        //                s.txtb_ntx_hzrd_pay_mwe = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_hzrd_pay_mwe)
        //                s.txtb_ntx_13th_month = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_13th_14th)
        //                s.txtb_ntx_deminimis = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_de_minimis)
        //                s.txtb_ntx_premiums = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_gsis_phic_hdmf)
        //                s.txtb_ntx_salaries_oth = currency(d.data.sp_tax_prjtd_per_empl_id.ntx_salaries_oth)
        ///s.txtb_non_tax_exmpt


        //                s.txtb_txbl_basic_sal = currency(d.data.sp_tax_prjtd_per_empl_id.txbl_basic_salary)
        //                s.txtb_txbl_ra = currency(d.data.sp_tax_prjtd_per_empl_id.txbl_representation)
        //                s.txtb_txbl_ta = currency(d.data.sp_tax_prjtd_per_empl_id.txbl_transportation)
        //                s.txtb_txbl_cola = currency(d.data.sp_tax_prjtd_per_empl_id.txbl_cola)
        //                s.txtb_txbl_fxd_hsng_allo = currency(d.data.sp_tax_prjtd_per_empl_id.txbl_fh_allowance)
        //                s.txtb_txbl_othA = currency(d.data.sp_tax_prjtd_per_empl_id.txbl_otherA)
        //                s.txtb_txbl_othB = currency(d.data.sp_tax_prjtd_per_empl_id.txbl_otherB)


        //                s.txbl_sup_com = currency(d.data.sp_tax_prjtd_per_empl_id.sup_commission)
        //                s.txtb_sup_proft_s = currency(d.data.sp_tax_prjtd_per_empl_id.sup_prof_sharing)
        //                s.txtb_sup_dir_fee = currency(d.data.sp_tax_prjtd_per_empl_id.sup_fi_drctr_fees)
        //                s.txtb_sup_13_oth = currency(d.data.sp_tax_prjtd_per_empl_id.sup_13th_14th)
        //                s.txtb_sup_hzrd_pay = currency(d.data.sp_tax_prjtd_per_empl_id.sup_hzrd_pay)
        //                s.txtb_sup_ot_pay = currency(d.data.sp_tax_prjtd_per_empl_id.sup_ot_pay)
        //                s.txtb_sup_othA = currency(d.data.sp_tax_prjtd_per_empl_id.sup_otherA)
        //                s.txtb_sup_othB = currency(d.data.sp_tax_prjtd_per_empl_id.sup_otherB)
                       

        //                calculatetaxable()
        //                calculatenontaxable()
        //                calculatetaxable_supplementary()
        //                calculategrossincome()
        //                calculatecompincomepresent()
        //                calculategrosstxblincome()
        //                calculatetotaladjst()
        //                calculatetaxdiff()

        //                $("#loading_data").modal("hide")
        //                $("#main_modal").modal("show")
        //            }

        //            else {
        //                swal({
        //                    title: "Not Available",
        //                    text: "No Data Found for this Employee!",
        //                    icon: "warning",
        //                    buttons: true,
        //                    dangerMode: true,
        //                })
        //                clearentry()

        //                $("#loading_data").modal("hide")
        //                $("#main_modal").modal("hide")
        //            }

        //        }

        //    })
    }

    function getFromValue()
    {
        var empl_name = "";
        if (s.txtb_empl_name == "" || s.txtb_empl_name == null) {

            empl_name = $("#ddl_employee_name option:selected").html()

        }

        else
        {
            empl_name = s.txtb_empl_name
        }

        

        var data =
        {

            payroll_year            : $("#ddl_year option:selected").val()
            ,empl_id                : s.txtb_empl_id
            ,employee_name          : empl_name
            ,employment_type        : s.txtb_employment_type_val
            ,employmenttype_description: s.txtb_employment_type
            ,position_title1        : s.txtb_position
            ,addl_txbl_comp_prsnt   : toDecimalFormat(s.txtb_add_txbl_inc_prst)
            ,annual_tax_due         : toDecimalFormat(s.txtb_annual_tax_due)
            ,wtax_prsnt_emplyr      : toDecimalFormat(s.txtb_wheld_prst_emplyr)
            ,wtax_prev_emplyr       : toDecimalFormat(s.txtb_wheld_prev_emplyr)
            ,ntx_basic_salary       : toDecimalFormat(s.txtb_ntx_basic_sal_mwe)
            ,ntx_hol_pay_mwe        : toDecimalFormat(s.txtb_ntx_hol_pay_mwe)
            ,ntx_ot_pay_mwe         : toDecimalFormat(s.txtb_ntx_ot_pay_mwe)
            ,ntx_night_diff_mwe     : toDecimalFormat(s.txtb_ntx_night_diff_mwe)
            ,ntx_hzrd_pay_mwe       : toDecimalFormat(s.txtb_ntx_hzrd_pay_mwe)
            ,ntx_13th_14th          : toDecimalFormat(s.txtb_ntx_13th_month)
            ,ntx_de_minimis         : toDecimalFormat(s.txtb_ntx_deminimis)
            ,ntx_gsis_phic_hdmf     : toDecimalFormat(s.txtb_ntx_premiums)
            ,ntx_salaries_oth       : toDecimalFormat(s.txtb_ntx_salaries_oth)
            ,txbl_basic_salary      : toDecimalFormat(s.txtb_txbl_basic_sal)
            ,txbl_representation    : toDecimalFormat(s.txtb_txbl_ra)
            ,txbl_transportation    : toDecimalFormat(s.txtb_txbl_ta)
            ,txbl_cola              : toDecimalFormat(s.txtb_txbl_cola)
            ,txbl_fh_allowance      : toDecimalFormat(s.txtb_txbl_fxd_hsng_allo)
            ,txbl_otherA            : toDecimalFormat(s.txtb_txbl_othA)
            ,txbl_otherB            : toDecimalFormat(s.txtb_txbl_othB)
            ,sup_commission         : toDecimalFormat(s.txbl_sup_com)
            ,sup_prof_sharing       : toDecimalFormat(s.txtb_sup_proft_s)
            ,sup_fi_drctr_fees      : toDecimalFormat(s.txtb_sup_dir_fee)
            ,sup_13th_14th          : toDecimalFormat(s.txtb_sup_13_oth)
            ,sup_hzrd_pay           : toDecimalFormat(s.txtb_sup_hzrd_pay)
            ,sup_ot_pay             : toDecimalFormat(s.txtb_sup_ot_pay)
            ,sup_otherA             : toDecimalFormat(s.txtb_sup_othA)
            ,sup_otherB             : toDecimalFormat(s.txtb_sup_othB)
            ,annual_txbl_income     : toDecimalFormat(s.txtb_gross_txbl_inc)
            ,annual_tax_wheld       : toDecimalFormat(s.txtb_wheld_total)
            ,monthly_tax_due        : toDecimalFormat(s.txtb_monthly_tax_due)
            ,tax_rate               : toDecimalFormat(s.txtb_monthly_tax_rate)
            ,employer_type          : $("#ddl_employer_type option:selected").val()
            ,foreign_address        : s.txtb_foreign_add
            ,stat_daily_rate        : toDecimalFormat(s.txtb_stat_daily)
            ,stat_monthly_rate      : toDecimalFormat(s.txtb_stat_monthly)
            , min_wage_earner       : $("#ddl_wage_earner").val()
            ,tin_employer_prev      : s.txtb_tin_prev
            ,employer_name_prev     : s.txtb_empl_name_prev
            ,employer_add_prev      : s.txtb_address_prev
            ,employer_zip_prev      : s.txtb_zip_prev
            ,substituted            : $("#ddl_subs_type").val()

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
    

    function updateListGrid()
    {

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();
        s.datalistgrid[index_update].addl_txbl_comp_prsnt   = toDecimalFormat(s.txtb_add_txbl_inc_prst)
        s.datalistgrid[index_update].wtax_prev_emplyr       = toDecimalFormat(s.txtb_wheld_prev_emplyr)
        s.datalistgrid[index_update].ntx_basic_salary       = toDecimalFormat(s.txtb_ntx_basic_sal_mwe)
        s.datalistgrid[index_update].ntx_hol_pay_mwe        = toDecimalFormat(s.txtb_ntx_hol_pay_mwe)
        s.datalistgrid[index_update].ntx_ot_pay_mwe         = toDecimalFormat(s.txtb_ntx_ot_pay_mwe)
        s.datalistgrid[index_update].ntx_night_diff_mwe     = toDecimalFormat(s.txtb_ntx_night_diff_mwe)
        s.datalistgrid[index_update].ntx_hzrd_pay_mwe       = toDecimalFormat(s.txtb_ntx_hzrd_pay_mwe)
        s.datalistgrid[index_update].txbl_representation    = toDecimalFormat(s.txtb_txbl_ra)
        s.datalistgrid[index_update].txbl_transportation    = toDecimalFormat(s.txtb_txbl_ta)
        s.datalistgrid[index_update].txbl_cola              = toDecimalFormat(s.txtb_txbl_cola)
        s.datalistgrid[index_update].txbl_fh_allowance      = toDecimalFormat(s.txtb_txbl_fxd_hsng_allo)
        s.datalistgrid[index_update].sup_commission         = toDecimalFormat(s.txbl_sup_com)
        s.datalistgrid[index_update].sup_prof_sharing       = toDecimalFormat(s.txtb_sup_proft_s)
        s.datalistgrid[index_update].sup_fi_drctr_fees      = toDecimalFormat(s.txtb_sup_dir_fee)
        s.datalistgrid[index_update].employer_type          = $("#ddl_employer_type option:selected").val()
        s.datalistgrid[index_update].foreign_address        = s.txtb_foreign_add
        s.datalistgrid[index_update].stat_daily_rate        = s.txtb_stat_daily
        s.datalistgrid[index_update].stat_monthly_rate      = s.txtb_stat_monthly
        s.datalistgrid[index_update].min_wage_earner        = $("#ddl_wage_earner").val()
        s.datalistgrid[index_update].tin_employer_prev      = s.txtb_tin_prev
        s.datalistgrid[index_update].employer_name_prev     = s.txtb_empl_name_prev
        s.datalistgrid[index_update].employer_add_prev      = s.txtb_address_prev
        s.datalistgrid[index_update].employer_zip_prev      = s.txtb_zip_prev
        s.datalistgrid[index_update].substituted            = $("#ddl_subs_type").val()
        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
        page_value = info.page

        s.oTable.fnSort([[sort_value, sort_order]]);
        
        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++)
        {
            if (get_page(s.datalistgrid[index_update].empl_id) == false)
            {
                s.oTable.fnPageChange(x);
            }
            else
            {
                break;
            }
        }
        
            
     }


    s.btn_save = function ()
    {

        var dt = getFromValue()
      
        $("#btn_save").removeClass("fa fa-spinner fa-spin");
        $("#btn_save").addClass("fa fa-save");

        if (isdataValidated())
        {
            h.post("../cBIRAnnualizedTax/CheckData", {
                par_payroll_year: $("#ddl_year option:selected").val()
                , par_empType: s.txtb_employment_type_val
                , par_letter: $("#ddl_letter option:selected").val()
                , par_empl_id: s.txtb_empl_id
                , par_action: s.isAction
            }).then(function (d) {

                if (d.data.message == "success") {

                    h.post("../cBIRAnnualizedTax/SaveEDITInDatabase",
                        {
                            data: dt
                            ,par_payroll_year: $("#ddl_year option:selected").val()
                            ,par_empl_id: s.txtb_empl_id
                        }).then(function (d) {
                            if (d.data.message == "success") {

                                $("#main_modal").modal("hide")
                                updateListGrid()
                               
                                swal("Successfully Updated!","Existing record successfully Updated!", "success")
                                $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                $("#btn_save").addClass("fa fa-save");
                            }

                            else {
                                swal("Saving Error!", "Data not save.", "error");
                                $("#main_modal").modal("hide")
                                $("#btn_save").removeClass("fa fa-spinner fa-spin");
                                $("#btn_save").addClass("fa fa-save");
                            }



                        })

                }

                else {
                    swal("Unable to Add, Data has been Added by other user/s!", { icon: "warning", });


                    //if (d.data.sp_annualtax_hdr_tbl_list != null) {
                    //    s.datalistgrid.push(d.data.sp_annualtax_hdr_tbl_list)
                    //    s.oTable.fnClearTable();
                    //    s.oTable.fnAddData(s.datalistgrid)

                    //}

                    //else {
                    //    s.oTable.fnClearTable();
                    //    s.oTable.fnAddData(s.datalistgrid)
                    //}

                    $("#main_modal").modal("hide")


                }

            })

        }

        
        
    }

    s.btn_edit_action = function (id_ss)
    {

        $("#btn_save").removeClass("fa fa-spinner fa-spin");
        $("#btn_save").addClass("fa fa-save");

        $("#edit_icon" + id_ss).removeClass("fa fa-edit");
        $("#edit_icon" + id_ss).addClass("fa fa-spinner fa-spin");
        
        $("#btn_generate").hide()
        s.isShowNameSelect = false;
        s.isShowNameInput = true;
        s.ishowsave = true;
        index_update = id_ss
        clearentry()
        s.isAction = "EDIT"
        s.ModalTitle = "Edit This Record" 
        s.txtb_employment_type_val = s.datalistgrid[id_ss].employment_type
        s.txtb_empl_name           = s.datalistgrid[id_ss].employee_name  
        s.txtb_empl_id             = s.datalistgrid[id_ss].empl_id
        s.txtb_position            = s.datalistgrid[id_ss].position_title1
        
        h.post("../cBIRAnnualizedTax/CheckData", {
            par_payroll_year: $("#ddl_year option:selected").val()
            ,par_empType    : s.txtb_employment_type_val
            ,par_letter     : $("#ddl_letter option:selected").val()
            ,par_empl_id    : s.datalistgrid[id_ss].empl_id
            ,par_action     : s.isAction
        }).then(function (d) {


            if (d.data.message == "success")
            {
                $("#main_modal").modal("show")

               
                $("#edit_icon" + id_ss).removeClass("fa fa-spinner fa-spin");
                $("#edit_icon" + id_ss).addClass("fa fa-edit");
				var actual_counter = parseInt(d.data.sp_get_actual_tax_counter[0].actual_counter)
				if(actual_counter < 0) {
					actual_counter = 0
				}
					
                s.txtb_no_install 		   = actual_counter
                s.txtb_monthly_tax_due     = currency(s.datalistgrid[id_ss].monthly_tax_due)
                s.txtb_employment_type     = s.datalistgrid[id_ss].employmenttype_description
                s.txtb_monthly_tax_rate    = currency(s.datalistgrid[id_ss].tax_rate)
       
                s.txtb_add_txbl_inc_prst    = currency(s.datalistgrid[id_ss].addl_txbl_comp_prsnt)
       
                s.txtb_annual_tax_due       = currency(s.datalistgrid[id_ss].annual_tax_due)
                s.txtb_wheld_prst_emplyr    = currency(s.datalistgrid[id_ss].wtax_prsnt_emplyr)
                s.txtb_wheld_prev_emplyr    = currency(s.datalistgrid[id_ss].wtax_prev_emplyr)

                s.txtb_ntx_basic_sal_mwe    = currency(s.datalistgrid[id_ss].ntx_basic_salary)
                s.txtb_ntx_hol_pay_mwe      = currency(s.datalistgrid[id_ss].ntx_hol_pay_mwe)
                s.txtb_ntx_ot_pay_mwe       = currency(s.datalistgrid[id_ss].ntx_ot_pay_mwe)
                s.txtb_ntx_night_diff_mwe   = currency(s.datalistgrid[id_ss].ntx_night_diff_mwe)
                s.txtb_ntx_hzrd_pay_mwe     = currency(s.datalistgrid[id_ss].ntx_hzrd_pay_mwe)
                s.txtb_ntx_13th_month       = currency(s.datalistgrid[id_ss].ntx_13th_14th)
                s.txtb_ntx_deminimis        = currency(s.datalistgrid[id_ss].ntx_de_minimis)
                s.txtb_ntx_premiums         = currency(s.datalistgrid[id_ss].ntx_gsis_phic_hdmf)
                s.txtb_ntx_salaries_oth     = currency(s.datalistgrid[id_ss].ntx_salaries_oth)



                s.txtb_txbl_basic_sal       = currency(s.datalistgrid[id_ss].txbl_basic_salary)
                s.txtb_txbl_ra              = currency(s.datalistgrid[id_ss].txbl_representation)
                s.txtb_txbl_ta              = currency(s.datalistgrid[id_ss].txbl_transportation)
                s.txtb_txbl_cola            = currency(s.datalistgrid[id_ss].txbl_cola)
                s.txtb_txbl_fxd_hsng_allo   = currency(s.datalistgrid[id_ss].txbl_fh_allowance)
                s.txtb_txbl_othA            = currency(s.datalistgrid[id_ss].txbl_otherA)
                s.txtb_txbl_othB            = currency(s.datalistgrid[id_ss].txbl_otherB)


                s.txbl_sup_com              = currency(s.datalistgrid[id_ss].sup_commission)
                s.txtb_sup_proft_s          = currency(s.datalistgrid[id_ss].sup_prof_sharing)
                s.txtb_sup_dir_fee          = currency(s.datalistgrid[id_ss].sup_fi_drctr_fees)
                s.txtb_sup_13_oth           = currency(s.datalistgrid[id_ss].sup_13th_14th)
                s.txtb_sup_hzrd_pay         = currency(s.datalistgrid[id_ss].sup_hzrd_pay)
                s.txtb_sup_ot_pay           = currency(s.datalistgrid[id_ss].sup_ot_pay)
                s.txtb_sup_othA             = currency(s.datalistgrid[id_ss].sup_otherA)
                s.txtb_sup_othB             = currency(s.datalistgrid[id_ss].sup_otherB)
                $("#ddl_employer_type").val(s.datalistgrid[id_ss].employer_type)
                $("#ddl_subs_type").val(s.datalistgrid[id_ss].substituted)  
                s.txtb_foreign_add          = s.datalistgrid[id_ss].foreign_address
                s.txtb_stat_daily           = currency(s.datalistgrid[id_ss].stat_daily_rate)
                s.txtb_stat_monthly         = currency(s.datalistgrid[id_ss].stat_monthly_rate)
                //s.chk_min_wage              = s.datalistgrid[id_ss].min_wage_earner
                $("#ddl_wage_earner").val(s.datalistgrid[id_ss].min_wage_earner.toString().toUpperCase())
                s.txtb_tin_prev             = s.datalistgrid[id_ss].tin_employer_prev
                s.txtb_empl_name_prev       = s.datalistgrid[id_ss].employer_name_prev
                s.txtb_address_prev         = s.datalistgrid[id_ss].employer_add_prev
                s.txtb_zip_prev             = s.datalistgrid[id_ss].employer_zip_prev
                calculatetaxable()
                calculatenontaxable()
                calculatetaxable_supplementary()
                calculategrossincome()
                calculatecompincomepresent()
                calculategrosstxblincome()
                calculatetotaladjst()
                calculatetaxdiff()

            }

       else {
                swal("Unable to Update, Data has been deleted by other user/s!", { icon: "warning", });
                var tname = "oTable";

                var id = s[tname][0].id;
                ////var page = $("#" + id).DataTable().page.info().page

                s[tname].fnDeleteRow(index_update, null, true);
                s.datalistgrid = DataTable_data(tname)


                if (d.data.sp_annualtax_hdr_tbl_list != null) {
                    s.datalistgrid_raw = d.data.sp_annualtax_hdr_tbl_list
                    s.datalistgrid.push(d.data.sp_annualtax_hdr_tbl_list)
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


    s.btn_edit_action2 = function (id_ss) {

        $("#btn_save").removeClass("fa fa-spinner fa-spin");
        $("#btn_save").addClass("fa fa-save");

        $("#edit_icon" + id_ss).removeClass("fa fa-edit");
        $("#edit_icon" + id_ss).addClass("fa fa-spinner fa-spin");

        $("#btn_generate").hide()
        s.isShowNameSelect = false;
        s.isShowNameInput = true;
        s.ishowsave = true;
        index_update = id_ss
        clearentry()
        s.isAction = "EDIT"
        s.ModalTitle = "Edit This Record"
        s.txtb_employment_type_val = s.datalist_grid_checktaxes[id_ss].employment_type
        s.txtb_empl_name = s.datalist_grid_checktaxes[id_ss].employee_name
        s.txtb_empl_id = s.datalist_grid_checktaxes[id_ss].empl_id
        s.txtb_position = s.datalist_grid_checktaxes[id_ss].position_title1

        h.post("../cBIRAnnualizedTax/CheckData", {
              par_payroll_year: $("#ddl_year option:selected").val()
            , par_empType: s.txtb_employment_type_val
            , par_letter: $("#ddl_letter option:selected").val()
            , par_empl_id: s.datalist_grid_checktaxes[id_ss].empl_id
            , par_action: s.isAction
        }).then(function (d) {

            if (d.data.message == "success") {
                $("#main_modal").modal("show")


                $("#edit_icon" + id_ss).removeClass("fa fa-spinner fa-spin");
                $("#edit_icon" + id_ss).addClass("fa fa-edit");
                var actual_counter = parseInt(d.data.sp_get_actual_tax_counter[0].actual_counter)
                if (actual_counter < 0) {
                    actual_counter = 0
                }

                s.txtb_no_install = actual_counter
                s.txtb_monthly_tax_due = currency(s.datalist_grid_checktaxes[id_ss].monthly_tax_due)
                s.txtb_employment_type = s.datalist_grid_checktaxes[id_ss].employmenttype_description
                s.txtb_monthly_tax_rate = currency(s.datalist_grid_checktaxes[id_ss].tax_rate)

                s.txtb_add_txbl_inc_prst = currency(s.datalist_grid_checktaxes[id_ss].addl_txbl_comp_prsnt)

                s.txtb_annual_tax_due = currency(s.datalist_grid_checktaxes[id_ss].annual_tax_due)
                s.txtb_wheld_prst_emplyr = currency(s.datalist_grid_checktaxes[id_ss].wtax_prsnt_emplyr)
                s.txtb_wheld_prev_emplyr = currency(s.datalist_grid_checktaxes[id_ss].wtax_prev_emplyr)

                s.txtb_ntx_basic_sal_mwe = currency(s.datalist_grid_checktaxes[id_ss].ntx_basic_salary)
                s.txtb_ntx_hol_pay_mwe = currency(s.datalist_grid_checktaxes[id_ss].ntx_hol_pay_mwe)
                s.txtb_ntx_ot_pay_mwe = currency(s.datalist_grid_checktaxes[id_ss].ntx_ot_pay_mwe)
                s.txtb_ntx_night_diff_mwe = currency(s.datalist_grid_checktaxes[id_ss].ntx_night_diff_mwe)
                s.txtb_ntx_hzrd_pay_mwe = currency(s.datalist_grid_checktaxes[id_ss].ntx_hzrd_pay_mwe)
                s.txtb_ntx_13th_month = currency(s.datalist_grid_checktaxes[id_ss].ntx_13th_14th)
                s.txtb_ntx_deminimis = currency(s.datalist_grid_checktaxes[id_ss].ntx_de_minimis)
                s.txtb_ntx_premiums = currency(s.datalist_grid_checktaxes[id_ss].ntx_gsis_phic_hdmf)
                s.txtb_ntx_salaries_oth = currency(s.datalist_grid_checktaxes[id_ss].ntx_salaries_oth)



                s.txtb_txbl_basic_sal = currency(s.datalist_grid_checktaxes[id_ss].txbl_basic_salary)
                s.txtb_txbl_ra = currency(s.datalist_grid_checktaxes[id_ss].txbl_representation)
                s.txtb_txbl_ta = currency(s.datalist_grid_checktaxes[id_ss].txbl_transportation)
                s.txtb_txbl_cola = currency(s.datalist_grid_checktaxes[id_ss].txbl_cola)
                s.txtb_txbl_fxd_hsng_allo = currency(s.datalist_grid_checktaxes[id_ss].txbl_fh_allowance)
                s.txtb_txbl_othA = currency(s.datalist_grid_checktaxes[id_ss].txbl_otherA)
                s.txtb_txbl_othB = currency(s.datalist_grid_checktaxes[id_ss].txbl_otherB)


                s.txbl_sup_com = currency(s.datalist_grid_checktaxes[id_ss].sup_commission)
                s.txtb_sup_proft_s = currency(s.datalist_grid_checktaxes[id_ss].sup_prof_sharing)
                s.txtb_sup_dir_fee = currency(s.datalist_grid_checktaxes[id_ss].sup_fi_drctr_fees)
                s.txtb_sup_13_oth = currency(s.datalist_grid_checktaxes[id_ss].sup_13th_14th)
                s.txtb_sup_hzrd_pay = currency(s.datalist_grid_checktaxes[id_ss].sup_hzrd_pay)
                s.txtb_sup_ot_pay = currency(s.datalist_grid_checktaxes[id_ss].sup_ot_pay)
                s.txtb_sup_othA = currency(s.datalist_grid_checktaxes[id_ss].sup_otherA)
                s.txtb_sup_othB = currency(s.datalist_grid_checktaxes[id_ss].sup_otherB)
                $("#ddl_employer_type").val(s.datalist_grid_checktaxes[id_ss].employer_type)
                $("#ddl_subs_type").val(s.datalist_grid_checktaxes[id_ss].substituted)
                s.txtb_foreign_add = s.datalist_grid_checktaxes[id_ss].foreign_address
                s.txtb_stat_daily = currency(s.datalist_grid_checktaxes[id_ss].stat_daily_rate)
                s.txtb_stat_monthly = currency(s.datalist_grid_checktaxes[id_ss].stat_monthly_rate)
                //s.chk_min_wage              = s.datalistgrid[id_ss].min_wage_earner
                $("#ddl_wage_earner").val(s.datalist_grid_checktaxes[id_ss].min_wage_earner.toString().toUpperCase())
                s.txtb_tin_prev = s.datalist_grid_checktaxes[id_ss].tin_employer_prev
                s.txtb_empl_name_prev = s.datalist_grid_checktaxes[id_ss].employer_name_prev
                s.txtb_address_prev = s.datalist_grid_checktaxes[id_ss].employer_add_prev
                s.txtb_zip_prev = s.datalist_grid_checktaxes[id_ss].employer_zip_prev
                calculatetaxable()
                calculatenontaxable()
                calculatetaxable_supplementary()
                calculategrossincome()
                calculatecompincomepresent()
                calculategrosstxblincome()
                calculatetotaladjst()
                calculatetaxdiff()

            }

            else {
                swal("Unable to Update, Data has been deleted by other user/s!", { icon: "warning", });
                var tname = "oTable_checktaxes";

                var id = s[tname][0].id;
                ////var page = $("#" + id).DataTable().page.info().page

                s[tname].fnDeleteRow(index_update, null, true);
                s.datalist_grid_checktaxes = DataTable_data(tname)


                if (d.data.sp_annualtax_hdr_tbl_list != null) {
                    s.datalist_grid_checktaxes.push(d.data.sp_annualtax_hdr_tbl_list)
                    s.oTable_checktaxes.fnClearTable();
                    s.oTable_checktaxes.fnAddData(s.datalist_grid_checktaxes)
                }

                else {
                    s.oTable_checktaxes.fnClearTable();
                    s.oTable_checktaxes.fnAddData(s.datalist_grid_checktaxes)
                }

                $("#main_modal").modal("hide")


            }
        })

    }

    //////this fucntion is called after refreshTable to return to the current dataTable page
    //function changePage(tname, page, id) {
    //    var npage = page
    //    var pageLen = $("#" + id).DataTable().page.info().length
    //    if (page < 2 && pageLen == 0) {
    //        npage = page + 1
    //    }
    //    else if (page > 1 && pageLen == 0) {
    //        npage = page - 1
    //    }

    //    if (npage != 0) {
    //        s[tname].fnPageChange(npage)
    //    }
    //}


    //String.prototype.get_page = function (table) {
    //    id = this;
    //    var nakit_an = false;
    //    var rowx = 0;
    //    var el_id = s[table][0].id
    //    $("#" + el_id + " tr").each(function () {
    //        $.each(this.cells, function (cells) {
    //            if (cells == 0) {
    //                if ($(this).text() == id) {
    //                    nakit_an = true;
    //                    return false;
    //                }
    //            }
    //        });
    //        if (nakit_an) {
    //            $(this).addClass("selected");
    //            return false;
    //        }
    //        rowx++;
    //    });
    //    return nakit_an;
    //}

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
    s.btn_delete_action = function (id_ss)
    {
        s.isAction = "DELETE"
        var tname = "oTable"
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete)
        {
            if (willDelete) {

                $("#delete_icon" + id_ss).removeClass("fa fa-trash");
                $("#delete_icon" + id_ss).addClass("fa fa-spinner fa-spin");

                h.post("../cBIRAnnualizedTax/CheckData", {
                    par_payroll_year: $("#ddl_year option:selected").val()
                    ,par_empType    : s.datalistgrid[id_ss].employment_type
                    ,par_letter     : $("#ddl_letter option:selected").val()
                    ,par_empl_id    : s.datalistgrid[id_ss].empl_id
                    ,par_action     : s.isAction
                }).then(function (d)
                {
                    if (d.data.message == "success") {

                        $("#delete_icon" + id_ss).removeClass("fa fa-spinner fa-spin");
                        $("#delete_icon" + id_ss).addClass("fa fa-trash");

                        h.post("../cBIRAnnualizedTax/DeleteFromDatabase", {
                            par_empl_id: s.datalistgrid[id_ss].empl_id
                            ,par_payroll_year: $("#ddl_year option:selected").val()
                        }).then(function (d) {

                            if (d.data.message = "success") {
                                var id = s[tname][0].id;
                                var page = $("#" + id).DataTable().page.info().page
                                s[tname].fnDeleteRow(id_ss, null, true);
                                s.datalistgrid = DataTable_data(tname)

                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid)
                                //s.oTable.refreshTable("oTable", "")
                                changePage(tname, page, id)

                                swal("Your record has been deleted successfully!", { icon: "success", });
                            }


                        })
                    }

                    else
                    {
                        swal("Unable to Delete, Data has been deleted by other user/s!", { icon: "warning", });
                        

                        var id = s[tname][0].id;
                        ////var page = $("#" + id).DataTable().page.info().page

                        s[tname].fnDeleteRow(id_ss, null, true);
                        s.datalistgrid = DataTable_data(tname)


                        if (d.data.sp_annualtax_hdr_tbl_list != null) {
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
            
        })
    }

    //******************************************//
    //***CALCULATE GROSS TAXABLE INCOME     ***//
    //******************************************// 
    function calculatetotaladjst() {
        var total_adjst = 0;
        total_adjst =
            parseFloat(s.txtb_wheld_prst_emplyr.replace(/,/g, ''))
        + parseFloat(s.txtb_wheld_prev_emplyr.replace(/,/g, ''))

        s.txtb_wheld_total = currency(total_adjst).toString()

    }

    //******************************************//
    //***CALCULATE GROSS TAXABLE INCOME     ***//
    //******************************************// 
    function calculategrosstxblincome() {
        var gross_txb_inc = 0;
            gross_txb_inc =
                parseFloat(s.txtb_txbl_inc_prst.replace(/,/g, ''))
            + parseFloat(s.txtb_add_txbl_inc_prst.replace(/,/g, ''))

        s.txtb_gross_txbl_inc = currency(gross_txb_inc).toString()

    }

    //******************************************//
    //***CALCULATE COMPENSATION INCOME PRESENT***//
    //******************************************// 
    function calculatecompincomepresent()
    {
        var txbl_comp_inc_pres = 0;
        txbl_comp_inc_pres =
            parseFloat(s.txtb_gross_inc_prst.replace(/,/g, ''))
        - parseFloat(s.txtb_non_tax_exmpt.replace(/,/g, ''))

        s.txtb_txbl_inc_prst = currency(txbl_comp_inc_pres).toString()
    }

    //******************************************//
    //***CALCULATE COMPENSATION INCOME PRESENT***//
    //******************************************// 
    function calculatetaxdiff() {
        var tax_diff = 0;
        tax_diff =
            parseFloat(s.txtb_annual_tax_due.replace(/,/g, ''))
        - (parseFloat(s.txtb_wheld_prst_emplyr.replace(/,/g, '')) + parseFloat(s.txtb_wheld_prev_emplyr.replace(/,/g, '')))

        s.txtb_cal_tax_payable = currency(tax_diff).toString()
    }

    //******************************************//
    //***CALCULATE NON TAXABLE***//
    //******************************************// 

    function calculategrossincome()
    {
        var total_gross = 0;

        total_gross = 
          parseFloat(s.txtb_ntx_total.replace(/,/g, ''))
        + parseFloat(s.txtb_txbl_total.replace(/,/g, ''))
        + parseFloat(s.txtb_sup_total.replace(/,/g, ''))

        s.txtb_gross_inc_prst = currency(total_gross).toString()
    }

    //******************************************//
    //***CALCULATE NON TAXABLE***//
    //******************************************// 

    function calculatenontaxable()
    {
        var total_nontax = 0;

        total_nontax = parseFloat(s.txtb_ntx_basic_sal_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_hol_pay_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_ot_pay_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_night_diff_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_hzrd_pay_mwe.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_13th_month.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_deminimis.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_premiums.replace(/,/g, ''))
            + parseFloat(s.txtb_ntx_salaries_oth.replace(/,/g, ''))  
        
        s.txtb_ntx_total = currency(total_nontax).toString()
        s.txtb_non_tax_exmpt = currency(total_nontax).toString()
    }

    //******************************************//
    //***CALCULATE TAXABLE***//
    //******************************************// 

    function calculatetaxable()
    {
        var total_taxable = 0;

        total_taxable = parseFloat(s.txtb_txbl_basic_sal.replace(/,/g, ''))  
            + parseFloat(s.txtb_txbl_ra.replace(/,/g, ''))  
            + parseFloat(s.txtb_txbl_ta.replace(/,/g, ''))  
            + parseFloat(s.txtb_txbl_cola.replace(/,/g, ''))  
            + parseFloat(s.txtb_txbl_fxd_hsng_allo.replace(/,/g, ''))  
            + parseFloat(s.txtb_txbl_othA.replace(/,/g, ''))  
            + parseFloat(s.txtb_txbl_othB.replace(/,/g, ''))    

        s.txtb_txbl_total = currency(total_taxable).toString()
    }

    function calculatetaxable_supplementary() {
        var total_taxable_sup = 0;

        total_taxable_sup = parseFloat(s.txbl_sup_com.replace(/,/g, ''))  
            + parseFloat(s.txtb_sup_proft_s.replace(/,/g, ''))  
            + parseFloat(s.txtb_sup_dir_fee.replace(/,/g, ''))  
            + parseFloat(s.txtb_sup_13_oth.replace(/,/g, ''))  
            + parseFloat(s.txtb_sup_hzrd_pay.replace(/,/g, ''))  
            + parseFloat(s.txtb_sup_ot_pay.replace(/,/g, ''))  
            + parseFloat(s.txtb_sup_othA.replace(/,/g, ''))  
            + parseFloat(s.txtb_sup_othB.replace(/,/g, ''))         

        s.txtb_sup_total = currency(total_taxable_sup).toString()
    }

    s.btn_add_action = function ()
    {
        clearentry()
        s.isShowNameSelect = true;
        s.isShowNameInput = false;
        s.ishowsave = false;
       $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        s.ModalTitle = "Add New Record"
        s.isAction = "ADD"
        $("#btn_generate").hide()

        $("#btn_add_icon").removeClass("fa fa-plus-circle");
        $("#btn_add_icon").addClass("fa fa-spinner fa-spin");

        h.post("../cBIRAnnualizedTax/RetrieveEmployeeList",
            {
                par_empType: $("#ddl_employment_type option:selected").val(),
                par_payroll_year: $("#ddl_year option:selected").val()
            }).then(function (d) {
                
                if (d.data.message == "success")
                {
                    if (d.data.sp_personnelnames_annualtax_hdr_combolist.length > 0) {
                        s.employeenames = d.data.sp_personnelnames_annualtax_hdr_combolist
                    }

                    else
                    {
                        s.employeenames = null;
                    }
                    
                }
                $("#loading_data").modal("hide")
                $("#main_modal").modal("show")
                $("#btn_add_icon").removeClass("fa fa-spinner fa-spin");
                $("#btn_add_icon").addClass("fa fa-plus-circle");

            })

        
    }

    //s.btn_extract_action = function (extract_type)
    //{

    //    //$("#btn_extract_icon").removeClass("fa fa-file-excel-o");
    //    //$("#btn_extract_icon").addClass("fa fa-spinner fa-spin");
    //   $("#loading_data").modal({ keyboard: false, backdrop: "static" })
    
    //    h.post("../cBIRAnnualizedTax/ExtractData",
    //        {
    //            par_empType: $("#ddl_employment_type option:selected").val(),
    //            par_payroll_year: $("#ddl_year option:selected").val(),
    //            par_extract_type: extract_type
    //        }).then(function (d) {

    //            if (d.data.message == "success") {
    //                window.open(d.data.filePath, '', '');
    //                $("#loading_data").modal("hide")
    //                //$("#btn_extract_icon").removeClass("fa fa-spinner fa-spin");
    //                //$("#btn_extract_icon").addClass("fa fa-file-excel-o");
    //            }

    //            else {

    //                console.log(d.data.index_error)
    //                //$("#btn_extract_icon").removeClass("fa fa-spinner fa-spin");
    //                //$("#btn_extract_icon").addClass("fa fa-file-excel-o");
    //                $("#loading_data").modal("hide")
    //                swal({
    //                    title: "Not Data Found!",
    //                    text: "No Data Found!",
    //                    icon: "warning",
    //                    buttons: true,
    //                    dangerMode: true,
    //                })
    //            }
               
                
    //        })

     
    //}

    s.btn_extract_action = function (extract_type) {

        //$("#btn_extract_icon").removeClass("fa fa-file-excel-o");
        //$("#btn_extract_icon").addClass("fa fa-spinner fa-spin");
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        //$("#extracting_data").modal("show");

        h.post("../Menu/GetToken")
            .then(function (d) {
                var token = { token: d.data.token }
                h.post(s.excelExportServer+"/api/remittance/verify-token", token, { responseType: 'arraybuffer' }

                )
                    .then(function (response) {
                        if (response.data) {

                            h.post("../cBIRAnnualizedTax/ExtractDataToPHP",
                                {
                                    par_empType: $("#ddl_employment_type option:selected").val(),
                                    par_payroll_year: $("#ddl_year option:selected").val(),
                                    par_extract_type: extract_type
                                })
                                .then(function (d) {

                                    var empType      =  $("#ddl_employment_type option:selected").val()
                                    var payroll_year =  $("#ddl_year option:selected").val()

                                    if (extract_type == 'H') {
                                        var sp_extract_annualized_tax = d.data.sp_extract_annualized_tax

                                        h.post(s.excelExportServer + "/api/export/hris-extract", {
                                            data: sp_extract_annualized_tax
                                        }, { responseType: 'arraybuffer' }
                                        ).then(function (response2) {
                                            if (response2.data) {
                                                const csvBlob = new Blob([response2.data], { type: 'text/csv;charset=utf-8;' });
                                                const downloadUrl = window.URL.createObjectURL(csvBlob);
                                                console.log(downloadUrl)
                                                const link = document.createElement('a');
                                                link.href = downloadUrl;
                                                const name = "HRIS-Extract-" + payroll_year + "-" + empType + ".xlsx"
                                                link.setAttribute('download', name);
                                                console.log(link)
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(downloadUrl);
                                                $("#loading_data").modal("hide")
                                            } else {
                                                console.error('The response data is empty or undefined.');
                                                $("#loading_data").modal("hide")
                                            }
                                        }).catch(function (error) {
                                            console.error('There was a problem with the POST request:', error);
                                            $("#loading_data").modal("hide")
                                        });
                                    }
                                    else {

                                        var sp_extract_annualized_tax = d.data.sp_extract_annualized_tax

                                        h.post(s.excelExportServer + "/api/export/bir-extract", {
                                            data: sp_extract_annualized_tax
                                        }, { responseType: 'arraybuffer' }
                                        ).then(function (response2) {
                                            if (response2.data) {
                                                console.log(response2.data)
                                                const csvBlob = new Blob([response2.data], { type: 'text/csv;charset=utf-8;' });
                                                const downloadUrl = window.URL.createObjectURL(csvBlob);
                                                console.log(downloadUrl)
                                                const link = document.createElement('a');
                                                link.href = downloadUrl;
                                                const name = "BIR-Extract-" + payroll_year + "-" + empType + ".xlsx"
                                                link.setAttribute('download', name);
                                                console.log(link)
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(downloadUrl);
                                                $("#loading_data").modal("hide")
                                            } else {
                                                console.error('The response data is empty or undefined.');
                                                $("#loading_data").modal("hide")
                                            }
                                        }).catch(function (error) {
                                            console.error('There was a problem with the POST request:', error);
                                            $("#loading_data").modal("hide")
                                        });
                                    }

                                })
                        }

                    }).catch(function (error, response) {
                        swal("Token expired! please generate new token.", { icon: "error" })
                        console.error('Token expired! please generate new token :', error);
                        $("#loading_data").modal("hide")
                    });



            })
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
        
        if ($("#ddl_employee_name option:selected").val() == "" && s.isAction == "ADD")
        {
            FieldValidationColorChanged(true, "ddl_employee_name")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_add_txbl_inc_prst").val())))
        {
            
            $('.nav-tabs a[href="#tab-1"]').tab('show');
            FieldValidationColorChanged(true, "txtb_add_txbl_inc_prst_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_add_txbl_inc_prst").val().trim() == "")
        {
            $('.nav-tabs a[href="#tab-1"]').tab('show');
            FieldValidationColorChanged(true, "txtb_add_txbl_inc_prst")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_wheld_prev_emplyr").val().trim() == "") {
            $('.nav-tabs a[href="#tab-1"]').tab('show');
            FieldValidationColorChanged(true, "txtb_wheld_prev_emplyr")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_wheld_prev_emplyr").val()))) {
            $('.nav-tabs a[href="#tab-1"]').tab('show');
            FieldValidationColorChanged(true, "txtb_wheld_prev_emplyr_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_ntx_basic_sal_mwe").val().trim() == "") {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_basic_sal_mwe")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_ntx_basic_sal_mwe").val()))) {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_basic_sal_mwe_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_ntx_hol_pay_mwe").val().trim() == "")
        {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_hol_pay_mwe")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_ntx_hol_pay_mwe").val())))
        {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_hol_pay_mwe_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_ntx_ot_pay_mwe").val().trim() == "") {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_ot_pay_mwe")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_ntx_ot_pay_mwe").val()))) {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_ot_pay_mwe_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_ntx_night_diff_mwe").val().trim() == "") {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_night_diff_mwe")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_ntx_night_diff_mwe").val()))) {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_night_diff_mwe_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_ntx_hzrd_pay_mwe").val().trim() == "") {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_hzrd_pay_mwe")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_ntx_hzrd_pay_mwe").val()))) {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            FieldValidationColorChanged(true, "txtb_ntx_hzrd_pay_mwe_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_txbl_ra").val().trim() == "")
        {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_ra")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_txbl_ra").val()))) {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_ra_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }
        

        if ($("#txtb_txbl_ta").val().trim() == "")
        {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_ta")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_txbl_ta").val()))) {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_ta_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_txbl_cola").val().trim() == "") {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_cola")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_txbl_cola").val()))) {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_cola_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_txbl_fxd_hsng_allo").val().trim() == "") {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_fxd_hsng_allo")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_txbl_fxd_hsng_allo").val()))) {
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            FieldValidationColorChanged(true, "txtb_txbl_fxd_hsng_allo_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txbl_sup_com").val().trim() == "") {
            $('.nav-tabs a[href="#tab-4"]').tab('show');
            FieldValidationColorChanged(true, "txbl_sup_com")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txbl_sup_com").val()))) {
            $('.nav-tabs a[href="#tab-4"]').tab('show');
            FieldValidationColorChanged(true, "txbl_sup_com_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_sup_proft_s").val().trim() == "") {
            $('.nav-tabs a[href="#tab-4"]').tab('show');
            FieldValidationColorChanged(true, "txtb_sup_proft_s")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_sup_proft_s").val()))) {
            $('.nav-tabs a[href="#tab-4"]').tab('show');
            FieldValidationColorChanged(true, "txtb_sup_proft_s_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_sup_dir_fee").val().trim() == "") {
            $('.nav-tabs a[href="#tab-4"]').tab('show');
            FieldValidationColorChanged(true, "txtb_sup_dir_fee")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_sup_dir_fee").val()))) {
            $('.nav-tabs a[href="#tab-4"]').tab('show');
            FieldValidationColorChanged(true, "txtb_sup_dir_fee_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_stat_daily").val().trim() == "") {
            $('.nav-tabs a[href="#tab-5"]').tab('show');
            FieldValidationColorChanged(true, "txtb_stat_daily")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_stat_daily").val()))) {
            $('.nav-tabs a[href="#tab-5"]').tab('show');
            FieldValidationColorChanged(true, "txtb_stat_daily_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if ($("#txtb_stat_monthly").val().trim() == "") {
            $('.nav-tabs a[href="#tab-5"]').tab('show');
            FieldValidationColorChanged(true, "txtb_stat_monthly")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }

        if (isNaN(validatenumber($("#txtb_stat_monthly").val()))) {
            $('.nav-tabs a[href="#tab-5"]').tab('show');
            FieldValidationColorChanged(true, "txtb_stat_monthly_numeric")
            validatedSaved = false;
            $("#btn_save").removeClass("fa fa-spinner fa-spin");
            $("#btn_save").addClass("fa fa-save");
        }
        
        return validatedSaved;

    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName)
    {

        if (pMode)
        {

                    if (pObjectName == "txtb_add_txbl_inc_prst_numeric")
                    {
                        $("#txtb_add_txbl_inc_prst").addClass("required");
                        $("#lbl_txtb_add_txbl_inc_prst_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_wheld_prev_emplyr_numeric")
                    {
                        $("#txtb_wheld_prev_emplyr").addClass("required");
                        $("#lbl_txtb_wheld_prev_emplyr_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_ntx_basic_sal_mwe_numeric")
                    {
                        $("#txtb_ntx_basic_sal_mwe").addClass("required");
                        $("#lbl_txtb_ntx_basic_sal_mwe_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_ntx_hol_pay_mwe_numeric")
                    {
                        $("#txtb_ntx_hol_pay_mwe").addClass("required");
                        $("#lbl_txtb_ntx_hol_pay_mwe_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_ntx_ot_pay_mwe_numeric") {
                        $("#txtb_ntx_ot_pay_mwe").addClass("required");
                        $("#lbl_txtb_ntx_ot_pay_mwe_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_ntx_night_diff_mwe_numeric") {
                        $("#txtb_ntx_night_diff_mwe").addClass("required");
                        $("#lbl_txtb_ntx_night_diff_mwe_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_ntx_hzrd_pay_mwe_numeric") {
                        $("#txtb_ntx_hzrd_pay_mwe").addClass("required");
                        $("#lbl_txtb_ntx_hzrd_pay_mwe_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_txbl_ra_numeric") {
                        $("#txtb_txbl_ra").addClass("required");
                        $("#lbl_txtb_txbl_ra_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_txbl_ta_numeric") {
                        $("#txtb_txbl_ta").addClass("required");
                        $("#lbl_txtb_txbl_ta_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_txbl_cola_numeric") {
                        $("#txtb_txbl_cola").addClass("required");
                        $("#lbl_txtb_txbl_cola_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_txbl_fxd_hsng_allo_numeric") {
                        $("#txtb_txbl_fxd_hsng_allo").addClass("required");
                        $("#lbl_txtb_txbl_fxd_hsng_allo_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txbl_sup_com_numeric") {
                        $("#txbl_sup_com").addClass("required");
                        $("#lbl_txbl_sup_com_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_sup_proft_s_numeric") {
                        $("#txtb_sup_proft_s").addClass("required");
                        $("#lbl_txtb_sup_proft_s_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_sup_dir_fee_numeric") {
                        $("#txtb_sup_dir_fee").addClass("required");
                        $("#lbl_txtb_sup_dir_fee_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_stat_daily_numeric") {
                        $("#txtb_stat_daily").addClass("required");
                        $("#lbl_txtb_stat_daily_req").text("Numeric Values Only!");
                    }

                    if (pObjectName == "txtb_stat_monthly_numeric") {
                        $("#txtb_stat_monthly").addClass("required");
                        $("#lbl_txtb_stat_monthly_req").text("Numeric Values Only!");
                    }
        

                    else
                    {
                        $("#" + pObjectName).addClass("required");
                        $("#lbl_" + pObjectName + "_req").text("Required Field!");
                    }

                

         }
        else if (!pMode)
        {
            switch (pObjectName)
            {

                case "ALL":
                    {
                        $("#txtb_add_txbl_inc_prst").removeClass("required");
                        $("#lbl_txtb_add_txbl_inc_prst_req").text("");
                        $("#ddl_employee_name").removeClass("required");
                        $("#lbl_ddl_employee_name_req").text("");
                        $("#txtb_wheld_prev_emplyr").removeClass("required");
                        $("#lbl_txtb_wheld_prev_emplyr_req").text("");
                        $("#txtb_ntx_hol_pay_mwe").removeClass("required");
                        $("#lbl_txtb_ntx_hol_pay_mwe_req").text("");
                        $("#txtb_ntx_basic_sal_mwe").removeClass("required");
                        $("#lbl_txtb_ntx_basic_sal_mwe_req").text("");
                        $("#txtb_ntx_ot_pay_mwe").removeClass("required");
                        $("#lbl_txtb_ntx_ot_pay_mwe_req").text("");
                        $("#txtb_ntx_night_diff_mwe").removeClass("required");
                        $("#lbl_txtb_ntx_night_diff_mwe_req").text("");
                        $("#txtb_ntx_hzrd_pay_mwe").removeClass("required");
                        $("#lbl_txtb_ntx_hzrd_pay_mwe_req").text("");
                        $("#txtb_txbl_ra").removeClass("required");
                        $("#lbl_txtb_txbl_ra_req").text("");
                        $("#txtb_txbl_ta").removeClass("required");
                        $("#lbl_txtb_txbl_ta_req").text("");
                        $("#txtb_txbl_cola").removeClass("required");
                        $("#lbl_txtb_txbl_cola_req").text("");
                        $("#txtb_txbl_fxd_hsng_allo").removeClass("required");
                        $("#lbl_txtb_txbl_fxd_hsng_allo_req").text("");
                        $("#txbl_sup_com").removeClass("required");
                        $("#lbl_txbl_sup_com_req").text("");
                        $("#txtb_sup_proft_s").removeClass("required");
                        $("#lbl_txtb_sup_proft_s_req").text("");
                        $("#txtb_sup_dir_fee").removeClass("required");
                        $("#lbl_txtb_sup_dir_fee_req").text("");
                        $("#txtb_stat_daily").removeClass("required");
                        $("#lbl_txtb_stat_daily_req").text("");
                        $("#txtb_stat_monthly").removeClass("required");
                        $("#lbl_txtb_stat_monthly_req").text("");
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
        //$("#modal_print").modal("show")
     
        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = "~/Reports/cryBIR2316/cryBIR2316.rpt"
        var sp = "sp_annualtax_hdr_tbl_rep"
        var parameters = "p_payroll_year," + $("#ddl_year option:selected").val() + ",p_empl_id," + s.datalistgrid[id_ss].empl_id

        h.post("../cBIRAnnualizedTax/PreviousValuesonPage_cBIRAnnualizedTax",
            {
                par_year: $("#ddl_year option:selected").val()
                ,par_tax_due: s.datalistgrid[id_ss].monthly_tax_due
                ,par_tax_rate: s.datalistgrid[id_ss].tax_rate
                ,par_empl_id: s.datalistgrid[id_ss].empl_id
                ,par_emp_type: $("#ddl_employment_type option:selected").val()
                ,par_emp_type_descr: s.datalistgrid[id_ss].employmenttype_description
                ,par_letter: $("#ddl_letter option:selected").val()
                ,par_show_entries: $("#ddl_show_entries option:selected").val()
                ,par_page_nbr: info.page
                ,par_search: s.search_box
                ,par_sort_value: sort_value
                ,par_sort_order: sort_order
                ,par_position: s.datalistgrid[id_ss].position_title1
            }).then(function (d) {

                h.post("../cBIRAnnualizedTax/ReportCount",
                    {
                        par_payroll_year: $("#ddl_year option:selected").val(),
                        par_empl_id: s.datalistgrid[id_ss].empl_id
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

               
            })





    }

  

    

    
    


    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })

    }

    function validatenumber(value) {
        var value = value.split(",").join("")
        return value
    }
    

    s.search_in_list = function (value, table)
    {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }



    //***************************Functions end*********************************************************//

})

