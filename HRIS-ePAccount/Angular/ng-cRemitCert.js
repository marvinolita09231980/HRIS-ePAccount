ng_HRD_App.controller("cRemitCert_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid      = "";
    s.rowLen        = "5";
    s.tempName      = "";
    s.temprTypeCd   = "";
    s.year          = [];
    s.prevValues    = null;

    function init() {
        $("#modal_generating_remittance").modal();
        RetrieveYear();
        s.ddl_year              = new Date().getFullYear().toString();
        s.currentMonth          = new Date().getMonth() + 1;
        s.ddl_month             = s.currentMonth.toString();

        s.defaultYear           = new Date().getFullYear().toString();
        s.defaultMonth          = new Date().getMonth() + 1;
        s.defaultDate           = new Date().getDate().toString();
        s.defaultDatePickerVal  = s.defaultYear + '-' + s.defaultMonth.toString() + '-' + s.defaultDate;
        s.lastday               = s.defaultYear + '-' + s.defaultMonth.toString() + '-' +new Date(s.defaultYear, s.defaultMonth, 0).getDate();
        

        s.txtb_or_date          = s.defaultDatePickerVal 
        s.txtb_period_from      = s.defaultDatePickerVal 
        s.txtb_period_to        = s.lastday 
        s.isEdit    = false
        s.isDisAble = false
        
        
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cRemitCert/initializeData",
            {
                p_remitType_code    : s.ddl_remit_type,
                p_empl_type         : $("#ddl_empl_type").val(),
                p_dept_code         : $("#ddl_departments").val(),
                p_letter            : $("#ddl_letter").val(),
            }).then(function (d) {
                
                if (d.data.listgrid.length > 0) {
                    init_table_data(d.data.listgrid);
                }
                else {
                    init_table_data([]);
                }
                $("#modal_generating_remittance").modal("hide");

                userid          = d.data.userid;
                s.departments   = d.data.department_list;
                s.emplType      = d.data.emplType;
                s.prevValues    = d.data.prevValues;
                showdetailsInfo("datalist_grid");
                
                if (d.data.prevValues.length != 0) {
                    s.ddl_remit_type    = d.data.prevValues[0];
                    s.ddl_empl_type     = d.data.prevValues[1];
                    s.ddl_departments   = d.data.prevValues[2];
                    s.ddl_letter        = d.data.prevValues[6];

                }
                else {
                    s.ddl_remit_type    = "";
                    s.ddl_empl_type     = "";
                    s.ddl_departments   = "";
                    s.ddl_letter        = "A";
                }
                s.remittanceType = d.data.remittancetypelist;


                s.ddl_remit_type = "01"
                $("#ddl_remit_type").val("01")

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                s.allowAdd = d.data.allowAdd
                s.allowPrint = d.data.allowPrint
                s.allowView = d.data.allowView
                
                if (s.allowAdd == "1") {
                    s.ShowAdd = true
                }
                else {
                    s.ShowAdd = false
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
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                "order": [[1, "asc"]],
                columns: [
                    {   "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }},
                    {   "mData": "employee_name" },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" ng-show="ShowPrint" class="btn btn-primary btn-sm" ng-click="btn_print_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print" ><i class="fa fa-print"></i></button>' +
                                '</div></center>';

                        }
                    }

                    ,{
                        "mData": "employee_name",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block' style='display: none; border:none;'>" + data.substring(0, 1) + "</span>"
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

    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data);
            prev_year++;
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
    s.setNumOfRow = function (value, table) {
        try {
            $("#" + table).DataTable().page.len(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }

    s.Filters = function (value) {
        //$("#modal_generating_remittance").modal();

        $("#datalist_grid").DataTable().column(3).search(value).draw();
        $("#datalist_grid").DataTable().column(3).search(value).draw();
        //h.post("../cRemitCert/Filter",
        //    {
        //        p_remit_type    : $("#ddl_remit_type").val(),
        //        p_empl_type     : $("#ddl_empl_type").val(),
        //        p_dept          : s.ddl_departments,
        //        p_letter        : $("#ddl_letter").val(),
        //    }).then(function (d) {
                
        //        s.oTable.fnClearTable();
        //        s.datalistgrid = d.data.listgridFiltered
        //        if (d.data.listgridFiltered.length > 0) {
        //            s.oTable.fnAddData(d.data.listgridFiltered);
        //        }

        //        $("#modal_generating_remittance").modal("hide");
        //    });
    }

    s.btn_print_row = function (row_id) {
        var data            = s.datalistgrid[row_id];
        s.isEdit            = true;
        s.ModalTitle        = "Print Record";
        s.txtb_remitType    = $("#ddl_remit_type option:selected").html();
        s.txtb_empl_name    = data.employee_name;
        s.txtb_id_nbr       = data.empl_id;

        $('#print_modal').modal("show");
    }

    s.btn_print_click = function () {
        //$("#print_modal").modal("hide");
        btn = document.getElementById('printFinal');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> PRINT';
        s.ModalTitle = "Remittance Certification Print Record";

        h.post("../cRemitCert/PreviousValuesonPage_cRemitCert",
            {
                par_remittancetype_code     : $("#ddl_remit_type").val(),
                par_empl_type               : s.ddl_empl_type,
                par_dept_code               : s.ddl_departments,
                par_empl_id                 : s.txtb_id_nbr,
                par_empl_name               : s.txtb_empl_name,
                par_letter                  : $("#ddl_letter").val(),
                par_remit_desc              : $("#ddl_remit_type option:selected").html(),
                par_empl_type_decr          : $("#ddl_empl_type option:selected").html(),
                par_dept_descr              : $("#ddl_departments option:selected").html(),
                par_show_entries            : s.rowLen,
                par_page_nbr                : $('#datalist_grid').DataTable().page.info().page
            }).then(function (d) {
                var remittance  = $("#ddl_remit_type").val();
                var empl_id     = s.txtb_id_nbr;
                var period_from = $("#txtb_period_from").val()
                var period_to   = $("#txtb_period_to").val()

                var ReportPath  = "~/Reports/cryRemittanceCert/cryRemittanceCERT.rpt"
                var controller  = "Reports"
                var action      = "Index"
                var ReportName  = "cryRemittanceCERT"
                var SaveName    = "Crystal_Report"
                var ReportType  = "inline"
                var sp          = "sp_remittance_cert_rep,p_remittancetype_code," + remittance + ",p_empl_id," + empl_id + ",p_period_from," + period_from + ",p_period_to," + period_to;

                location.href   = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp

                btn.innerHTML = '<i class="fa fa-print"> </i> PRINT';
                $('#print_modal').modal("hide");
            });
    }

    s.btn_show_details_action = function (row_id) {

        h.post("../cRemitCert/PreviousValuesonPage_cRemitCert",
            {
                par_remittancetype_code     : $("#ddl_remit_type").val(),
                par_empl_type               : s.ddl_empl_type,
                par_dept_code               : s.ddl_departments,
                par_empl_id                 : s.datalistgrid[row_id].empl_id,
                par_empl_name               : s.datalistgrid[row_id].employee_name,
                par_letter                  : $("#ddl_letter").val(),
                par_remit_desc              : $("#ddl_remit_type option:selected").html(),
                par_empl_type_decr          : $("#ddl_empl_type option:selected").html(),
                par_dept_descr              : $("#ddl_departments option:selected").html(),
                par_show_entries            : s.rowLen,
                par_page_nbr                : $('#datalist_grid').DataTable().page.info().page
            }).then(function (d) {
                var url = "/cRemitCertDetails";
                if (url != "") {
                    window.location.href = url;
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    
})

