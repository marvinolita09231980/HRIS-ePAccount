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
    
    public partial class sp_extract_refund_Result
    {
        public string voucher_nbr { get; set; }
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string payrolltemplate_descr { get; set; }
        public string employment_type { get; set; }
        public string remarks { get; set; }
        public string employment_type1 { get; set; }
        public Nullable<System.DateTime> payroll_period_from { get; set; }
        public Nullable<System.DateTime> payroll_period_to { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public Nullable<decimal> gross_pay { get; set; }
        public Nullable<decimal> net_pay { get; set; }
    }
}
