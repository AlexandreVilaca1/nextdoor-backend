const productService = require("../../services/productService");
const { Produto } = require("../../models/association/associations");

jest.mock("../../models/association/associations", () => ({
  Produto: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Estabelecimento: { name: "Estabelecimento" },
  estadoProduto: { name: "estadoProduto" },
  tipoProduto: { name: "tipoProduto" },
  Endereco: { name: "Endereco" },
}));

const NEIGHBORHOOD_ID = 3;

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

describe("Product Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch a product by ID inside the neighborhood", async () => {
    Produto.findOne.mockResolvedValue(mockProduct);

    const result = await productService.getProductById(6, NEIGHBORHOOD_ID);

    expect(Produto.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idProduto: 6, estadoProdutoidEstadoProduto: 1 },
      })
    );
    const options = Produto.findOne.mock.calls[0][0];
    expect(options.include).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ model: { name: "Estabelecimento" } }),
      ])
    );
    expect(result).toEqual(mockProduct);
  });

  test("should fetch only active products of a type", async () => {
    Produto.findAll.mockResolvedValue([mockProduct]);

    const result = await productService.getProductByType(3, NEIGHBORHOOD_ID);

    expect(Produto.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tipoProdutoidTipoProduto: 3, estadoProdutoidEstadoProduto: 1 },
      })
    );
    expect(result).toEqual([mockProduct]);
  });

  test("should fetch only active products of an establishment", async () => {
    Produto.findAll.mockResolvedValue([mockProduct]);

    const result = await productService.getProductByEstablishment(
      4,
      NEIGHBORHOOD_ID
    );

    expect(Produto.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          EstabelecimentoidEstabelecimento: 4,
          estadoProdutoidEstadoProduto: 1,
        },
      })
    );
    expect(result).toEqual([mockProduct]);
  });

  test("should fetch all active products", async () => {
    Produto.findAll.mockResolvedValue([mockProduct]);

    const result = await productService.getProduct(NEIGHBORHOOD_ID);

    expect(Produto.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { estadoProdutoidEstadoProduto: 1 },
      })
    );
    expect(result).toEqual([mockProduct]);
  });

  test("should return a paginated page of products by establishment", async () => {
    Produto.findAndCountAll.mockResolvedValue({ count: 25, rows: [mockProduct] });

    const result = await productService.getProductsByEstablishmentAndNeighborhood(
      4,
      NEIGHBORHOOD_ID,
      2,
      12
    );

    expect(Produto.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          EstabelecimentoidEstabelecimento: 4,
          estadoProdutoidEstadoProduto: 1,
        },
        limit: 12,
        offset: 12,
      })
    );
    expect(result).toEqual({
      products: [mockProduct],
      totalItems: 25,
      totalPages: 3,
      currentPage: 2,
    });
  });

  test("should return a paginated page of products by type", async () => {
    Produto.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockProduct] });

    const result = await productService.getProductByTypeAndNeighborhood(
      3,
      NEIGHBORHOOD_ID
    );

    expect(Produto.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tipoProdutoidTipoProduto: 3, estadoProdutoidEstadoProduto: 1 },
        limit: 12,
        offset: 0,
      })
    );
    expect(result).toEqual({
      products: [mockProduct],
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
    });
  });

  test("should create a product", async () => {
    const newProduct = {
      nomeProduto: "gelado",
      descricaoProduto: "marca: ola",
      precoProduto: 4,
      imagemProduto: "/uploads/11532421-372193145.png",
      tipoProdutoidTipoProduto: 2,
      estadoProdutoidEstadoProduto: 2,
      EstabelecimentoidEstabelecimento: 1,
    };
    Produto.create.mockResolvedValue(newProduct);

    const result = await productService.createProduct(newProduct);

    expect(Produto.create).toHaveBeenCalledWith(newProduct);
    expect(result).toEqual(newProduct);
  });

  test("should update a product", async () => {
    Produto.update.mockResolvedValue([1]);

    const result = await productService.updateProduct(1, { precoProduto: 5 });

    expect(Produto.update).toHaveBeenCalledWith(
      { precoProduto: 5 },
      { where: { idProduto: 1 } }
    );
    expect(result).toEqual(1);
  });

  test("should delete a product", async () => {
    Produto.destroy.mockResolvedValue(1);

    const result = await productService.deleteProduct(1);

    expect(Produto.destroy).toHaveBeenCalledWith({ where: { idProduto: 1 } });
    expect(result).toBe(1);
  });
});
