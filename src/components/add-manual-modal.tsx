"use client"
import { useState, useTransition, useEffect } from "react"
import { addSantri, addGelombang, getNextNoUrut } from "@/app/actions"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { toast } from "sonner"

export function AddManualModal({ 
  open, 
  onOpenChange, 
  gelombangList 
}: { 
  open: boolean, 
  onOpenChange: (val: boolean) => void,
  gelombangList: any[] 
}) {
  const [nama, setNama] = useState("")
  const [gelombangId, setGelombangId] = useState<string>("")
  const [newGelombang, setNewGelombang] = useState("")
  const [noUrut, setNoUrut] = useState("")
  const [isPending, startTransition] = useTransition()

  const [modeGelombang, setModeGelombang] = useState<"select" | "create">("select")

  useEffect(() => {
    if (modeGelombang === "select" && gelombangId && open) {
      getNextNoUrut(gelombangId).then(next => setNoUrut(next.toString()))
    }
  }, [gelombangId, modeGelombang, open])

  const handleSave = () => {
    if (!nama.trim()) return toast.error("Nama Harus Diisi!")

    startTransition(async () => {
      try {
        let finalGelId = gelombangId
        
        if (modeGelombang === "create") {
          if (!newGelombang.trim()) {
            toast.error("Nama Gelombang Baru harus diisi!")
            return
          }
          const res = await addGelombang(newGelombang)
          finalGelId = res.id.toString()
        } else {
          if (!finalGelId) {
            toast.error("Gelombang harus dipilih!")
            return
          }
        }

        await addSantri(nama, finalGelId, noUrut || undefined)
        toast.success("Berhasil menambahkan " + nama)
        setNama("")
        setNoUrut("")
        if (modeGelombang === 'create') setModeGelombang('select')
        onOpenChange(false)
        
      } catch(err: any) {
        toast.error("Gagal menambahkan manual: " + err.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Data Santri Individual</DialogTitle>
          <DialogDescription>
            Masukkan nama dan pilih ke gelombang mana santri ini dimasukkan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nama Lengkap Santri</Label>
            <Input placeholder="Misal: Ahmad Fauzi" value={nama} onChange={e => setNama(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>No Urut</Label>
            <Input type="number" placeholder="Bisa dikosongkan" value={noUrut} onChange={e => setNoUrut(e.target.value)} />
          </div>

          <div className="grid gap-2 p-3 bg-neutral-50 rounded-lg border">
            <div className="flex justify-between items-center mb-1">
              <Label>Gelombang</Label>
              <button 
                type="button" 
                onClick={() => setModeGelombang(m => m === "select" ? "create" : "select")}
                className="text-xs text-blue-600 hover:underline"
              >
                {modeGelombang === "select" ? "+ Buat Gelombang Baru" : "Gunakan yang ada"}
              </button>
            </div>
            
            {modeGelombang === "select" ? (
              <Select 
                value={gelombangList.find(g => g.id.toString() === gelombangId)?.nama_gelombang || ""} 
                onValueChange={(val) => {
                  const id = gelombangList.find(g => g.nama_gelombang === val)?.id
                  if(id) setGelombangId(id.toString())
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Golongan yang dituju --" />
                </SelectTrigger>
                <SelectContent>
                  {gelombangList.map(g => (
                    <SelectItem key={g.id} value={g.nama_gelombang}>{g.nama_gelombang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
               <Input placeholder="Ketik nama gelombang baru..." value={newGelombang} onChange={e => setNewGelombang(e.target.value)} />
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            {isPending ? "Menyimpan..." : "Simpan Santri"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
