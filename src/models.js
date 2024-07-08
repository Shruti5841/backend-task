const mongoose = require('mongoose');

const ProductTransactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  sold: Boolean,
  category: String
});

const ProductTransaction = mongoose.model('ProductTransaction', ProductTransactionSchema);

module.exports = { ProductTransaction };
