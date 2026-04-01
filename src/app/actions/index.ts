"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as xlsx from "xlsx"

/** Get list of all Gelombang */
export async function getGelombangList() {
  return await prisma.gelombang.findMany({
    orderBy: { id: 'asc' },
  })
}

/** Get Santri inside a Gelombang, including their pemberkasan */
export async function getSantriList(gelombangId?: number) {
  const where = gelombangId ? { gelombang_id: gelombangId } : {}
  return await prisma.santri.findMany({
    where,
    include: {
      pemberkasan: true,
      gelombang: true,
    },
    orderBy: [
      { gelombang_id: 'asc' },
      { no_urut: 'asc' },
      { nama: 'asc' }
    ]
  })
}

/** Toggle document status */
export async function toggleDocument(
  santriId: string,
  field: string,
  value: boolean
) {
  // Hanya ijinkan field tertentu untuk alasan keamanan
  const allowedFields = [
    "has_akta_lahir", "has_kk", "has_ijazah", "has_paspor", "has_skck",
    "has_surat_sehat", "has_pas_photo", "has_surat_rekom",
    "has_pakta_integritas", "has_biodata", "has_pernyataan_kebenaran",
    "has_jaminan_sponsorship", "has_statistik_pesantren"
  ]
  if (!allowedFields.includes(field)) {
    throw new Error("Invalid field parameter")
  }

  await prisma.pemberkasan.update({
    where: { santri_id: santriId },
    data: { [field]: value }
  })

  revalidatePath("/")
  return { success: true }
}

/** Create new Gelombang */
export async function addGelombang(namaGelombang: string) {
  if (!namaGelombang.trim()) throw new Error("Nama harus diisi")
  const gel = await prisma.gelombang.create({
    data: { nama_gelombang: namaGelombang.trim() }
  })
  revalidatePath("/")
  return gel
}

/** Add Manual Santri */
export async function getNextNoUrut(gelombangId: string) {
  if (!gelombangId) return 1
  const max = await prisma.santri.aggregate({
    where: { gelombang_id: Number(gelombangId) },
    _max: { no_urut: true }
  })
  return (max._max.no_urut || 0) + 1
}

export async function addSantri(nama: string, gelombangId: string, noUrutStr?: string) {
  if (!nama.trim() || !gelombangId) throw new Error("Data tidak lengkap")
  
  let finalNoUrut = noUrutStr && !isNaN(Number(noUrutStr)) ? Number(noUrutStr) : null
  if (!finalNoUrut) {
    finalNoUrut = await getNextNoUrut(gelombangId)
  }

  await prisma.santri.create({
    data: {
      nama: nama.trim(),
      no_urut: finalNoUrut,
      gelombang_id: Number(gelombangId),
      pemberkasan: {
        create: {}
      }
    }
  })
  
  revalidatePath("/")
}

export async function editSantri(id: string, nama: string, noUrutStr?: string) {
  if (!nama.trim() || !id) throw new Error("Data tidak lengkap")
  let finalNoUrut = noUrutStr && !isNaN(Number(noUrutStr)) ? Number(noUrutStr) : null
  await prisma.santri.update({
    where: { id },
    data: {
      nama: nama.trim(),
      no_urut: finalNoUrut
    }
  })
  revalidatePath("/")
}

export async function deleteSantri(id: string) {
  if (!id) throw new Error("ID tidak valid")
  await prisma.santri.delete({
    where: { id }
  })
  revalidatePath("/")
}

// Logic untuk mengecek cell checkmark atau string "true/false", "v", "x", "1", "0" dll
function parseBoolean(val: any): boolean {
  if (val === true || val === 1) return true
  if (typeof val === "string") {
    const s = val.toLowerCase().trim()
    if (s === "true" || s === "1" || s === "v" || s === "yes" || s === "ya" || s === "check" || s === "checked" || s === "ada") {
      return true
    }
  }
  return false
}

