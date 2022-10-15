using System;
using HL.Common.Configuration;
using HL.Common.Selenium;
using Loyalty.Customer.AcceptanceTest.TestCases;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Loyalty.Customer.AcceptanceTest.Helpers.Given
{
    public partial class GivenHelper : MainClass
    {
        public void MyHerbalifeLoginAsCustomer()
        {

            Driver.sel.Navigate().GoToUrl(Settings.GetRequiredAppSetting("LoyaltyURL"));
            //GENERAL.SSObtnLogin.Clicks();
            //GENERAL.txtUsername.EnterText(Settings.GetRequiredAppSetting("CustomerUsername"));
            //GENERAL.txtPassword.EnterText(Settings.GetRequiredAppSetting("CustomerPassword"));
            //GENERAL.SSObtnSignIn.Clicks();


        }
    }
}
