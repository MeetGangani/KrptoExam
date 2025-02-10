import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Create a separate component for the themed content
const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'
    }`}>
      <Header />
      <ToastContainer />
      <main className="overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default App;
