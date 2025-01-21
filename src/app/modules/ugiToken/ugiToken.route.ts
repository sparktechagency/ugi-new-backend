import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import fileUpload from '../../middleware/fileUpload';
import { ugiTokenController } from './ugiToken.controller';


const ugiTokenRouter = express.Router();

ugiTokenRouter
  .post(
    '/create-ugi-token',
    // auth(USER_ROLE.ADMIN),
    ugiTokenController.createUgiToken,
  )
  .get('/verify', 
    // auth(USER_ROLE.BUSINESS), 
    ugiTokenController.verifySingleUgiToken)
  .get('/:id', auth(USER_ROLE.CUSTOMER), ugiTokenController.getSingleUgiToken)
  .patch(
    '/:id',
    // auth(USER_ROLE.BUSINESS),
    ugiTokenController.updateUgiToken,
  );

export default ugiTokenRouter;
