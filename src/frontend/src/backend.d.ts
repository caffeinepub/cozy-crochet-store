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
export interface Review {
    id: bigint;
    customerName: string;
    comment: string;
    rating: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrderRequest(input: OrderRequestInput): Promise<bigint>;
    addProduct(input: ProductInput): Promise<bigint>;
    addReview(input: ReviewInput): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllOrderRequests(): Promise<Array<OrderRequest>>;
    getAllReviews(): Promise<Array<Review>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem> | null>;
    getProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFromCart(productId: bigint): Promise<void>;
    removeProduct(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
