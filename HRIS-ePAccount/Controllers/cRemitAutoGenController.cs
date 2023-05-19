//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Remittance Auto Generation
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Joseph M. Tombo Jr       10/18/2019      Code Creation
//**********************************************************************************
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using HRIS_ePAccount.Models;

namespace HRIS_ePAccount.Controllers
{
    public class cRemitAutoGenController : Controller
    {
        // GET: cRemitAutoGen
        
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();

        public ActionResult Index()
        {
            //User ID validation, redirection to login when session user id is not set
            if (Session["user_id"] == null || Session["user_id"].ToString() == "" )
            {
                return RedirectToAction("Index", "Login");
            }
            return View();
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 10/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult initializeData(string par_empType)
        {
            var empType = db_pacco.sp_employmenttypes_tbl_list4().ToList();
            var sp_remittance = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();
            return Json(new { sp_remittance, empType}, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 10/19/2019
        // Description : Occure when selected employment type change
        //*********************************************************************//
        public ActionResult SelectedEmploymentType_Change(string par_empType)
        {
            var sp_remittance = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();
            return Json(new { sp_remittance }, JsonRequestBehavior.AllowGet);
        }


        //*********************************************************************//
        // Created By : JMTJR - Created Date : 10/19/2019
        // Description : This will occure and perform the stored procedure that 
        //               generate the remittance by each filter...
        //*********************************************************************//
        public ActionResult GenerateRemittance(string par_year,string par_month, string par_empType,string par_remittance_type,int par_batch_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var generation_result = db_pacco.sp_generate_remittance(par_year,par_month,par_empType,par_remittance_type,Session["user_id"].ToString(),par_batch_nbr).ToList();
            return Json(new { generation_result }, JsonRequestBehavior.AllowGet);
        }

        /*********************************************************************/
        // Created By : JRV - Created Date : 10/08/2020
        // Description : For MONTHLY TAX PRINTING
        //*********************************************************************//
        public ActionResult PrintBIRMonthly()
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        }
    }
}                  