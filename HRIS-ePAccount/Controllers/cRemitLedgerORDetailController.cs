using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cRemitLedgerORDetailController : Controller
    {
        
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        public string url_name = "cRemitLedger";
        // GET: cRemitLedgerHDMF
        User_Menu um;
        // GET: cRemitLedgerORDetail
        public ActionResult Index(string id, string etype)
        {
           
            if (Session["user_id"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            else if (id == null && etype == null)
            {
                return RedirectToAction("Index", "cMainPage");
            }
           
            assignToModel();
            return View(um);
        }
        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
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
   
        public void assignToModel()
        {
            um = new User_Menu();
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            um.remittance_year = prevValues[0].Trim();
            um.remittance_month = prevValues[1].Trim();
            um.remittance_month_descr = prevValues[2].Trim();
            um.employment_type = prevValues[3].Trim();
            um.employment_type_descr = prevValues[4].Trim();
            um.remittancetype_code = prevValues[5].Trim();
            um.remittancetype_descr = prevValues[6].Trim();
            um.remittance_ctrl_nbr = prevValues[7].Trim();
            um.remittance_status = prevValues[8].Trim();
            um.remittance_status_descr = prevValues[9].Trim();
            um.user_id = Session["user_id"].ToString().Trim();

        }
        public string remittance_status_descr(string status)
        {
            if(status == "N")
            {
                 return "NOT REMITTED";
            }
            else if(status == "P")
            {   
                return "PARTIALLY REMITTED";
            }
            else if(status == "R")
            {
                return "REMITTED";
            }
            else
            {
                return "";
            }
           
        }
        public ActionResult initializeData(string ltr, string v_opt, string batch)
        {
            db_pacco.Database.CommandTimeout = int.MaxValue;
            assignToModel();
            string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            var department_list = db_pacco.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();
            var details = db_pacco.sp_remittance_or_posting_dtl(um.remittance_ctrl_nbr, "", ltr, v_opt, "", "", Convert.ToInt32(batch)).ToList();
            var rs = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == um.remittance_ctrl_nbr).FirstOrDefault();
            um.remittance_status_descr = remittance_status_descr(rs.remittance_status.ToString());
          
            return JSON(new { prevValues, department_list, details,remittance_status = rs.remittance_status}, JsonRequestBehavior.AllowGet);
        }
        public ActionResult Post_One(sp_remittance_or_posting_dtl_Result dta)
        {
            assignToModel();
            var dte = Convert.ToDateTime(dta.or_date);
            var returndate = dte.Year + "-" + dte.Month + "-" + dte.Day;
            
            try
            {
                switch(um.remittancetype_code)
                {
                    case "01":
                       var ob1 = db_pacco.remittance_dtl_gsis_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob1 != null)
                        {
                            ob1.remittance_status = "R";
                            ob1.or_nbr = dta.or_nbr;
                            ob1.or_date = Convert.ToDateTime(dta.or_date);
                        }

                      

                        var ob12 = db_pacco.remittance_dtl_gsis_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                           && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob12 != null)
                        {
                            ob12.remittance_status = "R";
                            ob12.or_nbr = dta.or_nbr;
                            ob12.or_date = Convert.ToDateTime(dta.or_date);
                        }

                      

                        var flt = db_pacco.remittance_dtl_gsis_flt_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                                  && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();
                        if(flt != null)
                        {
                            flt.float_status = "R";
                        }

                        db_pacco.SaveChanges();
                        break;
                    case "02":
                    case "03":
                    case "04":
                    case "05":
                    case "06":
                       var ob2 = db_pacco.remittance_dtl_hdmf_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob2 != null) {
                            ob2.remittance_status = "R";
                            ob2.or_nbr = dta.or_nbr;
                            ob2.or_date = Convert.ToDateTime(dta.or_date);
                        }
                       

                        var ob22 = db_pacco.remittance_dtl_hdmf_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob22 != null)
                        {
                            ob22.remittance_status = "R";
                            ob22.or_nbr = dta.or_nbr;
                            ob22.or_date = Convert.ToDateTime(dta.or_date);
                        }

                       

                        db_pacco.SaveChanges();
                        break;
                    case "07":
                        var ob3 = db_pacco.remittance_dtl_phic_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();


                        if (ob3 != null)
                        {
                            ob3.remittance_status = "R";
                            ob3.or_nbr = dta.or_nbr;
                            ob3.or_date = Convert.ToDateTime(dta.or_date);
                        }

                       

                        var ob32 = db_pacco.remittance_dtl_phic_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                           && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob32 != null)
                        {
                            ob32.remittance_status = "R";
                            ob32.or_nbr = dta.or_nbr;
                            ob32.or_date = Convert.ToDateTime(dta.or_date);
                        }


                       

                        db_pacco.SaveChanges();
                        break;
                    case "08":
                        var ob4 = db_pacco.remittance_dtl_sss_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob4 != null)
                        {
                            ob4.remittance_status = "R";
                            ob4.or_nbr = dta.or_nbr;
                            ob4.or_date = Convert.ToDateTime(dta.or_date);
                        }

                       

                        var ob42 = db_pacco.remittance_dtl_sss_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob42 != null)
                        {
                            ob42.remittance_status = "R";
                            ob42.or_nbr = dta.or_nbr;
                            ob42.or_date = Convert.ToDateTime(dta.or_date);
                        }
                      

                        db_pacco.SaveChanges();
                        break;
                    case "09":
                    case "10":
                    case "11":
                    case "12":
                    case "13":
                        var ob5 = db_pacco.remittance_dtl_others_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob5 != null)
                        {
                            ob5.remittance_status = "R";
                            ob5.or_nbr = dta.or_nbr;
                            ob5.or_date = Convert.ToDateTime(dta.or_date);

                        }

                        var ob52 = db_pacco.remittance_dtl_others_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                           && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob52 != null)
                        {
                            ob52.remittance_status = "R";
                            ob52.or_nbr = dta.or_nbr;
                            ob52.or_date = Convert.ToDateTime(dta.or_date);

                        }

                      

                        db_pacco.SaveChanges();
                        break;

                    case "16":
                        var ob6 = db_pacco.remittance_dtl_lbp_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                        && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr
                        && a.payroll_month == dta.payroll_month).FirstOrDefault();

                        if (ob6 != null)
                        {
                            ob6.remittance_status = "R";
                            ob6.or_nbr = dta.or_nbr;
                            ob6.or_date = Convert.ToDateTime(dta.or_date);

                        }




                        db_pacco.SaveChanges();
                        break;
                }
                var remit_status = db_pacco.sp_update_remittance_hdr_or_posting(dta.remittance_ctrl_nbr, um.remittancetype_code,um.user_id).FirstOrDefault();
                return JSON(new { message = "success", returndate, remit_status }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        
        }
        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                    eve.Entry.Entity.GetType().Name, eve.Entry.State);
                foreach (var ve in eve.ValidationErrors)
                {


                    message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                    Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);


                }
            }
            return message;
        }
       
        public ActionResult GetInfoResult(string dep,string letter,string v_opt,string batch)
        {
            
            assignToModel();
            try
            {
                var details = db_pacco.sp_remittance_or_posting_dtl(um.remittance_ctrl_nbr, dep, letter, v_opt, "", "", Convert.ToInt32(batch)).ToList();

                return JSON(new { message = "success", details }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        
        }
       
        public ActionResult UnPost(sp_remittance_or_posting_dtl_Result dta)
        {
           assignToModel();
           try
            {

                switch (um.remittancetype_code)
                {
                    case "01":
                        var ob1 = db_pacco.remittance_dtl_gsis_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                             && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob1 != null)
                        {
                            ob1.remittance_status = "N";
                            ob1.or_nbr = "";
                            ob1.or_date = Convert.ToDateTime("1900-01-01");
                        }



                        var ob12 = db_pacco.remittance_dtl_gsis_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                           && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob12 != null)
                        {
                            ob12.remittance_status = "N";
                            ob12.or_nbr = "";
                            ob12.or_date = Convert.ToDateTime("1900-01-01");
                        }



                        var flt = db_pacco.remittance_dtl_gsis_flt_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                                  && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();
                        if (flt != null)
                        {
                            flt.float_status = "N";
                        }

                        db_pacco.SaveChanges();
                        break;
                    case "02":
                    case "03":
                    case "04":
                    case "05":
                    case "06":
                        var ob2 = db_pacco.remittance_dtl_hdmf_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                             && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob2 != null)
                        {
                            ob2.remittance_status = "N";
                            ob2.or_nbr = "";
                            ob2.or_date = Convert.ToDateTime("1900-01-01");
                        }


                        var ob22 = db_pacco.remittance_dtl_hdmf_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob22 != null)
                        {
                            ob22.remittance_status = "N";
                            ob22.or_nbr = "";
                            ob22.or_date = Convert.ToDateTime("1900-01-01");
                        }



                        db_pacco.SaveChanges();
                        break;
                    case "07":
                        var ob3 = db_pacco.remittance_dtl_phic_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();


                        if (ob3 != null)
                        {
                            ob3.remittance_status = "N";
                            ob3.or_nbr = "";
                            ob3.or_date = Convert.ToDateTime("1900-01-01");
                        }



                        var ob32 = db_pacco.remittance_dtl_phic_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                           && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob32 != null)
                        {
                            ob32.remittance_status = "N";
                            ob32.or_nbr = "";
                            ob32.or_date = Convert.ToDateTime("1900-01-01");
                        }




                        db_pacco.SaveChanges();
                        break;
                    case "08":
                        var ob4 = db_pacco.remittance_dtl_sss_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob4 != null)
                        {
                            ob4.remittance_status = "N";
                            ob4.or_nbr = "";
                            ob4.or_date = Convert.ToDateTime("1900-01-01");
                        }



                        var ob42 = db_pacco.remittance_dtl_sss_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob42 != null)
                        {
                            ob42.remittance_status = "N";
                            ob42.or_nbr = "";
                            ob42.or_date = Convert.ToDateTime("1900-01-01");
                        }


                        db_pacco.SaveChanges();
                        break;

                        case "09":
                        case "10":
                        case "11":
                        case "12":
                        case "13":
                            var ob5 = db_pacco.remittance_dtl_others_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                            && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob5 != null)
                        {
                            ob5.remittance_status = "N";
                            ob5.or_nbr = "";
                            ob5.or_date = Convert.ToDateTime("1900-01-01");

                        }

                        var ob52 = db_pacco.remittance_dtl_others_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr
                           && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr).FirstOrDefault();

                        if (ob52 != null)
                        {
                            ob52.remittance_status = "N";
                            ob52.or_nbr = "";
                            ob52.or_date = Convert.ToDateTime("1900-01-01");

                        }
                        db_pacco.SaveChanges();
                        break;

                    case "16":
                        var ob6 = db_pacco.remittance_dtl_lbp_month_tbl.Where(a => a.remittance_ctrl_nbr == dta.remittance_ctrl_nbr 
                        && a.empl_id == dta.empl_id && a.voucher_nbr == dta.voucher_nbr 
                        && a.payroll_month == dta.payroll_month).FirstOrDefault();

                        if (ob6 != null)
                        {
                            ob6.remittance_status = "N";
                            ob6.or_nbr = "";
                            ob6.or_date = Convert.ToDateTime("1900-01-01");

                        }
                        



                        db_pacco.SaveChanges();
                        break;
                }

                var remit_status = db_pacco.sp_update_remittance_hdr_or_posting(dta.remittance_ctrl_nbr, um.remittancetype_code, um.user_id).FirstOrDefault();
                return JSON(new { message = "success", remit_status }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        
        }

        public ActionResult Post_All(string or_nbr, string or_date,string action, string payroll_month)
        {
            assignToModel();
           
            string[] dateval;
            var dttm = "";

            var returndate = "";
            
            
           
            try
            {

                if (action == "PO")
                {
                    DateTime oDate = Convert.ToDateTime(or_date);
                    dateval = oDate.ToString().Split(new char[] { '/' });
                    var yy = dateval[2].Substring(0, 4);
                    dttm = yy + '-' + dateval[0] + '-' + dateval[1];
                    returndate = dttm;
                }

                 var remit_status = db_pacco.sp_remittance_or_post_all(um.remittancetype_code, um.remittance_ctrl_nbr, or_nbr, dttm, action, um.user_id, payroll_month).FirstOrDefault();
               
                return Json(new { message = "success", returndate, remit_status }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //ADDED BY JORGE: 11/03/2020
        public ActionResult Post_Checked(string or_nbr, string or_date,  List<vw_remittance_info_GSIS> all_dtl_data, string action, string payroll_month)
        {
            assignToModel();

            string[] dateval;
            var dttm = "";

            var returndate = "";
            bool check_counter = false;


            try
            {
                
                DateTime oDate = Convert.ToDateTime(or_date);
                dateval = oDate.ToString().Split(new char[] { '/' });
                var yy = dateval[2].Substring(0, 4);
                dttm = yy + '-' + dateval[0] + '-' + dateval[1];
                returndate = dttm;
                var remit_status = "";

                if (all_dtl_data != null)
                {

                    foreach (var lst in all_dtl_data)

                    {
                        if (um.remittancetype_code == "01")
                        {
                            var counter = db_pacco.remittance_dtl_gsis_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.remittance_status != "R").ToList().Count;
                            var remittance_dtl_gsis_tbl_update = db_pacco.remittance_dtl_gsis_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.empl_id == lst.empl_id && a.voucher_nbr == lst.voucher_nbr).FirstOrDefault();

                            if (counter == all_dtl_data.Count)
                            {
                                check_counter = true;
                            }

                            remittance_dtl_gsis_tbl_update.remittance_status = "R";
                            remittance_dtl_gsis_tbl_update.or_nbr = or_nbr;
                            remittance_dtl_gsis_tbl_update.or_date = Convert.ToDateTime(returndate);
                            db_pacco.SaveChanges();
                        }

                        else if (um.remittancetype_code == "02"
                            || um.remittancetype_code == "03"
                            || um.remittancetype_code == "04"
                            || um.remittancetype_code == "05"
                            || um.remittancetype_code == "06")
                        {

                            var counter = db_pacco.remittance_dtl_hdmf_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.remittance_status != "R").ToList().Count;

                            if (counter == all_dtl_data.Count)
                            {
                                check_counter = true;
                            }

                            var remittance_dtl_hdmf_tbl_update = db_pacco.remittance_dtl_hdmf_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.empl_id == lst.empl_id && a.voucher_nbr == lst.voucher_nbr).FirstOrDefault();

                            remittance_dtl_hdmf_tbl_update.remittance_status = "R";
                            remittance_dtl_hdmf_tbl_update.or_nbr = or_nbr;
                            remittance_dtl_hdmf_tbl_update.or_date = Convert.ToDateTime(returndate);
                            db_pacco.SaveChanges();
                        }

                        else if (um.remittancetype_code == "07")
                        {
                            var counter = db_pacco.remittance_dtl_phic_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.remittance_status != "R").ToList().Count;

                            if (counter == all_dtl_data.Count)
                            {
                                check_counter = true;
                            }
                            

                            var remittance_dtl_phic_tbl_update = db_pacco.remittance_dtl_phic_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.empl_id == lst.empl_id && a.voucher_nbr == lst.voucher_nbr).FirstOrDefault();

                            remittance_dtl_phic_tbl_update.remittance_status = "R";
                            remittance_dtl_phic_tbl_update.or_nbr = or_nbr;
                            remittance_dtl_phic_tbl_update.or_date = Convert.ToDateTime(returndate);
                            db_pacco.SaveChanges();
                        }

                        else if (um.remittancetype_code == "08")
                        {
                            var remittance_dtl_sss_tbl_update = db_pacco.remittance_dtl_sss_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.empl_id == lst.empl_id && a.voucher_nbr == lst.voucher_nbr).FirstOrDefault();
                            var counter = db_pacco.remittance_dtl_sss_tbl.Where(a => a.remittance_ctrl_nbr == lst.remittance_ctrl_nbr && a.remittance_status != "R").ToList().Count;

                            if (counter == all_dtl_data.Count)
                            {
                                check_counter = true;
                            }
                            remittance_dtl_sss_tbl_update.remittance_status = "R";
                            remittance_dtl_sss_tbl_update.or_nbr = or_nbr;
                            remittance_dtl_sss_tbl_update.or_date = Convert.ToDateTime(returndate);
                            db_pacco.SaveChanges();
                        }

                    }



                }




                if (check_counter == false)
                {
                    remit_status = "P";
                    var remittance_hdr_tbl_update = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == um.remittance_ctrl_nbr).FirstOrDefault();
                    remittance_hdr_tbl_update.remittance_status = remit_status;
                    db_pacco.SaveChanges();
                }
                else
                {
                    remit_status = "R";
                    var remittance_hdr_tbl_update = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == um.remittance_ctrl_nbr).FirstOrDefault();
                    remittance_hdr_tbl_update.remittance_status = remit_status;
                    db_pacco.SaveChanges();
                }



                //if (action == "PO")
                //{
                //    DateTime oDate = Convert.ToDateTime(or_date);
                //    dateval = oDate.ToString().Split(new char[] { '/' });
                //    var yy = dateval[2].Substring(0, 4);
                //    dttm = yy + '-' + dateval[0] + '-' + dateval[1];
                //    returndate = dttm;
                //}

                var remit_status_update = db_pacco.sp_remittance_or_post_all(um.remittancetype_code, um.remittance_ctrl_nbr, or_nbr, dttm, action, um.user_id, payroll_month).FirstOrDefault();
                return JSON(new { message = "success", returndate, remit_status }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}