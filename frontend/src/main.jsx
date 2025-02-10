import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import store from './store';
import App from './App';
import './index.css';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import PrivateRoute from './components/PrivateRoute';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={true} path='/' element={<HomeScreen />} />
      <Route path='/about' element={<AboutScreen />} />
      <Route path='/contact' element={<ContactScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      
      {/* Protected Routes */}
      <Route path='' element={<PrivateRoute />}>
        {/* General Protected Routes */}
        <Route path='/profile' element={<ProfileScreen />} />
        
        {/* Admin Routes */}
        <Route path='/admin/*' element={
          <PrivateRoute allowedRoles={['admin']}>
            <ProfileScreen />
          </PrivateRoute>
        } />
        
        {/* Institute Routes */}
        <Route path='/institute/*' element={
          <PrivateRoute allowedRoles={['institute']}>
            <ProfileScreen />
          </PrivateRoute>
        } />
        
        {/* Student Routes */}
        <Route path='/student/*' element={
          <PrivateRoute allowedRoles={['student']}>
            <ProfileScreen />
          </PrivateRoute>
        } />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
