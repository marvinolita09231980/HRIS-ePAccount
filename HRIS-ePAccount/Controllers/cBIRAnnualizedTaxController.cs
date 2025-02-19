
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
            List<sp_annualtax_hdr_tbl_list_Result> sp_annualtax_hdr_tbl_list = new List<sp_annualtax_hdr_tbl_list_Result>();
            

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

                sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(ddl_year, ddl_emp_type, ddl_letter).ToList();




                return JSON(new { empType, sp_annualtax_hdr_tbl_list, ddl_year, empl_id, ddl_emp_type, ddl_letter, show_entries, page_value, search_value, sort_value, sort_order, um, excelExportServer}, JsonRequestBehavior.AllowGet);


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
                //db_pacco.SaveChanges();

                var sp_annualtax_hdr_tbl_list  = db_pacco.sp_annualtax_hdr_tbl_list(par_payroll_year, par_employment, par_letter).ToList();
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
                List<sp_annualtax_hdr_tbl_list_Result> sp_annualtax_hdr_tbl_list = new List<sp_annualtax_hdr_tbl_list_Result>();
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
                            
                    using (SqlCommand command = new SqlCommand("sp_annualtax_hdr_tbl_list", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@p_payroll_year", par_year);
                        command.Parameters.AddWithValue("@p_employment_type", par_empType);
                        command.Parameters.AddWithValue("@p_letter", par_letter);

                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                // Map each record to your model
                                var item = new sp_annualtax_hdr_tbl_list_Result
                                {

                                    payroll_year                     = reader.GetString(0),
                                    empl_id                          = reader.GetString(1),
                                    employee_name                    = reader.GetString(2),
                                    employment_type                  = reader.GetString(3),
                                    account_id_nbr_ref               = reader.GetString(4),
                                    employmenttype_description       = reader.GetString(5),
                                    position_title1                  = reader.GetString(6),
                                    addl_txbl_comp_prsnt             = reader.GetDecimal(7),
                                    annual_tax_due                   = reader.GetDecimal(8),
                                    wtax_prsnt_emplyr                = reader.GetDecimal(9),
                                    wtax_prev_emplyr                 = reader.GetDecimal(10),
                                    ntx_basic_salary                 = reader.GetDecimal(11),
                                    ntx_hol_pay_mwe                  = reader.GetDecimal(12),
                                    ntx_ot_pay_mwe                   = reader.GetDecimal(13),
                                    ntx_night_diff_mwe               = reader.GetDecimal(14),
                                    ntx_hzrd_pay_mwe                 = reader.GetDecimal(15),
                                    ntx_13th_14th                    = reader.GetDecimal(16),
                                    ntx_de_minimis                   = reader.GetDecimal(17),
                                    ntx_gsis_phic_hdmf               = reader.GetDecimal(18),
                                    ntx_salaries_oth                 = reader.GetDecimal(19),
                                    txbl_basic_salary                = reader.GetDecimal(20),
                                    txbl_representation              = reader.GetDecimal(21),
                                    txbl_transportation              = reader.GetDecimal(22),
                                    txbl_cola                        = reader.GetDecimal(23),
                                    txbl_fh_allowance                = reader.GetDecimal(24),
                                    txbl_otherA                      = reader.GetDecimal(25),
                                    txbl_otherB                      = reader.GetDecimal(26),
                                    sup_commission                   = reader.GetDecimal(27),
                                    sup_prof_sharing                 = reader.GetDecimal(28),
                                    sup_fi_drctr_fees                = reader.GetDecimal(29),
                                    sup_13th_14th                    = reader.GetDecimal(30),
                                    sup_hzrd_pay                     = reader.GetDecimal(31),
                                    sup_ot_pay                       = reader.GetDecimal(32),
                                    sup_otherA                       = reader.GetDecimal(33),
                                    sup_otherB                       = reader.GetDecimal(34),
                                    annual_txbl_income               = reader.GetDecimal(35),
                                    annual_tax_wheld                 = reader.GetDecimal(36),
                                    monthly_tax_due                  = reader.GetDecimal(37),
                                    tax_rate                         = reader.GetDecimal(38),
                                    employer_type                     = reader.GetString(39),
                                    foreign_address                   = reader.GetString(40),
                                    stat_daily_rate                  = reader.GetDecimal(41),
                                    stat_monthly_rate                = reader.GetDecimal(42),
                                    min_wage_earner                     = reader.GetBoolean(43),
                                    tin_employer_prev                 = reader.GetString(44),
                                    employer_name_prev                = reader.GetString(45),
                                    employer_add_prev                 = reader.GetString(46),
                                    employer_zip_prev                 = reader.GetString(47),
                                    remarks                           = reader.GetString(48),
                                    substituted                       = reader.GetString(49),

                                };                            
                                sp_annualtax_hdr_tbl_list.Add(item);
                            }
                        }
                    }

                    connection.Close();
                }

                HttpContext.Session["sp_annualtax_hdr_tbl_list"] = sp_annualtax_hdr_tbl_list;

                var sp_prcmonitor_tbl = db_pacco.sp_prcmonitor_tbl(par_year,"" , par_empType).ToList();

                return JSON(new { sp_annualtax_hdr_tbl_list, sp_prcmonitor_tbl }, JsonRequestBehavior.AllowGet);
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
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_year, par_empType, par_letter).ToList();
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