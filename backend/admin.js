import express from 'express';
const adminRouter = express.Router();

adminRouter.get('/dashboard/admin', (req, res) => {
    res.send('Admin Dashboard');
});
  
export default adminRouter;