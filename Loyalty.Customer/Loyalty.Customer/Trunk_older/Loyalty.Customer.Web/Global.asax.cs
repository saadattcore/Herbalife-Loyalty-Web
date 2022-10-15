using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace Loyalty.Customer.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //AreaRegistration.RegisterAllAreas();

            ControllerBuilder.Current.DefaultNamespaces.Add("Shop.Storefront.Common.Infrastructure.Mvc.Controllers");
            ControllerBuilder.Current.DefaultNamespaces.Add("Loyalty.Customer.WebApi");
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }
    }
}
