using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cRemitLedgerController : Controller
    {
        
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (Session["PreviousValuesonPage_cRemitLedger"] == null)
                Session["PreviousValuesonPage_cRemitLedger"] = "";
            else if (Session["PreviousValuesonPage_cRemitLedger"].ToString() != string.Empty)
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;
            }

            if (um != null || um.ToString() != "")
            {
                um.allow_add            = (int)Session["allow_add"];
                um.allow_delete         = (int)Session["allow_delete"];
                um.allow_edit           = (int)Session["allow_edit"];
                um.allow_edit_history   = (int)Session["allow_edit_history"];
                um.allow_print          = (int)Session["allow_print"];
                um.allow_view           = (int)Session["allow_view"];
                um.url_name             = Session["url_name"].ToString();
                um.id                   = (int)Session["id"];
                um.menu_name            = Session["menu_name"].ToString();
                um.page_title           = Session["page_title"].ToString();
            }
            return View(um);
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_empType)
        {
            string allowAdd     = Session["allow_add"].ToString();
            string allowDelete  = Session["allow_delete"].ToString();
            string allowEdit    = Session["allow_edit"].ToString();
            string allowPrint   = Session["allow_print"].ToString();
            string allowView    = Session["allow_view"].ToString();

            if (Session["PreviousValuesonPage_cRemitLedger"] == null || Session["PreviousValuesonPage_cRemitLedger"].ToString() == "")
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                var empType = db_pacco.sp_employmenttypes_tbl_list4().ToList();
                var sp_sp_remittance_hdr_tbl_list = db_pacco.sp_remittance_hdr_tbl_list("","","").ToList();
                var sp_remittance = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();
                string userid = Session["user_id"].ToString();
                return Json(new { sp_remittance,empType, userid, sp_sp_remittance_hdr_tbl_list, prevValues, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);

            }
            else
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;

                var empType = db_pacco.sp_employmenttypes_tbl_list4().ToList();
                var sp_sp_remittance_hdr_tbl_list = db_pacco.sp_remittance_hdr_tbl_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim()).ToList();
                var sp_remittance = db_pacco.sp_remittancetype_tbl_list(prevValues[3].ToString().Trim()).ToList();
                string userid = Session["user_id"].ToString();
                return Json(new { sp_remittance, empType, userid, sp_sp_remittance_hdr_tbl_list,prevValues, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult SelectEmploymentType(string par_empType)
        {
            try
            {
                var sp_remittance = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();
                return Json(new { sp_remittance }, JsonRequestBehavior.AllowGet);
                
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveListGrid(string par_year, string par_month, string par_empType)
        {
            try
            {
                var sp_sp_remittance_hdr_tbl_list = db_pacco.sp_remittance_hdr_tbl_list(par_year, par_month, par_empType).ToList();
                return Json(new { sp_sp_remittance_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get The Last Row of The Table
        //*********************************************************************//
        public ActionResult GettheLastRowOfTheTable(string par_remittancetype_code)
        {
            var data = db_pacco.sp_get_next_remittance_ctrl_nbr(par_remittancetype_code).ToList().FirstOrDefault();
            return Json(data, JsonRequestBehavior.AllowGet);
            
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase
            (
              string par_remittance_ctrl_nbr
            , string par_remittance_year
            , string par_remittance_month
            , string par_employment_type
            , string par_remittancetype_code
            , string par_remittance_descr
            , string par_remittance_status
            , string par_remittance_dttm_created
            , string par_user_id_created_by
            , string par_remittance_dttm_updated
            , string par_user_id_updated_by
            , string par_remittance_dttm_released
            , string par_user_id_released_by
            , string par_remittance_dttm_remitted
            , string par_user_id_remitted_by
            )
            
        {
            try
            {
                string defaultdate = "1900-01-01";
                remittance_hdr_tbl tbl = new remittance_hdr_tbl();
                
                tbl.remittance_ctrl_nbr           = par_remittance_ctrl_nbr;
                tbl.remittance_year               =  par_remittance_year          ;
                tbl.remittance_month              =  par_remittance_month         ;
                tbl.employment_type               =  par_employment_type          ;
                tbl.remittancetype_code           =  par_remittancetype_code      ;
                tbl.remittance_descr              =  par_remittance_descr         ;
                tbl.remittance_status             =  par_remittance_status        ;
                tbl.remittance_dttm_created       = DateTime.Now;
                tbl.user_id_created_by            = Session["user_id"].ToString() ;
                tbl.remittance_dttm_updated       = par_remittance_dttm_updated == "" || par_remittance_dttm_updated == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_remittance_dttm_updated);
                tbl.user_id_updated_by            = par_user_id_updated_by            ;
                tbl.remittance_dttm_released      = par_remittance_dttm_released == "" || par_remittance_dttm_released == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_remittance_dttm_released);
                tbl.user_id_released_by           = par_user_id_released_by           ;
                tbl.remittance_dttm_remitted      = par_remittance_dttm_remitted == "" || par_remittance_dttm_remitted == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_remittance_dttm_remitted);
                tbl.user_id_remitted_by           = par_user_id_remitted_by;
                db_pacco.remittance_hdr_tbl.Add(tbl);
            
                db_pacco.SaveChanges();
                return Json(new { success = 1 }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException)
            {
                return Json(new { success = 0 } , JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_remittance_ctrl_no, string par_remittancetype_code)
        {
            try
            {
                var header_table = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).FirstOrDefault();
                db_pacco.remittance_hdr_tbl.Remove(header_table);
               
                db_pacco.SaveChanges();
                
                switch (par_remittancetype_code)
                {
                    case "01"://GSIS Details
                        var details_gsis = db_pacco.remittance_dtl_gsis_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_gsis_tbl.RemoveRange(details_gsis);

                        var details_gsis1 = db_pacco.remittance_dtl_gsis_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_gsis_month_tbl.RemoveRange(details_gsis1);
                        db_pacco.SaveChanges();

                        db_pacco.sp_delete_in_remittance_dtl_gsis_upd_tbl(par_remittance_ctrl_no);
                        
                        break;
                    case "02": // HDMF Details
                    case "03":
                    case "04":
                    case "05":
                    case "06":
                        var details_hdmf = db_pacco.remittance_dtl_hdmf_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_hdmf_tbl.RemoveRange(details_hdmf);

                        var details_hdmf1 = db_pacco.remittance_dtl_hdmf_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_hdmf_month_tbl.RemoveRange(details_hdmf1);

                        db_pacco.SaveChanges();
                        break;
                    case "07":// PHIC Details
                        var details_phic = db_pacco.remittance_dtl_phic_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_phic_tbl.RemoveRange(details_phic);

                        var details_phic1 = db_pacco.remittance_dtl_phic_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_phic_month_tbl.RemoveRange(details_phic1);

                        db_pacco.sp_delete_in_remittance_dtl_phic_upd_tbl(par_remittance_ctrl_no);
                        db_pacco.SaveChanges();
                        break;
                    case "08":// SSS Details
                        var details_sss = db_pacco.remittance_dtl_sss_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_sss_tbl.RemoveRange(details_sss);

                        var details_sss1 = db_pacco.remittance_dtl_sss_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_sss_month_tbl.RemoveRange(details_sss1);

                        db_pacco.SaveChanges();
                        break;
                    case "09": // Other Details
                    case "10":
                    case "11":
                    case "12":
                    case "13":
                    case "17":
                        var details_oth = db_pacco.remittance_dtl_others_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_others_tbl.RemoveRange(details_oth);

                        var details_oth1 = db_pacco.remittance_dtl_others_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_others_month_tbl.RemoveRange(details_oth1);

                        db_pacco.SaveChanges();
                        break;
                    case "14":
                        var details_tax = db_pacco.remittance_dtl_tax_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_tax_tbl.RemoveRange(details_tax);
                        var details_tax1 = db_pacco.remittance_dtl_tax_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_tax_month_tbl.RemoveRange(details_tax1);
                        db_pacco.SaveChanges();
                        break;

                    case "15":
                        var details_cna = db_pacco.remittance_dtl_cna_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_cna_tbl.RemoveRange(details_cna);
                        db_pacco.SaveChanges();
                        break;
                    case "16":
                        var details_lbp = db_pacco.remittance_dtl_lbp_month_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_lbp_month_tbl.RemoveRange(details_lbp);
                        var details_lbp1 = db_pacco.remittance_dtl_lbp_month_ovrd_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_no).ToList();
                        db_pacco.remittance_dtl_lbp_month_ovrd_tbl.RemoveRange(details_lbp1);
                        db_pacco.SaveChanges();
                        break;
                }


                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
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
                return Json(message, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 09/19/2019
        // Description : Update From Database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase
            (
              string par_remittance_ctrl_nbr
            , string par_remittance_year
            , string par_remittance_month
            , string par_employment_type
            , string par_remittancetype_code
            , string par_remittance_descr
            , string par_remittance_status
            , string par_remittance_dttm_created
            , string par_user_id_created_by
            , string par_remittance_dttm_updated
            , string par_user_id_updated_by
            , string par_remittance_dttm_released
            , string par_user_id_released_by
            , string par_remittance_dttm_remitted
            , string par_user_id_remitted_by
            )

        {
            try
            {
                //Update payroll registry details
                
                string defaultdate = "1900-01-01";

                remittance_hdr_tbl tbl = db_pacco.remittance_hdr_tbl.Where(a => a.remittance_ctrl_nbr == par_remittance_ctrl_nbr).SingleOrDefault();
                tbl.remittance_ctrl_nbr           = par_remittance_ctrl_nbr        ;
                tbl.remittance_year               = par_remittance_year            ;
                tbl.remittance_month              = par_remittance_month           ;
                tbl.employment_type               = par_employment_type            ;
                tbl.remittancetype_code           = par_remittancetype_code        ;
                tbl.remittance_descr              = par_remittance_descr           ;
                tbl.remittance_status             = par_remittance_status          ;
                //tbl.remittance_dttm_created       = DateTime.Now;
                //tbl.user_id_created_by            = Session["user_id"].ToString() ;
                tbl.remittance_dttm_updated       = DateTime.Now;
                tbl.user_id_updated_by            = Session["user_id"].ToString();
                tbl.remittance_dttm_released      = par_remittance_dttm_released == "" || par_remittance_dttm_released == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_remittance_dttm_released);
                tbl.user_id_released_by           = par_user_id_released_by           ;
                tbl.remittance_dttm_remitted      = par_remittance_dttm_remitted == "" || par_remittance_dttm_remitted == null ? Convert.ToDateTime(defaultdate) : Convert.ToDateTime(par_remittance_dttm_remitted);
                tbl.user_id_remitted_by           = par_user_id_remitted_by;
                
                db_pacco.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
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
                return Json(message, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult ExtracData
            (
             string par_remittance_year
            ,string par_remittance_month
            ,string par_employment_type
            ,string par_remittance_ctrl_no
            )
        {
            var extracted_data = db_pacco.sp_payrollregistry_extract_insert_phic(par_remittance_year, par_remittance_month, par_employment_type, par_remittance_ctrl_no).ToString();
            return Json(extracted_data, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cRemitLedger
            (
             string par_remittance_year
            ,string par_remittance_month
            ,string par_remittance_month_descr
            ,string par_employment_type
            ,string par_employment_type_descr
            ,string par_remittancetype_code
            ,string par_remittancetype_code_descr
            ,string par_remittance_ctrl_nbr
            ,string par_remittance_status
            ,string par_remittance_status_descr
            ,string par_show_entries
            ,string par_page_nbr
            ,string par_search
            )
        {
            var PreviousValuesonPage_cRemitLedger =     par_remittance_year
                                                + "," + par_remittance_month
                                                + "," + par_remittance_month_descr
                                                + "," + par_employment_type
                                                + "," + par_employment_type_descr
                                                + "," + par_remittancetype_code
                                                + "," + par_remittancetype_code_descr
                                                + "," + par_remittance_ctrl_nbr
                                                + "," + par_remittance_status
                                                + "," + par_remittance_status_descr
                                                + "," + par_show_entries
                                                + "," + par_page_nbr
                                                + "," + par_search;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cRemitLedger"] = PreviousValuesonPage_cRemitLedger;
            return Json(PreviousValuesonPage_cRemitLedger, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 2021-07-21
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveGrandTotal(string par_remittance_ctrl_nbr)
        {
            try
            {
                var message = "success";
                var data = db_pacco.sp_remittance_grand_totals_list(par_remittance_ctrl_nbr).ToList().FirstOrDefault();

                if (data == null)
                {
                    message = "error";
                }

                return Json(new { message,data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        //                      E N D     O F     C O D E
        //*********************************************************************//
    }
}