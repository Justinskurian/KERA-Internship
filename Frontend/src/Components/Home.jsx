import React from "react";

const Home = ({ child }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="group/sidebar flex flex-col shrink-0 lg:w-[300px] w-[250px] fixed z-40 inset-y-0 left-0 bg-white shadow-lg rounded-r-2xl">
        {/* User Profile Section */}
        <div className="flex flex-col items-center justify-center px-8 py-6 bg-gray-100 rounded-t-2xl">
          <div className="w-12 h-12 bg-orange-600 text-white font-bold flex items-center justify-center rounded-full mb-3">
            OS
          </div>

          <a
            href="#"
            className="text-lg font-semibold text-gray-700 hover:text-orange-600 transition-colors"
          >
            OrderSync
          </a>
          <span className="text-sm text-gray-500">
            Production Order Manager
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="relative my-5">
          <ul className="flex flex-col w-full font-medium">
            <li className="my-2">
              <a
                href="/"
                className="flex items-center px-6 py-3 text-lg text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
              >
                Production Orders
              </a>
            </li>

            <li className="my-2">
              <a
                href="/assign"
                className="flex items-center px-6 py-3 text-lg text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
              >
                Assign Machines
              </a>
            </li>

            <li className="my-2">
              <a
                href="/details"
                className="flex items-center px-6 py-3 text-lg text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
              >
                Order Details
              </a>
            </li>
            <li className="my-2">
              <a
                href="/calender"
                className="flex items-center px-6 py-3 text-lg text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
              >
                Calender
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex justify-center min-h-screen ml-[250px] lg:ml-[300px] p-8">
        {child}
      </div>
    </div>
  );
};

export default Home;
