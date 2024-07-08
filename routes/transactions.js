// routes/transactions.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const search = req.query.search || '';

    // MongoDB query to search by title, description, or price
    const query = {
      $or: [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
        { description: { $regex: search, $options: 'i' } },
        { price: parseFloat(search) || 0 } // Convert search to float for price search
      ]
    };

    // Count total records (for pagination)
    const totalRecords = await Transaction.countDocuments(query);

    // Fetch transactions based on query and pagination
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    // Return JSON response with pagination metadata
    res.status(200).json({
      totalRecords,
      transactions,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / perPage)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
