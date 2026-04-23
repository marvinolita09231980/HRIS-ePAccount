using HRIS_ePAccount.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cRECETaxUpdController : Controller
    {
       
        HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
        string constring = System.Configuration.ConfigurationManager.AppSettings["connetionString_act"];
        private string constring_PAY = System.Configuration.ConfigurationManager.AppSettings["connetionString_pay"];
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        // GET: cRECETaxUpd
        public ActionResult Index(int type)
        {
            if (type == 1)
            {
                Session["nemployment_type"] = "RE";
            }
            else if(type == 2)
            {
                Session["nemployment_type"] = "JO";
            }
            else if (type == 3)
            {
                Session["nemployment_type"] = "NE";
            }
            else if (type == 4)
            {
                Session["nemployment_type"] = "RC";
            }
            else
            {
                Session["nemployment_type"] = "";
            }
           
            return View();
        }

         public ActionResult Initialize()
         {
            var datenow = DateTime.Now;
            var year = datenow.Year.ToString();
            List<sp_empltaxwithheld_tbl_for_apprvl_Result> rc_tax_list = new List<sp_empltaxwithheld_tbl_for_apprvl_Result>();
            List<sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result> jo_tax_list = new List<sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result>();
            List<sp_payrollemployee_tax_tbl_for_apprvl_NE_Result> ne_tax_list = new List<sp_payrollemployee_tax_tbl_for_apprvl_NE_Result>();
            List<sp_payrollemployee_tax_tbl_phic_rece_Result> rc_phic_tax_list = new List<sp_payrollemployee_tax_tbl_phic_rece_Result>(); try
            {
                var employment_type = Session["nemployment_type"].ToString();
                if (employment_type == "RE")
                {
                    rc_tax_list = db_pay.sp_empltaxwithheld_tbl_for_apprvl("RE").ToList();

                    return JSON(new { icon = "success", message = "success", rc_tax_list, employment_type }, JsonRequestBehavior.AllowGet);
                }
                else if (employment_type == "JO")
                {
                    jo_tax_list = GetTaxJOForApproval(year, "N").ToList();
                    return JSON(new { icon = "success", message = "success", jo_tax_list, employment_type }, JsonRequestBehavior.AllowGet);
                }
                else if (employment_type == "NE")
                {
                    ne_tax_list = db_pay.sp_payrollemployee_tax_tbl_for_apprvl_NE(year, "N").ToList();
                    return JSON(new { icon = "success", message = "success", ne_tax_list, employment_type }, JsonRequestBehavior.AllowGet);
                }
                else if (employment_type == "RC")
                {
                    rc_phic_tax_list = db_pay.sp_payrollemployee_tax_tbl_phic_rece(year, "N").ToList();
                    return JSON(new { icon = "success", message = "success", rc_phic_tax_list, employment_type }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("Invalid employment type!");
                }
            }
            catch(Exception ex)
            {
                var message = ex.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }

         }

        public List<sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result> GetTaxJOForApproval(string year, string status)
        {
            List<sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result> list = new List<sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result>();

            string query = "EXEC sp_payrollemployee_tax_tbl_for_apprvl_ACT @p_payroll_year, @p_status";

            using (SqlConnection conn = new SqlConnection(constring))
            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.Add("@p_payroll_year", SqlDbType.VarChar, 4).Value = year;
                cmd.Parameters.Add("@p_status", SqlDbType.VarChar, 2).Value = status;

                conn.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result
                        {
                            empl_id = reader.GetString(reader.GetOrdinal("empl_id")),
                            employee_name = reader.GetString(reader.GetOrdinal("employee_name")),
                            total_gross_pay = reader.GetDecimal(reader.GetOrdinal("total_gross_pay")),
                            basic_tax_rate = reader.GetDecimal(reader.GetOrdinal("basic_tax_rate")),
                            tax_perc = reader.GetDecimal(reader.GetOrdinal("tax_perc")),
                            vat_perc = reader.GetDecimal(reader.GetOrdinal("vat_perc")),
                            rcrd_status = reader.GetString(reader.GetOrdinal("rcrd_status")),
                            fixed_rate = reader.GetBoolean(reader.GetOrdinal("fixed_rate")),
                            bir_class = reader.GetString(reader.GetOrdinal("bir_class")),
                            with_sworn = reader.GetBoolean(reader.GetOrdinal("with_sworn")),
                            dedct_status = reader.GetBoolean(reader.GetOrdinal("dedct_status")),
                            rcrd_status_descr = reader.GetString(reader.GetOrdinal("rcrd_status_descr")),
                            effective_date = reader.GetDateTime(reader.GetOrdinal("effective_date")).ToString("yyyy-MM-dd HH:mm:ss.fff"),
                            payroll_year = reader.GetString(reader.GetOrdinal("payroll_year")),
                            fixed_rate_wotx_descre = reader.GetBoolean(reader.GetOrdinal("fixed_rate_wotx_descre"))
                        });
                    }
                }
            }

            return list;
        }
        public ActionResult sp_empltaxwithheld_tbl_for_apprvl(string employment_type)
        {
            try
            {
                var sp_empltaxwithheld_tbl_for_apprvl = db_pay.sp_empltaxwithheld_tbl_for_apprvl(employment_type).ToList();

                return JSON(new { message="success", icon="success", sp_empltaxwithheld_tbl_for_apprvl}, JsonRequestBehavior.AllowGet);
            }
            catch(Exception e)
            {
                var message = e.Message;
                return JSON(new { message , icon="error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult sp_payrollemployee_tax_tbl_for_apprvl(string year,string status )
        {
            try
            {
                var sp_payrollemployee_tax_tbl_for_apprvl = db_pay.sp_payrollemployee_tax_tbl_for_apprvl(year, status).ToList();

                return JSON(new { message = "success", icon = "success", sp_payrollemployee_tax_tbl_for_apprvl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult sp_payrollemployee_tax_tbl_for_apprvl_NE(string year, string status)
        {
            try
            {
                var sp_payrollemployee_tax_tbl_for_apprvl_NE = db_pay.sp_payrollemployee_tax_tbl_for_apprvl_NE(year, status).ToList();

                return JSON(new { message = "success", icon = "success", sp_payrollemployee_tax_tbl_for_apprvl_NE }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult sp_payrollemployee_tax_tbl_for_apprvl_RC_PHIC(string year, string status)
        {
            try
            {
                var sp_payrollemployee_tax_tbl_phic_rece = db_pay.sp_payrollemployee_tax_tbl_phic_rece(year, status).ToList();

                return JSON(new { message = "success", icon = "success", sp_payrollemployee_tax_tbl_phic_rece }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }



        public ActionResult approved_reject_tax_rc(string empl_id, string effective_date, string payroll_year, string employment_type, string status)
        {
            
            try
            {
                var message = "";

                var user_id = Session["user_id"].ToString();
                var datenow = DateTime.Now;
                var nEffective_date = Convert.ToDateTime(effective_date);

                var empl_twh = db_pay.empl_taxwithheld_tbl.Where(a => a.empl_id == empl_id && a.effective_date == nEffective_date && a.payroll_year == payroll_year).FirstOrDefault();

                empl_twh.rcrd_status = status;
                empl_twh.user_id_updated_by = user_id;
                empl_twh.updated_dttm = datenow;
                db_pay.SaveChanges();

                if (status == "A") // Approve Status
                {

                    message = "Approved";
                }
                else if (status == "R") // Rejected Status
                {

                    message = "Rejected";
                   
                }

                var sp_empltaxwithheld_tbl_for_apprvl = db_pay.sp_empltaxwithheld_tbl_for_apprvl(employment_type).ToList();

                return JSON(new { message, icon = "success", sp_empltaxwithheld_tbl_for_apprvl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult approved_reject_tax_jo(string nstatus, string status, sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result data)
        {

            try
            {
                var message = approved_reject_tax_jo_main_method(nstatus, status, data);
              
                
                if(message != "success")
                {
                    throw new Exception(message);
                }
                var sp_payrollemployee_tax_tbl_for_apprvl = GetTaxJOForApproval(data.payroll_year, "N").ToList();
                return JSON(new { message = "Tax record saved successfully.", icon = "success", sp_payrollemployee_tax_tbl_for_apprvl }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }
        public String approved_reject_tax_jo_main_method(string nstatus, string status, sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result data)
        {
            var obj = new sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result();
            try
            {
                
                

                var userid = Session["user_id"].ToString();
                var datenow = DateTime.Now;
                var nEffective_date = Convert.ToDateTime(data.effective_date);


                if (nstatus == "A") // Approve Status
                {
                    
                    var empl_id           = data.empl_id        ;
                    var effective_date    = data.effective_date;
                    var bir_class         = data.bir_class      ;
                    var with_sworn        = data.with_sworn     ;
                    var fixed_rate        = data.fixed_rate     ;
                    var total_gross_pay   = data.total_gross_pay;
                    var dedct_status      = data.dedct_status   ;
                    var rcrd_status       = data.rcrd_status    ;
                    var user_id           = userid;
                    var w_tax_perc        = data.basic_tax_rate;
                    var bus_tax_perc      = data.tax_perc;
                    var vat_perc          = data.vat_perc;
                    var exmpt_amt = 0;

                    var insert = ApproveAndInsertPayrollEmployeeTax(
                         empl_id
                        ,effective_date
                        ,bir_class
                        ,with_sworn
                        ,fixed_rate
                        ,total_gross_pay
                        ,dedct_status
                        ,"A"
                        ,user_id
                        ,w_tax_perc
                        ,bus_tax_perc
                        ,vat_perc
                        ,exmpt_amt);

                    if(insert != "success")
                    {
                        throw new Exception("Failed");
                    }


                    return "success";

                }
                else if (nstatus == "R") // Rejected Status
                {
                    
                    var upd = UpdateJOTaxApprovalStatus(data.empl_id,data.effective_date,"R");
                    if(upd != "success")
                    {
                        throw new Exception("Fail to update payrollemployee_tax_hdr_tbl data");
                    }
                    // var list = GetTaxJOForApproval(data.payroll_year, "N").ToList();
                    return "success";

                }
                else  // New Status
                {
                   
                    var upd = UpdateJOTaxApprovalStatus(data.empl_id, data.effective_date, "N");
                    if (upd != "success")
                    {
                        throw new Exception("Fail to update payrollemployee_tax_hdr_tbl data");
                    }
                   // var list = GetTaxJOForApproval(data.payroll_year, "N").ToList();
                    return "success";

                }
                
            }
            catch (Exception e)
            {
               
                var message = e.Message;

                return message;
            }
        }
      

        public string ApproveAndInsertPayrollEmployeeTax(
            string empl_id,
            string effective_date,
            string bir_class,
            bool? with_sworn,
            bool? fixed_rate,
            decimal? total_gross_pay,
            bool? dedct_status,
            string rcrd_status,
            string user_id,
            decimal? w_tax_perc,
            decimal? bus_tax_perc,
            decimal? vat_perc,
            decimal? exmpt_amt)
        {
            try
            {
                var datenow = DateTime.Now;
                using (var scope = new System.Transactions.TransactionScope())
                {
                    // 1. UPDATE HRIS_ACT.dbo.payrollemployee_tax_hdr_tbl first
                    string updateQuery = @"UPDATE payrollemployee_tax_hdr_tbl 
                     SET rcrd_status = @p_rcrd_status 
                        ,updated_dttm = GETDATE()
                        ,user_id_updated_by = @p_user_id_updated_by
                     WHERE empl_id = @p_empl_id 
                     AND effective_date = @p_effective_date";

                    using (SqlConnection connAct = new SqlConnection(constring))
                    using (SqlCommand cmdUpdate = new SqlCommand(updateQuery, connAct))
                    {
                        cmdUpdate.Parameters.Add("@p_empl_id", SqlDbType.VarChar, 15).Value = empl_id;
                        cmdUpdate.Parameters.Add("@p_effective_date", SqlDbType.DateTime).Value = effective_date;
                        cmdUpdate.Parameters.Add("@p_user_id_updated_by", SqlDbType.VarChar,10).Value = user_id;
                        cmdUpdate.Parameters.Add("@p_rcrd_status", SqlDbType.VarChar, 2).Value = rcrd_status;

                        connAct.Open();
                        int updateRows = cmdUpdate.ExecuteNonQuery();

                        if (updateRows == 0)
                            return "Update failed: No matching record found.";
                    }

                    // 2. INSERT into HRIS_PAY.dbo.payrollemployee_tax_tbl
                    string insertQuery = @"INSERT INTO payrollemployee_tax_tbl
                    (empl_id, effective_date, bir_class, with_sworn, fixed_rate,
                     total_gross_pay, dedct_status, rcrd_status,
                     user_id_created_by, created_dttm,
                     w_tax_perc, bus_tax_perc, vat_perc, exmpt_amt)
                    VALUES
                    (@p_empl_id, @p_effective_date, @p_bir_class, @p_with_sworn, @p_fixed_rate,
                     @p_total_gross_pay, @p_dedct_status, @p_rcrd_status,
                     @p_user_id, GETDATE(),
                     @p_w_tax_perc, @p_bus_tax_perc, @p_vat_perc, @p_exmpt_amt)";

                    using (SqlConnection connPay = new SqlConnection(constring_PAY))
                    using (SqlCommand cmdInsert = new SqlCommand(insertQuery, connPay))
                    {
                        cmdInsert.Parameters.Add("@p_empl_id", SqlDbType.VarChar, 8).Value = empl_id;
                        cmdInsert.Parameters.Add("@p_effective_date", SqlDbType.DateTime).Value = effective_date;
                        cmdInsert.Parameters.Add("@p_bir_class", SqlDbType.VarChar, 1).Value = (object)bir_class ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_with_sworn", SqlDbType.Bit).Value = (object)with_sworn ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_fixed_rate", SqlDbType.Bit).Value = (object)fixed_rate ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_total_gross_pay", SqlDbType.Money).Value = (object)total_gross_pay ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_dedct_status", SqlDbType.Bit).Value = (object)dedct_status ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_rcrd_status", SqlDbType.VarChar, 1).Value = (object)rcrd_status ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_user_id", SqlDbType.VarChar, 30).Value = (object)user_id ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_w_tax_perc", SqlDbType.Money).Value = (object)w_tax_perc ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_bus_tax_perc", SqlDbType.Money).Value = (object)bus_tax_perc ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_vat_perc", SqlDbType.Money).Value = (object)vat_perc ?? DBNull.Value;
                        cmdInsert.Parameters.Add("@p_exmpt_amt", SqlDbType.Money).Value = (object)exmpt_amt ?? DBNull.Value;

                        connPay.Open();
                        cmdInsert.ExecuteNonQuery();
                    }

                    // Both succeeded — commit
                    scope.Complete();

                    return "success";
                }
            }
            catch (Exception ex)
            {
                // If insert fails, update is also rolled back
                return "Error: " + ex.Message;
            }
        }
       

        public string UpdateJOTaxApprovalStatus(string empl_id, string effective_date, string rcrd_status)
        {
            try
            {
                string query = @"UPDATE payrollemployee_tax_hdr_tbl 
                         SET rcrd_status = @p_rcrd_status 
                         WHERE empl_id = @p_empl_id 
                         AND effective_date = @p_effective_date";

                using (SqlConnection conn = new SqlConnection(constring))
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.Add("@p_empl_id", SqlDbType.VarChar, 15).Value = empl_id;
                    cmd.Parameters.Add("@p_effective_date", SqlDbType.VarChar, 22).Value = effective_date;
                    cmd.Parameters.Add("@p_rcrd_status", SqlDbType.VarChar, 2).Value = rcrd_status;

                    conn.Open();
                    int rowsAffected = cmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                        return "success";
                    else
                        return "fail";
                }
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }



        public ActionResult approved_reject_tax_ne(string empl_id, string effective_date, string payroll_year, string employment_type, string nstatus, string status)
        {

            try
            {
                var message = "";

                var user_id = Session["user_id"].ToString();
                var datenow = DateTime.Now;
                var nEffective_date = Convert.ToDateTime(effective_date);

                var ne_tax = db_pay.payrollemployee_tax_tbl.Where(a => a.empl_id == empl_id && a.effective_date == nEffective_date).FirstOrDefault();

                ne_tax.rcrd_status = nstatus;
                ne_tax.user_id_updated_by = user_id;
                ne_tax.updated_dttm = datenow;
                db_pay.SaveChanges();

                if (nstatus == "A") // Approve Status
                {
                    message = "Approved";
                }
                else if (nstatus == "R") // Rejected Status
                {
                    message = "Rejected";
                }
                else if (nstatus == "N") // Rejected Status
                {
                    message = "New";
                }

                db_pay.sp_payrollemployee_tax_hdr_tbl_update(empl_id, nEffective_date, nstatus, user_id);

                var sp_payrollemployee_tax_tbl_for_apprvl_NE = db_pay.sp_payrollemployee_tax_tbl_for_apprvl_NE(payroll_year, status).ToList();

                return JSON(new { message, icon = "success", sp_payrollemployee_tax_tbl_for_apprvl_NE }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult approved_reject_tax_rc_phic(string empl_id, string effective_date, string payroll_year, string employment_type, string nstatus, string status)
        {

            try
            {
                var message = "";

                var user_id = Session["user_id"].ToString();
                var datenow = DateTime.Now;
                var nEffective_date = Convert.ToDateTime(effective_date);

                var rc_phic_tax = db_pay.payrollemployee_tax_phic_rece_tbl.Where(a => a.empl_id == empl_id && a.effective_date == nEffective_date).FirstOrDefault();

                rc_phic_tax.rcrd_status = nstatus;
                rc_phic_tax.user_id_updated_by = user_id;
                rc_phic_tax.updated_dttm = datenow;
                db_pay.SaveChanges();

                if (nstatus == "A") // Approve Status
                {
                    message = "Approved";
                }
                else if (nstatus == "R") // Rejected Status
                {
                    message = "Rejected";
                }
                else if (nstatus == "N") // Rejected Status
                {
                    message = "New";
                }

               

                var sp_payrollemployee_tax_tbl_phic_rece = db_pay.sp_payrollemployee_tax_tbl_phic_rece(payroll_year, status).ToList();

                return JSON(new { message, icon = "success", sp_payrollemployee_tax_tbl_phic_rece}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ApproveAllTaxUpdRC(List<sp_empltaxwithheld_tbl_for_apprvl_Result> data,string employment_type)
        {
            var datenow = DateTime.Now;
            var userid = Session["user_id"].ToString();
            try
            {
                for (int x = 0; x < data.Count(); x++)
                {

                    var empl_id = data[x].empl_id;
                    var effective_date = Convert.ToDateTime(data[x].effective_date);
                    var updRcTax = db_pay.empl_taxwithheld_tbl.Where(a => a.empl_id == empl_id && a.effective_date == effective_date).FirstOrDefault();
                    updRcTax.rcrd_status = "A";
                    updRcTax.updated_dttm = datenow;
                    updRcTax.user_id_updated_by = userid;
                    db_pay.SaveChanges();
                }
                var message = "Success";

                var sp_empltaxwithheld_tbl_for_apprvl = db_pay.sp_empltaxwithheld_tbl_for_apprvl(employment_type).ToList();

                return JSON(new { message, icon = "success", sp_empltaxwithheld_tbl_for_apprvl}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ApproveAllTaxUpdJO(List<sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result> data, string year,string status)
        {
            var count = 0;

            //approved_reject_tax_jo_main_method
            var datenow = DateTime.Now;
            var userid = Session["user_id"].ToString();
            try
            {
                for (int x = 0; x < data.Count(); x++)
                {

                    var ex_message = approved_reject_tax_jo_main_method("A", data[x].rcrd_status, data[x]);
                    if(ex_message == "success")
                    {
                        count++;
                    }
                  
                }


                var message = count + " tax records successfully approved";

                var sp_payrollemployee_tax_tbl_for_apprvl = GetTaxJOForApproval(year, "N").ToList();

                return JSON(new { message, icon = "success", sp_payrollemployee_tax_tbl_for_apprvl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ApproveAllTaxUpdNE(List<sp_payrollemployee_tax_tbl_for_apprvl_NE_Result> data, string year, string status)
        {
            var datenow = DateTime.Now;
            var userid = Session["user_id"].ToString();
            try
            {
                for (int x = 0; x < data.Count(); x++)
                {

                    var empl_id = data[x].empl_id;
                    var effective_date = Convert.ToDateTime(data[x].effective_date);
                    var updNETax = db_pay.payrollemployee_tax_tbl.Where(a => a.empl_id == empl_id && a.effective_date == effective_date).FirstOrDefault();
                    updNETax.rcrd_status = "A";
                    updNETax.updated_dttm = datenow;
                    updNETax.user_id_updated_by = userid;
                    db_pay.SaveChanges();

                    db_pay.sp_payrollemployee_tax_hdr_tbl_update(empl_id, effective_date, "A", userid);
                }
                var message = "Success";

                var sp_payrollemployee_tax_tbl_for_apprvl_NE = db_pay.sp_payrollemployee_tax_tbl_for_apprvl_NE(year, status).ToList();

                return JSON(new { message, icon = "success", sp_payrollemployee_tax_tbl_for_apprvl_NE }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ApproveAllTaxUpdRCPHIC(List<sp_payrollemployee_tax_tbl_phic_rece_Result> data, string year, string status)
        {
            var datenow = DateTime.Now;
            var userid = Session["user_id"].ToString();
            try
            {
                for (int x = 0; x < data.Count(); x++)
                {

                    var empl_id = data[x].empl_id;
                    var effective_date = Convert.ToDateTime(data[x].effective_date);
                    var updRCPHICTax = db_pay.payrollemployee_tax_phic_rece_tbl.Where(a => a.empl_id == empl_id && a.effective_date == effective_date).FirstOrDefault();
                    updRCPHICTax.rcrd_status = "A";
                    updRCPHICTax.updated_dttm = datenow;
                    updRCPHICTax.user_id_updated_by = userid;
                    db_pay.SaveChanges();

                }
                var message = "Success";

                var sp_payrollemployee_tax_tbl_phic_rece = db_pay.sp_payrollemployee_tax_tbl_phic_rece(year, status).ToList();

                return JSON(new { message, icon = "success", sp_payrollemployee_tax_tbl_phic_rece }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var message = e.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
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
       

        public class sp_payrollemployee_tax_tbl_for_apprvl_ACT_Result
        {
            public string empl_id { get; set; }
            public string employee_name { get; set; }
            public decimal total_gross_pay { get; set; }
            public decimal basic_tax_rate { get; set; }
            public decimal tax_perc { get; set; }
            public decimal vat_perc { get; set; }
            public string rcrd_status { get; set; }
            public bool fixed_rate { get; set; }
            public string bir_class { get; set; }
            public bool with_sworn { get; set; }
            public bool dedct_status { get; set; }
            public string rcrd_status_descr { get; set; }
            public string effective_date { get; set; }
            public string payroll_year { get; set; }
            public bool fixed_rate_wotx_descre { get; set; }
            public string message { get; set; }
        }
    }
}