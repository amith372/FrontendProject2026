import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#1976d2', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

/**
 * PieReport Component.
 * Displays a pie chart representing expense distribution by category.
 * @param {Object} props - The component props.
 * @param {Array} props.data - The data array containing category totals.
 * @returns {JSX.Element} The rendered pie chart.
 */
export default function PieReport({ data }) {
    return (
        // Added minWidth: 0 to prevent grid overflow, ensuring it stays responsive
        <div style={{ width: '100%', height: 500, minWidth: 0 }}>
            <ResponsiveContainer>
                <PieChart>

                    {/* Changed outerRadius from a fixed 100 to "70%" to leave room for labels! */}
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>

                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />

                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}