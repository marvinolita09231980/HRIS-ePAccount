
using HRIS_eHRD.Common_Code;
using HRIS_ePAccount.Filter;
using HRIS_ePAccount.Models;

using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web.Mvc;


namespace HRIS_ePAccount.Controllers
{
    [SessionExpire]
    public class MenuController : Controller
    {
       
        //
        HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        applicationtoken at = new applicationtoken();
        // GET: Menu
        public ActionResult Index()
        {
            return View();
        }

        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }


        public ActionResult GetTaxToUpdate()
        {
            db_pay.Database.CommandTimeout = int.MaxValue;
            String[] AllowUserTaxUpdApprove_list;
            bool AllowUserTaxApprove = false;
            var userid = Session["user_id"].ToString();
            var year = DateTime.Now.Year.ToString();
            AllowUserTaxUpdApprove_list = System.Configuration.ConfigurationManager.AppSettings["AllowApprovetaxUpdateUser"].Split(',');
            try
            {
                var retax = db_pay.sp_empltaxwithheld_tbl_for_apprvl("RE").ToList().Count();
                var cetax = db_pay.sp_empltaxwithheld_tbl_for_apprvl("CE").ToList().Count();
                var jotax = db_pay.sp_payrollemployee_tax_tbl_for_apprvl(year, "N").ToList().Count();
                var netax = db_pay.sp_payrollemployee_tax_tbl_for_apprvl_NE(year, "N").ToList().Count();
                var rctax = retax + cetax;
                int updtax = rctax + jotax + netax;

                for (var x = 0; x < AllowUserTaxUpdApprove_list.Count(); x++)
                {
                    if (userid == AllowUserTaxUpdApprove_list[x])
                    {
                        AllowUserTaxApprove = true;
                    }
                }
                return Json(new { message = "Success",  icon = "success", rctax, updtax, jotax, AllowUserTaxApprove, netax}, JsonRequestBehavior.AllowGet);
            }
            catch(Exception ex)
            {
                var message = ex.Message;
                return Json(new { message = message,icon="error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetMenuList()
        {

            List<sp_user_menu_access_role_list_ACT_Result> menu_data = new List<sp_user_menu_access_role_list_ACT_Result>();

            var message = "";
            var year = DateTime.Now.Year.ToString();
            //menulst = (List<Object>)Session["menu"];
            try
            {

                string imgDataURL = "";
                var userid = Session["user_id"].ToString();

                if (Session["user_id"] != null)
                {
                    var empl_id = Session["empl_id"].ToString();
                    string current_url = Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/')[Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/').Count() - 1].ToString();
                    int already_in_fav = 0;

                    if (Session["imgDataURL"] == null)
                    {
                        var emp_photo_byte_arr = db_pay.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

                        //string imreBase64Data = "";
                      
                       
                        //***************convert byte array to image***********************************
                        if (emp_photo_byte_arr != null)
                        {
                            //imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
                            //imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                            imgDataURL = "http://192.168.5.218/storage/images" + emp_photo_byte_arr;

                            HttpContext.Session["imgDataURL"] = imgDataURL;
                        }
                        else
                        {
                            imgDataURL = "../ResourcesImages/upload_profile.png";
                        }
                    }
                    else
                    {
                        imgDataURL = HttpContext.Session["imgDataURL"].ToString();
                    }

                    if (Session["session_menu"] == null)
                    {
                        menu_data = db_pacco.sp_user_menu_access_role_list_ACT(Session["user_id"].ToString()).ToList();
                        HttpContext.Session["session_menu"] = menu_data;
                    }
                    else
                    {
                        menu_data = (List<sp_user_menu_access_role_list_ACT_Result>)HttpContext.Session["session_menu"];
                    }

                     var data = menu_data;





                    for (int x = 0; x < data.Count(); x++)
                    {
                        if (data[x].url_name == current_url)
                        {
                            if (data[x].favorites_mode == 1) already_in_fav = 1;
                        }
                    }

                    var User_Name = Session["employee_name"].ToString();
                    if (Session["expanded"] != null)
                    {

                        return JSON(new { data = data, expanded = Session["expanded"], photo = imgDataURL, success = 1, username = User_Name, already_in_fav }, JsonRequestBehavior.AllowGet);
                    }
                    else return JSON(new { data = data, expanded = 0, photo = imgDataURL, success = 1, username = User_Name, already_in_fav}, JsonRequestBehavior.AllowGet);

                    
                }
                else
                {
                    return Json(new { data = 0, success = 0 }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult getUserImageId()
        {
            var empl_id = Session["empl_id"].ToString();
            var emp_photo_byte_arr = db_pacco.vw_personnel_tbl_image.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

            return Json(emp_photo_byte_arr, JsonRequestBehavior.AllowGet);
        }
        public ActionResult expandedAdd(string id, int menulevel)
        {
            List<String> ls = new List<string>();
            List<String> ls2 = new List<string>();
            if (menulevel == 1) Session["expanded"] = null;
            if (Session["expanded"] != null)
            {
                ls = (List<String>)Session["expanded"];
                foreach (string l in ls)
                {
                    ls2.Add(l);
                }
                ls2.Add(id);
                Session["expanded"] = ls2;
            }
            else
            {
                ls2.Add(id);
                Session["expanded"] = ls2;

            }
            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);

        }
        public ActionResult expandedRemove(string id)
        {
            List<String> ls = new List<string>();

            if (Session["expanded"] != null)
            {
                ls = (List<String>)Session["expanded"];
                ls.Remove(id);
                Session["expanded"] = ls;
            }
            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);
        }
        public ActionResult returnSesion()
        {

            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);

        }
        public ActionResult UserAccessOnPage(sp_user_menu_access_role_list_ACT_Result list)
        {
            Session["allow_add"]            = list.allow_add;
            Session["allow_delete"]         = list.allow_delete;
            Session["allow_edit"]           = list.allow_edit;
            Session["allow_edit_history"]   = list.allow_edit_history;
            Session["allow_print"]          = list.allow_print;
            Session["allow_view"]           = list.allow_view;
            Session["url_name"]             = list.url_name;
            Session["id"]                   = list.id;
            Session["menu_name"]            = list.menu_name;
            Session["page_title"]           = list.page_title;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                    eve.Entry.Entity.GetType().Name, eve.Entry.State);
                foreach (var ve in eve.ValidationErrors)
                {


                    message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                    Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);


                }
            }
            return message;
        }
        public ActionResult DL_manual()
        {
            var current_page = Request.UrlReferrer.ToString();

            return Json(new { current_page }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult AddOrRemoveToFavorites(string action_mode)
        {
            try
            {
                string user_id = Session["user_id"].ToString();
                string current_page = Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/')[Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/').Count() - 1].ToString();
                var data = db_pacco.sp_add_remove_menu_favorites_ACT(user_id, current_page, action_mode).FirstOrDefault();
                return JSON(new { success = 1, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { success = 0, e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetToken()
        {
            var token = "";
            try
            {
                var user_id = Session["user_id"].ToString();
                var app = at.app_name;
                var user_token_tbl = db_pay.application_token_tbl.Where(a => a.user_id == user_id && a.application_name == app).OrderByDescending(a => a.created_datetime).FirstOrDefault();
                if (user_token_tbl != null)
                {
                    token = user_token_tbl.token;
                }

                return JSON(new { success = 1, token}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { success = 0, e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


       
    }
}