import { createRequire } from "node:module";
import { join } from "node:path";
import { hashPassword } from "../src/lib/password";

type AdminInput = {
  id: number;
  username: string;
  email: string;
  password: string;
  nama: string;
};

type CustomerInput = {
  nama: string;
  alamat: string;
};

type ReceiptInput = {
  tanggalBayar: Date;
  bulanPeriode: string;
  standAwal: number;
  standAkhir: number;
  pemakaian: number;
  tarif: number;
  totalPerM2: number;
  totalBayar: number;
  pelangganId: number;
};

type SeedClient = {
  admin: {
    upsert(args: {
      where: { id: number };
      update: Partial<Omit<AdminInput, "id" | "password">>;
      create: AdminInput;
    }): Promise<unknown>;
  };
  pelanggan: {
    findFirst(args: {
      where: CustomerInput;
    }): Promise<{ id: number } | null>;
    create(args: { data: CustomerInput }): Promise<{ id: number }>;
  };
  kwitansi: {
    upsert(args: {
      where: { noKwitansi: string };
      update: ReceiptInput;
      create: ReceiptInput & { noKwitansi: string };
    }): Promise<unknown>;
  };
  pengaturan: {
    upsert(args: {
      where: { id: number };
      update: Partial<{
        namaAplikasi: string;
        namaOrganisasi: string;
        alamat: string;
      }>;
      create: {
        id: number;
        namaAplikasi: string;
        namaOrganisasi: string;
        alamat: string;
      };
    }): Promise<unknown>;
  };
  $disconnect(): Promise<void>;
};

function createPrismaClient(): SeedClient {
  let prismaModule: unknown;

  try {
    prismaModule = createRequire(join(process.cwd(), "package.json"))(
      "@prisma/client",
    );
  } catch (error) {
    throw new Error(
      "Prisma Client belum tersedia. Generate Prisma Client sebelum menjalankan seed.",
      { cause: error },
    );
  }

  if (
    typeof prismaModule !== "object" ||
    prismaModule === null ||
    !("PrismaClient" in prismaModule) ||
    typeof prismaModule.PrismaClient !== "function"
  ) {
    throw new Error(
      "Prisma Client belum tersedia. Generate Prisma Client sebelum menjalankan seed.",
    );
  }

  const PrismaClient = prismaModule.PrismaClient as new () => SeedClient;
  return new PrismaClient();
}

async function main() {
  const prisma = createPrismaClient();
  try {
    await prisma.admin.upsert({
      where: { id: 1 },
      update: {
        username: "admin",
        email: "admin@hipam.local",
        nama: "Administrator",
      },
      create: {
        id: 1,
        username: "admin",
        email: "admin@hipam.local",
        password: hashPassword("admin123"),
        nama: "Administrator",
      },
    });
    await prisma.pengaturan.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        namaAplikasi: "HIPAM Batuguluk",
        namaOrganisasi: "HIPAM Batuguluk Foundation",
        alamat: "Batuguluk, Lombok Timur",
      },
    });

    const existingCustomer = await prisma.pelanggan.findFirst({
      where: {
        nama: "Siti Aminah",
        alamat: "Batuguluk, Lombok Timur",
      },
    });
    const customer =
      existingCustomer ??
      (await prisma.pelanggan.create({
        data: {
          nama: "Siti Aminah",
          alamat: "Batuguluk, Lombok Timur",
        },
      }));

    await prisma.kwitansi.upsert({
      where: { noKwitansi: "KB-2024-001248" },
      update: {
        tanggalBayar: new Date("2024-01-15T00:00:00.000Z"),
        bulanPeriode: "Januari 2024",
        standAwal: 1245,
        standAkhir: 1260,
        pemakaian: 15,
        tarif: 15,
        totalPerM2: 3500,
        totalBayar: 52500,
        pelangganId: customer.id,
      },
      create: {
        noKwitansi: "KB-2024-001248",
        tanggalBayar: new Date("2024-01-15T00:00:00.000Z"),
        bulanPeriode: "Januari 2024",
        standAwal: 1245,
        standAkhir: 1260,
        pemakaian: 15,
        tarif: 15,
        totalPerM2: 3500,
        totalBayar: 52500,
        pelangganId: customer.id,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error: unknown) => {
    console.error("Gagal mengisi data awal HIPAM:", error);
    process.exitCode = 1;
  });
