namespace Loyalty.Customer.Models.Provider {
    public class GenericResponse {
        public GenericResponse() {
            IsSuccess = false;
        }

        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
    }
}
