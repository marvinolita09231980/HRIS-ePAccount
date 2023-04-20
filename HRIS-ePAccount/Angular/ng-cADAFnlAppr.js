ng_HRD_App.controller("cADAFnlAppr_ctrlr", function ($scope, $compile, Upload, $http, $filter) {
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
    s.ddl_reports       = "";
    s.datalistArray     = [];

    s.txtb_disabler     = false;
    s.txtb_key          = true;
    s.ddl_reports       = "01";
    s.ddl_ca_doc_type   = "";
    s.txtb_nbr_able     = true;
    s.action_status     = "";
    s.user_department   = "";
    s.show_download     = false;
    s.ddl_ca_doc_type   = "ADA";
    function init()
    {
        var browserHeight = window.innerHeight
        s.isEdit = false
       
        $("#loading_data").modal({ keyboard: false, backdrop: "static" });
        $('.clockpicker').clockpicker({
            placement:"top",
            donetext: 'Done',
            twelvehour: true,
            autoclose: true,
            leadingZeroHours: false,
            upperCaseAmPm: true,
            leadingSpaceAmPm: true,
            afterHourSelect: function () {
                $('.clockpicker').clockpicker('realtimeDone');
            },
            afterMinuteSelect: function () {
                $('.clockpicker').clockpicker('realtimeDone');
            },
            afterAmPmSelect: function () {
                $('.clockpicker').clockpicker('realtimeDone');
            }
        });
        h.post("../cADAFnlAppr/InitializeData", { par_doc_type: s.ddl_ca_doc_type }).then(function (d)
        {

            s.employeeddl   = d.data.empType
            s.ca_type       = d.data.ca_type
            userid          = d.data.userid
            s.fundcsource   = d.data.fundsource

            s.ddl_year      = d.data.prevValues[0] // par_remittance_year
            s.ddl_month     = d.data.prevValues[1] // par_remittance_month
            s.ddl_ca_doc_type = d.data.prevValues[3] != null ? d.data.prevValues[3] : "ADA";// par_employment_type
            s.rowLen                = d.data.prevValues[10] // par_show_entries
            s.search_box        = d.data.prevValues[12] // par_search
            s.user_department   = d.data.department_code;
            init_table_data([]);

            if (d.data.sp_cashadv_hdr_tbl_list.length > 0)
            {
                s.datalistgrid = d.data.sp_cashadv_hdr_tbl_list;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.sp_cashadv_hdr_tbl_list)
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

            if (d.data.prevValues[1] == null)
            {
                s.ddl_year      = new Date().getFullYear().toString()
                s.currentMonth  = (new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()
                s.ddl_month     = s.currentMonth.toString()
            }
            else {
                s.ddl_year  = d.data.prevValues[0];
                s.ddl_month = d.data.prevValues[1];
            }
        });

        
    }
    init()
    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    //{
                    //    "mData": "ca_ctrl_nbr",
                    //    "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    //},
                    {
                        "mData": "ca_voucher_nbr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "ca_short_descr",
                        "mRender": function (data, type, full, row)
                        {
                            var descr_x = full["ca_descr"].toString().trim() == "" ? "" : " | " +full["ca_descr"].toString().trim();
                            return "<span class='text-left btn-block'>&nbsp;" + data + "" + descr_x+"</span>";
                        }
                    },
                    {
                        "mData": "ca_status_descr",
                        "mRender": function (data, type, full, row)
                        { return "<span class='text-center btn-block'><b>" + data + "</b></span>" }
                    },
                    {
                        "mData": "summary",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'><b>" + data + "&nbsp;</b></span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var fa_class = "fa fa-check";
                            var disable_upload = true;


                            if (full["ca_status"] != "F") {
                                disable_upload = false;
                                fa_class = "fa fa-hand-o-up";
                            }

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm"                                       ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                //'<button type="button" class="btn btn-info btn-sm"                                          ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                //'<button type="button" class="btn btn-danger btn-sm"  ng-disabled="' + disabled_delete + '"   ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '<button type="button" class="btn btn-success btn-sm"      ng-disabled="' + disable_upload + '"                                  ng-click="btn_print_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Approved and Authorize"><i class="' + fa_class+'" ></i></button>' +
                                //upload_btn +
                                //download_btn +
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


    //s.btn_upload_action = function (row_id, action_x) {
    //    s.txtb_cadisb_ofcr = s.datalistgrid[row_id].cadisb_ofcr;
    //    s.txtb_ca_ctrl_nbr = s.datalistgrid[row_id].ca_ctrl_nbr;
    //    s.txtb_ca_voucher_nbr = s.datalistgrid[row_id].ca_voucher_nbr;
    //    s.txtb_short_description = s.datalistgrid[row_id].ca_short_descr;
    //    s.txtb_description = s.datalistgrid[row_id].ca_descr;
    //    s.ddl_ca_type = s.datalistgrid[row_id].catype_code;
    //    s.ddl_fundsource = s.datalistgrid[row_id].cafund_code;
    //    s.ddl_ca_doc_type = s.datalistgrid[row_id].ca_doc_type;

    //    if (s.datalistgrid[row_id].ca_doc_type == "ADA") {
    //        $('#lbl_ca_ada_nbrX').html("ADA Nbr:")

    //    }
    //    else {
    //        $('#lbl_ca_ada_nbrX').html("C.A Voucher Nbr:")

    //    }

    //    if (action_x == "D") {
    //        s.show_download = true;

    //    }
    //    else if (action_x == "U") {
    //        s.show_download = false;
    //    }
    //    $('#btn_dowload').attr("ng-x-data", row_id);
    //    s.lbl_required_file = "";
    //    s.txtb_database_filename = "";
    //    s.txtb_database_filename = s.datalistgrid[row_id].database_filename;
    //    $('#txtb_database_filename').removeClass("required");
    //    s.ModalTitleX = "CASH ADVANCE/ADA CONFIGURATION";
    //    $('#modal_upload').modal({ keyboard: false, backdrop: "static" });
    //}

    //s.btn_save_upload = function (par_action) {
    //    var dL_row_id = $('#btn_dowload').attr("ng-x-data");
    //    if (par_action == "U") {
    //        var fileUpload = $('#txtb_database_file').get(0);
    //        var files = fileUpload.files;
    //        s.SelectedFiles = files;
    //        $('#btn_upload').html("<i clas='fa fa-spinner spine'></i> Uploading......");
    //        if ($('#txtb_database_filename').val().toString().trim() != "" && fileUpload != null) {
    //            s.lbl_required_file = "";
    //            $('#txtb_database_filename').removeClass("required");
    //            if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
    //                Upload.upload({
    //                    url: '../cCashAdv/Upload/',
    //                    data: {
    //                        files: $scope.SelectedFiles
    //                        , par_ca_ctrl_nbr: s.txtb_ca_ctrl_nbr
    //                    }
    //                }).then(function (response) {
    //                    //$('#i_save2').addClass("fa-save");
    //                    //$('#i_save2').removeClass("fa-spinner spin");
    //                    swal("Database File Successfully Uploaded!", { icon: "success" });
    //                    s.datalistgrid[dL_row_id].ca_status = "U";
    //                    s.datalistgrid[dL_row_id].ca_status_descr = "With Database File";
    //                    $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
    //                    s.oTable.fnClearTable();
    //                    s.oTable.fnAddData(s.datalistgrid);

    //                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
    //                        if (get_page(s.txtb_ca_ctrl_nbr) == false) {
    //                            s.oTable.fnPageChange(x);
    //                        }
    //                        else {
    //                            break;
    //                        }
    //                    }

    //                }, function (response) {
    //                    if (response.status > 0) {
    //                        var errorMsg = response.status + ': ' + response.data;
    //                        alert(errorMsg);
    //                        $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
    //                    }
    //                }, function (evt) {
    //                    //var element = angular.element(document.querySelector('#dvProgress_full'));
    //                    //$scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    //                    //element.html('<div style="width: ' + $scope.Progress + '%; height:100%;" >' + $scope.Progress + '%</div>');
    //                });
    //            }
    //            else {
    //                swal("Nothing change in file, try to browse file to be re-upload", { icon: "warning" });
    //                $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
    //            }

    //        }
    //        else {
    //            s.lbl_required_file = "Required!";
    //            $('#txtb_database_filename').addClass("required");
    //            s.datalistgrid[dL_row_id].ca_status = "D";
    //            $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
    //        }

    //    }
    //    else if (par_action == "D") {

    //        if ($('#txtb_database_filename').val().toString().trim() != "") {
    //            if (s.datalistgrid[dL_row_id].downloaded_by != "") {
    //                swal({
    //                    title: "WARNING!",
    //                    text: "The file was already downloaded by: " + s.datalistgrid[dL_row_id].downloaded_by_name + " Last: " + moment(s.datalistgrid[dL_row_id].downloaded_dttm).format('MM-DD-YYYY hh:mm a') + ". This might be already uploaded to WE ACCESS PROGRAM. Are you sure to download this file again?",
    //                    icon: "warning",
    //                    buttons: ["NO", "YES"],
    //                    dangerMode: true,
    //                }).then(function (willDelete) {
    //                    if (willDelete) {
    //                        $('#btn_dowload').html("<i clas='fa fa-spinner spine'></i> Downloading..");
    //                        h.post("../cCashAdv/downloadFile",
    //                            {
    //                                par_ca_ctrl_nbr: s.txtb_ca_ctrl_nbr,
    //                                db_filename: $('#txtb_database_filename').val().toString().trim()
    //                            }).then(function (d) {
    //                                if (d.data.message == "success") {
    //                                    if (d.data.message == "success") {
    //                                        window.open(d.data.output_path, '', '');
    //                                        $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
    //                                        s.datalistgrid[dL_row_id].ca_status = "D";
    //                                        s.datalistgrid[dL_row_id].ca_status_descr = "Database File Downloaded";
    //                                        s.oTable.fnClearTable();
    //                                        s.oTable.fnAddData(s.datalistgrid);

    //                                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
    //                                            if (get_page(s.txtb_ca_ctrl_nbr) == false) {
    //                                                s.oTable.fnPageChange(x);
    //                                            }
    //                                            else {
    //                                                break;
    //                                            }
    //                                        }
    //                                    }
    //                                    else {
    //                                        swal(d.data.export_message.result_msg, { icon: "error" });
    //                                        $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
    //                                    }
    //                                }
    //                                else {
    //                                    swal(d.data.message, { icon: "error", });
    //                                    $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
    //                                }
    //                            });
    //                    }
    //                });
    //            }
    //            else {
    //                $('#btn_dowload').html("<i clas='fa fa-spinner spine'></i> Downloading..");
    //                h.post("../cCashAdv/downloadFile",
    //                    {
    //                        par_ca_ctrl_nbr: s.txtb_ca_ctrl_nbr,
    //                        db_filename: $('#txtb_database_filename').val().toString().trim()
    //                    }).then(function (d) {
    //                        if (d.data.message == "success") {
    //                            if (d.data.message == "success") {
    //                                window.open(d.data.output_path, '', '');
    //                                $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
    //                            }
    //                            else {
    //                                swal(d.data.export_message.result_msg, { icon: "error" });
    //                                $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
    //                            }
    //                        }
    //                        else {
    //                            swal(d.data.message, { icon: "error", });
    //                            $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
    //                        }
    //                    });
    //            }

    //        }
    //        else {
    //            swal("No database file for this Application", { icon: "warning", });
    //        }

    //    }

    //}


    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++)
        {
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
    //s.SelectMonth = function (par_year, par_month, par_empType, par_remittancetype) {
    //    $("#loading_data").modal({ keyboard: false, backdrop: "static" })
    //    h.post("../cCashAdv/RetrieveListGrid",
    //        {
    //            par_year: par_year
    //            , par_month: par_month
    //            , par_empType: par_empType
    //            , par_remittancetype: par_remittancetype

    //        }).then(function (d) {

    //            if (d.data.sp_cashadv_hdr_tbl_list.length > 0) {
    //                s.datalistgrid = d.data.sp_cashadv_hdr_tbl_list;
    //                s.oTable.fnClearTable();
    //                s.oTable.fnAddData(d.data.sp_cashadv_hdr_tbl_list)
    //            }
    //            else {
    //                s.oTable.fnClearTable();
    //            }
    //            $("#loading_data").modal("hide");

    //        })
    //}

    /************************************/
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectYear = function (par_year, par_month, par_doc_type) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cADAFnlAppr/RetrieveListGrid",
            {
                par_year            : par_year
                , par_month         : par_month
                , par_doc_type      : par_doc_type

            }).then(function (d)
            {

                if (d.data.sp_cashadv_hdr_tbl_list.length > 0)
                {
                    s.datalistgrid = d.data.sp_cashadv_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_cashadv_hdr_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }
                $("#loading_data").modal("hide");
            })
    }


    
    //*************************************//
    //Add Leading Zero to Months for Control Number
    //*************************************// 
    function lead_zero(n) {
        return String("0" + n).slice(-2);
    }
    //*************************************//
    //Add Leading Zero to Control Number
    //*************************************// 
    function lead_zero2(n) {
        return String("0000" + n).slice(-4);
    }
    //*************************************//
    //Get the month of last inserted Control Number
    //*************************************// 
    function extractText(str, delimiter) {
        if (str && delimiter) {
            var firstIndex = str.indexOf(delimiter) + 1;
            var lastIndex = str.lastIndexOf(delimiter);
            str = str.substring(firstIndex, lastIndex);
        }
        return str;
    }
    
    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function clearentry() {

        s.txtb_ca_ctrl_nbr = "";
        s.txtb_ca_voucher_nbr = "";
        s.txtb_description = "";
        s.txtb_short_description = "";
        s.ddl_fundsource = "";
        s.ddl_ca_type = "";
        FieldValidationColorChanged(false, "ALL");
    }

    
    
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_edit_action = function (id_ss) {
        s.isEdit = true
        $('#txtb_date_downloaded').removeClass("required");
        $('#txtb_date_downloaded').datepicker("setDate","");
        $('#txtb_time_downloaded').removeClass("required");
        $('#txtb_date_downloaded').val("");
        $('#txtb_time_downloaded').val("");
        s.lbl_txtb_date_downloaded = "";
        s.lbl_txtb_time_downloaded = "";
        clearentry()
        s.txtb_cadisb_ofcr = s.datalistgrid[id_ss].cadisb_ofcr;
        s.txtb_ca_ctrl_nbr = s.datalistgrid[id_ss].ca_ctrl_nbr;
        s.txtb_ca_voucher_nbr = s.datalistgrid[id_ss].ca_voucher_nbr;
        s.txtb_short_description = s.datalistgrid[id_ss].ca_short_descr;
        s.txtb_description = s.datalistgrid[id_ss].ca_descr;
        s.ddl_ca_type = s.datalistgrid[id_ss].catype_code;
        s.ddl_fundsource = s.datalistgrid[id_ss].cafund_code;
        s.ddl_ca_doc_type = s.datalistgrid[id_ss].ca_doc_type;

        s.txtb_database_filename_uploaded = s.datalistgrid[id_ss].database_filename;
        s.ishow = false;
        s.isupdate = true;
        s.action_status = "E"
        if (
            s.datalistgrid[id_ss].ca_status == "V" ||
            s.datalistgrid[id_ss].ca_status == "Y" ||
            s.datalistgrid[id_ss].ca_status == "W" ||
            s.datalistgrid[id_ss].ca_status == "P" ||
            s.datalistgrid[id_ss].ca_status == "U" ||
            s.datalistgrid[id_ss].ca_status == "D" ||
            s.datalistgrid[id_ss].ca_status == "F" ||
            s.datalistgrid[id_ss].ca_status == "R") {
            s.ishow = false;
            s.isupdate = false;
        }

        if (s.ddl_ca_doc_type.trim() == "ADA") {
            $('#lbl_ca_ada_nbr').html("ADA Nbr:")
            s.txtb_nbr_able = false;
        }
        else {
            $('#lbl_ca_ada_nbr').html("C.A Voucher Nbr:")
            s.txtb_nbr_able = true;
        }

        s.txtb_behavior("EDIT", s.datalistgrid[id_ss]);
        $('#btn_save_update').attr('ngx-data', id_ss);

        s.ModalTitle = "Edit Record"
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }

    s.txtb_behavior = function (par_action, par_row_data) {
        if (par_action == "EDIT") {
            if (par_row_data["ca_status"] == "N" || par_row_data["ca_status"] == "T") {
                s.txtb_disabler = false;
            }
            else {
                s.txtb_disabler = true;
            }
        }
    }

    //**************************************//
    //***Data Validated****//
    //**************************************//
    function isdataValidated() {
        FieldValidationColorChanged(false, "ALL");

        var validatedSaved = true
        //if (s.txtb_ca_voucher_nbr == "") {
        //    FieldValidationColorChanged(true, "txtb_ca_voucher_nbr")
        //    validatedSaved = false;
        //}
        if (s.txtb_short_description.trim() == "") {
            FieldValidationColorChanged(true, "txtb_short_description")
            validatedSaved = false;
        }
        if (s.txtb_description.trim() == "") {
            FieldValidationColorChanged(true, "txtb_description")
            validatedSaved = false;
        }
        if (s.ddl_ca_type.trim() == "") {
            FieldValidationColorChanged(true, "ddl_ca_type")
            validatedSaved = false;
        }
        if (s.ddl_fundsource.trim() == "") {
            FieldValidationColorChanged(true, "ddl_fundsource")
            validatedSaved = false;
        }
        if (s.ddl_ca_doc_type.trim() == "") {
            FieldValidationColorChanged(true, "ddl_ca_doc_type")
            validatedSaved = false;
        }

        if (s.txtb_cadisb_ofcr.trim() == "") {
            FieldValidationColorChanged(true, "txtb_cadisb_ofcr")
            validatedSaved = false;
        }


        //if (s.txtb_ca_voucher_nbr.trim() == "") {
        //    FieldValidationColorChanged(true, "txtb_ca_voucher_nbr")
        //    validatedSaved = false;
        //}
        return validatedSaved;

    }
    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {

        if (pMode)
            switch (pObjectName) {

                case "txtb_ca_voucher_nbr":
                    {
                        $("#txtb_ca_voucher_nbr").addClass('require-field')
                        s.lbl_requiredfield1 = "required field!"
                        break;
                    }
                case "txtb_short_description":
                    {
                        $("#txtb_short_description").addClass('require-field')
                        s.lbl_requiredfield4 = "required field!"
                        break;
                    }
                case "txtb_description":
                    {
                        $("#txtb_description").addClass('require-field')
                        s.lbl_requiredfield5 = "required field!"
                        break;
                    }
                case "ddl_ca_type":
                    {
                        $("#ddl_ca_type").addClass('require-field')
                        s.lbl_requiredfield2 = "required field!"
                        break;
                    }
                case "ddl_fundsource":
                    {
                        $("#ddl_fundsource").addClass('require-field')
                        s.lbl_requiredfield3 = "required field!"
                        break;
                    }
                case "ddl_ca_doc_type":
                    {
                        $("#ddl_ca_doc_type").addClass('require-field')
                        s.lbl_requiredfield6 = "required field!"
                        break;
                    }
                case "txtb_cadisb_ofcr":
                    {
                        $("#txtb_cadisb_ofcr").addClass('require-field')
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
                        s.lbl_requiredfield6 = "";
                        s.lbl_requiredfield7 = "";

                        $("#txtb_description").removeClass('require-field')
                        $("#txtb_short_description").removeClass('require-field')
                        $("#ddl_ca_type").removeClass('require-field')
                        $("#ddl_ca_doc_type").removeClass('require-field')
                        $("#ddl_fundsource").removeClass('require-field')
                        $("#txtb_ca_voucher_nbr").removeClass('require-field')
                        $("#txtb_cadisb_ofcr").removeClass('require-field')
                        $("#ddl_employment_type").removeClass('require-field')

                        s.lbl_requiredfieldx6 = "";
                        s.lbl_requiredfield7 = "";
                        break;
                    }

            }
        }
    }
    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_print_row = function (lst)
    {
        s.row_id = lst;
        s.txtb_ctrl_no          = s.datalistgrid[lst].ca_ctrl_nbr;
        s.txtb_ca_voucher_nbr   = s.datalistgrid[lst].ca_voucher_nbr;
        s.txtb_descr            = s.datalistgrid[lst].ca_descr;
        s.txtb_short_descr      = s.datalistgrid[lst].ca_short_descr;
        s.txtb_summary          = s.datalistgrid[lst].summary;
        s.txtb_downloadedby     = s.datalistgrid[lst].downloaded_by_name;
        
        $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
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

    s.btn_show_details_action = function (lst)
    {

        h.post("../cADAFnlAppr/PreviousValuesonPage_cCashAdv",
            {
                par_remittance_year         : $('#ddl_year option:selected').text(),
                par_remittance_month        : $('#ddl_month option:selected').val(),
                par_remittance_month_descr  : $('#ddl_month option:selected').text(),
                par_employment_type         : $('#ddl_ca_doc_type option:selected').val(),
                par_employment_type_descr   : $('#ddl_ca_doc_type option:selected').text(),
                par_ca_voucher_nbr      : s.datalistgrid[lst].ca_voucher_nbr,
                par_show_entries        : s.rowLen,
                par_page_nbr            : $('#datalist_grid').DataTable().page.info().page,
                par_search              : s.search_box,
                par_ca_status           : s.datalistgrid[lst].ca_status,
                par_ca_status_descr     : s.datalistgrid[lst].ca_status_descr,
                par_ctrl_nbr            : s.datalistgrid[lst].ca_ctrl_nbr

            }).then(function (d) {
                var url = "";
                url = "/cADAFnlApprDTL";

                if (url != "") {
                    window.location.href = url;
                }
            })

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


    s.btn_approved = function (row_id)
    {
        $('#txtb_date_downloaded').removeClass("required");
        $('#txtb_time_downloaded').removeClass("required");
        s.lbl_txtb_date_downloaded = "";
        s.lbl_txtb_time_downloaded = "";
        $('#btn_approved').html("<i class='fa fa-spinner fa-spin'></i> APPROVED");
        if ($('#txtb_date_downloaded').val().toString().trim() != ""
            && $('#txtb_time_downloaded').val().toString().trim() != "") {
            swal({
                title: "ARE YOU SURE TO APPROVE THIS?",
                text: "You can no longer edit or delete ADA or CA once it is approved",
                icon: "warning",
                buttons: ["NO", "YES"],
                dangerMode: true,
            }).then(function (willDelete) {
                if (willDelete) {
                    h.post("../cADAFnlAppr/Approved_ADA_OR_CA",
                        {
                            par_ca_ctrl_nbr: s.datalistgrid[row_id].ca_ctrl_nbr,
                            par_ca_status: "F",
                            par_date: $('#txtb_date_downloaded').val().toString().trim(),
                            par_time: $('#txtb_time_downloaded').val().toString().trim()
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                s.datalistgrid[row_id].ca_status = "F";
                                s.datalistgrid[row_id].ca_status_descr = "Authorize by PTO";
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid);
                                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                    if (get_page(s.datalistgrid[row_id].ca_voucher_nbr) == false) {
                                        s.oTable.fnPageChange(x);
                                    }
                                    else {
                                        break;
                                    }
                                }
                                $('#btn_approved').html("<i class='fa fa-check'></i> APPROVED");
                                swal("Successfully Aprroved and Authorized", { icon: "success" });
                                $('#modal_print_option').modal("hide");
                            }
                            else {
                                swal(d.data.message, { icon: "error" });
                            }

                        });
                }
                else
                {
                    $('#btn_approved').html("<i class='fa fa-check'></i> APPROVED");
                }
            });
        }
        else
        {

            if ($('#txtb_date_downloaded').val().toString().trim() == "")
            {
                $('#txtb_date_downloaded').addClass("required");
                s.lbl_txtb_date_downloaded = "Required!";
            }
            if ($('#txtb_time_downloaded').val().toString().trim() == "") {
                $('#txtb_time_downloaded').addClass("required");
                s.lbl_txtb_time_downloaded = "Required!";
            }
            $('#btn_approved').html("<i class='fa fa-check'></i> APPROVE");
        }
        
       
    }

    
    //***************************Functions end*********************************************************//

})

