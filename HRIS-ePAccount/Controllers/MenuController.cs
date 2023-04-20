﻿
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class MenuController : Controller
    {
        //
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
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


        public ActionResult GetMenuList()
        {

            var message = "";
            //menulst = (List<Object>)Session["menu"];
            try
            {

                if (Session["user_id"] != null)
                {
                    var empl_id = Session["empl_id"].ToString();


                    var emp_photo_byte_arr = db_pacco.vw_personnel_tbl_image.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

                    string imreBase64Data = "";
                    string imgDataURL = "";
                    string current_url = Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/')[Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/').Count() - 1].ToString();
                    int already_in_fav = 0;
                    //***************convert byte array to image***********************************
                    if (emp_photo_byte_arr != null)
                    {
                        imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
                        imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                    }
                    else
                    {
                        imgDataURL = "../ResourcesImages/upload_profile.png";
                    }

                    var data = db_pacco.sp_user_menu_access_role_list_ACT(Session["user_id"].ToString()).ToList();

                    for (int x = 0; x < data.Count; x++)
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
                    else return JSON(new { data = data, expanded = 0, photo = imgDataURL, success = 1, username = User_Name, already_in_fav }, JsonRequestBehavior.AllowGet);

                    
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
    }
}