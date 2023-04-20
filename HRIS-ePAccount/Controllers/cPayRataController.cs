//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Show Payroll Overtime
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
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cPayRataController : Controller
    {
        
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
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
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_empType)
        {

            string userid = Session["user_id"].ToString();
            string[] PreviousValuesonPage_cPayRegistry = Session["PreviousValuesonPage_cPayRegistry"].ToString().Split(new char[] { ',' });

            string ddl_year         = PreviousValuesonPage_cPayRegistry[0].ToString().Trim();
            string ddl_month        = PreviousValuesonPage_cPayRegistry[1].ToString().Trim();
            string ddl_registry_nbr = PreviousValuesonPage_cPayRegistry[2].ToString().Trim();
            string ddl_emp_type     = PreviousValuesonPage_cPayRegistry[3].ToString().Trim();
            string ddl_template     = PreviousValuesonPage_cPayRegistry[4].ToString().Trim();
            string ddl_group        = PreviousValuesonPage_cPayRegistry[5].ToString().Trim();
            string ddl_payrolltype  = PreviousValuesonPage_cPayRegistry[6].ToString().Trim();

            var empType = db_pacco.vw_employmenttypes_tbl_list.Where(a => a.employment_type == ddl_emp_type).ToList();
            var payrolltype = db_pacco.sp_accountingsystemsetup_tbl_list().ToList().Where(a => a.syssetup_type_code == ddl_payrolltype).FirstOrDefault();
            var payroll_template = new object();

            payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == ddl_emp_type && a.payrolltemplate_code == ddl_template).ToList();

            var sp_payrollregistryaccounting_dtl_rata_tbl_list = db_pacco.sp_payrollregistryaccounting_dtl_rata_tbl_list(ddl_year, ddl_month, ddl_registry_nbr, ddl_template, ddl_group, ddl_emp_type).ToList();

            int iMonthNo = Convert.ToInt32(ddl_month.ToString().Trim());
            DateTime dtDate = new DateTime(2000, iMonthNo, 1);

            string sMonthFullName = dtDate.ToString("MMMM");

            ddl_month = sMonthFullName;

            return Json(new { empType, payroll_template, userid, ddl_year, ddl_month, ddl_emp_type, ddl_template, ddl_group, sp_payrollregistryaccounting_dtl_rata_tbl_list, payrolltype }, JsonRequestBehavior.AllowGet);
        }




        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectPayrollGroup(string par_ddl_group, string par_registry_nbr)
        {
            try
            {
                string[] PreviousValuesonPage_cPayRegistry = Session["PreviousValuesonPage_cPayRegistry"].ToString().Split(new char[] { ',' });

                string ddl_year     = PreviousValuesonPage_cPayRegistry[0].ToString().Trim();
                string ddl_month = PreviousValuesonPage_cPayRegistry[1].ToString().Trim();
                string ddl_registry_nbr = par_registry_nbr;
                string ddl_emp_type = PreviousValuesonPage_cPayRegistry[3].ToString().Trim();
                string ddl_template = PreviousValuesonPage_cPayRegistry[4].ToString().Trim();
                string ddl_group = par_ddl_group;

                var sp_payrollregistryaccounting_dtl_rata_tbl_list = db_pacco.sp_payrollregistryaccounting_dtl_rata_tbl_list(ddl_year, ddl_month, ddl_registry_nbr, ddl_template, par_ddl_group, ddl_emp_type).ToList();

                return Json(new { sp_payrollregistryaccounting_dtl_rata_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employee Details
        //*********************************************************************//
        public ActionResult EmployeeDetails(string par_empl_id, double par_no_of_days)
        {
            try
            {
                string[] PreviousValuesonPage_cPayRegistry = Session["PreviousValuesonPage_cPayRegistry"].ToString().Split(new char[] { ',' });

                string ddl_year             = PreviousValuesonPage_cPayRegistry[0].ToString().Trim();
                string ddl_month            = PreviousValuesonPage_cPayRegistry[1].ToString().Trim();
                //string ddl_registry_nbr     = PreviousValuesonPage_cPayRegistry[2].ToString().Trim();
                string ddl_emp_type         = PreviousValuesonPage_cPayRegistry[3].ToString().Trim();
                string ddl_template         = PreviousValuesonPage_cPayRegistry[4].ToString().Trim();
                string ddl_group            = PreviousValuesonPage_cPayRegistry[5].ToString().Trim();
                string ddl_payrolltype      = PreviousValuesonPage_cPayRegistry[6].ToString().Trim();
                
                var sp_personnelnamesaccounting_combolist_rata = db_pacco.sp_personnelnamesaccounting_combolist_rata(ddl_year, ddl_emp_type, ddl_group,ddl_month, ddl_template).ToList().Where(a => a.empl_id == par_empl_id).FirstOrDefault();
                var sp_accountingrata_rate_sked_tbl_list2_v = db_pacco.sp_rata_rate_skedaccounting_tbl_list2(par_no_of_days, "V").ToList();
                return Json(new { sp_personnelnamesaccounting_combolist_rata, sp_accountingrata_rate_sked_tbl_list2_v }, JsonRequestBehavior.AllowGet);
                
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }







        //*********************************************************************//
        //                      E N D     O F     C O D E
        //*********************************************************************//
    }
}