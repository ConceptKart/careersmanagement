"use client";

import { useState } from "react";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalSidebar } from "@/components/portal/PortalSidebar";

type Props = {
  email: string;
  roles: string[];
  fullName?: string | null;
  children: React.ReactNode;
};

export function PortalShell({ email, roles, fullName, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <PortalSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        email={email}
        roles={roles}
      />
      <div className="admin-main">
        <PortalHeader
          email={email}
          fullName={fullName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
