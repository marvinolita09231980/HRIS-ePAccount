ng_HRD_App.controller("cApplicationToken_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var cs = commonScript

    var userid = "";
    var excelExportServer = "";
    s.rowLen = "10";


    function init() {
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cApplicationToken/initializeData").then(function (d) {
            excelExportServer = d.data.excelExportServer;
            $("#modal_generating_remittance").modal("hide");
        });
    }

    init()

    s.GenerateToken = function() {
        cs.loading("show")
        h.post("../cApplicationToken/GenerateToken").then(function (d) {
            
            var data_token = d.data.token
          
            
            h.post(excelExportServer + "/api/remittance/add-token", 
                data_token
            , { responseType: 'arraybuffer' }
            ).then(function (response) {
                // Check the response data
                console.log(response.data)
                if (response.data) {
                    
                    h.post("../cApplicationToken/SaveHRISToken", { token: data_token}).then(function (f) {
                        if (f.data.icon == "success") {
                            swal("Token generated successfully", { icon: f.data.icon })
                        }
                        else {
                            swal(d.data.message, { icon:f.data.icon })
                        }
                        cs.loading("hide")
                    });
                } else {
                    console.error('The response data is empty or undefined.');
                    cs.loading("hide")
                }
            }).catch(function (error) {
                console.error('There was a problem with the POST request:', error);
                cs.loading("hide")
            });
        });
    }
})