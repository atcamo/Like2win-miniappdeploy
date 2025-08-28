import prisma from '@/lib/prisma';

/**
 * Get user by Farcaster ID
 */
export async function getUserByFid(fid: bigint) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        fid: fid
      },
      select: {
        id: true,
        fid: true,
        appWallet: true,
        username: true,
        displayName: true,
        farcasterId: true,
        farcasterUsername: true
      }
    });

    return user;
  } catch (error) {
    console.error('Error fetching user by FID:', error);
    return null;
  }
}