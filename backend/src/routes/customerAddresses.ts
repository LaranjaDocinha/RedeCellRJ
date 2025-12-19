import { Router } from 'express';
import * as addressController from '../controllers/addressController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  '/:customerId',
  authMiddleware.authorize('manage', 'CustomerAddresses'),
  addressController.createAddress,
);
router.get(
  '/:customerId',
  authMiddleware.authorize('view', 'CustomerAddresses'),
  addressController.getAddressesByCustomerId,
);
router.put(
  '/:id',
  authMiddleware.authorize('manage', 'CustomerAddresses'),
  addressController.updateAddress,
);
router.delete(
  '/:id',
  authMiddleware.authorize('manage', 'CustomerAddresses'),
  addressController.deleteAddress,
);

export default router;
