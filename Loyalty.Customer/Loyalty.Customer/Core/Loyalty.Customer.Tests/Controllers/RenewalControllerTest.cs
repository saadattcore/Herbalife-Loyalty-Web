using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Loyalty.Customer.Models.Configuration;
using Loyalty.Customer.WebCore.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop.Storefront.Account.DTO;
using Xunit;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Http;

namespace Loyalty.Customer.Tests.Controllers {
    public class RenewalControllerTest {
        // Mock objects
        private readonly CustomerProfile _customerProfile = new CustomerProfile() { Id = "c4652237-1adf-4c3b-9658-ff4a5b8d0fa9", Email = "mock@mail.com" };

        // Set substitute
        private readonly IProgramProvider _programProvider = Substitute.For<IProgramProvider>();
        private readonly ILogger<CustomerHelper> _loggerCustomer = Substitute.For<ILogger<CustomerHelper>>();
        private readonly ILogger<RenewalController> _loggerRenewal = Substitute.For<ILogger<RenewalController>>();
        private readonly IOptions<GeneralSettings> _settings = Substitute.For<IOptions<GeneralSettings>>();
        private readonly HttpContext _context = Substitute.For<HttpContext>();
        private readonly HttpRequest _request = Substitute.For<HttpRequest>();
        private readonly ITempDataProvider _tempDataProvider = Substitute.For<ITempDataProvider>();
        private RenewalController _controller;
        private CustomerHelper _customerHelper;

        //[Fact]
        //public void Error_WrongToken() {
        //    var tokenUrl = "wrong";
        //    _controller = GetController();
        //    //_controller

        //    _request.Path = GetPath(tokenUrl);
            
        //    _context.Request.Path = GetPath(tokenUrl);
        //    _controller.TempData = new TempDataDictionary(_context, _tempDataProvider);
        //    //_controller.Request.Returns(_request);

        //    var actual = (ViewResult)_controller.Index(tokenUrl);
        //    Assert.Equal("Error", actual.ViewName);
        //}

        private RenewalController GetController() {
            _customerHelper = Substitute.For<CustomerHelper>(_loggerCustomer);
            if (_controller != null)
                return _controller;
            return new RenewalController(_programProvider, _customerHelper, _loggerRenewal, _settings);
        }

        private PathString GetPath(string token) {
            return new PathString($"/markhughes.zuswdevsvcfab.goherbalife.com/Loyalty/Renewal/Index/en-US/?token={token}");
        }
    }
}
