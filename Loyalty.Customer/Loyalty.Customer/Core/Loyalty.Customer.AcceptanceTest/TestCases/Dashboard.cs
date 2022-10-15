using HL.Common.Configuration;
using HL.Common.Selenium;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Loyalty.Customer.AcceptanceTest.TestCases
{
    [TestClass]
    public class Dashboard : MainClass
    {

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateActivityResumeSection_IsDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secActResume);
            Then.AssertElementIsPresent(DASHBOARD.secActResume);
            Then.AssertElementIsPresent(DASHBOARD.lblActCounter);
            Then.AssertElementIsPresent(DASHBOARD.liActLevel1);

        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateProdResumeSection_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secProdResume);
            Then.AssertElementIsPresent(DASHBOARD.secProdResume);
            Then.AssertElementIsPresent(DASHBOARD.lblProdCounter);
            Then.AssertElementIsPresent(DASHBOARD.liProdMonth1);
        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateProdAndActTier1_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secProdResume);
            And.ScrollTo(DASHBOARD.secProdResume);
            And.Wait(DASHBOARD.secShopT1);
            Then.AssertElementIsPresent(DASHBOARD.secShopT1);
            And.Wait(DASHBOARD.secActT1);
            Then.AssertElementIsPresent(DASHBOARD.secActT1);
                      

        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateProdAndActTier2_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secProdResume);
            And.ScrollTo(DASHBOARD.secShopT1);
            And.Wait(DASHBOARD.secShopT2);
            Then.AssertElementIsPresent(DASHBOARD.secShopT2);
            And.Wait(DASHBOARD.secActT2);
            Then.AssertElementIsPresent(DASHBOARD.secActT2);
        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateProdAndActTier3and4_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secProdResume);
            And.ScrollTo(DASHBOARD.secShopT2);
            And.Wait(DASHBOARD.secShopT3);
            Then.AssertElementIsPresent(DASHBOARD.secShopT3);
            And.Wait(DASHBOARD.secActT3);
            Then.AssertElementIsPresent(DASHBOARD.secActT3);
            And.Wait(DASHBOARD.secActT4);
            Then.AssertElementIsPresent(DASHBOARD.secActT4);
        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateInformationActivitySection_content_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secActResume);
            And.ScrollTo(DASHBOARD.secShopInfo);
                       
            And.Wait(DASHBOARD.secActInfo);
            Then.AssertElementIsPresent(DASHBOARD.secActInfo);
            And.Wait(DASHBOARD.iconActivity);
            Then.AssertElementIsPresent(DASHBOARD.iconActivity);            
            Then.AssertElementIsPresent(DASHBOARD.lblActivity);
            Then.AssertElementIsPresent(DASHBOARD.lblPoints);


        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateInformationProductSection_content_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secActResume);
            And.ScrollTo(DASHBOARD.secActT4);
            And.Wait(DASHBOARD.secShopInfo);
            Then.AssertElementIsPresent(DASHBOARD.secShopInfo);
            And.Wait(DASHBOARD.iconShopping);
            Then.AssertElementIsPresent(DASHBOARD.iconShopping);

        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateTermsCond_content_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secActResume);            
            And.ClickOver(DASHBOARD.aTermsTopLink);
            And.Wait(DASHBOARD.h4TermsTitle);            
            And.ClickOver(DASHBOARD.aTermsCondBelow);
            And.Wait(DASHBOARD.ulTermsAndCondContent);
            Then.AssertElementIsPresent(DASHBOARD.ulTermsAndCondContent);
           
        }

   
        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateHowToProdLink_scroll_isDisplayed()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secProdResume);
            And.ClickOver(DASHBOARD.aHowToProd);
            And.Wait(DASHBOARD.secShopInfo);
            Then.AssertElementIsPresent(DASHBOARD.iconShopping);


        }

        //[TestMethod]
        //[IntegrationTest]
        //[Ignore] 
        //public void LCP_ValidateHowToActivityLink_scroll_isDisplayed()
        //{
        //    Given.LCPLoginAsCustomerEnrolled();
        //    When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
        //    And.Wait(DASHBOARD.secActResume);
        //    And.ScrollTo(DASHBOARD.btnShopEarnPoints);
        //    And.ClickOver(DASHBOARD.aHowToAct); //Not getting to the Act section when scrolling
        //    And.Wait(DASHBOARD.secActInfo);
        //    Then.AssertElementIsPresent(DASHBOARD.iconActivity);


        //}

        [TestMethod]
        [IntegrationTest]
       // [Ignore]
        public void LCP_ValidateShopTEarnPointsBtn_isClickable()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secActResume);            
            And.ClickOver(DASHBOARD.btnShopEarnPoints); 
            And.Wait(ENROLL.btnGoToDashboard);
            Then.AssertElementIsPresent(GENERAL.divGoHLCarousel);


        }

        [TestMethod]
        [IntegrationTest]
       // [Ignore]
        public void LCP_ValidateBreadcrum_isClickable()
        {
            Given.LCPLoginAsCustomerEnrolled();
            When.NavigateToNextPage(Settings.GetRequiredAppSetting("CSLoyaltyDashoard"));
            And.Wait(DASHBOARD.secActResume);
            And.ClickOver(DASHBOARD.aHomeBreadcrum);
            And.Wait(ENROLL.btnGoToDashboard);
            Then.AssertElementIsPresent(GENERAL.divGoHLCarousel);


        }

    }
}
