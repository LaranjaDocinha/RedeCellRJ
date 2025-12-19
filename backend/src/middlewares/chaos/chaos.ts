import { Request, Response, NextFunction } from 'express';

interface ChaosConfig {
  level: number; // 0 to 1, probability of chaos
  delay: number; // max delay in ms
}

const chaosConfig: ChaosConfig = {
  level: parseFloat(process.env.CHAOS_LEVEL || '0.0'),
  delay: parseInt(process.env.CHAOS_DELAY || '1000', 10),
};

const chaosMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (Math.random() < chaosConfig.level) {
    const chaosType = Math.random();

    if (chaosType < 0.5) {
      // Introduce a delay
      const delay = Math.floor(Math.random() * chaosConfig.delay);
      console.log(`CHAOS: Delaying request by ${delay}ms`);
      return setTimeout(next, delay);
    } else {
      // Return an error
      console.log('CHAOS: Returning a 500 error');
      return res.status(500).send('Chaos engineering!');
    }
  }

  next();
};

export default chaosMiddleware;
