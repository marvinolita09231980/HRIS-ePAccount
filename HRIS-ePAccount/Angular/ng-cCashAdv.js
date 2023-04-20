ng_HRD_App.controller("cCashAdv_ctrlr", function ($scope, $compile, Upload, $http, $filter)
{
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
    function init()
    {
        var browserHeight = window.innerHeight
        s.isEdit = false
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cCashAdv/InitializeData", { par_empType: s.employeeddl }).then(function (d) {
            console.log(d.data);
            s.employeeddl       = d.data.empType
            s.ca_type           = d.data.ca_type
            userid              = d.data.userid
            s.fundcsource       = d.data.fundsource

            s.ddl_year          = d.data.prevValues[0] // par_remittance_year
            s.ddl_month         = d.data.prevValues[1] // par_remittance_month
            //s. = d.data.prevValues[2].toString().trim() // par_remittance_month_descr
            s.ddl_employment_type = d.data.prevValues[3] // par_employment_type
            s.rowLen = d.data.prevValues[10] // par_show_entries
            //s. = d.data.prevValues[11].toString().trim() // par_page_nbr
            s.search_box        = d.data.prevValues[12] // par_search
            s.user_department   = d.data.department_code;
            init_table_data([]);

            if (d.data.sp_cashadv_hdr_tbl_list.length > 0) {
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
                pageLength: 5,
                "aaSorting": [],
                columns: [

                    {
                        "mData": "ca_ctrl_nbr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData"     : "ca_voucher_nbr",
                        "mRender"   : function (data, type, full, row)
                        { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData"     : "ca_short_descr",
                        "mRender"   : function (data, type, full, row) { return "<span class='text-left btn-block'>&nbsp;" + data + "</span>" }
                    },
                    {
                        "mData"     : "cafund_descr",
                        "mRender"   : function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData"     : "ca_status_descr",
                        "mRender"   : function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData"     : null,
                        "bSortable" : false,
                        "mRender"   : function (data, type, full, row)
                        {
                            var show_upload         = false;
                            var show_download       = false;
                            var disable_upload      = true;
                            var disable_download    = true;
                            var download_btn        = "";
                            var upload_btn          = "";

                           if (s.user_department == "07")
                            {
                               show_download            = true;
                               if (
                                   //full["ca_status"] == "U"
                                   //||
                                   full["ca_status"] == "D"
                                   || full["ca_status"] == "R") 
                               {
                                   disable_download = false;
                               }
                               download_btn = '<button type="button" class="btn btn-success btn-sm"  ng-disabled="' + disable_download +'"    ng-show="' + show_download + '"      ng-click="btn_upload_action(' + row["row"] + ',\'D\')" data-toggle="tooltip" data-placement="top" title="Download Database File to be upload in we access!">  <i class="fa fa-download"></i></button >';
                            }
                            if (s.user_department == "08")
                            {
                                show_upload = true;
                                if (    full["ca_status"]   == "N"
                                    || full["ca_status"]    == "W"
                                    || full["ca_status"] == "U"
                                    || full["ca_status"] == "T")
                                {
                                    disable_upload = false;
                                }
                                upload_btn = '<button type="button" class="btn btn-success btn-sm"   ng-disabled="' + disable_upload +'"   ng-show="' + show_upload + '"        ng-click="btn_upload_action(' + row["row"] + ',\'U\')" data-toggle="tooltip" data-placement="top" title="Upload Database File">  <i class="fa fa-upload"></i></button >';
                            }

                            var disabled_delete = (full["ca_status"] == "X" || full["ca_status"] == "P" || full["ca_status"] == "R" || full["ca_status"] == "W" || full["ca_status"] == "D" || full["ca_status"] == "F" || full["ca_status"] == "U") ? true : false;
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm"                                       ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" class="btn btn-info btn-sm"                                          ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm"  ng-disabled="' + disabled_delete+'"   ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '<button type="button" class="btn btn-primary btn-sm"                                       ng-click="btn_print_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i></button>' +
                                upload_btn+
                                download_btn +
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


    s.btn_upload_action = function (row_id,action_x)
    {
        s.txtb_cadisb_ofcr          = s.datalistgrid[row_id].cadisb_ofcr;
        s.txtb_ca_ctrl_nbr          = s.datalistgrid[row_id].ca_ctrl_nbr;
        s.txtb_ca_voucher_nbr       = s.datalistgrid[row_id].ca_voucher_nbr;
        s.txtb_short_description    = s.datalistgrid[row_id].ca_short_descr;
        s.txtb_description          = s.datalistgrid[row_id].ca_descr;
        s.ddl_ca_type               = s.datalistgrid[row_id].catype_code;
        s.ddl_fundsource            = s.datalistgrid[row_id].cafund_code;
        s.ddl_ca_doc_type           = s.datalistgrid[row_id].ca_doc_type;

        if (s.datalistgrid[row_id].ca_doc_type == "ADA")
        {
            $('#lbl_ca_ada_nbrX').html("ADA Nbr:")
          
        }
        else {
            $('#lbl_ca_ada_nbrX').html("C.A Voucher Nbr:")
           
        }

        if (action_x == "D")
        {
            s.show_download = true;
           
        }
        else if (action_x == "U")
        {
            s.show_download = false;
        }
        $('#btn_dowload').attr("ng-x-data", row_id);
        s.lbl_required_file         = "";
        s.txtb_database_filename    = "";
        s.txtb_database_filename    = s.datalistgrid[row_id].database_filename;
        $('#txtb_database_filename').removeClass("required");
        s.ModalTitleX = "CASH ADVANCE/ADA CONFIGURATION";
        $('#modal_upload').modal({ keyboard: false, backdrop: "static" });
    }

    s.btn_save_upload = function (par_action)
    {
        var dL_row_id = $('#btn_dowload').attr("ng-x-data");
        if (par_action == "U")
        {
            var fileUpload  = $('#txtb_database_file').get(0);
            var files       = fileUpload.files;
            s.SelectedFiles = files;
            $('#btn_upload').html("<i clas='fa fa-spinner spine'></i> Uploading......");
            if ($('#txtb_database_filename').val().toString().trim() != "" && fileUpload != null)
            {
                s.lbl_required_file = "";
                $('#txtb_database_filename').removeClass("required");
                if ($scope.SelectedFiles && $scope.SelectedFiles.length)
                {
                    Upload.upload({
                        url: '../cCashAdv/Upload/',
                        data: {
                            files: $scope.SelectedFiles
                            , par_ca_ctrl_nbr: s.txtb_ca_ctrl_nbr
                        }
                    }).then(function (response) {
                        //$('#i_save2').addClass("fa-save");
                        //$('#i_save2').removeClass("fa-spinner spin");
                        swal("Database File Successfully Uploaded!", { icon: "success" });
                        s.datalistgrid[dL_row_id].ca_status = "U";
                        s.datalistgrid[dL_row_id].ca_status_descr = "With Database File";
                        $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_ca_ctrl_nbr) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                    }, function (response) {
                        if (response.status > 0) {
                            var errorMsg = response.status + ': ' + response.data;
                            alert(errorMsg);
                            $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
                        }
                    }, function (evt) {
                        //var element = angular.element(document.querySelector('#dvProgress_full'));
                        //$scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        //element.html('<div style="width: ' + $scope.Progress + '%; height:100%;" >' + $scope.Progress + '%</div>');
                    });
                }
                else
                {
                    swal("Nothing change in file, try to browse file to be re-upload", { icon: "warning" });
                    $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
                }

            }
            else {
                s.lbl_required_file = "Required!";
                $('#txtb_database_filename').addClass("required");
                s.datalistgrid[dL_row_id].ca_status = "D";
                $('#btn_upload').html("<i class='fa fa-save'></i> Upload & Save");
            }

        }
        else if (par_action == "D")
        {
           
            if ($('#txtb_database_filename').val().toString().trim() != "")
            {
                if (s.datalistgrid[dL_row_id].downloaded_by != "")
                {
                    swal({
                        title: "WARNING!",
                        text: "The file was already downloaded by: " + s.datalistgrid[dL_row_id].downloaded_by_name + " Last: " + moment(s.datalistgrid[dL_row_id].downloaded_dttm).format('MM-DD-YYYY hh:mm a')+". This might be already uploaded to WE ACCESS PROGRAM. Are you sure to download this file again?",
                        icon: "warning",
                        buttons: ["NO","YES"],
                        dangerMode: true,
                    }).then(function (willDelete) {
                        if (willDelete)
                        {
                            $('#btn_dowload').html("<i clas='fa fa-spinner spine'></i> Downloading..");
                            h.post("../cCashAdv/downloadFile",
                                {
                                    par_ca_ctrl_nbr: s.txtb_ca_ctrl_nbr,
                                    db_filename: $('#txtb_database_filename').val().toString().trim()
                                }).then(function (d) {
                                    if (d.data.message == "success")
                                    {
                                        if (d.data.message == "success")
                                        {
                                           
                                            $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
                                            s.datalistgrid[dL_row_id].ca_status = "D";
                                            s.datalistgrid[dL_row_id].ca_status_descr = "Database File Downloaded";
                                            s.oTable.fnClearTable();
                                            s.oTable.fnAddData(s.datalistgrid);

                                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                                if (get_page(s.txtb_ca_ctrl_nbr) == false)
                                                {
                                                    s.oTable.fnPageChange(x);
                                                }
                                                else {
                                                    break;
                                                }
                                            }
                                            //window.open(d.data.output_path, '', '');
                                            var anchor = document.createElement('a');
                                            anchor.href = d.data.output_path;
                                            anchor.download = d.data.output_path;
                                            document.body.appendChild(anchor);
                                            anchor.click();

                                        }
                                        else {
                                            swal(d.data.export_message.result_msg, { icon: "error" });
                                            $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
                                        }
                                    }
                                    else {
                                        swal(d.data.message, { icon: "error", });
                                        $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
                                    }
                                });
                        }
                    });
                }
                else
                {
                    $('#btn_dowload').html("<i clas='fa fa-spinner spine'></i> Downloading..");
                    h.post("../cCashAdv/downloadFile",
                        {
                            par_ca_ctrl_nbr: s.txtb_ca_ctrl_nbr,
                            db_filename: $('#txtb_database_filename').val().toString().trim()
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                if (d.data.message == "success") {
                                    //window.open(d.data.output_path, '', '');
                                    var anchor      = document.createElement('a');
                                    anchor.href     = d.data.output_path;
                                    anchor.download = d.data.output_path;
                                    document.body.appendChild(anchor);
                                    anchor.click();
                                    $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
                                }
                                else {
                                    swal(d.data.export_message.result_msg, { icon: "error" });
                                    $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
                                }
                            }
                            else {
                                swal(d.data.message, { icon: "error", });
                                $('#btn_dowload').html("<i class='fa fa-download'></i> Download");
                            }
                        });
                }
                
            }
            else
            {
                swal("No database file for this Application", { icon: "warning", });
            }
            
        }
        
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
        h.post("../cCashAdv/RetrieveListGrid",
            {
                par_year: par_year
                , par_month: par_month
                , par_empType: par_empType
                , par_remittancetype: par_remittancetype

            }).then(function (d) {

                if (d.data.sp_cashadv_hdr_tbl_list.length > 0) {
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

    /************************************/
    //***Select-Template-Type-DropDown****//
    //************************************// 
    s.SelectYear = function (par_year, par_month, par_empType, par_remittancetype) {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cCashAdv/RetrieveListGrid",
            {
                par_year: par_year
                , par_month: par_month
                , par_empType: par_empType
                , par_remittancetype: par_remittancetype

            }).then(function (d) {

                if (d.data.sp_cashadv_hdr_tbl_list.length > 0) {
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
    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    s.SelectEmploymentType = function (empType)
    {
        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
        h.post("../cCashAdv/RetrieveListGrid",
            {
                par_year: s.ddl_year
                , par_month: s.ddl_month
                , par_empType: empType

            }).then(function (d) {
                if (d.data.sp_cashadv_hdr_tbl_list.length > 0) {
                    s.datalistgrid = d.data.sp_cashadv_hdr_tbl_list;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.sp_cashadv_hdr_tbl_list)
                }
                else {
                    s.oTable.fnClearTable();
                }
                $("#loading_data").modal("hide");
            })

        h.post("../cCashAdv/SelectEmploymentType", { par_empType: empType }).then(function (d)
        {
            FieldValidationColorChanged(false, "ALL");
                s.remittancetype = d.data.sp_remittance
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
    //*************************************//
    //***********Open-Add-Modal************//
    //*************************************// 
    s.btn_add = function () {
        if (isdataValidated) {
            clearentry()
            var last_ctrl_no    = "";
            var last_4_char     = "";
            var new_ctrl_no     = "";
            var prev_mons       = "";
            s.action_status = "A"
            var date_now    = new Date();
            var dn_year     = date_now.getFullYear();
            var dn_mons     = date_now.getMonth() + 1;
            s.txtb_disabler = false;
            //console.log(s.ddl_year)
            //console.log(s.ddl_month)
            //console.log(s.ddl_employment_type)
            h.post("../cCashAdv/GetLasCode", {
                par_pay_year        : s.ddl_year
                , par_pay_month     : s.ddl_month
                //, par_empl_type     : s.ddl_employment_type
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    last_ctrl_no        = d.data.ids;
                    last_4_char         = last_ctrl_no.slice(last_ctrl_no.length - 4);
                    last_4_char         = parseInt(last_4_char) + 1;
                    last_4_char         = lead_zero2(last_4_char);
                    new_ctrl_no         = last_4_char;
                    prev_mons           = extractText(last_ctrl_no, "-");
                    s.txtb_ca_ctrl_nbr  = s.ddl_year + "-" + s.ddl_month + "-" + new_ctrl_no;
                }
                else
                {
                    new_ctrl_no         = "0001";
                    s.txtb_ca_ctrl_nbr = s.ddl_year + "-" + s.ddl_month + "-" + new_ctrl_no;
                }
                btn = document.getElementById('add');
                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
                s.isEdit      = false
                s.ishow = true;
                s.isupdate = false;
                FieldValidationColorChanged(false, "ALL");

                if ($("#ddl_employment_type").val() == "")
                {
                    $("#ddl_employment_type").addClass('require-field')
                    s.lbl_requiredfieldx6 = "required field!"
                    btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
                }
                else
                {
                    setTimeout(function () {
                        btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';

                        s.txtb_year = $('#ddl_year option:selected').text();
                        s.txtb_month = $('#ddl_month option:selected').text();
                        s.txtb_cadisb_ofcr = "PROV'L GOVT. OF DAVAO DE ORO";

                        
                        s.ModalTitle = "Add New Record"

                        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
                    }, 300);
                }
            });
        }
        
    }

    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function clearentry() {

        s.txtb_ca_ctrl_nbr          = "";
        s.txtb_ca_voucher_nbr       = "";
        s.txtb_description          = "";
        s.txtb_short_description    = "";
        s.ddl_fundsource            = "";
        s.ddl_ca_type               = "";
        FieldValidationColorChanged(false, "ALL");
    }
    //***************************bt*********//
    //***Save-Job-Description-Function****//
    //************************************// 
    s.btn_save_add = function () 
    {
        
        if (isdataValidated())
        {
            
            btn = document.getElementById('addFinal');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
            var data =
            {
                cadisb_ofcr      : s.txtb_cadisb_ofcr,
                ca_ctrl_nbr      : s.txtb_ca_ctrl_nbr,
                payroll_year     : s.ddl_year,
                payroll_month    : s.ddl_month,
                ca_voucher_nbr   : s.txtb_ca_voucher_nbr,
                employment_type  : s.ddl_employment_type,
                ca_short_descr   : s.txtb_short_description,
                ca_descr         : s.txtb_description,
                catype_code      : s.ddl_ca_type,
                cafund_code      : s.ddl_fundsource,
                ca_status        : "N",
                created_dttm     : s.hidden_created_dtttm,
                updated_dttm     : s.hidden_updated_dttm,
                ca_status_descr  : "New not Release CA",
                catype_descr     : $('#ddl_ca_type option:selected').html(),
                cafund_descr     : $('#ddl_fundsource option:selected').html(),
                ca_doc_type      : s.ddl_ca_doc_type
            }
            //console.log(s.txtb_cadisb_ofcr)
            h.post("../cCashAdv/VoucherNBRValidation", {
                par_ca_ctrl_nbr     : s.txtb_ca_ctrl_nbr,
                par_ca_voucher_nbr  : s.txtb_ca_voucher_nbr,
                action_status       : "A"
            }).then(function (A)
            {
                
                if (A.data.var_exist.return_status == "Y" && s.txtb_ca_voucher_nbr.trim() != "")
                {
                    FieldValidationColorChanged(true, "txtb_ca_voucher_nbr")
                    s.lbl_requiredfield1 = A.data.var_exist.return_status_message
                    validatedSaved = false;
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                }
                else
                {
                    h.post("../cCashAdv/SaveFromDatabase",
                        {
                            par_ca_ctrl_nbr     : s.txtb_ca_ctrl_nbr,
                            par_payroll_year    : s.ddl_year,
                            par_payroll_month   : s.ddl_month,
                            par_ca_voucher_nbr  : s.txtb_ca_voucher_nbr,
                            par_employment_type : s.ddl_employment_type,
                            par_ca_short_descr  : s.txtb_short_description,
                            par_ca_descr        : s.txtb_description,
                            par_catype_code     : s.ddl_ca_type,
                            par_cafund_code     : s.ddl_fundsource,
                            par_cadisb_ofcr     : s.txtb_cadisb_ofcr,
                            par_ca_doc_type     : s.ddl_ca_doc_type,
                            par_ca_status       : "N",
                            par_created_dttm    : s.hidden_created_dtttm,
                            par_updated_dttm    : s.hidden_updated_dttm
                        }).then(function (d) {
                            if (d.data.success == 1)
                            {
                                //assign the updated ca_ctrl_nbr Updated By: Joseph M. Tombo Jr 1-27-2020
                                data.ca_ctrl_nbr = d.data.tbl.ca_ctrl_nbr;
                                //----------------------------------
                                s.datalistgrid.push(data);
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid);

                                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                    if (get_page(s.txtb_ca_ctrl_nbr) == false) {
                                        s.oTable.fnPageChange(x);
                                    }
                                    else {
                                        break;
                                    }
                                }


                                swal("Successfully Added !", "New record successfully added!", "success");
                                $("#main_modal").modal("hide");
                                btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                            }
                            else {
                                swal("Saving error!", "Data not save, Duplicate C.A Voucher Number", "error");
                                btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                            }
                        })
                }
            });
           
        }
        
    }


    s.ddl_doc_type_change = function ()
    {
        s.txtb_nbr_able = true;
        if (s.ddl_ca_doc_type.trim() == "ADA")
        {
            s.txtb_nbr_able = false;
            $('#lbl_ca_ada_nbr').html("ADA Nbr:");

            if (s.ddl_fundsource.trim() != "")
            {
                h.post("../cCashAdv/generateADA_NBR", {
                    ca_fund_code: s.ddl_fundsource.trim(),
                    ca_ctrl_nbr : s.txtb_ca_ctrl_nbr,
                    ca_action   : s.action_status
                }).then(function (d)
                {
                    s.txtb_ca_voucher_nbr = d.data.ada_nbr
                });
            }
        }
        else
        {
            s.txtb_ca_voucher_nbr = "";
            $('#lbl_ca_ada_nbr').html("C.A Voucher Nbr:");
        }
    }

    //**************************************//
    //***Update-Database-Function****//
    //**************************************//
    s.btn_save_update = function ()
    {
        var row_id = $('#btn_save_update').attr('ngx-data');
        btn = document.getElementById('btn_save_update');
        if (isdataValidated())
        {
            h.post("../cCashAdv/VoucherNBRValidation", {
                par_ca_ctrl_nbr     : s.txtb_ca_ctrl_nbr,
                par_ca_voucher_nbr  : s.txtb_ca_voucher_nbr,
                action_status       : "U"
            }).then(function (A) {

                if (A.data.var_exist.return_status == "Y" && s.txtb_ca_voucher_nbr.trim() != "") {
                    FieldValidationColorChanged(true, "txtb_ca_voucher_nbr")
                    s.lbl_requiredfield1 = A.data.var_exist.return_status_message
                    validatedSaved = false;
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                }
                else
                {
                    h.post("../cCashAdv/UpdateFromDatabase", {

                        par_ca_ctrl_nbr     : s.txtb_ca_ctrl_nbr,
                        par_ca_voucher_nbr  : s.txtb_ca_voucher_nbr,
                        par_payroll_year    : s.ddl_year,
                        par_payroll_month   : s.ddl_month,
                        par_employment_type : s.ddl_employment_type,
                        par_ca_short_descr  : s.txtb_short_description,
                        par_ca_descr        : s.txtb_description,
                        par_catype_code     : s.ddl_ca_type,
                        par_cafund_code     : s.ddl_fundsource,
                        par_cadisb_ofcr     : s.txtb_cadisb_ofcr,
                        par_ca_doc_type     : s.ddl_ca_doc_type,
                        par_created_dttm    : s.hidden_created_dtttm,
                        par_updated_dttm    : s.hidden_updated_dttm,

                    }).then(function (d) {
                        if (d.data.message == "success") {

                            updateListGrid(row_id);
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);

                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_ca_ctrl_nbr) == false) {
                                    s.oTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }

                            swal("Successfully Updated!", "Existing record successfully updated!", "success")
                            $("#main_modal").modal("hide");
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                        }
                        else {
                            swal("Saving error!", "Data not save, Duplicate C.A Voucher Number", "error");
                        }

                    })
                }
            })
           
        }
    }
    //*************************************/
    //***Clear-All-Textbox-And-Values****//
    //**************************************// 
    function updateListGrid(row_id)
    {
        s.datalistgrid[row_id].cadisb_ofcr       = s.txtb_cadisb_ofcr,
        s.datalistgrid[row_id].ca_ctrl_nbr       = s.txtb_ca_ctrl_nbr,
        s.datalistgrid[row_id].ca_voucher_nbr    =  s.txtb_ca_voucher_nbr,
        s.datalistgrid[row_id].payroll_year      =  s.ddl_year,
        s.datalistgrid[row_id].payroll_month     =  s.ddl_month,
        s.datalistgrid[row_id].employment_type   =  s.ddl_employment_type,
        s.datalistgrid[row_id].ca_short_descr    =  s.txtb_short_description,
        s.datalistgrid[row_id].ca_descr          =  s.txtb_description,
        s.datalistgrid[row_id].catype_code       =  s.ddl_ca_type,
        s.datalistgrid[row_id].cafund_code       =  s.ddl_fundsource,
        s.datalistgrid[row_id].ca_doc_type       =  s.ddl_ca_doc_type,
        s.datalistgrid[row_id].created_dttm      =  s.hidden_created_dtttm,
        s.datalistgrid[row_id].updated_dttm      =  s.hidden_updated_dttm,
        s.datalistgrid[row_id].created_user_id   = "";
        s.datalistgrid[row_id].updated_user_id   = "";
        
        s.oTable.fnClearTable();
        s.oTable.fnAddData(s.datalistgrid);
    }
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_edit_action = function (id_ss) {
        s.isEdit = true
        clearentry()
        s.txtb_cadisb_ofcr          = s.datalistgrid[id_ss].cadisb_ofcr;
        s.txtb_ca_ctrl_nbr          = s.datalistgrid[id_ss].ca_ctrl_nbr;
        s.txtb_ca_voucher_nbr       = s.datalistgrid[id_ss].ca_voucher_nbr;
        s.txtb_short_description    = s.datalistgrid[id_ss].ca_short_descr;
        s.txtb_description          = s.datalistgrid[id_ss].ca_descr;
        s.ddl_ca_type               = s.datalistgrid[id_ss].catype_code;
        s.ddl_fundsource            = s.datalistgrid[id_ss].cafund_code;
        s.ddl_ca_doc_type           = s.datalistgrid[id_ss].ca_doc_type;

        s.txtb_database_filename_uploaded   = s.datalistgrid[id_ss].database_filename;
        s.ishow                     = false;
        s.isupdate                  = true;
        s.action_status             = "E"
        if (
            s.datalistgrid[id_ss].ca_status == "V" ||
            s.datalistgrid[id_ss].ca_status == "Y" ||
            s.datalistgrid[id_ss].ca_status == "W" ||
            s.datalistgrid[id_ss].ca_status == "P" ||
            s.datalistgrid[id_ss].ca_status == "U" ||
            s.datalistgrid[id_ss].ca_status == "D" ||
            s.datalistgrid[id_ss].ca_status == "F" ||
            s.datalistgrid[id_ss].ca_status == "R")
        {
            s.ishow     = false;
            s.isupdate  = false;
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

    s.txtb_behavior = function (par_action, par_row_data)
    {
        if (par_action == "EDIT")
        {
            if (par_row_data["ca_status"] == "N" || par_row_data["ca_status"] == "T")
            {
                s.txtb_disabler = false;
            }
            else
            {
                s.txtb_disabler = true;
            }
        }
    }
    //*************************************/
    //***Delete-Job-Description-Function****//
    //**************************************// 
    s.btn_del_row = function (id_ss) {

        if (s.datalistgrid[id_ss].ca_status == "T")
        {
            swal({
                title: "Are you sure to Void this C.A?",
                text: "Once you void this CA, this is concedered as historical data.",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then(function (willDelete)
            {
                if (willDelete)
                {
                    h.post("../cCashAdv/DeleteFromDatabase",
                        {
                            par_ca_ctrl_nbr     : s.datalistgrid[id_ss].ca_ctrl_nbr,
                            par_ca_voucher_nbr  : s.datalistgrid[id_ss].ca_voucher_nbr,
                            par_payroll_year    : s.datalistgrid[id_ss].payroll_year,
                            par_action          : "void"

                        }).then(function (d) {
                            if (d.data.message == "success") {
                                s.datalistgrid[id_ss].ca_status = "X";
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
                        h.post("../cCashAdv/DeleteFromDatabase",
                            {
                                par_ca_ctrl_nbr     : s.datalistgrid[id_ss].ca_ctrl_nbr,
                                par_ca_voucher_nbr  : s.datalistgrid[id_ss].ca_voucher_nbr,
                                par_payroll_year    : s.datalistgrid[id_ss].payroll_year,
                                par_action          : "delete"

                            }).then(function (d) {
                                if (d.data.message == "success") {

                                    s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].ca_ctrl_nbr, "ca_ctrl_nbr");

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
        if (s.txtb_short_description.trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_short_description")
            validatedSaved = false;
        }
        if (s.txtb_description.trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_description")
            validatedSaved = false;
        }
        if (s.ddl_ca_type.trim() == "")
        {
            FieldValidationColorChanged(true, "ddl_ca_type")
            validatedSaved = false;
        }
        if (s.ddl_fundsource.trim() == "")
        {
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
    function FieldValidationColorChanged(pMode, pObjectName)
    {

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
        s.txtb_ctrl_no = s.datalistgrid[lst].ca_ctrl_nbr
        s.txtb_ca_voucher_nbr = s.datalistgrid[lst].ca_voucher_nbr
        s.txtb_descr = s.datalistgrid[lst].ca_descr
        $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        //if ($('#ddl_employment_type option:selected').val() == "CE")
        //{
        //    s.txtb_ctrl_no         = s.datalistgrid[lst].ca_ctrl_nbr
        //    s.txtb_ca_voucher_nbr  = s.datalistgrid[lst].ca_voucher_nbr
        //    s.txtb_descr           = s.datalistgrid[lst].ca_descr
        //    $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        //}
        //else
        //{
        //    h.post("../cCashAdv/PreviousValuesonPage_cCashAdv",
        //        {
        //            par_remittance_year: $('#ddl_year option:selected').text(),
        //            par_remittance_month: $('#ddl_month option:selected').val(),
        //            par_remittance_month_descr: $('#ddl_month option:selected').text(),
        //            par_employment_type: $('#ddl_employment_type option:selected').val(),
        //            par_employment_type_descr: $('#ddl_employment_type option:selected').text(),
        //            par_ca_voucher_nbr: s.datalistgrid[lst].ca_voucher_nbr,
        //            par_show_entries: s.rowLen,
        //            par_page_nbr: $('#datalist_grid').DataTable().page.info().page,
        //            par_search: s.search_box,


        //        }).then(function (d) {
        //            var controller = "Reports"
        //            var action = "Index"
        //            var ReportName = "CrystalReport"
        //            var SaveName = "Crystal_Report"
        //            var ReportType = "inline"
        //            var ReportPath = "~/Reports/cryCashAdv/cryCashAdv.rpt"
        //            var sp = "sp_cashadv_rep,p_ca_voucher_nbr," + s.datalistgrid[lst].ca_ctrl_nbr

        //            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //                + "&SaveName=" + SaveName
        //                + "&ReportType=" + ReportType
        //                + "&ReportPath=" + ReportPath
        //                + "&Sp=" + sp
        //        })
        //}
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
    s.btn_show_details_action = function(lst)
    {
       
        h.post("../cCashAdv/PreviousValuesonPage_cCashAdv",
            {       
                par_remittance_year             : $('#ddl_year option:selected').text(),
                par_remittance_month            : $('#ddl_month option:selected').val(),
                par_remittance_month_descr      : $('#ddl_month option:selected').text(),
                par_employment_type             : $('#ddl_employment_type option:selected').val(),
                par_employment_type_descr       : $('#ddl_employment_type option:selected').text(),
                par_ca_voucher_nbr              : s.datalistgrid[lst].ca_voucher_nbr,
                par_show_entries                : s.rowLen,
                par_page_nbr                    : $('#datalist_grid').DataTable().page.info().page,
                par_search                      : s.search_box,
                par_ca_status                   : s.datalistgrid[lst].ca_status,
                par_ca_status_descr             : s.datalistgrid[lst].ca_status_descr,
                par_ctrl_nbr                    : s.datalistgrid[lst].ca_ctrl_nbr
                
            }).then(function (d)
            {
                var url = "";
                url = "/cCashAdvDTL";
                
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


    s.btn_print_click = function ()
    {
        h.post("../cCashAdv/PreviousValuesonPage_cCashAdv",
            {
                par_remittance_year         : $('#ddl_year option:selected').text(),
                par_remittance_month        : $('#ddl_month option:selected').val(),
                par_remittance_month_descr  : $('#ddl_month option:selected').text(),
                par_employment_type         : $('#ddl_employment_type option:selected').val(),
                par_employment_type_descr   : $('#ddl_employment_type option:selected').text(),
                par_ca_voucher_nbr          : s.txtb_ca_voucher_nbr,
                par_show_entries            : s.rowLen,
                par_page_nbr                : $('#datalist_grid').DataTable().page.info().page,
                par_search                  : s.search_box,

            }).then(function (d)
            {
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName = "Crystal_Report"
                var ReportType = "inline"
                var ReportPath      = ""
                var sp              = ""

                if (s.ddl_reports == "01")
                {
                    ReportPath = "~/Reports/cryCashAdv/cryCashAdv.rpt"
                    sp = "sp_cashadv_rep,p_ca_voucher_nbr," + s.txtb_ctrl_no
                }
                else if (s.ddl_reports == "02") {
                    ReportPath = "~/Reports/cryCashAdv/cryAppendix31.rpt"
                    sp = "sp_cashadv_rep,p_ca_voucher_nbr," + s.txtb_ctrl_no
                }
                else if (s.ddl_reports == "03") {
                    ReportPath = "~/Reports/cryCashAdv/cryAppendix36.rpt"
                    sp = "sp_cashadv_ada_rep,p_ca_voucher_nbr," + s.txtb_ctrl_no
                }
                else
                {
                    ReportPath  = "~/Reports/cryCashAdv_BrkDwn/cryCashAdv_BrkDwn.rpt"
                    sp = "sp_cashadv_rep2,p_ca_voucher_nbr," + s.txtb_ctrl_no
                }

                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp
                
            })

        
        
    }


    //***************************Functions end*********************************************************//

})

