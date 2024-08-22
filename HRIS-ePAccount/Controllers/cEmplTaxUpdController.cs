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

namespace HRIS_ePAccount.Controllers
{
    public class cEmplTaxUpdController : Controller
    {
        // GET: cEmplTaxUpd
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
            

            GetAllowAccess();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var sp_generate_annualtax_tax_rece = new object();
            var sp_generate_payrollemployee_tax_hdr_dtl = new object();
            try
            {
                if (par_empType == "RC")
                {

                    sp_generate_annualtax_tax_rece = db_pacco.sp_generate_annualtax_tax_rece(par_year, Session["user_id"].ToString()).FirstOrDefault();
                    icon = "success";
                }

                else if (par_empType == "JO")
                {
                    sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl(par_year, "", Session["user_id"].ToString()).FirstOrDefault();
                    icon = "success";
                }
                else if (par_empType == "NE")
                {
                    sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_dtl_ne_phic(par_year, "", Session["user_id"].ToString()).FirstOrDefault();
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
}