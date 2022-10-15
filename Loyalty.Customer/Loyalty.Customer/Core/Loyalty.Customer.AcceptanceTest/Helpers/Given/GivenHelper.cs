using System;
using HL.Common.Configuration;
using HL.Common.Selenium;
using Loyalty.Customer.AcceptanceTest.TestCases;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Loyalty.Customer.AcceptanceTest.Helpers.Given
{
    public partial class GivenHelper : MainClass
    {
        public void LCPLoginAsCustomerEnrolled()
        {
            Exception timeoutException = new Exception();
            bool isInitialized = false;
            int executionTimes = 0;

            Driver.DeleteCookies();
            
            Driver.sel.Navigate().GoToUrl(Settings.GetRequiredAppSetting("environmentURL"));
            Driver.sel.Navigate().GoToUrl(Settings.GetRequiredAppSetting("CSURL"));
            Driver.wait.Until(x => GENERAL.txtCSEmail.Enabled);
            GENERAL.txtCSEmail.EnterText(Settings.GetRequiredAppSetting("CustomerEmail"));

            do
            {
                try
                {
                    Driver.wait.Until(x => GENERAL.txtPassword.Enabled);
                    GENERAL.txtPassword.EnterText(Settings.GetRequiredAppSetting("CustomerPassword"));
                    GENERAL.btnSignIn.Clicks();
                    Driver.wait.Until(x => GENERAL.footerSection.Displayed);
                    Driver.wait.Until(x => GENERAL.navBar.Displayed);
                    Driver.wait.Until(x => GENERAL.divGoHLCarousel.Displayed);
                    isInitialized = true;

                }
                catch (Exception ex)
                {
                    timeoutException = ex;
                    executionTimes++;
                }
            } while (!isInitialized && executionTimes < 5);

            if (!isInitialized)
            {
                throw timeoutException;
            }
        }

        public void LCPLoginAsCustomerNotEnrolled()
        {
            Exception timeoutException = new Exception();
            bool isInitialized = false;
            int executionTimes = 0;

            Driver.DeleteCookies();

            Driver.sel.Navigate().GoToUrl(Settings.GetRequiredAppSetting("environmentURL"));
            Driver.sel.Navigate().GoToUrl(Settings.GetRequiredAppSetting("CSURL"));
            Driver.wait.Until(x => GENERAL.txtCSEmail.Enabled);
            GENERAL.txtCSEmail.EnterText(Settings.GetRequiredAppSetting("CustomerNotEnrEmail"));

            do
            {
                try
                {
                    Driver.wait.Until(x => GENERAL.txtPassword.Enabled);
                    GENERAL.txtPassword.EnterText(Settings.GetRequiredAppSetting("CustomerPassword"));
                    GENERAL.btnSignIn.Clicks();
                    Driver.wait.Until(x => GENERAL.footerSection.Displayed);
                    Driver.wait.Until(x => GENERAL.navBar.Displayed);
                    isInitialized = true;

                }
                catch (Exception ex)
                {
                    timeoutException = ex;
                    executionTimes++;
                }
            } while (!isInitialized && executionTimes < 5);

            if (!isInitialized)
            {
                throw timeoutException;
            }

        }
    }
}
