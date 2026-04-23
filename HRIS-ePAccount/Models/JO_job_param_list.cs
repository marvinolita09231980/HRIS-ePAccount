namespace HRIS_ePAccount.Models
{
    public partial class JO_job_param_list
    {
        public int job_id { get; set; }
        public string payroll_year { get; set; }
        public string employment_type { get; set; }
        public bool processed { get; set; }
        public string empl_id { get; set; }
    }
}
