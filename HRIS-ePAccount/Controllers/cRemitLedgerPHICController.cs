
// **********************************************************
// Page Name    : Remittance Details (PHIC)
// Purpose      : CS for Remittance Details (PHIC)
// Created By   : Vincent Jade Alivio
// Created Date : October 10, 2019
// Updated Date : October 20, 2020
// Updated By   : Jorge Rustom Villanueva
// ***********************************************************
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Excel = Microsoft.Office.Interop.Excel;
namespace HRIS_ePAccount.Controllers
{
    public class cRemitLedgerPHICController : Controller
    {
        
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();

        User_Menu um;
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            um = new User_Menu();
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            string HistoryPage = Session["history_page"].ToString().Split('/')[1];
            ViewBag.HistoryPage = HistoryPage;
            if (um != null || um.ToString() != "")
            {
                um.allow_add                    = (int)Session["allow_add"];
                um.allow_delete                 = (int)Session["allow_delete"];
                um.allow_edit                   = (int)Session["allow_edit"];
                um.allow_edit_history           = (int)Session["allow_edit_history"];
                um.allow_print                  = (int)Session["allow_print"];
                um.allow_view                   = (int)Session["allow_view"];
                um.url_name                     = Session["url_name"].ToString();
                um.id                           = (int)Session["id"];
                um.menu_name                    = Session["menu_name"].ToString();
                um.page_title                   = Session["page_title"].ToString();

                ViewBag.prevValues              = prevValues;
                ViewBag.HistoryPage             = HistoryPage;

            }
            return View(um);
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
        public ActionResult InitializeData(String ltr)
        {

            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            var sp_remittance_dtl_phic_tbl_list = db_pacco.sp_remittance_ledger_info_PHIC(prevValues[7].ToString().Trim(), "", ltr,"","").ToList();
            var sp_departments_tbl_list = db_pacco.sp_departments_tbl_list("N").ToList();
            var remit_ctrl_nbr = prevValues[7].ToString().Trim();
            var rs = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == remit_ctrl_nbr).FirstOrDefault();
            return JSON(new { prevValues, sp_remittance_dtl_phic_tbl_list, sp_departments_tbl_list, remittance_status = rs.remittance_status }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 10/21/2019
        // Description : Method that Call the RetrieveVoucherNbr
        //*********************************************************************//
        public ActionResult RetrieveVoucherNbr()
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            var sp_voucher_not_in_remittance = db_pacco.sp_voucher_not_in_remittance(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim(), prevValues[5].ToString().Trim()).ToList();
            return Json(new { sp_voucher_not_in_remittance}, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 10/22/2019
        // Description : Method that Call the RetrieveEmployee
        //*********************************************************************//

       
        public ActionResult RetrieveEmployee(string par_registry_nbr)
        {
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            var sp_payrollregistry_not_in_remittance_PHIC = db_pacco.sp_payrollregistry_not_in_remittance_PHIC(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim(), prevValues[5].ToString().Trim(), par_registry_nbr).ToList();
            return Json(new { sp_payrollregistry_not_in_remittance_PHIC }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase(remittance_dtl_phic_tbl data)
        {
            // remittance_ctrl_nbr
            // empl_id
            // voucher_nbr
            // payroll_amount_gs
            // payroll_amount_ps
            // uploaded_amount_gs
            // uploaded_amount_ps
            // override_amount_gs
            // override_amount_ps
            // remittance_status

            try
            {
                db_pacco.remittance_dtl_phic_tbl.Add(data);
                db_pacco.SaveChangesAsync();
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

        public ActionResult CheckData(sp_remittance_ledger_info_PHIC_Result data)
        {
            var rcn = data.remittance_ctrl_nbr;
            var empl_id = data.empl_id;
            var vn = data.voucher_nbr;
            var message = "";
            try
            {
                var dt = db_pacco.remittance_dtl_phic_tbl.Where(a => a.remittance_ctrl_nbr == rcn && a.empl_id == empl_id && a.voucher_nbr == vn).FirstOrDefault();
                var dt1 = db_pacco.remittance_dtl_phic_month_tbl.Where(a => a.remittance_ctrl_nbr == rcn && a.empl_id == empl_id && a.voucher_nbr == vn).FirstOrDefault();
                if (dt == null && dt1 == null)
                {
                    message = "not_found";
                }
                else
                {
                    message = "found";
                }
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }


        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(
              string par_remittance_ctrl_nbr
            , string par_empl_id
            , string par_voucher_nbr
            ,string par_payroll_month
            )
        {
            var message = "";
            
            try
            {
                
                var dt = db_pacco.remittance_dtl_phic_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_nbr && a.empl_id == par_empl_id && a.voucher_nbr == par_voucher_nbr).FirstOrDefault();
                var dt1 = db_pacco.remittance_dtl_phic_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_nbr && a.empl_id == par_empl_id && a.voucher_nbr == par_voucher_nbr && a.payroll_month == par_payroll_month).FirstOrDefault();

                if (dt == null && dt1 == null)
                {
                    message = "not_found";
                }
                else
                {
                    if (dt != null) {

                        db_pacco.remittance_dtl_phic_tbl.Remove(dt);
                    }

                    if (dt1 != null)
                    {

                        db_pacco.remittance_dtl_phic_month_tbl.Remove(dt1);
                    }

                    db_pacco.SaveChanges();
                    message = "success";
                }
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                
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
              string  par_remittance_ctrl_no
            , string par_empl_id
            , string par_phic_gs
            , string par_phic_ps
            )
        {
            string message = "";
            try
            {
                remittance_dtl_phic_tbl tbl = db_pacco.remittance_dtl_phic_tbl.Where(a => a.empl_id == par_empl_id && a.remittance_ctrl_nbr == par_remittance_ctrl_no).SingleOrDefault();
                if(tbl == null)
                {
                    message = "not_found";
                }
                else
                {
                    //tbl.remittance_ctrl_nbr = par_remittance_ctrl_no;
                    //tbl.empl_id = par_empl_id;
                    tbl.override_amount_gs = Decimal.Parse(par_phic_gs.ToString());
                    tbl.override_amount_ps = Decimal.Parse(par_phic_ps.ToString());

                    db_pacco.SaveChanges();
                    message = "success";
                }
               
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
               
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
        // Created By  : VJA - Created Date : 10/22/2019
        // Description : Upload Data
        //*********************************************************************//
        public ActionResult UploadData(string par_filename)
        {
            string message = "";
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            try
            {
                var sp_upload_file_from_PHIC = db_pacco.sp_upload_file_from_PHIC(prevValues[7].ToString().Trim(), par_filename, Session["user_id"].ToString().Trim()).ToList();
                return Json(new { sp_upload_file_from_PHIC, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                 message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
           
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult SelectLetterandDepartment(string par_department, string par_letter)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            var sp_remittance_dtl_phic_tbl_list = db_pacco.sp_remittance_ledger_info_PHIC(prevValues[7].ToString().Trim(), par_department, par_letter,"","").ToList();
            return JSON(new { sp_remittance_dtl_phic_tbl_list }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase file)
        {
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            string HistoryPage = Session["history_page"].ToString().Split('/')[1];
            ViewBag.prevValues = prevValues;
            ViewBag.HistoryPage = HistoryPage;
            
            if (file != null && file.ContentLength > 0)
                try
                {
                    string path = Path.Combine(Server.MapPath("~/UploadedFile"),
                                               Path.GetFileName(file.FileName));
                    file.SaveAs(path);
                    ViewBag.Message = "File uploaded successfully";
                }
                catch (Exception ex)
                {
                    ViewBag.Message = "ERROR:" + ex.Message.ToString();
                }
            else
            {
                ViewBag.Message = "You have not specified a file.";
            }
            return Json(new { result = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ProcessRequest(HttpContext context)
        {
            string filedata = string.Empty;
            string result = "";
            string result_msg = "Successfully Uploaded";
           
            if (context.Request.Files.Count > 0)
            {
                HttpFileCollection files = context.Request.Files;
                string par_year = context.Request["par_year"];
                string par_month = context.Request["par_month"];
                string par_account = context.Request["par_account"];
                for (int i = 0; i < files.Count; i++)
                {
                    HttpPostedFile file = files[i];
                    //if (Path.GetExtension(file.FileName).ToLower() != ".csv")
                    //{
                    //    result_msg = "Only .csv file type is allowed";
                    //    result = "N";
                    //    context.Response.ContentType = "text/plain";
                    //    context.Response.Write(result + "*" + result_msg);
                    //    return;
                    //}
                    //decimal size = Math.Round(((decimal)file.ContentLength / (decimal)1024), 2);
                    //if (size > 2048)
                    //{

                    //    result_msg = "File size should not exceed 2 MB.!";
                    //    result = "N";
                    //    context.Response.ContentType = "text/plain";
                    //    context.Response.Write(result + "*" + result_msg);
                    //    return;
                    //}

                    string fname = "jade"; 
                    //if (HttpContext.Current.Request.Browser.Browser.ToUpper() == "IE" || HttpContext.Current.Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                    //{
                    //    string[] testfiles = file.FileName.Split(new char[] {
                    //    '\\'
                    //});
                    //    fname = testfiles[testfiles.Length - 1];
                    //}
                    //if
                    //{
                    //    fname = Path.GetExtension(file.FileName);
                    //}

                    ////here UploadFile is define my folder name, where files will be store.  
                    //string uploaddir = System.Configuration.ConfigurationManager.AppSettings["Upload"];
                    filedata = "U_" + par_account + "_" + par_year + "_" + par_month + "" + fname;
                    fname = Path.Combine(context.Server.MapPath("~/UploadFile/"), filedata);
                    result_msg = fname;
                    file.SaveAs(fname);
                    //DataTable dt = MyCmn.RetrieveData("sp_othercontributionloan_stg_tbl_upload", "par_filename", fname);
                    //if (dt != null && dt.Rows.Count > 0)
                    //{
                    //    result = dt.Rows[0]["run_status"].ToString();
                    //    result_msg = dt.Rows[0]["run_message"].ToString();
                    //}
                    //else
                    //{
                    //    result = "N";
                    //    result_msg = "ERROR ON UPLOADING FILE";
                    //}
                }
            }
            context.Response.ContentType = "text/plain";
            context.Response.Write(result + "*" + result_msg);
            //if you want to use file path in aspx.cs page , then assign it in to session  
            // context.Session["PathImage"] = filedata;
            return Json(new { result }, JsonRequestBehavior.AllowGet);
        }


        //To Merge with Jade
        public int pages(int num)
        {

            int p = 0;
            if (num > 50)
            {
                double d_p = (double)num / 50;
                p = (int)Math.Ceiling(d_p);
            }
            else
            {
                p = 1;
            }
            return p;

        }


        public ActionResult ExtractToExcelJO_monthly()
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var message = "";

            var filePath = "";
            decimal start_row = 2;
            decimal start_row_original = 2;
            decimal c_start_row_i = start_row;

            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            string rmtCtrlnbr = prevValues[7].Trim().ToString();
            string rmtyear = prevValues[0].Trim().ToString();
            string rmtmonth = prevValues[1].Trim().ToString();
            var sp_remittance_PHIC_monthly_rep = db_pacco.sp_remittance_PHIC_monthly_rep(rmtCtrlnbr).ToList();

                Excel.Application xlApp = new Excel.Application();
                Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/PHIC_MONTHLY - JO.xlsx"));

                Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                xlApp.DisplayAlerts = false;
                xlWorkSheet.Name = rmtyear + "_" + rmtmonth + "JO";
            for (var i = 0; i < sp_remittance_PHIC_monthly_rep.Count(); i++)
                {

                    xlWorkSheet.get_Range("A" + c_start_row_i, "N" + c_start_row_i).Borders.Color = Color.Black;
                    xlWorkSheet.get_Range("A" + start_row_original, "N" + start_row_original).Copy(Missing.Value);
                    xlWorkSheet.get_Range("A" + c_start_row_i, "N" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                        Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                    //xlWorkSheet.Cells[c_start_row_i, 1] = (i + 1);
                    xlWorkSheet.Cells[c_start_row_i, 1] = sp_remittance_PHIC_monthly_rep[i].voucher_nbr;
                    xlWorkSheet.Cells[c_start_row_i, 2] = sp_remittance_PHIC_monthly_rep[i].empl_id;
                    xlWorkSheet.Cells[c_start_row_i, 3] = sp_remittance_PHIC_monthly_rep[i].phic_mid_nbr;
                    xlWorkSheet.Cells[c_start_row_i, 4] = sp_remittance_PHIC_monthly_rep[i].last_name;
                    xlWorkSheet.Cells[c_start_row_i, 5] = sp_remittance_PHIC_monthly_rep[i].first_name;
                    xlWorkSheet.Cells[c_start_row_i, 6] = sp_remittance_PHIC_monthly_rep[i].middle_name;
                    xlWorkSheet.Cells[c_start_row_i, 7] = sp_remittance_PHIC_monthly_rep[i].suffix_name;
                    xlWorkSheet.Cells[c_start_row_i, 8] = sp_remittance_PHIC_monthly_rep[i].payrolltemplate_descr;
                    xlWorkSheet.Cells[c_start_row_i, 9] = sp_remittance_PHIC_monthly_rep[i].monthly_rate;
                    xlWorkSheet.Cells[c_start_row_i, 10] = sp_remittance_PHIC_monthly_rep[i].gross_pay;
                    xlWorkSheet.Cells[c_start_row_i, 11] = sp_remittance_PHIC_monthly_rep[i].payroll_amount_ps;
                    xlWorkSheet.Cells[c_start_row_i, 12] = sp_remittance_PHIC_monthly_rep[i].other_ded_mand2;
                    xlWorkSheet.Cells[c_start_row_i, 13] = sp_remittance_PHIC_monthly_rep[i].posted_name;
                    xlWorkSheet.Cells[c_start_row_i, 14] = sp_remittance_PHIC_monthly_rep[i].payroll_month_name;

                    c_start_row_i++;

                    message = "success";

                }

                string filename = "";
                filename = "MONTHLY_PHIC" + "-" + "JO" + ".xlsx";
                xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                    Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                    Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                    Missing.Value, Missing.Value);
                xlWorkBook.Close();
                xlApp.Quit();
                Marshal.ReleaseComObject(xlWorkSheet);
                Marshal.ReleaseComObject(xlWorkBook);
                Marshal.ReleaseComObject(xlApp);

                filePath = "/UploadedFile/" + filename;
                message = "success";
                return JSON(new { message, sp_remittance_PHIC_monthly_rep, filePath }, JsonRequestBehavior.AllowGet);
        }
            //To Merge with Jorge
            public ActionResult ExtractToExcelCheck()
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var message = "";
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            string rmtCtrlnbr = prevValues[7].Trim().ToString();
            string rmtyear = prevValues[0].Trim().ToString();
            string rmtmonth = prevValues[1].Trim().ToString();



            int minimum_value = 10; //MINIMUM VALUE FOR LESS THAN 10 EMPLOYEES

            if (prevValues[3].Trim() == "JO") //QUARTER EXTRACT FOR JOB ORDERS
            {
                try
                {

                    decimal total_first_month = 0;
                    decimal total_second_month = 0;
                    decimal total_third_month = 0;
                    decimal total_amount_month1 = 0;

                    decimal total_payroll_first_month = 0;
                    decimal total_payroll_second_month = 0;
                    decimal total_payroll_third_month = 0;
                    decimal total_payroll_amount_month2 = 0;
                    decimal total_remitted_amount = 0;
                    decimal total_unremitted_amount = 0;
                    int qrtly_rep = 0;

                    if (rmtmonth == "01" || rmtmonth == "02" || rmtmonth == "03")
                    {
                        qrtly_rep = 1;
                    }

                    else if (rmtmonth == "04" || rmtmonth == "05" || rmtmonth == "06")
                    {
                        qrtly_rep = 2;
                    }

                    else if (rmtmonth == "07" || rmtmonth == "08" || rmtmonth == "09")
                    {
                        qrtly_rep = 3;
                    }
                    else if (rmtmonth == "10" || rmtmonth == "11" || rmtmonth == "12")
                    {
                        qrtly_rep = 4;
                    }

                    int prev_loop = 0;
                    var filePath = "";

                    decimal start_row = 15;
                    decimal start_row_original = 15;
                    decimal c_start_row_i = start_row;

                    var phic = db_pacco.sp_remittance_PHIC_qtrly_rep(rmtCtrlnbr, rmtyear, qrtly_rep).OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();

                    Excel.Application xlApp = new Excel.Application();
                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/PHIC_JO_QRTLY.xlsx"));
                    string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(rmtmonth)).Substring(0, 3);




                    Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                    xlApp.DisplayAlerts = false;
                    if (phic.Count > 0)
                    {
                        string employers_name = phic[0].organization_name;
                        Excel.Range emplr_id = xlWorkSheet.get_Range("C9");
                        emplr_id.Font.Bold = true;
                        emplr_id.Value2 = employers_name;

                        string period_covered = phic[0].period_covered;
                        Excel.Range period = xlWorkSheet.get_Range("C10");
                        period.Font.Bold = true;
                        period.Value2 = period_covered;

                        string month1_r = phic[0].month1_r.Substring(0, 3);
                        Excel.Range month1_r_descr = xlWorkSheet.get_Range("G14");
                        month1_r_descr.Font.Bold = true;
                        month1_r_descr.Value2 = month1_r;

                        string month2_r = phic[0].month2_r.Substring(0, 3);
                        Excel.Range month2_r_descr = xlWorkSheet.get_Range("H14");
                        month2_r_descr.Font.Bold = true;
                        month2_r_descr.Value2 = month2_r;

                        string month3_r = phic[0].month3_r.Substring(0, 3);
                        Excel.Range month3_r_descr = xlWorkSheet.get_Range("I14");
                        month3_r_descr.Font.Bold = true;
                        month3_r_descr.Value2 = month3_r;

                        string month1 = phic[0].month1.Substring(0, 3);
                        Excel.Range month1_descr = xlWorkSheet.get_Range("K14");
                        month1_descr.Font.Bold = true;
                        month1_descr.Value2 = month1;

                        string month2 = phic[0].month2.Substring(0, 3);
                        Excel.Range month2_descr = xlWorkSheet.get_Range("L14");
                        month2_descr.Font.Bold = true;
                        month2_descr.Value2 = month2;

                        string month3 = phic[0].month3.Substring(0, 3);
                        Excel.Range month3_descr = xlWorkSheet.get_Range("M14");
                        month3_descr.Font.Bold = true;
                        month3_descr.Value2 = month3;


                        if (prev_loop >= phic.Count)
                        {

                            for (var z = start_row_original; z < prev_loop + start_row_original; z++)
                            {
                                xlWorkSheet.get_Range("A" + start_row_original, "R" + start_row_original).Copy(Missing.Value);
                                xlWorkSheet.get_Range("A" + z, "R" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                    Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                xlWorkSheet.Cells[z, 1] = Missing.Value;
                                xlWorkSheet.Cells[z, 2] = Missing.Value;
                                xlWorkSheet.Cells[z, 3] = Missing.Value;
                                xlWorkSheet.Cells[z, 4] = Missing.Value;
                                xlWorkSheet.Cells[z, 5] = Missing.Value;
                                xlWorkSheet.Cells[z, 6] = Missing.Value;
                                xlWorkSheet.Cells[z, 7] = Missing.Value;
                                xlWorkSheet.Cells[z, 8] = Missing.Value;
                                xlWorkSheet.Cells[z, 9] = Missing.Value;
                                xlWorkSheet.Cells[z, 10] = Missing.Value;
                                xlWorkSheet.Cells[z, 11] = Missing.Value;
                                xlWorkSheet.Cells[z, 12] = Missing.Value;
                                xlWorkSheet.Cells[z, 13] = Missing.Value;
                                xlWorkSheet.Cells[z, 14] = Missing.Value;
                                xlWorkSheet.Cells[z, 15] = Missing.Value;
                                xlWorkSheet.Cells[z, 16] = Missing.Value;
                                xlWorkSheet.Cells[z, 17] = Missing.Value;
                                xlWorkSheet.Cells[z, 18] = Missing.Value;
                            }
                        }
                        prev_loop = phic.Count;

                        for (var i = 0; i < phic.Count(); i++)
                        {

                            xlWorkSheet.get_Range("A" + c_start_row_i, "R" + c_start_row_i).Borders.Color = Color.Black;
                            xlWorkSheet.get_Range("A" + start_row_original, "R" + start_row_original).Copy(Missing.Value);
                            xlWorkSheet.get_Range("A" + c_start_row_i, "R" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                            xlWorkSheet.Cells[c_start_row_i, 1] =   (i + 1);
                            xlWorkSheet.Cells[c_start_row_i, 2] =   phic[i].phic_nbr;
                            xlWorkSheet.Cells[c_start_row_i, 3] =   phic[i].last_name;
                            xlWorkSheet.Cells[c_start_row_i, 4] =   phic[i].first_name;
                            xlWorkSheet.Cells[c_start_row_i, 5] =   phic[i].middle_name;
                            xlWorkSheet.Cells[c_start_row_i, 6] =   phic[i].suffix_name;
                            xlWorkSheet.Cells[c_start_row_i, 7] =   phic[i].rep_amount_ps1;
                            xlWorkSheet.Cells[c_start_row_i, 8] =   phic[i].rep_amount_ps2;
                            xlWorkSheet.Cells[c_start_row_i, 9] =   phic[i].rep_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 10] =  phic[i].rep_amount_ps1 + phic[i].rep_amount_ps2 + phic[i].rep_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 11] =  phic[i].payroll_amount_ps1;
                            xlWorkSheet.Cells[c_start_row_i, 12] =  phic[i].payroll_amount_ps2;
                            xlWorkSheet.Cells[c_start_row_i, 13] =  phic[i].payroll_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 14] =  phic[i].payroll_amount_ps1 + phic[i].payroll_amount_ps2 + phic[i].payroll_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 15] =  phic[i].rep_amount_ps1 + phic[i].rep_amount_ps2 + phic[i].rep_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 16] =  (phic[i].rep_amount_ps1 + phic[i].rep_amount_ps2 + phic[i].rep_amount_ps3) - (phic[i].payroll_amount_ps1 + phic[i].payroll_amount_ps2 + phic[i].payroll_amount_ps3);
                            xlWorkSheet.Cells[c_start_row_i, 17] =  Missing.Value;
                            xlWorkSheet.Cells[c_start_row_i, 18] =  phic[i].empl_id;

                            total_first_month = total_first_month + Convert.ToDecimal(phic[i].payroll_amount_ps1);

                            total_second_month = total_second_month + Convert.ToDecimal(phic[i].payroll_amount_ps2);

                            total_third_month = total_third_month + Convert.ToDecimal(phic[i].payroll_amount_ps3);

                            total_amount_month1 = total_amount_month1 + (Convert.ToDecimal(phic[i].payroll_amount_ps1) + Convert.ToDecimal(phic[i].payroll_amount_ps2) + Convert.ToDecimal(phic[i].payroll_amount_ps3));

                            total_payroll_first_month = total_payroll_first_month + Convert.ToDecimal(phic[i].rep_amount_ps1);

                            total_payroll_second_month = total_payroll_second_month + Convert.ToDecimal(phic[i].rep_amount_ps2);

                            total_payroll_third_month = total_payroll_third_month + Convert.ToDecimal(phic[i].rep_amount_ps3);

                            total_payroll_amount_month2 = total_payroll_amount_month2 + (Convert.ToDecimal(phic[i].rep_amount_ps1) + Convert.ToDecimal(phic[i].rep_amount_ps2) + Convert.ToDecimal(phic[i].rep_amount_ps3));

                            total_remitted_amount   = total_payroll_amount_month2;
                            total_unremitted_amount = total_unremitted_amount + (Convert.ToDecimal(phic[i].rep_amount_ps1) + Convert.ToDecimal(phic[i].rep_amount_ps2) + Convert.ToDecimal(phic[i].rep_amount_ps3)) - (Convert.ToDecimal(phic[i].payroll_amount_ps1) + Convert.ToDecimal(phic[i].payroll_amount_ps2) + Convert.ToDecimal(phic[i].payroll_amount_ps3));

                            c_start_row_i++;


                        }

                        message = "success";
                        
                        Excel.Range grandTotal_lbl = xlWorkSheet.get_Range("A" + c_start_row_i);
                        grandTotal_lbl.Font.Bold = true;
                        grandTotal_lbl.Value2 = "TOTAL";
                        grandTotal_lbl.Merge(Missing.Value);

                        xlWorkSheet.get_Range("A" + c_start_row_i, "R" + c_start_row_i).Borders.Color = Color.Black;

                        Excel.Range total_month_one = xlWorkSheet.get_Range("K" + c_start_row_i);
                        total_month_one.Font.Bold = true;
                        total_month_one.Value2 = total_first_month;

                        Excel.Range total_month_two = xlWorkSheet.get_Range("L" + c_start_row_i);
                        total_month_two.Font.Bold = true;
                        total_month_two.Value2 = total_second_month;

                        Excel.Range total_month_there = xlWorkSheet.get_Range("M" + c_start_row_i);
                        total_month_there.Font.Bold = true;
                        total_month_there.Value2 = total_third_month;

                        Excel.Range total_amount1 = xlWorkSheet.get_Range("N" + c_start_row_i);
                        total_amount1.Font.Bold = true;
                        total_amount1.Value2 = total_amount_month1;

                        Excel.Range total_month_pay_one = xlWorkSheet.get_Range("G" + c_start_row_i);
                        total_month_pay_one.Font.Bold = true;
                        total_month_pay_one.Value2 = total_payroll_first_month;

                        Excel.Range total_month_pay_two = xlWorkSheet.get_Range("H" + c_start_row_i);
                        total_month_pay_two.Font.Bold = true;
                        total_month_pay_two.Value2 = total_payroll_second_month;

                        Excel.Range total_month_pay_there = xlWorkSheet.get_Range("I" + c_start_row_i);
                        total_month_pay_there.Font.Bold = true;
                        total_month_pay_there.Value2 = total_payroll_third_month;

                        Excel.Range total_amount_payroll1 = xlWorkSheet.get_Range("J" + c_start_row_i);
                        total_amount_payroll1.Font.Bold = true;
                        total_amount_payroll1.Value2 = total_payroll_amount_month2;

                        Excel.Range total_remitted_amount_descr = xlWorkSheet.get_Range("O" + c_start_row_i);
                        total_remitted_amount_descr.Font.Bold = true;
                        total_remitted_amount_descr.Value2 = total_remitted_amount;

                        Excel.Range total_unremitted_amount_descr = xlWorkSheet.get_Range("P" + c_start_row_i);
                        total_unremitted_amount_descr.Font.Bold = true;
                        total_unremitted_amount_descr.Value2 = total_unremitted_amount;

                        string filename = "";
                        filename = prevValues[6].Trim() + "-" + prevValues[0].Trim() + "-" + prevValues[1].Trim() + ".xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                        xlWorkBook.Close();
                        xlApp.Quit();
                        Marshal.ReleaseComObject(xlWorkSheet);
                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;
                        message = "success";
                    }

                    else
                    {
                        message = "No data extracted";
                    }
                    //LAST NI JORGE

                    return Json(new { message, filePath }, JsonRequestBehavior.AllowGet);
                }
                catch (Exception ex)
                {
                    return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
                }
            }

            else { 

            try
            {
                var filePath = "";

                var phic = db_pacco.sp_remittance_ledger_info_PHIC(rmtCtrlnbr,"", "","","").GroupBy(b => b.payroll_month).OrderBy(grouping => grouping.Max(m => m.payroll_month)).ToList();

                int prev_loop = 0;

                Excel.Application xlApp = new Excel.Application();
                Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/PHIC_CHECK.xlsx"));
                Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                xlWorkSheet = xlWorkBook.Sheets[1];
                if (phic.Count > 0)
                {
                    decimal start_row_original = 3;

                    for (int x = (phic.Count - 1); x >= 0; x--)
                    {

                        var g = phic[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();
                        
                            
                            decimal start_row = 3;
                            decimal c_start_row_i = start_row;

                            double deducted_ps_total    = 0;
                            double deducted_gs_total    = 0;
                            double deducted_tc          = 0;
                            double billing_ps_total     = 0;
                            double billing_gs_total     = 0;
                            double billing_tc           = 0;
                            double rejected_ps_total    = 0;
                            double rejected_gs_total    = 0;
                            double rejected_tc          = 0;
                            double diff_ps = 0;
                            double diff_gs = 0;

                            //int a_status_counter  = 0; ALL
                            int ne_status_counter = 0;
                            int s_status_counter = 0;
                            int nh_status_counter = 0;

                            string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(g[0].payroll_month)).Substring(0, 3);




                            //xlWorkSheet.Name = "Template";
                            xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);
                           
                            xlWorkSheet = xlWorkBook.Sheets[1];
                            xlWorkSheet.Name = monthName;

                            //string organizationName = g[0].organization_name.Trim();
                            //string OrgAddress = g[0].organization_address1.ToString();
                            //string sig_name = g[0].remittance_sig_acct_name.Trim();
                            //string sig_desg = g[0].remittance_sig_acct_desg.Trim();
                            //string applicablePeriod = g[0].applicable_period.Trim().ToString();
                            xlApp.DisplayAlerts = false;

                            //Employer PhilHealth Number
                            //string emplrPhicNbr = g[0].remittance_id1.Trim().ToString();
                            //xlWorkSheet.Cells[1, 3] = emplrPhicNbr;
                            //xlWorkSheet.Cells[1, 5] = g[0].remittance_sig1_name.Trim();
                            //
                            //xlWorkSheet.Cells[2, 3] = organizationName;
                            //xlWorkSheet.Cells[2, 5] = g[0].remittance_id2.Trim().ToString();
                            //
                            //xlWorkSheet.Cells[3, 3] = OrgAddress;
                            //xlWorkSheet.Cells[3, 6] = sig_name;
                            //xlWorkSheet.Cells[4, 6] = sig_desg;

                            // create instance name of a new created sheet
                            //Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];


                            if (prev_loop >= g.Count)
                            {
                                for (var z = start_row_original; z < prev_loop + start_row_original + 1; z++)
                                {
                                    xlWorkSheet.get_Range("A3", "V3").Copy(Missing.Value);
                                    xlWorkSheet.get_Range("A" + z, "V" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                    xlWorkSheet.Cells[z, 1] = Missing.Value;
                                    xlWorkSheet.Cells[z, 2] = Missing.Value;
                                    xlWorkSheet.Cells[z, 3] = Missing.Value;
                                    xlWorkSheet.Cells[z, 4] = Missing.Value;
                                    xlWorkSheet.Cells[z, 5] = Missing.Value;
                                    xlWorkSheet.Cells[z, 6] = Missing.Value;
                                    xlWorkSheet.Cells[z, 7] = Missing.Value;
                                    xlWorkSheet.Cells[z, 8] = Missing.Value;
                                    xlWorkSheet.Cells[z, 9] = Missing.Value;
                                    xlWorkSheet.Cells[z, 10] = Missing.Value;
                                    xlWorkSheet.Cells[z, 11] = Missing.Value;
                                    xlWorkSheet.Cells[z, 12] = Missing.Value;
                                    xlWorkSheet.Cells[z, 13] = Missing.Value;
                                    xlWorkSheet.Cells[z, 14] = Missing.Value;
                                    xlWorkSheet.Cells[z, 15] = Missing.Value;
                                    xlWorkSheet.Cells[z, 16] = Missing.Value;
                                    xlWorkSheet.Cells[z, 17] = Missing.Value;
                                    xlWorkSheet.Cells[z, 18] = Missing.Value;
                                    xlWorkSheet.Cells[z, 19] = Missing.Value;
                                    xlWorkSheet.Cells[z, 20] = Missing.Value;
                                    xlWorkSheet.Cells[z, 21] = Missing.Value;
                                    xlWorkSheet.Cells[z, 22] = Missing.Value;
                                }
                            }
                            prev_loop = g.Count;


                            for (var i = 0; i < g.Count(); i++)
                            {
                                xlWorkSheet.get_Range("A" + start_row, "V" + start_row).Borders.Color = Color.Black;
                                xlWorkSheet.get_Range("A3", "V3").Copy(Missing.Value);
                                xlWorkSheet.get_Range("A" + c_start_row_i, "V" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                xlWorkSheet.Cells[c_start_row_i, 1] = g[i].voucher_nbr;
                                xlWorkSheet.Cells[c_start_row_i, 2] = g[i].empl_id;
                                xlWorkSheet.Cells[c_start_row_i, 3] = g[i].phic_nbr;
                                xlWorkSheet.Cells[c_start_row_i, 4] = g[i].last_name;
                                xlWorkSheet.Cells[c_start_row_i, 5] = g[i].first_name;
                                xlWorkSheet.Cells[c_start_row_i, 6] = g[i].middle_name;
                                xlWorkSheet.Cells[c_start_row_i, 7] = g[i].suffix_name;
                                xlWorkSheet.Cells[c_start_row_i, 8] = g[i].monthly_rate;
                                xlWorkSheet.Cells[c_start_row_i, 9] = Missing.Value;
                                xlWorkSheet.Cells[c_start_row_i, 10] = Missing.Value;
                                xlWorkSheet.Cells[c_start_row_i, 11] = Convert.ToDouble(g[i].grid_amount_ps);
                                xlWorkSheet.Cells[c_start_row_i, 12] = Convert.ToDouble(g[i].grid_amount_gs);
                                xlWorkSheet.Cells[c_start_row_i, 13] = Convert.ToDouble(g[i].grid_amount_ps) + Convert.ToDouble(g[i].grid_amount_gs);
                                xlWorkSheet.Cells[c_start_row_i, 14] = Convert.ToDouble(g[i].uploaded_amount_ps);
                                xlWorkSheet.Cells[c_start_row_i, 15] = Convert.ToDouble(g[i].uploaded_amount_gs);
                                xlWorkSheet.Cells[c_start_row_i, 16] = Convert.ToDouble(g[i].uploaded_amount_ps) + Convert.ToDouble(g[i].uploaded_amount_gs);
                                xlWorkSheet.Cells[c_start_row_i, 17] = Convert.ToDouble(g[i].uploaded_amount_ps) - Convert.ToDouble(g[i].grid_amount_ps);
                                xlWorkSheet.Cells[c_start_row_i, 18] = Convert.ToDouble(g[i].uploaded_amount_gs) - Convert.ToDouble(g[i].grid_amount_gs);
                                xlWorkSheet.Cells[c_start_row_i, 19] = (Convert.ToDouble(g[i].uploaded_amount_ps) - Convert.ToDouble(g[i].grid_amount_ps)) + (Convert.ToDouble(g[i].uploaded_amount_gs) - Convert.ToDouble(g[i].grid_amount_gs));
                                xlWorkSheet.Cells[c_start_row_i, 20] = Convert.ToDouble(g[i].other_ded_mand2); //PS
                                xlWorkSheet.Cells[c_start_row_i, 21] = Convert.ToDouble(g[i].other_ded_mand1); //GS
                                xlWorkSheet.Cells[c_start_row_i, 22] = Missing.Value;
                                
                                    //ps_total
                                c_start_row_i++;

                               deducted_ps_total = deducted_ps_total + Convert.ToDouble(g[i].grid_amount_ps);
                               deducted_gs_total = deducted_gs_total + Convert.ToDouble(g[i].grid_amount_gs);
                               deducted_tc       = deducted_tc + (Convert.ToDouble(g[i].grid_amount_ps) + Convert.ToDouble(g[i].grid_amount_gs));
                               billing_ps_total  = billing_ps_total + Convert.ToDouble(g[i].uploaded_amount_ps);
                               billing_gs_total  = billing_gs_total + Convert.ToDouble(g[i].uploaded_amount_gs);
                               billing_tc = billing_tc + (Convert.ToDouble(g[i].uploaded_amount_ps) + Convert.ToDouble(g[i].uploaded_amount_gs));
                               rejected_ps_total = rejected_ps_total + ((Convert.ToDouble(g[i].uploaded_amount_ps) - Convert.ToDouble(g[i].grid_amount_ps)));
                               rejected_gs_total = rejected_gs_total + ((Convert.ToDouble(g[i].uploaded_amount_gs) - Convert.ToDouble(g[i].grid_amount_gs)));
                               rejected_tc = rejected_tc + (Convert.ToDouble(g[i].uploaded_amount_ps) - Convert.ToDouble(g[i].grid_amount_ps)) + (Convert.ToDouble(g[i].uploaded_amount_gs) - Convert.ToDouble(g[i].grid_amount_gs));

                               diff_ps = diff_ps + Convert.ToDouble(g[i].other_ded_mand2);
                               diff_gs = diff_gs + Convert.ToDouble(g[i].other_ded_mand1);

                            }
                            monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(g[0].payroll_month)).ToString().ToUpper();

                                 
                            Excel.Range rowRange  =  xlWorkSheet.get_Range("A" + c_start_row_i, "V" + c_start_row_i);
                            rowRange.Borders.Color = Color.Black;
                            rowRange.Font.Name = "Calibri";
                            rowRange.Font.Bold = true;
                            xlWorkSheet.Cells[c_start_row_i, 11] = deducted_ps_total;
                            xlWorkSheet.Cells[c_start_row_i, 12] = deducted_gs_total;
                            xlWorkSheet.Cells[c_start_row_i, 13] = deducted_tc;
                            xlWorkSheet.Cells[c_start_row_i, 14] = billing_ps_total;
                            xlWorkSheet.Cells[c_start_row_i, 15] = billing_gs_total;
                            xlWorkSheet.Cells[c_start_row_i, 16] = billing_tc;
                            xlWorkSheet.Cells[c_start_row_i, 17] = rejected_ps_total;
                            xlWorkSheet.Cells[c_start_row_i, 18] = rejected_gs_total;
                            xlWorkSheet.Cells[c_start_row_i, 19] = rejected_tc;
                            xlWorkSheet.Cells[c_start_row_i, 20] = diff_ps;
                            xlWorkSheet.Cells[c_start_row_i, 21] = diff_gs;

                            //if (x == 0)
                            //{
                               
                            //}

                        




                    }


                        string filename = "";
                        filename = prevValues[6].Trim() + "-" + prevValues[0].Trim() + "-" + prevValues[1].Trim() + ".xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                        xlWorkBook.Close();
                        xlApp.Quit();
                        Marshal.ReleaseComObject(xlWorkSheet);
                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;
                        message = "success";






                    }
                else
                {
                    message = "No data extracted";
                }

                return Json(new { message, filePath }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception ex)
            {
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
            }
        }

        //To Merge with Jade
        public ActionResult ExtractToExcel()
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var message = "";
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            string rmtCtrlnbr = prevValues[7].Trim().ToString();
            string rmtyear = prevValues[0].Trim().ToString();
            string rmtmonth = prevValues[1].Trim().ToString();


            if (prevValues[3].Trim() == "JO") //QUARTER EXTRACT FOR JOB ORDERS
            {
                try {

                    decimal total_first_month   = 0;
                    decimal total_second_month  = 0;
                    decimal total_third_month   = 0;
                    decimal total_amount_month1 = 0;

                    decimal total_payroll_first_month   = 0;
                    decimal total_payroll_second_month  = 0;
                    decimal total_payroll_third_month   = 0;
                    decimal total_payroll_amount_month2 = 0;

                    decimal total_remitted_amount = 0;
                    decimal total_unremitted_amount = 0;

                    int qrtly_rep = 0;

                    if (rmtmonth == "01" || rmtmonth == "02" || rmtmonth == "03") {
                        qrtly_rep = 1;
                    }

                    else if (rmtmonth == "04" || rmtmonth == "05" || rmtmonth == "06")
                    {
                        qrtly_rep = 2;
                    }

                    else if (rmtmonth == "07" || rmtmonth == "08" || rmtmonth == "09")
                    {
                        qrtly_rep = 3;
                    }
                    else if (rmtmonth == "10" || rmtmonth == "11" || rmtmonth == "12")
                    {
                        qrtly_rep = 4;
                    }

                    int prev_loop = 0;
                    var filePath = "";

                    decimal start_row = 15;
                    decimal start_row_original = 15;
                    decimal c_start_row_i = start_row;

                    var phic = db_pacco.sp_remittance_PHIC_qtrly_rep(rmtCtrlnbr, rmtyear, qrtly_rep).OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();

                    Excel.Application xlApp = new Excel.Application();
                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/PHIC_JO_QRTLY.xlsx"));
                    string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(rmtmonth)).Substring(0, 3);




                    Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                    xlApp.DisplayAlerts = false;
                    if (phic.Count > 0)
                    {
                        string employers_name = phic[0].organization_name;
                        Excel.Range emplr_id = xlWorkSheet.get_Range("C9");
                        emplr_id.Font.Bold = true;
                        emplr_id.Value2 = employers_name;

                        string period_covered = phic[0].period_covered;
                        Excel.Range period = xlWorkSheet.get_Range("C10");
                        period.Font.Bold = true;
                        period.Value2 = period_covered;

                        string month1_r = phic[0].month1_r.Substring(0, 3);
                        Excel.Range month1_r_descr = xlWorkSheet.get_Range("G14");
                        month1_r_descr.Font.Bold = true;
                        month1_r_descr.Value2 = month1_r;

                        string month2_r = phic[0].month2_r.Substring(0, 3);
                        Excel.Range month2_r_descr = xlWorkSheet.get_Range("H14");
                        month2_r_descr.Font.Bold = true;
                        month2_r_descr.Value2 = month2_r;

                        string month3_r = phic[0].month3_r.Substring(0, 3);
                        Excel.Range month3_r_descr = xlWorkSheet.get_Range("I14");
                        month3_r_descr.Font.Bold = true;
                        month3_r_descr.Value2 = month3_r;

                        string month1 = phic[0].month1.Substring(0, 3);
                        Excel.Range month1_descr = xlWorkSheet.get_Range("K14");
                        month1_descr.Font.Bold = true;
                        month1_descr.Value2 = month1;

                        string month2 = phic[0].month2.Substring(0, 3);
                        Excel.Range month2_descr = xlWorkSheet.get_Range("L14");
                        month2_descr.Font.Bold = true;
                        month2_descr.Value2 = month2;

                        string month3 = phic[0].month3.Substring(0, 3);
                        Excel.Range month3_descr = xlWorkSheet.get_Range("M14");
                        month3_descr.Font.Bold = true;
                        month3_descr.Value2 = month3;


                        if (prev_loop >= phic.Count)
                        {

                            for (var z = start_row_original; z < prev_loop + start_row_original; z++)
                            {
                                xlWorkSheet.get_Range("A" + start_row_original, "R" + start_row_original).Copy(Missing.Value);
                                xlWorkSheet.get_Range("A" + z, "R" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                    Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                xlWorkSheet.Cells[z, 1] = Missing.Value;
                                xlWorkSheet.Cells[z, 2] = Missing.Value;
                                xlWorkSheet.Cells[z, 3] = Missing.Value;
                                xlWorkSheet.Cells[z, 4] = Missing.Value;
                                xlWorkSheet.Cells[z, 5] = Missing.Value;
                                xlWorkSheet.Cells[z, 6] = Missing.Value;
                                xlWorkSheet.Cells[z, 7] = Missing.Value;
                                xlWorkSheet.Cells[z, 8] = Missing.Value;
                                xlWorkSheet.Cells[z, 9] = Missing.Value;
                                xlWorkSheet.Cells[z, 10] = Missing.Value;
                                xlWorkSheet.Cells[z, 11] = Missing.Value;
                                xlWorkSheet.Cells[z, 12] = Missing.Value;
                                xlWorkSheet.Cells[z, 13] = Missing.Value;
                                xlWorkSheet.Cells[z, 14] = Missing.Value;
                                xlWorkSheet.Cells[z, 15] = Missing.Value;
                                xlWorkSheet.Cells[z, 16] = Missing.Value;
                                xlWorkSheet.Cells[z, 17] = Missing.Value;
                                xlWorkSheet.Cells[z, 18] = Missing.Value;
                            }
                        }
                        prev_loop = phic.Count;

                        for (var i = 0; i < phic.Count(); i++)
                        {

                            xlWorkSheet.get_Range("A" + c_start_row_i, "R" + c_start_row_i).Borders.Color = Color.Black;
                            xlWorkSheet.Cells[c_start_row_i, 1] = (i + 1);
                            xlWorkSheet.Cells[c_start_row_i, 2] = phic[i].phic_nbr;
                            xlWorkSheet.Cells[c_start_row_i, 3] = phic[i].last_name;
                            xlWorkSheet.Cells[c_start_row_i, 4] = phic[i].first_name;
                            xlWorkSheet.Cells[c_start_row_i, 5] = phic[i].middle_name;
                            xlWorkSheet.Cells[c_start_row_i, 6] = phic[i].suffix_name;
                            xlWorkSheet.Cells[c_start_row_i, 7] = phic[i].rep_amount_ps1;
                            xlWorkSheet.Cells[c_start_row_i, 8] = phic[i].rep_amount_ps2;
                            xlWorkSheet.Cells[c_start_row_i, 9] = phic[i].rep_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 10] = phic[i].rep_amount_ps1 + phic[i].rep_amount_ps2 + phic[i].rep_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 11] = phic[i].payroll_amount_ps1;
                            xlWorkSheet.Cells[c_start_row_i, 12] = phic[i].payroll_amount_ps2;
                            xlWorkSheet.Cells[c_start_row_i, 13] = phic[i].payroll_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 14] = phic[i].payroll_amount_ps1 + phic[i].payroll_amount_ps2 + phic[i].payroll_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 15] = phic[i].rep_amount_ps1 + phic[i].rep_amount_ps2 + phic[i].rep_amount_ps3;
                            xlWorkSheet.Cells[c_start_row_i, 16] = (phic[i].rep_amount_ps1 + phic[i].rep_amount_ps2 + phic[i].rep_amount_ps3) - (phic[i].payroll_amount_ps1 + phic[i].payroll_amount_ps2 + phic[i].payroll_amount_ps3);
                            xlWorkSheet.Cells[c_start_row_i, 17] = Missing.Value;
                            xlWorkSheet.Cells[c_start_row_i, 18] = phic[i].empl_id;

                            total_first_month = total_first_month + Convert.ToDecimal(phic[i].payroll_amount_ps1);

                            total_second_month = total_second_month + Convert.ToDecimal(phic[i].payroll_amount_ps2);

                            total_third_month = total_third_month + Convert.ToDecimal(phic[i].payroll_amount_ps3);

                            total_amount_month1 = total_amount_month1 + (Convert.ToDecimal(phic[i].payroll_amount_ps1) + Convert.ToDecimal(phic[i].payroll_amount_ps2) + Convert.ToDecimal(phic[i].payroll_amount_ps3));

                            total_payroll_first_month = total_payroll_first_month + Convert.ToDecimal(phic[i].rep_amount_ps1);

                            total_payroll_second_month = total_payroll_second_month + Convert.ToDecimal(phic[i].rep_amount_ps2);

                            total_payroll_third_month = total_payroll_third_month + Convert.ToDecimal(phic[i].rep_amount_ps3);

                            total_payroll_amount_month2 = total_payroll_amount_month2 + (Convert.ToDecimal(phic[i].rep_amount_ps1) + Convert.ToDecimal(phic[i].rep_amount_ps2) + Convert.ToDecimal(phic[i].rep_amount_ps3));

                            total_remitted_amount = total_payroll_amount_month2;
                            total_unremitted_amount = total_unremitted_amount + (Convert.ToDecimal(phic[i].rep_amount_ps1) + Convert.ToDecimal(phic[i].rep_amount_ps2) + Convert.ToDecimal(phic[i].rep_amount_ps3)) - (Convert.ToDecimal(phic[i].payroll_amount_ps1) + Convert.ToDecimal(phic[i].payroll_amount_ps2) + Convert.ToDecimal(phic[i].payroll_amount_ps3));



                            c_start_row_i++;


                        }

                        message = "success";

                        Excel.Range grandTotal_lbl = xlWorkSheet.get_Range("A" + c_start_row_i);
                        grandTotal_lbl.Font.Bold = true;
                        grandTotal_lbl.Value2 = "TOTAL";
                        grandTotal_lbl.Merge(Missing.Value);

                        xlWorkSheet.get_Range("A" + c_start_row_i, "R" + c_start_row_i).Borders.Color = Color.Black;

                        Excel.Range total_month_one     = xlWorkSheet.get_Range("K" + c_start_row_i);
                        total_month_one.Font.Bold       = true;
                        total_month_one.Value2          = total_first_month;

                        Excel.Range total_month_two     = xlWorkSheet.get_Range("L" + c_start_row_i);
                        total_month_two.Font.Bold       = true;
                        total_month_two.Value2          = total_second_month;

                        Excel.Range total_month_there   = xlWorkSheet.get_Range("M" + c_start_row_i);
                        total_month_there.Font.Bold     = true;
                        total_month_there.Value2        = total_third_month;

                        Excel.Range total_amount1       = xlWorkSheet.get_Range("N" + c_start_row_i);
                        total_amount1.Font.Bold         = true;
                        total_amount1.Value2            = total_amount_month1;


                        Excel.Range total_month_pay_one = xlWorkSheet.get_Range("G" + c_start_row_i);
                        total_month_pay_one.Font.Bold = true;
                        total_month_pay_one.Value2 = total_payroll_first_month;

                        Excel.Range total_month_pay_two = xlWorkSheet.get_Range("H" + c_start_row_i);
                        total_month_pay_two.Font.Bold = true;
                        total_month_pay_two.Value2 = total_payroll_second_month;

                        Excel.Range total_month_pay_there = xlWorkSheet.get_Range("I" + c_start_row_i);
                        total_month_pay_there.Font.Bold = true;
                        total_month_pay_there.Value2 = total_payroll_third_month;

                        Excel.Range total_amount_payroll1 = xlWorkSheet.get_Range("J" + c_start_row_i);
                        total_amount_payroll1.Font.Bold = true;
                        total_amount_payroll1.Value2 = total_payroll_amount_month2;

                        Excel.Range total_remitted_amount_descr = xlWorkSheet.get_Range("O" + c_start_row_i);
                        total_remitted_amount_descr.Font.Bold = true;
                        total_remitted_amount_descr.Value2 = total_remitted_amount;

                        Excel.Range total_unremitted_amount_descr = xlWorkSheet.get_Range("P" + c_start_row_i);
                        total_unremitted_amount_descr.Font.Bold = true;
                        total_unremitted_amount_descr.Value2 = total_unremitted_amount;

                        string filename = "";
                        filename = prevValues[6].Trim() + "-" + prevValues[0].Trim() + "-" + prevValues[1].Trim() + ".xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                        xlWorkBook.Close();
                        xlApp.Quit();
                        Marshal.ReleaseComObject(xlWorkSheet);
                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;
                        message = "success";
                    }

                    else
                    {
                        message = "No data extracted";
                    }

                    return Json(new { message, filePath }, JsonRequestBehavior.AllowGet);
                }
                catch (Exception ex)
                {
                    return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
                }
            }


            else //FOR REGULAR AND CASUAL
            {


                int minimum_value = 10; //MINIMUM VALUE FOR LESS THAN 10 EMPLOYEES
                int prev_loop = 0;
                try
                {
                    var filePath = "";

                    var phic = db_pacco.sp_new_remittance_PHIC_rep(rmtCtrlnbr, rmtyear, rmtmonth).GroupBy(b => b.payroll_month).OrderBy(grouping => grouping.Max(m => m.payroll_month)).ToList();

                    string b_day = "";
                    string b_month = "";
                    string b_year = "";

                    Excel.Application xlApp = new Excel.Application();
                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/RF1_PHIC_TEMPLATE.xlsx"));

                    if (phic.Count > 0)
                    {

                        for (int x = (phic.Count - 1); x >= 0; x--)
                        {

                            var g = phic[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();



                            //FOR MORE THAN 10 EMPLOYEES FORMAT
                            if (g.Count() > minimum_value)
                            {

                                decimal start_row = 7;
                                decimal c_start_row_i = start_row;
                                int start_row_original = 7;
                                double ps_total = 0;
                                double gs_total = 0;

                                //int a_status_counter  = 0; ALL
                                int ne_status_counter = 0;
                                int s_status_counter = 0;
                                int nh_status_counter = 0;

                                string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(g[0].payroll_month)).Substring(0, 3);



                                Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                                //xlWorkSheet.Name = "Template";


                                if (x == (phic.Count - 1))
                                {
                                    // assign name to the new created sheet
                                    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName;
                                }
                                else
                                {
                                    //Create a copy of the last sheet for second tab
                                    xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[xlWorkBook.Sheets.Count]);
                                    // assign name to the new created sheet
                                    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName;


                                }

                                if (prev_loop >= g.Count)
                                {
                                    for (var z = start_row_original; z < prev_loop + start_row_original; z++)
                                    {
                                        xlWorkSheet.get_Range("A" + start_row_original, "AC" + start_row_original).Copy(Missing.Value);
                                        xlWorkSheet.get_Range("A" + z, "AC" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                        xlWorkSheet.Cells[z, 1] = Missing.Value;
                                        xlWorkSheet.Cells[z, 2] = Missing.Value;
                                        xlWorkSheet.Cells[z, 3] = Missing.Value;
                                        xlWorkSheet.Cells[z, 4] = Missing.Value;
                                        xlWorkSheet.Cells[z, 5] = Missing.Value;
                                        xlWorkSheet.Cells[z, 6] = Missing.Value;
                                        xlWorkSheet.Cells[z, 7] = Missing.Value;
                                        xlWorkSheet.Cells[z, 8] = Missing.Value;
                                        xlWorkSheet.Cells[z, 9] = Missing.Value;
                                        xlWorkSheet.Cells[z, 10] = Missing.Value;
                                        xlWorkSheet.Cells[z, 14] = Missing.Value;
                                        xlWorkSheet.Cells[z, 15] = Missing.Value;
                                        xlWorkSheet.Cells[z, 29] = Missing.Value;
                                    }
                                }
                                prev_loop = g.Count;



                                string organizationName = g[0].organization_name.Trim();
                                string OrgAddress = g[0].organization_address1.ToString();
                                string sig_name = g[0].remittance_sig_acct_name.Trim();
                                string sig_desg = g[0].remittance_sig_acct_desg.Trim();
                                string applicablePeriod = g[0].applicable_period.Trim().ToString();
                                string remittance_sig1_name = g[0].remittance_sig1_name.Trim();
                                string remittance_id2 = g[0].remittance_id2.Trim().ToString();

                                xlApp.DisplayAlerts = false;

                                //Employer PhilHealth Number
                                string emplrPhicNbr = g[0].remittance_id1.Trim().ToString();
                                xlWorkSheet.Cells[1, 3] = emplrPhicNbr;
                                xlWorkSheet.Cells[1, 5] = remittance_sig1_name;

                                xlWorkSheet.Cells[2, 3] = organizationName;
                                xlWorkSheet.Cells[2, 5] = remittance_id2;

                                xlWorkSheet.Cells[3, 3] = OrgAddress;
                                xlWorkSheet.Cells[3, 6] = sig_name;
                                xlWorkSheet.Cells[4, 6] = sig_desg;

                                // create instance name of a new created sheet
                                //Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                                for (var i = 0; i < g.Count(); i++)
                                {
                                    b_day = g[i].birth_date.Day.ToString();
                                    b_month = g[i].birth_date.Month.ToString();
                                    b_year = g[i].birth_date.Year.ToString();

                                    xlWorkSheet.get_Range("A" + c_start_row_i, "AC" + c_start_row_i).Borders.Color = Color.Black;
                                    xlWorkSheet.get_Range("A" + start_row_original, "AC" + start_row_original).Copy(Missing.Value);
                                    xlWorkSheet.get_Range("A" + c_start_row_i, "AC" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                        Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                    xlWorkSheet.Cells[c_start_row_i, 1] = (i + 1);
                                    xlWorkSheet.Cells[c_start_row_i, 2] = g[i].phic_nbr;
                                    xlWorkSheet.Cells[c_start_row_i, 3] = g[i].last_name;
                                    xlWorkSheet.Cells[c_start_row_i, 4] = g[i].suffix_name;
                                    xlWorkSheet.Cells[c_start_row_i, 5] = g[i].first_name;
                                    xlWorkSheet.Cells[c_start_row_i, 6] = g[i].middle_name;
                                    xlWorkSheet.Cells[c_start_row_i, 7] = g[i].monthly_rate;
                                    xlWorkSheet.Cells[c_start_row_i, 8] = g[i].employee_status;
                                    xlWorkSheet.Cells[c_start_row_i, 9] = g[i].effective_month.ToString() + "/" + g[i].effective_day.ToString() + "/" + g[i].effective_year.ToString();
                                    xlWorkSheet.Cells[c_start_row_i, 10] = b_month+ "/" + b_day + "/" + b_year;
                                    xlWorkSheet.Cells[c_start_row_i, 14] = g[i].rep_amount_ps;
                                    xlWorkSheet.Cells[c_start_row_i, 15] = g[i].rep_amount_gs;
                                    xlWorkSheet.Cells[c_start_row_i, 29] = g[i].gender;

                                    ps_total = ps_total + Convert.ToDouble(g[i].rep_amount_ps);
                                    gs_total = gs_total + Convert.ToDouble(g[i].rep_amount_ps);

                                    if (g[i].employee_status.ToUpper() == "NH")
                                    {

                                        nh_status_counter = nh_status_counter + 1;
                                    }
                                    else if (g[i].employee_status.ToUpper() == "NE")
                                    {

                                        ne_status_counter = ne_status_counter + 1;
                                    }
                                    else if (g[i].employee_status.ToUpper() == "S")
                                    {

                                        s_status_counter = s_status_counter + 1;
                                    }
                                    c_start_row_i++;


                                }
                                monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(g[0].payroll_month)).ToString().ToUpper();
                                xlWorkSheet.Cells[2, 8] = ps_total;
                                xlWorkSheet.Cells[3, 8] = gs_total;
                                xlWorkSheet.Cells[4, 8] = monthName;
                                xlWorkSheet.Cells[4, 10] = rmtyear;
                                xlWorkSheet.Cells[1, 15] = g.Count();
                                xlWorkSheet.Cells[2, 15] = ne_status_counter;
                                xlWorkSheet.Cells[3, 15] = s_status_counter;
                                xlWorkSheet.Cells[4, 15] = nh_status_counter;

                                //Close Excel File
                                if (x == 0)
                                {
                                    string filename = "";
                                    filename = prevValues[6].Trim() + "-" + prevValues[0].Trim() + "-" + prevValues[1].Trim() + ".xlsx";
                                    xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                                        Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                                        Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                                        Missing.Value, Missing.Value);
                                    xlWorkBook.Close();
                                    xlApp.Quit();
                                    Marshal.ReleaseComObject(xlWorkSheet);
                                    Marshal.ReleaseComObject(xlWorkBook);
                                    Marshal.ReleaseComObject(xlApp);

                                    filePath = "/UploadedFile/" + filename;
                                    message = "success";
                                }

                            }

                            else
                            {

                                string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(g[0].payroll_month)).Substring(0, 3);
                                string monthName_descr = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(g[0].payroll_month));
                                //Excel.Application xlApp = new Excel.Application();
                                //
                                //Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/PHIC.xlsx"));
                                Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count - 1];
                             
                                int rowCounter = 0;

                                if (x == (phic.Count - 1))
                                {
                                    // assign name to the new created sheet
                                    xlWorkBook.Sheets[1].Name = monthName;
                                }
                                else
                                {

                                    //Create a copy of the last sheet for second tab
                                    xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);
                                    // assign name to the new created sheet

                                    xlWorkSheet.Name = monthName;

                                }

                             

                                //LAST NAKO 2020-12-11

                                //assign name to the new created sheet
                                //xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName + "(" + (i + 1) + ")";

                                // create instance name of a new created sheet
                                //Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[1];

                                string organizationName = g[0].organization_name.Trim();
                                string OrgAddress = g[0].organization_address1.ToString();
                                string sig_name = g[0].remittance_sig_acct_name.Trim();
                                string sig_desg = g[0].remittance_sig_acct_desg.Trim();
                                string applicablePeriod = monthName_descr + " "+ g[0].remittance_year.ToString();
                                xlApp.DisplayAlerts = false;




                                //Employer PhilHealth Number
                                string emplrPhicNbr = g[0].remittance_id1.Trim().ToString();
                                xlWorkSheet.Cells[3, 10] = emplrPhicNbr[0].ToString();
                                xlWorkSheet.Cells[3, 11] = emplrPhicNbr[1].ToString();
                                xlWorkSheet.Cells[3, 13] = emplrPhicNbr[2].ToString();
                                xlWorkSheet.Cells[3, 14] = emplrPhicNbr[3].ToString();
                                Excel.Range PQ2 = xlWorkSheet.get_Range("O3", "P3");
                                PQ2.Value2 = emplrPhicNbr[5].ToString();
                                Excel.Range RS2 = xlWorkSheet.get_Range("Q3", "R3");
                                RS2.Value2 = emplrPhicNbr[6].ToString();
                                xlWorkSheet.Cells[3, 19] = emplrPhicNbr[7].ToString();
                                xlWorkSheet.Cells[3, 20] = emplrPhicNbr[8].ToString();
                                xlWorkSheet.Cells[3, 21] = emplrPhicNbr[10].ToString();
                                xlWorkSheet.Cells[3, 22] = emplrPhicNbr[11].ToString();
                                xlWorkSheet.Cells[3, 23] = emplrPhicNbr[12].ToString();
                                xlWorkSheet.Cells[3, 25] = emplrPhicNbr[13].ToString();


                                //Employer TIN number
                                string emplrTIN = g[0].remittance_id2.Trim().ToString();
                                xlWorkSheet.Cells[5, 10] = emplrTIN[0].ToString();
                                xlWorkSheet.Cells[5, 11] = emplrTIN[1].ToString();
                                xlWorkSheet.Cells[5, 12] = emplrTIN[2].ToString();
                                xlWorkSheet.Cells[5, 14] = emplrTIN[4].ToString();
                                Excel.Range PQ4 = xlWorkSheet.get_Range("O5", "P5");
                                PQ4.Value2 = emplrPhicNbr[5].ToString();
                                Excel.Range RS4 = xlWorkSheet.get_Range("Q5", "R5");
                                RS4.Value2 = emplrPhicNbr[6].ToString();
                                xlWorkSheet.Cells[5, 20] = emplrTIN[8].ToString();
                                xlWorkSheet.Cells[5, 21] = emplrTIN[9].ToString();
                                xlWorkSheet.Cells[5, 22] = emplrTIN[10].ToString();

                                // Complete Employer Name
                                Excel.Range org_name = xlWorkSheet.get_Range("K7", "AD7");
                                org_name.Value2 = organizationName;
                                org_name.Merge(Missing.Value);

                                // Complete Mailing Address barangay-municipality-province
                                Excel.Range org_address = xlWorkSheet.get_Range("A9", "AD9");
                                org_address.Value2 = OrgAddress;
                                org_address.Merge(Missing.Value);

                                // Applicable Period
                                Excel.Range app_period = xlWorkSheet.get_Range("AQ8", "AT10");
                                app_period.Value2 = applicablePeriod;


                                var tabLen = phic.Count;

                                int start_row = 14; // start row of details



                                decimal ps_total = 0;
                                decimal gs_total = 0;
                                int nbrPaxpRow = 0;

                                if (prev_loop >= g.Count)
                                {
                                    for (var z = start_row; z < prev_loop + start_row; z++)
                                    {
                                        xlWorkSheet.get_Range("A" + start_row, "AT" + start_row).Copy(Missing.Value);
                                        xlWorkSheet.get_Range("A" + z, "AT" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                        Excel.Range nbr = xlWorkSheet.get_Range("A" + start_row);
                                      
                                        nbr.Font.Size = 8;

                                        // (PIN) Pag-IBIG Identification Number
                                        xlWorkSheet.Cells[z, 3] = Missing.Value;
                                        xlWorkSheet.Cells[z, 4] = Missing.Value;
                                        xlWorkSheet.Cells[z, 6] = Missing.Value;
                                        xlWorkSheet.Cells[z, 7] = Missing.Value;
                                        xlWorkSheet.Cells[z, 8] = Missing.Value;
                                        xlWorkSheet.Cells[z, 9] = Missing.Value;
                                        xlWorkSheet.Cells[z, 10] = Missing.Value;
                                        xlWorkSheet.Cells[z, 11] = Missing.Value;
                                        xlWorkSheet.Cells[z, 12] = Missing.Value;
                                        xlWorkSheet.Cells[z, 13] = Missing.Value;
                                        xlWorkSheet.Cells[z, 14] = Missing.Value;
                                        xlWorkSheet.Cells[z, 16] = Missing.Value;

                                        // Employees Information
                                        Excel.Range R_U = xlWorkSheet.get_Range("R" + z, "W" + z);
                                        R_U.Merge(Missing.Value);
                                        R_U.Value2 = Missing.Value;

                                        Excel.Range X_AB = xlWorkSheet.get_Range("X" + z, "AB" + z);
                                        X_AB.Merge(Missing.Value);
                                        X_AB.Value2 = Missing.Value;

                                        Excel.Range AD = xlWorkSheet.get_Range("AC" + z);
                                        AD.Value2 = Missing.Value;

                                        Excel.Range AD_AG = xlWorkSheet.get_Range("AD" + z, "AG" + z);
                                        AD_AG.Merge(Missing.Value);
                                        AD_AG.Value2 = Missing.Value;

                                        // Date of Birth
                                        Excel.Range AJ_AL = xlWorkSheet.get_Range("AH" + z);
                                        AJ_AL.Value2 = Missing.Value;
                                        Excel.Range AM_AN = xlWorkSheet.get_Range("AI" + z);
                                        AM_AN.Value2 = Missing.Value;
                                        Excel.Range AO = xlWorkSheet.get_Range("AJ" + z);
                                        AO.Value2 = Missing.Value;

                                        //Gender
                                        Excel.Range AP_AQ = xlWorkSheet.get_Range("AK" + z);
                                        AP_AQ.Value2 = Missing.Value;

                                        //Monthly Salary Bracket
                                        Excel.Range AL_AM = xlWorkSheet.get_Range("AL" + z, "AM" + z); // Monthly salary   // no data in sp_new_remittance_PHIC_rep as of November 3,2019
                                        AL_AM.Merge(Missing.Value);
                                        AL_AM.Value2 = Missing.Value;                                                   // bracket          // to be updated if data is available

                                        // Amount PS
                                        Excel.Range AN_AO = xlWorkSheet.get_Range("AN" + z, "AO" + z);
                                        AN_AO.Merge(Missing.Value);
                                        AN_AO.Value2 = Missing.Value;

                                        // Amount ES
                                        Excel.Range BA_BB = xlWorkSheet.get_Range("AP" + z);
                                        BA_BB.Value2 = Missing.Value;

                                        Excel.Range AQ = xlWorkSheet.get_Range("AQ" + z);
                                        AQ.Value2 = Missing.Value;

                                        Excel.Range AR = xlWorkSheet.get_Range("AR" + z);
                                        AR.Value2 = Missing.Value;

                                        Excel.Range AS = xlWorkSheet.get_Range("AS" + z);
                                        AS.Value2 = Missing.Value;

                                        Excel.Range AT = xlWorkSheet.get_Range("AT" + z);
                                        AT.Value2 = Missing.Value;

                                        //row range
                                        Excel.Range rowRange = xlWorkSheet.get_Range("A" + z, "AT" + z);
                                        rowRange.Borders.Color = Color.Black;
                                        rowRange.Font.Name = "Calibri";
                                        rowRange.Font.Size = 10;
                                    }
                                }
                                prev_loop = g.Count;

                                for (int r = 0; r < minimum_value; r++)
                                {

                                    if (rowCounter == g.Count())
                                    {
                                        Excel.Range nbr = xlWorkSheet.get_Range("A" + start_row);
                                        nbr.Value2 = r + 1;
                                        nbr.Font.Size = 8;

                                        // (PIN) Pag-IBIG Identification Number
                                        xlWorkSheet.Cells[start_row, 3] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 4] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 6] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 7] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 8] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 9] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 10] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 11] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 12] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 13] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 14] = Missing.Value;
                                        xlWorkSheet.Cells[start_row, 16] = Missing.Value;

