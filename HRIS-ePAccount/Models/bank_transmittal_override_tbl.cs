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
    
    public partial class bank_transmittal_override_tbl
    {
        public string batch_nbr { get; set; }
        public string voucher_nbr { get; set; }
        public string override_reason { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
        public string created_user_id { get; set; }
        public string updated_user_id { get; set; }
    }
}