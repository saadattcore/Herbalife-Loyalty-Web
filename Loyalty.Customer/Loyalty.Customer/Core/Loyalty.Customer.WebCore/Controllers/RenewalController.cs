using Loyalty.Customer.Models.Configuration;
using Loyalty.Customer.Models.Provider;
using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Shop.Storefront.Common.Infrastructure.StorefrontData;
using System;

namespace Loyalty.Customer.WebCore.Controllers {
    [AllowAnonymous]
    public class RenewalController : Controller {
        private readonly IProgramProvider _programProvider;
        private readonly CustomerHelper _customerHelper;
        private readonly ILogger<RenewalController> _logger;
        private readonly GeneralSettings _settings;

        public RenewalController(IProgramProvider programProvider, CustomerHelper customerHelper, ILogger<RenewalController> logger, IOptions<GeneralSettings> settings) {
            _programProvider = programProvider;
            _customerHelper = customerHelper;
            _logger = logger;
            _settings = settings.Value;
        }

        public IActionResult Index([FromQuery]string token) {
            try {
                FillTempData();
                var decryptCustomer = AesHelper.AES_Decrypt(token, _settings.DecryptionKey, _settings.DecryptionFootprint);
                if (string.IsNullOrEmpty(decryptCustomer)) {
                    _logger.LogWarning($"Renewal- Token not valid {token}");
                    return View("Error");
                }

                var lcpCustomerId = new Guid(decryptCustomer);
                var distributorId = GetDistributorId();
                var customerDashboard = _programProvider.GetDashboardByLCPCustomerId(lcpCustomerId);
                var latestProgram = _programProvider.GetDashboardByGOHLCustomerId(customerDashboard.GoHLCustomerId);

                if (lcpCustomerId != latestProgram.CustomerId && DateTime.UtcNow < latestProgram.CustomerEndDate) {
                    _logger.LogWarning($"Renewal- Customer({lcpCustomerId}) has a block on another loyalty program.");
                    return View("Blocker");
                }

                if (!(customerDashboard.CustomerEndDate <= DateTime.UtcNow.AddDays(_settings.RenewalWindow))) {
                    _logger.LogInformation($"Renewal- Customer({lcpCustomerId}) already extended before.");
                    return View("Successfull");
                }

                var distributorProgram = _programProvider.GetDistributorProgram(distributorId);
                var programPeriod = new DateRange();
                programPeriod.From = customerDashboard.CustomerStartDate;
                programPeriod.To = DateTime.UtcNow <= customerDashboard.CustomerEndDate ? customerDashboard.CustomerEndDate.Value : DateTime.UtcNow;
                programPeriod.To = programPeriod.To.Value.AddDays(_settings.CustomerLockPeriod);

                // Send update
                var request = new EnrollCustomerRequest {
                    Id = customerDashboard.CustomerId,
                    DistributorId = distributorId,
                    GoHLCustomerId = customerDashboard.GoHLCustomerId,
                    CountryCode = distributorProgram.CountryCodeISO,
                    LoyaltyProgramId = customerDashboard.ProgramId,
                    ProgramDuration = programPeriod
                };

                var result = _programProvider.UpdateCustomer(request);
                if (!result.IsSuccess) {
                    _logger.LogError($"Renewal- {result.ErrorMessage}");
                    return View("Error");
                }

                _logger.LogInformation($"Renewal- Customer({lcpCustomerId}) extended program successfully.");
                return View("Successfull");
            } catch (Exception ex) {
                _logger.LogError($"Renewal-", ex);
                return View("Error");
            }
        }

        private void FillTempData() {
            TempData["DistributorName"] = GetDistributorName();
            TempData["ReloadUrl"] = Request.Path.Value + Request.QueryString.Value;
        }

        private string GetDistributorId() {
            var store = HttpContext.GetStore();
#if DEBUG
            return "1111111111"; // this is just for local testing.
#else
            return store?.DistributorId;
#endif
        }

        private string GetDistributorName() {
            var store = HttpContext.GetStore();
#if DEBUG
            return "Mark Hughes";
#else
            return store?.Owner.ContactName;
#endif
        }
    }
}
