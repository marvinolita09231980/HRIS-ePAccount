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
    public class cRemitLedgerOthersController : Controller
    {
      
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();

        string remittance_ctrl_nbr  = "";
        string remittance_year      = "";
        string remittance_month     = "";
        string employment_type      = "";
        string remittance_type      = "";
        string department_code      = "";
        string letter               = "";

        // GET: cRemitLedgerOthers
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index(string id, string title)
        {
            User_Menu um = new User_Menu();

            if (Session["PreviousValuesonPage_cRemitLedger"] == null)
                Session["PreviousValuesonPage_cRemitLedger"] = "";
            else if (Session["PreviousValuesonPage_cRemitLedger"].ToString() != string.Empty)
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;
            }

            if (um != null || um.ToString() != "")
            {
                //um.allow_add = (int)Session["allow_add"];
                um.allow_delete = (int)Session["allow_delete"];
                um.allow_edit = (int)Session["allow_edit"];
                um.allow_edit_history = (int)Session["allow_edit_history"];
                um.allow_print = (int)Session["allow_print"];
                um.allow_view = (int)Session["allow_view"];
                um.url_name = Session["url_name"].ToString();
                um.id = (int)Session["id"];
                um.menu_name = Session["menu_name"].ToString();
                um.page_title = Session["page_title"].ToString();

                um.remittancetype_code = id.ToString();
                um.remittancetype_descr = title.ToString();

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
        // Created Date : 10/24/2019
        // Description  : Initialized during Others PageLoad
        //*********************************************************************//
        public ActionResult initializeData(string p_letter, string p_dep_code)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            string userid       = Session["user_id"].ToString();
            string allowAdd     = Session["allow_add"].ToString();
            string allowDelete  = Session["allow_delete"].ToString();
            string allowEdit    = Session["allow_edit"].ToString();
            string allowPrint   = Session["allow_print"].ToString();
            string allowView    = Session["allow_view"].ToString();

            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year     = prevValues[0].ToString().Trim();
            remittance_month    = prevValues[1].ToString().Trim();
            employment_type     = prevValues[3].ToString().Trim();
            remittance_type     = prevValues[5].ToString().Trim();
            
            var voucher_list = db_pacco.sp_voucher_not_in_remittance(remittance_year, remittance_month, employment_type, remittance_type).ToList();
            var department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);
            var listgrid = db_pacco.sp_remittance_ledger_info_OTHERS(remittance_ctrl_nbr, p_dep_code, p_letter, "", "").ToList();

            return JSON(new { prevValues, voucher_list, listgrid, department_list, userid, allowAdd, allowDelete, allowEdit, allowPrint, allowView, remittance_type }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 11/21/2019
        // Description  : Get All Data in Others Ledger Info
        //*********************************************************************//
        public ActionResult GetAllDataLedgerInfo(string p_remit_nbr)
        {
            try
            {
                var getAllData = db_pacco.sp_remittance_ledger_info_OTHERS(p_remit_nbr, "", "","","").ToList();

                return JSON(new { message = "success", getAllData }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 11/19/2019
        // Description  : Get Letter List
        //*********************************************************************//
        public ActionResult LetterList(string p_remit_nbr)
        {
            try
            {
                var letter_list = db_pacco.sp_remittance_ledger_info_letter_OTHERS(p_remit_nbr);
                return Json(new { message = "success", letter_list }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 10/24/2019
        // Description  : Get payroll registry number 
        //*********************************************************************//
        public ActionResult GetPayrollRegistry(string payroll_registry_nbr)
        {
            try
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });

                remittance_year = prevValues[0].ToString().Trim();
                remittance_month = prevValues[1].ToString().Trim();
                employment_type = prevValues[3].ToString().Trim();
                remittance_type = prevValues[5].ToString().Trim();

                var payroll_reg_list = db_pacco.sp_payrollregistry_not_in_remittance_OTHERS(remittance_year, remittance_month, employment_type, remittance_type, payroll_registry_nbr);
                return Json(new { message = "success", payroll_reg_list, prevValues }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 10/24/2019
        // Description  : Get voucher number of not in remittance
        //*********************************************************************//
        public ActionResult GetVoucherList()
        {
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });

            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year     = prevValues[0].ToString().Trim();
            remittance_month    = prevValues[1].ToString().Trim();
            employment_type     = prevValues[3].ToString().Trim();
            remittance_type     = prevValues[5].ToString().Trim();

            var voucher_list    = db_pacco.sp_voucher_not_in_remittance(remittance_year, remittance_month, employment_type, remittance_type).ToList();
            return Json(new { message = "success", voucher_list }, JsonRequestBehavior.AllowGet);

        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 10/24/2019
        // Description  : Add new record to others table
        //*********************************************************************//
        public ActionResult SaveOthersDetails(remittance_dtl_others_tbl data)
        {
            try
            {
                db_pacco.remittance_dtl_others_tbl.Add(data);
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
        // Created Date : 10/24/2019
        // Description  : Edit existing record to others table
        //*********************************************************************//
        public ActionResult SaveEditOthersDetails(remittance_dtl_others_tbl data)
        {
            try
            {
                var od = db_pacco.remittance_dtl_others_tbl.Where(a =>
                   a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                   a.empl_id == data.empl_id &&
                   a.voucher_nbr == data.voucher_nbr).FirstOrDefault();
                od.remittance_status = data.remittance_status;

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
        // Created Date : 10/24/2019
        // Description  : Delete record from others table
        //*********************************************************************//
        public ActionResult DeleteOthersDetail(sp_remittance_ledger_info_OTHERS_Result data)
        {
            try
            {
                var od = db_pacco.remittance_dtl_others_tbl.Where(a =>
                   a.remittance_ctrl_nbr    == data.remittance_ctrl_nbr &&
                   a.empl_id                == data.empl_id             &&
                   a.voucher_nbr            == data.voucher_nbr).FirstOrDefault();

                var od1 = db_pacco.remittance_dtl_others_month_tbl.Where(a =>
                  a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                  a.empl_id == data.empl_id &&
                  a.voucher_nbr == data.voucher_nbr
                  && a.payroll_month == data.payroll_month
                  ).FirstOrDefault();

                if (od != null)
                {
                    db_pacco.remittance_dtl_others_tbl.Remove(od);
                }
                if (od1 != null)
                {
                    db_pacco.remittance_dtl_others_month_tbl.Remove(od1);
                }
             
                
                db_pacco.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 10/25/2019
        // Description  : Filter Grid By Letter and Department Code
        //*********************************************************************//
        public ActionResult FilterByLetterAndDepartment(string remit_ctrl_nbr, string department, string selectedLetter)
        {
            try
            {
                remittance_ctrl_nbr = remit_ctrl_nbr;
                department_code = department;
                letter = selectedLetter;

                var filterResult = db_pacco.sp_remittance_ledger_info_OTHERS(remittance_ctrl_nbr, department_code, letter,"","");
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
        // Created Date : 11/21/2019
        // Description  : Get Individual Data in Others Ledger Info
        //*********************************************************************//
        public ActionResult GetIndividualDataLedgerInfo(string p_remit_nbr, string p_department_code, string p_empl_id, string p_voucher_nbr)
        {
            try
            {
                var getIndividualData = db_pacco.sp_remittance_ledger_info_OTHERS(p_remit_nbr, p_department_code, "", p_empl_id, p_voucher_nbr).ToList();

                return JSON(new { message = "success", getIndividualData }, JsonRequestBehavior.AllowGet);
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