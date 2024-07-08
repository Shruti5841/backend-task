const axios = require('axios');
const { ProductTransaction } = require('./models');
const config = require('./config');

const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get(config.thirdPartyAPI);
    const transactions = response.data;
    await ProductTransaction.deleteMany({});
    await ProductTransaction.insertMany(transactions);
    res.status(200).send('Database initialized successfully');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
};

const listTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  const query = {
    dateOfSale: { $regex: `^\\d{4}-${month.padStart(2, '0')}` },
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { price: { $regex: search, $options: 'i' } }
    ]
  };
  const transactions = await ProductTransaction.find(query)
    .skip((page - 1) * perPage)
    .limit(parseInt(perPage));
  res.status(200).json(transactions);
};

const getStatistics = async (req, res) => {
  const { month } = req.query;
  const match = { dateOfSale: { $regex: `^\\d{4}-${month.padStart(2, '0')}` } };
  
  const totalSaleAmount = await ProductTransaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$price" } } }
  ]);

  const totalSoldItems = await ProductTransaction.countDocuments({ ...match, sold: true });
  const totalNotSoldItems = await ProductTransaction.countDocuments({ ...match, sold: false });

  res.status(200).json({
    totalSaleAmount: totalSaleAmount[0]?.total || 0,
    totalSoldItems,
    totalNotSoldItems
  });
};

const getBarChart = async (req, res) => {
  const { month } = req.query;
  const match = { dateOfSale: { $regex: `^\\d{4}-${month.padStart(2, '0')}` } };

  const ranges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Number.MAX_SAFE_INTEGER }
  ];

  const barChart = await Promise.all(ranges.map(async ({ range, min, max }) => {
    const count = await ProductTransaction.countDocuments({
      ...match,
      price: { $gte: min, $lte: max }
    });
    return { range, count };
  }));

  res.status(200).json(barChart);
};

const getPieChart = async (req, res) => {
  const { month } = req.query;
  const match = { dateOfSale: { $regex: `^\\d{4}-${month.padStart(2, '0')}` } };

  const pieChart = await ProductTransaction.aggregate([
    { $match: match },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);

  res.status(200).json(pieChart);
};

const getCombinedData = async (req, res) => {
  const { month } = req.query;

  const [statistics, barChart, pieChart] = await Promise.all([
    getStatistics(req, res),
    getBarChart(req, res),
    getPieChart(req, res)
  ]);

  res.status(200).json({
    statistics,
    barChart,
    pieChart
  });
};

module.exports = {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData
};
