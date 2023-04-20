//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Transmittal Posting Pay Datails
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Joseph M. Tombo Jr       12/02/2019      Code Creation
//**********************************************************************************
using System;
using HRIS_ePAccount.Models;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Excel = Microsoft.Office.Interop.Excel;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Text;

namespace HRIS_ePAccount.Controllers
{
    public class cTransPostPayDetailsController : Controller
    {
        User_Menu               um          = new User_Menu();
      
        HRIS_PACCO_DEVEntities  db_pacco    = new HRIS_PACCO_DEVEntities();

        // GET: cTransPostPayDetails
        public ActionResult Index()
        {
            //User ID validation, redirection to login when session user id is not set
            if (Session["user_id"] == null || Session["user_id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            ViewBag.PageTitle = Session["page_title"].ToString();
            return View();
        }

        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data                = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/21/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            string[] prevValues = null;
            string batch_nbr    = "";
            if (Session["PreviousValuesonPage_cTransPostPay"] == null || Session["PreviousValuesonPage_cTransPostPay"].ToString().Trim() == "")
            {
                Session["PreviousValuesonPage_cTransPostPay"] = "";
            }
            else
            {
                prevValues  = Session["PreviousValuesonPage_cTransPostPay"].ToString().Split(new char[] { ',' });
                batch_nbr   = prevValues[5].ToString();
            }
           
            string employmet_type = prevValues[3].ToString();
            var listgrid = db_pacco.sp_transmital_postpay_dtl_tbl_list(batch_nbr).ToList();
            var payrolltemplate_list = db_pacco.vw_payrolltemplate_tbl_list.Where(a => 
                                                    a.payrolltemplate_type =="01" 
                                                &&  a.employment_type == employmet_type).ToList();
            //Updated By: Joseph M. Tombo Jr 09/19/2020
            //---------------------------------------------------------------------------------------------------------------
            var override_data = db_pacco.bank_transmittal_override_tbl.Where(a => a.batch_nbr == batch_nbr).FirstOrDefault();
            //---------------------------------------------------------------------------------------------------------------

            if (um != null || um.ToString() != "")
            {
                um.allow_add            = (int)Session["allow_add"];
                um.allow_delete         = (int)Session["allow_delete"];
                um.allow_edit           = (int)Session["allow_edit"];
                um.allow_edit_history   = (int)Session["allow_edit_history"];
                um.allow_print          = (int)Session["allow_print"];
                um.allow_view           = (int)Session["allow_view"];
                um.url_name             = Session["url_name"].ToString();
                um.id                   = (int)Session["id"];
                um.menu_name            = Session["menu_name"].ToString();
                um.page_title           = Session["page_title"].ToString();
            }

            return Json(new { listgrid, prevValues, payrolltemplate_list,um, override_data }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Get CA Payroll Vouchers NBR
        //*********************************************************************//
        public ActionResult GetCAVoucher(string p_ca_voucher_nbr, string p_batch_nbr, string p_payrolltemplate_code)
        {
            var payroll_vouchers_list = db_pacco.sp_ca_pay_vouchers_list(p_ca_voucher_nbr,p_batch_nbr, p_payrolltemplate_code).ToList();
            
            return Json(new { payroll_vouchers_list }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Retrieve Datalist Grid
        //*********************************************************************//
        public ActionResult RetrieveDataListGrid(string p_payroll_year, string p_payroll_month, string p_employment_type)
        {
            try
            {
                var datalistgrid = db_pacco.sp_transmital_postpay_tbl_list(p_payroll_year, p_payroll_month, p_employment_type).ToList();

                return Json(new { datalistgrid }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Save Data to pyctrl Table
        //*********************************************************************//
        public ActionResult btn_save_action(pyent_tbl data)
        {
            try
            {
                db_pacco.pyent_tbl.Add(data);
                db_pacco.SaveChangesAsync();

                return Json(new { message = "success", save_data = data }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Save Data to pyctrl Table
        //*********************************************************************//
        public ActionResult btn_save_override_action(bank_transmittal_override_tbl data)
        {
            try
            {
                var rmt = db_pacco.bank_transmittal_override_tbl.Where(a =>
                     a.batch_nbr == data.batch_nbr &&
                     a.voucher_nbr == data.voucher_nbr).FirstOrDefault();
                //If existing then update the reason
                if (rmt != null)
                {
                    rmt.override_reason = data.override_reason;
                    rmt.updated_user_id = Session["user_id"].ToString();
                    rmt.updated_dttm    = data.updated_dttm;
                }
                //If not existing then add it to the override table
                else
                { 
                    data.created_user_id = Session["user_id"].ToString().Trim();
                    db_pacco.bank_transmittal_override_tbl.Add(data);
                }
                db_pacco.SaveChangesAsync();

                return Json(new { message = "success", save_data = data }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Save Data to pyctrl Table
        //*********************************************************************//
        public ActionResult btn_save_edit_action(pyctrl_tbl data)
        {
            try
            {

                var rmt = db_pacco.pyctrl_tbl.Where(a =>
                     a.batch_nbr == data.batch_nbr &&
                     a.ca_voucher_nbr == data.ca_voucher_nbr).FirstOrDefault();
                rmt.batch_description = data.batch_description;

                var summary_total = db_pacco.pyent_tbl.Where(a => a.batch_nbr == data.batch_nbr).Sum(a => a.total_net_pay).ToString();
                if (summary_total == null || summary_total.Trim() == "")
                {
                    summary_total = "0.00";
                }

                db_pacco.SaveChanges();

                return Json(new { message = "success", save_data = data, summary_total = summary_total }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Delete data pyent Table
        //*********************************************************************//
        public ActionResult btn_delete_action(pyent_tbl data)
        {
            try
            {
                Session["history_page"] = "";
                var dt = db_pacco.pyent_tbl.Where(a =>
                    a.batch_nbr == data.batch_nbr &&
                    a.voucher_nbr == data.voucher_nbr
                    ).FirstOrDefault();
                db_pacco.pyent_tbl.Remove(dt);
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
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Set Session History Page
        //*********************************************************************//
        public ActionResult set_history_page(string page_name)
        {
            try
            {
                Session["history_page"] = page_name;
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
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
    }
}