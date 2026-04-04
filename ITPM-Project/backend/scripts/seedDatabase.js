const mongoose = require('mongoose');
const Resource = require('../models/Resource');

// Sample data
const sampleResources = [
  {
    title: "Introduction to Machine Learning",
    category: "Computer Science",
    description: "A comprehensive guide covering the basics of machine learning algorithms and their applications in real-world scenarios.",
    author: "Dr. Sarah Johnson",
    authorEmail: "sarah.johnson@university.edu",
    fileName: "ml-intro.pdf",
    fileSize: "2.4 MB",
    status: "approved",
    views: 389,
    downloads: 145,
    likes: 45,
    comments: [
      {
        id: "1",
        author: "John Doe",
        text: "Great resource! Very helpful for my studies.",
        date: new Date("2024-03-16")
      },
      {
        id: "2",
        author: "Jane Smith",
        text: "The examples are clear and easy to understand.",
        date: new Date("2024-03-17")
      }
    ],
    reports: [],
    uploadDate: new Date("2024-03-15")
  },
  {
    title: "Advanced Calculus Notes",
    category: "Mathematics",
    description: "Detailed notes on differential and integral calculus with solved examples and practice problems.",
    author: "Prof. Michael Chen",
    authorEmail: "michael.chen@university.edu",
    fileName: "calculus-notes.pdf",
    fileSize: "1.8 MB",
    status: "approved",
    views: 234,
    downloads: 89,
    likes: 32,
    comments: [
      {
        id: "3",
        author: "Alice Brown",
        text: "These notes saved my exam preparation!",
        date: new Date("2024-03-15")
      }
    ],
    reports: [],
    uploadDate: new Date("2024-03-14")
  },
  {
    title: "Physics Laboratory Manual",
    category: "Physics",
    description: "Complete lab manual with experiments, procedures, and safety guidelines for undergraduate physics courses.",
    author: "Dr. Robert Wilson",
    authorEmail: "robert.wilson@university.edu",
    fileName: "physics-lab.pdf",
    fileSize: "3.1 MB",
    status: "pending",
    views: 156,
    downloads: 67,
    likes: 28,
    comments: [],
    reports: [],
    uploadDate: new Date("2024-03-13")
  },
  {
    title: "Controversial Theory Paper",
    category: "Biology",
    description: "A paper discussing controversial biological theories with limited evidence and experimental data.",
    author: "Anonymous User",
    authorEmail: "anonymous@email.com",
    fileName: "controversial-theory.pdf",
    fileSize: "1.2 MB",
    status: "reported",
    views: 45,
    downloads: 23,
    likes: 5,
    comments: [],
    reports: [
      {
        id: "1",
        reporter: "John Doe",
        reason: "Inappropriate content",
        description: "Contains unverified scientific claims",
        date: new Date("2024-03-13")
      },
      {
        id: "2",
        reporter: "Jane Smith",
        reason: "Misleading information",
        description: "Theories presented are not scientifically backed",
        date: new Date("2024-03-14")
      }
    ],
    uploadDate: new Date("2024-03-12")
  },
  {
    title: "Chemistry Formulas Cheat Sheet",
    category: "Chemistry",
    description: "Quick reference guide for common chemistry formulas and equations with examples.",
    author: "Dr. Emily Brown",
    authorEmail: "emily.brown@university.edu",
    fileName: "chemistry-formulas.pdf",
    fileSize: "0.8 MB",
    status: "approved",
    views: 567,
    downloads: 201,
    likes: 67,
    comments: [
      {
        id: "4",
        author: "Student A",
        text: "Very useful for quick reference during exams!",
        date: new Date("2024-03-11")
      },
      {
        id: "5",
        author: "Student B",
        text: "Clear and well-organized formulas.",
        date: new Date("2024-03-12")
      }
    ],
    reports: [],
    uploadDate: new Date("2024-03-11")
  },
  {
    title: "Engineering Mathematics Fundamentals",
    category: "Engineering",
    description: "Essential mathematical concepts and techniques for engineering students with practical applications.",
    author: "Prof. David Martinez",
    authorEmail: "david.martinez@university.edu",
    fileName: "eng-math-fundamentals.pdf",
    fileSize: "4.2 MB",
    status: "approved",
    views: 312,
    downloads: 98,
    likes: 41,
    comments: [
      {
        id: "6",
        author: "Engineering Student",
        text: "Perfect for my engineering math course!",
        date: new Date("2024-03-10")
      }
    ],
    reports: [],
    uploadDate: new Date("2024-03-10")
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:2003511@cluster1.fmllswt.mongodb.net/itpmDB');
    console.log('Connected to MongoDB');

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Insert sample resources
    const insertedResources = await Resource.insertMany(sampleResources);
    console.log(`Inserted ${insertedResources.length} sample resources`);

    // Display inserted resources
    console.log('\nSample Resources:');
    insertedResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title} (${resource.category}) - ${resource.status}`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase seeded successfully!');
    console.log('Connection closed');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
