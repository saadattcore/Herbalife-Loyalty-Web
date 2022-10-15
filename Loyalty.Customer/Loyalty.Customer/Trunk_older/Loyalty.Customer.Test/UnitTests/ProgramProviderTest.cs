using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Loyalty.Customer.Providers;
using System.Web;
using HL.Loyalty.Models;

namespace Loyalty.Customer.Test.UnitTests {
    [TestClass]
    public class ProgramProviderTest {
        private static ProgramProvider _program = new ProgramProvider(HttpContext.Current);

        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public void GetCustomer_ThrowNULLException() {
            _program.GetCustomer(null);
        }

        //[TestMethod]
        //public void GetCustomer_ExpectedUser() {
        //    var expectedCust = new CustomerModel {
        //        Id = Guid.Parse("BC5BCBC6-A6B8-44F7-BE1A-EC5366A14CE6"),
        //        ContactId = "0",
        //        DistributorId = "STAFF",
        //        Email = "samuelcg@herbalife.com",
        //        FirstName = "Samuel",
        //        LastName = "Contreras",
        //        GoHlCustomerId = "F4CD4D1E-2668-496C-B3D3-86024125EF0C",
        //        LoyalityProgramId = "B55A8979-08B5-E612-80C4-0015DDE1E511"
        //    };

        //    var resultCust = _program.GetCustomer("samuelcg@herbalife.com");

        //    Assert.AreEqual(resultCust, expectedCust);
        //}
    }
}
