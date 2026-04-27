import React from "react";
import { Navigate, useLocation } from "react-router";
import { ReactNode } from "react";
import { isAuthenticated } from "../utils/auth";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
}