                                        // Employees Information
                                        Excel.Range R_U = xlWorkSheet.get_Range("R" + start_row, "W" + start_row);
                                        R_U.Merge(Missing.Value);
                                        R_U.Value2 = Missing.Value;

                                        Excel.Range X_AB = xlWorkSheet.get_Range("X" + start_row, "AB" + start_row);
                                        X_AB.Merge(Missing.Value);
                                        X_AB.Value2 = Missing.Value;

                                        Excel.Range AD = xlWorkSheet.get_Range("AC" + start_row);
                                        AD.Value2 = Missing.Value;

                                        Excel.Range AD_AG = xlWorkSheet.get_Range("AD" + start_row, "AG" + start_row);
                                        AD_AG.Merge(Missing.Value);
                                        AD_AG.Value2 = Missing.Value;

                                        // Date of Birth
                                        Excel.Range AJ_AL = xlWorkSheet.get_Range("AH" + start_row);
                                        AJ_AL.Value2 = Missing.Value;
                                        Excel.Range AM_AN = xlWorkSheet.get_Range("AI" + start_row);
                                        AM_AN.Value2 = Missing.Value;
                                        Excel.Range AO = xlWorkSheet.get_Range("AJ" + start_row);
                                        AO.Value2 = Missing.Value;

                                        //Gender
                                        Excel.Range AP_AQ = xlWorkSheet.get_Range("AK" + start_row);
                                        AP_AQ.Value2 = Missing.Value;

