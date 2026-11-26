const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const sqlInjectionGuard = require("../middlewares/sqlInjectionGuard");
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../middlewares/imageUploads");
// //Admin
// router.get('/establishments/:establishmentId', sqlInjectionGuard, authenticateToken, productController.getProductByAllEstablishmentController); //Consegue aceder a todos os produtos de todos os estabelecimentos
// router.post('/', sqlInjectionGuard, authenticateToken, productController.createProductController);
// router.get('/all', sqlInjectionGuard, authenticateToken, productController.getAllProductsAdminController);

// //Neighboors
// router.get('/establishment/:establishmentId', sqlInjectionGuard, authenticateToken, productController.getProductByEstablsihmentController); //Apenas acede aos produtos do estabelecimento escolhido da sua vizinhança
// router.get('/type/:typeId', sqlInjectionGuard, authenticateToken, productController.getProductByTypeController);
router.get('/all', sqlInjectionGuard, authenticateToken, productController.getAllProductsAdminController);
router.get('/establishments/:establishmentId', sqlInjectionGuard, authenticateToken, productController.getProductByAllEstablishmentController); // Admin vê todos os produtos de um estabelecimento
router.post('/', sqlInjectionGuard,upload.single('imagemProdutoFile'), authenticateToken, productController.createProductController); // Criar produto

router.get('/neighborhood', authenticateToken, sqlInjectionGuard, productController.getProductsByMyNeighborhoodController); 
router.get('/type/:typeId', authenticateToken, sqlInjectionGuard, productController.getProductByTypeController);
router.get('/establishment/:establishmentId', sqlInjectionGuard, authenticateToken, productController.getProductByEstablsihmentController); 
router.get('/', sqlInjectionGuard, authenticateToken, productController.getProductsByMyNeighborhoodController);
router.get('/:productId', sqlInjectionGuard, authenticateToken, productController.getProductByIdController);
router.patch('/:productId', sqlInjectionGuard,upload.single('imagemProdutoFile'), authenticateToken, productController.updateProductController); 
router.delete("/:productId", sqlInjectionGuard, authenticateToken, productController.deleteProductController); 

module.exports = router;