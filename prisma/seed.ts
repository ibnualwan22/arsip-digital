import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const aktif = await prisma.periode.create({
    data: {
      nama_periode: "2025/2026",
      is_active: true
    }
  })
  console.log("Seeded Periode: ", aktif.nama_periode)
}

main().catch(console.error).finally(() => prisma.$disconnect())
