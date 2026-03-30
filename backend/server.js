const express = require('express');
const cors = require('cors');
const MLR = require('ml-regression-multivariate-linear');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Dummy pre-trained regression data for total cost savings ($Y$)
// X: [waste_amount (kg), energy_savings (kWh), logistics_reduction ($)]
// y: [total_financial_savings ($)]
const xTrain = [
  [100, 50, 20],
  [200, 100, 40],
  [500, 250, 100],
  [1000, 500, 200]
];
const yTrain = [
  [150],
  [300],
  [750],
  [1500]
];
// Basic model initialization
let regressionModel = new MLR(xTrain, yTrain);

const COMPANY_ID = 1;

// POST /api/waste : Smart Bin data ingestion
app.post('/api/waste', (req, res) => {
  const { waste_type, amount_kg, energy_savings_kwh, logistics_savings } = req.body;
  if (!waste_type || amount_kg === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO waste_logs (company_id, waste_type, amount_kg, energy_savings_kwh, logistics_savings) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [COMPANY_ID, waste_type, amount_kg, energy_savings_kwh || 0, logistics_savings || 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// GET /api/dashboard : Metrics for UI
app.get('/api/dashboard', (req, res) => {
  const query = `
    SELECT 
      SUM(amount_kg) as total_waste,
      SUM(energy_savings_kwh) as total_energy,
      SUM(logistics_savings) as total_logistics,
      waste_type,
      COUNT(*) as throw_count
    FROM waste_logs 
    WHERE company_id = ?
    GROUP BY waste_type
  `;
  
  db.all(query, [COMPANY_ID], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Aggregate overall
    let totals = { x1: 0, x2: 0, x3: 0 };
    rows.forEach(r => {
      totals.x1 += r.total_waste || 0;
      totals.x2 += r.total_energy || 0;
      totals.x3 += r.total_logistics || 0;
    });

    // Predict current savings based on all cumulative data
    let totalSavings = 0;
    if (totals.x1 > 0 || totals.x2 > 0 || totals.x3 > 0) {
      const pred = regressionModel.predict([totals.x1, totals.x2, totals.x3]);
      totalSavings = pred[0];
    }

    res.json({
      metrics: {
        total_waste_kg: totals.x1,
        total_energy_kwh: totals.x2,
        total_logistics_saved: totals.x3,
        total_financial_savings: totalSavings
      },
      breakdown: rows
    });
  });
});

// POST /api/regression/predict : Simulate inputs
app.post('/api/regression/predict', (req, res) => {
  const { x1, x2, x3 } = req.body;
  const prediction = regressionModel.predict([Number(x1)||0, Number(x2)||0, Number(x3)||0]);
  res.json({ predicted_savings: prediction[0] });
});

// POST /api/roi : Calculate ROI months
app.post('/api/roi', (req, res) => {
  const { investment, monthly_x1, monthly_x2, monthly_x3 } = req.body;
  const prediction = regressionModel.predict([Number(monthly_x1)||0, Number(monthly_x2)||0, Number(monthly_x3)||0]);
  const monthlySavings = prediction[0];
  
  if (monthlySavings <= 0) {
    return res.json({ roi_months: Infinity, monthly_savings: 0 });
  }

  const roi = (Number(investment) || 0) / monthlySavings;
  res.json({ 
    roi_months: parseFloat(roi.toFixed(1)), 
    monthly_savings: parseFloat(monthlySavings.toFixed(2)) 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Backend running on http://localhost:\${PORT}\`);
});
