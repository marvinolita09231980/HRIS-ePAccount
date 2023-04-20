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
    public class cCashAdvFundSubController : Controller
    {
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        // GET: cCashAdvFundSub
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
        // Created Date : 02/07/2020
        // Description  : Initialized during pageload
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

                var caFundSubLst    = db_pacco.sp_cashadv_fund_sub_tbl_list().ToList();
                var caFundLst       = db_pacco.sp_cashadv_fund_tbl_list().ToList();

                return JSON(new { message = "success", caFundSubLst, caFundLst, userid, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/26/2019
        // Description  : Check if cash advance code already exist during save
        //*********************************************************************//
        public ActionResult CheckExist(string cafund_subcode)
        {
            try
            {
                string message = "";
                var od = db_pacco.cashadv_fund_sub_tbl.Where(a =>
                   a.cafund_subcode == cafund_subcode).FirstOrDefault();
                if (od != null)
                {
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/26/2019
        // Description  : Check if cash advance code already exist during edit modal
        //*********************************************************************//
        public ActionResult CheckExist2(string cafund_subcode)
        {
            try
            {
                string message = "";
                var od = db_pacco.cashadv_fund_sub_tbl.Where(a =>
                   a.cafund_subcode == cafund_subcode).FirstOrDefault();
                if (od != null)
                {
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/26/2019
        // Description  : Get data by cash advance code
        //*********************************************************************//
        public ActionResult GetData(string cafund_subcode)
        {
            try
            {
                var getdata = db_pacco.cashadv_fund_sub_tbl.Where(a =>
                   a.cafund_subcode == cafund_subcode).FirstOrDefault();

                return Json(new { message = "success", getdata }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/26/2019
        // Description  : Add new record to cash advance type table
        //*********************************************************************//
        public ActionResult Save(cashadv_fund_sub_tbl data)
        {
            try
            {
                db_pacco.cashadv_fund_sub_tbl.Add(data);
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
        // Created Date : 12/20/2019
        // Description  : Edit existing record from cash advance type table
        //*********************************************************************//
        public ActionResult SaveEdit(cashadv_fund_sub_tbl data)
        {
            try
            {
                var od = db_pacco.cashadv_fund_sub_tbl.Where(a =>
                   a.cafund_subcode == data.cafund_subcode).FirstOrDefault();
                od.cafund_subdescr  = data.cafund_subdescr;
                od.cafund_bankname  = data.cafund_bankname;
                od.cafund_bankacct  = data.cafund_bankacct;
                od.cafund_code      = data.cafund_code;
                od.updated_dttm     = data.updated_dttm;
                od.updated_user_id  = data.updated_user_id;

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
        // Created Date : 12/20/2019
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult Delete(string cafund_subcode)
        {
            try
            {
                string message = "";
                var od = db_pacco.cashadv_fund_sub_tbl.Where(a =>
                   a.cafund_subcode == cafund_subcode).FirstOrDefault();
                if (od != null)
                {
                    db_pacco.cashadv_fund_sub_tbl.Remove(od);
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