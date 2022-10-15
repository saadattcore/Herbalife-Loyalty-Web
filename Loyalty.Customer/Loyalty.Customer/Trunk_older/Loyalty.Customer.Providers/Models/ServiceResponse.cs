using System;

namespace Loyalty.Customer.Providers.Models {
    public class ServiceResponse {
        public Guid CorrelationId { get; set; }
        public ServiceResponseStateType State { get; set; }
    }

    public enum ServiceResponseStateType {
        Unknown = 0,
        Succeeded = 1,
        FailedWithAFatalException = 2,
        FailedWithAnUnexpectedException = 3,
        FailedAuthentication = 11,
        FailedAuthorisation = 12,
        FailedValidation = 21
    }
}
