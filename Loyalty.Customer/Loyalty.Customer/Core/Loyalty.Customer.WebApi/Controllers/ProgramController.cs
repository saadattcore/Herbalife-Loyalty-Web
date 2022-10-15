using Loyalty.Customer.Models.Configuration;
using Loyalty.Customer.Models.Provider;
using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Shop.Storefront.Common.Infrastructure.StorefrontData;
using System;
using System.Globalization;
using System.Linq;
using System.Net;

namespace Loyalty.Customer.WebApi
{
    [Authorize]
    [Route("loyalty/api/[controller]/[action]/{locale=en-US}")]
    public class ProgramController : Controller
    {
        private readonly IProgramProvider _programProvider;
        private readonly ILogger<ProgramController> _logger;
        private readonly IStringLocalizer<ProgramController> _localize;
        private readonly CustomerHelper _customerHelper;
        private readonly GeneralSettings _generalSettings;
        private readonly IDistributorProvider _distributorProvider;

        public ProgramController(IProgramProvider programProvider, ILogger<ProgramController> logger, IStringLocalizer<ProgramController> localize, CustomerHelper customerHelper, IOptions<GeneralSettings> generalSettings, IDistributorProvider distributorProvider)
        {
            _programProvider = programProvider;
            _logger = logger;
            _localize = localize;
            _customerHelper = customerHelper;
            _generalSettings = generalSettings.Value;
            _distributorProvider = distributorProvider;
        }

        [HttpGet]
        public IActionResult GetHighValueRewards([FromQuery]string rewardType)
        {
            try
            {
                var rewards = _programProvider.GetHighValueRewards(rewardType).ToList();
                rewards.ForEach(x =>
                {
                    x.CategoryDescription = _localize[x.CategoryCode].ToString();
                });
                return Json(rewards);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetHighValueRewards-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        public IActionResult GetCustomer()
        {
            try
            {
                var cust = _customerHelper.GetCustomerProfile(Request);
                return Json(cust);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetCustomer-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        public IActionResult GetCustomerDashboard()
        {
            try
            {
                var cust = _customerHelper.GetCustomerProfile(Request);
                if (cust == null)
                {
                    throw new Models.Exceptions.CustomerProfileException();
                }

                var dashboard = _programProvider.GetDashboardByGOHLCustomerId(new Guid(cust.Id));
                return Json(dashboard);
            }
            catch (Models.Exceptions.CustomerProfileException ex)
            {
                _logger.LogError("GetCustomerDashboard-{0}", ex);
                return Redirect($"/Loyalty/Home/Error/{CultureInfo.CurrentCulture.Name}/");
            }
            catch (Exception ex)
            {
                _logger.LogError("GetCustomerDashboard-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        public IActionResult GetDistributorProgram()
        {
            try
            {
                var store = HttpContext.GetStore();
                var distributorId = GetDistributorId();
                var dashboard = _programProvider.GetDistributorProgram(distributorId);
                if (dashboard != null && dashboard.Activities.Any())
                    dashboard.Activities.ForEach(c => c.Description = c.Title = _localize.GetString(c.ActivityCode));
                return Json(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetDistributorProgram-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        public IActionResult GetActivitiesProgram(string programId)
        {
            try
            {
                var activities = _programProvider.GetActivitiesByProgram(programId).ToList();
                activities.ForEach(x =>
                {
                    x.Title = _localize[x.ActivityCode].ToString();
                });
                return Json(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetActivitiesProgram-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        public IActionResult ActivateProgram(EnrollCustomerRequest request)
        {
            try
            {
                var cust = _customerHelper.GetCustomerProfile(Request);
                if (cust == null)
                {
                    throw new Models.Exceptions.CustomerProfileException();
                }

                var distributorId = GetDistributorId();
                var distributorProgram = _programProvider.GetDistributorProgram(distributorId);
                var activeDash = _programProvider.GetDashboardByGOHLCustomerId(new Guid(cust.Id));

                if (activeDash.ActiveProgram && distributorProgram.ProgramId != activeDash.ProgramId && DateTime.UtcNow < activeDash.CustomerEndDate)
                {
                    return new JsonResult(new GenericResponse
                    {
                        IsSuccess = false,
                        ErrorMessage = $"LOCK_PERIOD"
                    });
                }

                // Fill missing fields
                request.DistributorId = distributorId;
                request.Email = cust.Email;
                request.GoHLCustomerId = new Guid(cust.Id);
                request.LoyaltyProgramId = distributorProgram.ProgramId;
                request.CountryCode = distributorProgram.CountryCodeISO;
                request.ProgramDuration = new DateRange
                {
                    From = DateTime.UtcNow,
                    To = DateTime.UtcNow.AddDays(_generalSettings.CustomerLockPeriod)
                };

                var result = _programProvider.EnrolledCustomer(request);
                return Json(result);
            }
            catch (Models.Exceptions.CustomerProfileException ex)
            {
                _logger.LogError("GetCustomerDashboard-{0}", ex);
                return Redirect($"/Loyalty/Home/Error/{CultureInfo.CurrentCulture.Name}/");
            }
            catch (Exception ex)
            {
                _logger.LogError("ActiveProgram-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        public IActionResult SaveWishItem([FromBody]CustomerWishRequest customerWish)
        {
            try
            {
                customerWish.Validity = new DateRange { From = DateTime.UtcNow };

                if (string.IsNullOrEmpty(customerWish.CategoryCode))
                    throw new ArgumentNullException("CategoryCode");

                if (customerWish.CustomerId == Guid.Empty)
                    throw new ArgumentNullException("CustomerId");

                if (string.IsNullOrEmpty(customerWish.Sku))
                    throw new ArgumentNullException("Sku");

                if (customerWish.Tier == 0)
                    throw new ArgumentNullException("Tier");

                var result = _programProvider.SaveCustomerWish(customerWish);
                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError("SaveWishItem-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        public IActionResult GetDistributor(string email)
        {
            try
            {
                var distributor = _distributorProvider.GetDistributor(email);
                return Json(distributor);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetDistributor-{0}", ex);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var actionName = ((Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor)context.ActionDescriptor).ActionName;
            var arguments = string.Join(",", context.ActionArguments.Select(x => $"{x.Key}={JsonConvert.SerializeObject(x.Value)}").ToArray());
            _logger.LogInformation($"ProgramAPI- Action:{actionName}; Arguments: {arguments}");
            base.OnActionExecuting(context);
        }

        private string GetDistributorId()
        {
            var store = HttpContext.GetStore();
#if DEBUG
            return "1111111111"; // this is just for local testing.
#else
            return store.DistributorId;
#endif
        }
    }
}
