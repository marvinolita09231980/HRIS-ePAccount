// **********************************************************
// Page Name    : CS for Cash Advance for Payroll
// Purpose      : CS for Cash Advance for Payroll
// Created By   : Vincent Jade Alivio
// Created Date : December 2, 2019
// Updated Date : -- -- ---
// ***********************************************************
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cCashAdvDTLController : Controller
    {
        //
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            else
            {
                if (Session["PreviousValuesonPage_cCashAdv"] == null)
                    Session["PreviousValuesonPage_cCashAdv"] = "";
                else if (Session["PreviousValuesonPage_cCashAdv"].ToString() != string.Empty)
                {
                    string[] prevValues = Session["PreviousValuesonPage_cCashAdv"].ToString().Split(new char[] { ',' });
                    ViewBag.prevValues = prevValues;
                }

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
                return View(um);
            }
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
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_empType)
        {
              db_pacco.Database.CommandTimeout = int.MaxValue;
            if (Session["PreviousValuesonPage_cCashAdv"] == null || Session["PreviousValuesonPage_cCashAdv"].ToString() == "")
            {
                string[] prevValues = Session["PreviousValuesonPage_cCashAdv"].ToString().Split(new char[] { ',' });
                var empType = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list("","","").ToList();
                var sp_cashadv_dtl_tbl_list = db_pacco.sp_cashadv_dtl_tbl_list("","","","").ToList();
                var ca_type = db_pacco.sp_cashadv_type_tbl_list().ToList();
                var fundsource = db_pacco.sp_cashadv_fund_tbl_list().ToList();
                string userid = Session["user_id"].ToString();
                var payrolltemplate = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == "").ToList();
                return JSON(new { fundsource,ca_type, empType, userid, sp_cashadv_hdr_tbl_list, prevValues, sp_cashadv_dtl_tbl_list, payrolltemplate }, JsonRequestBehavior.AllowGet);

            }
            else
            {
                string[] prevValues         = Session["PreviousValuesonPage_cCashAdv"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues          = prevValues;
                
                var empType                 = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim()).ToList();
                var sp_cashadv_dtl_tbl_list = db_pacco.sp_cashadv_dtl_tbl_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim(), prevValues[11].ToString().Trim()).ToList();
                var ca_type                 = db_pacco.sp_cashadv_type_tbl_list().ToList();
                var fundsource              = db_pacco.sp_cashadv_fund_tbl_list().ToList();
                string userid               = Session["user_id"].ToString();
                string par_empl_type        = prevValues[3].ToString();
                var payrolltemplate         = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == par_empl_type && a.payrolltemplate_type == "01").ToList();
                return JSON(new { fundsource, ca_type, empType, userid, sp_cashadv_hdr_tbl_list, prevValues, sp_cashadv_dtl_tbl_list, payrolltemplate }, JsonRequestBehavior.AllowGet);

            }
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType)
        {
            try
            {
                var sp_remittance = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();
                return Json(new { sp_remittance }, JsonRequestBehavior.AllowGet);
                
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveListGrid(string par_year, string par_month, string par_empType)
        {
            try
            {
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list(par_year, par_month, par_empType).ToList();
                return Json(new { sp_cashadv_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase
            (
             string par_ca_ctrl_nbr
            , string par_voucher_nbr
            , string par_pay_period
            )
        {
            try
            {
                cashadv_dtl_tbl tbl     = new cashadv_dtl_tbl();
                tbl.ca_ctrl_nbr         = par_ca_ctrl_nbr;
                tbl.voucher_nbr         = par_voucher_nbr              ;
                tbl.pay_period          = par_pay_period               ;

                db_pacco.cashadv_dtl_tbl.Add(tbl);
                db_pacco.SaveChanges();
                return Json(new { success = 1 }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException)
            {
                return Json(new { success = 0 } , JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_voucher_nbr, string par_ca_ctrl_nbr)
        {
            try
            {
                var header_table = db_pacco.cashadv_dtl_tbl.Where(a => a.ca_ctrl_nbr == par_ca_ctrl_nbr && a.voucher_nbr == par_voucher_nbr).FirstOrDefault();
                db_pacco.cashadv_dtl_tbl.Remove(header_table);
                db_pacco.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
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
                return Json(message, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Update From Database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase
             (
              string par_ca_ctrl_nbr
            , string par_voucher_nbr
            , string par_pay_period
            )

        {
            try
            {
                cashadv_dtl_tbl tbl = db_pacco.cashadv_dtl_tbl.Where(a => a.ca_ctrl_nbr == par_ca_ctrl_nbr && a.voucher_nbr == par_voucher_nbr).SingleOrDefault();

                tbl.ca_ctrl_nbr       = par_ca_ctrl_nbr    ;
                tbl.voucher_nbr       = par_voucher_nbr    ;
                tbl.pay_period        = par_pay_period     ;
                db_pacco.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
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
                return Json(message, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cCashAdv
            (
             string par_remittance_year
            ,string par_remittance_month
            ,string par_remittance_month_descr
            ,string par_employment_type
            ,string par_employment_type_descr
            ,string par_ca_voucher_nbr
            ,string par_show_entries
            ,string par_page_nbr
            ,string par_search

            )
        {
            var PreviousValuesonPage_cCashAdv =     par_remittance_year
                                                + "," + par_remittance_month
                                                + "," + par_remittance_month_descr
                                                + "," + par_employment_type
                                                + "," + par_employment_type_descr
                                                + "," + par_ca_voucher_nbr
                                                + "," + par_show_entries
                                                + "," + par_page_nbr
                                                + "," + par_search;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cCashAdv"] = PreviousValuesonPage_cCashAdv;
            return Json(PreviousValuesonPage_cCashAdv, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Populate Voucher Nun
        //*********************************************************************//
        public ActionResult RetrieveVoucher(string par_year, string par_month, string par_empType, string par_payrolltemplate_code, string par_pay_period, string par_ca_ctrl_nbr)
        {
            try
            {
                var sp_voucher_combolist_info4 = db_pacco.sp_voucher_combolist_info4(par_year, par_month, par_empType, par_payrolltemplate_code, par_pay_period, par_ca_ctrl_nbr).ToList();
                return Json(new { sp_voucher_combolist_info4 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
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
        //                      E N D     O F     C O D E
        //*********************************************************************//
    }
}