// Import required modules
const mongoose = require('mongoose'); // Mongoose for MongoDB interaction
const axios = require('axios'); // Axios for HTTP requests

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transactions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB for seeding');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Define a simple schema and model for transactions
const transactionSchema = new mongoose.Schema({
  title: String, // Product title
  description: String, // Product description
  price: Number, // Product price
  dateOfSale: Date, // Sale date
  sold: Boolean, // Sold status
  category: String, // Product category
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Function to fetch data from the third-party API and seed the database
const seedData = async () => {
  try {
    // Fetch data from the third-party API
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Insert fetched data into the database
    await Transaction.insertMany(transactions);
    console.log('Data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the seedData function
seedData();db.transactions.find()