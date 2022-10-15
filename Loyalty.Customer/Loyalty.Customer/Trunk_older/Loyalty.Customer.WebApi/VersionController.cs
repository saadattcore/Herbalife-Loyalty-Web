using HL.Common.Logging;
using System;
using System.Net;
using System.Reflection;
using System.Web.Http;

namespace Loyalty.Customer.WebApi {
    public class VersionController : ApiController {
        [HttpGet]
        [AllowAnonymous]
        public IHttpActionResult Get() {
            try {
                var version = System.IO.File.GetLastWriteTime(Assembly.GetExecutingAssembly().Location).ToString();
                return Content(HttpStatusCode.OK, new { data = new { version } });
            } catch (Exception ex) {
                LoggerHelper.Error(ex.ToString());
                return StatusCode(HttpStatusCode.InternalServerError);
            }
        }
    }
}
