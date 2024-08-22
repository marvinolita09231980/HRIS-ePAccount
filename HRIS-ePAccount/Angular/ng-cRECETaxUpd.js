

ng_HRD_App.controller("cRECETaxUpd_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    s.year = []



    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }
    

    RetrieveYear()

    s.changeTab = function (tab) {
        if (tab == 1) {
            $("#rc_controls").removeClass("hidden")
            $("#jo_controls").addClass("hidden")

            $("#table_search_rc").removeClass("hidden")
            $("#table_search_jo").addClass("hidden")
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }
        else {
            $("#jo_controls").removeClass("hidden")
            $("#rc_controls").addClass("hidden")

            $("#table_search_jo").removeClass("hidden")
            $("#table_search_rc").addClass("hidden")
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }
    }


    var init_table_data_rc = function (par_data) {
        s.datalistgrid_rc = par_data;

        s.datalistgrid_rc_Table = $('#datalist_grid_rc').dataTable(
            {

                data: s.datalistgrid_rc,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "empl_id", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "employee_name", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "tax_rate", "mRender": function (data, type, full, row) {
                            
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "wtax_amt", "mRender": function (data, type, full, row) {
                            
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "payroll_year", "mRender": function (data, type, full, row) {
                            
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "effective_date", "mRender": function (data, type, full, row) {
                           
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "rcrd_status", "mRender": function (data, type, full, row) {
                            
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "rcrd_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center>'
                                + '<div class="btn-group tooltip-demo">'
                                //+ '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="View Details" ng-click="btn_show_action(' + row["row"] + ')" > '
                                //+ '<i class="fa fa-plus"></i>' + '</button>'
                              
                                //+ '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Approve Reject" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                //+ '<i class="fa fa-edit"></i>' + '</button>'
                                + '<button type="button" class="btn btn-success btn-sm action" data-toggle="tooltip" data-placement="left" title="Approve" ng-click="btn_approve_rc(' + row["row"] + ')" > '
                                + '<i class="fa fa-check"></i>' + '</button>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Reject" ng-click="btn_reject_rc(' + row["row"] + ')" > '
                                + '<i class="fa fa-times"></i>' + '</button>'
                                + '</div>'

                                + '</center> '
                         
                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.datalistgrid_rc_Table.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }


    var init_table_data_jo = function (par_data) {
        s.datalistgrid_jo = par_data;

        s.datalistgrid_jo_Table = $('#datalist_grid_jo').dataTable(
            {

                data: s.datalistgrid_jo,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "empl_id", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "employee_name", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "basic_tax_rate", "mRender": function (data, type, full, row) {
                            
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "tax_perc", "mRender": function (data, type, full, row) {
                          
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "vat_perc", "mRender": function (data, type, full, row) {
                           
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "effective_date", "mRender": function (data, type, full, row) {
                            
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "rcrd_status", "mRender": function (data, type, full, row) {
                            
                            return "<div class='btn-block text-right'>" + data + "</div>";
                        }
                    },
                    {
                        "mData": "rcrd_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center>'
                                    + '<div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="View Details" ng-click="btn_approve_jo(' + row["row"] + ')" > '
                                    + '<i class="fa fa-check"></i>' + '</button>'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Approve or Reject" ng-click="btn_reject_jo(' + row["row"] + ')" > '
                                    + '<i class="fa fa-times"></i>' + '</button>'
                                    + '</div>'
                                + '</center> '

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.datalistgrid_jo_Table.fnSort([[1, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    init_table_data_rc([]);
    init_table_data_jo([]);

    init();

    function init() {
        cs.loading("show")
        var CurrentYear = new Date().getFullYear()
        h.post("../cRECETaxUpd/Initialize").then(function (d) {
            if (d.data.icon == "success") {
                if (d.data.employment_type == "RE") {
                    s.changeTab(1);
                    $("#ddlemploymenttype").val("RE")
                    s.datalistgrid_rc = d.data.rc_tax_list.refreshTable("datalist_grid_rc", "")
                }
                else if (d.data.employment_type == "JO") {
                    s.changeTab(2);
                    $("#ddl_status").val("N")
                    $("#ddl_year").val(CurrentYear)
                    s.datalistgrid_jo = d.data.jo_tax_list.refreshTable("datalist_grid_jo", "")
                }
              
            }
            cs.loading("hide")
        })
    }


    s.SelectEmploymentType = function (type) {
        cs.loading("show")
        h.post("../cRECETaxUpd/sp_empltaxwithheld_tbl_for_apprvl", { employment_type: type}).then(function (d) {
            if (d.data.icon == "success") {
                s.datalistgrid_rc = d.data.sp_empltaxwithheld_tbl_for_apprvl.refreshTable("datalist_grid_rc","")
            }
            cs.loading("hide")
        })
    }


    s.getJOData = function() {

        var year = $("#ddl_year").val() == undefined ? "" : $("#ddl_year").val();
        var status = $("#ddl_status").val() == undefined ? "" : $("#ddl_status").val();
        cs.loading("show")
        h.post("../cRECETaxUpd/sp_payrollemployee_tax_tbl_for_apprvl", { year: year, status: status}).then(function (d) {
            if (d.data.icon == "success") {
                s.datalistgrid_jo = d.data.sp_payrollemployee_tax_tbl_for_apprvl.refreshTable("datalist_grid_jo", "")
            }
            cs.loading("hide")
        })
    }


    s.btn_approve_rc = function (row) {
        var data = s.datalistgrid_rc[row]
        var empl_id                 = data.empl_id;
        var effective_date          = data.effective_date;
        var payroll_year            = data.payroll_year;
        var employment_type = $("#ddlemploymenttype").val();
        var status = data.rcrd_status;
        
        swal({
            title: "Approve this Record?",
            text: "Are you sure to approve this record?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (approve) {

            if (approve) {
                cs.loading("show")
                h.post("../cRECETaxUpd/approved_reject_tax_rc", {
                      empl_id           : empl_id         
                    , effective_date    : effective_date  
                    , payroll_year      : payroll_year    
                    , employment_type   : employment_type 
                    , status            : "A"
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        s.datalistgrid_rc = d.data.sp_empltaxwithheld_tbl_for_apprvl.refreshTable("datalist_grid_rc", "" + row)
                    }
                    cs.loading("hide")
                    swal({title:"Success",text:d.data.message,icon:d.data.icon})
                })



            }

        })
    }



    s.btn_reject_rc = function (row) {
        var data = s.datalistgrid_rc[row]
        var empl_id = data.empl_id;
        var effective_date = data.effective_date;
        var payroll_year = data.payroll_year;
        var employment_type = $("#ddlemploymenttype").val();
        var status = data.rcrd_status;


        swal({
            title: "Reject this Record?",
            text: "Are you sure to reject this record?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (reject) {

            if (reject) {
                cs.loading("show")
                h.post("../cRECETaxUpd/approved_reject_tax_rc", {
                    empl_id: empl_id
                    , effective_date: effective_date
                    , payroll_year: payroll_year
                    , employment_type: employment_type
                    , status: "R"
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        s.datalistgrid_rc = d.data.sp_empltaxwithheld_tbl_for_apprvl.refreshTable("datalist_grid_rc", "" + row)
                    }
                    cs.loading("hide")
                    swal({ title: "Success", text: d.data.message, icon: d.data.icon })
                })



            }

        })

    }

    s.btn_approve_jo = function (row) {
        var data = s.datalistgrid_jo[row]
        
        var empl_id = data.empl_id;
        var effective_date = data.effective_date;
        var payroll_year = data.payroll_year;
        var employment_type = $("#ddlemploymenttype").val();
        var status = "";
        var swaltitle = ""
        var swaltext = ""
        if (data.rcrd_status == "N") {
            status = "A";
            swaltitle = "Approve this Record?";
            swaltext ="Are you sure to approve this record?"
        }
        else if (data.rcrd_status == "A") {
            status = "N";
            swaltitle = "Set to New this Record?";
            swaltext = "Are you sure to set New this record?"
        }
        else if (data.rcrd_status == "R") {
            status = "A";
            swaltitle = "Approve this Record?";
            swaltext = "Are you sure to approve this record?"
        }
        swal({
            title: swaltitle,
            text: swaltext,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (approve) {
            if (approve) {
                cs.loading("show")
                h.post("../cRECETaxUpd/approved_reject_tax_jo", {
                    empl_id: empl_id
                    , effective_date: effective_date
                    , payroll_year: payroll_year
                    , employment_type: employment_type
                    , nstatus: status
                    , status: data.rcrd_status
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        s.datalistgrid_jo = d.data.sp_payrollemployee_tax_tbl_for_apprvl.refreshTable("datalist_grid_jo", "" + row)
                    }
                    cs.loading("hide")
                    swal({ title: "Success", text: d.data.message, icon: d.data.icon })
                })
            }
        })
    }

    s.btn_reject_jo = function (row) {
        var data = s.datalistgrid_jo[row]

        var empl_id = data.empl_id;
        var effective_date = data.effective_date;
        var payroll_year = data.payroll_year;
        var employment_type = $("#ddlemploymenttype").val();
        var status = "";
        var swaltitle = ""
        var swaltext = ""
        if (data.rcrd_status == "N") {
            status = "R";
            swaltitle = "Reject this Record?";
            swaltext = "Are you sure to reject this record?"
        }
        else if (data.rcrd_status == "A") {
            status = "R";
            swaltitle = "Reject this Record?";
            swaltext = "Are you sure to reject this record?"
        }
        else if (data.rcrd_status == "R") {
            status = "N";
            swaltitle = "Set to new this Record?";
            swaltext = "Are you sure to set New this record?"
        }
        swal({
            title: swaltitle,
            text: swaltext,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (reject) {
            if (reject) {
                cs.loading("show")
                h.post("../cRECETaxUpd/approved_reject_tax_jo", {
                    empl_id: empl_id
                    , effective_date: effective_date
                    , payroll_year: payroll_year
                    , employment_type: employment_type
                    , nstatus: status
                    , status: data.rcrd_status
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        s.datalistgrid_jo = d.data.sp_payrollemployee_tax_tbl_for_apprvl.refreshTable("datalist_grid_jo", "" + row)
                    }
                    cs.loading("hide")
                    swal({ title: "Success", text: d.data.message, icon: d.data.icon })
                })
            }
        })
    }

    s.ApproveAllTaxUpdRC = function () {
        var employment_type = $("#ddlemploymenttype").val()
        swal({
            title:"Approve All",
            text: "Approve all tax update",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (approve) {
            if (approve) {
                cs.loading("show")
                h.post("../cRECETaxUpd/ApproveAllTaxUpdRC", {
                    data: s.datalistgrid_rc 
                    , employment_type: employment_type
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        s.datalistgrid_rc = d.data.sp_empltaxwithheld_tbl_for_apprvl.refreshTable("datalist_grid_rc", "")
                    }
                    cs.loading("hide")
                    swal({ title: "Success", text: d.data.message, icon: d.data.icon })
                })
            }
        })
    }


    s.ApproveAllTaxUpdJO = function () {
        var ddlyear = $("#ddl_year").val()
        var ddlstatus = $("#ddl_status").val()

        swal({
            title: "Approve All",
            text: "Approve all tax update",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (approve) {
            if (approve) {
                cs.loading("show")
                h.post("../cRECETaxUpd/ApproveAllTaxUpdJO", {
                      data: s.datalistgrid_jo
                    , year: ddlyear
                    , status: ddlstatus
                }).then(function (d) {

                    if (d.data.icon == "success") {
                        s.datalistgrid_jo = d.data.sp_payrollemployee_tax_tbl_for_apprvl.refreshTable("datalist_grid_jo", "")
                    }
                    cs.loading("hide")
                    swal({ title: "Success", text: d.data.message, icon: d.data.icon })
                })
            }
        })
    }
})