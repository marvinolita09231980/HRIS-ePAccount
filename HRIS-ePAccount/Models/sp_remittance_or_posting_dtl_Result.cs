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
    
    public partial class sp_remittance_or_posting_dtl_Result
    {
        public string remittance_ctrl_nbr { get; set; }
        public string empl_id { get; set; }
        public string voucher_nbr { get; set; }
        public string employee_name { get; set; }
        public string last_name { get; set; }
        public string first_name { get; set; }
        public string middle_name { get; set; }
        public string suffix_name { get; set; }
        public Nullable<decimal> grid_amount_ps { get; set; }
        public Nullable<decimal> grid_amount_gs { get; set; }
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public string or_nbr { get; set; }
        public string remittance_status_dtl { get; set; }
        public string or_date { get; set; }
        public string isPosted { get; set; }
    }
}
