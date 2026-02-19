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

/**
 * Robustly extracts the data array from various n8n response structures.
 * Supports aggregation of multiple pages/batches by recursively searching for data arrays.
 */
export const extractN8NData = (response: any): any[] => {
  if (!response) return [];

  // 1. Handle Array-wrapped response (common in n8n for multiple batches/pages)
  if (Array.isArray(response)) {
    return response.reduce((allData: any[], item: any) => {
      return [...allData, ...extractN8NData(item)];
    }, []);
  }

  // 2. Handle Object-wrapped response
  if (typeof response === 'object') {
    // Pattern: { success: true, count: 530, data: [...] } (A single page/batch result)
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    // Pattern: { data: [ { success, data: [...] }, ... ] } (A container of multiple pages)
    if (Array.isArray(response.data) && response.data.length > 0 && response.data[0]?.success) {
      return response.data.reduce((acc: any[], item: any) => {
        return [...acc, ...extractN8NData(item)];
      }, []);
    }

    // Pattern: { body: { data: [...] } }
    if (response.body?.data && Array.isArray(response.body.data)) {
      return response.body.data;
    }

    // Pattern: { data: [...] } (Generic data wrapper)
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Fallback: If the object itself looks like a data item (Order, Message, etc.)
    if (response._id || response.id || response.customer || response.name || response.content) {
      return [response];
    }
  }

  return [];
};

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