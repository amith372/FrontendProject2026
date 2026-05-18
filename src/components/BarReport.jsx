import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * BarReport Component - Displays a bar chart for yearly expense trends.
 * Visualizes total expenses for each month of the year on a bar chart.
 * Provides a clear overview of spending patterns and seasonal trends.
 * @param {Object} props - Component props.
 * @param {Array<{month: string, amount: number}>} props.data - Chart data with month labels and amounts.
 * @returns {JSX.Element} The rendered bar chart visualization.
 */
export default function BarReport({ data }) {
  return (
    // Container div with fixed height for the bar chart.
    <div style={{ width: '100%', height: '500px' }}>
      <ResponsiveContainer width="99%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 30, left: 0, bottom: 45 }}
        >
          {/* Grid background with horizontal dashed lines only */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          {/* X-Axis displaying month labels */}
          <XAxis
            dataKey="month"
            /* interval={0} forces every label to be shown for consistent spacing */
            interval={0}
            /* padding adds breathing room at the beginning and end of the axis */
            padding={{ left: 10, right: 10 }}
            tick={{ fontSize: 12 }}
          />

          {/* Y-Axis displaying amount values */}
          <YAxis tick={{ fontSize: 12 }} />

          {/* Interactive tooltip showing values on hover */}
          <Tooltip cursor={{ fill: '#f5f5f5' }} />

          {/* Bar representation of monthly amounts */}
          <Bar
            dataKey="amount"
            fill="#2ecc71"
            name="Amount"
            /* Fixed bar size maintains consistent appearance across data variations */
            barSize={30}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}