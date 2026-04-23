using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;

namespace HRIS_ePAccount.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class RetrieveReadOnlyDataController : Controller
    {
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        string constring = System.Configuration.ConfigurationManager.AppSettings["connetionString_act"];
        // GET: RetrieveReadOnlyData
        public ActionResult Index()
        {
            return View();
        }

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
        public ActionResult RetrieveDataListGrid(string pay_payroll_year, string par_department_code, string par_history)
        {
            try
            {
                var result = GetPayrollEmployeeTaxHdrList(pay_payroll_year, par_department_code, par_history);
                dynamic rdata = result.Data;
                if (rdata.success)
                {
                    List<PayrollEmployeeTaxHdrModel2> sp_payrollemployee_tax_hdr_tbl_list = (List<PayrollEmployeeTaxHdrModel2>)rdata.data;
                    return Json(new { sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("Errorr fetching data");
                }

                //var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(pay_payroll_year, par_department_code, par_history).ToList();




            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }
        public JsonResult GetPayrollEmployeeTaxHdrList(string payroll_year, string department_code, string include_history)
        {
            var list = new List<PayrollEmployeeTaxHdrModel2>();

            try
            {
                using (SqlConnection conn = new SqlConnection(constring))
                using (SqlCommand cmd = new SqlCommand("sp_payrollemployee_tax_hdr_tbl_list_V2", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 180;

                    cmd.Parameters.Add("@par_payroll_year", SqlDbType.VarChar, 4).Value = payroll_year;
                    cmd.Parameters.Add("@par_department_code", SqlDbType.VarChar, 2).Value = department_code;
                    cmd.Parameters.Add("@par_include_history", SqlDbType.VarChar, 1).Value = include_history;

                    conn.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            list.Add(new PayrollEmployeeTaxHdrModel2
                            {
                                empl_id = dr["empl_id"].ToString(),
                                employee_name = dr["employee_name"].ToString(),
                                employment_type = dr["employment_type"].ToString(),
                                employment_type_descr = dr["employment_type_descr"].ToString(),
                                position_title1 = dr["position_title1"].ToString(),
                                effective_date = dr["effective_date"].ToString(),
                                bir_class = dr["bir_class"].ToString(),
                                bir_class_descr = dr["bir_class_descr"].ToString(),
                                with_sworn = Convert.ToInt32(dr["with_sworn"]),
                                fixed_rate = Convert.ToInt32(dr["fixed_rate"]),
                                with_sworn_descr = dr["with_sworn_descr"].ToString(),
                                fixed_rate_descr = dr["fixed_rate_descr"].ToString(),
                                wi_sworn_perc = Convert.ToDecimal(dr["wi_sworn_perc"]),
                                wo_sworn_perc = Convert.ToDecimal(dr["wo_sworn_perc"]),
                                tax_perc = Convert.ToDecimal(dr["tax_perc"]),
                                total_gross_pay = Convert.ToDecimal(dr["total_gross_pay"]),
                                dedct_status = Convert.ToInt32(dr["dedct_status"]),
                                rcrd_status = dr["rcrd_status"].ToString(),
                                rcrd_status_descr = dr["rcrd_status_descr"].ToString(),
                                user_id_created_by = dr["user_id_created_by"].ToString(),
                                created_dttm = dr["created_dttm"].ToString(),
                                user_id_updated_by = dr["user_id_updated_by"].ToString(),
                                updated_dttm = dr["updated_dttm"].ToString(),
                                w_tax_perc = Convert.ToDecimal(dr["w_tax_perc"]),
                                bus_tax_perc = Convert.ToDecimal(dr["bus_tax_perc"]),
                                vat_perc = Convert.ToDecimal(dr["vat_perc"]),
                                exmpt_amt = Convert.ToDecimal(dr["exmpt_amt"]),
                                vat = Convert.ToDecimal(dr["vat"]),
                                cnt = Convert.ToInt32(dr["cnt"])
                            });
                        }
                    }
                }

                return Json(new { success = true, data = list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
    public class PayrollEmployeeTaxHdrModel2
    {
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string employment_type { get; set; }
        public string employment_type_descr { get; set; }
        public string position_title1 { get; set; }
        public string effective_date { get; set; }
        public string bir_class { get; set; }
        public string bir_class_descr { get; set; }
        public int with_sworn { get; set; }
        public int fixed_rate { get; set; }
        public string with_sworn_descr { get; set; }
        public string fixed_rate_descr { get; set; }
        public decimal wi_sworn_perc { get; set; }
        public decimal wo_sworn_perc { get; set; }
        public decimal tax_perc { get; set; }
        public decimal total_gross_pay { get; set; }
        public int dedct_status { get; set; }
        public string rcrd_status { get; set; }
        public string rcrd_status_descr { get; set; }
        public string user_id_created_by { get; set; }
        public string created_dttm { get; set; }
        public string user_id_updated_by { get; set; }
        public string updated_dttm { get; set; }
        public decimal w_tax_perc { get; set; }
        public decimal bus_tax_perc { get; set; }
        public decimal vat_perc { get; set; }
        public decimal exmpt_amt { get; set; }
        public decimal vat { get; set; }
        public int cnt { get; set; }
    }
}