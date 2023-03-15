import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.LiquidoUser[] = [
  {
    name: 'Alice',
    email: 'alice@prisma.io',
    mobilephone: "+49 555 11111",
  },
  {
    name: 'Nilu',
    email: 'nilu@prisma.io',
		mobilephone: "+49 555 22222",
  },
  {
    name: 'Mahmoud',
    email: 'mahmoud@prisma.io',
		mobilephone: "+49 555 33333",
		authyId: "432345345"
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
