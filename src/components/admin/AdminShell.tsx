"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

type Props = {
  email: string;
  roles: string[];
  children: React.ReactNode;
};

export function AdminShell({ email, roles, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        email={email}
        roles={roles}
      />
      <div className="admin-main">
        <Topbar
          email={email}
          roles={roles}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
