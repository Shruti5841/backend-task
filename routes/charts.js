// routes/charts.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// GET /api/charts
router.get('/', async (req, res) => {
  try {
    const chartType = req.query.chartType; // Get chartType from query parameter
    const month = req.query.month; // Get month from query parameter (e.g., 'July')

    let data;

    // Switch based on chartType to generate appropriate chart data
    switch (chartType) {
      case 'bar':
        data = await generateBarChartData(month);
        break;
      case 'pie':
        data = await generatePieChartData(month);
        break;
      default:
        return res.status(400).json({ error: 'Invalid chartType' });
    }

    // Return JSON response with chart data
    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating chart data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Function to generate bar chart data
async function generateBarChartData(month) {
  // MongoDB aggregation or query to generate bar chart data
  // Example: Calculate price range and count of items in each range for the selected month
  const pipeline = [
    {
      $match: {
        $expr: { $eq: [{ $month: '$dateOfSale' }, new Date(month).getMonth() + 1] }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ['$price', 0] }, { $lte: ['$price', 100] }] }, then: '0-100' },
              { case: { $and: [{ $gte: ['$price', 101] }, { $lte: ['$price', 200] }] }, then: '101-200' },
              // Add more cases for other price ranges
            ],
            default: 'Other' // Default case if price doesn't fall into specified ranges
          }
        },
        count: { $sum: 1 }
      }
    }
  ];

  return await Transaction.aggregate(pipeline);
}

// Function to generate pie chart data
async function generatePieChartData(month) {
  // MongoDB aggregation or query to generate pie chart data
  // Example: Count number of items in each category for the selected month
  const pipeline = [
    {
      $match: {
        $expr: { $eq: [{ $month: '$dateOfSale' }, new Date(month).getMonth() + 1] }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ];

  return await Transaction.aggregate(pipeline);
}

module.exports = router;
