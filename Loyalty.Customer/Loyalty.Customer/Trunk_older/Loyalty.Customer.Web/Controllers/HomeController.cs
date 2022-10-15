using System.Web.Mvc;

namespace Loyalty.Customer.Web.Controllers {
    public class HomeController : Controller {
        public ActionResult Index() {
            return View();
        }
    }
}