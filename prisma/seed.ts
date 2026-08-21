import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert the business to make seeding idempotent
  const business = await prisma.business.upsert({
    where: { slug: "tax-notary-demo" },
    update: {},
    create: {
      name: "Apex Tax & Notary Services",
      slug: "tax-notary-demo",
    },
  });

  console.log(`Seeded business: ${business.name} (${business.id})`);

  // Clear existing services to avoid duplication during seed re-runs
  await prisma.service.deleteMany({
    where: { businessId: business.id },
  });

  const services = await prisma.service.createMany({
    data: [
      {
        businessId: business.id,
        name: "Individual Tax Preparation",
        description: "Professional preparation and electronic filing of federal and state income tax returns for individuals. We maximize your deductions and credits to guarantee you get the best outcome.",
        price: 150.00,
        type: "TAX",
      },
      {
        businessId: business.id,
        name: "Business Tax Preparation",
        description: "Comprehensive tax services for sole proprietors, LLCs, S-Corps, and partnerships. Includes schedule C preparation, deductions optimization, and compliance guidance.",
        price: 350.00,
        type: "TAX",
      },
      {
        businessId: business.id,
        name: "General Notary Public Services",
        description: "Official witness and notarization of legal documents including affidavits, power of attorney, deeds, wills, contracts, and travel consent forms.",
        price: 15.00,
        type: "NOTARY",
      },
      {
        businessId: business.id,
        name: "Mobile Loan Signing Agent",
        description: "Certified notary services for mortgage loans, refinancing, home equity lines of credit (HELOC), and seller packets. We travel to your preferred location.",
        price: 125.00,
        type: "NOTARY",
      },
    ],
  });

  console.log(`Seeded ${services.count} services.`);

  // Upsert about section
  const about = await prisma.aboutSection.upsert({
    where: { businessId: business.id },
    update: {
      bio: "At Apex Tax & Notary Services, we believe that professional support should be accessible, accurate, and stress-free. Founded by a veteran tax preparer and certified loan signing agent, we specialize in helping individuals and small businesses manage tax filings and verify legal documentation with absolute precision. We pride ourselves on attention to detail, confidentiality, and exceptional service.",
      credentials: [
        "IRS Registered Tax Return Preparer (RTRP)",
        "Certified Mobile Loan Signing Agent",
        "Licensed, Bonded & Insured",
        "Active Member of the National Notary Association (NNA)"
      ],
      experience: "Serving the local community with over 12 years of professional financial and notary services.",
    },
    create: {
      businessId: business.id,
      bio: "At Apex Tax & Notary Services, we believe that professional support should be accessible, accurate, and stress-free. Founded by a veteran tax preparer and certified loan signing agent, we specialize in helping individuals and small businesses manage tax filings and verify legal documentation with absolute precision. We pride ourselves on attention to detail, confidentiality, and exceptional service.",
      credentials: [
        "IRS Registered Tax Return Preparer (RTRP)",
        "Certified Mobile Loan Signing Agent",
        "Licensed, Bonded & Insured",
        "Active Member of the National Notary Association (NNA)"
      ],
      experience: "Serving the local community with over 12 years of professional financial and notary services.",
    },
  });

  console.log(`Seeded about section for business.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
