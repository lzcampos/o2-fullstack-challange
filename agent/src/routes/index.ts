import { Router } from 'express';
import * as agentController from '../controllers/agentController';

const router = Router();

// Health check endpoint
router.get('/health', agentController.healthCheck);

// Agent query endpoint
router.post('/query', agentController.processQuery);

export default router; 