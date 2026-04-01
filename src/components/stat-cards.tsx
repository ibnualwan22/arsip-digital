"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { AlertCircle } from "lucide-react"

type StatCardsProps = {
  santriList: any[]
}

const DOCUMENTS = [
  { key: "has_akta_lahir", label: "Akta Lahir asli + FC(5)" },
  { key: "has_kk", label: "FC KK (3)" },
  { key: "has_ijazah", label: "Ijazah asli + transkip nilai asli + fc (5)" },
  { key: "has_paspor", label: "Paspor asli + FC 3" },
  { key: "has_skck", label: "SKCK asli + fc (2)" },
  { key: "has_surat_sehat", label: "Surat Sehat asli + fc (2)" },
  { key: "has_pas_photo", label: "Pas Photo (4x6) 20 + 20" },
  { key: "has_surat_rekom", label: "Surat Rekom asli + FC (2)" },
  { key: "has_pakta_integritas", label: "Pakta Integritas" },
  { key: "has_biodata", label: "Biodata Pemohon" },
  { key: "has_pernyataan_kebenaran", label: "Surat Pernyataan Kebenaran" },
  { key: "has_jaminan_sponsorship", label: "Surat Jaminan Sponsorship" },
  { key: "has_statistik_pesantren", label: "FC Jaminan Statistik Pesantren (NSP) Bagi Yang Berijazah Pesantren" },
]

export function StatCards({ santriList }: StatCardsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null)

  const handleCardClick = (docKey: string) => {
    setActiveDocKey(docKey)
    setModalOpen(true)
  }

  // Find users missing the selected doc
  const missingSantri = activeDocKey
    ? santriList.filter(s => s.pemberkasan && s.pemberkasan[activeDocKey] === false)
    : []

  const activeDocLabel = activeDocKey
    ? DOCUMENTS.find(d => d.key === activeDocKey)?.label
    : ""

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-4">
        {DOCUMENTS.map(doc => {
          // Count missing
          const missingCount = santriList.filter(s => s.pemberkasan && s.pemberkasan[doc.key] === false).length

          return (
            <div
              key={doc.key}
              onClick={() => handleCardClick(doc.key)}
              className="bg-white hover:bg-red-50 cursor-pointer transition p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between group"
            >
              <h3 className="text-sm font-medium text-neutral-600 mb-2 truncate" title={doc.label}>{doc.label}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600 group-hover:scale-110 transition-transform">{missingCount}</span>
                {missingCount > 0 && <AlertCircle className="text-red-500 h-5 w-5 opacity-70" />}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Santri Belum Lengkap</p>
            </div>
          )
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              Daftar Santri Belum Mengumpulkan: {activeDocLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 mt-4 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Santri</TableHead>
                  <TableHead>Gelombang</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingSantri.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-neutral-500 py-6">
                      Semua santri sudah melengkapi dokumen ini.
                    </TableCell>
                  </TableRow>
                ) : missingSantri.map((s, idx) => (
                  <TableRow key={s.id}>
                    <TableCell>{(s.no_urut || 0) > 0 ? s.no_urut : (idx + 1)}</TableCell>
                    <TableCell className="font-medium">{s.nama}</TableCell>
                    <TableCell>{s.gelombang?.nama_gelombang}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
