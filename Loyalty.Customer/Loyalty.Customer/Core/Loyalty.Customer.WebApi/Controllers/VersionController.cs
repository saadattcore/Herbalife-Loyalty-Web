using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Reflection;

namespace Loyalty.Customer.WebApi {
    [Route("loyalty/api/[controller]")]
    public class VersionController : Controller {
        private readonly ILogger<VersionController> _logger;

        public VersionController(ILogger<VersionController> logger) {
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Get() {
            try {
                var version = System.IO.File.GetLastWriteTime(Assembly.GetExecutingAssembly().Location).ToString();
                return Json(new { data = new { version } });
            } catch (Exception ex) {
                _logger.LogError("Loyalty.Customer: Version.Get-{0}", ex);
                return new StatusCodeResult(500);
            }
        }
    }
}
