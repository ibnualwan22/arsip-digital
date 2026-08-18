"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { deleteSantriByGelombang } from "@/app/actions"
import { MainTable, COLUMNS } from "./main-table"
import { StatCards } from "./stat-cards"
import { Button } from "./ui/button"
import { ImportModal } from "./import-modal"
import { AddManualModal } from "./add-manual-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { FileDown, FileUp, PlusCircle, Trash2 } from "lucide-react"
import * as xlsx from "xlsx"
import { toast } from "sonner"

type DashboardClientProps = {
  initialGelombangList: any[]
  initialSantriList: any[]
  activeGelombangId?: number
}

export default function DashboardClient({
  initialGelombangList,
  initialSantriList,
  activeGelombangId
}: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [importModalOpen, setImportModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPendingDelete, startTransition] = useTransition()

  const activeGelombangName = initialGelombangList.find(
    g => g.id === activeGelombangId
  )?.nama_gelombang

  const handleFilterGelombang = (val: string | null) => {
    if (!val) return
    const params = new URLSearchParams(searchParams)
    if (val === "all") {
      params.delete("gelombangId")
    } else {
      const selectedId = initialGelombangList.find(g => g.nama_gelombang === val)?.id
      if (selectedId) params.set("gelombangId", selectedId.toString())
    }
    router.push(`/admin?${params.toString()}`, { scroll: false })
  }

  // Calculate stable number first based on index + 1 if no_urut doesn't exist
  const santriWithStableIndex = initialSantriList.map((s, idx) => ({
    ...s,
    stable_no_urut: s.no_urut > 0 ? s.no_urut : (idx + 1)
  }))

  // Filter List (Pencarian Nama)
  const filteredSantri = santriWithStableIndex
    .filter(s =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => { // Sort resigned to bottom but maintain sequence
      if (a.is_resigned === b.is_resigned) return a.stable_no_urut - b.stable_no_urut
      return a.is_resigned ? 1 : -1
    })

  const handleExport = () => {
    if (filteredSantri.length === 0) return toast.error("Tidak ada data untuk diexport")

    const exportData = filteredSantri.map((s, idx) => {
      const row: any = {
        "No": s.stable_no_urut,
        "Nama Lengkap": s.nama,
        "Gelombang": s.gelombang?.nama_gelombang || "-",
      }
      COLUMNS.forEach(col => {
        row[col.title] = s.pemberkasan?.[col.key] ? "v" : ""
      })
      row["Keterangan"] = s.is_resigned ? "Mengundurkan Diri" : ""
      return row
    })

    const worksheet = xlsx.utils.json_to_sheet(exportData)

    // Auto format column width: First column tiny, second column wider, everything else fixed wide
    const colWidths = [
      { wch: 5 }, // No
      { wch: 35 }, // Nama
      { wch: 15 }, // Gelombang
      ...COLUMNS.map(c => ({ wch: Math.max(10, c.title.length) }))
    ]
    worksheet['!cols'] = colWidths

    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Pemberkasan")

    const safeName = (activeGelombangName || "Semua_Gelombang").replace(/\s+/g, '_')
    const fileName = `Laporan_Pemberkasan_${safeName}.xlsx`
    xlsx.writeFile(workbook, fileName)
    toast.success("Berhasil mengekspor Laporan Excel!")
  }

  const handleDeleteGelombang = () => {
    if (!activeGelombangId) return
    if (!window.confirm(`Apakah Anda yakin ingin menghapus SEMUA SANTRI di ${activeGelombangName}? Aksi ini tidak dapat dibatalkan!`)) {
      return
    }

    startTransition(async () => {
      try {
        await deleteSantriByGelombang(activeGelombangId)
        toast.success(`Semua santri di ${activeGelombangName} berhasil dihapus`)
      } catch (error: any) {
        toast.error(error.message || "Gagal menghapus santri")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-xl shadow-sm border border-neutral-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Arsip Digital - Pencatatan Berkas Offline</h1>
          <p className="text-neutral-500 mt-1">Cek dan catat kelengkapan dokumen fisik santri di lapangan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setManualModalOpen(true)} variant="outline" className="border-dashed border-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Manual
          </Button>
          <Button onClick={() => setImportModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <FileUp className="mr-2 h-4 w-4" /> Import Excel
          </Button>
          <Button onClick={handleExport} variant="secondary">
            <FileDown className="mr-2 h-4 w-4" /> Export Laporan
          </Button>
        </div>
      </div>

      {/* STAT CARDS */}
      <StatCards santriList={initialSantriList} />

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <div className="w-full sm:w-64">
            <Select value={activeGelombangName || "all"} onValueChange={handleFilterGelombang}>
              <SelectTrigger className="w-full font-medium h-11">
                <SelectValue placeholder="Semua Gelombang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Gelombang</SelectItem>
                {initialGelombangList.map(g => (
                  <SelectItem key={g.id} value={g.nama_gelombang}>{g.nama_gelombang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="🔍 Cari Nama Santri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 px-4 rounded-md border border-input bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      </div>

      {/* ACTIVE GELOMBANG HIGHLIGHT */}
      {activeGelombangName && (
        <div className="my-2 border-l-4 border-emerald-500 pl-4 py-1 flex items-center justify-between bg-white p-3 rounded-r-lg shadow-sm border-y border-r border-neutral-200">
          <div>
            <h2 className="text-xl font-semibold text-emerald-800 uppercase tracking-wider">{activeGelombangName}</h2>
            <p className="text-sm text-neutral-500">Menampilkan santri hanya pada gelombang ini</p>
          </div>
          {/* <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteGelombang}
            disabled={isPendingDelete || filteredSantri.length === 0}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isPendingDelete ? "Menghapus..." : "Kosongkan Gelombang"}
          </Button> */}
        </div>
      )}

      {/* MAIN TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <MainTable santriList={filteredSantri} />
      </div>

      {/* MODALS */}
      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        gelombangList={initialGelombangList}
      />
      <AddManualModal
        open={manualModalOpen}
        onOpenChange={setManualModalOpen}
        gelombangList={initialGelombangList}
      />
    </div>
  )
}
