import React from "react";

export default function ResultDisplay({ result }) {
  const topPrediction = result?.top_prediction;
  const diseaseInfo = result?.disease_info;
  const predictions = result?.all_predictions || [];

  if (!topPrediction || !diseaseInfo) return null;

  return (
    <section className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-3xl p-8 md:p-10">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        Cotton Leaf Analysis Result
      </h2>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Detected Class</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            {topPrediction.disease}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {topPrediction.confidence_percent}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Severity</p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {diseaseInfo.severity}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white">Symptoms</h3>
          <ul className="mt-3 list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            {diseaseInfo.symptoms?.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recommended Action</h3>
          <ul className="mt-3 list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            {diseaseInfo.treatment?.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      </div>

      {predictions.length > 1 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 dark:text-white">Top Predictions</h3>
          <div className="mt-3 space-y-3">
            {predictions.map((prediction) => (
              <div
                key={prediction.disease}
                className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 px-4 py-3"
              >
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {prediction.disease}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {prediction.confidence_percent}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
