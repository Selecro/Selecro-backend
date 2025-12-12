import {Next} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import jwt from 'jsonwebtoken';
import {UserRepository} from '../repositories';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export const JwtAuthMiddleware: Middleware = async (
  {request, response}: {request: Request; response: Response},
  next: Next,
) => {
  const token = request.cookies?.jwt;
  if (!token) {
    return next();
  }

  try {
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    const userRepository: UserRepository = await new Promise((resolve, reject) => {
      const app = (request as any).app;
      if (app) {
        app.get('repositories.UserRepository')
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Application context not available on request.'));
      }
    });

    const user = await userRepository.findById(decodedToken.userId);
    (request as any).currentUser = user;
  } catch (err) {
    console.error('JWT authentication failed:', err);
    response.clearCookie('jwt');
  }

  return next();
};
