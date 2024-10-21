ng_HRD_App.controller("cRemitLedger_ctrlr", function ($scope, $compile, $http, $filter) {
    var s               = $scope
    var h               = $http
    s.year              = []
    s.reports           = null;
    var userid          = "";
    var index_update    = "";
    s.allow_edit        = true

    s.oTable            = null;
    s.datalistgrid      = null;
    s.rowLen            = "5";
    s.ddl_reports = "";
    s.datalistArray = []

    function init()
    {
        var browserHeight = window.innerHeight
        s.isEdit = false
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cRemitLedger/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            s.employeeddl       = d.data.empType
            s.payrolltemplate   = d.data.payroll_template
            userid              = d.data.userid
            s.remittancetype    = d.data.sp_remittance

            s.ddl_year = d.data.prevValues[0] // par_remittance_year
            s.ddl_month = d.data.prevValues[1] // par_remittance_month
            //s. = d.data.prevValues[2].toString().trim() // par_remittance_month_descr
            s.ddl_employment_type = d.data.prevValues[3] // par_employment_type
            //s. = d.data.prevValues[4].toString().trim() // par_employment_type_descr
            s.ddl_payrolltemplate = d.data.prevValues[5] // par_remittancetype_code
            //s. = d.data.prevValues[6].toString().trim() // par_remittancetype_code_descr
            //s. = d.data.prevValues[7].toString().trim() // par_remittance_ctrl_nbr
            //s. = d.data.prevValues[8].toString().trim() // par_remittance_status
            //s. = d.data.prevValues[9].toString().trim() // par_remittance_status_descr
            s.rowLen = d.data.prevValues[10] // par_show_entries
            //s. = d.data.prevValues[11].toString().trim() // par_page_nbr
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
            s.rowLen = "5"

            if (d.data.prevValues[1] == null || typeof d.data.prevValues[1] == 'undefined') {
                s.ddl_year = new Date().getFullYear().toString()
                s.currentMonth = new Date().getMonth() + 1
                s.ddl_month = s.currentMonth.toString() < 10 ? "0" + s.currentMonth.toString() : s.currentMonth.toString()
            }
            else {
                s.ddl_year = d.data.prevValues[0]
                s.ddl_month = d.data.prevValues[1]
            }
            //**********************************************
            //  Show/Hide ADD, EDIT, DELETE button 
            //**********************************************
            s.allowAdd = d.data.allowAdd
            s.allowDelete = d.data.allowDelete
            s.allowEdit = d.data.allowEdit
            s.allowView = d.data.allowView
            s.allowPrint = d.data.allowPrint

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
                s.ShowEdit = true
            }
            else {
                s.ShowEdit = false
            }
            if (s.allowView == "1") {
                s.ShowView = true
            }
            else {
                s.ShowView = false
            }
            if (s.allowPrint == "1") {
                s.ShowPrint = true
            }
            else {
                s.ShowPrint = false
            }
        });

        
    }
    init()
    
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                //sDom: 'rt<"bottom"p>',
                sDom: 'rt<"bottom"ip>',
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
                        "mRender": function (data, type, full, row) { return "<span class='btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "remittance_status_descr",
                        "mRender": function (data, type, full, row)
                        { return data.toString().trim() == "NOT REMITTED" ? "<span class='badge badge-danger'><i class='fa fa-times'></i> " + data + "</span>" : data.toString().trim() == "REMITTED" ? "<span class='badge badge-success text-center'> <i class='fa fa-check'></i>" + data + "</span>" : "<span class='badge badge-warning text-center'> <i class='fa fa-edit'></i>" + data + "</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var printable = "";
                            var disabled_delete = false;
                            if (full["remittancetype_code"] == "08" ||
                                full["remittancetype_code"] == "09" ||
                                full["remittancetype_code"] == "10" ||
                                full["remittancetype_code"] == "11" ||
                                full["remittancetype_code"] == "12" ||
                                full["remittancetype_code"] == "13" ||
                                full["remittancetype_code"] == "14" ||
                                full["remittancetype_code"] == "16" ||
                                full["remittancetype_code"] == "17" ||
                                full["remittancetype_code"] == "02" ||
                                full["remittancetype_code"] == "03" ||
                                full["remittancetype_code"] == "04" ||
                                full["remittancetype_code"] == "05" ||
                                full["remittancetype_code"] == "06" ||
                                full["remittancetype_code"] == "01" ||
                                full["remittancetype_code"] == "07" ||
                                full["remittancetype_code"] == "18" 
                            )
                            {
                                printable = false;
                            }
                            else {
                                printable = true;
                            }

                            if (full["remittance_status"] == "N") {
                                disabled_delete = false;
                            }
                            else {
                                disabled_delete = true;
                            }


                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" ng-show="ShowEdit" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-disabled="' + disabled_delete +'" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '<button type="button" ng-show="ShowPrint" class="btn btn-primary btn-sm" ng-disabled="' + printable + '" ng-click="btn_print_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print" ><i class="fa fa-print"></i></button>' +
                                '<button type="button" class="btn btn-success btn-sm"  ng-click="btn_view_grand_total(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Grand Total" ><i class="fa fa-eye"></i></button>' +
                                //'<button type="button" class="btn btn-info btn-sm" ><i class="fa fa-eye" data-toggle="tooltip" data-placement="top" title="Show OR Breakdwon"></i></button>'  +
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
        h.post("../cRemitLedger/RetrieveListGrid",
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
        h.post("../cRemitLedger/RetrieveListGrid",
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
    s.SelectEmploymentType = function (empType)
    {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cRemitLedger/RetrieveListGrid",
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

        h.post("../cRemitLedger/SelectEmploymentType", { par_empType: empType }).then(function (d)
            {
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
    s.btn_save_add = function () 
    {
        
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
    function updateListGrid(row_id)
    {
        s.datalistgrid[row_id].remittance_ctrl_no        = s.txtb_remittance_ctrl_no
        s.datalistgrid[row_id].remittancetype_code       = s.ddl_remittancetype
        s.datalistgrid[row_id].remittance_year           = s.ddl_year
        s.datalistgrid[row_id].remittance_month          = s.ddl_month
        s.datalistgrid[row_id].employment_type           = s.ddl_employment_type
        s.datalistgrid[row_id].remittance_descr          = s.txtb_description
        s.datalistgrid[row_id].remittance_status         = ""
        s.datalistgrid[row_id].remittance_dttm_created   = s.hidden_remittance_dttm_created
        s.datalistgrid[row_id].user_id_created_by        = ""
        s.datalistgrid[row_id].remittance_dttm_updated   = s.hidden_remittance_dttm_updated
        s.datalistgrid[row_id].user_id_updated_by        = ""
        s.datalistgrid[row_id].remittance_dttm_released  = s.hidden_remittance_dttm_released
        s.datalistgrid[row_id].user_id_released_by       = ""
        s.datalistgrid[row_id].remittance_dttm_remitted  = s.hidden_remittance_dttm_remitted
        s.datalistgrid[row_id].user_id_remitted_by       = ""

        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
    }
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_edit_action = function (id_ss) {
        s.isEdit = true
        clearentry()

        ////var date = new Date(parseInt(s.datalistgrid[id_ss].remittance_dttm_created.substr(6)));
        ////var year    = date.getFullYear().toString();
        ////var month   = (date.getMonth() + 1).toString();
        ////var day     = date.getDay().toString();

        ////var date_created = month + "/" + day + "/" + year

        s.txtb_remittance_ctrl_no   = s.datalistgrid[id_ss].remittance_ctrl_nbr;
        s.txtb_description          = s.datalistgrid[id_ss].remittance_descr;
        s.ddl_remittancetype        = s.datalistgrid[id_ss].remittancetype_code;
        s.txtb_remittancetype       = s.datalistgrid[id_ss].remittancetype_descr;
        s.txtb_year                 = $('#ddl_year option:selected').text();
        s.txtb_month                = $('#ddl_month option:selected').text();
        s.txtb_date_created         = moment(s.datalistgrid[id_ss].remittance_dttm_created).format("YYYY-MM-DD")
        s.txtb_created_by           = s.datalistgrid[id_ss].user_id_created_by
        $('#btn_save_update').attr('ngx-data', id_ss);
    
        s.ishow     = false
        s.isupdate = true
        //s.disabled_ddl_remittancetype = true
        //s.disabled_ddl_remittancetype = false
        s.ModalTitle = "Edit Record"
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_del_row = function (id_ss) {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cRemitLedger/DeleteFromDatabase",
                        {
                            par_remittance_ctrl_no : s.datalistgrid[id_ss].remittance_ctrl_nbr,
                            par_remittancetype_code: s.datalistgrid[id_ss].remittancetype_code

                        }).then(function (d) {
                            if (d.data.message == "success") {
                                
                                s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].remittance_ctrl_nbr, "remittance_ctrl_nbr");
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
        if (s.ddl_remittancetype == "")
        {
            FieldValidationColorChanged(true, "ddl_remittancetype")
            validatedSaved = false;
        }
        if (s.txtb_description == "")
        {
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
    function FieldValidationColorChanged(pMode, pObjectName)
    {

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
    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_print_row = function (lst) {
        clearentry();

        if (s.datalistgrid[lst].remittancetype_code == "01") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                    { report_name: "cryRemittanceGSIS.rpt", report_descr: "GSIS" }
                 , { report_name: "cryRemittance_SmryGSIS.rpt", report_descr: "GSIS Remittance Summary By Office" }
                ];
        }

        else if (s.datalistgrid[lst].remittancetype_code == "02"
            || s.datalistgrid[lst].remittancetype_code == "03"
            || s.datalistgrid[lst].remittancetype_code == "04"
            || s.datalistgrid[lst].remittancetype_code == "05"
            || s.datalistgrid[lst].remittancetype_code == "06") //HDMF
        {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());

            if (s.datalistgrid[lst].remittancetype_code == "02") {
                s.reports =
                    [
                        { report_name: "cryRemittanceHDMFPremiums.rpt", report_descr: "Pag-IBIG Premiums" }
                        , { report_name: "cryRemittance_SmryHDMF.rpt", report_descr: "Pag-IBIG Remittance Summary By Office" }
                    ];
            }

            else if (s.datalistgrid[lst].remittancetype_code == "03") {
                s.reports =
                    [
                    { report_name: "cryRemittanceHDMFOthers.rpt", report_descr: "Pag-IBIG Multi Purpose Loan" }
                    , { report_name: "cryRemittance_SmryHDMFOthers.rpt", report_descr: "Pag-IBIG Multi Purpose Loan Remittance Summary By Office" }
                    ];
            }

            else if (s.datalistgrid[lst].remittancetype_code == "04") {
                s.reports =
                    [
                    { report_name: "cryRemittanceHDMFOthers.rpt", report_descr: "Pag-IBIG Calamity Loan" }
                    , { report_name: "cryRemittance_SmryHDMFOthers.rpt", report_descr: "Pag-IBIG Calamity Loan Remittance Summary By Office" }
                    ];
            }
            else if (s.datalistgrid[lst].remittancetype_code == "05") {
                s.reports =
                    [
                    { report_name: "cryRemittanceHDMFOthers.rpt", report_descr: "Pag-IBIG MP2" }
                    , { report_name: "cryRemittance_SmryHDMFOthers.rpt", report_descr: "Pag-IBIG MP2 Remittance Summary By Office" }
                    ];
            }

            else if (s.datalistgrid[lst].remittancetype_code == "06") {
                s.reports =
                    [
                    { report_name: "cryRemittanceHDMFOthers.rpt", report_descr: "Pag-IBIG Housing" }
                    , { report_name: "cryRemittance_SmryHDMFOthers.rpt", report_descr: "Pag-IBIG Housing Remittance Summary By Office" }
                    ];
            }


          
        }

        else if (s.datalistgrid[lst].remittancetype_code == "07") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                { report_name: "cryRemittancePHICPremiums.rpt", report_descr: "PHIC Premiums" }
                , { report_name: "cryRemittance_SmryPHIC.rpt", report_descr: "PHIC Premiums Remittance Summary By Office" }
                ];
        }

        else if (s.datalistgrid[lst].remittancetype_code == "08") {
            $('#lbl_dynamic_month').html("<b>Remittance Quarter:</b>");
            DisplayQuarterByMonth(s.datalistgrid[lst].remittance_month);
            s.reports =
                [
                    { report_name: "cryRemittanceSSSQtrly.rpt", report_descr: "SSS Quarterly Report" }
                    , { report_name: "cryRemittanceSSSRs5.rpt", report_descr: "RS5 Quarterly Report" }
                    , { report_name: "cryRemittanceSSSRs5Monthly.rpt", report_descr: "RS5 Monthly Report" }
                    , { report_name: "cryRemittance_Smry.rpt", report_descr: "SSS Remittance Summary By Office" }
                ];
        }


        else if (s.datalistgrid[lst].remittancetype_code == "09") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                { report_name: "cryRemittanceNETWORKBANK.rpt", report_descr: "Network Bank Monthly Remittance" }
                , { report_name: "cryRemittanceNETWORKBANK.rpt", report_descr: "Network Monthly Remittance (Reconciliation)" }
                    , { report_name: "cryRemittance_Smry.rpt", report_descr: "Network Bank Remittance Summary By Office" }
                ];
        }
        else if (s.datalistgrid[lst].remittancetype_code == "10") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                { report_name: "cryRemittanceNICO.rpt", report_descr: "NICO Monthly Remittance" }
                , { report_name: "cryRemittanceNICO.rpt", report_descr: "NICO Monthly Remittance (Reconciliation)" }
                    , { report_name: "cryRemittance_Smry.rpt", report_descr: "NICO Remittance Summary By Office" }
                ];
        }
        else if (s.datalistgrid[lst].remittancetype_code == "11") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                { report_name: "cryRemittanceCCMPC.rpt", report_descr: "CCMPC Monthly Remittance" }
                , { report_name: "cryRemittanceCCMPC.rpt", report_descr: "CCMPC Monthly Remittance (Reconciliation)" }
                    , { report_name: "cryRemittance_Smry.rpt", report_descr: "CCMPC Remittance Summary By Office" }
                ];
        }
        else if (s.datalistgrid[lst].remittancetype_code == "12") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                { report_name: "cryRemittancePHILAMLIFE.rpt", report_descr: "PHILAMLIFE Monthly Remittance" }
                , { report_name: "cryRemittancePHILAMLIFE.rpt", report_descr: "PHILAMLIFE Monthly Remittance (Reconciliation)" }
                    , { report_name: "cryRemittance_Smry.rpt", report_descr: "PHILAMLIFE Remittance Summary By Office" }
                ];
        }
        else if (s.datalistgrid[lst].remittancetype_code == "13") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                { report_name: "cryRemittanceNHMFC.rpt", report_descr: "NHMFC Monthly Remittance" }
                , { report_name: "cryRemittanceNHMFC.rpt", report_descr: "NHMFC Monthly Remittance (Reconciliation)" }
                    , { report_name: "cryRemittance_Smry.rpt", report_descr: "NHMFC Remittance Summary By Office" }
                ];
        }

        //BIR TAX
        else if (s.datalistgrid[lst].remittancetype_code == "14") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                 { report_name: "cryRemittanceTAXMonthlyRecon.rpt", report_descr: "BIR Tax Monthly Remittance" }
                ,{ report_name: "cryRemittance_SmryTax.rpt", report_descr: "BIR Tax Monthly Remittance Summary By Office" }
                ];
        }

       //LAND BANK
        else if (s.datalistgrid[lst].remittancetype_code == "16") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                    { report_name: "cryRemittanceLBPMonthlyRecon.rpt", report_descr: "LBP Monthly Remittance" }
                , { report_name: "cryRemittance_Smry.rpt", report_descr: "LANDBANK Electronic Salary Loan Remittance Summary By Office" }
                ];
        }
        else if (s.datalistgrid[lst].remittancetype_code == "17") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                  { report_name: "cryRemittanceTAGUMCOOP.rpt", report_descr: "Tagum Coop Monthly Remittance" }
                , { report_name: "cryRemittanceTAGUMCOOP.rpt", report_descr: "Tagum Coop Monthly Remittance (Reconciliation)" }
                , { report_name: "cryRemittance_Smry.rpt", report_descr: "Tagum Coop Remittance Summary By Office" }
                ];
        }
        else if (s.datalistgrid[lst].remittancetype_code == "18") {
            $('#lbl_dynamic_month').html("<b>Remittance Month:</b>");
            $('#txtb_rpt_quarter').val($('#ddl_month option:selected').html());
            s.reports =
                [
                { report_name: "cryRemittanceJO_UNIFORM.rpt", report_descr: "Job Order Uniform Remittance" }
                , { report_name: "cryRemittance_Smry.rpt", report_descr: "Job Order Uniform Remittance Summary By Office" }
                ];
        }


        $('#modalLabelSmall').html(s.datalistgrid[lst].remittancetype_descr + " REPORT OPTIONS");
        $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        $('#txtb_remittance_type').val($('#ddl_employment_type option:selected').html());

        $('#btn_print_rs5').attr("ngx-data", lst);

        //$('#txtb_rpt_employee_name').val(s.datalistgrid[row_id].employee_name);
        //$('#Loading_master').modal({
        //    keyboard: false,
        //    backdrop: "static"
        //});
        //var controller = "Reports"
        //var action = "Index"
        //var ReportName = "CrystalReport"
        //var SaveName = "Crystal_Report"
        //var ReportType = "inline"
        //var ReportPath = "~/Reports/cryRemittancePHIC/cryRemittancePHIC.rpt"
        //var sp = "sp_remittance_phic_rep,par_remittance_ctrl_no," + s.datalistgrid[lst].remittance_ctrl_no

        //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //    + "&SaveName=" + SaveName
        //    + "&ReportType=" + ReportType
        //    + "&ReportPath=" + ReportPath
        //    + "&Sp=" + sp

    }

    s.btn_print_click = function () {
        if (isdataValidated()) {
        }
        else {
            if ($("#ddl_reports").val() != "") {
                var row_id = $('#btn_print_rs5').attr("ngx-data");
                var data = s.datalistgrid[row_id];
                var controller = "Reports";
                var action = "Index";
                var ReportName = s.ddl_reports.split('.')[0];
                var SaveName = "Crystal_Report";
                var ReportType = "inline";
                var ReportPath = "";
                var sp = "";

                if (data.remittancetype_code == "01") {

                    if ($('#ddl_reports option:selected').attr('ngx-data') == "0") {

                        var parameters = "p_remittancetype_code," + data.remittancetype_code + ",p_employment_type," + data.employment_type + ",p_remit_year," + data.remittance_year + ",p_remit_month," + data.remittance_month + ",p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr
                        sp = "sp_monthly_remittance_gsis_rep," + parameters

                    }

                    else {
                        sp = "sp_remittance_GSIS_smry_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                    }

                    ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";
                }

                else if (data.remittancetype_code == "08") {
                    ReportPath = "~/Reports/cryRemittanceSSS/" + s.ddl_reports + "";
                    if (s.ddl_reports == "cryRemittanceSSSRs5Monthly.rpt") {
                        sp = "sp_remittance_SSS_monthly_rep,p_employment_type," + data.employment_type + ",p_remittance_year," + data.remittance_year + ",p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr
                    }
                    else if (s.ddl_reports == "cryRemittance_Smry.rpt") {
                        sp = "sp_remittance_OTHERS_smry_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                        ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";
                    }
                    else {
                        sp = "sp_remittance_SSS_qtrly_rep,p_employment_type," + data.employment_type + ",p_remittance_year," + data.remittance_year + ",p_quarter_rep," + $('#txtb_rpt_quarter').attr("ngx-data") + ",p_empl_id,,p_batch_nbr,0"
                    }

                }
                else if (data.remittancetype_code == "09" ||
                    data.remittancetype_code == "10" ||
                    data.remittancetype_code == "11" ||
                    data.remittancetype_code == "12" ||
                    data.remittancetype_code == "13" ||
                    data.remittancetype_code == "16" ||
                    data.remittancetype_code == "17"

                ) {

                    if ($('#ddl_reports option:selected').attr('ngx-data') == "0" && data.remittancetype_code != "16") {
                        sp = "sp_remittance_OTHERS_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                    }
                    else if ($('#ddl_reports option:selected').attr('ngx-data') == "1" && data.remittancetype_code != "16") {
                        sp = "sp_remittance_OTHERS_recon_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                    }
                    else if ($('#ddl_reports option:selected').attr('ngx-data') == "0" && data.remittancetype_code == "16") {

                        var parameters = "p_remittancetype_code," + "16" + ",p_employment_type," + data.employment_type + ",p_remit_year," + data.remittance_year + ",p_remit_month," + data.remittance_month + ",p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr
                        sp = "sp_monthly_remittance_lbp_rep," + parameters

                    }



                    else {
                        sp = "sp_remittance_OTHERS_smry_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                    }

                    if ($('#ddl_reports option:selected').attr('ngx-data') == "1" && data.remittancetype_code != "16") {
                        ReportPath = "~/Reports/cryRemittanceOTHERS1/OtherRecon/" + s.ddl_reports + "";
                    }
                    else {
                        ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";
                    }


                }

                else if (data.remittancetype_code == "02"
                    || data.remittancetype_code == "03"
                    || data.remittancetype_code == "04"
                    || data.remittancetype_code == "05"
                    || data.remittancetype_code == "06") //HDMF PREMIUMS 
                {

                    if ($('#ddl_reports option:selected').attr('ngx-data') == "0") {

                        var parameters = "p_remittancetype_code," + data.remittancetype_code + ",p_employment_type," + data.employment_type + ",p_remit_year," + data.remittance_year + ",p_remit_month," + data.remittance_month + ",p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr
                        sp = "sp_monthly_remittance_hdmf_rep," + parameters

                    }

                    else {
                        sp = "sp_remittance_HDMF_smry_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                    }

                    ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";
                }

                else if (data.remittancetype_code == "07") {

                    if ($('#ddl_reports option:selected').attr('ngx-data') == "0") {

                        var parameters = "p_remittancetype_code," + data.remittancetype_code + ",p_employment_type," + data.employment_type + ",p_remit_year," + data.remittance_year + ",p_remit_month," + data.remittance_month + ",p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr
                        sp = "sp_monthly_remittance_phic_rep," + parameters

                    }

                    else {
                        sp = "sp_remittance_PHIC_smry_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                    }

                    ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";
                }



                else if (data.remittancetype_code == "14") {

                    if (s.ddl_reports == "cryRemittance_SmryTax.rpt") {
                        sp = "sp_remittance_TAX_smry_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;

                    }
                    else {
                        var parameters = "p_remittancetype_code," + "14" + ",p_employment_type," + data.employment_type + ",p_remit_year," + data.remittance_year + ",p_remit_month," + data.remittance_month + ",p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr
                        sp = "sp_monthly_remittance_tax_rep," + parameters;

                    }
                    ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";
                }
                else if (data.remittancetype_code == "18") {
                    if (s.ddl_reports == "cryRemittanceJO_UNIFORM.rpt") {

                        sp = "sp_remittance_OTHERS_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                       
                    }
                    else {
                        sp = "sp_remittance_OTHERS_smry_rep,p_remittance_ctrl_nbr," + data.remittance_ctrl_nbr;
                    }
                    ReportPath = "~/Reports/cryRemittanceOTHERS1/" + s.ddl_reports + "";
                }
                
                s.loading_r = true;
                s.Modal_title = "PRINT PREVIEW";
                $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
                h.post("../cRemitLedger/PreviousValuesonPage_cRemitLedger",
                    {
                        par_remittance_year: $('#ddl_year option:selected').text(),
                        par_remittance_month: $('#ddl_month option:selected').val(),
                        par_remittance_month_descr: $('#ddl_month option:selected').text(),
                        par_employment_type: $('#ddl_employment_type option:selected').val(),
                        par_employment_type_descr: $('#ddl_employment_type option:selected').text(),
                        par_remittancetype_code: s.datalistgrid[row_id].remittancetype_code,
                        par_remittancetype_code_descr: s.datalistgrid[row_id].remittancetype_descr,
                        par_remittance_ctrl_nbr: s.datalistgrid[row_id].remittance_ctrl_nbr,
                        par_remittance_status: s.datalistgrid[row_id].remittance_status,
                        par_remittance_status_descr: s.datalistgrid[row_id].remittance_status_descr,
                        par_show_entries: s.rowLen,
                        par_page_nbr: $('#datalist_grid').DataTable().page.info().page,
                        par_search: s.search_box,

                    }).then(function (d)
                    {

                        // *******************************************************
                        // *** VJA : 2021-07-14 - Validation and Loading hide ****
                        // *******************************************************
                        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                        var iframe = document.getElementById('iframe_print_preview');
                        var iframe_page = $("#iframe_print_preview")[0];
                        iframe.style.visibility = "hidden";

                        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                            + "&ReportName=" + ReportName
                            + "&SaveName=" + SaveName
                            + "&ReportType=" + ReportType
                            + "&ReportPath=" + ReportPath
                            + "&id=" + sp //+ parameters

                        console.log(s.embed_link)

                        if (!/*@cc_on!@*/0) { //if not IE
                            iframe.onload = function () {
                                iframe.style.visibility = "visible";
                                $("#loading_data").modal("hide")
                                

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
                                $("#loading_data").modal("hide")
                            }
                        }
                        else {
                            iframe.onreadystatechange = function () {
                                if (iframe.readyState == "complete") {
                                    iframe.style.visibility = "visible";
                                    $("#loading_data").modal("hide")

                                }
                            };
                        }

                        s.loading_r = false;
                       
                        iframe.src = s.embed_link;
                        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    });
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

                    par_remittance_ctrl_no  : s.txtb_remittance_ctrl_no,
                    par_remittancetype_code : s.ddl_remittancetype,
                    par_remittance_year     : s.ddl_year,
                    par_remittance_month    : s.ddl_month,
                    par_employment_type     : s.ddl_employment_type,
                    par_remittance_descr    : s.txtb_description,
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
                                par_remittance_year     : s.ddl_year,
                                par_remittance_month    : s.ddl_month,
                                par_employment_type     : s.ddl_employment_type,
                                par_remittance_ctrl_no  : s.txtb_remittance_ctrl_no,


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
    s.btn_show_details_action = function(lst)
    {
      

        // return
        h.post("../cRemitLedger/PreviousValuesonPage_cRemitLedger",
            {       
                par_remittance_year             : $('#ddl_year option:selected').text(),
                par_remittance_month            : $('#ddl_month option:selected').val(),
                par_remittance_month_descr      : $('#ddl_month option:selected').text(),
                par_employment_type             : $('#ddl_employment_type option:selected').val(),
                par_employment_type_descr       : $('#ddl_employment_type option:selected').text(),
                par_remittancetype_code         : s.datalistgrid[lst].remittancetype_code,
                par_remittancetype_code_descr   : s.datalistgrid[lst].remittancetype_descr,
                par_remittance_ctrl_nbr         : s.datalistgrid[lst].remittance_ctrl_nbr,
                par_remittance_status           : s.datalistgrid[lst].remittance_status,
                par_remittance_status_descr     : s.datalistgrid[lst].remittance_status_descr,
                par_show_entries                : s.rowLen,
                par_page_nbr                    : $('#datalist_grid').DataTable().page.info().page,
                par_search                      : s.search_box,
                
                
            }).then(function (d)
            {
                var url = "";
                switch (s.datalistgrid[lst].remittancetype_code)
                {
                    case "01":
                        url = "/cRemitLedgerGSIS";
                        break;
                    case "02":
                        url = "/cRemitLedgerHDMF?id=02&eType=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "03":
                        url = "/cRemitLedgerHDMF?id=03&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "04":
                        url = "/cRemitLedgerHDMF?id=04&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "05":
                        url = "/cRemitLedgerHDMF?id=05&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "06":
                        url = "/cRemitLedgerHDMF?id=06&etype=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "07":
                        url = "/cRemitLedgerPHIC";
                        break;
                    case "08":
                        url = "/cRemitLedgerSSS";
                        break;
                    case "09":
                        url = "/cRemitLedgerOthers?id=09&title=" + s.datalistgrid[lst].remittancetype_descr;  
                        break;
                    case "10":
                        url = "/cRemitLedgerOthers?id=10&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "11":
                        url = "/cRemitLedgerOthers?id=11&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "12":
                        url = "/cRemitLedgerOthers?id=12&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "13":
                        url = "/cRemitLedgerOthers?id=13&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "14":
                        url = "/cRemitLedgerTax";
                        break;
                    case "15":
                        url = "/cRemitLedgerCNA";
                        break;
                    case "16":
                        url = "/cRemitLedgerLBP";
                        break;
                    case "17":
                        url = "/cRemitLedgerOthers?id=17&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;
                    case "18":
                        url = "/cRemitLedgerOthers?id=18&title=" + s.datalistgrid[lst].remittancetype_descr;
                        break;

                }
                if (url != "") {
                    window.location.href = url;
                }
            })
        
    }
    
    //********************************************************************/
    //*** VJA : 2021-07-21 - This Function is for Grand Total Viewing****//
    //********************************************************************/
    s.btn_view_grand_total = function (id_ss)
    {
        h.post("../cRemitLedger/RetrieveGrandTotal",
            {
                par_remittance_ctrl_nbr: s.datalistgrid[id_ss].remittance_ctrl_nbr
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    console.log(d.data.data)

                    // **********************************************************
                    // ********** Show the Div on Index *************************
                    // **********************************************************
                    s.show_div_gsis      = false;
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

                    else if (d.data.data.remittancetype_code == "14")
                    {

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

                    s.txtb_remittance_ctrl_no   = s.datalistgrid[id_ss].remittance_ctrl_nbr;
                    s.txtb_description          = s.datalistgrid[id_ss].remittance_descr;
                    s.ddl_remittancetype        = s.datalistgrid[id_ss].remittancetype_code;
                    s.txtb_remittancetype       = s.datalistgrid[id_ss].remittancetype_descr;
                    s.txtb_year                 = $('#ddl_year option:selected').text();
                    s.txtb_month                = $('#ddl_month option:selected').text();
                    s.txtb_date_created         = moment(s.datalistgrid[id_ss].remittance_dttm_created).format("YYYY-MM-DD")
                    s.txtb_created_by           = s.datalistgrid[id_ss].user_id_created_by
                    
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

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }


    //***************************Functions end*********************************************************//

})

