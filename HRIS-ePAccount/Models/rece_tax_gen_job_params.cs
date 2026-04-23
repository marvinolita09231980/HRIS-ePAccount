namespace HRIS_ePAccount.Models
{
    using System;

    public partial class rece_tax_gen_job_params
    {
        public int id { get; set; }
        public string payroll_year { get; set; }
        public string employment_type { get; set; }
        public string user_id { get; set; }
        public System.DateTime created_dttm { get; set; }
    }
}
