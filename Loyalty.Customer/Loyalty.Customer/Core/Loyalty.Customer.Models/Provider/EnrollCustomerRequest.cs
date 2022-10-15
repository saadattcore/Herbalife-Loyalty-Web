using System;

namespace Loyalty.Customer.Models.Provider {
    public class EnrollCustomerRequest {
        public Guid Id { set; get; }
        public string DistributorId { set; get; }
        public Guid GoHLCustomerId { set; get; }
        public string CountryCode { set; get; }
        public string FirstName { set; get; }
        public string LastName { set; get; }
        public string Email { set; get; }
        public Phone Phone { set; get; }
        public Guid LoyaltyProgramId { set; get; }
        public DateRange ProgramDuration { get; set; }
        public string locale { get; set; }
    }

    public class Phone {
        public string Number { get; set; }
        public string Type { get; set; }
    }
}
