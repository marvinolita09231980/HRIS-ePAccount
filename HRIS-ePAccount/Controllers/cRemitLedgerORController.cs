using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Controllers
{
    public class cRemitLedgerORController : Controller
    {
        
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        public string url_name = "cRemitLedgerOR";
      
        User_Menu um;
      
        public ActionResult Index()
        {
            um = new User_Menu();
            if (Session["user_id"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            if (Session["PreviousValuesonPage_cRemitLedger"] == null)
                Session["PreviousValuesonPage_cRemitLedger"] = "";
            else if (Session["PreviousValuesonPage_cRemitLedger"].ToString() != string.Empty)
            {
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;
            }

            var menu = db_pacco.sp_user_menu_access_role_list(Session["user_id"].ToString(), 5).Where(a =>
               a.url_name == url_name).ToList();

            if (menu[0].url_name != "")
            {
                if (with_Access(menu[0]))
                {
                    assignAccess(menu[0]);
                }
                else
                {
                    Session.Remove("access");
                    return RedirectToAction("noAccess", "cErrorPages");
                }
            }
            return View(um);
        }
        public void assignAccess(sp_user_menu_access_role_list_Result menu)
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
        public Boolean with_Access(sp_user_menu_access_role_list_Result menu)
        {

            var count = 0;
            if (menu.allow_add == 1) count += 1;
            if (menu.allow_edit == 1) count += 1;
            if (menu.allow_delete == 1) count += 1;
            if (menu.allow_print == 1) count += 1;
            if (menu.allow_view == 1) count += 1;
            if (menu.allow_edit_history == 1) count += 1;

            if (count > 0)
            {
                return true;
            }
            else
            {
                return false;
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
        public ActionResult InitializeData(string par_empType)
        {
           
            if (Session["PreviousValuesonPage_cRemitLedger"] == null || Session["PreviousValuesonPage_cRemitLedger"].ToString() == "")
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                var empType = db_pacco.sp_employmenttypes_tbl_list4().ToList();
                var sp_sp_remittance_hdr_tbl_list = db_pacco.sp_remittance_or_posting_hdr_tbl_list("", "", "").ToList();
                var sp_remittance = db_pacco.sp_remittancetype_tbl_list(par_empType).ToList();
                string userid = Session["user_id"].ToString();
                return JSON(new { sp_remittance, empType, userid, sp_sp_remittance_hdr_tbl_list, prevValues}, JsonRequestBehavior.AllowGet);

            }
            else
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;

                var empType = db_pacco.sp_employmenttypes_tbl_list4().ToList();
                var sp_sp_remittance_hdr_tbl_list = db_pacco.sp_remittance_or_posting_hdr_tbl_list(prevValues[0].ToString().Trim(), prevValues[1].ToString().Trim(), prevValues[3].ToString().Trim()).ToList();
                var sp_remittance = db_pacco.sp_remittancetype_tbl_list(prevValues[3].ToString().Trim()).ToList();
                string userid = Session["user_id"].ToString();
                return JSON(new { sp_remittance, empType, userid, sp_sp_remittance_hdr_tbl_list, prevValues }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult RetrieveListGrid(string par_year, string par_month, string par_empType)
        {
            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                var sp_sp_remittance_hdr_tbl_list = db_pacco.sp_remittance_or_posting_hdr_tbl_list(par_year, par_month, par_empType).ToList();
                return JSON(new { sp_sp_remittance_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult PreviousValuesonPage_cRemitLedger
           (
            string par_remittance_year
           , string par_remittance_month
           , string par_remittance_month_descr
           , string par_employment_type
           , string par_employment_type_descr
           , string par_remittancetype_code
           , string par_remittancetype_code_descr
           , string par_remittance_ctrl_nbr
           , string par_remittance_status
           , string par_remittance_status_descr
           , string par_show_entries
           , string par_page_nbr
           , string par_search
           )
        {
            var PreviousValuesonPage_cRemitLedger = par_remittance_year
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
    }
}