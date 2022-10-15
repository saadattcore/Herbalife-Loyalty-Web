using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shop.Storefront.Common.Infrastructure.StorefrontData;
using System;
using System.Globalization;

namespace Loyalty.Customer.WebCore.Controllers {
    [Authorize]
    public class SpaController : Controller {
        private IProgramProvider _program;
        private readonly CustomerHelper _customeHelper;

        public SpaController(IProgramProvider programProvider, CustomerHelper customerHelper) {
            _program = programProvider;
            _customeHelper = customerHelper;
        }

        public IActionResult Index() {
            return View();
        }

        public IActionResult ValidRoute() {
            return Redirect(GetRedirectUrl());
        }

        private string GetRedirectUrl() {
            var distributorId = GetDistributorId();
            if (string.IsNullOrEmpty(distributorId)) {
                // return to home in case store does not exists
                return $"/Loyalty/Home/Error/{CultureInfo.CurrentCulture.Name}/";
            }

            var profile = _customeHelper.GetCustomerProfile(Request);
            var dashboard = _program.GetDashboardByGOHLCustomerId(new Guid(profile.Id), distributorId);
            if (dashboard.ActiveProgram) {
                return $"/Loyalty/Spa/Index/{CultureInfo.CurrentCulture.Name}/#/dashboard";
            } else {
                return $"/Loyalty/Spa/Index/{CultureInfo.CurrentCulture.Name}/#/loyaltyTerms";
            }
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
