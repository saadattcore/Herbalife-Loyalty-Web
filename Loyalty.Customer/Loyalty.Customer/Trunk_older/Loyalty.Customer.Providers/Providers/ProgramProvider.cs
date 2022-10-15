using System;
using System.Collections.Generic;
using HL.Loyalty.Models;
using Loyalty.Customer.Providers.Interfaces;
using System.Globalization;
using System.Web;
using Loyalty.Customer.Providers.Models;

namespace Loyalty.Customer.Providers {
    public class ProgramProvider : IProgramProvider {
        private ProgramModel _program;
        private const int _numberOfObjectsPerPage = 10;
        private HttpContext _context;

        // mock customer for tests, waiting for the api to be provide
        private CustomerModel _customer = new CustomerModel {
            Id = GuidUtil.NewSequentialId(),
            ContactId = "0",
            DistributorId = "STAFF",
            Email = "samuelcg@herbalife.com",
            FirstName = "Samuel",
            LastName = "Contreras",
            GoHlCustomerId = "F4CD4D1E-2668-496C-B3D3-86024125EF0C",
            LoyalityProgramId = "B55A8979-08B5-E612-80C4-0015DDE1E511"
        };

        public ProgramProvider(HttpContext context) {
            _context = context;
        }

        public string Locale {
            get {
                return CultureInfo.CurrentCulture.Name;
            }
        }

        public string AuthToken {
            get {
                if (_context != null && _context.Request.Cookies[System.Web.Security.FormsAuthentication.FormsCookieName] != null)
                    return _context.Request.Cookies[System.Web.Security.FormsAuthentication.FormsCookieName].Value;
                else
                    return null;
            }
        }

        public IList<LoyaltyRewardModel> GetActivityRewards() {
            var url = $"api/rewards/GetActivitiesRewards?countryCode={Locale}";
            var result = ProxyHelper.GetProxyData<List<LoyaltyRewardModel>, string>(AuthToken, string.Empty, url, true);
            return result;
        }

        public IList<LoyaltyRewardModel> GetShopRewards() {
            var url = $"api/rewards/GetShoppingRewards?countryCode={Locale}";
            return ProxyHelper.GetProxyData<List<LoyaltyRewardModel>, string>(AuthToken, string.Empty, url, true);
        }

        public IList<LoyaltyRewardModel> GetHighValueRewards() {
            var url = $"api/rewards/GetHighValueRewards?locale={Locale}";
            var result = ProxyHelper.GetProxyData<List<LoyaltyRewardModel>, string>(AuthToken, string.Empty, url, true);
            return result;
        }

        public ServiceResponse EnrolledCustomer(CustomerModel Customer) {
            var request = new EnrollCustomerRequest {
                Id = Customer.Id,
                DistributorId = Customer.DistributorId,
                GoHLCustomerId = Guid.Parse(Customer.GoHlCustomerId),
                CountryCode = "US",
                FirstName = Customer.FirstName,
                LastName = Customer.LastName,
                Email = Customer.Email,
                LoyaltyProgramId = Guid.Parse(Customer.LoyalityProgramId),
                ProgramDuration = new EnrollProgramDuration {
                    From = DateTime.Today,
                    To = DateTime.Today.AddYears(1)
                }
            };

            var CorrelationID = GuidUtil.NewSequentialId();
            var url = $"LoyaltyCoreApi/api/Customer";
            return ProxyHelper.PostProxyData<ServiceResponse, EnrollCustomerRequest>(CorrelationID, request, url);
        }

        public CustomerModel GetCustomer(string customerEmail) {
            if (string.IsNullOrEmpty(customerEmail))
                throw new ArgumentNullException("customerEmail", "Customer Email can't be null or empty");

            return _customer;
        }
    }
}
