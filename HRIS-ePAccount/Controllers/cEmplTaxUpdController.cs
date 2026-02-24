//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Remittance Auto Generation
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA   04/28/2020      Code Creation
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
using System.Data.SqlClient;

namespace HRIS_ePAccount.Controllers
{
    public class cEmplTaxUpdController : Controller
    {
        // GET: cEmplTaxUpd
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
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
        public ActionResult GenerateTax(string par_year, string par_empType)
        {
            string icon = "";
            int episode = 0; 
            var user_id = Session["user_id"].ToString();
            GetAllowAccess();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var sp_generate_annualtax_tax_rece = new object();
            var sp_generate_payrollemployee_tax_hdr_dtl = new object();
            try
            {    
                if(par_empType == "RE" || par_empType == "CE")
                {
                    string currentMonth = DateTime.Now.ToString("MM");
                    var ep = db_pacco.generate_tax_empl_dtl_success_tbl
                            .Where(a => a.payroll_year == par_year
                                     && a.employment_type == par_empType
                                     && a.payroll_month == currentMonth);
                 

                    var res = db_pacco.Database.SqlQuery<TaxGenResult>(
                        "EXEC dbo.sp_run_tax_generation_loop @p_payroll_year,@p_employment_type,@payroll_month,@p_empl_id,@firstgenoftheyear,@removeprojected",
                        new SqlParameter("@p_payroll_year", par_year),
                        new SqlParameter("@p_employment_type", par_empType),
                        new SqlParameter("@payroll_month", currentMonth),
                        new SqlParameter("@p_empl_id", ""),
                        new SqlParameter("@firstgenoftheyear", false),
                        new SqlParameter("@removeprojected", false)
                    ).FirstOrDefault();

                }           
                else if (par_empType == "RC")
                {

                    sp_generate_annualtax_tax_rece = db_pacco.sp_generate_annualtax_tax_rece(par_year, user_id).FirstOrDefault();
                    icon = "success";
                }

                else if (par_empType == "JO")
                {
                    sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl(par_year, "", user_id).FirstOrDefault();
                    icon = "success";
                }
                else if (par_empType == "NE")
                {
                    sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl_ne(par_year, "", user_id).FirstOrDefault();
                    icon = "success";
                }
                else if (par_empType == "RX")
                {
                    sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl_rc_phic(par_year, "", user_id).FirstOrDefault() ;
                    icon = "success";
                }
                else
                {
                    icon = "error";
                }



                return JSON(new { icon, sp_generate_annualtax_tax_rece, sp_generate_payrollemployee_tax_hdr_dtl }, JsonRequestBehavior.AllowGet);
            }
            catch(Exception ex)
            {
                icon = "error";
                var message = ex.Message;
                return JSON(new { message, icon }, JsonRequestBehavior.AllowGet);
            }

        }
        public ActionResult GenerateTaxLaterNight(string par_year, string par_empType)
        {
            string message = "";


            GetAllowAccess();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var sp_generate_annualtax_tax_rece = new object();
            var sp_generate_payrollemployee_tax_hdr_dtl = new object();
            if (par_empType == "RC")
            {

                sp_generate_annualtax_tax_rece = db_pacco.sp_generate_annualtax_tax_rece_laternight(par_year, Session["user_id"].ToString()).FirstOrDefault();
                message = "success";
            }

            else if (par_empType == "JO")
            {
                sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl(par_year, "", Session["user_id"].ToString()).FirstOrDefault();
                message = "success";
            }

            else
            {
                message = "fail";
            }


            return JSON(new { um, message, sp_generate_annualtax_tax_rece, sp_generate_payrollemployee_tax_hdr_dtl }, JsonRequestBehavior.AllowGet);

        }
    }

    public class TaxGenResult
    {
        public bool success { get; set; }
        public int processed_count { get; set; }
        public string result_msg { get; set; }
    }
}