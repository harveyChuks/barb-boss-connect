
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";

interface CalendarAnnualViewProps {
  appointments: Array<{
    id: string;
    appointment_date: string;
    status: string;
    customer_name: string;
  }>;
  onDateSelect: (date: Date) => void;
}

const CalendarAnnualView = ({ appointments, onDateSelect }: CalendarAnnualViewProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = eachMonthOfInterval({
    start: startOfYear(new Date(selectedYear, 0, 1)),
    end: endOfYear(new Date(selectedYear, 0, 1))
  });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-gray-500';
      default: return 'bg-slate-500';
    }
  };

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - getDay(monthStart));
    
    const days = eachDayOfInterval({
      start: startDate,
      end: new Date(startDate.getTime() + 41 * 24 * 60 * 60 * 1000) // 6 weeks
    });

    return (
      <Card key={month.toString()} className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-center text-sm">
            {format(month, 'MMMM')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center text-slate-400 font-medium p-1">
                {day}
              </div>
            ))}
            {days.map(day => {
              const dayAppointments = getAppointmentsForDate(day);
              const isCurrentMonth = isSameMonth(day, month);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toString()}
                  onClick={() => onDateSelect(day)}
                  className={`
                    relative h-8 p-1 text-center cursor-pointer rounded transition-colors
                    ${isCurrentMonth ? 'text-white hover:bg-slate-700' : 'text-slate-600'}
                    ${isCurrentDay ? 'bg-amber-500 text-black font-bold' : ''}
                  `}
                >
                  <span className="text-xs">{format(day, 'd')}</span>
                  {dayAppointments.length > 0 && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1">
                      {dayAppointments.slice(0, 3).map((apt, idx) => (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${getStatusColor(apt.status)}`}
                        />
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="w-1 h-1 rounded-full bg-white" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          Annual View - {selectedYear}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedYear(prev => prev - 1)}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedYear(new Date().getFullYear())}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedYear(prev => prev + 1)}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map(renderMonth)}
      </div>

      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-slate-300">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-slate-300">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-300">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-300">Cancelled</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarAnnualView;
