const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePasswords() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const sellerHash = await bcrypt.hash('seller123', 10);

  try {
    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { password: adminHash }
    });
    console.log('Admin password updated');
  } catch (e) {
    console.log('Admin not found or error');
  }

  try {
    await prisma.user.update({
      where: { email: 'seller@example.com' },
      data: { password: sellerHash }
    });
    console.log('Seller password updated');
  } catch (e) {
    console.log('Seller not found or error');
  }
}

updatePasswords().then(() => process.exit(0));
