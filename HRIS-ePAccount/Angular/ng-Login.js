


ng_HRD_App.controller("LoginCtrlr", function ($scope, $http, $filter) {
    var s = $scope
    var h = $http
    s.notfound = false
    function init()
    {
        h.post("../Login/isUserLogin").then(function (d) {
           
            if (d.data.isLogin == 1)
            {
                location.href = "../cMainPage/Index"
            }
        })
    }
    init()
    s.btn_Login_Submit = function()
    {
        
      
        if ((s.txt_username == "" || s.txt_username == null)&& (s.txt_password =="" || s.txt_password == null))
        {
            alert("Field should not be empty");
        }
        else {
            
            h.post("../Login/Login_Validation", { username: s.txt_username, password: s.txt_password }).then(function (d) {
               
               
                if (d.data.success == 1)
                {
                    if (d.data.cred.log_in_flag == "N")
                    {
                        swal("User not authorized for this application", { icon: "error", });
                    }
                    else if (d.data.cred.log_in_flag == "X") {
                        swal("Invalid Password!", { icon: "error", });
                    }
                    else if (d.data.cred.log_in_flag == "I") {

                        swal("Inactive user account!", { icon: "error", });
                    }
                    
                    else if (d.data.cred.log_in_flag == "Y") {

                        if (d.data.cred.change_password == true) {
                            swal({
                                title: "First Login Notification?",
                                text: "This is your first time to login!\n" +
                                       "For security reason we require you to change your password.\n" +
                                       "Would you like to redirect to http://192.168.6.49:18 to change your password?",
                                icon: "warning",
                                buttons: true,
                                dangerMode: true,
                            })
                                 .then(function (willDelete) {
                                     if (willDelete) {
                                         location.href = "http://192.168.6.49:18"
                                     }
                                 });
   
                        }
                        else
                        {
                            location.href = "../cMainPage/Index"
                        }
                       
                    }
                }
                else
                {
                    if (d.data.success == 2)
                    {
                        swal(d.data.message, { icon: "error", });
                       
                    }
                    else
                    {
                        swal("Validation request failed!", { icon: "error", });
                        
                    }
                   
                }
               
                   
                  

            })
        }
       
    }
   
})