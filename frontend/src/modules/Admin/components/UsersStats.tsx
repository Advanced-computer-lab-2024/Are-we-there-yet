import { useEffect, useState } from "react";
import { Users, TrendingUp, Calendar } from "lucide-react";
import _ from "lodash";
import axiosInstance from "@/modules/shared/services/axiosInstance";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const UsersStats = () => {
  const currentYear = new Date().getFullYear();
  const [totalUsers, setTotalUsers] = useState<number>();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [newUsersByMonth, setNewUsersByMonth] = useState<number>();
  const [error, setError] = useState<string>();

  const fetchNewUsersByMonth = (month: number, year: number) => {
    setNewUsersByMonth(undefined);
    axiosInstance
      .get(`/users/howManyUsersByMonth?month=${month}&year=${year}`)
      .then(
        (response) => {
          setNewUsersByMonth(response.data.data);
        },
        (error) => {
          setError(error.response.data.message);
        },
      );
  };

  const fetchTotalUsers = () => {
    axiosInstance
      .get("/users/howManyUsers")
      .then((response) => {
        setTotalUsers(response.data.data);
      })
      .catch((error) => {
        setError(error.response.data.message);
      });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    fetchNewUsersByMonth(month, selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    fetchNewUsersByMonth(selectedMonth, year);
  };

  useEffect(() => {
    fetchNewUsersByMonth(selectedMonth, selectedYear);
    fetchTotalUsers();
  }, []);

  if (error) {
    return (
      <div className="mx-4 rounded-lg bg-secondary-light_grey p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-red-500">{error}</div>
          <button
            onClick={() => {
              setError("");
              fetchNewUsersByMonth(selectedMonth, selectedYear);
              fetchTotalUsers();
            }}
            className="mt-4 rounded bg-primary-blue px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (totalUsers === undefined || newUsersByMonth === undefined) {
    return (
      <div className="flex justify-center mx-4 rounded-lg bg-secondary-light_grey p-6">
        <div className="max-w-4xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-4 rounded-lg bg-secondary-light_grey p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-accent-dark-blue">
          User Statistics
        </h1>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Total Users Card */}
          <div className="rounded-lg border border-primary-green bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center">
              <Users className="mr-4 text-primary-blue" size={40} />
              <h2 className="text-xl font-semibold text-accent-dark-blue">
                Total Users
              </h2>
            </div>
            <div className="text-4xl font-bold text-primary-green">
              {totalUsers.toLocaleString()}
            </div>
          </div>

          {/* New Users Card */}
          <div className="rounded-lg border border-primary-blue bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center">
              <TrendingUp className="mr-4 text-accent-gold" size={40} />
              <h2 className="text-xl font-semibold text-accent-dark-blue">
                New Users
              </h2>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-blue">
                {newUsersByMonth.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2" />
                {MONTHS[selectedMonth - 1]} {selectedYear}
              </div>
            </div>
          </div>
        </div>

        {/* Month and Year Selectors */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="month-select"
              className="mb-2 block text-sm font-medium text-accent-dark-blue"
            >
              Select Month
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full rounded border bg-white p-2 text-accent-dark-blue"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="year-select"
              className="mb-2 block text-sm font-medium text-accent-dark-blue"
            >
              Select Year
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full rounded border bg-white p-2 text-accent-dark-blue"
            >
              {_.range(2024, currentYear + 1).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersStats;
