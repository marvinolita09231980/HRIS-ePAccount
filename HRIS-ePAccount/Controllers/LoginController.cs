using HRIS_Common;
using HRIS_eHRD.Models;
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class LoginController : Controller
    {

        // GET: Login
        CommonDB Cmn = new CommonDB();
        Dev_Version_Name dvn = new Dev_Version_Name();
       
        // GET: Login
        public ActionResult Index()
        {
            string excelExportServer = System.Configuration.ConfigurationManager.AppSettings["ExcelExportServerIP"];
            using (var db = new HRIS_ACTEntities())
            {
                dvn.DVName = "(" + db.Database.Connection.DataSource.ToString().Split('\\')[db.Database.Connection.DataSource.ToString().Split('\\').Length - 1] + ")";
            }
            if (Session["user_id"] != null)
            {
                return RedirectToAction("Index", "cMainPage");
            }
            else
            {
                return View(dvn);
            }
        }

        //public ActionResult GetUserIsLogin()
        //{
        //    if (Session["user_id"] != null)
        //    {
        //        return Json(new { data = Session["user_id"], success = 1 }, JsonRequestBehavior.AllowGet);
        //    }
        //    else
        //    {
        //        return Json(new { data = 0, success = 0 }, JsonRequestBehavior.AllowGet);
        //    }
        //}



        public ActionResult isUserLogin()
        {
            if (Session["user_id"] != null)
            {
                var user = Session["user_id"];
                return Json(new { user = user, isLogin = 1 }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { user = "", isLogin = 0 }, JsonRequestBehavior.AllowGet);
            }
        }

        string GetMacAddress(string ipAddress)
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "arp",
                    Arguments = "-a " + ipAddress,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };
            process.Start();

            string output = process.StandardOutput.ReadToEnd();
            process.WaitForExit();

            string[] lines = output.Split('\n');
            foreach (var line in lines)
            {
                if (line.Contains(ipAddress))
                {
                    var parts = line.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length >= 2)
                    {
                        return parts[1]; // MAC address
                    }
                }
            }
            return "MAC Address Not Found";
        }

        public ActionResult Login_Validation(string username, string password)
        {
            var message = "";
            var success = 0;
            object cred = new object();
            try
            {
                using (var db = new HRIS_ACTEntities())
                {
                    var data = db.sp_user_login_ACT(username.Trim(), Cmn.EncryptString(password.Trim(), Cmn.CONST_WORDENCRYPTOR)).FirstOrDefault();
                    if (data.log_in_flag == "Y")
                    {
                        Session["TEMP_user_id"]    = data.user_id;
                        Session["empl_id"]         = data.empl_id;
                        Session["employee_name"]   = data.employee_name;
                        Session["role_id"]         = data.role_id;
                        Session["owner_fullname"]  = data.employee_name;
                        Session["department_code"] = data.department_code;
                        Session["employment_type"] = data.employment_type;

                        // Project only the scalar fields needed by the client.
                        // Avoids serializing the entire EF result object (which
                        // may contain large/unexpected data from the SP result set).
                        cred = new
                        {
                            data.user_id,
                            data.empl_id,
                            data.employee_name,
                            data.employment_type,
                            data.department_code,
                            data.role_id,
                            data.locked_account,
                            data.change_password,
                            data.log_in_flag,
                            data.log_in_flag_descr
                        };
                        success = 1;
                    }
                    else
                    {
                        success = 2;
                        message = data.log_in_flag_descr.ToString();
                    }
                }
                return Json(new { cred, success, message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                message = ex.Message;
                return Json(new { message, success = 0 }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult logout()
        {
            Session.Clear();
            if (Session["user_id"] == null)
            {
                return Json(new { session = 0, success = 1 }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { session = 1, success = 0 }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult CheckSessionLogin()
        {
            if (Session["user_id"] == null)
            {
                return Json("expire", JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json("active", JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult SetHistoryPage()
        {
            try
            {
                Session["history_page"] = Request.UrlReferrer.ToString();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}