"use client"

import { useState, useTransition, useOptimistic } from "react"
import { toggleDocument, editSantri, deleteSantri } from "@/app/actions"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Pencil, Trash2 } from "lucide-react"

export const COLUMNS = [
  { key: "has_akta_lahir", title: "Akta Lahir asli + FC(5)" },
  { key: "has_kk", title: "FC KK (3)" },
  { key: "has_ijazah", title: "Ijazah asli + transkip nilai asli + fc (5)" },
  { key: "has_paspor", title: "Paspor asli + FC 3" },
  { key: "has_skck", title: "SKCK asli + fc (2)" },
  { key: "has_surat_sehat", title: "Surat Sehat asli + fc (2)" },
  { key: "has_pas_photo", title: "Pas Photo (4x6) 20 + 20" },
  { key: "has_surat_rekom", title: "Surat Rekom asli + FC (2)" },
  { key: "has_pakta_integritas", title: "Pakta Integritas" },
  { key: "has_biodata", title: "Biodata Pemohon" },
  { key: "has_pernyataan_kebenaran", title: "Surat Pernyataan Kebenaran" },
  { key: "has_jaminan_sponsorship", title: "Surat Jaminan Sponsorship" },
  { key: "has_statistik_pesantren", title: "FC Jaminan FC Jaminan Statistik Pesantren (NSP) Bagi Yang Berijazah Pesantren" },
]

function ToggleDocument({ santriId, fieldKey, initialValue, readOnly }: { santriId: string, fieldKey: string, initialValue: boolean, readOnly?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticValue, addOptimisticValue] = useOptimistic(
    initialValue,
    (state, newValue: boolean) => newValue
  )

  const handleChange = (checked: boolean) => {
    if (readOnly) return
    addOptimisticValue(checked)
    startTransition(async () => {
      try {
        await toggleDocument(santriId, fieldKey, checked)
      } catch (e) {
        toast.error("Gagal menyimpan perubahan. Coba ulangi.")
        addOptimisticValue(initialValue) // Revert
      }
    })
  }

  return (
    <div className="flex items-center justify-center p-1">
      <input
        type="checkbox"
        checked={optimisticValue}
        onChange={(e) => handleChange(e.target.checked)}
        disabled={isPending || readOnly}
        className="w-6 h-6 accent-emerald-500 cursor-pointer rounded shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
      />
    </div>
  )
}

