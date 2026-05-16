import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useStore from '../store/useStore';

const Analytics = () => {
  const { transactions } = useStore();

  const categoryTotals = transactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const data = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key]
  }));

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="p-4 pt-10 pb-20">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <div className="glass-card rounded-3xl p-4 h-64 mb-6">
        <h3 className="text-sm text-gray-400 mb-2">Spending by Category</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No data</div>
        )}
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex justify-between items-center bg-card border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-semibold">{item.name}</span>
            </div>
            <span className="font-bold">Rp {item.value.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
