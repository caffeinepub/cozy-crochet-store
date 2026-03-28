import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";


actor {
  // Stripe config
  type StripeConfiguration = Stripe.StripeConfiguration;
  type ShoppingItem = Stripe.ShoppingItem;
  var configuration : ?StripeConfiguration = null;

  public shared ({ caller }) func setStripeConfiguration(config : StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    configuration != null;
  };

  func getStripeConfiguration() : StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // Include Storage and Authorization components
  include MixinStorage();

  // User Profile Management
  type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Claim admin by password - password 3753 grants admin access
  let ADMIN_PASSWORD = "3753";
  public shared ({ caller }) func claimAdminByPassword(password : Text) : async Bool {
    if (caller.isAnonymous()) { return false };
    if (password != ADMIN_PASSWORD) { return false };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    image : Storage.ExternalBlob;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  var nextProductId = 1;
  let products = Map.empty<Nat, Product>();

  type ProductInput = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    image : Storage.ExternalBlob;
  };

  public shared ({ caller }) func addProduct(product : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let newProduct : Product = {
      product with id = productId;
    };

    products.add(productId, newProduct);
  };

  public shared ({ caller }) func updateProduct(productId : Nat, input : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    let updatedProduct : Product = {
      input with id = productId;
    };

    products.add(productId, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  // Order Request Management
  type OrderRequest = {
    id : Nat;
    customerName : Text;
    email : Text;
    description : Text;
    itemType : Text;
  };

  var nextOrderRequestId = 1;
  let orderRequests = List.empty<OrderRequest>();

  type OrderRequestInput = {
    customerName : Text;
    email : Text;
    description : Text;
    itemType : Text;
  };

  public shared ({ caller }) func addOrderRequest(input : OrderRequestInput) : async Nat {
    let requestId = nextOrderRequestId;
    nextOrderRequestId += 1;
    let newRequest : OrderRequest = { input with id = requestId };
    orderRequests.add(newRequest);
    requestId;
  };

  public query ({ caller }) func getAllOrderRequests() : async [OrderRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all order requests");
    };
    orderRequests.values().toArray();
  };

  // Customer Review Management
  type Review = {
    id : Nat;
    customerName : Text;
    rating : Nat;
    comment : Text;
  };

  var nextReviewId = 1;
  let reviews = List.empty<Review>();

  type ReviewInput = {
    customerName : Text;
    rating : Nat;
    comment : Text;
  };

  public shared ({ caller }) func addReview(input : ReviewInput) : async Nat {
    if (input.rating < 1 or input.rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    let reviewId = nextReviewId;
    nextReviewId += 1;
    let newReview : Review = { input with id = reviewId };
    reviews.add(newReview);
    reviewId;
  };

  public query ({ caller }) func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  // Shopping Cart
  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, List.List<CartItem>>();

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };
    if (products.get(productId) == null) {
      Runtime.trap("Product not found");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };
    let updatedCart = List.empty<CartItem>();
    var found = false;
    for (item in currentCart.values()) {
      if (item.productId == productId) {
        updatedCart.add({ item with quantity = item.quantity + quantity });
        found := true;
      } else {
        updatedCart.add(item);
      };
    };
    if (not found) {
      updatedCart.add({ productId; quantity });
    };
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items from cart");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?c) { c };
    };
    let filteredCart = List.empty<CartItem>();
    for (item in currentCart.values()) {
      if (item.productId != productId) {
        filteredCart.add(item);
      };
    };
    carts.add(caller, filteredCart);
  };

  public query ({ caller }) func getCart() : async ?[CartItem] {
    switch (carts.get(caller)) {
      case (null) { null };
      case (?cart) { ?cart.values().toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their cart");
    };
    carts.remove(caller);
  };

  // Order Management
  type OrderStatus = {
    #pending;
    #paid;
    #shipped;
    #delivered;
  };

  type ShippingAddress = {
    name : Text;
    addressLine : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
    phone : Text;
  };

  type Order = {
    id : Nat;
    customer : Principal;
    items : [CartItem];
    shippingAddress : ShippingAddress;
    email : Text;
    status : OrderStatus;
    paymentIntentId : ?Text;
    createdAt : Nat;
  };

  var nextOrderId = 1;
  let orders = Map.empty<Nat, Order>();
  let customerOrders = Map.empty<Principal, List.List<Nat>>();

  type OrderInput = {
    items : [CartItem];
    shippingAddress : ShippingAddress;
    email : Text;
  };

  public shared ({ caller }) func placeOrder(input : OrderInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    if (input.items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };
    for (item in input.items.vals()) {
      if (products.get(item.productId) == null) {
        Runtime.trap("Product not found: " # item.productId.toText());
      };
    };
    let orderId = nextOrderId;
    nextOrderId += 1;
    let newOrder : Order = {
      id = orderId;
      customer = caller;
      items = input.items;
      shippingAddress = input.shippingAddress;
      email = input.email;
      status = #pending;
      paymentIntentId = null;
      createdAt = 0;
    };
    orders.add(orderId, newOrder);
    let customerOrderList = switch (customerOrders.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?list) { list };
    };
    customerOrderList.add(orderId);
    customerOrders.add(caller, customerOrderList);
    orderId;
  };

  public shared ({ caller }) func updateOrderPaymentIntent(orderId : Nat, paymentIntentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment intent");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.customer != caller) {
          Runtime.trap("Unauthorized: Can only update your own orders");
        };
        orders.add(orderId, { order with paymentIntentId = ?paymentIntentId });
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(orderId, { order with status = status });
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    switch (customerOrders.get(caller)) {
      case (null) { [] };
      case (?orderIds) {
        let orderList = List.empty<Order>();
        for (orderId in orderIds.values()) {
          switch (orders.get(orderId)) {
            case (?order) { orderList.add(order) };
            case (null) {};
          };
        };
        orderList.values().toArray();
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };
};
