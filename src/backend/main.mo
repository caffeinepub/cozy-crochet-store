import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";

actor {
  type UserProfile = {
    name : Text;
  };

  // Include Storage and Authorization components
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
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

  public type ProductInput = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    image : Storage.ExternalBlob;
  };

  public shared ({ caller }) func addProduct(input : ProductInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let newProduct : Product = {
      input with id = productId;
    };

    products.add(productId, newProduct);
    productId;
  };

  public shared ({ caller }) func removeProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };
    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().sort();
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

  public type OrderRequestInput = {
    customerName : Text;
    email : Text;
    description : Text;
    itemType : Text;
  };

  public shared ({ caller }) func addOrderRequest(input : OrderRequestInput) : async Nat {
    let requestId = nextOrderRequestId;
    nextOrderRequestId += 1;

    let newRequest : OrderRequest = {
      input with id = requestId;
    };

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

  public type ReviewInput = {
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

    let newReview : Review = {
      input with id = reviewId;
    };

    reviews.add(newReview);
    reviewId;
  };

  public query ({ caller }) func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  // Simple Shopping Cart
  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, List.List<CartItem>>();

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    let product = products.get(productId);
    if (product == null) {
      Runtime.trap("Product not found");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };

    // Check if product already in cart
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
};
