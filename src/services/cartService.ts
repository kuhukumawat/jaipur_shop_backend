import Cart from "../models/Cart";

export const getAllCartItems = async (userId: string) => {
    const cart = await Cart.find({ userId });
    if (!cart) {
        throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
    }
    return cart;
};

export const createCart = async (userId: string, productId: string, quantity: number) => {
    const cart = await Cart.create({ userId, productId, quantity });
    if (!cart) {
        throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
    }
    return cart;
};

export const updateCart = async (id: string, quantity: number) => {
    const cart = await Cart.findByIdAndUpdate(
        id,
        { quantity },
        { new: true, runValidators: true }
    );
    if (!cart) {
        throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
    }
    return cart;
};

export const deleteCart = async (id: string) => {
    const cart = await Cart.findByIdAndDelete(id);
    if (!cart) {
        throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
    }
    return cart;
};
