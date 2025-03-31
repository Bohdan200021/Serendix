const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  priceRange: String,
  phoneNumber: String,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
