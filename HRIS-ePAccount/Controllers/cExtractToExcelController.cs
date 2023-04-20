using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;

namespace HRIS_ePAccount.Controllers
{
    public class cExtractToExcelController : Controller
    {

        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        public string url_name = "cExtractToExcel";
        User_Menu um = new User_Menu();

        // GET: cExtractToExcel
        public ActionResult Index()
        {
            //ScriptManager scriptManager = ScriptManager.GetCurrent(this.Page);
            //scriptManager.RegisterPostBackControl(this.btn_create_generate);


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

        public ActionResult ExtractExcel(string par_extract_type, string par_year, string par_month, string par_month_descr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;

            var     message = "";
            var     filePath = "";

            try
            {
                if (par_extract_type   == "REFUND")
                {
                    var user_id = Session["user_id"].ToString().Trim();
                    var date_extract = DateTime.Now.ToString("yyyy_MM_dd_HHmm");

                    string extract_type         = par_extract_type;
                    Excel.Application xlApp     = new Excel.Application();

                    Excel.Workbook xlWorkBook   = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/Extract_REFUND_POSTED.xlsx"));
                    Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                    object misValue             = System.Reflection.Missing.Value;

                    Excel.Range xlRange         = xlWorkSheet.UsedRange;
                    int totalRows               = xlRange.Rows.Count;
                    int totalColumns            = xlRange.Columns.Count;
                    
                    var data_extract            = db_pacco.sp_extract_refund(par_year, par_month).ToList();

                    if (data_extract.Count > 0)
                    {
                        int start_row = 2;
                        for (int x = 1; x <= data_extract.Count; x++)
                        {

                            xlWorkSheet.Cells[start_row, 1] = data_extract[x - 1].voucher_nbr;
                            xlWorkSheet.Cells[start_row, 2] = data_extract[x - 1].payroll_year;
                            xlWorkSheet.Cells[start_row, 3] = data_extract[x - 1].payroll_month;
                            xlWorkSheet.Cells[start_row, 4] = data_extract[x - 1].payroll_registry_nbr;
                            xlWorkSheet.Cells[start_row, 5] = data_extract[x - 1].payrolltemplate_descr;
                            xlWorkSheet.Cells[start_row, 6] = data_extract[x - 1].employment_type;
                            xlWorkSheet.Cells[start_row, 7 ] = data_extract[x - 1].remarks;
                            xlWorkSheet.Cells[start_row, 8 ] = data_extract[x - 1].payroll_period_from;
                            xlWorkSheet.Cells[start_row, 9 ] = data_extract[x - 1].payroll_period_to;
                            xlWorkSheet.Cells[start_row, 10] = data_extract[x - 1].empl_id;
                            xlWorkSheet.Cells[start_row, 11] = data_extract[x - 1].employee_name;
                            xlWorkSheet.Cells[start_row, 12] = data_extract[x - 1].gross_pay;

                            start_row = start_row + 1;
                        }
                        Marshal.ReleaseComObject(xlWorkSheet);
                        string filename = "";
                        filename = "Extract_" + extract_type + "_" + par_year + "_" + par_month_descr + "-" + user_id + "_" + date_extract + ".xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                    
                        xlWorkBook.Close();
                        xlApp.Quit();

                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;
                        message = "success";
                    }
                    else
                    {
                        message = "no-data-found";
                    }
                }
            }
            catch (Exception e)
            {
                message = e.Message.ToString();
            }
                    
            return JSON(new { message, filePath }, JsonRequestBehavior.AllowGet);
            
        }
        
        
    }
}