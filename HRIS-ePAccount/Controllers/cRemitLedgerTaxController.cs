//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Remittance SSS details/info
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA    10/21/2019      Code Creation
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
    public class cRemitLedgerTaxController : Controller
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
            var listgrid = db_pacco.sp_remittance_ledger_info_TAX(remittance_ctrl_nbr, p_department_code, p_starts_letter, "", "").ToList();
            return JSON(new { prevValues, listgrid, department_list }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/25/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult RetrieveListGrid(string p_department_code, string p_starts_letter)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();

            var listgrid = db_pacco.sp_remittance_ledger_info_TAX(remittance_ctrl_nbr, p_department_code, p_starts_letter, "", "").ToList();
            return JSON(new { listgrid }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JOSEPH - Created Date : 10/22/2019
        // Description :Get Letter List
        //*********************************************************************//
        public ActionResult LetterList(string p_remit_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var letter_list = db_pacco.sp_remittance_ledger_info_letter_TAX(p_remit_nbr);
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
        public ActionResult SaveADDSSSInDatabase(remittance_dtl_sss_tbl data)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                db_pacco.remittance_dtl_sss_tbl.Add(data);
                db_pacco.SaveChangesAsync();
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
        public ActionResult DeleteTAXDetails(remittance_dtl_tax_tbl data, string par_payroll_month)
        {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var dt = db_pacco.remittance_dtl_tax_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr
                    ).FirstOrDefault();
                
                var dt1 = db_pacco.remittance_dtl_tax_month_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr
                    && a.payroll_month == par_payroll_month
                    ).FirstOrDefault();

                if (dt != null) {

                    db_pacco.remittance_dtl_tax_tbl.Remove(dt);
                }

                if (dt1 != null)
                {

                    db_pacco.remittance_dtl_tax_month_tbl.Remove(dt1);
                }

                db_pacco.SaveChanges();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult ExctractToExcelTAX(string p_remittance_ctrl_nbr, string p_year, string p_month)
        {

            db_pacco.Database.CommandTimeout = int.MaxValue;
            var filePath = "";
            var message = "";
            decimal start_row = 2;
            decimal start_row_original = 2;
            decimal c_start_row_i = start_row;

            var listgrid = db_pacco.sp_remittance_ledger_info_TAX_extract(p_remittance_ctrl_nbr, "", "", "", "").ToList();
            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/TAX-JO.xlsx"));

            Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
            xlApp.DisplayAlerts = false;
            xlWorkSheet.Name = p_year + "_" + p_month + " - JO";

            try
            {
                object misValue = System.Reflection.Missing.Value;

                for (var i = 0; i < listgrid.Count(); i++)
                {

                    xlWorkSheet.get_Range("A" + c_start_row_i, "O" + c_start_row_i).Borders.Color = Color.Black;
                    xlWorkSheet.get_Range("A" + start_row_original, "O" + start_row_original).Copy(Missing.Value);
                    xlWorkSheet.get_Range("A" + c_start_row_i, "O" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                        Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                    xlWorkSheet.Cells[c_start_row_i, 1] = listgrid[i].sss_nbr;
                    xlWorkSheet.Cells[c_start_row_i, 2] = listgrid[i].empl_id;
                    xlWorkSheet.Cells[c_start_row_i, 3] = listgrid[i].last_name;
                    xlWorkSheet.Cells[c_start_row_i, 4] = listgrid[i].first_name;
                    xlWorkSheet.Cells[c_start_row_i, 5] = listgrid[i].middle_name;
                    xlWorkSheet.Cells[c_start_row_i, 6] = listgrid[i].suffix_name;
                    xlWorkSheet.Cells[c_start_row_i, 7] = listgrid[i].payrolltemplate_descr;
                    xlWorkSheet.Cells[c_start_row_i, 8] = listgrid[i].payroll_month_name;
                    xlWorkSheet.Cells[c_start_row_i, 9] = listgrid[i].gross_pay;
                    xlWorkSheet.Cells[c_start_row_i, 10] = listgrid[i].wtax_5perc;
                    xlWorkSheet.Cells[c_start_row_i, 11] = listgrid[i].wtax_3perc;
                    xlWorkSheet.Cells[c_start_row_i, 12] = listgrid[i].wtax_8perc;
                    xlWorkSheet.Cells[c_start_row_i, 13] = listgrid[i].wtax_10perc;
                    xlWorkSheet.Cells[c_start_row_i, 14] = listgrid[i].wtax_3perc + listgrid[i].wtax_5perc + listgrid[i].wtax_8perc + listgrid[i].wtax_10perc + listgrid[i].wtax_15perc + +listgrid[i].wtax_2perc;
                    xlWorkSheet.Cells[c_start_row_i, 15] = listgrid[i].voucher_nbr;
                    c_start_row_i++;

                    message = "success";

                }

                string filename = "";
                filename = "MONTHLY_TAX" + "-" + "JO" + ".xlsx";
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


                return JSON(new { message = "success", filePath }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                 message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ExctractToExcelTAXDepartment(string p_employment_type, string p_department_code, string p_year, string p_month)
        {

            db_pacco.Database.CommandTimeout = int.MaxValue;
            var filePath = "";
            var message = "";
            decimal start_row = 2;
            decimal start_row_original = 2;
            decimal c_start_row_i = start_row;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();
            var listgrid = db_pacco.sp_remittance_ledger_info_TAX_extract_dept(remittance_ctrl_nbr, p_department_code, "", "", "").ToList();
            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/TAX-JO.xlsx"));

            Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
            xlApp.DisplayAlerts = false;
            xlWorkSheet.Name = p_year + "_" + p_month + " - JO";

            try
            {
                object misValue = System.Reflection.Missing.Value;

                for (var i = 0; i < listgrid.Count(); i++)
                {

                    xlWorkSheet.get_Range("A" + c_start_row_i, "N" + c_start_row_i).Borders.Color = Color.Black;
                    xlWorkSheet.get_Range("A" + start_row_original, "N" + start_row_original).Copy(Missing.Value);
                    xlWorkSheet.get_Range("A" + c_start_row_i, "N" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                        Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                    xlWorkSheet.Cells[c_start_row_i, 1] = listgrid[i].sss_nbr;
                    xlWorkSheet.Cells[c_start_row_i, 2] = listgrid[i].empl_id;
                    xlWorkSheet.Cells[c_start_row_i, 3] = listgrid[i].last_name;
                    xlWorkSheet.Cells[c_start_row_i, 4] = listgrid[i].first_name;
                    xlWorkSheet.Cells[c_start_row_i, 5] = listgrid[i].middle_name;
                    xlWorkSheet.Cells[c_start_row_i, 6] = listgrid[i].suffix_name;
                    xlWorkSheet.Cells[c_start_row_i, 7] = listgrid[i].payrolltemplate_descr;
                    xlWorkSheet.Cells[c_start_row_i, 8] = listgrid[i].payroll_month;
                    xlWorkSheet.Cells[c_start_row_i, 9] = listgrid[i].gross_pay;
                    xlWorkSheet.Cells[c_start_row_i, 10] = listgrid[i].wtax_5perc;
                    xlWorkSheet.Cells[c_start_row_i, 11] = listgrid[i].wtax_3perc;
                    xlWorkSheet.Cells[c_start_row_i, 12] = listgrid[i].wtax_10perc;
                    xlWorkSheet.Cells[c_start_row_i, 13] = listgrid[i].wtax_3perc + listgrid[i].wtax_5perc + listgrid[i].wtax_10perc;
                    xlWorkSheet.Cells[c_start_row_i, 14] = listgrid[i].voucher_nbr;
                    c_start_row_i++;

                    message = "success";

                }

                string filename = "";
                filename = "MONTHLY_TAX" + "-" + "JO-CHECK-" + p_department_code + ".xlsx";
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


                return JSON(new { message = "success", filePath }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
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