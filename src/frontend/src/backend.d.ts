import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Review {
    id: bigint;
    customerName: string;
    comment: string;
    rating: bigint;
}
export interface ProductInput {
    name: string;
    description: string;
    category: string;
    image: ExternalBlob;
    price: number;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: string;
    image: ExternalBlob;
    price: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OrderRequest {
    id: bigint;
    customerName: string;
    description: string;
    email: string;
    itemType: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface ShippingAddress {
    zip: string;
    country: string;
    city: string;
    name: string;
    state: string;
    addressLine: string;
    phone: string;
}
export interface OrderInput {
    email: string;
    shippingAddress: ShippingAddress;
    items: Array<CartItem>;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    customer: Principal;
    createdAt: bigint;
    email: string;
    shippingAddress: ShippingAddress;
    items: Array<CartItem>;
    paymentIntentId?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface OrderRequestInput {
    customerName: string;
    description: string;
    email: string;
    itemType: string;
}
export interface ReviewInput {
    customerName: string;
    comment: string;
    rating: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending",
    paid = "paid",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrderRequest(input: OrderRequestInput): Promise<bigint>;
    addProduct(product: ProductInput): Promise<void>;
    addReview(input: ReviewInput): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    claimAdminByPassword(password: string): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllOrderRequests(): Promise<Array<OrderRequest>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllReviews(): Promise<Array<Review>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem> | null>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getProducts(): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(input: OrderInput): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderPaymentIntent(orderId: bigint, paymentIntentId: string): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, input: ProductInput): Promise<void>;
    _initializeAccessControlWithSecret(token: string): Promise<void>;
}
