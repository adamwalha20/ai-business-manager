
const webhookUrl = 'https://unpatented-balding-sonia.ngrok-free.dev/webhook/6bcc2e28-1d8e-4b97-96f9-c911bc92aa1e';

async function testAction(action, payload = {}) {
    console.log(`Testing action: ${action}...`);
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: 'test_script',
                timestamp: new Date().toISOString(),
                action,
                ...payload
            })
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log(`[${response.status}] Success:`, response.ok);
        // Console log a truncated version of data to keep output clean
        const preview = JSON.stringify(data).substring(0, 200);
        console.log(`Response: ${preview}${preview.length > 200 ? '...' : ''}`);
        return response.ok;
    } catch (error) {
        console.error(`Error testing ${action}:`, error.message);
        return false;
    }
}

async function runTests() {
    console.log('Starting Webhook Tests...');

    // Test 1: Dashboard Data
    await testAction('get_dashboard_data');

    // Test 2: Sync Orders
    await testAction('sync_orders');

    // Test 3: Chat Message
    await testAction('chat_message', {
        message: 'Hello, world!',
        customerId: 'test-user',
        platform: 'test'
    });

    console.log('Tests completed.');
}

runTests();
