kendo.data.binders.visibleWithEffect = kendo.data.Binder.extend({
    refresh: function () {
        var value = this.bindings.visibleWithEffect.get();
        var effect = $(this.element).data("effect") || 'fade';
        var speed = $(this.element).data("effect-speed") || 'fast';

        if (effect === "fade") {
            if (value) {
                $(this.element).fadeIn(speed);
            } else {
                $(this.element).fadeOut(speed);
            }
        }

        if (effect === "slide") {
            if (value) {
                $(this.element).slideDown(speed);
            } else {
                $(this.element).slideUp(speed);
            }
        }

    }
});
