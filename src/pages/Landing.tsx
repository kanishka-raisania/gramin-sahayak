import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, ShieldCheck, Leaf } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col font-sans">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-green-100 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>

        <div className="max-w-3xl space-y-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-sm mb-4">
            <Leaf className="w-4 h-4" />
            <span>Empowering Rural India Digitally</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Gramin Sahayak</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your personal digital assistant for verified government schemes, farming advice, and quick access to essential services.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              to="/home" 
              className="group relative px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-green-700 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-lg flex items-center justify-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
            </Link>

            <a 
              href="/gramin-sahayak.apk"
              download
              className="px-8 py-4 bg-white text-gray-800 font-bold rounded-full shadow-md hover:shadow-lg border border-gray-200 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-lg flex items-center justify-center gap-2 group"
            >
              <Smartphone className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
              <span>Download APK</span>
            </a>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verified News</h3>
            <p className="text-gray-600">Get the latest updates directly from official government sources, filtering out fake news.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Farming & Wage Support</h3>
            <p className="text-gray-600">Discover schemes and rights specific to your occupation and location.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart AI Assistant</h3>
            <p className="text-gray-600">Ask questions in your regional language using text or voice to get instant help.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Gramin Sahayak. Empowering rural communities.
      </footer>
    </div>
  );
};

export default Landing;
