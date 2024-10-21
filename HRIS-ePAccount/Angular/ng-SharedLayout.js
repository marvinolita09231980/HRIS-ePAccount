


ng_HRD_App.filter('jsonDate', ['$filter', function ($filter) {
	return function (input, format) {
		return (input) ? $filter('date')(parseInt(input.substr(6)), format) : '';
	};
}]);


ng_HRD_App.controller("SharedLayoutCtrlr", function ($scope, $http, $filter) {
	var s = $scope
	var h = $http
	s.hideThis = false
	s.controller = "Home"
	s.Action1 = "Index"
	s.Action2 = "About"
    s.Action3 = "Contact"
    s.showAddFav = false;
    s.showRemoveFav = false;
    s.isShowFavorites = true
    s.updtax = 0;
    s.rctax = 0;
    s.jotax = 0;
    s.netax = 0;
    s.imgprofile = "";

    s.AllowUserTaxApprove = false

	var group = new Array()
   
	var init = function ()
    {
        

        //CheckSession();
        var url = window.location.href;
        var lastSeven = url.substr(url.length - 7); // => "Tabs1"

        

        h.post("../Menu/GetMenuList").then(function (d) {

            
            s.MenuList = d.data.data
            s.username = d.data.username
            var photo = d.data.photo
            s.imgprofile = photo;





            $('#i_fav').removeClass('text-warning');
            $('#span_fav').removeClass('text-warning');
            if (d.data.already_in_fav == 1) {
                $('#i_fav').addClass('text-warning');
                $('#span_fav').addClass('text-warning');
                s.showRemoveFav = true;
                s.showAddFav = false;
            }

            else {
                $('#i_fav').removeClass('text-warning');
                $('#span_fav').removeClass('text-warning');
                s.showRemoveFav = false;
                s.showAddFav = true;
            }

            if (d.data.expanded != 0) {
                angular.forEach(s.MenuList, function (value) {
                    if (value.url_name == null || value.url_name == "") value.hasUrl = 0
                    else value.hasUrl = 1
                    var exp = d.data.expanded.filter(function (d) {
                        return d == value.id.toString()
                    })
                    if (exp == value.id.toString()) {
                        value.isOpen = 1
                        group.push(value.id);
                    }
                })

            }
            else {
                angular.forEach(s.MenuList, function (value) {
                    if (value.url_name == null || value.url_name == "") value.hasUrl = 0
                    else value.hasUrl = 1
                    value.isOpen = 0;
                })
            }

            

            h.post("../Menu/GetTaxToUpdate").then(function (d) {
                s.AllowUserTaxApprove = d.data.AllowUserTaxApprove
                s.updtax = d.data.updtax
                s.rctax = d.data.rctax
                s.jotax = d.data.jotax
                s.netax = d.data.netax



                if (s.updtax > 0) {
                    $("#updtax_span").removeClass("hidden")
                }
                else {
                    $("#updtax_span").addClass("hidden")
                }

                if (s.rctax > 0) {
                    $("#rctax_span").removeClass("hidden")
                }
                else {
                    $("#rctax_span").addClass("hidden")
                }

                if (s.jotax > 0) {
                    $("#jotax_span").removeClass("hidden")
                }
                else {
                    $("#jotax_span").addClass("hidden")
                }

                if (s.netax > 0) {
                    $("#netax_span").removeClass("hidden")
                }
                else {
                    $("#netax_span").addClass("hidden")
                }
            });
           
        })


        
        if (lastSeven == "Details")
        {
            s.isShowFavorites = false
        }

        else
        {
            s.isShowFavorites = true
        }
	}

    var TAX_UPDATE = function () {
        h.post("../Menu/GetTaxToUpdate").then(function (d) {
            s.AllowUserTaxApprove = d.data.AllowUserTaxApprove
            s.updtax = d.data.updtax
            s.rctax = d.data.rctax
            s.jotax = d.data.jotax
            s.netax = d.data.netax



            if (s.updtax > 0) {
                $("#updtax_span").removeClass("hidden")
            }
            else {
                $("#updtax_span").addClass("hidden")
            }

            if (s.rctax > 0) {
                $("#rctax_span").removeClass("hidden")
            }
            else {
                $("#rctax_span").addClass("hidden")
            }

            if (s.jotax > 0) {
                $("#jotax_span").removeClass("hidden")
            }
            else {
                $("#jotax_span").addClass("hidden")
            }

            if (s.netax > 0) {
                $("#netax_span").removeClass("hidden")
            }
            else {
                $("#netax_span").addClass("hidden")
            }
        });


    }

	init();
	
	function newEl(tag)
	{
		return document.createElement(tag);
	}
	function createImageFromRGBdata(rgbData, width, height)
	{
		var mCanvas = newEl('canvas');
		mCanvas.width = width;
		mCanvas.height = height;
		
		var mContext = mCanvas.getContext('2d');
		var mImgData = mContext.createImageData(width, height);
	
		var srcIndex=0, dstIndex=0, curPixelNum=0;
	
		//for (curPixelNum=0; curPixelNum<width*height;  curPixelNum++)
		//{
		//    mImgData.data[dstIndex] = rgbData[srcIndex];		// r
		//    mImgData.data[dstIndex+1] = rgbData[srcIndex+1];	// g
		//    mImgData.data[dstIndex+2] = rgbData[srcIndex+2];	// b
		//    mImgData.data[dstIndex+3] = 255; // 255 = 0xFF - constant alpha, 100% opaque
		//    srcIndex += 3;
		//    dstIndex += 4;
		//}
		mContext.putImageData(mImgData, 0, 0);
		return mCanvas;
	}


   
    s.addToFavorite = function ()
    {
        h.post("../Menu/AddOrRemoveToFavorites",
            {
                action_mode: "A"
            }).then(function (d) {
                if (d.data.success == 1) {
                    if (d.data.data.result_flag == "Y") {
                        $('#i_fav').removeClass('text-warning');
                        $('#span_fav').removeClass('text-warning');
                        $('#i_fav').addClass('text-warning');
                        $('#span_fav').addClass('text-warning');
                        s.showRemoveFav = true;
                        s.showAddFav = false;
                        swal("Successfully Added!", d.data.data.result_flag_descr, "success");
                        init();
                    }
                    else {
                        swal("ERROR!", d.data.data.result_flag_descr, "error");
                    }
                }
            });
    }



    s.removeToFavorite = function ()
    {
        h.post("../Menu/AddOrRemoveToFavorites",
            {
                action_mode: "R"
            }).then(function (d) {
                if (d.data.success == 1) {
                    if (d.data.data.result_flag == "D") {
                        $('#i_fav').removeClass('text-warning');
                        $('#span_fav').removeClass('text-warning');
                        s.showRemoveFav = false;
                        s.showAddFav = true;
                        swal("Successfully Remove!", d.data.data.result_flag_descr, "success");
                        init();
                    }
                    else {
                        swal("ERROR!", d.data.data.result_flag_descr, "error");
                    }
                }
            });
    }
   
  

	//**************************************//
	//********collapse-expand-menu**********//
	//**************************************// 
	s.collapse = function (val, id, hasUrl)
	{

		if (hasUrl == 1) return
		var menulink = 0
		var menulvl = findMenu(id)[0].menu_level
		if(menulvl == 1)
		{
			group = new Array()
			group.push(id)
		}
		else
		{
			var p = group.filter(function (d)
			{
				return d == id
			})
			if (p == null || p == "") group.push(id)
		   
		}
		angular.forEach(s.MenuList, function (value) {
			var active = group.filter(function (d)
			{
				return d == value.id
			})
			if (value.id == id)
			{

				menulink = value.menu_id_link
				if (value.isOpen == 0)
				{
					value.isOpen = 1
					h.post("../Menu/expandedAdd", { id: id, menulevel: value.menu_level })

					// 2019-12-12 : Update for Menu Active the Selected LI
					$('ul#side-menu li.xx').removeClass('active')
					var parent_li = $('a#' + id).closest('li')
					parent_li.addClass('active')
					// 2019-12-12 : Update for Menu Active the Selected LI

				}
				else {
					value.isOpen = 0
					h.post("../Menu/expandedRemove", { id: id })
				}
			}
			else
			{
				if (active != value.id) value.isOpen = 0
			}
		})
	}
	//***********************Functions end*************************************************************//


	//**************************************//
	//**************find-menu***************//
	//**************************************// 
	var findMenu = function (id)
	{
		return data = s.MenuList.filter(function (d)
		{
			return d.id == id
		})
	}
	//***********************Functions end*************************************************************//



	//**************************************//
	//****************log-out***************//
	//**************************************// 
	 s.logout = function ()
	{
		h.post("../Login/logout").then(function (d)
		{
			if(d.data.success == 1)
			{
				location.href = "../Login/Index"
			}
		})
	}
	//***********************Functions end*************************************************************//


	//**************************************//
	//************location-redirect*********//
	//**************************************// 
	s.setActive = function (lst)
	{
		
		h.post("../Menu/UserAccessOnPage", { list: lst }).then(function (d) {
		   
			if(d.data == "success")
			{
			
				location.href = "../" + lst.url_name

			}
		  
		})
	}

	s.CheckSession = function () {

		h.post("../Login/CheckSessionLogin").then(function (d) {
			if (d.data == "expire") {
				location.href = "../Login/Index"
			}
		})

	}
	function CheckSession() {
	    h.post("../Login/CheckSessionLogin").then(function (d) {
	        if (d.data == "expire") {
	            location.href = "../Login/Index"
	        }
            else if (d.data == "active") {

	            h.post("../Menu/GetMenuList").then(function (d) {
	                s.MenuList = d.data.data
	                s.username = d.data.username
	                var photo = d.data.photo
                    s.imgprofile = photo;

                  

                        
                    
                    $('#i_fav').removeClass('text-warning');
                    $('#span_fav').removeClass('text-warning');
                    if (d.data.already_in_fav == 1) {
                        $('#i_fav').addClass('text-warning');
                        $('#span_fav').addClass('text-warning');
                        s.showRemoveFav = true;
                        s.showAddFav = false;
                    }

                    else {
                        $('#i_fav').removeClass('text-warning');
                        $('#span_fav').removeClass('text-warning');
                        s.showRemoveFav = false;
                        s.showAddFav = true;
                    }

	                if (d.data.expanded != 0) {
                        angular.forEach(s.MenuList, function (value) {
	                        if (value.url_name == null || value.url_name == "") value.hasUrl = 0
	                        else value.hasUrl = 1
	                        var exp = d.data.expanded.filter(function (d) {
	                            return d == value.id.toString()
	                        })
	                        if (exp == value.id.toString()) {
	                            value.isOpen = 1
	                            group.push(value.id);
	                        }
	                    })

	                }
	                else {
	                    angular.forEach(s.MenuList, function (value) {
	                        if (value.url_name == null || value.url_name == "") value.hasUrl = 0
	                        else value.hasUrl = 1
	                        value.isOpen = 0;
	                    })
	                }


	                //// 2019-12-12 : Update for Menu Active the Selected LI
	                //$('ul#side-menu li.xx').removeClass('active')
	                //var parent_li = $('a#' + d.data.expaded[0]).closest('li')
	                //parent_li.addClass('active')
	                //// 2019-12-12 : Update for Menu Active the Selected LI

	            })
	        }
	    })
    }

    //**************************************//
    //    Download Manual for Each Page
    //**************************************// 
    s.dl_manual = function () {
        h.post("../Menu/DL_manual").then(function (d) {
            var current_url = d.data.current_page;
            var value = current_url.substring(current_url.lastIndexOf('/') + 1);
            var value2 = value.split('?')[0]
            var title = value.split("title=").pop();
            var type = value.split("eType=").pop();

            h.post("../Login/SetHistoryPage").then(function (d) {
                if (d.data.path != "") {
                    var downloadPath = "";
                    var win_flag = "";
                    switch (value2) {
                        case "cCashAdv":                                                       //Cash Advance Manual
                            downloadPath = 'ManualDoc/CashAdvanceforPayroll.pdf'
                            break;
                        case "cTransPostPay":                                                  //Transmittal Header Manual
                            downloadPath = 'ManualDoc/PostPayrollVoucher.pdf'
                            break;
                        case "cTransPostPayDetails/":                                           //Transmittal Details Manual
                            downloadPath = 'ManualDoc/PostPayrollDetails.pdf'
                            break;
                        case "cRemitAutoGen":                                                  //Remittance Auto Generation Manual
                            downloadPath = 'ManualDoc/RemittanceGeneration.pdf'
                            break;
                        case "cRemitLedger":                                                   //Remittance Ledger Manual
                            downloadPath = 'ManualDoc/RemittanceLedger.pdf'
                            break;
                        case "cRemitLedgerGSIS":                                               //Remittance GSIS Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerGSIS.pdf'
                            break;
                        case "cRemitLedgerHDMF":                                               //Remittance HDMF Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerHDMF.pdf'
                            break;
                        case "cRemitLedgerPHIC":                                               //Remittance PHIC Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerPHIC.pdf'
                            break;
                        case "cRemitLedgerSSS":                                                //Remittance SSS Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerSSS.pdf'
                            break;
                        case "cRemitLedgerOthers":                                             //Remittance Other Manual
                            if (title == "NICO" || title == "CCMPC") {
                                downloadPath = 'ManualDoc/RemittanceLedgerCCMPC-NICO.pdf'
                            }
                            else if (title == "ONE NETWORK BANK" || title == "PHILAM LIFE" || title == "NHMFC") {
                                downloadPath = 'ManualDoc/RemittanceLedgerPHILAMLIFE-ONENETWORKBANK-NHMFC.pdf'
                            }
                            break;
                        default:                                                                //Default Manual
                            win_flag = "no";
                            swal("For this page at this moment!", { icon: "warning", title: "No Manual Available", });
                            break;
                    }

                    if (win_flag == "") {
                        window.open(downloadPath, '_blank', '');
                    }

                }
            })
        })
    }


    s.goToTaxUpd = function (type) {
        location.href = "../cRECETaxUpd/Index?type=" + type;
    }

	//***********************Functions end*************************************************************//

	
})