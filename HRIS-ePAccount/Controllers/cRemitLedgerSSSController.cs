//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Remittance SSS details/info
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Joseph M. Tombo Jr       10/21/2019      Code Creation
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
    static class DateTimeExtensions
    {
        public static string ToMonthName(this DateTime dateTime)
        {
            return CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(dateTime.Month);
        }

        public static string ToShortMonthName(this DateTime dateTime)
        {
            return CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(dateTime.Month);
        }
    }
    public class cRemitLedgerSSSController : Controller
    {
        
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        string remittance_ctrl_nbr  = "";
        string remittance_year      = "";
        string remittance_month     = "";
        string employment_type      = "";
        string remittance_type      = "";
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
            remittance_year     = prevValues[0].ToString().Trim();
            remittance_month    = prevValues[1].ToString().Trim();
            employment_type     = prevValues[3].ToString().Trim();
            remittance_type     = prevValues[5].ToString().Trim();
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
            string excelExportServer = System.Configuration.ConfigurationManager.AppSettings["ExcelExportServerIP"];
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            remittance_ctrl_nbr = prevValues[7].ToString().Trim();
            remittance_year = prevValues[0].ToString().Trim();
            remittance_month = prevValues[1].ToString().Trim();
            employment_type = prevValues[3].ToString().Trim();
            remittance_type = prevValues[5].ToString().Trim();
            var department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);
            var listgrid = db_pacco.sp_remittance_ledger_info_SSS(remittance_ctrl_nbr, p_department_code, p_starts_letter, p_batch_nbr,"","").ToList();
            return JSON(new { prevValues, listgrid, department_list, excelExportServer}, JsonRequestBehavior.AllowGet);
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

            var listgrid = db_pacco.sp_remittance_ledger_info_SSS(remittance_ctrl_nbr, p_department_code, p_starts_letter, p_batch_nbr,"","").ToList();
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
            remittance_year     = prevValues[0].ToString().Trim();
            remittance_month    = prevValues[1].ToString().Trim();
            employment_type     = prevValues[3].ToString().Trim();
            remittance_type     = prevValues[5].ToString().Trim();

            var voucher_list = db_pacco.sp_voucher_not_in_remittance_SSS(remittance_year,remittance_month,employment_type,remittance_type, p_batch_nbr).ToList();
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
            remittance_year     = prevValues[0].ToString().Trim();
            remittance_month    = prevValues[1].ToString().Trim();
            employment_type     = prevValues[3].ToString().Trim();
            remittance_type     = prevValues[5].ToString().Trim();

            var employee_names = db_pacco.sp_payrollregistry_not_in_remittance_SSS(remittance_year, remittance_month, employment_type, remittance_type,par_payrollregistry_nbr, p_batch_nbr).ToList();
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
                    a.remittance_ctrl_nbr   == data.remittance_ctrl_nbr &&
                    a.empl_id               == data.empl_id &&
                    a.voucher_nbr           == data.voucher_nbr).FirstOrDefault();
                rmt.payroll_amount          = data.payroll_amount;
                rmt.remittance_status       = data.remittance_status;
                rmt.remittance_ctrl_ref     = data.remittance_ctrl_ref;

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
        public ActionResult DeleteSSSDetails(sp_remittance_ledger_info_SSS_Result data)
        {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var dt = db_pacco.remittance_dtl_sss_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr
                    ).FirstOrDefault();

                db_pacco.Database.CommandTimeout = int.MaxValue;
                var dt1 = db_pacco.remittance_dtl_sss_month_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr
                    && a.payroll_month == data.payroll_month
                    ).FirstOrDefault();

                if (dt != null)
                {
                    db_pacco.remittance_dtl_sss_tbl.Remove(dt);
                }

                if (dt1 != null)
                {
                    db_pacco.remittance_dtl_sss_month_tbl.Remove(dt1);
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


        public ActionResult ExctractToExcelSSS(string p_employment_type, string p_employmenttype_descr, string p_remittance_year,int p_quarter_rep, string p_empl_id, int p_batch_nbr, string p_sq_m)
        {

            db_pacco.Database.CommandTimeout = int.MaxValue;
            var filePath = "";
            string  templateX = "";
                    templateX = p_sq_m == "Q" ? "SSSExtractTemplate.xlsx": "SSSExtractTemplateMonthly.xlsx";
            Excel.Application xlApp     = new Excel.Application();
            Excel.Workbook xlWorkBook   = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/"+ templateX));
          

            try
            {
                if (p_sq_m == "Q")
                {
                    Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                    object misValue             = System.Reflection.Missing.Value;
                    var SSS_result = db_pacco.sp_remittance_SSS_qtrly_rep(p_employment_type, p_remittance_year, p_quarter_rep, p_empl_id, p_batch_nbr).ToList();
                    //decimal overall_amount = 0;
                    string month_1 = "";
                    string month_2 = "";
                    string month_3 = "";
                    string applicable_quarter = "";
                    if (p_quarter_rep == 1)
                    {
                        month_1 = "January";
                        month_2 = "February";
                        month_3 = "March";
                        applicable_quarter = "1ST QUARTER OF " + p_remittance_year;
                    }
                    else if (p_quarter_rep == 2)
                    {
                        month_1 = "April";
                        month_2 = "May";
                        month_3 = "June";
                        applicable_quarter = "2ND QUARTER OF " + p_remittance_year;
                    }
                    else if (p_quarter_rep == 3)
                    {
                        month_1 = "July";
                        month_2 = "August";
                        month_3 = "September";
                        applicable_quarter = "3RD QUARTER OF " + p_remittance_year;
                    }
                    else if (p_quarter_rep == 4)
                    {
                        month_1 = "October";
                        month_2 = "November";
                        month_3 = "December";
                        applicable_quarter = "4TH QUARTER OF " + p_remittance_year;
                    }


                    if (SSS_result.Count > 0)
                    {
                        //DisplayAlert so that the excel will not popup
                        xlApp.DisplayAlerts = false;

                        int start_row = 7;
                        xlWorkSheet.Cells[1, 1] = "NAME OF LGU: PROVINCIAL GOVERNMENT OF COMPOSTELA VALLEY " + "-" + p_employmenttype_descr;
                        xlWorkSheet.Cells[2, 1] = "APPLICABLE QUARTER:" + applicable_quarter;
                        //xlWorkSheet.Cells[2, 1].Text[19-1].Font.Bold = true;
                        xlWorkSheet.Cells[6, 5] = month_1;
                        xlWorkSheet.Cells[6, 6] = month_2;
                        xlWorkSheet.Cells[6, 7] = month_3;
                        decimal total_1 = 0;
                        decimal total_2 = 0;
                        decimal total_3 = 0;

                        for (int i = 0; i < SSS_result.Count; i++)
                        {
                            xlWorkSheet.get_Range("A7", "M7").Copy(Missing.Value);

                            //Paste the copy template to the next target start row
                            xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                            xlWorkSheet.Cells[start_row, 1] = "";
                            xlWorkSheet.Cells[start_row, 2] = "";
                            xlWorkSheet.Cells[start_row, 3] = "";
                            xlWorkSheet.Cells[start_row, 4] = "";
                            xlWorkSheet.Cells[start_row, 5] = "";
                            xlWorkSheet.Cells[start_row, 6] = "";
                            xlWorkSheet.Cells[start_row, 7] = "";
                            xlWorkSheet.Cells[start_row, 8] = "";

                            xlWorkSheet.Cells[start_row, 1] = (i + 1);
                            xlWorkSheet.Cells[start_row, 2] = SSS_result[i].empl_id;
                            xlWorkSheet.Cells[start_row, 3] = SSS_result[i].last_name + ", " + SSS_result[i].first_name + " " + (SSS_result[i].middle_name != "" ? SSS_result[i].middle_name[0] + "." : "") + " " + SSS_result[i].suffix_name;
                            xlWorkSheet.Cells[start_row, 4] = SSS_result[i].sss_id;
                            xlWorkSheet.Cells[start_row, 5] = SSS_result[i].rep_amount1 == 0 ? "--" : SSS_result[i].rep_amount1.ToString();
                            xlWorkSheet.Cells[start_row, 6] = SSS_result[i].rep_amount2 == 0 ? "--" : SSS_result[i].rep_amount2.ToString();
                            xlWorkSheet.Cells[start_row, 7] = SSS_result[i].rep_amount3 == 0 ? "--" : SSS_result[i].rep_amount3.ToString();
                            xlWorkSheet.Cells[start_row, 8] = (SSS_result[i].rep_amount1 + SSS_result[i].rep_amount2 + SSS_result[i].rep_amount3);

                            total_1 = total_1 + decimal.Parse(SSS_result[i].rep_amount1.ToString());
                            total_2 = total_2 + decimal.Parse(SSS_result[i].rep_amount2.ToString());
                            total_3 = total_3 + decimal.Parse(SSS_result[i].rep_amount3.ToString());

                            start_row = start_row + 1;
                        }

                        xlWorkSheet.get_Range("A7", "M7").Copy(Missing.Value);

                        //Paste the copy template to the next target start row
                        xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                        xlWorkSheet.get_Range("A" + (start_row + 1), "M" + (start_row + 1)).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                           Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                        xlWorkSheet.Cells[start_row, 1] = "";
                        xlWorkSheet.Cells[start_row, 2] = "";
                        xlWorkSheet.Cells[start_row, 3] = "";
                        xlWorkSheet.Cells[start_row, 4] = "";
                        xlWorkSheet.Cells[start_row, 5] = "";
                        xlWorkSheet.Cells[start_row, 6] = "";
                        xlWorkSheet.Cells[start_row, 7] = "";
                        xlWorkSheet.Cells[start_row, 8] = "";

                        xlWorkSheet.Cells[(start_row + 1), 1] = "";
                        xlWorkSheet.Cells[(start_row + 1), 2] = "";
                        xlWorkSheet.Cells[(start_row + 1), 3] = "";
                        xlWorkSheet.Cells[(start_row + 1), 3] = "TOTAL";
                        xlWorkSheet.Cells[(start_row + 1), 4] = "";
                        xlWorkSheet.Cells[(start_row + 1), 5] = total_1;
                        xlWorkSheet.Cells[(start_row + 1), 6] = total_2;
                        xlWorkSheet.Cells[(start_row + 1), 7] = total_3;
                        xlWorkSheet.Cells[(start_row + 1), 8] = (total_1 + total_2 + total_3);


                        string filename = "";
                        filename = "xxx.xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                        xlWorkBook.Close();
                        xlApp.Quit();

                        //release the created object from the marshal so that it will be no longer in
                        //backend application process..
                        Marshal.ReleaseComObject(xlWorkSheet);
                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;

                    }
                }
                else if (p_sq_m == "M")
                {
                    
                    object misValue = System.Reflection.Missing.Value;
                    string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                    remittance_ctrl_nbr = prevValues[7].ToString().Trim();
                    remittance_year     = prevValues[0].ToString().Trim();
                    remittance_month    = prevValues[1].ToString().Trim();
                    employment_type     = prevValues[3].ToString().Trim();
                    remittance_type     = prevValues[5].ToString().Trim();

                    var SSS_result = db_pacco.sp_remittance_ledger_info_SSS(remittance_ctrl_nbr,"","",p_batch_nbr, "", "")
                        .OrderBy(a=> a.payroll_month)
                        .ThenBy(a => a.last_name)
                        .ThenBy(a => a.first_name)
                        .ThenBy(a => a.suffix_name).ToList();


                    if (SSS_result.Count > 0)
                    {
                        //DisplayAlert so that the excel will not popup
                        xlApp.DisplayAlerts = false;

                        int start_row   = 8;

                        decimal total_1 = 0;
                        decimal total_2 = 0;
                        decimal total_3 = 0;
                        decimal total_per_page = 0;
                        decimal total_per_page_prem = 0;
                        decimal total_per_page_ec = 0;
                        int counter_x = 0;
                        int excel_count = 1;
                        Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                        xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);
                        xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                        for (int i = 0; i < SSS_result.Count; i++)
                        {
                            //If count reach to 35, should have Page Total
                            if (i == 0)
                            {
                                xlWorkSheet.Name = DateTime.Parse(SSS_result[i].payroll_month.ToString() + "/" + "01" + "/" + DateTime.Now.Year.ToString()).ToMonthName();
                                xlWorkSheet.Cells[5, 1] = "FOR THE MONTH OF " + DateTime.Parse(SSS_result[i].payroll_month.ToString() + "/" + "01" + " / " + DateTime.Now.Year.ToString()).ToMonthName().ToUpper();
                            }

                            if (counter_x == 35)
                            {
                                xlWorkSheet.get_Range("A8", "M8").Copy(Missing.Value);
                                counter_x = 0;
                                //Paste the copy template to the next target start row
                                xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                    Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                xlWorkSheet.Cells[start_row, 1] = "";
                                xlWorkSheet.Cells[start_row, 2] = "";
                                xlWorkSheet.Cells[start_row, 3].Font.Bold = true;
                                xlWorkSheet.Cells[start_row, 3] = "Page Total";
                                xlWorkSheet.Cells[start_row, 4] = "";
                                xlWorkSheet.Cells[start_row, 5] = "";

                                xlWorkSheet.Cells[start_row, 6].Font.Bold = true;
                                xlWorkSheet.Cells[start_row, 6].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                                xlWorkSheet.Cells[start_row, 6].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                                xlWorkSheet.Cells[start_row, 6] = total_per_page_prem;

                                xlWorkSheet.Cells[start_row, 7].Font.Bold = true;
                                xlWorkSheet.Cells[start_row, 7].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                                xlWorkSheet.Cells[start_row, 7].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                                xlWorkSheet.Cells[start_row, 7] = total_per_page_ec;

                                xlWorkSheet.Cells[start_row, 8] = "";
                                xlWorkSheet.Cells[start_row, 9].Font.Bold = true;
                                xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                                xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                                xlWorkSheet.Cells[start_row, 9] = total_per_page;
                                xlWorkSheet.Cells[start_row, 10] = "";
                                start_row = start_row + 1;
                                total_per_page = 0;
                                total_per_page_prem = 0;
                                total_per_page_ec = 0;
                            }
                           
                            if (i > 1 && (SSS_result[i].payroll_month != SSS_result[i - 1].payroll_month))
                            {
                                //Paste the copy template to the next target start row
                                if (counter_x != 35)
                                {
                                    xlWorkSheet.get_Range("A8", "M8").Copy(Missing.Value);
                                    xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                    Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                    xlWorkSheet.Cells[start_row, 1] = "";
                                    xlWorkSheet.Cells[start_row, 2] = "";
                                    xlWorkSheet.Cells[start_row, 3].Font.Bold = true;
                                    xlWorkSheet.Cells[start_row, 3] = "Page Total";
                                    xlWorkSheet.Cells[start_row, 4] = "";
                                    xlWorkSheet.Cells[start_row, 5] = "";
                                    xlWorkSheet.Cells[start_row, 6].Font.Bold = true;
                                    xlWorkSheet.Cells[start_row, 6].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                                    xlWorkSheet.Cells[start_row, 6].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                                    xlWorkSheet.Cells[start_row, 6] = total_per_page_prem;

                                    xlWorkSheet.Cells[start_row, 7].Font.Bold = true;
                                    xlWorkSheet.Cells[start_row, 7].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                                    xlWorkSheet.Cells[start_row, 7].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                                    xlWorkSheet.Cells[start_row, 7] = total_per_page_ec;

                                    xlWorkSheet.Cells[start_row, 8] = "";
                                    xlWorkSheet.Cells[start_row, 9].Font.Bold = true;
                                    xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                                    xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                                    xlWorkSheet.Cells[start_row, 9] = total_per_page;
                                    xlWorkSheet.Cells[start_row, 10] = "";
                                }

                                xlWorkSheet.get_Range("A8", "M8").Copy(Missing.Value);
                                xlWorkSheet.get_Range("A" + (start_row + 1), "M" + (start_row + 1)).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                   Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);

                                xlWorkSheet.Cells[(start_row + 1), 1] = "";
                                xlWorkSheet.Cells[(start_row + 1), 2] = "";
                                xlWorkSheet.Cells[(start_row + 1), 3] = "";
                                xlWorkSheet.Cells[(start_row + 1), 3].Font.Bold = true;
                                xlWorkSheet.Cells[(start_row + 1), 3] = "GRAND TOTAL";
                                xlWorkSheet.Cells[(start_row + 1), 4] = "";
                                xlWorkSheet.Cells[(start_row + 1), 5] = "";

                                xlWorkSheet.Cells[(start_row + 1), 6].Font.Bold = true;
                                xlWorkSheet.Cells[(start_row + 1), 6] = total_2;

                            
                                xlWorkSheet.Cells[(start_row + 1), 8] = "";

                                xlWorkSheet.Cells[(start_row + 1), 7].Font.Bold = true;
                                xlWorkSheet.Cells[(start_row + 1), 7] = total_3;

                                xlWorkSheet.Cells[(start_row + 1), 9].Font.Bold = true;
                                xlWorkSheet.Cells[(start_row + 1), 9] = total_1;
                                xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                                xlWorkSheet.Cells[(start_row + 1), 10] = "";

                                start_row = start_row + 1;
                                xlWorkSheet.Name = DateTime.Parse(SSS_result[i-1].payroll_month.ToString() + "/" + "01" + "/" + DateTime.Now.Year.ToString()).ToMonthName();

                                xlWorkSheet.Cells[5, 1] ="FOR THE MONTH OF "+DateTime.Parse(SSS_result[i-1].payroll_month.ToString() + "/" + "01" + "/" + DateTime.Now.Year.ToString()).ToMonthName().ToUpper();

                                xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);
                                xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                                total_1 = 0;
                                total_2 = 0;
                                total_3 = 0;
                                total_per_page      = 0;
                                total_per_page_prem = 0;
                                total_per_page_ec   = 0;
                                int temp_start_row  = 8;

                                //CLEAR ITEMS ADDED BY JORGE: 2021-02-26

                                for (int x = temp_start_row; x <= (start_row + 2); x++)
                                {
                                    xlWorkSheet.get_Range("A8", "M8").Copy(Missing.Value);
                                    //Paste the copy template to the next target start row
                                    xlWorkSheet.get_Range("A" + x, "M" + x).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                    Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);

                                    xlWorkSheet.Cells[x, 1] = Missing.Value;
                                    xlWorkSheet.Cells[x, 2] = Missing.Value;
                                    xlWorkSheet.Cells[x, 3] = Missing.Value;
                                    xlWorkSheet.Cells[x, 4] = Missing.Value;
                                    xlWorkSheet.Cells[x, 5] = Missing.Value;
                                    xlWorkSheet.Cells[x, 6] = Missing.Value;
                                    xlWorkSheet.Cells[x, 7] = Missing.Value;
                                    xlWorkSheet.Cells[x, 8] = Missing.Value;
                                    xlWorkSheet.Cells[x, 9] = Missing.Value;
                                    xlWorkSheet.Cells[x, 10] = Missing.Value;
                                    xlWorkSheet.Cells[x, 11] = Missing.Value;

                                }

                                start_row = 8;
                                counter_x = 0;
                                excel_count = 1;
                                xlWorkSheet.Name = DateTime.Parse(SSS_result[i].payroll_month.ToString() + "/" + "01" + "/" + DateTime.Now.Year.ToString()).ToMonthName();
                                xlWorkSheet.Cells[5, 1] = "FOR THE MONTH OF " + DateTime.Parse(SSS_result[i].payroll_month.ToString() + "/" + "01" + "/" + DateTime.Now.Year.ToString()).ToMonthName().ToUpper();


                            }
                            //else if ((i + 1) == SSS_result.Count)
                            //{
                                
                            //}
                            //---------VALUE ASSIGNMENT TO CURRENT ROW---------------------------------------------------------
                            xlWorkSheet.get_Range("A8", "M8").Copy(Missing.Value);
                            //Paste the copy template to the next target start row
                            xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                            xlWorkSheet.Cells[start_row, 3].Font.Bold = false;
                            xlWorkSheet.Cells[start_row, 6].Font.Bold = false;
                            xlWorkSheet.Cells[start_row, 1] = "";
                            xlWorkSheet.Cells[start_row, 2] = "";
                            xlWorkSheet.Cells[start_row, 3] = "";
                            xlWorkSheet.Cells[start_row, 4] = "";
                            xlWorkSheet.Cells[start_row, 5] = "";
                            xlWorkSheet.Cells[start_row, 6] = "";
                            xlWorkSheet.Cells[start_row, 7] = "";
                            xlWorkSheet.Cells[start_row, 8] = "";
                            xlWorkSheet.Cells[start_row, 9] = "";
                            xlWorkSheet.Cells[start_row, 10] = "";
                            xlWorkSheet.Cells[start_row, 11] = "";

                            xlWorkSheet.Cells[start_row, 1] = excel_count;
                            xlWorkSheet.Cells[start_row, 2] = SSS_result[i].empl_id;
                            xlWorkSheet.Cells[start_row, 3] = SSS_result[i].last_name + ", " + SSS_result[i].first_name + " " + (SSS_result[i].middle_name != "" ? SSS_result[i].middle_name[0] + "." : "") + " " + SSS_result[i].suffix_name;
                            xlWorkSheet.Cells[start_row, 4] = SSS_result[i].sss_nbr;
                            xlWorkSheet.Cells[start_row, 5] = "SE";
                            xlWorkSheet.Cells[start_row, 6] = SSS_result[i].payroll_amount;
                            xlWorkSheet.Cells[start_row, 7] = SSS_result[i].ec_amount;
                            xlWorkSheet.Cells[start_row, 8] = SSS_result[i].mpf_amount;
                            xlWorkSheet.Cells[start_row, 9] = Convert.ToDecimal(SSS_result[i].payroll_amount) + Convert.ToDecimal(SSS_result[i].ec_amount) + Convert.ToDecimal(SSS_result[i].mpf_amount);
                            xlWorkSheet.Cells[start_row, 10] = DateTime.Parse(SSS_result[i].payroll_month.ToString()+"/"+ "01" + "/"+DateTime.Now.Year.ToString()).ToMonthName();
                            xlWorkSheet.Cells[start_row, 11] = SSS_result[i].voucher_nbr;

                            //xlWorkSheet.Cells[start_row, 8] = (SSS_result[i].rep_amount1 + SSS_result[i].rep_amount2 + SSS_result[i].rep_amount3);
                            //-----------------------------------------------------------------------------------------------------------------
                            total_1         = total_1 + decimal.Parse(SSS_result[i].payroll_amount.ToString()) + decimal.Parse(SSS_result[i].ec_amount.ToString()) + +decimal.Parse(SSS_result[i].mpf_amount.ToString());
                            total_2 = total_2 + decimal.Parse(SSS_result[i].payroll_amount.ToString());
                            total_3 = total_3 + decimal.Parse(SSS_result[i].ec_amount.ToString());
                            total_per_page  = total_per_page + decimal.Parse(SSS_result[i].payroll_amount.ToString()) + decimal.Parse(SSS_result[i].ec_amount.ToString()) + +decimal.Parse(SSS_result[i].mpf_amount.ToString());
                            total_per_page_prem = total_per_page_prem + decimal.Parse(SSS_result[i].payroll_amount.ToString());
                            total_per_page_ec = total_per_page_ec + decimal.Parse(SSS_result[i].ec_amount.ToString());
                            start_row = start_row + 1;
                            counter_x = counter_x + 1;
                            excel_count = excel_count + 1;

                        }

                        if (counter_x != 35)
                        {
                            xlWorkSheet.get_Range("A8", "M8").Copy(Missing.Value);
                            xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                            xlWorkSheet.Cells[start_row, 1] = "";
                            xlWorkSheet.Cells[start_row, 2] = "";
                            xlWorkSheet.Cells[start_row, 3].Font.Bold = true;
                            xlWorkSheet.Cells[start_row, 3] = "Page Total";
                            xlWorkSheet.Cells[start_row, 4] = "";
                            xlWorkSheet.Cells[start_row, 5] = "";
                            xlWorkSheet.Cells[start_row, 6].Font.Bold = true;
                            xlWorkSheet.Cells[start_row, 6].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                            xlWorkSheet.Cells[start_row, 6].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                            xlWorkSheet.Cells[start_row, 6] = total_per_page_prem;

                            xlWorkSheet.Cells[start_row, 7].Font.Bold = true;
                            xlWorkSheet.Cells[start_row, 7].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                            xlWorkSheet.Cells[start_row, 7].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                            xlWorkSheet.Cells[start_row, 7] = total_per_page_ec;

                            xlWorkSheet.Cells[start_row, 8] = "";
                            xlWorkSheet.Cells[start_row, 9].Font.Bold = true;
                            xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                            xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeBottom].Weight = 1d;
                            xlWorkSheet.Cells[start_row, 9] = total_per_page;
                            xlWorkSheet.Cells[start_row, 10] = "";
                            
                        }

                        xlWorkSheet.get_Range("A8", "M8").Copy(Missing.Value);
                        xlWorkSheet.get_Range("A" + (start_row + 1), "M" + (start_row + 1)).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                           Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);

                        xlWorkSheet.Cells[(start_row + 1), 1] = "";
                        xlWorkSheet.Cells[(start_row + 1), 2] = "";
                        xlWorkSheet.Cells[(start_row + 1), 3] = "";
                        xlWorkSheet.Cells[(start_row + 1), 3].Font.Bold = true;
                        xlWorkSheet.Cells[(start_row + 1), 3] = "GRAND TOTAL";
                        xlWorkSheet.Cells[(start_row + 1), 4] = "";
                        xlWorkSheet.Cells[(start_row + 1), 5] = "";

                        xlWorkSheet.Cells[(start_row + 1), 6].Font.Bold = true;
                        xlWorkSheet.Cells[(start_row + 1), 6] = total_2;


                        xlWorkSheet.Cells[(start_row + 1), 7].Font.Bold = true;
                        xlWorkSheet.Cells[(start_row + 1), 7] = total_3;

                        xlWorkSheet.Cells[(start_row + 1), 8] = "";
                        xlWorkSheet.Cells[(start_row + 1), 9].Font.Bold = true;
                        xlWorkSheet.Cells[(start_row + 1), 9] = total_1;
                        xlWorkSheet.Cells[start_row, 9].Borders[Excel.XlBordersIndex.xlEdgeTop].Weight = 1d;
                        xlWorkSheet.Cells[(start_row + 1), 10] = "";
                        //xlWorkSheet.Name = DateTime.Parse(SSS_result[i].payroll_month.ToString() + "/" + DateTime.Now.Day.ToString() + "/" + DateTime.Now.Year.ToString()).ToMonthName();
                        //xlWorkSheet.Cells[5, 1] = "FOR THE MONTH OF " + DateTime.Parse(SSS_result[i].payroll_month.ToString() + "/" + DateTime.Now.Day.ToString() + "/" + DateTime.Now.Year.ToString()).ToMonthName().ToUpper();



                        string filename = "";
                        filename = "xxx.xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                        xlWorkBook.Close();
                        xlApp.Quit();

                        //release the created object from the marshal so that it will be no longer in
                        //backend application process..
                        Marshal.ReleaseComObject(xlWorkSheet);
                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;

                    }
                }
                
                return JSON(new { message = "success", filePath }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult ExctractToExcelSSS_PHP(string p_employment_type, string p_employmenttype_descr, string p_remittance_year, int p_quarter_rep, string p_empl_id, int p_batch_nbr, string p_sq_m)
        {

            db_pacco.Database.CommandTimeout = int.MaxValue;
           
            try
            {
                if (p_sq_m == "Q")
                {
                  
                    var SSS_result = db_pacco.sp_remittance_SSS_qtrly_rep_2(p_employment_type, p_remittance_year, p_quarter_rep, p_empl_id, p_batch_nbr).ToList();
                    return JSON(new { message = "success", SSS_result }, JsonRequestBehavior.AllowGet);

                }
                //else if (p_sq_m == "M")
                else
                {

                    object misValue = System.Reflection.Missing.Value;
                    string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                    remittance_ctrl_nbr = prevValues[7].ToString().Trim();
                    remittance_year = prevValues[0].ToString().Trim();
                    remittance_month = prevValues[1].ToString().Trim();
                    employment_type = prevValues[3].ToString().Trim();
                    remittance_type = prevValues[5].ToString().Trim();

                    var SSS_result = db_pacco.sp_remittance_ledger_info_SSS_2(remittance_ctrl_nbr, "", "", p_batch_nbr, "", "").GroupBy(a => a.payroll_month).ToList();
                        


                    return JSON(new { message = "success", SSS_result }, JsonRequestBehavior.AllowGet);
                }

              

            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

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
                var getIndividualData = db_pacco.sp_remittance_ledger_info_SSS(p_remit_nbr, p_department_code, "",0, p_empl_id, p_voucher_nbr).ToList();

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