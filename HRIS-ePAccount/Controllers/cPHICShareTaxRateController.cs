using HRIS_ePAccount.Filter;
using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;



namespace HRIS_ePAccount.Controllers
{
    [SessionExpire]
    public class cPHICShareTaxRateController : Controller
    {

        int menu_id = 5508;
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//

        //public void GetAllowAccess()
        //{
        //    um.allow_add = (int)Session["allow_add"];
        //    um.allow_delete = (int)Session["allow_delete"];
        //    um.allow_edit = (int)Session["allow_edit"];
        //    um.allow_edit_history = (int)Session["allow_edit_history"];
        //    um.allow_print = (int)Session["allow_print"];
        //    um.allow_view = (int)Session["allow_view"];
        //    um.url_name = Session["url_name"].ToString();
        //    um.id = (int)Session["id"];
        //    um.menu_name = Session["menu_name"].ToString();
        //    um.page_title = Session["page_title"].ToString();
        //}


        public ActionResult Index()
        {

            if (um != null || um.ToString() != "")
            {
                try
                {
                    
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
            IOrderedEnumerable<vw_departments_tbl_list> department_list;
            List<vw_employmenttypes_tbl_list> empType = new List<vw_employmenttypes_tbl_list>();
            List<sp_jo_tax_tbl_list_Result> bir_class_list = new List<sp_jo_tax_tbl_list_Result>();
           
        
            var taxrate_percentage_tbl_list = db_pacco.taxrate_percentage_tbl.ToList();

            List<sp_user_menu_access_role_list_ACT_Result> menu_data = (List<sp_user_menu_access_role_list_ACT_Result>)HttpContext.Session["session_menu"];

            var menu_auth = menu_data.Where(a => a.id == menu_id).FirstOrDefault();

            um.allow_add                = (int)menu_auth.allow_add;
            um.allow_delete             = (int)menu_auth.allow_delete;
            um.allow_edit               = (int)menu_auth.allow_edit;
            um.allow_edit_history       = (int)menu_auth.allow_edit_history;
            um.allow_print              = (int)menu_auth.allow_print;
            um.allow_view               = (int)menu_auth.allow_view;
            um.url_name                 = menu_auth.url_name.ToString();
            um.id                       = (int)menu_auth.id;
            um.menu_name                = menu_auth.menu_name.ToString();
            um.page_title               = menu_auth.page_title.ToString();






            if (Session["department_list"] == null)
            {
                department_list = db_pacco.vw_departments_tbl_list.ToList().OrderBy(a => a.department_code);
                HttpContext.Session["department_list"] = department_list;
            }
            else
            {
                department_list = (IOrderedEnumerable<vw_departments_tbl_list>)HttpContext.Session["department_list"];
            }

            if (Session["empType"] == null)
            {
                empType = db_pacco.vw_employmenttypes_tbl_list.Where(a => !a.employment_type.Contains("JO")).ToList();
                HttpContext.Session["empType"] = empType;
            }
            else
            {
                empType = (List<vw_employmenttypes_tbl_list>)HttpContext.Session["empType"];
            }

            if (HttpContext.Session["bir_class_list"] == null)
            {
                bir_class_list = db_pacco.sp_jo_tax_tbl_list().ToList();
                HttpContext.Session["bir_class_list"] = bir_class_list;
            }
            else
            {
                bir_class_list = (List<sp_jo_tax_tbl_list_Result>)HttpContext.Session["bir_class_list"];
            }

           

            if (Session["PreviousValuesonPage_cJOTaxRate"] == null)
            {
                
                Session["PreviousValuesonPage_cJOTaxRate"] = null;
                int sort_value = 1;
                int page_value = 0;
                string sort_order = "asc";
                string show_entries = "5";
                string ddl_emp_type = "";
                string department_code = "";

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_empl_tbl_ACT.Where(a => a.department_code == department_code).ToList();

                //if (HttpContext.Session["vw_phic_share_empl_tbl_ACT"] == null)
                //{
                //    sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_empl_tbl_ACT.Where(a => a.department_code == department_code).ToList();
                //    HttpContext.Session["vw_phic_share_empl_tbl_ACT"] = sp_payrollemployee_tax_hdr_tbl_list;
                //}
                //else
                //{
                //    sp_payrollemployee_tax_hdr_tbl_list = (List<vw_phic_share_empl_tbl_ACT>)HttpContext.Session["vw_phic_share_empl_tbl_ACT"];
                //}

                return JSON(new { empType, ddl_emp_type, sp_payrollemployee_tax_hdr_tbl_list, sort_value, page_value, sort_order, show_entries, um, department_list, bir_class_list, taxrate_percentage_tbl_list, department_code }, JsonRequestBehavior.AllowGet);

            }
            else
            {
                // HttpContext.Session["vw_phic_share_empl_tbl_ACT"] = sp_payrollemployee_tax_hdr_tbl_list;

                string[] PreviousValuesonPage_cJOTaxRate = Session["PreviousValuesonPage_cJOTaxRate"].ToString().Split(new char[] { ',' });
                string ddl_year = PreviousValuesonPage_cJOTaxRate[0].ToString().Trim();
                string department_code = PreviousValuesonPage_cJOTaxRate[10].ToString().Trim();
                string history = PreviousValuesonPage_cJOTaxRate[11].ToString().Trim();
                string show_entries = PreviousValuesonPage_cJOTaxRate[3].ToString().Trim();
                int page_value = Convert.ToInt32(PreviousValuesonPage_cJOTaxRate[4].ToString().Trim());
                string search_value = PreviousValuesonPage_cJOTaxRate[5].ToString().Trim();
                int sort_value = Convert.ToInt32(PreviousValuesonPage_cJOTaxRate[6].ToString().Trim());
                string sort_order = PreviousValuesonPage_cJOTaxRate[7].ToString().Trim();
                string employment_type  = PreviousValuesonPage_cJOTaxRate[11].ToString().Trim();
                string tabindex            = PreviousValuesonPage_cJOTaxRate[12].ToString().Trim();
                string empl_id          = PreviousValuesonPage_cJOTaxRate[1].ToString().Trim();


                if(tabindex == "1")
                {
                    var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_empl_tbl_ACT.Where(a => a.department_code == department_code).ToList();
                    return JSON(new {
                              department_list
                            , department_code
                            , sp_payrollemployee_tax_hdr_tbl_list
                            , ddl_year
                            , show_entries
                            , page_value
                            , search_value
                            , sort_value
                            , sort_order
                            , um
                            , bir_class_list
                            , history
                            , taxrate_percentage_tbl_list
                            ,employment_type
                            ,tabindex
                            ,empl_id
                     }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_rece_tbl_ACT.Where(a => a.department_code == department_code).ToList();
                    return JSON(new {
                              department_list
                            , department_code
                            , sp_payrollemployee_tax_hdr_tbl_list
                            , ddl_year
                            , show_entries
                            , page_value
                            , search_value
                            , sort_value
                            , sort_order
                            , um
                            , bir_class_list
                            , history
                            , taxrate_percentage_tbl_list
                            ,employment_type
                            ,tabindex
                            ,empl_id
                     }, JsonRequestBehavior.AllowGet);
                }
            
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
                var sp_personnelnames_combolist_tax_jo = db_pacco.sp_personnelnames_combolist_tax_jo(par_payroll_year, par_department_code).ToList();

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
                string message = "";

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(par_payroll_year, par_department_code, par_history).Where(a => a.empl_id == par_empl_id && a.effective_date == par_effective_date).FirstOrDefault();

                if (sp_payrollemployee_tax_hdr_tbl_list != null && par_action == "ADD")
                {
                    message = "fail";
                }

                else if (sp_payrollemployee_tax_hdr_tbl_list == null && par_action == "EDIT")
                {
                    message = "fail";

                }

                else if (sp_payrollemployee_tax_hdr_tbl_list == null && par_action == "DELETE")
                {

                    message = "fail";
                }

                else
                {
                    message = "success";
                }
                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
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

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: Select EmployeeName
        //////*********************************************************************//
        public ActionResult SaveEDITInDatabase(payrollemployee_tax_hdr_tbl data, string par_effective_date, string par_empl_id, string par_action,string department_code)
        {
            try
            {
                var insertType = "";
                string message = "";

                DateTime newEffectiveDate = new DateTime();

                DateTime effective_date = Convert.ToDateTime(par_effective_date.ToString());

                

                DateTime current_date = Convert.ToDateTime(DateTime.Now.ToString("yyyy-MM-dd"));

              
               

                
                var payrollemployee_tax_tbl = db_pay.payrollemployee_tax_tbl.Where(a => a.empl_id == par_empl_id).OrderByDescending(a => a.effective_date).FirstOrDefault();
                if (payrollemployee_tax_tbl == null)
                {
                    insertType = "new";
                    newEffectiveDate = current_date;
                }
                else if (payrollemployee_tax_tbl.effective_date >= current_date)
                {
                    insertType = "update";
                    newEffectiveDate = payrollemployee_tax_tbl.effective_date;
                }
                else
                {
                    insertType = "new";
                    newEffectiveDate = current_date;
                }

                if (payrollemployee_tax_tbl != null)
                {
                    if (insertType == "update")
                    {
                        payrollemployee_tax_tbl.bir_class = data.bir_class;
                        payrollemployee_tax_tbl.with_sworn = data.with_sworn;
                        payrollemployee_tax_tbl.fixed_rate = data.fixed_rate;
                        payrollemployee_tax_tbl.total_gross_pay = data.total_gross_pay;
                        payrollemployee_tax_tbl.dedct_status = data.dedct_status;
                        payrollemployee_tax_tbl.rcrd_status = "N";
                        payrollemployee_tax_tbl.user_id_updated_by = Session["user_id"].ToString(); ;
                        payrollemployee_tax_tbl.updated_dttm = DateTime.Now;
                        payrollemployee_tax_tbl.w_tax_perc = data.w_tax_perc;
                        payrollemployee_tax_tbl.bus_tax_perc = data.bus_tax_perc;
                        payrollemployee_tax_tbl.vat_perc = data.vat_perc;
                        payrollemployee_tax_tbl.exmpt_amt = data.exmpt_amt;
                        
                    }
                    else
                    {
                        payrollemployee_tax_tbl PETX = new payrollemployee_tax_tbl();
                        PETX.empl_id = data.empl_id;
                        PETX.effective_date = newEffectiveDate;
                        PETX.bir_class = data.bir_class;
                        PETX.with_sworn = isCheckBool(data.with_sworn.ToString());
                        PETX.fixed_rate = isCheckBool(data.fixed_rate.ToString());
                        PETX.total_gross_pay = data.total_gross_pay;
                        PETX.dedct_status = isCheckBool(data.dedct_status.ToString());
                        PETX.rcrd_status = "N";
                        PETX.user_id_created_by = Session["user_id"].ToString();
                        PETX.created_dttm = DateTime.Now;
                        PETX.user_id_updated_by = "";
                        PETX.w_tax_perc = data.w_tax_perc;
                        PETX.bus_tax_perc = data.bus_tax_perc;
                        PETX.vat_perc = data.vat_perc;
                        PETX.exmpt_amt = data.exmpt_amt;
                        PETX.updated_dttm = Convert.ToDateTime("1900-01-01");
                        db_pay.payrollemployee_tax_tbl.Add(PETX);
                    }

                    var payrollemployee_tax_hdr_tbl = db_pacco.payrollemployee_tax_hdr_tbl.Where(a => a.empl_id == par_empl_id && a.effective_date == newEffectiveDate).FirstOrDefault();

                    if (payrollemployee_tax_hdr_tbl != null)
                    {

                        payrollemployee_tax_hdr_tbl.bir_class = data.bir_class;
                        payrollemployee_tax_hdr_tbl.with_sworn = data.with_sworn;
                        payrollemployee_tax_hdr_tbl.fixed_rate = data.fixed_rate;
                        payrollemployee_tax_hdr_tbl.total_gross_pay = data.total_gross_pay;
                        payrollemployee_tax_hdr_tbl.dedct_status = data.dedct_status;
                        payrollemployee_tax_hdr_tbl.rcrd_status = "N";
                        payrollemployee_tax_hdr_tbl.user_id_updated_by = Session["user_id"].ToString(); ;
                        payrollemployee_tax_hdr_tbl.updated_dttm = DateTime.Now;
                        payrollemployee_tax_hdr_tbl.w_tax_perc = data.w_tax_perc;
                        payrollemployee_tax_hdr_tbl.bus_tax_perc = data.bus_tax_perc;
                        payrollemployee_tax_hdr_tbl.vat_perc = data.vat_perc;
                        payrollemployee_tax_hdr_tbl.exmpt_amt = data.exmpt_amt;
                    }
                    else
                    {
                        payrollemployee_tax_hdr_tbl tbl = new payrollemployee_tax_hdr_tbl();

                        tbl.empl_id = data.empl_id;
                        tbl.effective_date = newEffectiveDate;
                        tbl.bir_class = data.bir_class;
                        tbl.with_sworn = isCheckBool(data.with_sworn.ToString());
                        tbl.fixed_rate = isCheckBool(data.fixed_rate.ToString());
                        tbl.total_gross_pay = data.total_gross_pay;
                        tbl.dedct_status = isCheckBool(data.dedct_status.ToString());
                        tbl.rcrd_status = "N";
                        tbl.user_id_created_by = Session["user_id"].ToString();
                        tbl.created_dttm = DateTime.Now;
                        tbl.user_id_updated_by = "";
                        tbl.w_tax_perc = data.w_tax_perc;
                        tbl.bus_tax_perc = data.bus_tax_perc;
                        tbl.vat_perc = data.vat_perc;
                        tbl.exmpt_amt = data.exmpt_amt;
                        tbl.updated_dttm = Convert.ToDateTime("1900-01-01");
                        db_pacco.payrollemployee_tax_hdr_tbl.Add(tbl);
                    }


                }
                else
                {
                    payrollemployee_tax_tbl PETX = new payrollemployee_tax_tbl();
                    PETX.empl_id = data.empl_id;
                    PETX.effective_date = newEffectiveDate;
                    PETX.bir_class = data.bir_class;
                    PETX.with_sworn = isCheckBool(data.with_sworn.ToString());
                    PETX.fixed_rate = isCheckBool(data.fixed_rate.ToString());
                    PETX.total_gross_pay = data.total_gross_pay;
                    PETX.dedct_status = isCheckBool(data.dedct_status.ToString());
                    PETX.rcrd_status = "N";
                    PETX.user_id_created_by = Session["user_id"].ToString();
                    PETX.created_dttm = DateTime.Now;
                    PETX.user_id_updated_by = "";
                    PETX.w_tax_perc = data.w_tax_perc;
                    PETX.bus_tax_perc = data.bus_tax_perc;
                    PETX.vat_perc = data.vat_perc;
                    PETX.exmpt_amt = data.exmpt_amt;
                    PETX.updated_dttm = Convert.ToDateTime("1900-01-01");
                    db_pay.payrollemployee_tax_tbl.Add(PETX);

                    var payrollemployee_tax_hdr_tbl = db_pacco.payrollemployee_tax_hdr_tbl.Where(a => a.empl_id == par_empl_id && a.effective_date == newEffectiveDate).FirstOrDefault();

                    if (payrollemployee_tax_hdr_tbl != null)
                    {

                        payrollemployee_tax_hdr_tbl.bir_class = data.bir_class;
                        payrollemployee_tax_hdr_tbl.with_sworn = data.with_sworn;
                        payrollemployee_tax_hdr_tbl.fixed_rate = data.fixed_rate;
                        payrollemployee_tax_hdr_tbl.total_gross_pay = data.total_gross_pay;
                        payrollemployee_tax_hdr_tbl.dedct_status = data.dedct_status;
                        payrollemployee_tax_hdr_tbl.rcrd_status = "N";
                        payrollemployee_tax_hdr_tbl.user_id_updated_by = Session["user_id"].ToString(); ;
                        payrollemployee_tax_hdr_tbl.updated_dttm = DateTime.Now;
                        payrollemployee_tax_hdr_tbl.w_tax_perc = data.w_tax_perc;
                        payrollemployee_tax_hdr_tbl.bus_tax_perc = data.bus_tax_perc;
                        payrollemployee_tax_hdr_tbl.vat_perc = data.vat_perc;
                        payrollemployee_tax_hdr_tbl.exmpt_amt = data.exmpt_amt;
                    }
                    else
                    {
                        payrollemployee_tax_hdr_tbl tbl = new payrollemployee_tax_hdr_tbl();

                        tbl.empl_id = data.empl_id;
                        tbl.effective_date = newEffectiveDate;
                        tbl.bir_class = data.bir_class;
                        tbl.with_sworn = isCheckBool(data.with_sworn.ToString());
                        tbl.fixed_rate = isCheckBool(data.fixed_rate.ToString());
                        tbl.total_gross_pay = data.total_gross_pay;
                        tbl.dedct_status = isCheckBool(data.dedct_status.ToString());
                        tbl.rcrd_status = "N";
                        tbl.user_id_created_by = Session["user_id"].ToString();
                        tbl.created_dttm = DateTime.Now;
                        tbl.user_id_updated_by = "";
                        tbl.w_tax_perc = data.w_tax_perc;
                        tbl.bus_tax_perc = data.bus_tax_perc;
                        tbl.vat_perc = data.vat_perc;
                        tbl.exmpt_amt = data.exmpt_amt;
                        tbl.updated_dttm = Convert.ToDateTime("1900-01-01");
                        db_pacco.payrollemployee_tax_hdr_tbl.Add(tbl);
                    }
                }


                


                message = "success";
                db_pay.SaveChanges();
                db_pacco.SaveChanges();

             
                var vw_phic_share_empl_tbl_ACT = db_pacco.vw_phic_share_empl_tbl_ACT.Where(a => a.department_code == department_code && a.employment_type == "JO").ToList();
                
                HttpContext.Session["vw_phic_share_empl_tbl_ACT"] = vw_phic_share_empl_tbl_ACT;

                return Json(new { message, vw_phic_share_empl_tbl_ACT }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                var msg = DbEntityValidationExceptionError(e);
                return Json(new { message = msg, icon = "error" }, JsonRequestBehavior.AllowGet);
            }

        }

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: Select EmployeeName
        //////*********************************************************************////
        ///// business logic IF par_action == ADD 
        ///                     check if the effective_date is greater than the existing max effective date of the current record 
        ///                     then insert record to data base
        ///                     else return error notif that the data.effective_date is not latest effective date
        ///                  IF par_action == EDIT
        ///                     fetch the data from database then update
        public ActionResult SaveEDITInDatabaseRECEPhic(payrollemployee_tax_phic_rece_tbl data, string par_action, string department_code,string employment_type)
        {
            try
            {
                
                string message = "";



                db_pacco.Database.CommandTimeout = int.MaxValue;



                if (par_action == "ADD")
                {
                    var payrollemployee_tax_phic_rece_tbl = db_pay.payrollemployee_tax_phic_rece_tbl.Where(a => a.empl_id == data.empl_id).OrderByDescending(a => a.effective_date).FirstOrDefault();
                    if(payrollemployee_tax_phic_rece_tbl != null)
                    {
                        var max_effective_date = payrollemployee_tax_phic_rece_tbl.effective_date;
                        if (data.effective_date > max_effective_date)
                        {
                            payrollemployee_tax_phic_rece_tbl phic_rece = new payrollemployee_tax_phic_rece_tbl();
                            phic_rece.empl_id = data.empl_id;
                            phic_rece.effective_date = data.effective_date;
                            phic_rece.bir_class = data.bir_class;
                            phic_rece.with_sworn = isCheckBool(data.with_sworn.ToString());
                            phic_rece.fixed_rate = isCheckBool(data.fixed_rate.ToString());
                            phic_rece.total_gross_pay = data.total_gross_pay;
                            phic_rece.dedct_status = isCheckBool(data.dedct_status.ToString());
                            phic_rece.rcrd_status = "N";
                            phic_rece.user_id_created_by = Session["user_id"].ToString();
                            phic_rece.created_dttm = DateTime.Now;
                            phic_rece.user_id_updated_by = "";
                            phic_rece.w_tax_perc = data.w_tax_perc;
                            phic_rece.bus_tax_perc = data.bus_tax_perc;
                            phic_rece.vat_perc = data.vat_perc;
                            phic_rece.exmpt_amt = data.exmpt_amt;
                            phic_rece.updated_dttm = Convert.ToDateTime("1900-01-01");
                            db_pay.payrollemployee_tax_phic_rece_tbl.Add(phic_rece);
                            db_pay.SaveChanges();
                        }
                        else
                        {
                            throw new Exception("Please select an effective date later than the previous one.");
                        }
                    }
                    else
                    {
                        payrollemployee_tax_phic_rece_tbl phic_rece = new payrollemployee_tax_phic_rece_tbl();
                        phic_rece.empl_id = data.empl_id;
                        phic_rece.effective_date = data.effective_date;
                        phic_rece.bir_class = data.bir_class;
                        phic_rece.with_sworn = isCheckBool(data.with_sworn.ToString());
                        phic_rece.fixed_rate = isCheckBool(data.fixed_rate.ToString());
                        phic_rece.total_gross_pay = data.total_gross_pay;
                        phic_rece.dedct_status = isCheckBool(data.dedct_status.ToString());
                        phic_rece.rcrd_status = "N";
                        phic_rece.user_id_created_by = Session["user_id"].ToString();
                        phic_rece.created_dttm = DateTime.Now;
                        phic_rece.user_id_updated_by = "";
                        phic_rece.w_tax_perc = data.w_tax_perc;
                        phic_rece.bus_tax_perc = data.bus_tax_perc;
                        phic_rece.vat_perc = data.vat_perc;
                        phic_rece.exmpt_amt = data.exmpt_amt;
                        phic_rece.updated_dttm = Convert.ToDateTime("1900-01-01");
                        db_pay.payrollemployee_tax_phic_rece_tbl.Add(phic_rece);
                        db_pay.SaveChanges();
                    }
                   

                    
                   
                }
                else if (par_action == "EDIT")
                {

                    var RECEPhic = db_pay.payrollemployee_tax_phic_rece_tbl.Where(a => a.empl_id == data.empl_id && a.effective_date == data.effective_date).FirstOrDefault();
                    if(RECEPhic != null)
                    {
                        if (RECEPhic.rcrd_status == "N")
                        {
                            RECEPhic.bir_class = data.bir_class;
                            RECEPhic.with_sworn = data.with_sworn;
                            RECEPhic.fixed_rate = data.fixed_rate;
                            RECEPhic.total_gross_pay = data.total_gross_pay;
                            RECEPhic.dedct_status = data.dedct_status;
                            RECEPhic.rcrd_status = "N";
                            RECEPhic.user_id_updated_by = Session["user_id"].ToString(); ;
                            RECEPhic.updated_dttm = DateTime.Now;
                            RECEPhic.w_tax_perc = data.w_tax_perc;
                            RECEPhic.bus_tax_perc = data.bus_tax_perc;
                            RECEPhic.vat_perc = data.vat_perc;
                            RECEPhic.exmpt_amt = data.exmpt_amt;
                            db_pay.SaveChanges();
                        }
                        else
                        {
                            throw new Exception("The record cannot be updated, the record is already approved, please use a new effective date!");
                        }
                    }
                }
                



                message = "success";
               
               


                var vw_phic_share_empl_tbl_ACT = db_pacco.vw_phic_share_rece_tbl_ACT.Where(a => a.department_code == department_code && (a.employment_type == "RE" || a.employment_type == "CE")).ToList();

                return Json(new { message, vw_phic_share_empl_tbl_ACT }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var msg = e.Message;
                return Json(new { message = msg, icon = "error" }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult SaveEDITInDatabase_2(payrollemployee_tax_phic_rece_tbl data, string par_effective_date, string par_empl_id, string par_action, string department_code,string employment_type)
        {
            try
            {
                string message = "";

                DateTime effective_date = Convert.ToDateTime(par_effective_date.ToString());

                DateTime current_date = Convert.ToDateTime(DateTime.Now.ToString("yyyy-MM-dd"));

               

                    
                    var payrollemployee_tax_phic_rece_tbl = db_pay.payrollemployee_tax_phic_rece_tbl.Where(a => a.empl_id == par_empl_id).OrderByDescending(a => a.effective_date).FirstOrDefault();

                    if (payrollemployee_tax_phic_rece_tbl != null)
                    {
                        if (payrollemployee_tax_phic_rece_tbl.effective_date > effective_date)
                        {

                            throw new Exception("You already have a tax rate configured within the range of your selected effective date!");

                        }
                    }


                    if (payrollemployee_tax_phic_rece_tbl != null)
                    {
                        
                            payrollemployee_tax_phic_rece_tbl.bir_class = data.bir_class;
                            payrollemployee_tax_phic_rece_tbl.with_sworn = data.with_sworn;
                            payrollemployee_tax_phic_rece_tbl.fixed_rate = data.fixed_rate;
                            payrollemployee_tax_phic_rece_tbl.total_gross_pay = data.total_gross_pay;
                            payrollemployee_tax_phic_rece_tbl.dedct_status = data.dedct_status;
                            payrollemployee_tax_phic_rece_tbl.rcrd_status = "N";
                            payrollemployee_tax_phic_rece_tbl.user_id_updated_by = Session["user_id"].ToString(); ;
                            payrollemployee_tax_phic_rece_tbl.updated_dttm = DateTime.Now;
                            payrollemployee_tax_phic_rece_tbl.w_tax_perc = data.w_tax_perc;
                            payrollemployee_tax_phic_rece_tbl.bus_tax_perc = data.bus_tax_perc;
                            payrollemployee_tax_phic_rece_tbl.vat_perc = data.vat_perc;
                            payrollemployee_tax_phic_rece_tbl.exmpt_amt = data.exmpt_amt;
                        
                    }
                    else
                    {
                        
                            payrollemployee_tax_phic_rece_tbl tbl = new payrollemployee_tax_phic_rece_tbl();

                            tbl.empl_id = data.empl_id;
                            tbl.effective_date = effective_date;
                            tbl.bir_class = data.bir_class;
                            tbl.with_sworn = isCheckBool(data.with_sworn.ToString());
                            tbl.fixed_rate = isCheckBool(data.fixed_rate.ToString());
                            tbl.total_gross_pay = data.total_gross_pay;
                            tbl.dedct_status = isCheckBool(data.dedct_status.ToString());
                            tbl.rcrd_status = "N";
                            tbl.user_id_created_by = Session["user_id"].ToString();
                            tbl.created_dttm = DateTime.Now;
                            tbl.user_id_updated_by = "";
                            tbl.w_tax_perc = data.w_tax_perc;
                            tbl.bus_tax_perc = data.bus_tax_perc;
                            tbl.vat_perc = data.vat_perc;
                            tbl.exmpt_amt = data.exmpt_amt;
                            tbl.updated_dttm = Convert.ToDateTime("1900-01-01");
                            db_pay.payrollemployee_tax_phic_rece_tbl.Add(tbl);
                        

                    }

                    
              
                     message = "success";
                     db_pay.SaveChanges();


                var vw_phic_share_rece_tbl_ACT = db_pacco.vw_phic_share_rece_tbl_ACT.Where(a => a.department_code == department_code && a.employment_type == employment_type).ToList();

                HttpContext.Session["vw_phic_share_rece_tbl_ACT"] = vw_phic_share_rece_tbl_ACT;

                return Json(new { message, vw_phic_share_rece_tbl_ACT }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                var msg = DbEntityValidationExceptionError(e);
                return Json(new { message = msg, icon = "error" }, JsonRequestBehavior.AllowGet);
            }

        }

        //////*********************************************************************//
        ////// Created By : JRV - Created Date : 09/19/2019
        ////// Description: to Generate per Employee
        //////*********************************************************************//
        ///


        public ActionResult GenerateByEmployee_ne(string par_empl_id, string par_payroll_year, string par_department_code, string par_history)
        {

            try
            {
                db_pacco.Database.CommandTimeout = int.MaxValue;
                string message = "";
                
                var sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl_ne(par_payroll_year, par_empl_id, Session["user_id"].ToString()).ToList();
                db_pacco.SaveChanges();

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_empl_tbl_ACT.Where(a => a.department_code == par_department_code).ToList();

                message = "success";
                return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult GenerateByEmployee_rece_phic(string par_empl_id, string par_payroll_year, string par_department_code, string par_rcrd_status, string par_history)
        {

            try
            {
                if (par_rcrd_status == "A")
                {
                    db_pacco.Database.CommandTimeout = int.MaxValue;
                    string message = "";

                    var sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_hdr_dtl_rc_phic(par_payroll_year, par_empl_id, Session["user_id"].ToString()).ToList();
                    db_pacco.SaveChanges();

                    var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_rece_tbl_ACT.Where(a => a.department_code == par_department_code).ToList();

                    message = "success";
                    return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("This employee tax setup is not approved!");
                }
            }

            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //public ActionResult GenerateByEmployee(string par_empl_id, string par_payroll_year, string par_department_code, string par_history)
        //{

        //    try
        //    {
        //        db_pacco.Database.CommandTimeout = int.MaxValue;
        //        string message = "";
        //        var sp_generate_payrollemployee_tax_hdr_dtl = db_pacco.sp_generate_payrollemployee_tax_dtl_ne_phic(par_payroll_year, par_empl_id, Session["user_id"].ToString()).ToList();
        //        db_pacco.SaveChanges();
        //        var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_empl_tbl_ACT.Where(a => a.department_code == par_department_code).ToList();
        //        HttpContext.Session["vw_phic_share_empl_tbl_ACT"] = sp_payrollemployee_tax_hdr_tbl_list;

        //        message = "success";
        //        return Json(new { message, sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
        //    }

        //    catch (Exception ex)
        //    {
        //        return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}


        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description: Delete Action from Database
        ////*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_empl_id, string effective_date)
        {
            try
            {
                string message = "";

                DateTime par_effective_date = Convert.ToDateTime(effective_date);

                var dt = db_pacco.payrollemployee_tax_hdr_tbl.Where(a =>
                               a.effective_date == par_effective_date &&
                               a.empl_id == par_empl_id).FirstOrDefault();

                db_pacco.payrollemployee_tax_hdr_tbl.Remove(dt);

                if (dt == null)
                {
                    message = "fail";
                }

                else
                {
                    message = "success";
                }
                db_pacco.SaveChanges();
                return Json(message, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
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
             , string par_employment_type
             , int par_tabindex
             , string par_history
            
            )
        {

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cJOTaxRate"] =  par_year
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
                                                          + "," + par_employment_type
                                                          + "," + par_tabindex
                                                          + "," + par_history;

            Session["PreviousValuesonPage_cJOTaxRate_empl_name"] = par_empl_name;
            Session["PreviousValuesonPage_cJOTaxRate_employment_type"] = "NE";

            try
            {
                
                    var dt = db_pacco.sp_payrollemployee_tax_dtl_tbl_list(par_year, par_empl_id).FirstOrDefault();
                    if (dt == null)
                    {
                        throw new Exception("No data found!");
                    }
                
               
              
                return Json(new {icon = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                return Json(new { icon = "error",message}, JsonRequestBehavior.AllowGet);
            }
            
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
        public ActionResult RetrieveDataListGrid(string par_department_code)
        {
            try
            {

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.vw_phic_share_empl_tbl_ACT.Where(a => a.department_code == par_department_code).ToList();
                
                return Json(new { sp_payrollemployee_tax_hdr_tbl_list,icon="success",message="success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message,icon="error" }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult RetrieveDataListGrid2(string par_payroll_year, string par_employment_type, string par_department_code)
        {
            try
            {

              
                var vw_phic_share_rece_tbl_ACT = db_pacco.vw_phic_share_rece_tbl_ACT.Where(a => a.department_code == par_department_code && a.employment_type == par_employment_type).ToList();
                
                HttpContext.Session["vw_phic_share_rece_tbl_ACT"] = vw_phic_share_rece_tbl_ACT;

                return Json(new {vw_phic_share_rece_tbl_ACT, icon = "success", message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message, icon = "error" }, JsonRequestBehavior.AllowGet);
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
        
        public ActionResult RetrieveDataPhicReCe(string par_employment_type, string par_department_code, string par_history)
        {
            try
            {
                var vw_phic_share_rece_tbl_ACT = db_pacco.vw_phic_share_rece_tbl_ACT.Where(a => a.department_code == par_department_code && a.employment_type == par_employment_type).ToList();
                HttpContext.Session["vw_phic_share_rece_tbl_ACT"] = vw_phic_share_rece_tbl_ACT;

                return Json(new { vw_phic_share_rece_tbl_ACT,icon="success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message,icon="error" }, JsonRequestBehavior.AllowGet);
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

    }
}