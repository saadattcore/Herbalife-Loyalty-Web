using HL.Loyalty.Models;
using Loyalty.Customer.Models.Provider;
using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;

namespace Loyalty.Customer.Provider {
    public class ProgramProvider : IProgramProvider {
        private readonly ILogger<ProgramProvider> _logger;
        private readonly ProxyHelper _proxyHelper;

        private string Locale {
            get {
                return CultureInfo.CurrentCulture.Name;
            }
        }

        private string AuthToken {
            get {
                return null;
            }
        }

        public ProgramProvider(ILogger<ProgramProvider> logger, ProxyHelper proxyHelper) {
            _logger = logger;
            _proxyHelper = proxyHelper;
        }

        #region LoyaltyQuery
        public IList<LoyaltyRewardModel> GetHighValueRewards(string rewardType) {
            var url = $"api/rewards/GetHighValueRewards?locale={Locale}&rewardType={rewardType}";
            var result = _proxyHelper.GetProxyData<List<LoyaltyRewardModel>, string>(AuthToken, string.Empty, url, true);
            return result;
        }

        public CustomerDetailModel GetDashboardByLCPCustomerId(Guid lcpCustomerId) {
            var url = $"api/customer?locale={Locale}&CustomerId={lcpCustomerId.ToString()}";
            var result = _proxyHelper.GetProxyData<CustomerDetailModel, string>(AuthToken, string.Empty, url, true);
            return result;
        }

        public CustomerDetailModel GetDashboardByGOHLCustomerId(Guid goHLCustomerId) {
            return GetDashboardByGOHLCustomerId(goHLCustomerId, null);
        }

        public CustomerDetailModel GetDashboardByGOHLCustomerId(Guid goHLCustomerId, string distributorId) {
            var distributorParameter = string.IsNullOrEmpty(distributorId) ? string.Empty : $"&DistributorId={distributorId}";
            var url = $"api/customer?locale={Locale}&GOHLCustomerId={goHLCustomerId.ToString()}{distributorParameter}"; 
            var result = _proxyHelper.GetProxyData<CustomerDetailModel, string>(AuthToken, string.Empty, url, true);
            return result;
        }

        public ProgramModel GetDistributorProgram(string distributorId) {
            var url = $"api/Program?locale={Locale}&DistributorId={distributorId}";
            var result = _proxyHelper.GetProxyData<ProgramModel, string>(AuthToken, string.Empty, url, true);
            return result;
        }

        public IList<ProgramActivity> GetActivitiesByProgram(string programId)
        {
            var url = $"api/Activity/GetActivitiesByProgram?ProgramId={programId}";
            var result = _proxyHelper.GetProxyData<List<ProgramActivity>, string>(AuthToken, string.Empty, url, true);
            return result;
        }

        public Guid GetDistributorProgramId(string distributorId) {
            var program = GetDistributorProgram(distributorId);
            if (Guid.Empty == program.ProgramId)
                throw new Exception("ProgramId not found!");

            return program.ProgramId;
        }
        #endregion

        #region LoyaltyCore
        private void FillCustomerModel(EnrollCustomerRequest request) {
            request.Id = request.Id == Guid.Empty ? GuidUtil.NewSequentialId() : request.Id;
            request.locale = Locale;
        }

        public GenericResponse EnrolledCustomer(EnrollCustomerRequest request) {
            // Fill missing parameters
            FillCustomerModel(request);

            var CorrelationID = GuidUtil.NewSequentialId();
            var url = $"LoyaltyCoreApi/api/Customer";
            var response = _proxyHelper.PostProxyData<ServiceResponse, EnrollCustomerRequest>(CorrelationID, request, url);
            return CheckIfSuccess(response);
        }

        public GenericResponse UpdateCustomer(EnrollCustomerRequest request) {
            // Fill missing parameters
            FillCustomerModel(request);

            var CorrelationID = GuidUtil.NewSequentialId();
            var url = $"LoyaltyCoreApi/api/Customer/{request.Id}";
            var response = _proxyHelper.PutProxyData<ServiceResponse, EnrollCustomerRequest>(CorrelationID, request, url);
            return CheckIfSuccess(response);
        }

        public GenericResponse SaveCustomerWish(CustomerWishRequest request) {
            request.CountryCodeISO = Locale.Substring(3);

            var CorrelationID = GuidUtil.NewSequentialId();
            var url = $"LoyaltyCoreApi/api/CustomerWishlist?RewardAccountType={request.CategoryCode}";
            var response = _proxyHelper.PostProxyData<ServiceResponse, CustomerWishRequest>(CorrelationID, request, url);
            return new GenericResponse { IsSuccess = response.Status == WrapperResultType.Ok, ErrorMessage = response.ErrorMessage };
        }

        private BusReaderResponse GetResponse(Guid correlationID) {
            var url = $"/LoyaltyCoreApi/api/Response?id={correlationID}";
            return _proxyHelper.GetProxyDataApiCore<BusReaderResponse, string>(correlationID, null, url, true);
        }

        private GenericResponse CheckIfSuccess(WrapperResult<ServiceResponse> serviceResponse) {
            var result = new GenericResponse();
            if (serviceResponse != null && serviceResponse.Status == WrapperResultType.Ok) {
                if (serviceResponse.DataResult != null && serviceResponse.DataResult.State == ServiceResponseStateType.Succeeded) {

                    var response = GetResponse(serviceResponse.DataResult.CorrelationId);
                    if (response != null && response.Status == StatusResponse.Success) {
                        result.IsSuccess = true;
                    } else {
                        var error = response == null ? "NULL VALUE" : response.Exception.ToString();
                        _logger.LogError("Loyalty.Customer: ProgramProvider.CheckIfSuccess-{0}", error);
                        result.ErrorMessage = error;
                    }
                } else {
                    var error = serviceResponse.DataResult == null ? "NULL VALUE" : serviceResponse.DataResult.State.ToString();
                    _logger.LogError("Loyalty.Customer: ProgramProvider.CheckIfSuccess-{0}", error);
                    result.ErrorMessage = error;
                }

            } else {
                var error = serviceResponse == null ? "NULL VALUE" : serviceResponse.ErrorResult.ToString();
                _logger.LogError("Loyalty.Customer: ProgramProvider.CheckIfSuccess-{0}", error);
                result.ErrorMessage = error;
            }
            return result;
        }
        #endregion
    }
}
