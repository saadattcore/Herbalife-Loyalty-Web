using HL.Loyalty.Models;
using Loyalty.Customer.Models.Provider;
using System;
using System.Collections.Generic;

namespace Loyalty.Customer.Provider.Interfaces {
    public interface IProgramProvider {
        #region Read calls
        IList<LoyaltyRewardModel> GetHighValueRewards(string rewardType);

        CustomerDetailModel GetDashboardByLCPCustomerId(Guid customerId);

        CustomerDetailModel GetDashboardByGOHLCustomerId(Guid customerId);

        CustomerDetailModel GetDashboardByGOHLCustomerId(Guid customerId, string distributorId);

        IList<ProgramActivity> GetActivitiesByProgram(string programId);

        ProgramModel GetDistributorProgram(string distributorId);
        #endregion

        #region Write calls
        GenericResponse EnrolledCustomer(EnrollCustomerRequest Customer);

        GenericResponse UpdateCustomer(EnrollCustomerRequest request);

        GenericResponse SaveCustomerWish(CustomerWishRequest customerWish);
        #endregion
    }
}
