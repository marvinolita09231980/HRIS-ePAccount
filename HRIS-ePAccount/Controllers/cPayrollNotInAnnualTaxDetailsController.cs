using HRIS_ePAccount.Filter;
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers            
{
    [SessionExpire]
    public class cPayrollNotInAnnualTaxDetailsController : Controller
    {
        private readonly HRIS_ACTEntities db_pacco;
        private string connection_string = ConfigurationManager.AppSettings["connetionstring_act"];
        private readonly string _conn;


        public cPayrollNotInAnnualTaxDetailsController()
        {
            db_pacco = new HRIS_ACTEntities();
            // Read connection string safely - fallback to first entry or empty if not found to avoid NullReferenceException
            try
            {
                var cs = ConfigurationManager.ConnectionStrings["DefaultConnection"];
                if (cs != null && !string.IsNullOrEmpty(cs.ConnectionString))
                {
                    _conn = cs.ConnectionString;
                }
                else if (ConfigurationManager.ConnectionStrings.Count > 0)
                {
                    _conn = ConfigurationManager.ConnectionStrings[0].ConnectionString ?? string.Empty;
                }
                else
                {
                    _conn = string.Empty;
                }
            }
            catch
            {
                _conn = string.Empty;
            }
        }

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
            try
            {
                return View();
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // Lightweight DTO returned to client (add/remove fields to match your actual table/sp)
        public class PayrollNotInAnnualDto
        {
            public string payroll_year { get; set; }
            public string empl_id { get; set; }
            public string voucher_nbr { get; set; }
            public string payroll_month { get; set; }
            public decimal basic_sal { get; set; }
            public decimal wtax_amt { get; set; }
            public string remarks { get; set; }
        }

        // Called by client when opening cPayrollNotInAnnualTaxDetails view.
        // It mirrors the InitializeData pattern used by cBIRAnnualizedTaxDetails:
        // - will try to read any previously saved context from Session (set by cBIRAnnualizedTax.PreviousValuesonPage...)
        // - falls back to provided parameters (optional)
        [HttpPost]
        public ActionResult InitializeData(string par_payroll_year = null, string par_empl_id = null)
        {
                var map = new Dictionary<string, string>
                {
                    { "RE", "Regular" },
                    { "CE", "Casual" },
                    { "JO", "Job Order" }
                };
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                object empl_master_details = new object();
                string[] PreviousValuesonPage_cBIRAnnualizedTax = Session["PreviousValuesonPage_cBIRAnnualizedTax"].ToString().Split(new char[] { ',' });

                string year = PreviousValuesonPage_cBIRAnnualizedTax[0].ToString().Trim();
                string emp_type_descr = PreviousValuesonPage_cBIRAnnualizedTax[5].ToString().Trim();
                
                string empl_id = PreviousValuesonPage_cBIRAnnualizedTax[3].ToString().Trim();
                string empl_type = PreviousValuesonPage_cBIRAnnualizedTax[4].ToString().Trim();
                string position = PreviousValuesonPage_cBIRAnnualizedTax[12].ToString().Trim();
                empl_master_details = db_pacco.vw_personnelnames_tbl_HRIS_ACT.Where(a => a.empl_id == empl_id).FirstOrDefault();

                string empType;
                if (!map.TryGetValue(empl_type, out empType))
                {
                    empType = "";
                }

                var list = db_pacco.payroll_not_in_annual_dtl.Where(a => a.empl_id == empl_id && a.payroll_year == year);

                

                // Return payload shaped similar to cBIRAnnualizedTaxDetails InitializeData response (adjust names as needed)
                return Json(new
                {
                    message = "success",
                    sp_annualtax_dtl_tbl_list = list,
                    payroll_year = year,
                    empl_id,
                    emp_type_descr,
                    empType,
                    position,
                    empl_master_details

                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                // Log exception as appropriate for your project
                return Json(new { message = "error", error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // Lightweight GET used by the simple Index view / client examples
        [HttpGet]
        public ActionResult GetPayrollNotInAnnual(string par_payroll_year, string par_empl_id)
        {
            // delegate to InitializeData for same behavior
            return InitializeData(par_payroll_year, par_empl_id);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db_pacco?.Dispose();
            }
            base.Dispose(disposing);
        }

       
        public ActionResult GeneratePayrollNotInAnnual(string payroll_year, string empl_id)
        {
            try
            {
                string resultValue = "";
                string resultMsg = "";
                

                using (var conn = new SqlConnection(connection_string))
                using (var cmd = new SqlCommand("dbo.sp_generate_payroll_not_in_annual_dtl", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 0;

                    cmd.Parameters.Add("@p_payroll_year", SqlDbType.VarChar, 4).Value = payroll_year;
                    cmd.Parameters.Add("@p_empl_id", SqlDbType.VarChar, 10).Value = empl_id ?? "";

                    var pResultValue = new SqlParameter("@result_value", SqlDbType.VarChar, 1)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(pResultValue);

                    var pResultMsg = new SqlParameter("@result_msg", SqlDbType.VarChar, 500)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(pResultMsg);

                    conn.Open();
                    cmd.ExecuteNonQuery();

                    resultValue = pResultValue.Value?.ToString();
                    resultMsg = pResultMsg.Value?.ToString();
                }

                var list = db_pacco.payroll_not_in_annual_dtl.Where(a => a.empl_id == empl_id && a.payroll_year == payroll_year);

                return Json(new
                {
                    icon = resultValue == "Y" ? "success" : "error",
                    message = resultMsg,
                    sp_annualtax_dtl_tbl_list = list,
                }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException ex)
            {
                var errors = ex.EntityValidationErrors
                    .SelectMany(e => e.ValidationErrors)
                    .Select(e => e.PropertyName + " : " + e.ErrorMessage)
                    .ToList();

                return Json(new
                {
                    error = "Validation failed",
                    details = errors
                }, JsonRequestBehavior.AllowGet);
            }
            //catch (Exception ex)
            //{
            //    return Json(new
            //    {
            //        icon = "error",
            //        message = ex.Message
            //    });
            //}
        }


    }
}
