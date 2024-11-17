import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { withdrawController } from './withdraw.controller';


const withdrawRouter = express.Router();

withdrawRouter
  .post('/add-payment', auth(USER_ROLE.MENTEE), withdrawController.addWithdraw)
  .get('/', auth(USER_ROLE.ADMIN), withdrawController.getAllWithdraw)
  .get('/:id', withdrawController.getSingleWithdraw)
  .get(
    '/mentor',
    auth(USER_ROLE.MENTOR),
    withdrawController.getAllWithdrawByMentor,
  )
  .patch(
    '/status/:id',
    auth(USER_ROLE.ADMIN),
    withdrawController.getAllWithdrawRequestAccept,
  )
  .delete('/:id', withdrawController.deleteSingleWithdraw);

export default withdrawRouter;