/** Upload & Import / Upsert Excel Data */
export async function uploadExcel(formData: FormData, gelombangId: number) {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file found")

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = xlsx.read(buffer, { type: "buffer" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(worksheet)

  // Asumsi header excel memuat kolom-kolom ini:
  // No, Nama Santri, KK, Ijazah, Paspor, SKCK, Surat Sehat, Pas Photo, Surat Rekom, Pakta Integritas, Biodata

  let importedCount = 0
  let updatedCount = 0

  for (const row of data as any[]) {
    const namaFromRow = row["Nama Lengkap"] || row["Nama Santri"] || row["Nama"]
    if (!namaFromRow) continue

    const nama = String(namaFromRow).trim()
    const noUrut = Number(row["No"]) || null

    const has_akta_lahir = parseBoolean(row["Akta Lahir asli + FC(5)"] || row["Akta Lahir"])
    const has_kk = parseBoolean(row["FC KK (3)"] || row["KK"])
    const has_ijazah = parseBoolean(row["Ijazah asli + transkip nilai asli + fc (5)"] || row["Ijazah"])
    const has_paspor = parseBoolean(row["Paspor asli + FC 3"] || row["Paspor"])
    const has_skck = parseBoolean(row["SKCK asli + fc (2)"] || row["SKCK"])
    const has_surat_sehat = parseBoolean(row["Surat Sehat asli + fc (2)"] || row["Surat Sehat"])
    const has_pas_photo = parseBoolean(row["Pas Photo (4x6) 20 + 20"] || row["Pas Photo"])
    const has_surat_rekom = parseBoolean(row["Surat Rekom asli + FC (2)"] || row["Surat Rekom"])
    const has_pakta_integritas = parseBoolean(row["Pakta Integritas"])
    const has_biodata = parseBoolean(row["Biodata Pemohon"] || row["Biodata"])
    const has_pernyataan_kebenaran = parseBoolean(row["Surat Pernyataan Kebenaran"])
    const has_jaminan_sponsorship = parseBoolean(row["Surat Jaminan Sponsorship"])
    const has_statistik_pesantren = parseBoolean(row["FC Jaminan Statistik Pesantren (NSP) Bagi Yang Berijazah Pesantren"] || row["Statistik Pesantren"])

    // Cek apakah santri sudah ada (by Nama dan Gelombang)
    const existingEntry = await prisma.santri.findFirst({
      where: { nama, gelombang_id: gelombangId }
    })

    if (existingEntry) {
      // Update record santri
      await prisma.santri.update({
        where: { id: existingEntry.id },
        data: { no_urut: noUrut }
      })

      // Update pemberkasan
      // Kita pakai upsert di pemberkasan jika santri tidak punya entri di tabel pemberkasan karena error, tapi normalnya pasti ada
      await prisma.pemberkasan.upsert({
        where: { santri_id: existingEntry.id },
        create: {
          santri_id: existingEntry.id,
          has_akta_lahir, has_kk, has_ijazah, has_paspor, has_skck, has_surat_sehat, has_pas_photo, has_surat_rekom, has_pakta_integritas, has_biodata, has_pernyataan_kebenaran, has_jaminan_sponsorship, has_statistik_pesantren
        },
        update: {
          has_akta_lahir, has_kk, has_ijazah, has_paspor, has_skck, has_surat_sehat, has_pas_photo, has_surat_rekom, has_pakta_integritas, has_biodata, has_pernyataan_kebenaran, has_jaminan_sponsorship, has_statistik_pesantren
        }
      })
      updatedCount++
    } else {
      // Insert baru
      await prisma.santri.create({
        data: {
          nama,
          gelombang_id: gelombangId,
          no_urut: noUrut,
          pemberkasan: {
            create: {
              has_akta_lahir, has_kk, has_ijazah, has_paspor, has_skck, has_surat_sehat, has_pas_photo, has_surat_rekom, has_pakta_integritas, has_biodata, has_pernyataan_kebenaran, has_jaminan_sponsorship, has_statistik_pesantren
            }
          }
        }
      })
      importedCount++
    }
  }

  revalidatePath("/")
  return { success: true, imported: importedCount, updated: updatedCount }
}
