using Microsoft.Extensions.Logging;
using System;

namespace Loyalty.Customer.WebCore {
    public class EventSourceLoggerProvider : ILoggerProvider {
        private readonly Func<string, LogLevel, bool> _filter;
        public EventSourceLoggerProvider(Func<string, LogLevel, bool> filter) {
            _filter = filter;
        }

        public ILogger CreateLogger(string categoryName) {
            return new EventSourceLogger(categoryName, _filter);
        }

        public void Dispose() {
        }
    }

    public class EventSourceLogger : ILogger {
        private string _categoryName;
        private Func<string, LogLevel, bool> _filter;

        public EventSourceLogger(string categoryName, Func<string, LogLevel, bool> filter) {
            _categoryName = categoryName;
            _filter = filter;
        }

        public IDisposable BeginScope<TState>(TState state) {
            return null;
        }

        public bool IsEnabled(LogLevel logLevel) {
            return (_filter == null || _filter(_categoryName, logLevel));
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter) {
            if (!IsEnabled(logLevel)) {
                return;
            }

            if (formatter == null) {
                throw new ArgumentNullException(nameof(formatter));
            }

            var message = formatter(state, exception);

            if (string.IsNullOrEmpty(message)) {
                return;
            }

            message = $"{ logLevel }: {message}";

            if (exception != null) {
                message += Environment.NewLine + Environment.NewLine + exception.ToString();
            }

            ServiceEventSource.Current.Message(message);
        }
    }
}
