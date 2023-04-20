// **********************************************************
// Page Name    : ADA Final Authorization in PTO
// Purpose      : To Authorize the Trasmitted ADA
// Created By   : Joseph M. Tombo Jr.
// Created Date : March 11, 2021
// Updated Date : -- -- ---
// ***********************************************************
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cADAFnlApprDTLController : Controller
    {
        //
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            else
            {
                if (Session["PreviousValuesonPage_cADAFnlAppr"] == null)
                    Session["PreviousValuesonPage_cADAFnlAppr"] = "";
                else if (Session["PreviousValuesonPage_cADAFnlAppr"].ToString() != string.Empty)
                {
                    string[] prevValues = Session["PreviousValuesonPage_cADAFnlAppr"].ToString().Split(new char[] { ',' });
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
            if (Session["PreviousValuesonPage_cADAFnIAppr"] == null || Session["PreviousValuesonPage_cADAFnIAppr"].ToString() == "")
            {
                string[] prevValues = Session["PreviousValuesonPage_cADAFnIAppr"].ToString().Split(new char[] { ',' });
                var empType                 = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list("","","").ToList();
                var sp_cashadv_dtl_tbl_list = db_pacco.sp_cashadv_dtl_tbl_list("","","","").ToList();
                var ca_type                 = db_pacco.sp_cashadv_type_tbl_list().ToList();
                var fundsource              = db_pacco.sp_cashadv_fund_tbl_list().ToList();
                string userid               = Session["user_id"].ToString();
                var payrolltemplate         = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == "").ToList();
                return Json(new { fundsource,ca_type, empType, userid, sp_cashadv_hdr_tbl_list, prevValues, sp_cashadv_dtl_tbl_list, payrolltemplate }, JsonRequestBehavior.AllowGet);

            }
            else
            {
                string[] prevValues         = Session["PreviousValuesonPage_cADAFnIAppr"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues          = prevValues;
                
                var empType                 = db_pacco.vw_employmenttypes_tbl_list.ToList();
                var sp_cashadv_hdr_tbl_list = db_pacco.sp_cashadv_hdr_tbl_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim()).ToList();
                var sp_cashadv_dtl_tbl_list = db_pacco.sp_cashadv_dtl_tbl_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim(), prevValues[11].ToString().Trim()).ToList();
                var ca_type                 = db_pacco.sp_cashadv_type_tbl_list().ToList();
                var fundsource              = db_pacco.sp_cashadv_fund_tbl_list().ToList();
                string userid               = Session["user_id"].ToString();
                string par_empl_type        = prevValues[3].ToString();
                var payrolltemplate         = db_pacco.vw_payrolltemplate_tbl_list.Where(a => a.employment_type == par_empl_type && a.payrolltemplate_type == "01").ToList();
                return Json(new { fundsource, ca_type, empType, userid, sp_cashadv_hdr_tbl_list, prevValues, sp_cashadv_dtl_tbl_list, payrolltemplate }, JsonRequestBehavior.AllowGet);

            }
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