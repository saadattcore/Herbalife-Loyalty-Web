var cultureHelper = {
    GetCurrentUICulture: function () {
        var locale = "en-US";
        var regExp = new RegExp("^[a-z]{2}(?:-[A-Z]{2})?$");
        var url = window.location.href;
        var parts = url.split('/');

        parts.forEach(function (item) {
            if (regExp.test(item)) {
                locale = item;
            }
        });

        return locale;
    }
};

var customerRewardsViewModel = function () {
    this.path = '/loyalty/api/Program/GetHighValueRewards/' + cultureHelper.GetCurrentUICulture();
    this.canLoad = false;
    var myModel = this;
    

    this.dataHandler = function (data) {
        if (data != null) {
            this.set("rewardsSource", data);
            $(this.obj).slick({
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

            });
            // this.setSlider();   


        }

    };

    this.loadRewards = function (activeProgram) {
        var newPath = this.path;
        if (activeProgram !== "") {
            newPath = this.path + "/&rewardType=" + activeProgram;
        }
        var myModel = this;
        $.ajax(newPath)
            .done(function (response) {              
                if (response != null) {
                    //myModel.set("rewardsSource", response);
                    simpleMediator.publish("setSource", response);

                     this.setSlider();   


                }
            }).fail(function () {
                logger.log("An error has ocurred while loading the program");
            });
    };

    this.setSource = function (info) {
        //this.set("rewardsSource", info);
        var rewards = new kendo.data.DataSource({
            data: info
        });
        
        myModel.set("rewardsSource", rewards);

       
     
    };
    

    
    this.onLoadError = function (context, status, error) {

    };


};

var homeProgramViewModel = function () {
    this.path = '/loyalty/api/Program/GetDistributorProgram/' + cultureHelper.GetCurrentUICulture();
    this.rewardsPath = '/loyalty/api/Program/GetHighValueRewards/' + cultureHelper.GetCurrentUICulture();



    this.dataHandler = function (data) {
        if (data != null) {
            this.set("distData", data)
            this.set("enableActivityRewards", data.enableActivityRewards);
            this.set("enableShoppingRewards", data.enableShoppingRewards);
            this.loadRewards();
        }
    };

    this.filterRewards = function (myModel) {
        var filteredRewards = [];
        var filteredRewardDs = new kendo.data.DataSource();
        var ValueRewards = this.get("rewardsSource2");
        var ActivityGifts = this.get("distData").activityRewardsGifts;

        if (this.get("distData").enableActivityRewards === true) {
            for (var x = 0; x < ValueRewards.length; x++) {
                if (ValueRewards[x].categoryCode === "Product") {
                    filteredRewardDs.add({
                        image: ValueRewards[x].image,
                        categoryCode: "Product",
                        name: ValueRewards[x].name,
                        categoryDescription: ValueRewards[x].categoryDescription
                    });
                }
            }
        }

        
        if (this.get("distData").enableShoppingRewards === true) {
            for (var y = 0; y < ActivityGifts.length; y++) {
                filteredRewardDs.add({
                    image: ActivityGifts[y].image,
                    categoryCode: "Activity",
                    name: ActivityGifts[y].name,
                    categoryDescription: "Activity"
                });
            }
        }
       
        myModel.set("rewardsSource", filteredRewardDs);
       

        $("#gifts-holder").slick({
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

        });

    };


    this.loadRewards = function () {
        var myModel = this;
        var newPath = this.rewardsPath;
        $.ajax(newPath)
            .done(function (response) {
                if (response != null) {
                    myModel.set("rewardsSource2", response);
                    //myModel.set("rewardsSource", null);
                    myModel.filterRewards(myModel);
                }
            }).fail(function () {
                logger.log("An error has ocurred while loading the program");
            });
    };
};



var showModel = function () {
    this.productInfoVisible =  false;
    this.toggleProductInfo = function (e) {
        e.preventDefault();
        var cl = $("i", e.currentTarget).attr("class");
        cl = cl.includes("29") ? cl.replace("29", "30") : cl.replace("30", "29");
        $("i", e.currentTarget).removeClass().addClass(cl);
        var bool = this.get("productInfoVisible");
        this.set("productInfoVisible", !bool);
    }
};


