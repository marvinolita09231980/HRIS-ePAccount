//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Remittance LBP details/info
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Jorge Rusom Villanueva       05/23/2022      Code Creation
//**********************************************************************************

//LAST
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
using System.Globalization;

namespace HRIS_ePAccount.Controllers
{
    public class cRemitLedgerLBPController : Controller
    {

        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        string remittance_ctrl_nbr = "";
        string remittance_year = "";
        string remittance_month = "";
        string employment_type = "";
        string remittance_type = "";
        // GET: cRemitLedgerSSS
        public ActionResult Index()
        {
            //User ID validation, redirection to login when session user id is not set
            if (Session["user_id"] == null || Session["user_id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });

            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();
            ViewBag.prevValues = prevValues;
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
        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/21/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string p_department_code, string p_starts_letter, int p_batch_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();
            var department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);
            var listgrid = db_pacco.sp_remittance_ledger_info_LBP(remittance_ctrl_nbr, p_department_code, p_starts_letter, p_batch_nbr, "", "").ToList();
            return JSON(new { prevValues, listgrid, department_list }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/25/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult RetrieveListGrid(string p_department_code, string p_starts_letter, int p_batch_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();

            var listgrid = db_pacco.sp_remittance_ledger_info_SSS(remittance_ctrl_nbr, p_department_code, p_starts_letter, p_batch_nbr, "", "").ToList();
            return JSON(new { listgrid }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/22/2019
        // Description :Get Letter List
        //*********************************************************************//
        public ActionResult LetterList(string p_remit_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var letter_list = db_pacco.sp_remittance_ledger_info_letter_SSS(p_remit_nbr);
            return JSON(new { letter_list }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/22/2019
        // Description :Get Available Voucher from database
        //*********************************************************************//
        public ActionResult GetVoucher(int p_batch_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });

            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();

            var voucher_list = db_pacco.sp_voucher_not_in_remittance_SSS(remittance_year, remittance_month, employment_type, remittance_type, p_batch_nbr).ToList();
            return JSON(new { voucher_list }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/22/2019
        // Description :Get Avaliable Employee that is within the Payroll registry
        //*********************************************************************//
        public ActionResult RetrieveEmployees(string par_payrollregistry_nbr, int p_batch_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });

            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();

            var employee_names = db_pacco.sp_payrollregistry_not_in_remittance_SSS(remittance_year, remittance_month, employment_type, remittance_type, par_payrollregistry_nbr, p_batch_nbr).ToList();
            return JSON(new { employee_names }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/22/2019
        // Description :Save ADD data to database
        //*********************************************************************//
        public ActionResult SaveADDLBPInDatabase(remittance_dtl_lbp_month_ovrd_tbl data,Decimal par_orig_amt)
        {
            try
            {
                var check_exists = db_pacco.remittance_dtl_lbp_month_ovrd_tbl.Where(a => a.voucher_nbr == data.voucher_nbr
                && a.empl_id == data.empl_id
                && a.payroll_month == data.payroll_month
                && a.payroll_year == data.payroll_year).FirstOrDefault();
                var edited_amount = data.payroll_amount;

                if (check_exists == null)
                {
                    data.created_by = Session["empl_id"].ToString();
                    data.created_dttm = DateTime.Now;
                    data.payroll_amount = par_orig_amt;
                    db_pacco.Database.CommandTimeout = int.MaxValue;
                    db_pacco.remittance_dtl_lbp_month_ovrd_tbl.Add(data);


                    var update_data = db_pacco.remittance_dtl_lbp_month_tbl.Where(a => a.voucher_nbr == data.voucher_nbr
                    && a.empl_id == data.empl_id
                    && a.payroll_month == data.payroll_month
                    && a.payroll_year == data.payroll_year).FirstOrDefault();

                    update_data.payroll_amount = edited_amount;

                    db_pacco.SaveChangesAsync();

                }

                else {
                    
                    var update_data = db_pacco.remittance_dtl_lbp_month_tbl.Where(a => a.voucher_nbr == data.voucher_nbr
                   && a.empl_id == data.empl_id
                   && a.payroll_month == data.payroll_month
                   && a.payroll_year == data.payroll_year).FirstOrDefault();

                    update_data.payroll_amount = edited_amount;
                    db_pacco.SaveChangesAsync();
                }
                
               
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/22/2019
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult SaveEDITSSSInDatabase(remittance_dtl_sss_tbl data)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var rmt = db_pacco.remittance_dtl_sss_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr).FirstOrDefault();
                rmt.payroll_amount = data.payroll_amount;
                rmt.remittance_status = data.remittance_status;
                rmt.remittance_ctrl_ref = data.remittance_ctrl_ref;

                db_pacco.SaveChanges();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/22/2019
        // Description :DELETE DATA IN remittance_dtl_sss_tbl
        //*********************************************************************//
        public ActionResult DeleteLBPDetails(remittance_dtl_lbp_month_tbl data)
        {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var dt = db_pacco.remittance_dtl_lbp_month_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr
                    ).FirstOrDefault();

                var dt1 = db_pacco.remittance_dtl_lbp_month_ovrd_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr
                    ).FirstOrDefault();


                if (dt1 != null) {
                    db_pacco.remittance_dtl_lbp_month_ovrd_tbl.Remove(dt1);
                }

                db_pacco.remittance_dtl_lbp_month_tbl.Remove(dt);
                db_pacco.SaveChanges();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        /*********************************************************************/
        // Created By : JRV - Created Date : 10/08/2020
        // Description : For MONTHLY CNA PRINTING
        //*********************************************************************//
        public ActionResult PrintLBPMonthly()
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        }



        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 11/23/2019
        // Description  : Get Individual Data in sss Ledger Info
        //*********************************************************************//
        public ActionResult GetIndividualDataLedgerInfo(string p_remit_nbr, string p_department_code, string p_empl_id, string p_voucher_nbr)
        {
            try
            {
                var getIndividualData = db_pacco.sp_remittance_ledger_info_SSS(p_remit_nbr, p_department_code, "", 0, p_empl_id, p_voucher_nbr).ToList();

                return JSON(new { message = "success", getIndividualData }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult PrintBack()
        {
            try
            {
                //Session["history_page"] = Request.UrlReferrer.ToString();
                Session["history_page"] = "../cRemitLedgerSSS";
                var history = Session["history_page"];
                return JSON(new { message = "success", history }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
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
        //*********************************************************************//
        // Created By : VJA - Created Date : 2021-07-21
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveGrandTotal(string par_remittance_ctrl_nbr)
        {
            try
            {
                var message = "success";
                var data = db_pacco.sp_remittance_grand_totals_list(par_remittance_ctrl_nbr).ToList().FirstOrDefault();

                if (data == null)
                {
                    message = "error";
                }

                return Json(new { message, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}