//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace HRIS_ePAccount.Models
{
    using System;
    
    public partial class sp_remittance_ledger_info_SSS_2_Result
    {
        public Nullable<long> rownumber { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string payroll_registry_descr { get; set; }
        public string remittance_ctrl_nbr { get; set; }
        public string remittance_year { get; set; }
        public string remittance_month { get; set; }
        public string employment_type { get; set; }
        public string remittancetype_code { get; set; }
        public string remittance_descr { get; set; }
        public string remittance_status { get; set; }
        public string remittance_status_descr { get; set; }
        public Nullable<System.DateTime> remittance_dttm_created { get; set; }
        public string user_id_created_by { get; set; }
        public Nullable<System.DateTime> remittance_dttm_updated { get; set; }
        public string user_id_updated_by { get; set; }
        public Nullable<System.DateTime> remittance_dttm_released { get; set; }
        public string user_id_released_by { get; set; }
        public Nullable<System.DateTime> remittance_dttm_remitted { get; set; }
        public string user_id_remitted_by { get; set; }
        public Nullable<decimal> payroll_amount { get; set; }
        public Nullable<decimal> ec_amount { get; set; }
        public decimal mpf_amount { get; set; }
        public string department_code { get; set; }
        public string empl_id { get; set; }
        public string voucher_nbr { get; set; }
        public string employee_name { get; set; }
        public string last_name { get; set; }
        public string first_name { get; set; }
        public string middle_name { get; set; }
        public string suffix_name { get; set; }
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public string month_name { get; set; }
        public string sss_nbr { get; set; }
        public string remittance_status_dtl { get; set; }
    }
}