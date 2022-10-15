using System;

namespace Loyalty.Customer.Models.Provider
{
    public enum StatusResponse {
        Success = 0,
        Failure = 1,
        Timeout = 2,
        Missingconfiguration = 3
    }

    public class BusReaderResponse {
        public Exception Exception { get; set; }
        public object Response { get; set; }
        public StatusResponse Status { get; set; }
    }

    public partial class ResponseEvent {
        public enum ResponseEventStatus {
            Success = 0,
            Failure = 1,
            Timeout = 2,
            Missingconfiguration = 3
        }

        public Guid CorrelationId { get; set; }
        public ResponseEventStatus Status { get; set; }
        public string MessageType { get; set; }
        public string Message { get; set; }
        public ResponseEvent(Guid correlationId, ResponseEventStatus status, string messageType, string message = "") {
            CorrelationId = correlationId;
            Status = status;
            MessageType = messageType;
            Message = message;
        }
    }
}
