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
    
    public partial class remittance_hdr_tbl
    {
        public string remittance_ctrl_nbr { get; set; }
        public string remittance_year { get; set; }
        public string remittance_month { get; set; }
        public string employment_type { get; set; }
        public string remittancetype_code { get; set; }
        public string remittance_descr { get; set; }
        public string remittance_status { get; set; }
        public Nullable<System.DateTime> remittance_dttm_created { get; set; }
        public string user_id_created_by { get; set; }
        public Nullable<System.DateTime> remittance_dttm_updated { get; set; }
        public string user_id_updated_by { get; set; }
        public Nullable<System.DateTime> remittance_dttm_released { get; set; }
        public string user_id_released_by { get; set; }
        public Nullable<System.DateTime> remittance_dttm_remitted { get; set; }
        public string user_id_remitted_by { get; set; }
    }
}