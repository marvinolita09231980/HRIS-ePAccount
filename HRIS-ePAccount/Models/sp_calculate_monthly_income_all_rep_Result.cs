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
    
    public partial class sp_calculate_monthly_income_all_rep_Result
    {
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public string lbl_hdr_descr { get; set; }
        public string lbl_total_comp_descr { get; set; }
        public string lbl_nontxbl_comp_descr { get; set; }
        public string lbl_txbl_comp_descr { get; set; }
        public string lbl_month_descr { get; set; }
        public string lbl_year_descr { get; set; }
        public string payroll_month_descr { get; set; }
        public string total_gross_pay { get; set; }
        public string total_taxable { get; set; }
        public string total_non_taxable { get; set; }
    }
}
