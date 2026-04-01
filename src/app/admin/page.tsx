import DashboardClient from "@/components/dashboard-client"
import { getGelombangList, getSantriList, getActivePeriode } from "@/app/actions"

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ gelombangId?: string }>
}) {
  const params = await searchParams
  const activeGelombangId = params.gelombangId ? Number(params.gelombangId) : undefined
  
  const [gelombangList, santriList, activePeriode] = await Promise.all([
    getGelombangList(),
    getSantriList(activeGelombangId),
    getActivePeriode()
  ])

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-emerald-600 text-white rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pencatatan Berkas</h1>
          <p className="mt-1 text-emerald-100">Kelola dan centang kelengkapan dokumen asrama santri baru secara live.</p>
        </div>
        <div className="mt-4 sm:mt-0 px-4 py-2 bg-emerald-700/80 rounded-lg text-sm font-semibold border border-emerald-500 shadow-inner flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Periode Aktif: {activePeriode?.nama_periode || "Belum Diatur"}
        </div>
      </div>

      <DashboardClient 
        initialGelombangList={gelombangList} 
        initialSantriList={santriList} 
        activeGelombangId={activeGelombangId}
      />
    </div>
  )
}
