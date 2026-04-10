import Link from "next/link";
import AdminAuthGuard from "@/app/_components/AdminAuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 bg-slate-900 text-white">
          <div className="p-5 font-semibold text-lg border-b border-slate-700">
            DentalX <span className="text-xs font-normal text-slate-400">Admin</span>
          </div>
          <nav className="p-3 space-y-1">
            <SidebarLink href="/admin">Dashboard</SidebarLink>
            <SidebarLink href="/admin/clinics">Клиники</SidebarLink>
            <SidebarLink href="/admin/claims">Заявки</SidebarLink>
          </nav>
        </aside>
        <div className="flex-1 bg-slate-50 p-8 overflow-auto">{children}</div>
      </div>
    </AdminAuthGuard>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
    >
      {children}
    </Link>
  );
}
