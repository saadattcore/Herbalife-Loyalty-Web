using OpenQA.Selenium;
using OpenQA.Selenium.Support.PageObjects;

namespace Loyalty.Customer.AcceptanceTest.WebElements
{
    public class DashboardWebElements
    {

        //Sections
        //Top Menu Bar
        [FindsBy(How = How.XPath, Using = "//li[@id='accountToggle']/a")]
        public IWebElement btnMyAccount { get; set; }

        [FindsBy(How = How.XPath, Using = "//li[@role='menuitem'][5]/a")]
        public IWebElement btnShopCart { get; set; }

        //Sections
        [FindsBy(How = How.XPath, Using = "//aside[@class='shopping resume']")]
        public IWebElement secProdResume { get; set; }

        [FindsBy(How = How.XPath, Using = "//aside[@class='activity resume']")]
        public IWebElement secActResume { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ShopTier1']")]
        public IWebElement secShopT1{ get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ShopTier2']")]
        public IWebElement secShopT2 { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ShopTier3']")]
        public IWebElement secShopT3 { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ActivityTier1']")]
        public IWebElement secActT1 { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ActivityTier2']")]
        public IWebElement secActT2 { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ActivityTier3']")]
        public IWebElement secActT3 { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ActivityTier4']")]
        public IWebElement secActT4 { get; set; }

        [FindsBy(How = How.XPath, Using = "//article[@class='shopping-info']/div")]
        public IWebElement secShopInfo { get; set; }

        [FindsBy(How = How.XPath, Using = "//i[@class='icon-shopping-bag-ln-3']")]
        public IWebElement iconShopping { get; set; }

        [FindsBy(How = How.XPath, Using = "//article[@class='activity-info']/div")]
        public IWebElement secActInfo { get; set; }

        [FindsBy(How = How.XPath, Using = "//i[@class='icon-connection-ln-3']")]
        public IWebElement iconActivity { get; set; }

        //Tier 1 Elements
        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ShopTier1']/ul[@data-role='listview']/li[1]/img")]
        public IWebElement imgProdTier1 { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ShopTier1']/ul[@data-role='listview']/li[1]/span")]
        public IWebElement lblProdTier1 { get; set; }

        [FindsBy(How = How.XPath, Using = "//div[@data-tier='ShopTier1']/ul[@data-role='listview']/li[1]/a[1]")]
        public IWebElement btnProdTier1Preselect { get; set; }

        //Links

        [FindsBy(How = How.XPath, Using = "//ul [@class='breadcrumbs']/li[1]/a")]
        public IWebElement aHomeBreadcrum { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "Terms & Conditions")]
        public IWebElement aTermsTopLink { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "Read Customer Terms and conditions")]
        public IWebElement aTermsCondBelow { get; set; }

        [FindsBy(How = How.PartialLinkText, Using = "How to Earn Product Points")]
        public IWebElement aHowToProd { get; set; }

        //[FindsBy(How = How.PartialLinkText, Using = "How to Earn Activity Points")]
        //public IWebElement aHowToAct { get; set; }

        [FindsBy(How = How.XPath, Using = "//aside[@class='activity resume']/div[2]/p[1]/a")]
        public IWebElement aHowToAct { get; set; }

        [FindsBy(How = How.XPath, Using = "//aside[@class='activity resume']/div/span[1]")]
        public IWebElement lblActCounter { get; set; }

        [FindsBy(How = How.XPath, Using = "//aside[@class='shopping resume']/div/span[1]")]
        public IWebElement lblProdCounter { get; set; }


        //List
        [FindsBy(How = How.XPath, Using = "//ul[@class='disc'][1]")]
        public IWebElement ulTermsAndCondContent { get; set; }

        [FindsBy(How = How.XPath, Using = "//aside[2]/div[2]/ul/li[1]")]
        public IWebElement liActLevel1 { get; set; }

        [FindsBy(How = How.XPath, Using = "//aside[1]/div[2]/ul/li[1]")]
        public IWebElement liProdMonth1 { get; set; }


        //Text
        [FindsBy(How = How.XPath, Using = "//h4[@class='terms']")]
        public IWebElement h4TermsTitle { get; set; }

        [FindsBy(How = How.XPath, Using = " //p[@class='activities'][1]/span[1]")]
        public IWebElement lblActivity { get; set; }

        [FindsBy(How = How.XPath, Using = " //p[@class='activities'][1]/span[2]")]
        public IWebElement lblPoints { get; set; }

        //Buttons
        [FindsBy(How = How.XPath, Using = "//a[@class='btn-continue']")]
        public IWebElement btnShopEarnPoints { get; set; }


        
    }
}
