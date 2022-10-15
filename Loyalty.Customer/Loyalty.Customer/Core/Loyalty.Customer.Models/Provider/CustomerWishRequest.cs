using System;

namespace Loyalty.Customer.Models.Provider {
    public class CustomerWishRequest {
        public Guid CustomerId { get; set; }
        public int Tier { get; set; }
        public string CategoryCode { get; set; }
        public string Sku { get; set; }
        public string CountryCodeISO { get; set; }
        public DateRange Validity { get; set; }
    }
}
