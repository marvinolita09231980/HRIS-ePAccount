using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_ePAccount.Filter
{
    public class SessionExpireAttribute: ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            // Check if the session has expired (e.g., check a user session variable)
            if (HttpContext.Current.Session["user_id"] == null) // Adjust to your session variable
            {
                // Redirect to login page if session is expired
                filterContext.Result = new RedirectResult("~/Login/Index");
                return;
            }

            base.OnActionExecuting(filterContext);
        }
    }
}