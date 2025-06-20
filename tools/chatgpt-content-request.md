# ChatGPT Content Request Template

Please provide professional content in the following JSON format. Each content item should be a separate JSON object that matches this schema:

```json
{
  "title": "string",
  "description": "string",
  "content": {
    // Type-specific content structure
  },
  "type": "WORK_EXPERIENCE | PROJECT | TECHNICAL_SKILL | SOFT_SKILL | EDUCATION | CERTIFICATION",
  "company": "string", // Optional, for work experience
  "position": "string", // Optional, for work experience
  "startDate": "YYYY-MM-DD", // Optional, for work experience, education, certification
  "endDate": "YYYY-MM-DD", // Optional, for work experience, education, certification
  "location": "string", // Optional, for work experience, education
  "skills": ["string"], // Array of relevant skills
  "achievements": ["string"], // Array of achievements or highlights
  "tagIds": [] // Leave empty, we'll handle tags separately
}
```

## Content Type Specific Structures

### 1. Work Experience
```json
{
  "title": "Senior Software Engineer",
  "description": "Led development of enterprise-scale applications",
  "content": {
    "responsibilities": [
      "Led a team of 5 developers in agile development",
      "Architected microservices using Node.js and TypeScript",
      "Implemented CI/CD pipelines reducing deployment time by 60%"
    ],
    "technologies": ["Node.js", "TypeScript", "React", "PostgreSQL", "Docker"],
    "achievements": [
      "Increased application performance by 40%",
      "Reduced bug reports by 50%",
      "Successfully delivered 15+ features ahead of schedule"
    ]
  },
  "type": "WORK_EXPERIENCE",
  "company": "Tech Company Inc",
  "position": "Senior Software Engineer",
  "startDate": "2022-01-01",
  "endDate": "2024-01-01",
  "location": "San Francisco, CA",
  "skills": ["Node.js", "TypeScript", "React", "Leadership", "Microservices"],
  "achievements": [
    "Led team of 5 developers",
    "40% performance improvement",
    "50% reduction in bugs"
  ],
  "tagIds": []
}
```

### 2. Project
```json
{
  "title": "E-commerce Platform",
  "description": "Built a scalable e-commerce solution",
  "content": {
    "description": "Full-stack e-commerce platform with React frontend and Node.js backend",
    "features": [
      "User authentication and authorization",
      "Product catalog with search and filtering",
      "Shopping cart and checkout process",
      "Payment integration with Stripe",
      "Admin dashboard for inventory management"
    ],
    "technologies": ["React", "Node.js", "Express", "MongoDB", "Stripe API"],
    "metrics": [
      "Handled 10,000+ concurrent users",
      "99.9% uptime",
      "Page load times under 2 seconds"
    ]
  },
  "type": "PROJECT",
  "startDate": "2023-03-01",
  "endDate": "2023-08-01",
  "skills": ["React", "Node.js", "MongoDB", "Stripe", "E-commerce"],
  "achievements": [
    "Built from scratch in 5 months",
    "Handles 10K+ concurrent users",
    "99.9% uptime maintained"
  ],
  "tagIds": []
}
```

### 3. Technical Skill
```json
{
  "title": "JavaScript/TypeScript",
  "description": "Advanced proficiency in JavaScript and TypeScript",
  "content": {
    "proficiencyLevel": "Expert",
    "yearsOfExperience": 8,
    "projects": [
      "E-commerce Platform",
      "Analytics Dashboard",
      "Real-time Chat Application"
    ],
    "keyConcepts": [
      "ES6+ Features",
      "TypeScript Type System",
      "Async Programming",
      "Design Patterns"
    ]
  },
  "type": "TECHNICAL_SKILL",
  "skills": ["JavaScript", "TypeScript", "ES6+", "Async Programming"],
  "achievements": [
    "8+ years experience",
    "Expert level",
    "Published npm packages"
  ],
  "tagIds": []
}
```

### 4. Soft Skill
```json
{
  "title": "Team Leadership",
  "description": "Experienced in leading and mentoring development teams",
  "content": {
    "proficiencyLevel": "Advanced",
    "yearsOfExperience": 5,
    "keyAreas": [
      "Team Management",
      "Mentoring",
      "Conflict Resolution",
      "Agile Leadership"
    ],
    "achievements": [
      "Led 3 successful project launches",
      "Mentored 10+ junior developers",
      "Improved team productivity by 30%"
    ]
  },
  "type": "SOFT_SKILL",
  "skills": ["Leadership", "Communication", "Mentoring", "Team Management"],
  "achievements": [
    "Led multiple successful teams",
    "Improved team productivity",
    "Successfully mentored junior developers"
  ],
  "tagIds": []
}
```

### 5. Education
```json
{
  "title": "Master of Science in Computer Science",
  "description": "Specialized in Software Engineering and AI",
  "content": {
    "degree": "MSc in Computer Science",
    "specialization": "Software Engineering and AI",
    "gpa": "3.8",
    "relevantCourses": [
      "Advanced Algorithms",
      "Machine Learning",
      "Software Architecture",
      "Distributed Systems"
    ],
    "thesis": "Machine Learning Applications in Software Development"
  },
  "type": "EDUCATION",
  "company": "University of Technology",
  "position": "Master's Degree",
  "startDate": "2018-09-01",
  "endDate": "2020-06-01",
  "location": "Boston, MA",
  "skills": ["Machine Learning", "Algorithms", "Software Architecture"],
  "achievements": [
    "Graduated with honors",
    "Published research paper",
    "Teaching Assistant for Algorithms course"
  ],
  "tagIds": []
}
```

### 6. Certification
```json
{
  "title": "AWS Certified Solutions Architect",
  "description": "Professional certification in AWS cloud architecture",
  "content": {
    "issuer": "Amazon Web Services",
    "certificationId": "AWS-123456",
    "validityPeriod": "2023-2026",
    "keyAreas": [
      "Cloud Architecture",
      "Security",
      "High Availability",
      "Cost Optimization"
    ],
    "examDetails": {
      "date": "2023-01-15",
      "score": "92%",
      "level": "Professional"
    }
  },
  "type": "CERTIFICATION",
  "company": "Amazon Web Services",
  "position": "Solutions Architect",
  "startDate": "2023-01-15",
  "endDate": "2026-01-15",
  "skills": ["AWS", "Cloud Architecture", "DevOps", "Security"],
  "achievements": [
    "Passed with 92% score",
    "Professional level certification",
    "Valid for 3 years"
  ],
  "tagIds": []
}
```

## How to Use This Template

1. Copy the relevant content type structure
2. Replace the placeholder values with your actual content
3. Ensure all dates are in YYYY-MM-DD format
4. Make sure skills and achievements are relevant to the content type
5. Keep the tagIds array empty as we'll handle tags separately

## Example ChatGPT Prompt

```
Please provide professional content for a software engineer's resume in the following format. I need:

1. Two work experiences as a senior software engineer
2. Three technical skills (focus on programming languages and frameworks)
3. One major project
4. One education entry (Master's in Computer Science)
5. Two certifications

Use the JSON structure provided in the template, ensuring all dates are in YYYY-MM-DD format and all arrays (skills, achievements) contain relevant items. Make the content realistic and professional.
```

## Notes

- All dates should be in YYYY-MM-DD format
- Skills should be specific and relevant to the content type
- Achievements should be quantifiable where possible
- Content should be realistic and professional
- Keep descriptions concise but informative
- Ensure all required fields are filled
- Leave tagIds as an empty array 