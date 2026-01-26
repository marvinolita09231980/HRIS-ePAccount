using HRIS_ePAccount.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;

namespace HRIS_ePAccount.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class RetrieveReadOnlyDataController : Controller
    {
        HRIS_ACTEntities db_pacco = new HRIS_ACTEntities();
        // GET: RetrieveReadOnlyData
        public ActionResult Index()
        {
            return View();
        }

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
        public ActionResult RetrieveDataListGrid(string pay_payroll_year, string par_department_code, string par_history)
        {
            try
            {

                var sp_payrollemployee_tax_hdr_tbl_list = db_pacco.sp_payrollemployee_tax_hdr_tbl_list(pay_payroll_year, par_department_code, par_history).ToList();



                return Json(new { sp_payrollemployee_tax_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }
    }
}