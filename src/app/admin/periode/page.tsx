import { getPeriodeList } from "@/app/actions"
import PeriodeClient from "@/components/periode-client"

export default async function PeriodePage() {
  const list = await getPeriodeList()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Manajemen Periode</h1>
          <p className="text-neutral-500 mt-1">Atur tahun ajaran aktif atau buat tahun ajaran baru bila pergantian tahun.</p>
        </div>
      </div>
      
      <PeriodeClient initialData={list} />
    </div>
  )
}
