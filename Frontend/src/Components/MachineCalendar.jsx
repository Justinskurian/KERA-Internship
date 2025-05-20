import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  format,
  parseISO,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MachineCalendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fetch schedule data from backend API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(
          "https://production-scheduler-backend-7qgb.onrender.com/scheduling/schedule"
        );
        setSchedules(res.data);
      } catch (err) {
        console.error("Failed to fetch schedules", err);
      }
    };

    fetchSchedules();
  }, []);

  // Update days in the currently selected month
  useEffect(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    setDaysInMonth(days);
  }, [selectedDate]);

  // Filter schedules that match a specific date
  const getSchedulesForDate = (date) => {
    return schedules
      .filter((s) => isSameDay(parseISO(s.scheduledStart), date))
      .sort((a, b) => a.stageName.localeCompare(b.stageName));
  };

  // Group schedules first by stage, then by machine
  const groupByStageThenMachine = (items) => {
    const result = {};
    items.forEach((item) => {
      const stage = item.stageName;
      const machine = item.machineName;
      if (!result[stage]) result[stage] = {};
      if (!result[stage][machine]) result[stage][machine] = [];
      result[stage][machine].push(item);
    });
    return result;
  };

  // Set styles for each calendar day
  const getDayClass = (date) => {
    const isScheduled = getSchedulesForDate(date).length > 0;
    const isSelected = isSameDay(date, selectedDate);
    return `
      cursor-pointer p-2 rounded-md border text-center text-sm
      ${isSelected ? "bg-orange-600 text-white font-bold" : ""}
      ${isScheduled && !isSelected ? "bg-orange-100 border-orange-600 text-orange-700" : ""}
    `;
  };

  // Handle month navigation
  const goToPrevMonth = () => {
    setSelectedDate((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate((prev) => addMonths(prev, 1));
  };

  const groupedData = groupByStageThenMachine(getSchedulesForDate(selectedDate));

  return (
    <div className="p-4 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-center text-orange-700">
         Machine Schedule Calendar
      </h1>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPrevMonth}
          className="px-3 py-1 border border-orange-600 text-orange-600 rounded hover:bg-orange-100"
        >
          ← Prev
        </button>
        <h2 className="text-xl font-semibold text-orange-700">
          {format(selectedDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1 border border-orange-600 text-orange-600 rounded hover:bg-orange-100"
        >
          Next →
        </button>
      </div>

      {/* Calendar View */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Weekdays Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500">
          {weekdays.map((day) => (
            <div key={day} className="font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Days of Month */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day) => (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={getDayClass(day)}
            >
              {format(day, "d")}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Details for Selected Date */}
      <div className="bg-white p-4 rounded-md shadow-md overflow-auto bg-gray-100">
        <h2 className="text-lg font-semibold mb-3 text-orange-700">
          {format(selectedDate, "PPP")} — Machine Schedules
        </h2>

        {Object.keys(groupedData).length === 0 ? (
          <p className="text-gray-500 italic">No schedules for this day.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedData).map(([stage, machines]) => (
              <div key={stage} className="rounded-md p-3 bg-white">
                <h3 className="text-md font-bold text-orange-600 mb-2">{stage}</h3>
                {Object.entries(machines).map(([machineName, orders]) => (
                  <div key={machineName} className="mb-3">
                    <p className="text-sm font-semibold text-gray-800">{machineName}</p>
                    <ul className="ml-2 text-sm text-gray-600 list-disc">
                      {orders.map((order, idx) => (
                        <li key={idx} className="mt-1">
                          Order #{order.orderNumber} —{" "}
                          {new Date(order.scheduledStart).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          })}{" "}
                          to{" "}
                          {new Date(order.scheduledEnd).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineCalendar;
