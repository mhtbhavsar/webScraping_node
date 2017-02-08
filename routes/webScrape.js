var express = require('express');
var router = express.Router();
// var Promise = require('promise');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');


// var promise = deferred.promise;

var Product = require('../modules/db/products');

var products = [];
var prodURLs = [];

var url = 'http://www.amazon.in/s/ref=lp_1389401031_pg_1?rh=n%3A976419031%2Cn%3A%21976420031%2Cn%3A1389401031&page=1&ie=UTF8&qid=1485429430&spIA=B01MCYNO0A,B01LL1J04I,B01LF0I76W';

var URLs = generateUrls(1);

function generateUrls(limit) {

    var url1 = 'http://www.amazon.in/s/ref=lp_1389401031_pg_';
    var url2 = '?rh=n%3A976419031%2Cn%3A!976420031%2Cn%3A1389401031&page=';
    var url3 = '&ie=UTF8&qid=1485429430&spIA=B01MCYNO0A,B01LL1J04I,B01LF0I76W';

    var urls = [];

    var i;
    for (i = 1; i <= limit; i++) {
        urls.push(url1 + i + url2 + i + url3);
    }
    console.log(urls.length);
    return urls
}


function getData(endpoint) {
    var deferred = Promise.defer();

    deferred.resolve(endpoint + " i m mohit");

    return deferred.promise
}

var loadData = function(endpoint) {

    getProductsURL(URLs).then((pURLs) => {

        console.log(" in prodURL then section" + pURLs);
        console.log("please check the database")

    }).catch((err) => { condole.log(err) });

    getData(endpoint).then((data) => {
        console.log("something : " + data)
    }).catch((err) => { console.log("error caught" + err) });

}

// loadData("hi");

function getProductsData(productUrl) {

    return new Promise((resolve) => {
        // setTimeout(() => {
        // console.log("Resolving " + value);
        var body = request(productUrl, function(err, res, body) {
            if (err) {
                console.log("error in getting product Data" + err);
            } else {
                var $$ = cheerio.load(body, {
                    ignoreWhitespace: true
                });
                // body = "";
                var productName = $$('#productTitle');

                console.log("got a product names : " + productName.text());
                // $ = "";
                resolve(productName.text())
            }

        });

        // }, Math.floor(Math.random() * 1000));
    });

    // var deferred = Promise.defer();
    // request(productUrl, function(err, res, body) {
    //     console.log("\n Data request : " + productUrl);
    //     var $ = cheerio.load(body, {
    //         ignoreWhitespace: true
    //     });

    //     var productName = $('#productTitle');

    //     console.log("got a product names : " + productName.text());
    //     deferred.resolve(productName);

    // });

    // return deferred.promise;

}

getProductsURL(URLs)
    // .then((prodUrls) => {
    //     console.log("products urls here : " + prodUrls);
    //     var prodPromiseFunctions = [];
    //     for (key in prodUrls) {
    //         (function(uri) {
    //             prodPromiseFunctions.push(getProductsData(uri));
    //         })(prodUrls[key]);

//     }

//     Promise.all(prodPromiseFunctions)
//         .then(function(product) {
//             console.log(product);
//             console.log("Got all the products....!")
//         }).catch((e) => {
//             throw e;
//         });
// })
.then(function() {
    console.log("end is here....! : \n" + products)
}).catch((err) => {
    console.log("err occured" + err);
});

function getProductsURL(URL) {
    console.log("scraping started for :" + URL[0]);
    var def = Promise.defer();
    var prodPromiseFunctions = [];

    var r = request(URL[0], function(err, res, body) {
        console.log("request : " + URL[0]);
        var $ = cheerio.load(body, {
            ignoreWhitespace: true
        });
        body = "";
        var result = '#result_';
        for (var i = 0; i < 5; i++) {
            var productName = $(result + i + ' .s-access-detail-page .s-access-title');
            var prodUrl = productName.parent().attr('href');
            prodPromiseFunctions.push(getProductsData(prodUrl))
                // prodURLs.push(prodUrl);
        }
        $ = "";
        Promise.all(prodPromiseFunctions)
            .then(function(product) {
                def.resolve(product);
            }).catch((e) => {
                throw e;
            });
    });

    return def.promise;

}

/*for single products*/
router.get('/test', function(req, resp) {
    console.log("in test section");


});

/* end */
/* GET users listing. */
router.get('/web/scrape/all/:pages', function(req, resp, next) {

    var URLs = generateUrls(req.params.pages);
    console.log(req.params.pages + "\n total generated URLs" + URLs.length);

    for (URL in URLs) {
        (function(url, page) {
            request(url, function(err, res, body) {
                var $ = cheerio.load(body);
                var result = '#result_';
                var i = page * 24;
                var limit = i + 24;
                var pages = parseInt(page) + 1;
                console.log("page : " + pages + " \n results " + i + " to " + limit);
                for (var j = 0, i; i < limit; i++, j++) {
                    var productName = $(result + i + ' .s-access-title');
                    var productUrl;
                    productName.each(function(i, ele) {
                        productUrl = $(this).parent().attr('href');
                        prodURLs[i] = productUrl;
                    });
                    var price = $(result + i + ' .s-price');
                    var rating = $(result + i + '.a-declarative .a-icon-star .a-icon-alt');
                    var productNameText = productName.text();
                    products[j] = { "productName": productNameText, price: price.text(), rating: rating.text(), productUrl: productUrl };
                }

                Product.addProduct(products, function(err, products) {
                        if (err) {
                            console.log("error in insertion of new products : \n" + err);
                        } else {
                            fs.writeFile('jsonFiles/Products' + pages + '.json', JSON.stringify(products, null, 4), function(err) {
                                if (err) {
                                    console.log("error in file writing : \n" + err);
                                } else
                                    console.log('jsonFiles/Products' + pages + '.json writed');

                            })

                        }
                    })
                    //console.log(JSON.stringify(products) + "\n count is : " + products.length);
                console.log('url :- ' + url);


            });
        })(URLs[URL], URL);

    }
    console.log("please wait for few min to get the results");
    resp.end("please wait for few min to get the results then check console then database and jsonFiles");


})


/* GET users listing. */
router.post('/web/scrape', function(req, res, next) {

    URL = generateUrls(1);

    request(URL[0], function(err, resp, body) {
        if (err) {
            console.log('error occured : ' + err);
        } else {
            var $ = cheerio.load(body);

            var result = '#result_';

            for (var i = 0; i < 24; i++) {
                var productName = $(result + i + ' .s-access-title');
                var price = $(result + i + ' .s-price');
                var rating = $(result + i + '.a-declarative .a-icon-star .a-icon-alt');
                var productLink = $(result + i + 'a .a-success-detail-page').attr('href');
                var productNameText = productName.text();

                products[i] = { "productName": productNameText, price: price.text(), rating: rating.text(), productLink: productLink.text() };
            }

            fs.writeFile('jsonFiles/AmazonProducts.json', JSON.stringify(products, null, 4), function(err) {

                console.log('File successfully written! - Check your project directory for the output.json file');

            })

            Product.addProduct(products, function(err, products) {
                if (err) {
                    res.status(500).json({ success: false, message: "error in upgradation of Product...!", err: err });
                } else {
                    res.status(200).json({ success: true, message: "Products inserted successfully..!", count: products.length, data: products });
                }
            })
            console.log(JSON.stringify(products));
        }
    })
})

module.exports = router;
