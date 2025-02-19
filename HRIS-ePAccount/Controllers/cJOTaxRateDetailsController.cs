//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Tax Rate Details for Job Order
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
    public class cJOTaxRateDetailsController : Controller
    {

        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
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
            object empl_master_details = new object();

            GetAllowAccess();

           

            string[] PreviousValuesonPage_cJOTaxRate = Session["PreviousValuesonPage_cJOTaxRate"].ToString().Split(new char[] { ',' });

            string year                             = PreviousValuesonPage_cJOTaxRate[0].ToString().Trim();
            string emp_name                         = Session["PreviousValuesonPage_cJOTaxRate_empl_name"].ToString().Trim();
            string empl_id                          = PreviousValuesonPage_cJOTaxRate[1].ToString().Trim();
            string department_name                  = PreviousValuesonPage_cJOTaxRate[2].ToString().Trim();
            string position                         = PreviousValuesonPage_cJOTaxRate[8].ToString().Trim();
            string department_code                  = PreviousValuesonPage_cJOTaxRate[10].ToString().Trim();
            string history                          = PreviousValuesonPage_cJOTaxRate[13].ToString().Trim();
            string effective_date                   = PreviousValuesonPage_cJOTaxRate[9].ToString().Trim();
            string tabindex                         = PreviousValuesonPage_cJOTaxRate[12].ToString().Trim();
            string previouspage_employment_type     = Session["PreviousValuesonPage_cJOTaxRate_employment_type"].ToString().Trim();

            

            try
            {

                var firstindex_id = empl_id[0];

                var sp_payrollemployee_tax_dtl_tbl_list = db_pacco.sp_payrollemployee_tax_dtl_tbl_list(year, empl_id).ToList();

                if (firstindex_id == 'X')
                {
                    var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list_ne(year, department_code, history).Where(a => a.empl_id == empl_id).FirstOrDefault();

                    if (sp_payrollemployee_tax_hdr_tbl_list == null)
                    {
                        throw new Exception("No data found!");
                    }

                    var sp_payrolltemplate_tbl_list7 = db_pacco.sp_payrolltemplate_tbl_list7().ToList();
                    return Json(new { sp_payrollemployee_tax_dtl_tbl_list, sp_payrollemployee_tax_hdr_tbl_list, empl_id, position, year, um, empl_master_details, emp_name, department_name, sp_payrolltemplate_tbl_list7, previouspage_employment_type, icon = "success" }, JsonRequestBehavior.AllowGet);

                }
                else if(tabindex =="2")
                {
                    var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list_rc_phic(year, department_code, history).Where(a => a.empl_id == empl_id && a.effective_date == effective_date).FirstOrDefault();

                    if (sp_payrollemployee_tax_hdr_tbl_list == null)
                    {
                        throw new Exception("No data found!");
                    }

                    var sp_payrolltemplate_tbl_list7 = db_pacco.sp_payrolltemplate_tbl_list7().ToList();

                    return Json(new { sp_payrollemployee_tax_dtl_tbl_list, sp_payrollemployee_tax_hdr_tbl_list, empl_id, position, year, um, empl_master_details, emp_name, department_name, sp_payrolltemplate_tbl_list7, previouspage_employment_type, icon = "success" }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(year, department_code, history).Where(a => a.empl_id == empl_id && a.effective_date == effective_date).FirstOrDefault();

                    if (sp_payrollemployee_tax_hdr_tbl_list == null)
                    {
                        throw new Exception("No data found!");
                    }

                    var sp_payrolltemplate_tbl_list7 = db_pacco.sp_payrolltemplate_tbl_list7().ToList();
                   
                    return Json(new { sp_payrollemployee_tax_dtl_tbl_list, sp_payrollemployee_tax_hdr_tbl_list, empl_id, position, year, um, empl_master_details, emp_name, department_name, sp_payrolltemplate_tbl_list7, previouspage_employment_type, icon = "success" }, JsonRequestBehavior.AllowGet);

                }

                
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                return Json(new { message, icon ="error" }, JsonRequestBehavior.AllowGet);
            }
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
                string message = "";
                var sp_payrollemployee_tax_dtl_tbl_list = db_pacco.sp_payrollemployee_tax_dtl_tbl_list(par_payroll_year, par_empl_id).Where(a => a.voucher_nbr == par_voucher_nbr && a.payroll_year == par_payroll_year).FirstOrDefault();

                if (sp_payrollemployee_tax_dtl_tbl_list != null && par_action == "ADD")
                {
                    message = "fail";
                }

                else if (sp_payrollemployee_tax_dtl_tbl_list == null && par_action == "EDIT")
                {
                    message = "fail";
                }

                else if (sp_payrollemployee_tax_dtl_tbl_list == null && par_action == "DELETE")
                {
                    message = "fail";
                }

                else
                {
                    message = "success";
                }

                return Json(new { message, sp_payrollemployee_tax_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
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
        

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Select EmployeeName
        ////*********************************************************************//
        public ActionResult SaveEDITInDatabase(payrollemployee_tax_dtl_tbl data, string par_action)
        {
            try
            {
                string message = "";
                //db_pacco.annualtax_dtl_tbl.Add(data);
                //db_pacco.SaveChanges();
                //message = "success";
                string[] PreviousValuesonPage_cJOTaxRate = Session["PreviousValuesonPage_cJOTaxRate"].ToString().Split(new char[] { ',' });
                string year = PreviousValuesonPage_cJOTaxRate[0].ToString().Trim();
                string empl_id = PreviousValuesonPage_cJOTaxRate[1].ToString().Trim();
                string effective_date_hdr = PreviousValuesonPage_cJOTaxRate[9].ToString().Trim();

                DateTime effective_date = Convert.ToDateTime(effective_date_hdr.ToString());


                if (par_action == "ADD")
                {
                    payrollemployee_tax_dtl_tbl tbl = new payrollemployee_tax_dtl_tbl();
                    tbl.effective_date          = isCheckDate(effective_date.ToString());
                    tbl.empl_id                 = empl_id;
                    tbl.voucher_nbr             = data.voucher_nbr;
                    tbl.payroll_year            = year;
                    tbl.payroll_month           = data.payroll_month;
                    tbl.payrolltemplate_code    = data.payrolltemplate_code;
                    tbl.pera_ca_amt             = data.pera_ca_amt;
                    tbl.gsis_ps                 = data.gsis_ps;
                    tbl.phic_ps                 = data.phic_ps;
                    tbl.hdmf_ps                 = data.hdmf_ps;
                    tbl.hazard_pay              = data.hazard_pay;
                    tbl.subsistence_allowance   = data.subsistence_allowance;
                    tbl.laundry_allowance       = data.laundry_allowance;
                    tbl.gross_pay               = data.gross_pay;
                    tbl.wtax_amt                = data.wtax_amt;
                    tbl.remarks                 = data.remarks;
                    tbl.rcrd_status             = data.rcrd_status;
                    tbl.acctclass_code          = data.acctclass_code;    

                    db_pacco.payrollemployee_tax_dtl_tbl.Add(tbl);

                }

                else if (par_action == "EDIT")
                {
                    var payrollemployee_tax_dtl_tbl                   = db_pacco.payrollemployee_tax_dtl_tbl.Where(a => a.effective_date == effective_date && a.empl_id == empl_id && a.voucher_nbr == data.voucher_nbr).FirstOrDefault();
                    payrollemployee_tax_dtl_tbl.payroll_month         = data.payroll_month;
                    payrollemployee_tax_dtl_tbl.pera_ca_amt           = data.pera_ca_amt;
                    payrollemployee_tax_dtl_tbl.gsis_ps               = data.gsis_ps;
                    payrollemployee_tax_dtl_tbl.phic_ps               = data.phic_ps;
                    payrollemployee_tax_dtl_tbl.hdmf_ps               = data.hdmf_ps;
                    payrollemployee_tax_dtl_tbl.hazard_pay            = data.hazard_pay;
                    payrollemployee_tax_dtl_tbl.subsistence_allowance = data.subsistence_allowance;
                    payrollemployee_tax_dtl_tbl.laundry_allowance     = data.laundry_allowance;
                    payrollemployee_tax_dtl_tbl.gross_pay             = data.gross_pay;
                    payrollemployee_tax_dtl_tbl.wtax_amt              = data.wtax_amt;
                    payrollemployee_tax_dtl_tbl.remarks               = data.remarks;
                    payrollemployee_tax_dtl_tbl.rcrd_status           = data.rcrd_status;
                    payrollemployee_tax_dtl_tbl.acctclass_code        = data.acctclass_code;

                }
                message = "success";
                db_pacco.SaveChanges();


                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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
                string message = "";
                var dt = db_pacco.payrollemployee_tax_dtl_tbl.Where(a =>
                               a.voucher_nbr == par_voucher_nbr &&
                               a.empl_id == par_empl_id).FirstOrDefault();

                db_pacco.payrollemployee_tax_dtl_tbl.Remove(dt);

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
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType)
        {
            try
            {
                string[] payroll_type = { "07" };
                string[] payrolltemplate_code = { "999", "998", "997", "995", "994", "993" };
                var payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == par_empType && payroll_type.Contains(a.payrolltemplate_type) && payrolltemplate_code.Contains(a.payrolltemplate_code)).ToList();
                return Json(new { payroll_template }, JsonRequestBehavior.AllowGet);
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

        public ActionResult GenerateByEmployee(string par_payroll_year, string par_empl_id)
        {

            try
            {
                string message = "";

                string[] PreviousValuesonPage_cJOTaxRate = Session["PreviousValuesonPage_cJOTaxRate"].ToString().Split(new char[] { ',' });

                string department_code = PreviousValuesonPage_cJOTaxRate[10].ToString().Trim();
                string history = PreviousValuesonPage_cJOTaxRate[11].ToString().Trim();
                string effective_date = PreviousValuesonPage_cJOTaxRate[9].ToString().Trim();


                var sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl(par_payroll_year, par_empl_id, history);
                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, department_code, history).Where(a => a.empl_id == par_empl_id && a.effective_date == effective_date).FirstOrDefault();
                var sp_payrollemployee_tax_dtl_tbl_list = db_pacco.sp_payrollemployee_tax_dtl_tbl_list(par_payroll_year, par_empl_id).ToList();
                db_pacco.SaveChanges();

                message = "success";
                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list, sp_payrollemployee_tax_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        



    }
}