using HL.Loyalty.Models;
using Loyalty.Customer.Models.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace Loyalty.Customer.Provider.Helpers {
    public class ProxyHelper {
        private static readonly MediaTypeWithQualityHeaderValue ApplicationJson = new MediaTypeWithQualityHeaderValue("application/json");
        private readonly EndPoints _endPointsSettings;
        private readonly ILogger<ProxyHelper> _logger;

        public ProxyHelper(IOptions<EndPoints> endPointsSettings, ILogger<ProxyHelper> logger) {
            _endPointsSettings = endPointsSettings.Value;
            _logger = logger;
        }

        public WrapperResult<T> PostProxyData<T, TP>(Guid correlationId, TP postData, string uri) {
            WrapperResult<T> result = new WrapperResult<T>();
            string errorMessgage = string.Empty;
            try {
                using (var client = new HttpClient()) {
                    ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, errors) => true;
                    client.BaseAddress = new Uri(_endPointsSettings.WriteApiUri);
                    client.DefaultRequestHeaders.Accept.Add(ApplicationJson);
                    client.DefaultRequestHeaders.Add("CorrelationId", correlationId.ToString());
                    client.DefaultRequestHeaders.Add("Token", _endPointsSettings.WriteApiAuthToken);

                    var response = client.PostAsJsonAsync(uri, postData).Result;
                    if (response.IsSuccessStatusCode) {
                        result.Status = WrapperResultType.Ok;
                        result.DataResult = response.Content.ReadAsAsync<T>().Result;
                    } else {
                        result.Status = WrapperResultType.Error;
                        result.ErrorResult = new Exception(response.Content.ReadAsStringAsync().Result);
                    }
                }
            } catch (Exception ex) {
                _logger.LogError("Loyalty.Customer ProxyHelper-{0}", ex);
                throw ex;
            }

            return result;
        }

        public WrapperResult<T> PutProxyData<T, TP>(Guid correlationId, TP postData, string uri) {
            WrapperResult<T> result = new WrapperResult<T>();
            string errorMessgage = string.Empty;
            try {
                using (var client = new HttpClient()) {
                    ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, errors) => true;
                    client.BaseAddress = new Uri(_endPointsSettings.WriteApiUri);
                    client.DefaultRequestHeaders.Accept.Add(ApplicationJson);
                    client.DefaultRequestHeaders.Add("CorrelationId", correlationId.ToString());
                    client.DefaultRequestHeaders.Add("Token", _endPointsSettings.WriteApiAuthToken);

                    var response = client.PutAsJsonAsync(uri, postData).Result;
                    if (response.IsSuccessStatusCode) {
                        result.Status = WrapperResultType.Ok;
                        result.DataResult = response.Content.ReadAsAsync<T>().Result;
                    } else {
                        result.Status = WrapperResultType.Error;
                        result.ErrorResult = new Exception(response.Content.ReadAsStringAsync().Result);
                    }
                }
            } catch (Exception ex) {
                _logger.LogError("Loyalty.Customer ProxyHelper-{0}", ex);
                throw ex;
            }

            return result;
        }

        public T GetProxyData<T, TP>(string appSecret, TP queryStringData, string uri, bool bypass) {
            var ret = default(WrapperResult<T>);
            try {

                using (var client = new HttpClient()) {
                    ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, errors) => true;

                    client.BaseAddress = new Uri(_endPointsSettings.ReadApiUri);
                    client.DefaultRequestHeaders.Accept.Add(ApplicationJson);
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("AppSecret", appSecret);

                    var requestUri = bypass ? uri : BuildQueryString(uri, queryStringData);
                    var response = client.GetAsync(requestUri).Result;

                    ret = response.Content.ReadAsAsync<WrapperResult<T>>().Result;

                    if (ret.Status != WrapperResultType.Ok)
                        throw ret.ErrorResult;
                }
            } catch (Exception ex) {
                _logger.LogError("Loyalty.Customer ProxyHelper-{0}", ex);
                throw ex;
            }
            return ret.DataResult;
        }

        public T GetProxyDataApiCore<T, TP>(Guid correlationId, TP queryStringData, string uri, bool bypass) {
            string errorMessage = "";
            var ret = default(T);
            try {
                using (var client = new HttpClient()) {
                    ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, errors) => true;

                    client.BaseAddress = new Uri(_endPointsSettings.WriteApiUri);
                    client.DefaultRequestHeaders.Accept.Add(ApplicationJson);
                    client.DefaultRequestHeaders.Add("Token", _endPointsSettings.WriteApiAuthToken);
                    client.DefaultRequestHeaders.Add("CorrelationId", correlationId.ToString());

                    var requestUri = bypass ? uri : BuildQueryString(uri, queryStringData);
                    var response = client.GetAsync(requestUri).Result;
                    errorMessage = response.Content.ReadAsStringAsync().Result;
                    ret = response.Content.ReadAsAsync<T>().Result;
                }
            } catch (Exception ex) {
                _logger.LogError("Loyalty.Customer ProxyHelper-{0}", ex);
                throw ex;
            }

            return ret;
        }

        internal string BuildQueryString<T>(string url, T sourceObject) {
            var type = sourceObject.GetType();
            var queryString = new StringBuilder();
            queryString.Append(url + "?");

            foreach (var property in type.GetProperties()) {
                var propertyValue = property.GetValue(sourceObject, new object[] { });

                if (propertyValue == null)
                    continue;

                queryString.Append(WebUtility.UrlEncode(property.Name));
                queryString.Append("=");
                queryString.Append(WebUtility.UrlEncode(propertyValue.ToString()));
                queryString.Append("&");
            }

            if (queryString.Length > 0)
                queryString.Remove(queryString.Length - 1, 1);

            return queryString.ToString();
        }
    }
}
