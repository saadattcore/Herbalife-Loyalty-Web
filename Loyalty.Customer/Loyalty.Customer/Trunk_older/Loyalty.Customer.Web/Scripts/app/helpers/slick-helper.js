function makeSlick() {    
    $('.product-carousel').slick({
        dots: false,
        infinite: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 3,
        prevArrow: '<button type="button" data-role="none" class="slick-prev icon-arrow-left-ln-2" style="display: block;"></button>',
        nextArrow: '<button type="button" data-role="none" class="slick-next icon-arrow-right-ln-2" style="display: block;"></button>',
        responsive: [
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 620,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
            // You can unslick at a given breakpoint now by adding:
            // settings: "unslick"
            // instead of a settings object
        ]

    })


}