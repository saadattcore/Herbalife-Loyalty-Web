namespace Loyalty.Customer.Models.Configuration {
    public class GeneralSettings {
        public int CustomerLockPeriod { get; set; }
        public int RenewalWindow { get; set; }
        public string DecryptionKey { get; set; }
        public string DecryptionFootprint { get; set; }
        public bool FullStorySessionCaptureEnabled { get; set; }
    }
}
