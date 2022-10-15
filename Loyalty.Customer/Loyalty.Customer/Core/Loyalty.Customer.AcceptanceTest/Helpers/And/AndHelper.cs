using System;
using HL.Common.Logging;
using HL.Common.Selenium;
using Loyalty.Customer.AcceptanceTest.Helpers.When;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;


namespace Loyalty.Customer.AcceptanceTest.Helpers.And
{
    public partial class AndHelper : WhenHelper
    {
        public void ClickOver(IWebElement webElement)
        {

            webElement.Click();
        }
        public void Wait(IWebElement webElement)
        {

            Driver.wait.Until(x => webElement.Displayed);
            Driver.wait.Until(x => webElement.Enabled);


        }

        public void SelectItemInDropDownList(IWebElement webElement)
        {
          
           SelectElement selector = new SelectElement(webElement);
            selector.SelectByIndex(2);

        }

        

        public void ClickOn(IWebElement webElement)
        {
            webElement.Clicks();

        }

        public void ScrollTo(IWebElement e)
        {


            try
            {
                IJavaScriptExecutor je = (IJavaScriptExecutor)Driver.sel;
                var scrollBarPresent = (bool)je.ExecuteScript("return document.documentElement.scrollHeight>document.documentElement.clientHeight;");
                if (scrollBarPresent)
                    je.ExecuteScript("arguments[0].scrollIntoView(true);", e);
            }
            catch (Exception ex)
            {
                LoggerHelper.Exception("SELENUIM DRIVER", ex, "Error at ScrollTo procees for element: " + e.TagName);
            }

        }

        public void ScrollUp(IWebElement e)
        {


            try
            {
                IJavaScriptExecutor je = (IJavaScriptExecutor)Driver.sel;
                var scrollBarPresent = (bool)je.ExecuteScript("return document.documentElement.scrollHeight>document.documentElement.clientHeight;");
                if (scrollBarPresent)
                    je.ExecuteScript("scroll(0,-50)");
            }
            catch (Exception ex)
            {
                LoggerHelper.Exception("SELENUIM DRIVER", ex, "Error at ScrollTo procees for element: " + e.TagName);
            }

        }
    }

}
