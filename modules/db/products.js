var mongoose = require('mongoose');

var productSchema = mongoose.Schema({

    productName: { type: String },
    price: { type: String },
    rating: { type: String },

}, { collection: 'product' });

var Product = mongoose.model('Product', productSchema);

module.exports = Product;

module.exports.addProduct = function(products, callback) {
    Product.collection.insert(products, callback);
};

module.exports.getProducts = function(callback, limit) {
    Product.find(callback).limit(limit)
}

module.exports.getProduct = function(id, callback) {
    Product.findOne({ _id: id }).exec(callback)
}
