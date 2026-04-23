

//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Annual Tax Header
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
using System.Configuration;
using System.Data;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Transactions;
using System.Web.Mvc;



namespace HRIS_ePAccount.Controllers
{

   
    public class cJOTaxRateController : Controller
    {

        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        string constring = System.Configuration.ConfigurationManager.AppSettings["connetionString_act"];
        HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
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
        public ActionResult InitializeData(string par_payroll_year)
        {
            object payroll_template = new object();
            db_pacco.Database.CommandTimeout = int.MaxValue;
            GetAllowAccess();
            var taxrate_percentage_tbl_list = db_pacco.taxrate_percentage_tbl.ToList();
            if (Session["PreviousValuesonPage_cJOTaxRate"] == null)
            {
                Session["PreviousValuesonPage_cJOTaxRate"] = null;
                int sort_value = 1;
                int page_value = 0;
                string sort_order = "asc";
                string show_entries = "5";
                string ddl_emp_type = "";
                string department_code = "";
                var empType = db_pacco.vw_employmenttypes_tbl_list.Where(a => !a.employment_type.Contains("JO")).ToList();
                var bir_class_list = db_pacco.sp_jo_tax_tbl_list().ToList();

                var department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);
                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, "", "").ToList();

                

                SaveJoTaxJobParams(par_payroll_year);

                return JSON(new { empType, ddl_emp_type, sp_payrollemployee_tax_hdr_tbl_list, sort_value, page_value, sort_order, show_entries, um, department_list, bir_class_list, taxrate_percentage_tbl_list, department_code }, JsonRequestBehavior.AllowGet);

            }


            else
            {
                string[] PreviousValuesonPage_cJOTaxRate = Session["PreviousValuesonPage_cJOTaxRate"].ToString().Split(new char[] { ',' });

                string ddl_year = PreviousValuesonPage_cJOTaxRate[0].ToString().Trim();
                string department_code = PreviousValuesonPage_cJOTaxRate[10].ToString().Trim();
                string history = PreviousValuesonPage_cJOTaxRate[11].ToString().Trim();
                string show_entries = PreviousValuesonPage_cJOTaxRate[3].ToString().Trim();
                int page_value = Convert.ToInt32(PreviousValuesonPage_cJOTaxRate[4].ToString().Trim());
                string search_value = PreviousValuesonPage_cJOTaxRate[5].ToString().Trim();
                int sort_value = Convert.ToInt32(PreviousValuesonPage_cJOTaxRate[6].ToString().Trim());
                string sort_order = PreviousValuesonPage_cJOTaxRate[7].ToString().Trim();
                var bir_class_list = db_pacco.sp_jo_tax_tbl_list().ToList();
                var department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);


                var sp_payrollemployee_tax_hdr_tbl_list = GetPayrollEmployeeTaxHdrList(ddl_year, department_code, history);
                SaveJoTaxJobParams(ddl_year);

