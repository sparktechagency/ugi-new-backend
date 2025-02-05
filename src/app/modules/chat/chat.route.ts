/** @format */

import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { chatController } from './chat.controller';


const chatRouter = Router();

chatRouter.get(
  '/',
  auth(USER_ROLE.CUSTOMER, USER_ROLE.BUSINESS),
  chatController.getAllChats,
);

export default chatRouter;
