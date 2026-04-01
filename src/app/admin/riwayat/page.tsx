import { getPeriodeList, getAllGelombangList, getSantriList } from "@/app/actions"
import RiwayatClient from "@/components/riwayat-client"

export default async function PeriodePage({ searchParams }: { searchParams: Promise<{ p?: string, g?: string }> }) {
  const sp = await searchParams
  const pId = sp.p ? Number(sp.p) : undefined
  const gId = sp.g ? Number(sp.g) : undefined

  const periodes = await getPeriodeList()
  const activePId = pId || (periodes.length > 0 ? periodes[0].id : undefined)
  
  const gelombangList = activePId ? await getAllGelombangList(activePId) : []
  const santriList = await getSantriList(gId, activePId)

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-blue-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Riwayat Berkas Alumni</h1>
          <p className="text-neutral-500 mt-1">Cari dan tinjau arsip para santri di periode-periode terdahulu (Mode Hanya Baca).</p>
        </div>
      </div>
      
      <RiwayatClient 
        periodes={periodes}
        gelombangList={gelombangList}
        santriList={santriList}
        activePId={activePId}
        activeGId={gId}
      />
    </div>
  )
}
