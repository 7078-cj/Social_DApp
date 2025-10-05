import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import ContractContext from './Contracts';

function PublicRoutes() {
  const { profile } = useContext(ContractContext);

  

  return profile ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoutes;
