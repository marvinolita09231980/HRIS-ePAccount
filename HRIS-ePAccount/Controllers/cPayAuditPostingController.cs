//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll POSTING
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
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cPayAuditPostingController : Controller
    {
       
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (um != null || um.ToString() != "")
            {
                try
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
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_empType)
        {
            object payroll_template = new object();
            string userid = "";

            try
            {
                userid = Session["user_id"].ToString();
            }

            catch (Exception e)
            {
                string msg = e.Message;
            }
            
             


            if (Session["PreviousValuesonPage_cPayRegistry"] == null)
            {
                Session["PreviousValuesonPage_cPayRegistry"] = null;
                string ddl_year = "";
                string ddl_month = "";
                string ddl_emp_type = "";
                string ddl_template = "";
                string ddl_payrolltype = "";
                string ddl_department = "";
                int sort_value_cs = 1;
                int page_value = 0;
                string sort_order = "asc";
                string show_entries = "5";



                //var sp_departmentsaccounting_tbl_list = db_pacco.sp_departmentsaccounting_tbl_list().ToList();
                var empType  = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var payrolltype = db_pacco.accountingsystemsetup_tbl.ToList();
                
                var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list("", "", "", "", "").ToList();


                //return Json(new { empType, payroll_template, userid, sp_payrollregistryaccounting_hdr_tbl_list, ddl_template, ddl_year, ddl_month, ddl_emp_type, payrolltype, ddl_payrolltype, sp_departmentsaccounting_tbl_list, ddl_department }, JsonRequestBehavior.AllowGet);
                return Json(new { empType,payroll_template, ddl_template, ddl_year, ddl_month, ddl_emp_type, ddl_payrolltype, ddl_department, payrolltype, sp_payrollregistryaccounting_hdr_tbl_list, userid, sort_value_cs, page_value, sort_order, show_entries }, JsonRequestBehavior.AllowGet);

            }
        

            else
            {
                string[] PreviousValuesonPage_cPayRegistry = Session["PreviousValuesonPage_cPayRegistry"].ToString().Split(new char[] { ',' });
                
                string ddl_year         = PreviousValuesonPage_cPayRegistry[0].ToString().Trim();
                string ddl_month        = PreviousValuesonPage_cPayRegistry[1].ToString().Trim();
                string ddl_registry_nbr = PreviousValuesonPage_cPayRegistry[2].ToString().Trim();
                string ddl_emp_type     = PreviousValuesonPage_cPayRegistry[3].ToString().Trim();
                string ddl_template     = PreviousValuesonPage_cPayRegistry[4].ToString().Trim();
                //string ddl_group = PreviousValuesonPage_cPayRegistry[5].ToString().Trim();
                string ddl_payrolltype = PreviousValuesonPage_cPayRegistry[6].ToString().Trim();
                var empType = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var payrolltype = db_pacco.sp_accountingsystemsetup_tbl_list().ToList();

                int sort_value_cs      = Convert.ToInt32(PreviousValuesonPage_cPayRegistry[11].ToString().Trim());
                int page_value         = Convert.ToInt32(PreviousValuesonPage_cPayRegistry[9].ToString().Trim());
                string sort_order      = PreviousValuesonPage_cPayRegistry[12].ToString().Trim();

                string show_entries    = PreviousValuesonPage_cPayRegistry[8].ToString().Trim();

                if (ddl_payrolltype == "01")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == ddl_emp_type && (a.payrolltemplate_type == "01" || a.payrolltemplate_type == "07")).ToList();

                }

                else if (ddl_payrolltype == "02")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == ddl_emp_type && a.payrolltemplate_type == "08").ToList();
                }

                var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list(ddl_year, ddl_month, ddl_template, ddl_payrolltype, ddl_emp_type).ToList();

              

                return Json(new { empType, payroll_template, userid ,ddl_template, ddl_year, ddl_month, ddl_emp_type, payrolltype, ddl_payrolltype, sp_payrollregistryaccounting_hdr_tbl_list, sort_value_cs, page_value, sort_order, show_entries }, JsonRequestBehavior.AllowGet);

               
            }
            
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cPayRegistry
            (string par_year, 
             string par_month, 
             string par_registry_nbr, 
             string par_emp_type, 
             string par_template, 
             string par_group, 
             string par_payrolltype,
             string par_department,
             string par_show_entries,
             string par_page_nbr,
             string par_search,
             string par_sort_value,
             string par_sort_order
             )
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cPayRegistry"] = par_year + "," 
                                                          + par_month + "," 
                                                          + par_registry_nbr 
                                                          + "," + par_emp_type 
                                                          + "," + par_template 
                                                          + "," + par_group 
                                                          + "," + par_payrolltype
                                                          + "," + par_department
                                                          + "," + par_show_entries
                                                          + "," + par_page_nbr
                                                          + "," + par_search
                                                          + "," + par_sort_value
                                                          + "," + par_sort_order;

            
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType, string par_payType)
        {
            try
            {
                object payroll_template = new object();

                if (par_payType.ToString() == "01")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == par_empType && (a.payrolltemplate_type == "01" || a.payrolltemplate_type == "07")).ToList();
                    
                }

                else if (par_payType.ToString() == "02")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == par_empType && a.payrolltemplate_type == "08").ToList();
                }

                return Json(new { payroll_template }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Populate Employment Type
        ////*********************************************************************//
        public ActionResult RetrieveReportFile(string par_template_code)
        {
            try
            {
                //var notinlist = ["007",""]s;

                var notinlist = new string[] {"104", "105", "212","211","205","214","105","108","111","109"};
                //var reportfile = db_pacco.sp_payrollregistryaccounting_template_combolist(par_template_code).ToList();
                //.Where( a => notinlist.Contains(a.payrolltemplate_code)).ToList();

                var reportfile = db_pacco.sp_payrollregistryaccounting_template_combolist(par_template_code).Where(a => !notinlist.Contains(a.payrolltemplate_code)).ToList();

                return Json(new { reportfile }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        ////*********************************************************************//
        public ActionResult SelectReportFile(string par_template_code)
        {
            try
            {

                var reportfile = db_pacco.vw_payrollregistryaccounting_template_combolist.Where(a => a.payrolltemplate_code == par_template_code).FirstOrDefault();
                return Json(new { reportfile }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SelectPayrollType(string par_empType, string par_payType)
        {
            try
            {
                object payroll_template = new object();
                

                if (par_payType.ToString() == "01")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == par_empType && (a.payrolltemplate_type == "01" || a.payrolltemplate_type == "07")).ToList();
                }

                else if (par_payType.ToString() == "02")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == par_empType && a.payrolltemplate_type == "08").ToList();
                }

                return Json(new { payroll_template }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SelectMonth(string par_year, string par_month, string par_template, string par_payrolltype, string par_employment_type)
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


        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Template Type
        //*********************************************************************//
        public ActionResult SelectTemplateType(string par_year, string par_month, string par_template, string par_payrolltype,string par_employment_type)
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

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Template Type
        //*********************************************************************//
        public ActionResult UpdateFromDatabaseReturn
            (
            string par_voucher_nbr,
            string par_tran_year,
            string par_payroll_registry_nbr,
            string par_payroll_registry_descr,
            string par_payroll_group_nbr,
            string par_department_code,
            string par_rcvd_dttm,
            string par_rcvd_by_user,
            string par_audit_rcvd_dttm,
            string par_audit_rcvd_user,
            string par_audited_dttm,
            string par_audited_by_user,
            string par_posting_rcvd_dttm,
            string par_posting_rcvd_by_user,
            string par_posted_dttm,
            string par_posted_by_user,
            string par_review_dttm,
            string par_reviewed_by_user,
            string par_rlsd_dttm,
            string par_rlsd_by_user,
            string par_unposted_dttm,
            string par_unposted_by_user,
            string par_remarks,
            string par_payroll_source,
            string par_employment_type,
            string par_payroll_template,
            string par_payroll_year,
            string par_payroll_month,
            string par_status)
        {
            
               try
               {
                var message = "";
                var status = "";

               

                if (par_status == "" || par_status == null)
                {
                    status = "N";
                }

                else
                {
                    status = par_status;
                }

                if (status == "Y" || status == "W")
                {
                    message = "fail";

                }

                else
                {
                    if (par_voucher_nbr != "" && par_tran_year != "")
                    {

                        //Purpose: Stored procedure for Inserting Data to payrollregistryaccounting_hdr_ret_tbl
                        //Created by: JRV 11/12/2019
                        var insert_return = db_pacco.sp_payrollregistryaccounting_hdr_ret_tbl_insert(par_tran_year, par_voucher_nbr, Session["user_id"].ToString(), par_remarks);

                        //Purpose: Update Data from payrollregistry_hdr_tbl and payrollregistry_dtl_tbl set the status to NOT POSTED
                        //Created by: JRV 11/12/2019
                        var post_status = "N";
                        var post_update = db_pacco.sp_payrollregistryaccounting_dtl_tbl_post_update(par_payroll_year, par_payroll_registry_nbr, post_status);

                        //Purpose: Update Data from payrollregistry_hdr_rls_tbl
                        //Created by: JRV 11/12/2019
                        var release_update = db_pacco.sp_payrollregistryaccounting_dtl_tbl_rls_update(par_payroll_year, Session["user_id"].ToString(), par_payroll_registry_nbr, par_remarks);

                        //Purpose: Delete Data from payrollregistryaccounting_hdr_tbl
                        //Created by: JRV 11/12/2019


                        var dt = db_pacco.payrollregistryaccounting_hdr_tbl.Where(a =>
                               a.voucher_nbr == par_voucher_nbr &&
                               a.tran_year == par_tran_year).FirstOrDefault();

                        db_pacco.payrollregistryaccounting_hdr_tbl.Remove(dt);

                        db_pacco.SaveChanges();
                        message = "success";
                    }

                    else
                    {
                        message = "fail";

                    }

                }
                
                return Json(new { message }, JsonRequestBehavior.AllowGet);
               }
               catch (Exception ex)
               {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
               }

        }





        //*********************************************************************//
        // Created By  : JRV - Created Date : 09/19/2019
        // Description : Update From Database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(
            string par_voucher_nbr,
            string par_tran_year,
            string par_payroll_registry_nbr,
            string par_payroll_registry_descr,
            string par_payroll_group_nbr,
            string par_department_code,
            string par_rcvd_dttm, 
            string par_rcvd_by_user,
            string par_audit_rcvd_dttm,
            string par_audit_rcvd_user,
            string par_audited_dttm, 
            string par_audited_by_user,
            string par_posting_rcvd_dttm, 
            string par_posting_rcvd_by_user,
            string par_posted_dttm, 
            string par_posted_by_user,
            string par_review_dttm,
            string par_reviewed_by_user,
            string par_rlsd_dttm, 
            string par_rlsd_by_user,
            string par_unposted_dttm,
            string par_unposted_by_user,
            string par_remarks,
            string par_payroll_source,
            string par_employment_type,
            string par_payroll_template,
            string par_payroll_year,
            string par_payroll_month)
            {
            try
            {

           
                string defaultdate = "1900-01-01";
                string message = "";
                string post_status = "N";


              


                var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list(par_payroll_year, par_payroll_month, par_payroll_template, par_payroll_source, par_employment_type).Where(a => a.payroll_year == par_payroll_year && a.payroll_registry_nbr == par_payroll_registry_nbr).SingleOrDefault();

                if (par_rcvd_dttm != "" && par_voucher_nbr != "")
                {
                    
                        //FOR INSERT PAYROLL ACCOUNTING HEADER
                        if (par_audit_rcvd_dttm == "" && par_audited_dttm == "" && par_posting_rcvd_dttm == "" && par_posted_dttm == "" && par_review_dttm == "" && par_rlsd_dttm == "")
                        {
                            payrollregistryaccounting_hdr_tbl tbl = new payrollregistryaccounting_hdr_tbl();
                            tbl.voucher_nbr = par_voucher_nbr;
                            tbl.tran_year = par_tran_year;
                            tbl.payroll_registry_nbr = par_payroll_registry_nbr;
                            tbl.payroll_registry_descr = par_payroll_registry_descr;
                            tbl.payroll_group_nbr = par_payroll_group_nbr;
                            tbl.department_code = par_department_code;
                            tbl.rcvd_dttm = Convert.ToDateTime(par_rcvd_dttm);
                            tbl.rcvd_by_user = par_rcvd_by_user;
                            tbl.audit_rcvd_dttm = par_audit_rcvd_dttm == "" || par_audit_rcvd_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_audit_rcvd_dttm);
                            tbl.audit_rcvd_user = par_audit_rcvd_user;
                            tbl.audited_dttm = par_audited_dttm == "" || par_audited_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_audited_dttm);
                            tbl.audited_by_user = par_audited_by_user;
                            tbl.posting_rcvd_dttm = par_posting_rcvd_dttm == "" || par_posting_rcvd_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_posting_rcvd_dttm);
                            tbl.posting_rcvd_by_user = par_posting_rcvd_by_user;
                            tbl.posted_dttm = par_posted_dttm == "" || par_posted_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_posted_dttm);
                            tbl.posted_by_user = par_posted_by_user;
                            tbl.review_dttm = par_review_dttm == "" || par_review_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_review_dttm);
                            tbl.reviewed_by_user = par_reviewed_by_user;
                            tbl.rlsd_dttm = par_rlsd_dttm == "" || par_rlsd_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_rlsd_dttm);
                            tbl.rlsd_by_user = par_rlsd_by_user;
                            tbl.unposted_dttm = par_unposted_dttm == "" || par_unposted_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_unposted_dttm);
                            tbl.unposted_by_user = par_unposted_by_user;
                            tbl.payroll_source = par_payroll_source;
                            tbl.payroll_year = par_payroll_year;
                            tbl.payroll_month = par_payroll_month;
                            db_pacco.payrollregistryaccounting_hdr_tbl.Add(tbl);

                            try
                            {
                                db_pacco.SaveChanges();
                                message = "success";
                            }

                            catch (DbEntityValidationException e)
                            {
                                message = "fail";
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
                                return Json(new { message }, JsonRequestBehavior.AllowGet);
                            }
                        }

                        //FOR UPDATE PAYROLL ACCOUNTING HEADER
                        else
                        {

                            //Update payroll registry details for posting
                            if (par_posted_dttm != "" && par_review_dttm == "" && par_rlsd_dttm == "")
                            {
                                post_status = "Y";
                                db_pacco.sp_payrollregistryaccounting_dtl_tbl_post_update(par_payroll_year, par_payroll_registry_nbr, post_status);
                            }

                            if (par_unposted_dttm != "" && par_posted_dttm != "" && par_review_dttm == "" && par_rlsd_dttm == "")
                            {
                                post_status = "R";
                                par_posting_rcvd_dttm = "";
                                par_posting_rcvd_by_user = "";
                                par_posted_dttm = "";
                                par_posted_by_user = "";
                                par_review_dttm = "";
                                par_reviewed_by_user = "";

                                var post_update = db_pacco.sp_payrollregistryaccounting_dtl_tbl_post_update(par_payroll_year, par_payroll_registry_nbr, post_status);
                                var insert_unpost = db_pacco.sp_payrollregistry_dtl_unpost_tbl_insert(par_tran_year, par_voucher_nbr, "", par_unposted_by_user, par_remarks);


                            }

                            payrollregistryaccounting_hdr_tbl tbl = db_pacco.payrollregistryaccounting_hdr_tbl.Where(a => a.voucher_nbr == par_voucher_nbr).SingleOrDefault();
                            if (tbl == null)
                            {
                                message = "fail";
                            }

                            else
                            {
                                tbl.rcvd_dttm = Convert.ToDateTime(par_rcvd_dttm);
                                tbl.rcvd_by_user = par_rcvd_by_user;
                                tbl.audit_rcvd_dttm = par_audit_rcvd_dttm == "" || par_audit_rcvd_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_audit_rcvd_dttm);
                                tbl.audit_rcvd_user = par_audit_rcvd_user;
                                tbl.audited_dttm = par_audited_dttm == "" || par_audited_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_audited_dttm);
                                tbl.audited_by_user = par_audited_by_user;
                                tbl.posting_rcvd_dttm = par_posting_rcvd_dttm == "" || par_posting_rcvd_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_posting_rcvd_dttm);
                                tbl.posting_rcvd_by_user = par_posting_rcvd_by_user;
                                tbl.posted_dttm = par_posted_dttm == "" || par_posted_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_posted_dttm);
                                tbl.posted_by_user = par_posted_by_user;
                                tbl.review_dttm = par_review_dttm == "" || par_review_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_review_dttm);
                                tbl.reviewed_by_user = par_reviewed_by_user;
                                tbl.rlsd_dttm = par_rlsd_dttm == "" || par_rlsd_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_rlsd_dttm);
                                tbl.rlsd_by_user = par_rlsd_by_user;
                                tbl.unposted_dttm = par_unposted_dttm == "" || par_unposted_dttm == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_unposted_dttm);
                                tbl.unposted_by_user = par_unposted_by_user;

                                try
                                {
                                    db_pacco.SaveChanges();
                                    message = "success";
                                }

                                catch (DbEntityValidationException e)
                                {
                                    message = "fail";
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
                                    return Json(new { message }, JsonRequestBehavior.AllowGet);
                                }

                            }


                        }

                   

                }

               return Json( new { message} , JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException)
            {
                string message = "fail_initialize";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 11/22/2019
        // Description: Check If Another User Already Updated the data
        //*********************************************************************//
        //public ActionResult CheckData(sp_payrollregistryaccounting_hdr_tbl_list_Result data, string par_payroll_template,string par_payroll_source ,string par_employment_type, string par_action)
        //{
        //    try
        //    {
        //        string message = "";
                

        //        var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list(data.payroll_year, data.payroll_month, par_payroll_template, par_payroll_source, par_employment_type).Where(a => a.payroll_registry_nbr == data.payroll_registry_nbr && a.payroll_year == data.payroll_year).FirstOrDefault();


        //        if (sp_payrollregistryaccounting_hdr_tbl_list.voucher_nbr == "" && sp_payrollregistryaccounting_hdr_tbl_list.rcvd_dttm == "" && sp_payrollregistryaccounting_hdr_tbl_list.rcvd_flag == true && par_action == "receive")
        //        {
        //            message = "success";
        //        }

        //        else if (sp_payrollregistryaccounting_hdr_tbl_list.rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audit_rcvd_dttm == "" && sp_payrollregistryaccounting_hdr_tbl_list.rcvd_audit_flag == true && par_action == "receive_audit")
        //        {
        //            message = "success";
        //        }

        //        else if (sp_payrollregistryaccounting_hdr_tbl_list.rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audit_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audited_dttm == "" && sp_payrollregistryaccounting_hdr_tbl_list.audit_flag == true && par_action == "audit")
        //        {
        //            message = "success";
        //        }

        //        else if (sp_payrollregistryaccounting_hdr_tbl_list.rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audit_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audited_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.posting_rcvd_dttm == "" && sp_payrollregistryaccounting_hdr_tbl_list.rcvd_post_flag == true && par_action == "receive_post")
        //        {
        //            message = "success";
        //        }

        //        else if (sp_payrollregistryaccounting_hdr_tbl_list.rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audit_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audited_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.posting_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.posted_dttm == "" && sp_payrollregistryaccounting_hdr_tbl_list.post_flag == true && par_action == "post")
        //        {
        //            message = "success";
        //        }

        //        else if (sp_payrollregistryaccounting_hdr_tbl_list.rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audit_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audited_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.posting_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.posted_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.review_dttm == "" && par_action == "review")
        //        {
        //            message = "success";
        //        }

        //        else if (sp_payrollregistryaccounting_hdr_tbl_list.rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audit_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.audited_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.posting_rcvd_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.posted_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.review_dttm != "" && sp_payrollregistryaccounting_hdr_tbl_list.rlsd_dttm == "" && sp_payrollregistryaccounting_hdr_tbl_list.release_flag == true && par_action == "release")
        //        {
        //            message = "success";
        //        }

        //        else if (par_action == "unposted" && sp_payrollregistryaccounting_hdr_tbl_list.posted_dttm != "")
        //        {
        //            message = "success";
        //        }

        //        else if (par_action == "returned")
        //        {
        //            message = "success";
        //        }

        //        else
        //        {
        //            message = "fail";
        //        }

        //        if (sp_payrollregistryaccounting_hdr_tbl_list == null)
        //        {
        //            message = "fail";
        //        }

        //        string voucher_nbr;
        //        var payrollregistryaccounting_hdr_ret_tbl = db_pacco.payrollregistryaccounting_hdr_ret_tbl.Where(a => a.payroll_registry_nbr == data.payroll_registry_nbr && a.payroll_year == data.payroll_year).OrderByDescending(a => a.returned_dttm).FirstOrDefault();

        //        if (payrollregistryaccounting_hdr_ret_tbl == null)
        //        {
        //            voucher_nbr = "";
        //        }
        //        else
        //        {
        //            voucher_nbr = payrollregistryaccounting_hdr_ret_tbl.voucher_nbr;
        //        }
               


        //        return Json(new { message, sp_payrollregistryaccounting_hdr_tbl_list, voucher_nbr }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        object sp_payrollregistryaccounting_hdr_tbl_list = null;
        //        string message = ex.Message;
        //        message = "fail";
        //        return Json(new { message, sp_payrollregistryaccounting_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult RetrieveDataScan(string par_payroll_registry_nbr)
        {
            try
            {
                string message = "";
                var sp_payrollregistryaccounting_hdr_tbl_list = db_pacco.sp_payrollregistryaccounting_hdr_tbl_list_payroll_registry_nbr(par_payroll_registry_nbr).FirstOrDefault();
                object payroll_template = new object();


                if (sp_payrollregistryaccounting_hdr_tbl_list.payrolltemplate_type.ToString() == "01")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == sp_payrollregistryaccounting_hdr_tbl_list.employment_type.ToString() && (a.payrolltemplate_type == "01" || a.payrolltemplate_type == "07")).ToList();
                }

                else if (sp_payrollregistryaccounting_hdr_tbl_list.payrolltemplate_type.ToString() == "02")
                {
                    payroll_template = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == sp_payrollregistryaccounting_hdr_tbl_list.employment_type.ToString() && a.payrolltemplate_type == "08").ToList();
                }

                message = "success";
                return Json(new { message, sp_payrollregistryaccounting_hdr_tbl_list, payroll_template }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                object sp_payrollregistryaccounting_hdr_tbl_list = null;
                string message = ex.Message;
                message = "fail";
                return Json(new { message, sp_payrollregistryaccounting_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        //                      E N D     O F     C O D E
        //*********************************************************************//
    }
}