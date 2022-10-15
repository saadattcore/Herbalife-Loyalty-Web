using System;
using HL.Common.Selenium;
using Loyalty.Customer.AcceptanceTest.TestCases;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace Loyalty.Customer.AcceptanceTest.Helpers.When
{
    public partial class WhenHelper : MainClass
    {

        public void NavigateToNextPage(string url)
        {
            Driver.sel.Navigate().GoToUrl(url);
        }

        public bool isElementPresent(IWebElement element)
        {
            try
            {
                return element.Displayed;

            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }


    }
}
