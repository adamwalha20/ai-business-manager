import { API_CONFIG } from './config';

export interface WebhookPayload {
  action: 'sync_orders' | 'generate_report' | 'chat_message' | 'cancel_order' | 'check_status' | 'get_dashboard_data' | 'get_orders' | 'get_products' | 'get_messages' | 'add_product' | 'update_product' | 'delete_product' | 'export_data' | 'update_settings' | 'filter_orders' | 'filter_messages' | 'call_customer' | 'chat_options';
  [key: string]: any;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  ai_reply?: string; // Standardize expected AI text response key
  data?: any;
}

export const triggerWebhook = async (payload: WebhookPayload): Promise<WebhookResponse> => {
  try {
    const response = await fetch(API_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'nexus_ai_web_client',
        timestamp: new Date().toISOString(),
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook Error: ${response.status} ${response.statusText}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // Fallback for text response
    const text = await response.text();
    return { success: true, message: text };

  } catch (error) {
    console.error('Failed to trigger n8n webhook:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};