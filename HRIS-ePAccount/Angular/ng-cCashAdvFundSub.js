ng_HRD_App.controller("cCashAdvFundSub_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid  = "";
    s.rowLen    = "10";

    function init() {
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cCashAdvFundSub/initializeData").then(function (d) {
            if (d.data.message == "success") {
                userid = d.data.userid;
                s.ca_fund = d.data.caFundLst;
                if (d.data.caFundSubLst.length > 0) {
                    init_table_data(d.data.caFundSubLst);
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
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
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
                    { "mData": "cafund_subcode", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "cafund_subdescr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    { "mData": "cafund_bankname", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "cafund_bankacct", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    //{ "mData": "cafund_code", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
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
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        clearentry();
        s.isEdit = false;
        s.disCode = false;
        s.ModalTitle = "Add New Record";
        btn = document.getElementById('add');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';

        setTimeout(function () {
            h.post("../cCashAdvFundSub/initializeData").then(function (d) {
                if (d.data.message == "success") {
                    s.ca_fund = d.data.caFundLst;
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.caFundSubLst
                    if (d.data.caFundSubLst.length > 0) {
                        s.oTable.fnAddData(d.data.caFundSubLst);
                    }
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
            $('#main_modal').modal("show");
        }, 300);
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            h.post("../cCashAdvFundSub/CheckExist", {
                cafund_subcode: s.txtb_code
            }).then(function (d) {
                if (d.data.message == "success") {
                    swal("Data already exist!", { icon: "warning", });
                    h.post("../cCashAdvFundSub/initializeData").then(function (d) {
                        if (d.data.message == "success") {
                            s.oTable.fnClearTable();
                            s.datalistgrid = d.data.caFundLst
                            if (d.data.caFundLst.length > 0) {
                                s.oTable.fnAddData(d.data.caFundLst);
                            }
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
                else {
                    btn = document.getElementById('addFinal');
                    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
                    var date = new Date();

                    var data = {
                        cafund_subcode          : s.txtb_code
                        , cafund_subdescr       : s.txtb_description
                        , cafund_bankname       : s.txtb_bank_name
                        , cafund_bankacct       : s.txtb_bank_acct
                        , cafund_code           : $('#ddl_ca_fund').val()
                        , created_dttm          : new Date().toLocaleString()
                        , created_user_id       : userid
                        , updated_dttm          : ""
                        , updated_user_id       : ""
                    }
                    console.log(data)
                    h.post("../cCashAdvFundSub/Save", { data: data }).then(function (d) {
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

        if ($('#txtb_code').val() == "") {
            ValidationResultColor("txtb_code", true);
            return_val = false;
        }

        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
            return_val = false;
        }

        if ($('#ddl_ca_fund').val() == "") {
            ValidationResultColor("ddl_ca_fund", true);
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

            $("#txtb_code").removeClass("required");
            $("#lbl_txtb_code_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");

            $("#ddl_ca_fund").removeClass("required");
            $("#lbl_ddl_ca_fund_req").text("");
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
        h.post("../cCashAdvFundSub/CheckExist2", {
            cafund_subcode: s.datalistgrid[row_id].cafund_subcode
        }).then(function (d) {
            if (d.data.message == "success") {
                h.post("../cCashAdvFundSub/GetData", {
                    cafund_subcode: s.datalistgrid[row_id].cafund_subcode
                }).then(function (d) {
                    if (d.data.message == "success") {
                        $('#main_modal').modal("show");
                        s.disCode           = true;
                        s.isEdit            = true;
                        s.ModalTitle        = "Edit Existing Record";
                        s.txtb_code         = d.data.getdata.cafund_subcode
                        s.txtb_description  = d.data.getdata.cafund_subdescr
                        s.txtb_bank_name    = d.data.getdata.cafund_bankname
                        s.txtb_bank_acct    = d.data.getdata.cafund_bankacct
                        s.ddl_ca_fund       = d.data.getdata.cafund_code
                        
                        $('#edit').attr('ngx-data', row_id);
                        var row_edited = $('#edit').attr("ngx-data");
                        s.datalistgrid[row_edited].cafund_subcode   = s.txtb_code;
                        s.datalistgrid[row_edited].cafund_subdescr  = s.txtb_description;
                        s.datalistgrid[row_edited].cafund_bankname  = s.txtb_bank_name;
                        s.datalistgrid[row_edited].cafund_bankacct  = s.txtb_bank_acct;
                    }
                });
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
    }
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields()) {
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';

            var data = {
                cafund_subcode       : s.txtb_code
                , cafund_subdescr   : s.txtb_description
                , cafund_bankname   : s.txtb_bank_name
                , cafund_bankacct   : s.txtb_bank_acct
                , cafund_code       : $('#ddl_ca_fund').val()
                , updated_dttm      : new Date().toLocaleString()
                , updated_user_id   : userid
            }

            h.post("../cCashAdvFundSub/SaveEdit", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].cafund_subcode   = s.txtb_code;
                    s.datalistgrid[row_edited].cafund_subdescr  = s.txtb_description;
                    s.datalistgrid[row_edited].cafund_bankname  = s.txtb_bank_name;
                    s.datalistgrid[row_edited].cafund_bankacct  = s.txtb_bank_acct;

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
                    h.post("../cCashAdvFundSub/Delete", {
                        cafund_subcode: s.datalistgrid[row_index].cafund_subcode
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

    function clearentry() {
        s.txtb_code         = "";
        s.txtb_description  = "";
        s.txtb_bank_name    = "";
        s.txtb_bank_acct    = "";
        s.ddl_ca_fund       = "";

        $("#txtb_code").removeClass("required");
        $("#lbl_txtb_code_req").text("");

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");

        $("#ddl_ca_fund").removeClass("required");
        $("#lbl_ddl_ca_fund_req").text("");
    }

})