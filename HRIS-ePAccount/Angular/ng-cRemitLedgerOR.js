ng_HRD_App.controller("cRemitLedger_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    s.reports = null;
    var userid = "";
    var index_update = "";
    s.allow_edit = true

    s.oTable = null;
    s.datalistgrid = null;
    s.rowLen = "5";
    s.ddl_reports = "";
    s.datalistArray = []

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "remittance_ctrl_nbr",
                        "mRender": function (data, type, full, row)
                        { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    { "mData": "remittance_descr" },
                    {
                        "mData": "remittancetype_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block  text-right'>" + data + "</span>" }
                    },
                    {
                        "mData": "remittance_status_descr",
                        "mRender": function (data, type, full, row) { return data.toString().trim() == "NOT REMITTED" ? "<span class='badge badge-danger'><i class='fa fa-times'></i> " + data + "</span>" : data.toString().trim() == "REMITTED" ? "<span class='badge badge-success text-center'> <i class='fa fa-check'></i>" + data + "</span>" : "<span class='badge badge-warning text-center'> <i class='fa fa-edit'></i>" + data + "</span>" }
                    },
                    {
                        "mData": "total_ps",
                        "mRender": function (data, type, full, row)
                        { return "<span class='text-right btn-block'>" + currency(data) + "</span>"}
                    },
                    {
                        "mData": "total_gs",
                        "mRender": function (data, type, full, row) {
                            var retdata = currency(data)
                            return "<span class='text-right btn-block text-right'>" + retdata + "</span>"
                        }
                    },

                    
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var printable = "";
                            if (full["remittancetype_code"] == "08" ||
                                full["remittancetype_code"] == "09" ||
                                full["remittancetype_code"] == "10" ||
                                full["remittancetype_code"] == "11" ||
                                full["remittancetype_code"] == "12" ||
                                full["remittancetype_code"] == "13") {
                                printable = false;
                            }
                            else {
                                printable = true;
                            }

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                               
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

    function init() {
        var browserHeight = window.innerHeight
        s.isEdit = false
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cRemitLedgerOR/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
           
            s.employeeddl = d.data.empType
            s.payrolltemplate = d.data.payroll_template
            userid = d.data.userid
            s.remittancetype = d.data.sp_remittance

            s.ddl_year = d.data.prevValues[0] // par_remittance_year
            s.ddl_month = d.data.prevValues[1] // par_remittance_month
           
            s.ddl_employment_type = d.data.prevValues[3] // par_employment_type
           
            s.ddl_payrolltemplate = d.data.prevValues[5] // par_remittancetype_code
           
            s.rowLen = d.data.prevValues[10] // par_show_entries
          
            s.search_box = d.data.prevValues[12] // par_search

            init_table_data([]);

            if (d.data.sp_sp_remittance_hdr_tbl_list.length > 0) {
                s.datalistgrid = d.data.sp_sp_remittance_hdr_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_sp_remittance_hdr_tbl_list)
            }
            else {
                s.oTable.fnClearTable();
            }

          

            if ($("#ddl_reports").val() == "" || $("#ddl_remittancetype").val() == "") {
                s.ShowSelected = false
            }
            else {
                s.ShowSelected = true
            }

            $("#loading_data").modal("hide");

            RetrieveYear();
            s.rowLen = "5"
          
            if (d.data.prevValues[1] == null) {
                s.ddl_year = new Date().getFullYear().toString()
                s.currentMonth = new Date().getMonth() + 1
                s.ddl_month = s.currentMonth.toString()
            }
            else {
                s.ddl_year = d.data.prevValues[0]
                s.ddl_month = d.data.prevValues[1]
            }
        });


    }
    init()

   



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
        h.post("../cRemitLedgerOR/RetrieveListGrid",
            {
                par_year: par_year
                , par_month: par_month
                , par_empType: par_empType
                , par_remittancetype: par_remittancetype

            }).then(function (d) {
              
                if (d.data.sp_sp_remittance_hdr_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_sp_remittance_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_sp_remittance_hdr_tbl_list)
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
        h.post("../cRemitLedgerOR/RetrieveListGrid",
            {
                par_year: par_year
                , par_month: par_month
                , par_empType: par_empType
                , par_remittancetype: par_remittancetype

            }).then(function (d) {
            
                if (d.data.sp_sp_remittance_hdr_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_sp_remittance_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_sp_remittance_hdr_tbl_list)
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
    s.SelectEmploymentType = function (empType) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cRemitLedgerOR/RetrieveListGrid",
            {
                par_year: s.ddl_year
                , par_month: s.ddl_month
                , par_empType: empType

            }).then(function (d) {
                
                if (d.data.sp_sp_remittance_hdr_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_sp_remittance_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_sp_remittance_hdr_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }
                $("#loading_data").modal("hide");
            })

        h.post("../cRemitLedger/SelectEmploymentType", { par_empType: empType }).then(function (d) {
            s.remittancetype = d.data.sp_remittance
        })
    }
    //************************************//
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectTemplateType = function () {


        h.post("../cRemitLedger/GettheLastRowOfTheTable", { par_remittancetype_code: s.ddl_remittancetype }).then(function (d) {
            s.txtb_remittance_ctrl_no = d.data
        })
    };
    //*************************************//
    //***********Open-Add-Modal************//
    //*************************************// 
    s.btn_add = function () {
        clearentry()
        btn = document.getElementById('add');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
        s.isEdit = false
        s.ishow = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#ddl_employment_type").val() == "") {
            $("#ddl_employment_type").addClass('require-field')
            s.lbl_requiredfield6 = "required field!"
            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
        }
        else {
            setTimeout(function () {
                btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';

                s.txtb_year = $('#ddl_year option:selected').text();
                s.txtb_month = $('#ddl_month option:selected').text();

                s.ishow = true
                s.isupdate = false
                s.ModalTitle = "Add New Record"
                //s.disabled_ddl_remittancetype = true

                $('#main_modal').modal({ keyboard: false, backdrop: "static" });
            }, 300);
        }


    }

    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function clearentry() {

        s.txtb_remittance_ctrl_no = "";
        s.txtb_remittancetype = "";
        s.ddl_remittancetype = "";
        s.txtb_year = "";
        s.txtb_month = "";
        s.ddl_reports = "";
        s.txtb_description = "";
        FieldValidationColorChanged(false, "ALL");
    }
    //***************************bt*********//
    //***Save-Job-Description-Function****//
    //************************************// 
    s.btn_save_add = function () {

        if (isdataValidated()) {

        }
        else {
            if ($("#txtb_description").val() != "" && $("#ddl_remittancetype").val() != "") {
                btn = document.getElementById('addFinal');
                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save Only';
                var data =
                {
                    remittance_ctrl_nbr: s.txtb_remittance_ctrl_no,
                    remittance_year: s.ddl_year,
                    remittance_month: s.ddl_month,
                    employment_type: s.ddl_employment_type,
                    remittancetype_code: s.ddl_remittancetype,
                    remittance_descr: s.txtb_description,
                    remittance_status: "N",
                    remittance_dttm_created: s.hidden_remittance_dttm_created,
                    user_id_created_by: "",
                    remittance_dttm_updated: s.hidden_remittance_dttm_updated,
                    user_id_updated_by: "",
                    remittance_dttm_released: s.hidden_remittance_dttm_released,
                    user_id_released_by: "",
                    remittance_dttm_remitted: s.hidden_remittance_dttm_remitted,
                    user_id_remitted_by: "",

                    remittancetype_descr: $('#ddl_remittancetype option:selected').html(),
                    remittance_status_descr: "NOT REMITTED",

                }
               
                h.post("../cRemitLedger/SaveFromDatabase",
                    {
                        par_remittance_ctrl_nbr: s.txtb_remittance_ctrl_no,
                        par_remittance_year: s.ddl_year,
                        par_remittance_month: s.ddl_month,
                        par_employment_type: s.ddl_employment_type,
                        par_remittancetype_code: s.ddl_remittancetype,
                        par_remittance_descr: s.txtb_description,
                        par_remittance_status: "N",
                        par_remittance_dttm_created: s.hidden_remittance_dttm_created,
                        par_user_id_created_by: "",
                        par_remittance_dttm_updated: s.hidden_remittance_dttm_updated,
                        par_user_id_updated_by: "",
                        par_remittance_dttm_released: s.hidden_remittance_dttm_released,
                        par_user_id_released_by: "",
                        par_remittance_dttm_remitted: s.hidden_remittance_dttm_remitted,
                        par_user_id_remitted_by: "",

                    }).then(function (d) {
                        if (d.data.success == 1) {
                            s.datalistgrid.push(data);
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);

                            swal("Successfully Added !", "New record successfully added!", "success");
                            $("#main_modal").modal("hide");
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save Only';
                        }
                        else {
                            swal("Saving error!", "Data not save!", "error");
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save Only';
                        }
                    })
            }
        }

    }
    //**************************************//
    //***Update-Database-Function****//
    //**************************************//
    s.btn_save_update = function () {
        var row_id = $('#btn_save_update').attr('ngx-data');
        if (isdataValidated()) {

        }
        else {
            if ($("#txtb_description").val() != "") {
                h.post("../cRemitLedger/UpdateFromDatabase", {
                    //btn = document.getElementById('btn_save_update');
                    //btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save Edit';
                    par_remittance_ctrl_nbr: s.txtb_remittance_ctrl_no,
                    par_remittance_year: s.ddl_year,
                    par_remittance_month: s.ddl_month,
                    par_employment_type: s.ddl_employment_type,
                    par_remittancetype_code: s.ddl_remittancetype,
                    par_remittance_descr: s.txtb_description,
                    par_remittance_status: "N",
                    //par_remittance_dttm_created    : s.hidden_remittance_dttm_created, 
                    //par_user_id_created_by         : "", 
                    par_remittance_dttm_updated: s.hidden_remittance_dttm_updated,
                    par_user_id_updated_by: "",
                    par_remittance_dttm_released: s.hidden_remittance_dttm_released,
                    par_user_id_released_by: "",
                    par_remittance_dttm_remitted: s.hidden_remittance_dttm_remitted,
                    par_user_id_remitted_by: "",

                }).then(function (d) {
                    if (d.data.message == "success") {

                        swal("Successfully Updated!", "Existing record successfully updated!", "success")
                        $("#main_modal").modal("hide");
                        updateListGrid(row_id);
                        //btn.innerHTML = '<i class="fa fa-save"> </i> Save Only';
                    }
                    else {
                        swal("Saving error!", "Data not save!", "error");
                        //btn.innerHTML = '<i class="fa fa-save"> </i> Save Only';
                    }

                })
            }
        }

    }
    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function updateListGrid(row_id) {
        s.datalistgrid[row_id].remittance_ctrl_no = s.txtb_remittance_ctrl_no
        s.datalistgrid[row_id].remittancetype_code = s.ddl_remittancetype
        s.datalistgrid[row_id].remittance_year = s.ddl_year
        s.datalistgrid[row_id].remittance_month = s.ddl_month
        s.datalistgrid[row_id].employment_type = s.ddl_employment_type
        s.datalistgrid[row_id].remittance_descr = s.txtb_description
        s.datalistgrid[row_id].remittance_status = ""
        s.datalistgrid[row_id].remittance_dttm_created = s.hidden_remittance_dttm_created
        s.datalistgrid[row_id].user_id_created_by = ""
        s.datalistgrid[row_id].remittance_dttm_updated = s.hidden_remittance_dttm_updated
        s.datalistgrid[row_id].user_id_updated_by = ""
        s.datalistgrid[row_id].remittance_dttm_released = s.hidden_remittance_dttm_released
        s.datalistgrid[row_id].user_id_released_by = ""
        s.datalistgrid[row_id].remittance_dttm_remitted = s.hidden_remittance_dttm_remitted
        s.datalistgrid[row_id].user_id_remitted_by = ""

        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
    }
   
    

    //**************************************//
    //***Data Validated****//
    //**************************************//
    function isdataValidated() {
        FieldValidationColorChanged(false, "ALL");

        var validatedSaved = true
        if (s.ddl_remittancetype == "") {
            FieldValidationColorChanged(true, "ddl_remittancetype")
            validatedSaved = false;
        }
        if (s.txtb_description == "") {
            FieldValidationColorChanged(true, "txtb_description")
            validatedSaved = false;
        }
        if ($("#ddl_reports").val() == "") {
            FieldValidationColorChanged(true, "ddl_reports")
            validatedSaved = false;
        }
        return validatedSaved;

    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {

        var txtb_remittance_ctrl_no = angular.element(document.querySelector('#txtb_remittance_ctrl_no'));
        var txtb_description = angular.element(document.querySelector('#txtb_description'));
        var ddl_remittancetype = angular.element(document.querySelector('#ddl_remittancetype'));
        var ddl_reports = angular.element(document.querySelector('#ddl_reports'));
        if (pMode)
            switch (pObjectName) {
                case "ddl_remittancetype":
                    {
                        ddl_remittancetype.addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }
                case "txtb_description":
                    {
                        txtb_description.addClass('require-field')
                        s.lbl_requiredfield5 = "required field!"
                        break;
                    }
                case "ddl_reports":
                    {
                        ddl_reports.addClass('require-field')
                        s.lbl_requiredfield7 = "required field!"
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
                        ddl_remittancetype.removeClass('require-field')
                        txtb_remittance_ctrl_no.removeClass('require-field')
                        txtb_description.removeClass('require-field')
                        ddl_reports.removeClass('require-field')

                        $("#ddl_employment_type").removeClass('require-field')
                        $("#ddl_remittancetype").removeClass('require-field')
                        $("#ddl_reports").removeClass('require-field')
                        s.lbl_requiredfield6 = "";
                        s.lbl_requiredfield7 = "";
                        break;
                    }

            }
        }
    }
 
    function DisplayQuarterByMonth(par_month) {
        if (par_month == 1 || par_month == 2 || par_month == 3) {
            $('#txtb_rpt_quarter').attr("ngx-data", "1");
            $('#txtb_rpt_quarter').val("1st Quarter");
        }
        else if (par_month == 4 || par_month == 5 || par_month == 6) {
            $('#txtb_rpt_quarter').attr("ngx-data", "2");
            $('#txtb_rpt_quarter').val("2nd Quarter");
        }
        else if (par_month == 7 || par_month == 8 || par_month == 9) {
            $('#txtb_rpt_quarter').attr("ngx-data", "3");
            $('#txtb_rpt_quarter').val("3rd Quarter");
        }
        else if (par_month == 10 || par_month == 11 || par_month == 12) {
            $('#txtb_rpt_quarter').attr("ngx-data", "4");
            $('#txtb_rpt_quarter').val("4th Quarter");
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

    //*************************************//
    //***********Extract Data************//
    //*************************************// 
    s.ExtracData = function () {

        if (isdataValidated()) {

            var data =
            {

                remittance_ctrl_no: s.txtb_remittance_ctrl_no,
                remittancetype_code: s.ddl_remittancetype,
                remittance_year: s.ddl_year,
                remittance_month: s.ddl_month,
                employment_type: s.ddl_employment_type,
                remittance_descr: s.txtb_description,
                remittance_status: "",
                remittance_dttm_created: s.hidden_remittance_dttm_created,
                user_id_created_by: "",
                remittance_dttm_updated: s.hidden_remittance_dttm_updated,
                user_id_updated_by: "",
                remittance_dttm_released: s.hidden_remittance_dttm_released,
                user_id_released_by: "",
                remittance_dttm_remitted: s.hidden_remittance_dttm_remitted,
                user_id_remitted_by: "",
                remittance_period_coverd: "",
                remittance_status_descr: "",

            }

            h.post("../cRemitLedger/SaveFromDatabase",
                {

                    par_remittance_ctrl_no: s.txtb_remittance_ctrl_no,
                    par_remittancetype_code: s.ddl_remittancetype,
                    par_remittance_year: s.ddl_year,
                    par_remittance_month: s.ddl_month,
                    par_employment_type: s.ddl_employment_type,
                    par_remittance_descr: s.txtb_description,
                    par_remittance_status: "",
                    par_remittance_dttm_created: s.hidden_remittance_dttm_created,
                    par_user_id_created_by: "",
                    par_remittance_dttm_updated: s.hidden_remittance_dttm_updated,
                    par_user_id_updated_by: "",
                    par_remittance_dttm_released: s.hidden_remittance_dttm_released,
                    par_user_id_released_by: "",
                    par_remittance_dttm_remitted: s.hidden_remittance_dttm_remitted,
                    par_user_id_remitted_by: "",


                }).then(function (d) {
                    if (d.data.success == 1) {

                        h.post("../cRemitLedger/ExtracData",
                            {
                                par_remittance_year: s.ddl_year,
                                par_remittance_month: s.ddl_month,
                                par_employment_type: s.ddl_employment_type,
                                par_remittance_ctrl_no: s.txtb_remittance_ctrl_no,


                            }).then(function (d) {

                                s.datalistgrid.push(data);
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid);
                                swal("Successfully Saved and Extracted!", "data successfully added and extracted!", "success");
                                $("#main_modal").modal("hide");

                            })


                    }
                    else {
                        swal("Saving error!", "Data not save!", "error");
                    }
                })
        }

        s.ishow = true
        s.ModalTitle = "Add New Record"
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    s.btn_show_details_action = function (lst) {
       
        h.post("../cRemitLedgerOR/PreviousValuesonPage_cRemitLedger",
            {
                par_remittance_year: $('#ddl_year option:selected').text(),
                par_remittance_month: $('#ddl_month option:selected').val(),
                par_remittance_month_descr: $('#ddl_month option:selected').text(),
                par_employment_type: $('#ddl_employment_type option:selected').val(),
                par_employment_type_descr: $('#ddl_employment_type option:selected').text(),
                par_remittancetype_code: s.datalistgrid[lst].remittancetype_code,
                par_remittancetype_code_descr: s.datalistgrid[lst].remittancetype_descr,
                par_remittance_ctrl_nbr: s.datalistgrid[lst].remittance_ctrl_nbr,
                par_remittance_status: s.datalistgrid[lst].remittance_status,
                par_remittance_status_descr: s.datalistgrid[lst].remittance_status_descr,
                par_show_entries: s.rowLen,
                par_page_nbr: $('#datalist_grid').DataTable().page.info().page,
                par_search: s.search_box,


            }).then(function (d) {
               
                var url = "";
              
                switch (s.datalistgrid[lst].remittancetype_code) {
                    case "01":
                        url = "/cRemitLedgerORDetail?id=01&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "02":
                        url = "/cRemitLedgerORDetail?id=02&eType=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "03":
                        url = "/cRemitLedgerORDetail?id=03&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "04":
                        url = "/cRemitLedgerORDetail?id=04&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "05":
                        url = "/cRemitLedgerORDetail?id=05&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "06":
                        url = "/cRemitLedgerORDetail?id=06&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "07":
                        url = "/cRemitLedgerORDetail?id=07&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "08":
                        url = "/cRemitLedgerORDetail?id=08&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "09":
                        url = "/cRemitLedgerORDetail?id=09&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "10":
                        url = "/cRemitLedgerORDetail?id=10&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "11":
                        url = "/cRemitLedgerORDetail?id=11&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "12":
                        url = "/cRemitLedgerORDetail?id=12&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "13":
                        url = "/cRemitLedgerORDetail?id=13&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "16":
                        url = "/cRemitLedgerORDetail?id=16&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;

                }
                if (url != "") {
                    window.location.href = url;
                }
            })

    }
    //***************************Functions end*********************************************************//

})

