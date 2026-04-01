import Link from 'next/link'
import { LayoutDashboard, Calendar, Archive, FolderOpen, Menu } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <FolderOpen className="w-6 h-6 text-emerald-600 mr-3" />
          <span className="text-lg font-bold text-neutral-900 tracking-tight">Arsip Digital</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Utama
          </Link>
          <Link href="/admin/periode" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
            <Calendar className="w-4 h-4" />
            Manajemen Periode
          </Link>
          <Link href="/admin/riwayat" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
            <Archive className="w-4 h-4" />
            Riwayat Santri
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-neutral-200 bg-white z-20 shadow-sm">
          <div className="flex items-center">
            <FolderOpen className="w-6 h-6 text-emerald-600 mr-2" />
            <span className="font-bold text-neutral-900">Arsip Digital</span>
          </div>
          <button className="p-2 -mr-2 text-neutral-600"><Menu className="w-6 h-6" /></button>
        </header>
        
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
