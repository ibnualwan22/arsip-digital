"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, FolderOpen, FileX2 } from "lucide-react"

// Types based on Prisma schema
type Pemberkasan = {
  has_akta_lahir: boolean | null
  has_kk: boolean | null
  has_ijazah: boolean | null
  has_paspor: boolean | null
  has_skck: boolean | null
  has_surat_sehat: boolean | null
  has_pas_photo: boolean | null
  has_surat_rekom: boolean | null
  has_pakta_integritas: boolean | null
  has_biodata: boolean | null
  has_pernyataan_kebenaran: boolean | null
  has_jaminan_sponsorship: boolean | null
  has_statistik_pesantren: boolean | null
}

type Santri = {
  id: string
  no_urut: number | null
  nama: string
  gelombang_id: number | null
  gelombang: { id: number; nama_gelombang: string } | null
  pemberkasan: Pemberkasan | null
}

type Periode = {
  id: number
  nama_periode: string
}

type Gelombang = {
  id: number
  nama_gelombang: string
  periode_id: number
}

const documentFields = [
  { key: "has_akta_lahir", label: "Akta Lahir" },
  { key: "has_kk", label: "Kartu Keluarga (KK)" },
  { key: "has_ijazah", label: "Ijazah" },
  { key: "has_paspor", label: "Paspor" },
  { key: "has_skck", label: "SKCK" },
  { key: "has_surat_sehat", label: "Surat Sehat" },
  { key: "has_pas_photo", label: "Pas Photo" },
  { key: "has_surat_rekom", label: "Surat Rekomendasi" },
  { key: "has_pakta_integritas", label: "Pakta Integritas" },
  { key: "has_biodata", label: "Biodata" },
  { key: "has_pernyataan_kebenaran", label: "Pernyataan Kebenaran" },
  { key: "has_jaminan_sponsorship", label: "Jaminan Sponsorship" },
  { key: "has_statistik_pesantren", label: "Statistik Pesantren" },
]

