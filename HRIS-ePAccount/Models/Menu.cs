using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HRIS_ePAccount.Models
{
    public class Menu
    {
       
    }
   public class User_Menu : sp_user_menu_access_role_list_Result
    {
        public string remittancetype_code { get; set; }
        public string remittancetype_descr { get; set; }
        public string remittance_ctrl_nbr { get; set; }
        public string remittance_status { get; set; }
        public string remittance_year { get; set; }
        public string remittance_month { get; set; }
        public string remittance_month_descr { get; set; }
        public string employment_type { get; set; }
        public string employment_type_descr { get; set; }
        public string remittance_status_descr { get; set; }
    }
   public class RejectedData : sp_remittance_ledger_info_GSIS_Result
   {
       public int isChecked { get; set; }
   }
   public class DocTrack
   {
        
       public DateTime dttm     { get; set; }
       public string remarks    { get; set; }
       public string doc_nbr    { get; set; }
       public string doc_cafoa  { get; set; }
       public string doc_fund_subcode { get; set; }
       public int nbr           { get; set; }
       public string a_flag     { get; set; }
       public int ToRelease_route { get; set; }
       public int ToReturn_route { get; set; }
        

   }
   
    
}