//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll POSTING
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
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cEmployeeCardRepController : Controller
    {

        string constring = System.Configuration.ConfigurationManager.AppSettings["connetionString_act"];
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        // GET: cEmployeeCardRep
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (um != null || um.ToString() != "")
            {
                try
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
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = "application/json",
                ContentEncoding = System.Text.Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            var department_list     = new object();
            string payroll_year     = "";
            string employment_type  = "RC";
            string period_from      = "";
            string period_to        = "";
            string department       = "";
            string empl_id = "";
            var employee_name_span = new object();
            string[] cEmployeeCardRep_Previous;
            var employee_name = new object();
            
            if (Session["cEmployeeCardRep_Previous"] == null)
            {
                department_list = db_pacco.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();
                //department = "01";
                employee_name = db_pacco.sp_personnelnames_carding_re_ce_combolist(department, employment_type).ToList();
            }

            else
            {
                department_list = db_pacco.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();
                cEmployeeCardRep_Previous  = Session["cEmployeeCardRep_Previous"].ToString().Split(new char[] { ',' });
                payroll_year    = cEmployeeCardRep_Previous[0].ToString();
                empl_id         = cEmployeeCardRep_Previous[1].ToString();
                period_from     = cEmployeeCardRep_Previous[2].ToString();
                period_to       = cEmployeeCardRep_Previous[3].ToString();
                department      = cEmployeeCardRep_Previous[4].ToString();
                employment_type = cEmployeeCardRep_Previous[5].ToString();
                employee_name   = db_pacco.sp_personnelnames_carding_re_ce_combolist(department, employment_type).ToList();
                employee_name_span = db_pacco.sp_personnelnames_carding_re_ce_combolist(department, employment_type).Where(a=> a.empl_id == empl_id).FirstOrDefault();
            }
            
            return JSON(new { department_list, payroll_year, employment_type, period_from, period_to, department, employee_name, empl_id, employee_name_span }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Select Department
        //*********************************************************************//
        public ActionResult SelectedDepartment_Change(string par_department_code,string par_employment_type)
        {
            var employee_name = new object();
            employee_name = db_pacco.sp_personnelnames_carding_re_ce_combolist(par_department_code, par_employment_type).ToList();
            return Json(new { employee_name }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Select Department
        //*********************************************************************//
        public ActionResult SelectedEmployee_Change(string par_empl_id)
        {
            var employee_id = par_empl_id;
            return Json(new { employee_id }, JsonRequestBehavior.AllowGet);
        }

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description : Print Employees Card
        ////*********************************************************************//
        public ActionResult ReportCount(string par_payroll_year, string par_empl_id, string par_period_from, string par_period_to, string par_department, string par_employment_type)
        {
           
            string defaultdate = "1900-01-01";
            Session["history_page"] = Request.UrlReferrer.ToString();
           
            if (par_period_from == "" || par_period_to == "")
            {
                par_period_from = defaultdate;
                par_period_to   = defaultdate;
            }
            var reportcount = 0;
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

                // var reportcount = db_pacco.sp_employeecard_re_ce_rep(par_payroll_year, par_empl_id, Convert.ToDateTime(par_period_from), Convert.ToDateTime(par_period_to)).ToList();
               
                using (SqlCommand command = new SqlCommand("sp_employeecard_re_ce_rep", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@par_payroll_year", par_payroll_year);
                    command.Parameters.AddWithValue("@par_empl_id", par_empl_id);
                    command.Parameters.AddWithValue("@par_period_from", Convert.ToDateTime(par_period_from));
                    command.Parameters.AddWithValue("@par_period_to", Convert.ToDateTime(par_period_to));
                   
                    command.CommandTimeout = int.MaxValue;

                    // Use deferred execution with SqlDataReader
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            reportcount++;


                        }
                    }
                }

                connection.Close();
            }



            
          
             if (reportcount > 0)
             {
                 Session["cEmployeeCardRep_Previous"] = par_payroll_year + ","
                                                   + par_empl_id + ","
                                                   + par_period_from + ","
                                                   + par_period_to + ","
                                                   + par_department + ","
                                                   + par_employment_type;
             }
            
            
            return Json(new { reportcount }, JsonRequestBehavior.AllowGet);
        }

      

    }
}