const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../middlewares/imageUploads");
// //Admin
// router.get('/establishments/:establishmentId', authenticateToken, productController.getProductByAllEstablishmentController); //Consegue aceder a todos os produtos de todos os estabelecimentos
// router.post('/', authenticateToken, productController.createProductController);
// router.get('/all', authenticateToken, productController.getAllProductsAdminController);

// //Neighboors
// router.get('/establishment/:establishmentId', authenticateToken, productController.getProductByEstablsihmentController); //Apenas acede aos produtos do estabelecimento escolhido da sua vizinhança
// router.get('/type/:typeId', authenticateToken, productController.getProductByTypeController);
router.get('/all', authenticateToken, productController.getAllProductsAdminController);
router.get('/establishments/:establishmentId', authenticateToken, productController.getProductByAllEstablishmentController); // Admin vê todos os produtos de um estabelecimento
router.post('/', upload.single('imagemProdutoFile'), authenticateToken, productController.createProductController); // Criar produto

router.get('/neighborhood', authenticateToken, productController.getProductsByMyNeighborhoodController); 
router.get('/type/:typeId', authenticateToken, productController.getProductByTypeController);
router.get('/establishment/:establishmentId', authenticateToken, productController.getProductByEstablsihmentController); 
router.get('/', authenticateToken, productController.getProductsByMyNeighborhoodController);
router.get('/:productId', authenticateToken, productController.getProductByIdController);
router.patch('/:productId', upload.single('imagemProdutoFile'), authenticateToken, productController.updateProductController); 
router.delete("/:productId", authenticateToken, productController.deleteProductController); 

module.exports = router;