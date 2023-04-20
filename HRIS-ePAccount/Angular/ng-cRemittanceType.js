ng_HRD_App.controller("cRemittanceType_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid = "";
    s.rowLen = "10";
    s.travelTypeLst = null;

    function init() {
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cRemittanceType/initializeData", {
            par_empType: $("#ddl_empl_type").val()
        }).then(function (d) {
            userid = d.data.userid;
            s.emplType = d.data.empType;
            
            if (d.data.remittanceLst.length > 0) {
                init_table_data(d.data.remittanceLst);
            }
            else {
                init_table_data([]);
            }
            showdetailsInfo("datalist_grid");
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
            $("#modal_generating_remittance").modal("hide");
        });
    }
    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "remittancetype_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "remittancetype_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "mData": "remittance_id1",
                        "mRender": function (data, type, full, row)
                        {
                            if (full["remittance_id1"] == null) {
                                data = " ";
                            }
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }
    function showdetailsInfo(table_id) {
        var info = $('#' + table_id).DataTable().page.info();
        $("div.toolbar").html("<b>Showing Page: " + (info.page + 1) + "</b> of <b>" + info.pages + " <i>pages</i></b>");
        $("div.toolbar").css("padding-top", "9px");
    }
    s.search_in_list = function (value, table) {
        try {
            $("#" + table).DataTable().search(value).draw();
        }
        catch (err) {
            alert(err.message)
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
    s.Filters = function () {
        h.post("../cRemittanceType/Filter",{ par_empType: $("#ddl_empl_type").val() }).then(function (d) {
               
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.filterResult
                if (d.data.filterResult.length > 0) {
                    s.oTable.fnAddData(d.data.filterResult);
                }
            });
        if ($("#ddl_empl_type").val() != "") {
            $("#ddl_empl_type").removeClass("required");
            $("#lbl_ddl_empl_type_req").text("");
        }
    }
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        if (ValidateFields2()) {
            clearentry();
            s.isEdit = false;
            s.disCode = false;
            s.ModalTitle = "Add New Record";
            btn = document.getElementById('add');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
            s.txtb_empl_type = $("#ddl_empl_type option:selected").html();

            setTimeout(function () {
                btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
                $('#main_modal').modal("show");
            }, 300);
        }
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        var code = "";
        if (s.txtb_code > 0 && s.txtb_code < 10) {
            if (s.txtb_code.charAt(0) == "0") {
                code = s.txtb_code;
            }
            else {
                code = "0" + s.txtb_code;
            }
        }
        else {
            code = s.txtb_code;
        }
        if (ValidateFields()) {
            h.post("../cRemittanceType/CheckExist", {
                remittancetype_code : code
                , employment_type   : $("#ddl_empl_type").val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    swal("Data already added by other user/s!", { icon: "warning", });
                    $('#main_modal').modal("hide");
                    h.post("../cRemittanceType/Filter",
                        {
                            par_empType: $("#ddl_empl_type").val()
                        }).then(function (d) {
                          
                            s.oTable.fnClearTable();
                            s.datalistgrid = d.data.filterResult
                            if (d.data.filterResult.length > 0) {
                                s.oTable.fnAddData(d.data.filterResult);
                            }
                        });
                }
                else {
                    btn = document.getElementById('addFinal');
                    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
                    var data = {
                        remittancetype_code             : code
                        , employment_type               : $("#ddl_empl_type").val()
                        , remittancetype_descr          : s.txtb_description
                        , remittancetype_other_descr    : $("#txtb_other_descr").val()
                        , remittancetype_short_descr    : $("#txtb_short_descr").val()
                        , remittance_id1                : $("#txtb_emplr_id1").val()
                        , remittance_id2                : $("#txtb_emplr_id2").val()
                        , remittance_sig1_name          : $("#txtb_prep_by1").val()
                        , remittance_sig1_desg          : $("#txtb_desg1").val()
                        , remittance_sig2_name          : $("#txtb_prep_by2").val()
                        , remittance_sig2_desg          : $("#txtb_desg2").val()
                        , remittance_sig3_name          : $("#txtb_prep_by3").val()
                        , remittance_sig3_desg          : $("#txtb_desg3").val()
                        , remittance_sig_acct_name      : $("#txtb_acct_name").val()
                        , remittance_sig_acct_desg      : $("#txtb_acct_desg").val()
                    }

                   
                    h.post("../cRemittanceType/SaveRemitType", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            s.datalistgrid.push(data)
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);
                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_code) == false) {
                                    s.oTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                            $('#main_modal').modal("hide");
                            swal("Your record has been saved!", { icon: "success", });
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    })
                }
            });
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        //if ($('#txtb_short_descr').val() == "") {
        //    ValidationResultColor("txtb_short_descr", true);
        //    return_val = false;
        //}
        //if ($('#txtb_other_descr').val() == "") {
        //    ValidationResultColor("txtb_other_descr", true);
        //    return_val = false;
        //}
        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
            return_val = false;
        }
        //if ($('#txtb_emplr_id1').val() == "") {
        //    ValidationResultColor("txtb_emplr_id1", true);
        //    return_val = false;
        //}
        //if ($('#txtb_emplr_id2').val() == "") {
        //    ValidationResultColor("txtb_emplr_id2", true);
        //    return_val = false;
        //}
        //if ($('#txtb_prep_by1').val() == "") {
        //    ValidationResultColor("txtb_prep_by1", true);
        //    return_val = false;
        //}
        //if ($('#txtb_desg1').val() == "") {
        //    ValidationResultColor("txtb_desg1", true);
        //    return_val = false;
        //}
        //if ($('#txtb_prep_by2').val() == "") {
        //    ValidationResultColor("txtb_prep_by2", true);
        //    return_val = false;
        //}
        //if ($('#txtb_desg2').val() == "") {
        //    ValidationResultColor("txtb_desg2", true);
        //    return_val = false;
        //}
        //if ($('#txtb_prep_by3').val() == "") {
        //    ValidationResultColor("txtb_prep_by3", true);
        //    return_val = false;
        //}
        //if ($('#txtb_desg3').val() == "") {
        //    ValidationResultColor("txtb_desg3", true);
        //    return_val = false;
        //}
        if ($('#txtb_acct_name').val() == "") {
            ValidationResultColor("txtb_acct_name", true);
            return_val = false;
        }
        //if ($('#txtb_acct_desg').val() == "") {
        //    ValidationResultColor("txtb_acct_desg", true);
        //    return_val = false;
        //}

        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            //$("#txtb_short_descr").removeClass("required");
            //$("#lbl_txtb_short_descr_req").text("");

            //$("#txtb_other_descr").removeClass("required");
            //$("#lbl_txtb_other_descr_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");

            //$("#txtb_emplr_id1").removeClass("required");
            //$("#lbl_txtb_emplr_id1_req").text("");

            //$("#txtb_emplr_id2").removeClass("required");
            //$("#lbl_txtb_emplr_id2_req").text("");

            //$("#txtb_prep_by1").removeClass("required");
            //$("#lbl_txtb_prep_by1_req").text("");

            //$("#txtb_prep_by2").removeClass("required");
            //$("#lbl_txtb_prep_by2_req").text("");

            //$("#txtb_prep_by3").removeClass("required");
            //$("#lbl_txtb_prep_by3_req").text("");

            $("#txtb_acct_name").removeClass("required");
            $("#lbl_txtb_acct_name_req").text("");

            //$("#txtb_acct_desg").removeClass("required");
            //$("#lbl_txtb_acct_desg_req").text("");

        }
    }
    function ValidateFields2() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#ddl_empl_type').val() == "") {
            ValidationResultColor("ddl_empl_type", true);
            return_val = false;
        }

        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_empl_type").removeClass("required");
            $("#lbl_ddl_empl_type_req").text("");

        }
    }

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
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        clearentry();
        $('#main_modal').modal("show");
        s.isEdit = true;
        s.disCode = true;
        s.ModalTitle = "Edit Existing Record";

        h.post("../cRemittanceType/GetData", {
            remittancetype_code     : s.datalistgrid[row_id].remittancetype_code
            , employment_type       : $("#ddl_empl_type").val()
        }).then(function (d) {
            if (d.data.message == "success") {
              

                s.txtb_code         = d.data.getdata.remittancetype_code;
                s.txtb_empl_type    = $("#ddl_empl_type option:selected").html();
                s.txtb_short_descr  = d.data.getdata.remittancetype_short_descr;
                s.txtb_other_descr  = d.data.getdata.remittancetype_other_descr;

                s.txtb_description  = d.data.getdata.remittancetype_descr;
                s.txtb_emplr_id1    = d.data.getdata.remittance_id1;
                s.txtb_emplr_id2    = d.data.getdata.remittance_id2;
                s.txtb_prep_by1     = d.data.getdata.remittance_sig1_name;
                s.txtb_desg1        = d.data.getdata.remittance_sig1_desg;
                s.txtb_prep_by2     = d.data.getdata.remittance_sig2_name;
                s.txtb_desg2        = d.data.getdata.remittance_sig2_desg;
                s.txtb_prep_by3     = d.data.getdata.remittance_sig3_name;
                s.txtb_desg3        = d.data.getdata.remittance_sig3_desg;
                s.txtb_acct_name    = d.data.getdata.remittance_sig_acct_name;
                s.txtb_acct_desg    = d.data.getdata.remittance_sig_acct_desg;
            }
            else {
                swal("Data already deleted by other user/s!", { icon: "warning", });
                s.datalistgrid = s.datalistgrid.delete(row_id);
                s.oTable.fnClearTable();
                if (s.datalistgrid.length != 0) {
                    s.oTable.fnAddData(s.datalistgrid);
                }
            }
        });

        $('#edit').attr('ngx-data', row_id);
        var row_edited = $('#edit').attr("ngx-data");
        s.datalistgrid[row_edited].remittancetype_code  = s.txtb_code 
        s.datalistgrid[row_edited].remittancetype_descr = s.txtb_description
        s.datalistgrid[row_edited].remittance_id1       = s.txtb_emplr_id1
    }
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields()) {
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';

            var data = {
                remittancetype_code             : s.txtb_code
                , employment_type               : $("#ddl_empl_type").val()
                , remittancetype_descr          : s.txtb_description
                , remittancetype_other_descr    : $("#txtb_other_descr").val()
                , remittancetype_short_descr    : $("#txtb_short_descr").val()
                , remittance_id1                : $("#txtb_emplr_id1").val()
                , remittance_id2                : $("#txtb_emplr_id2").val()
                , remittance_sig1_name          : $("#txtb_prep_by1").val()
                , remittance_sig1_desg          : $("#txtb_desg1").val()
                , remittance_sig2_name          : $("#txtb_prep_by2").val()
                , remittance_sig2_desg          : $("#txtb_desg2").val()
                , remittance_sig3_name          : $("#txtb_prep_by3").val()
                , remittance_sig3_desg          : $("#txtb_desg3").val()
                , remittance_sig_acct_name      : $("#txtb_acct_name").val()
                , remittance_sig_acct_desg      : $("#txtb_acct_desg").val()
            }

           
            h.post("../cRemittanceType/SaveEditRemitType", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].remittancetype_code  = data.remittancetype_code;
                    s.datalistgrid[row_edited].remittancetype_descr = data.remittancetype_descr;
                    s.datalistgrid[row_edited].remittance_id1       = data.remittance_id1;

                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(s.txtb_code) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                    $('#main_modal').modal("hide");
                    swal("Your record successfully updated!", { icon: "success", });
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index) {
      
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cRemittanceType/DeleteRemitType", {
                        remittancetype_code : s.datalistgrid[row_index].remittancetype_code
                        , employment_type   : $("#ddl_empl_type").val()
                    }).then(function (d) {
                        if (d.data.message == "success") {

                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            swal("Data already deleted by other user/s!", { icon: "warning", });
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                        }
                    })
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    s.validate = function () {
        if ($("#txtb_short_descr").val() != "") {
            $("#txtb_short_descr").removeClass("required");
            $("#lbl_txtb_short_descr_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");

            $("#txtb_acct_name").removeClass("required");
            $("#lbl_txtb_acct_name_req").text("");

            $("#txtb_acct_desg").removeClass("required");
            $("#lbl_txtb_acct_desg_req").text("");
        }

    }

    s.validateCode = function () {
        s.txtb_description = "";
        var code = "";
        var description = "";
        if (s.txtb_code > 0 && s.txtb_code < 10) {
            if (s.txtb_code.charAt(0) == "0") {
                code = s.txtb_code;
              
            }
            else {
                code = "0" + s.txtb_code;
               
            }
        }
        else {
            code = s.txtb_code;
        }
        h.post("../cRemittanceType/GetDescr", {
            p_type_code: code
        }).then(function (d) {
            if (d.data.message == "success") {
                if (d.data.description.length != 0) {
                    description = d.data.description[0].remittancetype_descr;
                }
                else {
                    description = "";
                }
                s.txtb_description = description;
               
            }
        });
    }

    function clearentry() {
        s.txtb_code          = "";
        s.txtb_empl_type     = "";
        s.txtb_short_descr   = "";
        s.txtb_other_descr   = "";
        s.txtb_description   = "";
        s.txtb_emplr_id1     = "";
        s.txtb_emplr_id2     = "";
        s.txtb_prep_by1      = "";
        s.txtb_desg1         = "";
        s.txtb_prep_by2      = "";
        s.txtb_desg2         = "";
        s.txtb_prep_by3      = "";
        s.txtb_desg3         = "";
        s.txtb_acct_name     = "";
        s.txtb_acct_desg     = "";

        $("#txtb_short_descr").removeClass("required");
        $("#lbl_txtb_short_descr_req").text("");

        $("#txtb_acct_name").removeClass("required");
        $("#lbl_txtb_acct_name_req").text("");

        $("#txtb_acct_desg").removeClass("required");
        $("#lbl_txtb_acct_desg_req").text("");
    }

})