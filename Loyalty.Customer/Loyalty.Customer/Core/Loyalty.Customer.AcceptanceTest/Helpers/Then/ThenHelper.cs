using System;
using HL.Common.Selenium;
using Loyalty.Customer.AcceptanceTest.TestCases;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace Loyalty.Customer.AcceptanceTest.Helpers.Then
{
    public class ThenHelper : MainClass
    {
        public void ValidateLink(string URL)
        {
            Asserts.True(Driver.ValidateLink(URL));

        }

        public void AssertElementIsPresent(IWebElement expectedElement)
        {
            Assert.IsTrue(expectedElement.isDisplayed());
        }

        public void AssertElementIsDisplayed(IWebElement expectedElement)
        {
            Asserts.True(expectedElement.isDisplayed());
        }

        public void AssertButtontIsDisabled(IWebElement expectedElement)
        {
           
            Assert.IsTrue(expectedElement.GetAttribute("disabled").Equals("disabled"));
        }

        public void AssertElementIsEnabled(IWebElement expectedElement)
        {
            Assert.IsTrue(expectedElement.isEnabled());
        }

        public void AssertMessageIsDisplayed(IWebElement element, string expectedmessage)
        {
            Assert.AreEqual(element.getText(), expectedmessage);
        }

        public void ValidateImages(string imgRef)
        {
            Asserts.True(Driver.ValidateImageSrc(imgRef));
        }

        public void ValidateFooterIsDisplayed()
        {
            Assert.IsTrue(GENERAL.footerSection.isDisplayed());
        }

        public void SectionisDisplayed(IWebElement e)
        {
            Asserts.True(e.Displayed, "Actual Result: element: " + e.GeneratesXpath() + " is not displayed");
        }

        public void AssertElementIsNotPresent(IWebElement expectedElement)
        {

            Asserts.False(expectedElement.isDisplayed());
        }
               
        public static void ValidateElementBrowserLinkWorks(IWebElement e)
        {
            Asserts.True(Driver.ValidateLink(e.GetAttribute("href")));
        }



    }
}
