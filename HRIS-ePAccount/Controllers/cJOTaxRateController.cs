
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
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;

namespace HRIS_ePAccount.Controllers
{
    public class cJOTaxRateController : Controller
    {

        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        User_Menu um = new User_Menu();
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//

        public void GetAllowAccess()
        {
            um.allow_add            = (int)Session["allow_add"];
            um.allow_delete         = (int)Session["allow_delete"];
            um.allow_edit           = (int)Session["allow_edit"];
            um.allow_edit_history   = (int)Session["allow_edit_history"];
            um.allow_print          = (int)Session["allow_print"];
            um.allow_view           = (int)Session["allow_view"];
            um.url_name             = Session["url_name"].ToString();
            um.id                   = (int)Session["id"];
            um.menu_name            = Session["menu_name"].ToString();
            um.page_title           = Session["page_title"].ToString();
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
            return Json("success", JsonRequestBehavior.AllowGet);
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
        public ActionResult InitializeData(string par_payroll_year)
        {
            object payroll_template = new object();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            GetAllowAccess();
            var taxrate_percentage_tbl_list = db_pacco.taxrate_percentage_tbl.ToList();
            if (Session["PreviousValuesonPage_cJOTaxRate"] == null)
            {
                Session["PreviousValuesonPage_cJOTaxRate"] = null;
                int sort_value = 1;
                int page_value = 0;
                string sort_order = "asc";
                string show_entries = "5";
                string ddl_emp_type = "";
                string department_code = "";
                var empType = db_pacco.vw_employmenttypes_tbl_list.Where(a => !a.employment_type.Contains("JO")).ToList();
                var bir_class_list = db_pacco.sp_jo_tax_tbl_list().ToList();

               

                var department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);
                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, "", "").ToList();
                return JSON(new { empType, ddl_emp_type, sp_payrollemployee_tax_hdr_tbl_list, sort_value, page_value, sort_order, show_entries, um, department_list, bir_class_list, taxrate_percentage_tbl_list, department_code }, JsonRequestBehavior.AllowGet);

            }


            else
            {
                string[] PreviousValuesonPage_cJOTaxRate = Session["PreviousValuesonPage_cJOTaxRate"].ToString().Split(new char[] { ',' });

                string ddl_year = PreviousValuesonPage_cJOTaxRate[0].ToString().Trim();
                string department_code = PreviousValuesonPage_cJOTaxRate[10].ToString().Trim();
                string history = PreviousValuesonPage_cJOTaxRate[11].ToString().Trim();
                
                string show_entries = PreviousValuesonPage_cJOTaxRate[3].ToString().Trim();
                int page_value = Convert.ToInt32(PreviousValuesonPage_cJOTaxRate[4].ToString().Trim());
                string search_value = PreviousValuesonPage_cJOTaxRate[5].ToString().Trim();
                int sort_value = Convert.ToInt32(PreviousValuesonPage_cJOTaxRate[6].ToString().Trim());
                string sort_order = PreviousValuesonPage_cJOTaxRate[7].ToString().Trim();
                var bir_class_list = db_pacco.sp_jo_tax_tbl_list().ToList();
                var department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);
                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(ddl_year, department_code, history).ToList();

                return JSON(new { department_list, department_code, sp_payrollemployee_tax_hdr_tbl_list, ddl_year, show_entries, page_value, search_value, sort_value, sort_order, um, bir_class_list, history, taxrate_percentage_tbl_list }, JsonRequestBehavior.AllowGet);


            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveEmployeeList(string par_payroll_year, string par_department_code)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var sp_personnelnames_combolist_tax_jo = db_pacco.sp_personnelnames_combolist_tax_jo(par_payroll_year, par_department_code).ToList();