                return JSON(new { department_list, department_code, sp_payrollemployee_tax_hdr_tbl_list, ddl_year, show_entries, page_value, search_value, sort_value, sort_order, um, bir_class_list, history, taxrate_percentage_tbl_list }, JsonRequestBehavior.AllowGet);


            }

        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//

        public ActionResult RetrieveEmployeeList(string par_payroll_year, string par_department_code)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var sp_personnelnames_combolist_tax_jo = db_pacco.sp_personnelnames_combolist_tax_jo_nogrosspay(par_payroll_year, par_department_code).ToList();



                return Json(new { message = "success", sp_personnelnames_combolist_tax_jo }, JsonRequestBehavior.AllowGet);
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
        public ActionResult CheckData(string par_payroll_year, string par_department_code, string par_history, string par_action, string par_empl_id, string par_effective_date)
        {
            try
            {

                if (!DateTime.TryParse(par_effective_date, out DateTime effDate))
                {
                    throw new Exception("Invalid effective date format.");
                }

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.payrollemployee_tax_hdr_tbl.Where(a => a.empl_id == par_empl_id && a.effective_date == effDate).FirstOrDefault();

                if (sp_payrollemployee_tax_hdr_tbl_list != null && par_action == "ADD")
                {
                    throw new Exception("Employee tax record with the same effective date already exist");
                }

                else if (sp_payrollemployee_tax_hdr_tbl_list == null && par_action == "EDIT")
                {
                    throw new Exception("Employee tax record did not exist, there is nothing to update!");


                }

                else if (sp_payrollemployee_tax_hdr_tbl_list == null && par_action == "DELETE")
                {

                    throw new Exception("Employee tax record did not exist, there is nothing to delete!");
                }


                var message = "success";

                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
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

        //*************************************************************************
        //  BEGIN - JRV- 09/20/2018 - Retrieve back end data and load to GridView
        //*************************************************************************
        public ActionResult GetTaxRate(string par_payroll_year, string par_empl_id)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            var bir_class = db_pacco.sp_getemployee_tax_rate(par_payroll_year, par_empl_id).FirstOrDefault();
            return Json(new { bir_class, message = "success" }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Retrieves the vat_value from the row with the latest effective_date
        /// for an employee, where status = 1.
        /// </summary>
        /// <param name="emplId">The employee ID.</param>
        /// <returns>The vat_value of the most recent active record, or null if none exists.</returns>
        public decimal? GetEmployeeVatValue(string emplId)
        {
            const string query = @"
                    SELECT TOP 1 C.vat_value
                    FROM vat_empl_tbl C
                    WHERE C.empl_id = @empl_id
                      AND C.status  = 1
                    ORDER BY C.effective_date DESC";

           

            using (SqlConnection conn = new SqlConnection(constring))
            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.CommandType = CommandType.Text;
                cmd.CommandTimeout = int.MaxValue;

                cmd.Parameters.Add("@empl_id", SqlDbType.VarChar, 20).Value = emplId;

                conn.Open();
                object result = cmd.ExecuteScalar();

                if (result == null || result == DBNull.Value)
                    return null;

                return Convert.ToDecimal(result);
            }
        }

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: Select EmployeeName
        //////*********************************************************************//
        public ActionResult SaveEDITInDatabase(
            payrollemployee_tax_hdr_tbl data,
            string par_effective_date,
            string par_empl_id,
            string par_action,
            string par_payroll_year,
            string par_department_code)
        {
            try
            {
                var user_id = Session["user_id"].ToString();
                var now = DateTime.Now;
                var currentDate = now.Date;
                int year = DateTime.Now.Year;
                DateTime datetimenow = DateTime.Now;

                // Single DB call for gross pay
                var gp = db_pacco.sp_get_jo_grosspay_birclass(par_payroll_year, par_empl_id)
                                 .FirstOrDefault();
                decimal gross_vat = 0;
                decimal? vat = GetEmployeeVatValue(par_empl_id);
                if(vat == null)
                {
                    gross_vat = (decimal)gp.total_gross_pay;
                }
                else
                {
                    gross_vat = ((decimal)gp.total_gross_pay / (decimal)vat);
                }

                    db_pacco.payrollemployee_tax_hdr_tbl.Add(new payrollemployee_tax_hdr_tbl
                    {
                        empl_id = data.empl_id,
                        effective_date = datetimenow,
                        bir_class = data.bir_class,
                        with_sworn = isCheckBool(data.with_sworn.ToString()),
                        fixed_rate = isCheckBool(data.fixed_rate.ToString()),
                        total_gross_pay = gp.total_gross_pay,
                        dedct_status = isCheckBool(data.dedct_status.ToString()),
                        rcrd_status = "N",
                        user_id_created_by = user_id,
                        created_dttm = now,
                        user_id_updated_by = "",
                        updated_dttm = new DateTime(1900, 1, 1),
                        w_tax_perc = data.w_tax_perc,
                        bus_tax_perc = data.bus_tax_perc,
                        vat_perc = data.vat_perc,
                        exmpt_amt = data.exmpt_amt,
                        grosspay_without_vat = gross_vat
                    });

                    SaveOrUpdateJoTaxQueue(par_empl_id, par_payroll_year, par_department_code, user_id, "ADD");
                
                

                 db_pacco.SaveChanges();

                return Json(new { message = "success", gp }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException ex)
            {
                var errors = ex.EntityValidationErrors
                    .SelectMany(e => e.ValidationErrors)
                    .Select(e => e.PropertyName + " : " + e.ErrorMessage)
                    .ToList();

                return Json(new { error = "Validation failed", details = errors }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public string SaveOrUpdateJoTaxQueue(
        string empl_id,
        string payroll_year,
        string department_code,
        string requested_by,
        string action
        )
        {
            var rec = db_pacco.jo_tax_generation_queue_tbl
                .FirstOrDefault(x =>
                    x.empl_id == empl_id &&
                    x.payroll_year == payroll_year &&
                    x.department_code == department_code &&
                    (x.status == "PENDING" || x.status == "RUNNING")
                );

            if (action == "DELETE")
            {
                if (rec != null)
                {
                    db_pacco.jo_tax_generation_queue_tbl.Remove(rec);
                    db_pacco.SaveChanges();
                }
                return "deleted";
            }

            if (rec == null)
            {
                db_pacco.jo_tax_generation_queue_tbl.Add(new jo_tax_generation_queue_tbl
                {
                    empl_id = empl_id,
                    payroll_year = payroll_year,
                    department_code = department_code,
                    requested_by = requested_by,
                    status = "PENDING",
                    requested_at = DateTime.Now
                });
                db_pacco.SaveChanges();
                return "inserted";
            }

            rec.requested_by = requested_by;
            rec.department_code = department_code;
            rec.status = "PENDING";
            rec.requested_at = DateTime.Now;
            rec.error_message = null;

            db_pacco.SaveChanges();
            return "updated";
        }



        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: to Generate per Employee
        //////*********************************************************************//

        public ActionResult GenerateByEmployee(string par_empl_id, string par_payroll_year, string par_department_code, string par_history)
        {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl(par_payroll_year, par_empl_id, Session["user_id"].ToString()).ToList();
                db_pacco.SaveChanges();
                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, par_department_code, par_history).ToList();

                message = "success";
                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By : JRV - Created Date : 03/13/2026
        // Description: Generate JO Tax for ALL employees via sp_generate_payroll_JO_tax_dtl_hdr (empl_id empty)
        //*********************************************************************//
        public ActionResult GenerateAllJOTax(string par_payroll_year, string par_department_code, string par_history)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;

                string result_msg = "";

                using (SqlConnection conn = new SqlConnection(constring))
                {

                    SqlCommand cmd = new SqlCommand("sp_generate_payroll_JO_tax_dtl_hdr", conn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.CommandTimeout = int.MaxValue;
                    cmd.Parameters.AddWithValue("@p_payroll_year", par_payroll_year);
                    cmd.Parameters.AddWithValue("@p_empl_id", "");
                    cmd.Parameters.AddWithValue("@p_user_id", Session["user_id"].ToString());

                    conn.Open();
                    cmd.ExecuteNonQuery();


                }




                return Json(new { message = "success", result_msg = "JO Tax rate successfully generated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = "error", result_msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/13/2026
        // Description: Generate JO Tax Header and Detail via sp_generate_payroll_JO_tax_dtl_hdr
        //*********************************************************************//
        public ActionResult GenerateJOTax(string par_empl_id, string par_payroll_year, string par_department_code, string par_history)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";

                using (SqlConnection conn = new SqlConnection(constring))
                {
                    SqlCommand cmd = new SqlCommand("sp_generate_payroll_JO_tax_dtl_hdr", conn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.CommandTimeout = int.MaxValue;
                    cmd.Parameters.AddWithValue("@p_payroll_year", par_payroll_year);
                    cmd.Parameters.AddWithValue("@p_empl_id", par_empl_id);
                    cmd.Parameters.AddWithValue("@p_user_id", Session["user_id"].ToString());
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, par_department_code, par_history).ToList();
                message = "success";
                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Delete Action from Database
        ////*********************************************************************//


        public ActionResult DeleteFromDatabase(string par_empl_id, string effective_date)
        {
            try
            {
                string message = "";
                DateTime par_effective_date = DateTime.Parse(effective_date);

                using (var scope = new TransactionScope(
                    TransactionScopeOption.Required,
                    new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted },
                    TransactionScopeAsyncFlowOption.Enabled))
                {
                    var tx = db_pay.payrollemployee_tax_tbl
                        .FirstOrDefault(a => a.effective_date == par_effective_date && a.empl_id == par_empl_id);

                    if (tx != null && tx.rcrd_status == "A")
                        throw new Exception("Cannot delete, tax record already approved!");

                    var dt = db_pacco.payrollemployee_tax_hdr_tbl
                        .FirstOrDefault(a => a.effective_date == par_effective_date && a.empl_id == par_empl_id);

                    if (dt == null)
                        throw new Exception("Deletion failed!");

                    db_pacco.payrollemployee_tax_hdr_tbl.Remove(dt);
                    if (tx != null) db_pay.payrollemployee_tax_tbl.Remove(tx);

                    // Save BOTH
                    db_pay.SaveChanges();
                    db_pacco.SaveChanges();

                    scope.Complete();
                }

                message = "success";
                return Json(new { message, icon = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = ex.Message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }



        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cJOTaxRate
                (string par_year
                 , string par_empl_id
                 , string par_empl_name
                 , string par_department
                 , string par_show_entries
                 , string par_page_nbr
                 , string par_search
                 , string par_sort_value
                 , string par_sort_order
                 , string par_position
                 , string par_effective_date
                 , string par_department_code
                 , string par_history
                )
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cJOTaxRate"] = par_year
                                                          + "," + par_empl_id
                                                          + "," + par_department
                                                          + "," + par_show_entries
                                                          + "," + par_page_nbr
                                                          + "," + par_search
                                                          + "," + par_sort_value
                                                          + "," + par_sort_order
                                                          + "," + par_position
                                                          + "," + par_effective_date
                                                          + "," + par_department_code
                                                          + "," + par_history;

            Session["PreviousValuesonPage_cJOTaxRate_empl_name"] = par_empl_name;
            Session["PreviousValuesonPage_cJOTaxRate_employment_type"] = "JO";
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : MMO
        // Description : Save context for JO Tax Not-In-Details drill-down
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cJOTaxNotInDetails(string par_empl_id, string par_year)
        {
            Session["PreviousValuesonPage_cJOTaxNotInDetails"] = par_year + "," + par_empl_id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType, string par_year, string par_letter)
        {
            try
            {

                if (par_letter == null)
                { par_letter = ""; }
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_year, par_empType, par_letter).ToList();

                return Json(new { sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
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
        public ActionResult RetrieveDataListGrid(string pay_payroll_year, string par_department_code, string par_history)
        {
            try
            {
                var sp_payrollemployee_tax_hdr_tbl_list = GetPayrollEmployeeTaxHdrList(pay_payroll_year, par_department_code, par_history);
                return Json(new { sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SelectLetter(string par_empType, string par_year, string par_letter)
        {
            try
            {

                if (par_letter == null)
                { par_letter = ""; }
                var sp_annualtax_hdr_tbl_list = db_pacco.sp_annualtax_hdr_tbl_list(par_year, par_empType, par_letter).ToList();

                return Json(new { sp_annualtax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SelectYear(string par_year, string par_month, string par_template, string par_payrolltype, string par_employment_type)
        {
            try
            {
                var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list(par_year, par_month, par_template, par_payrolltype, par_employment_type).ToList();
                return Json(new { sp_payrollregistryaccounting_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description : Print Employees 2316
        ////*********************************************************************//
        public ActionResult ReportCount(string par_payroll_year, string par_empl_id, string par_period_from, string par_period_to)
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            var reportcount = db_pacco.sp_annualtax_hdr_tbl_rep(par_payroll_year, par_empl_id).ToList();
            return Json(new { reportcount }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/03/2026
        // Modified   : JRV - 03/05/2026 - True DB-level pagination via
        //              sp_payrollemployee_tax_hdr_tbl_list_paged.
        //              Filtering, sorting and OFFSET/FETCH now happen inside
        //              SQL Server; only the current page is returned.
        //*********************************************************************//
        [HttpPost]
        public ActionResult GetDataTableServerSide(
            int draw, int start, int length,
            string search_value,
            int order_column, string order_dir,
            string par_payroll_year, string par_department_code, string par_history)
        {
            try
            {
                if (string.IsNullOrEmpty(par_payroll_year))
                    par_payroll_year = DateTime.Now.Year.ToString();
                if (par_department_code == null) par_department_code = "";
                if (par_history == null) par_history = "N";
                if (string.IsNullOrWhiteSpace(order_dir)) order_dir = "asc";
                if (search_value == null) search_value = "";

                // Map DataTables column index to actual column name
                var sortColumnMap = new[] { "empl_id", "employee_name", "w_tax_perc", "bus_tax_perc", "vat_perc", "total_gross_pay" };
                string sortCol = (order_column >= 0 && order_column < sortColumnMap.Length)
                    ? sortColumnMap[order_column] : "employee_name";

                int recordsTotal = 0;
                int recordsFiltered = 0;
                var data = new List<object>();

                using (var conn = new SqlConnection(constring))
                {
                    conn.Open();
                    using (var cmd = new SqlCommand("dbo.sp_payrollemployee_tax_hdr_tbl_list_paged", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@par_payroll_year", par_payroll_year);
                        cmd.Parameters.AddWithValue("@par_department_code", par_department_code);
                        cmd.Parameters.AddWithValue("@par_include_history", par_history);
                        cmd.Parameters.AddWithValue("@search_value", search_value);
                        cmd.Parameters.AddWithValue("@sort_column", sortCol);
                        cmd.Parameters.AddWithValue("@sort_dir", order_dir);
                        cmd.Parameters.AddWithValue("@offset_rows", start);
                        cmd.Parameters.AddWithValue("@fetch_rows", length);

                        using (var reader = cmd.ExecuteReader())
                        {
                            // Result set 1 : one row — total_records, filtered_records
                            if (reader.Read())
                            {
                                recordsTotal = reader.GetInt32(reader.GetOrdinal("total_records"));
                                recordsFiltered = reader.GetInt32(reader.GetOrdinal("filtered_records"));
                            }

                            // Result set 2 : current page rows only
                            reader.NextResult();
                            while (reader.Read())
                            {
                                data.Add(new
                                {
                                    empl_id = reader["empl_id"],
                                    employee_name = reader["employee_name"],
                                    employment_type = reader["employment_type"],
                                    employment_type_descr = reader["employment_type_descr"],
                                    position_title1 = reader["position_title1"],
                                    effective_date = reader["effective_date"],
                                    bir_class = reader["bir_class"],
                                    bir_class_descr = reader["bir_class_descr"],
                                    with_sworn = reader["with_sworn"],
                                    fixed_rate = reader["fixed_rate"],
                                    with_sworn_descr = reader["with_sworn_descr"],
                                    fixed_rate_descr = reader["fixed_rate_descr"],
                                    wi_sworn_perc = reader["wi_sworn_perc"],
                                    wo_sworn_perc = reader["wo_sworn_perc"],
                                    tax_perc = reader["tax_perc"],
                                    total_gross_pay = reader["total_gross_pay"],
                                    dedct_status = reader["dedct_status"],
                                    rcrd_status = reader["rcrd_status"],
                                    rcrd_status_descr = reader["rcrd_status_descr"],
                                    user_id_created_by = reader["user_id_created_by"],
                                    created_dttm = reader["created_dttm"],
                                    user_id_updated_by = reader["user_id_updated_by"],
                                    updated_dttm = reader["updated_dttm"],
                                    w_tax_perc = reader["w_tax_perc"],
                                    bus_tax_perc = reader["bus_tax_perc"],
                                    vat_perc = reader["vat_perc"],
                                    exmpt_amt = reader["exmpt_amt"]
                                });
                            }
                        }
                    }
                }

                return JSON(new
                {
                    draw,
                    recordsTotal,
                    recordsFiltered,
                    data
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new
                {
                    draw,
                    recordsTotal = 0,
                    recordsFiltered = 0,
                    data = new object[0],
                    error = ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetPendingGenCount(string par_payroll_year, string par_department_code)
        {
            var cnt = db_pacco.jo_tax_generation_queue_tbl
                .Count(x =>
                    x.payroll_year == par_payroll_year &&
                    x.department_code == par_department_code &&
                    x.status == "PENDING"
                );

            return Json(new { message = "success", pending_count = cnt },
                        JsonRequestBehavior.AllowGet);
        }





        //public ActionResult RunPendingGeneration(string par_payroll_year, string par_department_code)
        //{
        //    try
        //    {
        //        var userId = Session["user_id"]?.ToString() ?? "SYSTEM";
        //        db_pacco.Database.CommandTimeout = int.MaxValue;
        //        db_pacco.Database.ExecuteSqlCommand(
        //            "EXEC dbo.sp_process_jo_tax_generation_queue @par_payroll_year, @par_department_code, @par_user_id",
        //            par_payroll_year,
        //            par_department_code,
        //            userId
        //        );

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
        public ActionResult RunPendingGeneration(string par_payroll_year, string par_department_code)
        {
            try
            {
                db_pacco.Database.CommandTimeout = 30; // short timeout only

                // Just start the SQL Agent job
                db_pacco.Database.ExecuteSqlCommand(@"
            EXEC msdb.dbo.sp_start_job 
                @job_name = 'HRIS_JO_Tax_Generation_Queue_Worker';
        ");

                return Json(new
                {
                    message = "success",
                    info = "Tax generation has started in the background. Pending and failed records will be processed."
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    message = "error",
                    error = ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult RetryFailed(string par_payroll_year, string par_department_code)
        {
            try
            {
                db_pacco.Database.ExecuteSqlCommand(@"
                    UPDATE dbo.jo_tax_generation_queue_tbl
                    SET status = 'PENDING',
                        requested_at = GETDATE(),
                        started_at = NULL,
                        finished_at = NULL
                    WHERE payroll_year = @p0
                      AND department_code = @p1
                      AND status = 'FAILED';
                ", par_payroll_year, par_department_code);

                // Start the existing job
                db_pacco.Database.ExecuteSqlCommand(@"
                 EXEC msdb.dbo.sp_start_job
                @job_name = 'HRIS – JO Tax Generation Queue Worker';
              ");

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        //public ActionResult GetQueueCounts(string par_payroll_year, string par_department_code)
        //{
        //    try
        //    {
        //        var res = db_pacco.Database.SqlQuery<QueueCountsVm>(@"
        //            SELECT
        //                pending_count = SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END),
        //                failed_count  = SUM(CASE WHEN status = 'FAILED'  THEN 1 ELSE 0 END)
        //            FROM dbo.jo_tax_generation_queue_tbl
        //            WHERE payroll_year = @p0
        //              AND department_code = @p1
        //              AND status IN ('PENDING','FAILED');
        //            ", par_payroll_year, par_department_code).FirstOrDefault();

        //        return Json(new
        //        {
        //            message = "success",
        //            pending_count = res?.pending_count ?? 0,
        //            failed_count = res?.failed_count ?? 0
        //        }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { message = ex.Message, pending_count = 0, failed_count = 0 }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        public ActionResult GetQueueCounts(string par_payroll_year, string par_department_code)
        {
            try
            {
                var sql = @"SELECT
                                pending_count = ISNULL(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0),
                                failed_count  = ISNULL(SUM(CASE WHEN status = 'FAILED'  THEN 1 ELSE 0 END), 0),
                                running_count = ISNULL(SUM(CASE WHEN status = 'RUNNING' THEN 1 ELSE 0 END), 0)
                            FROM dbo.jo_tax_generation_queue_tbl
                            WHERE payroll_year = @p0
                              AND department_code = @p1
                              AND status IN ('PENDING','FAILED','RUNNING');";

                var r = db_pacco.Database.SqlQuery<QueueCountsVm>(sql, par_payroll_year, par_department_code)
                                         .FirstOrDefault();

                return Json(new
                {
                    message = "success",
                    pending_count = r?.pending_count ?? 0,
                    failed_count = r?.failed_count ?? 0,
                    running_count = r?.running_count ?? 0
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = ex.Message, pending_count = 0, failed_count = 0, running_count = 0 },
                            JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult SaveVATEmployee(string empl_id,
                                    string effective_date,
                                    decimal vat_value,
                                    bool status)
        {
            try
            {

                DateTime dt;
                if (!DateTime.TryParse(effective_date, out dt))
                {
                    return Json(new { success = false, message = "Invalid date format." });
                }

                string dateOnly = dt.ToString("yyyy-MM-dd");
                if (string.IsNullOrWhiteSpace(empl_id))
                {
                    return Json(new { success = false, message = "Employee ID is required." });
                }

                if (string.IsNullOrWhiteSpace(effective_date))
                {
                    return Json(new { success = false, message = "Effective date is required." });
                }

                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();

                    string query = @"
                INSERT INTO dbo.vat_empl_tbl
                (
                    empl_id,
                    effective_date,
                    vat_value,
                    status
                )
                VALUES
                (
                    @empl_id,
                    @effective_date,
                    @vat_value,
                    @status
                )";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@empl_id", empl_id.Trim());
                        cmd.Parameters.AddWithValue("@effective_date", dateOnly.Trim());
                        cmd.Parameters.AddWithValue("@vat_value", vat_value);
                        cmd.Parameters.AddWithValue("@status", status);

                        cmd.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "VAT record saved successfully." });
            }
            catch (SqlException ex)
            {
                // Primary Key Violation
                if (ex.Number == 2627)
                {
                    return Json(new
                    {
                        success = false,
                        message = "VAT record already exists for this employee and effective date."
                    });
                }

                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet]
        public ActionResult GetVatEmployeeList()
        {
            try
            {
                var list = new List<object>();
                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();
                    using (var cmd = new SqlCommand(@"
                        SELECT A.empl_id,
                               C.employee_name,
                               B.department_code,
                               D.department_name1,
                               A.vat_value,
                               E.bus_tax_perc,
                               E.w_tax_perc,
                               E.vat_perc,
                               E.exmpt_amt,
                               A.effective_date,
                               A.status
                        FROM vat_empl_tbl A
                        LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_hdr_tbl B ON B.empl_id = A.empl_id
                        LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl C ON C.empl_id = A.empl_id
                        LEFT JOIN HRIS_PAY.dbo.departments_tbl D ON D.department_code = B.department_code
                        LEFT JOIN HRIS_ACT.dbo.payrollemployee_tax_hdr_tbl E
                            ON E.empl_id = A.empl_id
                            AND E.effective_date = (
                                SELECT MAX(effective_date)
                                FROM HRIS_ACT.dbo.payrollemployee_tax_hdr_tbl X
                                WHERE X.empl_id = A.empl_id
                            )
                        ORDER BY C.employee_name", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            list.Add(new
                            {
                                empl_id = reader["empl_id"].ToString(),
                                employee_name = reader["employee_name"] == DBNull.Value ? "" : reader["employee_name"].ToString(),
                                department_code = reader["department_code"] == DBNull.Value ? "" : reader["department_code"].ToString(),
                                department_name = reader["department_name1"] == DBNull.Value ? "" : reader["department_name1"].ToString(),
                                vat_value = reader["vat_value"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["vat_value"]),
                                bus_tax_perc = reader["bus_tax_perc"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["bus_tax_perc"]),
                                w_tax_perc = reader["w_tax_perc"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["w_tax_perc"]),
                                vat_perc = reader["vat_perc"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["vat_perc"]),
                                exmpt_amt = reader["exmpt_amt"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["exmpt_amt"]),
                                effective_date = reader["effective_date"] == DBNull.Value ? "" : Convert.ToDateTime(reader["effective_date"]).ToString("yyyy-MM-dd"),
                                status = reader["status"] == DBNull.Value ? "Inactive" : (Convert.ToBoolean(reader["status"]) ? "Active" : "Inactive")
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

        [HttpPost]
        public ActionResult UpdateVATStatus(string empl_id, bool status)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(empl_id))
                    return Json(new { success = false, message = "Employee ID is required." });

                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();
                    using (var cmd = new SqlCommand("UPDATE dbo.vat_empl_tbl SET status = @status WHERE empl_id = @empl_id", conn))
                    {
                        cmd.Parameters.AddWithValue("@status", status);
                        cmd.Parameters.AddWithValue("@empl_id", empl_id.Trim());
                        cmd.ExecuteNonQuery();
                    }
                }
                return Json(new { success = true, message = "Status updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        public ActionResult UpdateVATEmployee(string empl_id, string effective_date, decimal vat_value, bool status)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(empl_id))
                    return Json(new { success = false, message = "Employee ID is required." });

                DateTime dt;
                if (!DateTime.TryParse(effective_date, out dt))
                    return Json(new { success = false, message = "Invalid date format." });

                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();
                    string query = @"
                UPDATE dbo.vat_empl_tbl
                SET effective_date = @effective_date,
                    vat_value      = @vat_value,
                    status         = @status
                WHERE empl_id = @empl_id";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@empl_id", empl_id.Trim());
                        cmd.Parameters.AddWithValue("@effective_date", dt.ToString("yyyy-MM-dd"));
                        cmd.Parameters.AddWithValue("@vat_value", vat_value);
                        cmd.Parameters.AddWithValue("@status", status);
                        cmd.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "VAT record updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult GetVatEmployee(string empl_id)
        {
            if (string.IsNullOrEmpty(empl_id))
                return Json(new { success = false, message = "Employee ID is required." }, JsonRequestBehavior.AllowGet);

            try
            {
                using (var db = new SqlConnection(constring))
                {
                    db.Open();
                    var cmd = new SqlCommand(@"
                SELECT TOP 1 empl_id, effective_date, vat_value, status
                FROM dbo.vat_empl_tbl
                WHERE empl_id = @empl_id
                ORDER BY effective_date DESC
            ", db);

                    cmd.Parameters.AddWithValue("@empl_id", empl_id);

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return Json(new
                            {
                                success = true,
                                data = new
                                {
                                    empl_id = reader["empl_id"].ToString(),
                                    effective_date = Convert.ToDateTime(reader["effective_date"]).ToString("yyyy-MM-dd"),
                                    vat_value = Convert.ToDecimal(reader["vat_value"]),
                                    status = (bool)reader["status"] ? "Active" : "Inactive"
                                }
                            }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            return Json(new { success = false, message = "Employee VAT record not found." }, JsonRequestBehavior.AllowGet);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/15/2026
        // Description: Truncates JO_job_param_list then bulk-inserts one row
        //              per empl_id from the current department/year selection.
        //*********************************************************************//
        public ActionResult SaveJobParamList(string par_payroll_year, List<string> par_empl_ids)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();

                    using (SqlCommand cmdTrunc = new SqlCommand(
                        "TRUNCATE TABLE dbo.JO_job_param_list", conn))
                    {
                        cmdTrunc.ExecuteNonQuery();
                    }

                    if (par_empl_ids != null && par_empl_ids.Count > 0)
                    {
                        var dt = new DataTable();
                        dt.Columns.Add("payroll_year", typeof(string));
                        dt.Columns.Add("employment_type", typeof(string));
                        dt.Columns.Add("processed", typeof(bool));
                        dt.Columns.Add("empl_id", typeof(string));

                        foreach (var id in par_empl_ids)
                        {
                            dt.Rows.Add(par_payroll_year, "JO", false, id);
                        }

                        using (var bulk = new SqlBulkCopy(conn))
                        {
                            bulk.DestinationTableName = "dbo.JO_job_param_list";
                            bulk.ColumnMappings.Add("payroll_year", "payroll_year");
                            bulk.ColumnMappings.Add("employment_type", "employment_type");
                            bulk.ColumnMappings.Add("processed", "processed");
                            bulk.ColumnMappings.Add("empl_id", "empl_id");
                            bulk.WriteToServer(dt);
                        }
                    }
                }

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = "error", error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/15/2026
        // Description: Shared helper — truncates jo_tax_gen_job_params and
        //              inserts one row for the given year. Called on both
        //              InitializeData (page load) and SaveJobParams (year change).
        //*********************************************************************//
        private void SaveJoTaxJobParams(string payroll_year)
        {
            try
            {
                string userId = Session["user_id"]?.ToString() ?? "";

                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();

                    using (SqlCommand cmdTrunc = new SqlCommand(
                        "TRUNCATE TABLE dbo.jo_tax_gen_job_params", conn))
                    {
                        cmdTrunc.ExecuteNonQuery();
                    }

                    using (SqlCommand cmdIns = new SqlCommand(@"
                        INSERT INTO dbo.jo_tax_gen_job_params
                            (payroll_year, user_id, employment_type, created_dttm)
                        VALUES
                            (@payroll_year, @user_id, 'JO', GETDATE())", conn))
                    {
                        cmdIns.Parameters.AddWithValue("@payroll_year", payroll_year);
                        cmdIns.Parameters.AddWithValue("@user_id", userId);
                        cmdIns.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                /* non-critical — do not break page load */
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/15/2026
        // Description: Save job params when user selects a payroll year.
        //              Delegates to SaveJoTaxJobParams so the logic is in one place.
        //*********************************************************************//
        public ActionResult SaveJobParams(string par_payroll_year)
        {
            try
            {
                SaveJoTaxJobParams(par_payroll_year);
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = "error", error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/15/2026
        // Description: Generation status list via sp_get_JO_tax_empl_dtl_hdr_generate_status.
        //              Mirrors cBIRAnnualizedTax.Get_Generation_Status_List pattern.
        //*********************************************************************//
        public ActionResult Get_Generation_Status_List(string payroll_year, string department_code)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();

                    bool jobIsRunning = false;

                    string checkJobSql = @"
                        SELECT TOP 1 1
                        FROM msdb.dbo.sysjobactivity ja
                        JOIN msdb.dbo.sysjobs j ON ja.job_id = j.job_id
                        JOIN msdb.dbo.syssessions s ON ja.session_id = s.session_id
                        WHERE j.name = @jobName
                          AND ja.start_execution_date IS NOT NULL
                          AND ja.stop_execution_date IS NULL
                          AND s.session_id = (SELECT MAX(session_id) FROM msdb.dbo.syssessions);
                    ";

                    using (SqlCommand cmdCheck = new SqlCommand(checkJobSql, conn))
                    {
                        cmdCheck.Parameters.AddWithValue("@jobName", "JO_TAXGEN_SQLJOB_AGENT");
                        var check_result = cmdCheck.ExecuteScalar();
                        jobIsRunning = (check_result != null);
                    }

                    List<object> result = new List<object>();

                    using (SqlCommand cmd = new SqlCommand("sp_get_JO_tax_empl_dtl_hdr_generate_status", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@payroll_year", payroll_year);


                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.Add(new
                                {
                                    empl_id = reader["empl_id"],
                                    employee_name = reader["employee_name"],
                                    batch_id = reader["batch_id"],
                                    dtl_status = reader["dtl_status"],
                                    dtl_generated_datetime = reader["dtl_generated_datetime"],
                                    hdr_status_or_error = reader["hdr_status_or_error"],
                                    hdr_generated_datetime = reader["hdr_generated_datetime"],
                                    dtl_to_hdr_seconds = reader["dtl_to_hdr_seconds"],
                                    dtl_loop_interval_seconds = reader["dtl_loop_interval_seconds"],
                                    latest_error_msg = reader["latest_error_msg"]
                                });
                            }
                        }
                    }

                    return Json(new
                    {
                        icon = "success",
                        jobIsRunning = jobIsRunning,
                        result = result
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { icon = "error", error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/15/2026
        // Description: Get JO Tax Generation Status List for the Generation tab
        //              Returns queue entries joined with employee names, optionally
        //              filtered by generation date.
        //*********************************************************************//
        public ActionResult GetGenerationStatus(string par_payroll_year, string par_department_code, string par_gen_date)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();

                    // Build date filter clause
                    string dateFilter = "";
                    if (!string.IsNullOrWhiteSpace(par_gen_date))
                    {
                        dateFilter = "AND CONVERT(DATE, Q.requested_at) = @gen_date";
                    }

                    string sql = @"
                        SELECT
                             Q.empl_id
                            ,ISNULL(E.employee_name, Q.empl_id)                         AS employee_name
                            ,CONVERT(varchar(19), Q.started_at,  120)                   AS dtl_generated_datetime
                            ,CONVERT(varchar(19), Q.finished_at, 120)                   AS hdr_generated_datetime
                            ,CASE
                                WHEN Q.status = 'FAILED'
                                THEN ISNULL(Q.error_message, 'Error')
                                ELSE ''
                             END                                                         AS error_status
                            ,Q.status
                            ,Q.requested_at
                        FROM dbo.jo_tax_generation_queue_tbl Q
                        LEFT JOIN (
                            SELECT empl_id, employee_name
                            FROM   vw_payrollemployeemaster_info_HRIS_ACT
                            WHERE  department_code = @dept
                              AND  effective_date  = (
                                        SELECT MAX(E2.effective_date)
                                        FROM   vw_payrollemployeemaster_info_HRIS_ACT E2
                                        WHERE  E2.empl_id = vw_payrollemployeemaster_info_HRIS_ACT.empl_id
                                          AND  E2.effective_date <= CONVERT(DATE, @year + '-12-31'))
                        ) E ON E.empl_id = Q.empl_id
                        WHERE  Q.payroll_year    = @year
                          AND  Q.department_code = @dept
                          " + dateFilter + @"
                        ORDER BY Q.requested_at DESC, Q.empl_id;
                    ";

                    List<object> result = new List<object>();

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@year", par_payroll_year);
                        cmd.Parameters.AddWithValue("@dept", par_department_code);
                        if (!string.IsNullOrWhiteSpace(par_gen_date))
                            cmd.Parameters.AddWithValue("@gen_date", par_gen_date);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.Add(new
                                {
                                    empl_id = reader["empl_id"].ToString(),
                                    employee_name = reader["employee_name"].ToString(),
                                    dtl_generated_datetime = reader["dtl_generated_datetime"] == DBNull.Value ? "" : reader["dtl_generated_datetime"].ToString(),
                                    hdr_generated_datetime = reader["hdr_generated_datetime"] == DBNull.Value ? "" : reader["hdr_generated_datetime"].ToString(),
                                    error_status = reader["error_status"].ToString(),
                                    status = reader["status"].ToString()
                                });
                            }
                        }
                    }

                    return Json(new { message = "success", generation_list = result }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { message = "error", error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 03/15/2026
        // Description: Mirrors BIR StartAnnualTaxJob. Truncates JO_job_param_list,
        //              bulk-inserts the submitted empl_id list, then fires
        //              the JO_TAXGEN_SQL_AGENT SQL Agent job.
        //*********************************************************************//
        public ActionResult StartAnnualTaxJob(string payrollYear, string departmentCode, List<JOGenerateList> datalist, bool errorsOnly)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();

                    // Truncate then bulk-insert into JO_job_param_list
                    using (SqlCommand cmdTrunc = new SqlCommand(
                        "TRUNCATE TABLE dbo.JO_job_param_list", conn))
                    {
                        cmdTrunc.ExecuteNonQuery();
                    }

                    var dt = ConvertToJODataTable(datalist);

                    using (var bulk = new SqlBulkCopy(conn))
                    {
                        bulk.DestinationTableName = "dbo.JO_job_param_list";
                        bulk.ColumnMappings.Add("payroll_year", "payroll_year");
                        bulk.ColumnMappings.Add("employment_type", "employment_type");
                        bulk.ColumnMappings.Add("processed", "processed");
                        bulk.ColumnMappings.Add("empl_id", "empl_id");
                        bulk.WriteToServer(dt);
                    }

                    // Start the SQL Agent job — sp_start_job itself raises an error
                    // if the job is already running, which is more reliable than sysjobactivity.
                    using (SqlCommand cmdJob = new SqlCommand("msdb.dbo.sp_start_job", conn))
                    {
                        cmdJob.CommandType = CommandType.StoredProcedure;
                        cmdJob.Parameters.AddWithValue("@job_name", "JO_TAXGEN_SQLJOB_AGENT");
                        cmdJob.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "Job started in background. You can continue using the app." },
                            JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                string msg = ex.Message;
                if (msg.IndexOf("already running", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    msg.IndexOf("refused because the job", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    msg = "Job is already running. Please wait for the current job to finish.";
                }
                return Json(new { success = false, message = msg }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult SaveJoTaxJobParamsList(string payroll_year, List<JOGenerateList> datalist)
        {
            try
            {
                string userId = Session["user_id"]?.ToString() ?? "";

                using (SqlConnection conn = new SqlConnection(constring))
                {
                    conn.Open();
                    List<object> result = new List<object>();

                    using (SqlCommand cmdTrunc = new SqlCommand(
                        "TRUNCATE TABLE dbo.JO_job_param_list", conn))
                    {
                        cmdTrunc.ExecuteNonQuery();
                    }

                    var dt = ConvertToJODataTable(datalist);

                    using (var bulk = new SqlBulkCopy(conn))
                    {
                        bulk.DestinationTableName = "dbo.JO_job_param_list";
                        bulk.ColumnMappings.Add("payroll_year", "payroll_year");
                        bulk.ColumnMappings.Add("employment_type", "employment_type");
                        bulk.ColumnMappings.Add("processed", "processed");
                        bulk.ColumnMappings.Add("empl_id", "empl_id");
                        bulk.WriteToServer(dt);
                    }



                    using (SqlCommand cmd = new SqlCommand("sp_get_JO_tax_empl_dtl_hdr_generate_status", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@payroll_year", payroll_year);


                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.Add(new
                                {
                                    empl_id = reader["empl_id"],
                                    employee_name = reader["employee_name"],
                                    batch_id = reader["batch_id"],
                                    dtl_status = reader["dtl_status"],
                                    dtl_generated_datetime = reader["dtl_generated_datetime"],
                                    hdr_status_or_error = reader["hdr_status_or_error"],
                                    hdr_generated_datetime = reader["hdr_generated_datetime"],
                                    dtl_to_hdr_seconds = reader["dtl_to_hdr_seconds"],
                                    dtl_loop_interval_seconds = reader["dtl_loop_interval_seconds"],
                                    latest_error_msg = reader["latest_error_msg"]
                                });
                            }
                        }
                    }

                    return Json(new
                    {
                        icon = "success",

                        result = result
                    }, JsonRequestBehavior.AllowGet);
                }


            }
            catch (Exception ex)
            {
                return Json(new { icon = "error", error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        private void LogTaxError(SqlConnection conn, string batchId, string emplId, string year, string month, string emplType, string source, string msg)
        {
            using (var cmd = new SqlCommand(@"
        INSERT INTO dbo.generate_tax_errors_tbl
            (batch_id, empl_id, payroll_year, payroll_month, employment_type, err_source, err_msg, created_at)
        VALUES
            (@batch_id, @empl_id, @year, @month, @empl_type, @src, LEFT(ISNULL(@msg,'Unknown'),4000), SYSDATETIME())", conn))
            {
                cmd.Parameters.AddWithValue("@batch_id", batchId);
                cmd.Parameters.AddWithValue("@empl_id", emplId);
                cmd.Parameters.AddWithValue("@year", year);
                cmd.Parameters.AddWithValue("@month", month);
                cmd.Parameters.AddWithValue("@empl_type", emplType);
                cmd.Parameters.AddWithValue("@src", source);
                cmd.Parameters.AddWithValue("@msg", string.IsNullOrEmpty(msg) ? "Unknown" : msg);
                cmd.ExecuteNonQuery();
            }
        }

        private void LogTaxDtlSuccess(SqlConnection conn, string batchId, string emplId, string year, string month, string emplType)
        {
            using (var cmd = new SqlCommand(@"
        DELETE FROM dbo.generate_tax_empl_dtl_success_tbl
        WHERE batch_id = @batch_id AND empl_id = @empl_id AND payroll_year = @year
          AND payroll_month = @month AND employment_type = @empl_type;

        INSERT INTO dbo.generate_tax_empl_dtl_success_tbl
            (batch_id, empl_id, payroll_year, payroll_month, employment_type, created_at)
        VALUES
            (@batch_id, @empl_id, @year, @month, @empl_type, SYSDATETIME())", conn))
            {
                cmd.Parameters.AddWithValue("@batch_id", batchId);
                cmd.Parameters.AddWithValue("@empl_id", emplId);
                cmd.Parameters.AddWithValue("@year", year);
                cmd.Parameters.AddWithValue("@month", month);
                cmd.Parameters.AddWithValue("@empl_type", emplType);
                cmd.ExecuteNonQuery();
            }
        }

        private void LogTaxHdrSuccess(SqlConnection conn, string batchId, string emplId, string year, string month, string emplType)
        {
            using (var cmd = new SqlCommand(@"
            DELETE FROM dbo.generate_tax_empl_hdr_success_tbl
            WHERE batch_id = @batch_id AND empl_id = @empl_id AND payroll_year = @year
              AND payroll_month = @month AND employment_type = @empl_type;

            INSERT INTO dbo.generate_tax_empl_hdr_success_tbl
                (batch_id, empl_id, payroll_year, payroll_month, employment_type, created_at)
            VALUES
                (@batch_id, @empl_id, @year, @month, @empl_type, SYSDATETIME())", conn))
            {
                cmd.Parameters.AddWithValue("@batch_id", batchId);
                cmd.Parameters.AddWithValue("@empl_id", emplId);
                cmd.Parameters.AddWithValue("@year", year);
                cmd.Parameters.AddWithValue("@month", month);
                cmd.Parameters.AddWithValue("@empl_type", emplType);
                cmd.ExecuteNonQuery();
            }
        }
        [HttpPost]
        public ActionResult GenerateJOTaxSingleEmployee(string empl_id, string payroll_year, string employment_type)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(empl_id) || string.IsNullOrWhiteSpace(payroll_year) || string.IsNullOrWhiteSpace(employment_type))
                {
                    return Json(new { success = false, processed_count = 0, result_msg = "Missing required parameters." }, JsonRequestBehavior.AllowGet);
                }

                string userId = Session["user_id"]?.ToString() ?? "SysAdmin";
                string payrollMonth = DateTime.Now.Month.ToString("D2");
                string batchId = DateTime.Now.ToString("yyyyMMdd_HHmmss");

                using (var conn = new SqlConnection(constring))
                {
                    conn.Open();

                    // ========== DTL ==========
                    string resDtl = "N";
                    string msgDtl = "";

                    using (var cmd = new SqlCommand("dbo.sp_generate_payroll_JO_tax_dtl_forloop", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 300;

                        cmd.Parameters.AddWithValue("@p_payroll_year", payroll_year);
                        cmd.Parameters.AddWithValue("@p_empl_id", empl_id);

                        var pResD = new SqlParameter("@result_value", SqlDbType.Char, 1) { Direction = ParameterDirection.Output };
                        var pMsgD = new SqlParameter("@result_msg", SqlDbType.VarChar, 500) { Direction = ParameterDirection.Output };
                        cmd.Parameters.Add(pResD);
                        cmd.Parameters.Add(pMsgD);

                        cmd.ExecuteNonQuery();

                        resDtl = pResD.Value?.ToString() ?? "N";
                        msgDtl = pMsgD.Value?.ToString() ?? "";
                    }

                    if (resDtl == "N")
                    {
                        LogTaxError(conn, batchId, empl_id, payroll_year, payrollMonth, employment_type, "DTL", msgDtl);
                        return Json(new { success = false, processed_count = 0, result_msg = "DTL failed: " + msgDtl }, JsonRequestBehavior.AllowGet);
                    }

                    LogTaxDtlSuccess(conn, batchId, empl_id, payroll_year, payrollMonth, employment_type);

                    // ========== HDR ==========
                    string resHdr = "N";
                    string msgHdr = "";

                    using (var cmd = new SqlCommand("dbo.sp_generate_payrollemployee_tax_hdr_forloop", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 300;

                        cmd.Parameters.AddWithValue("@p_payroll_year", payroll_year);
                        cmd.Parameters.AddWithValue("@p_empl_id", empl_id);
                        cmd.Parameters.AddWithValue("@p_user_id", userId);

                        var pResH = new SqlParameter("@result_value", SqlDbType.Char, 1) { Direction = ParameterDirection.Output };
                        var pMsgH = new SqlParameter("@result_msg", SqlDbType.VarChar, 500) { Direction = ParameterDirection.Output };
                        cmd.Parameters.Add(pResH);
                        cmd.Parameters.Add(pMsgH);

                        cmd.ExecuteNonQuery();

                        resHdr = pResH.Value?.ToString() ?? "N";
                        msgHdr = pMsgH.Value?.ToString() ?? "";
                    }

                    if (resHdr == "Y")
                    {
                        LogTaxHdrSuccess(conn, batchId, empl_id, payroll_year, payrollMonth, employment_type);
                        return Json(new { success = true, processed_count = 1, result_msg = "Tax generated for employee " + empl_id + " | Batch: " + batchId }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        LogTaxError(conn, batchId, empl_id, payroll_year, payrollMonth, employment_type, "HDR", msgHdr);
                        return Json(new { success = false, processed_count = 0, result_msg = "HDR failed: " + msgHdr }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, processed_count = 0, result_msg = "ERROR: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        private DataTable ConvertToJODataTable(List<JOGenerateList> datalist)
        {
            var table = new DataTable();
            table.Columns.Add("payroll_year", typeof(string));
            table.Columns.Add("employment_type", typeof(string));
            table.Columns.Add("processed", typeof(bool));
            table.Columns.Add("empl_id", typeof(string));

            foreach (var item in datalist)
                table.Rows.Add(item.payroll_year, item.employment_type, item.processed, item.empl_id);

            return table;
        }

        public TaxHeader GetLatestTaxHeader(string emplId, int year)
        {
            string query = @"SELECT TOP 1 * 
                     FROM payrollemployee_tax_hdr_tbl 
                     WHERE empl_id = @empl_id 
                       AND YEAR(effective_date) = @year 
                       AND rcrd_status <> 'R' 
                     ORDER BY effective_date DESC";

            using (SqlConnection conn = new SqlConnection(constring))
            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.Add("@empl_id", SqlDbType.VarChar, 8).Value = emplId;
                cmd.Parameters.Add("@year", SqlDbType.Int).Value = year;

                conn.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new TaxHeader
                        {
                            empl_id = reader.GetString(reader.GetOrdinal("empl_id")),
                            effective_date = reader.GetDateTime(reader.GetOrdinal("effective_date")),
                            bir_class = reader.IsDBNull(reader.GetOrdinal("bir_class")) ? null : reader.GetString(reader.GetOrdinal("bir_class")),
                            with_sworn = reader.IsDBNull(reader.GetOrdinal("with_sworn")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("with_sworn")),
                            fixed_rate = reader.IsDBNull(reader.GetOrdinal("fixed_rate")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("fixed_rate")),
                            total_gross_pay = reader.IsDBNull(reader.GetOrdinal("total_gross_pay")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("total_gross_pay")),
                            dedct_status = reader.IsDBNull(reader.GetOrdinal("dedct_status")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("dedct_status")),
                            rcrd_status = reader.IsDBNull(reader.GetOrdinal("rcrd_status")) ? null : reader.GetString(reader.GetOrdinal("rcrd_status")),
                            user_id_created_by = reader.IsDBNull(reader.GetOrdinal("user_id_created_by")) ? null : reader.GetString(reader.GetOrdinal("user_id_created_by")),
                            created_dttm = reader.IsDBNull(reader.GetOrdinal("created_dttm")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("created_dttm")),
                            user_id_updated_by = reader.IsDBNull(reader.GetOrdinal("user_id_updated_by")) ? null : reader.GetString(reader.GetOrdinal("user_id_updated_by")),
                            updated_dttm = reader.IsDBNull(reader.GetOrdinal("updated_dttm")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("updated_dttm")),
                            w_tax_perc = reader.IsDBNull(reader.GetOrdinal("w_tax_perc")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("w_tax_perc")),
                            bus_tax_perc = reader.IsDBNull(reader.GetOrdinal("bus_tax_perc")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("bus_tax_perc")),
                            vat_perc = reader.IsDBNull(reader.GetOrdinal("vat_perc")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("vat_perc")),
                            exmpt_amt = reader.IsDBNull(reader.GetOrdinal("exmpt_amt")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("exmpt_amt")),
                            grosspay_without_vat = reader.IsDBNull(reader.GetOrdinal("grosspay_without_vat")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("grosspay_without_vat"))
                        };
                    }
                }
            }

            return null;
        }
        public List<PayrollEmployeeTaxHdrModel> GetPayrollEmployeeTaxHdrList(string payroll_year, string department_code, string include_history)
        {
            var list = new List<PayrollEmployeeTaxHdrModel>();

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
                        list.Add(new PayrollEmployeeTaxHdrModel
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

            return list;
        }

        
    }

    
    public class JOGenerateList
    {
        public string empl_id        { get; set; }
        public string payroll_year   { get; set; }
        public string employment_type { get; set; }
        public bool   processed      { get; set; }
    }
    public class TaxHeader
    {
        public string empl_id { get; set; }
        public DateTime effective_date { get; set; }
        public string bir_class { get; set; }
        public bool? with_sworn { get; set; }
        public bool? fixed_rate { get; set; }
        public decimal? total_gross_pay { get; set; }
        public bool? dedct_status { get; set; }
        public string rcrd_status { get; set; }
        public string user_id_created_by { get; set; }
        public DateTime? created_dttm { get; set; }
        public string user_id_updated_by { get; set; }
        public DateTime? updated_dttm { get; set; }
        public decimal? w_tax_perc { get; set; }
        public decimal? bus_tax_perc { get; set; }
        public decimal? vat_perc { get; set; }
        public decimal? exmpt_amt { get; set; }
        public decimal? grosspay_without_vat { get; set; }
    }

    public class PayrollEmployeeTaxHdrModel
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
