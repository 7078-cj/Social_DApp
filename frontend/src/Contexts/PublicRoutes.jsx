import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import ContractContext from './Contracts';

function PublicRoutes() {
  const { profile, loading } = useContext(ContractContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return profile ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoutes;
