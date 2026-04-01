"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Archive, FolderOpen, Menu, X } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when clicking a link
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const menuItems = [
    { name: 'Dashboard Utama', href: '/admin', icon: LayoutDashboard },
    { name: 'Manajemen Periode', href: '/admin/periode', icon: Calendar },
    { name: 'Riwayat Santri', href: '/admin/riwayat', icon: Archive },
  ]

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop and Mobile) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 flex flex-col shadow-sm z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
          <div className="flex items-center">
            <FolderOpen className="w-6 h-6 text-emerald-600 mr-3" />
            <span className="text-lg font-bold text-neutral-900 tracking-tight">Arsip Digital</span>
          </div>
          <button className="p-1 md:hidden text-neutral-600 hover:bg-neutral-100 rounded" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-emerald-900 bg-emerald-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-neutral-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex flex-shrink-0 items-center justify-between px-4 border-b border-neutral-200 bg-white z-20 shadow-sm relative">
          <div className="flex items-center truncate">
            <FolderOpen className="w-6 h-6 text-emerald-600 mr-2 flex-shrink-0" />
            <span className="font-bold text-neutral-900 truncate">Arsip Digital</span>
          </div>
          <button 
            className="p-2 -mr-2 text-neutral-600 hover:bg-neutral-100 rounded flex-shrink-0 ml-2" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto h-full relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
