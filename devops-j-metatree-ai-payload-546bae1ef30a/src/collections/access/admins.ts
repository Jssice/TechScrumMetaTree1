import ERole from '../../constants/roles';
import { checkRole } from './checkRole';

export const admins = ({ req: { user } }) => checkRole([ERole.ADMIN], user);
