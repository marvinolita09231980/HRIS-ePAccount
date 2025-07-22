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
    public class cRemitLedgerGSISController : Controller
    {
        
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        public string url_name = "cRemitLedger";
        // GET: cRemitLedgerHDMF
        // GET: cRemitLedgerHDMF
        User_Menu um = new User_Menu();
        // GET: cRemitLedgerGSIS
        
        public ActionResult Index()
        {
            if (Session["user_id"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            
            else if (Session["PreviousValuesonPage_cRemitLedger"] == null)
            {
                return RedirectToAction("Index", "cRemitLedger");
            }
            assignToModel();
            return View(um);
        }
        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
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
        
        public ActionResult initializeData(string l, string v_opt)
        {
            string excelExportServer = System.Configuration.ConfigurationManager.AppSettings["ExcelExportServerIP"];
            assignToModel();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            string[] prevVal = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            var department_list = db_pacco.vw_departments_tbl_list.OrderBy(a => a.department_code);
            var details = db_pacco.sp_remittance_ledger_info_GSIS(um.remittance_ctrl_nbr, "", l, v_opt,"","").ToList();
          
                    
            var rs = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == um.remittance_ctrl_nbr).FirstOrDefault();

            return JSON(new { department_list, details, remittance_status = rs.remittance_status, prevVal, excelExportServer}, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : MARVIN - Created Date : 10/19/2019
        // Description:  assign sp_user_menu_access_role_list values to model for page data during pageload
        //*********************************************************************//
        public void assignToModel()
        {
            string[] prevValues         = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            um.remittance_year          = prevValues[0].Trim();
            um.remittance_month         = prevValues[1].Trim();
            um.remittance_month_descr   = prevValues[2].Trim();
            um.employment_type          = prevValues[3].Trim();
            um.employment_type_descr    = prevValues[4].Trim();
            um.remittancetype_code      = prevValues[5].Trim();
            um.remittancetype_descr     = prevValues[6].Trim();
            um.remittance_ctrl_nbr      = prevValues[7].Trim();
            um.remittance_status        = prevValues[8].Trim();
            um.remittance_status_descr  = prevValues[9].Trim();

        }
        public ActionResult GetVoucher()
        {
            assignToModel();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var voucher_list = db_pacco.sp_voucher_not_in_remittance(um.remittance_year, um.remittance_month, um.employment_type, um.remittancetype_code);

            return JSON(new { voucher_list }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetPayrollRegistry(string payroll_registry_nbr)
        {
            assignToModel();

            try
            {
                var payroll_reg_list = db_pacco.sp_payrollregistry_not_in_remittance_GSIS(um.remittance_year, um.remittance_month, um.employment_type, um.remittancetype_code, payroll_registry_nbr);

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
        // Description: GSIS remittance info ledger list that is to be display in DataTable grid
        //*********************************************************************//
        public ActionResult GetRejectResult(string dep, string letter, string type, string v_opt)
        {
            
            assignToModel();
            object details = new object();
            try
            {
                if (v_opt == "1")
                {
                    details = db_pacco.sp_remittance_rejected_GSIS_dtl(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(), v_opt).ToList();
                }
                else if (v_opt == "2")
                {
                    details = db_pacco.sp_remittance_rejected_GSIS_dtl(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(), v_opt).Where(a => a.payroll_month == um.remittance_month).ToList();
                }
                else if (v_opt == "3")
                {
                    details = db_pacco.sp_remittance_rejected_GSIS_dtl(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(), v_opt).ToList();
                }

                return JSON(new { message = "success", details }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult GetInfoResult(string dep, string letter,string type,string v_opt)
        {
            assignToModel();
            object details = new object();
            try
            {
                if(v_opt == "1")
                {
                    details = db_pacco.sp_remittance_ledger_info_GSIS(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(),v_opt, "", "").ToList();
                }
                else if (v_opt == "2")
                {
                    details = db_pacco.sp_remittance_ledger_info_GSIS(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(),v_opt, "", "").Where(a => a.payroll_month == um.remittance_month).ToList();
                }
                else if (v_opt == "3")
                {
                    details = db_pacco.sp_remittance_ledger_info_GSIS(um.remittance_ctrl_nbr, dep.Trim(), letter.Trim(),v_opt, "", "").ToList();
                }

                return JSON(new { message = "success", details }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }

        //delete in GSIS remittance_dtl_gsis_tbl
        public ActionResult DeleteGSISDetails(string rcn, string empl_id,string vn, string payroll_month)
        {
            string message = "";
            try
            {
                var dt = db_pacco.remittance_dtl_gsis_tbl.Where(a =>
                   a.remittance_ctrl_nbr == rcn &&
                   a.empl_id == empl_id &&
                   a.voucher_nbr == vn
                   ).FirstOrDefault();

                var dt1 = db_pacco.remittance_dtl_gsis_month_tbl.Where(a =>
                 a.remittance_ctrl_nbr == rcn &&
                 a.empl_id == empl_id &&
                 a.voucher_nbr == vn).FirstOrDefault();

                if (dt == null && dt1 == null)
                {
                    message = "not_found";
                }
                else
                {
                    if (dt != null) {
                        db_pacco.remittance_dtl_gsis_tbl.Remove(dt);
                    }

                    if (dt1 != null)
                    {
                        db_pacco.remittance_dtl_gsis_month_tbl.Remove(dt1);
                    }

                    db_pacco.SaveChanges();
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

        //check data if present in remittance_dtl_gsis_tbl
       
        public ActionResult CheckData(sp_remittance_ledger_info_GSIS_Result data)
        {
            var rcn = data.remittance_ctrl_nbr;
            var empl_id = data.empl_id;
            var vn = data.voucher_nbr;
            var message = "";
            var message_overrides = "N";

            try
            {
                // Check if any records exist in the three tables
                var dtExists = db_pacco.remittance_dtl_gsis_tbl.Any(a =>
                    a.remittance_ctrl_nbr == rcn &&
                    a.empl_id == empl_id &&
                    a.voucher_nbr == vn);

                var dt1Exists = db_pacco.remittance_dtl_gsis_month_tbl.Any(a =>
                    a.remittance_ctrl_nbr == rcn &&
                    a.empl_id == empl_id &&
                    a.voucher_nbr == vn);

                var dt2Exists = db_pacco.remittance_dtl_gsis_month_ovrd_tbl.Any(a =>
                    a.remittance_ctrl_nbr == rcn &&
                    a.empl_id == empl_id &&
                    a.voucher_nbr == vn);

                // Set message_overrides if dt2Exists is true
                if (dt2Exists)
                {
                    message_overrides = "Y";
                }

                // Set message based on the existence of dt and dt1
                if (!dtExists && !dt1Exists)
                {
                    message = "not_found";
                }
                else
                {
                    message = "found";
                }

                return Json(new { message, message_overrides }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }


        //save employee remittance in remittance_dtl_gsis_tbl
        public ActionResult Save_Details(remittance_dtl_gsis_tbl data)
        {
            try
            {
                db_pacco.remittance_dtl_gsis_tbl.Add(data);
                db_pacco.SaveChanges();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }

        // edit details in remittance_dtl_gsis_tbl
        public ActionResult Save_Edit_Details(remittance_dtl_gsis_month_ovrd_tbl par_data, string empl_id, string vn, decimal o_ps, decimal o_gs, string remit_status)
        {
            string message = "";
            assignToModel();

            var rcn = um.remittance_ctrl_nbr;
            try
            {
                var dt = db_pacco.remittance_dtl_gsis_tbl.Where(a =>
                   a.remittance_ctrl_nbr == par_data.remittance_ctrl_nbr &&
                   a.empl_id == empl_id &&
                   a.voucher_nbr == vn).FirstOrDefault();

                var dt_override = db_pacco.remittance_dtl_gsis_month_ovrd_tbl.Where(a =>
                    a.remittance_ctrl_nbr == par_data.remittance_ctrl_nbr &&
                    a.empl_id == empl_id &&
                    a.voucher_nbr == vn).FirstOrDefault();

                if (dt_override == null) //ADD DATA
                {
                    db_pacco.remittance_dtl_gsis_month_ovrd_tbl.Add(par_data);
                }

                else //UPDATE DATA
                {
                    remittance_dtl_gsis_month_ovrd_tbl tbl = db_pacco.remittance_dtl_gsis_month_ovrd_tbl.Where(a =>
                    a.remittance_ctrl_nbr == par_data.remittance_ctrl_nbr &&
                    a.empl_id == empl_id &&
                    a.voucher_nbr == vn).FirstOrDefault();
                    tbl.p_gsis_gs               = par_data.p_gsis_gs            ;
                    tbl.p_gsis_ps               = par_data.p_gsis_ps            ;
                    tbl.p_sif_gs                = par_data.p_sif_gs             ;
                    tbl.p_gsis_uoli             = par_data.p_gsis_uoli          ;
                    tbl.p_gsis_ehp              = par_data.p_gsis_ehp           ;
                    tbl.p_gsis_hip              = par_data.p_gsis_hip           ;
                    tbl.p_gsis_ceap             = par_data.p_gsis_ceap          ;
                    tbl.p_gsis_addl_ins         = par_data.p_gsis_ceap          ;
                    tbl.p_gsis_conso_ln         = par_data.p_gsis_conso_ln      ;
                    tbl.p_gsis_policy_reg_ln    = par_data.p_gsis_policy_reg_ln ;
                    tbl.p_gsis_policy_opt_ln    = par_data.p_gsis_policy_opt_ln ;
                    tbl.p_gsis_emergency_ln     = par_data.p_gsis_emergency_ln  ;
                    tbl.p_gsis_ecard_ln         = par_data.p_gsis_ecard_ln      ;
                    tbl.p_gsis_educ_asst_ln     = par_data.p_gsis_educ_asst_ln  ;
                    tbl.p_gsis_real_state_ln    = par_data.p_gsis_real_state_ln ;
                    tbl.p_gsis_sos_ln           = par_data.p_gsis_sos_ln        ;
                    tbl.p_gsis_help             = par_data.p_gsis_help          ;
                    tbl.u_gsis_gs               = par_data.u_gsis_gs            ;
                    tbl.u_gsis_ps               = par_data.u_gsis_ps            ;
                    tbl.u_sif_gs                = par_data.u_sif_gs             ;
                    tbl.u_gsis_uoli             = par_data.u_gsis_uoli          ;
                    tbl.u_gsis_ehp              = par_data.u_gsis_ehp           ;
                    tbl.u_gsis_hip              = par_data.u_gsis_hip           ;
                    tbl.u_gsis_ceap             = par_data.u_gsis_ceap          ;
                    tbl.u_gsis_addl_ins         = par_data.u_gsis_addl_ins      ;
                    tbl.u_gsis_conso_ln         = par_data.u_gsis_conso_ln      ;
                    tbl.u_gsis_policy_reg_ln    = par_data.u_gsis_policy_reg_ln ;
                    tbl.u_gsis_policy_opt_ln    = par_data.u_gsis_policy_opt_ln ;
                    tbl.u_gsis_emergency_ln     = par_data.u_gsis_emergency_ln  ;
                    tbl.u_gsis_ecard_ln         = par_data.u_gsis_ecard_ln      ;
                    tbl.u_gsis_educ_asst_ln     = par_data.u_gsis_educ_asst_ln  ;
                    tbl.u_gsis_real_state_ln    = par_data.u_gsis_real_state_ln ;
                    tbl.u_gsis_sos_ln           = par_data.u_gsis_sos_ln        ;
                    tbl.u_gsis_help             = par_data.u_gsis_help          ;
                    tbl.o_gsis_gs               = par_data.o_gsis_gs            ;
                    tbl.o_gsis_ps               = par_data.o_gsis_ps            ;
                    tbl.p_other_loan1           = par_data.p_other_loan1        ;
                    tbl.p_other_loan2           = par_data.p_other_loan2        ;
                    tbl.u_other_loan1           = par_data.u_other_loan1        ;
                    tbl.u_other_loan2           = par_data.u_other_loan2        ;
                    tbl.o_other_loan1           = par_data.o_other_loan1        ;
                    tbl.o_other_loan2           = par_data.o_other_loan2        ;
                    tbl.p_other_loan3           = par_data.p_other_loan3        ;
                    tbl.u_other_loan3           = par_data.u_other_loan3        ;
                    tbl.o_other_loan3           = par_data.o_other_loan3;
                    //tbl. = par_remittance_ctrl_nbr;


                }

                //if (dt_override == null)
                //{
                //    db_pacco.remittance_dtl_gsis_month_ovrd_tbl.Add(par_data);
                //}



                db_pacco.SaveChanges();

                if (dt == null)
                    {
                        message = "not_found";
                    }
                    else
                    {
                        dt.o_gsis_ps = o_ps;
                        dt.o_gsis_gs = o_gs;
                        dt.remittance_status = remit_status;
                        db_pacco.SaveChanges();

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


        // take the fisrst letter of string
        public String firstLetter(string val)
        {
            string c = "";
            if(val == null || val == "")
            {
               
            }
            else
            {
                c = val.Substring(0, 1);
            }
            return c;
        }

        //compute late remittance
        public Boolean late_remittance(string duedate)
        {
            string[] date = duedate.Split(new char[] { '/' });
            var d_mo = Convert.ToInt32(date[0]);
            var d_yr = Convert.ToInt32(date[1]);
            var r_mo = Convert.ToInt32(um.remittance_month);
            var r_yr = Convert.ToInt32(um.remittance_year);

            if(d_mo < r_mo && d_yr < r_yr)
            {
                return true;
            }
            else if (d_mo >= r_mo && d_yr < r_yr)
            {
                return true;
            }
            else if (d_mo < r_mo && d_yr == r_yr)
            {
                return true;
            }
            else if (d_mo > r_mo && d_yr < r_yr)
            {
                return true;
            }
            else
            {
                return false;
            }
            
        }
        public String EMPLTYPE(string val)
        {
            var retstr = "";
            if(val == "CE")
            {
                retstr =  "CASUAL";
            }
            else if(val == "RE")
            {
                retstr = "REGULAR";
            }
            return retstr;
        }


        //upload remitted GSIS remittance 
        public ActionResult UploadData(string par_filename)
        {
            string message = "";
            assignToModel();
            var id = Session["user_id"].ToString().Trim();
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;

                var sp_upload_file_from_GSIS = db_pacco.sp_upload_file_from_GSIS(um.remittance_ctrl_nbr.Trim(), par_filename, id);
                return JSON(new { sp_upload_file_from_GSIS,message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                 message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }

        // extract to excel data not in remittance

        public String employerId(sp_remittance_GSIS_rep_Result data)
        {
            if(data.employment_type == "RE")
            {
                return data.remittance_id1;
            }
            else if (data.employment_type == "CE")
            {
                return data.remittance_id2;
            }
            else
            {
                return "";
            }
        }

        public ActionResult ExtractToExcelOverride()
        {
            assignToModel();
            var message = "";
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var filePath = "";
                var zero = "0";
                var dt = db_pacco.sp_remittance_override_GSIS_rep(um.remittance_ctrl_nbr, um.remittance_year, um.remittance_month).GroupBy(b => b.report_status).OrderBy(grouping => grouping.Max(m => m.report_status)).ToList();
                //var g = db_pacco.sp_remittance_GSIS_rep(um.remittance_ctrl_nbr, um.remittance_year, um.remittance_month).ToList();


                if (dt.Count > 0)
                {
                    //string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(phic[0].remittance_month)).Substring(0, 3);

                    Excel.Application xlApp = new Excel.Application();

                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/GSIS.xlsx")); ;

                    Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[1];

                    xlWorkSheet.Name = "Template";

                    xlApp.DisplayAlerts = false;




                    for (int x = (dt.Count - 1); x >= 0; x--)
                    {
                        decimal start_row = 6;
                        decimal c_start_row_i = start_row;
                        decimal c_ps_total = 0;
                        decimal c_gs_total = 0;
                        decimal c_sif_total = 0;
                        decimal c_consol_total = 0;
                        decimal c_ecard_total = 0;
                        decimal c_emerg_total = 0;
                        decimal c_educ_asst_total = 0;
                        decimal c_sos_total = 0;
                        decimal c_plreg_total = 0;
                        decimal c_plopt_total = 0;
                        decimal c_rel_total = 0;
                        decimal c_uoli_total = 0;
                        decimal c_ceap_total = 0;
                        decimal c_help_total = 0;
                        decimal c_gfal_total = 0;
                        decimal c_mpl_total = 0;
                        decimal c_cpl_total = 0;
                        var g = dt[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();
                        var dm = g[0].due_month.Split(new char[] { '/' });
                        var monthName = dm[0] + "_" + dm[1];


                        //Create a copy of the last sheet
                        xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[xlWorkBook.Sheets.Count]);

                        if (x == (dt.Count - 1))
                        {
                            // assign name to the new created sheet
                            xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = g[x].report_status;
                        }
                        else
                        {
                            // assign name to the new created sheet
                            xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = g[x].report_status;
                        }


                        // create instance name of a new created sheet
                        Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];



                        Excel.Range DueMonthVal2 = newWorkSheet.get_Range("B3");

                        Excel.Range office_code2 = newWorkSheet.get_Range("B2");

                        //Excel.Range empl_type2 = newWorkSheet.get_Range("G1", "H1");
                        //empl_type2.Merge();


                        Excel.Range org_name2 = newWorkSheet.get_Range("B1");
                        org_name2.Merge();

                        for (var i = 0; i < g.Count(); i++)
                        {

                            if (c_start_row_i == start_row)
                            {
                                DueMonthVal2.Value2 = g[i].due_month.Trim();
                                //office_code2.Value2 = employerId(g[i]);
                                //empl_type2.Value2 = EMPLTYPE(g[i].employment_type);
                                org_name2.Value2 = g[i].organization_name.ToUpper() + " - " + EMPLTYPE(g[i].employment_type);
                            }

                            newWorkSheet.Cells[c_start_row_i, 1] = g[i].gsis_bpno.Trim();
                            newWorkSheet.Cells[c_start_row_i, 2] = g[i].last_name.Trim();
                            newWorkSheet.Cells[c_start_row_i, 3] = g[i].first_name.Trim();
                            newWorkSheet.Cells[c_start_row_i, 4] = firstLetter(g[i].middle_name.Trim()).ToUpper();
                            newWorkSheet.Cells[c_start_row_i, 5] = Missing.Value;
                            newWorkSheet.Cells[c_start_row_i, 6] = g[i].suffix_name.Trim();
                            newWorkSheet.Cells[c_start_row_i, 7] = Missing.Value;
                            newWorkSheet.Cells[c_start_row_i, 8] = g[i].gsis_crn.Trim();
                            newWorkSheet.Cells[c_start_row_i, 9] = g[i].basic_monthly_salary;
                            newWorkSheet.Cells[c_start_row_i, 10] = g[i].effective_date;
                            newWorkSheet.Cells[c_start_row_i, 11] = g[i].p_gsis_ps;
                            newWorkSheet.Cells[c_start_row_i, 12] = g[i].p_gsis_gs;
                            newWorkSheet.Cells[c_start_row_i, 13] = g[i].p_sif_gs;
                            newWorkSheet.Cells[c_start_row_i, 14] = g[i].p_gsis_conso_ln;
                            newWorkSheet.Cells[c_start_row_i, 15] = g[i].p_gsis_ecard_ln;
                            newWorkSheet.Cells[c_start_row_i, 16] = zero;
                            newWorkSheet.Cells[c_start_row_i, 17] = zero;
                            newWorkSheet.Cells[c_start_row_i, 18] = g[i].p_gsis_emergency_ln;
                            newWorkSheet.Cells[c_start_row_i, 19] = g[i].p_gsis_educ_asst_ln;
                            newWorkSheet.Cells[c_start_row_i, 20] = zero;
                            newWorkSheet.Cells[c_start_row_i, 21] = g[i].p_gsis_sos_ln;
                            newWorkSheet.Cells[c_start_row_i, 22] = g[i].p_gsis_policy_reg_ln;
                            newWorkSheet.Cells[c_start_row_i, 23] = g[i].p_gsis_policy_opt_ln;
                            newWorkSheet.Cells[c_start_row_i, 24] = g[i].p_gsis_real_state_ln;
                            newWorkSheet.Cells[c_start_row_i, 25] = zero;
                            newWorkSheet.Cells[c_start_row_i, 26] = zero;
                            newWorkSheet.Cells[c_start_row_i, 27] = g[i].p_gsis_uoli;
                            newWorkSheet.Cells[c_start_row_i, 28] = g[i].p_gsis_ceap;
                            newWorkSheet.Cells[c_start_row_i, 29] = zero;
                            newWorkSheet.Cells[c_start_row_i, 30] = zero;
                            newWorkSheet.Cells[c_start_row_i, 31] = zero;
                            newWorkSheet.Cells[c_start_row_i, 32] = zero;
                            newWorkSheet.Cells[c_start_row_i, 33] = zero;
                            newWorkSheet.Cells[c_start_row_i, 34] = g[i].p_gsis_help;
                            newWorkSheet.Cells[c_start_row_i, 35] = g[i].p_other_loan2; //GFAL
                            newWorkSheet.Cells[c_start_row_i, 36] = g[i].p_other_loan1; //MPL
                            newWorkSheet.Cells[c_start_row_i, 37] = g[i].p_other_loan3; //CPL            //CPL
                            newWorkSheet.Cells[c_start_row_i, 38] = g[i].empl_id; ;

                            c_ps_total += Convert.ToDecimal(g[i].p_gsis_ps);
                            c_gs_total += Convert.ToDecimal(g[i].p_gsis_gs);
                            c_sif_total += Convert.ToDecimal(g[i].p_sif_gs);
                            c_consol_total += Convert.ToDecimal(g[i].p_gsis_conso_ln);
                            c_ecard_total += Convert.ToDecimal(g[i].p_gsis_ecard_ln);
                            c_emerg_total += Convert.ToDecimal(g[i].p_gsis_emergency_ln);
                            c_educ_asst_total += Convert.ToDecimal(g[i].p_gsis_educ_asst_ln);
                            c_sos_total += Convert.ToDecimal(g[i].p_gsis_sos_ln);
                            c_plreg_total += Convert.ToDecimal(g[i].p_gsis_policy_reg_ln);
                            c_plopt_total += Convert.ToDecimal(g[i].p_gsis_policy_opt_ln);
                            c_rel_total += Convert.ToDecimal(g[i].p_gsis_real_state_ln);
                            c_uoli_total += Convert.ToDecimal(g[i].p_gsis_uoli);
                            c_ceap_total += Convert.ToDecimal(g[i].p_gsis_ceap);
                            c_help_total += Convert.ToDecimal(g[i].p_gsis_help);
                            c_gfal_total += Convert.ToDecimal(g[i].p_other_loan2); //GFAL
                            c_mpl_total += Convert.ToDecimal(g[i].p_other_loan1); //MPL
                            c_cpl_total += Convert.ToDecimal(g[i].p_other_loan3); //CPL
                            ++c_start_row_i;
                        }
                        ++c_start_row_i;

                        newWorkSheet.Cells[c_start_row_i, 10] = "TOTAL";
                        newWorkSheet.Cells[c_start_row_i, 11] = c_ps_total;
                        newWorkSheet.Cells[c_start_row_i, 12] = c_gs_total;
                        newWorkSheet.Cells[c_start_row_i, 13] = c_sif_total;
                        newWorkSheet.Cells[c_start_row_i, 14] = c_consol_total;
                        newWorkSheet.Cells[c_start_row_i, 15] = c_ecard_total;
                        newWorkSheet.Cells[c_start_row_i, 18] = c_emerg_total;
                        newWorkSheet.Cells[c_start_row_i, 19] = c_educ_asst_total;
                        newWorkSheet.Cells[c_start_row_i, 21] = c_sos_total;
                        newWorkSheet.Cells[c_start_row_i, 22] = c_plreg_total;
                        newWorkSheet.Cells[c_start_row_i, 23] = c_plopt_total;
                        newWorkSheet.Cells[c_start_row_i, 24] = c_rel_total;
                        newWorkSheet.Cells[c_start_row_i, 27] = c_uoli_total;
                        newWorkSheet.Cells[c_start_row_i, 28] = c_ceap_total;
                        newWorkSheet.Cells[c_start_row_i, 34] = c_help_total;
                        newWorkSheet.Cells[c_start_row_i, 35] = c_gfal_total;
                        newWorkSheet.Cells[c_start_row_i, 36] = c_mpl_total;
                        newWorkSheet.Cells[c_start_row_i, 37] = c_cpl_total;
                        newWorkSheet.get_Range("J" + c_start_row_i, "AK" + c_start_row_i).Font.Bold = true;
                        Marshal.ReleaseComObject(newWorkSheet);

                        //FONT STYLE
                        Excel.Range rowRange = newWorkSheet.get_Range("A1", "AI" + c_start_row_i);
                        rowRange.Font.Name = "Arial";
                        rowRange.Font.Size = 10;

                        //NUMBER FORMAT
                        Excel.Range rowRangeNumber = newWorkSheet.get_Range("K1", "AI" + c_start_row_i);
                        rowRangeNumber.NumberFormat = "General";

                        //NUMBER FORMAT MONTHLY SALARY
                        Excel.Range rowRangeSalary = newWorkSheet.get_Range("I" + start_row, "I" + c_start_row_i);
                        rowRangeSalary.NumberFormat = "General";

                    }


                    Marshal.ReleaseComObject(xlWorkSheet);
                    string filename = "";
                    filename = um.remittance_year.Trim() + "-" + um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
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
                    message = "No Data Found!";
                }

                return JSON(new { message = message, filePath }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }


        }

        public ActionResult ExtractToPhpExcel()
        {
            assignToModel();
            var message = "";
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                List<sp_remittance_GSIS_rep_2_Result> collection = new List<sp_remittance_GSIS_rep_2_Result>();
                var sp_remittance_GSIS_rep_2 = db_pacco.sp_remittance_GSIS_rep_2(um.remittance_ctrl_nbr, um.remittance_year, um.remittance_month).GroupBy(b => b.due_month).ToList();

                return JSON(new { message = message, sp_remittance_GSIS_rep_2 }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ExtractToPhpExcel_voucheronly()
        {
            assignToModel();
            var message = "";
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                List<sp_remittance_GSIS_rep_2_Result> collection = new List<sp_remittance_GSIS_rep_2_Result>();
                var sp_remittance_GSIS_rep_2 = db_pacco.sp_remittance_GSIS_rep_voucher_only(um.remittance_ctrl_nbr, um.remittance_year, um.remittance_month).GroupBy(b => b.due_month).OrderBy(grouping => grouping.Max(m => m.due_month)).ToList();

                return JSON(new { message = message, sp_remittance_GSIS_rep_2 }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult ExtractToExcel()
        {
            assignToModel();
            var message = "";
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var filePath = "";
                var zero = "0";
                var dt = db_pacco.sp_remittance_GSIS_rep(um.remittance_ctrl_nbr,um.remittance_year, um.remittance_month).GroupBy(b => b.due_month).OrderBy(grouping => grouping.Max(m => m.due_month)).ToList();
                //var g = db_pacco.sp_remittance_GSIS_rep(um.remittance_ctrl_nbr, um.remittance_year, um.remittance_month).ToList();

              
                if (dt.Count > 0)
                {
                           //string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(phic[0].remittance_month)).Substring(0, 3);

                            Excel.Application xlApp = new Excel.Application();
                   
                            Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/GSIS.xlsx")); ;
                            
                            Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[1];

                            xlWorkSheet.Name = "Template";
                           
                            xlApp.DisplayAlerts = false;

                            


                    for (int x = (dt.Count - 1); x >= 0; x--)
                       {
                           decimal start_row             = 6;
                           decimal c_start_row_i         = start_row;
                           decimal c_ps_total            = 0;
                           decimal c_gs_total            = 0;
                           decimal c_sif_total           = 0;
                           decimal c_consol_total        = 0;
                           decimal c_ecard_total         = 0;
                           decimal c_emerg_total         = 0;
                           decimal c_educ_asst_total     = 0;
                           decimal c_sos_total           = 0;
                           decimal c_plreg_total         = 0;
                           decimal c_plopt_total         = 0;
                           decimal c_rel_total           = 0;
                           decimal c_uoli_total          = 0;
                           decimal c_ceap_total          = 0;
                           decimal c_help_total          = 0;
                           decimal c_gfal_total          = 0;
                           decimal c_mpl_total           = 0;
                           decimal c_cpl_total           = 0;
                           var g = dt[x].OrderBy(a => a.last_name).ThenBy(a => a.first_name).ThenBy(a => a.middle_name).ThenBy(a => a.suffix_name).ToList();
                           var dm = g[0].due_month.Split(new char[] { '/' });
                           var monthName = dm[0] + "_" + dm[1];
                          
                               
                                //Create a copy of the last sheet
                                xlWorkSheet.Copy(Type.Missing, xlWorkBook.Sheets[xlWorkBook.Sheets.Count]);

                                if (x == (dt.Count - 1))
                                {
                                       // assign name to the new created sheet
                                    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName;
                                }
                                else
                                {
                                    // assign name to the new created sheet
                                    xlWorkBook.Sheets[xlWorkBook.Sheets.Count].Name = monthName;
                                }
                             

                               // create instance name of a new created sheet
                                Excel.Worksheet newWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                                 
                             

                               Excel.Range DueMonthVal2 = newWorkSheet.get_Range("B3");

                               Excel.Range office_code2 = newWorkSheet.get_Range("B2");
                             
                               //Excel.Range empl_type2 = newWorkSheet.get_Range("G1", "H1");
                               //empl_type2.Merge();
                        

                               Excel.Range org_name2 = newWorkSheet.get_Range("B1");
                               org_name2.Merge();

                               for (var i = 0; i < g.Count(); i++)
                               {

                                   if (c_start_row_i == start_row)
                                   {
                                       DueMonthVal2.Value2 = g[i].due_month.Trim();
                                       office_code2.Value2 = employerId(g[i]);
                                       //empl_type2.Value2 = EMPLTYPE(g[i].employment_type);
                                       org_name2.Value2 = g[i].organization_name.ToUpper() + " - " + EMPLTYPE(g[i].employment_type);
                                   }

                                   newWorkSheet.Cells[c_start_row_i, 1] = g[i].gsis_bpno.Trim();
                                   newWorkSheet.Cells[c_start_row_i, 2] = g[i].last_name.Trim();
                                   newWorkSheet.Cells[c_start_row_i, 3] = g[i].first_name.Trim();
                                   newWorkSheet.Cells[c_start_row_i, 4] = firstLetter(g[i].middle_name.Trim()).ToUpper();
                                   newWorkSheet.Cells[c_start_row_i, 5] = Missing.Value;
                                   newWorkSheet.Cells[c_start_row_i, 6] = g[i].suffix_name.Trim();
                                   newWorkSheet.Cells[c_start_row_i, 7] = Missing.Value;
                                   newWorkSheet.Cells[c_start_row_i, 8] =  g[i].gsis_crn.Trim();
                                   newWorkSheet.Cells[c_start_row_i, 9] =  g[i].basic_monthly_salary;
                                   newWorkSheet.Cells[c_start_row_i, 10] = g[i].effective_date;
                                   newWorkSheet.Cells[c_start_row_i, 11] = g[i].p_gsis_ps;
                                   newWorkSheet.Cells[c_start_row_i, 12] = g[i].p_gsis_gs;
                                   newWorkSheet.Cells[c_start_row_i, 13] = g[i].p_sif_gs;
                                   newWorkSheet.Cells[c_start_row_i, 14] = g[i].p_gsis_conso_ln;
                                   newWorkSheet.Cells[c_start_row_i, 15] = g[i].p_gsis_ecard_ln;
                                   newWorkSheet.Cells[c_start_row_i, 16] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 17] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 18] = g[i].p_gsis_emergency_ln;
                                   newWorkSheet.Cells[c_start_row_i, 19] = g[i].p_gsis_educ_asst_ln;
                                   newWorkSheet.Cells[c_start_row_i, 20] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 21] = g[i].p_gsis_sos_ln;
                                   newWorkSheet.Cells[c_start_row_i, 22] = g[i].p_gsis_policy_reg_ln;
                                   newWorkSheet.Cells[c_start_row_i, 23] = g[i].p_gsis_policy_opt_ln;
                                   newWorkSheet.Cells[c_start_row_i, 24] = g[i].p_gsis_real_state_ln;
                                   newWorkSheet.Cells[c_start_row_i, 25] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 26] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 27] = g[i].p_gsis_uoli;
                                   newWorkSheet.Cells[c_start_row_i, 28] = g[i].p_gsis_ceap;
                                   newWorkSheet.Cells[c_start_row_i, 29] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 30] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 31] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 32] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 33] = zero;
                                   newWorkSheet.Cells[c_start_row_i, 34] = g[i].p_gsis_help;
                                   newWorkSheet.Cells[c_start_row_i, 35] = g[i].p_other_loan2; //GFAL
                                   newWorkSheet.Cells[c_start_row_i, 36] = g[i].p_other_loan1; //MPL
                                   newWorkSheet.Cells[c_start_row_i, 37] = g[i].p_other_loan3; //CPL            //CPL
                                   newWorkSheet.Cells[c_start_row_i, 38] = g[i].empl_id;
                                   newWorkSheet.Cells[c_start_row_i, 39] = g[i].voucher_nbr; ;

                                   c_ps_total           += Convert.ToDecimal(g[i].p_gsis_ps);
                                   c_gs_total           += Convert.ToDecimal(g[i].p_gsis_gs);
                                   c_sif_total          += Convert.ToDecimal(g[i].p_sif_gs);
                                   c_consol_total       += Convert.ToDecimal(g[i].p_gsis_conso_ln);
                                   c_ecard_total        += Convert.ToDecimal(g[i].p_gsis_ecard_ln);
                                   c_emerg_total        += Convert.ToDecimal(g[i].p_gsis_emergency_ln);
                                   c_educ_asst_total    += Convert.ToDecimal(g[i].p_gsis_educ_asst_ln);
                                   c_sos_total          += Convert.ToDecimal(g[i].p_gsis_sos_ln);
                                   c_plreg_total        += Convert.ToDecimal(g[i].p_gsis_policy_reg_ln);
                                   c_plopt_total        += Convert.ToDecimal(g[i].p_gsis_policy_opt_ln);
                                   c_rel_total          += Convert.ToDecimal(g[i].p_gsis_real_state_ln);
                                   c_uoli_total         += Convert.ToDecimal(g[i].p_gsis_uoli);
                                   c_ceap_total         += Convert.ToDecimal(g[i].p_gsis_ceap);
                                   c_help_total         += Convert.ToDecimal(g[i].p_gsis_help);
                                   c_gfal_total         += Convert.ToDecimal(g[i].p_other_loan2); //GFAL
                                   c_mpl_total          += Convert.ToDecimal(g[i].p_other_loan1); //MPL
                                   c_cpl_total          += Convert.ToDecimal(g[i].p_other_loan3); //CPL
                                   ++c_start_row_i;
                               }
                                   ++c_start_row_i;

                                   newWorkSheet.Cells[c_start_row_i, 10] = "TOTAL";
                                   newWorkSheet.Cells[c_start_row_i, 11] = c_ps_total;
                                   newWorkSheet.Cells[c_start_row_i, 12] = c_gs_total;
                                   newWorkSheet.Cells[c_start_row_i, 13] = c_sif_total;
                                   newWorkSheet.Cells[c_start_row_i, 14] = c_consol_total;
                                   newWorkSheet.Cells[c_start_row_i, 15] = c_ecard_total;
                                   newWorkSheet.Cells[c_start_row_i, 18] = c_emerg_total;
                                   newWorkSheet.Cells[c_start_row_i, 19] = c_educ_asst_total;
                                   newWorkSheet.Cells[c_start_row_i, 21] = c_sos_total;
                                   newWorkSheet.Cells[c_start_row_i, 22] = c_plreg_total;
                                   newWorkSheet.Cells[c_start_row_i, 23] = c_plopt_total;
                                   newWorkSheet.Cells[c_start_row_i, 24] = c_rel_total;
                                   newWorkSheet.Cells[c_start_row_i, 27] = c_uoli_total;
                                   newWorkSheet.Cells[c_start_row_i, 28] = c_ceap_total;
                                   newWorkSheet.Cells[c_start_row_i, 34] = c_help_total;
                                   newWorkSheet.Cells[c_start_row_i, 35] = c_gfal_total;
                                   newWorkSheet.Cells[c_start_row_i, 36] = c_mpl_total;
                                   newWorkSheet.Cells[c_start_row_i, 37] = c_cpl_total;
                                   newWorkSheet.get_Range("J" + c_start_row_i, "AK" + c_start_row_i).Font.Bold = true;
                                   Marshal.ReleaseComObject(newWorkSheet);

                                   //FONT STYLE
                                   Excel.Range rowRange = newWorkSheet.get_Range("A1", "AI" + c_start_row_i);
                                   rowRange.Font.Name = "Arial";
                                   rowRange.Font.Size = 10;

                                   //NUMBER FORMAT
                                   Excel.Range rowRangeNumber = newWorkSheet.get_Range("K1", "AI" + c_start_row_i);
                                   rowRangeNumber.NumberFormat = "General";

                                   //NUMBER FORMAT MONTHLY SALARY
                                   Excel.Range rowRangeSalary = newWorkSheet.get_Range("I" + start_row, "I" + c_start_row_i);
                                   rowRangeSalary.NumberFormat = "General";

                    }

                     
                       Marshal.ReleaseComObject(xlWorkSheet);
                       string filename = "";
                       filename = um.remittance_year.Trim() + "-" + um.remittancetype_descr.Trim() + "-" + um.remittance_year.Trim() + "-" + um.remittance_month.Trim() + ".xlsx";
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
                    message = "No Data Found!";
                }

                return JSON(new { message = message, filePath }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                 message = DbEntityValidationExceptionError(e);

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
       
       
        public Decimal computeDifference(decimal val1, decimal val2)
        {
            decimal result = 0;
            
                result = val1 - val2;
            

            return result;
        }
        public ActionResult checkToFloat(List<remittance_dtl_gsis_flt_tbl> data)
        {
            string message = "";
            try {
               
                for (var i = 0; i < data.Count; i++)
                {
                    var d = data[i];
                    var r = db_pacco.remittance_dtl_gsis_flt_tbl.Where(a => a.remittance_ctrl_nbr == d.remittance_ctrl_nbr
                        && a.empl_id == d.empl_id && a.voucher_nbr == d.voucher_nbr).FirstOrDefault();
                    if (r != null)
                    {
                        data.RemoveAt(i);
                    }
                }
                return JSON(new { message = "success",data }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
            
        }
        public ActionResult Save_Reject(remittance_dtl_gsis_flt_tbl dt)
        {
            var message = "";
            try
            {
                dt.float_status = "N";
                db_pacco.remittance_dtl_gsis_flt_tbl.Add(dt);
                db_pacco.SaveChanges();
                return JSON(new { message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Save_Edit_Reject(remittance_dtl_gsis_flt_tbl dt)
        {
            var message = "";
            try
            {
                var fl = db_pacco.remittance_dtl_gsis_flt_tbl.Where(a => a.remittance_ctrl_nbr == dt.remittance_ctrl_nbr
                    && a.voucher_nbr == dt.voucher_nbr && a.empl_id == dt.empl_id).FirstOrDefault();
                    fl.float_amount_ps            = dt.float_amount_ps          ;
                    fl.float_amount_gs            = dt.float_amount_gs          ;
                    fl.float_sif_gs               = dt.float_sif_gs             ;
                    fl.float_gsis_uoli            = dt.float_gsis_uoli          ;
                    fl.float_gsis_ehp             = dt.float_gsis_ehp           ;
                    fl.float_gsis_hip             = dt.float_gsis_hip           ;
                    fl.float_gsis_ceap            = dt.float_gsis_ceap          ;
                    fl.float_gsis_addl_ins        = dt.float_gsis_addl_ins      ;
                    fl.float_gsis_conso_ln        = dt.float_gsis_conso_ln      ;
                    fl.float_gsis_policy_reg_ln   = dt.float_gsis_policy_reg_ln ;
                    fl.float_gsis_policy_opt_ln   = dt.float_gsis_policy_opt_ln ;
                    fl.float_gsis_emergency_ln    = dt.float_gsis_emergency_ln  ;
                    fl.float_gsis_ecard_ln        = dt.float_gsis_ecard_ln      ;
                    fl.float_gsis_educ_asst_ln    = dt.float_gsis_educ_asst_ln  ;
                    fl.float_gsis_real_state_ln   = dt.float_gsis_real_state_ln ;
                    fl.float_gsis_sos_ln          = dt.float_gsis_sos_ln        ;
                    fl.float_gsis_help            = dt.float_gsis_help          ;
                   
                    db_pacco.SaveChanges();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult RejectedSave(List<remittance_dtl_gsis_flt_tbl> data)
        {
            string message = "";
            try
                {

                     foreach(var i in data)
                     {
                         var r = db_pacco.remittance_dtl_gsis_flt_tbl.Where(a => a.remittance_ctrl_nbr == i.remittance_ctrl_nbr
                        && a.empl_id == i.empl_id && a.voucher_nbr == i.voucher_nbr).FirstOrDefault();


                        var ds = db_pacco.remittance_dtl_gsis_tbl.Where(a => a.remittance_ctrl_nbr == i.remittance_ctrl_nbr
                        && a.empl_id == i.empl_id && a.voucher_nbr == i.voucher_nbr).FirstOrDefault();
                         if(r == null)
                         {
                             db_pacco.remittance_dtl_gsis_flt_tbl.Add(i);
                             
                         }
                         if (ds != null)
                         {
                             ds.remittance_status = "J";
                         }
                         
                     }
                     db_pacco.SaveChanges();
                      
                      
                    return JSON(new{message = "success"}, JsonRequestBehavior.AllowGet);
                }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
           
        }
        public ActionResult UnRejectedSave(List<remittance_dtl_gsis_flt_tbl> data)
        {
            string message = "";
            try
            {

                foreach (var i in data)
                {
                    var r = db_pacco.remittance_dtl_gsis_flt_tbl.Where(a => a.remittance_ctrl_nbr == i.remittance_ctrl_nbr
                    && a.empl_id == i.empl_id && a.voucher_nbr == i.voucher_nbr).FirstOrDefault();


                    var ds = db_pacco.remittance_dtl_gsis_tbl.Where(a => a.remittance_ctrl_nbr == i.remittance_ctrl_nbr
                    && a.empl_id == i.empl_id && a.voucher_nbr == i.voucher_nbr).FirstOrDefault();
                    if (r != null)
                    {
                        
                        db_pacco.remittance_dtl_gsis_flt_tbl.Remove(r);
                    }
                    if (ds != null)
                    {
                        
                        ds.remittance_status = "N";
                    }

                }
                db_pacco.SaveChanges();


                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }
        public ActionResult BackPage(string par_r_year, string par_r_month, string par_r_type)
        {
           Session["history_page"] = Request.UrlReferrer.ToString();
            var sp_uploaded_data_rep_GSIS = db_pacco.sp_uploaded_data_rep_GSIS(par_r_year, par_r_month, par_r_type).ToList();
           return JSON(new { message = "success", sp_uploaded_data_rep_GSIS }, JsonRequestBehavior.AllowGet);
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

