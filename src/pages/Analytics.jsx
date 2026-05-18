import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useStore from '../store/useStore';
import { formatMoney } from '../utils/format';

const Analytics = () => {
  const { transactions, settings } = useStore();
  const hideBalance = settings.hideBalance;

  const validTransactions = transactions.filter(t => t.category !== 'System');

  const categoryTotals = validTransactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const data = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key]
  }));

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="p-4 pt-10 pb-20">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <div className="bg-card rounded-2xl p-6 border border-gray-800 mb-6">
        <h3 className="text-lg font-bold mb-4">Total Spending</h3>
        <p className="text-3xl font-extrabold text-expense">Rp {formatMoney(totalSpending, hideBalance)}</p>
      </div>

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
                formatter={(value) => `Rp ${formatMoney(value, hideBalance)}`}
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
          <div key={item.name} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">Rp {formatMoney(item.value, hideBalance)}</p>
              <p className="text-[10px] text-gray-500">{((item.value / totalSpending) * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
