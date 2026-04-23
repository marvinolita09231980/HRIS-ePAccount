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
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cRemitAutoGenController : Controller
    {
        // GET: cRemitAutoGen
        
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();

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
        //public ActionResult GenerateRemittance(string par_year,string par_month, string par_empType,string par_remittance_type,int par_batch_nbr)
        //{
        //    db_pacco.Database.CommandTimeout = int.MaxValue;
        //    var generation_result = db_pacco.sp_generate_remittance(par_year,par_month,par_empType,par_remittance_type,Session["user_id"].ToString(),par_batch_nbr).ToList();

        //    return Json(new { generation_result }, JsonRequestBehavior.AllowGet);
        //}
        public ActionResult GenerateRemittance(string par_year, string par_month, string par_empType, string par_remittance_type, int par_batch_nbr)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;

            string userId = Session["user_id"].ToString();
            string spName;

            // ---------------------------------------------------------------
            // Route to the correct stored procedure based on remittance type.
            // This replaces the wrapper proc sp_generate_remittance which used
            // INSERT INTO @result_tbl EXEC ... (caused Msg 3930 & Msg 8623).
            // Calling the inner procs directly avoids the implicit transaction
            // created by INSERT...EXEC.
            // ---------------------------------------------------------------
            switch (par_remittance_type)
            {
                case "01": // GSIS Premiums and Loans
                    spName = "sp_generate_remittance_GSIS";
                    break;

                case "02": // HDMF Premiums
                case "03": // HDMF Multi Purpose Loan
                case "04": // HDMF Calamity
                case "05": // HDMF MP2
                case "06": // HDMF Housing
                    spName = "sp_generate_remittance_HDMF";
                    break;

                case "07": // PHIC Premiums
                    spName = "sp_generate_remittance_PHIC";
                    break;

                case "08": // SSS Premiums
                    spName = "sp_generate_remittance_SSS";
                    break;

                case "09": // One Network Bank
                case "10": // Nico Loan
                case "11": // CCMPC
                case "12": // Phil-Am Life
                case "13": // NHMFC
                case "17": // Tagum Coop
                case "18": // JO Uniform
                case "19": // Medical Allowance
                case "20": // Mortuary
                    spName = "sp_generate_remittance_OTHERS";
                    break;

                case "14": // TAX Remittances
                    if (par_empType == "NE")
                        spName = "sp_generate_remittance_TAX_NE";
                    else if (par_empType == "PR" || par_empType == "PC")
                        spName = "sp_generate_remittance_rc_phicshare_TAX";
                    else
                        spName = "sp_generate_remittance_TAX";
                    break;

                case "15": // CNA Remittances
                    spName = "sp_generate_remittance_CNA";
                    break;

                case "16": // LBP Remittances
                    spName = "sp_generate_remittance_LBP";
                    break;

                default:
                    return Json(new
                    {
                        generation_result = new[]
                        {
                    new { result_value = "X", result_value_descr = "Invalid Remittance Type Code: " + par_remittance_type }
                }
                    }, JsonRequestBehavior.AllowGet);
            }

            try
            {
                // ---------------------------------------------------------------
                // Call the stored procedure directly using SqlQuery.
                // No wrapper proc = no INSERT...EXEC = no implicit transaction.
                //
                // SSS (08) and LBP (16) require the extra @p_batch_nbr parameter.
                // All others use the standard 5-parameter signature.
                // ---------------------------------------------------------------
                List<RemittanceResult> generation_result;

                if (par_remittance_type == "08" || par_remittance_type == "16")
                {
                    generation_result = db_pacco.Database.SqlQuery<RemittanceResult>(
                        "EXEC " + spName + " @p_remittance_year, @p_remittance_month, @p_employment_type, @p_remittancetype_code, @p_user_id_created_by, @p_batch_nbr",
                        new SqlParameter("@p_remittance_year", par_year),
                        new SqlParameter("@p_remittance_month", par_month),
                        new SqlParameter("@p_employment_type", par_empType),
                        new SqlParameter("@p_remittancetype_code", par_remittance_type),
                        new SqlParameter("@p_user_id_created_by", userId),
                        new SqlParameter("@p_batch_nbr", par_batch_nbr)
                    ).ToList();
                }
                else
                {
                    generation_result = db_pacco.Database.SqlQuery<RemittanceResult>(
                        "EXEC " + spName + " @p_remittance_year, @p_remittance_month, @p_employment_type, @p_remittancetype_code, @p_user_id_created_by",
                        new SqlParameter("@p_remittance_year", par_year),
                        new SqlParameter("@p_remittance_month", par_month),
                        new SqlParameter("@p_employment_type", par_empType),
                        new SqlParameter("@p_remittancetype_code", par_remittance_type),
                        new SqlParameter("@p_user_id_created_by", userId)
                    ).ToList();
                }

                return Json(new { generation_result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var generation_result = new[]
                {
            new { result_value = "N", result_value_descr = "Remittance Ledger Not Generated: " + ex.Message }
        };
                return Json(new { generation_result }, JsonRequestBehavior.AllowGet);
            }
        }

        // ---------------------------------------------------------------
        // Model class to map the stored procedure result set.
        // All inner procs return: result_value VARCHAR(1), result_value_descr VARCHAR(255)
        // ---------------------------------------------------------------
        public class RemittanceResult
        {
            public string result_value { get; set; }
            public string result_value_descr { get; set; }
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