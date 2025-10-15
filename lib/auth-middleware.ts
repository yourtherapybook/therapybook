import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

// Extend NextApiRequest to include user
declare module 'next' {
  interface NextApiRequest {
    user?: AuthenticatedUser;
  }
}

export async function authenticateUser(req: NextApiRequest, res: NextApiResponse): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      role: session.user.role,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateUser(req, res);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Add user to request object
    req.user = user;
    
    return handler(req, res);
  };
}

export function requireRole(roles: string[]) {
  return function(handler: Function) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const user = await authenticateUser(req, res);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      // Add user to request object
      req.user = user;
      
      return handler(req, res);
    };
  };
}