// Test Chat Persistence - BSON Fix Verification
const http = require('http');

const BASE_URL = 'http://localhost:5000';
const timestamp = Date.now();

async function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Chat Persistence After BSON Fix\n');

  try {
    // Step 1: Signup
    console.log('📝 Step 1: Register Test User...');
    const signupRes = await request('POST', '/api/auth/signup', {
      name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@agrisense.local`,
      password: 'TestPass123',
    });

    if (signupRes.status !== 200 && signupRes.status !== 201) {
      console.log(`❌ Signup failed: ${signupRes.status}`);
      console.log(JSON.stringify(signupRes.body));
      process.exit(1);
    }

    const token = signupRes.body.token;
    console.log('✅ User registered. Token received.\n');

    // Step 2: Save chat
    console.log('💾 Step 2: Save Test Chat Session...');
    const saveRes = await request(
      'POST',
      '/api/chat-history',
      {
        title: 'BSON Fix Test Chat',
        language: 'en',
        messages: [
          {
            sender: 'user',
            text: 'What is the best soil pH for wheat?',
            language: 'en',
            sources: [],
          },
          {
            sender: 'ai',
            text: 'Wheat grows best in soil with a pH of 6.0-7.5',
            language: 'en',
            sources: [],
          },
        ],
      },
      token
    );

    if (saveRes.status !== 201) {
      console.log(`❌ Save failed: ${saveRes.status}`);
      console.log(JSON.stringify(saveRes.body));
      process.exit(1);
    }

    const sessionId = saveRes.body.session.id;
    console.log(`✅ Chat saved with ID: ${sessionId}\n`);

    // Step 3: Retrieve chat (this was failing with BSON error)
    console.log('📖 Step 3: Retrieve Chat Session (was failing with BSON error)...');
    const getRes = await request('GET', `/api/chat-history/${sessionId}`, null, token);

    if (getRes.status !== 200) {
      console.log(`❌ Retrieve failed: ${getRes.status}`);
      console.log(JSON.stringify(getRes.body));
      process.exit(1);
    }

    const session = getRes.body.session;
    console.log('✅ Chat retrieved successfully!');
    console.log(`   Title: ${session.title}`);
    console.log(`   Messages: ${session.messages.length}`);
    console.log(`   Language: ${session.language}\n`);

    // Step 4: List all chats
    console.log('📋 Step 4: List Chat Sessions...');
    const listRes = await request('GET', '/api/chat-history', null, token);

    if (listRes.status !== 200) {
      console.log(`❌ List failed: ${listRes.status}`);
      console.log(JSON.stringify(listRes.body));
      process.exit(1);
    }

    console.log(`✅ Listed ${listRes.body.sessions.length} chat sessions\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - Chat Persistence is Working!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🎉 BSON Version Error has been successfully fixed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

runTests();
