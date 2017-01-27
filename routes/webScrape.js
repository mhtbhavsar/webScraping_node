var express = require('express');
var router = express.Router();

var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var Product = require('../modules/db/products');


var url = 'http://www.amazon.in/s/ref=lp_1389401031_pg_1?rh=n%3A976419031%2Cn%3A%21976420031%2Cn%3A1389401031&page=1&ie=UTF8&qid=1485429430&spIA=B01MCYNO0A,B01LL1J04I,B01LF0I76W'
var products = [];


/* GET users listing. */
router.post('/web/scrape', function(req, res, next) {


    request(req.body.url, function(err, resp, body) {
        if (err) {
            console.log('error occured : ' + err);
        } else {
            var $ = cheerio.load(body);

            var result = '#result_';

            for (var i = 0; i < 24; i++) {
                var productName = $(result + i + ' .s-access-title');
                var price = $(result + i + ' .s-price');
                var rating = $(result + i + '.a-declarative .a-icon-star .a-icon-alt');
                var productNameText = productName.text();
                products[i] = { "productName": productNameText, price: price.text(), rating: rating.text(), };
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


/* GET users listing. */
router.post('/web/scrape/all', function(req, res, next) {

    
    request(req.body.url, function(err, resp, body) {
        if (err) {
            console.log('error occured : ' + err);
        } else {
            var $ = cheerio.load(body);

            var result = '#result_';

            for (var i = 0; i < 24; i++) {
                var productName = $(result + i + ' .s-access-title');
                var price = $(result + i + ' .s-price');
                var rating = $(result + i + '.a-declarative .a-icon-star .a-icon-alt');
                var productNameText = productName.text();
                products[i] = { "productName": productNameText, price: price.text(), rating: rating.text(), };
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



});

module.exports = router;