                                        //Monthly Salary Bracket
                                        Excel.Range AL_AM = xlWorkSheet.get_Range("AL" + start_row, "AM" + start_row); // Monthly salary   // no data in sp_new_remittance_PHIC_rep as of November 3,2019
                                        AL_AM.Merge(Missing.Value);
                                        AL_AM.Value2 = Missing.Value;                                                   // bracket          // to be updated if data is available

                                        // Amount PS
                                        Excel.Range AN_AO = xlWorkSheet.get_Range("AN" + start_row, "AO" + start_row);
                                        AN_AO.Merge(Missing.Value);
                                        AN_AO.Value2 = Missing.Value;

                                        // Amount ES
                                        Excel.Range BA_BB = xlWorkSheet.get_Range("AP" + start_row);
                                        BA_BB.Value2 = Missing.Value;

                                        Excel.Range AQ = xlWorkSheet.get_Range("AQ" + start_row);
                                        AQ.Value2 = Missing.Value;

                                        Excel.Range AR = xlWorkSheet.get_Range("AR" + start_row);
                                        AR.Value2 = Missing.Value;

                                        Excel.Range AS = xlWorkSheet.get_Range("AS" + start_row);
                                        AS.Value2 = Missing.Value;

                                        Excel.Range AT = xlWorkSheet.get_Range("AT" + start_row);
                                        AT.Value2 = Missing.Value;

