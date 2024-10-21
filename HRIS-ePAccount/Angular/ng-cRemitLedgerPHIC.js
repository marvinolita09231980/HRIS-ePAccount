// **********************************************************
// Page Name    : Remittance Details (PHIC)
// Purpose      : Angular for Remittance Details (PHIC)
// Created By   : Vincent Jade Alivio
// Created Date : October 10, 2019
// Updated Date : -- -- ---
// **********************************************************
ng_HRD_App.controller("cRemitLedgerPHIC_ctrlr", function ($scope, $compile, $http, $filter) {

    var s = $scope
    var h = $http
    s.year = []
    var userid = "";
    var index_update = ""; 
    s.allow_edit = true

    s.oTable = null;
    s.datalistgrid = null
    s.rowLen = "10"
    s.remittance_status = ''
    var excelExportServer = ""
    //*************************************//
    //***********Function-For-Initialization************//
    //*************************************// 
    function init() {
        s.ddl_department = ""
        s.ddl_lastname_starts = "A"
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cRemitLedgerPHIC/InitializeData", { ltr: s.ddl_lastname_starts }).then(function (d)
        {
            // STATUS DESCRIPTION
            // N = 'Not Remitted'
            // R = 'Remitted'
            // P = 'Partially Remitted' 

            excelExportServer = d.data.excelExportServer

            RemittanceStatus(d.data.remittance_status)
            s.remittance_status = d.data.remittance_status

            s.lst_department            = d.data.sp_departments_tbl_list
            s.txtb_remittance_year      = d.data.prevValues[0].toString().trim()
            s.txtb_remittance_month     = d.data.prevValues[2].toString().trim()
            s.txtb_employment_type      = d.data.prevValues[4].toString().trim()
            s.txtb_remittance_ctrl_nbr  = d.data.prevValues[7].toString().trim()
            s.lbl_remittancetype_descr  = d.data.prevValues[6].toString().trim()
            s.lbl_remittance_descr      = d.data.prevValues[6].toString().trim()
            s.txtb_remittance_status = d.data.prevValues[9].toString().trim()

            s.txtb_remittance_month_code = d.data.prevValues[1].toString().trim()

            s.txtb_remittance_year_upload       = d.data.prevValues[0].toString().trim()
            s.txtb_remittance_month_upload      = d.data.prevValues[2].toString().trim()
            s.txtb_employment_type_upload       = d.data.prevValues[4].toString().trim()
            s.txtb_remittance_ctrl_nbr_upload   = d.data.prevValues[7].toString().trim()
            s.lbl_remittancetype_descr_upload   = d.data.prevValues[6].toString().trim()
            s.lbl_remittance_descr_upload       = d.data.prevValues[6].toString().trim()
            s.txtb_remittance_status_upload     = d.data.prevValues[9].toString().trim()
            s.empl_type = d.data.prevValues[4].toString().trim()

            if (d.data.prevValues[3].toString().trim() == "JO") {
                s.check_employment_RECE = false
                s.check_employment_RECE = false
                s.check_employment_RECE = false
                s.check_employment_RECE = false
                s.check_employment_RECE = false
                s.check_employment_RECE = false
                s.check_employment_JO   = true
                
            }
            else {

                s.check_employment_RECE = true
                s.check_employment_RECE = true
                s.check_employment_RECE = true
                s.check_employment_RECE = true
                s.check_employment_RECE = true
                s.check_employment_RECE = true
                s.check_employment_JO   = false
            }
            // [0]  - par_remittance_year
            // [1]  - par_remittance_month
            // [2]  - par_remittance_month_descr
            // [3]  - par_employment_type
            // [4]  - par_employment_type_descr
            // [5]  - par_remittancetype_code
            // [6]  - par_remittancetype_code_descr
            // [7]  - par_remittance_ctrl_nbr
            // [8]  - par_remittance_status
            // [9]  - par_remittance_status_descr
            // [10] - par_show_entries
            // [11] - par_page_nbr
            // [12] - par_search
            
            init_table_data([]);
           
            if (d.data.sp_remittance_dtl_phic_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_remittance_dtl_phic_tbl_list;
                s.oTable.fnAddData(d.data.sp_remittance_dtl_phic_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
            }
                $("#loading_data").modal("hide");

        });
        
    }
    init()
    function RemittanceStatus(n) {

        switch (n.toString().trim()) {
            case "N":
                s.remit_status_class = "text-warning"
                s.txtb_remittance_status = "NOT REMITTED"
                break;
            case "P":
                s.remit_status_class = "text-danger"
                s.txtb_remittance_status = "PARTIALLY REMITTED"
                break;
            case "R":
                s.remit_status_class = "text-success"
                s.txtb_remittance_status = "REMITTED"
                break;
        }
    }
    //*************************************//
    //***********Initialize Page************//
    //*************************************// 
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;

        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                "order": [[2, "asc"]],
                columns: [
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "voucher_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>"+ data + "</span>" } },
                    { "mData": "employee_name", "mRender": function (data, type, full, row) { return "&nbsp;&nbsp;&nbsp;" + data  } },
                    
                    {
                        "mData": "grid_amount_ps",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)

                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "grid_amount_gs",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)

                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_month", "mRender": function (data, type, full, row) {
                            var dateM = new Date(data + "/1/2019");
                            return "<span class='text-center btn-block'>" + dateM.toLocaleString('en-us', { month: 'long' }) + "</span>"
                        }
                    },
                    { "mData": "payroll_year", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            var isDisabled = false

                            if (s.remittance_status != "N") {
                                isDisabled = true
                            }

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" >  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-disabled="' + isDisabled +'" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
        s.oTable.fnPageChange(2,true);
        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }
    //*************************************//
    //***********Open-Add-Modal************//
    //*************************************// 
    s.btn_add_modal = function () {
        $("#btn_add").removeClass("fa fa-plus-circle");
        $("#btn_add").addClass("fa fa-spinner fa-spin");
        clearentry()
       
        h.post("../cRemitLedgerPHIC/RetrieveVoucherNbr").then(function (d)
        {
           
            s.lst_voucher = d.data.sp_voucher_not_in_remittance
            show_date()
            s.showemployee = true;
            s.ishow = true
            s.showvoucher_nbr = true;
            s.disable_edit = true;
            s.ModalTitle = "Add New Record"
            s.ishow_update = false;
            s.disable_edit_ps = false;
            s.disable_u_edit_ps = false;
            // Status Details Description
            // A - In Uploaded and In Remittance
            // U - Not in Uploaded but in Remittance
            // N - New Remittance 

            //$("#ddl_remittance_status").val() = "3";
           
            $("#btn_add").removeClass("fa fa-spinner fa-spin");
            $("#btn_add").addClass("fa fa-plus-circle");
            $("#main_modal").modal({ keyboard: false, backdrop: "static" })
        })
    }
    
    //************************************//
    //***Save-Job-Description-Function****//
    //************************************// 
    s.btn_save_add = function () {
        if (isdataValidated()) {

            var data =
            {
                remittance_ctrl_nbr  : s.txtb_remittance_ctrl_nbr
                ,empl_id             : s.txtb_empl_id
                ,voucher_nbr         : s.txtb_voucher_nbr
                ,payroll_amount_gs   : s.txtb_payroll_amount_gs
                ,payroll_amount_ps   : s.txtb_payroll_amount_ps
                ,uploaded_amount_gs  : s.txtb_uploaded_amount_gs
                ,uploaded_amount_ps  : s.txtb_uploaded_amount_ps
                ,override_amount_gs  : s.txtb_override_amount_gs
                ,override_amount_ps  : s.txtb_override_amount_ps
                ,remittance_status   : $("#ddl_remittance_status").val()
                ,grid_amount_gs      : s.txtb_payroll_amount_gs
                ,grid_amount_ps      : s.txtb_payroll_amount_ps
                ,payroll_registry_nbr: s.txtb_registry_nbr
            }

            $('#saving_icon').removeClass("fa fa-save");
            $('#saving_icon').addClass("fa fa-spinner fa-spin");
            h.post("../cRemitLedgerPHIC/SaveFromDatabase",{ data : data}).then(function (d) {
                if (d.data.message == "success")
                {
                        // 1 - Active
                        // 2 - No Earnings
                        // 3 - New Remittance   
                        
                        data.employee_name      = $("#ddl_employee_name option:selected").html();
                        data.phic_nbr = s.txtb_phic_nbr;
                        data.payroll_year = s.txtb_payroll_year
                        data.payroll_month = s.txtb_payroll_month
                        data.payroll_registry_descr = s.payroll_registry_descr;
                        s.datalistgrid.push(data)   
                        s.datalistgrid.refreshTable("oTable", s.txtb_empl_id.trim())
                        $('#main_modal').modal("hide");
                    swal("Your record has been saved!", { icon: "success", });

                    $('#saving_icon').removeClass("fa fa-spinner fa-spin");
                    $('#saving_icon').addClass("fa fa-save");
                }
                else
                {
                    swal("Saving error!", "Data not save", "error");
                }
            })
        }
    }
    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function clearentry()
    {
        s.txtb_payroll_amount_gs    = "0.00"
        s.txtb_payroll_amount_ps    = "0.00"
        s.txtb_uploaded_amount_gs   = "0.00"
        s.txtb_uploaded_amount_ps   = "0.00"
        s.txtb_override_amount_gs   = "0.00"
        s.txtb_override_amount_ps   = "0.00"
        s.txtb_empl_id              = ""
        s.txtb_phic_nbr             = ""
        s.txtb_voucher_nbr          = ""
        s.txtb_registry_nbr         = ""
        s.txtb_payroll_year         = ""
        s.txtb_payroll_month        = ""
        s.txtb_payroll_year = ""
        s.txtb_payroll_month_word = ""
        s.txtb_payroll_month = ""
        s.txtb_payroll_month = ""
        s.ddl_employee_name = ""
        s.ddl_voucher_nbr = ""
        $("#ddl_remittance_status").val("")

        FieldValidationColorChanged(false, "ALL");
    }
    function clearVoucher() {
        s.txtb_payroll_amount_gs = "0.00"
        s.txtb_payroll_amount_ps = "0.00"
        s.txtb_uploaded_amount_gs = "0.00"
        s.txtb_uploaded_amount_ps = "0.00"
        s.txtb_override_amount_gs = "0.00"
        s.txtb_override_amount_ps = "0.00"
        s.txtb_empl_id = ""
        s.txtb_phic_nbr = ""
        s.txtb_voucher_nbr = ""
        s.txtb_registry_nbr = ""
        s.txtb_payroll_year = ""
        s.txtb_payroll_month = ""
        s.txtb_payroll_year = ""
        s.txtb_payroll_month_word = ""
        s.txtb_payroll_month = ""
        s.txtb_payroll_month = ""
        s.ddl_employee_name = ""
       
        $("#ddl_remittance_status").val("")

        FieldValidationColorChanged(false, "ALL");
    }

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
    function DataTable_data(tname) {
        var data = []
        var id = s[tname][0].id;
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x) {
            data.push(dtrw[x])
        }
        return data
    }
    Array.prototype.refreshTable = function (table, id) {
        if (this.length == 0) {
            s[table].fnClearTable();

        }
        else {
            s[table].fnClearTable();
           
            s[table].fnAddData(this);
        }

        

        if (id != "") {
            var el_id = s[table][0].id

            for (var x = 1; x <= $("#" + el_id).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    s[table].fnPageChange(x);
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

    function addValue(id,value) {

        $("#" + id).val(value)
        s[id] = value
    }
    //*************************************/
    //***Edit BUtton-***//
    //**************************************// 
    s.btn_edit_action = function (row)
    {
        s.row_id = row
       
        clearentry()
        var data = s.datalistgrid[row]

        h.post("../cRemitLedgerHDMF/CheckData", { data: data }).then(function (d) {
            if(d.data.message = "found")
            {
                s.txtb_remittance_ctrl_nbr = s.datalistgrid[row].remittance_ctrl_nbr;
                s.txtb_empl_id = s.datalistgrid[row].empl_id;
                s.txtb_payroll_amount_gs = s.datalistgrid[row].payroll_amount_gs;
                s.txtb_payroll_amount_ps = s.datalistgrid[row].payroll_amount_ps;
                s.txtb_uploaded_amount_gs = s.datalistgrid[row].uploaded_amount_gs;
                s.txtb_uploaded_amount_ps = s.datalistgrid[row].uploaded_amount_ps;
                s.txtb_override_amount_gs = s.datalistgrid[row].override_amount_gs;
                s.txtb_override_amount_ps = s.datalistgrid[row].override_amount_ps;
                s.txtb_phic_nbr = s.datalistgrid[row].phic_nbr;
                s.txtb_voucher_nbr = s.datalistgrid[row].voucher_nbr;
                s.txtb_registry_nbr = s.datalistgrid[row].payroll_registry_nbr;
                s.txtb_voucher_nbr_disabled = s.datalistgrid[row].voucher_nbr + " - " + s.datalistgrid[row].payroll_registry_descr;

                addValue("ddl_employee_name", s.datalistgrid[row].empl_id)
                addValue("ddl_voucher_nbr", s.datalistgrid[row].voucher_nbr)

                s.txtb_employeename = s.datalistgrid[row].employee_name;
                s.txtb_payroll_year = s.datalistgrid[row].payroll_year;
                s.txtb_payroll_month = s.datalistgrid[row].payroll_month;
                var dDate = new Date(s.datalistgrid[row].payroll_month + "/01/2019");
                s.txtb_payroll_month_word = dDate.toLocaleString('en-us', { month: "long" })

                s.ishow = false
                s.ishow_update = true
                s.ModalTitle = "Edit Record"
                s.showemployee = false;
                s.showvoucher_nbr = false;
                s.disable_edit = false;
                s.disable_edit_ps = true;
                s.disable_u_edit_ps = true;
                $("#main_modal").modal({ keyboard: false, backdrop: "static" })
            }
            else if(d.dat.message == "not_found")
            {
                swal("Unable to delete, Data has been deleted by other user/s!", { icon: "warning", });
             
                s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[row].empl_id, "empl_id");
                if (s.datalistgrid.length != 0) {
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);
                } else {
                    s.oTable.fnClearTable();
                }
            }

        })
       
    }
    //*************************************/
    //***Select*Voucher*Number****//
    //**************************************// 
    s.select_ddl_voucher_nbr = function (vouch_nbr)
    {
        clearVoucher()
        var dt = s.lst_voucher.select(vouch_nbr, "voucher_nbr")[0]
        s.payroll_registry_descr = dt.payroll_registry_descr
        h.post("../cRemitLedgerPHIC/RetrieveEmployee", {
            par_registry_nbr: dt.payroll_registry_nbr
        }).then(function (d) {
            s.txtb_voucher_nbr      = dt.voucher_nbr
            s.txtb_registry_nbr     = dt.payroll_registry_nbr
            s.txtb_payroll_year = dt.payroll_year
            var dDate = new Date(dt.payroll_month+"/01/2019");
            s.txtb_payroll_month_word = dDate.toLocaleString('en-us', { month: "long" })
            s.txtb_payroll_month = dt.payroll_month
            s.employees = d.data.sp_payrollregistry_not_in_remittance_PHIC

           
        })
    }
    //*************************************/
    //***Select*Voucher*Number****//
    //**************************************// 
    s.select_ddl_employee = function (empl_id) {

        var dt = s.employees.select(empl_id, "empl_id")[0]
        
        s.txtb_phic_nbr             = dt.phic_nbr
        s.txtb_payroll_amount_gs    = dt.payroll_amount_gs
        s.txtb_payroll_amount_ps    = dt.payroll_amount_ps
        s.txtb_empl_id              = dt.empl_id
         
        $('#txtb_uploaded_amount_gs').val("0.00")
        $('#txtb_uploaded_amount_ps').val("0.00")
        $('#txtb_override_amount_gs').val("0.00")
        $('#txtb_override_amount_ps').val("0.00")
    }
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_del_row = function (id_ss) {
        var data = s.datalistgrid[id_ss]
        h.post("../cRemitLedgerPHIC/CheckData", { data: data }).then(function (d) {
            if(d.data.message =="found")
            {  
                swal({
                    title: "Are you sure to delete this record?",
                    text: "Once deleted, you will not be able to recover this record!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                })
                .then(function (willDelete) {
                    if (willDelete) {
                        h.post("../cRemitLedgerPHIC/DeleteFromDatabase",
                            {
                                par_remittance_ctrl_nbr: s.datalistgrid[id_ss].remittance_ctrl_nbr,
                                par_empl_id: s.datalistgrid[id_ss].empl_id,
                                par_voucher_nbr: s.datalistgrid[id_ss].voucher_nbr,
                                par_payroll_month: s.datalistgrid[id_ss].payroll_month,

                            }).then(function (d) {
                               
                                if (d.data.message == "success") {
                                    //s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].empl_id, "empl_id", s.datalistgrid[id_ss].payroll_month, "payroll_month");
                                    console.log(s.datalistgrid)

                                    s.datalistgrid = s.datalistgrid.delete(id_ss)
                                 
                                    if (s.datalistgrid.length != 0)
                                    {
                                        s.oTable.fnClearTable();
                                        s.oTable.fnAddData(s.datalistgrid);
                                    }
                                    else {
                                        s.oTable.fnClearTable();
                                    }
                                    swal("Your record has been deleted!", { icon: "success", });
                                }
                                else {
                                    swal(d.data.message, "Data not deleted", "error");
                                }

                            })
                    }
                });
            }
            else if (d.data.message == "not_found")
            {
                swal("Unable to delete, Data has been deleted by other user/s!", { icon: "warning", });

                s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].empl_id, "empl_id");
                if (s.datalistgrid.length != 0) {
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);
                } else {
                    s.oTable.fnClearTable();
                }
            }
        })
       

    }
    //**************************************//
    //***Update-Database-Function****//
    //**************************************//
    s.btn_save_update = function () {

        if (isdataValidated()) {
            
            h.post("../cRemitLedgerPHIC/UpdateFromDatabase", {
                par_remittance_ctrl_no   : s.txtb_remittance_ctrl_nbr, 
                par_empl_id              : s.txtb_empl_id            ,
                par_phic_gs              : s.txtb_override_amount_gs ,
                par_phic_ps              : s.txtb_override_amount_ps ,

                
            }).then(function (d) {
                if (d.data.message == "success")
                {

                    swal("Successfully Updated!", "Existing record successfully updated!", "success")
                    $("#main_modal").modal("hide");
                    updateListGrid()
                }
                else if (d.data.message == "not_found")
                {
                    swal("Unable to delete, Data has been deleted by other user/s!", { icon: "warning", });
                   
                    s.datalistgrid = s.datalistgrid.remove(s.txtb_empl_id, "empl_id");
                    if (s.datalistgrid.length != 0) {
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                    } else {
                        s.oTable.fnClearTable();
                    }
                    $("#main_modal").modal("hide");
                }
                else {
                    swal("Saving error!", "Data not save", "error");
                }
            })
        }
    }
    //**************************************//
    //***Update-Grid****//
    //**************************************//
    function updateListGrid() {

        var table = $('#datalist_grid').DataTable();
        var info = table.page.info();

        console.log(s.datalistgrid[s.row_id])
        s.datalistgrid[s.row_id].remittance_ctrl_no        = s.txtb_remittance_ctrl_nbr
        s.datalistgrid[s.row_id].empl_id                   = s.txtb_empl_id           
        s.datalistgrid[s.row_id].grid_amount_gs            = s.txtb_override_amount_gs       
        s.datalistgrid[s.row_id].grid_amount_ps            = s.txtb_override_amount_ps 

        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
        page_value = info.page

        ////s.oTable.fnSort([[sort_value, sort_order]]);
        dateM = new Date(s.datalistgrid[s.row_id].payroll_month + "/1/2019");
       

        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
            if (get_page(s.txtb_empl_id, dateM.toLocaleString('en-us', { month: 'long' })) == false) {
                s.oTable.fnPageChange(x);
            }
            else {
                break;
            }
        }
        
    }

    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(empl_id, payroll_month) {
        var nakit_an = false;
        var rowx = 0;
        var check_nbr = false;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0)
                {
                    if ($(this).text() == empl_id)
                    {
                        check_nbr = true
                    }
                    else
                    {
                        check_nbr = false
                    }
                }

                if (cells == 5) {
                    if ($(this).text() == payroll_month) {
                        if (check_nbr == true) {

                            nakit_an = true;
                            return false;
                        }
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
        if ($('#ddl_voucher_nbr').val() == "") {
            FieldValidationColorChanged(true, "ddl_voucher_nbr")
            validatedSaved = false;
        }
        if ($('#ddl_employee_name').val() == "") {
            FieldValidationColorChanged(true, "ddl_employee_name")
            validatedSaved = false;
        }
        if ($('#txtb_payroll_amount_gs').val() == "") {
            FieldValidationColorChanged(true, "txtb_payroll_amount_gs")
            validatedSaved = false;
        }
        if (isNaN(parseFloat($('#txtb_payroll_amount_gs').val())) == true ) {
            FieldValidationColorChanged(true, "txtb_payroll_amount_gs_invalid")
            validatedSaved = false;
        }
        if ($('#txtb_payroll_amount_ps').val() == "") {
            FieldValidationColorChanged(true, "txtb_payroll_amount_ps")
            validatedSaved = false;
        }
        if ($('#txtb_uploaded_amount_gs').val() == "") {
            FieldValidationColorChanged(true, "txtb_uploaded_amount_gs")
            validatedSaved = false;
        }
        if ($('#txtb_uploaded_amount_ps').val() == "") {
            FieldValidationColorChanged(true, "txtb_uploaded_amount_ps")
            validatedSaved = false;
        }
        if ($('#txtb_override_amount_gs').val() == "") {
            FieldValidationColorChanged(true, "txtb_override_amount_gs")
            validatedSaved = false;
        }
        if (isNaN(parseFloat($('#txtb_override_amount_gs').val())) == true) {
            FieldValidationColorChanged(true, "txtb_override_amount_gs_invalid")
            validatedSaved = false;
        }
        if ($('#txtb_override_amount_ps').val() == "") {
            
            FieldValidationColorChanged(true, "txtb_override_amount_ps")
            validatedSaved = false;
        }

        if (isNaN(parseFloat($('#txtb_override_amount_ps').val())) == true) {
            FieldValidationColorChanged(true, "txtb_override_amount_ps_invalid")
            validatedSaved = false;
        }
        return validatedSaved;
    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {
        
        if (pMode)
            switch (pObjectName) {
                case "ddl_voucher_nbr":
                    {
                        $('#ddl_voucher_nbr').addClass('require-field')
                        s.lbl_requiredfield1 = "required field!"
                        break;
                    }
                case "ddl_employee_name":
                    {
                        $('#ddl_employee_name').addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }
                case "txtb_payroll_amount_gs":
                    {
                        $('#txtb_payroll_amount_gs').addClass('require-field')
                        s.lbl_requiredfield3 = "required field!"
                        break;
                    }
                case "txtb_payroll_amount_gs_invalid":
                    {
                        $('#txtb_payroll_amount_gs').addClass('require-field')
                        s.lbl_requiredfield3 = "Invalid numeric!"
                        break;
                    }
                case "txtb_payroll_amount_ps":
                    {
                        $('#txtb_payroll_amount_ps').addClass('require-field')
                        s.lbl_requiredfield4 = "required field!"
                        break;
                    }
                case "txtb_uploaded_amount_gs":
                    {
                        $('#txtb_uploaded_amount_gs').addClass('require-field')
                        s.lbl_requiredfield5 = "required field!"
                        break;
                    }
                case "txtb_uploaded_amount_ps":
                    {
                        $('#txtb_uploaded_amount_ps').addClass('require-field')
                        s.lbl_requiredfield6 = "required field!"
                        break;
                    }
                case "txtb_override_amount_gs":
                    {
                        $('#txtb_override_amount_gs').addClass('require-field')
                        s.lbl_requiredfield7 = "required field!"
                        break;
                    }
                case "txtb_override_amount_ps":
                    {
                        $('#txtb_override_amount_ps').addClass('require-field')
                        s.lbl_requiredfield8 = "required field!"
                        break;
                    }

                case "txtb_override_amount_ps_invalid":
                    {
                        $('#txtb_override_amount_ps').addClass('require-field')
                        s.lbl_requiredfield8 = "Invalid numeric!"
                        break;
                    }

                case "txtb_override_amount_gs_invalid":
                    {
                        $('#txtb_override_amount_gs').addClass('require-field')
                        s.lbl_requiredfield7 = "Invalid numeric!"
                        break;
                    }

            }
        else if (!pMode) {
            switch (pObjectName) {

                case "ALL":
                    {
                        s.lbl_requiredfield1 = "";
                        s.lbl_requiredfield2 = "";
                        s.lbl_requiredfield3 = "";
                        s.lbl_requiredfield4 = "";
                        s.lbl_requiredfield5 = "";
                        s.lbl_requiredfield6 = "";
                        s.lbl_requiredfield7 = "";
                        s.lbl_requiredfield8 = "";
                        $('#ddl_voucher_nbr').removeClass('require-field')
                        $('#ddl_employee_name').removeClass('require-field')
                        $('#txtb_payroll_amount_gs').removeClass('require-field')
                        $('#txtb_payroll_amount_ps').removeClass('require-field')
                        $('#txtb_uploaded_amount_gs').removeClass('require-field')
                        $('#txtb_uploaded_amount_ps').removeClass('require-field')
                        $('#txtb_override_amount_gs').removeClass('require-field')
                        $('#txtb_override_amount_ps').removeClass('require-field')
                        break;
                    }
            }
        }
    }

    function currency(d) {

        var retdata = "0.00"
        if (d == null || d == "" || d == undefined) {
            return retdata
        }
        else {
            retdata = parseFloat(d).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }

    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    Array.prototype.remove = function (code, prop)
    {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }

    ////***********************************//
    ////***Page-View-for-Crystal-Report****//
    ////***********************************// 
    //Array.prototype.remove = function (code, prop, code1, prop1) {
     
    //    return this.filter(function (d) {
    //        return (d[prop] != code && d[prop1] != code1)
    //    })
    //}
    //***********************************//
    //***Search-on Grid****//
    //***********************************// 
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.lbl_payroll_month = "Payroll Month"
    s.search_in_list_month = function (value, table) {
        s.lbl_payroll_month = value
        if (value == "") {
            s.lbl_payroll_month = "Payroll Month"
        }
        $("#" + table).DataTable().column(5).search(value).draw();
        $("#rejected_grid").DataTable().column(5).search(value).draw();
    }
    //***********************************//
    //***Number of Row****//
    //***********************************// 
    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }
    //***********************************//
    //***Show-Date-Format****//
    //***********************************// 
    function show_date() {
        $('.datepicker').datepicker({ format: 'yyyy-mm-dd' });
    }
    //***********************************//
    //***Open-upload-Modal****//
    //***********************************//
    s.btn_upload_modal = function () {
        $("#upload_modal").modal({ keyboard: false, backdrop: "static" })
    }
    //***********************************//
    //***SElect Department and Letter****//
    //***********************************//
    s.ddl_lastname_starts_and_department = function () {
      
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cRemitLedgerPHIC/SelectLetterandDepartment", {
            par_department: s.ddl_department,
            par_letter: $('#ddl_lastname_starts').val(),
        }).then(function (d) {
            if (d.data.sp_remittance_dtl_phic_tbl_list.length > 0) {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.sp_remittance_dtl_phic_tbl_list;
                s.oTable.fnAddData(d.data.sp_remittance_dtl_phic_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
            }
            $("#loading_data").modal("hide");
        })
    }


    function filterEmpty() {
        var d = s.ddl_department
        var l = s.ddl_lastname_starts
        if (l == "" && d == "") {
            swal("Please select filter", { icon: "warning" });
            return true
        }
        else {
            return false
        }
    }

    //***********************************//
    //***Execute-Upload****//
    //***********************************//
    
    s.btn_execute_upload = function () {
        
        $("#upload").removeClass("fa fa-upload");
        $("#upload").addClass("fa fa-spinner fa-spin");
        var fileUpload = $('#file_upload').get(0);
       
        var files = fileUpload.files;
        var test = new FormData();
        for (var i = 0; i < files.length; i++) {
            test.append(files[i].name, files[i]);
        }
        $.ajax({
            url: "cRemitLedgerPHIC_FileUpload.ashx",
            type: "POST",
            contentType: false,
            processData: false,
            data: test,
            success: function (result) {
               
                if (result.split('*')[0] == "Y") {
                   
                    h.post("../cRemitLedgerPHIC/UploadData",
                        {
                              par_filename: result.split('*')[2],
                            //par_filename: 'C:\\HRIS\Development\\HRIS-ePAccount\\HRIS-ePAccount\\UploadedFile\\SEPTEMBER_test.csv',
                            //par_filename: 'D:\\HRIS_FILE_REPO\\COMVAL_HRIS\\PHIC_CSV\\spa_february.csv',
                            //par_filename: 'D:\\HRIS_FILE_REPO\\COMVAL_HRIS\\PHIC_CSV\\spa_january.csv',
                        }).then(function (d) {
                            if(d.data.message == "success")
                            {
                                var icon_display = "";
                                // Y = Remittance Ledger successfully updated with Uploaded data'  
                                // N = Remittance Ledger Not Updated: '
                                // 0 = No Data Uploaded: Remittance Ledger not Updated'
                                // E = Remittance Control Nbr = ' +  @p_remittance_ctrl_nbr + ' Not Existing'
                                // U = Remittance Control Nbr = ' +  @p_remittance_ctrl_nbr + ' Already Uploaded by'  

                                switch (d.data.sp_upload_file_from_PHIC[0].result_value) {
                                    case "Y":
                                        icon_display = "success";
                                        break;
                                    case "N":
                                    case "E":
                                        icon_display = "error";
                                        break;
                                    case "U":
                                    case "0":
                                        icon_display = "warning";
                                        break;
                                }

                                $("#upload").removeClass("fa fa-spinner fa-spin");
                                $("#upload").addClass("fa fa-upload");
                                swal(d.data.sp_upload_file_from_PHIC[0].result_value_descr, "Upload Data Message", icon_display);
                           
                            }
                            else
                            {
                                swal(d.data.message, "Upload Data Message", "error");

                            }
                                

                        })

                }
                else {
                    
                    swal("No data found!", "Upload Data Message", "error");
                }
            },
            error: function (err) {
                swal(err.statusText, "Upload Data Message", "error");
            }
        }); 
        
    }


    s.showImage = function ()
    {
        alert("gg")
    }

    s.ExtractToExcel = function () {
        $("#extracting_data").modal("show");
        h.post("../cRemitLedgerPHIC/ExtractToExcel").then(function (d) {
            if (d.data.message == "success") {
                $("#extracting_data").modal("hide");
                window.open(d.data.filePath, '', '');
            }
            else {

                $("#extracting_data").modal("hide");
                swal(d.data.message, { icon: "error" });
            }
        })

    }

    //s.ExtractToExcelJO_monthly = function () {
    //    $("#extracting_data").modal("show");
    //    h.post("../cRemitLedgerPHIC/ExtractToExcelJO_monthly").then(function (d) {
    //        if (d.data.message == "success") {
    //            $("#extracting_data").modal("hide");
    //            window.open(d.data.filePath, '', '');
    //        }
    //        else {

    //            $("#extracting_data").modal("hide");
    //            swal(d.data.message, { icon: "error" });
    //        }
    //    })

    //}

    s.ExtractToExcelJO_monthly = function () {
        $("#extracting_data").modal("show");

        h.post("../Menu/GetToken").then(function (d) {
            var token = { token: d.data.token }
            h.post(excelExportServer + "/api/remittance/verify-token", token, { responseType: 'arraybuffer' }).then(function (response) {

                if (response.data) {
                    h.post("../cRemitLedgerPHIC/ExtractToExcelJO_monthly_php").then(function (d) {
                        var listgrid = d.data.sp_remittance_PHIC_monthly_rep

                        var remittance_ctrl_nbr = d.data.rmtCtrlnbr
                        var remittance_year = d.data.rmtyear
                        var remittance_month = d.data.rmtmonth
                        var remittance_empl_type = d.data.rmtempltype

                        if (d.data.icon == "success") {
                            h.post(excelExportServer + "/api/export/phic-monthly-remittance-extract", {
                                data: listgrid
                            }, { responseType: 'arraybuffer' }
                            ).then(function (response2) {

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
                                    const name = "Monthly Phic-" + remittance_empl_type + " -" + remittance_year + "-" + remittance_month + "-" + remittance_ctrl_nbr + ".xlsx"
                                    link.setAttribute('download', name);
                                    console.log(link)
                                    // Append the link to the document body and click it to initiate the download
                                    document.body.appendChild(link);
                                    link.click();

                                    // Clean up by removing the link element and revoking the Blob URL
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(downloadUrl);
                                    $("#extracting_data").modal("hide");
                                } else {
                                    console.error('The response data is empty or undefined.');
                                    $("#extracting_data").modal("hide");
                                }
                            }).catch(function (error) {
                                console.error('There was a problem with the POST request:', error);
                                $("#extracting_data").modal("hide");
                            });
                        }
                        else {
                            $("#extracting_data").modal("hide");
                            alert(d.data.messsage)
                        }
                    })
                }
                else {
                    $("#extracting_data").modal("hide");
                }
            }).catch(function (error, response) {
                swal("Token expired! please generate new token.", { icon: "error" })
                console.error('Token expired! please generate new token :', error);
                $("#extracting_data").modal("hide");
            });
        })
    }



    //s.ExtractToExcelCheck = function () {
    //    $("#extracting_data").modal("show");
    //    h.post("../cRemitLedgerPHIC/ExtractToExcelCheck").then(function (d)
    //    {
    //        if (d.data.message == "success") {
    //            $("#extracting_data").modal("hide");
    //            window.open(d.data.filePath, '', '');
    //        }
    //        else
    //        {

    //            $("#extracting_data").modal("hide");
    //            swal(d.data.message, { icon: "error" });
    //        }
    //    })

    //}



    s.ExtractToExcelCheck = function () {
        var empl_type = $("#empl_type").val();


        $("#extracting_data").modal("show");

        if (empl_type == "JO") {
            h.post("../cRemitLedgerPHIC/ExtractToExcelCheck").then(function (d) {
                if (d.data.message == "success") {
                    $("#extracting_data").modal("hide");
                    window.open(d.data.filePath, '', '');
                }
                else {

                    $("#extracting_data").modal("hide");
                    swal(d.data.message, { icon: "error" });
                }
            })
        }
        else {

            h.post("../Menu/GetToken").then(function (d) {
                var token = { token: d.data.token }
                console.log(token)
                h.post(excelExportServer + "/api/remittance/verify-token", token, { responseType: 'arraybuffer' }

                ).then(function (response) {

                    h.post("../cRemitLedgerPHIC/ExtractToExcelCheck_PHP").then(function (d) {
                        var phic = d.data.phic
                        console.log(phic)
                        if (d.data.message == "success") {
                            h.post("http://127.0.0.1:8000/api/export/phic-premium-forchecking-export", {
                                data: phic
                            }, { responseType: 'arraybuffer' }
                            ).then(function (response2) {

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
                                    const name = "PHIC_CHECKING.xlsx"
                                    link.setAttribute('download', name);
                                    console.log(link)
                                    // Append the link to the document body and click it to initiate the download
                                    document.body.appendChild(link);
                                    link.click();

                                    // Clean up by removing the link element and revoking the Blob URL
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(downloadUrl);
                                    $("#extracting_data").modal("hide");
                                } else {
                                    console.error('The response data is empty or undefined.');
                                    $("#extracting_data").modal("hide");
                                }
                            }).catch(function (error) {
                                console.error('There was a problem with the POST request:', error);
                                $("#extracting_data").modal("hide");
                            });
                        }
                        else {
                            swal(d.data.message, { icon: "error" })
                        }

                    })


                }).catch(function (error, response) {
                    swal("Token expired! please generate new token.", { icon: "error" })
                    console.error('Token expired! please generate new token :', error);
                    $("#extracting_data").modal("hide");
                });
            })



        }


    }

    Array.prototype.select = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] == code
        })
    }
    s.btn_report_PHIC = function (report_type) {
        h.post("../cRemitLedgerPHIC/BackPage", {
            par_year: s.txtb_remittance_year
            , par_month: s.txtb_remittance_month_code 
            , par_report_type: report_type
        }).then(function (d) {

            if (d.data.message == "success") {
                var controller = "Reports";
                var action = "Index";
                var ReportName = "cryRemittancePHIC_NPN_NRL";
                var SaveName = "Crystal_Report";
                var ReportType = "inline";
                var ReportPath = "~/Reports/cryRemittancePHIC/cryRemittancePHIC_NPN_NRL.rpt"
                var sp = "sp_uploaded_data_PHIC,p_remittance_year," + s.txtb_remittance_year + ",p_remittance_month," + s.txtb_remittance_month_code + ",p_report_type," + report_type + ""

                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp
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
            }
           
        })
      
       
    }
    s.BackToHeader = function () {
        location.href = "../cRemitLedger/Index"
    }

    //********************************************************************/
    //*** VJA : 2021-07-21 - This Function is for Grand Total Viewing****//
    //********************************************************************/
    s.btn_view_grand_total = function ()
    {
        h.post("../cRemitLedgerPHIC/RetrieveGrandTotal",
            {
                par_remittance_ctrl_nbr: s.txtb_remittance_ctrl_nbr
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    console.log(d.data.data)

                    // **********************************************************
                    // ********** Show the Div on Index *************************
                    // **********************************************************
                    s.show_div_gsis      = false;
                    s.show_div_phic_hdmf = false;
                    s.show_div_sss_oth   = false

                    if (d.data.data.remittancetype_code == "01")       // GSIS 
                    {
                        s.show_div_gsis = true;
                    }
                    else if (d.data.data.remittancetype_code == "02" || // HDMF
                             d.data.data.remittancetype_code == "03" || // HDMF
                             d.data.data.remittancetype_code == "04" || // HDMF
                             d.data.data.remittancetype_code == "05" || // HDMF
                             d.data.data.remittancetype_code == "06" || // HDMF 
                             d.data.data.remittancetype_code == "07")   // PHIC
                    {
                        s.show_div_phic_hdmf = true;
                    }
                    else                                                // SSS and Others
                    {
                        s.show_div_sss_oth  = true;
                    }
                    // **********************************************************
                    // **********************************************************

                    // **********************************************************
                    // ****** Clear the Textboxes *******************************
                    // **********************************************************
                    s.txtb_remittance_ctrl_no   = "";
                    s.txtb_description          = "";
                    s.ddl_remittancetype        = "";
                    s.txtb_remittancetype       = "";
                    s.txtb_year                 = "";
                    s.txtb_month                = "";
                    s.txtb_date_created         = "";
                    s.txtb_created_by           = "";
                    s.txtb_p_gsis_gs            = "0.00";
                    s.txtb_p_gsis_ps            = "0.00";
                    s.txtb_p_sif_gs             = "0.00";
                    s.txtb_p_gsis_uoli          = "0.00";
                    s.txtb_p_gsis_ehp           = "0.00";
                    s.txtb_p_gsis_hip           = "0.00";
                    s.txtb_p_gsis_ceap          = "0.00";
                    s.txtb_p_gsis_addl_ins      = "0.00";
                    s.txtb_p_gsis_conso_ln      = "0.00";
                    s.txtb_p_gsis_policy_reg_ln = "0.00";
                    s.txtb_p_gsis_policy_opt_ln = "0.00";
                    s.txtb_p_gsis_emergency_ln  = "0.00";
                    s.txtb_p_gsis_ecard_ln      = "0.00";
                    s.txtb_p_gsis_educ_asst_ln  = "0.00";
                    s.txtb_p_gsis_real_state_ln = "0.00";
                    s.txtb_p_gsis_sos_ln        = "0.00";
                    s.txtb_p_gsis_help          = "0.00";
                    s.txtb_u_gsis_gs            = "0.00";
                    s.txtb_u_gsis_ps            = "0.00";
                    s.txtb_u_sif_gs             = "0.00";
                    s.txtb_u_gsis_uoli          = "0.00";
                    s.txtb_u_gsis_ehp           = "0.00";
                    s.txtb_u_gsis_hip           = "0.00";
                    s.txtb_u_gsis_ceap          = "0.00";
                    s.txtb_u_gsis_addl_ins      = "0.00";
                    s.txtb_u_gsis_conso_ln      = "0.00";
                    s.txtb_u_gsis_policy_reg_ln = "0.00";
                    s.txtb_u_gsis_policy_opt_ln = "0.00";
                    s.txtb_u_gsis_emergency_ln  = "0.00";
                    s.txtb_u_gsis_ecard_ln      = "0.00";
                    s.txtb_u_gsis_educ_asst_ln  = "0.00";
                    s.txtb_u_gsis_real_state_ln = "0.00";
                    s.txtb_u_gsis_sos_ln        = "0.00";
                    s.txtb_u_gsis_help          = "0.00";
                    s.txtb_o_gsis_gs            = "0.00";
                    s.txtb_o_gsis_ps            = "0.00";
                    s.txtb_p_other_loan1        = "0.00";
                    s.txtb_p_other_loan2        = "0.00";
                    s.txtb_u_other_loan1        = "0.00";
                    s.txtb_u_other_loan2        = "0.00";
                    s.txtb_o_other_loan1        = "0.00";
                    s.txtb_o_other_loan2        = "0.00";
                    s.txtb_p_other_loan3        = "0.00";
                    s.txtb_u_other_loan3        = "0.00";
                    s.txtb_o_other_loan3        = "0.00";
                    s.txtb_payroll_amount_gs    = "0.00";
                    s.txtb_payroll_amount_ps    = "0.00";
                    s.txtb_uploaded_amount_gs   = "0.00";
                    s.txtb_uploaded_amount_ps   = "0.00";
                    s.txtb_override_amount_gs   = "0.00";
                    s.txtb_override_amount_ps   = "0.00";
                    s.txtb_payroll_amount       = "0.00";
                    s.txtb_uploaded_amount      = "0.00";

                    // **********************************************************
                    // **********************************************************

                    s.txtb_remittance_ctrl_no   = d.data.data.remittance_ctrl_nbr;
                    s.txtb_description          = d.data.data.remittance_descr;
                    s.txtb_remittancetype       = d.data.data.remittancetype_descr;
                    s.txtb_year                 = $('#txtb_remittance_year').val();
                    s.txtb_month                = $('#txtb_remittance_month').val();
                    
                    s.txtb_p_gsis_gs            = d.data.data.p_gsis_gs            
                    s.txtb_p_gsis_ps            = d.data.data.p_gsis_ps            
                    s.txtb_p_sif_gs             = d.data.data.p_sif_gs             
                    s.txtb_p_gsis_uoli          = d.data.data.p_gsis_uoli          
                    s.txtb_p_gsis_ehp           = d.data.data.p_gsis_ehp           
                    s.txtb_p_gsis_hip           = d.data.data.p_gsis_hip           
                    s.txtb_p_gsis_ceap          = d.data.data.p_gsis_ceap          
                    s.txtb_p_gsis_addl_ins      = d.data.data.p_gsis_addl_ins      
                    s.txtb_p_gsis_conso_ln      = d.data.data.p_gsis_conso_ln      
                    s.txtb_p_gsis_policy_reg_ln = d.data.data.p_gsis_policy_reg_ln 
                    s.txtb_p_gsis_policy_opt_ln = d.data.data.p_gsis_policy_opt_ln 
                    s.txtb_p_gsis_emergency_ln  = d.data.data.p_gsis_emergency_ln  
                    s.txtb_p_gsis_ecard_ln      = d.data.data.p_gsis_ecard_ln      
                    s.txtb_p_gsis_educ_asst_ln  = d.data.data.p_gsis_educ_asst_ln  
                    s.txtb_p_gsis_real_state_ln = d.data.data.p_gsis_real_state_ln 
                    s.txtb_p_gsis_sos_ln        = d.data.data.p_gsis_sos_ln        
                    s.txtb_p_gsis_help          = d.data.data.p_gsis_help          
                    s.txtb_u_gsis_gs            = d.data.data.u_gsis_gs            
                    s.txtb_u_gsis_ps            = d.data.data.u_gsis_ps            
                    s.txtb_u_sif_gs             = d.data.data.u_sif_gs             
                    s.txtb_u_gsis_uoli          = d.data.data.u_gsis_uoli          
                    s.txtb_u_gsis_ehp           = d.data.data.u_gsis_ehp           
                    s.txtb_u_gsis_hip           = d.data.data.u_gsis_hip           
                    s.txtb_u_gsis_ceap          = d.data.data.u_gsis_ceap          
                    s.txtb_u_gsis_addl_ins      = d.data.data.u_gsis_addl_ins      
                    s.txtb_u_gsis_conso_ln      = d.data.data.u_gsis_conso_ln      
                    s.txtb_u_gsis_policy_reg_ln = d.data.data.u_gsis_policy_reg_ln 
                    s.txtb_u_gsis_policy_opt_ln = d.data.data.u_gsis_policy_opt_ln 
                    s.txtb_u_gsis_emergency_ln  = d.data.data.u_gsis_emergency_ln  
                    s.txtb_u_gsis_ecard_ln      = d.data.data.u_gsis_ecard_ln      
                    s.txtb_u_gsis_educ_asst_ln  = d.data.data.u_gsis_educ_asst_ln  
                    s.txtb_u_gsis_real_state_ln = d.data.data.u_gsis_real_state_ln 
                    s.txtb_u_gsis_sos_ln        = d.data.data.u_gsis_sos_ln        
                    s.txtb_u_gsis_help          = d.data.data.u_gsis_help          
                    s.txtb_o_gsis_gs            = d.data.data.o_gsis_gs            
                    s.txtb_o_gsis_ps            = d.data.data.o_gsis_ps            
                    s.txtb_p_other_loan1        = d.data.data.p_other_loan1        
                    s.txtb_p_other_loan2        = d.data.data.p_other_loan2        
                    s.txtb_u_other_loan1        = d.data.data.u_other_loan1        
                    s.txtb_u_other_loan2        = d.data.data.u_other_loan2        
                    s.txtb_o_other_loan1        = d.data.data.o_other_loan1        
                    s.txtb_o_other_loan2        = d.data.data.o_other_loan2        
                    s.txtb_p_other_loan3        = d.data.data.p_other_loan3        
                    s.txtb_u_other_loan3        = d.data.data.u_other_loan3        
                    s.txtb_o_other_loan3        = d.data.data.o_other_loan3        
                    s.txtb_payroll_amount_gs    = d.data.data.payroll_amount_gs    
                    s.txtb_payroll_amount_ps    = d.data.data.payroll_amount_ps    
                    s.txtb_uploaded_amount_gs   = d.data.data.uploaded_amount_gs   
                    s.txtb_uploaded_amount_ps   = d.data.data.uploaded_amount_ps   
                    s.txtb_override_amount_gs   = d.data.data.override_amount_gs   
                    s.txtb_override_amount_ps   = d.data.data.override_amount_ps   
                    s.txtb_payroll_amount       = d.data.data.payroll_amount       
                    s.txtb_uploaded_amount      = d.data.data.uploaded_amount      
                    
                    $('#modal_grand_total').modal({ keyboard: false, backdrop: "static" });
                }
                else if (d.data.message == "error")
                {
                    swal("Something Went wrong!", "No Accounting Header", "warning");
                }
                else
                {
                    swal("You Cannot View", d.data.message , "warning");
                }

            })
    }
    //**************************************************************
    //          E   N   D       O   F       C   O   D   E
    //**************************************************************
})

