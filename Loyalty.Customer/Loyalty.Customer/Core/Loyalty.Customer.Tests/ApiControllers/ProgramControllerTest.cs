using Loyalty.Customer.Models.Configuration;
using Loyalty.Customer.Models.Provider;
using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.WebApi;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSubstitute;
using System;
using Xunit;

namespace Loyalty.Customer.Tests.ApiControllers {
    public class ProgramControllerTest {
        private static ILogger<ProgramController> _logger => Substitute.For<ILogger<ProgramController>>();
        private static IStringLocalizer<ProgramController> _localizer => Substitute.For<IStringLocalizer<ProgramController>>();
        private static CustomerHelper _customerHelper => Substitute.For<CustomerHelper>();
        private static IOptions<GeneralSettings> _generalSettings => Substitute.For<IOptions<GeneralSettings>>();
        private static ProgramController Controller => new ProgramController(null, _logger, _localizer, _customerHelper, _generalSettings);

        private static CustomerWishRequest SampleWishListRequest => new CustomerWishRequest {
            CategoryCode = "Activity",
            CustomerId = new Guid("c0f41fb7-97d2-4a76-b764-7b2dc305c5d7"),
            CountryCodeISO = "US",
            Sku = "125U",
            Tier = 1,
            Validity = new DateRange {
                From = DateTime.Today
            }
        };

        //[Fact]
        //public void ThrowArgumentException_NullCategoryCode() {
        //    SampleWishListRequest.CategoryCode = null;
        //    var actual = Controller.SaveWishItem(SampleWishListRequest);
        //}
    }
}
