using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cRECETaxUpdController : Controller
    {
       
        HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        // GET: cRECETaxUpd
        public ActionResult Index(int type)
        {
            if (type == 1)
            {
                Session["nemployment_type"] = "RE";
            }
            else
            {
                Session["nemployment_type"] = "JO";
            }
           
            return View();
        }

         public ActionResult Initialize()
         {
            var datenow = DateTime.Now;
            var year = datenow.Year.ToString();
            List<sp_empltaxwithheld_tbl_for_apprvl_Result> rc_tax_list = new List<sp_empltaxwithheld_tbl_for_apprvl_Result>();
            List<sp_payrollemployee_tax_tbl_for_apprvl_Result> jo_tax_list = new List<sp_payrollemployee_tax_tbl_for_apprvl_Result>();
            try
            {
                var employment_type = Session["nemployment_type"].ToString();
                if (employment_type == "RE")
                {
                    rc_tax_list = db_pay.sp_empltaxwithheld_tbl_for_apprvl("RE").ToList();

                    return JSON(new { icon = "success", message = "success", rc_tax_list, employment_type }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    jo_tax_list = db_pay.sp_payrollemployee_tax_tbl_for_apprvl(year, "N").ToList();
                    return JSON(new { icon = "success", message = "success", jo_tax_list, employment_type }, JsonRequestBehavior.AllowGet);
                }
            }
            catch(Exception ex)
            {
                var message = ex.Message;
                return JSON(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }

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


        public ActionResult approved_reject_tax_jo(string empl_id, string effective_date, string payroll_year, string employment_type, string nstatus, string status)
        {

            try
            {
                var message = "";

                var user_id = Session["user_id"].ToString();
                var datenow = DateTime.Now;
                var nEffective_date = Convert.ToDateTime(effective_date);

                var jo_tax = db_pay.payrollemployee_tax_tbl.Where(a => a.empl_id == empl_id && a.effective_date == nEffective_date).FirstOrDefault();

                jo_tax.rcrd_status = nstatus;
                jo_tax.user_id_updated_by = user_id;
                jo_tax.updated_dttm = datenow;
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

                var sp_payrollemployee_tax_tbl_for_apprvl = db_pay.sp_payrollemployee_tax_tbl_for_apprvl(payroll_year, status).ToList();

                return JSON(new { message, icon = "success", sp_payrollemployee_tax_tbl_for_apprvl }, JsonRequestBehavior.AllowGet);
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

        public ActionResult ApproveAllTaxUpdJO(List<sp_payrollemployee_tax_tbl_for_apprvl_Result> data, string year,string status)
        {
            var datenow = DateTime.Now;
            var userid = Session["user_id"].ToString();
            try
            {
                for (int x = 0; x < data.Count(); x++)
                {

                    var empl_id = data[x].empl_id;
                    var effective_date = Convert.ToDateTime(data[x].effective_date);
                    var updJoTax = db_pay.payrollemployee_tax_tbl.Where(a => a.empl_id == empl_id && a.effective_date == effective_date).FirstOrDefault();
                    updJoTax.rcrd_status = "A";
                    updJoTax.updated_dttm = datenow;
                    updJoTax.user_id_updated_by = userid;
                    db_pay.SaveChanges();

                    db_pay.sp_payrollemployee_tax_hdr_tbl_update(empl_id, effective_date,"A", userid);
                }
                var message = "Success";

                var sp_payrollemployee_tax_tbl_for_apprvl = db_pay.sp_payrollemployee_tax_tbl_for_apprvl(year,status).ToList();

                return JSON(new { message, icon = "success", sp_payrollemployee_tax_tbl_for_apprvl }, JsonRequestBehavior.AllowGet);
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
    }
}