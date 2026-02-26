const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Fertilizer recommendation logic
const getFertilizerRecommendation = (n, p, k, cropType = 'general') => {
  const recommendations = [];

  // NPK analysis
  if (n < 20) {
    recommendations.push({
      type: 'Nitrogen',
      severity: 'high',
      message: 'Nitrogen levels are critically low. Apply nitrogen-rich fertilizers.',
      suggestions: ['Urea (46-0-0)', 'Ammonium Nitrate (34-0-0)', 'Blood Meal'],
    });
  } else if (n < 40) {
    recommendations.push({
      type: 'Nitrogen',
      severity: 'medium',
      message: 'Nitrogen levels are moderately low.',
      suggestions: ['Compost', 'Manure', 'Fish Emulsion'],
    });
  }

  if (p < 15) {
    recommendations.push({
      type: 'Phosphorus',
      severity: 'high',
      message: 'Phosphorus levels are low. Apply phosphorus-rich fertilizers.',
      suggestions: ['Rock Phosphate', 'Bone Meal', 'Superphosphate (0-20-0)'],
    });
  } else if (p < 30) {
    recommendations.push({
      type: 'Phosphorus',
      severity: 'medium',
      message: 'Phosphorus levels are moderately low.',
      suggestions: ['Compost', 'Manure'],
    });
  }

  if (k < 20) {
    recommendations.push({
      type: 'Potassium',
      severity: 'high',
      message: 'Potassium levels are low. Apply potassium-rich fertilizers.',
      suggestions: ['Potassium Sulfate (0-0-50)', 'Muriate of Potash', 'Wood Ash'],
    });
  } else if (k < 40) {
    recommendations.push({
      type: 'Potassium',
      severity: 'medium',
      message: 'Potassium levels are moderately low.',
      suggestions: ['Kelp Meal', 'Greensand'],
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'General',
      severity: 'low',
      message: 'Soil nutrient levels are adequate. Maintain current fertilization practices.',
      suggestions: ['Regular composting', 'Organic mulch', 'Crop rotation'],
    });
  }

  return recommendations;
};

// Get fertilizer recommendation
router.post('/recommend', authMiddleware, async (req, res) => {
  try {
    const { nitrogen, phosphorus, potassium, cropType } = req.body;

    if (nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
      return res.status(400).json({
        success: false,
        message: 'N, P, K values are required',
      });
    }

    const n = parseFloat(nitrogen);
    const p = parseFloat(phosphorus);
    const k = parseFloat(potassium);

    const recommendations = getFertilizerRecommendation(n, p, k, cropType);

    res.json({
      success: true,
      soilValues: { nitrogen: n, phosphorus: p, potassium: k },
      recommendations,
    });
  } catch (error) {
    console.error('Fertilizer recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendation',
    });
  }
});

module.exports = router;
