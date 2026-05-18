import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import EditExpenseModal from '../components/EditExpenseModal';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  const { transactions } = useStore();

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Start on Monday

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-xs text-gray-400 py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Calculate total expense for this day
        const dayString = format(day, 'yyyy-MM-dd');
        const dayTransactions = transactions.filter(t => t.date.startsWith(dayString) && t.category !== 'System');
        const dayTotal = dayTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        // Determine background color based on spending intensity
        let bgClass = "bg-transparent";
        if (dayTotal > 0) {
          if (dayTotal < 50000) bgClass = "bg-expense/20 text-expense font-bold";
          else if (dayTotal < 150000) bgClass = "bg-expense/50 text-white font-bold";
          else bgClass = "bg-expense text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]";
        }

        days.push(
          <div
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
            className={`p-1 flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95
              ${!isSameMonth(day, monthStart) ? 'text-gray-600' : ''}
              ${isSameDay(day, selectedDate) ? 'ring-2 ring-primary rounded-xl' : ''}
            `}
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${bgClass} ${dayTotal === 0 && isSameDay(day, new Date()) ? 'bg-gray-800' : ''}`}>
              {formattedDate}
            </div>
            {dayTotal > 0 && (
              <span className="text-[9px] mt-1 text-gray-400 truncate w-full text-center">
                {(dayTotal / 1000).toFixed(0)}k
              </span>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-6">{rows}</div>;
  };

  const renderSelectedDayExpenses = () => {
    const dayString = format(selectedDate, 'yyyy-MM-dd');
    const dayTransactions = transactions.filter(t => t.date.startsWith(dayString) && t.category !== 'System');
    const dayTotal = dayTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    return (
      <div>
        <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
          <h3 className="text-lg font-bold">
            {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'dd MMM yyyy')}
          </h3>
          <span className="text-sm font-semibold text-expense">
            Total: Rp {dayTotal.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="space-y-3">
          {dayTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No expenses on this day.</p>
          ) : (
            dayTransactions.map(t => (
              <div 
                key={t.id} 
                onClick={() => {
                  setSelectedExpense(t);
                  setIsEditOpen(true);
                }}
                className="flex justify-between items-center bg-card border rounded-2xl p-4 cursor-pointer hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                    {t.category === 'Food' ? '🍔' : t.category === 'Coffee' ? '☕' : '💸'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{t.category}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 font-medium">
                        {t.wallet || 'Cash'}
                      </span>
                    </div>
                    {t.note && <p className="text-xs text-gray-400 mt-0.5">{t.note}</p>}
                  </div>
                </div>
                <p className="font-bold text-expense">-Rp {t.amount.toLocaleString('id-ID')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 pt-10 pb-20">
      <div className="glass-card rounded-3xl p-5 mb-6">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      
      {renderSelectedDayExpenses()}

      {/* Edit Expense Modal Integration */}
      <EditExpenseModal 
        isOpen={isEditOpen} 
        onClose={() => {
          setIsEditOpen(false);
          setSelectedExpense(null);
        }} 
        transaction={selectedExpense} 
      />
    </div>
  );
};

export default Calendar;
