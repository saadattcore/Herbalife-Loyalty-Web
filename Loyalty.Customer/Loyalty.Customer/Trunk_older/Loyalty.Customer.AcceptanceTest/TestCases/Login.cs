using System;
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
        public void Login_Black_ValidCredentials_Sucess_AsCustomer()
        {
            
            Given.MyHerbalifeLoginAsCustomer();
            // When.CloseHomeModal();
            // Then.AssertElementIsPresent(HOME.dasboardItem);

        }
    }
}
