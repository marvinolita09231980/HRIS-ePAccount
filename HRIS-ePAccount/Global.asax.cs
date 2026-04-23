using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Hangfire;
using Hangfire.SqlServer;

namespace HRIS_ePAccount
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private BackgroundJobServer _server;
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            GlobalConfiguration.Configuration
           .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
           .UseSimpleAssemblyNameTypeSerializer()
           .UseRecommendedSerializerSettings()
           .UseSqlServerStorage("Server=192.168.80.49\\HRIS;Database=HRIS_ACT;User Id=sa;Password=SystemAdmin_PRD123;MultipleActiveResultSets=True;");

            // START HANGFIRE SERVER (THIS replaces HangfireAspNet)
            //_server = new BackgroundJobServer();

            // Optional test job
        //    BackgroundJob.Enqueue(() => System.Diagnostics.Debug.WriteLine("Hello world from Hangfire!"));

        }

        protected void Application_End()
        {
            _server?.Dispose();
        }
    }
}
