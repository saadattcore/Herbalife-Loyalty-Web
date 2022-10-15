using Microsoft.AspNetCore.Http;
using Shop.Storefront.Account.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Loyalty.Customer.Provider.Interfaces
{
    /// <summary>
    /// It will interact with wcf service in order to get distributor related info 
    /// </summary>
    public interface IDistributorProvider
    {
        /// <summary>
        /// Check's if customer trying to enroll in loyalty program already become distributor or not
        /// </summary>
        /// <returns></returns>
        Task<CustomerProfile> GetDistributor(string customerEmail);
    }
}
