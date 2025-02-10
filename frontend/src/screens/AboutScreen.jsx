import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaGraduationCap, FaUsers, FaChalkboardTeacher, FaCertificate, FaShieldAlt, FaLock, FaChartLine, FaRobot } from 'react-icons/fa';

const AboutScreen = () => {
  const { isDarkMode } = useTheme();

  const stats = [
    { icon: <FaGraduationCap />, value: '10K+', label: 'Students' },
    { icon: <FaUsers />, value: '50+', label: 'Partners' },
    { icon: <FaChalkboardTeacher />, value: '100+', label: 'Expert Instructors' },
    { icon: <FaCertificate />, value: '5K+', label: 'Certifications' },
  ];

  const features = [
    {
      icon: <FaShieldAlt />,
      title: 'Secure Examination System',
      description: 'Advanced encryption and blockchain technology to prevent paper leakage and maintain exam integrity.'
    },
    {
      icon: <FaLock />,
      title: 'Anti-Cheating Measures',
      description: 'AI-powered proctoring and real-time monitoring to ensure fair examination.'
    },
    {
      icon: <FaChartLine />,
      title: 'Real-time Analytics',
      description: 'Instant results and detailed analytics for better performance tracking.'
    },
    {
      icon: <FaRobot />,
      title: 'AI-Powered Assessment',
      description: 'Automated evaluation system for quick and accurate results.'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            About <span className="text-violet-600">NexusEdu</span>
          </h1>
          <p className={`text-lg max-w-3xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Revolutionizing education with secure, AI-powered examination systems.
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`text-center p-6 rounded-2xl ${
                isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
              } shadow-lg`}
            >
              <div className={`flex justify-center items-center text-3xl mb-4 ${
                isDarkMode ? 'text-violet-400' : 'text-violet-600'
              }`}>
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl ${
                isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
              } shadow-lg`}
            >
              <div className={`flex items-center mb-4`}>
                <div className={`flex justify-center items-center w-12 h-12 rounded-xl ${
                  isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'
                } ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className={`ml-4 text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
              </div>
              <p className={`ml-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-4xl mx-auto p-8 rounded-2xl ${
            isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
          } shadow-lg mb-20`}
        >
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Our Mission
          </h2>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            At NexusEdu, we're committed to revolutionizing education through technology. 
            Our platform combines AI-powered learning with blockchain verification to create 
            a secure and personalized educational experience.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutScreen; 