function SantriRowActions({ santri }: { santri: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [nama, setNama] = useState(santri.nama)
  const [noUrut, setNoUrut] = useState(santri.no_urut?.toString() || "")
  const [isPending, startTransition] = useTransition()

  const handleEdit = () => {
    if (!nama.trim()) return toast.error("Nama wajib diisi")
    startTransition(async () => {
      try {
        await editSantri(santri.id, nama, noUrut)
        toast.success("Berhasil diperbarui")
        setIsEditOpen(false)
      } catch (e) {
        toast.error("Gagal memperbarui")
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSantri(santri.id)
        toast.success("Data dihapus")
        setIsDeleteOpen(false)
      } catch (e) {
        toast.error("Gagal menghapus")
      }
    })
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger render={<button className="p-1.5 text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Edit" />}>
          <Pencil className="w-4 h-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Santri</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Lengkap</Label>
              <Input value={nama} onChange={e => setNama(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Nomor Urut Map</Label>
              <Input type="number" value={noUrut} onChange={e => setNoUrut(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button disabled={isPending} onClick={handleEdit} className="bg-emerald-600 hover:bg-emerald-700">{isPending ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger render={<button className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus" />}>
          <Trash2 className="w-4 h-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-600">Hapus Data Santri</DialogTitle></DialogHeader>
          <p className="text-sm">Yakin ingin menghapus <b>{santri.nama}</b> secara permanen? Semua riwayat kelengkapan berkas akan ikut terhapus otomatis.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" disabled={isPending} onClick={handleDelete}>{isPending ? "Menghapus..." : "Ya, Hapus"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function MainTable({ santriList, readOnly = false }: { santriList: any[], readOnly?: boolean }) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 100
  const totalPages = Math.max(1, Math.ceil(santriList.length / pageSize))
  const paginatedList = santriList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full overflow-auto max-h-[70vh] relative">
        <Table className="relative min-w-max">
          <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 z-20 bg-neutral-100 w-16 whitespace-nowrap text-center text-sm font-semibold uppercase shadow-sm">No</TableHead>
            <TableHead className="sticky top-0 left-0 z-30 bg-neutral-100 border-r w-40 min-w-[150px] md:w-64 md:min-w-[250px] whitespace-nowrap text-sm font-semibold uppercase shadow-[1px_1px_0_0_#e5e7eb] md:shadow-sm">Nama Santri</TableHead>
            {COLUMNS.map(col => (
              <TableHead key={col.key} className="sticky top-0 z-20 bg-neutral-100 w-24 text-center whitespace-nowrap text-sm font-semibold shadow-sm">{col.title}</TableHead>
            ))}
            <TableHead className="sticky top-0 z-20 bg-neutral-100 w-48 min-w-[200px] text-sm font-semibold border-l px-4 whitespace-nowrap shadow-sm">Catatan Kekurangan</TableHead>
            {!readOnly && (
              <TableHead className="sticky top-0 right-auto md:right-0 z-30 bg-neutral-100 w-20 text-center whitespace-nowrap text-sm font-semibold md:border-l shadow-[0_1px_0_0_#e5e7eb] md:shadow-[0_1px_0_0_#e5e7eb,inset_1px_0_0_0_#e5e7eb]">Aksi</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length + 3} className="text-center py-10 text-neutral-500">
                Tidak ada data santri untuk ditampilkan.
              </TableCell>
            </TableRow>
          ) : null}

          {paginatedList.map((santri, index) => {
            const actualIndex = (currentPage - 1) * pageSize + index
            const missingDocs = COLUMNS.filter(c => !santri.pemberkasan?.[c.key]).map(c => c.title)
            const missingText = missingDocs.length > 0 ? `Kurang: ${missingDocs.join(", ")}` : "Lengkap"
            const isLengkap = missingDocs.length === 0

            return (
              <TableRow key={santri.id} className="hover:bg-neutral-50">
                <TableCell className="text-center font-medium text-neutral-500">
                  {(santri.no_urut || 0) > 0 ? santri.no_urut : (actualIndex + 1)}
                </TableCell>

                {/* STICKY COLUMN */}
                <TableCell className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50 border-r align-top py-3 shadow-[1px_0_0_0_#e5e7eb] max-w-[150px] md:max-w-none break-words">
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-800 text-sm md:text-base line-clamp-2" title={santri.nama.toUpperCase()}>{santri.nama.toUpperCase()}</span>
                    <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 mt-1 bg-neutral-100 text-neutral-500 rounded-full w-max max-w-full truncate">
                      {santri.gelombang?.nama_gelombang || "Tanpa Gelombang"}
                    </span>
                  </div>
                </TableCell>

                {/* TOGGLES */}
                {COLUMNS.map(col => (
                  <TableCell key={col.key} className="p-0 border-l align-middle w-24 min-w-[6rem] h-full">
                    <ToggleDocument 
                      santriId={santri.id} 
                      fieldKey={col.key} 
                      initialValue={santri.pemberkasan?.[col.key] || false} 
                      readOnly={readOnly}
                    />
                  </TableCell>
                ))}

                {/* CATATAN KEKURANGAN */}
                <TableCell className="border-l bg-neutral-50/50 align-middle min-w-[200px]">
                  {isLengkap ? (
                    <span className="text-emerald-600 font-bold tracking-tight text-sm px-4">Lengkap</span>
                  ) : (
                    <div className="flex items-center gap-3 px-2">
                      <span className="text-red-500 font-medium text-sm whitespace-nowrap">
                        {missingDocs.length} berkas kurang
                      </span>
                      <Dialog>
                        <DialogTrigger 
                          render={
                            <button className="text-xs bg-red-100 hover:bg-red-200 hover:text-red-800 text-red-700 font-semibold px-2.5 py-1.5 rounded-md transition-colors shadow-sm cursor-pointer whitespace-nowrap" />
                          }
                        >
                          Lihat Detail
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-red-600 border-b pb-2">Kekurangan Berkas</DialogTitle>
                          </DialogHeader>
                          <div className="py-2">
                            <p className="text-sm font-semibold mb-3 text-neutral-800">
                              Santri: <span className="font-normal">{santri.nama.toUpperCase()}</span>
                            </p>
                            <ul className="list-decimal pl-5 space-y-2 text-sm text-neutral-700">
                              {missingDocs.map((doc: string, i: number) => (
                                <li key={i} className="leading-snug">{doc}</li>
                              ))}
                            </ul>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </TableCell>
                
                {/* AKSI */}
                {!readOnly && (
                  <TableCell className="sticky right-auto md:right-0 z-10 bg-white group-hover:bg-neutral-50 md:shadow-[-1px_0_0_0_#e5e7eb] md:border-l align-middle w-20 px-2 min-w-[5rem]">
                    <SantriRowActions santri={santri} />
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t bg-neutral-50">
          <p className="text-sm text-neutral-500">
            Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, santriList.length)} dari {santriList.length} santri
          </p>
          <div className="flex items-center gap-3">
            <button 
              className="px-3 py-1.5 text-sm font-medium border rounded-md disabled:opacity-50 hover:bg-white bg-white shadow-sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            <span className="text-sm font-medium px-2">Hal {currentPage} / {totalPages}</span>
            <button 
              className="px-3 py-1.5 text-sm font-medium border rounded-md disabled:opacity-50 hover:bg-white bg-white shadow-sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
