using HL.Loyalty.Models;
using Loyalty.Customer.Providers.Models;
using System;
using System.Collections.Generic;

namespace Loyalty.Customer.Providers.Interfaces {
    public interface IProgramProvider {
        #region Read calls
        IList<LoyaltyRewardModel> GetShopRewards();

        IList<LoyaltyRewardModel> GetActivityRewards();

        IList<LoyaltyRewardModel> GetHighValueRewards();

        CustomerModel GetCustomer(string customerEmail);
        #endregion

        #region Write calls
        ServiceResponse EnrolledCustomer(CustomerModel Customer);
        #endregion
    }
}
