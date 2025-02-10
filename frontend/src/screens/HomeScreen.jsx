import { useSelector } from 'react-redux';
import Hero from '../components/Hero';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import InstituteDashboard from './InstituteDashboard';

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      {userInfo ? (
        <>
          {userInfo.userType === 'admin' && <AdminDashboard />}
          {userInfo.userType === 'institute' && <InstituteDashboard />}
          {userInfo.userType === 'student' && <StudentDashboard />}
        </>
      ) : (
        <Hero />
      )}
    </div>
  );
};

export default HomeScreen;
