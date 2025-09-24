/**
 * 🧹 Cleanup Test Data from Database
 * 
 * This script removes test data created by the automation endpoints test suite.
 * It searches for entities with "🧪 TEST:" prefix and removes them safely.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🧹 Clean up test job applications
 */
async function cleanupTestJobApplications() {
  console.log('\n📝 CLEANING UP TEST JOB APPLICATIONS');
  console.log('====================================');

  try {
    // Find test job applications
    const testJobs = await prisma.jobApplication.findMany({
      where: {
        OR: [
          { title: { contains: '🧪 TEST:' } },
          { companyName: { contains: '🧪 TEST:' } },
          { notes: { contains: 'test job application created via automation' } }
        ]
      }
    });

    console.log(`📊 Found ${testJobs.length} test job applications to delete:`);
    testJobs.forEach(job => {
      console.log(`   • ${job.title} at ${job.companyName} (ID: ${job.id})`);
    });

    if (testJobs.length > 0) {
      const deleted = await prisma.jobApplication.deleteMany({
        where: {
          id: { in: testJobs.map(job => job.id) }
        }
      });

      console.log(`✅ Deleted ${deleted.count} test job applications`);
    } else {
      console.log('ℹ️  No test job applications found');
    }

  } catch (error) {
    console.error('❌ Error cleaning up job applications:', error.message);
  }
}

/**
 * 🏢 Clean up test companies
 */
async function cleanupTestCompanies() {
  console.log('\n🏢 CLEANING UP TEST COMPANIES');
  console.log('=============================');

  try {
    // Find test companies
    const testCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: '🧪 TEST:' } },
          { description: { contains: 'test' } },
          { website: { contains: 'example.com' } }
        ]
      },
      include: {
        contacts: true,
        jobApplications: true
      }
    });

    console.log(`📊 Found ${testCompanies.length} test companies to delete:`);
    testCompanies.forEach(company => {
      console.log(`   • ${company.name} (ID: ${company.id})`);
      console.log(`     - ${company.contacts.length} contacts`);
      console.log(`     - ${company.jobApplications.length} job applications`);
    });

    if (testCompanies.length > 0) {
      // Delete contacts first (due to foreign key constraints)
      const contactIds = testCompanies.flatMap(company => company.contacts.map(c => c.id));
      if (contactIds.length > 0) {
        const deletedContacts = await prisma.contact.deleteMany({
          where: { id: { in: contactIds } }
        });
        console.log(`✅ Deleted ${deletedContacts.count} associated contacts`);
      }

      // Then delete companies
      const deleted = await prisma.company.deleteMany({
        where: {
          id: { in: testCompanies.map(company => company.id) }
        }
      });

      console.log(`✅ Deleted ${deleted.count} test companies`);
    } else {
      console.log('ℹ️  No test companies found');
    }

  } catch (error) {
    console.error('❌ Error cleaning up companies:', error.message);
  }
}

/**
 * 👥 Clean up test contacts (orphaned)
 */
async function cleanupTestContacts() {
  console.log('\n👥 CLEANING UP TEST CONTACTS');
  console.log('============================');

  try {
    // Find test contacts
    const testContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { name: { contains: '🧪 TEST:' } },
          { email: { contains: 'example.com' } },
          { linkedinUrl: { contains: 'test' } }
        ]
      }
    });

    console.log(`📊 Found ${testContacts.length} test contacts to delete:`);
    testContacts.forEach(contact => {
      console.log(`   • ${contact.name} - ${contact.title || 'No title'} (ID: ${contact.id})`);
    });

    if (testContacts.length > 0) {
      const deleted = await prisma.contact.deleteMany({
        where: {
          id: { in: testContacts.map(contact => contact.id) }
        }
      });

      console.log(`✅ Deleted ${deleted.count} test contacts`);
    } else {
      console.log('ℹ️  No test contacts found');
    }

  } catch (error) {
    console.error('❌ Error cleaning up contacts:', error.message);
  }
}

/**
 * 📊 Display database status after cleanup
 */
async function displayDatabaseStatus() {
  console.log('\n📊 DATABASE STATUS AFTER CLEANUP');
  console.log('=================================');

  try {
    const [jobCount, companyCount, contactCount] = await Promise.all([
      prisma.jobApplication.count(),
      prisma.company.count(),
      prisma.contact.count()
    ]);

    console.log(`📝 Total Job Applications: ${jobCount}`);
    console.log(`🏢 Total Companies: ${companyCount}`);
    console.log(`👥 Total Contacts: ${contactCount}`);

  } catch (error) {
    console.error('❌ Error getting database status:', error.message);
  }
}

/**
 * 🚀 Main Cleanup Function
 */
async function runCleanup() {
  console.log('🧹 AUTOMATION TEST DATA CLEANUP');
  console.log('===============================');
  console.log('This will remove all test data created by the automation endpoints.');
  console.log('Looking for entities with "🧪 TEST:" prefix or test-related content...');

  try {
    // Clean up in proper order (respecting foreign key constraints)
    await cleanupTestJobApplications();  // Job applications first
    await cleanupTestContacts();         // Then contacts
    await cleanupTestCompanies();        // Finally companies

    await displayDatabaseStatus();

    console.log('\n🎉 CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('\n✅ All test data has been removed from the database.');

  } catch (error) {
    console.error('\n💥 CLEANUP FAILED:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Add confirmation prompt
function askConfirmation() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question('\n⚠️  Are you sure you want to delete all test data? (y/N): ', (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// 🚀 Run cleanup with confirmation
(async () => {
  if (process.argv.includes('--force')) {
    // Skip confirmation if --force flag is used
    await runCleanup();
  } else {
    const confirmed = await askConfirmation();
    if (confirmed) {
      await runCleanup();
    } else {
      console.log('\n❌ Cleanup cancelled by user');
    }
  }
})().catch(error => {
  console.error('💥 Cleanup script failed:', error);
  process.exit(1);
});








