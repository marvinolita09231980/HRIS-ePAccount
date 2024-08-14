ng_HRD_App.controller("cRemitLedgerHDMF_ctrlr", function ($scope, $compile, $http, $filter) {

    var s = $scope
    var h = $http
    var L = "length"
    var und = "undefined"
    var nl = null
    var ov = "isOverride"
    var y = "year"
    var dos = "ddl_override_status"
    var mn = "month_nbr"
    var hdr_dtl = []
    var voucher_nbr = ""
    var empl_id = ""
    var wdc = new w_dc([])
    var excelExportServer = ""
    s.fd = []
    s.fd.txtb_year = ""
    s.fd.txtb_month = ""
    s.fd.txtb_empl_type = ""
   


    s.month_arr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]



 

    var alp = "alphabet_list"
    s.alphabet_list = [
        { id: 'a', alpha_name: 'A' }, { id: 'b', alpha_name: 'B' }, { id: 'c', alpha_name: 'C' }, { id: 'd', alpha_name: 'D' }, { id: 'e', alpha_name: 'E' }, { id: 'f', alpha_name: 'F' },
        { id: 'g', alpha_name: 'G' }, { id: 'h', alpha_name: 'H' }, { id: 'i', alpha_name: 'I' }, { id: 'j', alpha_name: 'J' }, { id: 'k', alpha_name: 'K' }, { id: 'l', alpha_name: 'L' },
        { id: 'm', alpha_name: 'M' }, { id: 'n', alpha_name: 'N' }, { id: 'o', alpha_name: 'O' }, { id: 'p', alpha_name: 'P' }, { id: 'q', alpha_name: 'Q' }, { id: 'r', alpha_name: 'R' },
        { id: 's', alpha_name: 'S' }, { id: 't', alpha_name: 'T' }, { id: 'u', alpha_name: 'U' }, { id: 'v', alpha_name: 'V' }, { id: 'w', alpha_name: 'W' }, { id: 'x', alpha_name: 'X' },
        { id: 'y', alpha_name: 'Y' }, { id: 'z', alpha_name: 'Z' }

    ]

    var osl = "override_status_list"
    var os = "override_status"
    s.override_status = [
          { id: "N", text: "No Override" }
        , { id: "1", text: "Late Remittance" }
        , { id: "2", text: "With Additional Late Remittance " }
        , { id: "3", text: "Incorrect Amount" }

    ]
   
    var Init_Premium_Data = function (par_data) {
        s.Premium_Table_Data = par_data;
        s.premiumTable = $('#premium_grid').dataTable(
            {
                data: s.Premium_Table_Data,
                sDom: 'rt<"bottom"ip>',
                "order": [[2, "asc"]],
                pageLength: 10,
                columns: [
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "voucher_nbr", "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        } },
                    { "mData": "employee_name" },


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
                        "mData": "payroll_month",
                        "mRender": function (data, type, full, row)
                        {
                            
                            return "<span class='text-center btn-block'>" + s.month_arr[parseInt(data) - 1] + "</span>"
                        }
                    },

                    {
                        "mData": "payroll_year",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ',1)" ><i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',1)"' +
                                'ng-disabled="((' + full["override_amount_ps"] + '!= 0 && ' + full["override_amount_ps"] + '!= null)  && (' + full["override_amount_gs"] + '!= 0 || ' + full["override_amount_gs"] + '!=null))">' +
                                '<i id="del_row' + row["row"] + '" class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                    , {
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data.substring(0, 1) + "</span>"
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },


            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var Init_Loan_Data = function (par_data) {

        s.Loan_Table_Data = par_data;

        s.loanTable = $('#loan_grid').dataTable(
            {
                data: s.Loan_Table_Data,
                sDom: 'rt<"bottom"ip>',
                "order": [[2, "asc"]],
                pageLength: 10,
                columns: [
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "voucher_nbr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    { "mData": "employee_name" },

                    {
                        "mData": "grid_amount_ps",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)

                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_month",
                        "mRender": function (data, type, full, row) {

                            return "<span class='text-center btn-block'>" + s.month_arr[parseInt(data) - 1] + "</span>"
                        }
                    },
                    { "mData": "payroll_year", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ',2)" >  <i class="fa fa-eye"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',2)" >  <i id="del_row' + row["row"] + '" class="fa fa-trash"></i></button >' +
                                '</div></center>';
                        }
                    }

                     ,{
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block' style='display: none; border:none;'>" + data.substring(0, 1)+ "</span>"
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }


            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }
    function init() {
        s.rowLen = "10"
        $("#spinner_load").modal("show")
        s.ddl_letter = ""
        s.ddl_dept = ""
        s.isEdit = false
        s.fd[dos] = "N"
        s.isOverride = true
        s.view_option = '1'
        s.modalTitle = "ADD RECORD"
        Init_Loan_Data([])
        Init_Premium_Data([])
        var browserHeight = window.innerHeight
        h.post("../cRemitLedgerHDMF/initializeData", { ltr: s.ddl_letter, v_opt: s.view_option }).then(function (d) {

            excelExportServer = d.data.excelExportServer;

            s.remit_ctrl_nbr            = d.data.prevValues[7].trim()
            s.year                      = d.data.prevValues[0].trim()
            s.month                     = d.data.prevValues[2].trim()
            s.month_nbr                 = d.data.prevValues[1].trim()
            s.empl_type                 = d.data.prevValues[4].trim()
            s.fd.year                   = d.data.prevValues[0].trim()
            s.fd.month                  = d.data.prevValues[2].trim()
            s.fd.empl_type              = d.data.prevValues[4].trim()
            s.remittancetype_code       = d.data.prevValues[5].trim()
            s.txtb_remittance_status    = d.data.prevValues[9].trim()
            s.department_list           = d.data.department_list

            // STATUS DESCRIPTION
            // N = 'Not Remitted'
            // R = 'Remitted'
            // P = 'Partially Remitted'  
            RemittanceStatus(d.data.remittance_status);

            if (s.remittancetype_code == "02")
            {
                $("#ExcelCheck").show()
            }

            else
            {
                $("#ExcelCheck").hide()
            }
            switchGrid(s.remittancetype_code)
           
            d.data.details.populate_DT(s.remittancetype_code)
            

            $("#spinner_load").modal("hide")
           

        })
    }
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
    function switchGrid(code) {
        if (code == "02") {
            s.grid  = "premiumTable"
            s.gdata = "Premium_Table_Data"
        }
        else {
            s.grid  = "loanTable"
            s.gdata = "Loan_Table_Data"
        }
    }
    function checkSession()
    {
        h.post("../cRemitLedgerHDMF/checkSession")
    }
    init()

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

    s.search_in_list_letter = function (value, table)
    {
     
      
        if (s.grid == "premiumTable") {
            $("#premium_grid").DataTable().column(8).search(value).draw();
        }

        else
        {
            $("#loan_grid").DataTable().column(8).search(value).draw();
        }

        $("#rejected_grid").DataTable().column(8).search(value).draw();
       

    }

    s.setNumOfRow = function (value, table) {

        $("#" + table).DataTable().page.len(s.rowLen).draw();

    }

    s.Select_Voucher = function (vouch_nbr) {
        clearFields()
       
            var dt = s.voucher_list.select(vouch_nbr, "voucher_nbr")[0]
            s.payroll_registry_descr = dt.payroll_registry_descr
           


            h.post("../cRemitLedgerHDMF/GetPayrollRegistry", {

                payroll_registry_nbr: dt.payroll_registry_nbr

            }).then(function (d) {
                if (d.data.message == "success") {
                    s.PR_list = d.data.payroll_reg_list
                    s.fd.txtb_payroll_registry = dt.payroll_registry_nbr
                    s.fd.txtb_payroll_year = dt.payroll_year
                    s.fd.txtb_payroll_month = s.month_arr[parseInt(dt.payroll_month) - 1]
                }
            })
        
    }
    s.Select_Employee = function (id) {
       
            

            var dt = s.PR_list[id]
            L_or_C(dt)// define late or current

            s.employee_details = dt;
           
            s.fd.txtb_empl_id = dt.empl_id
            s.fd.txtb_payroll_ps = currency(dt.payroll_amount_ps)
            s.fd.txtb_payroll_gs = currency(dt.payroll_amount_gs)
            s.fd.txtb_hdmf_mpl_ln = currency(dt.hdmf_mpl_ln)
            s.fd.txtb_hdmf_cal_ln = currency(dt.hdmf_cal_ln)
            s.fd.txtb_hdmf_mp2 = currency(dt.hdmf_mp2)
            s.fd.txtb_hdmf_hse_ln = currency(dt.hdmf_hse_ln)
            s.fd.txtb_mid_nbr = dt.hdmf_mid_nbr
            if (s.remittancetype_code == "02") {

                s.hdmf_nbr = dt.hdmf_mid_nbr
            }
            else if (s.remittancetype_code == "03") {

                s.hdmf_nbr = dt.hdmf_mid_nbr

            }
            else if (s.remittancetype_code == "05") {
                s.hdmf_nbr = dt.hdmf_mp2_nbr

            }
            else if (s.remittancetype_code == "06") {
                s.hdmf_nbr = dt.hdmf_hln_nbr
            }
        

    }
  
    s.Open_Add_Modal = function () {
            s.cls_voucher_nbr = ""
            s.ta_voucher_nbr = false
            s.cls_empl_name = ""
            s.ta_empl_name = false
       
            $("#add_btn").removeClass("fa fa-plus-circle");
            $("#add_btn").addClass("fa fa-spinner fa-spin");

            s.PR_list = []
            s.isEdit = false
            s.modalTitle = "Add Record"
            s.fd.txtb_override_ps = ""
            s.fd.txtb_override_gs = ""
            s.fd.txtb_year = s.year
            s.fd.txtb_month = s.month
            s.fd.txtb_empl_type = s.empl_type
            s.fd.txtb_override_ps = ""

            h.post("../cRemitLedgerHDMF/GetVoucher").then(function (d) {
                s.voucher_list = d.data.voucher_list
                $("#hdmf_modal").modal("show")
                $("#add_btn").removeClass("fa fa-spinner fa-spin");
                $("#add_btn").addClass("fa fa-plus-circle");
            })
      
    }

    s.btn_edit_action = function (row_id, type) {
        s.cls_voucher_nbr = ""
        s.ta_voucher_nbr = false
        s.cls_empl_name = ""
        s.ta_empl_name = false
        s.row_id = row_id
       
        s.isEdit = true
        s.modalTitle = "Edit Record"
        var tname = s.grid
        var tdata = s.gdata
        var data = s[tdata][row_id]
        s.fd.txtb_override_ps = ""
        s.fd.txtb_override_gs = ""
        s.fd.txtb_year = s.year
        s.fd.txtb_month = s.month
        s.fd.txtb_empl_type = s.empl_type
        h.post("../cRemitLedgerHDMF/CheckData", { data: data }).then(function (d) {
            if (d.data.message == "found") {
                if (type == 1) {
                    L_or_C(data)
                  
                    s.voucher_nbr = data.voucher_nbr
                    s.fd.txtb_voucher_nbr = data.voucher_nbr + " - " + data.payroll_registry_descr
                    s.fd.txtb_mid_nbr = data.hdmf_mid_nbr
                    s.fd.txtb_empl_name = data.employee_name
                    s.fd.txtb_empl_id = data.empl_id
                    s.fd.txtb_payroll_registry = data.payroll_registry_nbr
                    s.fd.txtb_payroll_year = data.payroll_year
                    s.fd.txtb_payroll_month = s.month_arr[parseInt(data.payroll_month) - 1]
                    s.fd.txtb_payroll_ps = currency(data.payroll_amount_ps)
                    s.fd.txtb_payroll_gs = currency(data.payroll_amount_gs)
                    s.fd.txtb_uploaded_ps = currency(data.uploaded_amount_ps)
                    s.fd.txtb_uploaded_gs = currency(data.uploaded_amount_gs)
                    s.fd.txtb_override_ps = currency(data.override_amount_ps)
                    s.fd.txtb_override_gs = currency(data.override_amount_gs)
                    s.fd.txtb_member_prog = data.membership_program
                    s.fd.txtb_remarks = data.detailed_remarks
                    s.fd.txtb_remittance_status = data.remittance_status
                }
                else {
                    L_or_C(data)
                   
                    s.voucher_nbr = data.voucher_nbr
                    s.fd.txtb_voucher_nbr = data.voucher_nbr + " - " + data.payroll_registry_descr
                    s.fd.txtb_mid_nbr = data.hdmf_mid_nbr
                    s.fd.txtb_empl_name = data.employee_name
                    s.fd.txtb_empl_id = data.empl_id
                    s.fd.txtb_payroll_registry = data.payroll_registry_nbr
                    s.fd.txtb_payroll_year = data.payroll_year
                    s.fd.txtb_payroll_month = s.month_arr[parseInt(data.payroll_month) - 1]
                    if (s.remittancetype_code == "03") {
                        s.fd.txtb_hdmf_mpl_ln = currency(data.grid_amount_ps)
                    }
                    else if (s.remittancetype_code == "04") {
                        s.fd.txtb_hdmf_cal_ln = currency(data.grid_amount_ps)
                    }
                    else if (s.remittancetype_code == "05") {
                        s.fd.txtb_hdmf_mp2 = currency(data.grid_amount_ps)
                    }
                    else if (s.remittancetype_code == "06") {
                        s.fd.txtb_hdmf_hse_ln = currency(data.grid_amount_ps)
                    }

                }
                $("#hdmf_modal").modal("show")
            }
            else if (d.data.message == "not_found") {
                swal("Unable to Update, Data has been deleted by other user/s!", { icon: "warning", });

                var id = s[tname][0].id;
                var page = $("#" + id).DataTable().page.info().page
                s[tname].fnDeleteRow(row_id, null, true);
                s[tdata] = DataTable_data(tname)
                s[tdata].refreshTable(tname, "")
                changePage(tname, page, id)

            }
        })
       
        

       
    }
    s.btn_del_row = function (row_id, t) {
     
        var dt_name = s.gdata
        var tname = s.grid
        var dt = s[dt_name][row_id]
        h.post("../cRemitLedgerHDMF/CheckData", { data: dt }).then(function (d) {
            if (d.data.message == "found")
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
                        h.post("../cRemitLedgerHDMF/DeleteHdmfDetails", {
                            data: dt
                        }).then(function (d) {
                            if (d.data.message == "success") {

                                var id = s[tname][0].id;
                                var page = $("#" + id).DataTable().page.info().page

                                s[tname].fnDeleteRow(row_id, null, true);
                                s[dt_name] = DataTable_data(tname);
                                s[dt_name].refreshTable(tname, "")
                                changePage(tname, page, id)
                                swal("Your record has been deleted!", { icon: "success", });
                            }
                            else {
                                swal(d.data.message, { icon: "success", });
                            }
                        })
                    }
                    else
                    {

                    }
                })
            }
            else if (d.data.message == "not_found")
            {
                swal("Unable to delete, Data has been deleted by other user/s!", { icon: "warning", });
                var id = s[tname][0].id;
                var page = $("#" + id).DataTable().page.info().page
                s[tname].fnDeleteRow(row_id, null, true);
                s[tdata] = DataTable_data(tname)
                s[tdata].refreshTable(tname, "")
                changePage(tname, page, id)
            }
        })
        


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

    s.SaveHdmfEditDetails = function (dt) {
        var dt_name = s.gdata
        var tname = s.grid
        
        if (s.nosave) {
            return
        }
       

        var data = {
            remittance_ctrl_nbr: s.remit_ctrl_nbr.trim()
            , empl_id: dt.txtb_empl_id.trim()
            , voucher_nbr: s.voucher_nbr.trim()
            , payroll_amount_ps: dt.txtb_payroll_gs
            , payroll_amount_gs: dt.txtb_payroll_gs
            , uploaded_amount_ps: dt.txtb_uploaded_ps
            , uploaded_amount_gs: dt.txtb_uploaded_gs
            , override_amount_ps: validateEmpty(dt.txtb_override_ps)
            , override_amount_gs: validateEmpty(dt.txtb_override_gs)
            , remittance_status: validateEmpty(dt.ddl_override_status)
            , membership_program: validateEmpty(dt.txtb_member_prog)
            , detailed_remarks: validateEmpty(dt.txtb_remarks)
        }

        h.post("../cRemitLedgerHDMF/SaveHdmfEditDetails", { data: data }).then(function (d) {
            
            if (d.data.message == "success") {
                if (s.remittancetype_code == "02") {
                    s.Premium_Table_Data[s.row_id].grid_amount_ps = s.Premium_Table_Data.setIfNotempty("ps", dt.txtb_override_ps, s.row_id)
                    s.Premium_Table_Data[s.row_id].grid_amount_gs = s.Premium_Table_Data.setIfNotempty("gs", dt.txtb_override_gs, s.row_id)
                    s.Premium_Table_Data[s.row_id].override_amount_ps = dt.txtb_override_ps
                    s.Premium_Table_Data[s.row_id].override_amount_gs = dt.txtb_override_gs
                    s.Premium_Table_Data[s.row_id].membership_program = dt.txtb_member_prog
                    s.Premium_Table_Data[s.row_id].detailed_remarks = dt.txtb_remarks
                    s.Premium_Table_Data.refreshTable("premiumTable", dt.txtb_empl_id.trim())
                }
               
                swal("Your record has been edited!", { icon: "success", });

                $('#hdmf_modal').modal("hide")

            }
            else if (d.data.message == "not_found")
            {
                swal("Unable to delete, Data has been deleted by other user/s", { icon: "warning", });

                var id = s[tname][0].id;
                var page = $("#" + id).DataTable().page.info().page
                s[tname].fnDeleteRow(s.row_id, null, true);
                s[dt_name] = DataTable_data(tname);
                s[dt_name].refreshTable(tname, "")
                changePage(tname, page, id)
                $('#hdmf_modal').modal("hide")
            }
            else {
              
            }
        })
    }


    s.SaveHdmfDetails = function (dt) {

        var alwsaveov = alw_sve_ov()
        if (s.nosave) {

            return
        }
        if (!alwsaveov) {
            alert("Your are not allowed to save if no remittance status selected")
            return
        }
        if (elEmpty(s.fd.ddl_voucher_nbr)) {
            require_warning(true, "cls_voucher_nbr", "ta_voucher_nbr", "require-field")
            return
        }
        else {
            require_warning(false, "cls_voucher_nbr", "ta_voucher_nbr", "require-field")
        }
        if (elEmpty(s.fd.ddl_empl_name)) {
            require_warning(true, "cls_empl_name", "ta_empl_name", "require-field")
            return
        }
        else {
            require_warning(false, "cls_empl_name", "ta_empl_name", "require-field")
        }


        var data = {
            remittance_ctrl_nbr: s.remit_ctrl_nbr.trim()
            , empl_id: dt.txtb_empl_id.trim()
            , voucher_nbr: dt.ddl_voucher_nbr.trim()
            , payroll_amount_ps: selectValueForPS(s.remittancetype_code)
            , payroll_amount_gs: dt.txtb_payroll_gs
            , uploaded_amount_ps: 0.00 //change when 
            , uploaded_amount_gs: 0.00
            , override_amount_ps: validateEmpty(dt.txtb_override_ps)
            , override_amount_gs: validateEmpty(dt.txtb_override_gs)
            , remittance_status: validateEmpty(dt.ddl_override_status)
            , membership_program: validateEmpty(dt.txtb_member_prog)
            , detailed_remarks: validateEmpty("")
        }


        s.emplid = dt.txtb_empl_id.trim()
       


        h.post("../cRemitLedgerHDMF/SaveHdmfDetails", { data: data }).then(function (d) {
            

            if (d.data.message == "success") {
                
                if (s.remittancetype_code == "02") {
                    
                    data.hdmf_mid_nbr = dt.txtb_mid_nbr
                    data.grid_amount_ps = [data].setIfNotempty("ps", dt.txtb_override_ps, 0)
                    data.grid_amount_gs = [data].setIfNotempty("gs", dt.txtb_override_ps, 0)
                    data.employee_name = $("#empl_name option:selected").html();
                    data.payroll_registry_nbr = dt.txtb_payroll_registry
                    data.payroll_year = dt.txtb_payroll_year
                    data.payroll_month = s.month_arr.indexOf(dt.txtb_payroll_month) + 1
                    data.payroll_registry_descr = s.payroll_registry_descr
                    s.Premium_Table_Data.push(data)
                    s.Premium_Table_Data.refreshTable("premiumTable", dt.txtb_empl_id.trim())
                    $("#hdmf_modal").modal("hide")
                }
                else {
                   
                    data.payroll_registry_nbr = dt.txtb_payroll_registry
                    data.payroll_registry_descr = s.payroll_registry_descr
                    data.payroll_year = dt.txtb_payroll_year
                    data.payroll_month = s.month_arr.indexOf(dt.txtb_payroll_month) + 1
                    data.grid_amount_ps = selectValueForPS(s.remittancetype_code)
                    data.employee_name = $("#empl_name option:selected").html();

                  

                    data.hdmf_mid_nbr = dt.txtb_mid_nbr
                  
                    s.Loan_Table_Data.push(data)
                    s.Loan_Table_Data.refreshTable("loanTable", dt.txtb_empl_id.trim())
                    $("#hdmf_modal").modal("hide")
                }
                


                swal("Your record has been saved!", { icon: "success", timer: 1000 });

                $('#hdmf_modal').modal("hide")

            }
            else {
               
            }
        })
    }

    //s.ExctractToExcel = function () {

    //    var rc = s.remittancetype_code
    //    $("#extracting_data").modal("show")

    //    if (rc == "02" || rc == "05") {

    //        //h.post("../cRemitLedgerHDMF/ExctractToExcelPremiumsPhp", { rc: rc }).then(function (d) {
    //        //    console.log(d.data.hdmf)
    //        //    $("#extracting_data").modal("hide")
    //        //})

    //        h.post("../cRemitLedgerHDMF/ExctractToExcelPremiums", { rc: rc }).then(function (d) {

    //            if (d.data.message == "success") {
    //                $("#extracting_data").modal("hide")
    //                window.open(d.data.filePath, '', '');
    //            }
    //            else {
    //                $("#extracting_data").modal("hide")
    //                swal(d.data.message, { icon: "error" });
    //            }
    //        })
    //    }
    //    else {

    //        //h.post("../cRemitLedgerHDMF/ExctractToExcelLoansPhp", { rc: rc }).then(function (d) {
    //        //    console.log(d.data.hdmf)
    //        //    $("#extracting_data").modal("hide")
    //        //})

    //        h.post("../cRemitLedgerHDMF/ExctractToExcelLoans", { rc: rc }).then(function (d) {

    //            if (d.data.message == "success") {
    //                $("#extracting_data").modal("hide")
    //                window.open(d.data.filePath, '', '');
    //            }
    //            else {
    //                $("#extracting_data").modal("hide")
    //                swal(d.data.message, { icon: "success" });
    //            }
    //        })
    //    }

    //}

    s.ExctractToExcel = function () {

       
        var rc = s.remittancetype_code
        var remittance_year = $("#remittanceyear").val()
        var remittance_month_descr = $("#remittance_month_descr").val()
        $("#extracting_data").modal("show")

        

        if (rc == "02" || rc == "05") {

            var premium_name = ""

            if (rc == "02") {
                premium_name = "HDMF Premiums"
            }
            else if (rc == "05") {
                premium_name = "HDMF MP2"
            }
            else {
                premium_name = ""
            }
            h.post("../Menu/GetToken").then(function (d) {
                var token = { token: d.data.token }

                h.post(excelExportServer + "/api/remittance/verify-token", token, { responseType: 'arraybuffer' }

                ).then(function (response) {

                    if (response.data) {
                        h.post("../cRemitLedgerHDMF/ExctractToExcelPremiumsPHP",{ rc: rc }).then(function (d) {
                            var hdmf = d.data.hdmf_grouped
                            var mp = d.data.mp
                            h.post(excelExportServer + "/api/export/hdmf-premiums-export", {
                                 data: hdmf
                                ,mp:mp
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
                                    const name = premium_name + "-" + remittance_year + "-" + remittance_month_descr + "-" + s.empl_type + ".xlsx"
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

                        })
                    }

                }).catch(function (error, response) {
                    swal("Token expired! please generate new token.", { icon: "error" })
                    console.error('Token expired! please generate new token :', error);
                    $("#extracting_data").modal("hide");
                });


            })

        }

        else {

            var loan_name = ""

            if (rc == "03") {
                loan_name = "HDMF MPL "
            }
            else if (rc == "04") {
                loan_name = "HDMF CALAMITY "
            }
            else if (rc == "06") {
                loan_name = "HDMF HOUSING "
            }
            else {
                loan_name = ""
            }

            h.post("../Menu/GetToken").then(function (d) {
                var token = { token: d.data.token }
                h.post(excelExportServer +"/api/remittance/verify-token", token, { responseType: 'arraybuffer' }

                ).then(function (response3) {
                    if (response3.data) {
                        h.post("../cRemitLedgerHDMF/ExctractToExcelLoansPhp", { rc: rc }).then(function (d) {

                            var hdmf = d.data.hdmf_grouped
                          
                            h.post(excelExportServer +"/api/export/hdmf-loans-export", {
                                data: hdmf
                            }, { responseType: 'arraybuffer' }
                            ).then(function (response4) {

                                // Check the response data
                                if (response4.data) {
                                    // Create a Blob from the response data
                                    const csvBlob = new Blob([response4.data], { type: 'text/csv;charset=utf-8;' });
                                    // Generate a URL for the Blob
                                    const downloadUrl = window.URL.createObjectURL(csvBlob);

                                    // Create an anchor element and set its href attribute to the Blob URL
                                    const link = document.createElement('a');
                                    link.href = downloadUrl;

                                    // Set the download attribute with a dynamic filename
                                    //const name = new Date().toLocaleString().replace(/[/,\\:*?"<>|]/g, '_');
                                    const name = loan_name+"Loans-" + remittance_year + "-" + remittance_month_descr + "-" + s.empl_type + ".xlsx"
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

                        })
                    }

                }).catch(function (error, response) {
                    swal("Token expired! please generate new token.", { icon: "error" })
                    console.error('Token expired! please generate new token :', error);
                    $("#extracting_data").modal("hide");
                });


            })
        }

    }
   
    //s.ExctractToExcel = function () {

    //    var rc = s.remittancetype_code
    //    $("#extracting_data").modal("show")

    //    if (rc == "02" || rc == "05") {
          
    //        h.post("../cRemitLedgerHDMF/ExctractToExcelPremiums", { rc: rc }).then(function (d) {
              
    //            if (d.data.message == "success") {
    //                    $("#extracting_data").modal("hide")
    //                    window.open(d.data.filePath, '', '');
    //            }
    //            else {
    //                $("#extracting_data").modal("hide")
    //                swal(d.data.message, { icon: "error" });
    //            }
    //        })
    //    }
    //    else
    //    {
    //        h.post("../cRemitLedgerHDMF/ExctractToExcelLoans", { rc: rc }).then(function (d) {
               
    //            if (d.data.message == "success") {
    //                    $("#extracting_data").modal("hide")
    //                       window.open(d.data.filePath, '', '');
    //            }
    //            else {
    //                $("#extracting_data").modal("hide")
    //                swal(d.data.message, { icon: "success" });
    //            }
    //        })
    //    }

    //}

    s.ExctractToExcelCheck = function () {

        var rc = s.remittancetype_code
        $("#extracting_data").modal("show")
        if (rc == "02" || rc == "05") {

            h.post("../cRemitLedgerHDMF/ExctractToExcelPremiumsCheck", { rc: rc }).then(function (d) {

                if (d.data.message == "success") {
                    $("#extracting_data").modal("hide")
                    window.open(d.data.filePath, '', '');
                }
                else {
                    $("#extracting_data").modal("hide")
                    swal(d.data.message, { icon: "error" });
                }
            })
        }
        //else {
        //    h.post("../cRemitLedgerHDMF/ExctractToExcelLoansCheck", { rc: rc }).then(function (d) {

        //        if (d.data.message == "success") {
        //            $("#extracting_data").modal("hide")
        //            window.open(d.data.filePath, '', '');
        //        }
        //        else {
        //            $("#extracting_data").modal("hide")
        //            swal(d.data.message, { icon: "success" });
        //        }
        //    })
        //}

    }

    s.FILTER_LETTER = function () {
        $("#spinner_load").modal("show")
        var D = ""
        var L = ""
        var V = ""
        L = s.ddl_letter
        D = s.ddl_dept
        V = s.view_option
       
        getFilterResult(D, L, V)

    }
    s.FILTER_DEPARTMENT = function () {
        $("#spinner_load").modal("show")
        var D = ""
        var L = ""
        var V = ""
        L = s.ddl_letter
        D = s.ddl_dept
        V = s.view_option
       
        getFilterResult(D, L, V)

    }

    s.viewOption = function () {
        $("#spinner_load").modal("show")
        var D = ""
        var L = ""
        var V = ""
        L = s.ddl_letter
        D = s.ddl_dept
        V = s.view_option
        
        getFilterResult(D, L, V)

    }
    //function filterEmpty() {
    //    var d = s.ddl_dept
    //    var l = s.ddl_letter
    //    if (l == "" && d == "") {

    //        swal("Please select filter", { icon: "warning" });
    //        $("#spinner_load").modal("hide")
    //        return true
    //    }
    //    else {
    //        return false
    //    }
    //}
    function getFilterResult(D, L, V) {
        h.post("../cRemitLedgerHDMF/GetInfoResult", {
            dep: D,
            letter: L,
            v_opt : V
        }).then(function (d) {
            if (d.data.message == "success") {
                d.data.details.populate_DT(s.remittancetype_code)
                $("#spinner_load").modal("hide")
            }
            else
            {
                $("#spinner_load").modal("hide")
            }
        })

    }


    s.ps_override_blur = function (el) {

        if (isCurrency(w_dc(el))) {
            s.nosave = false
            require_warning(false, "cls_override_ps", "ta_override_ps", "require-field")
            s.fd.txtb_override_ps = s.val
            s.ps_vld = 1

        }
        else {
            s.nosave = true
            require_warning(true, "cls_override_ps", "ta_override_ps", "require-field")
            s.ps_vld = 0
        }

        alw_rmt_st()
    }

    s.gs_override_blur = function (el) {

        if (isCurrency(w_dc(el))) {
            s.nosave = false
            require_warning(false, "cls_override_gs", "ta_override_gs", "require-field")
            s.fd.txtb_override_gs = s.val
            s.gs_vld = 1

        }
        else {
            s.nosave = true
            require_warning(true, "cls_override_gs", "ta_override_gs", "require-field")
            s.gs_vld = 0
        }

        alw_rmt_st()
    }



    //*** format overrides value into money with two decimal zeros onblur***
    function w_dc(n) {
        s.val = ""
        var dot = 0
        var c = 0
        var nu = 0
        var v = 0
        var fDot = false
        var nl = n[L]
        for (var i = 0; i < nl ; i++) {
            if (i == 0 && n[i] == ".") {
                fDot = true
            }

            if (isNaN(n[i])) {
                c += 1
            }
            else {
                nu += 1
            }
            if (n[i] == '.') {
                nu += 1
                dot += 1
            }
        }

        if (elEmpty(n)) {

            s.val = "0.00"
            return "0.00"
        }
        else if (fDot) {

            s.val = "0" + n

            return "0" + n
        }
        else if (nu == nl && dot == 0) {

            s.val = n + ".00"
            return n + ".00"
        }
        else if (nu == nl && dot == 1) {

            s.val = n
            return n

        }
        else {
            return "invalid"
        }


    }


    //*** test if overrides value is a valid money value****
    function isCurrency(nbr) {
        var regex = /^\d+(?:\.\d{0,2})$/;

        if (regex.test(nbr)) {
            return true
        }
        else {
            return false
        }

    }




    //**** Enable disbale remittance status field if oveerrides value is not empty ******
    function alw_rmt_st() {
        var o_ps = s.fd.txtb_override_ps
        var o_gs = s.fd.txtb_override_gs
        
        var eps = elEmpty(o_ps)
        var egs = elEmpty(o_gs)
        
        var pv = s.ps_vld
        var gv = s.gs_vld
        var ps_v = (!eps && pv == 1)
        var gs_v = (!egs && gv == 1)
      
       
        if (eps && egs)
        {
            s.fd[dos] = "N"
            s.isOverride = false
        }
        else
        {
            s.isOverride = true
        }
        //else if (eps == false) {
        //    s.fd[dos] = "N"
        //    s.isOverride = true
        //}
        //else if (egs == false) {
        //    s.fd[dos] = "N"
        //    s.isOverride = true
        //}
        //else if (!eps && !egs)
        //{
        //    s.fd[dos] = "N"
        //    s.isOverride = true
        //}
        //else if (o_ps == "0.00" && o_gs == "0.00") {
        //    s.fd[dos] = "N"
        //    s.isOverride = false
        //}
       
        //else if(eps && egs)
        //{
        //    s.fd[dos] = "N"
        //    s.isOverride = false
        //}
        //else if (o_ps == "0.00" && o_gs != "0.00") {
            
        //    s[ov] = true
        //}
        //else if (o_ps != "0.00" && o_gs == "0.00") {
        //    s.fd[dos] = "N"
        //    s[ov] = true
        //}
        
    }

    // allow saving if overrides and remitance status is validated
    function alw_sve_ov() {
        var retVal = false
        var o_ps = s.fd.txtb_override_ps
        var o_gs = s.fd.txtb_override_gs
        var ps_st = (!elEmpty(o_ps) && s[ov])
        var gs_st = (!elEmpty(o_gs) && s[ov])
        var gp_st = (!elEmpty(o_ps) && !elEmpty(o_gs) && s[ov])
        var gp_st_nt = (elEmpty(o_ps) && elEmpty(o_gs) && !s[ov])

        if (ps_st) {
            retval = true
        }
        else if (gs_st) {
            retval = true

        }
        else if (gp_st) {
            retval = true

        }
        else if (gp_st_nt) {
            retval = true

        }
        else {
            retval = false

        }
        return retval
    }


    // define late or current remittance
    function L_or_C(ob) // 
    {
       
        s.override_status_list = []
        var L = "late"
        var C = "current"
        var py = parseInt(ob.payroll_year)
        var pm = parseInt(ob.payroll_month)
        var ry = parseInt(s[y]) //remittance year
        var rm = parseInt(s[mn]) //remittance month
       
       
        var cycm = (py < ry && pm < rm) //current
        var lylm = (py > ry && pm > rm) //late
        var lycm = (py > ry && pm < rm) //late
        var cylm = (py < ry && pm > rm) //late
        var ccylm = (py == ry && pm > rm) // late
        var ccycm = (py == ry && pm < rm) // current
        var ccyccm = (py == ry && pm == rm)
        var retval = ""
        var list = []

        if (cycm) {
            list = ov_lst("C")
            retval = C
        }
        else if (lylm) {
            list = ov_lst("L")
            retval = L
        }
        else if (lycm) {
            list = ov_lst("L")
            retval = L
        }
        else if (cylm) {
            list = ov_lst("L")
            reval = L
        }
        else if (ccylm) {
            list = ov_lst("L")
            retval = L
        }
        else if (ccycm) {
            list = ov_lst("C")
            retval = C
        }
        else if (ccyccm) {
            list = ov_lst("C")
            retval = C
        }

        s.override_status_list = list
        
        return retval
    }


    // filter overrride status list 
    function ov_lst(t) {
        var lst = []
        if (t == "L") {
            lst = s[os].deletebyprop("2", "id")
        }
        else if (t == "C") {
            lst = s[os].deletebyprop("1", "id")
        }
        return lst
    }


    Array.prototype.populate_DT = function (rt) {

        if (rt == "02") {
            s.Premium_Table_Data = this
            s.Premium_Table_Data.refreshTable("premiumTable", "")

        } else {

            s.Loan_Table_Data = this
            s.Loan_Table_Data.refreshTable("loanTable", "")

        }

    }
    function validateEmpty(data) {

        if (data == null || data == "" || data == undefined) {
            return ""
        }
        else {
            return data
        }

    }
    function vNumber(data) {

        if (data == null || data == "" || data == undefined) {
            return 0
        }
        else {
            return data
        }

    }
    function elEmpty(data) {
        if (data == null || data == "" || data == undefined) {
            return true
        }
        else {
            return false
        }

    }
    function require_warning(bol, fieldClass, txtclass, classname) {
        if (bol) {
            s[txtclass] = true
            s[fieldClass] = classname
        }
        else {
            s[txtclass] = false
            s[fieldClass] = ""

        }


    }
    function selectValueForPS(param) {

        var dt = s.employee_details;
        var rtype = param.trim()

        var retdata = ""
        if (rtype == "02") {
            retdata = dt.payroll_amount_ps
        }
        else if (rtype == "03") {
            retdata = dt.hdmf_mpl_ln
        }
        else if (rtype == "04") {
            retdata = dt.hdmf_cal_ln
        }
        else if (rtype == "05") {
            retdata = dt.hdmf_mp2
        }
        else if (rtype == "06") {
            retdata = dt.hdmf_hse_ln
        }
        return retdata
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
    function clearFields() {


        s.fd.txtb_payroll_ps = ""
        s.fd.txtb_hdmf_mpl_ln = ""
        s.fd.txtb_hdmf_cal_ln = ""
        s.fd.txtb_hdmf_mp2 = ""
        s.fd.txtb_hdmf_hse_ln = ""
        s.fd.txtb_payroll_gs = ""

        s.fd.txtb_override_ps = ""
        s.fd.txtb_override_gs = ""
        s.fd.txtb_member_prog = ""
        s.fd.txtb_remarks = ""
        s.fd.ddl_empl_name = ""
        s.fd.txtb_empl_id = ""

    }


    Array.prototype.setIfNotempty = function (prop, val, row) {
        var data = this[row]
        var prop2 = ""
        var retbval = ""


        if (prop == "ps") {
            prop2 = "payroll_amount_ps"
        }
        else {
            prop2 = "payroll_amount_gs"

        }
        var retval = ""

        if (val == null || val == "" || val == undefined || val == 0) {
            retval = data[prop2]
        }
        else {
            retval = val
        }
        return retval
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

    Array.prototype.select = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] == code
        })
    }
    Array.prototype.delete = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    Array.prototype.deletebyprop = function (code, prop) {
       
        return this.filter(function (d) {
            return d[prop] != code
        })
    }

    //jQuery functions
    $('#hdmf_modal').on('show.bs.modal', function (e) {
        s.isOverride = false
    })
    $('#hdmf_modal').on('hidden.bs.modal', function (e) {
        clearForm()
    })


    function clearForm()
    {
        s.fd.ddl_voucher_nbr = 0

        s.fd.txtb_payroll_year = ""
        s.fd.txtb_payroll_month = ""
        s.fd.txtb_empl_name = ""
        s.fd.ddl_empl_name = -1
        s.fd.txtb_mid_nbr = ""

        s.fd.txtb_payroll_registry = ""
        s.fd.ddl_empl_name = 0
        s.fd.txtb_empl_id = ""
        s.fd.txtb_payroll_ps = ""
        s.fd.txtb_hdmf_mpl_ln = ""
        s.fd.txtb_hdmf_cal_ln = ""
        s.fd.txtb_hdmf_mp2 = ""
        s.fd.txtb_hdmf_hse_ln = ""
        s.fd.txtb_payroll_gs = ""
        s.fd.txtb_uploaded_ps = ""
        s.fd.txtb_uploaded_gs = ""
        s.fd.txtb_override_ps = ""
        s.fd.txtb_override_gs = ""
        s.fd.txtb_member_prog = ""
        s.fd.txtb_remarks = ""
        s.fd.txtb_remittance_status = ""
        s.fd.txtb_voucher_nbr = ""
        
       
       
    }

    //********************************************************************/
    //*** VJA : 2021-07-21 - This Function is for Grand Total Viewing****//
    //********************************************************************/
    s.btn_view_grand_total = function ()
    {
        h.post("../cRemitLedgerHDMF/RetrieveGrandTotal",
            {
                par_remittance_ctrl_nbr: s.remit_ctrl_nbr.trim()
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
                    s.txtb_year                 = $('#remittanceyear').val();
                    s.txtb_month                = $('#remittance_month_descr').val();
                    
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


})

//function addFaSpinner(el)
//{
//    $(el).addClass("fa fa-spinner fa-spin")
//}

//function removeFaSpinner(el) {
//    $(el).removeClass("fa fa-spinner fa-spin")
//}
//ng_HRD_App.directive('currFormatter', function () {


//})

//ng_HRD_App.directive('toCurrency', function ($filter) {
//    //https://embed.plnkr.co/plunk/JXJIxR

//    return {
//        scope: {
//            ngModel:    '=',
//            prefix:     '=',
//            decimals:   '='
//        },
//        link: function (scope, el, attrs) {
//            var mm = $filter('currency')(scope.ngModel, scope.prefix, scope.decimals);//"$" + scope.ngModel


//            el.bind('focus', function () {
//                old = scope.ngModel;
//                el.val(scope.ngModel);
//            });


//            function formatNumber(n) {
//                return n.replace(/\.\d{0,2}/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")

//            }

//            //el.bind('input', function () {
//            //    currencyRegex = /^(?!0\.00)\d{1,10}(,\d{3})*(\.\d\d)?$/;
//            //    if (currencyRegex.test(el.val())) {

//            //        scope.ngModel = el.val();
//            //        scope.$apply();
//            //    }
//            //});

//            el.bind('keyup', function () {

//                //var mm = $filter('currency')(scope.ngModel, scope.prefix, scope.decimals);
//                var mm = formatNumber(scope.ngModel);
//               
//                if (mm)
//                    el.val(mm);
//            });
//            el.bind('blur', function () {

//                var mm = formatNumber(scope.ngModel);
//               
//                if (mm)
//                    el.val(mm);
//            });
//        }
//    }
//});