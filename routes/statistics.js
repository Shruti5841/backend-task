// routes/statistics.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// GET /api/statistics
router.get('/', async (req, res) => {
  try {
    const month = req.query.month; // Get month from query parameter (e.g., 'July')

    // MongoDB aggregation pipeline to calculate statistics
    const pipeline = [
      {
        $match: {
          $expr: { $eq: [{ $month: '$dateOfSale' }, new Date(month).getMonth() + 1] }
        }
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: '$price' },
          totalSoldItems: { $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] } },
          totalNotSoldItems: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } }
        }
      }
    ];

    const result = await Transaction.aggregate(pipeline);

    // Return JSON response with statistics
    res.status(200).json(result[0]); // Assuming only one result is expected
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
