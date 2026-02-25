using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRIS_ePAccount.Models
{
    public class AnnualTaxBatchResult
    {
        public bool Success { get; set; }
        public int ProcessedCount { get; set; }
        public string ResultMsg { get; set; } = string.Empty;
    }

    public class generateList
    {
        // Employee ID
        public string empl_id { get; set; }

        // Selected year
        public string payroll_year { get; set; }

        // Employment type (e.g., CE, RE, JO)
        public string employment_type { get; set; }
        public bool processed { get; set; }
    }
}
