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
    public class cRemitCertDetailsController : Controller
    {
        
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        // GET: cRemitCertDetails
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (Session["PreviousValuesonPage_cRemitCert"] == null)
                Session["PreviousValuesonPage_cRemitCert"] = "";
            else if (Session["PreviousValuesonPage_cRemitCert"].ToString() != string.Empty)
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitCert"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;
            }

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
        public ActionResult InitializeData()
        {
            try
            {
                string userid       = Session["user_id"].ToString();
                string allowAdd     = Session["allow_add"].ToString();
                string allowDelete  = Session["allow_delete"].ToString();
                string allowEdit    = Session["allow_edit"].ToString();
                string allowPrint   = Session["allow_print"].ToString();
                string allowView    = Session["allow_view"].ToString();

                string[] prevValues = Session["PreviousValuesonPage_cRemitCert"].ToString().Split(new char[] { ',' });
                var empl_data = db_pacco.sp_remittance_cert_tbl_list2(prevValues[0],prevValues[3]);

                return Json(new { userid, prevValues, empl_data, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetEmplData(string p_remitType_code, string p_empl_id)
        {
            try
            {
                var empl_data = db_pacco.sp_remittance_cert_tbl_list2(p_remitType_code, p_empl_id).ToList();

                return Json(new { message = "success", empl_data }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult FilterByLetterRemitType(string p_remitType_code, string p_letter)
        {
            try
            {
                if (p_letter != null)
                {
                    var listgridFiltered = db_pacco.sp_remittance_cert_tbl_list1(p_remitType_code, p_letter,"","").ToList();
                    return Json(new { listgridFiltered }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var listgridFiltered = db_pacco.sp_remittance_cert_tbl_list1(p_remitType_code, "","","").ToList();
                    return Json(new { listgridFiltered }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/04/2019
        // Description  : Get Personnel Names
        //*********************************************************************//
        public ActionResult EmployeeNames(string p_remitType_code, string p_letter)
        {
            try
            {
                var pNames = db_pacco.sp_personnelnames_list1(p_remitType_code, p_letter);
                return Json(new { message = "success", pNames }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 11/27/2019
        // Description  : Add new record to remittance certification table
        //*********************************************************************//
        public ActionResult SaveRemitCert(remittance_cert_tbl data)
        {
            try
            {
                db_pacco.remittance_cert_tbl.Add(data);
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
        // Created Date : 12/04/2019
        // Description  : Edit existing record from remittance certification table
        //*********************************************************************//
        public ActionResult SaveEditRemitCert(remittance_cert_tbl data)
        {
            try
            {
                var od = db_pacco.remittance_cert_tbl.Where(a =>
                   a.empl_id == data.empl_id &&
                   a.remittancetype_code == data.remittancetype_code &&
                   a.or_nbr == data.or_nbr).FirstOrDefault();
                od.or_date = data.or_date;
                od.remittance_year = data.remittance_year;
                od.remittance_month = data.remittance_month;
                od.amount_ps = data.amount_ps;
                od.amount_gs = data.amount_gs;
                od.updated_by_user = data.updated_by_user;
                od.updated_by_dttm = data.updated_by_dttm;

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
        // Created Date : 11/27/2019
        // Description  : Add new record to remittance certification table
        //*********************************************************************//
        public ActionResult DeleteRemitCert(remittance_cert_tbl data)
        {
            try
            {
                var od = db_pacco.remittance_cert_tbl.Where(a =>
                   a.empl_id == data.empl_id &&
                   a.remittancetype_code == data.remittancetype_code &&
                   a.or_nbr == data.or_nbr).FirstOrDefault();

                db_pacco.remittance_cert_tbl.Remove(od);
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
        // Created Date : 12/09/2019
        // Description  : Extract data from remittance
        //*********************************************************************//
        public ActionResult ExtractData(string p_remitType_code, string p_empl_id, DateTime p_date_from, DateTime p_date_to, string p_userid)
        {
            try
            {
                var extracted = db_pacco.sp_remittance_cert_tbl_extract(p_remitType_code, p_empl_id, p_date_from, p_date_to, p_userid);

                return Json(new { message = "success", extracted }, JsonRequestBehavior.AllowGet);
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
        public ActionResult PrintBack()
        {
            try
            {
                //Session["history_page"] = Request.UrlReferrer.ToString();
                Session["history_page"] = "../cRemitCertDetails";
                var history = Session["history_page"];

                return JSON(new { message = "success", history}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}