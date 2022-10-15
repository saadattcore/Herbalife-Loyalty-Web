using System;
using System.Runtime.Serialization;

namespace Loyalty.Customer.Providers.Models {
    public class EnrollCustomerRequest {
        public Guid Id { set; get; }
        public string DistributorId { set; get; }
        public Guid GoHLCustomerId { set; get; }
        public string CountryCode { set; get; }
        public string FirstName { set; get; }
        public string LastName { set; get; }
        public string Email { set; get; }
        public Guid LoyaltyProgramId { set; get; }
        public EnrollProgramDuration ProgramDuration { get; set; }
    }

    public class EnrollProgramDuration {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }
}
