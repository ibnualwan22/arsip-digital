"use client"
import { useState, useTransition } from "react"
import { uploadExcel } from "@/app/actions"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { toast } from "sonner"
import { UploadCloud } from "lucide-react"

export function ImportModal({
  open,
  onOpenChange,
  gelombangList
}: {
  open: boolean,
  onOpenChange: (val: boolean) => void,
  gelombangList: any[]
}) {
  const [file, setFile] = useState<File | null>(null)
  const [gelombangId, setGelombangId] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return toast.error("File belum dipilih!")
    if (!gelombangId) return toast.error("Pilih Gelombang terlebih dahulu!")

    const formData = new FormData()
    formData.append("file", file)

    startTransition(async () => {
      try {
        const res = await uploadExcel(formData, Number(gelombangId))
        toast.success(`Berhasil memproses Excel. Ditambahkan: ${res.imported}, Diperbarui: ${res.updated}`)
        onOpenChange(false)
        setFile(null)
      } catch (err: any) {
        toast.error("Gagal mengimpor file: " + err.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data Santri (Excel)</DialogTitle>
          <DialogDescription>
            Pastikan berkas Excel (`.xlsx`) Anda memiliki judul kolom baris ke-1 **SAMA PERSIS** seperti pola berikut: <br />
            <span className="text-xs text-neutral-600 block mt-2 border p-2 rounded bg-neutral-50 leading-relaxed font-mono">
              No • Nama Lengkap • Akta Lahir asli + FC(5) • FC KK (3) • Ijazah asli + transkip nilai asli + fc (5) • Paspor asli + FC 3 • SKCK asli + fc (2) • Surat Sehat asli + fc (2) • Pas Photo (4x6) 20 + 20 • Surat Rekom asli + FC (2) • Pakta Integritas • Biodata Pemohon • Surat Pernyataan Kebenaran • Surat Jaminan Sponsorship • FC Jaminan FC Jaminan Statistik Pesantren (NSP) Bagi Yang Berijazah Pesantren
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="gelombang">Target Gelombang (Wajib)</Label>
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="filexls">Pilih File Excel (.xlsx)</Label>
            <Input id="filexls" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleUpload} disabled={isPending || !file || !gelombangId} className="bg-emerald-600 hover:bg-emerald-700">
            {isPending ? "Memproses..." : <><UploadCloud className="w-4 h-4 mr-2" /> Mulai Import</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
