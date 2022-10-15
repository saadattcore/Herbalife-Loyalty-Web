using System;
using System.Threading;
using HL.Common.Configuration;
using HL.Common.Selenium;
using Loyalty.Customer.AcceptanceTest.Helpers.And;
using Loyalty.Customer.AcceptanceTest.Helpers.Given;
using Loyalty.Customer.AcceptanceTest.Helpers.Then;
using Loyalty.Customer.AcceptanceTest.Helpers.When;
using Loyalty.Customer.AcceptanceTest.WebElements;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium.Support.PageObjects;
using OpenQA.Selenium.Support.UI;

namespace Loyalty.Customer.AcceptanceTest.TestCases
{
    [TestClass]
    public class MainClass
    {
        #region properties
        public static GeneralWebElements GENERAL;
        public static DashboardWebElements DASHBOARD;
        public static EnrollWebElements ENROLL;
        public static CartWebElements CART;

        public static GivenHelper Given;
        public static WhenHelper When;
        public static ThenHelper Then;
        public static AndHelper And;
        public static WebDriverWait wait;
        #endregion
          
        public static TestContext testContextInstance;

        public TestContext TestContext
        {
            get { return testContextInstance; }
            set { testContextInstance = value; }
        }

        [TestInitialize]
        public void TestInitialize()
        {
            Exception timeoutExpcetion = null;
            bool isInitialized = false;
            int executionTimes = 0;
            Thread.Sleep(250);

            do
            {
                try
                {
                    if (executionTimes > 0)
                        Driver.Quit();
                    Driver.Init();
                    Driver.Start(120, Settings.GetRequiredAppSetting("environmentURL"));
                    Driver.wait = new WebDriverWait(Driver.sel, TimeSpan.FromSeconds(60));

                    Driver.sel.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(60));
                    Driver.sel.Manage().Timeouts().SetPageLoadTimeout(TimeSpan.FromSeconds(180));
                    PageFactoryInit();

                    isInitialized = true;


                }
                catch (Exception ex)
                {
                    timeoutExpcetion = ex;
                    executionTimes++;
                }
            } while (!isInitialized && executionTimes < 4);

            if (!isInitialized)
            {
                throw timeoutExpcetion;
            }




            Given = new GivenHelper();
            When = new WhenHelper();
            Then = new ThenHelper();
            And = new AndHelper();



        }


        private void PageFactoryInit()
        {
            Object[] PageObjects =
            {


                GENERAL = new GeneralWebElements(),
                DASHBOARD = new DashboardWebElements(),
                ENROLL = new EnrollWebElements(),
                CART = new CartWebElements()
                              

            };

            // Initialize Page Factory Elements
            PageFactoryInitElements(PageObjects);
        }

        private void PageFactoryInitElements(Object[] ListOfPageObjects)
        {
            foreach (var PageObject in ListOfPageObjects)
            {
                PageFactory.InitElements(Driver.sel, PageObject);
            }
        }

        [TestCleanup]
        public void TestCleanup()
        {
            Driver.Quit();

        }
    }
}
