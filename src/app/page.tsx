import { getActivePeriode, getPeriodeList, getSantriList, getAllGelombangList } from "./actions"
import PublikClient from "./publik-client"

export const metadata = {
  title: "Arsip Digital - Cek Berkas",
  description: "Cek kelengkapan berkas santri secara publik",
}

export default async function PublicPage() {
  // Fetch data on the server
  const periodes = await getPeriodeList()
  const activePeriode = await getActivePeriode()
  
  // We can fetch initial gelombang for active periode or fetch all gelombang
  // To allow filtering across periodes on the client without refetching, let's fetch all gelombangs
  // Wait, getAllGelombangList needs a periodeId in actions. Or we can just get all gelombang using Prisma directly if needed,
  // but let's see. If we fetch all gelombangs, we probably should do that so the client can filter.
  // Actually, we can fetch all santri and periodes, and then we need ALL gelombangs for all periodes.
  // Let's import prisma to fetch all gelombangs across all periodes because getAllGelombangList only takes 1 periodeId or getGelombangList gets for active periode.
  
  const { prisma } = await import("@/lib/prisma")
  const gelumbangs = await prisma.gelombang.findMany()
  
  // Fetch all santri 
  const santriList = await prisma.santri.findMany({
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

  // Format the data if needed, or pass it directly since they match the types.
  
  return (
    <PublikClient 
      initialSantriList={santriList}
      periodes={periodes}
      gelumbangs={gelumbangs}
      activePeriodeId={activePeriode?.id}
    />
  )
}
