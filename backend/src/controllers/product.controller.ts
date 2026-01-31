import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getIO } from "../socket";

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        rating: 0,
        reviews: 0,
        stock: 10, // Default stock
        seller: {
          connect: { id: (req as any).user.userId },
        },
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category } = req.body;

    const productId = parseInt(id as string);

    // Check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (existingProduct.sellerId !== (req as any).user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this product" });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
            select: { comments: true },
        },
      },
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productId = parseInt(id as string);

    // Check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (existingProduct.sellerId !== (req as any).user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.userId;

    const comment = await prisma.comment.create({
      data: {
        content,
        productId: parseInt(id as string),
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error });
  }
};
export const purchaseProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const productId = parseInt(id as string);
    const qty = parseInt(quantity as string);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Check Stock
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (product.stock < qty) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        // 2. Deduct Stock
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: qty } },
        });

        return updatedProduct;
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
      },
    );

    // 3. Broadcast Update (Outside transaction)
    const io = getIO();
    io.emit("INVENTORY_UPDATE", {
      productId: result.id.toString(),
      stock: result.stock,
    });

    res.json({ message: "Purchase successful", product: result });
  } catch (error: any) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ message: "Product not found" });
    }
    if (error.message === "INSUFFICIENT_STOCK") {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    console.error("Purchase error:", error);
    res.status(500).json({ message: "Error processing purchase" });
  }
};
