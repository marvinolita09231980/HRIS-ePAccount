//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Annual Tax Details
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
    public class cBIRAnnualizedTaxDetailsController : Controller
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
        public ActionResult InitializeData(string par_empType)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            object empl_master_details = new object();
            
            GetAllowAccess();

            
                string[] PreviousValuesonPage_cBIRAnnualizedTax = Session["PreviousValuesonPage_cBIRAnnualizedTax"].ToString().Split(new char[] { ',' });

                 string year              = PreviousValuesonPage_cBIRAnnualizedTax[0].ToString().Trim();
                 string emp_type_descr    = PreviousValuesonPage_cBIRAnnualizedTax[5].ToString().Trim();
                 string tax_due           = PreviousValuesonPage_cBIRAnnualizedTax[1].ToString().Trim();
                 string tax_rate          = PreviousValuesonPage_cBIRAnnualizedTax[2].ToString().Trim();
                 string empl_id           = PreviousValuesonPage_cBIRAnnualizedTax[3].ToString().Trim();
                 string empl_type         = PreviousValuesonPage_cBIRAnnualizedTax[4].ToString().Trim();
                 string position          = PreviousValuesonPage_cBIRAnnualizedTax[12].ToString().Trim();
                 empl_master_details = db_pacco.vw_personnelnames_tbl_HRIS_ACT.Where(a => a.empl_id == empl_id).FirstOrDefault();
                 var empType = db_pacco.vw_employmenttypes_tbl_list.Where(a => !a.employment_type.Contains("JO")).ToList();
                 var sp_annualtax_dtl_tbl_list = db_pacco.sp_annualtax_dtl_tbl_list(year, empl_id).ToList();
                 var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(year, empl_type, "").Where(a => a.empl_id == empl_id && a.payroll_year == year).FirstOrDefault();

                 var payroll_template = db_pacco.sp_payrolltemplate_tbl_list8(empl_type).ToList();
                 //var payroll_template_list = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == empl_type).ToList();
                 var payroll_template_list = db_pacco.vw_payrolltemplate_tbl_list.ToList();
                 var classification_list = db_pacco.vw_accountclass_tbl.ToList();

            return JSON(new { sp_annualtax_hdr_tbl_list,payroll_template_list, empl_type, payroll_template, sp_annualtax_dtl_tbl_list, empType, empl_id, position, year, emp_type_descr, tax_due, tax_rate, um, empl_master_details, classification_list }, JsonRequestBehavior.AllowGet);

        }
        

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Select Template Type
        //*********************************************************************//
        //public ActionResult SelectTemplateType(string par_year, string par_month, string par_empl_id, string par_templatecode)
        //{
        //    try
        //    {

        //        var sp_voucher_combolist_info3 = db_pacco.sp_voucher_combolist_info3(par_year, par_month, par_empl_id, par_templatecode).ToList();
        //        return Json(new { message = "success", sp_voucher_combolist_info3 }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
        //    }

        //}

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult CheckData(string par_payroll_year, string par_empl_id, string par_action, string par_voucher_nbr)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var sp_annualtax_dtl_tbl_list = db_pacco.sp_annualtax_dtl_tbl_list(par_payroll_year, par_empl_id).Where(a => a.voucher_nbr == par_voucher_nbr && a.payroll_year == par_payroll_year).FirstOrDefault();

                if (sp_annualtax_dtl_tbl_list != null && par_action == "ADD")
                {
                    message = "fail";
                }

                else if (sp_annualtax_dtl_tbl_list == null && par_action == "EDIT")
                {
                    message = "fail";
                }

                else if (sp_annualtax_dtl_tbl_list == null && par_action == "DELETE")
                {
                    message = "fail";
                }

                else
                {
                    message = "success";
                }

                return JSON(new { message, sp_annualtax_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Select EmployeeName
        ////*********************************************************************//
        public ActionResult SaveFromDatabase(annualtax_dtl_tbl data)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                db_pacco.annualtax_dtl_tbl.Add(data);
                db_pacco.SaveChanges();
                message = "success";
            
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException ex)
            {
                string message = DbEntityValidationExceptionError(ex);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }

        }

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Select EmployeeName
        ////*********************************************************************//
        public ActionResult UpdateFromDatabase(annualtax_dtl_tbl data)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var annualtax_dtl_tbl = db_pacco.annualtax_dtl_tbl.Where(a => a.payroll_year == data.payroll_year && a.empl_id == data.empl_id && a.voucher_nbr == data.voucher_nbr).FirstOrDefault();

                if (annualtax_dtl_tbl == null)
                {
                    message = "not_found";
                }

                else
                {
                    annualtax_dtl_tbl.payroll_month         = data.payroll_month;
                    annualtax_dtl_tbl.pera_ca_amt           = data.pera_ca_amt;
                    annualtax_dtl_tbl.gsis_ps               = data.gsis_ps;
                    annualtax_dtl_tbl.phic_ps               = data.phic_ps;
                    annualtax_dtl_tbl.hdmf_ps               = data.hdmf_ps;
                    annualtax_dtl_tbl.hazard_pay            = data.hazard_pay;
                    annualtax_dtl_tbl.subsistence_allowance = data.subsistence_allowance;
                    annualtax_dtl_tbl.laundry_allowance     = data.laundry_allowance;
                    annualtax_dtl_tbl.gross_pay             = data.gross_pay;
                    annualtax_dtl_tbl.wtax_amt              = data.wtax_amt;
                    annualtax_dtl_tbl.remarks               = data.remarks;
                    annualtax_dtl_tbl.rcrd_status           = data.rcrd_status;
                    annualtax_dtl_tbl.acctclass_code        = data.acctclass_code;
                    db_pacco.SaveChanges();
                    message = "success";
                }

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException ex)
            {
                string message = DbEntityValidationExceptionError(ex);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: Delete Action from Database
        //////*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_voucher_nbr, string par_empl_id)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var dt = db_pacco.annualtax_dtl_tbl.Where(a =>
                               a.voucher_nbr == par_voucher_nbr &&
                               a.empl_id == par_empl_id).FirstOrDefault();

                db_pacco.annualtax_dtl_tbl.Remove(dt);

                if (dt == null)
                {
                    message = "fail";
                }

                else
                {
                    message = "success";
                }
                db_pacco.SaveChanges();
                return JSON(message, JsonRequestBehavior.AllowGet);
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
        public ActionResult SelectEmploymentType(string par_empType)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var payroll_template = db_pacco.sp_payrolltemplate_tbl_list8(par_empType).ToList();
                return JSON(new { payroll_template }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var payroll_template = new object();
                return Json(new { ex.Message, payroll_template }, JsonRequestBehavior.AllowGet);
            }

        }
        

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: to Generate per Employee
        //////*********************************************************************//

        public ActionResult GenerateByEmployee(string par_payroll_year, string par_empl_id, string par_emp_type)
        {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";

                var sp_generate_annualized_tax = db_pacco.sp_generate_annualized_tax(par_payroll_year, par_empl_id).FirstOrDefault();
                var sp_annualtax_dtl_tbl_list  = db_pacco.sp_annualtax_dtl_tbl_list(par_payroll_year, par_empl_id).ToList();
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_payroll_year, par_emp_type, "").Where(a => a.empl_id == par_empl_id && a.payroll_year == par_payroll_year).FirstOrDefault();
                db_pacco.SaveChanges();

                message = "success";
                return JSON(new { message, sp_annualtax_dtl_tbl_list,sp_annualtax_hdr_tbl_list}, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Update Annual Tax Header
        //*********************************************************************//
        public ActionResult UpdateTaxHeader(string par_payroll_year, string par_empl_id, string par_emp_type)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";

                var sp_generate_annualized_tax_hdr = db_pacco.sp_generate_annualized_tax_hdr(par_payroll_year, par_empl_id);
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_payroll_year, par_emp_type, "").Where(a => a.empl_id == par_empl_id && a.payroll_year == par_payroll_year).FirstOrDefault();
                db_pacco.SaveChanges();

                message = "success";
                return JSON(new { message, sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }



    }

}