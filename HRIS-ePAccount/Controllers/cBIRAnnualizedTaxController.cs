
//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Annual Tax Header
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************


using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;

using System.Runtime.InteropServices;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Globalization;
using Excel = Microsoft.Office.Interop.Excel;
using System.Drawing;
using System.Reflection;
using HRIS_ePAccount.Filter;
using System.Data.SqlClient;

namespace HRIS_ePAccount.Controllers
{
    [SessionExpire]
    public class cBIRAnnualizedTaxController : Controller
    {
      
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        string constring = System.Configuration.ConfigurationManager.AppSettings["connetionString_act"];
        User_Menu um = new User_Menu();
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//

        public void GetAllowAccess()
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
        public ActionResult Index()
        {

            if (um != null || um.ToString() != "")
            {
                try
                {
                    GetAllowAccess();
                }

                catch (Exception e)
                {
                    string msg = e.Message;
                    return RedirectToAction("Index", "Login");
                }

            }
            return View(um);
        }


        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return JSON("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//

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
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_empType)
        {
            object payroll_template = new object();
            List<vw_employmenttypes_tbl_list> empType = new List<vw_employmenttypes_tbl_list>();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            GetAllowAccess();

            string excelExportServer = System.Configuration.ConfigurationManager.AppSettings["ExcelExportServerIP"];

            if (Session["empType"] == null)
            {
                empType = db_pacco.vw_employmenttypes_tbl_list.Where(a => !a.employment_type.Contains("JO")).ToList();
                HttpContext.Session["empType"] = empType;
            }
            else
            {
                empType = (List<vw_employmenttypes_tbl_list>)HttpContext.Session["empType"];
            }

            //HttpContext.Session["sp_annualtax_hdr_tbl_list"] = sp_annualtax_hdr_tbl_list;
           
            List<sp_annualtax_hdr_tbl_list_wtaxpmos_Result> sp_annualtax_hdr_tbl_list = new List<sp_annualtax_hdr_tbl_list_wtaxpmos_Result>();

           



            if (Session["PreviousValuesonPage_cBIRAnnualizedTax"] == null)
            {
                Session["PreviousValuesonPage_cBIRAnnualizedTax"] = null;
                int sort_value = 1;
                int page_value = 0;
                string sort_order = "asc";
                string show_entries = "5";
                string ddl_emp_type = "";
               
                string ddl_letter = "";

                string empl_id = "";

                return JSON(new { empType, ddl_letter, empl_id, ddl_emp_type, sp_annualtax_hdr_tbl_list, sort_value, page_value, sort_order, show_entries, um, excelExportServer}, JsonRequestBehavior.AllowGet);

            }

            else
            {
                string[] PreviousValuesonPage_cPayRegistry = Session["PreviousValuesonPage_cBIRAnnualizedTax"].ToString().Split(new char[] { ',' });

                string ddl_year     = PreviousValuesonPage_cPayRegistry[0].ToString().Trim();
                string empl_id      = PreviousValuesonPage_cPayRegistry[3].ToString().Trim();
                string ddl_emp_type = PreviousValuesonPage_cPayRegistry[4].ToString().Trim();
                string ddl_letter   = PreviousValuesonPage_cPayRegistry[6].ToString().Trim();
                string show_entries = PreviousValuesonPage_cPayRegistry[7].ToString().Trim();
                int page_value      = Convert.ToInt32(PreviousValuesonPage_cPayRegistry[8].ToString().Trim());
                string search_value = PreviousValuesonPage_cPayRegistry[9].ToString().Trim();
                int sort_value      = Convert.ToInt32(PreviousValuesonPage_cPayRegistry[10].ToString().Trim());
                string sort_order   = PreviousValuesonPage_cPayRegistry[11].ToString().Trim();


                using (SqlConnection connection = new SqlConnection(constring))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(@"
                        SET TEXTSIZE 2147483647;
                        SET LANGUAGE us_english;
                        SET DATEFORMAT mdy;
                        SET DATEFIRST 7;
                        SET LOCK_TIMEOUT -1;
                        SET QUOTED_IDENTIFIER ON;
                        SET ARITHABORT ON;
                        SET ANSI_NULL_DFLT_ON ON;
                        SET ANSI_WARNINGS ON;
                        SET ANSI_PADDING ON;
                        SET ANSI_NULLS ON;
                        SET CONCAT_NULL_YIELDS_NULL ON;
                        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;", connection))
                    {
                        command.ExecuteNonQuery();
                    }

                    using (var conn = new SqlConnection(constring))
                    using (var cmd = new SqlCommand("sp_annualtax_hdr_tbl_list_wtaxpmos", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@p_payroll_year", SqlDbType.VarChar, 4) { Value = ddl_year });
                        cmd.Parameters.Add(new SqlParameter("@p_employment_type", SqlDbType.VarChar, 2) { Value = ddl_emp_type });
                        cmd.Parameters.Add(new SqlParameter("@p_letter", SqlDbType.VarChar, 1) { Value = "" });

                        conn.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var r = new sp_annualtax_hdr_tbl_list_wtaxpmos_Result
                                {
                                    payroll_year = reader["payroll_year"] as string,
                                    empl_id = reader["empl_id"] as string,
                                    employee_name = reader["employee_name"] as string,
                                    employment_type = reader["employment_type"] as string,
                                    account_id_nbr_ref = reader["account_id_nbr_ref"] as string,
                                    employmenttype_description = reader["employmenttype_description"] as string,
                                    position_title1 = reader["position_title1"] as string,
                                    addl_txbl_comp_prsnt = reader["addl_txbl_comp_prsnt"] as decimal?,
                                    annual_tax_due = reader["annual_tax_due"] as decimal?,
                                    wtax_prsnt_emplyr = reader["wtax_prsnt_emplyr"] as decimal?,
                                    wtax_prev_emplyr = reader["wtax_prev_emplyr"] as decimal?,
                                    ntx_basic_salary = reader["ntx_basic_salary"] as decimal?,
                                    ntx_hol_pay_mwe = reader["ntx_hol_pay_mwe"] as decimal?,
                                    ntx_ot_pay_mwe = reader["ntx_ot_pay_mwe"] as decimal?,
                                    ntx_night_diff_mwe = reader["ntx_night_diff_mwe"] as decimal?,
                                    ntx_hzrd_pay_mwe = reader["ntx_hzrd_pay_mwe"] as decimal?,
                                    ntx_13th_14th = reader["ntx_13th_14th"] as decimal?,
                                    ntx_de_minimis = reader["ntx_de_minimis"] as decimal?,
                                    ntx_gsis_phic_hdmf = reader["ntx_gsis_phic_hdmf"] as decimal?,
                                    ntx_salaries_oth = reader["ntx_salaries_oth"] as decimal?,
                                    txbl_basic_salary = reader["txbl_basic_salary"] as decimal?,
                                    txbl_representation = reader["txbl_representation"] as decimal?,
                                    txbl_transportation = reader["txbl_transportation"] as decimal?,
                                    txbl_cola = reader["txbl_cola"] as decimal?,
                                    txbl_fh_allowance = reader["txbl_fh_allowance"] as decimal?,
                                    txbl_otherA = reader["txbl_otherA"] as decimal?,
                                    txbl_otherB = reader["txbl_otherB"] as decimal?,
                                    sup_commission = reader["sup_commission"] as decimal?,
                                    sup_prof_sharing = reader["sup_prof_sharing"] as decimal?,
                                    sup_fi_drctr_fees = reader["sup_fi_drctr_fees"] as decimal?,
                                    sup_13th_14th = reader["sup_13th_14th"] as decimal?,
                                    sup_hzrd_pay = reader["sup_hzrd_pay"] as decimal?,
                                    sup_ot_pay = reader["sup_ot_pay"] as decimal?,
                                    sup_otherA = reader["sup_otherA"] as decimal?,
                                    sup_otherB = reader["sup_otherB"] as decimal?,
                                    annual_txbl_income = reader["annual_txbl_income"] as decimal?,
                                    annual_tax_wheld = reader["annual_tax_wheld"] as decimal?,
                                    monthly_tax_due = reader["monthly_tax_due"] as decimal?,
                                    tax_rate = reader["tax_rate"] as decimal?,
                                    employer_type = reader["employer_type"] as string,
                                    foreign_address = reader["foreign_address"] as string,
                                    stat_daily_rate = reader["stat_daily_rate"] as decimal?,
                                    stat_monthly_rate = reader["stat_monthly_rate"] as decimal?,
                                    min_wage_earner = reader["min_wage_earner"] as bool?,
                                    tin_employer_prev = reader["tin_employer_prev"] as string,
                                    employer_name_prev = reader["employer_name_prev"] as string,
                                    employer_add_prev = reader["employer_add_prev"] as string,
                                    employer_zip_prev = reader["employer_zip_prev"] as string,
                                    remarks = reader["remarks"] as string,
                                    substituted = reader["substituted"] as string,
                                    jan = reader["jan"] as decimal?,
                                    feb = reader["feb"] as decimal?,
                                    mar = reader["mar"] as decimal?,
                                    apr = reader["apr"] as decimal?,
                                    may = reader["may"] as decimal?,
                                    jun = reader["jun"] as decimal?,
                                    july = reader["july"] as decimal?,
                                    aug = reader["aug"] as decimal?,
                                    sep = reader["sep"] as decimal?,
                                    oct = reader["oct"] as decimal?,
                                    nov = reader["nov"] as decimal?,
                                    dec = reader["dec"] as decimal?,
                                    check_for_descrepancy = reader["check_for_descrepancy"] as bool?,
                                    cur_mo = reader["cur_mo"] as int?,
                                    prev_mo = reader["prev_mo"] as int?,
                                    taxable = reader["taxable"] as bool?
                                };

                                sp_annualtax_hdr_tbl_list.Add(r);

                            }
                        }
                    }

                    connection.Close();
                }

                return JSON(new { empType, ddl_year, empl_id, ddl_emp_type, ddl_letter, show_entries, page_value, search_value, sort_value, sort_order, um, excelExportServer, sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);

            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmployeeName(string par_payroll_year, string par_empType, string par_empl_id)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var sp_generate_annualized_tax = db_pacco.sp_generate_annualized_tax(par_payroll_year, par_empl_id).ToList();
                db_pacco.SaveChanges();

                var sp_tax_prjtd_per_empl_id = db_pacco.sp_annualtax_hdr_tbl_list(par_payroll_year, par_empType,"").ToList().Where(a => a.empl_id == par_empl_id);

                return JSON(new { message = "success", sp_tax_prjtd_per_empl_id }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveEmployeeList(string par_empType, string par_payroll_year) //--COMMENT BY MARVIN 2024-08-22
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var sp_personnelnames_annualtax_hdr_combolist = db_pacco.sp_personnelnames_combolist_tax_rc(par_payroll_year, par_empType).ToList();

                return JSON(new { message = "success", sp_personnelnames_annualtax_hdr_combolist}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult CheckData(string par_payroll_year, string par_empType, string par_letter, string par_empl_id, string par_action)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var sp_get_actual_tax_counter = db_pacco.sp_get_actual_tax_counter(par_payroll_year, par_empl_id).ToList();

                if (sp_get_actual_tax_counter.Count() > 0) {
                    message = "success";
                }
                else {
                    message = "fail";
                }
                
                //if (sp_annualtax_hdr_tbl_list != null && par_action == "ADD")
                //{
                //    message = "fail";
                //}

                //else if (sp_annualtax_hdr_tbl_list == null && par_action == "EDIT")
                //{
                //    message = "fail";
                //}

                //else if (sp_annualtax_hdr_tbl_list == null && par_action == "DELETE")
                //{
                //    message = "fail";
                //}

                //else
                //{
                //    message = "success";
                //}
                return JSON(new { message, sp_get_actual_tax_counter }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: Select EmployeeName
        //////*********************************************************************//
        public ActionResult SaveEDITInDatabase(annualtax_hdr_tbl data, string par_payroll_year, string par_empl_id)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var annualtax_hdr_tbl = db_pacco.annualtax_hdr_tbl.Where(a => a.payroll_year == par_payroll_year && a.empl_id == par_empl_id).FirstOrDefault();

                if (annualtax_hdr_tbl == null)
                {
                    message = "not_found";
                }

                else
                {
                    annualtax_hdr_tbl.addl_txbl_comp_prsnt  = data.addl_txbl_comp_prsnt;
                    annualtax_hdr_tbl.wtax_prev_emplyr      = data.wtax_prev_emplyr;
                    annualtax_hdr_tbl.ntx_basic_salary      = data.ntx_basic_salary;
                    annualtax_hdr_tbl.ntx_hol_pay_mwe       = data.ntx_hol_pay_mwe;
                    annualtax_hdr_tbl.ntx_ot_pay_mwe        = data.ntx_ot_pay_mwe;
                    annualtax_hdr_tbl.ntx_night_diff_mwe    = data.ntx_night_diff_mwe;
                    annualtax_hdr_tbl.ntx_hzrd_pay_mwe      = data.ntx_hzrd_pay_mwe;
                    annualtax_hdr_tbl.txbl_representation   = data.txbl_representation;
                    annualtax_hdr_tbl.txbl_transportation   = data.txbl_transportation;
                    annualtax_hdr_tbl.txbl_cola             = data.txbl_cola;
                    annualtax_hdr_tbl.txbl_fh_allowance     = data.txbl_fh_allowance;
                    annualtax_hdr_tbl.sup_commission        = data.sup_commission;
                    annualtax_hdr_tbl.sup_prof_sharing      = data.sup_prof_sharing;
                    annualtax_hdr_tbl.sup_fi_drctr_fees     = data.sup_fi_drctr_fees;
                    annualtax_hdr_tbl.employer_type         = data.employer_type;
                    annualtax_hdr_tbl.foreign_address       = data.foreign_address;
                    annualtax_hdr_tbl.stat_daily_rate       = data.stat_daily_rate;
                    annualtax_hdr_tbl.stat_monthly_rate     = data.stat_monthly_rate;
                    annualtax_hdr_tbl.min_wage_earner       = data.min_wage_earner;
                    annualtax_hdr_tbl.tin_employer_prev     = data.tin_employer_prev;
                    annualtax_hdr_tbl.employer_name_prev    = data.employer_name_prev;
                    annualtax_hdr_tbl.employer_add_prev     = data.employer_add_prev;
                    annualtax_hdr_tbl.employer_zip_prev     = data.employer_zip_prev;
                    annualtax_hdr_tbl.substituted           = data.substituted;
                    db_pacco.SaveChanges();
                    message = "success";
                }
                
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: to Generate per Employee
        //*********************************************************************//

        public ActionResult GenerateByEmployee(string par_payroll_year, string par_empl_id, string par_letter, string par_employment) {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
               //var sp_generate_annualized_tax = db_pacco.sp_generate_annualized_tax(par_payroll_year, par_empl_id).ToList();

                List<sp_generate_annualized_tax_Result> sp_generate_annualized_tax = new List<sp_generate_annualized_tax_Result>();

                using (SqlConnection connection = new SqlConnection(constring))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(@"
                        SET TEXTSIZE 2147483647;
                        SET LANGUAGE us_english;
                        SET DATEFORMAT mdy;
                        SET DATEFIRST 7;
                        SET LOCK_TIMEOUT -1;
                        SET QUOTED_IDENTIFIER ON;
                        SET ARITHABORT ON;
                        SET ANSI_NULL_DFLT_ON ON;
                        SET ANSI_WARNINGS ON;
                        SET ANSI_PADDING ON;
                        SET ANSI_NULLS ON;
                        SET CONCAT_NULL_YIELDS_NULL ON;
                        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;", connection))
                    {
                        command.ExecuteNonQuery();
                    }

                    using (SqlCommand command = new SqlCommand("sp_generate_annualized_tax", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@p_payroll_year", par_payroll_year);
                        command.Parameters.AddWithValue("@p_empl_id", par_empl_id);
                        command.CommandTimeout = int.MaxValue;

                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                // Map each record to your model
                                var item = new sp_generate_annualized_tax_Result
                                {
                                    result_value = reader.GetString(0),
                                    result_msg   = reader.GetString(1),
                                };
                                sp_generate_annualized_tax.Add(item);
                            }
                        }
                    }

                    connection.Close();
                }

                List<sp_annualtax_hdr_tbl_list_wtaxpmos_Result> sp_annualtax_hdr_tbl_list = new List<sp_annualtax_hdr_tbl_list_wtaxpmos_Result>();
                using (SqlConnection connection = new SqlConnection(constring))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(@"
                        SET TEXTSIZE 2147483647;
                        SET LANGUAGE us_english;
                        SET DATEFORMAT mdy;
                        SET DATEFIRST 7;
                        SET LOCK_TIMEOUT -1;
                        SET QUOTED_IDENTIFIER ON;
                        SET ARITHABORT ON;
                        SET ANSI_NULL_DFLT_ON ON;
                        SET ANSI_WARNINGS ON;
                        SET ANSI_PADDING ON;
                        SET ANSI_NULLS ON;
                        SET CONCAT_NULL_YIELDS_NULL ON;
                        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;", connection))
                    {
                        command.ExecuteNonQuery();
                    }

                    using (var conn = new SqlConnection(constring))
                    using (var cmd = new SqlCommand("sp_annualtax_hdr_tbl_list_wtaxpmos", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@p_payroll_year", SqlDbType.VarChar, 4) { Value = par_payroll_year });
                        cmd.Parameters.Add(new SqlParameter("@p_employment_type", SqlDbType.VarChar, 2) { Value = par_employment});
                        cmd.Parameters.Add(new SqlParameter("@p_letter", SqlDbType.VarChar, 1) { Value = "" });

                        conn.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var r = new sp_annualtax_hdr_tbl_list_wtaxpmos_Result
                                {
                                    payroll_year = reader["payroll_year"] as string,
                                    empl_id = reader["empl_id"] as string,
                                    employee_name = reader["employee_name"] as string,
                                    employment_type = reader["employment_type"] as string,
                                    account_id_nbr_ref = reader["account_id_nbr_ref"] as string,
                                    employmenttype_description = reader["employmenttype_description"] as string,
                                    position_title1 = reader["position_title1"] as string,
                                    addl_txbl_comp_prsnt = reader["addl_txbl_comp_prsnt"] as decimal?,
                                    annual_tax_due = reader["annual_tax_due"] as decimal?,
                                    wtax_prsnt_emplyr = reader["wtax_prsnt_emplyr"] as decimal?,
                                    wtax_prev_emplyr = reader["wtax_prev_emplyr"] as decimal?,
                                    ntx_basic_salary = reader["ntx_basic_salary"] as decimal?,
                                    ntx_hol_pay_mwe = reader["ntx_hol_pay_mwe"] as decimal?,
                                    ntx_ot_pay_mwe = reader["ntx_ot_pay_mwe"] as decimal?,
                                    ntx_night_diff_mwe = reader["ntx_night_diff_mwe"] as decimal?,
                                    ntx_hzrd_pay_mwe = reader["ntx_hzrd_pay_mwe"] as decimal?,
                                    ntx_13th_14th = reader["ntx_13th_14th"] as decimal?,
                                    ntx_de_minimis = reader["ntx_de_minimis"] as decimal?,
                                    ntx_gsis_phic_hdmf = reader["ntx_gsis_phic_hdmf"] as decimal?,
                                    ntx_salaries_oth = reader["ntx_salaries_oth"] as decimal?,
                                    txbl_basic_salary = reader["txbl_basic_salary"] as decimal?,
                                    txbl_representation = reader["txbl_representation"] as decimal?,
                                    txbl_transportation = reader["txbl_transportation"] as decimal?,
                                    txbl_cola = reader["txbl_cola"] as decimal?,
                                    txbl_fh_allowance = reader["txbl_fh_allowance"] as decimal?,
                                    txbl_otherA = reader["txbl_otherA"] as decimal?,
                                    txbl_otherB = reader["txbl_otherB"] as decimal?,
                                    sup_commission = reader["sup_commission"] as decimal?,
                                    sup_prof_sharing = reader["sup_prof_sharing"] as decimal?,
                                    sup_fi_drctr_fees = reader["sup_fi_drctr_fees"] as decimal?,
                                    sup_13th_14th = reader["sup_13th_14th"] as decimal?,
                                    sup_hzrd_pay = reader["sup_hzrd_pay"] as decimal?,
                                    sup_ot_pay = reader["sup_ot_pay"] as decimal?,
                                    sup_otherA = reader["sup_otherA"] as decimal?,
                                    sup_otherB = reader["sup_otherB"] as decimal?,
                                    annual_txbl_income = reader["annual_txbl_income"] as decimal?,
                                    annual_tax_wheld = reader["annual_tax_wheld"] as decimal?,
                                    monthly_tax_due = reader["monthly_tax_due"] as decimal?,
                                    tax_rate = reader["tax_rate"] as decimal?,
                                    employer_type = reader["employer_type"] as string,
                                    foreign_address = reader["foreign_address"] as string,
                                    stat_daily_rate = reader["stat_daily_rate"] as decimal?,
                                    stat_monthly_rate = reader["stat_monthly_rate"] as decimal?,
                                    min_wage_earner = reader["min_wage_earner"] as bool?,
                                    tin_employer_prev = reader["tin_employer_prev"] as string,
                                    employer_name_prev = reader["employer_name_prev"] as string,
                                    employer_add_prev = reader["employer_add_prev"] as string,
                                    employer_zip_prev = reader["employer_zip_prev"] as string,
                                    remarks = reader["remarks"] as string,
                                    substituted = reader["substituted"] as string,
                                    jan = reader["jan"] as decimal?,
                                    feb = reader["feb"] as decimal?,
                                    mar = reader["mar"] as decimal?,
                                    apr = reader["apr"] as decimal?,
                                    may = reader["may"] as decimal?,
                                    jun = reader["jun"] as decimal?,
                                    july = reader["july"] as decimal?,
                                    aug = reader["aug"] as decimal?,
                                    sep = reader["sep"] as decimal?,
                                    oct = reader["oct"] as decimal?,
                                    nov = reader["nov"] as decimal?,
                                    dec = reader["dec"] as decimal?,
                                    check_for_descrepancy = reader["check_for_descrepancy"] as bool?,
                                    cur_mo = reader["cur_mo"] as int?,
                                    prev_mo = reader["prev_mo"] as int?,
                                    taxable = reader["taxable"] as bool?
                                };

                                sp_annualtax_hdr_tbl_list.Add(r);
                            }
                        }
                    }

                    connection.Close();
                }
               
                var sp_annualtax_hdr_tbl_list2 = sp_annualtax_hdr_tbl_list.Where(a => a.empl_id == par_empl_id).FirstOrDefault();
                message = "success";
                return JSON(new { message, sp_annualtax_hdr_tbl_list, sp_annualtax_hdr_tbl_list2  }, JsonRequestBehavior.AllowGet);
            }

            catch(Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Delete Action from Database
        ////*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_empl_id, string par_payroll_year)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var dt = db_pacco.annualtax_hdr_tbl.Where(a =>
                               a.payroll_year == par_payroll_year &&
                               a.empl_id == par_empl_id).FirstOrDefault();

                db_pacco.annualtax_hdr_tbl.Remove(dt);

                if (dt == null)
                {
                    message = "fail";
                }

                else
                {
                    message = "success";
                }
                db_pacco.SaveChanges();
                return JSON( message, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }
        

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cBIRAnnualizedTax
            (string  par_year          
             ,string par_tax_due       
             ,string par_tax_rate      
             ,string par_empl_id        
             ,string par_emp_type      
             ,string par_emp_type_descr
             ,string par_letter        
             ,string par_show_entries  
             ,string par_page_nbr      
             ,string par_search        
             ,string par_sort_value
             ,string par_sort_order
             ,string par_position
            )   
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cBIRAnnualizedTax"] = par_year
                                                          + "," + par_tax_due
                                                          + "," + par_tax_rate
                                                          + "," + par_empl_id
                                                          + "," + par_emp_type
                                                          + "," + par_emp_type_descr
                                                          + "," + par_letter
                                                          + "," + par_show_entries
                                                          + "," + par_page_nbr
                                                          + "," + par_search
                                                          + "," + par_sort_value
                                                          + "," + par_sort_order
                                                          + "," + par_position;

            return JSON("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType, string par_year, string par_letter)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                if (par_letter == null)
                { par_letter = ""; }
                //var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_year, par_empType, par_letter).ToList();
                //List<sp_annualtax_hdr_tbl_list_Result> sp_annualtax_hdr_tbl_list = new List<sp_annualtax_hdr_tbl_list_Result>();
                List<sp_annualtax_hdr_tbl_list_wtaxpmos_Result> sp_annualtax_hdr_tbl_list_wtaxpmos = new List<sp_annualtax_hdr_tbl_list_wtaxpmos_Result>();
                using (SqlConnection connection = new SqlConnection(constring))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(@"
                        SET TEXTSIZE 2147483647;
                        SET LANGUAGE us_english;
                        SET DATEFORMAT mdy;
                        SET DATEFIRST 7;
                        SET LOCK_TIMEOUT -1;
                        SET QUOTED_IDENTIFIER ON;
                        SET ARITHABORT ON;
                        SET ANSI_NULL_DFLT_ON ON;
                        SET ANSI_WARNINGS ON;
                        SET ANSI_PADDING ON;
                        SET ANSI_NULLS ON;
                        SET CONCAT_NULL_YIELDS_NULL ON;
                        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;", connection))
                        {
                            command.ExecuteNonQuery();
                        }

                    using (var conn = new SqlConnection(constring))
                    using (var cmd = new SqlCommand("sp_annualtax_hdr_tbl_list_wtaxpmos", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@p_payroll_year", SqlDbType.VarChar, 4) { Value = par_year });
                        cmd.Parameters.Add(new SqlParameter("@p_employment_type", SqlDbType.VarChar, 2) { Value = par_empType });
                        cmd.Parameters.Add(new SqlParameter("@p_letter", SqlDbType.VarChar, 1) { Value = "" });

                        conn.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var r = new sp_annualtax_hdr_tbl_list_wtaxpmos_Result
                                {
                                    payroll_year = reader["payroll_year"] as string,
                                    empl_id = reader["empl_id"] as string,
                                    employee_name = reader["employee_name"] as string,
                                    employment_type = reader["employment_type"] as string,
                                    account_id_nbr_ref = reader["account_id_nbr_ref"] as string,
                                    employmenttype_description = reader["employmenttype_description"] as string,
                                    position_title1 = reader["position_title1"] as string,
                                    addl_txbl_comp_prsnt = reader["addl_txbl_comp_prsnt"] as decimal?,
                                    annual_tax_due = reader["annual_tax_due"] as decimal?,
                                    wtax_prsnt_emplyr = reader["wtax_prsnt_emplyr"] as decimal?,
                                    wtax_prev_emplyr = reader["wtax_prev_emplyr"] as decimal?,
                                    ntx_basic_salary = reader["ntx_basic_salary"] as decimal?,
                                    ntx_hol_pay_mwe = reader["ntx_hol_pay_mwe"] as decimal?,
                                    ntx_ot_pay_mwe = reader["ntx_ot_pay_mwe"] as decimal?,
                                    ntx_night_diff_mwe = reader["ntx_night_diff_mwe"] as decimal?,
                                    ntx_hzrd_pay_mwe = reader["ntx_hzrd_pay_mwe"] as decimal?,
                                    ntx_13th_14th = reader["ntx_13th_14th"] as decimal?,
                                    ntx_de_minimis = reader["ntx_de_minimis"] as decimal?,
                                    ntx_gsis_phic_hdmf = reader["ntx_gsis_phic_hdmf"] as decimal?,
                                    ntx_salaries_oth = reader["ntx_salaries_oth"] as decimal?,
                                    txbl_basic_salary = reader["txbl_basic_salary"] as decimal?,
                                    txbl_representation = reader["txbl_representation"] as decimal?,
                                    txbl_transportation = reader["txbl_transportation"] as decimal?,
                                    txbl_cola = reader["txbl_cola"] as decimal?,
                                    txbl_fh_allowance = reader["txbl_fh_allowance"] as decimal?,
                                    txbl_otherA = reader["txbl_otherA"] as decimal?,
                                    txbl_otherB = reader["txbl_otherB"] as decimal?,
                                    sup_commission = reader["sup_commission"] as decimal?,
                                    sup_prof_sharing = reader["sup_prof_sharing"] as decimal?,
                                    sup_fi_drctr_fees = reader["sup_fi_drctr_fees"] as decimal?,
                                    sup_13th_14th = reader["sup_13th_14th"] as decimal?,
                                    sup_hzrd_pay = reader["sup_hzrd_pay"] as decimal?,
                                    sup_ot_pay = reader["sup_ot_pay"] as decimal?,
                                    sup_otherA = reader["sup_otherA"] as decimal?,
                                    sup_otherB = reader["sup_otherB"] as decimal?,
                                    annual_txbl_income = reader["annual_txbl_income"] as decimal?,
                                    annual_tax_wheld = reader["annual_tax_wheld"] as decimal?,
                                    monthly_tax_due = reader["monthly_tax_due"] as decimal?,
                                    tax_rate = reader["tax_rate"] as decimal?,
                                    employer_type = reader["employer_type"] as string,
                                    foreign_address = reader["foreign_address"] as string,
                                    stat_daily_rate = reader["stat_daily_rate"] as decimal?,
                                    stat_monthly_rate = reader["stat_monthly_rate"] as decimal?,
                                    min_wage_earner = reader["min_wage_earner"] as bool?,
                                    tin_employer_prev = reader["tin_employer_prev"] as string,
                                    employer_name_prev = reader["employer_name_prev"] as string,
                                    employer_add_prev = reader["employer_add_prev"] as string,
                                    employer_zip_prev = reader["employer_zip_prev"] as string,
                                    remarks = reader["remarks"] as string,
                                    substituted = reader["substituted"] as string,
                                    jan = reader["jan"] as decimal?,
                                    feb = reader["feb"] as decimal?,
                                    mar = reader["mar"] as decimal?,
                                    apr = reader["apr"] as decimal?,
                                    may = reader["may"] as decimal?,
                                    jun = reader["jun"] as decimal?,
                                    july = reader["july"] as decimal?,
                                    aug = reader["aug"] as decimal?,
                                    sep = reader["sep"] as decimal?,
                                    oct = reader["oct"] as decimal?,
                                    nov = reader["nov"] as decimal?,
                                    dec = reader["dec"] as decimal?,
                                    check_for_descrepancy = reader["check_for_descrepancy"] as bool?,
                                    cur_mo = reader["cur_mo"] as int?,
                                    prev_mo = reader["prev_mo"] as int?,
                                    taxable = reader["taxable"] as bool?,
                                    hr_tax_due = reader["hr_tax_due"] as decimal?,
                                    hr_tax_rate = reader["hr_tax_rate"] as decimal?
                                };

                                sp_annualtax_hdr_tbl_list_wtaxpmos.Add(r);
                            }
                        }
                    }

                    connection.Close();
                }


                var sp_prcmonitor_tbl = db_pacco.sp_prcmonitor_tbl(par_year,"" , par_empType).ToList();

                return JSON(new { sp_annualtax_hdr_tbl_list_wtaxpmos, sp_prcmonitor_tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : Marvin Olita - Created Date : 08/28/2025
        // Description: CHECK TAX VALUES
        public ActionResult Check_Tax(string par_payroll_year, string par_empl_id)
        {
            try
            {
                List<sp_check_annualized_tax_dtl_Result> sp_check_annualized_tax_dtl = new List<sp_check_annualized_tax_dtl_Result>();
                using (SqlConnection connection = new SqlConnection(constring))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(@"
                        SET TEXTSIZE 2147483647;
                        SET LANGUAGE us_english;
                        SET DATEFORMAT mdy;
                        SET DATEFIRST 7;
                        SET LOCK_TIMEOUT -1;
                        SET QUOTED_IDENTIFIER ON;
                        SET ARITHABORT ON;
                        SET ANSI_NULL_DFLT_ON ON;
                        SET ANSI_WARNINGS ON;
                        SET ANSI_PADDING ON;
                        SET ANSI_NULLS ON;
                        SET CONCAT_NULL_YIELDS_NULL ON;
                        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;", connection))
                    {
                        command.ExecuteNonQuery();
                    }

                    using (var conn = new SqlConnection(constring))
                    using (var cmd = new SqlCommand("sp_check_annualized_tax_dtl", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@p_payroll_year", SqlDbType.VarChar, 4) { Value = par_payroll_year });
                        cmd.Parameters.Add(new SqlParameter("@p_empl_id", SqlDbType.VarChar, 10) { Value = par_empl_id });
                      

                        conn.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var r = new sp_check_annualized_tax_dtl_Result
                                {
                                           payrolltemplate_code         =       reader["payrolltemplate_code"] as string,
                                           voucher_nbr                  =       reader["voucher_nbr"] as string,
                                           payroll_month                =       reader["payroll_month"] as string,
                                           remarks                      =       reader["remarks"] as string,
                                           basic_sal                    =       reader["basic_sal"] as decimal?,
                                           phic_share                   =       reader["phic_share"] as decimal?,
                                           hazard_pay                   =       reader["hazard_pay"] as decimal?,
                                           subsistence_allowance        =       reader["subsistence_allowance"] as decimal?,
                                           overtime                     =       reader["overtime"] as decimal?,
                                           oth                          =       reader["oth"] as decimal?,
                                           taxable13th                  =       reader["taxable13th"] as decimal?,
                                           nontaxable13th               =       reader["nontaxable13th"] as decimal?,
                                           deminimis                    =       reader["deminimis"] as decimal?,
                                           sal_oth                      =       reader["sal_oth"] as decimal?,
                                           nontaxable_oth               =       reader["nontaxable_oth"] as decimal?,
                                           gsis_ps                      =       reader["gsis_ps"] as decimal?,
                                           hdmf_ps                      =       reader["hdmf_ps"] as decimal?,
                                           phic_ps                      =       reader["phic_ps"] as decimal?,
                                           wtax_amt                     =       reader["wtax_amt"] as decimal?,
                                           gross_income                 =       reader["gross_income"] as decimal?,
                                           nontaxable_income            =       reader["nontaxable_income"] as decimal?,
                                           taxable_income               =       reader["taxable_income"] as decimal?,
                                           tax_due                      =       reader["tax_due"] as decimal?,
                                           tax_withheld                 =       reader["tax_withheld"] as decimal?,
                                           tax_payable                  =       reader["tax_payable"] as decimal?,
                                           no_of_installment            =       reader["no_of_installment"] as int?,
                                           month13th_other              =       reader["month13th_other"] as decimal?,
                                           DE_minimis                   =       reader["DE_minimis"] as decimal?,
                                           gsis_hdmf_phic               =       reader["gsis_hdmf_phic"] as decimal?,
                                           salaries_oth                 =       reader["salaries_oth"] as decimal?,
                                           basic_salary                 =       reader["basic_salary"] as decimal?

                                };

                                sp_check_annualized_tax_dtl.Add(r);
                            }
                        }
                    }

                    connection.Close();
                }


                return JSON(new { sp_check_annualized_tax_dtl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }


            //*********************************************************************//
            // Created By : JRV - Created Date : 09/19/2019
            // Description: Populate Employment Type
            //*********************************************************************//
        public ActionResult SelectPayrollYear(string par_empType, string par_year, string par_letter)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                if (par_letter == null)
                { par_letter = ""; }
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list_wtaxpmos(par_year, par_empType, par_letter).ToList();
                HttpContext.Session["sp_annualtax_hdr_tbl_list"] = sp_annualtax_hdr_tbl_list;
                return JSON(new { sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectLetter(string par_empType, string par_year, string par_letter)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                if (par_letter == null)
                { par_letter = ""; }
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_year, par_empType, par_letter).ToList();

                return JSON(new { sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }


        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectYear(string par_year, string par_month, string par_template, string par_payrolltype, string par_employment_type)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list(par_year, par_month, par_template, par_payrolltype, par_employment_type).ToList();
                return JSON(new { sp_payrollregistryaccounting_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description : Print Employees 2316
        ////*********************************************************************//
        public ActionResult ReportCount(string par_payroll_year, string par_empl_id, string par_period_from, string par_period_to)
        {
            
            Session["history_page"] = Request.UrlReferrer.ToString();
            var reportcount = db_pacco.sp_annualtax_hdr_tbl_rep(par_payroll_year, par_empl_id).ToList();
            return JSON(new { reportcount }, JsonRequestBehavior.AllowGet);
        }


        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Populate Employment Type
        ////*********************************************************************//
        public ActionResult ExtractData(string par_empType, string par_payroll_year, string par_extract_type)
        {
            int index_error = 0;
            try
            {

                db_pacco.Database.CommandTimeout = int.MaxValue;
                var filePath = "";
                string message = "";
                decimal start_row = 2;
                decimal start_row_original = 2;
                decimal c_start_row_i = start_row;
                if (par_extract_type == "H")
                {

                    var sp_extract_annualized_tax = db_pacco.sp_extract_annualized_tax(par_payroll_year, par_empType).ToList();

                    Excel.Application xlApp = new Excel.Application();
                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/TAX-DETAILS.xlsx"));

                    Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                    xlApp.DisplayAlerts = false;

                    for (var i = 0; i < sp_extract_annualized_tax.Count(); i++)
                    {

                        xlWorkSheet.get_Range("A" + c_start_row_i, "AZ" + c_start_row_i).Borders.Color = Color.Black;
                        xlWorkSheet.get_Range("A" + start_row_original, "AZ" + start_row_original).Copy(Missing.Value);
                        xlWorkSheet.get_Range("A" + c_start_row_i, "AZ" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                        //xlWorkSheet.Cells[c_start_row_i, 1] = (i + 1);
                        xlWorkSheet.Cells[c_start_row_i, 1] = sp_extract_annualized_tax[i].row_nbr;
                        xlWorkSheet.Cells[c_start_row_i, 2] = sp_extract_annualized_tax[i].empl_id;
                        xlWorkSheet.Cells[c_start_row_i, 3] = sp_extract_annualized_tax[i].account_id_nbr_ref;
                        xlWorkSheet.Cells[c_start_row_i, 4] = sp_extract_annualized_tax[i].employee_name;
                        xlWorkSheet.Cells[c_start_row_i, 5] = sp_extract_annualized_tax[i].department_name1;
                        xlWorkSheet.Cells[c_start_row_i, 6] = sp_extract_annualized_tax[i].birth_date;
                        xlWorkSheet.Cells[c_start_row_i, 7] = sp_extract_annualized_tax[i].period_from;
                        xlWorkSheet.Cells[c_start_row_i, 8] = sp_extract_annualized_tax[i].period_to;
                        xlWorkSheet.Cells[c_start_row_i, 9] = sp_extract_annualized_tax[i].tin_employer_prev;
                        xlWorkSheet.Cells[c_start_row_i, 10] = sp_extract_annualized_tax[i].employer_name_prev;
                        xlWorkSheet.Cells[c_start_row_i, 11] = sp_extract_annualized_tax[i].ntx_basic_salary;
                        xlWorkSheet.Cells[c_start_row_i, 12] = sp_extract_annualized_tax[i].ntx_hol_pay_mwe;
                        xlWorkSheet.Cells[c_start_row_i, 13] = sp_extract_annualized_tax[i].ntx_ot_pay_mwe;
                        xlWorkSheet.Cells[c_start_row_i, 14] = sp_extract_annualized_tax[i].ntx_night_diff_mwe;
                        xlWorkSheet.Cells[c_start_row_i, 15] = sp_extract_annualized_tax[i].ntx_hzrd_pay_mwe;
                        xlWorkSheet.Cells[c_start_row_i, 16] = sp_extract_annualized_tax[i].ntx_13th_14th;
                        xlWorkSheet.Cells[c_start_row_i, 17] = sp_extract_annualized_tax[i].ntx_de_minimis;
                        xlWorkSheet.Cells[c_start_row_i, 18] = sp_extract_annualized_tax[i].ntx_gsis_phic_hdmf;
                        xlWorkSheet.Cells[c_start_row_i, 19] = sp_extract_annualized_tax[i].ntx_salaries_oth;
                        xlWorkSheet.Cells[c_start_row_i, 20] = sp_extract_annualized_tax[i].cna_gross;
                        xlWorkSheet.Cells[c_start_row_i, 21] = sp_extract_annualized_tax[i].pbb_gross;
                        xlWorkSheet.Cells[c_start_row_i, 22] = sp_extract_annualized_tax[i].total_nontaxable;
                        xlWorkSheet.Cells[c_start_row_i, 23] = sp_extract_annualized_tax[i].txbl_basic_salary;
                        xlWorkSheet.Cells[c_start_row_i, 24] = sp_extract_annualized_tax[i].txbl_representation;
                        xlWorkSheet.Cells[c_start_row_i, 25] = sp_extract_annualized_tax[i].txbl_transportation;
                        xlWorkSheet.Cells[c_start_row_i, 26] = sp_extract_annualized_tax[i].txbl_cola;
                        xlWorkSheet.Cells[c_start_row_i, 27] = sp_extract_annualized_tax[i].txbl_fh_allowance;
                        xlWorkSheet.Cells[c_start_row_i, 28] = sp_extract_annualized_tax[i].txbl_otherA;
                        xlWorkSheet.Cells[c_start_row_i, 29] = sp_extract_annualized_tax[i].txbl_otherB;
                        xlWorkSheet.Cells[c_start_row_i, 30] = sp_extract_annualized_tax[i].total_txbl_wout_sup_ot;
                        xlWorkSheet.Cells[c_start_row_i, 31] = sp_extract_annualized_tax[i].sup_commission;
                        xlWorkSheet.Cells[c_start_row_i, 32] = sp_extract_annualized_tax[i].sup_prof_sharing;
                        xlWorkSheet.Cells[c_start_row_i, 33] = sp_extract_annualized_tax[i].sup_fi_drctr_fees;
                        xlWorkSheet.Cells[c_start_row_i, 34] = sp_extract_annualized_tax[i].sup_13th_14th;
                        xlWorkSheet.Cells[c_start_row_i, 35] = sp_extract_annualized_tax[i].sup_hzrd_pay;
                        xlWorkSheet.Cells[c_start_row_i, 36] = sp_extract_annualized_tax[i].sup_ot_pay;
                        xlWorkSheet.Cells[c_start_row_i, 37] = sp_extract_annualized_tax[i].sup_otherA;
                        xlWorkSheet.Cells[c_start_row_i, 38] = sp_extract_annualized_tax[i].sup_otherB;
                        xlWorkSheet.Cells[c_start_row_i, 39] = sp_extract_annualized_tax[i].total_other_txbl;
                        xlWorkSheet.Cells[c_start_row_i, 40] = sp_extract_annualized_tax[i].total_gross;
                        xlWorkSheet.Cells[c_start_row_i, 41] = sp_extract_annualized_tax[i].non_tax_ex_comp;
                        xlWorkSheet.Cells[c_start_row_i, 42] = sp_extract_annualized_tax[i].annual_txbl_income;
                        xlWorkSheet.Cells[c_start_row_i, 43] = sp_extract_annualized_tax[i].addl_txbl_comp_prsnt;
                        xlWorkSheet.Cells[c_start_row_i, 44] = sp_extract_annualized_tax[i].total_annual_txbl_income + sp_extract_annualized_tax[i].addl_txbl_comp_prsnt;
                        xlWorkSheet.Cells[c_start_row_i, 45] = sp_extract_annualized_tax[i].annual_tax_due;
                        xlWorkSheet.Cells[c_start_row_i, 46] = sp_extract_annualized_tax[i].wtax_prsnt_emplyr;
                        xlWorkSheet.Cells[c_start_row_i, 47] = sp_extract_annualized_tax[i].wtax_prev_emplyr;
                        xlWorkSheet.Cells[c_start_row_i, 48] = sp_extract_annualized_tax[i].total_tax_jan_nov;
                        xlWorkSheet.Cells[c_start_row_i, 49] = sp_extract_annualized_tax[i].tax_paid_dec;
                        xlWorkSheet.Cells[c_start_row_i, 50] = sp_extract_annualized_tax[i].over_tax_refund;
                        xlWorkSheet.Cells[c_start_row_i, 51] = sp_extract_annualized_tax[i].tax_wheld_adjusted;
                        xlWorkSheet.Cells[c_start_row_i, 52] = sp_extract_annualized_tax[i].tax_due_payable;

                        c_start_row_i++;

                        message = "success";
                        index_error++;
                    }

                    string filename = "";
                    filename = par_empType + "-" + "-" + "TAX-LIST" + ".xlsx";
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
                    return JSON(new { message, sp_extract_annualized_tax, filePath }, JsonRequestBehavior.AllowGet);
                }

                else
                {


                    Excel.Application xlApp = new Excel.Application();
                    Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/TAX-DETAILS-BIR.xlsx"));

                    Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                    xlApp.DisplayAlerts = false;


                    var sp_extract_annualized_tax = db_pacco.sp_extract_annualized_tax_bir(par_payroll_year, par_empType).ToList();

                    for (var i = 0; i < sp_extract_annualized_tax.Count(); i++)
                    {

                        xlWorkSheet.get_Range("A" + start_row_original, "AU" + start_row_original).Copy(Missing.Value);
                        xlWorkSheet.get_Range("A" + c_start_row_i, "AU" + c_start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);

                        xlWorkSheet.Cells[c_start_row_i, 1] = sp_extract_annualized_tax[i].empl_id;
                        xlWorkSheet.Cells[c_start_row_i, 2] = sp_extract_annualized_tax[i].account_id_nbr_ref;
                        xlWorkSheet.Cells[c_start_row_i, 3] = sp_extract_annualized_tax[i].branch_code;
                        xlWorkSheet.Cells[c_start_row_i, 4] = sp_extract_annualized_tax[i].last_name;
                        xlWorkSheet.Cells[c_start_row_i, 5] = sp_extract_annualized_tax[i].first_name;
                        xlWorkSheet.Cells[c_start_row_i, 6] = sp_extract_annualized_tax[i].middle_name;
                        xlWorkSheet.Cells[c_start_row_i, 7] = sp_extract_annualized_tax[i].region;
                        xlWorkSheet.Cells[c_start_row_i, 8] = sp_extract_annualized_tax[i].address_info;
                        xlWorkSheet.Cells[c_start_row_i, 9] = sp_extract_annualized_tax[i].zip_code;
                        xlWorkSheet.Cells[c_start_row_i, 10] = sp_extract_annualized_tax[i].birth_date;
                        xlWorkSheet.Cells[c_start_row_i, 11] = sp_extract_annualized_tax[i].mobile_no;
                        xlWorkSheet.Cells[c_start_row_i, 12] = sp_extract_annualized_tax[i].valid_id;
                        xlWorkSheet.Cells[c_start_row_i, 13] = sp_extract_annualized_tax[i].date_place_issuance;
                        xlWorkSheet.Cells[c_start_row_i, 14] = sp_extract_annualized_tax[i].citizenship;
                        xlWorkSheet.Cells[c_start_row_i, 15] = sp_extract_annualized_tax[i].employment_type;
                        xlWorkSheet.Cells[c_start_row_i, 16] = sp_extract_annualized_tax[i].period_from;
                        xlWorkSheet.Cells[c_start_row_i, 17] = sp_extract_annualized_tax[i].period_to;
                        xlWorkSheet.Cells[c_start_row_i, 18] = sp_extract_annualized_tax[i].reason_of_separation;
                        xlWorkSheet.Cells[c_start_row_i, 19] = sp_extract_annualized_tax[i].prev_gross;
                        xlWorkSheet.Cells[c_start_row_i, 20] = sp_extract_annualized_tax[i].prev_250k_below;
                        xlWorkSheet.Cells[c_start_row_i, 21] = sp_extract_annualized_tax[i].prev_13th_others;
                        xlWorkSheet.Cells[c_start_row_i, 22] = sp_extract_annualized_tax[i].prev_deminimis;
                        xlWorkSheet.Cells[c_start_row_i, 23] = sp_extract_annualized_tax[i].prev_phic_sss_hdmf_ded;
                        xlWorkSheet.Cells[c_start_row_i, 24] = sp_extract_annualized_tax[i].prev_salaries_oth;
                        xlWorkSheet.Cells[c_start_row_i, 25] = sp_extract_annualized_tax[i].prev_non_tax;
                        xlWorkSheet.Cells[c_start_row_i, 26] = sp_extract_annualized_tax[i].prev_basic_wage;
                        xlWorkSheet.Cells[c_start_row_i, 27] = sp_extract_annualized_tax[i].prev_13th_txbl;
                        xlWorkSheet.Cells[c_start_row_i, 28] = sp_extract_annualized_tax[i].prev_salaries_oth_txbl;
                        xlWorkSheet.Cells[c_start_row_i, 29] = sp_extract_annualized_tax[i].prev_total_txbl;
                        xlWorkSheet.Cells[c_start_row_i, 30] = sp_extract_annualized_tax[i].pres_total_gross;
                        xlWorkSheet.Cells[c_start_row_i, 31] = sp_extract_annualized_tax[i].pres_250k_below;
                        xlWorkSheet.Cells[c_start_row_i, 32] = sp_extract_annualized_tax[i].pres_13th_14th;
                        xlWorkSheet.Cells[c_start_row_i, 33] = sp_extract_annualized_tax[i].pres_de_minimis;
                        xlWorkSheet.Cells[c_start_row_i, 34] = sp_extract_annualized_tax[i].pres_gsis_phic_hdmf;
                        xlWorkSheet.Cells[c_start_row_i, 35] = sp_extract_annualized_tax[i].pres_salaries_oth;
                        xlWorkSheet.Cells[c_start_row_i, 36] = sp_extract_annualized_tax[i].total_nontaxable;
                        xlWorkSheet.Cells[c_start_row_i, 37] = sp_extract_annualized_tax[i].pres_basic_salary;
                        xlWorkSheet.Cells[c_start_row_i, 38] = sp_extract_annualized_tax[i].pres_txbl_13th_14th;
                        xlWorkSheet.Cells[c_start_row_i, 39] = sp_extract_annualized_tax[i].pres_txbl_oth_sal;
                        xlWorkSheet.Cells[c_start_row_i, 40] = sp_extract_annualized_tax[i].total_gross_txbl;
                        xlWorkSheet.Cells[c_start_row_i, 41] = sp_extract_annualized_tax[i].pres_gross_compensation_total_gross;
                        xlWorkSheet.Cells[c_start_row_i, 42] = sp_extract_annualized_tax[i].pres_total_gross_txbl;
                        xlWorkSheet.Cells[c_start_row_i, 43] = sp_extract_annualized_tax[i].annual_tax_due;
                        xlWorkSheet.Cells[c_start_row_i, 44] = sp_extract_annualized_tax[i].wtax_prev_emplyr;
                        xlWorkSheet.Cells[c_start_row_i, 45] = sp_extract_annualized_tax[i].wtax_prsnt_emplyr;
                        xlWorkSheet.Cells[c_start_row_i, 46] = sp_extract_annualized_tax[i].tax_paid_dec;
                        xlWorkSheet.Cells[c_start_row_i, 47] = sp_extract_annualized_tax[i].over_tax_refund;
                        xlWorkSheet.Cells[c_start_row_i, 48] = sp_extract_annualized_tax[i].tax_wheld_adjusted;
                        c_start_row_i++;

                        message = "success";

                    }

                    string filename = "";
                    filename = par_empType + "-" + "-" + "TAX-LIST-BIR" + ".xlsx";
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

                    return JSON(new { message, sp_extract_annualized_tax, filePath }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message, index_error }, JsonRequestBehavior.AllowGet);
            }

        }



        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: HRIS_Extract for PHP Export
        //*********************************************************************//
        public ActionResult ExtractDataToPHP(string par_empType, string par_payroll_year, string par_extract_type)
        {
            int index_error = 0;
            try
            {

                db_pacco.Database.CommandTimeout = int.MaxValue;
                
                string message = "";
                decimal start_row = 2;
                decimal c_start_row_i = start_row;
                if (par_extract_type == "H")
                {

                    var sp_extract_annualized_tax = db_pacco.sp_extract_annualized_tax_forPHP(par_payroll_year, par_empType).ToList();
                   
                    message = "success";
                    return JSON(new { message, sp_extract_annualized_tax}, JsonRequestBehavior.AllowGet);
                }

                else
                {

                    var sp_extract_annualized_tax = db_pacco.sp_extract_annualized_tax_bir_forPHP(par_payroll_year, par_empType).ToList();
                   
                    message = "success";

                    return JSON(new { message, sp_extract_annualized_tax}, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message, index_error }, JsonRequestBehavior.AllowGet);
            }

        }

    }   

}