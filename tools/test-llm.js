const API_BASE = 'http://localhost:3000/api';

async function testLLMIntegration() {
  console.log('Testing LLM Integration with Anthropic...\n');
  
  try {
    // Test 1: Get Provider Info
    console.log('1. Testing provider info...');
    const providerResponse = await fetch(`${API_BASE}/llm/provider`);
    const providerInfo = await providerResponse.json();
    console.log('   Provider:', providerInfo);
    
    if (providerInfo.name !== 'anthropic') {
      console.log('   Expected Anthropic provider, got:', providerInfo.name);
    } else {
      console.log('   Anthropic provider configured correctly');
    }
    
    // Test 2: Simple Job Analysis
    console.log('\n2. Testing job analysis...');
    const jobText = `
Senior Full Stack Developer
TechCorp Inc.
San Francisco, CA

We are seeking a Senior Full Stack Developer with 5+ years of experience in Node.js, React, and TypeScript. The ideal candidate will have experience with cloud platforms (AWS/Azure), microservices architecture, and leadership experience.

Requirements:
- 5+ years of software development experience
- Strong proficiency in JavaScript/TypeScript
- Experience with React and Node.js
- Knowledge of cloud platforms (AWS, Azure, GCP)
- Experience with microservices and API design
- Leadership and mentoring experience preferred
`;

    const analysisResponse = await fetch(`${API_BASE}/llm/analyze-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobText }),
    });
    
    const analysisResult = await analysisResponse.json();
    
    if (analysisResult.success) {
      console.log('   Job analysis successful!');
      console.log('   Job Title:', analysisResult.data.title);
      console.log('   Company:', analysisResult.data.company);
      console.log('   Skills Found:', analysisResult.data.skills.slice(0, 5).join(', '));
      console.log('   Experience Level:', analysisResult.data.experienceLevel);
    } else {
      console.log('   Job analysis failed:', analysisResult.error);
    }
    
    // Test 3: Content Matching
    console.log('\n3. Testing content matching...');
    
    const mockUserContent = [
      {
        id: '1',
        title: 'Lead Software Architect',
        type: 'WORK_EXPERIENCE',
        skills: ['Node.js', 'TypeScript', 'React', 'AWS', 'Leadership'],
        description: 'Led development of scalable web applications'
      },
      {
        id: '2',
        title: 'JavaScript/TypeScript Skills',
        type: 'TECHNICAL_SKILL',
        skills: ['JavaScript', 'TypeScript'],
        description: 'Advanced proficiency in JavaScript and TypeScript'
      }
    ];
    
    const jobRequirements = [
      '5+ years of software development experience',
      'Strong proficiency in JavaScript/TypeScript',
      'Experience with React and Node.js',
      'Leadership and mentoring experience'
    ];
    
    const matchResponse = await fetch(`${API_BASE}/llm/match-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobRequirements,
        userContent: mockUserContent,
        jobDescription: jobText
      }),
    });
    
    const matchResult = await matchResponse.json();
    
    if (matchResult.success) {
      console.log('   ✅ Content matching successful!');
      matchResult.data.forEach(match => {
        console.log(`   Content "${match.contentId}": ${match.score}% match`);
        if (match.reasons && match.reasons.length > 0) {
          console.log(`     Reasons: ${match.reasons[0]}`);
        }
      });
    } else {
      console.log('   ❌ Content matching failed:', matchResult.error);
    }
    
    console.log('\n🎉 LLM Integration Test Complete!');
    
    if (analysisResult.success && matchResult.success) {
      console.log('✅ All tests passed! Your Anthropic integration is working properly.');
    } else {
      console.log('⚠️  Some tests failed. Check your ANTHROPIC_API_KEY in .env file.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   • Backend server is running on http://localhost:3000');
    console.log('   • ANTHROPIC_API_KEY is set in your .env file');
    console.log('   • LLM_PROVIDER=anthropic in your .env file');
  }
}

// Run the test
testLLMIntegration(); 