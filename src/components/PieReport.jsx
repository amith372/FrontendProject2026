import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Color palette for pie chart segments.
 * @type {Array<string>}
 */
const COLORS = ['#1976d2', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

/**
 * PieReport Component - Displays a pie chart for expense distribution by category.
 * Visualizes the proportion of spending across different expense categories.
 * Each segment is color-coded and labeled with the category name.
 * @param {Object} props - Component props.
 * @param {Array<{name: string, value: number}>} props.data - Chart data array with category names and amounts.
 * @returns {JSX.Element} The rendered pie chart visualization.
 */
export default function PieReport({ data }) {
  return (
    // Container div with responsive sizing for the pie chart.
    // minWidth: 0 prevents grid children overflow in flex containers.
    <div style={{ width: '100%', height: 500, minWidth: 0 }}>
      <ResponsiveContainer>
        <PieChart>
          {/* Pie component with 70% outer radius to accommodate labels */}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            label
          >
            {/* Render color-coded cells for each data entry */}
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {/* Interactive tooltip showing values on hover */}
          <Tooltip />

          {/* Legend displayed below the chart for category reference */}
          <Legend verticalAlign="bottom" height={36} />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}