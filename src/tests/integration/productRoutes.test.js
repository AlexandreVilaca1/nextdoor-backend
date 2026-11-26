const express = require("express");
const request = require("supertest");

const productController = require("../../controllers/productController");
const productService = require("../../services/productService");
const userService = require("../../services/userService");

jest.mock("../../services/productService");
jest.mock("../../services/userService");

const mockProduct = {
  idProduto: 6,
  nomeProduto: "pasta dos dentes",
  descricaoProduto: "marca: colgate",
  precoProduto: 3,
  imagemProduto: "/uploads/182742123-21324189.png",
  tipoProdutoidTipoProduto: 3,
  estadoProdutoidEstadoProduto: 2,
  EstabelecimentoidEstabelecimento: 4,
};

const mountRoutes = (app) => {
  // A ordem importa: /products/establishment e /products/type têm de vir
  // antes de /products/:productId.
  app.get(
    "/products/establishment/:establishmentId",
    productController.getProductByEstablsihmentController
  );
  app.get("/products/type/:typeId", productController.getProductByTypeController);
  app.get("/products/:productId", productController.getProductByIdController);
  app.get("/products", productController.getProductsByMyNeighborhoodController);
  app.post("/products", productController.createProductController);
  app.patch("/products/:productId", productController.updateProductController);
  app.delete("/products/:productId", productController.deleteProductController);

  return app;
};

const buildApp = ({ authenticated = true } = {}) => {
  const app = express();
  app.use(express.json());

  if (authenticated) {
    // Simula o authenticateToken já resolvido, com um utilizador administrador.
    app.use((req, res, next) => {
      req.user = { idUtilizador: 1, idTipoUtilizador: 1 };
      next();
    });
  }

  return mountRoutes(app);
};

describe("Product Integration Test", () => {
  beforeEach(() => {
    userService.fetchUserByIdInternal.mockResolvedValue({
      idUtilizador: 1,
      VizinhançaidVizinhança: 10,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /products/establishment/:establishmentId - should fetch products by establishment", async () => {
    const page = {
      products: [mockProduct],
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
    };
    productService.getProductsByEstablishmentAndNeighborhood.mockResolvedValue(
      page
    );

    const response = await request(buildApp()).get("/products/establishment/4");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Produtos do estabelecimento na vizinhança obtidos com sucesso",
      ...page,
    });
  });

  test("GET /products/type/:typeId - should fetch products by type", async () => {
    const page = {
      products: [mockProduct],
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
    };
    productService.getProductByTypeAndNeighborhood.mockResolvedValue(page);

    const response = await request(buildApp()).get("/products/type/3");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Produtos obtidos com sucesso por tipo",
      ...page,
    });
  });

  test("GET /products/:productId - should fetch product by ID", async () => {
    productService.getProductByIdAndNeighborhood.mockResolvedValue(mockProduct);

    const response = await request(buildApp()).get("/products/6");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Produto obtido com sucesso",
      product: mockProduct,
    });
  });

  test("GET /products - should fetch the products of the user's neighborhood", async () => {
    const page = {
      products: [mockProduct],
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
    };
    productService.getProductsByNeighborhoodForUser.mockResolvedValue(page);

    const response = await request(buildApp()).get("/products");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Produtos da vizinhança obtidos com sucesso",
      ...page,
    });
  });

  test("GET /products/:productId - should answer 401 without an authenticated user", async () => {
    const response = await request(buildApp({ authenticated: false })).get(
      "/products/6"
    );

    expect(response.status).toBe(401);
    expect(productService.getProductByIdAndNeighborhood).not.toHaveBeenCalled();
  });

  test("POST /products - should answer 400 when required fields are missing", async () => {
    const response = await request(buildApp())
      .post("/products")
      .send({ nomeProduto: "Sumo" });

    expect(response.status).toBe(400);
    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  test("PATCH /products/:productId - should update a product", async () => {
    productService.getProductByIdForUpdate.mockResolvedValue({
      idProduto: 2,
      imagemProduto: null,
    });
    productService.updateProduct.mockResolvedValue(1);

    const response = await request(buildApp())
      .patch("/products/2")
      .send({ precoProduto: 4 });

    expect(productService.updateProduct).toHaveBeenCalledWith("2", {
      precoProduto: 4,
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Produto atualizado com sucesso",
      product: 1,
    });
  });

  test("DELETE /products/:productId - should delete a product", async () => {
    productService.deleteProduct.mockResolvedValue(1);

    const response = await request(buildApp()).delete("/products/3");

    expect(productService.deleteProduct).toHaveBeenCalledWith("3");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Produto excluído com sucesso" });
  });
});
