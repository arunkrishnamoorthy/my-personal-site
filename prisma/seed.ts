import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // ============================================================================
  // STEP 0: Clean existing data (for re-seeding)
  // ============================================================================
  console.log('\n🧹 Cleaning existing data...')

  // Delete in reverse order of foreign key dependencies
  await prisma.quizOption.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.lessonTakeaway.deleteMany()
  await prisma.lessonResource.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.unitObjective.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.courseLearningObjective.deleteMany()
  await prisma.coursePrerequisite.deleteMany()
  await prisma.courseTargetRole.deleteMany()
  await prisma.courseInstructor.deleteMany()
  await prisma.course.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.category.deleteMany()

  console.log('✅ Cleaned existing data')

  // ============================================================================
  // STEP 1: Seed Categories
  // ============================================================================
  console.log('\n📂 Seeding categories...')

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tutorial' },
      update: {},
      create: {
        name: 'Tutorial',
        slug: 'tutorial',
        description: 'Step-by-step tutorials and guides',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'abap' },
      update: {},
      create: {
        name: 'ABAP',
        slug: 'abap',
        description: 'Advanced Business Application Programming',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ui5' },
      update: {},
      create: {
        name: 'UI5',
        slug: 'ui5',
        description: 'SAPUI5 and Fiori development',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'btp' },
      update: {},
      create: {
        name: 'BTP',
        slug: 'btp',
        description: 'SAP Business Technology Platform',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cap' },
      update: {},
      create: {
        name: 'CAP',
        slug: 'cap',
        description: 'Cloud Application Programming Model',
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // ============================================================================
  // STEP 2: Seed Instructor (You!)
  // ============================================================================
  console.log('\n👨‍🏫 Seeding instructors...')

  const instructor = await prisma.instructor.upsert({
    where: { slug: 'arun-krishnamoorthy' },
    update: {},
    create: {
      name: 'Arun Krishnamoorthy',
      slug: 'arun-krishnamoorthy',
      bio: 'SAP Technology Consultant with expertise in ABAP, UI5, BTP, and Cloud Application Programming. Passionate about teaching and sharing knowledge with the SAP community.',
      title: 'SAP Technology Consultant',
      email: 'contact@example.com', // Update with your actual email
    },
  })

  console.log(`✅ Created instructor: ${instructor.name}`)

  // ============================================================================
  // STEP 3: Seed UI5 Course
  // ============================================================================
  console.log('\n📚 Seeding UI5 Beginner Course...')

  const ui5Course = await prisma.course.upsert({
    where: { slug: 'beginners-guide-to-sapui5' },
    update: {},
    create: {
      slug: 'beginners-guide-to-sapui5',
      title: 'Beginners Guide to SAP UI5',
      description:
        'Master SAP UI5 from scratch with practical examples and hands-on projects.',
      overview: `This comprehensive course is designed for beginners who want to master SAP UI5 development. You'll learn everything from basic concepts to advanced techniques, including:

- Understanding the MVC architecture
- Working with data binding and models
- Building responsive UIs with controls
- Implementing routing and navigation
- Best practices and real-world scenarios

By the end of this course, you'll be able to build professional SAP Fiori applications using SAPUI5.`,
      difficulty_level: 'Beginner',
      icon_text: 'UI5',
      tailwind_color: 'border-blue-500',
      total_units: 5,
      total_lessons: 21,
      total_duration_mins: 180,
      student_count: 1200,
      course_type: 'video',
      is_free: true,
      is_published: true,
      sequence_order: 1,
      category_id: categories.find((c) => c.slug === 'ui5')?.id,
    },
  })

  console.log(`✅ Created course: ${ui5Course.title}`)

  // Link instructor to course
  await prisma.courseInstructor.upsert({
    where: {
      course_id_instructor_id: {
        course_id: ui5Course.id,
        instructor_id: instructor.id,
      },
    },
    update: {},
    create: {
      course_id: ui5Course.id,
      instructor_id: instructor.id,
      role: 'Lead Instructor',
      sequence_order: 0,
    },
  })

  // Add course learning objectives
  const objectives = [
    'Understand the fundamentals of SAP UI5 and Fiori',
    'Master MVC architecture and design patterns',
    'Build responsive and professional UIs',
    'Implement data binding and CRUD operations',
    'Deploy and test UI5 applications',
  ]

  for (let i = 0; i < objectives.length; i++) {
    await prisma.courseLearningObjective.create({
      data: {
        course_id: ui5Course.id,
        objective_text: objectives[i],
        sequence_order: i,
      },
    })
  }

  // Add target roles
  const roles = ['Developer', 'Consultant', 'Technical Architect']
  for (const role of roles) {
    await prisma.courseTargetRole.create({
      data: {
        course_id: ui5Course.id,
        role_name: role,
      },
    })
  }

  // Add prerequisites
  const prerequisites = [
    'Basic understanding of JavaScript',
    'Familiarity with HTML and CSS',
    'Experience with web development concepts',
  ]

  for (let i = 0; i < prerequisites.length; i++) {
    await prisma.coursePrerequisite.create({
      data: {
        course_id: ui5Course.id,
        prerequisite_text: prerequisites[i],
        sequence_order: i,
      },
    })
  }

  // ============================================================================
  // STEP 4: Seed Units for UI5 Course
  // ============================================================================
  console.log('\n📖 Seeding course units...')

  const units = [
    {
      slug: 'introduction',
      title: 'Introduction to SAP UI5',
      description: 'Get started with SAP UI5 fundamentals',
      lessons: 2,
      duration: 40,
      objectives: [
        'Understand what SAP UI5 is and its core features',
        'Set up development environment',
        'Explore MVC architecture',
      ],
    },
    {
      slug: 'data-binding',
      title: 'Understanding Data Binding in UI5',
      description: 'Master data binding concepts in UI5',
      lessons: 3,
      duration: 45,
      objectives: [
        'Learn about different binding modes',
        'Implement property and aggregation binding',
        'Work with expression binding',
      ],
    },
    {
      slug: 'models',
      title: 'Working with Models',
      description: 'Master data management in UI5',
      lessons: 5,
      duration: 60,
      objectives: [
        'Understand JSON and OData models',
        'Implement CRUD operations',
        'Handle data validation',
      ],
    },
    {
      slug: 'controllers',
      title: 'Controllers and Logic',
      description: 'Implement business logic in controllers',
      lessons: 6,
      duration: 55,
      objectives: [
        'Create controller methods',
        'Handle user events',
        'Implement formatters and validators',
      ],
    },
    {
      slug: 'routing',
      title: 'Routing and Navigation',
      description: 'Build multi-page applications',
      lessons: 4,
      duration: 50,
      objectives: [
        'Configure routing in manifest.json',
        'Implement navigation between views',
        'Handle route parameters',
      ],
    },
  ]

  for (let i = 0; i < units.length; i++) {
    const unit = await prisma.unit.create({
      data: {
        course_id: ui5Course.id,
        slug: units[i].slug,
        title: units[i].title,
        description: units[i].description,
        sequence_order: i,
        total_lessons: units[i].lessons,
        total_duration_mins: units[i].duration,
      },
    })

    console.log(`  ✅ Created unit: ${unit.title}`)

    // Add unit objectives
    for (let j = 0; j < units[i].objectives.length; j++) {
      await prisma.unitObjective.create({
        data: {
          unit_id: unit.id,
          objective_text: units[i].objectives[j],
          sequence_order: j,
        },
      })
    }

    // Add lessons for each unit
    await seedLessonsForUnit(unit.id, ui5Course.id, units[i].slug, units[i].lessons)
  }

  // ============================================================================
  // STEP 5: Seed CAP Course
  // ============================================================================
  console.log('\n📚 Seeding CAP Beginner Course...')

  const capCourse = await prisma.course.upsert({
    where: { slug: 'beginners-guide-to-cap' },
    update: {},
    create: {
      slug: 'beginners-guide-to-cap',
      title: 'Beginner Guide to CAP',
      description:
        'Learn SAP Cloud Application Programming Model from the ground up with practical examples.',
      overview: `This course introduces you to the SAP Cloud Application Programming Model (CAP), a framework of languages, libraries, and tools for building enterprise-grade services and applications. You'll learn:

- CAP fundamentals and architecture
- Creating data models with CDS
- Building services and APIs
- Deploying to SAP BTP
- Best practices for cloud-native development

Perfect for developers who want to build modern cloud applications on SAP BTP.`,
      difficulty_level: 'Beginner',
      icon_text: 'CAP',
      tailwind_color: 'border-purple-500',
      total_units: 4,
      total_lessons: 16,
      total_duration_mins: 150,
      student_count: 850,
      course_type: 'video',
      is_free: true,
      is_published: true,
      sequence_order: 2,
      category_id: categories.find((c) => c.slug === 'cap')?.id,
    },
  })

  console.log(`✅ Created course: ${capCourse.title}`)

  // Link instructor to CAP course
  await prisma.courseInstructor.upsert({
    where: {
      course_id_instructor_id: {
        course_id: capCourse.id,
        instructor_id: instructor.id,
      },
    },
    update: {},
    create: {
      course_id: capCourse.id,
      instructor_id: instructor.id,
      role: 'Lead Instructor',
      sequence_order: 0,
    },
  })

  // CAP Learning objectives
  const capObjectives = [
    'Understand the Cloud Application Programming Model',
    'Create data models using Core Data Services (CDS)',
    'Build RESTful and OData services',
    'Implement business logic with Node.js',
    'Deploy applications to SAP BTP',
  ]

  for (let i = 0; i < capObjectives.length; i++) {
    await prisma.courseLearningObjective.create({
      data: {
        course_id: capCourse.id,
        objective_text: capObjectives[i],
        sequence_order: i,
      },
    })
  }

  // CAP Target roles
  const capRoles = ['Cloud Developer', 'Full-Stack Developer', 'BTP Consultant']
  for (const role of capRoles) {
    await prisma.courseTargetRole.create({
      data: {
        course_id: capCourse.id,
        role_name: role,
      },
    })
  }

  // CAP Prerequisites
  const capPrerequisites = [
    'Basic understanding of JavaScript/Node.js',
    'Familiarity with databases and SQL',
    'Understanding of REST APIs',
  ]

  for (let i = 0; i < capPrerequisites.length; i++) {
    await prisma.coursePrerequisite.create({
      data: {
        course_id: capCourse.id,
        prerequisite_text: capPrerequisites[i],
        sequence_order: i,
      },
    })
  }

  // CAP Units
  const capUnits = [
    {
      slug: 'cap-introduction',
      title: 'Introduction to CAP',
      description: 'Understanding CAP fundamentals and architecture',
      lessons: 3,
      duration: 35,
      objectives: [
        'Learn what CAP is and why to use it',
        'Understand CAP architecture',
        'Set up CAP development environment',
      ],
    },
    {
      slug: 'cds-data-models',
      title: 'CDS Data Modeling',
      description: 'Creating data models with Core Data Services',
      lessons: 5,
      duration: 50,
      objectives: [
        'Define entities and associations',
        'Work with types and aspects',
        'Implement data validation',
      ],
    },
    {
      slug: 'services-apis',
      title: 'Building Services',
      description: 'Creating RESTful and OData services',
      lessons: 5,
      duration: 45,
      objectives: [
        'Create service definitions',
        'Implement custom handlers',
        'Add authorization and authentication',
      ],
    },
    {
      slug: 'deployment',
      title: 'Deployment to BTP',
      description: 'Deploying CAP applications to SAP BTP',
      lessons: 3,
      duration: 20,
      objectives: [
        'Configure deployment descriptors',
        'Deploy to Cloud Foundry',
        'Monitor and troubleshoot applications',
      ],
    },
  ]

  for (let i = 0; i < capUnits.length; i++) {
    const unit = await prisma.unit.create({
      data: {
        course_id: capCourse.id,
        slug: capUnits[i].slug,
        title: capUnits[i].title,
        description: capUnits[i].description,
        sequence_order: i,
        total_lessons: capUnits[i].lessons,
        total_duration_mins: capUnits[i].duration,
      },
    })

    console.log(`  ✅ Created unit: ${unit.title}`)

    for (let j = 0; j < capUnits[i].objectives.length; j++) {
      await prisma.unitObjective.create({
        data: {
          unit_id: unit.id,
          objective_text: capUnits[i].objectives[j],
          sequence_order: j,
        },
      })
    }

    await seedLessonsForUnit(unit.id, capCourse.id, capUnits[i].slug, capUnits[i].lessons)
  }

  // ============================================================================
  // STEP 6: Seed AI Agents Course
  // ============================================================================
  console.log('\n📚 Seeding AI Agents Course...')

  const aiCourse = await prisma.course.upsert({
    where: { slug: 'building-ai-agents-sap-ai-core' },
    update: {},
    create: {
      slug: 'building-ai-agents-sap-ai-core',
      title: 'Building Your First AI Agents using SAP AI Core',
      description:
        'Learn to build intelligent AI agents leveraging SAP AI Core and BTP services.',
      overview: `Dive into the world of AI and machine learning on SAP BTP! This course teaches you how to build your first AI agents using SAP AI Core. You'll learn:

- Introduction to SAP AI Core and AI Launchpad
- Understanding AI workflows and pipelines
- Building and training machine learning models
- Deploying AI models as services
- Integrating AI capabilities into applications
- Monitoring and managing AI agents

Perfect for developers looking to add AI capabilities to their SAP applications.`,
      difficulty_level: 'Intermediate',
      icon_text: 'AI',
      tailwind_color: 'border-teal-500',
      total_units: 5,
      total_lessons: 18,
      total_duration_mins: 160,
      student_count: 620,
      course_type: 'video',
      is_free: false,
      price: 99.99,
      is_published: true,
      sequence_order: 3,
      category_id: categories.find((c) => c.slug === 'btp')?.id,
    },
  })

  console.log(`✅ Created course: ${aiCourse.title}`)

  // Link instructor to AI course
  await prisma.courseInstructor.upsert({
    where: {
      course_id_instructor_id: {
        course_id: aiCourse.id,
        instructor_id: instructor.id,
      },
    },
    update: {},
    create: {
      course_id: aiCourse.id,
      instructor_id: instructor.id,
      role: 'Lead Instructor',
      sequence_order: 0,
    },
  })

  // AI Learning objectives
  const aiObjectives = [
    'Understand SAP AI Core architecture and capabilities',
    'Build and train machine learning models',
    'Deploy AI models as scalable services',
    'Integrate AI capabilities into SAP applications',
    'Monitor and optimize AI agent performance',
  ]

  for (let i = 0; i < aiObjectives.length; i++) {
    await prisma.courseLearningObjective.create({
      data: {
        course_id: aiCourse.id,
        objective_text: aiObjectives[i],
        sequence_order: i,
      },
    })
  }

  // AI Target roles
  const aiRoles = ['AI Developer', 'Data Scientist', 'BTP Architect', 'ML Engineer']
  for (const role of aiRoles) {
    await prisma.courseTargetRole.create({
      data: {
        course_id: aiCourse.id,
        role_name: role,
      },
    })
  }

  // AI Prerequisites
  const aiPrerequisites = [
    'Basic understanding of Python and machine learning concepts',
    'Familiarity with SAP BTP',
    'Experience with REST APIs',
    'Understanding of cloud computing',
  ]

  for (let i = 0; i < aiPrerequisites.length; i++) {
    await prisma.coursePrerequisite.create({
      data: {
        course_id: aiCourse.id,
        prerequisite_text: aiPrerequisites[i],
        sequence_order: i,
      },
    })
  }

  // AI Units
  const aiUnits = [
    {
      slug: 'ai-core-introduction',
      title: 'Introduction to SAP AI Core',
      description: 'Understanding AI Core and its capabilities',
      lessons: 3,
      duration: 30,
      objectives: [
        'Understand SAP AI Core architecture',
        'Set up AI Core and AI Launchpad',
        'Explore AI workflows and scenarios',
      ],
    },
    {
      slug: 'ml-pipelines',
      title: 'Machine Learning Pipelines',
      description: 'Building ML pipelines and workflows',
      lessons: 4,
      duration: 40,
      objectives: [
        'Create training pipelines',
        'Manage datasets and artifacts',
        'Configure hyperparameters',
      ],
    },
    {
      slug: 'model-training',
      title: 'Training AI Models',
      description: 'Training and validating ML models',
      lessons: 4,
      duration: 35,
      objectives: [
        'Prepare training data',
        'Train classification and regression models',
        'Validate model accuracy',
      ],
    },
    {
      slug: 'model-deployment',
      title: 'Deploying AI Models',
      description: 'Deploying models as scalable services',
      lessons: 4,
      duration: 30,
      objectives: [
        'Create deployment configurations',
        'Deploy models to AI Core',
        'Test deployed models via APIs',
      ],
    },
    {
      slug: 'integration-monitoring',
      title: 'Integration and Monitoring',
      description: 'Integrating AI into apps and monitoring',
      lessons: 3,
      duration: 25,
      objectives: [
        'Integrate AI services into applications',
        'Monitor model performance',
        'Implement feedback loops',
      ],
    },
  ]

  for (let i = 0; i < aiUnits.length; i++) {
    const unit = await prisma.unit.create({
      data: {
        course_id: aiCourse.id,
        slug: aiUnits[i].slug,
        title: aiUnits[i].title,
        description: aiUnits[i].description,
        sequence_order: i,
        total_lessons: aiUnits[i].lessons,
        total_duration_mins: aiUnits[i].duration,
      },
    })

    console.log(`  ✅ Created unit: ${unit.title}`)

    for (let j = 0; j < aiUnits[i].objectives.length; j++) {
      await prisma.unitObjective.create({
        data: {
          unit_id: unit.id,
          objective_text: aiUnits[i].objectives[j],
          sequence_order: j,
        },
      })
    }

    await seedLessonsForUnit(unit.id, aiCourse.id, aiUnits[i].slug, aiUnits[i].lessons)
  }

  // ============================================================================
  // STEP 7: Seed ABAP Course
  // ============================================================================
  console.log('\n📚 Seeding ABAP Basics Course...')

  const abapCourse = await prisma.course.upsert({
    where: { slug: 'basics-of-abap-for-beginners' },
    update: {},
    create: {
      slug: 'basics-of-abap-for-beginners',
      title: 'Basics of ABAP for Beginners',
      description:
        'Master ABAP programming fundamentals and start building SAP applications with confidence.',
      overview: `This comprehensive beginner course covers everything you need to know to start programming in ABAP. You'll learn:

- ABAP syntax and data types
- Control structures and logic flow
- Working with internal tables
- Database operations and Open SQL
- Object-Oriented ABAP basics
- Debugging and troubleshooting
- SAP standard programs and transactions

By the end, you'll be able to write, test, and debug ABAP programs independently.`,
      difficulty_level: 'Beginner',
      icon_text: 'ABAP',
      tailwind_color: 'border-green-500',
      total_units: 6,
      total_lessons: 24,
      total_duration_mins: 200,
      student_count: 1500,
      course_type: 'video',
      is_free: true,
      is_published: true,
      sequence_order: 4,
      category_id: categories.find((c) => c.slug === 'abap')?.id,
    },
  })

  console.log(`✅ Created course: ${abapCourse.title}`)

  // Link instructor to ABAP course
  await prisma.courseInstructor.upsert({
    where: {
      course_id_instructor_id: {
        course_id: abapCourse.id,
        instructor_id: instructor.id,
      },
    },
    update: {},
    create: {
      course_id: abapCourse.id,
      instructor_id: instructor.id,
      role: 'Lead Instructor',
      sequence_order: 0,
    },
  })

  // ABAP Learning objectives
  const abapObjectives = [
    'Understand ABAP syntax and programming fundamentals',
    'Work with data types, variables, and structures',
    'Master internal tables and data manipulation',
    'Perform database operations using Open SQL',
    'Apply Object-Oriented ABAP concepts',
    'Debug and troubleshoot ABAP programs effectively',
  ]

  for (let i = 0; i < abapObjectives.length; i++) {
    await prisma.courseLearningObjective.create({
      data: {
        course_id: abapCourse.id,
        objective_text: abapObjectives[i],
        sequence_order: i,
      },
    })
  }

  // ABAP Target roles
  const abapRoles = ['ABAP Developer', 'SAP Consultant', 'Technical Analyst']
  for (const role of abapRoles) {
    await prisma.courseTargetRole.create({
      data: {
        course_id: abapCourse.id,
        role_name: role,
      },
    })
  }

  // ABAP Prerequisites
  const abapPrerequisites = [
    'Basic understanding of programming concepts',
    'Access to SAP system or SAP trial environment',
    'Familiarity with SAP GUI',
  ]

  for (let i = 0; i < abapPrerequisites.length; i++) {
    await prisma.coursePrerequisite.create({
      data: {
        course_id: abapCourse.id,
        prerequisite_text: abapPrerequisites[i],
        sequence_order: i,
      },
    })
  }

  // ABAP Units
  const abapUnits = [
    {
      slug: 'abap-fundamentals',
      title: 'ABAP Fundamentals',
      description: 'Getting started with ABAP programming',
      lessons: 4,
      duration: 35,
      objectives: [
        'Understand ABAP development environment',
        'Learn ABAP syntax and structure',
        'Create your first ABAP program',
      ],
    },
    {
      slug: 'data-types-variables',
      title: 'Data Types and Variables',
      description: 'Working with ABAP data types',
      lessons: 4,
      duration: 30,
      objectives: [
        'Declare variables and constants',
        'Work with elementary and complex types',
        'Use structures and nested structures',
      ],
    },
    {
      slug: 'control-structures',
      title: 'Control Structures',
      description: 'Implementing program logic and flow',
      lessons: 4,
      duration: 35,
      objectives: [
        'Use IF, CASE, and loop statements',
        'Implement nested logic',
        'Handle exceptions',
      ],
    },
    {
      slug: 'internal-tables',
      title: 'Internal Tables',
      description: 'Mastering internal table operations',
      lessons: 5,
      duration: 40,
      objectives: [
        'Declare and initialize internal tables',
        'Perform CRUD operations',
        'Use table operations and built-in functions',
      ],
    },
    {
      slug: 'database-operations',
      title: 'Database Operations',
      description: 'Working with SAP database tables',
      lessons: 4,
      duration: 35,
      objectives: [
        'Understand Open SQL basics',
        'Perform SELECT, INSERT, UPDATE, DELETE',
        'Join tables and use subqueries',
      ],
    },
    {
      slug: 'oop-debugging',
      title: 'OOP and Debugging',
      description: 'Object-Oriented ABAP and debugging',
      lessons: 3,
      duration: 25,
      objectives: [
        'Understand classes and objects',
        'Use inheritance and interfaces',
        'Debug ABAP programs effectively',
      ],
    },
  ]

  for (let i = 0; i < abapUnits.length; i++) {
    const unit = await prisma.unit.create({
      data: {
        course_id: abapCourse.id,
        slug: abapUnits[i].slug,
        title: abapUnits[i].title,
        description: abapUnits[i].description,
        sequence_order: i,
        total_lessons: abapUnits[i].lessons,
        total_duration_mins: abapUnits[i].duration,
      },
    })

    console.log(`  ✅ Created unit: ${unit.title}`)

    for (let j = 0; j < abapUnits[i].objectives.length; j++) {
      await prisma.unitObjective.create({
        data: {
          unit_id: unit.id,
          objective_text: abapUnits[i].objectives[j],
          sequence_order: j,
        },
      })
    }

    await seedLessonsForUnit(unit.id, abapCourse.id, abapUnits[i].slug, abapUnits[i].lessons)
  }

  // ============================================================================
  // STEP 8: Seed Sample Blog Posts (Optional)
  // ============================================================================
  console.log('\n📝 Seeding sample blog posts...')

  await prisma.blogPost.create({
    data: {
      slug: 'getting-started-with-sapui5',
      title: 'Getting Started with SAPUI5',
      summary: 'A comprehensive guide to starting your SAPUI5 development journey',
      content: `# Getting Started with SAPUI5

SAPUI5 is a powerful JavaScript framework for building enterprise-ready web applications. In this guide, we'll explore the fundamentals.

## What is SAPUI5?

SAPUI5 is an HTML5 framework for building responsive web applications...

## Setting Up Your Environment

Follow these steps to set up your development environment...`,
      category_id: categories.find((c) => c.slug === 'ui5')?.id,
      published_at: new Date('2026-01-15'),
      is_published: true,
      view_count: 250,
      read_time_mins: 5,
    },
  })

  console.log('✅ Created sample blog post')

  // ============================================================================
  // DONE!
  // ============================================================================
  console.log('\n✨ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - ${categories.length} categories`)
  console.log(`  - 1 instructor`)
  console.log(`  - 4 courses (UI5, CAP, AI Agents, ABAP)`)
  console.log(`  - 20 units total`)
  console.log(`  - ~79 lessons total`)
  console.log(`  - 1 blog post`)
}

// Helper function to seed lessons for a unit
async function seedLessonsForUnit(
  unitId: number,
  courseId: number,
  unitSlug: string,
  lessonCount: number
) {
  // Sample lesson data - you can customize this based on your actual content
  const lessonTemplates = [
    {
      title: 'Introduction Video',
      lesson_type: 'video',
      youtube_id: 'EmIht4R6xV4',
      duration: 5,
      takeaways: [
        'Understanding the basics',
        'Key concepts overview',
        'Practical applications',
      ],
    },
    {
      title: 'Hands-on Demo',
      lesson_type: 'video',
      youtube_id: 'EmIht4R6xV4',
      duration: 10,
      takeaways: ['Step-by-step implementation', 'Code examples', 'Best practices'],
    },
    {
      title: 'Quiz',
      lesson_type: 'quiz',
      duration: 5,
      takeaways: [],
    },
  ]

  for (let i = 0; i < lessonCount; i++) {
    const template = lessonTemplates[i % lessonTemplates.length]
    const isQuiz = template.lesson_type === 'quiz'

    const lesson = await prisma.lesson.create({
      data: {
        course_id: courseId,
        unit_id: unitId,
        slug: `${unitSlug}-lesson-${i + 1}`,
        title: `${template.title} ${i + 1}`,
        sequence_order: i,
        youtube_id: template.youtube_id,
        video_duration_mins: template.duration,
        lesson_type: template.lesson_type,
        is_published: true,
        is_preview: i === 0, // First lesson is free preview
      },
    })

    // Add takeaways for video lessons
    if (!isQuiz && template.takeaways.length > 0) {
      for (let j = 0; j < template.takeaways.length; j++) {
        await prisma.lessonTakeaway.create({
          data: {
            lesson_id: lesson.id,
            takeaway_text: template.takeaways[j],
            sequence_order: j,
          },
        })
      }
    }

    // Add quiz for quiz lessons
    if (isQuiz) {
      await seedQuizForLesson(lesson.id)
    }
  }
}

// Helper function to seed quiz
async function seedQuizForLesson(lessonId: number) {
  const quiz = await prisma.quiz.create({
    data: {
      lesson_id: lessonId,
      title: 'Test Your Knowledge',
      description: 'Complete this quiz to test your understanding of the concepts',
      passing_score: 70,
      max_attempts: 3,
      time_limit_mins: 10,
      is_required: true,
    },
  })

  // Add 3 sample questions
  for (let i = 0; i < 3; i++) {
    const question = await prisma.quizQuestion.create({
      data: {
        quiz_id: quiz.id,
        question_text: `Sample question ${i + 1}: What is a key concept in this lesson?`,
        question_type: 'multiple_choice',
        points: 1,
        sequence_order: i,
        explanation: 'This concept is fundamental to understanding the topic.',
      },
    })

    // Add 4 options
    const options = [
      { text: 'Correct answer', is_correct: true },
      { text: 'Incorrect option A', is_correct: false },
      { text: 'Incorrect option B', is_correct: false },
      { text: 'Incorrect option C', is_correct: false },
    ]

    for (let j = 0; j < options.length; j++) {
      await prisma.quizOption.create({
        data: {
          question_id: question.id,
          option_text: options[j].text,
          is_correct: options[j].is_correct,
          sequence_order: j,
        },
      })
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