                                        //row range
                                        Excel.Range rowRange = xlWorkSheet.get_Range("A" + start_row, "AT" + start_row);
                                        rowRange.Borders.Color = Color.Black;
                                        rowRange.Font.Name = "Calibri";
                                        rowRange.Font.Size = 10;
                                        start_row += 1;

                                    }
                                    else
                                    {
                                         b_day = g[rowCounter].birth_date.Day.ToString();
                                         b_month = g[rowCounter].birth_date.Month.ToString();
                                         b_year = g[rowCounter].birth_date.Year.ToString();

                                        Excel.Range nbr = xlWorkSheet.get_Range("A" + start_row);
                                        nbr.Value2 = r + 1;
                                        nbr.Font.Size = 8;

                                        // (PIN) Pag-IBIG Identification Number
                                        xlWorkSheet.Cells[start_row, 3] = g[rowCounter].phic_nbr01.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 4] = g[rowCounter].phic_nbr02.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 6] = g[rowCounter].phic_nbr03.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 7] = g[rowCounter].phic_nbr04.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 8] = g[rowCounter].phic_nbr05.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 9] = g[rowCounter].phic_nbr06.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 10] = g[rowCounter].phic_nbr07.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 11] = g[rowCounter].phic_nbr08.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 12] = g[rowCounter].phic_nbr09.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 13] = g[rowCounter].phic_nbr10.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 14] = g[rowCounter].phic_nbr11.Trim().ToString();
                                        xlWorkSheet.Cells[start_row, 16] = g[rowCounter].phic_nbr12.Trim().ToString();



                                        // Employees Information
                                        Excel.Range R_U = xlWorkSheet.get_Range("R" + start_row, "W" + start_row);
                                        R_U.Merge(Missing.Value);
                                        R_U.Value2 = g[rowCounter].last_name.Trim().ToString();

                                        Excel.Range X_AB = xlWorkSheet.get_Range("X" + start_row, "AB" + start_row);
                                        X_AB.Merge(Missing.Value);
                                        X_AB.Value2 = g[rowCounter].first_name.Trim().ToString();

                                        Excel.Range AD = xlWorkSheet.get_Range("AC" + start_row);
                                        AD.Value2 = g[rowCounter].suffix_name.Trim().ToString();
                                        Excel.Range AD_AG = xlWorkSheet.get_Range("AD" + start_row, "AG" + start_row);
                                        AD_AG.Merge(Missing.Value);
                                        AD_AG.Value2 = g[rowCounter].middle_name.Trim().ToString();

                                        // Date of Birth
                                        Excel.Range AJ_AL = xlWorkSheet.get_Range("AH" + start_row);
                                        AJ_AL.Value2 = b_month;
                                        Excel.Range AM_AN = xlWorkSheet.get_Range("AI" + start_row);
                                        AM_AN.Value2 = b_day;
                                        Excel.Range AO = xlWorkSheet.get_Range("AJ" + start_row);
                                        AO.Value2 = b_year;

                                        //Gender
                                        Excel.Range AP_AQ = xlWorkSheet.get_Range("AK" + start_row);
                                        AP_AQ.Value2 = g[rowCounter].gender.Trim().ToString();

                                        //Monthly Salary Bracket
                                        Excel.Range AL_AM = xlWorkSheet.get_Range("AL" + start_row, "AM" + start_row); // Monthly salary   // no data in sp_new_remittance_PHIC_rep as of November 3,2019
                                        AL_AM.Merge(Missing.Value);
                                        AL_AM.Value2 = Missing.Value;                                                   // bracket          // to be updated if data is available

                                        // Amount PS
                                        Excel.Range AN_AO = xlWorkSheet.get_Range("AN" + start_row, "AO" + start_row);
                                        AN_AO.Merge(Missing.Value);
                                        AN_AO.Value2 = g[rowCounter].rep_amount_ps.ToString();

                                        // Amount ES
                                        Excel.Range BA_BB = xlWorkSheet.get_Range("AP" + start_row);
                                        BA_BB.Value2 = g[rowCounter].rep_amount_ps.ToString();
                                        ps_total += Convert.ToDecimal(g[rowCounter].rep_amount_ps.ToString());
                                        gs_total += Convert.ToDecimal(g[rowCounter].rep_amount_gs.ToString());

                                        Excel.Range AQ = xlWorkSheet.get_Range("AQ" + start_row);
                                        AQ.Value2 = Missing.Value;

                                        Excel.Range AR = xlWorkSheet.get_Range("AR" + start_row);
                                        AR.Value2 = Missing.Value;

                                        Excel.Range AS = xlWorkSheet.get_Range("AS" + start_row);
                                        AS.Value2 = Missing.Value;

                                        Excel.Range AT = xlWorkSheet.get_Range("AT" + start_row);
                                        AT.Value2 = Missing.Value;

                                        if (g[rowCounter].employee_status == "NH")
                                        {
                                            xlWorkSheet.get_Range("AQ" + start_row).Value2 = g[rowCounter].employee_status;
                                            xlWorkSheet.get_Range("AR" + start_row).Value2 = g[rowCounter].effective_month;
                                            xlWorkSheet.get_Range("AS" + start_row).Value2 = g[rowCounter].effective_day;
                                            xlWorkSheet.get_Range("AT" + start_row).Value2 = g[rowCounter].effective_year;
                                        }

                                        else
                                        {

                                        }

                                        Excel.Range rowRange = xlWorkSheet.get_Range("A" + start_row, "AT" + start_row);
                                        rowRange.Borders.Color = Color.Black;
                                        rowRange.Font.Name = "Calibri";
                                        rowRange.Font.Size = 10;
                                        start_row += 1;
                                        rowCounter += 1;
                                        nbrPaxpRow += 1;
                                        tabLen = -1;
                                    }
                                }


                                //FOOTER


                                //DIVIDER ROW
                                Excel.Range DIV_ROW = xlWorkSheet.get_Range("A" + (start_row), "AT" + (start_row));
                                DIV_ROW.RowHeight = 0.04;

                                start_row += 1;

                                //label no. 11
                                Excel.Range label_11 = xlWorkSheet.get_Range("A" + start_row);
                                label_11.Borders.Color = Color.Black;
                                label_11.Value2 = "11";

                                //Title in no. 11
                                Excel.Range title_11 = xlWorkSheet.get_Range("B" + start_row, "AF" + start_row);
                                title_11.Merge(Missing.Value);
                                title_11.Borders.Color = Color.Black;
                                title_11.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                title_11.Font.Bold = true;
                                title_11.Font.Name = "Calibri";
                                title_11.Font.Size = 11;
                                title_11.Value2 = "ACKNOWLEDGEMENT RECEIPT (ME-/POR/OR/PAR)";

                                //label no. 12
                                Excel.Range label_12 = xlWorkSheet.get_Range("AG" + start_row);
                                label_12.Borders.Color = Color.Black;
                                label_12.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                label_12.Value2 = "12";
                                xlWorkSheet.get_Range("AH" + start_row, "AM" + start_row).Merge(Missing.Value);

                                //label no. 13
                                Excel.Range label_13 = xlWorkSheet.get_Range("AQ" + start_row);
                                label_13.Borders.Color = Color.Black;
                                label_13.Value2 = "13";
                                xlWorkSheet.get_Range("AR" + start_row, "AT" + start_row).Merge(Missing.Value);
                                xlWorkSheet.get_Range("AR" + start_row, "AT" + start_row).Borders.Color = Color.Black;
                                //PS value
                                Excel.Range PS_VAL = xlWorkSheet.get_Range("AN" + start_row, "AO" + (start_row + 2));
                                PS_VAL.Value2 = ps_total;
                                PS_VAL.Merge(Missing.Value);

                                //GS value
                                Excel.Range GS_VAL = xlWorkSheet.get_Range("AP" + start_row, "AP" + (start_row + 2));
                                GS_VAL.Value2 = gs_total;
                                GS_VAL.Merge(Missing.Value);

                                Excel.Range Range2 = xlWorkSheet.get_Range("AN" + start_row, "AP" + (start_row + 2));
                                Range2.Borders.Color = Color.Black;
                                Range2.Font.Bold = true;
                                Range2.Font.Name = "Calibri";
                                Range2.Font.Size = 11;
                                Range2.HorizontalAlignment = Excel.XlHAlign.xlHAlignRight;
                                Range2.VerticalAlignment = Excel.XlVAlign.xlVAlignCenter;

                                start_row += 1;



                                //Applicable Period Title
                                Excel.Range AP_TITLE = xlWorkSheet.get_Range("A" + start_row, "G" + (start_row + 1));
                                AP_TITLE.Value2 = "APPLICABLE PERIOD";
                                AP_TITLE.Merge(Missing.Value);

                                //Remitted Amount Title
                                Excel.Range RA_TITLE = xlWorkSheet.get_Range("H" + start_row, "N" + (start_row + 1));
                                RA_TITLE.Borders.Color = Color.Black;
                                RA_TITLE.Font.Bold = true;
                                RA_TITLE.Font.Name = "Calibri";
                                RA_TITLE.Font.Size = 11;
                                RA_TITLE.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                RA_TITLE.Value2 = "REMITTED AMOUNT";
                                RA_TITLE.Merge(Missing.Value);


                                //AKNOWLEDGEMENT RECEIPT NO. Title
                                Excel.Range ARN_TITLE = xlWorkSheet.get_Range("O" + start_row, "W" + (start_row + 1));
                                ARN_TITLE.Value2 = "ACKNOWLEDGEMENT RECEIPT NO.";
                                ARN_TITLE.Merge(Missing.Value);

                                //TRANSACTION DATE Title
                                Excel.Range TD_TITLE = xlWorkSheet.get_Range("X" + start_row, "AB" + (start_row + 1));
                                TD_TITLE.Value2 = "TRANSACTION DATE";
                                TD_TITLE.Merge(Missing.Value);

                                //NO. OF EMPLOYEES Title
                                Excel.Range NOE_TITLE = xlWorkSheet.get_Range("AC" + start_row, "AF" + (start_row + 1));
                                NOE_TITLE.Value2 = "NO. OF EMPLOYEES";
                                NOE_TITLE.Merge(Missing.Value);

                                //To be accomplished on the last page..
                                Excel.Range TO_BE = xlWorkSheet.get_Range("AG" + start_row, "AM" + (start_row + 3));
                                TO_BE.Borders.Color = Color.Black;
                                TO_BE.Font.Name = "Calibri";
                                TO_BE.Font.Size = 11;
                                TO_BE.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                TO_BE.Value2 = "(To be accomplished on the last page)";
                                TO_BE.Merge(Missing.Value);
                                TO_BE.WrapText = true;

                                //signatory_name
                                Excel.Range SIG_NAME = xlWorkSheet.get_Range("AQ" + start_row, "AT" + (start_row + 1));
                                SIG_NAME.Borders.Color = Color.Black;
                                SIG_NAME.Font.Name = "Calibri";
                                SIG_NAME.Font.Bold = true;
                                SIG_NAME.Font.Size = 9;
                                SIG_NAME.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                SIG_NAME.Value2 = sig_name.ToUpper();
                                SIG_NAME.Merge(Missing.Value);

                                Excel.Range RANGE1 = xlWorkSheet.get_Range("A" + start_row, "AF" + (start_row + 1));
                                RANGE1.Borders.Color = Color.Black;
                                RANGE1.Font.Bold = true;
                                RANGE1.Font.Name = "Calibri";
                                RANGE1.Font.Size = 11;
                                RANGE1.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                RANGE1.VerticalAlignment = Excel.XlVAlign.xlVAlignCenter;
                                RANGE1.WrapText = true;

                                start_row += 2;

                                //APPLICABLE PERIOD VALUE
                                Excel.Range AP_VAL = xlWorkSheet.get_Range("A" + start_row, "G" + (start_row + 1));
                                AP_VAL.Borders.Color = Color.Black;
                                AP_VAL.Font.Size = 12;
                                AP_VAL.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                AP_VAL.VerticalAlignment = Excel.XlVAlign.xlVAlignCenter;
                                AP_VAL.Value2 = applicablePeriod;
                                AP_VAL.Merge(Missing.Value);

                                //REMITTED AMOUNT VALUE
                                Excel.Range RA_VAL = xlWorkSheet.get_Range("H" + start_row, "N" + (start_row + 1));
                                RA_VAL.Borders.Color = Color.Black;
                                RA_VAL.Font.Size = 12;
                                RA_VAL.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                RA_VAL.VerticalAlignment = Excel.XlVAlign.xlVAlignCenter;
                                RA_VAL.Value2 = gs_total + ps_total;
                                RA_VAL.Merge(Missing.Value);

                                //AKNOWLEDGEMENT RECEIPT NO. VALUE
                                Excel.Range ARN_VAL = xlWorkSheet.get_Range("O" + start_row, "W" + (start_row + 1));
                                ARN_VAL.Borders.Color = Color.Black;
                                ARN_VAL.Value2 = Missing.Value;
                                ARN_VAL.Merge(Missing.Value);

                                //TRANSACTON DATE VALUE
                                Excel.Range TD_VAL = xlWorkSheet.get_Range("X" + start_row, "AB" + (start_row + 1));
                                TD_VAL.Borders.Color = Color.Black;
                                TD_VAL.Value2 = Missing.Value;
                                TD_VAL.Merge(Missing.Value);

                                //NO. OF EMPLOYEES VALUE
                                Excel.Range NOE_VAL = xlWorkSheet.get_Range("AC" + start_row, "AF" + (start_row + 1));
                                NOE_VAL.Borders.Color = Color.Black;
                                NOE_VAL.Font.Bold = true;
                                NOE_VAL.Font.Size = 14;
                                NOE_VAL.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                NOE_VAL.VerticalAlignment = Excel.XlVAlign.xlVAlignCenter;
                                NOE_VAL.Value2 = nbrPaxpRow;
                                NOE_VAL.Merge(Missing.Value);

                                //GS PS Total
                                Excel.Range GS_PS_VAL = xlWorkSheet.get_Range("AN" + start_row, "AP" + (start_row + 1));
                                GS_PS_VAL.Borders.Color = Color.Black;
                                GS_PS_VAL.Font.Bold = true;
                                GS_PS_VAL.Font.Name = "Calibri";
                                GS_PS_VAL.Font.Size = 11;
                                GS_PS_VAL.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                GS_PS_VAL.VerticalAlignment = Excel.XlVAlign.xlVAlignCenter;
                                GS_PS_VAL.Value2 = gs_total + ps_total;
                                GS_PS_VAL.Merge(Missing.Value);

                                //Signature over printed name
                                Excel.Range SOPN = xlWorkSheet.get_Range("AQ" + start_row, "AT" + start_row);
                                SOPN.Font.Bold = true;
                                SOPN.Font.Name = "Calibri";
                                SOPN.Font.Size = 6;
                                SOPN.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                SOPN.VerticalAlignment = Excel.XlVAlign.xlVAlignTop;
                                SOPN.Value2 = "Signature over printed name";
                                SOPN.Merge(Missing.Value);

                                xlWorkSheet.get_Range("AQ" + start_row, "AT" + (start_row + 1)).Borders.Color = Color.Black;

                                start_row += 1;

                                //Signatory Designation
                                Excel.Range SIG_DESG = xlWorkSheet.get_Range("AQ" + start_row, "AT" + start_row);
                                SIG_DESG.Font.Size = 9;
                                SIG_DESG.VerticalAlignment = Excel.XlVAlign.xlVAlignBottom;
                                SIG_DESG.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                                SIG_DESG.Value2 = sig_desg;
                                SIG_DESG.Merge(Missing.Value);
                                System.Runtime.InteropServices.Marshal.ReleaseComObject(xlWorkSheet);

                               

                                //Close Excel File
                                if (x == 0)
                                {
                                    string filename = "";
                                    filename = prevValues[6].Trim() + "-" + prevValues[0].Trim() + "-" + prevValues[1].Trim() + ".xlsx";
                                    xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                                        Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                                        Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                                        Missing.Value, Missing.Value);
                                    xlWorkBook.Close();
                                    xlApp.Quit();
                                    Marshal.ReleaseComObject(xlWorkSheet);
                                    Marshal.ReleaseComObject(xlWorkBook);
                                    Marshal.ReleaseComObject(xlApp);

                                    filePath = "/UploadedFile/" + filename;
                                    message = "success";
                                }

                            }



                        }









                    }
                    else
                    {
                        message = "No data extracted";
                    }

                    return Json(new { message, filePath }, JsonRequestBehavior.AllowGet);

                }
                catch (Exception ex)
                {
                    return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
                }

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

        public ActionResult BackPage(string par_year, string par_month, string par_report_type)
        {
            string message = "";
            Session["history_page"] = Request.UrlReferrer.ToString();

            db_pacco.Database.CommandTimeout = int.MaxValue;

            var sp_uploaded_data_PHIC = db_pacco.sp_uploaded_data_PHIC(par_year, par_month, par_report_type).ToList();

            if (sp_uploaded_data_PHIC.Count > 0)
            {
                message = "success";
            }
            else
            {
                message = "fail";
            }

            return Json(new { message}, JsonRequestBehavior.AllowGet);
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
        //*********************************************************************//
        //                      E N D     O F     C O D E
        //*********************************************************************//
    }
}