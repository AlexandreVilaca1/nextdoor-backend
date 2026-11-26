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

describe("Product Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      user: { idUtilizador: 1, idTipoUtilizador: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    userService.fetchUserByIdInternal.mockResolvedValue({
      idUtilizador: 1,
      VizinhançaidVizinhança: 10,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProductByIdController", () => {
    test("should fetch a product from the user's neighborhood", async () => {
      req.params.productId = "6";
      productService.getProductByIdAndNeighborhood.mockResolvedValue(mockProduct);

      await productController.getProductByIdController(req, res);

      expect(userService.fetchUserByIdInternal).toHaveBeenCalledWith(1);
      expect(productService.getProductByIdAndNeighborhood).toHaveBeenCalledWith(
        "6",
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produto obtido com sucesso",
        product: mockProduct,
      });
    });

    test("should answer 401 when there is no authenticated user", async () => {
      req.user = undefined;

      await productController.getProductByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(productService.getProductByIdAndNeighborhood).not.toHaveBeenCalled();
    });

    test("should answer 404 when the product is not in the neighborhood", async () => {
      req.params.productId = "999";
      productService.getProductByIdAndNeighborhood.mockResolvedValue(null);

      await productController.getProductByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getProductByTypeController", () => {
    test("should fetch products by type with default pagination", async () => {
      const page = {
        products: [mockProduct],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      req.params.typeId = "3";
      productService.getProductByTypeAndNeighborhood.mockResolvedValue(page);

      await productController.getProductByTypeController(req, res);

      expect(productService.getProductByTypeAndNeighborhood).toHaveBeenCalledWith(
        "3",
        10,
        1,
        12
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produtos obtidos com sucesso por tipo",
        ...page,
      });
    });
  });

  describe("getProductByEstablsihmentController", () => {
    test("should fetch the products of an establishment in the neighborhood", async () => {
      const page = {
        products: [mockProduct],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      req.params.establishmentId = "4";
      productService.getProductsByEstablishmentAndNeighborhood.mockResolvedValue(
        page
      );

      await productController.getProductByEstablsihmentController(req, res);

      expect(
        productService.getProductsByEstablishmentAndNeighborhood
      ).toHaveBeenCalledWith("4", 10, 1, 12);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produtos do estabelecimento na vizinhança obtidos com sucesso",
        ...page,
      });
    });

    test("should answer 404 when the establishment has no products", async () => {
      req.params.establishmentId = "4";
      productService.getProductsByEstablishmentAndNeighborhood.mockResolvedValue({
        products: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      });

      await productController.getProductByEstablsihmentController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getProductController", () => {
    test("should fetch all products", async () => {
      productService.getProduct.mockResolvedValue([mockProduct]);

      await productController.getProductController(req, res);

      expect(productService.getProduct).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produtos obtidos com sucesso",
        products: [mockProduct],
      });
    });
  });

  describe("getProductsByMyNeighborhoodController", () => {
    test("should fetch the products of the user's neighborhood", async () => {
      const page = {
        products: [mockProduct],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      productService.getProductsByNeighborhoodForUser.mockResolvedValue(page);

      await productController.getProductsByMyNeighborhoodController(req, res);

      expect(productService.getProductsByNeighborhoodForUser).toHaveBeenCalledWith(
        10,
        1,
        12
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produtos da vizinhança obtidos com sucesso",
        ...page,
      });
    });

    test("should answer 401 when there is no authenticated user", async () => {
      req.user = undefined;

      await productController.getProductsByMyNeighborhoodController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should answer 400 when the user has no neighborhood", async () => {
      userService.fetchUserByIdInternal.mockResolvedValue({
        idUtilizador: 1,
        VizinhançaidVizinhança: null,
      });

      await productController.getProductsByMyNeighborhoodController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("createProductController", () => {
    const validBody = {
      nomeProduto: "gelado",
      descricaoProduto: "marca: ola",
      precoProduto: "4",
      stockProduto: "5",
      tipoProdutoidTipoProduto: "2",
      estadoProdutoidEstadoProduto: "2",
      EstabelecimentoidEstabelecimento: "1",
    };

    test("should create a product with parsed numbers", async () => {
      const mockReturnedProduct = { idProduto: 4, nomeProduto: "gelado" };
      req.body = { ...validBody };
      productService.createProduct.mockResolvedValue(mockReturnedProduct);

      await productController.createProductController(req, res, next);

      expect(productService.createProduct).toHaveBeenCalledWith({
        nomeProduto: "gelado",
        precoProduto: 4,
        descricaoProduto: "marca: ola",
        imagemProduto: null,
        tipoProdutoidTipoProduto: 2,
        estadoProdutoidEstadoProduto: 2,
        EstabelecimentoidEstabelecimento: 1,
        stockProduto: 5,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produto adicionado com sucesso",
        product: mockReturnedProduct,
      });
    });

    test("should answer 400 when a required field is missing", async () => {
      req.body = { ...validBody, stockProduto: undefined };

      await productController.createProductController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(productService.createProduct).not.toHaveBeenCalled();
    });

    test("should answer 403 for non admin users", async () => {
      req.user = { idUtilizador: 1, idTipoUtilizador: 2 };
      req.body = { ...validBody };

      await productController.createProductController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(productService.createProduct).not.toHaveBeenCalled();
    });
  });

  describe("updateProductController", () => {
    test("should update a product", async () => {
      req.params.productId = "6";
      req.body = { precoProduto: "5" };
      productService.getProductByIdForUpdate.mockResolvedValue({
        idProduto: 6,
        imagemProduto: null,
      });
      productService.updateProduct.mockResolvedValue(1);

      await productController.updateProductController(req, res, next);

      expect(productService.updateProduct).toHaveBeenCalledWith("6", {
        precoProduto: 5,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produto atualizado com sucesso",
        product: 1,
      });
    });
  });

  describe("deleteProductController", () => {
    test("should delete a product", async () => {
      req.params.productId = "6";
      productService.deleteProduct.mockResolvedValue(1);

      await productController.deleteProductController(req, res);

      expect(productService.deleteProduct).toHaveBeenCalledWith("6");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produto excluído com sucesso",
      });
    });
  });
});
