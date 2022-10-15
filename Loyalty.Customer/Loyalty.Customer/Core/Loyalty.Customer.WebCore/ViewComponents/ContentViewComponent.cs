using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.ServiceModel;
using ContentProxySvc;

namespace Loyalty.Customer.WebCore.ViewComponents {
    public enum ContentRequestType {
        Fragment,
        Page
    }

    [ViewComponent(Name = "Content")]
    public class ContentViewComponent : ViewComponent {
        private readonly string viewName = "Render";
        private readonly string applicationName = "MyHL3";
        private ContentProxyServiceClient contentProxy;

        public ContentViewComponent(ContentProxyServiceClient _endpoint) {
            contentProxy = _endpoint;
        }

        public async Task<IViewComponentResult> InvokeAsync(ContentRequestType requestType, string path) {
            var result = new GetContentItemResponse();
            switch (requestType) {
                case ContentRequestType.Fragment: {
                        result = LoadFragment(path).Result;
                        break;
                    }
                case ContentRequestType.Page: {
                        result = LoadContent(path).Result;
                        break;
                    }
                default: {
                        result.Status = ServiceResponseStatusType.Failure;
                        result.Message = $"request type not valid.";
                        break;
                    }
            }

            if (result.Status != ServiceResponseStatusType.Success) {
                return View(viewName, result);
            } else {
                return View(viewName, result);
            }
        }

        private Task<GetContentItemResponse> LoadFragment(string path) {
            GetContentItemRequest request = new GetContentFragmentRequest_V01 {
                Locale = System.Threading.Thread.CurrentThread.CurrentCulture.Name,
                ApplicationName = applicationName,
                Path = path
            };
            return contentProxy.GetContentItemAsync(request);
        }

        private Task<GetContentItemResponse> LoadContent(string path) {
            GetContentItemRequest request = new GetContentItemRequestt_V01 {
                Locale = System.Threading.Thread.CurrentThread.CurrentCulture.Name,
                ApplicationName = applicationName,
                Path = path
            };
            return contentProxy.GetContentItemAsync(request);
        }
    }
}
