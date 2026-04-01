"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { MainTable } from "./main-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { Archive, FileDown } from "lucide-react"
import { toast } from "sonner"
import * as xlsx from "xlsx"
import { COLUMNS } from "./main-table"

export default function RiwayatClient({ 
  periodes, 
  gelombangList, 
  santriList, 
  activePId, 
  activeGId 
}: { 
  periodes: any[], 
  gelombangList: any[], 
  santriList: any[],
  activePId?: number,
  activeGId?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activePeriodeName = periodes.find(p => p.id === activePId)?.nama_periode || ""
  const activeGelName = gelombangList.find(g => g.id === activeGId)?.nama_gelombang || "all"

  const handleFilterPeriode = (val: string) => {
    if (!val) return
    const matchedP = periodes.find(p => p.nama_periode === val)
    const params = new URLSearchParams(searchParams)
    if (matchedP) params.set("p", matchedP.id.toString())
    params.delete("g") // Reset gelombang
    router.push(`/admin/riwayat?${params.toString()}`, { scroll: false })
  }

  const handleFilterGelombang = (val: string) => {
    if (!val) return
    const params = new URLSearchParams(searchParams)
    if (val === "all") {
      params.delete("g")
    } else {
      const matchedG = gelombangList.find(g => g.nama_gelombang === val)
      if (matchedG) params.set("g", matchedG.id.toString())
    }
    router.push(`/admin/riwayat?${params.toString()}`, { scroll: false })
  }

  const handleExport = () => {
    if (santriList.length === 0) return toast.error("Tidak ada data untuk diexport")
    
    const exportPeriodeName = activePeriodeName || "Periode"
    const exportGelName = activeGelName === "all" ? "Semua_Gelombang" : activeGelName

    const exportData = santriList.map((s, idx) => {
      const row: any = {
        "No": s.no_urut || idx + 1,
        "Nama Lengkap": s.nama,
        "Gelombang": s.gelombang?.nama_gelombang || "-",
      }
      COLUMNS.forEach(col => {
        row[col.title] = s.pemberkasan?.[col.key] ? "v" : "" 
      })
      return row
    })

    const worksheet = xlsx.utils.json_to_sheet(exportData)
    const colWidths = [
      { wch: 5 }, { wch: 35 }, { wch: 15 },
      ...COLUMNS.map(c => ({ wch: Math.max(10, c.title.length) }))
    ]
    worksheet['!cols'] = colWidths

    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Riwayat")

    const safePName = exportPeriodeName.replace(/\s+/g, '_').replace(/\//g, '-')
    const safeGName = exportGelName.replace(/\s+/g, '_')
    xlsx.writeFile(workbook, `Riwayat_${safePName}_${safeGName}.xlsx`)
    toast.success("Berhasil mengekspor Laporan Riwayat!")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <div className="w-full sm:w-64">
            <Select value={activePeriodeName} onValueChange={handleFilterPeriode}>
              <SelectTrigger className="w-full font-medium h-11 border-blue-200 bg-blue-50 text-blue-900">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                {periodes.map(p => (
                  <SelectItem key={p.id} value={p.nama_periode}>
                    Periode {p.nama_periode} {p.is_active ? "(Aktif)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-64">
            <Select value={activeGelName} onValueChange={handleFilterGelombang}>
              <SelectTrigger className="w-full font-medium h-11 hover:bg-neutral-50">
                <SelectValue placeholder="Semua Gelombang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Gelombang</SelectItem>
                {gelombangList.map(g => (
                  <SelectItem key={g.id} value={g.nama_gelombang}>{g.nama_gelombang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleExport} variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:text-blue-800">
          <FileDown className="mr-2 h-4 w-4" /> Unduh PDF/Excel
        </Button>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 bg-neutral-800/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-bl-xl text-xs font-bold uppercase tracking-wider z-40 flex items-center shadow-lg">
          <Archive className="w-3 h-3 mr-2" /> Mode Baca
        </div>
        {santriList.length > 0 ? (
          <MainTable santriList={santriList} readOnly={true} />
        ) : (
          <div className="py-24 text-center text-neutral-400 flex flex-col items-center">
            <Archive className="w-16 h-16 text-neutral-200 mb-4 animate-pulse" />
            <p className="text-lg font-medium text-neutral-500">Arsip Kosong</p>
            <p className="text-sm">Tidak ada rekaman data santri di pencarian ini.</p>
          </div>
        )}
      </div>
    </div>
  )
}
