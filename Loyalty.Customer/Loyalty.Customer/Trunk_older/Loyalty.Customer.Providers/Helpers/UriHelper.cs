using HL.Common.Configuration;
using System;

namespace Loyalty.Customer.Providers {
    internal class UriHelper {
        internal static Uri ReadApiUri = new Uri(Settings.GetRequiredAppSetting("ReadApiUri"));
        internal static Uri ReadApiInternalUri = new Uri(Settings.GetRequiredAppSetting("ReadApiInternalUri"));
        internal static Uri WriteApiUri = new Uri(Settings.GetRequiredAppSetting("WriteApiUri"));
    }
}
