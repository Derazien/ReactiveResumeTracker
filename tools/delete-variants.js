const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function deleteVariants() {
  try {
    console.log('🗑️  Starting variant deletion process...');
    
    // Load variants list
    const variantsFile = path.join(__dirname, 'exports', 'variants-to-delete.json');
    
    if (!fs.existsSync(variantsFile)) {
      console.error(`❌ Variants file not found: ${variantsFile}`);
      console.log('💡 Run the import script first to generate the variants list.');
      return;
    }

    const variantIds = JSON.parse(fs.readFileSync(variantsFile, 'utf8'));
    console.log(`📄 Loaded ${variantIds.length} variants to delete`);

    if (variantIds.length === 0) {
      console.log('✅ No variants to delete');
      return;
    }

    // Show variants before deletion
    console.log('\n📋 Variants to be deleted:');
    for (const variantId of variantIds) {
      const variant = await prisma.content.findUnique({
        where: { id: variantId },
        select: { id: true, title: true, createdAt: true }
      });
      
      if (variant) {
        console.log(`  - ${variant.id}: ${variant.title} (created: ${variant.createdAt})`);
      } else {
        console.log(`  - ${variantId}: NOT FOUND`);
      }
    }

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete the above variants!');
    console.log('Type "DELETE" to confirm:');
    
    // For automated execution, you can set this environment variable
    const autoConfirm = process.env.AUTO_CONFIRM_DELETE === 'true';
    
    if (!autoConfirm) {
      console.log('Set AUTO_CONFIRM_DELETE=true to skip confirmation');
      return;
    }

    console.log('🗑️  Proceeding with deletion...');

    // Delete variants
    let deletedCount = 0;
    for (const variantId of variantIds) {
      try {
        const deleted = await prisma.content.delete({
          where: { id: variantId }
        });
        console.log(`  ✅ Deleted: ${deleted.title} (${variantId})`);
        deletedCount++;
      } catch (error) {
        console.error(`  ❌ Failed to delete ${variantId}:`, error.message);
      }
    }

    console.log(`\n📊 Deletion Summary:`);
    console.log(`  - Variants processed: ${variantIds.length}`);
    console.log(`  - Successfully deleted: ${deletedCount}`);
    console.log(`  - Failed: ${variantIds.length - deletedCount}`);

    // Clean up the variants file
    fs.unlinkSync(variantsFile);
    console.log('🧹 Cleaned up variants file');

    console.log('\n✅ Variant deletion completed!');

  } catch (error) {
    console.error('❌ Variant deletion failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteVariants(); 