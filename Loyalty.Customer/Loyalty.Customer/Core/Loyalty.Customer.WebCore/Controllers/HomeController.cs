using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shop.Storefront.Common.Infrastructure.StorefrontData;
using System;
using System.Globalization;

namespace Loyalty.Customer.WebCore.Controllers {
    [Authorize]
    public class HomeController : Controller {
        private readonly IProgramProvider _program;
        private readonly CustomerHelper _customerHelper;
        private readonly ILogger<HomeController> _logger;

        public HomeController(IProgramProvider programProvider, CustomerHelper customerHelper, ILogger<HomeController> logger) {
            _program = programProvider;
            _customerHelper = customerHelper;
            _logger = logger;
        }

        public IActionResult Index() {
            try {
                var distributorId = GetDistributorId();

                // Valid Distributor has Program active
                if (!ValidDistributorProgram(distributorId)) {
                    return Redirect($"/Catalog/Home/Index/{CultureInfo.CurrentCulture.Name}/");
                }

                // Customer has already a program
                if (ValidCustomerProgram(distributorId)) {
                    return Redirect($"/Loyalty/Spa/Index/{CultureInfo.CurrentCulture.Name}/#/dashboard");
                }
                return View();
            } catch (Exception ex) {
                _logger.LogError(ex.Message);
                return Redirect($"/Loyalty/Home/Error/{CultureInfo.CurrentCulture.Name}/");
            }
        }

        public IActionResult Error() {
            return Redirect($"/Account/Authentication/Login/{CultureInfo.CurrentCulture.Name}/");
        }

        private bool ValidCustomerProgram(string distributorId) {
            var profile = _customerHelper.GetCustomerProfile(Request);
            if (profile == null) {
                throw new Models.Exceptions.CustomerProfileException();
            }

            var dashboard = _program.GetDashboardByGOHLCustomerId(new Guid(profile.Id), distributorId);
            return dashboard.ActiveProgram;
        }

        private bool ValidDistributorProgram(string distributorId) {
            if (string.IsNullOrEmpty(distributorId))
                return false;

            var distributorProgram = _program.GetDistributorProgram(distributorId);
            return distributorProgram != null;
        }

        private string GetDistributorId() {
            var store = HttpContext.GetStore();
#if DEBUG
            return "1111111111"; // this is just for local testing.
#else
            return store?.DistributorId;
#endif
        }
    }
}
