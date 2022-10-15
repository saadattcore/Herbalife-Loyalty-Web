using HL.Loyalty.Models;
using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Loyalty.Customer.WebCore.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shop.Storefront.Account.DTO;
using Xunit;

namespace Loyalty.Customer.Tests.Controllers {
    public class HomeControllerTest {
        // Mock objects
        private readonly CustomerProfile _customerProfile = new CustomerProfile() { Id = "c4652237-1adf-4c3b-9658-ff4a5b8d0fa9", Email = "mock@mail.com" };
        private readonly ProgramModel nullProgram = null;
        private ProgramModel emptyProgram = new ProgramModel {
            Id = GuidUtil.NewSequentialId()
        };

        // Set substitute objects
        private readonly IProgramProvider _programProvider = Substitute.For<IProgramProvider>();
        private readonly ILogger<CustomerHelper> _loggerCustomer = Substitute.For<ILogger<CustomerHelper>>();
        private readonly ILogger<HomeController> _loggerHome = Substitute.For<ILogger<HomeController>>();
        private HomeController _controller;
        private CustomerHelper _customerHelper;

        [Fact]
        public void Redirect_ProfileDown_Error() {
            _controller = GetController();
            _programProvider.GetDistributorProgram("1111111111").Returns(emptyProgram);

            var actual = (RedirectResult)_controller.Index();
            Assert.Equal("/Loyalty/Home/Error/en-US/", actual.Url);
        }

        [Fact]
        public void Redirect_DistributorNoProgram_Home() {
            _controller = GetController();
            _programProvider.GetDistributorProgram("1111111111").Returns(nullProgram);

            var actual = (RedirectResult)_controller.Index();
            Assert.Equal("/Catalog/Home/Index/en-US/", actual.Url);
        }

        private HomeController GetController() {
            _customerHelper = Substitute.For<CustomerHelper>(_loggerCustomer);
            return new HomeController(_programProvider, _customerHelper, _loggerHome);
        }
    }
}
