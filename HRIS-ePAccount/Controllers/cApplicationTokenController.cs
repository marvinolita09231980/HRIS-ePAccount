using HRIS_Common;
using HRIS_eHRD.Common_Code;
using HRIS_ePAccount.Filter;
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    [SessionExpire]
    public class cApplicationTokenController : Controller
    {
        applicationtoken at = new applicationtoken();
        HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
        //private const string _alg = "HmacSHA256";
        //private readonly string app_name;

        // GET: cApplicationToken
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult initializeData()
        {

            string excelExportServer = System.Configuration.ConfigurationManager.AppSettings["ExcelExportServerIP"];
            return Json(new {data="", excelExportServer }, JsonRequestBehavior.AllowGet);
        }
       


        
        //private const string _salt = "rz8LuOtFBXphj9WQfvFh"; // Generated at https://www.random.org/strings

        public ActionResult GenerateToken()
        {
            token_data token = new token_data();
            var created_date = DateTime.Now;
            var validuntil_date = created_date.AddMonths(1);
            long ticks = created_date.Ticks;
            

            var username = Session["user_id"].ToString();
            var user_cred = db_pay.usersprofile_tbl.Where(a => a.user_id == username).FirstOrDefault();

            var user_password = user_cred.user_password;

            string hash = string.Join(":", new string[] { username, at.app_name, ticks.ToString() });
            string hashLeft = "";
            string hashRight = "";

            using (HMAC hmac = HMACSHA256.Create(at._alg))
            {
                hmac.Key = Encoding.UTF8.GetBytes(user_password);
                hmac.ComputeHash(Encoding.UTF8.GetBytes(hash));

                hashLeft = Convert.ToBase64String(hmac.Hash);
                hashRight = string.Join(":", new string[] { username, ticks.ToString() });
            }
            var encrypted = Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Join(":", hashLeft, hashRight)));

            token.token = encrypted;
            token.user_id = username;
            token.application_name = at.app_name;
            token.created_datetime = created_date.ToString("yyyy-MM-dd HH:mm:ss");
            token.validuntil_datetime = validuntil_date.ToString("yyyy-MM-dd HH:mm:ss");

            return Json(new { token }, JsonRequestBehavior.AllowGet);
          
        }


        //public static string GetHashedPassword(string password)
        //{
        //    string key = string.Join(":", new string[] { password, _salt });

        //    using (HMAC hmac = HMACSHA256.Create(_alg))
        //    {
        //        // Hash the key.
        //        hmac.Key = Encoding.UTF8.GetBytes(_salt);
        //        hmac.ComputeHash(Encoding.UTF8.GetBytes(key));

        //        return Convert.ToBase64String(hmac.Hash);
        //    }
        //}


        public ActionResult SaveHRISToken(token_data token)
        {
            try
            {
                application_token_tbl t = new application_token_tbl();
                t.token = token.token;
                t.user_id = token.user_id;
                t.application_name = token.application_name;
                t.created_datetime = Convert.ToDateTime(token.created_datetime);
                t.validuntil_datetime = Convert.ToDateTime(token.validuntil_datetime);

                db_pay.application_token_tbl.Add(t);
                db_pay.SaveChanges();
                return Json(new { message = "Successfuly saved token!",icon="success" }, JsonRequestBehavior.AllowGet);
            } catch (Exception e)
            {
                return Json(new { message = e.Message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
           
        }
    }
}