using HLF.Lib.Connected.Rest;
using Loyalty.Customer.Models.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Shop.Storefront.Account.DTO;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Loyalty.Customer.Provider.Helpers {
    public class CustomerHelper {
        private readonly ILogger<CustomerHelper> _logger;

        public CustomerHelper(ILogger<CustomerHelper> logger) {
            _logger = logger;
        }

        public CustomerProfile GetCustomerProfile(HttpRequest request) {
            try {
                ServicePointManager.ServerCertificateValidationCallback = ((sender, certificate, chain, sslPolicyErrors) => true);


                var apiUri = new Uri($"https://markhughes.zuswdevsvcfab.goherbalife.com/Account/Api/CustomerProfile/V1/");
                var authCookie = new Cookie("Storefront.Auth", request.Cookies["Storefront.Auth"], "/", "markhughes.zuswdevsvcfab.goherbalife.com");

                var profile = Get(apiUri, authCookie).Result;
                return profile;
            } catch (Exception ex) {
                _logger.LogError($"CustomerProfile.Get-{ex.ToString()}");
                return null;
            }
        }

        private async Task<CustomerProfile> Get(Uri profileUri, Cookie authCookie) {
            return await JsonServiceProxy.ClientWithCookies(authCookie).FetchAsync<CustomerProfile>(profileUri);
        }
    }
}
