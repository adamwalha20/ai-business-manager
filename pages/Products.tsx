import * as React from 'react';
import { useState, useEffect } from 'react';
import { Product } from '../types';
import { triggerWebhook, extractN8NData } from '../services/n8nService';
import { Plus, Edit2, AlertOctagon, Loader2, RefreshCw } from 'lucide-react';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await triggerWebhook({ action: 'get_products' });
            const rawProducts = extractN8NData(response);

            if (rawProducts && Array.isArray(rawProducts)) {
                let itemsToMap: any[] = [];

                // Check if the data is actually a list of Orders (containing 'cart')
                if (rawProducts.length > 0 && rawProducts[0].cart && Array.isArray(rawProducts[0].cart)) {
                    // Extract unique products from orders
                    const productMap = new Map();
                    rawProducts.forEach((order: any) => {
                        if (Array.isArray(order.cart)) {
                            order.cart.forEach((item: any) => {
                                if (item.product && item.product._id) {
                                    productMap.set(item.product._id, item.product);
                                }
                            });
                        }
                    });
                    itemsToMap = Array.from(productMap.values());
                } else {
                    itemsToMap = rawProducts;
                }

                const mappedProducts: Product[] = itemsToMap.map((p: any) => ({
                    id: p.id || p._id || `prod-${Math.random()}`,
                    name: p.name || 'Unnamed Product',
                    description: p.description || '',
                    price: Number(p.price) || 0,
                    stock: Number(p.stock) || 0,
                    estimated_restock_date: p.estimated_restock_date,
                    // Use 'md' image from images array if available, fallback to image_url
                    image_url: p.images?.[0]?.md || p.image_url || 'https://via.placeholder.com/200',
                    variations: p.variations
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        await fetchProducts();
        setIsSyncing(false);
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-brand-green gap-3 p-12">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-xl font-medium">Loading Products...</span>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Products & Stock</h1>
                    <p className="text-brand-gray mt-1">Manage inventory and AI knowledge base</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-brand-card hover:bg-gray-800 text-brand-green p-3 rounded-xl border border-gray-800 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-brand-card rounded-2xl border border-gray-800 overflow-hidden hover:border-brand-gray/50 transition-all group">
                        <div className="h-48 overflow-hidden relative">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            {product.stock === 0 && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <AlertOctagon size={12} /> Out of Stock
                                </div>
                            )}
                            {product.stock > 0 && (
                                <div className={`absolute top-2 right-2 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ${product.stock < 10 ? 'bg-brand-orange' : 'bg-brand-green text-black'}`}>
                                    {product.stock < 10 ? 'Low Stock: ' : 'Stock: '}{product.stock}
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white text-lg leading-tight">{product.name}</h3>
                                <span className="font-mono text-brand-green font-bold">{product.price} TND</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                <div className="text-xs text-gray-400">
                                    {product.stock === 0 ? (
                                        <span className="text-brand-orange">Restock: {product.estimated_restock_date}</span>
                                    ) : (
                                        <span>{product.stock} units available</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => triggerWebhook({ action: 'update_product', productId: product.id })}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;