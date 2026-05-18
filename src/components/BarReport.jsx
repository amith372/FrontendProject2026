import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * BarReport Component - Displays a bar chart for yearly expense trends.
 * @param {Object} props - Component props.
 * @param {Array<{month: string, amount: number}>} props.data - Chart data.
 * @returns {JSX.Element} The rendered bar chart.
 */
export default function BarReport({ data }) {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ResponsiveContainer width="99%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 30, left: 0, bottom: 45 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="month"
            interval={0}
            padding={{ left: 10, right: 10 }}
            tick={{ fontSize: 12 }}
          />

          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fill: '#f5f5f5' }} />

          <Bar
            dataKey="amount"
            fill="#2ecc71"
            name="Amount"
            barSize={30}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}