export default function PublikClient({
  initialSantriList,
  periodes,
  gelumbangs,
  activePeriodeId
}: {
  initialSantriList: Santri[]
  periodes: Periode[]
  gelumbangs: Gelombang[]
  activePeriodeId?: number
}) {
  const [search, setSearch] = useState("")

  const activePeriodeObj = periodes.find(p => p.id === activePeriodeId)
  const initialPeriodeName = activePeriodeObj ? activePeriodeObj.nama_periode : "all"
  const [selectedPeriode, setSelectedPeriode] = useState<string>(initialPeriodeName)

  const [selectedGelombang, setSelectedGelombang] = useState<string>("all")
  const [selectedSantriForModal, setSelectedSantriForModal] = useState<Santri | null>(null)

  // Filter gelombang options based on selected periode
  const filteredGelombangs = useMemo(() => {
    if (selectedPeriode === "all") return gelumbangs
    const matchedP = periodes.find(p => p.nama_periode === selectedPeriode)
    if (!matchedP) return gelumbangs
    return gelumbangs.filter((g) => g.periode_id === matchedP.id)
  }, [selectedPeriode, gelumbangs, periodes])

  // Filter santri
  const filteredSantri = useMemo(() => {
    return initialSantriList.filter((santri) => {
      const matchSearch = santri.nama.toLowerCase().includes(search.toLowerCase())

      let matchPeriode = true
      // Find the periode for this santri based on its gelombang
      if (selectedPeriode !== "all" && santri.gelombang) {
        const gelombang = gelumbangs.find(g => g.id === santri.gelombang_id)
        const matchedP = periodes.find(p => p.nama_periode === selectedPeriode)
        if (gelombang && matchedP && gelombang.periode_id !== matchedP.id) {
          matchPeriode = false
        }
      } else if (selectedPeriode !== "all" && !santri.gelombang) {
        matchPeriode = false // no gelombang means we can't match periode
      }

      const matchGelombang = selectedGelombang === "all" || santri.gelombang?.nama_gelombang === selectedGelombang

      return matchSearch && matchPeriode && matchGelombang
    })
  }, [initialSantriList, search, selectedPeriode, selectedGelombang, gelumbangs])

  const getUncollectedDocs = (pemberkasan: Pemberkasan | null) => {
    if (!pemberkasan) return documentFields
    return documentFields.filter(f => !pemberkasan[f.key as keyof Pemberkasan])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Arsip Digital Publik</h1>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin"}>
              Login Admin
            </Button> */}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">

        {/* Search & Filter Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border space-y-6 transition-all duration-300 hover:shadow-md">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Pencarian Santri</h2>
            <p className="text-gray-500">Cari nama santri untuk melihat status kelengkapan berkas.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <Input
              className="pl-12 h-16 text-lg rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ketik nama lengkap..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Filter Periode</label>
              <Select value={selectedPeriode} onValueChange={(val) => {
                setSelectedPeriode(val || "all")
                setSelectedGelombang("all")
              }}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Semua Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  {periodes.map(p => (
                    <SelectItem key={p.id} value={p.nama_periode}>{p.nama_periode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Filter Gelombang</label>
              <Select value={selectedGelombang} onValueChange={(val) => setSelectedGelombang(val || "all")}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Semua Gelombang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gelombang</SelectItem>
                  {filteredGelombangs.map(g => (
                    <SelectItem key={g.id} value={g.nama_gelombang}>{g.nama_gelombang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Data List Section */}
        <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[80px] text-center font-semibold text-gray-600">No. Urut</TableHead>
                  <TableHead className="font-semibold text-gray-600">Nama Santri</TableHead>
                  <TableHead className="font-semibold text-gray-600">Gelombang</TableHead>
                  <TableHead className="text-center font-semibold text-gray-600">Berkas Belum Kumpul</TableHead>
                  <TableHead className="text-right pr-6 font-semibold text-gray-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSantri.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileX2 className="h-8 w-8 text-gray-300" />
                        <p>Tidak ada data santri ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSantri.map((santri) => {
                    const uncollected = getUncollectedDocs(santri.pemberkasan)
                    return (
                      <TableRow key={santri.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="text-center font-medium">{santri.no_urut || "-"}</TableCell>
                        <TableCell className="font-medium text-gray-900">{santri.nama}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {santri.gelombang?.nama_gelombang || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {uncollected.length === 0 ? (
                            <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 border-none">Lengkap</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none">
                              {uncollected.length} Berkas
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:shadow-md"
                            onClick={() => setSelectedSantriForModal(santri)}
                          >
                            Lihat Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>

      {/* Modal Detail Berkas */}
      <Dialog open={!!selectedSantriForModal} onOpenChange={(open) => !open && setSelectedSantriForModal(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Detail Berkas Santri
            </DialogTitle>
          </DialogHeader>

          {selectedSantriForModal && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border">
                <p className="text-sm text-gray-500">Nama</p>
                <p className="text-lg font-semibold text-gray-900">{selectedSantriForModal.nama}</p>
                <div className="flex gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Gelombang</p>
                    <Badge variant="secondary">{selectedSantriForModal.gelombang?.nama_gelombang || "-"}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. Urut</p>
                    <Badge variant="outline">{selectedSantriForModal.no_urut || "-"}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                  Berkas Belum Terkumpul
                  <Badge variant="destructive" className="rounded-full px-2.5">
                    {getUncollectedDocs(selectedSantriForModal.pemberkasan).length}
                  </Badge>
                </h4>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {getUncollectedDocs(selectedSantriForModal.pemberkasan).length === 0 ? (
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-teal-800 text-center flex flex-col items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="font-medium">Alhamdulillah, semua berkas sudah lengkap.</p>
                    </div>
                  ) : (
                    <ul className="grid grid-cols-1 gap-2">
                      {getUncollectedDocs(selectedSantriForModal.pemberkasan).map((doc, i) => (
                        <li key={i} className="flex items-center gap-3 p-3 bg-red-50/50 border border-red-100 rounded-lg text-red-700 text-sm font-medium">
                          <FileX2 className="h-4 w-4 text-red-500" />
                          {doc.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
