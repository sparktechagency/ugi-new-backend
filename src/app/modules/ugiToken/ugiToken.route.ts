import express from 'express';
import { ugiTokenController } from './ugiToken.controller';


const ugiTokenRouter = express.Router();

ugiTokenRouter
  .post(
    '/create-ugi-token',
    // auth(USER_ROLE.ADMIN),
    ugiTokenController.createUgiToken,
  )
  .get('/', ugiTokenController.getSingleUgiToken)
  .patch(
    '/:id',
    // auth(USER_ROLE.BUSINESS),
    ugiTokenController.updateUgiTokenAcceptCencel,
  );
 

export default ugiTokenRouter;
