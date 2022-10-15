using System;
using HL.Common.Configuration;
using HL.Common.Selenium;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Loyalty.Customer.AcceptanceTest.TestCases
{
    [TestClass]
    public class Login : MainClass
    {

        [TestMethod] 
        [IntegrationTest]
        //[Ignore]
        public void Login_Sucess_AsCustomerEnrolled()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSGoHLLanding"));
            Then.ValidateLink(Settings.GetRequiredAppSetting("CSGoHLLanding"));
        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void Login_Sucess_AsCustomerNotEnrolled()
        {
            Given.LCPLoginAsCustomerNotEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyLanding"));
            Then.ValidateLink(Settings.GetRequiredAppSetting("CSLoyaltyLanding"));
        }
    }
}
