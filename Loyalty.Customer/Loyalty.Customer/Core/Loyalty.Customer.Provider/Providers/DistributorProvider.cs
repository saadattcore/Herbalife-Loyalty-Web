using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Microsoft.AspNetCore.Http;
using DistributorService;
using Shop.Storefront.Account.DTO;
using System.Threading.Tasks;
using System;

namespace Loyalty.Customer.Provider
{
    /// <summary>
    /// It will interact with wcf service in order to get distributor related info 
    /// </summary>
    public class DistributorProvider : IDistributorProvider
    {
        private readonly DistributorServiceClient _serviceClient;

        public DistributorProvider(DistributorServiceClient serviceClient)
        {
            _serviceClient = serviceClient;
        }

        /// <summary>
        /// Check's if customer trying to enroll in loyalty program already become distributor or not
        /// </summary>
        /// <returns></returns>
        public async Task<CustomerProfile> GetDistributor(string customerEmail)
        {
         
            GetBasicDistributorRequest_V03 request = new GetBasicDistributorRequest_V03()
            {
                BypassCache = true,
                DistributorEmail = customerEmail,
            };

            GetBasicDistributorResponseBase response = await _serviceClient.GetBasicDistributorAsync(request);
            var responseV03 = (GetBasicDistributorResponse_V03)Convert.ChangeType(response, typeof(GetBasicDistributorResponse_V03));

            // TODO - Saadat :  Replace customer profile model with actual distributor model.
            CustomerProfile distributor = null;
            if (responseV03.Distributor != null)
            {
                distributor = new CustomerProfile()
                {
                    FirstName = responseV03.Distributor.EnglishName.First,
                    LastName = responseV03.Distributor.EnglishName.Last,
                    Email = responseV03.Distributor.PrimaryEmail,
                    PhoneNumber = responseV03.Distributor.PrimaryPhone
                };
            }

            return distributor;
        }
    }
}
