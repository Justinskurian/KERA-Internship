import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [loginForm, setLoginform] = useState({
    email: "",
    password: "",
  });
  const [showCredentials, setShowCredentials] = useState(false);

  const change1 = (e) => {
    setLoginform({ ...loginForm, [e.target.name]: e.target.value });
  };

  const click1 = () => {
    axios
      .post("http://localhost:3000/login/login", loginForm)
      .then((res) => {
        alert(res.data.message);
        if (res.data.token) {
          sessionStorage.setItem("token", res.data.token);
          if (res.data.role === "mentor") {
            sessionStorage.setItem("mentorId", res.data.mentorId);
            navigate("/home");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Invalid Credentials");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex flex-col">
      {/* Main Section */}
      <div className="flex flex-col md:flex-row items-center justify-center flex-1 p-6 gap-8">
        {/* Right: Form */}
        <div className="w-full md:w-1/2 max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Login</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please enter your credentials to access the dashboard.
          </p>

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={change1}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={change1}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          <button
            onClick={click1}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-xl transition mb-4"
          >
            Login
          </button>

          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="w-full border border-orange-500 text-orange-600 hover:bg-blue-50 py-2 rounded-xl font-medium transition"
          >
            Need login credentials?
          </button>

          {/* Demo Credentials */}
          {/* {showCredentials && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg text-sm text-gray-700 space-y-2">
              <p>
                <strong>Login Email</strong> kera123@gmail.com <br></br>
                <strong>Password</strong> kera@123
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Login;
