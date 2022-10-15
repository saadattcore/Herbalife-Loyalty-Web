using HL.Common.Configuration;
using HL.Common.Selenium;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Loyalty.Customer.AcceptanceTest.TestCases
{
    [TestClass]
    public class Enrollment : MainClass
    {
        string expectedmsg;
        string expectedbtn;

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_ValidateLCPBannerUINotEnrolled_IsClickable()
        {
            expectedmsg = "Get rewarded for healthy living!";
            expectedbtn = "Learn More";

            Given.LCPLoginAsCustomerNotEnrolled();
            And.Wait(ENROLL.imgLoyaltyLogoNotEnrolled);                     
            Then.SectionisDisplayed(ENROLL.imgLoyaltyLogoNotEnrolled);
            Then.AssertElementIsDisplayed(ENROLL.btnLearnMore);
            Then.AssertMessageIsDisplayed(ENROLL.btnLearnMore, expectedbtn);
            Then.SectionisDisplayed(ENROLL.lblLoyaltyBannerTitleNotEnrolled);
            Then.AssertMessageIsDisplayed(ENROLL.lblLoyaltyBannerTitleNotEnrolled, expectedmsg);
            And.ClickOver(ENROLL.btnLearnMore);
            And.Wait(ENROLL.btnEnrollNowTop);
            Then.AssertElementIsDisplayed(ENROLL.SectionCarousel);


        }

        [TestMethod]
        [IntegrationTest]
       // [Ignore]
        public void LCP_ValidateLCPBannerUIEnrolled_IsClickable()
        {
            expectedmsg = "Ready for next level?";
            expectedbtn = "Go to your dashboard";

            Given.LCPLoginAsCustomerEnrolled();
            And.Wait(ENROLL.divBanner);
            Then.SectionisDisplayed(ENROLL.divBanner);    
            Then.SectionisDisplayed(ENROLL.imgLoyaltyLogoEnrolled);
            Then.AssertElementIsDisplayed(ENROLL.btnGoToDashboard);
            Then.AssertMessageIsDisplayed(ENROLL.btnGoToDashboard, expectedbtn);
            Then.SectionisDisplayed(ENROLL.lblLoyaltyBannerTitleEnrolled);
            Then.AssertMessageIsDisplayed(ENROLL.lblLoyaltyBannerTitleEnrolled, expectedmsg);
            And.ClickOver(ENROLL.btnGoToDashboard);
            And.Wait(DASHBOARD.secProdResume);
            Then.AssertElementIsDisplayed(DASHBOARD.btnShopEarnPoints);

        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_HOME_ValidateBelowEnrollBtnAndTermsCond_IsClickable()
        {
            Given.LCPLoginAsCustomerNotEnrolled();
            And.Wait(ENROLL.imgLoyaltyLogoNotEnrolled);
            And.ClickOver(ENROLL.btnLearnMore);            
            And.Wait(ENROLL.SectionCarousel);
            Then.AssertElementIsPresent(ENROLL.imgLoyaltyLogoNextPage);
            Then.AssertElementIsPresent(ENROLL.lblTitle);
            Then.AssertElementIsPresent(ENROLL.btnEnrollNowTop);
            And.ScrollTo(ENROLL.btnEnrollNowBottom);
            And.Wait(ENROLL.btnEnrollNowBottom);
            And.ClickOn(ENROLL.btnEnrollNowBottom);
            And.Wait(ENROLL.sectionTerms);
            Then.AssertElementIsPresent(ENROLL.lbFirstName);
            Then.AssertElementIsPresent(ENROLL.lbLastName);
            Then.AssertElementIsPresent(ENROLL.lbPhone);
            Then.AssertElementIsPresent(ENROLL.selPhoneType);           
            Then.ValidateLink(Settings.GetRequiredAppSetting("CSTermsCond"));
            And.ClickOn(ENROLL.aGoBack);
            And.Wait(ENROLL.btnEnrollNowTop);
            Then.AssertElementIsPresent(ENROLL.imgLoyaltyLogoNextPage);
            
        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_HOME_ValidateHighValueGiftsSection_IsDisplayed()
        {
            Given.LCPLoginAsCustomerNotEnrolled();
            And.Wait(ENROLL.imgLoyaltyLogoNotEnrolled);
            And.ClickOver(ENROLL.btnLearnMore);
            And.Wait(ENROLL.imgLoyaltyLogoNextPage);
            And.Wait(ENROLL.imgItem);
            And.ClickOver(ENROLL.btnBack);
            And.Wait(ENROLL.imgItem);
            And.ClickOver(ENROLL.btnFwd);            
            And.Wait(ENROLL.SectionCarousel);
            Then.AssertElementIsDisplayed(ENROLL.SectionCarousel);
            Then.AssertElementIsDisplayed(ENROLL.lbItemDetails);
                     

        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_HOME_ValidateProductSection_IsDIsplayed()
        {
            Given.LCPLoginAsCustomerNotEnrolled();
            And.Wait(ENROLL.imgLoyaltyLogoNotEnrolled);
            And.Wait(ENROLL.btnLearnMore);
            And.ClickOver(ENROLL.btnLearnMore);
            And.Wait(ENROLL.imgLoyaltyLogoNextPage);
            And.ScrollTo(ENROLL.lbItemDetails);
            And.Wait(ENROLL.sectionProdInfo);
            Then.AssertElementIsPresent(ENROLL.iconProd);
            Then.AssertElementIsPresent(ENROLL.sectionProdInfo);           
            And.ClickOver(ENROLL.aLearnMore);
            And.Wait(ENROLL.tblProd);
            Then.AssertElementIsPresent(ENROLL.tdFirstRowCol);

        }

        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_HOME_ValidateActivitySection_IsDIsplayed()
        {
            Given.LCPLoginAsCustomerNotEnrolled();
            And.Wait(ENROLL.imgLoyaltyLogoNotEnrolled);
            And.ClickOver(ENROLL.btnLearnMore);
            And.Wait(ENROLL.imgLoyaltyLogoNextPage);
            And.ScrollTo(ENROLL.sectionProdInfo);
            And.Wait(ENROLL.sectionActInfo);
            Then.AssertElementIsPresent(ENROLL.iconAct);
            Then.AssertElementIsPresent(ENROLL.sectionActInfo);
            

        }


        [TestMethod]
        [IntegrationTest]
        //[Ignore]
        public void LCP_HOME_ValidateTopEnrollBtnAndTermsCond_IsClickable()
        {
            Given.LCPLoginAsCustomerNotEnrolled();
            And.Wait(ENROLL.imgLoyaltyLogoNotEnrolled);
            And.ClickOver(ENROLL.btnLearnMore);
            And.Wait(ENROLL.SectionCarousel);
            And.ClickOver(ENROLL.btnEnrollNowTop);
            And.Wait(ENROLL.sectionTerms);
            Then.AssertElementIsPresent(ENROLL.h4TermsTitle);
            And.SelectItemInDropDownList(ENROLL.selPhoneType);
            And.ScrollTo(ENROLL.lbFirstName);
            And.ClickOver(ENROLL.cbAgree);
            And.Wait(ENROLL.btnActivate);
            Then.AssertElementIsEnabled(ENROLL.btnActivate);
            //Then.AssertButtontIsDisabled(ENROLL.btnActivate);         

        }

        [TestMethod]
        [IntegrationTest]
        // [Ignore]
        public void LCP_HOME_ValidateFooterSection_IsDisplayed()
        {
            Given.LCPLoginAsCustomerNotEnrolled();
            And.Wait(ENROLL.imgLoyaltyLogoNotEnrolled);
            And.Wait(ENROLL.btnLearnMore);
            And.ClickOver(ENROLL.btnLearnMore);
            And.Wait(ENROLL.SectionCarousel);
            And.ScrollTo(GENERAL.footerSection);
            And.Wait(GENERAL.footerSection);
            Then.ValidateFooterIsDisplayed();

        }





    }
}
