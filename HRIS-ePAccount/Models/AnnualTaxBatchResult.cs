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
}
