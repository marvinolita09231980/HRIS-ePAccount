ng_HRD_App.controller("cRemitLedgerGSIS_ctrlr", function ($scope, $compile, $http, $filter,$q) {
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
    var prevVal = []
    var wdc = new w_dc([])
    var excelExportServer = "";

    s.fd = []
    s.rj = {}
    s.fd.txtb_year = ""
    s.fd.txtb_month = ""
    s.fd.txtb_empl_type = ""
    s.hasInvalid = 0;
    s.isEdit = false
    s.remittance_status = ""
    s.monthnames = [
       { id: "01", text: "January" },
       { id: "02", text: "February" },
       { id: "03", text: "March" },
       { id: "04", text: "April" },
       { id: "05", text: "May" },
       { id: "06", text: "June" },
       { id: "07", text: "July" },
       { id: "08", text: "August" },
       { id: "09", text: "September" },
       { id: "10", text: "October" },
       { id: "11", text: "November" },
       { id: "12", text: "December" },
    ]


    s.monthName = function (mo) {
        var retval = ""
        retval = s.monthnames.filter(function (d) {
            return d.id == mo
        })[0].text
        return retval
    }
    s.rowLen = "5"

    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    var alp = "alphabet_list"
    s.alphabet_list = [
        { id: 'a', alpha_name: 'A' }, { id: 'b', alpha_name: 'B' }, { id: 'c', alpha_name: 'C' }, { id: 'd', alpha_name: 'D' }, { id: 'e', alpha_name: 'E' }, { id: 'f', alpha_name: 'F' },
        { id: 'g', alpha_name: 'G' }, { id: 'h', alpha_name: 'H' }, { id: 'i', alpha_name: 'I' }, { id: 'j', alpha_name: 'J' }, { id: 'k', alpha_name: 'K' }, { id: 'l', alpha_name: 'L' },
        { id: 'm', alpha_name: 'M' }, { id: 'n', alpha_name: 'N' }, { id: 'o', alpha_name: 'O' }, { id: 'p', alpha_name: 'P' }, { id: 'q', alpha_name: 'Q' }, { id: 'r', alpha_name: 'R' },
        { id: 's', alpha_name: 'S' }, { id: 't', alpha_name: 'T' }, { id: 'u', alpha_name: 'U' }, { id: 'v', alpha_name: 'V' }, { id: 'w', alpha_name: 'W' }, { id: 'x', alpha_name: 'X' },
        { id: 'y', alpha_name: 'Y' }, { id: 'z', alpha_name: 'Z' }

    ]

    var month = ["January  ", "February ", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December "]

    var osl = "override_status_list"
    var os = "override_status"
    

    s.gsis_status = [
          { id: "N", text: "In Remittance but not in Uploaded   " }
        , { id: "U", text: "In Uploaded but not in Remittance   " }
        , { id: "A", text: "In Remittance and in Uploaded   " }
        , { id: "V", text: "With Overrides   " }
        , { id: "E", text: "With Error in Uploaded File   " }
        , { id: "F", text: "For Refund   " }
        , { id: "J", text: "Rejected" }

    ]

    var Init_GSIS_Data = function (par_data) {
        s.GSIS_Table_Data = par_data;
        s.GSISTable = $('#gsis_grid').dataTable(
            {
                data: s.GSIS_Table_Data,
                sDom: 'rt<"bottom"ip>',
                "order": [[2, "asc"]],
                pageLength: 10,
                deferRender: true,
                columns: [
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },

                    {
                        "mData": "voucher_nbr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": "p_sif_gs",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },

                    {
                        "mData": "p_gsis_ps",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "p_gsis_gs",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "dtl_status",
                        "mRender": function (data, type, full, row) {
                            var status_descr = ''
                            var status_class = ''
                            var icon = "<i class='fa fa-check'></i>"
                            if (data == "V")
                            {
                                status_descr = "With Overrides"
                                status_class = 'danger'
                                icon = "<i class='fa fa-edit'></i>"
                            }

                            else
                            {
                                status_descr = "Actual"
                                status_class = 'success'
                                icon = "<i class='fa fa-check'></i>"
                            }
                            return "&nbsp;&nbsp;<span class='badge badge-" + status_class + "'>" + icon+status_descr+"</span>"
                           
                          
                          
                        }
                    },
                    //{
                    //    "mData": "o_gsis_ps",
                    //    "mRender": function (data, type, full, row) {
                    //        var retdata = currency(data)
                    //        return "<span class='text-right btn-block'>" + retdata + "</span>"
                    //    }
                    //},
                    //{
                    //    "mData": "o_gsis_gs",
                    //    "mRender": function (data, type, full, row) {
                    //        var retdata = currency(data)
                    //        return "<span class='text-right btn-block'>" + retdata + "</span>"
                    //    }
                    //},

                    {
                        "mData": "payroll_month",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + month[parseInt(data) - 1] + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_year",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            var isDisabled = false

                            if (s.remittance_status != "N") {
                                isDisabled = true
                            }

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm action" ng-click="btn_edit_action(' + row["row"] + ')" >  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm action" ng-disabled="' + isDisabled +'" ng-click="btn_del_row(' + row["row"] + ')">   <i id="del_row' + row["row"] + '" class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    },
                    {
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block' style='display: none; border:none;'>" + data.substring(0, 1) + "</span>"
                        }
                    }


                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope);  //add this to compile the DOM
                },

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }
    var Rej_GSIS_Data = function (par_data) {
        s.GSIS_Rej_Data = par_data;
        s.RejTable = $('#rejected_grid').dataTable(
            {
                data: s.GSIS_Rej_Data,
                sDom: 'rt<"bottom"ip>',
                "order": [[1, "asc"]],
                pageLength: 10,
                deferRender: true,
                columns: [
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },

                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_year",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    }, {
                        "mData": "payroll_month",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + month[parseInt(data) - 1] + "</span>"
                        }
                    },
                    {
                        "mData": "f_sif_gs",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },

                    {
                        "mData": "f_gsis_ps",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": "f_gsis_gs",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block'>" + retdata + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            //if(full["remittance_status_dtl"] == "J")
                            //{
                            //    return  '<center><d iv>' +
                            //            '<input type="checkbox" class="form-control btn-reject btn-check' + row["row"] + '" ng-click="btn_check(' + row["row"] + ')" checked/>' +
                            //            '</div></center>'
                            //}
                            //else
                            //{
                            //    return '<center><div>' +
                            //           //'<input type="checkbox"  class="form-control btn-reject btn-check' + row["row"] + '" ng-click="btn_check(' + row["row"] + ')" />' +
                            //            '<button type="button" class="btn btn-danger btn-sm action" ng-click="btn_del_row(' + row["row"] + ')">   <i id="del_row' + row["row"] + '" class="fa fa-edit"></i></button>' +
                            //           '</div></center>'
                            //}
                            return '<center><div>' +
                                   '<button type="button" class="btn btn-info btn-sm action" ng-click="btn_check(' + row["row"] + ')"> <i id="del_row' + row["row"] + '" class="fa fa-edit"></i></button>' +
                                   '</div></center>'
                           
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope);  //add this to compile the DOM
                },

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    function addvalue(id, value) {
        $("#" + id).val(value)
        s[id] = value
    }

     s.gsis_status
    function init() {
        s.rowLen = "10";
        s.rejected = false
        s.checkOption = "Check Option"
        $("#spinner_load").modal("show")
        s.ddl_dept = ""
        s.reject = true
        s.ddl_letter = ""
        s.fd[dos] = "N"
        s.search_name = ""
        s.ch_btn_name = "Check All"
        s.view_option = "1"
        s.extracting = false
        s.isOverride = false
        h.post("../cRemitLedgerGSIS/initializeData", { l: s.ddl_letter, v_opt: s.view_option }).then(function (d) {
            excelExportServer = d.data.excelExportServer
            s.department_list = d.data.department_list
            s.GSIS_Table_Data = d.data.details
            prevVal = d.data.prevVal

            s.remittance_status = d.data.remittance_status
            //console.log(d.data.details)
            Init_GSIS_Data(d.data.details)
            Rej_GSIS_Data([])
            
            RemittanceStatus(d.data.remittance_status)
         
            $("#spinner_load").modal("hide")
        })
    }

    init()
    function RemittanceStatus(n)
    {
        switch (n.toString().trim())
        {
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
    s.search_in_list = function (value, table)
    {
        $("#" + table).DataTable().search(value).draw();
        $("#rejected_grid").DataTable().search(value).draw();
    }

    s.lbl_payroll_month = "Payroll Month"
    s.search_in_list_month = function (value, table) {
        s.lbl_payroll_month = value
        if (value == "")
        {
            s.lbl_payroll_month = "Payroll Month"
        }
        $("#" + table).DataTable().column(8).search(value).draw();
        $("#rejected_grid").DataTable().column(8).search(value).draw();
    }

    s.search_in_list_letter = function (value, table) {

      

        $("#" + table).DataTable().column(11).search(value).draw();
        $("#rejected_grid").DataTable().column(11).search(value).draw();

    }

    s.setNumOfRow = function (value, table) {

        $("#" + table).DataTable().page.len(s.rowLen).draw();
        $("#rejected_grid").DataTable().page.len(s.rowLen).draw();

    }

    //s.Select_Voucher = function (vouch_nbr) {

    //    clearFields()
    //    var dt = s.voucher_list.select(vouch_nbr, "voucher_nbr")[0]

    //   


    //    h.post("../cRemitLedgerHDMF/GetPayrollRegistry", {

    //        payroll_registry_nbr: dt.payroll_registry_nbr

    //    }).then(function (d) {
    //        if (d.data.message == "success") {
    //            s.PR_list = d.data.payroll_reg_list


    //        }

    //    })
    //}


    s.Select_Employee = function (id) {
        var dt = s.reg_names[id]
        s.employee_details = dt
        
        addValueToForm(dt)
    }

    s.Open_Add_Modal = function () {
        s.edit_disable = false
        s.isEdit = false

        s.modalTitle = "Add Record"
        $("#btn_add").removeClass("fa fa-plus-circle");
        $("#btn_add").addClass("fa fa-spinner fa-spin");

        h.post("../cRemitLedgerGSIS/GetVoucher").then(function (d) {
           
            s.reg_list = d.data.voucher_list
            $("#detail_modal").modal("show")
            $("#btn_add").removeClass("fa fa-spinner fa-spin");
            $("#btn_add").addClass("fa fa-plus-circle");
        })
    }
    s.Save_Details = function (fd) {
    
        $("#save").removeClass("fa fa-save");
        $("#save").addClass("fa fa-spinner fa-spin");
        
       
        if (elEmpty(fd.ddl_payroll_reg))
        {
            require_warning(true, "cls_voucher", "ta_voucher", "require-field")
            $("#save").removeClass("fa fa-spinner fa-spin");
            $("#save").addClass("fa fa-save");
            return
        }
        else
        {
            require_warning(false, "cls_voucher", "ta_voucher", "require-field")
        }
        if (elEmpty(fd.ddl_empl_name)) {
            require_warning(true, "cls_employee", "ta_employee", "require-field")
            $("#save").removeClass("fa fa-spinner fa-spin");
            $("#save").addClass("fa fa-save");
            return
        }
        else {
            require_warning(false, "cls_employee", "ta_employee", "require-field")
        }
        if (elEmpty(s.fd.remit_status))
        {
            require_warning(true, "cls_status", "ta_status", "require-field")
            $("#save").removeClass("fa fa-spinner fa-spin");
            $("#save").addClass("fa fa-save");
            return
        }
        else {
            require_warning(false, "cls_status", "ta_status", "require-field")
        }
        var dt = getFormValue(s.employee_details)

      
       
        h.post("../cRemitLedgerGSIS/Save_Details", {
            data: dt
        }).then(function (d) {

          
            if (d.data.message == "success") {
                dt.employee_name = s.employee_name
                dt.payroll_year = fd.txtb_payroll_year
                dt.payroll_month = fd.txtb_payroll_month
                dt.payroll_registry_descr = s.payroll_registry_descr
                dt.payroll_registry_nbr = s.payroll_registry_nbr
                s.GSIS_Table_Data.push(dt)
                s.GSIS_Table_Data.refreshTable("GSISTable", dt.empl_id)
                swal("Your record has been saved!", { icon: "success", });
                $("#save").removeClass("fa fa-spinner fa-spin");
                $("#save").addClass("fa fa-save");
                s.fd.ddl_payroll_reg = 1
                s.fd.ddl_empl_name = 1
                clearForm();
                $("#detail_modal").modal("hide")
            }

        })
    }

    s.Save_Reject = function (rj) {
        var chk = checkinvalid()
      
        if (chk)
        {
            swal({
                title:"Save Field",
                text:"Fields in red border has invalid value, make sure that it is a valid money value!",
                icon: "warning" ,
            });
            return
        }
       
        
        h.post("../cRemitLedgerGSIS/Save_Reject", {dt:rj}).then(function (d) {
            if(d.data.message == "success")
            {
                swal("Rejected amount successfully added as float", { icon: "success", });
                s.GSIS_Rej_Data[s.rowid].f_gsis_gs                  = rj.float_amount_gs
                s.GSIS_Rej_Data[s.rowid].f_gsis_ps                  = rj.float_amount_ps
                s.GSIS_Rej_Data[s.rowid].f_sif_gs                   = rj.float_sif_gs
                s.GSIS_Rej_Data[s.rowid].f_gsis_uoli                = rj.float_gsis_uoli
                s.GSIS_Rej_Data[s.rowid].f_gsis_ehp                 = rj.float_gsis_ehp
                s.GSIS_Rej_Data[s.rowid].f_gsis_hip                 = rj.float_gsis_hip
                s.GSIS_Rej_Data[s.rowid].f_gsis_ceap                = rj.float_gsis_ceap
                s.GSIS_Rej_Data[s.rowid].f_gsis_addl_ins            = rj.float_gsis_addl_ins
                s.GSIS_Rej_Data[s.rowid].f_gsis_conso_ln            = rj.float_gsis_conso_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_policy_reg_ln       = rj.float_gsis_policy_reg_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_policy_opt_ln       = rj.float_gsis_policy_opt_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_emergency_ln        = rj.float_gsis_emergency_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_ecard_ln            = rj.float_gsis_ecard_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_educ_asst_ln        = rj.float_gsis_educ_asst_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_real_state_ln       = rj.float_gsis_real_state_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_sos_ln              = rj.float_gsis_sos_ln
                s.GSIS_Rej_Data[s.rowid].f_gsis_help                = rj.float_gsis_help
                s.GSIS_Rej_Data[s.rowid].remittance_status_dtl      = fd.remit_status

                s.GSIS_Rej_Data[s.rowid].f_other_loan2              = rj.float_other_loan2
                s.GSIS_Rej_Data[s.rowid].f_other_loan1              = rj.float_other_loan1
              
                
                s.GSIS_Rej_Data[s.rowid].infloat                    = 1;

                s.GSIS_Rej_Data.refreshTable("RejTable", s.empl_id)
                $("#reject_detail_modal").modal("hide");
              
            }
        })

    }

    s.Save_Edit_Reject = function (rj) {
        var chk = checkinvalid()
        
        if (chk) {
               swal({
                title:"Save Field",
                text:"Fields in red border has invalid value, make sure that it is a valid money value!",
                icon: "warning", 
            });
            return
        }
      
        h.post("../cRemitLedgerGSIS/Save_Edit_Reject", { dt: rj }).then(function (d) {
            if (d.data.message == "success") {
                swal("Rejected amount in float successfully edited", { icon: "success", });
                s.GSIS_Rej_Data[s.rowid].f_gsis_gs              = rj.float_amount_gs           
                s.GSIS_Rej_Data[s.rowid].f_gsis_ps              = rj.float_amount_ps           
                s.GSIS_Rej_Data[s.rowid].f_sif_gs               = rj.float_sif_gs              
                s.GSIS_Rej_Data[s.rowid].f_gsis_uoli            = rj.float_gsis_uoli           
                s.GSIS_Rej_Data[s.rowid].f_gsis_ehp             = rj.float_gsis_ehp            
                s.GSIS_Rej_Data[s.rowid].f_gsis_hip             = rj.float_gsis_hip            
                s.GSIS_Rej_Data[s.rowid].f_gsis_ceap            = rj.float_gsis_ceap           
                s.GSIS_Rej_Data[s.rowid].f_gsis_addl_ins        = rj.float_gsis_addl_ins       
                s.GSIS_Rej_Data[s.rowid].f_gsis_conso_ln        = rj.float_gsis_conso_ln       
                s.GSIS_Rej_Data[s.rowid].f_gsis_policy_reg_ln   = rj.float_gsis_policy_reg_ln  
                s.GSIS_Rej_Data[s.rowid].f_gsis_policy_opt_ln   = rj.float_gsis_policy_opt_ln  
                s.GSIS_Rej_Data[s.rowid].f_gsis_emergency_ln    = rj.float_gsis_emergency_ln   
                s.GSIS_Rej_Data[s.rowid].f_gsis_ecard_ln        = rj.float_gsis_ecard_ln       
                s.GSIS_Rej_Data[s.rowid].f_gsis_educ_asst_ln    = rj.float_gsis_educ_asst_ln   
                s.GSIS_Rej_Data[s.rowid].f_gsis_real_state_ln   = rj.float_gsis_real_state_ln  
                s.GSIS_Rej_Data[s.rowid].f_gsis_sos_ln          = rj.float_gsis_sos_ln         
                s.GSIS_Rej_Data[s.rowid].f_gsis_help            = rj.float_gsis_help           
                s.GSIS_Rej_Data[s.rowid].remittance_status_dtl  = fd.remit_status
                $("#reject_detail_modal").modal("hide");
               
            }
        })
    }

    s.Select_Voucher = function (id) {
        clearFields()
        var dt = s.reg_list[id]
        
        s.payroll_registry_descr = dt.payroll_registry_descr
        s.payroll_registry_nbr = dt.payroll_registry_nbr
        s.fd.txtb_registry_nbr = s.payroll_registry_nbr
        s.fd.txtb_voucher_nbr =  s.payroll_registry_nbr
      
        h.post("../cRemitLedgerGSIS/GetPayrollRegistry", { payroll_registry_nbr: dt.payroll_registry_nbr })
            .then(function (d) {
               
                if (d.data.message == "success") {
                    s.fd.txtb_payroll_reg = dt.payroll_registry_nbr
                    s.fd.txtb_registry_descr =  dt.payroll_registry_nbr
                    s.fd.txtb_voucher_nbr = dt.voucher_nbr
                    s.reg_names = d.data.payroll_reg_list
                }
            })
    }
    s.Select_Remittance = function (v) {

    }

    function clearEntryBorder() {
        $("#gs_override").css('border', '')
        $("#ps_override").css('border', '')
        $("#txtb_ps_amount").css('border', '')
        $("#txtb_gs_amount").css('border', '')
        $("#txtb_ps_upload").css('border', '')
        $("#txtb_gs_upload").css('border', '')
        $("#txtb_ouli_amt").css('border', '')
        $("#txtb_ouli_loan").css('border', '')
        $("#txtb_sif_amt").css('border', '')
        $("#txtb_realstate_amt").css('border', '')
        $("#txtb_ehp_amt").css('border', '')
        $("#txtb_hip_amt").css('border', '')
        $("#txtb_sos_amt").css('border', '')
        $("#txtb_ceap_amt").css('border', '')
        $("#txtb_addl_amt").css('border', '')
        $("#txtb_consol_amt").css('border', '')
        $("#txtb_policy_amt").css('border', '')
        $("#txtb_optional_amt").css('border', '')
        $("#txtb_educ_amt").css('border', '')
        $("#txtb_ecard_amt").css('border', '')
        $("#txtb_gfal_amt").css('border', '')
        $("#txtb_mpl_amt").css('border', '')
        $("#txtb_cpl_amt").css('border', '')
        $("#txtb_emergency_amt").css('border', '')
        $("#txtb_help_amt").css('border', '')
    }

    s.btn_edit_action = function (row_id, type) {
        s.row_id = row_id
        clearEntryBorder()
        
        var dt = s.GSIS_Table_Data[row_id]
        var tname = "GSISTable"

        

        h.post("../cRemitLedgerGSIS/CheckData", { data: dt }).then(function (d) {
            if(d.data.message == "found")
            {
                s.edit_disable = true
               
                s.isEdit = true

                
                addValueToForm(dt)
                if (d.data.message_overrides == "Y") {
                    s.fd.remit_status = "V"
                
                }
                
                s.modalTitle = "Edit Record"
                $("#detail_modal").modal("show")
            }
            else if (d.data.message == "not_found")
            {
                swal("Unable to Update, Data has been deleted by other user/s!", { icon: "warning", });

                var id = s[tname][0].id;
                var page = $("#" + id).DataTable().page.info().page
                s[tname].fnDeleteRow(row_id, null, true);
                s.GSIS_Table_Data = DataTable_data(tname)
                s.GSIS_Table_Data.refreshTable("GSISTable", "")
                changePage(tname, page, id)
               
            }
        })
       
    }

    s.Save_Edit_Details = function (fd) {

      
        
        console.log(fd)

        var data_override = {

            remittance_ctrl_nbr: $("#remittance_ctrl_nbr").val()
            , empl_id                   : fd.txtb_empl_id			
            , voucher_nbr               : fd.txtb_voucher_nbr				
            , payroll_month             : fd.txtb_payroll_month			
            , payroll_year              : fd.txtb_payroll_year			
            , p_gsis_gs                 : fd.txtb_GS_amount
            , p_gsis_ps                 : fd.txtb_PS_amount
            , p_sif_gs                  : fd.txtb_sif
            , p_gsis_uoli: fd.txtb_uoli
            , p_gsis_uoli_loan : fd.txtb_uoli_loan 
            ,p_gsis_ehp                 : fd.txtb_ehp
            ,p_gsis_hip                 : fd.txtb_hip
            ,p_gsis_ceap                : fd.txtb_ceap
            ,p_gsis_addl_ins            : fd.txtb_addl_ins
            ,p_gsis_conso_ln            : fd.txtb_console_loan
            ,p_gsis_policy_reg_ln       : fd.txtb_plreg
            , p_gsis_policy_opt_ln      : fd.txtb_plopt
            ,p_gsis_emergency_ln        : fd.txtb_emerg_loan
            ,p_gsis_ecard_ln            : fd.txtb_ecard_loan
            ,p_gsis_educ_asst_ln        : fd.txtb_educ_asst
            ,p_gsis_real_state_ln       : fd.txtb_real_state_loan
            ,p_gsis_sos_ln              : fd.txtb_sos_loan
            ,p_gsis_help                : fd.txtb_help
            ,u_gsis_gs					:"0.00"
            ,u_gsis_ps					:"0.00"
            ,u_sif_gs					:"0.00"
            ,u_gsis_uoli				:"0.00"
            ,u_gsis_ehp					:"0.00"
            ,u_gsis_hip					:"0.00"
            ,u_gsis_ceap				:"0.00"
            ,u_gsis_addl_ins			:"0.00"
            ,u_gsis_conso_ln			:"0.00"
            ,u_gsis_policy_reg_ln		:"0.00"
            ,u_gsis_policy_opt_ln		:"0.00"
            ,u_gsis_emergency_ln		:"0.00"
            ,u_gsis_ecard_ln			:"0.00"
            ,u_gsis_educ_asst_ln		:"0.00"
            ,u_gsis_real_state_ln		:"0.00"
            ,u_gsis_sos_ln				:"0.00"
            ,u_gsis_help				:"0.00"
            ,o_gsis_gs					:"0.00"
            ,o_gsis_ps					:"0.00"
            ,remittance_status          : "N"
            ,or_nbr						:""
            ,or_date					:""
            , p_other_loan1: fd.txtb_other_loan1
            , p_other_loan2: fd.txtb_other_loan2
            ,u_other_loan1				:"0.00"
            ,u_other_loan2				:"0.00"
            ,o_other_loan1				:"0.00"
            ,o_other_loan2				:"0.00"
            , p_other_loan3: fd.txtb_other_loan3
            ,u_other_loan3				:"0.00"
            , o_other_loan3: "0.00"
            , gfaleducnl_ln: fd.txtb_gfaleducnl_ln
            , mpl_lite_ln: fd.txtb_mpl_lite_ln
        }
        
        var tname = "GSISTable"
        $("#save_edit").removeClass("fa fa-save");
        $("#save_edit").addClass("fa fa-spinner fa-spin");
       
        if (overrideHasVal() == false) {

            return
        }

        if (s.o_invalid) {

            return
        }

        if (elEmpty(s.fd.remit_status)) {
            swal("Cannot Save, Remittance status not selected!", { icon: "warning", });
            $("#save_edit").removeClass("fa fa-spinner fa-spin");
            $("#save_edit").addClass("fa fa-save");
            return
        }
       
        h.post("../cRemitLedgerGSIS/Save_Edit_Details", {
            par_data: data_override,
            empl_id: fd.txtb_empl_id,
            vn: fd.txtb_voucher_nbr,
            o_ps: toDecimalFormat(fd.txtb_PS_override),
            o_gs: toDecimalFormat(fd.txtb_GS_override),
            remit_status : fd.remit_status
        }).then(function (d) {
            if (d.data.message == "success") {
                var id = s[tname][0].id;
                var page = $("#" + id).DataTable().page.info().page

                s.GSIS_Table_Data[s.row_id].p_gsis_gs = toDecimalFormat(fd.txtb_GS_amount)
                s.GSIS_Table_Data[s.row_id].p_gsis_ps = toDecimalFormat(fd.txtb_PS_amount)
                s.GSIS_Table_Data[s.row_id].p_sif_gs = toDecimalFormat(fd.txtb_sif)
                s.GSIS_Table_Data[s.row_id].p_gsis_uoli = toDecimalFormat(fd.txtb_uoli)
                s.GSIS_Table_Data[s.row_id].p_gsis_ehp = toDecimalFormat(fd.txtb_ehp)
                s.GSIS_Table_Data[s.row_id].p_gsis_hip = toDecimalFormat(fd.txtb_hip)
                s.GSIS_Table_Data[s.row_id].p_gsis_ceap = toDecimalFormat(fd.txtb_ceap)
                s.GSIS_Table_Data[s.row_id].p_gsis_addl_ins = toDecimalFormat(fd.txtb_addl_ins)   
                s.GSIS_Table_Data[s.row_id].p_gsis_conso_ln = toDecimalFormat(fd.txtb_console_loan)   
                s.GSIS_Table_Data[s.row_id].p_gsis_policy_reg_ln = toDecimalFormat(fd.txtb_plreg)
                s.GSIS_Table_Data[s.row_id].p_gsis_policy_opt_ln = toDecimalFormat(fd.txtb_plopt) 
                s.GSIS_Table_Data[s.row_id].p_gsis_emergency_ln = toDecimalFormat(fd.txtb_emerg_loan)
                s.GSIS_Table_Data[s.row_id].p_gsis_ecard_ln = toDecimalFormat(fd.txtb_ecard_loan)
                s.GSIS_Table_Data[s.row_id].p_gsis_educ_asst_ln = toDecimalFormat(fd.txtb_educ_asst)
                s.GSIS_Table_Data[s.row_id].p_gsis_real_state_ln = toDecimalFormat(fd.txtb_real_state_loan)
                s.GSIS_Table_Data[s.row_id].p_gsis_sos_ln = toDecimalFormat(fd.txtb_sos_loan)
                s.GSIS_Table_Data[s.row_id].p_gsis_help = toDecimalFormat(fd.txtb_help)    
                s.GSIS_Table_Data[s.row_id].p_gsis_help = toDecimalFormat(fd.txtb_help)   
                s.GSIS_Table_Data[s.row_id].p_other_loan1 = toDecimalFormat(fd.txtb_other_loan1) 
                s.GSIS_Table_Data[s.row_id].p_other_loan2 = toDecimalFormat(fd.txtb_other_loan2)  
                s.GSIS_Table_Data[s.row_id].p_other_loan3 = toDecimalFormat(fd.txtb_other_loan3) 
                s.GSIS_Table_Data[s.row_id].p_gsis_uoli_loan = toDecimalFormat(fd.txtb_uoli_loan) 
                s.GSIS_Table_Data[s.row_id].dtl_status = "V"
                s.GSIS_Table_Data.refreshTable("GSISTable", fd.txtb_empl_id)
                swal("Successfully Updated!", "Existing record successfully Updated!", "success")
                $("#save_edit").removeClass("fa fa-spinner fa-spin");
                $("#save_edit").addClass("fa fa-save");
                $("#detail_modal").modal("hide")
            }
            else if (d.data.message == "not_found")
            {
                
                swal("Unable to Update, Data has been deleted by other user/s!", { icon: "warning", });
                var id = s[tname][0].id;
                var page = $("#" + id).DataTable().page.info().page
                s[tname].fnDeleteRow(s.row_id, null, true);
                s.GSIS_Table_Data = DataTable_data(tname)
                s.GSIS_Table_Data.refreshTable("GSISTable", "")
                changePage(tname, page, id)
                $("#save_edit").removeClass("fa fa-spinner fa-spin");
                $("#save_edit").addClass("fa fa-save");
                $("#detail_modal").modal("hide")
            }
            else {
                swal(d.data.message, { icon: "success", });
                $("#save_edit").removeClass("fa fa-spinner fa-spin");
                $("#save_edit").addClass("fa fa-save");
                $("#detail_modal").modal("hide")
               

            }
        })

    }


    //delete row in dataTable
    s.btn_del_row = function (row_id) {
        $("#del_row" + row_id).removeClass("fa fa-trash");
        $("#del_row" + row_id).addClass("fa fa-spinner fa-spin");
        var dt = s.GSIS_Table_Data[row_id]
        var dt_name = "GSIS_Table_Data"
        var tname = "GSISTable"
        h.post("../cRemitLedgerGSIS/CheckData", { data: dt }).then(function (d) {
             if (d.data.message == "not_found") {
                swal("Unable to delete, Data has been deleted by other user/s!", { icon: "warning", });
                var id = s[tname][0].id;
                var page = $("#" + id).DataTable().page.info().page
                s[tname].fnDeleteRow(row_id, null, true);
                s.GSIS_Table_Data = DataTable_data(tname)
                s.GSIS_Table_Data.refreshTable("GSISTable", "")
                changePage(tname, page, id)
                $("#del_row" + row_id).removeClass("fa fa-spinner fa-spin");
                $("#del_row" + row_id).addClass("fa fa-trash");
             }
             else
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
                           h.post("../cRemitLedgerGSIS/DeleteGSISDetails", {
                               rcn: dt.remittance_ctrl_nbr,
                               empl_id: dt.empl_id,
                               vn: dt.voucher_nbr,
                               payroll_month: dt.payroll_month
                           }).then(function (d) {
                               if (d.data.message == "success") {

                                   var id = s[tname][0].id;
                                   var page = $("#" + id).DataTable().page.info().page
                                   s[tname].fnDeleteRow(row_id, null, true);
                                   s.GSIS_Table_Data = DataTable_data(tname)

                                   s.GSIS_Table_Data.refreshTable("GSISTable", "")
                                   changePage(tname, page, id)
                                   $("#del_row" + row_id).removeClass("fa fa-spinner fa-spin");
                                   $("#del_row" + row_id).addClass("fa fa-trash");
                                   swal("Your record has been deleted!", { icon: "success", });
                               }
                               else if (d.data.message == "not_found") {
                                   swal("Unable to delete, Data has been deleted by other user/s!", { icon: "warning", });

                                   var id = s[tname][0].id;
                                   var page = $("#" + id).DataTable().page.info().page
                                   s[tname].fnDeleteRow(row_id, null, true);
                                   s.GSIS_Table_Data = DataTable_data(tname)
                                   s.GSIS_Table_Data.refreshTable("GSISTable", "")
                                   changePage(tname, page, id)
                                   $("#del_row" + row_id).removeClass("fa fa-spinner fa-spin");
                                   $("#del_row" + row_id).addClass("fa fa-trash");

                               }
                               else {
                                   alert(d.data.message)
                               }

                           })
                       }
                       else {
                           $("#del_row" + row_id).removeClass("fa fa-spinner fa-spin");
                           $("#del_row" + row_id).addClass("fa fa-trash");
                       }
                   });
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

    

    s.btn_upload_modal = function () {
        console.log(prevVal)
        s.txtb_remittance_ctrl_nbr = prevVal[7]
        s.txtb_remittance_status   = prevVal[8]
        s.txtb_remittance_year     = prevVal[0]
        s.txtb_remittance_month = prevVal[1]
        s.txtb_employment_type = prevVal[3]
        addvalue('txtb_remittance_month_disp', prevVal[2])
        addvalue('txtb_employment_type_disp', prevVal[4])
        $("#upload_modal").modal("show")
    }



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
                   
                    h.post("../cRemitLedgerGSIS/UploadData",
                        {
                            par_filename: result.split('*')[2],
                           
                            //par_filename: "E:\\HRIS_PACCO\\ARCHIVE-PROJECTS\\HRIS-ePAccount_11_23_1155AM_WORK_ON\\HRIS-ePAccount\\UploadedFile\\april_gsis.csv",
                            // par_filename: 'C:\\HRIS\Development\\HRIS-ePAccount\\HRIS-ePAccount\\UploadedFile\\september_gsis.csv',
                            //par_filename: 'D:\\HRIS_FILE_REPO\\COMVAL_HRIS\\GSIS_CSV\\january_gsis.csv',
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
                               
                                switch (d.data.sp_upload_file_from_GSIS[0].result_value) {
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
                                swal(d.data.sp_upload_file_from_GSIS[0].result_value_descr, "Upload Data Message", icon_display);

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
                alert(err.statusText)
            }
        });

    }


    //This function is called to extract GSIS remittance to excel format / Overrides

    s.btn_report_OVERRIDE = function () {
        var rc = s.remittancetype_code
        $("#extracting_data").modal("show");
        h.post("../cRemitLedgerGSIS/Override").then(function (d) {

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

    //This function is called to extract GSIS remittance to excel format

    s.ExctractToExcel = function () {
        var rc = s.remittancetype_code
        var employment_type = $("#employment_type_descr").val()
        var remittance_year = $("#remittance_year").val()
        var remittance_month_descr = $("#remittance_month_descr").val()

        $("#extracting_data").modal("show");
        h.post("../Menu/GetToken").then(function (d) {
            var token = { token: d.data.token }
            h.post(excelExportServer + "/api/remittance/verify-token", token, { responseType: 'arraybuffer' }
        
            ).then(function (response) {
               
                if (response.data) {
                    h.post("../cRemitLedgerGSIS/ExtractToPhpExcel").then(function (d) {
                        var sp_remittance_GSIS_rep = d.data.sp_remittance_GSIS_rep_2
                       
                        h.post(excelExportServer + "/export", {
                            data: sp_remittance_GSIS_rep
                        }, { responseType: 'arraybuffer' }
                        ).then(function (response2) {
                            // Check the response data
                            if (response2.data) {
                                // Create a Blob from the response data
                                const csvBlob = new Blob([response2.data], { type: 'text/csv;charset=utf-8;' });
                                // Generate a URL for the Blob
                                const downloadUrl = window.URL.createObjectURL(csvBlob);
                                console.log(sp_remittance_GSIS_rep)
                                // Create an anchor element and set its href attribute to the Blob URL
                                const link = document.createElement('a');
                                link.href = downloadUrl;

                                // Set the download attribute with a dynamic filename
                                //const name = new Date().toLocaleString().replace(/[/,\\:*?"<>|]/g, '_');
                                const name = "GSIS Premiums-" + remittance_year + "-" + remittance_month_descr + "-" + employment_type+".xlsx"
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

                }).catch(function (error,response) {
                    swal("Token expired! please generate new token.", {icon:"error"})
                    console.error('Token expired! please generate new token :', error);
                    $("#extracting_data").modal("hide");
                });
            
           
        })


        //h.post("../cRemitLedgerGSIS/ExtractToExcel").then(function (d) {
        //    if (d.data.message == "success") {
        //        $("#extracting_data").modal("hide");
        //        window.open(d.data.filePath, '', '');
        //    }
        //    else {

        //        $("#extracting_data").modal("hide");
        //        swal(d.data.message, { icon: "error" });
        //    }
        //})
    }
    
   
    s.Rejected = function () {
        $("#spinner_load").modal("show")
        h.post("../cRemitLedgerGSIS/GetRejectResult", {
            dep: s.ddl_dept,
            letter: s.ddl_letter,
            type:"",
            v_opt: s.view_option
        }).then(function (d) {
            if (d.data.message == "success") {
                angular.forEach(d.data.details, function (v, k) {
                    v.isChecked = 0
                })
                s.GSIS_Rej_Data = d.data.details
               
                s.GSIS_Rej_Data.refreshTable("RejTable", "")
                s.rejected = true
                $("#rejected_grid").DataTable().search(s.search_name).draw();
                $("#rejected_grid").DataTable().page.len(s.rowLen).draw();
               
            }
        })
       
    }
    s.HideRejectedGrid = function()
    {
        s.rejected = false
    }
    s.CheckAll = function ()
    {
        s.checkOption == "Check All"
        s.reject = true
        $('.btn-reject').prop('checked', true);
       
        angular.forEach(s.GSIS_Rej_Data, function (v, k) {
            v.isChecked = 1
        })
    
    }
    s.UnCheckAll = function () {
        s.checkOption == "UnCheck All"
        s.reject = false
        $('.btn-reject').prop('checked', false);
       
        angular.forEach(s.GSIS_Rej_Data, function (v, k) {
            v.isChecked = 0
        })
      
       
    }
    function reject() {
        var dt = []
        angular.forEach(s.GSIS_Rej_Data, function (v, k) {
            if (v.isChecked == 1) {
                var ps = computeFloat(parseFloat(v.p_gsis_ps), parseFloat(v.o_gsis_ps))
                var gs = computeFloat(parseFloat(v.p_gsis_gs), parseFloat(v.o_gsis_gs))
                var d = {
                    remittance_ctrl_nbr: v.remittance_ctrl_nbr
                    , empl_id: v.empl_id
                    , voucher_nbr: v.voucher_nbr
                    , float_amount_ps: ps
                    , float_amount_gs: gs
                    , float_status: "N"
                }
                dt.push(d)
            }
        })

        return $q(function (resolve, reject) {
            setTimeout(function () {
                    resolve(dt);
            }, 300);
        });
    }
    function unreject() {
        var dt = []
        angular.forEach(s.GSIS_Rej_Data, function (v, k) {
            if (v.isChecked == 0) {
                var ps = computeFloat(parseFloat(v.p_gsis_ps), parseFloat(v.o_gsis_ps))
                var gs = computeFloat(parseFloat(v.p_gsis_gs), parseFloat(v.o_gsis_gs))
                var d = {
                    remittance_ctrl_nbr: v.remittance_ctrl_nbr
                    , empl_id: v.empl_id
                    , voucher_nbr: v.voucher_nbr
                  
                }
                dt.push(d)
            }
        })

        return $q(function (resolve, reject) {
            setTimeout(function () {
                resolve(dt);
            }, 300);
        });
    }

   
    s.RejectedSave = function () {
        $("#rej").removeClass("fa fa-check");
        $("#rej").addClass("fa fa-spinner fa-spin");
        var dt = []
        if (s.reject == true)
        {
            
            reject().then(function (value) {
                
                if (value.length == 0) {
                    swal("No record checked", { icon: "warning" });
                    return
                }
                
                h.post("../cRemitLedgerGSIS/RejectedSave", { data: value }).then(function (d) {
                    if (d.data.message == "success") {

                        if (d.data.message == "success") {
                            swal("Successfully save", { icon: "success" });
                            $("#rej").removeClass("fa fa-spinner fa-spin");
                            $("#rej").addClass("fa fa-check");

                        }
                    }
                })
            });
           
        }
        
        else if (s.reject == false)
        {
            swal({
                title: "Are you sure to unreject this records?",
                text: "",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                  .then(function (willDelete) {
                      if (willDelete) {
                          unreject().then(function (value) {
                              
                              if (value.length == 0) {
                                  swal("No record Unchecked", { icon: "warning" });
                                  return
                              }
                              h.post("../cRemitLedgerGSIS/UnRejectedSave", { data: value }).then(function (d) {
                                  if (d.data.message == "success") {
                                      if (d.data.message == "success") {
                                          swal("Successfully save", { icon: "success" });
                                          $("#rej").removeClass("fa fa-spinner fa-spin");
                                          $("#rej").addClass("fa fa-check");
                                      }
                                  }
                              })
                          })
                      }
                      else {
                          $("#rej").removeClass("fa fa-spinner fa-spin");
                          $("#rej").addClass("fa fa-check");
                      }
                  });
            
           
        }

       

    }
    
    function computeFloat(v1,v2)
    {
        var result = 0;

        result = v1 - v2;
        return result;
    }
   
    //FOR REJECTED AMOUNT
    s.btn_check = function (row_id)
    {
        s.rowid = row_id
        var dt = s.GSIS_Rej_Data[row_id]
        s.btn_select = dt.infloat
        s.empl_id = dt.empl_id

        

        s.employee_name                     = dt.employee_name
        s.rj.remittance_ctrl_nbr            =dt.remittance_ctrl_nbr
        s.rj.voucher_nbr                    =dt.voucher_nbr        
        s.rj.empl_id                        =dt.empl_id            
        s.rj.float_amount_ps                =currency( dt.f_gsis_ps            )
        s.rj.float_amount_gs                =currency( dt.f_gsis_gs            )
        s.rj.float_sif_gs                   =currency( dt.f_sif_gs             )
        s.rj.float_gsis_uoli                =currency( dt.f_gsis_uoli          )
        s.rj.float_gsis_ehp                 =currency( dt.f_gsis_ehp           )
        s.rj.float_gsis_hip                 =currency( dt.f_gsis_hip           )
        s.rj.float_gsis_ceap                =currency( dt.f_gsis_ceap          )
        s.rj.float_gsis_addl_ins            =currency( dt.f_gsis_addl_ins      )
        s.rj.float_gsis_conso_ln            =currency( dt.f_gsis_conso_ln      )
        s.rj.float_gsis_policy_reg_ln       =currency( dt.f_gsis_policy_reg_ln )
        s.rj.float_gsis_policy_opt_ln       =currency( dt.f_gsis_policy_opt_ln )
        s.rj.float_gsis_emergency_ln        =currency( dt.f_gsis_emergency_ln  )
        s.rj.float_gsis_ecard_ln            =currency( dt.f_gsis_ecard_ln      )
        s.rj.float_gsis_educ_asst_ln        =currency( dt.f_gsis_educ_asst_ln  )
        s.rj.float_gsis_real_state_ln       =currency( dt.f_gsis_real_state_ln )
        s.rj.float_gsis_sos_ln              =currency( dt.f_gsis_sos_ln        )
        s.rj.float_gsis_help                =currency( dt.f_gsis_help          )
        s.rj.float_other_loan2              = currency(dt.f_other_loan2)
        s.rj.float_other_loan1              = currency(dt.f_other_loan1)
        s.rj.float_other_loan3              = currency(dt.f_other_loan3)


        //ADDED BY JORGE: 2020-10-16
        s.rj.float_amount_ps_upload                = currency(dt.u_f_gsis_ps)
        s.rj.float_amount_gs_upload                = currency(dt.u_f_gsis_gs)
        s.rj.float_sif_gs_upload                   = currency(dt.u_f_sif_gs)
        s.rj.float_gsis_uoli_upload                = currency(dt.u_f_gsis_uoli)
        s.rj.float_gsis_ehp_upload                 = currency(dt.u_f_gsis_ehp)
        s.rj.float_gsis_hip_upload                 = currency(dt.u_f_gsis_hip)
        s.rj.float_gsis_ceap_upload                = currency(dt.u_f_gsis_ceap)
        s.rj.float_gsis_addl_ins_upload            = currency(dt.u_f_gsis_addl_ins)
        s.rj.float_gsis_conso_ln_upload            = currency(dt.u_f_gsis_conso_ln)
        s.rj.float_gsis_policy_reg_ln_upload       = currency(dt.u_f_gsis_policy_reg_ln)
        s.rj.float_gsis_policy_opt_ln_upload       = currency(dt.u_f_gsis_policy_opt_ln)
        s.rj.float_gsis_emergency_ln_upload        = currency(dt.u_f_gsis_emergency_ln)
        s.rj.float_gsis_ecard_ln_upload            = currency(dt.u_f_gsis_ecard_ln)
        s.rj.float_gsis_educ_asst_ln_upload        = currency(dt.u_f_gsis_educ_asst_ln)
        s.rj.float_gsis_real_state_ln_upload       = currency(dt.u_f_gsis_real_state_ln)
        s.rj.float_gsis_sos_ln_upload              = currency(dt.u_f_gsis_sos_ln)
        s.rj.float_gsis_help_upload                = currency(dt.u_f_gsis_help)
        s.rj.float_other_loan2_upload              = currency(dt.u_f_other_loan2)
        s.rj.float_other_loan1_upload              = currency(dt.u_f_other_loan1)
        s.rj.float_other_loan3_upload              = currency(dt.u_f_other_loan3)


        s.rj.float_amount_ps_pay                    = currency(dt.p_f_gsis_ps)
        s.rj.float_amount_gs_pay                    = currency(dt.p_f_gsis_gs)
        s.rj.float_sif_gs_pay                       = currency(dt.p_f_sif_gs)
        s.rj.float_gsis_uoli_pay                    = currency(dt.p_f_gsis_uoli)
        s.rj.float_gsis_ehp_pay                     = currency(dt.p_f_gsis_ehp)
        s.rj.float_gsis_hip_pay                     = currency(dt.p_f_gsis_hip)
        s.rj.float_gsis_ceap_pay                    = currency(dt.p_f_gsis_ceap)
        s.rj.float_gsis_addl_ins_pay                = currency(dt.p_f_gsis_addl_ins)
        s.rj.float_gsis_conso_ln_pay                = currency(dt.p_f_gsis_conso_ln)
        s.rj.float_gsis_policy_reg_ln_pay           = currency(dt.p_f_gsis_policy_reg_ln)
        s.rj.float_gsis_policy_opt_ln_pay           = currency(dt.p_f_gsis_policy_opt_ln)
        s.rj.float_gsis_emergency_ln_pay            = currency(dt.p_f_gsis_emergency_ln)
        s.rj.float_gsis_ecard_ln_pay                = currency(dt.p_f_gsis_ecard_ln)
        s.rj.float_gsis_educ_asst_ln_pay            = currency(dt.p_f_gsis_educ_asst_ln)
        s.rj.float_gsis_real_state_ln_pay           = currency(dt.p_f_gsis_real_state_ln)
        s.rj.float_gsis_sos_ln_pay                  = currency(dt.p_f_gsis_sos_ln)
        s.rj.float_gsis_help_pay                    = currency(dt.p_f_gsis_help)
        s.rj.float_other_loan2_pay                  = currency(dt.p_f_other_loan2)
        s.rj.float_other_loan1_pay                  = currency(dt.p_f_other_loan1)
        s.rj.float_other_loan3_pay                  = currency(dt.p_f_other_loan3)
        //END ADDED BY: JORGE

        $("#reject_detail_modal").modal("show");
    }

    //s.btn_check = function(row_id)
    //{
    //    s.rowid = row_id
    //    var dt = s.GSIS_Rej_Data[row_id]

    //    if ($('.btn-check' + row_id)[0].checked)
    //    {
    //        s.reject = true
    //        s.GSIS_Rej_Data[row_id].isChecked = 1;
    //    }
    //    else
    //    {
    //        s.reject = false
    //        s.GSIS_Rej_Data[row_id].isChecked = 0;
    //    }
    //}


    //this function is called to filter employee name in dataTable data that start with the specific alphabet
    s.FILTER = function () {
        $("#spinner_load").modal("show")
        if (s.rejected == true) {
            getFilterRejected()
        }
        else {

            getFilterPremium()
        }

    }

   
    function getFilterPremium() {
        h.post("../cRemitLedgerGSIS/GetInfoResult", {
            dep: s.ddl_dept,
            letter: s.ddl_letter,
            type: s.emp_status,
            v_opt : s.view_option
        }).then(function (d) {
            if (d.data.message == "success") {
                s.GSIS_Table_Data = d.data.details
                s.GSIS_Table_Data.refreshTable("GSISTable", "")
                $("#spinner_load").modal("hide")
            }
        })
    }

   

    function getFilterRejected() {
        h.post("../cRemitLedgerGSIS/GetRejectResult", {
            dep: s.ddl_dept,
            letter: s.ddl_letter,
            type: s.emp_status,
            v_opt: s.view_option
        }).then(function (d) {
            if (d.data.message == "success") {
                angular.forEach(d.data.details, function (v, k) {
                    v.isChecked = 0
                })
                s.GSIS_Rej_Data = d.data.details

                s.GSIS_Rej_Data.refreshTable("RejTable", "")
                s.rejected = true
                $("#spinner_load").modal("hide")
                $("#rejected_grid").DataTable().search(s.search_name).draw();
                $("#rejected_grid").DataTable().page.len(s.rowLen).draw();
                
            }
        })
    }

    s.ps_override_blur = function (el) {
        if (isCurrency(w_dc(el))) {
            s.nosave = false
            require_warning(false, "cls_override_ps", "ta_override_ps", "require-field")
            s.fd.txtb_PS_override = formatNumber(s.val)
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
            s.fd.txtb_GS_override = formatNumber(s.val)
            s.gs_vld = 1

        }
        else {
            s.nosave = true
            require_warning(true, "cls_override_gs", "ta_override_gs", "require-field")
            s.gs_vld = 0
        }

        alw_rmt_st()
    }

    s.Employment_Status = function (t) {
        s.emp_status = t
        if (t == "RE") {
            $("#ce").removeClass("active-tab")
            $("#re").addClass("active-tab")
            getFilterResult()
        }
        else {
            $("#re").removeClass("active-tab")
            $("#ce").addClass("active-tab")
            getFilterResult()
        }
    }

    function overrideHasVal() {
        if (elEmpty(s.fd.txtb_PS_override) == false || elEmpty(s.fd.txtb_GS_override) == false) {
            return true
        }
        else {
            return false
        }
    }

    //*** format overrides value into money with two decimal zeros onblur***
    function w_dc(n) {
        s.o_invalid = false
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
            s.o_invalid = true
            return "invalid"
        }


    }


    //*** test if overrides value is a valid money value****
    function isCurrency(nbr) {
        var regex = /^\d+|-\d+(?:\.\d{0,2})$/;
     

        if (regex.test(nbr)) {
            return true
        }
        else {
            return false
        }

    }




    ////**** Enable disbale remittance status field if oveerrides value is not empty ******
    //function alw_rmt_st() {
    //    var o_ps = s.fd.txtb_override_ps
    //    var o_gs = s.fd.txtb_override_gs
    //    var eps = elEmpty(o_ps)
    //    var egs = elEmpty(o_gs)
    //    var pv = s.ps_vld
    //    var gv = s.gs_vld
    //    var ps_v = (!eps && pv == 1)
    //    var gs_v = (!egs && gv == 1)
    //    var pg_b_0 = (o_ps == "0.00" && o_gs == "0.00")

    //    if (pg_b_0) {
    //        s.fd[dos] = "N"
    //        s[ov] = false
    //     
    //    }
    //    else if (o_ps == "0.00" && egs) {
    //        s.fd[dos] = "N"
    //        s[ov] = false
    //    }
    //    else if (o_gs == "0.00" && eps) {
    //        s.fd[dos] = "N"
    //        s[ov] = false
    //    }
    //    else if (ps_v && egs) {
    //        s[ov] = true
    //    }
    //    else if (gs_v && eps) {
    //        s[ov] = true
    //    }
    //    else if (ps_v && gs_v) {
    //        s[ov] = true
    //    }
    //    else {
    //        s[ov] = false
    //    }
    //}

    // allow saving if overrides and remitance status is validated
    function alw_sve_ov()
    {

        var retVal = false

        var o_ps = s.fd.txtb_override_ps
        var o_gs = s.fd.txtb_override_gs
        var ps_st = (!elEmpty(o_ps) && s[ov])
        var gs_st = (!elEmpty(o_gs) && s[ov])
        var gp_st = (!elEmpty(o_ps) && !elEmpty(o_gs) && s[ov])
        var gp_st_nt = (elEmpty(o_ps) && elEmpty(o_gs) && !s[ov])

        if (ps_st)
        {
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

    //**** Enable disbale remittance status field if oveerrides value is not empty ******
    function alw_rmt_st() {
        var o_ps = s.fd.txtb_PS_override
        var o_gs = s.fd.txtb_GS_override

        var eps = elEmpty(o_ps)
        var egs = elEmpty(o_gs)

        var pv = s.ps_vld
        var gv = s.gs_vld
        var ps_v = (!eps && pv == 1)
        var gs_v = (!egs && gv == 1)


        if (eps && egs) {
            s.fd[dos] = "N"
            s.isOverride = false
        }
        else {
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


    Array.prototype.populate_DT = function () {


        s.GSIS_Table_Data = this
        s.GSIS_Table_Data.refreshTable("GSISTable", "")



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

    function formatNumber(d) {
        return d.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
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

    function currency(d) {
       
        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = parseFloat(d).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1')
            return retdata
        }
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

        var el_id = s[table][0].id
        if (id != "") {
            for (var x = 1; x <= $("#" + el_id).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    s[table].fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }
        $("#spinner_load").modal("hide")


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



    $('#detail_modal').on('hidden.bs.modal', function (e) {
        s.ta_override_ps = false
        s.ta_override_gs = false
        s.cls_override_ps = ""
        s.cls_override_gs = ""
        $("#save").removeClass("fa fa-spinner fa-spin");
        $("#save").addClass("fa fa-save");
        $("#save_edit").removeClass("fa fa-spinner fa-spin");
        $("#save_edit").addClass("fa fa-save");
        clearForm()
    })
    function clearFields()
    {
        s.txtb_registry_nbr = ""
        s.fd.txtb_remit_year = ""
        s.fd.txtb_remit_month = ""
        s.fd.txtb_empl_type = ""
        s.fd.txtb_remit_status = ""
        s.fd.txtb_voucher_descr = ""
        s.fd.txtb_voucher_nbr = ""
        s.fd.txtb_payroll_year = ""
        s.fd.txtb_payroll_month = ""
        s.fd.ddl_empl_name = ""
        s.fd.txtb_empl_id = ""
        s.fd.txtb_bp_nbr = ""
        s.fd.txtb_crn = ""
        s.fd.txtb_month_sal = ""
        s.fd.txtb_eff_date = ""
        s.fd.txtb_PS_amount = ""
        s.fd.txtb_GS_amount = ""
        s.fd.txtb_PS_override = ""
        s.fd.txtb_GS_override = ""
        s.fd.txtb_PS_uploaded = ""
        s.fd.txtb_GS_uploaded = ""
        s.fd.txtb_sif = ""
        s.fd.txtb_ehp = ""
        s.fd.txtb_hip = ""
        s.fd.txtb_ceap = ""
        s.fd.txtb_uoli = ""
        s.fd.txtb_uoli_loan = ""
        s.fd.txtb_addl_ins = ""
        s.fd.txtb_console_loan = ""
        s.fd.txtb_plreg = ""
        s.fd.txtb_ecard_loan = ""
        s.fd.txtb_cash_advance = ""
        s.fd.txtb_emerg_loan = ""
        s.fd.txtb_educ_asst = ""
        s.fd.txtb_real_state_loan = ""
        s.fd.txtb_sos_loan = ""
        s.fd.txtb_help = ""
        s.fd.remit_status = ""
        s.fd.txtb_month = ""
        s.fd.txtb_gfaleducnl_ln = ""
        require_warning(false, "cls_voucher", "ta_voucher", "require-field")
        require_warning(false, "cls_employee", "ta_employee", "require-field")
        require_warning(false, "cls_override_ps", "ta_override_ps", "require-field")
    }
    function clearForm() {
        s.txtb_registry_nbr = ""
        s.fd.txtb_remit_year = ""
        s.fd.txtb_remit_month = ""
        s.fd.txtb_empl_type = ""
        s.fd.txtb_remit_status = ""
        s.fd.txtb_voucher_descr = ""
        s.fd.ddl_payroll_reg = ""
        s.fd.txtb_voucher_nbr = ""
        s.fd.txtb_payroll_year = ""
        s.fd.txtb_payroll_month = ""
        s.fd.ddl_empl_name = ""
        s.fd.txtb_empl_id = ""
        s.fd.txtb_bp_nbr = ""
        s.fd.txtb_crn = ""
        s.fd.txtb_month_sal = ""
        s.fd.txtb_eff_date = ""
        s.fd.txtb_PS_amount = ""
        s.fd.txtb_GS_amount = ""
        s.fd.txtb_PS_override = ""
        s.fd.txtb_GS_override = ""
        s.fd.txtb_PS_uploaded = ""
        s.fd.txtb_GS_uploaded = ""
        s.fd.txtb_sif = ""
        s.fd.txtb_ehp = ""
        s.fd.txtb_hip = ""
        s.fd.txtb_ceap = ""
        s.fd.txtb_uoli = ""
        s.fd.txtb_uoli_loan = ""
        s.fd.txtb_addl_ins = ""
        s.fd.txtb_console_loan = ""
        s.fd.txtb_plreg = ""
        s.fd.txtb_ecard_loan = ""
        s.fd.txtb_cash_advance = ""
        s.fd.txtb_emerg_loan = ""
        s.fd.txtb_educ_asst = ""
        s.fd.txtb_real_state_loan = ""
        s.fd.txtb_sos_loan = ""
        s.fd.txtb_help = ""
        s.fd.remit_status = ""
        s.fd.txtb_gfal = ""
        s.fd.txtb_mpl = ""
        s.fd.txtb_gfaleducnl_ln = ""
        require_warning(false, "cls_voucher", "ta_voucher", "require-field")
        require_warning(false, "cls_employee", "ta_employee", "require-field")
        require_warning(false, "cls_override_ps", "ta_override_ps", "require-field")
        
    }


    function addValueToForm(f) 
    {
        console.log(f)
        $("#txtb_ps_upload").prop('disabled', true)
        $("#txtb_gs_upload").prop('disabled', true)
        if (s.isEdit == true) 
        {
            
            s.fd.txtb_registry_nbr = f.payroll_registry_nbr
            s.fd.txtb_voucher_descr = f.voucher_nbr + "-" + f.payroll_registry_descr
            
            s.fd.txtb_voucher_nbr = f.voucher_nbr
            s.fd.txtb_empl_name = f.employee_name
            
            s.fd.txtb_PS_uploaded = currency(f.u_gsis_ps)
            s.fd.txtb_GS_uploaded = currency(f.u_gsis_gs)
            s.fd.remit_status = f.remittance_status_dtl

            
        }

        s.fd.txtb_empl_id = f.empl_id
        s.fd.txtb_payroll_year = f.payroll_year
        s.fd.txtb_payroll_month = f.payroll_month

        s.fd.txtb_payroll_month_descr = month[parseInt(f.payroll_month) - 1]
        s.fd.txtb_bp_nbr = f.gsis_umid

        //s.fd.txtb_bp_nbr = "" //no value on sp_payrollregistry_not_in_remittance_GSIS
        //s.fd.txtb_crn = "" // no value on sp_payrollregistry_not_in_remittance_GSIS
        //s.fd.txtb_month_sal = "" // no value on sp_payrollregistry_not_in_remittance_GSIS
        //s.fd.txtb_eff_date = "" // no value on sp_payrollregistry_not_in_remittance_GSIS



        s.fd.txtb_PS_amount = currency(f.p_gsis_ps)
        s.fd.txtb_GS_amount = currency(f.p_gsis_gs)
        s.fd.txtb_PS_override = currency(f.o_gsis_ps)
        s.fd.txtb_GS_override = currency(f.o_gsis_gs)
        s.fd.txtb_sif = currency(f.p_sif_gs)
        s.fd.txtb_ehp = currency(f.p_gsis_ehp)
        s.fd.txtb_hip = currency(f.p_gsis_hip)
        s.fd.txtb_ceap = currency(f.p_gsis_ceap)
        s.fd.txtb_uoli = currency(f.p_gsis_uoli)
        s.fd.txtb_uoli_loan = currency(f.p_gsis_uoli_loan)
        s.fd.txtb_addl_ins = currency(f.p_gsis_addl_ins)
        s.fd.txtb_console_loan = currency(f.p_gsis_conso_ln)
        s.fd.txtb_plreg = currency(f.p_gsis_policy_reg_ln)
        s.fd.txtb_ecard_loan = currency(f.p_gsis_ecard_ln)
        s.fd.txtb_emerg_loan = currency(f.p_gsis_emergency_ln)
        s.fd.txtb_educ_asst = currency(f.p_gsis_educ_asst_ln)
        s.fd.txtb_real_state_loan = currency(f.p_gsis_real_state_ln)
        s.fd.txtb_sos_loan = currency(f.p_gsis_sos_ln)
        s.fd.txtb_help = currency(f.p_gsis_help)
        s.fd.txtb_p_gsis_policy_opt_ln = currency(f.p_gsis_policy_opt_ln)
        s.fd.txtb_plopt = currency(f.p_gsis_policy_opt_ln)
        s.fd.txtb_other_loan2 = currency(f.p_other_loan2)
        s.fd.txtb_other_loan1 = currency(f.p_other_loan1)
        s.fd.txtb_other_loan3 = currency(f.p_other_loan3)
        s.fd.txtb_gfaleducnl_ln = currency(f.gfaleducnl_ln)
        s.fd.txtb_mpl_lite_ln = currency(f.mpl_lite_ln)


        //if ((elEmpty(f.o_gsis_ps) || f.o_gsis_ps == 0) && (elEmpty(f.o_gsis_gs)|| f.o_gsis_ps == 0))
        //{
           
        //}
        //else
        //{
        //    
        //}

    }


    function getFormValue(f) 
    {
        s.employee_name = f.employee_name
        var data = 
          {
            remittance_ctrl_nbr: $("#remittance_ctrl_nbr").val()
                   , empl_id                : f.empl_id
                   , voucher_nbr            : f.voucher_nbr
                   , p_gsis_gs              : f.p_gsis_gs
                   , p_gsis_ps              : f.p_gsis_ps
                   , p_sif_gs               : f.p_sif_gs
                   , p_gsis_uoli            : f.p_gsis_uoli
                   , p_gsis_uoli45          : f.p_gsis_uoli45
                   , p_gsis_uoli50          : f.p_gsis_uoli50
                   , p_gsis_uoli55          : f.p_gsis_uoli55
                   , p_gsis_uoli60          : f.p_gsis_uoli60
                   , p_gsis_uoli65          : f.p_gsis_uoli65
                   , p_gsis_ehp             : f.p_gsis_ehp
                   , p_gsis_hip             : f.p_gsis_hip
                   , p_gsis_ceap            : f.p_gsis_ceap
                   , p_gsis_addl_ins        : f.p_gsis_addl_ins
                   , p_gsis_conso_ln        : f.p_gsis_conso_ln
                   , p_gsis_policy_reg_ln   : f.p_gsis_policy_reg_ln
                   , p_gsis_policy_opt_ln   : f.p_gsis_policy_opt_ln
                   , p_gsis_uoli_ln         : f.p_gsis_uoli_ln
                   , p_gsis_emergency_ln    : f.p_gsis_emergency_ln
                   , p_gsis_ecard_ln        : f.p_gsis_ecard_ln
                   , p_gsis_educ_asst_ln    : f.p_gsis_educ_asst_ln
                   , p_gsis_real_state_ln   : f.p_gsis_real_state_ln
                   , p_gsis_sos_ln          : f.p_gsis_sos_ln
                   , p_gsis_help            : f.p_gsis_help

                    //,u_gsis_gs               : 0.00
                    //,u_gsis_ps               : 0.00
                    //,u_sif_gs                : 0.00
                    //,u_gsis_uoli             : 0.00
                    //,u_gsis_ehp              : 0.00
                    //,u_gsis_hip              : 0.00
                    //,u_gsis_ceap             : 0.00
                    //,u_gsis_addl_ins         : 0.00
                    //,u_gsis_conso_ln         : 0.00
                    //,u_gsis_policy_reg_ln    : 0.00
                    //,u_gsis_policy_opt_ln    : 0.00
                    //,u_gsis_uoli_ln          : 0.00
                    //,u_gsis_emergency_ln     : 0.00
                    //,u_gsis_ecard_ln         : 0.00
                    //,u_gsis_educ_asst_ln     : 0.00
                    //,u_gsis_real_state_ln    : 0.00
                    //,u_gsis_sos_ln           : 0.00
                    //,u_gsis_help             : 0.00

                   , o_gsis_gs              : toDecimalFormat(s.fd.txtb_GS_override)
                   , o_gsis_ps              : toDecimalFormat(s.fd.txtb_PS_override)
                   , remittance_status      : s.fd.remit_status
        }
        return data
    }

    function toDecimalFormat(data)
    {
        var value = 0.00
        if (data == "" || data == undefined) 
        {
            return value
        }


        var val = parseFloat(data.replace(/,/g, ''))

        if (isNaN(val)) 
        {
            return value;
        }
        else 
        {
            return val;
        }
    }

    s.btn_report_GSIS = function (report_type) {
        var r_year = $("#remittanceyear").val();
        var r_month = $("#remittancemonth").val();

        h.post("../cRemitLedgerGSIS/BackPage", {
            par_r_year: r_year
            ,par_r_month: r_month
            ,par_r_type: report_type
        }).then(function (d) {

            if (d.data.sp_uploaded_data_rep_GSIS.length > 0) {
                var controller = "Reports";
                var action = "Index";
                var ReportName = "cryRemittanceGSIS_NPN_NRL";
                var SaveName = "Crystal_Report";
                var ReportType = "inline";
                var ReportPath = "~/Reports/cryRemittanceGSIS/cryRemittanceGSIS_NPN_NRL.rpt"
                var sp = "sp_uploaded_data_rep_GSIS,p_remittance_year," + r_year + ",p_remittance_month," + r_month + ",p_report_type," + report_type + ""
                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp
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
            
        })
      
      
    }
    
    s.BackToHeader = function()
    {
        location.href = "../cRemitLedger/Index"
    }
    $(".money").on('blur',function () {
       
        if (isCurrency(w_dc($(this).val())))
        {
            $(this).css({
                "border-color": "#1A7BB9",
                "border-weight": "1px",
                "border-style": "solid"
            })
          
        }
        else
        {
            $(this).css({
                "border-color": "red",
                "border-weight": "1px",
                "border-style": "solid"
            })
            
        }
    })
    function checkinvalid()
    {
        var red = 0
        var inputlist = $(".money")
        var inputlen = inputlist.length
       

        for(var x = 0; x < inputlen; x++)
        {
            var nbr = $(inputlist[x]).val().replace(/,/g, '')
            
           
            if (!isCurrency(w_dc(nbr)))
            {
               red = red + 1;
            }
            
        }
      
       if(red > 0)
       {
          return true
       }
       else
       {
          return false
       }
    }

    //********************************************************************/
    //*** VJA : 2021-07-21 - This Function is for Grand Total Viewing****//
    //********************************************************************/
    s.btn_view_grand_total = function (id_ss) {
        h.post("../cRemitLedger/RetrieveGrandTotal",
            {
                par_remittance_ctrl_nbr: $('#remittance_ctrl_nbr').val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    console.log(d.data.data)

                    // **********************************************************
                    // ********** Show the Div on Index *************************
                    // **********************************************************
                    s.show_div_gsis = false;
                    s.show_div_phic_hdmf = false;
                    s.show_div_sss_oth = false
                    s.show_div_tax = false

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
                        var total_proccessed_hdmf
                        total_proccessed_hdmf = 0
                        var total_uploaded_hdmf
                        total_uploaded_hdmf = 0
                        var total_override_hdmf
                        total_override_hdmf = 0

                        total_proccessed_hdmf = toDecimalFormat(d.data.data.payroll_amount_gs)
                            + toDecimalFormat(d.data.data.payroll_amount_ps)
                        s.txtb_total_processed_hdmf = currency(total_proccessed_hdmf)

                        total_uploaded_hdmf = toDecimalFormat(d.data.data.uploaded_amount_gs)
                            + toDecimalFormat(d.data.data.uploaded_amount_ps)
                        s.txtb_total_uploaded_hdmf = currency(total_uploaded_hdmf)

                        total_override_hdmf = toDecimalFormat(d.data.data.override_amount_gs)
                            + toDecimalFormat(d.data.data.override_amount_gs)
                        s.txtb_total_override_hdmf = currency(total_override_hdmf)


                    }

                    else if (d.data.data.remittancetype_code == "14") {

                        s.show_div_tax = true
                        var total_processed_tax
                        total_processed_tax = 0
                        total_processed_tax = toDecimalFormat(d.data.data.p_gsis_gs)
                            + toDecimalFormat(d.data.data.p_gsis_ps)
                            + toDecimalFormat(d.data.data.p_sif_gs)
                            + toDecimalFormat(d.data.data.p_gsis_uoli)
                            + toDecimalFormat(d.data.data.p_gsis_ehp)
                            + toDecimalFormat(d.data.data.p_gsis_hip)
                            + toDecimalFormat(d.data.data.p_gsis_ceap)
                            + toDecimalFormat(d.data.data.p_gsis_addl_ins)

                        s.txtb_total_tax = currency(total_processed_tax)

                        s.txtb_basic_tax_amount = d.data.data.p_gsis_gs
                        s.txtb_basic_ovtm_amount = d.data.data.p_gsis_ps
                        s.txtb_basic_2perc_amount = d.data.data.p_sif_gs
                        s.txtb_basic_3perc_amount = d.data.data.p_gsis_uoli
                        s.txtb_basic_5perc_amount = d.data.data.p_gsis_ehp
                        s.txtb_basic_8perc_amount = d.data.data.p_gsis_hip
                        s.txtb_basic_10perc_amount = d.data.data.p_gsis_ceap
                        s.txtb_basic_15perc_amount = d.data.data.p_gsis_addl_ins

                    }
                    else                                                // SSS and Others
                    {
                        s.show_div_sss_oth = true;
                    }
                    // **********************************************************
                    // **********************************************************

                    // **********************************************************
                    // ****** Clear the Textboxes *******************************
                    // **********************************************************
                    s.txtb_remittance_ctrl_no = "";
                    s.txtb_description = "";
                    s.ddl_remittancetype = "";
                    s.txtb_remittancetype = "";
                    s.txtb_year = "";
                    s.txtb_month = "";
                    s.txtb_date_created = "";
                    s.txtb_created_by = "";
                    s.txtb_p_gsis_gs = "0.00";
                    s.txtb_p_gsis_ps = "0.00";
                    s.txtb_p_sif_gs = "0.00";
                    s.txtb_p_gsis_uoli = "0.00";
                    s.txtb_p_gsis_ehp = "0.00";
                    s.txtb_p_gsis_hip = "0.00";
                    s.txtb_p_gsis_ceap = "0.00";
                    s.txtb_p_gsis_addl_ins = "0.00";
                    s.txtb_p_gsis_conso_ln = "0.00";
                    s.txtb_p_gsis_policy_reg_ln = "0.00";
                    s.txtb_p_gsis_policy_opt_ln = "0.00";
                    s.txtb_p_gsis_emergency_ln = "0.00";
                    s.txtb_p_gsis_ecard_ln = "0.00";
                    s.txtb_p_gsis_educ_asst_ln = "0.00";
                    s.txtb_p_gsis_real_state_ln = "0.00";
                    s.txtb_p_gsis_sos_ln = "0.00";
                    s.txtb_p_gsis_help = "0.00";
                    s.txtb_u_gsis_gs = "0.00";
                    s.txtb_u_gsis_ps = "0.00";
                    s.txtb_u_sif_gs = "0.00";
                    s.txtb_u_gsis_uoli = "0.00";
                    s.txtb_u_gsis_ehp = "0.00";
                    s.txtb_u_gsis_hip = "0.00";
                    s.txtb_u_gsis_ceap = "0.00";
                    s.txtb_u_gsis_addl_ins = "0.00";
                    s.txtb_u_gsis_conso_ln = "0.00";
                    s.txtb_u_gsis_policy_reg_ln = "0.00";
                    s.txtb_u_gsis_policy_opt_ln = "0.00";
                    s.txtb_u_gsis_emergency_ln = "0.00";
                    s.txtb_u_gsis_ecard_ln = "0.00";
                    s.txtb_u_gsis_educ_asst_ln = "0.00";
                    s.txtb_u_gsis_real_state_ln = "0.00";
                    s.txtb_u_gsis_sos_ln = "0.00";
                    s.txtb_u_gsis_help = "0.00";
                    s.txtb_o_gsis_gs = "0.00";
                    s.txtb_o_gsis_ps = "0.00";
                    s.txtb_p_other_loan1 = "0.00";
                    s.txtb_p_other_loan2 = "0.00";
                    s.txtb_u_other_loan1 = "0.00";
                    s.txtb_u_other_loan2 = "0.00";
                    s.txtb_o_other_loan1 = "0.00";
                    s.txtb_o_other_loan2 = "0.00";
                    s.txtb_p_other_loan3 = "0.00";
                    s.txtb_u_other_loan3 = "0.00";
                    s.txtb_o_other_loan3 = "0.00";
                    s.txtb_payroll_amount_gs = "0.00";
                    s.txtb_payroll_amount_ps = "0.00";
                    s.txtb_uploaded_amount_gs = "0.00";
                    s.txtb_uploaded_amount_ps = "0.00";
                    s.txtb_override_amount_gs = "0.00";
                    s.txtb_override_amount_ps = "0.00";
                    s.txtb_payroll_amount = "0.00";
                    s.txtb_uploaded_amount = "0.00";

                    // **********************************************************
                    // **********************************************************

                    s.txtb_remittance_ctrl_no = d.data.data.remittance_ctrl_nbr;
                    s.txtb_description = d.data.data.remittance_descr;
                    s.txtb_remittancetype = d.data.data.remittancetype_descr;
                    s.txtb_year = $('#remittanceyear').val();
                    s.txtb_month = $('#remittance_month_descr').val();


                    s.txtb_p_gsis_gs = d.data.data.p_gsis_gs
                    s.txtb_p_gsis_ps = d.data.data.p_gsis_ps
                    s.txtb_p_sif_gs = d.data.data.p_sif_gs
                    s.txtb_p_gsis_uoli = d.data.data.p_gsis_uoli
                    s.txtb_p_gsis_ehp = d.data.data.p_gsis_ehp
                    s.txtb_p_gsis_hip = d.data.data.p_gsis_hip
                    s.txtb_p_gsis_ceap = d.data.data.p_gsis_ceap
                    s.txtb_p_gsis_addl_ins = d.data.data.p_gsis_addl_ins
                    s.txtb_p_gsis_conso_ln = d.data.data.p_gsis_conso_ln
                    s.txtb_p_gsis_policy_reg_ln = d.data.data.p_gsis_policy_reg_ln
                    s.txtb_p_gsis_policy_opt_ln = d.data.data.p_gsis_policy_opt_ln
                    s.txtb_p_gsis_emergency_ln = d.data.data.p_gsis_emergency_ln
                    s.txtb_p_gsis_ecard_ln = d.data.data.p_gsis_ecard_ln
                    s.txtb_p_gsis_educ_asst_ln = d.data.data.p_gsis_educ_asst_ln
                    s.txtb_p_gsis_real_state_ln = d.data.data.p_gsis_real_state_ln
                    s.txtb_p_gsis_sos_ln = d.data.data.p_gsis_sos_ln
                    s.txtb_p_gsis_help = d.data.data.p_gsis_help
                    s.txtb_u_gsis_gs = d.data.data.u_gsis_gs
                    s.txtb_u_gsis_ps = d.data.data.u_gsis_ps
                    s.txtb_u_sif_gs = d.data.data.u_sif_gs
                    s.txtb_u_gsis_uoli = d.data.data.u_gsis_uoli
                    s.txtb_u_gsis_ehp = d.data.data.u_gsis_ehp
                    s.txtb_u_gsis_hip = d.data.data.u_gsis_hip
                    s.txtb_u_gsis_ceap = d.data.data.u_gsis_ceap
                    s.txtb_u_gsis_addl_ins = d.data.data.u_gsis_addl_ins
                    s.txtb_u_gsis_conso_ln = d.data.data.u_gsis_conso_ln
                    s.txtb_u_gsis_policy_reg_ln = d.data.data.u_gsis_policy_reg_ln
                    s.txtb_u_gsis_policy_opt_ln = d.data.data.u_gsis_policy_opt_ln
                    s.txtb_u_gsis_emergency_ln = d.data.data.u_gsis_emergency_ln
                    s.txtb_u_gsis_ecard_ln = d.data.data.u_gsis_ecard_ln
                    s.txtb_u_gsis_educ_asst_ln = d.data.data.u_gsis_educ_asst_ln
                    s.txtb_u_gsis_real_state_ln = d.data.data.u_gsis_real_state_ln
                    s.txtb_u_gsis_sos_ln = d.data.data.u_gsis_sos_ln
                    s.txtb_u_gsis_help = d.data.data.u_gsis_help
                    s.txtb_o_gsis_gs = d.data.data.o_gsis_gs
                    s.txtb_o_gsis_ps = d.data.data.o_gsis_ps
                    s.txtb_p_other_loan1 = d.data.data.p_other_loan1
                    s.txtb_p_other_loan2 = d.data.data.p_other_loan2
                    s.txtb_u_other_loan1 = d.data.data.u_other_loan1
                    s.txtb_u_other_loan2 = d.data.data.u_other_loan2
                    s.txtb_o_other_loan1 = d.data.data.o_other_loan1
                    s.txtb_o_other_loan2 = d.data.data.o_other_loan2
                    s.txtb_p_other_loan3 = d.data.data.p_other_loan3
                    s.txtb_u_other_loan3 = d.data.data.u_other_loan3
                    s.txtb_o_other_loan3 = d.data.data.o_other_loan3
                    s.txtb_payroll_amount_gs = d.data.data.payroll_amount_gs
                    s.txtb_payroll_amount_ps = d.data.data.payroll_amount_ps
                    s.txtb_uploaded_amount_gs = d.data.data.uploaded_amount_gs
                    s.txtb_uploaded_amount_ps = d.data.data.uploaded_amount_ps
                    s.txtb_override_amount_gs = d.data.data.override_amount_gs
                    s.txtb_override_amount_ps = d.data.data.override_amount_ps
                    s.txtb_payroll_amount = d.data.data.payroll_amount
                    s.txtb_uploaded_amount = d.data.data.uploaded_amount




                    // s.txtb_remittance_ctrl_no = s.datalistgrid[id_ss].remittance_ctrl_nbr;
                    $('#modal_grand_total').modal({ keyboard: false, backdrop: "static" });

                    var total_processed
                    var total_uploaded
                    var total_override
                    total_processed = 0
                    total_uploaded = 0
                    total_override = 0

                    total_processed =
                        toDecimalFormat(d.data.data.p_gsis_gs)
                        + toDecimalFormat(d.data.data.p_gsis_ps)
                        + toDecimalFormat(d.data.data.p_sif_gs)
                        + toDecimalFormat(d.data.data.p_gsis_uoli)
                        + toDecimalFormat(d.data.data.p_gsis_ehp)
                        + toDecimalFormat(d.data.data.p_gsis_hip)
                        + toDecimalFormat(d.data.data.p_gsis_ceap)
                        + toDecimalFormat(d.data.data.p_gsis_addl_ins)
                        + toDecimalFormat(d.data.data.p_gsis_conso_ln)
                        + toDecimalFormat(d.data.data.p_gsis_policy_reg_ln)
                        + toDecimalFormat(d.data.data.p_gsis_policy_opt_ln)
                        + toDecimalFormat(d.data.data.p_gsis_emergency_ln)
                        + toDecimalFormat(d.data.data.p_gsis_ecard_ln)
                        + toDecimalFormat(d.data.data.p_gsis_educ_asst_ln)
                        + toDecimalFormat(d.data.data.p_gsis_real_state_ln)
                        + toDecimalFormat(d.data.data.p_gsis_sos_ln)
                        + toDecimalFormat(d.data.data.p_gsis_help)
                        + toDecimalFormat(d.data.data.p_other_loan1)
                        + toDecimalFormat(d.data.data.p_other_loan2)
                        + toDecimalFormat(d.data.data.p_other_loan3)

                    total_uploaded =

                        toDecimalFormat(d.data.data.u_gsis_gs)
                        + toDecimalFormat(d.data.data.u_gsis_ps)
                        + toDecimalFormat(d.data.data.u_sif_gs)
                        + toDecimalFormat(d.data.data.u_gsis_uoli)
                        + toDecimalFormat(d.data.data.u_gsis_ehp)
                        + toDecimalFormat(d.data.data.u_gsis_hip)
                        + toDecimalFormat(d.data.data.u_gsis_ceap)
                        + toDecimalFormat(d.data.data.u_gsis_addl_ins)
                        + toDecimalFormat(d.data.data.u_gsis_conso_ln)
                        + toDecimalFormat(d.data.data.u_gsis_policy_reg_ln)
                        + toDecimalFormat(d.data.data.u_gsis_policy_opt_ln)
                        + toDecimalFormat(d.data.data.u_gsis_emergency_ln)
                        + toDecimalFormat(d.data.data.u_gsis_ecard_ln)
                        + toDecimalFormat(d.data.data.u_gsis_educ_asst_ln)
                        + toDecimalFormat(d.data.data.u_gsis_real_state_ln)
                        + toDecimalFormat(d.data.data.u_gsis_sos_ln)
                        + toDecimalFormat(d.data.data.u_gsis_help)
                        + toDecimalFormat(d.data.data.u_other_loan3)
                        + toDecimalFormat(d.data.data.u_other_loan1)
                        + toDecimalFormat(d.data.data.u_other_loan2)

                    total_override =
                        toDecimalFormat(d.data.data.o_gsis_gs)
                        + toDecimalFormat(d.data.data.o_gsis_ps)
                        + toDecimalFormat(d.data.data.o_other_loan1)
                        + toDecimalFormat(d.data.data.o_other_loan2)
                        + toDecimalFormat(d.data.data.o_other_loan3)


                    s.txtb_total_processed = currency(total_processed)
                    s.txtb_total_uploaded = currency(total_uploaded)
                    s.txtb_total_override = currency(total_override)
                }
                else if (d.data.message == "error") {
                    swal("Something Went wrong!", "No Accounting Header", "warning");
                }
                else {
                    swal("You Cannot View", d.data.message, "warning");
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