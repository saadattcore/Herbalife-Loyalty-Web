using OpenQA.Selenium;
using OpenQA.Selenium.Support.PageObjects;

namespace Loyalty.Customer.AcceptanceTest.WebElements
{
    public class EnrollWebElements
    {

        //Sections
        //Top Menu Bar
        [FindsBy(How = How.PartialLinkText, Using = "Login")]
        public IWebElement btnLogin { get; set; }

        //Loyalty Banners

        [FindsBy(How = How.XPath, Using = "//section[@class='promotions loyalty'][1]/div")]
        public IWebElement divBanner { get; set; }

        [FindsBy(How = How.XPath, Using = "//section[@class='promotions loyalty'][2]/div/img")]
        public IWebElement imgLoyaltyLogoNotEnrolled { get; set; }

        [FindsBy(How = How.XPath, Using = "//section[@class='promotions loyalty'][1]/div/img")]
        public IWebElement imgLoyaltyLogoEnrolled { get; set; }

        [FindsBy(How = How.XPath, Using = "//section[@class='promotions loyalty'][2]/div/aside/h1")]
        public IWebElement lblLoyaltyBannerTitleNotEnrolled { get; set; }

        [FindsBy(How = How.XPath, Using = "//section[@class='promotions loyalty'][1]/div/aside/h1")]
        public IWebElement lblLoyaltyBannerTitleEnrolled { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "Learn More")]
        public IWebElement btnLearnMore { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "Go to your dashboard")]
        public IWebElement btnGoToDashboard { get; set; }

        //Home

        [FindsBy(How = How.XPath, Using = "//article/h3")]
        public IWebElement lblTitle { get; set; }

        [FindsBy(How = How.XPath, Using = "//aside/a[@class='btn-continue']")]
        public IWebElement btnEnrollNowTop { get; set; }

        [FindsBy(How = How.XPath, Using = "//div/a[@class='btn-continue']")]
        public IWebElement btnEnrollNowBottom { get; set; }

       
        [FindsBy(How = How.XPath, Using = "//div[@wire-model='showModel']/div")]
        public IWebElement sectionProdInfo { get; set; }

        [FindsBy(How = How.XPath, Using = "//i [@class='icon-shopping-bag-ln-3']")]
        public IWebElement iconProd { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@class='info']")]
        public IWebElement sectionActInfo { get; set; }

        [FindsBy(How = How.XPath, Using = "//i [@class='icon-connection-ln-3']")]
        public IWebElement iconAct { get; set; }

        [FindsBy(How = How.XPath, Using = "//article[@class='shopping']/div/div/div/table")]
        public IWebElement tblProd { get; set; }

        [FindsBy(How = How.XPath, Using = "//article[1]/div/div/div/table/tbody/tr[1]/td[1]")]
        public IWebElement tdFirstRowCol { get; set; }

        [FindsBy(How = How.XPath, Using = "//article[@class='shopping']/div/div/a")]
        public IWebElement aLearnMore { get; set; }

        [FindsBy(How = How.XPath, Using = "//article/img")]
        public IWebElement imgLoyaltyLogoNextPage { get; set; }

        //High Values gifts section

        [FindsBy(How = How.XPath, Using = "//div[@id='gifts-holder']")]
        public IWebElement SectionCarousel { get; set; }

        [FindsBy(How = How.XPath, Using = "//button[@class='slick-prev icon-arrow-left-ln-2']")]
        public IWebElement btnBack { get; set; }

        [FindsBy(How = How.XPath, Using = "//button[@class='slick-next icon-arrow-right-ln-2']")]
        public IWebElement btnFwd { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@class='product-item slick-slide slick-active'][1]/img")]
        public IWebElement imgItem { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@class='product-item slick-slide slick-active'][1]/span")]
        public IWebElement lbItemDetails { get; set; }

        //Terms & Conditions

        [FindsBy(How = How.XPath, Using = "//div [@class='terms-conditions']/h4")]
        public IWebElement h4TermsTitle { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@class='terms']")]
        public IWebElement sectionTerms { get; set; }

        [FindsBy(How = How.XPath, Using = "//input[@name='firstName']")]
        public IWebElement lbFirstName { get; set; }

        [FindsBy(How = How.XPath, Using = "//input[@name='lastName']")]
        public IWebElement lbLastName { get; set; }

        [FindsBy(How = How.XPath, Using = "//input[@name='phoneNumber']")]
        public IWebElement lbPhone { get; set; }

        [FindsBy(How = How.XPath, Using = "//select [@class='two']")]
        public IWebElement selPhoneType { get; set; }
       
        [FindsBy(How = How.XPath, Using = "//div [@class='acknowledge']/label")]
        public IWebElement cbAgree { get; set; }

        [FindsBy(How = How.XPath, Using = "//a[@class='btn-continue']")]
        public IWebElement btnActivate { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "Go Back")]
        public IWebElement aGoBack { get; set; }

      

    }
}
