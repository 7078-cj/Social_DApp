import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import ContractContext from './Contracts';

function PrivateRoutes() {
  let { profile, loading } = useContext(ContractContext);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return profile ? <Outlet /> : <Navigate to="/register" />;
}

export default PrivateRoutes;
