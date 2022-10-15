using OpenQA.Selenium;
using OpenQA.Selenium.Support.PageObjects;

namespace Loyalty.Customer.AcceptanceTest.WebElements
{
    public class GeneralWebElements
    {
        
        [FindsBy(How = How.XPath, Using = "//input[@id='Email']")]
        public IWebElement txtCSEmail { get; set; }
        
        [FindsBy(How = How.XPath, Using = "//input[@id='Password']")]
        public IWebElement txtPassword { get; set; }

        [FindsBy(How = How.XPath, Using = "//input[@id='submitLoginButton']")]
        public IWebElement btnSignIn { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "Register")]
        public IWebElement btnCreateAcc { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@class='footer-content']/ul")]
        public IWebElement footerSection { get; set; }

        [FindsBy(How = How.XPath, Using = "//nav[@id='mainSideNav']/ul")]
        public IWebElement navBar { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@id='BestSellers']/div")]
        public IWebElement divGoHLCarousel { get; set; }

       


    }
}

