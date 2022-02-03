let Pagination = {
    name: 'pagination', template: '#pagination', props: {
        disableClass: {
            type: String,
            required: false,
        },
        maxVisibleButtons: {
            type: Number,
            required: false,
            default: 3
        },
        totalPages: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        perPage: '',
        currentPage: {
            type: Number,
            required: true
        },
    },
    computed: {
        startPage() {
            if (this.currentPage === 1) {
                return 1;
            }

            if (this.currentPage === this.totalPages) {
                return this.totalPages - this.maxVisibleButtons + 1;
            }

            return this.currentPage - 1;

        },
        endPage() {
            return Math.min(this.startPage + this.maxVisibleButtons - 1, this.totalPages);

        },
        pages() {
            const range = [];

            for (let i = this.startPage; i <= this.endPage; i += 1) {
                range.push({
                    name: i, isDisabled: i === this.currentPage
                });
            }

            return range;
        },
    }, methods: {
        onClickFirstPage() {
            this.$emit('pagechanged', 1);
        },
        onClickPreviousPage() {
            this.$emit('pagechanged', this.currentPage - 1);
        },
        onClickPage(page) {
            this.$emit('pagechanged', page);
        }, onClickNextPage() {
            this.$emit('pagechanged', this.currentPage + 1);
        }, onClickLastPage() {
            this.$emit('pagechanged', this.totalPages);
        }, isPageActive(page) {
            return this.currentPage === page;
        },
    }
};
let punk
punk = new Vue({
    el: '#container',
    components: {
        pagination: Pagination,
    },
    data: {
        beerList: [],
        currentPage: 1,
        disableVariable: 'disabled',
        beerListCount: 0,
        beerListCountForFilter: 0,
        perPage: 8,
        activeClass: 'active',
        page: 1,
        flag: 0,
        start: 0,
        abv_gt: 0,
        abv_lt: 0,
        counterForToggle: [],
        abvFilter: '',
        ibuFilter: '',
        search: '',
        fetchError: '',
        countBeer: 0,
        xBeerList: [],    /*Functions with prefix x denotes variables*/
        xPageNumber: 1,   /*which are used for counting total number of products(beers)*/
        xData: [],        /*in function name totalBeerCount()*/
        urlLoad: new URL(window.location.href),
        showAbv:true,
        showIbu:false
    },
    created() {
        this.getBeers();
        this.totalBeerCount();
    },
    methods: {
        getToTop() {
            window.scroll({top: 0, behavior: 'smooth'});
        },
        searchCall: function () {
            this.page = 1;
            /*this.onPageChange(1)*/
            this.searchFunction();
            this.checkToggleButton();
        },
        checkWhichOneToCallForToggle: function () {
            if (this.search) {
                this.searchFunction();
            } else {
                this.getBeers();
            }
        },
        checkToggleButton: function () {
            if (this.search) {
                fetch(`https://api.punkapi.com/v2/beers?beer_name=${this.search}&page=${this.page + 1}&per_page=${this.perPage}` + this.abvFilter + this.ibuFilter)
                    .then((response) => {
                        return response.json();
                    }).then((data) => {
                    this.counterForToggle = data;
                })
            } else {
                fetch(`https://api.punkapi.com/v2/beers?page=${this.page + 1}&per_page=${this.perPage}` + this.abvFilter + this.ibuFilter)
                    .then((response) => {
                        return response.json();
                    }).then((data) => {
                    this.counterForToggle = data;
                })
            }
        },
        checkWhichOneToCall: function () {
            this.page = 1;
          /*  this.onPageChange(1)*/
            if (this.search) {
                this.searchFunction();
            } else {
                this.getBeers();
            }
            this.checkToggleButton();
        },
        beerSearchCountForFilters: function () {
            fetch(`https://api.punkapi.com/v2/beers?per_page=${80}` + this.abvFilter + this.ibuFilter)
                .then((response) => {
                    return response.json();
                }).then((data) => {
                this.beerListCountForFilter = data.length;
            })
        },
        clearFilter: function () {
            this.ibuFilter = '';
            this.abvFilter = '';
            this.getBeers();
        },
        goToHome: function () {
            this.search = '';
            this.currentPage = 1;
            /*this.beerListCount = 0;
            this.beerListCountForFilter = 0;*/
            this.perPage = 8;
            this.page = 1;
            this.abvFilter = '';
            this.ibuFilter = '';
            this.getBeers();
        },
        getBeers: function () {
            fetch(`https://api.punkapi.com/v2/beers?page=${this.page}&per_page=${this.perPage}` + this.abvFilter + this.ibuFilter)
                .then((response) => {
                    return response.json();
                }).then((data) => {
                this.beerList = data;
            })
            this.beerSearchCountForFilters();
            this.start = 1;
        },
        totalBeerCount: function () {
            this.xData = fetch(`https://api.punkapi.com/v2/beers?page=${this.xPageNumber}&per_page=${80}`)
                .then((response) => {
                    return response.json();
                }).then((data) => {
                    return data;
                })
            this.xData.then((x) => {
                this.xBeerList = x;
                this.countBeer += x.length;
                if (this.xBeerList.length > 0) {
                    this.xPageNumber++;
                    this.totalBeerCount();
                }
            })
        },
        beerSearchCount: function () {
            fetch(`https://api.punkapi.com/v2/beers?beer_name=${this.search}&per_page=80` + this.abvFilter + this.ibuFilter)
                .then((response) => {
                    return response.json();
                }).then((data) => {
                this.beerListCount = data.length;
            })

        },
        searchFunction: function () {
            if (this.search) {
                fetch(`https://api.punkapi.com/v2/beers?page=${this.page}&per_page=${this.perPage}&beer_name=${this.search}` + this.abvFilter + this.ibuFilter)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Something went wrong');
                        }
                    })
                    .then((data) => {
                        this.beerList = data;
                    })
                    .catch((error) => {
                        this.fetchError = error;
                    });

                this.beerSearchCount();

            } else {
                this.fetchError = '';
                this.getBeers();
                this.currentPage = 1;

            }
        },
        onPageChange(page) {
            this.page = page;
            this.getBeers();
            this.currentPage = page;
        },
    },
    computed: {
        totalPageCreated() {
            return Math.ceil(this.countBeer / this.perPage);
        },

    }

});


