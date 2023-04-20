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
    public class cRemittanceTypeController : Controller
    {
        
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        // GET: cRemittanceType
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
        // Created By : VJA - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult initializeData(string par_empType)
        {
            string allowAdd     = Session["allow_add"].ToString();
            string allowDelete  = Session["allow_delete"].ToString();
            string allowEdit    = Session["allow_edit"].ToString();
            string allowPrint   = Session["allow_print"].ToString();
            string allowView    = Session["allow_view"].ToString();

            var empType = db_pacco.sp_employmenttypes_tbl_list4().ToList();
            var remittanceLst = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();

            return Json(new { remittanceLst, empType, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/18/2019
        // Description  : Filter Remittance Type by Employment type
        //*********************************************************************//
        public ActionResult Filter(string par_empType)
        {
            try
            {
                var filterResult = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();

                return Json(new { message = "success", filterResult }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/18/2019
        // Description  : Get data by remittance code and employment type
        //*********************************************************************//
        public ActionResult GetData(string remittancetype_code, string employment_type)
        {
            try
            {
                var getdata = db_pacco.remittancetype_tbl.Where(a =>
                   a.remittancetype_code == remittancetype_code &&
                   a.employment_type == employment_type).FirstOrDefault();

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
        // Created Date : 12/18/2019
        // Description  : Get Description of remittance code if already exist
        //*********************************************************************//
        public ActionResult GetDescr(string p_type_code)
        {
            try
            {
                var description = db_pacco.sp_remittancetype_tbl_list2().Where(a => 
                            a.remittancetype_code == p_type_code);
                
                return JSON(new { message = "success", description }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/18/2019
        // Description  : Check if remittance code already exist during save
        //*********************************************************************//
        public ActionResult CheckExist(string remittancetype_code, string employment_type)
        {
            try
            {
                string message = "";
                var od = db_pacco.remittancetype_tbl.Where(a =>
                   a.remittancetype_code == remittancetype_code &&
                   a.employment_type == employment_type).FirstOrDefault();
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
        // Created Date : 12/18/2019
        // Description  : Add new record to remittance type table
        //*********************************************************************//
        public ActionResult SaveRemitType(remittancetype_tbl data)
        {
            try
            {
                db_pacco.remittancetype_tbl.Add(data);
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
        // Created Date : 12/18/2019
        // Description  : Edit existing record from remittance type table
        //*********************************************************************//
        public ActionResult SaveEditRemitType(remittancetype_tbl data)
        {
            try
            {
                var od = db_pacco.remittancetype_tbl.Where(a =>
                   a.remittancetype_code == data.remittancetype_code &&
                   a.employment_type == data.employment_type).FirstOrDefault();
                od.remittancetype_descr = data.remittancetype_descr;
                od.remittancetype_other_descr = data.remittancetype_other_descr;
                od.remittancetype_short_descr = data.remittancetype_short_descr;
                od.remittance_id1 = data.remittance_id1;
                od.remittance_id2 = data.remittance_id2;
                od.remittance_sig1_name = data.remittance_sig1_name;
                od.remittance_sig1_desg = data.remittance_sig1_desg;
                od.remittance_sig2_name = data.remittance_sig2_name;
                od.remittance_sig2_desg = data.remittance_sig2_desg;
                od.remittance_sig3_name = data.remittance_sig3_name;
                od.remittance_sig3_desg = data.remittance_sig3_desg;
                od.remittance_sig_acct_name = data.remittance_sig_acct_name;
                od.remittance_sig_acct_desg = data.remittance_sig_acct_desg;
                
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
        // Created Date : 12/18/2019
        // Description  : Delete from remittance type table
        //*********************************************************************//
        public ActionResult DeleteRemitType(string remittancetype_code, string employment_type)
        {
            try
            {
                string message = "";
                var od = db_pacco.remittancetype_tbl.Where(a =>
                   a.remittancetype_code == remittancetype_code &&
                   a.employment_type == employment_type).FirstOrDefault();
                if (od != null)
                {
                    db_pacco.remittancetype_tbl.Remove(od);
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