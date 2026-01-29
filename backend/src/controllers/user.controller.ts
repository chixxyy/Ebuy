import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id as string) },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        createdAt: true,
        products: {
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId; // From authenticateToken middleware
    const { bio, name } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        bio,
        name
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};
