using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using HRIS_Common;

namespace HRIS_ePAccount.Controllers
{
    /// <summary>
    /// Summary description for FileUploader
    /// </summary>
    public class FileUploader : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string filedata = string.Empty;
            string result = "";
            string result_msg = "Successfully Uploaded";
            if (context.Request.Files.Count > 0)
            {
                HttpFileCollection files = context.Request.Files;
                string par_year = context.Request["par_year"];
                string par_month = context.Request["par_month"];
                string par_account = context.Request["par_account"];
                for (int i = 0; i < files.Count; i++)
                {
                    HttpPostedFile file = files[i];
                    if (Path.GetExtension(file.FileName).ToLower() != ".csv")
                    {
                        result_msg = "Only .csv file type is allowed";
                        result = "N";
                        context.Response.ContentType = "text/plain";
                        context.Response.Write(result + "*" + result_msg);
                        return;
                    }
                    decimal size = Math.Round(((decimal)file.ContentLength / (decimal)1024), 2);
                    if (size > 2048)
                    {

                        result_msg = "File size should not exceed 2 MB.!";
                        result = "N";
                        context.Response.ContentType = "text/plain";
                        context.Response.Write(result + "*" + result_msg);
                        return;
                    }
                    string fname;
                    if (HttpContext.Current.Request.Browser.Browser.ToUpper() == "IE" || HttpContext.Current.Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                    {
                        string[] testfiles = file.FileName.Split(new char[] {
                        '\\'
                    });
                        fname = testfiles[testfiles.Length - 1];
                    }
                    else
                    {
                        fname = Path.GetExtension(file.FileName);
                    }

                    ////here UploadFile is define my folder name, where files will be store.  
                    //string uploaddir = System.Configuration.ConfigurationManager.AppSettings["Upload"];
                    filedata = "U_" + par_account + "_" + par_year + "_" + par_month + "" + fname;
                    fname = Path.Combine(context.Server.MapPath("~/UploadedFile/"), filedata);
                    result_msg = fname;
                    file.SaveAs(fname);
                    //DataTable dt = MyCmn.RetrieveData("sp_othercontributionloan_stg_tbl_upload", "par_filename", fname);
                    //if (dt != null && dt.Rows.Count > 0)
                    //{
                    //    result = dt.Rows[0]["run_status"].ToString();
                    //    result_msg = dt.Rows[0]["run_message"].ToString();
                    //}
                    //else
                    //{
                    //    result = "N";
                    //    result_msg = "ERROR ON UPLOADING FILE";
                    //}
                }
            }
            context.Response.ContentType = "text/plain";
            context.Response.Write(result + "*" + result_msg);
            //if you want to use file path in aspx.cs page , then assign it in to session  
            // context.Session["PathImage"] = filedata;
        }
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}