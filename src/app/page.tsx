import DashboardClient from "@/components/dashboard-client"
import { getGelombangList, getSantriList } from "@/app/actions"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ gelombangId?: string }>
}) {
  const params = await searchParams
  const activeGelombangId = params.gelombangId ? Number(params.gelombangId) : undefined
  
  const [gelombangList, santriList] = await Promise.all([
    getGelombangList(),
    getSantriList(activeGelombangId)
  ])

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col p-4 md:p-8">
      <DashboardClient 
        initialGelombangList={gelombangList} 
        initialSantriList={santriList} 
        activeGelombangId={activeGelombangId}
      />
    </main>
  )
}
