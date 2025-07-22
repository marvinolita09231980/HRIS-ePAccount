using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Excel = Microsoft.Office.Interop.Excel;
using System.Web.Script.Serialization;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Web.UI;
using System.IO;
using System.Drawing;
using System.Threading.Tasks;
using System.Text;
using System.Configuration;
using System.Data.Entity;
using HRIS_ePAccount.Filter;

namespace HRIS_ePAccount.Controllers
{
    [SessionExpire]
    public class cRemitLedgerHDMFController : Controller
    {
        private readonly DbConfiguration _config;

        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        public string url_name = "cRemitLedger";
        // GET: cRemitLedgerHDMF
        User_Menu um = new User_Menu();
        

        protected void Session_End(object sender, EventArgs e)
        {
            Index("", "");
        }
        public ActionResult Index(string id, string etype)
        {
            if (Session["user_id"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            else if (id == null && etype == null)
            {
                return RedirectToAction("Index", "cMainPage");
            }


            assignToModel();

            var menu = db_pacco.sp_user_menu_access_role_list(Session["user_id"].ToString(), 5).Where(a =>
                a.url_name == url_name).ToList();

            if (menu[0].url_name != "")
            {
                if (with_Access(menu[0]))
                {
                    assignAccess(menu[0]);
                }
                else
                {
                    Session.Remove("access");
                    return RedirectToAction("noAccess", "cErrorPages");
                }
            }
            return View(um);
        }


        public void assignAccess(sp_user_menu_access_role_list_Result menu)
        {
            if (Session["access"] != null)
            {
                um.allow_add = (int)Session["allow_add"];
                um.allow_delete = (int)Session["allow_delete"];
                um.allow_edit = (int)Session["allow_edit"];
                um.allow_edit_history = (int)Session["allow_edit_history"];
                um.allow_print = (int)Session["allow_print"];
                um.allow_view = (int)Session["allow_view"];
                um.url_name = Session["url_name"].ToString();
                um.id = (int)Session["id"];
                um.menu_name = Session["menu_name"].ToString();
                um.page_title = Session["page_title"].ToString();
            }
            else if (Session["access"] == null)
            {
                um.allow_add = (int)menu.allow_add;
                um.allow_delete = (int)menu.allow_delete;
                um.allow_edit = (int)menu.allow_edit;
                um.allow_edit_history = (int)menu.allow_edit_history;
                um.allow_print = (int)menu.allow_print;
                um.allow_view = (int)menu.allow_view;
                um.id = (int)menu.id;
                um.url_name = menu.url_name.ToString();
                um.menu_name = menu.menu_name.ToString();
                um.page_title = menu.page_title.ToString();
            }
        }
        public Boolean with_Access(sp_user_menu_access_role_list_Result menu)
        {

            var count = 0;
            if (menu.allow_add == 1) count += 1;
            if (menu.allow_edit == 1) count += 1;
            if (menu.allow_delete == 1) count += 1;
            if (menu.allow_print == 1) count += 1;
            if (menu.allow_view == 1) count += 1;
            if (menu.allow_edit_history == 1) count += 1;

            if (count > 0)
            {
                return true;
            }
            else
            {
                return false;
            }

        }

        public void assignToModel()
        {
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            um.remittancetype_code = prevValues[5].Trim();
            um.remittancetype_descr = prevValues[6].Trim();
            um.remittance_ctrl_nbr = prevValues[7].Trim();
            um.remittance_status = prevValues[8].Trim();
            um.remittance_year = prevValues[0].Trim();
            um.remittance_month = prevValues[1].Trim();

        }



        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description: Initilize data in angular js on page load 
        //*********************************************************************//
        public ActionResult initializeData(string ltr, string v_opt)
        {
            string excelExportServer = System.Configuration.ConfigurationManager.AppSettings["ExcelExportServerIP"];

            assignToModel();

            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var department_list = db_pacco.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();
            var details = db_pacco.sp_remittance_ledger_info_HDMF_V2(um.remittance_ctrl_nbr, "", ltr, v_opt, "", "").ToList();
            var rs = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == um.remittance_ctrl_nbr).FirstOrDefault();
            return JSON(new { prevValues, department_list, details, remittance_status = rs.remittance_status, excelExportServer}, JsonRequestBehavior.AllowGet);

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
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description: Save to remittance_dtl_hdmf_tbl for Add function
        //*********************************************************************//
        public ActionResult SaveHdmfDetails(remittance_dtl_hdmf_tbl data)
        {

            assignToModel();

            var float_mode = "";

            decimal float_ps = decimalAmount(data.payroll_amount_ps.ToString(), data.override_amount_ps.ToString());
            decimal float_gs = decimalAmount(data.payroll_amount_gs.ToString(), data.override_amount_gs.ToString());



            if (zeroDecimal(data.override_amount_ps.ToString()) == 0 && zeroDecimal(data.override_amount_gs.ToString()) == 0)
            {
                float_mode = "D";
            }
            else
            {
                float_mode = "I";
            }
            try
            {
                var saveto = db_pacco.remittance_dtl_hdmf_tbl.Add(data);
                db_pacco.SaveChanges();

                var save_override = db_pacco.sp_save_upd_overrides_HDMF(um.remittance_year,
                    um.remittance_month, um.remittance_ctrl_nbr, data.empl_id, data.voucher_nbr,
                    float_ps, float_gs, float_mode).ToList();

                return JSON(new { message = "success", save_override }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }
        public ActionResult CheckData(sp_remittance_ledger_info_HDMF_Result data)
        {

            var rcn = data.remittance_ctrl_nbr;
            var empl_id = data.empl_id;
            var vn = data.voucher_nbr;
            var message = "";
            try
            {
                var dt = db_pacco.remittance_dtl_hdmf_tbl.Where(a =>
                     a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                     a.empl_id == data.empl_id &&
                     a.voucher_nbr == data.voucher_nbr).FirstOrDefault();

                var dt1 = db_pacco.remittance_dtl_hdmf_month_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr).FirstOrDefault();

                if (dt == null && dt1 == null)
                {
                    message = "not_found";
                }
                else
                {
                    message = "found";
                }
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }


        }

        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description: Edit details in remittance_dtl_hdmf_tbl 
        //*********************************************************************//
        public ActionResult SaveHdmfEditDetails(remittance_dtl_hdmf_tbl data)
        {

            assignToModel();
            string message = "";
            var float_mode = "";

            decimal float_ps = decimalAmount(data.payroll_amount_ps.ToString(), data.override_amount_ps.ToString());
            decimal float_gs = decimalAmount(data.payroll_amount_gs.ToString(), data.override_amount_gs.ToString());



            if (zeroDecimal(data.override_amount_ps.ToString()) == 0 && zeroDecimal(data.override_amount_gs.ToString()) == 0)
            {
                float_mode = "D";
            }
            else
            {
                float_mode = "I";
            }
            try
            {
                var rmt = db_pacco.remittance_dtl_hdmf_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr).FirstOrDefault();

                if (rmt == null)
                {
                    message = "not_found";
                }
                else
                {
                    rmt.override_amount_ps = data.override_amount_ps;
                    rmt.override_amount_gs = data.override_amount_gs;
                    rmt.membership_program = data.membership_program;
                    rmt.detailed_remarks = data.detailed_remarks;
                    db_pacco.SaveChanges();
                    db_pacco.sp_save_upd_overrides_HDMF(um.remittance_year,
                    um.remittance_month, um.remittance_ctrl_nbr, data.empl_id, data.voucher_nbr,
                    float_ps, float_gs, float_mode);
                    message = "success";
                }

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }
        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description: get employee list from registry which are not in remittance
        //*********************************************************************//
        public ActionResult GetPayrollRegistry(string payroll_registry_nbr)
        {

            try
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });

                var payroll_reg_list = db_pacco.sp_payrollregistry_not_in_remittance_HDMF(prevValues[0].Trim(), prevValues[1].Trim(), prevValues[3].Trim(), prevValues[5].Trim(), payroll_registry_nbr);

                return JSON(new { message = "success", payroll_reg_list }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description: delete data in remittance_dtl_hdmf_tbl 
        //*********************************************************************//
        public ActionResult DeleteHdmfDetails(sp_remittance_ledger_info_HDMF_Result data)
        {

            string message = "";
            try
            {
                var dt = db_pacco.remittance_dtl_hdmf_tbl.Where(a =>
                    a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                    a.empl_id == data.empl_id &&
                    a.voucher_nbr == data.voucher_nbr
                    ).FirstOrDefault();

                var dt1 = db_pacco.remittance_dtl_hdmf_month_tbl.Where(a =>
                   a.remittance_ctrl_nbr == data.remittance_ctrl_nbr &&
                   a.empl_id == data.empl_id
                   && a.payroll_month == data.payroll_month &&
                   a.voucher_nbr == data.voucher_nbr
                   ).FirstOrDefault();



                if (dt == null && dt1 == null)
                {
                    message = "not_found";
                }
                else
                {
                    if (dt != null) {
                        db_pacco.remittance_dtl_hdmf_tbl.Remove(dt);
                    }

                    if (dt1 != null)
                    {
                        db_pacco.remittance_dtl_hdmf_month_tbl.Remove(dt1);
                    }
                   
                   
                    db_pacco.SaveChanges();

                    var save_override = db_pacco.sp_save_upd_overrides_HDMF(um.remittance_year,
                        um.remittance_month, um.remittance_ctrl_nbr, data.empl_id, data.voucher_nbr,
                        0, 0, "D");
                    message = "success";
                }

                


                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }
        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description: get voucher list which not in remittance
        //*********************************************************************//
        public ActionResult GetVoucher()
        {

            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });

            var voucher_list = db_pacco.sp_voucher_not_in_remittance_HDMF(prevValues[0].Trim(), prevValues[1].Trim(), prevValues[3].Trim(), prevValues[5].Trim()).ToList();

            return JSON(new { voucher_list }, JsonRequestBehavior.AllowGet);
        }


        public ActionResult GetInfoResult(string dep, string letter, string v_opt)
        {

            assignToModel();
            try
            {
                object ob = new object();

                if (v_opt == "2")
                {
                    ob = db_pacco.sp_remittance_ledger_info_HDMF(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(), v_opt, "", "").Where(a => a.payroll_month == um.remittance_month).ToList();
                }
                else
                {
                    ob = db_pacco.sp_remittance_ledger_info_HDMF(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(), v_opt, "", "").ToList();
                }




                return JSON(new { message = "success", details = ob }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }

        public Decimal zeroDecimal(string n)
        {
            decimal val = 0;
            if (n == "" || n == null || n != "0" || n != "0.00")
            {
                val = 0;
            }
            else
            {
                val = Convert.ToDecimal(n);
            }
            return val;
        }
        public Decimal decimalAmount(string n1, string n2)
        {
            decimal ps = zeroDecimal(n1);
            decimal os = zeroDecimal(n2);
            decimal val = 0;

            if (ps > os && os != 0)
            {
                val = ps - os;
            }
            else
            {
                val = 0;
            }

            return val;
        }
    

        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/29/2019
        // Description: Extract Remittance to Excel
        //*********************************************************************//

        public String twoDigitMos(int mo)
        {
            if (mo > 9)
            {
                return mo.ToString();
            }
            else
            {
                var m = "0" + mo.ToString();
                return m;
            }
        }

       
        public ActionResult ExctractToExcelPremiumsPHP(string rc)
        {
            var mp = "";
            db_pacco.Database.CommandTimeout = int.MaxValue;
            List<sp_remittance_HDMF_rep2_Result> hdmf = new List<sp_remittance_HDMF_rep2_Result>();

            assignToModel();
            var message = "";
           
         

            try
            {
                
                if (rc == "02")
                {
                    mp = "F1";
                    //remittype = "hdmfPremium";
                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                }
                else if (rc == "05")
                {
                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                    //remittype = "hdmfMP2";
                    mp = "M2";
                }

                var hdmf_grouped = hdmf.GroupBy(a => a.payroll_month).OrderBy(grouping => grouping.Max(m => m.last_name)).ThenBy(grouping => grouping.Max(m => m.first_name)).ThenBy(grouping => grouping.Max(m => m.middle_name)).ThenBy(grouping => grouping.Max(m => m.suffix_name)).ToList();


                return JSON(new { message, hdmf_grouped, mp}, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }


        }

        public ActionResult ExctractToExcelPremiums(string rc)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var mp = "";
            List<sp_remittance_HDMF_rep2_Result> hdmf = new List<sp_remittance_HDMF_rep2_Result>();

            assignToModel();
            var message = "";
            string filename = "";
            var filePath = "";
            var remittype = "";
            Excel.Application xlApp = new Excel.Application();

            try
            {
                int prev_loop = 0;
                if (rc == "02")
                {
                    mp = "F1";
                    remittype = "hdmfPremium";
                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                }
                else if (rc == "05")
                {
                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                    remittype = "hdmfMP2";
                    mp = "M2";
                }

              
               

                if (hdmf.Count > 0)
                {
                 
                    var data = hdmf.GroupBy(a => a.payroll_month).OrderBy(grouping => grouping.Max(m => m.last_name)).ThenBy(grouping => grouping.Max(m => m.first_name)).ThenBy(grouping => grouping.Max(m => m.middle_name)).ThenBy(grouping => grouping.Max(m => m.suffix_name)).ToList(); 

                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/PREM_TEMPLATE.xlsx"));
                    Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                    xlWorkSheet.Name = "TemplateFormat";
                    xlApp.DisplayAlerts = false;
                    object misValue = System.Reflection.Missing.Value;

                    for (int x = 0 ; x <=  (data.Count - 1); x++)
                    {
                        
                        var monthName = DateTimeFormatInfo.CurrentInfo.GetAbbreviatedMonthName(Convert.ToInt32(data[x].FirstOrDefault().payroll_month)); 
                       
                        //Create a copy of the last sheet
                        xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[xlWorkBook.Sheets.Count]);

                        xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;


                        //if (x == (hdmf.Count - 1))
                        //{
                        //    // assign name to the new created sheet
                        //    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = "Current";
                        //}
                        //else
                        //{
                        //    // assign name to the new created sheet
                        //    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName;
                        //}
                        // create instance name of a new created sheet
                        Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                        var g = data[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();


                        string[] OrgAddress = g[0].organization_address1.ToString().Split(new char[] { ',' });
                        int rowCounter = 1;
                        int recordcount = 0;
                        int signatory_pos = hdmf.Count + 3;
                        string organizationName = g[0].organization_name.Trim().ToUpper();
                        string orgAddBrgy = OrgAddress[0].Trim();
                        string orgAddMun = OrgAddress[1].Trim();
                        string orgAddProv = OrgAddress[2].Trim();
                        string sig_name = g[0].remittance_sig_acct_name.Trim().ToUpper();
                        string sig_desg = g[0].remittance_sig_acct_desg.Trim();
                        string employersId = g[0].remittance_id1.Trim();
                        string periodCovered = g[0].covered_month.Trim();
                        var percov = g[0].payroll_year.Trim() + g[0].payroll_month.Trim();


                        xlApp.DisplayAlerts = false;
                        int start_row_A = 5;
                        int start_row_Z = 0;
                        int start_row = 5;
                        int start_row_original = 5;

                        Excel.Range emplr_id = newWorkSheet.get_Range("B1");
                        emplr_id.Font.Bold = true;
                        emplr_id.Value2 = employersId;
                        emplr_id.Merge(Missing.Value);


                        Excel.Range emplr_name = newWorkSheet.get_Range("B2", "E2");
                        emplr_name.Font.Bold = true;
                        emplr_name.Value2 = organizationName;
                        emplr_name.Merge(Missing.Value);


                        Excel.Range address = newWorkSheet.get_Range("B3", "E3");
                        address.Font.Bold = true;
                        address.Value2 = orgAddBrgy + ", " + orgAddMun + ", " + orgAddProv;
                        address.Merge(Missing.Value);

                       
                        if (prev_loop >= g.Count)
                        {
                            for (var z = start_row_original; z < prev_loop + start_row_original; z++)
                            {
                                xlWorkSheet.get_Range("A5", "M5").Copy(Missing.Value);
                                xlWorkSheet.get_Range("A" + z, "M" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
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
                            }
                        }
                        prev_loop = g.Count;

                        for (int i = 0; i < g.Count; i++)
                        {
                            //var g = data[i].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();

                            xlWorkSheet.get_Range("A5", "Z5").Copy(Missing.Value);
                            xlWorkSheet.get_Range("A" + start_row, "Z" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);

                            newWorkSheet.get_Range("A" + start_row, "M" + start_row).Borders.Color = Color.Black;
                          
                            newWorkSheet.Cells[start_row, 1] = g[i].hdmf_mid_nbr;
                            newWorkSheet.Cells[start_row, 2] = g[i].hdmf_oth_nbr;
                            newWorkSheet.Cells[start_row, 3] = mp;
                            newWorkSheet.Cells[start_row, 4] = g[i].last_name;
                            newWorkSheet.Cells[start_row, 5] = g[i].first_name;
                            newWorkSheet.Cells[start_row, 6] = g[i].suffix_name;
                            newWorkSheet.Cells[start_row, 7] = g[i].middle_name;
                            newWorkSheet.Cells[start_row, 8] = percov;
                            newWorkSheet.Cells[start_row, 12] = g[i].empl_id;
                            newWorkSheet.Cells[start_row, 13] = g[i].voucher_nbr;

                            Excel.Range ps = newWorkSheet.get_Range("I" + start_row);

                            ps.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            ps.Value2 = g[i].rep_amount_ps;
                            ps.Merge(Missing.Value);

                            Excel.Range gs = newWorkSheet.get_Range("J" + start_row);
                            gs.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            gs.Value2 = g[i].rep_amount_gs;
                            gs.Merge(Missing.Value);
                            newWorkSheet.Cells[start_row, 11] = Missing.Value;
                            start_row_Z = start_row;
                            recordcount = g.Count - (i + 1);
                            rowCounter += 1;
                            start_row = start_row + 1;
                        }

                        newWorkSheet.get_Range("A" + start_row, "M" + start_row).Borders.Color = Color.Black;
                        Excel.Range grandTotal_lbl = newWorkSheet.get_Range("A" + start_row);
                        grandTotal_lbl.Font.Bold = true;
                        grandTotal_lbl.Value2 = "TOTAL";
                        grandTotal_lbl.Merge(Missing.Value);

                        Excel.Range Total_ps = newWorkSheet.get_Range("I" + start_row);
                        Total_ps.Font.Bold = true;

                        Total_ps.Formula = "=SUM(I" + start_row_A + ":I" + start_row_Z + ")";
                        Total_ps.Merge(Missing.Value);

                        Excel.Range Total_gs = newWorkSheet.get_Range("J" + start_row);
                        Total_gs.Font.Bold = true;
                        Total_gs.Formula = "=SUM(J" + start_row_A + ":J" + start_row_Z + ")";
                        Total_gs.Merge(Missing.Value);


                        start_row = start_row + 4;
                        Excel.Range pghead_lbl = newWorkSheet.get_Range("G" + start_row, "I" + start_row);
                        pghead_lbl.Font.Bold = true;
                        //pghead_lbl.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
                        pghead_lbl.Value2 = sig_name;
                        pghead_lbl.Merge(Missing.Value);
                        start_row++;
                        Excel.Range pghead_dsg = newWorkSheet.get_Range("G" + start_row, "I" + start_row);
                        //pghead_dsg.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
                        pghead_dsg.Value2 = sig_desg;
                        pghead_dsg.Merge(Missing.Value);

                        //filename = um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
                       
                    }

                   

                    filename = remittype + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
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
                    message = "success";
                }
                else
                {
                    message = "No data extracted";
                }

                return JSON(new { message, filePath}, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }


        }


        public ActionResult ExctractToExcelPremiumsCheck(string rc)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var mp = "";
            List<sp_remittance_HDMF_rep2_Result> hdmf = new List<sp_remittance_HDMF_rep2_Result>();

            assignToModel();
            var message = "";
            string filename = "";
            var filePath = "";
            var remittype = "";
            Excel.Application xlApp = new Excel.Application();
            int prev_loop = 0;
            try
            {
                if (rc == "02")
                {
                    mp = "F1";
                    remittype = "hdmfPremium";
                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                }
                else if (rc == "05")
                {
                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                    remittype = "hdmfMP2";
                    mp = "M2";
                }




                if (hdmf.Count > 0)
                {

                    var data = hdmf.GroupBy(a => a.payroll_month).OrderBy(grouping => grouping.Max(m => m.last_name)).ThenBy(grouping => grouping.Max(m => m.first_name)).ThenBy(grouping => grouping.Max(m => m.middle_name)).ThenBy(grouping => grouping.Max(m => m.suffix_name)).ToList();

                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/PREM_TEMPLATE_CHECK.xlsx"));
                    Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                    xlWorkSheet.Name = "TemplateFormat";
                    xlApp.DisplayAlerts = false;
                    object misValue = System.Reflection.Missing.Value;

                    for (int x = 0; x <= (data.Count - 1); x++)
                    {

                        var monthName = DateTimeFormatInfo.CurrentInfo.GetAbbreviatedMonthName(Convert.ToInt32(data[x].FirstOrDefault().payroll_month));

                        //Create a copy of the last sheet
                        xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[xlWorkBook.Sheets.Count]);

                        xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;


                        //if (x == (hdmf.Count - 1))
                        //{
                        //    // assign name to the new created sheet
                        //    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = "Current";
                        //}
                        //else
                        //{
                        //    // assign name to the new created sheet
                        //    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName;
                        //}
                        // create instance name of a new created sheet
                        Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                        var g = data[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();


                        string[] OrgAddress = g[0].organization_address1.ToString().Split(new char[] { ',' });
                        int rowCounter = 1;
                        int recordcount = 0;
                        int signatory_pos = hdmf.Count + 3;
                        string organizationName = g[0].organization_name.Trim().ToUpper();
                        string orgAddBrgy = OrgAddress[0].Trim();
                        string orgAddMun = OrgAddress[1].Trim();
                        string orgAddProv = OrgAddress[2].Trim();
                        string sig_name = g[0].remittance_sig_acct_name.Trim().ToUpper();
                        string sig_desg = g[0].remittance_sig_acct_desg.Trim();
                        string employersId = g[0].remittance_id1.Trim();
                        string periodCovered = g[0].covered_month.Trim();
                        var percov = g[0].payroll_year.Trim() + g[0].payroll_month.Trim();


                        xlApp.DisplayAlerts = false;
                        int start_row_A = 5;
                        int start_row_Z = 0;
                        int start_row = 5;

                        int start_row_original = 5;

                        Excel.Range emplr_id = newWorkSheet.get_Range("B1");
                        emplr_id.Font.Bold = true;
                        emplr_id.Value2 = employersId;
                        emplr_id.Merge(Missing.Value);


                        Excel.Range emplr_name = newWorkSheet.get_Range("B2", "E2");
                        emplr_name.Font.Bold = true;
                        emplr_name.Value2 = organizationName;
                        emplr_name.Merge(Missing.Value);


                        Excel.Range address = newWorkSheet.get_Range("B3", "E3");
                        address.Font.Bold = true;
                        address.Value2 = orgAddBrgy + ", " + orgAddMun + ", " + orgAddProv;
                        address.Merge(Missing.Value);

                       
                        if (prev_loop >= g.Count)
                        {
                            for (var z = start_row_original; z < prev_loop + start_row_original; z++)
                            {
                                xlWorkSheet.get_Range("A5", "Q5").Copy(Missing.Value);
                                xlWorkSheet.get_Range("A" + z, "Q" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
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

                            }
                        }
                        prev_loop = g.Count;

                        for (int i = 0; i < g.Count; i++)
                        {
                            //var g = data[i].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();

                            xlWorkSheet.get_Range("A5", "Z5").Copy(Missing.Value);
                            xlWorkSheet.get_Range("A" + start_row, "Z" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);


                            newWorkSheet.get_Range("A" + start_row, "Q" + start_row).Borders.Color = Color.Black;

                            newWorkSheet.Cells[start_row, 1] = g[i].hdmf_mid_nbr;
                            newWorkSheet.Cells[start_row, 2] = g[i].hdmf_oth_nbr;
                            newWorkSheet.Cells[start_row, 3] = mp;
                            newWorkSheet.Cells[start_row, 4] = g[i].last_name;
                            newWorkSheet.Cells[start_row, 5] = g[i].first_name;
                            newWorkSheet.Cells[start_row, 6] = g[i].suffix_name;
                            newWorkSheet.Cells[start_row, 7] = g[i].middle_name;
                            newWorkSheet.Cells[start_row, 8] = percov;
                            newWorkSheet.Cells[start_row, 16] = g[i].empl_id;
                            newWorkSheet.Cells[start_row, 17] = g[i].voucher_nbr;
                            Excel.Range ps = newWorkSheet.get_Range("I" + start_row);
                            ps.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            ps.Value2 = g[i].payroll_amount_ps;
                            ps.Merge(Missing.Value);

                            Excel.Range gs = newWorkSheet.get_Range("J" + start_row);
                            gs.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            gs.Value2 = g[i].payroll_amount_gs;
                            gs.Merge(Missing.Value);

                            Excel.Range override_ps = newWorkSheet.get_Range("K" + start_row);
                            override_ps.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            override_ps.Value2 = g[i].rep_amount_ps;
                            override_ps.Merge(Missing.Value);

                            Excel.Range override_gs = newWorkSheet.get_Range("L" + start_row);
                            override_gs.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            override_gs.Value2 = g[i].rep_amount_gs;
                            override_gs.Merge(Missing.Value);

                            Excel.Range difference_ps = newWorkSheet.get_Range("M" + start_row);
                            difference_ps.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            difference_ps.Value2 = g[i].unremitted_amount_ps;
                            difference_ps.Merge(Missing.Value);

                            Excel.Range difference_gs = newWorkSheet.get_Range("N" + start_row);
                            difference_gs.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            difference_gs.Value2 = g[i].unremitted_amount_gs;
                            difference_gs.Merge(Missing.Value);



                            newWorkSheet.Cells[start_row, 15] = Missing.Value;

                            start_row_Z = start_row;
                            recordcount = g.Count - (i + 1);
                            rowCounter += 1;
                            start_row = start_row + 1;

                            //Excel.Range gs_remitted = newWorkSheet.get_Range("J" + start_row);
                            //gs.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignRight;
                            //gs.Value2 = g[i].rep_amount_gs;
                        }

                        newWorkSheet.get_Range("A" + start_row, "P" + start_row).Borders.Color = Color.Black;
                        Excel.Range grandTotal_lbl = newWorkSheet.get_Range("A" + start_row);
                        grandTotal_lbl.Font.Bold = true;
                        grandTotal_lbl.Value2 = "TOTAL";
                        grandTotal_lbl.Merge(Missing.Value);

                        Excel.Range Total_ps = newWorkSheet.get_Range("I" + start_row);
                        Total_ps.Font.Bold = true;


                        Total_ps.Formula = "=SUM(I" + start_row_A + ":I" + start_row_Z + ")";
                        Total_ps.Merge(Missing.Value);

                        Excel.Range Total_gs = newWorkSheet.get_Range("J" + start_row);
                        Total_gs.Font.Bold = true;
                        Total_gs.Formula = "=SUM(J" + start_row_A + ":J" + start_row_Z + ")";
                        Total_gs.Merge(Missing.Value);

                        Excel.Range Total_override_ps = newWorkSheet.get_Range("K" + start_row);
                        Total_override_ps.Font.Bold = true;
                        Total_override_ps.Formula = "=SUM(K" + start_row_A + ":K" + start_row_Z + ")";
                        Total_override_ps.Merge(Missing.Value);

                        Excel.Range Total_override_gs = newWorkSheet.get_Range("L" + start_row);
                        Total_override_gs.Font.Bold = true;
                        Total_override_gs.Formula = "=SUM(L" + start_row_A + ":L" + start_row_Z + ")";
                        Total_override_gs.Merge(Missing.Value);

                        Excel.Range Total_difference_ps = newWorkSheet.get_Range("M" + start_row);
                        Total_difference_ps.Font.Bold = true;
                        Total_difference_ps.Formula = "=SUM(M" + start_row_A + ":M" + start_row_Z + ")";
                        Total_difference_ps.Merge(Missing.Value);

                        Excel.Range Total_difference_gs = newWorkSheet.get_Range("N" + start_row);
                        Total_difference_gs.Font.Bold = true;
                        Total_difference_gs.Formula = "=SUM(N" + start_row_A + ":N" + start_row_Z + ")";
                        Total_difference_gs.Merge(Missing.Value);

                        start_row = start_row + 4;
                        Excel.Range pghead_lbl = newWorkSheet.get_Range("M" + start_row, "O" + start_row);
                        pghead_lbl.Font.Bold = true;
                        //pghead_lbl.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
                        pghead_lbl.Value2 = sig_name;
                        pghead_lbl.Merge(Missing.Value);
                        start_row++;
                        Excel.Range pghead_dsg = newWorkSheet.get_Range("M" + start_row, "O" + start_row);
                        //pghead_dsg.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
                        pghead_dsg.Value2 = sig_desg;
                        pghead_dsg.Merge(Missing.Value);

                        //filename = um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";

                    }

                    filename = remittype + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
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
                    message = "success";
                }
                else
                {
                    message = "No data extracted";
                }

                return JSON(new { message, filePath }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }


        }



        public ActionResult ExctractToExcelLoansPhp(string rc)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            List<sp_remittance_HDMF_rep2_Result> hdmf = new List<sp_remittance_HDMF_rep2_Result>();

            assignToModel();
            var message = "";
           
            Excel.Application xlApp = new Excel.Application();

            try
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                if (rc == "03" || rc == "04")
                {

                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                }
                else if (rc == "06")
                {
                    if (prevValues[3] == "JO")
                    {
                        hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                    }

                    else
                    {
                        //hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), false).ToList(); REMOVE BY JORGE: THEY WANT TO SEE THE CURRENT PAYMENT
                        hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                    }


                }

                var hdmf_grouped = hdmf.GroupBy(a => a.payroll_month).OrderBy(grouping => grouping.Max(m => m.last_name)).ThenBy(grouping => grouping.Max(m => m.first_name)).ThenBy(grouping => grouping.Max(m => m.middle_name)).ThenBy(grouping => grouping.Max(m => m.suffix_name)).ToList();

                return JSON(new { message, hdmf_grouped }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult ExctractToExcelLoans(string rc)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            List<sp_remittance_HDMF_rep2_Result> hdmf = new List<sp_remittance_HDMF_rep2_Result>();

            assignToModel();
            var message = "";
            string filename = "";
            var filePath = "";
            Excel.Application xlApp = new Excel.Application();

            try
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                if (rc == "03" || rc == "04")
                {
                
                    hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                }
                else if (rc == "06")
                {
                    if (prevValues[3] == "JO")
                    {
                        hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                    }

                    else
                    {
                        //hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), false).ToList(); REMOVE BY JORGE: THEY WANT TO SEE THE CURRENT PAYMENT
                        hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
                    }
                    
                 
                }


              

                if (hdmf.Count > 0)
                {
                    var data = hdmf.GroupBy(a => a.payroll_month).OrderBy(grouping => grouping.Max(m => m.last_name)).ThenBy(grouping => grouping.Max(m => m.first_name)).ThenBy(grouping => grouping.Max(m => m.middle_name)).ThenBy(grouping => grouping.Max(m => m.suffix_name)).ToList();
                
                    if (rc == "06")
                    {

                        Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/HL_TEMPLATE.xlsx"));
                        Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                        xlWorkSheet.Name = "TemplateFormat";
                        object misValue = System.Reflection.Missing.Value;
                        int prev_loop = 0;
                        //DisplayAlert so that the excel will not popup
                        xlApp.DisplayAlerts = false;

                        for (int x = 0; x <= (data.Count - 1); x++)
                        {

                            var monthName = DateTimeFormatInfo.CurrentInfo.GetAbbreviatedMonthName(Convert.ToInt32(data[x].FirstOrDefault().payroll_month));
                            //Create a copy of the last sheet

                            xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);

                            xlWorkSheet.Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;

                            //Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

                            string[] OrgAddress = hdmf[0].organization_address1.ToString().Split(new char[] { ',' });
                            int rowCounter = 1;
                            int recordcount = 0;
                            int signatory_pos = hdmf.Count + 3;
                            string organizationName = hdmf[0].organization_name.Trim().ToUpper();
                            string orgAddBrgy = OrgAddress[0].Trim();
                            string orgAddMun = OrgAddress[1].Trim();
                            string orgAddProv = OrgAddress[2].Trim();
                            string sig_name = hdmf[0].remittance_sig_acct_name.Trim();
                            string sig_desg = hdmf[0].remittance_sig_acct_desg.Trim();
                            string employersId = hdmf[0].remittance_id1.Trim();
                            string periodCovered = monthName + ' ' + data[x].FirstOrDefault().payroll_year; ;
                            decimal subtotal_amount = 0;

                            decimal overall_amount = 0;
                           
                          

                            int start_row = 5;
                            int start_row_original = 5;
                            Excel.Range emplr_id_lbl = xlWorkSheet.get_Range("A1");
                            emplr_id_lbl.Font.Bold = true;
                            emplr_id_lbl.Value2 = "Employer Id";
                            emplr_id_lbl.Merge(Missing.Value);

                            Excel.Range emplr_id = xlWorkSheet.get_Range("B1");
                            emplr_id.Font.Bold = true;
                            emplr_id.Value2 = employersId;
                            emplr_id.Merge(Missing.Value);

                            Excel.Range emplr_name_lbl = xlWorkSheet.get_Range("A2");
                            emplr_name_lbl.Font.Bold = true;
                            emplr_name_lbl.Value2 = "Employer Name";
                            emplr_name_lbl.Merge(Missing.Value);

                            Excel.Range emplr_name = xlWorkSheet.get_Range("B2", "D2");
                            emplr_name.Font.Bold = true;
                            emplr_name.Value2 = organizationName;
                            emplr_name.Merge(Missing.Value);

                            Excel.Range address_lbl = xlWorkSheet.get_Range("A3");
                            emplr_name.Font.Bold = true;
                            emplr_name.Value2 = organizationName;
                            emplr_name.Merge(Missing.Value);

                            Excel.Range address = xlWorkSheet.get_Range("B3", "D3");
                            address.Font.Bold = true;
                            address.Value2 = orgAddBrgy + ", " + orgAddMun + ", " + orgAddProv;
                            address.Merge(Missing.Value);

                            var g = data[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();


                            //if (prev_loop >= g.Count)
                            //{
                            //    for (var z = start_row_original; z < (prev_loop + start_row_original) + 10; z++)
                            //    {
                            //        xlWorkSheet.get_Range("A" + start_row, "K" + start_row).Borders.Color = Color.WhiteSmoke;
                            //        xlWorkSheet.get_Range("A", "K").Copy(Missing.Value);
                            //        xlWorkSheet.get_Range("A" + z, "K" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            //            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                  
                            //        xlWorkSheet.Cells[z, 1] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 2] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 3] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 4] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 5] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 6] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 7] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 8] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 9] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 10] = Missing.Value;
                            //        xlWorkSheet.Cells[z, 11] = Missing.Value;

                            //    }
                            //}
                            prev_loop = g.Count;

                            for (int i = 0; i < g.Count; i++)
                            {

                                //if ((i + 1) < g.Count && (rowCounter == 38))
                                //{
                                //    rowCounter = 1;
                                //    newWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
                                //    Excel.Range subTl_row = newWorkSheet.get_Range("A" + start_row, "J" + start_row);
                                //    subTl_row.Font.Bold = true;

                                //    Excel.Range subTl_lbl = newWorkSheet.get_Range("A" + start_row);
                                //    subTl_lbl.Value2 = "SUBTOTAL";
                                //    subTl_lbl.Merge(Missing.Value);

                                //    Excel.Range subTl = newWorkSheet.get_Range("I" + start_row);
                                //    subTl.Value2 = subtotal_amount;
                                //    subTl.Merge(Missing.Value);

                                //    subtotal_amount = 0;
                                //    start_row = start_row + 1;
                                //    continue;

                                //}
                                //else if ((i + 1) == g.Count)
                                //{
                                //    newWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
                                //    Excel.Range total_row = newWorkSheet.get_Range("A" + start_row, "J" + start_row);
                                //    total_row.Font.Bold = true;
                                //    Excel.Range ToTl_lbl = newWorkSheet.get_Range("A" + start_row);
                                //    ToTl_lbl.Value2 = "SUBTOTAL";
                                //    ToTl_lbl.Merge(Missing.Value);

                                //    Excel.Range ToTl = newWorkSheet.get_Range("I" + start_row);
                                //    ToTl.Value2 = subtotal_amount;
                                //    ToTl.Merge(Missing.Value);



                                //    subtotal_amount = 0;
                                //    start_row = start_row + 1;
                                //    break;
                                //}


                                xlWorkSheet.get_Range("A" + start_row, "K" + start_row).Borders.Color = Color.Black;
                                xlWorkSheet.Cells[start_row, 1] = g[i].hdmf_mid_nbr;
                                xlWorkSheet.Cells[start_row, 2] = g[i].hdmf_oth_nbr;
                                xlWorkSheet.Cells[start_row, 3] = g[i].last_name;
                                xlWorkSheet.Cells[start_row, 4] = g[i].first_name;
                                xlWorkSheet.Cells[start_row, 5] = g[i].suffix_name;
                                xlWorkSheet.Cells[start_row, 6] = g[i].middle_name;
                                xlWorkSheet.Cells[start_row, 7] = g[i].loan_type;
                                xlWorkSheet.Cells[start_row, 8] = g[i].rep_amount_ps;
                                xlWorkSheet.Cells[start_row, 9] = Missing.Value;
                                xlWorkSheet.Cells[start_row, 10] = g[i].empl_id;
                                xlWorkSheet.Cells[start_row, 11] = g[i].voucher_nbr;

                                //subtotal_amount += Convert.ToDecimal(g[i].rep_amount_ps);
                                overall_amount += Convert.ToDecimal(g[i].rep_amount_ps);

                                recordcount = g.Count - (i + 1);
                                rowCounter += 1;
                                start_row = start_row + 1;
                            }

                            xlWorkSheet.get_Range("A" + start_row, "K" + start_row).Borders.Color = Color.Black;
                            Excel.Range grandTotal_lbl = xlWorkSheet.get_Range("A" + start_row);
                            grandTotal_lbl.Font.Bold = true;
                            grandTotal_lbl.Value2 = "TOTAL";
                            grandTotal_lbl.Merge(Missing.Value);

                            Excel.Range grandTotal = xlWorkSheet.get_Range("H" + start_row);
                            grandTotal.Font.Bold = true;
                            grandTotal.Value2 = overall_amount;
                            grandTotal.Merge(Missing.Value);


                            //Marshal.ReleaseComObject(newWorkSheet);


                        }

                        filename = "";
                        filename = um.remittance_year.Trim() + "-" + um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
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

                        Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/CAL_TEMPLATE.xlsx"));
                        Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                        xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                        object misValue = System.Reflection.Missing.Value;

                        xlApp.DisplayAlerts = false;

                        int prev_loop = 0;

                        for (int x = 0; x <= (data.Count - 1); x++)
                        {
                            var g = data[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();
                           
                            var monthName = DateTimeFormatInfo.CurrentInfo.GetAbbreviatedMonthName(Convert.ToInt32(data[x].FirstOrDefault().payroll_month));
                            //Create a copy of the last sheet
                            xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);
                            //xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;
                            //Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                            //newWorkSheet.Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;
                            xlWorkSheet.Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;
                            string[] OrgAddress = g[0].organization_address1.ToString().Split(new char[] { ',' });
                            int rowCounter = 1;
                            int recordcount = 0;
                            int signatory_pos = g.Count + 3;
                            string organizationName = g[0].organization_name.Trim();
                            string orgAddBrgy = OrgAddress[0].Trim();
                            string orgAddMun = OrgAddress[1].Trim();
                            string orgAddProv = OrgAddress[2].Trim();
                            string sig_name = g[0].remittance_sig_acct_name.Trim().ToUpper();
                            string sig_desg = g[0].remittance_sig_acct_desg.Trim();
                            string employersId = g[0].remittance_id1.Trim();
                            string periodCovered = monthName + ' ' + data[x].FirstOrDefault().payroll_year;
                            decimal subtotal_amount = 0;


                            decimal overall_amount = 0;
                            //DisplayAlert so that the excel will not popup
                            xlApp.DisplayAlerts = false;

                            int start_row = 5;
                            int start_row_original = 5;

                            Excel.Range emplr_id_lbl = xlWorkSheet.get_Range("A1");
                            emplr_id_lbl.Font.Bold = true;
                            emplr_id_lbl.Value2 = "Employer ID";
                            emplr_id_lbl.Merge(Missing.Value);

                            Excel.Range emplr_id = xlWorkSheet.get_Range("B1");
                            emplr_id.Font.Bold = true;
                            emplr_id.Value2 = employersId;
                            emplr_id.Merge(Missing.Value);

                            Excel.Range emplr_name_lbl = xlWorkSheet.get_Range("A2");
                            emplr_name_lbl.Font.Bold = true;
                            emplr_name_lbl.Value2 = "Employer Name";
                            emplr_name_lbl.Merge(Missing.Value);

                            Excel.Range emplr_name = xlWorkSheet.get_Range("B2", "D2");
                            emplr_name.Font.Bold = true;
                            emplr_name.Value2 = organizationName;
                            emplr_name.Merge(Missing.Value);

                            Excel.Range address_lbl = xlWorkSheet.get_Range("A3");
                            emplr_name.Font.Bold = true;
                            emplr_name.Value2 = organizationName;
                            emplr_name.Merge(Missing.Value);

                            Excel.Range address = xlWorkSheet.get_Range("B3", "D3");
                            address.Font.Bold = true;
                            address.Value2 = orgAddBrgy + ", " + orgAddMun + ", " + orgAddProv;
                            address.Merge(Missing.Value);

                            Excel.Range period_cvrd_lbl = xlWorkSheet.get_Range("F1");
                            period_cvrd_lbl.Font.Bold = true;
                            period_cvrd_lbl.Value2 = "Period Covered";
                            period_cvrd_lbl.Merge(Missing.Value);

                            Excel.Range period_cvrd = xlWorkSheet.get_Range("G1");
                            period_cvrd.Font.Bold = true;
                            period_cvrd.Value2 = periodCovered;
                            period_cvrd.Merge(Missing.Value);

                            Excel.Range phone_lbl = xlWorkSheet.get_Range("F2");
                            phone_lbl.Font.Bold = true;
                            phone_lbl.Value2 = "Telephone Number";
                            phone_lbl.Merge(Missing.Value);

                            Excel.Range phone = xlWorkSheet.get_Range("G2");
                            phone.Font.Bold = true;
                            phone.Value2 = Missing.Value;
                            phone.Merge(Missing.Value);


                            if (prev_loop >= g.Count)
                            {
                                for (var z = start_row_original; z < (prev_loop + start_row_original) + 10; z++)
                                {
                                    xlWorkSheet.get_Range("A" + start_row, "K" + start_row).Borders.Color = Color.WhiteSmoke;
                                    xlWorkSheet.get_Range("A" + start_row_original, "M" + start_row_original).Copy(Missing.Value);
                                    xlWorkSheet.get_Range("A" + z, "M" + z).PasteSpecial(Excel.XlPasteType.xlPasteAll,
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

                                }
                            }
                            prev_loop = g.Count;


                            for (int i = 0; i < g.Count; i++)
                            {
                                

                                //xlWorkSheet.get_Range("A5", "M5").Copy(Missing.Value);
                                //xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                //    Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                xlWorkSheet.get_Range("A5", "M5").Copy(Missing.Value);
                                xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                                    Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                                //if ((i + 1) < g.Count && (rowCounter == 38))
                                //{
                                //    rowCounter = 1;
                                //    xlWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
                                //    Excel.Range subTl_row = xlWorkSheet.get_Range("A" + start_row, "J" + start_row);
                                //    subTl_row.Font.Bold = true;


                                //    Excel.Range subTl_lbl = xlWorkSheet.get_Range("A" + start_row);
                                //    subTl_lbl.Value2 = "SUBTOTAL";
                                //    subTl_lbl.Merge(Missing.Value);

                                //    Excel.Range subTl_lbl2 = xlWorkSheet.get_Range("B" + start_row);
                                //    subTl_lbl2.Value2 = Missing.Value;

                                //    Excel.Range subTl_lbl3 = xlWorkSheet.get_Range("C" + start_row);
                                //    subTl_lbl3.Value2 = Missing.Value;

                                //    Excel.Range subTl_lbl4 = xlWorkSheet.get_Range("D" + start_row);
                                //    subTl_lbl4.Value2 = Missing.Value;

                                //    Excel.Range subTl_lbl5 = xlWorkSheet.get_Range("E" + start_row);
                                //    subTl_lbl5.Value2 = Missing.Value;

                                //    Excel.Range subTl_lbl6 = xlWorkSheet.get_Range("F" + start_row);
                                //    subTl_lbl6.Value2 = Missing.Value;

                                //    Excel.Range subTl_lbl7 = xlWorkSheet.get_Range("G" + start_row);
                                //    subTl_lbl7.Value2 = Missing.Value;

                                //    Excel.Range subTl_lbl8 = xlWorkSheet.get_Range("I" + start_row);
                                //    subTl_lbl8.Value2 = Missing.Value;

                                //    Excel.Range subTl_lbl9 = xlWorkSheet.get_Range("J" + start_row);
                                //    subTl_lbl9.Value2 = Missing.Value;


                                //    Excel.Range subTl = xlWorkSheet.get_Range("H" + start_row);
                                //    subTl.Value2 = subtotal_amount;
                                //    subTl.Merge(Missing.Value);

                                //    subtotal_amount = 0;
                                //    start_row = start_row + 1;
                                //    continue;

                                //}
                                //else if ((i + 1) == (g.Count + 1))
                                //{


                                //    xlWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
                                //    Excel.Range total_row = xlWorkSheet.get_Range("A" + start_row, "I" + start_row);
                                //    total_row.Font.Bold = true;
                                //    Excel.Range ToTl_lbl = xlWorkSheet.get_Range("A" + start_row);
                                //    ToTl_lbl.Value2 = "SUBTOTAL";
                                //    ToTl_lbl.Merge(Missing.Value);

                                //    Excel.Range ToTl = xlWorkSheet.get_Range("H" + start_row);
                                //    ToTl.Value2 = subtotal_amount;
                                //    ToTl.Merge(Missing.Value);

                                //    subtotal_amount = 0;
                                //    start_row = start_row + 1;
                                //    break;
                                //}

                                xlWorkSheet.get_Range("A" + start_row, "K" + start_row).Borders.Color = Color.Black;
                                
                                xlWorkSheet.Cells[start_row, 1]  = g[i].hdmf_mid_nbr;
                                xlWorkSheet.Cells[start_row, 2]  = g[i].hdmf_oth_nbr;
                                xlWorkSheet.Cells[start_row, 3]  = g[i].last_name;
                                xlWorkSheet.Cells[start_row, 4]  = g[i].first_name;
                                xlWorkSheet.Cells[start_row, 5]  = g[i].suffix_name;
                                xlWorkSheet.Cells[start_row, 6]  = g[i].middle_name;
                                xlWorkSheet.Cells[start_row, 7]  = g[i].loan_type;
                                xlWorkSheet.Cells[start_row, 8]  = g[i].rep_amount_ps;
                                xlWorkSheet.Cells[start_row, 9]  = Missing.Value;
                                xlWorkSheet.Cells[start_row, 10] = g[i].empl_id;
                                xlWorkSheet.Cells[start_row, 11] = g[i].voucher_nbr;


                                //subtotal_amount += Convert.ToDecimal(g[i].rep_amount_ps);
                                overall_amount += Convert.ToDecimal(g[i].rep_amount_ps);

                                recordcount = g.Count - (i + 1);
                                rowCounter += 1;
                                start_row = start_row + 1;
                            }

                            xlWorkSheet.get_Range("A" + start_row, "K" + start_row).Borders.Color = Color.Black;
                            Excel.Range grandTotal_lbl = xlWorkSheet.get_Range("A" + start_row);
                            grandTotal_lbl.Font.Bold = true;
                            grandTotal_lbl.Value2 = "GRAND TOTAL";
                            grandTotal_lbl.Merge(Missing.Value);

                            Excel.Range grandTotal = xlWorkSheet.get_Range("H" + start_row);
                            grandTotal.Font.Bold = true;
                            grandTotal.Value2 = overall_amount;
                            grandTotal.Merge(Missing.Value);

                            start_row = start_row + 4;

                            Excel.Range pghead_lbl = xlWorkSheet.get_Range("F" + start_row, "H" + start_row);
                            //pghead_lbl.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
                            pghead_lbl.Font.Bold = true;
                            pghead_lbl.Value2 = sig_name;
                            pghead_lbl.Merge(Missing.Value);

                            start_row++;

                            Excel.Range pghead_dsg = xlWorkSheet.get_Range("F" + start_row, "H" + start_row);
                            // pghead_dsg.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
                            pghead_dsg.Value2 = sig_desg;
                            pghead_dsg.Merge(Missing.Value);
                        }
                        filename = "";
                        filename = um.remittance_year.Trim() + "-" + um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
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
                    message = "No data extracted";
                }
                return JSON(new { message, filePath, hdmf}, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }




        //REMOVE DUE TO NO BILLING FOR LOANS
        //public ActionResult ExctractToExcelLoansCheck(string rc)
        //{
        //    db_pacco.Database.CommandTimeout = int.MaxValue;
        //    List<sp_remittance_HDMF_rep2_Result> hdmf = new List<sp_remittance_HDMF_rep2_Result>();

        //    assignToModel();

        //    var message     = "";
        //    string filename = "";
        //    var filePath    = "";

        //    Excel.Application xlApp = new Excel.Application();

        //    try
        //    {
        //        string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
        //        if (rc == "03" || rc == "04")
        //        {

        //            hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
        //        }
        //        else if (rc == "06")
        //        {
        //            if (prevValues[3] == "JO")
        //            {
        //                hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
        //            }

        //            else
        //            {
        //                //hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), false).ToList(); REMOVE BY JORGE: THEY WANT TO SEE THE CURRENT PAYMENT
        //                hdmf = db_pacco.sp_remittance_HDMF_rep2(um.remittance_ctrl_nbr.Trim(), true).ToList();
        //            }


        //        }




        //        if (hdmf.Count > 0)
        //        {
        //            var data = hdmf.GroupBy(a => a.payroll_month).OrderBy(grouping => grouping.Max(m => m.last_name)).ThenBy(grouping => grouping.Max(m => m.first_name)).ThenBy(grouping => grouping.Max(m => m.middle_name)).ThenBy(grouping => grouping.Max(m => m.suffix_name)).ToList();

        //            if (rc == "06")
        //            {

        //                Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/HL_TEMPLATE.xlsx"));
        //                Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
        //                xlWorkSheet.Name = "TemplateFormat";
        //                object misValue = System.Reflection.Missing.Value;

        //                //DisplayAlert so that the excel will not popup
        //                xlApp.DisplayAlerts = false;

        //                for (int x = 0; x <= (data.Count - 1); x++)
        //                {

        //                    var monthName = DateTimeFormatInfo.CurrentInfo.GetAbbreviatedMonthName(Convert.ToInt32(data[x].FirstOrDefault().payroll_month));
        //                    //Create a copy of the last sheet

        //                    xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);

        //                    xlWorkSheet.Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;

        //                    //Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];

        //                    string[] OrgAddress = hdmf[0].organization_address1.ToString().Split(new char[] { ',' });
        //                    int rowCounter = 1;
        //                    int recordcount = 0;
        //                    int signatory_pos = hdmf.Count + 3;
        //                    string organizationName = hdmf[0].organization_name.Trim().ToUpper();
        //                    string orgAddBrgy = OrgAddress[0].Trim();
        //                    string orgAddMun = OrgAddress[1].Trim();
        //                    string orgAddProv = OrgAddress[2].Trim();
        //                    string sig_name = hdmf[0].remittance_sig_acct_name.Trim();
        //                    string sig_desg = hdmf[0].remittance_sig_acct_desg.Trim();
        //                    string employersId = hdmf[0].remittance_id1.Trim();
        //                    string periodCovered = monthName + ' ' + data[x].FirstOrDefault().payroll_year; ;
        //                    decimal subtotal_amount = 0;

        //                    decimal overall_amount = 0;



        //                    int start_row = 5;

        //                    Excel.Range emplr_id_lbl = xlWorkSheet.get_Range("A1");
        //                    emplr_id_lbl.Font.Bold = true;
        //                    emplr_id_lbl.Value2 = "Employer Id";
        //                    emplr_id_lbl.Merge(Missing.Value);

        //                    Excel.Range emplr_id = xlWorkSheet.get_Range("B1");
        //                    emplr_id.Font.Bold = true;
        //                    emplr_id.Value2 = employersId;
        //                    emplr_id.Merge(Missing.Value);

        //                    Excel.Range emplr_name_lbl = xlWorkSheet.get_Range("A2");
        //                    emplr_name_lbl.Font.Bold = true;
        //                    emplr_name_lbl.Value2 = "Employer Name";
        //                    emplr_name_lbl.Merge(Missing.Value);

        //                    Excel.Range emplr_name = xlWorkSheet.get_Range("B2", "D2");
        //                    emplr_name.Font.Bold = true;
        //                    emplr_name.Value2 = organizationName;
        //                    emplr_name.Merge(Missing.Value);

        //                    Excel.Range address_lbl = xlWorkSheet.get_Range("A3");
        //                    emplr_name.Font.Bold = true;
        //                    emplr_name.Value2 = organizationName;
        //                    emplr_name.Merge(Missing.Value);

        //                    Excel.Range address = xlWorkSheet.get_Range("B3", "D3");
        //                    address.Font.Bold = true;
        //                    address.Value2 = orgAddBrgy + ", " + orgAddMun + ", " + orgAddProv;
        //                    address.Merge(Missing.Value);

        //                    var g = data[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();

        //                    for (int i = 0; i < g.Count; i++)
        //                    {

        //                        //if ((i + 1) < g.Count && (rowCounter == 38))
        //                        //{
        //                        //    rowCounter = 1;
        //                        //    newWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
        //                        //    Excel.Range subTl_row = newWorkSheet.get_Range("A" + start_row, "J" + start_row);
        //                        //    subTl_row.Font.Bold = true;

        //                        //    Excel.Range subTl_lbl = newWorkSheet.get_Range("A" + start_row);
        //                        //    subTl_lbl.Value2 = "SUBTOTAL";
        //                        //    subTl_lbl.Merge(Missing.Value);

        //                        //    Excel.Range subTl = newWorkSheet.get_Range("I" + start_row);
        //                        //    subTl.Value2 = subtotal_amount;
        //                        //    subTl.Merge(Missing.Value);

        //                        //    subtotal_amount = 0;
        //                        //    start_row = start_row + 1;
        //                        //    continue;

        //                        //}
        //                        //else if ((i + 1) == g.Count)
        //                        //{
        //                        //    newWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
        //                        //    Excel.Range total_row = newWorkSheet.get_Range("A" + start_row, "J" + start_row);
        //                        //    total_row.Font.Bold = true;
        //                        //    Excel.Range ToTl_lbl = newWorkSheet.get_Range("A" + start_row);
        //                        //    ToTl_lbl.Value2 = "SUBTOTAL";
        //                        //    ToTl_lbl.Merge(Missing.Value);

        //                        //    Excel.Range ToTl = newWorkSheet.get_Range("I" + start_row);
        //                        //    ToTl.Value2 = subtotal_amount;
        //                        //    ToTl.Merge(Missing.Value);



        //                        //    subtotal_amount = 0;
        //                        //    start_row = start_row + 1;
        //                        //    break;
        //                        //}


        //                        xlWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
        //                        xlWorkSheet.Cells[start_row, 1] = g[i].hdmf_mid_nbr;
        //                        xlWorkSheet.Cells[start_row, 2] = g[i].hdmf_oth_nbr;
        //                        xlWorkSheet.Cells[start_row, 3] = g[i].last_name;
        //                        xlWorkSheet.Cells[start_row, 4] = g[i].first_name;
        //                        xlWorkSheet.Cells[start_row, 5] = g[i].suffix_name;
        //                        xlWorkSheet.Cells[start_row, 6] = g[i].middle_name;
        //                        xlWorkSheet.Cells[start_row, 7] = g[i].loan_type;
        //                        xlWorkSheet.Cells[start_row, 8] = Missing.Value;
        //                        xlWorkSheet.Cells[start_row, 9] = g[i].rep_amount_ps;
        //                        xlWorkSheet.Cells[start_row, 10] = Missing.Value;
        //                        xlWorkSheet.Cells[start_row, 11] = g[i].empl_id;

        //                        //subtotal_amount += Convert.ToDecimal(g[i].rep_amount_ps);
        //                        overall_amount += Convert.ToDecimal(g[i].rep_amount_ps);

        //                        recordcount = g.Count - (i + 1);
        //                        rowCounter += 1;
        //                        start_row = start_row + 1;
        //                    }

        //                    xlWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
        //                    Excel.Range grandTotal_lbl = xlWorkSheet.get_Range("A" + start_row);
        //                    grandTotal_lbl.Font.Bold = true;
        //                    grandTotal_lbl.Value2 = "GRAND TOTAL";
        //                    grandTotal_lbl.Merge(Missing.Value);

        //                    Excel.Range grandTotal = xlWorkSheet.get_Range("I" + start_row);
        //                    grandTotal.Font.Bold = true;
        //                    grandTotal.Value2 = overall_amount;
        //                    grandTotal.Merge(Missing.Value);


        //                    //Marshal.ReleaseComObject(newWorkSheet);


        //                }

        //                filename = "";
        //                filename = um.remittance_year.Trim() + "-" + um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
        //                xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
        //                    Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
        //                    Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
        //                    Missing.Value, Missing.Value);
        //                xlWorkBook.Close();
        //                xlApp.Quit();

        //                Marshal.ReleaseComObject(xlWorkSheet);
        //                Marshal.ReleaseComObject(xlWorkBook);
        //                Marshal.ReleaseComObject(xlApp);

        //                filePath = "/UploadedFile/" + filename;
        //                message = "success";
        //            }
        //            else
        //            {

        //                Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/CAL_TEMPLATE_CHECK.xlsx"));
        //                Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
        //                xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
        //                object misValue = System.Reflection.Missing.Value;

        //                xlApp.DisplayAlerts = false;

        //                for (int x = 0; x <= (data.Count - 1); x++)
        //                {
        //                    var g = data[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();

        //                    var monthName = DateTimeFormatInfo.CurrentInfo.GetAbbreviatedMonthName(Convert.ToInt32(data[x].FirstOrDefault().payroll_month));
        //                    //Create a copy of the last sheet
        //                    xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[1]);
        //                    //xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;
        //                    //Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
        //                    //newWorkSheet.Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;
        //                    xlWorkSheet.Name = monthName + '.' + data[x].FirstOrDefault().payroll_year;
        //                    string[] OrgAddress = g[0].organization_address1.ToString().Split(new char[] { ',' });
        //                    int rowCounter = 1;
        //                    int recordcount = 0;
        //                    int signatory_pos = g.Count + 3;
        //                    string organizationName = g[0].organization_name.Trim();
        //                    string orgAddBrgy = OrgAddress[0].Trim();
        //                    string orgAddMun = OrgAddress[1].Trim();
        //                    string orgAddProv = OrgAddress[2].Trim();
        //                    string sig_name = g[0].remittance_sig_acct_name.Trim().ToUpper();
        //                    string sig_desg = g[0].remittance_sig_acct_desg.Trim();
        //                    string employersId = g[0].remittance_id1.Trim();
        //                    string periodCovered = monthName + ' ' + data[x].FirstOrDefault().payroll_year;
        //                    decimal subtotal_amount = 0;


        //                    decimal overall_amount = 0;
        //                    //DisplayAlert so that the excel will not popup
        //                    xlApp.DisplayAlerts = false;

        //                    int start_row = 5;

        //                    Excel.Range emplr_id_lbl = xlWorkSheet.get_Range("A1");
        //                    emplr_id_lbl.Font.Bold = true;
        //                    emplr_id_lbl.Value2 = "Employer Id";
        //                    emplr_id_lbl.Merge(Missing.Value);

        //                    Excel.Range emplr_id = xlWorkSheet.get_Range("B1");
        //                    emplr_id.Font.Bold = true;
        //                    emplr_id.Value2 = employersId;
        //                    emplr_id.Merge(Missing.Value);

        //                    Excel.Range emplr_name_lbl = xlWorkSheet.get_Range("A2");
        //                    emplr_name_lbl.Font.Bold = true;
        //                    emplr_name_lbl.Value2 = "Employer Name";
        //                    emplr_name_lbl.Merge(Missing.Value);

        //                    Excel.Range emplr_name = xlWorkSheet.get_Range("B2", "D2");
        //                    emplr_name.Font.Bold = true;
        //                    emplr_name.Value2 = organizationName;
        //                    emplr_name.Merge(Missing.Value);

        //                    Excel.Range address_lbl = xlWorkSheet.get_Range("A3");
        //                    emplr_name.Font.Bold = true;
        //                    emplr_name.Value2 = organizationName;
        //                    emplr_name.Merge(Missing.Value);

        //                    Excel.Range address = xlWorkSheet.get_Range("B3", "D3");
        //                    address.Font.Bold = true;
        //                    address.Value2 = orgAddBrgy + ", " + orgAddMun + ", " + orgAddProv;
        //                    address.Merge(Missing.Value);

        //                    Excel.Range period_cvrd_lbl = xlWorkSheet.get_Range("F1");
        //                    period_cvrd_lbl.Font.Bold = true;
        //                    period_cvrd_lbl.Value2 = "Period Covered";
        //                    period_cvrd_lbl.Merge(Missing.Value);

        //                    Excel.Range period_cvrd = xlWorkSheet.get_Range("G1");
        //                    period_cvrd.Font.Bold = true;
        //                    period_cvrd.Value2 = periodCovered;
        //                    period_cvrd.Merge(Missing.Value);

        //                    Excel.Range phone_lbl = xlWorkSheet.get_Range("F2");
        //                    phone_lbl.Font.Bold = true;
        //                    phone_lbl.Value2 = "Telephone Number";
        //                    phone_lbl.Merge(Missing.Value);

        //                    Excel.Range phone = xlWorkSheet.get_Range("G2");
        //                    phone.Font.Bold = true;
        //                    phone.Value2 = Missing.Value;
        //                    phone.Merge(Missing.Value);




        //                    for (int i = 0; i < g.Count; i++)
        //                    {


        //                        xlWorkSheet.get_Range("A5", "M5").Copy(Missing.Value);
        //                        xlWorkSheet.get_Range("A" + start_row, "M" + start_row).PasteSpecial(Excel.XlPasteType.xlPasteAll,
        //                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);

        //                        //if ((i + 1) < g.Count && (rowCounter == 38))
        //                        //{
        //                        //    rowCounter = 1;
        //                        //    xlWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
        //                        //    Excel.Range subTl_row = xlWorkSheet.get_Range("A" + start_row, "J" + start_row);
        //                        //    subTl_row.Font.Bold = true;


        //                        //    Excel.Range subTl_lbl = xlWorkSheet.get_Range("A" + start_row);
        //                        //    subTl_lbl.Value2 = "SUBTOTAL";
        //                        //    subTl_lbl.Merge(Missing.Value);

        //                        //    Excel.Range subTl_lbl2 = xlWorkSheet.get_Range("B" + start_row);
        //                        //    subTl_lbl2.Value2 = Missing.Value;

        //                        //    Excel.Range subTl_lbl3 = xlWorkSheet.get_Range("C" + start_row);
        //                        //    subTl_lbl3.Value2 = Missing.Value;

        //                        //    Excel.Range subTl_lbl4 = xlWorkSheet.get_Range("D" + start_row);
        //                        //    subTl_lbl4.Value2 = Missing.Value;

        //                        //    Excel.Range subTl_lbl5 = xlWorkSheet.get_Range("E" + start_row);
        //                        //    subTl_lbl5.Value2 = Missing.Value;

        //                        //    Excel.Range subTl_lbl6 = xlWorkSheet.get_Range("F" + start_row);
        //                        //    subTl_lbl6.Value2 = Missing.Value;

        //                        //    Excel.Range subTl_lbl7 = xlWorkSheet.get_Range("G" + start_row);
        //                        //    subTl_lbl7.Value2 = Missing.Value;

        //                        //    Excel.Range subTl_lbl8 = xlWorkSheet.get_Range("I" + start_row);
        //                        //    subTl_lbl8.Value2 = Missing.Value;

        //                        //    Excel.Range subTl_lbl9 = xlWorkSheet.get_Range("J" + start_row);
        //                        //    subTl_lbl9.Value2 = Missing.Value;


        //                        //    Excel.Range subTl = xlWorkSheet.get_Range("H" + start_row);
        //                        //    subTl.Value2 = subtotal_amount;
        //                        //    subTl.Merge(Missing.Value);

        //                        //    subtotal_amount = 0;
        //                        //    start_row = start_row + 1;
        //                        //    continue;

        //                        //}
        //                        //else if ((i + 1) == (g.Count + 1))
        //                        //{


        //                        //    xlWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;
        //                        //    Excel.Range total_row = xlWorkSheet.get_Range("A" + start_row, "I" + start_row);
        //                        //    total_row.Font.Bold = true;
        //                        //    Excel.Range ToTl_lbl = xlWorkSheet.get_Range("A" + start_row);
        //                        //    ToTl_lbl.Value2 = "SUBTOTAL";
        //                        //    ToTl_lbl.Merge(Missing.Value);

        //                        //    Excel.Range ToTl = xlWorkSheet.get_Range("H" + start_row);
        //                        //    ToTl.Value2 = subtotal_amount;
        //                        //    ToTl.Merge(Missing.Value);

        //                        //    subtotal_amount = 0;
        //                        //    start_row = start_row + 1;
        //                        //    break;
        //                        //}

        //                        xlWorkSheet.get_Range("A" + start_row, "J" + start_row).Borders.Color = Color.Black;

        //                        xlWorkSheet.Cells[start_row, 1] = g[i].hdmf_mid_nbr;
        //                        xlWorkSheet.Cells[start_row, 2] = g[i].hdmf_oth_nbr;
        //                        xlWorkSheet.Cells[start_row, 3] = g[i].last_name;
        //                        xlWorkSheet.Cells[start_row, 4] = g[i].first_name;
        //                        xlWorkSheet.Cells[start_row, 5] = g[i].suffix_name;
        //                        xlWorkSheet.Cells[start_row, 6] = g[i].middle_name;
        //                        xlWorkSheet.Cells[start_row, 7] = g[i].loan_type;
        //                        xlWorkSheet.Cells[start_row, 8] = g[i].rep_amount_ps;
        //                        xlWorkSheet.Cells[start_row, 9] = Missing.Value;
        //                        xlWorkSheet.Cells[start_row, 10] = g[i].empl_id;



        //                        //subtotal_amount += Convert.ToDecimal(g[i].rep_amount_ps);
        //                        overall_amount += Convert.ToDecimal(g[i].rep_amount_ps);

        //                        recordcount = g.Count - (i + 1);
        //                        rowCounter += 1;
        //                        start_row = start_row + 1;
        //                    }

        //                    xlWorkSheet.get_Range("A" + start_row, "K" + start_row).Borders.Color = Color.Black;
        //                    Excel.Range grandTotal_lbl = xlWorkSheet.get_Range("A" + start_row);
        //                    grandTotal_lbl.Font.Bold = true;
        //                    grandTotal_lbl.Value2 = "GRAND TOTAL";
        //                    grandTotal_lbl.Merge(Missing.Value);

        //                    Excel.Range grandTotal = xlWorkSheet.get_Range("H" + start_row);
        //                    grandTotal.Font.Bold = true;
        //                    grandTotal.Value2 = overall_amount;
        //                    grandTotal.Merge(Missing.Value);

        //                    start_row = start_row + 4;

        //                    Excel.Range pghead_lbl = xlWorkSheet.get_Range("F" + start_row, "H" + start_row);
        //                    //pghead_lbl.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
        //                    pghead_lbl.Font.Bold = true;
        //                    pghead_lbl.Value2 = sig_name;
        //                    pghead_lbl.Merge(Missing.Value);

        //                    start_row++;

        //                    Excel.Range pghead_dsg = xlWorkSheet.get_Range("F" + start_row, "H" + start_row);
        //                    // pghead_dsg.Style.HorizontalAlignment = Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter;
        //                    pghead_dsg.Value2 = sig_desg;
        //                    pghead_dsg.Merge(Missing.Value);
        //                }
        //                filename = "";
        //                filename = um.remittance_year.Trim() + "-" + um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
        //                xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
        //                    Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
        //                    Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
        //                    Missing.Value, Missing.Value);
        //                xlWorkBook.Close();
        //                xlApp.Quit();

        //                Marshal.ReleaseComObject(xlWorkSheet);
        //                Marshal.ReleaseComObject(xlWorkBook);
        //                Marshal.ReleaseComObject(xlApp);

        //                filePath = "/UploadedFile/" + filename;
        //                message = "success";
        //            }


        //        }
        //        else
        //        {
        //            message = "No data extracted";
        //        }
        //        return Json(new { message, filePath, hdmf }, JsonRequestBehavior.AllowGet);

        //    }
        //    catch (DbEntityValidationException e)
        //    {
        //        message = DbEntityValidationExceptionError(e);

        //        return Json(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description: db entity validator exception error fucntion for try-catch
        //*********************************************************************//
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