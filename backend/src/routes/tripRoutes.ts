import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import {
  generateNewTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
} from '../controllers/tripController';

const router = Router();

// All trip routes require authentication
router.use(authMiddleware);

router.get('/', getUserTrips);                     // GET  /api/trips
router.post('/generate', generateNewTrip);         // POST /api/trips/generate
router.get('/:id', getTripById);                   // GET  /api/trips/:id
router.put('/:id', updateTrip);                    // PUT  /api/trips/:id
router.delete('/:id', deleteTrip);                 // DELETE /api/trips/:id
router.post('/:id/regenerate-day', regenerateDay); // POST /api/trips/:id/regenerate-day

export default router;
