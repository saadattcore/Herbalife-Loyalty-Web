using System;

namespace Loyalty.Customer.Models.Exceptions {
    public class CustomerProfileException : Exception {
        public CustomerProfileException() : this("CustomerProfile Api failed."){}

        public CustomerProfileException(string message) : base(message) {
        }
    }
}
