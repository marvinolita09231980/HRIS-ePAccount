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
    using System.Collections.Generic;
    
    public partial class remittance_dtl_others_tbl
    {
        public string remittance_ctrl_nbr { get; set; }
        public string empl_id { get; set; }
        public string voucher_nbr { get; set; }
        public Nullable<decimal> payroll_amount { get; set; }
        public Nullable<decimal> uploaded_amount { get; set; }
        public string remittance_status { get; set; }
        public string or_nbr { get; set; }
        public Nullable<System.DateTime> or_date { get; set; }
    }
}