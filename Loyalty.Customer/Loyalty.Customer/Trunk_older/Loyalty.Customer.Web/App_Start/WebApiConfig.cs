using System.Web.Http;

namespace Loyalty.Customer.Web {
    internal class WebApiConfig {
        internal static void Register(HttpConfiguration config) {
            // General infrastrucutre API for use by all pages and apps.
            config.Routes.MapHttpRoute(
                name: "Spa Api",
                routeTemplate: "api/{controller}/{action}",
                defaults: new { controller = "Program" }
                );

            // General infrastrucutre API for use by all pages and apps.
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
                );
        }
    }
}