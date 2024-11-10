import { Router } from 'express';
const router = Router();

import { redeemPoints } from '../controllers/loyalty.controller';

router.post('/redeem', redeemPoints);

export default router;
