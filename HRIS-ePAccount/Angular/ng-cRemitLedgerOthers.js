ng_HRD_App.controller("cRemitLedgerOthers_ctrlr", function ($scope, $compile, $http, $filter) {
    var s           = $scope
    var h           = $http
    s.year          = []
    s.allow_edit    = true

    s.oTable        = null
    s.datalistgrid  = null
    s.voucher_list  = null
    s.voucher       = null
    s.status        = null
    s.amount = null
   s.remittance_type = ""

    s.ddl_voucher_nbr   = ""
    s.temp              = ""
    s.temp2             = ""
    s.voucherTemp       = ""
    s.statusTemp        = ""
    s.remittance_status = ""
    s.check_table = ""
    s.month_arr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    s.month = [
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


    s.monthName = function(mo)
    {
        var retval = ""
        retval = s.month.filter(function (d) {
            return d.id == mo
        })[0].text
        return retval
    }
    function init() {

        s.ddl_letter = "";
        $("#modal_generating_remittance").modal();
        s.isEdit = false
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cRemitLedgerOthers/initializeData",
            {
                p_letter    : s.ddl_letter,
                p_dep_code  : s.ddl_departments,
                p_remit_nbr : s.txtb_control_nbr
            }).then(function (d) {
             
                s.prevValues = d.data.prevValues
                s.departments               = d.data.department_list
             
                s.txtb_control_nbr          = s.prevValues[7].trim()
                s.txtb_year                 = s.prevValues[0]
                s.txtb_month                = s.prevValues[2]
                s.txtb_employment_type      = s.prevValues[4].trim()
                s.txtb_remittance_status    = s.prevValues[9].trim()
                s.rowLen = "10"
                s.remittance_type = d.data.remittance_type
                s.ddl_print = "Employee"
                getLetterList();
                switch (d.data.prevValues[8].toString().trim()) {
                    case "N":
                        $('#txtb_remittance_status').switchClass('text-danger', 'text-warning');
                        break;
                    case "P":
                        $('#txtb_remittance_status').switchClass('text-warning', 'text-danger');
                        break;
                    case "R":
                        $('#txtb_remittance_status').switchClass('text-danger', 'text-success');
                        break;
                }
                if (d.data.listgrid.length > 0) {
                    init_table_data(d.data.listgrid);
                }
                else {
                    init_table_data([]);
                }
            
                $("#modal_generating_remittance").modal("hide");
                if (d.data.prevValues[5].toString().trim() == "10" || d.data.prevValues[5].toString().trim() == "11") {
                    showdetailsInfo("datalist_grid1");
                    s.check_table = "datalist_grid1"
                }
                else {
                    showdetailsInfo("datalist_grid2");
                    s.check_table = "datalist_grid2"
                }
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                s.allowAdd = d.data.allowAdd
                s.allowDelete = d.data.allowDelete
                s.allowEdit = d.data.allowEdit
                s.allowView = d.data.allowView

                if (s.allowAdd == "1") {
                    s.ShowAdd = true
                }
                else {
                    s.ShowAdd = false
                }

                if (s.allowDelete == "1") {
                    s.ShowDelete = true
                }
                else {
                    s.ShowDelete == false
                }

                if (s.allowEdit == "1") {
                    s.ShowView = true
                }
                else {
                    s.ShowView = false
                }

                if (s.voucher_list == null) {
                    s.ShowSelected = false
                }
                else {
                    s.ShowSelected = true
                }

                if (s.prevValues[5] == '11') {
                    s.ShowOffice = false
                }
                else {
                    s.ShowOffice = true
                }
        });

        
    }

    function addvalue(id, value) {
        $("#" + id).val(value)
        s[id] = value
    }


    init()

    

    var getLetterList = function () {
        h.post("../cRemitLedgerOthers/LetterList",
            {
                p_remit_nbr: s.txtb_control_nbr
            }).then(function (d) {

                s.letters = d.data.letter_list
                
            });
    }


    var init_table_data = function (par_data) {
       
        s.Others_Table = par_data;
        //-------- For NICO and CCMPC show upload/billed amount ------------//
        if (s.prevValues[5].trim() == "10" || s.prevValues[5].trim() == "11") {
            s.datalistgrid1 = par_data;
            s.aTable = $('#datalist_grid1').dataTable(
            {
                data: s.datalistgrid1,
                    sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "voucher_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "employee_name" },
                    {
                        "mData": "remittance_status_dtl",
                        "mRender": function (data, type, full, row) {
                            var return_html = "";
                            switch (data)
                            {
                                case "N":
                                    {
                                        return_html = "<span class='text-center btn-block text-warning'>NOT REMITTED</span>";
                                        break;
                                    }
                                case "F":
                                    {
                                        return_html = "<span class='text-center btn-block text-danger'>FOR REFUND</span>";
                                        break;
                                    }
                                case "R":
                                    {
                                        return_html = "<span class='text-center btn-block text-success'>REMITTED</span>" ;
                                        break;
                                    }
                            }
                            

                            return return_html;
                             
                        }
                    },
                    { "mData": "payroll_amount", "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>{{" + data + " | number:2}}</span>" } },
                    { "mData": "uploaded_amount", "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>{{" + data + " | number:2}}</span>" } },
                    { "mData": "payroll_month", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + s.monthName(data) + "</span>" } },

                   {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var editable = false;
                            var deletable = false;
                            if (full["remittance_status_dtl"] == "R") {
                                //editable = true;
                                deletable = true;
                            }
                            
                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ',1)" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-disabled="' + deletable + '" ng-click="btn_del_row(' + row["row"] + ',1)" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                    ,{
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data.substring(0, 1) + "</span>"
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
                });
        }
        else {
            s.datalistgrid2 = par_data;
            s.bTable = $('#datalist_grid2').dataTable(
                {
                data: s.datalistgrid2,
                    sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "voucher_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "employee_name" },
                    {
                        "mData": "remittance_status_dtl",
                        "mRender": function (data, type, full, row) {
                            var return_html = "";
                            switch (data) {
                                case "N":
                                    {
                                        return_html = "<span class='text-center btn-block text-warning'>NOT REMITTED</span>";
                                        break;
                                    }
                                case "F":
                                    {
                                        return_html = "<span class='text-center btn-block text-danger'>FOR REFUND</span>";
                                        break;
                                    }
                                case "R":
                                    {
                                        return_html = "<span class='text-center btn-block text-success'>REMITTED</span>";
                                        break;
                                    }
                            }


                            return return_html;

                        }
                    },
                    { "mData": "payroll_amount", "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>{{" + data + "| number:2}}</span>" } },
                    {
                        "mData": "payroll_month",
                        "mRender": function (data, type, full, row) {

                            return "<span class='text-center btn-block'>" + s.month_arr[parseInt(data) - 1] + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var editable = false;
                            var deletable = false;
                            if (full["remittance_status_dtl"] == "R") {
                                //editable = true;
                                deletable = true;
                            }
                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ',2)" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-disabled="' + deletable + '" ng-click="btn_del_row(' + row["row"] + ',2)" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                     ,{
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data.substring(0, 1) + "</span>"
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
                });
        }
    }





    function showdetailsInfo(table_id) {
        var info = $('#' + table_id).DataTable().page.info();
        $("div.toolbar").html("<b>Showing Page: " + (info.page + 1) + "</b> of <b>" + info.pages + " <i>pages</i></b>");
        $("div.toolbar").css("padding-top", "9px");
    }
    //************************************//
    //***       Open Add Modal        ****//
    //************************************// 
    s.btn_open_modal = function () {
        try {
            s.showNR = true;
            s.showR = false;
            s.disDDLDtatus = false;
            btn = document.getElementById('add');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
            setTimeout(function ()
            {
                btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
                clearentry()
                s.isEdit = false
                s.ModalTitle = "Add New Record"
                s.ddl_status = "N"
                h.post("../cRemitLedgerOthers/GetVoucherList").then(function (d) {
                    s.voucher_list = d.data.voucher_list
                  
                })
                $('#main_modal').modal("show");

                
            }, 300);
        }
        catch (err) {
            alert(err.message)
        }
    }
    //*********************************************//
    //*** Filter Grid BY Letter Or Department ****//
    //********************************************// 
    s.FilterByLetterAndDepartment = function () {
        try {
            if ($("#ddl_letter option:selected").val().toString() == "" && $("#ddl_departments option:selected").val().toString() == "") {
                h.post("../cRemitLedgerOthers/GetAllDataLedgerInfo", {
                    p_remit_nbr: s.txtb_control_nbr
                }).then(function (d) {
                    console.log(d.data.getAllData)
                    if (d.data.message == "success") {
                        //-------- For NICO and CCMPC show upload/billed amount ------------//
                        if (s.prevValues[5].trim() == "10" || s.prevValues[5].trim() == "11") {
                            s.aTable.fnClearTable();

                           

                            s.datalistgrid1 = d.data.getAllData
                            if (d.data.getAllData.length > 0) {
                                s.aTable.fnAddData(d.data.getAllData);
                            }
                        }
                        else {
                            s.bTable.fnClearTable();
                            s.datalistgrid2 = d.data.getAllData
                            if (d.data.getAllData.length > 0) {
                                s.bTable.fnAddData(d.data.getAllData);
                            }
                        }
                    }
                })
            }
            else {
                h.post("../cRemitLedgerOthers/FilterByLetterAndDepartment", {
                    remit_ctrl_nbr: s.txtb_control_nbr,
                    department: s.ddl_departments,
                    selectedLetter: s.ddl_letter
                }).then(function (d) {
                    console.log(d.data.filterResult)
                    if (d.data.message == "success") {
                        //-------- For NICO and CCMPC show upload/billed amount ------------//
                        if (s.prevValues[5].trim() == "10" || s.prevValues[5].trim() == "11") {
                            s.aTable.fnClearTable();
                           
                            s.datalistgrid1 = d.data.filterResult
                            if (d.data.filterResult.length > 0) {
                                s.aTable.fnAddData(d.data.filterResult);
                            }
                        }
                        else {
                            s.bTable.fnClearTable();
                            s.datalistgrid2 = d.data.filterResult
                            if (d.data.filterResult.length > 0) {
                                s.bTable.fnAddData(d.data.filterResult);
                            }
                        }
                    }
                })
            }
        }
        catch (err) {
            alert(err.message)
        }
    }
    //************************************//
    //***   Select Voucher Dropdown   ****//
    //************************************// 
    s.Select_Voucher = function (id)
    {
        try {
            s.ddl_employee_name   = ""
            s.txtb_employee_id    = ""
            s.txtb_payroll_amount = ""
           
            h.post("../cRemitLedgerOthers/GetPayrollRegistry", {
                payroll_registry_nbr: s.voucher_list[id].payroll_registry_nbr
            }).then(function (d) {
                if (d.data.message == "success") {
                   
                    s.employee_list_PR      = d.data.payroll_reg_list
                    s.voucher               = s.voucher_list[id].voucher_nbr
                  
                   
                    var dateM               = new Date(s.voucher_list[id].payroll_month + "/1/2019");
                    s.txtb_registry_nbr     = s.voucher_list[id].payroll_registry_nbr
                    s.txtb_payroll_year     = s.voucher_list[id].payroll_year
                    s.txtb_payroll_month    = dateM.toLocaleString('en-us', { month: 'long' });
                    s.temp2                 = s.voucher_list[id].payroll_registry_nbr
                    
               }
              })
        }
        catch (err) {
            alert(err.message)
        }
    }
    //************************************//
    //***  Select Employee Dropdown   ****//
    //************************************// 
    s.Select_Employee = function (id)
    {
        try {
            var dt   = s.employee_list_PR[id]
            var data = ""

            if (s.employee_list_PR[id].network_ln != 0) { data = s.employee_list_PR[id].network_ln }

            else if (s.employee_list_PR[id].nico_ln != 0) { data = s.employee_list_PR[id].nico_ln }

            else if (s.employee_list_PR[id].nhmfc_hsing != 0) { data = s.employee_list_PR[id].nhmfc_hsing }

            else if (s.employee_list_PR[id].philamlife_ps != 0) { data = s.employee_list_PR[id].philamlife_ps }

            else if (s.employee_list_PR[id].ccmpc_ln != 0) { data = s.employee_list_PR[id].ccmpc_ln }

            s.txtb_employee_id = dt.empl_id
            s.txtb_payroll_amount = data.toFixed(2)
            s.txtb_uploaded_amount = "0.00"
           
            //s.txtb_status = dt.remittance
            s.temp = dt

            s.withComma = AddCommas(s.txtb_payroll_amount)
            s.txtb_payroll_amount = s.withComma
            s.amount = data.toFixed(2)
        }
        catch (err) {
            alert(err.message)
        }
    }

    s.Select_Status = function (id) {
        try {
            s.status = $("#ddl_status option:selected").val().toString()
           
        }
        catch (err) {
            alert(err.message)
        }
    }


    //************************************//
    //***       Open View Modal       ****//
    //************************************// 
    s.btn_edit_action = function (row_id, type) {
        try {
            s.row_id     = row_id
            var data = []
            var getIndividualData = []
            s.isEdit     = true
            s.ModalTitle = "Edit Existing Record"
            if (type == 1) {
                data = s.datalistgrid1[row_id]
               
            }
            else {
                data = s.datalistgrid2[row_id]
                
            }

            h.post("../cRemitLedgerOthers/GetIndividualDataLedgerInfo", {
                p_remit_nbr         : s.txtb_control_nbr,
                p_department_code   : s.ddl_departments,
                p_empl_id           : data.empl_id,
                p_voucher_nbr       : data.voucher_nbr
            }).then(function (d) {
                if (d.data.message == "success") {
                    
                    getIndividualData = d.data.getIndividualData
                   
                    var dateM = new Date(getIndividualData[0].payroll_month + "/1/2019");

                    s.txtb_voucher_nbr = getIndividualData[0].voucher_nbr + ' - ' + getIndividualData[0].payroll_registry_descr
                    s.voucherTemp = getIndividualData[0].voucher_nbr
                    s.txtb_registry_nbr = getIndividualData[0].payroll_registry_nbr
                    s.txtb_payroll_year = getIndividualData[0].payroll_year

                    s.txtb_payroll_month = dateM.toLocaleString('en-us', { month: 'long' });

                    s.txtb_employee_name = getIndividualData[0].employee_name
                    s.txtb_employee_id = getIndividualData[0].empl_id

                    s.withComma = AddCommas(parseFloat(getIndividualData[0].payroll_amount).toFixed(2))
                    s.txtb_payroll_amount = s.withComma

                    s.withComma1 = AddCommas(parseFloat(getIndividualData[0].uploaded_amount).toFixed(2))
                    s.txtb_uploaded_amount = s.withComma1

                    s.ddl_status = getIndividualData[0].remittance_status_dtl
                    $('#edit').attr('ngx-data', row_id);
                    s.statusTemp = data.remittance_status_dtl
                    if (data.remittance_status_dtl != getIndividualData[0].remittance_status_dtl) {
                        swal("Data changed by other user/s!", { icon: "warning", });
                    }
                    else {
                        $("#main_modal").modal("show");
                    }
                    if (type == 1) {
                        var row_edited = $('#edit').attr("ngx-data");
                        s.datalistgrid1[row_edited].remittance_status_dtl = s.ddl_status;
                        s.aTable.fnClearTable();
                        s.aTable.fnAddData(s.datalistgrid1);
                    }
                    else {
                        var row_edited = $('#edit').attr("ngx-data");
                        s.datalistgrid2[row_edited].remittance_status_dtl = s.ddl_status;
                        s.bTable.fnClearTable();
                        s.bTable.fnAddData(s.datalistgrid2);
                    }
                    if (getIndividualData[0].remittance_status_dtl == "R") {
                        s.showNR = false;
                        s.showR = true;
                        s.disDDLDtatus = true;
                        s.disEdit = true;
                    }
                    else{
                        s.showNR = true;
                        s.showR = false;
                        s.disDDLDtatus = false;
                        s.disEdit = false;
                    }
                }
                else {
                    alert(d.data.message)
                }
            })

            //-------- For NICO and CCMPC show upload/billed amount ------------//
            //if (type == 1) {
                //data = s.datalistgrid1[row_id]
             
                //var dateM = new Date(s.datalistgrid1[row_id].payroll_month + "/1/2019");

                //s.txtb_voucher_nbr      = data.voucher_nbr + " - " + data.payroll_registry_descr
                //s.voucherTemp           = data.voucher_nbr
                //s.txtb_employee_name    = data.employee_name
                //s.txtb_employee_id      = data.empl_id
                //s.txtb_payroll_amount   = parseFloat(data.payroll_amount).toFixed(2)
                //s.withComma             = AddCommas(s.txtb_payroll_amount)
                //s.txtb_payroll_amount   = s.withComma
                //s.txtb_uploaded_amount  = parseFloat(data.uploaded_amount).toFixed(2)
                //s.txtb_registry_nbr     = data.payroll_registry_nbr
                //s.txtb_payroll_year     = data.remittance_year
                //s.txtb_payroll_month    = dateM.toLocaleString('en-us', { month: 'long' });
                //s.ddl_status            = data.remittance_status_dtl
                //$('#edit').attr('ngx-data', row_id);
                //$('#txtb_voucher_nbr').attr("ngx-data", data.voucher_nbr);
              
            //}
            //else {
                //data = s.datalistgrid2[row_id]
               
                //var dateM = new Date(s.datalistgrid2[row_id].payroll_month + "/1/2019");
               

                //s.txtb_voucher_nbr      = data.voucher_nbr + " - " + data.payroll_registry_descr
                //s.voucherTemp           = data.voucher_nbr
                //s.txtb_employee_name    = data.employee_name
                //s.txtb_employee_id      = data.empl_id
                //s.txtb_payroll_amount   = parseFloat(data.payroll_amount).toFixed(2)
                //s.withComma             = AddCommas(s.txtb_payroll_amount)
                //s.txtb_payroll_amount   = s.withComma
                //s.txtb_registry_nbr     = data.payroll_registry_nbr
                //s.txtb_payroll_year     = data.remittance_year
                //s.txtb_payroll_month    = dateM.toLocaleString('en-us', { month: 'long' });
                //s.ddl_status            = data.remittance_status_dtl
                //$('#edit').attr('ngx-data', row_id);
               
            //}
            
        }
        catch (err) {
            alert(err.message);
        }
    }

    //************************************//
    //*** Add Record in Others Table ****//
    //************************************// 
    s.SaveOthersDetails = function () {
        try {
            if (ValidateFields()) {
                btn = document.getElementById('addFinal');
                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
                
                //-------- For NICO and CCMPC show upload/billed amount ------------//
                if (s.prevValues[5] == '10' || s.prevValues[5] == '11') {
                    dt_name = "datalistgrid1"
                    tname = "aTable"
                    var data = {
                        remittance_ctrl_nbr: s.txtb_control_nbr.trim()
                        , empl_id: s.txtb_employee_id.trim()
                        , voucher_nbr: s.voucher
                        , payroll_amount: s.amount
                        , uploaded_amount: "0"
                        , remittance_status: s.ddl_status
                    }
                }
                else {
                    dt_name = "datalistgrid2"
                    tname = "bTable"
                    var data = {
                        remittance_ctrl_nbr: s.txtb_control_nbr.trim()
                        , empl_id: s.txtb_employee_id.trim()
                        , voucher_nbr: s.voucher
                        , payroll_amount: s.amount
                        , uploaded_amount: "0"
                        , remittance_status: s.ddl_status
                    }
                }
               
                h.post("../cRemitLedgerOthers/SaveOthersDetails", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        //-------- For NICO and CCMPC show upload/billed amount ------------//
                        if (s.prevValues[5] == '10' || s.prevValues[5] == '11') {
                            
                            data.employee_name          = $("#ddl_employee_name option:selected").html()
                            data.remittance_year        = s.temp.payroll_year
                            data.remittance_month       = s.temp.payroll_month
                            data.payroll_registry_nbr   = s.temp2
                            data.remittance_status_dtl  = s.ddl_status
                            data.payroll_month = s.temp.payroll_month
                            //data.payroll_registry_descr = $('#ddl_voucher_nbr option:selected').html();
                            //alert($("#ddl_voucher_nbr option:selected").attr("ngx-data"));
                            data.payroll_registry_descr = $("#ddl_voucher_nbr option:selected").attr("ngx-data");
                            s[dt_name].push(data)
                            s[dt_name].refreshTable(tname)

                            for (var x = 1; x <= $('#datalist_grid1').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_employee_id) == false) {
                                    s.aTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        else {
                            data.employee_name          = $("#ddl_employee_name option:selected").html()
                            data.remittance_year        = s.temp.payroll_year
                            data.remittance_month       = s.temp.payroll_month
                            data.payroll_registry_nbr   = s.temp2
                            data.remittance_status_dtl  = s.ddl_status
                            data.payroll_month          = s.temp.payroll_month
                            //data.payroll_registry_descr = $('#ddl_voucher_nbr option:selected').html();
                            //alert($("#ddl_voucher_nbr option:selected").attr("ngx-data"));
                            data.payroll_registry_descr = $("#ddl_voucher_nbr option:selected").attr("ngx-data");
                            s[dt_name].push(data)
                            s[dt_name].refreshTable(tname)

                            for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_employee_id) == false) {
                                    s.bTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        $('#main_modal').modal("hide")
                        swal("Your record has been saved!", { icon: "success", });
                       
                        btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                    }
                    else {
                      
                    }
                })
            }
        }
        catch (err) {
            alert(err.message)
        }
    }
    function AddCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
    //***********************************************************//
    //***Field validation 
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#ddl_voucher_nbr').val() == "") {
            ValidationResultColor("ddl_voucher_nbr", true);
            return_val = false;
        }
        
        if ($('#ddl_employee_name option:selected').val() == "") {
            ValidationResultColor("ddl_employee_name", true);
            return_val = false;
        }

        //if ($('#ddl_status option:selected').val() == "") {
        //    ValidationResultColor("ddl_status", true);
        //    return_val = false;
        //}
        
        return return_val;
    }

    //***********************************************************//
    //***Field validation 
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_voucher_nbr").removeClass("required");
            $("#lbl_ddl_voucher_nbr_req").text("");

            $("#ddl_employee_name").removeClass("required");
            $("#lbl_ddl_employee_name_req").text("");

            //$("#ddl_status").removeClass("required");
            //$("#lbl_ddl_status_req").text("");
        }
    }
    //************************************//
    //*** Highlight newly added row ****//
    //************************************// 
    function get_page(empl_id) {
        try {
            var nakit_an = false;
            var rowx = 0;
            if (s.prevValues[5] == '10' || s.prevValues[5] == '11') {
                $('#datalist_grid1 tr').each(function () {
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
            else {
                $('#datalist_grid2 tr').each(function () {
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
        }
        catch (err) {
            alert(err.message)
        }
    }
    s.SaveEditOthersDetails = function () {
        btn = document.getElementById('edit');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';      
        var data = {
            remittance_ctrl_nbr : s.txtb_control_nbr.trim()
            , empl_id: s.txtb_employee_id.trim()
            , voucher_nbr: s.voucherTemp.trim()
            , remittance_status : s.ddl_status
        }
       

        //s.row_id = row_id
        //var data = []
        var getIndividualData = []
        //s.isEdit = true
        //s.ModalTitle = "View Record"
       

        h.post("../cRemitLedgerOthers/GetIndividualDataLedgerInfo", {
            p_remit_nbr: s.txtb_control_nbr,
            p_department_code: s.ddl_departments,
            p_empl_id: s.txtb_employee_id,
            p_voucher_nbr: s.voucherTemp
        }).then(function (d) {
            if (d.data.message == "success") {

                getIndividualData = d.data.getIndividualData
                
                if (s.statusTemp == s.ddl_status) {
                    swal("Your record has been edited!", { icon: "success", });
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                    $('#main_modal').modal("hide")
                }
                else {
                    if (s.ddl_status == getIndividualData[0].remittance_status_dtl) {
                        swal("Unable to save changes, Data has been updated by other user/s!", { icon: "warning", });
                        btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                        if (s.prevValues[5] == '10' || s.prevValues[5] == '11') {
                            var row_edited = $('#edit').attr("ngx-data");
                            s.datalistgrid1[row_edited].remittance_status_dtl = s.ddl_status;
                           

                            s.aTable.fnClearTable();
                            s.aTable.fnAddData(s.datalistgrid1);

                            for (var x = 1; x <= $('#datalist_grid1').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_employee_id) == false) {
                                    s.aTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        else {
                            var row_edited = $('#edit').attr("ngx-data");
                            s.datalistgrid2[row_edited].remittance_status_dtl = s.ddl_status;
                           

                            s.bTable.fnClearTable();
                            s.bTable.fnAddData(s.datalistgrid2);

                            for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_employee_id) == false) {
                                    s.bTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        $('#main_modal').modal("hide")
                        btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                    }
                    else {
                        h.post("../cRemitLedgerOthers/SaveEditOthersDetails", { data: data }).then(function (d) {
                            if (d.data.message == "success") {
                                if (s.prevValues[5] == '10' || s.prevValues[5] == '11') {
                                    var row_edited = $('#edit').attr("ngx-data");
                                    s.datalistgrid1[row_edited].remittance_status_dtl = s.ddl_status;
                                   

                                    s.aTable.fnClearTable();
                                    s.aTable.fnAddData(s.datalistgrid1);


                                    for (var x = 1; x <= $('#datalist_grid1').DataTable().page.info().pages; x++) {
                                        if (get_page(s.txtb_employee_id) == false) {
                                            s.aTable.fnPageChange(x);
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                else {
                                    var row_edited = $('#edit').attr("ngx-data");
                                    s.datalistgrid2[row_edited].remittance_status_dtl = s.ddl_status;
                                    

                                    s.bTable.fnClearTable();
                                    s.bTable.fnAddData(s.datalistgrid2);

                                    for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++) {
                                        if (get_page(s.txtb_employee_id) == false) {
                                            s.bTable.fnPageChange(x);
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }

                                swal("Your record has been edited!", { icon: "success", });
                                $('#main_modal').modal("hide")
                                btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                            }
                            else {
                              
                            }
                        })
                    }
                }
            }
            else {
                alert(d.data.message)
            }
        })


    }

    //************************************//
    //***Delete Record in Others Table****//
    //************************************// 
    s.btn_del_row = function (row_id, t)
    {
        try {
            s.row_id = row_id
            var data = []
            var getIndividualData = []
            var dt_name = ""
            var tname = ""
            var dt = []
            if (t == 1) {
                dt_name = "datalistgrid1"
                tname = "aTable"
                dt = s.datalistgrid1[row_id]
            }
            else {
                dt_name = "datalistgrid2"
                tname = "bTable"
                dt = s.datalistgrid2[row_id]
            }
            if (t == 1) {
                data = s.datalistgrid1[row_id]
               
            }
            else {
                data = s.datalistgrid2[row_id]
              
            }
            h.post("../cRemitLedgerOthers/GetIndividualDataLedgerInfo", {
                p_remit_nbr: s.txtb_control_nbr,
                p_department_code: s.ddl_departments,
                p_empl_id: data.empl_id,
                p_voucher_nbr: data.voucher_nbr
            }).then(function (d) {
                if (d.data.message == "success") {

                    getIndividualData = d.data.getIndividualData
                   
                    if (getIndividualData.length != 0) {
                        swal({
                            title: "Are you sure to delete this record?",
                            text: "Once deleted, you will not be able to recover this record!",
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,
                        })
                            .then(function (willDelete) {
                                if (willDelete) {
                                    h.post("../cRemitLedgerOthers/DeleteOthersDetail", {
                                        data: dt
                                    }).then(function (d) {
                                        if (d.data.message == "success") {

                                            s[dt_name] = s[dt_name].delete(row_id)
                                            s[dt_name].refreshTable(tname)
                                            swal("Your record has been deleted!", { icon: "success", });
                                        }
                                        else {
                                            swal("Data already deleted by other user/s!", { icon: "warning", });
                                            s[dt_name] = s[dt_name].delete(row_id)
                                            s[dt_name].refreshTable(tname)
                                        }
                                    })
                                }
                            });
                        
                    }
                    else {
                        swal("Data already deleted by other user/s!", { icon: "warning", });
                        s[dt_name] = s[dt_name].delete(row_id)
                        s[dt_name].refreshTable(tname)
                    }
                }
                else {
                    alert(d.data.message)
                }
            })
        }
        catch (err) {
            alert(err.message)
        }
    }

    s.search_in_list = function (value, table) {
        try {
            $("#" + table).DataTable().search(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }

    s.lbl_payroll_month = "Payroll Month"
    s.search_in_list_month = function (value, table) {
        s.lbl_payroll_month = value
        if (value == "") {
            s.lbl_payroll_month = "Payroll Month"
        }

        if (s.check_table == "datalist_grid1") {
            $("#" + table).DataTable().column(6).search(value).draw();
            $("#rejected_grid").DataTable().column(6).search(value).draw();
        }
        else {
            $("#" + s.check_table).DataTable().column(5).search(value).draw();
            $("#rejected_grid").DataTable().column(5).search(value).draw();
        }
       
    }


    s.search_in_list_letter = function (value, table) {
      
        if (s.check_table == "datalist_grid1") {
            $("#" + s.check_table).DataTable().column(8).search(value).draw();
            $("#rejected_grid").DataTable().column(8).search(value).draw();
        }
        else {
            $("#" + s.check_table).DataTable().column(7).search(value).draw();
            $("#rejected_grid").DataTable().column(7).search(value).draw();
        }
      


    }

    s.setNumOfRow = function (value, table) {
        try {
            $("#" + table).DataTable().page.len(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }

    ////************************************//
    ////***      Open Print Modal       ****//
    ////************************************// 
    //s.btn_open_print_modal = function () {
    //    try {
    //        btn = document.getElementById('print');
    //        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> PRINT';
    //        setTimeout(function () {
    //            btn.innerHTML = '<i class="fa fa-print"> </i> PRINT';
    //            s.ModalTitle = s.prevValues[6] + " Print Option"
    //            $('#print_modal').modal("show");
    //        }, 300);
    //    }
    //    catch (err) {
    //        alert(err.message)
    //    }
    //}

    ////*************************************//
    ////***Print Other Remittances Report****//
    ////************************************//
    //s.printFinal = function () {
    //    try {
    //        $("#print_modal").modal("hide")

    //        s.print_option = $("#ddl_print option:selected").html().toString()
    //        

    //        if (s.print_option == "Employee") {
    //           

    //            var remittance = s.txtb_control_nbr.trim().toString()
    //            var ReportPath = ""

    //            if (s.prevValues[5] == '09') {
    //                ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittanceNETWORKBANK.rpt"
    //            }
    //            else if (s.prevValues[5] == '10') {
    //                ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittanceNICO.rpt"
    //            }
    //            else if (s.prevValues[5] == '11') {
    //                ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittanceCCMPC.rpt"
    //            }
    //            else if (s.prevValues[5] == '12') {
    //                ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittancePHILAMLIFE.rpt"
    //            }
    //            else if (s.prevValues[5] == '13') {
    //                ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittanceNHMFC.rpt"
    //            }

    //            var controller = "Reports"
    //            var action = "Index"
    //            var ReportName = "CrystalReport1"
    //            var SaveName = "Crystal_Report"
    //            var ReportType = "inline"
    //            var sp = "sp_remittance_OTHERS_rep,p_remittance_ctrl_nbr," + remittance

    //            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
    //                + "&SaveName=" + SaveName
    //                + "&ReportType=" + ReportType
    //                + "&ReportPath=" + ReportPath
    //                + "&Sp=" + sp
    //        }
    //        else if (s.print_option == "Office") {
    //           

    //            var remittance = s.txtb_control_nbr.trim().toString()
    //            var ReportPath = "~/Reports/cryRemittanceOTHERS1/cryRemittance_Smry.rpt"
    //            var controller = "Reports"
    //            var action = "Index"
    //            var ReportName = "CrystalReport1"
    //            var SaveName = "Crystal_Report"
    //            var ReportType = "inline"
    //            var sp = "sp_remittance_OTHERS_smry_rep,p_remittance_ctrl_nbr," + remittance

    //            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
    //                + "&SaveName=" + SaveName
    //                + "&ReportType=" + ReportType
    //                + "&ReportPath=" + ReportPath
    //                + "&Sp=" + sp
    //        }
    //    }
    //    catch (err) {
    //        alert(err.message)
    //    }
    //}
    Array.prototype.refreshTable = function (table)
    {
        if (this.length == 0)
        {
            s[table].fnClearTable();
        }
        else
        {
            s[table].fnClearTable();
            s[table].fnAddData(this);
        }
    }

    Array.prototype.select = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] == code
        })
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentry() {
        s.txtb_voucher_nbr      = ""
        s.ddl_voucher_nbr       = ""
        s.txtb_employee_name    = ""
        s.ddl_employee_name     = ""
        s.txtb_employee_id      = ""
        s.txtb_payroll_amount   = ""
        s.txtb_uploaded_amount  = ""
        s.txtb_registry_nbr     = ""
        s.txtb_payroll_year     = ""
        s.txtb_payroll_month    = ""
        s.txtb_status           = ""
        s.ddl_status            = ""
        
        s.employee_list_PR      = []
        if (s.prevValues[5] == '10' || s.prevValues[5] == '11')
        {
            s.txtb_uploaded_amount = ""
        }

        $("#ddl_voucher_nbr").removeClass("required");
        $("#lbl_ddl_voucher_nbr_req").text("");

        $("#ddl_employee_name").removeClass("required");
        $("#lbl_ddl_employee_name_req").text("");
    }

    //********************************************************************/
    //*** VJA : 2021-07-21 - This Function is for Grand Total Viewing****//
    //********************************************************************/
    s.btn_view_grand_total = function ()
    {
        h.post("../cRemitLedgerOthers/RetrieveGrandTotal",
            {
                par_remittance_ctrl_nbr: s.txtb_control_nbr.trim()
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
                    s.txtb_year                 = $('#txtb_year').val();
                    s.txtb_month                = $('#txtb_month').val();
                    
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

    s.btn_print = function () {

        s.ddl_reports = "";
        if (s.remittance_type == "09") {
            s.ddl_reports =  "cryRemittanceNETWORKBANK.rpt"
        }

        if (s.remittance_type == "10") {
            s.ddl_reports = "cryRemittanceNICO.rpt"
        }

        if (s.remittance_type == "11") {
            s.ddl_reports = "cryRemittanceCCMPC.rpt"
        }

        if (s.remittance_type == "12") {
            s.ddl_reports = "cryRemittancePHILAMLIFE.rpt"
        }
        if (s.remittance_type == "13") {
            s.ddl_reports = "cryRemittanceNHMFC.rpt"
        }


        sp = "sp_remittance_OTHERS_rep,p_remittance_ctrl_nbr," + s.txtb_control_nbr.trim();
        ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";

        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************


        s.loading_r = true;
        s.Modal_title = "PRINT PREVIEW";
        $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });


        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + s.ddl_reports.split('.')[0]
            + "&SaveName=" + "Crystal_Report"
            + "&ReportType=" + "inline"
            + "&ReportPath=" + ReportPath
            + "&id=" + sp //+ parameters

        

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
                $("#modal_generating_remittance").modal("hide")
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

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
      

    }

    s.btn_print_recon = function () {

        s.ddl_reports = "";
        if (s.remittance_type == "09") {
            s.ddl_reports = "cryRemittanceNETWORKBANK.rpt"
        }

        if (s.remittance_type == "10") {
            s.ddl_reports = "cryRemittanceNICO.rpt"
        }

        if (s.remittance_type == "11") {
            s.ddl_reports = "cryRemittanceCCMPC.rpt"
        }

        if (s.remittance_type == "12") {
            s.ddl_reports = "cryRemittancePHILAMLIFE.rpt"
        }

        if (s.remittance_type == "13") {
            s.ddl_reports = "cryRemittanceNHMFC.rpt"
        }
        
        


        sp = "sp_remittance_OTHERS_recon_rep,p_remittance_ctrl_nbr," + s.txtb_control_nbr.trim();
        ReportPath = "~/Reports/cryRemittanceOTHERS1/OtherRecon/" + s.ddl_reports + "";

        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************


        s.loading_r = true;
        s.Modal_title = "PRINT PREVIEW";
        $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });


        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + s.ddl_reports.split('.')[0]
            + "&SaveName=" + "Crystal_Report"
            + "&ReportType=" + "inline"
            + "&ReportPath=" + ReportPath
            + "&id=" + sp //+ parameters



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
                $("#modal_generating_remittance").modal("hide")
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

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });


    }
});