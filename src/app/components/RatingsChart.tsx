// components/RatingsChart.tsx
import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Button } from "@/components/ui/button"; // Ensure the path is correct
import ratingsData from '../../../ratings.json'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title);

interface RatingsChartProps {
  extraversion: number;
  openness: number;
  conscientiousness: number;
  agreeableness: number;
  neuroticism: number;
  onBack: () => void;
}

const RatingsChart = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Define your data object
  const chartRatingsData = {
    ratings: {
      Extraversion: ratingsData.ratings.Extraversion,
      Openness: ratingsData.ratings.Openness,
      Conscientiousness: ratingsData.ratings.Conscientiousness,
      Agreeableness: ratingsData.ratings.Agreeableness,
      Neuroticism: ratingsData.ratings.Neuroticism,
    },
  };

  useEffect(() => {
    const prepareChartData = () => {
      try {
        setChartData({
          labels: Object.keys(chartRatingsData.ratings),
          datasets: [
            {
              label: 'Personality Ratings',
              data: Object.values(chartRatingsData.ratings),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            },
          ],
        });

        setError('');
      } catch (err) {
        setError('Failed to prepare chart data.');
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };

    prepareChartData();
  }, [chartRatingsData]);

  return (
    <div className="chart-section p-4">
      <Button
        className="mb-4 text-lg py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-700"
      >
        Back to Chat
      </Button>
      <h2 className="text-xl font-bold mb-4">Personality Trait Ratings</h2>
      {isLoading && <p>Loading ratings...</p>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {chartData && (
        <div className="chart-container">
          <Radar
            data={chartData}
            options={{
              scales: {
                r: {
                  beginAtZero: true,
                  max: 10,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Personality Trait Ratings',
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RatingsChart;
