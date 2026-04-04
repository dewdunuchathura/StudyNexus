const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:2003511@cluster1.fmllswt.mongodb.net/itpmDB')
  .then(() => {
    console.log('MongoDB connected');
    addPDFsToExistingResources();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function addPDFsToExistingResources() {
  try {
    // Find all resources that don't have PDF files
    const resourcesWithoutPDF = await Resource.find({
      $or: [
        { filePath: { $exists: false } },
        { filePath: null },
        { filePath: '' }
      ]
    });

    console.log(`Found ${resourcesWithoutPDF.length} resources without PDFs`);

    // Sample PDF data
    const samplePDFs = [
      {
        fileName: 'Introduction_to_Machine_Learning.pdf',
        fileSize: '2.45 MB',
        filePath: 'uploads/sample-Introduction_to_Machine_Learning.pdf'
      },
      {
        fileName: 'Data_Structures_and_Algorithms.pdf',
        fileSize: '3.12 MB',
        filePath: 'uploads/sample-Data_Structures_and_Algorithms.pdf'
      },
      {
        fileName: 'Web_Development_Basics.pdf',
        fileSize: '1.89 MB',
        filePath: 'uploads/sample-Web_Development_Basics.pdf'
      },
      {
        fileName: 'Database_Design_Principles.pdf',
        fileSize: '2.67 MB',
        filePath: 'uploads/sample-Database_Design_Principles.pdf'
      },
      {
        fileName: 'Software_Engineering_Fundamentals.pdf',
        fileSize: '3.45 MB',
        filePath: 'uploads/sample-Software_Engineering_Fundamentals.pdf'
      }
    ];

    // Update each resource with a sample PDF
    for (let i = 0; i < resourcesWithoutPDF.length && i < samplePDFs.length; i++) {
      const resource = resourcesWithoutPDF[i];
      const pdfData = samplePDFs[i];
      
      await Resource.findByIdAndUpdate(resource._id, {
        $set: pdfData
      });
      
      console.log(`Updated resource "${resource.title}" with PDF: ${pdfData.fileName}`);
    }

    console.log('Successfully added PDFs to existing resources!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding PDFs to resources:', error);
    process.exit(1);
  }
}
