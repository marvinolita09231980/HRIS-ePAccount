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
    public class cPASystemSetupController : Controller
    {
       
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (um != null || um.ToString() != "")
            {
                um.allow_add = (int)Session["allow_add"];
                um.allow_delete = (int)Session["allow_delete"];
                um.allow_edit = (int)Session["allow_edit"];
                um.allow_edit_history = (int)Session["allow_edit_history"];
                um.allow_print = (int)Session["allow_print"];
                um.allow_view = (int)Session["allow_view"];
                um.url_name = Session["url_name"].ToString();
                um.id = (int)Session["id"];
                um.menu_name = Session["menu_name"].ToString();
                um.page_title = Session["page_title"].ToString();
            }
            return View(um);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/21/2019
        // Description  : Initialized during system set-up pageload
        //*********************************************************************//
        public ActionResult initializeData()
        {
            try
            {
                string userid       = Session["user_id"].ToString();
                string allowAdd     = Session["allow_add"].ToString();
                string allowDelete  = Session["allow_delete"].ToString();
                string allowEdit    = Session["allow_edit"].ToString();
                string allowPrint   = Session["allow_print"].ToString();
                string allowView    = Session["allow_view"].ToString();

                var sysLst = db_pacco.sp_accountingsystemsetup_tbl_list().ToList();

                return JSON(new { message = "success", sysLst, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/21/2019
        // Description  : Get last code for auto generate
        //*********************************************************************//
        public ActionResult GetLasCode()
        {
            try
            {

                var ids = db_pacco.sp_accountingsystemsetup_tbl_list().Select(a => int.Parse(a.syssetup_type_code));

                return JSON(new { message = "success", ids }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/21/2019
        // Description  : Check if system set-up type code already exist during save
        //*********************************************************************//
        public ActionResult CheckExist(string syssetup_type_code)
        {
            try
            {
                string message = "";
                var od = db_pacco.accountingsystemsetup_tbl.Where(a =>
                   a.syssetup_type_code == syssetup_type_code).FirstOrDefault();
                if (od != null)
                {
                    message = "";
                }
                else
                {
                    message = "success";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/21/2019
        // Description  : Check if cash advance code already exist during edit modal
        //*********************************************************************//
        public ActionResult CheckExist2(string syssetup_type_code)
        {
            try
            {
                string message = "";
                var od = db_pacco.accountingsystemsetup_tbl.Where(a =>
                  a.syssetup_type_code == syssetup_type_code).FirstOrDefault();
                if (od != null)
                {
                    message = "";
                }
                else
                {
                    message = "success";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/21/2019
        // Description  : Add new record to system set-up table
        //*********************************************************************//
        public ActionResult SaveSystemSetUp(accountingsystemsetup_tbl data)
        {
            try
            {
                db_pacco.accountingsystemsetup_tbl.Add(data);
                db_pacco.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/21/2019
        // Description  : Edit existing record from system set-up table
        //*********************************************************************//
        public ActionResult SaveEditSystemSetUp(accountingsystemsetup_tbl data)
        {
            try
            {
                var od = db_pacco.accountingsystemsetup_tbl.Where(a =>
                   a.syssetup_type_code == data.syssetup_type_code).FirstOrDefault();
                od.syssetup_type_descr = data.syssetup_type_descr;
                od.rcvd_flag = data.rcvd_flag;
                od.rcvd_audit_flag = data.rcvd_audit_flag;
                od.audit_flag = data.audit_flag;
                od.rcvd_post_flag = data.rcvd_post_flag;
                od.post_flag = data.post_flag;
                od.release_flag = data.release_flag;
                od.unpost_flag = data.unpost_flag;

                db_pacco.SaveChanges();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/21/2019
        // Description  : Delete from system set-up table
        //*********************************************************************//
        public ActionResult DeleteSystemSetUp(string syssetup_type_code)
        {
            try
            {
                string message = "";
                var od = db_pacco.accountingsystemsetup_tbl.Where(a =>
                   a.syssetup_type_code == syssetup_type_code).FirstOrDefault();
                if (od != null)
                {
                    db_pacco.accountingsystemsetup_tbl.Remove(od);
                    db_pacco.SaveChanges();
                    message = "success";
                }
                else
                {
                    message = "";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);

                foreach (var ve in eve.ValidationErrors)
                {
                    message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                    Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);
                }
            }
            return message;
        }
    }
}