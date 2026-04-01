"use client"
import { useState, useTransition } from "react"
import { addPeriode, setActivePeriode } from "@/app/actions"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { PlusCircle, Power } from "lucide-react"

export default function PeriodeClient({ initialData }: { initialData: any[] }) {
  const [newPeriode, setNewPeriode] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!newPeriode.trim()) return toast.error("Nama periode tak boleh kosong")
    startTransition(async () => {
      try {
        await addPeriode(newPeriode)
        toast.success("Periode berhasil ditambahkan")
        setNewPeriode("")
      } catch (e: any) {
        toast.error("Gagal menambahkan periode (Mungkin tahun sudah ada)")
      }
    })
  }

  const handleActivate = (id: number) => {
    startTransition(async () => {
      try {
        await setActivePeriode(id)
        toast.success("Tahun Aktif sukses diubah! Data dashboard utama di-reset otomatis untuk tahun ini.")
      } catch (e: any) {
        toast.error("Gagal mengaktifkan periode")
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tambah Periode */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 h-fit order-2 lg:order-1">
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Buat Baru</h2>
        <div className="space-y-4">
          <Input 
            placeholder="Misal: 2026/2027" 
            value={newPeriode} 
            onChange={e => setNewPeriode(e.target.value)} 
          />
          <Button onClick={handleAdd} disabled={isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambahkan
          </Button>
        </div>
      </div>

      {/* List Periode */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 p-6 order-1 lg:order-2">
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Daftar Periode</h2>
        <div className="space-y-3">
          {initialData.map((p) => (
            <div key={p.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 transition-all ${p.is_active ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-300'}`}>
              <div className="mb-4 sm:mb-0">
                <p className={`font-bold text-xl ${p.is_active ? 'text-emerald-900' : 'text-neutral-700'}`}>{p.nama_periode}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Dibuat pada: {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                {p.is_active ? (
                  <span className="px-4 py-2 bg-emerald-200 text-emerald-800 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    SEDANG AKTIF
                  </span>
                ) : (
                  <Button 
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleActivate(p.id)}
                    className="w-full sm:w-auto text-neutral-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Jadikan Aktif
                  </Button>
                )}
              </div>
            </div>
          ))}
          {initialData.length === 0 && (
            <p className="text-neutral-500 text-center py-6">Belum ada periode yang berhasil ditambahkan.</p>
          )}
        </div>
      </div>
    </div>
  )
}
