
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


namespace HRIS_ePAccount.Controllers
{
    public class cSepSetController : Controller
    {

        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
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
            db_pacco.Database.CommandTimeout = int.MaxValue;
            GetAllowAccess();
            Session["PreviousValuesonPage_cBIRAnnualizedTax"] = null;
            int sort_value = 1;
            int page_value = 0;
            string sort_order = "asc";
            string show_entries = "5";
            string ddl_emp_type = "";
            var empType = db_pacco.vw_employmenttypes_tbl_list.Where(a => !a.employment_type.Contains("JO")).ToList();
            string ddl_letter = "";
            var sp_annualtax_separation_tbl_list = db_pacco.sp_annualtax_separation_tbl_list("", "", "").ToList();


            return JSON(new { empType, ddl_letter, ddl_emp_type, sp_annualtax_separation_tbl_list, sort_value, page_value, sort_order, show_entries, um }, JsonRequestBehavior.AllowGet);



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

                var sp_tax_prjtd_per_empl_id = db_pacco.sp_annualtax_hdr_tbl_list(par_payroll_year, par_empType, "").ToList().Where(a => a.empl_id == par_empl_id);

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
        //public ActionResult RetrieveEmployeeList(string par_empType, string par_payroll_year) --COMMENT BY MARVIN 2024-08-22
        //{
        //    try
        //    {
        //        db_pacco.Database.CommandTimeout = int.MaxValue;
        //        var sp_personnelnames_annualtax_hdr_combolist = db_pacco.sp_personnelnames_annualtax_hdr_combolist(par_empType, par_payroll_year).ToList();

        //        return JSON(new { message = "success", sp_personnelnames_annualtax_hdr_combolist }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
        //    }

        //}


        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: Select EmployeeName
        //////*********************************************************************//
        public ActionResult SaveEDITInDatabase(annualtax_separation_tbl data)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var annualtax_separation_tbl_check = db_pacco.annualtax_separation_tbl.Where(a => a.payroll_year == data.payroll_year && a.empl_id == data.empl_id).FirstOrDefault();

                if (annualtax_separation_tbl_check == null)
                {

                    db_pacco.annualtax_separation_tbl.Add(data);
                    db_pacco.SaveChanges();
                    message = "success";
                }

                else
                {
                    annualtax_separation_tbl_check.payroll_year = data.payroll_year;
                    annualtax_separation_tbl_check.empl_id = data.empl_id;
                    annualtax_separation_tbl_check.period_from = data.period_from;
                    annualtax_separation_tbl_check.period_to = data.period_to;
                    annualtax_separation_tbl_check.flag = Convert.ToBoolean(data.flag);
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
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType, string par_year, string par_letter)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                if (par_letter == null)
                { par_letter = ""; }
                var sp_annualtax_separation_tbl_list = db_pacco.sp_annualtax_separation_tbl_list(par_year, par_empType, par_letter).ToList();

                return JSON(new { sp_annualtax_separation_tbl_list }, JsonRequestBehavior.AllowGet);
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
                var sp_annualtax_separation_tbl_list = db_pacco.sp_annualtax_separation_tbl_list(par_year, par_empType, par_letter).ToList();

                return JSON(new { sp_annualtax_separation_tbl_list }, JsonRequestBehavior.AllowGet);
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

        

    }
}