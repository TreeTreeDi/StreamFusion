import Router from 'koa-router';
import * as adminUserController from '../controllers/adminUser.controller';
import { isAdminAuthenticated } from '../middleware/auth'; // 导入管理员认证中间件

const router = new Router({ prefix: '/api/admin' }); // 所有路由前缀 /admin

// 用户管理路由
router.get(
  '/users',
  isAdminAuthenticated,
  adminUserController.listUsers
);

router.post(
  '/users',
  isAdminAuthenticated,
  adminUserController.createUser
);

router.get(
  '/users/:userId',
  isAdminAuthenticated,
  adminUserController.getUserById
);

router.put(
  '/users/:userId',
  isAdminAuthenticated,
  adminUserController.updateUser
);

router.delete(
  '/users/:userId',
  isAdminAuthenticated,
  adminUserController.deleteUser
);

export default router;
