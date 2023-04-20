ng_HRD_App.controller("cPASystemSetup_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid = "";
    s.rowLen = "10";

    function init() {
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cPASystemSetup/initializeData").then(function (d) {
            if (d.data.message == "success") {
                userid = d.data.userid;
              
                if (d.data.sysLst.length > 0) {
                    init_table_data(d.data.sysLst);
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
                    { "mData": "syssetup_type_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "syssetup_type_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "mData": "rcvd_flag",
                        "mRender": function (data, type, full, row) {
                            if (full["rcvd_flag"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["rcvd_flag"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }
                        }
                    },
                    {
                        "mData": "rcvd_audit_flag",
                        "mRender": function (data, type, full, row) {
                            if (full["rcvd_audit_flag"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["rcvd_audit_flag"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }

                        }
                    },
                    {
                        "mData": "audit_flag",
                        "mRender": function (data, type, full, row) {
                            if (full["audit_flag"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["audit_flag"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }

                        }
                    },
                    {
                        "mData": "rcvd_post_flag",
                        "mRender": function (data, type, full, row) {
                            if (full["rcvd_post_flag"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["rcvd_post_flag"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }

                        }
                    },
                    {
                        "mData": "post_flag",
                        "mRender": function (data, type, full, row) {
                            if (full["post_flag"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["post_flag"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }

                        }
                    },
                    {
                        "mData": "release_flag",
                        "mRender": function (data, type, full, row) {
                            if (full["release_flag"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["release_flag"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }

                        }
                    },
                    {
                        "mData": "unpost_flag",
                        "mRender": function (data, type, full, row) {
                            if (full["unpost_flag"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["unpost_flag"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }

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
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        clearentry();
        s.isEdit = false;
        s.ModalTitle = "Add New Record";
        btn = document.getElementById('add');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';

        setTimeout(function () {
            h.post("../cPASystemSetup/GetLasCode").then(function (d) {
                if (d.data.message == "success") {
                    var nextCode = "";
                    var ids = d.data.ids;
                    
                    for (var i = 1; i < 100; i++) {
                        if (i != ids[i - 1]) {
                            nextCode = i;
                            break;
                        }
                    }
                    s.lastCode = nextCode;
                    if (s.lastCode > 0 && s.lastCode < 10) {
                        s.lastCodeStr = "0" + s.lastCode;
                    }
                    else {
                        s.lastCodeStr = s.lastCode;
                    }
                    s.txtb_code = s.lastCodeStr;
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
            
            h.post("../cPASystemSetup/CheckExist", {
                syssetup_type_code: s.txtb_code
            }).then(function (d) {
                if (d.data.message == "success") {
                    btn = document.getElementById('addFinal');
                    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
                    var receive         = (s.chckbx_receive == true) ? (receive = 1) : (receive = 0);
                    var receive_audit   = (s.chckbx_receive_audit == true) ? (receive_audit = 1) : (receive_audit = 0);
                    var payroll_audit   = (s.chckbx_payroll_audit == true) ? (payroll_audit = 1) : (payroll_audit = 0);
                    var receive_post    = (s.chckbx_receive_post == true) ? (receive_post = 1) : (receive_post = 0);
                    var payroll_post    = (s.chckbx_payroll_post == true) ? (payroll_post = 1) : (payroll_post = 0);
                    var release         = (s.chckbx_release == true) ? (release = 1) : (release = 0);
                    var unpost          = (s.chckbx_unpost == true) ? (unpost = 1) : (unpost = 0);
                    
                    var data = {
                        syssetup_type_code      : s.txtb_code
                        , syssetup_type_descr   : s.txtb_description
                        , rcvd_flag             : receive
                        , rcvd_audit_flag       : receive_audit
                        , audit_flag            : payroll_audit
                        , rcvd_post_flag        : receive_post
                        , post_flag             : payroll_post
                        , release_flag          : release
                        , unpost_flag           : unpost
                    }
                    
                    h.post("../cPASystemSetup/SaveSystemSetUp", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
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
                        }
                    })
                }
                else {
                    swal("Data with " + s.txtb_code + " code already added by other user/s!", { icon: "warning", });
                    $('#main_modal').modal("hide");
                    h.post("../cPASystemSetup/initializeData").then(function (d) {
                        if (d.data.message == "success") {
                            s.datalistgrid = d.data.sysLst;
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                        }
                    });
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

        if ($('#txtb_abbrv').val() == "") {
            ValidationResultColor("txtb_abbrv", true);
            return_val = false;
        }
        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
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

            $("#txtb_abbrv").removeClass("required");
            $("#lbl_txtb_abbrv_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");
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
        h.post("../cPASystemSetup/CheckExist2", {
            astype_code: s.datalistgrid[row_id].astype_code
        }).then(function (d) {
            if (d.data.message == "success") {
                clearentry();
                $('#main_modal').modal("show");

                s.isEdit = true;
                s.ModalTitle = "Edit Existing Record";
                s.txtb_code = s.datalistgrid[row_id].syssetup_type_code;
                s.txtb_description = s.datalistgrid[row_id].syssetup_type_descr;

                var receive         = (s.datalistgrid[row_id].rcvd_flag == true) ? (s.chckbx_receive = true) : (s.chckbx_receive = false);
                var receive_audit   = (s.datalistgrid[row_id].rcvd_audit_flag == true) ? (s.chckbx_receive_audit = true) : (s.chckbx_receive_audit = false);
                var payroll_audit   = (s.datalistgrid[row_id].audit_flag == true) ? (s.chckbx_payroll_audit = true) : (s.chckbx_payroll_audit = false);
                var receive_post    = (s.datalistgrid[row_id].rcvd_post_flag == true) ? (s.chckbx_receive_post = true) : (s.chckbx_receive_post = false);
                var payroll_post    = (s.datalistgrid[row_id].post_flag == true) ? (s.chckbx_payroll_post = true) : (s.chckbx_payroll_post = false);
                var release         = (s.datalistgrid[row_id].release_flag == true) ? (s.chckbx_release = true) : (s.chckbx_release = false);
                var unpost          = (s.datalistgrid[row_id].unpost_flag == true) ? (s.chckbx_unpost = true) : (s.chckbx_unpost = false);
                
                $('#edit').attr('ngx-data', row_id);
                var row_edited = $('#edit').attr("ngx-data");
                s.datalistgrid[row_edited].syssetup_type_code   = s.txtb_code;
                s.datalistgrid[row_edited].syssetup_type_descr  = s.txtb_description;
                s.datalistgrid[row_edited].rcvd_flag            = s.chckbx_receive;
                s.datalistgrid[row_edited].rcvd_audit_flag      = s.chckbx_receive_audit;
                s.datalistgrid[row_edited].audit_flag           = s.chckbx_payroll_audit;
                s.datalistgrid[row_edited].rcvd_post_flag       = s.chckbx_receive_post;
                s.datalistgrid[row_edited].post_flag            = s.chckbx_payroll_post;
                s.datalistgrid[row_edited].release_flag         = s.chckbx_release;
                s.datalistgrid[row_edited].unpost_flag          = s.chckbx_unpost;
                
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
            var receive         = (s.chckbx_receive == true) ? (receive = 1) : (receive = 0);
            var receive_audit   = (s.chckbx_receive_audit == true) ? (receive_audit = 1) : (receive_audit = 0);
            var payroll_audit   = (s.chckbx_payroll_audit == true) ? (payroll_audit = 1) : (payroll_audit = 0);
            var receive_post    = (s.chckbx_receive_post == true) ? (receive_post = 1) : (receive_post = 0);
            var payroll_post    = (s.chckbx_payroll_post == true) ? (payroll_post = 1) : (payroll_post = 0);
            var release         = (s.chckbx_release == true) ? (release = 1) : (release = 0);
            var unpost          = (s.chckbx_unpost == true) ? (unpost = 1) : (unpost = 0);

            var data = {
                syssetup_type_code      : s.txtb_code
                , syssetup_type_descr   : s.txtb_description
                , rcvd_flag             : receive
                , rcvd_audit_flag       : receive_audit
                , audit_flag            : payroll_audit
                , rcvd_post_flag        : receive_post
                , post_flag             : payroll_post
                , release_flag          : release
                , unpost_flag           : unpost
            }
           
            h.post("../cPASystemSetup/SaveEditSystemSetUp", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].syssetup_type_code   = s.txtb_code;
                    s.datalistgrid[row_edited].syssetup_type_descr       = s.txtb_description;
                    s.datalistgrid[row_edited].rcvd_flag            = s.chckbx_receive;
                    s.datalistgrid[row_edited].rcvd_audit_flag      = s.chckbx_receive_audit;
                    s.datalistgrid[row_edited].audit_flag           = s.chckbx_payroll_audit;
                    s.datalistgrid[row_edited].rcvd_post_flag       = s.chckbx_receive_post;
                    s.datalistgrid[row_edited].post_flag            = s.chckbx_payroll_post;
                    s.datalistgrid[row_edited].release_flag         = s.chckbx_release;
                    s.datalistgrid[row_edited].unpost_flag          = s.chckbx_unpost;

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
                    h.post("../cPASystemSetup/DeleteSystemSetUp", {
                        syssetup_type_code: s.datalistgrid[row_index].syssetup_type_code
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
        s.txtb_code             = "";
        s.txtb_description      = "";
        s.chckbx_receive        = false;
        s.chckbx_receive_audit  = false;
        s.chckbx_payroll_audit  = false;
        s.chckbx_receive_post   = false;
        s.chckbx_payroll_post   = false;
        s.chckbx_release        = false;
        s.chckbx_unpost         = false;

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");
    }

})