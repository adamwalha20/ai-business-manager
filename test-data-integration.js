
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webhookUrl = 'https://unpatented-balding-sonia.ngrok-free.dev/webhook/6bcc2e28-1d8e-4b97-96f9-c911bc92aa1e';

async function run() {
    console.log('Starting test...');
    try {
        const getOrders = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'get_orders',
                source: 'test_script_esm',
                timestamp: new Date().toISOString()
            })
        });
        const ordersData = await getOrders.json();

        const getProducts = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'get_products',
                source: 'test_script_esm',
                timestamp: new Date().toISOString()
            })
        });
        const productsData = await getProducts.json();

        const result = { get_orders: ordersData, get_products: productsData };
        fs.writeFileSync(path.join(__dirname, 'webhook_response.json'), JSON.stringify(result, null, 2));
        console.log('Success: webhook_response.json created');
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
