ng_HRD_App.controller("cADAFnlApprDTL_ctrlr", function ($scope, $compile, $http, $filter) {
    var s               = $scope
    var h               = $http
    s.year              = []
    s.reports           = null;
    var userid          = "";
    var index_update    = "";
    s.allow_edit        = true

    s.oTable            = null;
    s.datalistgrid      = null;
    s.rowLen            = "10";
    s.ddl_reports       = "";
    s.datalistArray     = [];
    s.ca_status         = "";
    s.disabled_btn      = false;
    s.hide_add          = true;
    s.ca_status_descr = "";

    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    // ca voucher nbr = control nbr

    function init()
    {
        var browserHeight = window.innerHeight
        s.isEdit = false
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cADAFnlApprDTL/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.employeeddl           = d.data.empType
            s.ca_type               = d.data.ca_type
            userid                  = d.data.userid
            s.fundcsource           = d.data.fundsource
            s.cavoucherddl          = d.data.sp_cashadv_hdr_tbl_list
            s.ddl_ca_voucher_nbr    = d.data.prevValues[5]
            s.payrolltemplate       = d.data.payrolltemplate
            s.ca_status             = d.data.prevValues[9]; // par_ca_status
            s.ca_status_descr       = d.data.prevValues[10]; // par_ca_status_descr
            if (s.ca_status == "X" ||
                s.ca_status == "P" ||
                s.ca_status == "R" ||
                s.ca_status == "U" ||
                s.ca_status == "D" ||
                s.ca_status == "F" ||
                s.ca_status == "V" ||
                s.ca_status == "W") {
                s.disabled_btn  = true;
                s.hide_add      = false;
            }
            s.ddl_year              = d.data.prevValues[0] // par_remittance_year
            s.ddl_month             = d.data.prevValues[1] // par_remittance_month
            s.ddl_payroll_month     = d.data.prevValues[1] // par_remittance_month
            //s. = d.data.prevValues[2].toString().trim() // par_remittance_month_descr
            s.ddl_employment_type = d.data.prevValues[3] // par_employment_type
            //s. = d.data.prevValues[4].toString().trim() // par_employment_type_descr
            //s.ddl_payrolltemplate = d.data.prevValues[5] // par_remittancetype_code
            //s. = d.data.prevValues[6].toString().trim() // par_remittancetype_code_descr
            //s. = d.data.prevValues[7].toString().trim() // par_remittance_ctrl_nbr
            //s. = d.data.prevValues[8].toString().trim() // par_remittance_status
            //s. = d.data.prevValues[9].toString().trim() // par_remittance_status_descr
            s.rowLen = d.data.prevValues[10] // par_show_entries
            //s. = d.data.prevValues[11].toString().trim() // par_page_nbr
            s.search_box = d.data.prevValues[12] // par_search

            s.txtb_year_main            = d.data.prevValues[0]
            s.txtb_month_main           = d.data.prevValues[2]
            s.txtb_employment_type_main = d.data.prevValues[4]
            s.txtb_ca_voucher_nbr_main  = d.data.prevValues[11]
            
            init_table_data([]);
            console.log(d.data.sp_cashadv_dtl_tbl_list)
            if (d.data.sp_cashadv_dtl_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_cashadv_dtl_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_cashadv_dtl_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
            }
            
            // s.oTable.fnSort([[sort_value, sort_order]]);
            // s.oTable.fnPageChange(page_value);
            
            if ($("#ddl_reports").val() == "" || $("#ddl_remittancetype").val() == "") {
                s.ShowSelected = false
            }
            else {
                s.ShowSelected = true
            }

            $("#loading_data").modal("hide");

            RetrieveYear();
            s.rowLen = "10"
          
            if (d.data.prevValues[1] == null) {
                s.ddl_year = new Date().getFullYear().toString()
                s.currentMonth = (new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()
                s.ddl_month = s.currentMonth.toString()
            }
            else {
                s.ddl_year = d.data.prevValues[0]
                s.ddl_month = d.data.prevValues[1]
            }
        });

        
    }
    init()
    
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
               
                    {
                        "mData": "voucher_nbr",
                        "mRender": function (data, type, full, row)
                        { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "payroll_registry_nbr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "payroll_registry_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "payrolltemplate_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData":null,
                        "mRender": function (data, type, full, row)
                        { return "<span class='text-left btn-block'>" + month[full["payroll_month"]-1]+"-"+full["payroll_year"] + "</span>" }
                    },
                    {
                        "mData": "net_pay",
                        "mRender": function (data, type, full, row)
                        {
                           var display_data = "";
                            if (full["pay_period"].toString() == "02") {
                                display_data = full["net_pay1"].toString();
                            }
                            else if (full["pay_period"].toString() == "03") {
                                display_data = full["net_pay2"].toString();
                            }
                            else
                            {
                                display_data = full["net_pay"].toString();
                            }
                            return "<span class='text-right btn-block'>" + display_data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return  '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-info btn-sm"    ng-click="btn_edit_action(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                    '<button type="button" class="btn btn-danger btn-sm"  ng-disabled="'+s.disabled_btn+'"  ng-click="btn_del_row(' + row["row"] + ')"      data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                    '</div></center>';
                            
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            }
        );

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }


   
    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }
    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    function MonthFormat(number) {
        return (number < 10 ? '0' : '') + number
    }
   
    /************************************/
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectMonth = function (par_year, par_month, par_empType, par_remittancetype) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cADAFnlApprDTL/RetrieveListGrid",
            {
                par_year: par_year
                , par_month: par_month
                , par_empType: par_empType
                , par_remittancetype: par_remittancetype

            }).then(function (d) {

                if (d.data.sp_cashadv_dtl_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_cashadv_dtl_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_cashadv_dtl_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }
                $("#loading_data").modal("hide");

            })
    }

    /************************************/
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectYear = function (par_year, par_month, par_empType, par_remittancetype) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cADAFnlApprDTL/RetrieveListGrid",
            {
                par_year: par_year
                , par_month: par_month
                , par_empType: par_empType
                , par_remittancetype: par_remittancetype

            }).then(function (d) {

                if (d.data.sp_cashadv_dtl_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_cashadv_dtl_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_cashadv_dtl_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }
                $("#loading_data").modal("hide");
            })
    }
    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectEmploymentType = function (empType)
    {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cADAFnlApprDTL/RetrieveListGrid",
            {
                par_year: s.ddl_year
                , par_month: s.ddl_month
                , par_empType: empType

            }).then(function (d) {
                if (d.data.sp_cashadv_dtl_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_cashadv_dtl_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_cashadv_dtl_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }
                $("#loading_data").modal("hide");
            })

        h.post("../cADAFnlApprDTL/SelectEmploymentType", { par_empType: empType }).then(function (d)
            {
            s.remittancetype = d.data.sp_remittance
        })
        
    }
    //*************************************//
    //***********Open-Add-Modal************//
    //*************************************// 
    s.btn_add = function () {
        clearentry()
        btn             = document.getElementById('add');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Add';
        s.isEdit        = false
        s.ishow         = true
        s.isdisabled    = true
        FieldValidationColorChanged(false, "ALL");
        s.ddl_payroll_month = s.ddl_month;
        if ($("#ddl_employment_type").val() == "")
        {
            $("#ddl_employment_type").addClass('require-field')
            s.lbl_requiredfield6 = "required field!"
            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
        }
        else
        {
                setTimeout(function () {
                btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
                
                s.txtb_year = $('#ddl_year option:selected').text();
                s.txtb_month = $('#ddl_month option:selected').text();
                s.txtb_ca_voucher_nbr = s.txtb_ca_voucher_nbr_main

                s.ishow         = true
                s.isupdate      = false
                s.ModalTitle    = "Add New Record"
                
                // BEGIN : Retrieve Voucher Number on Combolist
                h.post("../cADAFnlApprDTL/RetrieveVoucher", {
                        par_year                : s.ddl_year
                    , par_month                 : s.ddl_month
                    , par_empType               : s.ddl_employment_type
                    , par_pay_period            : s.ddl_pay_period
                    , par_payrolltemplate_code  : s.ddl_payrolltemplate
                    , par_ca_ctrl_nbr           : s.txtb_ca_voucher_nbr_main

                }).then(function (d) {
                    s.voucherdll = d.data.sp_voucher_combolist_info4
                    })
                // END   : Retrieve Voucher Number on Combolist


                if (s.ddl_pay_period == "01")
                {
                    s.div_total_net         = false
                    s.div_total_net1        = true
                    s.div_total_net2        = true
                }
                else if (s.ddl_pay_period == "02")
                {
                    s.div_total_net         = true
                    s.div_total_net1        = false
                    s.div_total_net2        = true
                }
                else if (s.ddl_pay_period == "03")
                {
                    s.div_total_net         = true
                    s.div_total_net1        = true
                    s.div_total_net2        = false
                }
                
                $('#main_modal').modal({ keyboard: false, backdrop: "static" });
            }, 300);
        }
    }

    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function clearentry() {
        s.ddl_voucher_nbr       = ""
        s.txtb_ca_voucher_nbr   = ""
        s.txtb_payrolltemplate  = ""
        s.txtb_registry_nbr     = ""
        s.txtb_voucher_nbr      = ""
        s.ddl_pay_period        = "01"
        s.txtb_total_netpay1    = ""
        s.txtb_total_netpay2    = ""
        s.txtb_total_netpay     = ""
        s.ddl_payrolltemplate   = ""
        FieldValidationColorChanged(false, "ALL");
    }
    //***************************bt*********//
    //***Save-Job-Description-Function****//
    //************************************// 
    s.btn_save_add = function (move_val) 
    {
        var template_code = $('#txtb_payrolltemplate').attr('ngx-data');

        if (s.datalistgrid.length > 12 && move_val == "x") {
            swal({
                title: "Are you sure you want to continue ?",
                text:  "Cash Advance Report have 12 maximum details",
                icon:  "warning",
                buttons: true,
                dangerMode: true,
            })
                .then(function (willDelete) {
                    if (willDelete)
                    {
                        s.btn_save_add('y')
                    }
                });
            
        }
        else
        {
            if (isdataValidated())
            {
                
                btn = document.getElementById('addFinal');
                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save Only';
                var data =
                {
                    ca_ctrl_nbr: s.txtb_ca_voucher_nbr,
                    voucher_nbr: s.txtb_voucher_nbr,
                    pay_period: s.ddl_pay_period,

                    payroll_registry_descr: $('#ddl_voucher_nbr option:selected').html().split('-')[$('#ddl_voucher_nbr option:selected').html().split('-').length -1],
                    payrolltemplate_descr: s.txtb_payrolltemplate,
                    payrolltemplate_code: template_code,
                    net_pay: s.txtb_total_netpay,
                    payroll_registry_nbr: s.txtb_registry_nbr,
                    payroll_month: s.ddl_payroll_month,
                    payroll_year: s.ddl_year,
                    net_pay1: s.txtb_total_netpay1,
                    net_pay2: s.txtb_total_netpay2
                }
               

                h.post("../cADAFnlApprDTL/SaveFromDatabase",
                    {
                        par_ca_ctrl_nbr: s.txtb_ca_voucher_nbr,
                        par_voucher_nbr: s.txtb_voucher_nbr,
                        par_pay_period: s.ddl_pay_period,

                    }).then(function (d) {
                        if (d.data.success == 1) {
                            s.datalistgrid.push(data);
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);

                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_voucher_nbr) == false) {
                                    s.oTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                            swal("Successfully Added !", "New record successfully added!", "success");
                            $("#main_modal").modal("hide");
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save Only';
                        }
                        else {
                            swal("Saving error!", "Data not save, Duplicate Voucher Number", "error");
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save Only';
                        }
                    })
            }
        }
        
        
    }
    //**************************************//
    //***Update-Database-Function****//
    //**************************************//
    s.btn_save_update = function ()
    {
        var row_id = $('#btn_save_update').attr('ngx-data');
        
            h.post("../cADAFnlApprDTL/UpdateFromDatabase", {

                par_ca_ctrl_nbr             : s.txtb_ca_voucher_nbr,
                par_voucher_nbr             : s.txtb_voucher_nbr,
                par_pay_period              : s.ddl_pay_period,

                }).then(function (d) {
                    if (d.data.message == "success") {
                        
                        updateListGrid(row_id);
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_voucher_nbr) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Existing record successfully updated!", "success")
                        $("#main_modal").modal("hide");
                    }
                    else {
                        swal("Saving error!", "Data not save, Duplicate Voucher Number", "error");
                    }
                    
                    
                })
        
    }
    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function updateListGrid(row_id)
    {
        s.datalistgrid[row_id].ca_ctrl_nbr       = s.txtb_ca_voucher_nbr,
        s.datalistgrid[row_id].voucher_nbr          = s.txtb_voucher_nbr,
        s.datalistgrid[row_id].pay_period           = s.ddl_pay_period,
        s.datalistgrid[row_id].net_pay              = s.txtb_total_netpay,
        s.datalistgrid[row_id].payroll_registry_nbr = s.txtb_registry_nbr,
            
        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
    }
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_edit_action = function (id_ss) {
        s.isEdit = true
        clearentry()
        s.txtb_ca_voucher_nbr   = s.txtb_ca_voucher_nbr_main;
        s.txtb_voucher_nbr_descr= s.datalistgrid[id_ss].payroll_registry_descr;
        s.txtb_payrolltemplate  = s.datalistgrid[id_ss].payrolltemplate_descr;
        s.txtb_registry_nbr     = s.datalistgrid[id_ss].payroll_registry_nbr;
        s.txtb_voucher_nbr      = s.datalistgrid[id_ss].voucher_nbr;
        s.ddl_pay_period        = s.datalistgrid[id_ss].pay_period;
        s.txtb_total_netpay1    = s.datalistgrid[id_ss].net_pay1;
        s.txtb_total_netpay2    = s.datalistgrid[id_ss].net_pay2;
        s.txtb_total_netpay     = s.datalistgrid[id_ss].net_pay;
        s.ddl_payroll_month     = s.datalistgrid[id_ss].payroll_month;
        s.ddl_year              = s.datalistgrid[id_ss].payroll_year;

        if (s.datalistgrid[id_ss].payrolltemplate_code == "008"
            || s.datalistgrid[id_ss].payrolltemplate_code == "007"
            || s.datalistgrid[id_ss].payrolltemplate_code == "009") {

            s.div_pay_period = false
            s.div_total_net1 = false
            s.div_total_net2 = false

            //s.ddl_pay_period = "01"

        } else {
            s.div_pay_period = true
            s.div_total_net1 = true
            s.div_total_net2 = true
            //s.ddl_pay_period = "02"
        }

        if (s.ddl_pay_period == "01")
        {
            s.div_total_net         = false
            s.div_total_net1        = true
            s.div_total_net2        = true
        }
        else if (s.ddl_pay_period == "02")
        {
            s.div_total_net         = true
            s.div_total_net1        = false
            s.div_total_net2        = true
        }
        else if (s.ddl_pay_period == "03")
        {
            s.div_total_net         = true
            s.div_total_net1        = true
            s.div_total_net2        = false
        }

        s.ishow         = false
        s.isupdate      = true
        s.isdisabled    = false
        if (s.ca_status == "X"
            || s.ca_status == "Y"
            || s.ca_status == "P"
            || s.ca_status == "D"
            || s.ca_status == "U"
            || s.ca_status == "F"
            || s.ca_status == "W")
        {
            s.ishow         = false
            s.isupdate      = false
            s.isdisabled    = true
        }
        $('#btn_save_update').attr('ngx-data', id_ss);

        s.ModalTitle        = "Edit Record";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_del_row = function (id_ss) {
        var dt = null;
        dt = s.datalistgrid[id_ss]
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cADAFnlApprDTL/DeleteFromDatabase",
                        {
                            par_voucher_nbr: s.datalistgrid[id_ss].voucher_nbr,
                            par_ca_ctrl_nbr: s.txtb_ca_voucher_nbr_main
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                
                                s.datalistgrid = s.datalistgrid.delete(id_ss);
                                if (s.datalistgrid.length != 0) {
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid);

                                } else {
                                    s.oTable.fnClearTable();
                                }
                                swal("Your record has been deleted!", { icon: "success", });

                            }
                            else {
                                swal("Deleting error!", "Data not deleted!", "error");
                            }

                        })
                }
            });

    }
    //**************************************//
    //***Data Validated****//
    //**************************************//
    function isdataValidated() {
        FieldValidationColorChanged(false, "ALL");

        var validatedSaved = true
        if (s.ddl_voucher_nbr == "") {
            FieldValidationColorChanged(true, "ddl_voucher_nbr")
            validatedSaved = false;
        }
        
        return validatedSaved;

    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName)
    {

        if (pMode)
            switch (pObjectName) {
                
                case "ddl_voucher_nbr":
                    {
                        $("#ddl_voucher_nbr").addClass('require-field')
                        s.lbl_requiredfield1 = "required field!"
                        break;
                    }

            }
        else if (!pMode) {
            switch (pObjectName) {

                case "ALL":
                    {
                        s.lbl_requiredfield1 = "";
                        s.lbl_requiredfield2 = ""
                        s.lbl_requiredfield3 = "";
                        s.lbl_requiredfield4 = "";
                        s.lbl_requiredfield5 = "";
                        
                        $("#ddl_voucher_nbr").removeClass('require-field')
                        
                        s.lbl_requiredfield6 = "";
                        s.lbl_requiredfield7 = "";
                        break;
                    }

            }
        }
    }
    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
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
    function show_date() {
        $('.datepicker').datepicker({ format: 'yyyy-mm-dd' });
    }

    //SELECT THE CURRENT ADDED/EDITED ROW OF THE DATALISTGRID
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
    //***********************************************************//
    //***Occure when voucher value change
    //***********************************************************// 
    s.set_voucher_index = function (par_voucher_index)
    {
        if (par_voucher_index != "") {
            s.txtb_payrolltemplate  = s.voucherdll[par_voucher_index].payrolltemplate_descr;
            s.txtb_registry_nbr     = s.voucherdll[par_voucher_index].payroll_registry_nbr;
            s.txtb_voucher_nbr      = s.voucherdll[par_voucher_index].voucher_nbr;
            s.txtb_total_netpay     = s.voucherdll[par_voucher_index].net_pay;
            s.txtb_total_netpay1    = s.voucherdll[par_voucher_index].net_pay1;
            s.txtb_total_netpay2    = s.voucherdll[par_voucher_index].net_pay2;

            $('#txtb_payrolltemplate').attr('ngx-data', s.voucherdll[par_voucher_index].payrolltemplate_code);

            if (s.voucherdll[par_voucher_index].payrolltemplate_code == "008"
                || s.voucherdll[par_voucher_index].payrolltemplate_code == "007"
                || s.voucherdll[par_voucher_index].payrolltemplate_code == "009")
            {

                //s.div_pay_period = true;
                if (s.voucherdll[par_voucher_index].pay_period == "01")
                {
                    s.ddl_pay_period_enable = false;
                    s.ddl_pay_period = "01";
                    s.ddl_pay_period_changed();
                }
                else if (s.voucherdll[par_voucher_index].pay_period == "02") {
                    s.ddl_pay_period_enable = true;
                    s.ddl_pay_period = "03";
                    s.ddl_pay_period_changed();
                }
                else if (s.voucherdll[par_voucher_index].pay_period == "03") {
                    s.ddl_pay_period_enable = true;
                    s.ddl_pay_period = "02";
                    s.ddl_pay_period_changed();
                }
                else
                {
                    //s.div_pay_period        = false
                    s.div_total_net1 = false
                    s.div_total_net2 = false
                }

               

            } else 
            {
               // s.div_pay_period        = true
                s.div_total_net1        = true
                s.div_total_net2        = true
                //s.ddl_pay_period        = "01"
            }

            if (s.ddl_pay_period == "01")
            {
                s.div_total_net         = false
                s.div_total_net1        = true
                s.div_total_net2        = true
            }
            else if (s.ddl_pay_period == "02")
            {
                s.div_total_net         = true
                s.div_total_net1        = false
                s.div_total_net2        = true
            }
            else if (s.ddl_pay_period == "03")
            {
                s.div_total_net         = true
                s.div_total_net1        = true
                s.div_total_net2        = false
            }

        } else {
            s.txtb_payrolltemplate = ""
            s.txtb_registry_nbr    = ""
            s.txtb_voucher_nbr     = ""
            s.txtb_total_netpay    = ""
            s.txtb_total_netpay1   = ""
            s.txtb_total_netpay2   = ""
        }
    }
     //***********************************************************//
    //*** Occure when voucher value change
    //***********************************************************// 
    s.ddl_pay_period_changed = function ()
    {
        // BEGIN : Retrieve Voucher Number on Combolist
        h.post("../cADAFnlApprDTL/RetrieveVoucher", {
            par_year                    : s.ddl_year
            , par_month                 : s.ddl_payroll_month
            , par_empType               : s.ddl_employment_type
            , par_pay_period            : s.ddl_pay_period
            , par_payrolltemplate_code: s.ddl_payrolltemplate
            , par_ca_ctrl_nbr: s.txtb_ca_voucher_nbr_main

        }).then(function (d) {
            s.voucherdll = d.data.sp_voucher_combolist_info4
            })
        // END   : Retrieve Voucher Number on Combolist


        if (s.ddl_pay_period == "01")
        {
            s.div_total_net         = false
            s.div_total_net1        = true
            s.div_total_net2        = true
        }
        else if (s.ddl_pay_period == "02")
        {
            s.div_total_net         = true
            s.div_total_net1        = false
            s.div_total_net2        = true
        }
        else if (s.ddl_pay_period == "03")
        {
            s.div_total_net         = true
            s.div_total_net1        = true
            s.div_total_net2        = false
        }
    }

    //***********************************************************//
    //*** Occure when voucher value change
    //***********************************************************// 
    s.ddl_payrolltemplate_changed = function ()
    {
        // BEGIN : Retrieve Voucher Number on Combolist
        h.post("../cADAFnlApprDTL/RetrieveVoucher", {
            par_year: s.ddl_year
            , par_month: s.ddl_payroll_month
            , par_empType: s.ddl_employment_type
            , par_pay_period: s.ddl_pay_period
            , par_payrolltemplate_code: s.ddl_payrolltemplate
            , par_ca_ctrl_nbr: s.txtb_ca_voucher_nbr_main

        }).then(function (d) {
            s.voucherdll = d.data.sp_voucher_combolist_info4
        })
        // END   : Retrieve Voucher Number on Combolist

        if (s.ddl_payrolltemplate != "")
        {

            if (s.ddl_payrolltemplate == "008"
                || s.ddl_payrolltemplate == "007"
                || s.ddl_payrolltemplate == "009") {

                s.div_pay_period    = false
                s.div_total_net1    = false
                s.div_total_net2    = false
                s.div_total_net     = true
                //s.ddl_pay_period    = "01"

            } else {
                s.div_pay_period    = true
                s.div_total_net1    = true
                s.div_total_net2    = true
                s.div_total_net     = false
                //s.ddl_pay_period    = "01"
            }

            if (s.ddl_pay_period == "01")
            {
                s.div_total_net         = false
                s.div_total_net1        = true
                s.div_total_net2        = true
            }
            else if (s.ddl_pay_period == "02")
            {
                s.div_total_net         = true
                s.div_total_net1        = false
                s.div_total_net2        = true
            }
            else if (s.ddl_pay_period == "03")
            {
                s.div_total_net         = true
                s.div_total_net1        = true
                s.div_total_net2        = false
            }

        }
        else
        {
            s.ddl_voucher_nbr = ""
            s.txtb_payrolltemplate = ""
            s.txtb_registry_nbr = ""
            s.txtb_voucher_nbr = ""
            s.ddl_pay_period = "01"
            s.txtb_total_netpay1 = ""
            s.txtb_total_netpay2 = ""
            s.txtb_total_netpay = ""
            s.ddl_payrolltemplate = ""
        }
        
        
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    //***************************Functions end*********************************************************//

})

