using HL.Common.Logging;
using HL.Loyalty.Models;
using Loyalty.Customer.Providers;
using Loyalty.Customer.Providers.Interfaces;
using System;
using System.Net;
using System.Web;
using System.Web.Http;

namespace Loyalty.Customer.WebApi {
    public class ProgramController : ApiController {
        private readonly IProgramProvider _programProvider;

        public ProgramController() {
            _programProvider = new ProgramProvider(HttpContext.Current);
        }

        [HttpGet]
        public IHttpActionResult GetHighValueRewards() {
            try {
                return Ok(_programProvider.GetHighValueRewards());
            } catch(Exception ex) {
                LoggerHelper.Error(ex.ToString());
                return StatusCode(HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        public IHttpActionResult GetCustomer() {
            try {
                return Ok(_programProvider.GetCustomer("samuelcg@herbalife.com"));
            } catch(Exception ex) {
                LoggerHelper.Error(ex.ToString());
                return StatusCode(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        public IHttpActionResult ActivateProgram(CustomerModel customer) {
            try {
                var result = _programProvider.EnrolledCustomer(customer);
                if ((int)result.State != 1)
                    return StatusCode(HttpStatusCode.InternalServerError);
                return Ok();
            } catch (Exception ex) {
                LoggerHelper.Error(ex.ToString());
                return StatusCode(HttpStatusCode.InternalServerError);
            }
        }
    }
}
