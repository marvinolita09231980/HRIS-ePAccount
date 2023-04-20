// **********************************************************
// Page Name    : CS for Cash Advance for Payroll
// Purpose      : CS for Cash Advance for Payroll
// Created By   : Vincent Jade Alivio
// Created Date : November 28, 2019
// Updated Date : -- -- ---
// ***********************************************************
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cCashAdvController : Controller
    {
     
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role 
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

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
        public ActionResult InitializeData(string par_empType)
        {
            var department_code = Session["department_code"].ToString();
            if (Session["PreviousValuesonPage_cCashAdv"] == null || Session["PreviousValuesonPage_cCashAdv"].ToString() == "")
            {
                string[] prevValues = Session["PreviousValuesonPage_cCashAdv"].ToString().Split(new char[] { ',' });
                var empType                 = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list("", "", "").ToList();
                var ca_type                 = db_pacco.sp_cashadv_type_tbl_list().ToList();
                var fundsource              = db_pacco.sp_cashadv_fund_tbl_list().ToList();
                string userid               = Session["user_id"].ToString();
                return JSON(new { fundsource,ca_type, empType, userid, sp_cashadv_hdr_tbl_list, prevValues, department_code }, JsonRequestBehavior.AllowGet);

            }
            else
            {
                string[] prevValues = Session["PreviousValuesonPage_cCashAdv"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;
                
                var empType                 = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim()).ToList();
                var ca_type                 = db_pacco.sp_cashadv_type_tbl_list().ToList();
                var fundsource              = db_pacco.sp_cashadv_fund_tbl_list().ToList();
                string userid               = Session["user_id"].ToString();
                return JSON(new { fundsource, ca_type, empType, userid, sp_cashadv_hdr_tbl_list, prevValues, department_code }, JsonRequestBehavior.AllowGet);

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
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list(par_year,par_month, par_empType).ToList();
                return JSON(new { sp_cashadv_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/08/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GetLasCode(string par_pay_year, string par_pay_month/*, string par_empl_type*/)
        {
            try
            {
                string message = "";
                var ids = "";
                var check_tbl = db_pacco.sp_cashadv_hdr_ca_ctrl_list(par_pay_year, par_pay_month/*, par_empl_type*/).ToList();
                if (check_tbl == null || check_tbl.Count == 0)
                {
                    ids = "";
                    message = "";
                    
                }
                else
                {
                    ids = db_pacco.sp_cashadv_hdr_ca_ctrl_list(par_pay_year, par_pay_month/*, par_empl_type*/).ToList().Last();
                    message = "success";
                }
                
                return Json(new { ids, message, check_tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException)
            {
                return Json(new { success = 0 }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase
            (
            string par_ca_ctrl_nbr
            , string par_payroll_year
            , string par_payroll_month
            , string par_ca_voucher_nbr
            , string par_employment_type
            , string par_ca_short_descr
            , string par_ca_descr
            , string par_catype_code
            , string par_cafund_code
            , string par_cadisb_ofcr
            , string par_ca_status
            , string par_created_dttm
            , string par_updated_dttm
            , string par_created_user_id
            , string par_updated_user_id
            , string par_ca_doc_type
            )
            
        {
            try
            {
                string defaultdate = "1900-01-01";
                cashadv_hdr_tbl tbl = new cashadv_hdr_tbl();
                var temp = par_cadisb_ofcr;
                var ids = "";
                int id_counter = 0;
                string final_id = "";
                ids             = db_pacco.sp_cashadv_hdr_ca_ctrl_list(par_payroll_year, par_payroll_month/*, par_empl_type*/).LastOrDefault();
                id_counter      = ids == null ? 0:int.Parse((ids.ToString().Split('-')[(ids.ToString().Split('-').Length - 1)].ToString() == "" ? "0": ids.ToString().Split('-')[(ids.ToString().Split('-').Length - 1)].ToString()));
                final_id        = par_payroll_year + "-" + int.Parse(par_payroll_month).ToString("00") + "-" + (id_counter + 1).ToString("0000");

                //Update the ca_ctrl_nbr in saving to avoid error when there are two user at the same time using the current 
                //CA ctrl nbr Updated By: Joseph M. Tombo Jr. 01-27-2020
                par_ca_ctrl_nbr = (ids != null && ids.ToString() == par_ca_ctrl_nbr) ? final_id : par_ca_ctrl_nbr;
                //---------------------------------------------------------------------

                tbl.ca_ctrl_nbr         = par_ca_ctrl_nbr              ;
                tbl.payroll_year        = par_payroll_year	           ;
                tbl.payroll_month       = par_payroll_month	           ;
                tbl.ca_voucher_nbr      = par_ca_voucher_nbr           ;
                tbl.employment_type     = par_employment_type	       ;
                tbl.ca_short_descr      = par_ca_short_descr           ;
                tbl.ca_descr            = par_ca_descr		           ;
                tbl.catype_code         = par_catype_code		       ;
                tbl.cafund_code         = par_cafund_code		       ;
                tbl.cadisb_ofcr         = par_cadisb_ofcr              ;
                tbl.ca_status           = par_ca_status                ;
                tbl.ca_doc_type         = par_ca_doc_type              ;
                tbl.created_dttm        = DateTime.Now                 ;
                tbl.updated_dttm        = par_updated_dttm == "" || par_updated_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_updated_dttm);
                tbl.created_user_id     = Session["user_id"].ToString();
                tbl.updated_user_id     = par_updated_user_id           ;

                db_pacco.cashadv_hdr_tbl.Add(tbl);
                db_pacco.SaveChanges();
                return Json(new { success = 1, tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException)
            {
                return Json(new { success = 0 } , JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By  : JMTJR - Created Date : 01/26/2021
        // Description : Check Voucher Nbr
        //*********************************************************************//
        public ActionResult VoucherNBRValidation(string par_ca_ctrl_nbr, string par_ca_voucher_nbr,string action_status)
        {
            try
            {
                var var_exist = db_pacco.sp_validate_ca_voucher(par_ca_ctrl_nbr,par_ca_voucher_nbr, action_status).FirstOrDefault();

                return Json(new { message = "success", var_exist }, JsonRequestBehavior.AllowGet);
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
        // Created By  : JMTJR - Created Date : 02-02-2021
        // Description : Check Voucher Nbr
        //*********************************************************************//
        public ActionResult generateADA_NBR(string ca_fund_code, string ca_ctrl_nbr,string ca_action)
        {                                                         
            try
            {
                var ada_nbr = db_pacco.sp_generate_ada_nbr(ca_fund_code,ca_action,ca_ctrl_nbr).FirstOrDefault();

                return Json(new { message = "success", ada_nbr }, JsonRequestBehavior.AllowGet);
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
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase
             (
            string par_ca_ctrl_nbr
            , string par_ca_voucher_nbr
            , string par_payroll_year
            , string par_action
            )
        {
            try
            {
                var header_table = db_pacco.cashadv_hdr_tbl.Where(a => a.ca_ctrl_nbr == par_ca_ctrl_nbr && a.ca_voucher_nbr == par_ca_voucher_nbr && a.payroll_year == par_payroll_year).FirstOrDefault();
                if (par_action.ToLower() == "delete")
                {
                    db_pacco.cashadv_hdr_tbl.Remove(header_table);
                }
                else if (par_action.ToLower() == "void")
                {
                    header_table.ca_status = "X";
                }

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
            string par_cadisb_ofcr
            , string par_ca_ctrl_nbr
            , string par_ca_voucher_nbr
            , string par_payroll_year
            , string par_payroll_month
            , string par_employment_type
            , string par_ca_short_descr
            , string par_ca_descr
            , string par_catype_code
            , string par_cafund_code
            , string par_created_dttm
            , string par_updated_dttm
            , string par_created_user_id
            , string par_updated_user_id
            , string par_ca_doc_type
            )

        {
            try
            {
                cashadv_hdr_tbl tbl = db_pacco.cashadv_hdr_tbl.Where(a => a.ca_ctrl_nbr == par_ca_ctrl_nbr).SingleOrDefault();

                tbl.cadisb_ofcr       = par_cadisb_ofcr     ;
                tbl.ca_voucher_nbr    = par_ca_voucher_nbr  ;
                tbl.payroll_year      = par_payroll_year    ;
                tbl.payroll_month     = par_payroll_month   ;
                tbl.employment_type   = par_employment_type ;
                tbl.ca_short_descr    = par_ca_short_descr  ;
                tbl.ca_descr          = par_ca_descr        ;
                tbl.catype_code       = par_catype_code     ;
                tbl.cafund_code       = par_cafund_code     ;
                tbl.ca_doc_type       = par_ca_doc_type     ;
                //tbl.created_dttm      = par_created_dttm    ;
                tbl.updated_dttm      = DateTime.Now;
                //tbl.created_user_id   = DateTime.Now;
                tbl.updated_user_id   = Session["user_id"].ToString();
                
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


        [HttpPost]
        public ContentResult Upload()
        {
            string error_message    = "";
            Byte[] imgByte          = null;
            bool valid_image        = true;
            bool success            = false;
            string par_ca_ctrl_nbr = "";

            if (Request.Form.Count > 0)
            {

                par_ca_ctrl_nbr = Request.Form["par_ca_ctrl_nbr"].ToString();
            }

            string path = Server.MapPath("~/UploadedFile/");

            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }


            foreach (string key in Request.Files)
            {
                HttpPostedFileBase postedFile = Request.Files[key];

                string empl_directory   = "DATABASE_UPLOADS";
                string project_path     = Server.MapPath("~/UploadedFile");
                string current_path     = "";
                if (!Directory.Exists(System.IO.Path.Combine(project_path, empl_directory)))
                {
                    System.IO.Directory.CreateDirectory(System.IO.Path.Combine(project_path, empl_directory));
                    current_path = Server.MapPath("~/UploadedFile/" + empl_directory);
                }
                else
                {
                    current_path = Server.MapPath("~/UploadedFile/" + empl_directory);
                }
                postedFile.SaveAs(current_path + "/" + postedFile.FileName.ToString());

                var database_row                = db_pacco.cashadv_hdr_tbl.Where(a => a.ca_ctrl_nbr == par_ca_ctrl_nbr).FirstOrDefault();
                database_row.uploaded_by        = Session["user_id"].ToString();
                database_row.uploaded_dttm      = DateTime.Now;
                database_row.ca_status          = "U"; //U = Uploaded Database File to CA.
                database_row.database_filename  = postedFile.FileName.ToString();

                db_pacco.SaveChangesAsync();
                break;
            }

            return Content("Success" + "|" + error_message);
        }

        //*********************************************************************//
        // Created By  : JMTJR - Created Date : 02-02-2021
        // Description : Check Voucher Nbr
        //*********************************************************************//
        public ActionResult downloadFile(string par_ca_ctrl_nbr, string db_filename)
        {
            try
            {
                string output_path              = "";
                string empl_directory           = "DATABASE_UPLOADS";
                string project_path             = Server.MapPath("~/UploadedFile");
                string current_path             = "";
                current_path = Server.MapPath("~/UploadedFile/" + empl_directory);
                var database_row                = db_pacco.cashadv_hdr_tbl.Where(a => a.ca_ctrl_nbr == par_ca_ctrl_nbr).FirstOrDefault();
                database_row.downloaded_by      = Session["user_id"].ToString();
                database_row.downloaded_dttm    = DateTime.Now;
                database_row.ca_status          = "D"; 
                db_pacco.SaveChangesAsync();
                output_path             = "/UploadedFile/" + empl_directory+"/"+ db_filename;
                return Json(new { message = "success", output_path }, JsonRequestBehavior.AllowGet);
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
            ,string par_ca_status
            ,string par_ca_status_descr
            ,string par_ctrl_nbr
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
                                                + "," + par_search
                                                + "," + par_ca_status
                                                + "," + par_ca_status_descr
                                                + "," + par_ctrl_nbr;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cCashAdv"] = PreviousValuesonPage_cCashAdv;
            return Json(PreviousValuesonPage_cCashAdv, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        //                      E N D     O F     C O D E
        //*********************************************************************//
    }
}