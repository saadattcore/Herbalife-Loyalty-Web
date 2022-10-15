using OpenQA.Selenium;
using OpenQA.Selenium.Support.PageObjects;

namespace Loyalty.Customer.AcceptanceTest.WebElements
{
    public class GeneralWebElements
    {

        //[FindsBy(How = How.XPath, Using = "")]
        //public IWebElement txtUsername { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "Login")]
        public IWebElement SSObtnLogin { get; set; }

        [FindsBy(How = How.XPath, Using = "//input[@id='Username']")]
        public IWebElement txtUsername { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [FindsBy(How = How.XPath, Using = "//input[@id='Password']")]
        public IWebElement txtPassword { get; set; }

        [FindsBy(How = How.XPath, Using = "//*[@id='submit']")]
        public IWebElement SSObtnSignIn { get; set; }
    }
}

