using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HRIS_ePAccount.Models
{
    public class QueueCountsVm
    {
        public int pending_count { get; set; }
        public int failed_count { get; set; }
        public int running_count { get; set; }
    }
}