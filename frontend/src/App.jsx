function App() {
  return (
    <div className="min-h-screen bg-[#f8f5ec] flex items-center justify-center p-6">
      
      <div className="w-full max-w-md">
        
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#013d2e] mb-4 shadow-lg">
            <span className="text-[#d4af37] text-3xl font-serif font-bold">
              RB
            </span>
          </div>

          <h1 className="text-4xl font-serif font-bold text-[#013d2e] tracking-wide">
            ROYAL BREW
          </h1>

          <p className="text-gray-500 mt-2 text-sm tracking-widest uppercase">
            Café Point of Sale
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e8e1d2]">
          
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-1 text-sm">
              Sign in to access the Royal Brew system
            </p>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-[#d4af37]
              focus:border-[#d4af37] transition"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-[#d4af37]
              focus:border-[#d4af37] transition"
            />
          </div>

          {/* Login Button */}
          <button
            type="button"
            className="w-full bg-[#013d2e] text-white py-3 rounded-lg
            font-semibold tracking-wide
            hover:bg-[#02513d] transition duration-200
            shadow-md hover:shadow-lg"
          >
            SIGN IN
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Royal Brew Café Management System
          </p>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Royal Brew. All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default App