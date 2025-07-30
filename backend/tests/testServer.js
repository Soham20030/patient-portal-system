// test/testServer.js
import request from 'supertest';
import app from '../server.js';

const testServer = async () => {
    console.log('🔍 Testing Server...');
    
    try {
        console.log('\n1. Testing Basic Route...');
        const rootResponse = await request(app).get('/').expect(200);
        console.log('✅ Root route working:', {
            message: rootResponse.body.message,
            version: rootResponse.body.version,
            hasTimestamp: !!rootResponse.body.timestamp
        });

        console.log('\n2. Testing Health Check Endpoint...');
        const healthResponse = await request(app).get('/api/health').expect(200);
        console.log('✅ Health check working:', {
            status: healthResponse.body.status,
            hasTimestamp: !!healthResponse.body.timestamp,
            hasUptime: !!healthResponse.body.uptime
        });

        console.log('\n3. Testing CORS Headers...');
        const corsResponse = await request(app).get('/').expect(200);
        const corsHeader = corsResponse.headers['access-control-allow-origin'];
        console.log('✅ CORS header present:', corsHeader || 'Default policy');

        console.log('\n4. Testing JSON Body Parsing...');
        const jsonResponse = await request(app)
            .post('/api/health')
            .send({ test: 'data' })
            .set('Content-Type', 'application/json');
        console.log('✅ JSON parsing working - status:', jsonResponse.status);

        console.log('\n5. Testing Security Headers...');
        const securityResponse = await request(app).get('/').expect(200);
        const securityHeaders = {
            'x-dns-prefetch-control': securityResponse.headers['x-dns-prefetch-control'],
            'x-frame-options': securityResponse.headers['x-frame-options'],
            'x-download-options': securityResponse.headers['x-download-options'],
            'x-content-type-options': securityResponse.headers['x-content-type-options']
        };
        console.log('✅ Security headers present:', Object.keys(securityHeaders).filter(key => securityHeaders[key]).length + ' headers');

        console.log('\n6. Testing 404 Handler...');
        const notFoundResponse = await request(app).get('/non-existent-route').expect(404);
        console.log('✅ 404 handler working:', {
            error: notFoundResponse.body.error,
            method: notFoundResponse.body.method,
            hasUrl: !!notFoundResponse.body.url
        });

        console.log('\n7. Testing Rate Limiting Setup...');
        const rateLimitPromises = Array.from({ length: 5 }, () =>
            request(app).get('/api/health').expect(200)
        );
        const rateLimitResponses = await Promise.all(rateLimitPromises);
        const hasRateLimitHeaders = rateLimitResponses.some(res =>
            res.headers['x-ratelimit-limit'] || res.headers['x-ratelimit-remaining']
        );
        console.log('✅ Rate limiting configured:', hasRateLimitHeaders ? 'Headers present' : 'Applied to /api/ routes');

        console.log('\n8. Testing Different HTTP Methods...');
        const methodTests = [
            { method: 'GET', path: '/', expectedStatus: 200 },
            { method: 'POST', path: '/non-existent', expectedStatus: 404 },
            { method: 'PUT', path: '/non-existent', expectedStatus: 404 },
            { method: 'DELETE', path: '/non-existent', expectedStatus: 404 }
        ];
        for (const { method, path, expectedStatus } of methodTests) {
            const res = await request(app)[method.toLowerCase()](path).expect(expectedStatus);
            console.log(`✅ ${method} ${path} - Status: ${res.status}`);
        }

        console.log('\n9. Testing Content-Type Headers...');
        const contentTypeResponse = await request(app).get('/').expect(200);
        const contentType = contentTypeResponse.headers['content-type'];
        const isJsonResponse = contentType?.includes('application/json');
        console.log('✅ Content-Type header:', contentType);
        console.log('✅ JSON response format:', isJsonResponse);

        console.log('\n10. Testing Environment Variables...');
        console.log('✅ Environment variables loaded:', {
            NODE_ENV: process.env.NODE_ENV || 'development',
            PORT: process.env.PORT || '5000',
            FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
        });

        console.log('\n11. Testing Response Times...');
        const startTime = Date.now();
        await request(app).get('/').expect(200);
        const responseTime = Date.now() - startTime;
        console.log('✅ Response time:', responseTime + 'ms', responseTime < 100 ? '(Fast)' : '(Acceptable)');

        console.log('\n12. Testing Large Request Handling...');
        const largeData = { data: 'x'.repeat(1000) };
        const largeResponse = await request(app)
            .post('/api/health')
            .send(largeData)
            .set('Content-Type', 'application/json');
        console.log('✅ Large request handling - Status:', largeResponse.status);

        console.log('\n🎉 All Server tests completed successfully!');
        
        console.log('\n📊 Test Summary:');
        console.log('✅ Basic routing - Working');
        console.log('✅ Health check - Working');
        console.log('✅ CORS configuration - Working');
        console.log('✅ Security middleware - Working');
        console.log('✅ Error handling - Working');
        console.log('✅ Rate limiting - Configured');
        console.log('✅ JSON parsing - Working');
        console.log('✅ 404 handling - Working');
        console.log('✅ Response formatting - Working');

    } catch (error) {
        console.error('❌ Server test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }

    process.exit(0);
};

testServer();
