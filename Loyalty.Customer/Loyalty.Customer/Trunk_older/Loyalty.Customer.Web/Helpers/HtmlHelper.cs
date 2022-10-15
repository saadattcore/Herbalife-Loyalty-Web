using HL.Common.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Compilation;
using System.Web.Mvc;

namespace Loyalty.Customer.Web {
    public static class HtmlHelper {
        private static Type _resxResourceProviderFactoryType;
        private static ResourceProviderFactory _resourceProviderFactory = (ResourceProviderFactory)Activator.CreateInstance(ResxResourceProviderFactoryType);

        private static Type ResxResourceProviderFactoryType {
            get {
                if (_resxResourceProviderFactoryType == null) {
                    _resxResourceProviderFactoryType = Assembly.GetAssembly(typeof(ResourceProviderFactory))
                                                               .GetType("System.Web.Compilation.ResXResourceProviderFactory");
                }

                return _resxResourceProviderFactoryType;
            }
        }

        public static IHtmlString Localize(this WebViewPage page, string key) {
            var value = GetString(page.VirtualPath, key);

            return new HtmlString(value);
        }

        private static string GetString(string virtualPath, string key) {
            var culture = CultureInfo.CurrentUICulture;

            try {
                var provider = _resourceProviderFactory.CreateLocalResourceProvider(virtualPath);
                var localizedObject = provider.GetObject(key, culture) ?? string.Format("[{0}_{1}_{2} Missing]", virtualPath, key, culture.TwoLetterISOLanguageName);

                return localizedObject.ToString();
            } catch (Exception ex) {
                LoggerHelper.Exception("Localization", ex);
            }

            return string.Format("[{0}_{1}_{2} Missing]", virtualPath, key, culture.TwoLetterISOLanguageName);
        }
    }
}