                return Json(new { message = "success", sp_personnelnames_combolist_tax_jo }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult CheckData(string par_payroll_year, string par_department_code, string par_history, string par_action, string par_empl_id, string par_effective_date)
        {
            try
            {
                string message = "";
                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, par_department_code, par_history).Where(a => a.empl_id == par_empl_id && a.effective_date == par_effective_date).FirstOrDefault();

                if (sp_payrollemployee_tax_hdr_tbl_list != null && par_action == "ADD")
                {
                    message = "fail";
                }

                else if (sp_payrollemployee_tax_hdr_tbl_list == null && par_action == "EDIT")
                {
                    message = "fail";
                   
                }

                else if (sp_payrollemployee_tax_hdr_tbl_list == null && par_action == "DELETE")
                { 
                    
                        message = "fail";
                }

                else
                {
                    message = "success";
                }
                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        public bool isCheckBool(string value)
        {
            bool data = new bool();

            if (value == "" || value == null)
            {
                data = false;
            }

            else if (value.ToString().ToUpper() == "TRUE" || value.ToString().ToUpper() == "1")
            {
                data = true;
            }

            else if (value.ToString().ToUpper() == "FALSE" || value.ToString().ToUpper() == "0")
            {
                data = false;
            }

            return data;
        }

        public DateTime isCheckDate(string value)
        {
            DateTime data = new DateTime();

            if (value == "" || value == null)
            {
                data = Convert.ToDateTime("1900-01-01");
            }

            else
            {
                data = Convert.ToDateTime(value);
            }
            

            return data;
        }

        //*************************************************************************
        //  BEGIN - JRV- 09/20/2018 - Retrieve back end data and load to GridView
        //*************************************************************************
        public ActionResult GetTaxRate(string par_payroll_year, string par_empl_id)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var bir_class = db_pacco.sp_getemployee_tax_rate(par_payroll_year, par_empl_id).FirstOrDefault();
            return Json(new { bir_class, message = "success" }, JsonRequestBehavior.AllowGet);
        }

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: Select EmployeeName
        //////*********************************************************************//
        public ActionResult SaveEDITInDatabase(payrollemployee_tax_hdr_tbl data, string par_effective_date, string par_empl_id, string par_action)
        {
            try
            {
                string message = "";

                DateTime effective_date = Convert.ToDateTime(par_effective_date.ToString());

              
                if (par_action == "ADD")
                {
                    payrollemployee_tax_hdr_tbl tbl = new payrollemployee_tax_hdr_tbl();

                    tbl.empl_id             = data.empl_id;
                    tbl.effective_date      = isCheckDate(data.effective_date.ToString());
                    tbl.bir_class           = data.bir_class;
                    tbl.with_sworn          = isCheckBool(data.with_sworn.ToString());
                    tbl.fixed_rate          = isCheckBool(data.fixed_rate.ToString());
                    tbl.total_gross_pay     = data.total_gross_pay;
                    tbl.dedct_status        = isCheckBool(data.dedct_status.ToString());
                    tbl.rcrd_status         = data.rcrd_status;
                    tbl.user_id_created_by  = Session["user_id"].ToString();
                    tbl.created_dttm        = DateTime.Now;
                    tbl.user_id_updated_by  = "";
                    tbl.w_tax_perc          = data.w_tax_perc;
                    tbl.bus_tax_perc        = data.bus_tax_perc;
                    tbl.vat_perc            = data.vat_perc;
                    tbl.exmpt_amt           = data.exmpt_amt;
                    tbl.updated_dttm        = Convert.ToDateTime("1900-01-01");

                    db_pacco.payrollemployee_tax_hdr_tbl.Add(tbl);
                   
                }

                else if (par_action == "EDIT")
                {
                    var payrollemployee_tax_hdr_tbl = db_pacco.payrollemployee_tax_hdr_tbl.Where(a => a.effective_date == effective_date && a.empl_id == par_empl_id).FirstOrDefault();
                    payrollemployee_tax_hdr_tbl.bir_class           = data.bir_class;
                    payrollemployee_tax_hdr_tbl.with_sworn          = data.with_sworn;
                    payrollemployee_tax_hdr_tbl.fixed_rate          = data.fixed_rate;
                    payrollemployee_tax_hdr_tbl.total_gross_pay     = data.total_gross_pay;
                    payrollemployee_tax_hdr_tbl.dedct_status        = data.dedct_status;
                    payrollemployee_tax_hdr_tbl.rcrd_status         = data.rcrd_status;
                    payrollemployee_tax_hdr_tbl.user_id_updated_by  = Session["user_id"].ToString(); ;
                    payrollemployee_tax_hdr_tbl.updated_dttm        = DateTime.Now;
                    payrollemployee_tax_hdr_tbl.w_tax_perc          = data.w_tax_perc;
                    payrollemployee_tax_hdr_tbl.bus_tax_perc        = data.bus_tax_perc;
                    payrollemployee_tax_hdr_tbl.vat_perc            = data.vat_perc;
                    payrollemployee_tax_hdr_tbl.exmpt_amt           = data.exmpt_amt;
                   
                   
                }
                message = "success";
                db_pacco.SaveChanges();
               
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: to Generate per Employee
        //////*********************************************************************//

        public ActionResult GenerateByEmployee(string par_empl_id,string par_payroll_year, string par_department_code, string par_history)
        {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl(par_payroll_year, par_empl_id, Session["user_id"].ToString()).ToList();
                db_pacco.SaveChanges();
                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, par_department_code, par_history).ToList();

                message = "success";
                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Delete Action from Database
        ////*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_empl_id, string effective_date)
        {
            try
            {
                string message = "";

                DateTime par_effective_date = Convert.ToDateTime(effective_date);

                var dt = db_pacco.payrollemployee_tax_hdr_tbl.Where(a =>
                               a.effective_date == par_effective_date &&
                               a.empl_id == par_empl_id).FirstOrDefault();

                db_pacco.payrollemployee_tax_hdr_tbl.Remove(dt);

                if (dt == null)
                {
                    message = "fail";
                }

                else
                {
                    message = "success";
                }
                db_pacco.SaveChanges();
                return Json(message, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }


        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cJOTaxRate
            (string par_year
             ,string par_empl_id
             ,string par_empl_name
             ,string par_department
             ,string par_show_entries
             ,string par_page_nbr
             ,string par_search
             ,string par_sort_value
             ,string par_sort_order
             ,string par_position
             ,string par_effective_date
             ,string par_department_code
             ,string par_history
            )
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cJOTaxRate"] = par_year
                                                          + "," + par_empl_id
                                                          + "," + par_department
                                                          + "," + par_show_entries
                                                          + "," + par_page_nbr
                                                          + "," + par_search
                                                          + "," + par_sort_value
                                                          + "," + par_sort_order
                                                          + "," + par_position
                                                          + "," + par_effective_date
                                                          + "," + par_department_code
                                                          + "," + par_history;

            Session["PreviousValuesonPage_cJOTaxRate_empl_name"] = par_empl_name;
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType, string par_year, string par_letter)
        {
            try
            {

                if (par_letter == null)
                { par_letter = ""; }
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_year, par_empType, par_letter).ToList();

                return Json(new { sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveDataListGrid(string pay_payroll_year, string par_department_code, string par_history)
        {
            try
            {

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(pay_payroll_year, par_department_code, par_history).ToList();

                return Json(new { sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
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

                if (par_letter == null)
                { par_letter = ""; }
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_year, par_empType, par_letter).ToList();

                return Json(new { sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
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
                var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list(par_year, par_month, par_template, par_payrolltype, par_employment_type).ToList();
                return Json(new { sp_payrollregistryaccounting_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
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
            return Json(new { reportcount }, JsonRequestBehavior.AllowGet);
        }



    }
}