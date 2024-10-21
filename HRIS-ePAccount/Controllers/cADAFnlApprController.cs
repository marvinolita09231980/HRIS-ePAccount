// **********************************************************
// Page Name    : ADA Final Authorization in PTO
// Purpose      : To Authorize the Trasmitted ADA
// Created By   : Joseph M. Tombo Jr.
// Created Date : March 11, 2021
// Updated Date : -- -- ---
// ***********************************************************
using HRIS_ePAccount.Filter;
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;


namespace HRIS_ePAccount.Controllers
{
    [SessionExpire]
    public class cADAFnlApprController : Controller
    {
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/11/2021
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["id"] == null)
            {
                Response.Redirect("../");
            }
            else
            {
                if (Session["PreviousValuesonPage_cADAFnIAppr"] == null)
                    Session["PreviousValuesonPage_cADAFnIAppr"] = "";
                else if (Session["PreviousValuesonPage_cADAFnIAppr"].ToString() != string.Empty)
                {
                    string[] prevValues = Session["PreviousValuesonPage_cADAFnIAppr"].ToString().Split(new char[] { ',' });
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
            }
            
            return View(um);
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03-11-2021
        // Description : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_doc_type)
        {
            var department_code = Session["department_code"].ToString();
            if (Session["PreviousValuesonPage_cADAFnIAppr"] == null || Session["PreviousValuesonPage_cADAFnIAppr"].ToString() == "")
            {
                string[] prevValues = Session["PreviousValuesonPage_cADAFnIAppr"].ToString().Split(new char[] { ',' });
                var empType                     = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list     = db_pacco.sp_ada_authorization_list(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString().PadLeft(2,'0'), "ADA").ToList();
                string userid                   = Session["user_id"].ToString();
                return JSON(new { empType, userid, sp_cashadv_hdr_tbl_list, prevValues, department_code }, JsonRequestBehavior.AllowGet);

            }
            else
            {
                string[] prevValues = Session["PreviousValuesonPage_cADAFnIAppr"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;
                
                var empType                 = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_ada_authorization_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim()).ToList();
                string userid               = Session["user_id"].ToString();
                return JSON(new { empType, userid, sp_cashadv_hdr_tbl_list, prevValues, department_code }, JsonRequestBehavior.AllowGet);

            }
        }


        //*********************************************************************//
        // Created By : JMTJR- Created Date :03/11/2021
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult RetrieveListGrid(string par_year, string par_month, string par_doc_type)
        {
            try
            {
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_ada_authorization_list(par_year, par_month, par_doc_type).ToList();
                return JSON(new { sp_cashadv_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Approved_ADA_OR_CA(string par_ca_ctrl_nbr, string par_ca_status, string par_date, string par_time)
        {

            try
            {
                var datarow = db_pacco.cashadv_hdr_tbl.Where(a => a.ca_ctrl_nbr == par_ca_ctrl_nbr).FirstOrDefault();
                DateTime time_downloaded = DateTime.Parse(par_time.Trim());
                DateTime day_downloaded = DateTime.Parse(par_date.Trim()).Add(time_downloaded.TimeOfDay);
                if (datarow != null)
                {
                    datarow.ca_status       = "F";
                    datarow.updated_dttm    = day_downloaded;
                    datarow.updated_user_id = Session["user_id"].ToString().Trim();
                }
                db_pacco.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(ex.Message, JsonRequestBehavior.AllowGet);
            }
           
        }

        //*********************************************************************//
        // Created By : JMTJR- Created Date :03/11/2021
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cCashAdv
            (
             string par_remittance_year
            ,string par_remittance_month
            ,string par_remittance_month_descr
            ,string par_employment_type
            ,string par_employment_type_descr
            ,string par_ca_voucher_nbr
            ,string par_show_entries
            ,string par_page_nbr
            ,string par_search
            ,string par_ca_status
            ,string par_ca_status_descr
            ,string par_ctrl_nbr
            )
        {
            var PreviousValuesonPage_cCashAdv =     par_remittance_year
                                                + "," + par_remittance_month
                                                + "," + par_remittance_month_descr
                                                + "," + par_employment_type
                                                + "," + par_employment_type_descr
                                                + "," + par_ca_voucher_nbr
                                                + "," + par_show_entries
                                                + "," + par_page_nbr
                                                + "," + par_search
                                                + "," + par_ca_status
                                                + "," + par_ca_status_descr
                                                + "," + par_ctrl_nbr;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cADAFnIAppr"] = PreviousValuesonPage_cCashAdv;
            return Json(PreviousValuesonPage_cCashAdv, JsonRequestBehavior.AllowGet);
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
    }
}