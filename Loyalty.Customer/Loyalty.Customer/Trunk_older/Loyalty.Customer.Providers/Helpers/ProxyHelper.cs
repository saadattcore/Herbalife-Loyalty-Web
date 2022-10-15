using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web;
using HL.Common.Logging;
using HL.Loyalty.Models;
using HL.Common.Configuration;

namespace Loyalty.Customer.Providers {
    internal class ProxyHelper {
        private static readonly MediaTypeWithQualityHeaderValue ApplicationJson = new MediaTypeWithQualityHeaderValue("application/json");

        #region Attributes
        private static HttpClientHandler _handler;

        #endregion

        #region Properties
        internal static HttpClientHandler Handler {
            get {
                HttpCookie CurrentCookie = HttpContext.Current.Request.Cookies[".ASPXAUTH"];
                var cookieContainer = new CookieContainer();
                cookieContainer.Add(new Cookie { Name = CurrentCookie.Name, Value = CurrentCookie.Value, Domain = "localhost" });
                _handler = new HttpClientHandler { CookieContainer = cookieContainer };
                return _handler;
            }
        }
        #endregion

        #region Proxy Communication

        /// <summary>
        /// Private generic helper method for posting data to the proxy API.
        /// </summary>
        /// <typeparam name="T">The type expected to return</typeparam>
        /// <typeparam name="TP"></typeparam>
        /// <param name="appSecret">The appSecret of the requests' AppId.</param>
        /// <param name="postData">The post data for the request</param>
        /// <param name="uri">The API URI</param>
        /// <returns></returns>
        internal static T PostProxyData<T, TP>(Guid correlantionId, TP postData, string uri) {
            var ret = default(T);
            string errorMessgage = string.Empty;
            try {
                using (var client = new HttpClient()) {
                    ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, errors) => true;
                    client.BaseAddress = UriHelper.WriteApiUri;
                    client.DefaultRequestHeaders.Accept.Add(ApplicationJson);
                    client.DefaultRequestHeaders.Add("CorrelationId", correlantionId.ToString());
                    client.DefaultRequestHeaders.Add("Token", Settings.GetRequiredAppSetting("WriteApiAuthToken", string.Empty));

                    var response = client.PostAsJsonAsync(uri, postData).Result;
                    errorMessgage = response.Content.ReadAsStringAsync().Result;
                    ret = response.Content.ReadAsAsync<T>().Result;
                }
            } catch (Exception ex) {
                LoggerHelper.Exception("System.Exception", ex);
                throw ex;
            }

            return ret;
        }

        /// <summary>
        /// Private generic helper method for getting data from the proxy API.
        /// </summary>
        /// <typeparam name="T">The type expected to return</typeparam>
        /// <typeparam name="TP">The post data for the request</typeparam>
        /// <param name="appSecret">The appSecret of the requests' AppId.</param>
        /// <param name="queryStringData"></param>
        /// <param name="uri">The API URI</param>
        /// <param name="bypass"></param>
        /// <returns>The marshalled object from the response of the GET</returns>
        internal static T GetProxyData<T, TP>(string appSecret, TP queryStringData, string uri, bool bypass) {
            var ret = default(WrapperResult<T>);
            try {

                using (var client = new HttpClient()) {
                    ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, errors) => true;

                    client.BaseAddress = UriHelper.ReadApiUri;
                    client.DefaultRequestHeaders.Accept.Add(ApplicationJson);
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("AppSecret", appSecret);

                    var requestUri = bypass ? uri : BuildQueryString(uri, queryStringData);
                    var response = client.GetAsync(requestUri).Result;

                    ret = response.Content.ReadAsAsync<WrapperResult<T>>().Result;

                    if (ret.Status != WrapperResultType.Ok)
                        throw ret.ErrorResult;
                }
            } catch (Exception ex) {
                LoggerHelper.Exception("System.Exception", ex);
            }
            return ret.DataResult;
        }

        /// <summary>
        /// Private generic helper method for turning a model object into 
        /// a queryString suitable for passing to the proxy API.
        /// </summary>
        /// <typeparam name="T">The type of the sourceObject</typeparam>
        /// <param name="url">The base url</param>
        /// <param name="sourceObject">The object to serialize to queryString</param>
        /// <returns>The query string</returns>
        internal static string BuildQueryString<T>(string url, T sourceObject)
        {
            var type = sourceObject.GetType();

            var queryString = new StringBuilder();

            queryString.Append(url + "?");

            foreach (var property in type.GetProperties())
            {
                var propertyValue = property.GetValue(sourceObject, new object[] { });

                if (propertyValue == null)
                    continue;

                queryString.Append(HttpUtility.UrlEncode(property.Name));
                queryString.Append("=");
                queryString.Append(HttpUtility.UrlEncode(propertyValue.ToString()));
                queryString.Append("&");
            }

            if (queryString.Length > 0)
                queryString.Remove(queryString.Length - 1, 1);

            return queryString.ToString();
        }

        #endregion
    }
}
