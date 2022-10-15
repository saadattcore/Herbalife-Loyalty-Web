using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Loyalty.Customer.WebCore.CultureProviders {
    public class UrlRequestCultureProvider : IRequestCultureProvider {
        public Task<ProviderCultureResult> DetermineProviderCultureResult(HttpContext context) {
            var url = context.Request.Path;
            var parts = context.Request.Path.Value.Split('/').Where(p => !String.IsNullOrWhiteSpace(p)).ToList();
            if (parts.Count == 0) {
                return Task.FromResult<ProviderCultureResult>(null);
            }

            string culture = null;
            for (var ind = 0; ind < parts.Count; ind++){
                if (Regex.IsMatch(parts[ind], @"^[a-z]{2}(?:-[A-Z]{2})?$")) {
                    culture = parts[ind];
                }
            }

            return Task.FromResult(new ProviderCultureResult(culture));
        }
    }
}
