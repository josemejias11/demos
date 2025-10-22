/**
 * Test data utilities for jbs.dev project
 * Contains type definitions and builders for test scenarios
 */

// Common test data interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal';
  lastFour?: string;
  expiryDate?: string;
}

// Test data builders (placeholder implementations)
export class UserBuilder {
  private user: Partial<User> = {};

  static create(): UserBuilder {
    return new UserBuilder();
  }

  withId(id: string): UserBuilder {
    this.user.id = id;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  withUsername(username: string): UserBuilder {
    this.user.username = username;
    return this;
  }

  build(): User {
    return {
      id: this.user.id || 'test-user-' + Math.random().toString(36).substr(2, 9),
      username: this.user.username || 'testuser',
      email: this.user.email || 'test@example.com',
      ...this.user
    };
  }
}

export class ProductBuilder {
  private product: Partial<Product> = {};

  static create(): ProductBuilder {
    return new ProductBuilder();
  }

  withId(id: string): ProductBuilder {
    this.product.id = id;
    return this;
  }

  withName(name: string): ProductBuilder {
    this.product.name = name;
    return this;
  }

  withPrice(price: number): ProductBuilder {
    this.product.price = price;
    return this;
  }

  build(): Product {
    return {
      id: this.product.id || 'prod-' + Math.random().toString(36).substr(2, 9),
      name: this.product.name || 'Test Product',
      price: this.product.price || 99.99,
      ...this.product
    };
  }
}

export class CartBuilder {
  private cart: Partial<Cart> = { items: [] };

  static create(): CartBuilder {
    return new CartBuilder();
  }

  withId(id: string): CartBuilder {
    this.cart.id = id;
    return this;
  }

  withUserId(userId: string): CartBuilder {
    this.cart.userId = userId;
    return this;
  }

  withItem(item: CartItem): CartBuilder {
    this.cart.items = [...(this.cart.items || []), item];
    return this;
  }

  build(): Cart {
    const items = this.cart.items || [];
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      id: this.cart.id || 'cart-' + Math.random().toString(36).substr(2, 9),
      userId: this.cart.userId || 'test-user',
      items,
      total,
      ...this.cart
    };
  }
}

export class AddressBuilder {
  private address: Partial<Address> = {};

  static create(): AddressBuilder {
    return new AddressBuilder();
  }

  withStreet(street: string): AddressBuilder {
    this.address.street = street;
    return this;
  }

  withCity(city: string): AddressBuilder {
    this.address.city = city;
    return this;
  }

  withState(state: string): AddressBuilder {
    this.address.state = state;
    return this;
  }

  build(): Address {
    return {
      street: this.address.street || '123 Test St',
      city: this.address.city || 'Test City',
      state: this.address.state || 'TS',
      zipCode: this.address.zipCode || '12345',
      country: this.address.country || 'US',
      ...this.address
    };
  }
}

export class PaymentMethodBuilder {
  private paymentMethod: Partial<PaymentMethod> = {};

  static create(): PaymentMethodBuilder {
    return new PaymentMethodBuilder();
  }

  withType(type: PaymentMethod['type']): PaymentMethodBuilder {
    this.paymentMethod.type = type;
    return this;
  }

  withLastFour(lastFour: string): PaymentMethodBuilder {
    this.paymentMethod.lastFour = lastFour;
    return this;
  }

  build(): PaymentMethod {
    return {
      type: this.paymentMethod.type || 'credit_card',
      lastFour: this.paymentMethod.lastFour || '1234',
      ...this.paymentMethod
    };
  }
}

// Scenario builders
export const createCheckoutScenario = () => {
  const user = UserBuilder.create().build();
  const product = ProductBuilder.create().build();
  const cart = CartBuilder.create()
    .withUserId(user.id)
    .withItem({
      productId: product.id,
      quantity: 1,
      price: product.price
    })
    .build();
  const address = AddressBuilder.create().build();
  const paymentMethod = PaymentMethodBuilder.create().build();

  return {
    user,
    product,
    cart,
    address,
    paymentMethod
  };
};

export const createGuestCheckoutScenario = () => {
  const product = ProductBuilder.create().build();
  const cart = CartBuilder.create()
    .withUserId('guest')
    .withItem({
      productId: product.id,
      quantity: 1,
      price: product.price
    })
    .build();
  const address = AddressBuilder.create().build();
  const paymentMethod = PaymentMethodBuilder.create().build();

  return {
    product,
    cart,
    address,
    paymentMethod
  };
};

// Schema validation helpers (placeholder)
export const UserSchema = {
  validate: (user: any): user is User => {
    return typeof user === 'object' &&
      typeof user.id === 'string' &&
      typeof user.username === 'string' &&
      typeof user.email === 'string';
  }
};

export const ProductSchema = {
  validate: (product: any): product is Product => {
    return typeof product === 'object' &&
      typeof product.id === 'string' &&
      typeof product.name === 'string' &&
      typeof product.price === 'number';
  }
};

export const CartSchema = {
  validate: (cart: any): cart is Cart => {
    return typeof cart === 'object' &&
      typeof cart.id === 'string' &&
      typeof cart.userId === 'string' &&
      Array.isArray(cart.items) &&
      typeof cart.total === 'number';
  }
};

export const CartItemSchema = {
  validate: (item: any): item is CartItem => {
    return typeof item === 'object' &&
      typeof item.productId === 'string' &&
      typeof item.quantity === 'number' &&
      typeof item.price === 'number';
  }
};

export const AddressSchema = {
  validate: (address: any): address is Address => {
    return typeof address === 'object' &&
      typeof address.street === 'string' &&
      typeof address.city === 'string' &&
      typeof address.state === 'string' &&
      typeof address.zipCode === 'string' &&
      typeof address.country === 'string';
  }
};

export const PaymentMethodSchema = {
  validate: (paymentMethod: any): paymentMethod is PaymentMethod => {
    return typeof paymentMethod === 'object' &&
      typeof paymentMethod.type === 'string' &&
      ['credit_card', 'debit_card', 'paypal'].includes(paymentMethod.type);
  }
};
