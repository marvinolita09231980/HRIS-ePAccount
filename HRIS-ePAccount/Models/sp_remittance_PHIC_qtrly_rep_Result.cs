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
    
    public partial class sp_remittance_PHIC_qtrly_rep_Result
    {
        public string phic_nbr { get; set; }
        public string empl_id { get; set; }
        public string last_name { get; set; }
        public string first_name { get; set; }
        public string middle_name { get; set; }
        public string suffix_name { get; set; }
        public string month1 { get; set; }
        public string month2 { get; set; }
        public string month3 { get; set; }
        public string month1_r { get; set; }
        public string month2_r { get; set; }
        public string month3_r { get; set; }
        public string period_covered { get; set; }
        public Nullable<decimal> rep_amount_ps1 { get; set; }
        public Nullable<decimal> rep_amount_gs1 { get; set; }
        public Nullable<decimal> rep_amount_ps2 { get; set; }
        public Nullable<decimal> rep_amount_gs2 { get; set; }
        public Nullable<decimal> rep_amount_ps3 { get; set; }
        public Nullable<decimal> rep_amount_gs3 { get; set; }
        public Nullable<decimal> payroll_amount_ps1 { get; set; }
        public Nullable<decimal> payroll_amount_gs1 { get; set; }
        public Nullable<decimal> payroll_amount_ps2 { get; set; }
        public Nullable<decimal> payroll_amount_gs2 { get; set; }
        public Nullable<decimal> payroll_amount_ps3 { get; set; }
        public Nullable<decimal> payroll_amount_gs3 { get; set; }
        public string organization_name { get; set; }
        public string remittance_sig1_name { get; set; }
        public string remittance_sig1_desg { get; set; }
        public string remittance_sig2_name { get; set; }
        public string remittance_sig2_desg { get; set; }
        public string remittance_sig3_name { get; set; }
        public string remittance_sig3_desg { get; set; }
        public string remittance_sig_acct_name { get; set; }
        public string remittance_sig_acct_desg { get; set; }
        public string remittance_id1 { get; set; }
        public string remittance_id2 { get; set; }
    }
}
