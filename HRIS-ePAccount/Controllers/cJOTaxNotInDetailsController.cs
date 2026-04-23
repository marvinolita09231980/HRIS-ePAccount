
//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for JO Tax - Not In Tax Details
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// MMO                       03/24/2026      Code Creation
//**********************************************************************************

using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cJOTaxNotInDetailsController : Controller
    {
        private readonly string _conn = ConfigurationManager.AppSettings["connetionString_act"];

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

        public ActionResult Index()
        {
            try { return View(); }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : MMO - 03/24/2026
        // Description : Load payroll registry records not in tax details
        //*********************************************************************//
        [HttpPost]
        public ActionResult InitializeData()
        {
            try
            {
                string[] prev = Session["PreviousValuesonPage_cJOTaxNotInDetails"].ToString()
                                    .Split(new char[] { ',' }, 2);
                string payroll_year = prev[0].Trim();
                string empl_id      = prev[1].Trim();

                var list = new List<Dictionary<string, object>>();

                using (var conn = new SqlConnection(_conn))
                using (var cmd  = new SqlCommand("dbo.sp_get_payrollregistry_tax_dtl_missing", conn))
                {
                    cmd.CommandType    = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 0;
                    cmd.Parameters.Add("@empl_id", SqlDbType.VarChar).Value = empl_id;

                    conn.Open();
                    using (var rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            var row = new Dictionary<string, object>();
                            for (int i = 0; i < rdr.FieldCount; i++)
                                row[rdr.GetName(i)] = rdr.IsDBNull(i) ? null : rdr.GetValue(i);
                            list.Add(row);
                        }
                    }
                }

                return JSON(new { message = "success", data = list, empl_id, payroll_year },
                            JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { message = "error", error = ex.Message },
                            JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : MMO - 03/24/2026
        // Description : Generate tax details for the employee
        //*********************************************************************//
        [HttpPost]
        public ActionResult Generate(string par_empl_id, string par_payroll_year)
        {
            try
            {
                string remarks = "";

                using (var conn = new SqlConnection(_conn))
                using (var cmd  = new SqlCommand("dbo.sp_generate_payrollregistry_tax_dtl_missing", conn))
                {
                    cmd.CommandType    = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 0;
                    cmd.Parameters.Add("@empl_id",      SqlDbType.VarChar).Value = par_empl_id;
                    cmd.Parameters.Add("@payroll_year", SqlDbType.VarChar).Value = par_payroll_year;

                    var pRemarks = new SqlParameter("@remarks", SqlDbType.VarChar, 500)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(pRemarks);

                    conn.Open();
                    cmd.ExecuteNonQuery();

                    remarks = pRemarks.Value?.ToString() ?? "";
                }

                // Reload the list after generate
                var list = new List<Dictionary<string, object>>();

                using (var conn = new SqlConnection(_conn))
                using (var cmd  = new SqlCommand("dbo.sp_get_payrollregistry_tax_dtl_missing", conn))
                {
                    cmd.CommandType    = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 0;
                    cmd.Parameters.Add("@empl_id", SqlDbType.VarChar).Value = par_empl_id;

                    conn.Open();
                    using (var rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            var row = new Dictionary<string, object>();
                            for (int i = 0; i < rdr.FieldCount; i++)
                                row[rdr.GetName(i)] = rdr.IsDBNull(i) ? null : rdr.GetValue(i);
                            list.Add(row);
                        }
                    }
                }

                return JSON(new { message = "success", data = list, remarks },
                            JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { message = "error", error = ex.Message },
                            JsonRequestBehavior.AllowGet);
            }
        }
    }
}
