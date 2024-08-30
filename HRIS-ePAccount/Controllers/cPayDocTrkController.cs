//using HRIS_ePAccount.Models;
//using System;
//using System.Collections.Generic;
//using System.Data.Entity.Validation;
//using System.Linq;
//using System.Web;
//using System.Web.Mvc;

using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Excel = Microsoft.Office.Interop.Excel;
using System.Web.Script.Serialization;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Web.UI;
using System.IO;
using System.Drawing;
using System.Threading.Tasks;
using System.Text;

namespace HRIS_ePAccount.Controllers
{
    public class cPayDocTrkController : Controller
    {
        
        HRIS_PACCO_DEVEntities db_pacco = new HRIS_PACCO_DEVEntities();
        string role_id = "";

        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            //if (Session["PreviousValuesonPage_cRemitLedger"] == null)
            //    Session["PreviousValuesonPage_cRemitLedger"] = "";
            //else if (Session["PreviousValuesonPage_cRemitLedger"].ToString() != string.Empty)
            //{
            //    string[] prevValues = Session["PreviousValuesonPage_cRemitLedger"].ToString().Split(new char[] { ',' });
            //    ViewBag.prevValues = prevValues;
            //}
            
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
        public ActionResult Initialize()
        {
            var department_code = Session["department_code"].ToString();
            var message = "";
            var user_id = Session["user_id"].ToString();
            //Updated By: Joseph M. Tombo Jr. 12-15-2020
            //Initialize count into 0
            //---------------------------------
            Session["saving_count"] = 0;
            //----------------------------------
            try
            {

                db_pacco.Database.CommandTimeout = int.MaxValue;
                role_id         = Session["role_id"].ToString();

                //var route       = db_pacco.sp_doc_act_rte_desc(user_id).OrderBy(a => a.route_ctrl_nbr).ToList();
                //Updated By: Joseph
                var route       = db_pacco.idoc_rte_tbl.Where(a => a.role_id == role_id).OrderBy(a => a.rte_code).ToList();

                var departments = db_pacco.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();

                if (route.Count > 0)
                {
                    //Session["route_ctrl_nbr"] = route.FirstOrDefault().route_ctrl_nbr;
                    //Updated By: Joseph
                    Session["route_ctrl_nbr"] = route.FirstOrDefault().rte_code;
                }
                //var ToReceive =   db_pacco.sp_doc_trk_act_tbl_2be_rcvd(role_id).ToList();
                //var ToRelease = db_pacco.sp_doc_trk_act_tbl_2be_rlsd(role_id).ToList();


                //******  --Updated by Marvin Olita August 21, 2020 09:06 AM             ****///
                //******  --change stored procedure to view                              ****///
                //******  --sp_doc_trk_act_tbl_2be_rcvd to vw_doc_trk_act_tbl_2be_rcvd   ****///
                //******  --sp_doc_trk_act_tbl_2be_rlsd to vw_doc_trk_act_tbl_2be_rlsd   ****///
                //var ToReceive = db_pacco.vw_doc_trk_act_tbl_2be_rcvd.Where(a => a.role_id == role_id).ToList();
                //var ToRelease = db_pacco.vw_doc_trk_act_tbl_2be_rlsd.Where(a => a.role_id == role_id).ToList();


                //Updated by: Joseph M. Tombo Jr. 03-16-2021
                var ToReceive = db_pacco.vw_idoc_trk_tbl_2be_rcvd.Where(a => a.role_id == role_id).ToList();
                var ToRelease = db_pacco.vw_idoc_trk_tbl_2be_rlsd.Where(a => a.role_id == role_id).ToList();

                var docfundcode = db_pacco.vw_cashadv_fund_sub_tbl;
                message = "success";
                return JSON(new { ToReceive, ToRelease, message, department_code, departments, docfundcode, role_id, route }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                message = ex.Message;
                return JSON(message, JsonRequestBehavior.AllowGet);

            }
        }


        //*********************************************************************//
        // Created By : Marvin - Created Date : 2020-01-30
        // Description : Get where to return or release...
        //*********************************************************************//
        public ActionResult ReturnReleaseRouting(string rte_code,string docctrlnbr)
        {

            db_pacco.Database.CommandTimeout = int.MaxValue;
            DateTime date_tm    = DateTime.Now;
            var dt_tm           = String.Format("{0:yyyy-MM-dd HH:mm:ss}", date_tm);
            var dept            = Session["department_code"].ToString();
            var message         = "";
            try
            {
                var release_route = db_pacco.sp_idoc_trk_release_2_route(rte_code, docctrlnbr).ToList();
                var return_route = db_pacco.sp_idoc_trk_return_2_route(rte_code, docctrlnbr).ToList();

                //Updated By: Joseph M. Tombo Jr. 03-17-2021 kani ang tama
                //var release_route = db_pacco.sp_idoc_trk_release_2_route(docctrlnbr).ToList();
                //var return_route = db_pacco.sp_idoc_trk_return_2_route(docctrlnbr).ToList();

                var nbr_list = db_pacco.vw_document_tracking_nbrs_tbl_PACCO.ToList();
                var ca_voucher_list = db_pacco.cashadv_hdr_tbl.ToList();
                message = "success";
                return JSON(new { message, release_route, return_route, nbr_list, ca_voucher_list, dt_tm }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

         //doc_check_nbr              : null
         //doc_ctrl_nbr               : "014153"
         //doc_fund_subcode           : "105"
         //doc_obr_nbr                : "100-20-10-16270"
         //doc_othr_info              : null
         //doc_voucher_nbr            : null
         //docmnt_type_source         : "01-P"
         //document_status            : "VA"
         //document_status_descr      : "For Receiving - Payroll"
         //document_status_ret        : null
         //gross_pay                  : 40812
         //net_pay                    : 35951.03
         //obr_tot_amt                : 40812
         //payroll_month              : "09"
         //payroll_registry_descr     : "BONILLA, JOEL A. ET, AL"
         //payroll_year               : "2020"
         //payrolltemplate_code       : "011"
         //payrolltemplate_descr      : "2nd Quincena Payroll"
         //remarks                    : "AUDIT - Payroll - Received"
         //remarks_ret                : null
         //rlsd_retd_2_route_ctrl_nbr : 3
         //route_ctrl_nbr             : 2
         //route_seq                  : 2
      



            //a_flag: "L"
            //doc_fund_subcode: null
            //doc_nbr: "7890"
            //dttm: {10/20/2020 1:20:48 PM}
            //nbr: 0
            //remarks: "AUDIT - Payroll - Received"
            //ToRelease_route: 0
            //ToReturn_route: 0
        //public ActionResult sp_document_tracking_nbrs_tbl_update(sp_doc_trk_act_tbl_2be_rlsd_Result det, DocTrack dt, bool doc_nbr_show)
        public ActionResult sp_document_tracking_nbrs_tbl_update(vw_idoc_trk_tbl_2be_rlsd det, DocTrack dt, bool doc_nbr_show) //Updated By: Joseph 03-17-2021
        {
            role_id     = Session["role_id"].ToString();
            var dept    = Session["department_code"].ToString();
            var userid  = Session["user_id"].ToString();
            var message = "";

            var doctype = det.docmnt_type.Split(new char[] { '-' })[0];
            try
            {
              
                    //if ((role_id == "501" || role_id == "500" || role_id == "502" ) && doc_nbr_show == true && ISNULL(dt.doc_nbr, "") != "")
                    //if ((role_id == "501" || role_id == "500" || role_id == "502" || role_id == "508") && doc_nbr_show == true && ISNULL(dt.doc_nbr, "") != "") //Updated By: Joseph
                    if ((role_id == "501" || role_id == "500" || role_id == "502" || role_id == "508")) //Updated By: Joseph
                    {
                        //db_pacco.sp_doc_trk_nbrs_tbl_update(
                        //    det.doc_ctrl_nbr
                        //    , ISNULL(dt.doc_fund_subcode, "")
                        //    , ISNULL(dt.doc_nbr, "")
                        //    , "07"
                        //    , Convert.ToDateTime(dt.dttm)
                        //    , userid
                        //);
                        //Updated By: Joseph 03-17-2021


                    db_pacco.sp_idoc_trk_nbrs_tbl_update
                        (
                            det.doc_ctrl_nbr
                            , ISNULL(dt.doc_fund_subcode, "")
                            , ISNULL(dt.doc_nbr, "")
                            , ISNULL(dt.doc_cafoa, "")
                            , "07"
                            , Convert.ToDateTime(dt.dttm)
                            , userid
                        );
                    }

               
                message = "success";
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult sp_cashadv_hdr_tbl_update(vw_idoc_trk_tbl_2be_rlsd det, DocTrack dt)
        {
            role_id     = Session["role_id"].ToString();
            var dept    = Session["department_code"].ToString();
            var userid  = Session["user_id"].ToString();
            var message = "";

            var doctype = det.docmnt_type.Split(new char[] { '-' })[0];
            try
            {

                if (doctype == "02" && (role_id == "501" || role_id == "502" || role_id == "500" || role_id == "508") && ISNULL(dt.doc_nbr, "") != "")
                {
                    db_pacco.sp_cashadv_hdr_tbl_update(
                             det.doc_ctrl_nbr
                           , ISNULL(dt.doc_nbr, "")
                      );
                }
                message = "success";
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //public ActionResult SaveRoute(sp_doc_trk_act_tbl_2be_rlsd_Result det, DocTrack dt, bool change_date, int nextroute)
        public ActionResult SaveRoute(vw_idoc_trk_tbl_2be_rlsd det, DocTrack dt, bool change_date, string nextroute)
        {
            role_id             = Session["role_id"].ToString();

            DateTime date_tm    = DateTime.Now;
            var dt_tm           = String.Format("{0:yyyy-MM-dd HH:mm:ss}", date_tm);
            role_id             = Session["role_id"].ToString();

            var message         = "";
            var icon            = "";
            var remarks         = "";
            var doc_status      = "";
            var swl             = "";
            string refresh_grid = "N";
            if (dt.a_flag == "V")
            {
                remarks     = dt.remarks;
                doc_status  = det.doc_status;
                swl         = "Successfully received";
            }
            else if (dt.a_flag == "L")
            {
                remarks     = dt.remarks;
                doc_status  = det.doc_status;
                swl         = "Successfully released";
            }
            else if (dt.a_flag == "T")
            {
                //remarks     = det.doc_remarks;
                remarks     = dt.remarks;
                //doc_status  = det.doc_status;
                doc_status  = dt.a_flag;
                swl         = "Successfully returned";
                //Updated By: Joseph
                //nextroute = "01"; //RETURNED TO HR FOR FEBRUARY USED ONLY
            }
           
            
            var dtm = "";
            if (role_id == "500")
            {
                if(change_date == true)
                {
                    dtm = dt.dttm.ToString();
                }
                else
                {
                    dtm = dt_tm;
                }
            }
            else
            {
                dtm = dt_tm;
            }
           
            object ToReceive = new object();
            object ToRelease = new object();

            var dept    = Session["department_code"].ToString();
            var userid  = Session["user_id"].ToString();
            //DateTime date_dttm = Convert.ToDateTime(dt.dttm);

            try
            {
               if (det.rte_code != "06" && det.doc_status != "L" && nextroute == "00")
               {
                   swl = "Invalid route!";
                   icon = "error";
               }
               else
               {
                   //ADDED BY JORGE TO CHECK MAX VALUE IN INTERNAL TRACKING FOR FEBRUARY 2021
                   //var check_exists = db_pacco.doc_trk_act_tbl.Where(a => a.doc_ctrl_nbr == det.doc_ctrl_nbr).FirstOrDefault();

                   //Updated By: Joseph M. Tombo Jr. 03-17-2021 New Table
                   var check_exists = db_pacco.idoc_trk_tbl.Where(a => a.doc_ctrl_nbr == det.doc_ctrl_nbr).FirstOrDefault();

                    if (check_exists != null)
                    {
                        //det.route_seq = db_pacco.doc_trk_act_tbl.Where(a => a.doc_ctrl_nbr == det.doc_ctrl_nbr).Max(a => a.route_seq) + 1;

                        det.route_seq = db_pacco.idoc_trk_tbl.Where(a => a.doc_ctrl_nbr == det.doc_ctrl_nbr).Max(a => a.route_seq) + 1;
                    }

                    else
                    {
                        det.route_seq = 1;
                    }

                    //ENDED ADDED BY JORGE: 

                    //doc_trk_act_tbl doc              = new doc_trk_act_tbl();
                    //Updated By: Joseph M. Tombo Jr. 03-17-2021 New Table
                    idoc_trk_tbl doc                = new idoc_trk_tbl();

                   //doc.route_ctrl_nbr               = (int)det.route_ctrl_nbr;
                   doc.rte_code                     = det.rte_code.ToString();

                   doc.route_seq                    = (int)det.route_seq;
                   doc.doc_ctrl_nbr                 = det.doc_ctrl_nbr;
                   doc.doc_dttm                     = Convert.ToDateTime(dtm);
                   doc.doc_user_id                  = userid;
                   doc.doc_remarks                  = remarks;
                   //doc.rlsd_retd_2_route_ctrl_nbr   = nextroute;
                   doc.vlt_code                     = nextroute.ToString();
                   //doc.document_status              = doc_status;
                   doc.doc_status                   = doc_status;
                   db_pacco.idoc_trk_tbl.Add(doc);
                   db_pacco.SaveChanges();
                   icon = "success";
               }

                //ToReceive = db_pacco.sp_doc_trk_act_tbl_2be_rcvd(role_id).ToList();
                //ToRelease = db_pacco.sp_doc_trk_act_tbl_2be_rlsd(role_id).ToList();


               //******  --Updated by Marvin Olita August 21, 2020 09:06 AM             ****///
               //******  --change stored procedure to view                              ****///
               //******  --sp_doc_trk_act_tbl_2be_rcvd to vw_doc_trk_act_tbl_2be_rcvd   ****///
               //******  --sp_doc_trk_act_tbl_2be_rlsd to vw_doc_trk_act_tbl_2be_rlsd   ****///
               var route_ctrl_nbr = Session["route_ctrl_nbr"].ToString();

                //ToReceive = db_pacco.vw_doc_trk_act_tbl_2be_rcvd.Where(a => a.role_id == role_id).ToList();
                //ToRelease = db_pacco.vw_doc_trk_act_tbl_2be_rlsd.Where(a => a.role_id == role_id).ToList();
                //If Count Updated By: Joseph M. Tombo Jr. 12-15-2020
                if (int.Parse(Session["saving_count"].ToString().Trim()) == 4)
                {
                    //Updated By: Joseph M. Tombo Jr. 03-17-2021 OLD CODE
                    //ToReceive = db_pacco.vw_doc_trk_act_tbl_2be_rcvd.Where(a => a.role_id == role_id).ToList();
                    //ToRelease = db_pacco.vw_doc_trk_act_tbl_2be_rlsd.Where(a => a.role_id == role_id).ToList();

                    //Updated By: Joseph M. Tombo Jr. 03-17-2021 New Approach
                    ToReceive = db_pacco.vw_idoc_trk_tbl_2be_rcvd.Where(a => a.role_id == role_id).ToList();
                    ToRelease = db_pacco.vw_idoc_trk_tbl_2be_rlsd.Where(a => a.role_id == role_id).ToList();

                    refresh_grid = "Y";
                    Session["saving_count"] = 0;
                }
                else
                {
                    Session["saving_count"] = (int.Parse(Session["saving_count"].ToString().Trim()) + 1);
                }
                message = swl;

                return JSON(new { message, ToReceive, ToRelease, swl, icon, route_ctrl_nbr, refresh_grid }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return JSON(new { message,icon="error"}, JsonRequestBehavior.AllowGet);
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


        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cMainPage
            (string par_doc_ctrl_nbr
            , string par_ddl_doc_status
            , string par_track_year
            , string par_track_month
            , string par_ddl_reports

            )
        {
            var PreviousValuesonPage_cMainPage = par_doc_ctrl_nbr
                                            + "," + par_ddl_doc_status
                                            + "," + par_track_year
                                            + "," + par_track_month
                                            + "," + par_ddl_reports;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cMainPage"] = PreviousValuesonPage_cMainPage;
            return JSON(PreviousValuesonPage_cMainPage, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 01/21/2020
        // Description: Populate Template Type on Combolist
        ////*********************************************************************//
        public ActionResult RetrieveTemplate(string par_payrolltemplate_code)
        {
            var sp_payrollregistry_template_combolist_TRK = db_pacco.sp_payrollregistryaccounting_template_combolist(par_payrolltemplate_code).ToList();
            return JSON(new { sp_payrollregistry_template_combolist_TRK }, JsonRequestBehavior.AllowGet);
        }


        //*********************************************************************//
        // Created By : VJA - Created Date : 01/21/2020
        // Description: Report for Received, Released and Returned Documents
        // Update Date and By : VJA - 2021-03-18 
        ////*********************************************************************//
        //public ActionResult ReportDocuments(string par_doc_status, DateTime periodfrom, DateTime periodto) --COMMENT BY MARVIN 2024-08-22
        //{
        //    try
        //    {
        //        var dept = Session["department_code"].ToString();
        //        var data = (object)2;

        //        //var par_datefrom = Convert.ToDateTime(periodfrom.ToString()).ToString("yyyy-MM-dd");
        //        //var par_dateto   = Convert.ToDateTime(periodto.ToString()).ToString("yyyy-MM-dd");
        //        var par_datefrom = Convert.ToDateTime(periodfrom.ToString());
        //        var par_dateto = Convert.ToDateTime(periodto.ToString());

        //        if (par_doc_status == "V")
        //        {
        //            data = db_pacco.sp_idoc_trk_tbl_rcvd_list(par_datefrom, par_dateto).ToList();
        //        }
        //        else if (par_doc_status == "L")
        //        {
        //            data = db_pacco.sp_idoc_trk_tbl_rlsd_list(par_datefrom, par_dateto).ToList();
        //        }
        //        else if (par_doc_status == "T")
        //        {
        //            data = db_pacco.sp_idoc_trk_tbl_retd_list(par_datefrom, par_dateto).ToList();
        //        }
        //        Session["history_page"] = Request.UrlReferrer.ToString();

        //        return JSON(new { data }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //*********************************************************************//
        // Created By : VJA - Created Date : 01/21/2020
        // Description: Populate Employment Type
        ////*********************************************************************//
        public ActionResult SelectReportFile(string par_payrolltemplate_code, string par_payrolltemplate_code1)
        {
            try
            {
                
                var reportfile = db_pacco.sp_payrollregistryaccounting_template_combolist(par_payrolltemplate_code).Where(a => a.payrolltemplate_code == par_payrolltemplate_code1).ToList();
                return JSON(new { reportfile }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        ////*********************************************************************//
        //// Created By   : Vincent Jade H. Alivio
        //// Created Date : 02/03/2020
        //// Description  : Delete from table
        ////*********************************************************************//
        //public ActionResult RetriveDocumentSearch(string p_doc_ctrl_nbr, string p_doc_descr, string p_payrolltemplate_code)
        //{
        //    try
        //    {
        //        var message = "";
        //        var search_docs_data = db_pacco.sp_doc_trk_tbl_search(p_doc_ctrl_nbr, p_doc_descr, p_payrolltemplate_code).ToList();

        //        if (search_docs_data.Count > 0)
        //        {
        //            message = "success";
        //        }
        //        else
        //        {
        //            message = "No Data Found !";
        //        }
        //        return Json(new { search_docs_data, message }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 02/03/2020
        // Description  : Delete from table
        // Update Date and By : VJA - 2021-03-18 
        //*********************************************************************//
        public ActionResult RetriveDocumentSearch(string p_search_type, string p_search_text)
        {
            try
            {
                var message = "";
                var search_docs_data = db_pacco.sp_idoc_trk_tbl_search(p_search_type, p_search_text).ToList();

                if (search_docs_data.Count > 0)
                {
                    message = "success";
                }
                else
                {
                    message = "No Data Found !";
                }
                return JSON(new { search_docs_data, message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public String ISNULL(string val,string val2)
        {
            if(val == null)
            {
                return val2;
            }
            else
            {
                return val;
            }
        }
        public DateTime ISNULL2(DateTime val, string val2)
        {
            if (val == null)
            {
                return Convert.ToDateTime(val2);
            }
            else
            {
                return val;
            }
        }
        public int ISNULL3(int val, string val2)
        {
            if (val == 0)
            {
                return Convert.ToInt32(val2);
            }
            else
            {
                return val;
            }
        }


        //*********************************************************************//
        // Created By : VJA - Created Date : 01/21/2020
        // Description: Populate Employment Type
        // Update Date and By : VJA - 2021-03-18 
        ////*********************************************************************//
        public ActionResult RetrieveDocHistory(string p_doc_ctrl_nbr)
        {
            var message = "";
            try
            {
                var doc_type = db_pacco.vw_idoc_trk_tbl_current.Where(a => a.doc_ctrl_nbr == p_doc_ctrl_nbr).FirstOrDefault().docmnt_type;
                // var doc_type = "01";
                string s_doc_type = doc_type;
                var sp_document_tracking_tbl_history = db_pacco.sp_edocument_trk_tbl_history(p_doc_ctrl_nbr, s_doc_type).ToList();
                if (sp_document_tracking_tbl_history.Count > 0)
                {
                    message = "success";
                    Session["history_page"] = Request.UrlReferrer.ToString();
                }
                else
                {

                    message = "No Data for Cash Advance";
                    Session["history_page"] = Request.UrlReferrer.ToString();
                }
                return JSON(new { sp_document_tracking_tbl_history, message, doc_type }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return JSON(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 2020-02-18
        // Description: Extract Regular Monthly Salary
        //*********************************************************************//
        public ActionResult ExtractSalaryRegular(string par_payroll_year,string par_payrollregistry_nbr)
        {
            var filePath = "";

            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/SalaryRegular_Template.xlsx"));
            Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
            object misValue = System.Reflection.Missing.Value;

            try
            {
                var reg_rep = db_pacco.sp_payrollregistry_salary_re_ce_rep(par_payroll_year, par_payrollregistry_nbr, "007").ToList();
                int signatory_pos = reg_rep.Count + 3;
                int rowCounter                      = 1;
                int recordcount                     = 0;

                if (reg_rep.Count > 0)
                {
                    xlApp.DisplayAlerts = false;
                    int start_row = 6;

                    for (int i = 0; i < reg_rep.Count; i++)
                    {
                        xlWorkSheet.get_Range("A" + start_row, "BX" + start_row).Borders.Color = Color.Black;

                        xlWorkSheet.Cells[start_row, 1]  = reg_rep[i].empl_id;
                        xlWorkSheet.Cells[start_row, 2]  = reg_rep[i].employee_name;
                        xlWorkSheet.Cells[start_row, 3]  = reg_rep[i].position_short_title;
                        xlWorkSheet.Cells[start_row, 4]  = "=P" + start_row + "";
                        xlWorkSheet.Cells[start_row, 5]  = reg_rep[i].monthly_rate;
                        xlWorkSheet.Cells[start_row, 6]  = reg_rep[i].pera_amt;
                        xlWorkSheet.Cells[start_row, 7]  = reg_rep[i].lowpay_day;
                        xlWorkSheet.Cells[start_row, 8]  = reg_rep[i].lowp_amount;
                        xlWorkSheet.Cells[start_row, 9]  = reg_rep[i].lowpay_day;
                        xlWorkSheet.Cells[start_row, 10] = reg_rep[i].lowp_amount_pera;
                        xlWorkSheet.Cells[start_row, 11] = reg_rep[i].lates_mins_hrs;
                        xlWorkSheet.Cells[start_row, 12] = reg_rep[i].lates_amount;
                        xlWorkSheet.Cells[start_row, 13] = reg_rep[i].lates_mins_hrs;
                        xlWorkSheet.Cells[start_row, 14] = reg_rep[i].lates_amount_pera;
                        // TOTAL LWOP & UNDERTIME
                        xlWorkSheet.Cells[start_row, 15] = "=H"+ start_row + "+J" + start_row + "+L" + start_row + "+N" + start_row + "";
                        // TOTAL GROSS INCOME
                        xlWorkSheet.Cells[start_row, 16] = "=E"+ start_row + "+F" + start_row + "-O" + start_row + "";
                        xlWorkSheet.Cells[start_row, 17] = reg_rep[i].gsis_gs;
                        xlWorkSheet.Cells[start_row, 18] = reg_rep[i].hdmf_gs;
                        xlWorkSheet.Cells[start_row, 19] = reg_rep[i].phic_gs;
                        xlWorkSheet.Cells[start_row, 20] = reg_rep[i].sif_gs;
                        // TOTAL MANDATORY DEDUCTIONS (GS)
                        xlWorkSheet.Cells[start_row, 21] = "=SUM(Q" + start_row + ":T" + start_row + ")";
                        xlWorkSheet.Cells[start_row, 22] = reg_rep[i].gsis_ps;
                        xlWorkSheet.Cells[start_row, 23] = reg_rep[i].hdmf_ps;
                        xlWorkSheet.Cells[start_row, 24] = reg_rep[i].phic_ps;
                        xlWorkSheet.Cells[start_row, 25] = reg_rep[i].wtax;
                        // TOTAL MANDATORY DEDUCTIONS (PS)
                        xlWorkSheet.Cells[start_row, 26] = "=V" + start_row + "+W" + start_row + "+X" + start_row + "+Y" + start_row + "";
                        xlWorkSheet.Cells[start_row, 27] = reg_rep[i].gsis_uoli;
                        xlWorkSheet.Cells[start_row, 28] = reg_rep[i].gsis_uoli45;
                        xlWorkSheet.Cells[start_row, 29] = reg_rep[i].gsis_uoli50;
                        xlWorkSheet.Cells[start_row, 30] = reg_rep[i].gsis_uoli55;
                        xlWorkSheet.Cells[start_row, 31] = reg_rep[i].gsis_uoli60;
                        xlWorkSheet.Cells[start_row, 32] = reg_rep[i].gsis_uoli65;
                        xlWorkSheet.Cells[start_row, 33] = reg_rep[i].gsis_ehp;
                        xlWorkSheet.Cells[start_row, 34] = reg_rep[i].gsis_hip;
                        xlWorkSheet.Cells[start_row, 35] = reg_rep[i].gsis_ceap;
                        xlWorkSheet.Cells[start_row, 36] = reg_rep[i].gsis_addl_ins;
                        xlWorkSheet.Cells[start_row, 37] = reg_rep[i].sss_ps;
                        xlWorkSheet.Cells[start_row, 38] = reg_rep[i].philamlife_ps;
                        xlWorkSheet.Cells[start_row, 39] = reg_rep[i].hdmf_ps2;
                        xlWorkSheet.Cells[start_row, 40] = reg_rep[i].hdmf_mp2;
                        xlWorkSheet.Cells[start_row, 41] = reg_rep[i].hdmf_loyalty_card;

                        xlWorkSheet.Cells[start_row, 42] = reg_rep[i].other_premium1;
                        xlWorkSheet.Cells[start_row, 43] = reg_rep[i].other_premium2;
                        xlWorkSheet.Cells[start_row, 44] = reg_rep[i].other_premium3;
                        xlWorkSheet.Cells[start_row, 45] = reg_rep[i].other_premium4;
                        xlWorkSheet.Cells[start_row, 46] = reg_rep[i].other_premium5;

                        // TOTAL OPTIONAL CONTRIBUTIONS
                        xlWorkSheet.Cells[start_row, 47] = "=SUM(AA" + start_row + ":AO" + start_row + ")";
                        xlWorkSheet.Cells[start_row, 48] = reg_rep[i].gsis_conso_ln       ;
                        xlWorkSheet.Cells[start_row, 49] = reg_rep[i].gsis_policy_reg_ln  ;
                        xlWorkSheet.Cells[start_row, 50] = reg_rep[i].gsis_policy_opt_ln  ;
                        xlWorkSheet.Cells[start_row, 51] = reg_rep[i].gsis_uoli_ln        ;
                        xlWorkSheet.Cells[start_row, 52] = reg_rep[i].gsis_emergency_ln   ;
                        xlWorkSheet.Cells[start_row, 53] = reg_rep[i].gsis_educ_asst_ln   ;
                        xlWorkSheet.Cells[start_row, 54] = reg_rep[i].hdmf_mpl_ln         ;
                        xlWorkSheet.Cells[start_row, 55] = reg_rep[i].hdmf_hse_ln         ;
                        xlWorkSheet.Cells[start_row, 56] = reg_rep[i].hdmf_cal_ln         ;
                        xlWorkSheet.Cells[start_row, 57] = reg_rep[i].gsis_ecard_ln       ;
                        xlWorkSheet.Cells[start_row, 58] = reg_rep[i].gsis_real_state_ln  ;
                        xlWorkSheet.Cells[start_row, 59] = reg_rep[i].gsis_sos_ln         ;
                        xlWorkSheet.Cells[start_row, 60] = reg_rep[i].nico_ln             ;
                        xlWorkSheet.Cells[start_row, 61] = reg_rep[i].network_ln          ;
                        xlWorkSheet.Cells[start_row, 62] = reg_rep[i].ccmpc_ln            ;
                        xlWorkSheet.Cells[start_row, 63] = reg_rep[i].nhmfc_hsing         ;
                        xlWorkSheet.Cells[start_row, 64] = reg_rep[i].nafc_svlf           ;
                        xlWorkSheet.Cells[start_row, 65] = reg_rep[i].gsis_housing_ln     ;
                        xlWorkSheet.Cells[start_row, 66] = reg_rep[i].gsis_help           ;

                        xlWorkSheet.Cells[start_row, 67] = reg_rep[i].other_loan1;
                        xlWorkSheet.Cells[start_row, 68] = reg_rep[i].other_loan2;
                        xlWorkSheet.Cells[start_row, 69] = reg_rep[i].other_loan3;
                        xlWorkSheet.Cells[start_row, 70] = reg_rep[i].other_loan4;
                        xlWorkSheet.Cells[start_row, 71] = reg_rep[i].other_loan5;
                        // TOTAL LOAN DEDUCTIONS
                        xlWorkSheet.Cells[start_row, 72] = "=SUM(AQ" + start_row + ":BI" + start_row + ")";
                        // TOTAL DEDUCTIONS
                        xlWorkSheet.Cells[start_row, 73] = "=Z" + start_row + "+AP" + start_row + "+BJ" + start_row + "";
                        xlWorkSheet.Cells[start_row, 74] = reg_rep[i].net_pay             ;
                        xlWorkSheet.Cells[start_row, 75] = reg_rep[i].net_pay1            ;
                        xlWorkSheet.Cells[start_row, 76] = reg_rep[i].net_pay2            ;

                        // ****************************************************************************
                        // ******* Hide Column if the Description  is Empty ***************************
                        // ****************************************************************************
                        xlWorkSheet.Cells[5, 42] = reg_rep[0].descr_other_premium1;
                        xlWorkSheet.Cells[5, 43] = reg_rep[0].descr_other_premium2;
                        xlWorkSheet.Cells[5, 44] = reg_rep[0].descr_other_premium3;
                        xlWorkSheet.Cells[5, 45] = reg_rep[0].descr_other_premium4;
                        xlWorkSheet.Cells[5, 46] = reg_rep[0].descr_other_premium5;

                        xlWorkSheet.Cells[5, 67] = reg_rep[0].descr_other_loan1;
                        xlWorkSheet.Cells[5, 68] = reg_rep[0].descr_other_loan2;
                        xlWorkSheet.Cells[5, 69] = reg_rep[0].descr_other_loan3;
                        xlWorkSheet.Cells[5, 70] = reg_rep[0].descr_other_loan4;
                        xlWorkSheet.Cells[5, 71] = reg_rep[0].descr_other_loan5;

                        if (reg_rep[0].descr_other_premium1.ToString() == "") { xlWorkSheet.get_Range("AP:AP", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_premium2.ToString() == "") { xlWorkSheet.get_Range("AQ:AQ", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_premium3.ToString() == "") { xlWorkSheet.get_Range("AR:AR", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_premium4.ToString() == "") { xlWorkSheet.get_Range("AS:AS", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_premium5.ToString() == "") { xlWorkSheet.get_Range("AT:AT", Missing.Value).EntireColumn.Hidden = true; }

                        if (reg_rep[0].descr_other_loan1.ToString() == "") { xlWorkSheet.get_Range("BO:BO", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_loan2.ToString() == "") { xlWorkSheet.get_Range("BP:BP", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_loan3.ToString() == "") { xlWorkSheet.get_Range("BQ:BQ", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_loan4.ToString() == "") { xlWorkSheet.get_Range("BR:BR", Missing.Value).EntireColumn.Hidden = true; }
                        if (reg_rep[0].descr_other_loan5.ToString() == "") { xlWorkSheet.get_Range("BS:BS", Missing.Value).EntireColumn.Hidden = true; }

                        // ****************************************************************************
                        // ****************************************************************************

                        recordcount = reg_rep.Count - (i + 1);
                        rowCounter += 1;
                        start_row = start_row + 1;

                        if ((i + 1) == reg_rep.Count)
                        {
                            Excel.Range total_row = xlWorkSheet.get_Range("A" + start_row, "BX" + start_row);
                            xlWorkSheet.get_Range("A" + start_row, "BX" + start_row).Borders.Color = Color.Black;
                            total_row.Font.Bold = true;
                            Excel.Range ToTl = xlWorkSheet.get_Range("A" + start_row, "C" + start_row);
                            ToTl.Value2 = "Total  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
                            ToTl.RowHeight = 15;
                            ToTl.Merge(Missing.Value);
                            
                            xlWorkSheet.Cells[start_row, 4] = "=SUM(D6:D" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 5] = "=SUM(E6:E" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 6] = "=SUM(F6:F" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 7] = "=SUM(G6:G" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 8] = "=SUM(H6:H" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 9] = "=SUM(I6:I" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 10] = "=SUM(J6:J" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 11] = "=SUM(K6:K" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 12] = "=SUM(L6:L" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 13] = "=SUM(M6:M" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 14] = "=SUM(N6:N" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 15] = "=SUM(O6:O" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 16] = "=SUM(P6:P" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 17] = "=SUM(Q6:Q" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 18] = "=SUM(R6:R" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 19] = "=SUM(S6:S" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 20] = "=SUM(T6:T" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 21] = "=SUM(U6:U" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 22] = "=SUM(V6:V" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 23] = "=SUM(W6:W" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 24] = "=SUM(X6:X" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 25] = "=SUM(Y6:Y" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 26] = "=SUM(Z6:Z" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 27] = "=SUM(AA6:AA" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 28] = "=SUM(AB6:AB" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 29] = "=SUM(AC6:AC" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 30] = "=SUM(AD6:AD" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 31] = "=SUM(AE6:AE" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 32] = "=SUM(AF6:AF" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 33] = "=SUM(AG6:AG" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 34] = "=SUM(AH6:AH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 35] = "=SUM(AI6:AI" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 36] = "=SUM(AJ6:AJ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 37] = "=SUM(AK6:AK" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 38] = "=SUM(AL6:AL" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 39] = "=SUM(AM6:AM" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 40] = "=SUM(AN6:AN" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 41] = "=SUM(AO6:AO" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 42] = "=SUM(AP6:AP" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 43] = "=SUM(AQ6:AQ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 44] = "=SUM(AR6:AR" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 45] = "=SUM(AS6:AS" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 46] = "=SUM(AT6:AT" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 47] = "=SUM(AU6:AU" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 48] = "=SUM(AV6:AV" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 49] = "=SUM(AW6:AW" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 50] = "=SUM(AX6:AX" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 51] = "=SUM(AY6:AY" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 52] = "=SUM(AZ6:AZ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 53] = "=SUM(BA6:BA" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 54] = "=SUM(BB6:BB" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 55] = "=SUM(BC6:BC" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 56] = "=SUM(BD6:BD" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 57] = "=SUM(BE6:BE" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 58] = "=SUM(BF6:BF" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 59] = "=SUM(BG6:BG" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 60] = "=SUM(BH6:BH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 61] = "=SUM(BI6:BI" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 62] = "=SUM(BJ6:BJ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 63] = "=SUM(BK6:BK" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 64] = "=SUM(BL6:BL" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 65] = "=SUM(BM6:BM" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 66] = "=SUM(BN6:BN" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 67] = "=SUM(BO6:BO" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 68] = "=SUM(BP6:BP" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 69] = "=SUM(BQ6:BQ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 70] = "=SUM(BR6:BR" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 71] = "=SUM(BS6:BS" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 72] = "=SUM(BT6:BT" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 73] = "=SUM(BU6:BU" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 74] = "=SUM(BV6:BV" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 75] = "=SUM(BW6:BW" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 76] = "=SUM(BX6:BX" + (start_row - 1) + ")";

                            break;
                        }
                    }


                        string filename = "";
                    filename = "SalaryRegular_Template" + ".xlsx";
                    xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                        Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                        Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                        Missing.Value, Missing.Value);
                    xlWorkBook.Close();
                    xlApp.Quit();

                    //release the created object from the marshal so that it will be no longer in
                    //backend application process..
                    Marshal.ReleaseComObject(xlWorkSheet);
                    Marshal.ReleaseComObject(xlWorkBook);
                    Marshal.ReleaseComObject(xlApp);

                    filePath = "/UploadedFile/" + filename;

                }
                return JSON(new { message = "success", filePath, Count = reg_rep.Count }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }


        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 2020-02-18
        // Description: Extract Casual Monthly Salary
        //*********************************************************************//
        public ActionResult ExtractSalaryCasual(string par_payroll_year,string par_payrollregistry_nbr)
        {
            var filePath = "";

            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/SalaryCasual_Template.xlsx"));
            Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
            object misValue = System.Reflection.Missing.Value;

            try
            {
                var reg_rep = db_pacco.sp_payrollregistry_salary_ce_rep(par_payroll_year, par_payrollregistry_nbr, "008").ToList();
                int signatory_pos                   = reg_rep.Count + 3;
                int rowCounter                      = 1;
                int recordcount                     = 0;
                
                if (reg_rep.Count > 0)
                {
                    //DisplayAlert so that the excel will not popup
                    xlApp.DisplayAlerts = false;
                    int start_row       = 6;

                    for (int i = 0; i < reg_rep.Count; i++)
                    {
                        xlWorkSheet.get_Range("A" + start_row, "CD" + start_row).Borders.Color = Color.Black;

                        xlWorkSheet.Cells[start_row, 1 ]  = reg_rep[i].empl_id;
                        xlWorkSheet.Cells[start_row, 2 ]  = reg_rep[i].employee_name;
                        xlWorkSheet.Cells[start_row, 3 ]  = reg_rep[i].position_short_title;
                        // TOTAL OBLIGATED AMOUNT
                        xlWorkSheet.Cells[start_row, 4 ]  = "=R" + start_row + "+S" + start_row + "-V" + start_row + "+AA" + start_row + "";
                        xlWorkSheet.Cells[start_row, 5 ]  = reg_rep[i].daily_rate;
                        xlWorkSheet.Cells[start_row, 6 ]  = reg_rep[i].days_worked;
                        xlWorkSheet.Cells[start_row, 7 ]  = reg_rep[i].wages_amt;
                        xlWorkSheet.Cells[start_row, 8 ]  = reg_rep[i].pera_amt;
                        xlWorkSheet.Cells[start_row, 9 ]  = reg_rep[i].lowpay_day;
                        xlWorkSheet.Cells[start_row, 10]  = reg_rep[i].lowp_amount;
                        xlWorkSheet.Cells[start_row, 11]  = reg_rep[i].lowpay_day;
                        xlWorkSheet.Cells[start_row, 12]  = reg_rep[i].lowp_amount_pera;
                        xlWorkSheet.Cells[start_row, 13]  = reg_rep[i].lates_mins_hrs;
                        xlWorkSheet.Cells[start_row, 14]  = reg_rep[i].lates_amount;
                        xlWorkSheet.Cells[start_row, 15]  = reg_rep[i].lates_amount_pera;
                        xlWorkSheet.Cells[start_row, 16]  = reg_rep[i].lowp_amount_pera;
                        // TOTAL LWOP & UNDERTIME
                        xlWorkSheet.Cells[start_row, 17]  = "=J"+ start_row + "+L" + start_row + "+N" + start_row + "+P" + start_row + "";
                        xlWorkSheet.Cells[start_row, 18]  = reg_rep[i].gross_pay;
                        xlWorkSheet.Cells[start_row, 19]  = reg_rep[i].leave_earned;
                        xlWorkSheet.Cells[start_row, 20]  = reg_rep[i].lwpay_day;
                        xlWorkSheet.Cells[start_row, 21]  = reg_rep[i].lwpay_day_spl;
                        // AMOUNT excluding SPL
                        xlWorkSheet.Cells[start_row, 22]  = "=T" + start_row + " *E" + start_row + "";
                        xlWorkSheet.Cells[start_row, 23] = reg_rep[i].gsis_gs;
                        xlWorkSheet.Cells[start_row, 24] = reg_rep[i].hdmf_gs;
                        xlWorkSheet.Cells[start_row, 25] = reg_rep[i].phic_gs;
                        xlWorkSheet.Cells[start_row, 26] = reg_rep[i].sif_gs;
                        // MANDATORY DEDUCTIONS (GS)
                        xlWorkSheet.Cells[start_row, 27]  = "=SUM(W" + start_row + ":Z" + start_row + ")";
                        xlWorkSheet.Cells[start_row, 28] = reg_rep[i].gsis_ps;
                        xlWorkSheet.Cells[start_row, 29] = reg_rep[i].hdmf_ps;
                        xlWorkSheet.Cells[start_row, 30] = reg_rep[i].phic_ps;
                        xlWorkSheet.Cells[start_row, 31] = reg_rep[i].wtax; ;
                        // MANDATORY DEDUCTIONS (PS)
                        xlWorkSheet.Cells[start_row, 32] = "=AB" + start_row + "+AC" + start_row + "+AD" + start_row + "+AE" + start_row + "";
                        xlWorkSheet.Cells[start_row, 33] = reg_rep[i].gsis_uoli;
                        xlWorkSheet.Cells[start_row, 34] = reg_rep[i].gsis_uoli45;
                        xlWorkSheet.Cells[start_row, 35] = reg_rep[i].gsis_uoli50;
                        xlWorkSheet.Cells[start_row, 36] = reg_rep[i].gsis_uoli55;
                        xlWorkSheet.Cells[start_row, 37] = reg_rep[i].gsis_uoli60;
                        xlWorkSheet.Cells[start_row, 38] = reg_rep[i].gsis_uoli65;
                        xlWorkSheet.Cells[start_row, 39] = reg_rep[i].gsis_ehp;
                        xlWorkSheet.Cells[start_row, 40] = reg_rep[i].gsis_hip;
                        xlWorkSheet.Cells[start_row, 41] = reg_rep[i].gsis_ceap;
                        xlWorkSheet.Cells[start_row, 42] = reg_rep[i].gsis_addl_ins;
                        xlWorkSheet.Cells[start_row, 43] = reg_rep[i].sss_ps;
                        xlWorkSheet.Cells[start_row, 44] = reg_rep[i].philamlife_ps;
                        xlWorkSheet.Cells[start_row, 45] = reg_rep[i].hdmf_ps2;
                        xlWorkSheet.Cells[start_row, 46] = reg_rep[i].hdmf_mp2;
                        xlWorkSheet.Cells[start_row, 47] = reg_rep[i].hdmf_loyalty_card;

                        xlWorkSheet.Cells[start_row, 48] = reg_rep[i].other_premium1;
                        xlWorkSheet.Cells[start_row, 49] = reg_rep[i].other_premium2;
                        xlWorkSheet.Cells[start_row, 50] = reg_rep[i].other_premium3;
                        xlWorkSheet.Cells[start_row, 51] = reg_rep[i].other_premium4;
                        xlWorkSheet.Cells[start_row, 52] = reg_rep[i].other_premium5;
                        // OPTIONAL CONTRIBUTIONS
                        xlWorkSheet.Cells[start_row, 53] = "=SUM(AG" + start_row + ":AZ" + start_row + ")";
                        xlWorkSheet.Cells[start_row, 54] = reg_rep[i].gsis_conso_ln;
                        xlWorkSheet.Cells[start_row, 55] = reg_rep[i].gsis_policy_reg_ln;
                        xlWorkSheet.Cells[start_row, 56] = reg_rep[i].gsis_policy_opt_ln;
                        xlWorkSheet.Cells[start_row, 57] = reg_rep[i].gsis_uoli_ln;
                        xlWorkSheet.Cells[start_row, 58] = reg_rep[i].gsis_emergency_ln;
                        xlWorkSheet.Cells[start_row, 59] = reg_rep[i].gsis_educ_asst_ln;
                        xlWorkSheet.Cells[start_row, 60] = reg_rep[i].hdmf_mpl_ln;
                        xlWorkSheet.Cells[start_row, 61] = reg_rep[i].hdmf_hse_ln;
                        xlWorkSheet.Cells[start_row, 62] = reg_rep[i].hdmf_cal_ln;
                        xlWorkSheet.Cells[start_row, 63] = reg_rep[i].gsis_ecard_ln;
                        xlWorkSheet.Cells[start_row, 64] = reg_rep[i].gsis_real_state_ln;
                        xlWorkSheet.Cells[start_row, 65] = reg_rep[i].gsis_sos_ln;
                        xlWorkSheet.Cells[start_row, 66] = reg_rep[i].nico_ln;
                        xlWorkSheet.Cells[start_row, 67] = reg_rep[i].network_ln;
                        xlWorkSheet.Cells[start_row, 68] = reg_rep[i].ccmpc_ln;
                        xlWorkSheet.Cells[start_row, 69] = reg_rep[i].nhmfc_hsing;
                        xlWorkSheet.Cells[start_row, 70] = reg_rep[i].nafc_svlf;
                        xlWorkSheet.Cells[start_row, 71] = reg_rep[i].gsis_housing_ln;
                        xlWorkSheet.Cells[start_row, 72] = reg_rep[i].gsis_help;

                        xlWorkSheet.Cells[start_row, 73] = reg_rep[i].other_loan1;
                        xlWorkSheet.Cells[start_row, 74] = reg_rep[i].other_loan2;
                        xlWorkSheet.Cells[start_row, 75] = reg_rep[i].other_loan3;
                        xlWorkSheet.Cells[start_row, 76] = reg_rep[i].other_loan4;
                        xlWorkSheet.Cells[start_row, 77] = reg_rep[i].other_loan5;
                        // TOTAL LOAN DEDUCTIONS
                        xlWorkSheet.Cells[start_row, 78] = "=SUM(BB" + start_row + ":BY" + start_row + ")";
                        // TOTAL DEDUCTIONS
                        xlWorkSheet.Cells[start_row, 79] = "=AF" + start_row + "+BA" + start_row + "+BZ" + start_row + "";
                        xlWorkSheet.Cells[start_row, 80] = reg_rep[i].net_pay;
                        xlWorkSheet.Cells[start_row, 81] = reg_rep[i].net_pay1;
                        xlWorkSheet.Cells[start_row, 82] = reg_rep[i].net_pay2;
                        
                        // ****************************************************************************
                        // ******* Hide Column if the Description  is Empty ***************************
                        // ****************************************************************************
                        xlWorkSheet.Cells[5, 48] = reg_rep[0].descr_other_premium1;
                        xlWorkSheet.Cells[5, 49] = reg_rep[0].descr_other_premium2;
                        xlWorkSheet.Cells[5, 50] = reg_rep[0].descr_other_premium3;
                        xlWorkSheet.Cells[5, 51] = reg_rep[0].descr_other_premium4;
                        xlWorkSheet.Cells[5, 52] = reg_rep[0].descr_other_premium5;

                        xlWorkSheet.Cells[5, 73] = reg_rep[0].descr_other_loan1;
                        xlWorkSheet.Cells[5, 74] = reg_rep[0].descr_other_loan2;
                        xlWorkSheet.Cells[5, 75] = reg_rep[0].descr_other_loan3;
                        xlWorkSheet.Cells[5, 76] = reg_rep[0].descr_other_loan4;
                        xlWorkSheet.Cells[5, 77] = reg_rep[0].descr_other_loan5;

                        if (reg_rep[0].descr_other_premium1.ToString() == ""){ xlWorkSheet.get_Range("AV:AV", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_premium2.ToString() == ""){ xlWorkSheet.get_Range("AW:AW", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_premium3.ToString() == ""){ xlWorkSheet.get_Range("AX:AX", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_premium4.ToString() == ""){ xlWorkSheet.get_Range("AY:AY", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_premium5.ToString() == ""){ xlWorkSheet.get_Range("AZ:AZ", Missing.Value).EntireColumn.Hidden = true;}

                        if (reg_rep[0].descr_other_loan1.ToString() == "") { xlWorkSheet.get_Range("BU:BU", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_loan2.ToString() == "") { xlWorkSheet.get_Range("BV:BV", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_loan3.ToString() == "") { xlWorkSheet.get_Range("BW:BW", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_loan4.ToString() == "") { xlWorkSheet.get_Range("BX:BX", Missing.Value).EntireColumn.Hidden = true;}
                        if (reg_rep[0].descr_other_loan5.ToString() == "") { xlWorkSheet.get_Range("BY:BY", Missing.Value).EntireColumn.Hidden = true;}
                        
                        // ****************************************************************************
                        // ****************************************************************************

                        recordcount = reg_rep.Count - (i + 1);
                        rowCounter += 1;
                        start_row = start_row + 1;

                        if ((i + 1) == reg_rep.Count)
                        {
                            Excel.Range total_row = xlWorkSheet.get_Range("A" + start_row, "CD" + start_row);
                            xlWorkSheet.get_Range("A" + start_row, "CD" + start_row).Borders.Color = Color.Black;
                            total_row.Font.Bold = true;
                            Excel.Range ToTl = xlWorkSheet.get_Range("A" + start_row, "C" + start_row);
                            ToTl.Value2 = "Total  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
                            ToTl.RowHeight = 15;
                            ToTl.Merge(Missing.Value);

                            // FORULA FOR - ALL TOTAL OBLIGATED AMOUNT
                            xlWorkSheet.Cells[start_row, 4]  = "=SUM(D6:D" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 5]  = "=SUM(E6:E" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 6]  = "=SUM(F6:F" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 7]  = "=SUM(G6:G" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 8]  = "=SUM(H6:H" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 9]  = "=SUM(I6:I" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 10] = "=SUM(J6:J" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 11] = "=SUM(K6:K" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 12] = "=SUM(L6:L" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 13] = "=SUM(M6:M" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 14] = "=SUM(N6:N" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 15] = "=SUM(O6:O" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 16] = "=SUM(P6:P" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 17] = "=SUM(Q6:Q" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 18] = "=SUM(R6:R" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 19] = "=SUM(S6:S" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 20] = "=SUM(T6:T" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 21] = "=SUM(U6:U" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 22] = "=SUM(V6:V" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 23] = "=SUM(W6:W" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 24] = "=SUM(X6:X" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 25] = "=SUM(Y6:Y" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 26] = "=SUM(Z6:Z" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 27] = "=SUM(AA6:AA" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 28] = "=SUM(AB6:AB" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 29] = "=SUM(AC6:AC" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 30] = "=SUM(AD6:AD" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 31] = "=SUM(AE6:AE" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 32] = "=SUM(AF6:AF" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 33] = "=SUM(AG6:AG" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 34] = "=SUM(AH6:AH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 35] = "=SUM(AI6:AI" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 36] = "=SUM(AJ6:AJ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 37] = "=SUM(AK6:AK" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 38] = "=SUM(AL6:AL" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 39] = "=SUM(AM6:AM" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 40] = "=SUM(AN6:AN" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 41] = "=SUM(AO6:AO" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 42] = "=SUM(AP6:AP" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 43] = "=SUM(AQ6:AQ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 44] = "=SUM(AR6:AR" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 45] = "=SUM(AS6:AS" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 46] = "=SUM(AT6:AT" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 47] = "=SUM(AU6:AU" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 48] = "=SUM(AV6:AV" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 49] = "=SUM(AW6:AW" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 50] = "=SUM(AX6:AX" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 51] = "=SUM(AY6:AY" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 52] = "=SUM(AZ6:AZ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 53] = "=SUM(BA6:BA" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 54] = "=SUM(BB6:BB" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 55] = "=SUM(BC6:BC" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 56] = "=SUM(BD6:BD" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 57] = "=SUM(BE6:BE" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 58] = "=SUM(BF6:BF" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 59] = "=SUM(BG6:BG" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 60] = "=SUM(BH6:BH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 61] = "=SUM(BI6:BI" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 62] = "=SUM(BJ6:BJ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 63] = "=SUM(BK6:BK" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 64] = "=SUM(BL6:BL" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 65] = "=SUM(BM6:BM" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 66] = "=SUM(BN6:BN" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 67] = "=SUM(BO6:BO" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 68] = "=SUM(BP6:BP" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 69] = "=SUM(BQ6:BQ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 70] = "=SUM(BR6:BR" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 71] = "=SUM(BS6:BS" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 72] = "=SUM(BT6:BT" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 73] = "=SUM(BU6:BU" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 74] = "=SUM(BV6:BV" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 75] = "=SUM(BW6:BW" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 76] = "=SUM(BX6:BX" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 77] = "=SUM(BY6:BY" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 78] = "=SUM(BZ6:BZ" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 79] = "=SUM(CA6:CA" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 80] = "=SUM(CB6:CB" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 81] = "=SUM(CC6:CC" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 82] = "=SUM(CD6:CD" + (start_row - 1) + ")";

                            break;                                    
                        }                                             
                    }                                                 
                                                                      
                                                                      
                    string filename = "";
                    filename = "SalaryCasual_Template" + ".xlsx";
                    xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                        Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                        Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                        Missing.Value, Missing.Value);
                    xlWorkBook.Close();
                    xlApp.Quit();

                    //release the created object from the marshal so that it will be no longer in
                    //backend application process..
                    Marshal.ReleaseComObject(xlWorkSheet);
                    Marshal.ReleaseComObject(xlWorkBook);
                    Marshal.ReleaseComObject(xlApp);

                    filePath = "/UploadedFile/" + filename;

                }
                return JSON(new { message = "success", filePath, Count = reg_rep.Count }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }


        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 01/21/2020
        // Description: Populate Employment Type
        // Update Date and By : VJA - 2021-03-18 
        ////*********************************************************************//
        public ActionResult RetrieveRegistryDetails(string p_doc_ctrl_nbr)
        {
            var message = "";
            try
            {
                var sp_doc_trk_act_tbl_details = db_pacco.sp_idoc_trk_tbl_details(p_doc_ctrl_nbr).ToList();
                if (sp_doc_trk_act_tbl_details.Count > 0)
                {
                    message = "success";
                    Session["history_page"] = Request.UrlReferrer.ToString();
                }
                else
                {

                    message = "No Data Found !";
                    Session["history_page"] = Request.UrlReferrer.ToString();
                }
                return JSON(new { sp_doc_trk_act_tbl_details, message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Session["history_page"] = Request.UrlReferrer.ToString();
                return JSON(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
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

        public ActionResult FETCH_DATA(string doc_ctrl_nbr)
        {
            var t       = "";
            var dept    = Session["department_code"].ToString();
            role_id     = Session["role_id"].ToString();
            var message = "";
            object dtl  = new object();


            try
            {
                //var ToReceive = db_pacco.sp_doc_trk_act_tbl_2be_rcvd(role_id).ToList();
                //var ToRelease = db_pacco.sp_doc_trk_act_tbl_2be_rlsd(role_id).ToList();


                //******  --Updated by Marvin Olita August 21, 2020 09:06 AM             ****///
                //******  --change stored procedure to view                              ****///
                //******  --sp_doc_trk_act_tbl_2be_rcvd to vw_doc_trk_act_tbl_2be_rcvd   ****///
                //******  --sp_doc_trk_act_tbl_2be_rlsd to vw_doc_trk_act_tbl_2be_rlsd   ****///

                //Updated By: Joseph M. Tombo Jr. 03-17-2021 OLD CODE
                //var ToReceive = db_pacco.vw_doc_trk_act_tbl_2be_rcvd.Where(a => a.role_id == role_id).ToList();
                //var ToRelease = db_pacco.vw_doc_trk_act_tbl_2be_rlsd.Where(a => a.role_id == role_id).ToList();

                //Updated By: Joseph M. Tombo Jr 03-17-2021 NEW Approach
                var ToReceive = db_pacco.vw_idoc_trk_tbl_2be_rcvd.Where(a => a.role_id == role_id).ToList();
                var ToRelease = db_pacco.vw_idoc_trk_tbl_2be_rlsd.Where(a => a.role_id == role_id).ToList();


                var V = ToReceive.Where(a => a.doc_ctrl_nbr == doc_ctrl_nbr);
                var L = ToRelease.Where(a => a.doc_ctrl_nbr == doc_ctrl_nbr);

                if (V.Count() > 0)
                {
                    dtl = V;
                    t = "V";
                }
                else if (L.Count() > 0)
                {
                    dtl = L;
                    t = "L";

                }

                message = "success";
                return JSON(new { message, ToReceive, ToRelease, dtl, t }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Session["history_page"] = Request.UrlReferrer.ToString();
                return JSON(new { message = ex.Message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }
        
        //*********************************************************************//
        // Created By : VJA - Created Date : 2020-09-21
        // Description: Extract Job-Order Salary
        //*********************************************************************//
        public ActionResult ExtractSalaryJobOrder(string par_payroll_year, string par_payrollregistry_nbr, string par_payrolltemplate_code)
        {
            var filePath = "";

            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/SalaryJobOrder_Template.xlsx"));
            Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
            object misValue = System.Reflection.Missing.Value;

            try
            {
                var reg_rep = db_pacco.sp_payrollregistry_salary_jo_rep(par_payroll_year, par_payrollregistry_nbr, par_payrolltemplate_code).ToList();
                int signatory_pos = reg_rep.Count + 3;
                int rowCounter = 1;
                int recordcount = 0;
                
                if (reg_rep.Count > 0)
                {
                    xlApp.DisplayAlerts = false;
                    int start_row = 6;

                    for (int i = 0; i < reg_rep.Count; i++)
                    {
                        xlWorkSheet.get_Range("A" + start_row, "AN" + start_row).Borders.Color = Color.Black;
                        
                        xlWorkSheet.Cells[start_row, 1]  = reg_rep[i].empl_id;
                        xlWorkSheet.Cells[start_row, 2]  = reg_rep[i].employee_name;
                        xlWorkSheet.Cells[start_row, 3]  = reg_rep[i].position_short_title;
                        xlWorkSheet.Cells[start_row, 4]  = reg_rep[i].daily_rate;
                        xlWorkSheet.Cells[start_row, 5]  = reg_rep[i].days_worked;
                        xlWorkSheet.Cells[start_row, 6]  = "=D" + start_row + "*E" + start_row + "";
                        xlWorkSheet.Cells[start_row, 7]  = reg_rep[i].lates_mins_hrs   ;
                        xlWorkSheet.Cells[start_row, 8]  = reg_rep[i].lates_mh_amount  ;
                        xlWorkSheet.Cells[start_row, 9]  = reg_rep[i].gross_pay        ;
                        xlWorkSheet.Cells[start_row, 10] = reg_rep[i].wtax_2perc       ;
                        xlWorkSheet.Cells[start_row, 11] = reg_rep[i].wtax_3perc       ;
                        xlWorkSheet.Cells[start_row, 12] = reg_rep[i].wtax_5perc       ;
                        xlWorkSheet.Cells[start_row, 13] = reg_rep[i].wtax_8perc       ;
                        xlWorkSheet.Cells[start_row, 14] = reg_rep[i].wtax_10perc      ;
                        xlWorkSheet.Cells[start_row, 15] = reg_rep[i].wtax_15perc      ;
                        xlWorkSheet.Cells[start_row, 16] = reg_rep[i].phic_ps          ;
                        xlWorkSheet.Cells[start_row, 17] = reg_rep[i].hdmf_ps          ;
                        xlWorkSheet.Cells[start_row, 18] = "=SUM(J" + start_row + ":Q" + start_row + ")";
                        xlWorkSheet.Cells[start_row, 19] = reg_rep[i].philamlife_ps ;
                        xlWorkSheet.Cells[start_row, 20] = reg_rep[i].uniform_amt   ;
                        xlWorkSheet.Cells[start_row, 21] = reg_rep[i].hdmf_hse_ln   ;
                        xlWorkSheet.Cells[start_row, 22] = reg_rep[i].nico_ln       ;
                        xlWorkSheet.Cells[start_row, 23] = reg_rep[i].network_ln;
                        xlWorkSheet.Cells[start_row, 24] = reg_rep[i].other_premium1;
                        xlWorkSheet.Cells[start_row, 25] = reg_rep[i].other_premium2;
                        xlWorkSheet.Cells[start_row, 26] = reg_rep[i].other_premium3;
                        xlWorkSheet.Cells[start_row, 27] = "=SUM(S" + start_row + ":Z" + start_row + ")";
                        xlWorkSheet.Cells[start_row, 28] = reg_rep[i].sss_ps;
                        xlWorkSheet.Cells[start_row, 29] = reg_rep[i].ccmpc_ln;
                        xlWorkSheet.Cells[start_row, 30] = reg_rep[i].hdmf_cal_ln;
                        xlWorkSheet.Cells[start_row, 31] = reg_rep[i].hdmf_loyalty_card;
                        xlWorkSheet.Cells[start_row, 32] = reg_rep[i].hdmf_ps2;
                        xlWorkSheet.Cells[start_row, 33] = reg_rep[i].hdmf_mp2;
                        xlWorkSheet.Cells[start_row, 34] = reg_rep[i].hdmf_mpl_ln;
                        xlWorkSheet.Cells[start_row, 35] = reg_rep[i].other_loan1;
                        xlWorkSheet.Cells[start_row, 36] = reg_rep[i].other_loan2;
                        xlWorkSheet.Cells[start_row, 37] = reg_rep[i].other_loan3;
                        xlWorkSheet.Cells[start_row, 38] = "=SUM(AB" + start_row + ":AK" + start_row + ")";
                        xlWorkSheet.Cells[start_row, 39] = "=R" + start_row + "+AA" + start_row + "+AL" + start_row + "";
                        xlWorkSheet.Cells[start_row, 40] = reg_rep[i].net_pay;


                        // ****************************************************************************
                        // ******* Hide Column if the Description  is Empty ***************************
                        // ****************************************************************************
                        xlWorkSheet.Cells[5, 24] = reg_rep[0].descr_other_premium1;
                        xlWorkSheet.Cells[5, 25] = reg_rep[0].descr_other_premium2;
                        xlWorkSheet.Cells[5, 26] = reg_rep[0].descr_other_premium3;
                        xlWorkSheet.Cells[5, 35] = reg_rep[0].descr_other_loan1;
                        xlWorkSheet.Cells[5, 36] = reg_rep[0].descr_other_loan2;
                        xlWorkSheet.Cells[5, 37] = reg_rep[0].descr_other_loan3;

                        if (reg_rep[0].descr_other_premium1.ToString() == "" )
                        {
                            xlWorkSheet.get_Range("X:X", Missing.Value).EntireColumn.Hidden = true;
                        }
                        if (reg_rep[0].descr_other_premium2.ToString() == "")
                        {
                            xlWorkSheet.get_Range("Y:Y", Missing.Value).EntireColumn.Hidden = true;
                        }
                        if (reg_rep[0].descr_other_premium3.ToString() == "")
                        {
                            xlWorkSheet.get_Range("Z:Z", Missing.Value).EntireColumn.Hidden = true;
                        }

                        if (reg_rep[0].descr_other_loan1.ToString() == "")
                        {
                            xlWorkSheet.get_Range("AI:AI", Missing.Value).EntireColumn.Hidden = true;
                        }
                        if (reg_rep[0].descr_other_loan2.ToString() == "")
                        {
                            xlWorkSheet.get_Range("AJ:AJ", Missing.Value).EntireColumn.Hidden = true;
                        }
                        if (reg_rep[0].descr_other_loan3.ToString() == "")
                        {
                            xlWorkSheet.get_Range("AK:AK", Missing.Value).EntireColumn.Hidden = true;
                        }
                        // ****************************************************************************
                        // ****************************************************************************

                        recordcount = reg_rep.Count - (i + 1);
                        rowCounter += 1;
                        start_row = start_row + 1;

                        if ((i + 1) == reg_rep.Count)
                        {
                            Excel.Range total_row   = xlWorkSheet.get_Range("A" + start_row, "AN" + start_row);
                            xlWorkSheet.get_Range("A" + start_row, "AN" + start_row).Borders.Color = Color.Black;

                            total_row.Font.Bold     = true;
                            Excel.Range ToTl        = xlWorkSheet.get_Range("A" + start_row, "C" + start_row);
                            ToTl.Value2             = "Total  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
                            ToTl.RowHeight          = 15;
                            ToTl.Merge(Missing.Value);

                            // FORULA FOR - ALL TOTAL OBLIGATED AMOUNT
                            xlWorkSheet.Cells[start_row, 4]  = "=SUM(D6:D"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 5]  = "=SUM(E6:E"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 6]  = "=SUM(F6:F"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 7]  = "=SUM(G6:G"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 8]  = "=SUM(H6:H"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 9]  = "=SUM(I6:I"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 10] = "=SUM(J6:J"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 11] = "=SUM(K6:K"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 12] = "=SUM(L6:L"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 13] = "=SUM(M6:M"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 14] = "=SUM(N6:N"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 15] = "=SUM(O6:O"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 16] = "=SUM(P6:P"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 17] = "=SUM(Q6:Q"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 18] = "=SUM(R6:R"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 19] = "=SUM(S6:S"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 20] = "=SUM(T6:T"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 21] = "=SUM(U6:U"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 22] = "=SUM(V6:V"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 23] = "=SUM(W6:W"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 24] = "=SUM(X6:X"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 25] = "=SUM(Y6:Y"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 26] = "=SUM(Z6:Z"   + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 27] = "=SUM(AA6:AA" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 28] = "=SUM(AB6:AB" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 29] = "=SUM(AC6:AC" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 30] = "=SUM(AD6:AD" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 31] = "=SUM(AE6:AE" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 32] = "=SUM(AF6:AF" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 33] = "=SUM(AG6:AG" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 34] = "=SUM(AH6:AH" + (start_row - 1) + ")";

                            xlWorkSheet.Cells[start_row, 35] = "=SUM(AI6:AH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 36] = "=SUM(AJ6:AH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 37] = "=SUM(AK6:AH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 38] = "=SUM(AL6:AH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 39] = "=SUM(AM6:AH" + (start_row - 1) + ")";
                            xlWorkSheet.Cells[start_row, 40] = "=SUM(AN6:AH" + (start_row - 1) + ")";

                            break;
                        }
                    }
                    
                    string filename = "";
                    filename = "SalaryJobOrder_Template" + ".xlsx";
                    xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                        Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                        Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                        Missing.Value, Missing.Value);
                    xlWorkBook.Close();
                    xlApp.Quit();

                    //release the created object from the marshal so that it will be no longer in
                    //backend application process..
                    Marshal.ReleaseComObject(xlWorkSheet);
                    Marshal.ReleaseComObject(xlWorkBook);
                    Marshal.ReleaseComObject(xlApp);

                    filePath = "/UploadedFile/" + filename;

                }
                return JSON(new { message = "success", filePath, Count = reg_rep.Count }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }


        }

        public ActionResult SetRouteSession(string route_ctrl_nbr)
        {
             
            try
            {
                 Session["route_ctrl_nbr"] = route_ctrl_nbr;
                return JSON(new { icon="success", message ="success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                
                return JSON(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult validateVoucherNbr(string voucher_nbr, string doc_ctrl_nbr, string cafoa_nbr)
        {
            var voucher_exist = false;
            var cafoa_exist = false;
            try
            {

                   var voucher = db_pacco.sp_check_voucher_nbr(voucher_nbr, cafoa_nbr, doc_ctrl_nbr).ToList();
                 
                   if (voucher.Count > 0)
                   {
                       voucher_exist    = (bool)voucher[0].exist_bit;
                       cafoa_exist      = (bool)voucher[0].exist_cafoa;
                   }

             
                return JSON(new { icon = "success", message = "success", voucher_exist, cafoa_exist }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return JSON(new { message = ex.Message}, JsonRequestBehavior.AllowGet);
            }
        }

        // Created By : Marvin - Created Date : 2020-01-30
        // Description : Get where to return or release...
        public ActionResult getEmployeeInRegistry(string doc_ctrl_nbr)
        {
            var message = "";
            var icon = "";
            try
            {


                var EmployeeInRegistry = db_pacco.sp_payrollregistry_info3_HRIS_ACT_list(doc_ctrl_nbr).ToList();
                message = "success";
                icon = "success";
                return JSON(new { message, icon, EmployeeInRegistry }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                icon = "error";
                return JSON(new { message, icon }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        //                      E N D     O F     C O D E
        //*********************************************************************//
    }
}