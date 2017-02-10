var mongoose = require('mongoose');

var productSchema = mongoose.Schema({

	pageUrl : {type : String},
	page : {type : Number},
    productName: { type : String },
    productUrl : { type : String },
    productBrand: { type : String },
    price: { type : String },
    customerReviews: { type : String },
    imgs: [String ],
    features: [String]

}, { collection: 'product' });

var Product = mongoose.model('Product', productSchema);

module.exports = Product;

module.exports.addProduct = function(products, callback) {
    Product.collection.insert(products, callback);
};

module.exports.createProduct = function(product, callback) {
    Product.create(product, callback);
};

module.exports.getProducts = function(callback, limit) {
    Product.find(callback).limit(limit)
};

module.exports.getProduct = function(id, callback) {
    Product.findOne({ _id: id }).exec(callback)
};
