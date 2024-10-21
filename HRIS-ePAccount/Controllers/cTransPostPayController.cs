//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Transmittal Posting Pay
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Joseph M. Tombo Jr       11/27/2019      Code Creation
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
    public class cTransPostPayController : Controller
    {
        User_Menu um                    = new User_Menu();
       
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();

        // GET: cTransPostPay
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
        public ActionResult InitializeData(string p_payroll_year, string p_payroll_month, string p_employment_type)
        {
            string[] prevValues     = null;
            if (Session["PreviousValuesonPage_cTransPostPay"] == null || Session["PreviousValuesonPage_cTransPostPay"].ToString().Trim() == "")
            {
                Session["PreviousValuesonPage_cTransPostPay"] = "";
            }
            else prevValues = Session["PreviousValuesonPage_cTransPostPay"].ToString().Split(new char[] { ',' });

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

            var employment_type     = db_pacco.vw_employmenttypes_tbl_list.ToList();
            var listgrid            = db_pacco.sp_transmital_postpay_tbl_list(p_payroll_year, p_payroll_month, p_employment_type).ToList();
            return Json(new {listgrid, employment_type, prevValues,um }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Get CA Vouchers NBR
        //*********************************************************************//
        public ActionResult GetCAVoucher(string p_payroll_year, string p_payroll_month, string p_employment_type)
        {
            var ca_vouchers_list    = db_pacco.sp_ca_vouchers_list(p_payroll_year,p_payroll_month,p_employment_type).ToList();
            var batch_nbr           = db_pacco.sp_get_batch_nbr().FirstOrDefault();
            string batch_nbr_s      = "";
            int start_pad = 4;
            if (batch_nbr == null)
            {
                batch_nbr_s = (1).ToString().PadLeft(4, '0');
            }
            else
            {
                if ((batch_nbr + 1).ToString().ToCharArray().Count() > start_pad)
                {
                    start_pad = (batch_nbr + 1).ToString().ToCharArray().Count() + 1;
                }

                batch_nbr_s = (batch_nbr+1).ToString().PadLeft(start_pad, '0');
            }
            return Json(new { ca_vouchers_list, batch_nbr_s }, JsonRequestBehavior.AllowGet);
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

                return Json(new { datalistgrid}, JsonRequestBehavior.AllowGet);
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
        public ActionResult btn_save_action(pyctrl_tbl data)
        {
            try
            {

                var batch_nbr = db_pacco.sp_get_batch_nbr().FirstOrDefault();
                string batch_nbr_s = "";
                int start_pad = 4;
                if (batch_nbr == null)
                {
                    batch_nbr_s = (1).ToString().PadLeft(4, '0');
                }
                else
                {
                    if ((batch_nbr + 1).ToString().ToCharArray().Count() > start_pad)
                    {
                        start_pad = (batch_nbr + 1).ToString().ToCharArray().Count() + 1;
                    }

                    batch_nbr_s = (batch_nbr + 1).ToString().PadLeft(start_pad, '0');
                }

                data.batch_nbr      = batch_nbr_s;
                data.created_by     = Session["user_id"].ToString();
                data.created_dttm   = DateTime.Now;
                db_pacco.pyctrl_tbl.Add(data);
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
                     a.ca_voucher_nbr == data.ca_voucher_nbr ).FirstOrDefault();
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
        // Description : Save Data to pyctrl Table
        //*********************************************************************//
        public ActionResult btn_delete_action(pyctrl_tbl data)
        {
            try
            {
                var dt = db_pacco.pyctrl_tbl.Where(a =>
                    a.batch_nbr == data.batch_nbr &&
                    a.ca_voucher_nbr == data.ca_voucher_nbr
                    ).FirstOrDefault();
                db_pacco.pyctrl_tbl.Remove(dt);
                db_pacco.SaveChanges();

                var dt2 = db_pacco.pyent_tbl.Where(a =>
                   a.batch_nbr == data.batch_nbr
                   ).ToList();
                db_pacco.pyent_tbl.RemoveRange(dt2);
                db_pacco.SaveChanges();

                return Json(new { message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description: SET PREVIOUSE VALUES
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cTransPostPay
            (
              string p_payroll_year
            , string p_payroll_month
            , string p_payroll_month_descr
            , string p_employment_type
            , string p_employment_type_descr
            , string p_batch_nbr
            , string p_ca_voucher_nbr
            , string par_show_entries
            , string par_page_nbr
            , string par_search
            , string par_can_delete
            )
        {
            var PreviousValuesonPage_cTransPostPay =    p_payroll_year
                                                + "," + p_payroll_month
                                                + "," + p_payroll_month_descr
                                                + "," + p_employment_type
                                                + "," + p_employment_type_descr
                                                + "," + p_batch_nbr
                                                + "," + p_ca_voucher_nbr
                                                + "," + par_show_entries
                                                + "," + par_page_nbr
                                                + "," + par_search
                                                + "," + par_can_delete;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cTransPostPay"] = PreviousValuesonPage_cTransPostPay;
            return Json(PreviousValuesonPage_cTransPostPay, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 12/02/2019
        // Description : Export Data as CSV file for finDes
        //*********************************************************************//
        public ActionResult btn_export_to_findes_click(string p_batch_nbr)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string output_path  = "";
                string filename     = "U_X"+p_batch_nbr+".csv";
                output_path         = Server.MapPath("../UploadedFile/" + filename);
                //filename            = p_batch_nbr +"_lbp.csv";

                //Para sa ni sa testing nga line
                //string p_output_path = "D:\\option2\\"+ filename;

                var export_message  = db_pacco.sp_lbp_posting_invoke_bcp(p_batch_nbr, output_path).FirstOrDefault();
                output_path = "/UploadedFile/" + filename;
                return JSON(new { message = "success", output_path, export_message }, JsonRequestBehavior.AllowGet);
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
    }
}