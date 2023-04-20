using HRIS_eHRD.Models;
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cMainPageController : Controller
    {
        // GET: cMainPage
        //
        //Dev_Version_Name dvn = new Dev_Version_Name();
        public ActionResult Index()
        {

            if (Session["TEMP_user_id"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            else
            {
                Session["user_id"] = Session["TEMP_user_id"].ToString();
            }

            return View();
        }
    }
}