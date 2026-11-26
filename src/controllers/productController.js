
const productService = require("../services/productService");
const userService = require("../services/userService");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getProductByIdController = async (req, res) => {
  const { productId } = req.params;
  try {
    if (!req.user || !req.user.idUtilizador) return res.status(401).json({ error: "Não autenticado." });
    const user = await userService.fetchUserByIdInternal(req.user.idUtilizador);
    if (!user || (user.VizinhançaidVizinhança === null || user.VizinhançaidVizinhança === undefined)) {
        return res.status(400).json({ error: "Utilizador ou vizinhança inválidos para validar o produto."});
    }
    console.log(productId, user.VizinhançaidVizinhança)
    const product = await productService.getProductByIdAndNeighborhood(productId, user.VizinhançaidVizinhança); 
    if (!product) return res.status(404).json({ error: "Produto não encontrado ou não pertence à sua vizinhança." });
    res.status(200).json({ message: "Produto obtido com sucesso", product });
  } catch (error) {

  }
};



const getProductByTypeController = async (req, res) => {
  const { typeId } = req.params;
  try {
    if (!req.user || !req.user.idUtilizador) return res.status(401).json({ error: "Não autenticado." });
    const user = await userService.fetchUserByIdInternal(req.user.idUtilizador);
    if (!user || (user.VizinhançaidVizinhança === null || user.VizinhançaidVizinhança === undefined)) {
        return res.status(400).json({ error: "Utilizador ou vizinhança inválidos para filtrar por tipo."});
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const result = await productService.getProductByTypeAndNeighborhood(typeId, user.VizinhançaidVizinhança, page, limit); 
    res.status(200).json({ message: "Produtos obtidos com sucesso por tipo", ...result });
  } catch (error) { }
};

const getProductController = async (req, res) => {
  try {
    const result = await productService.getProduct();
    res.status(200).json({ message: "Produtos obtidos com sucesso", products: result });
  } catch (error) {
    console.error("CONTROLLER ERROR: getProductController -", error.message, error.stack);
    res.status(500).json({ error: "Erro interno ao buscar produtos." });
  }
};

const getProductByEstablsihmentController = async (req, res) => {
  const { establishmentId } = req.params;
  try {
    if (!req.user || !req.user.idUtilizador) return res.status(401).json({ error: "Não autenticado." });
    
    const user = await userService.fetchUserByIdInternal(req.user.idUtilizador);
    if (!user || (user.VizinhançaidVizinhança === null || user.VizinhançaidVizinhança === undefined)) {
        return res.status(400).json({ error: "Utilizador ou vizinhança inválidos."});
    }
    const neighborhoodId = user.VizinhançaidVizinhança;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await productService.getProductsByEstablishmentAndNeighborhood(establishmentId, neighborhoodId, page, limit);

    if (!result || result.products.length === 0) {
        return res.status(404).json({ error: "Nenhum produto encontrado para este estabelecimento na sua vizinhança." });
    }
    res.status(200).json({ message: "Produtos do estabelecimento na vizinhança obtidos com sucesso", ...result });

  } catch (error) {
    console.error("CONTROLLER ERROR: getProductByEstablsihmentController -", error.message, error.stack);
    res.status(500).json({ error: "Erro interno ao buscar produtos do estabelecimento." });
  }
};

const getProductByAllEstablishmentController = async (req, res) => {
  const userType = req.user.idTipoUtilizador;
  const { establishmentId } = req.params;
  try {
    if (userType !== 1) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    const products = await productService.getProductByAllEstablishment(establishmentId);
    if (!products || products.length === 0) {
        return res.status(404).json({ error: "Nenhum produto encontrado para este estabelecimento." });
    }
    res.status(200).json({ message: "Produtos obtidos com sucesso", products: products });
  } catch (error) {
    console.error("CONTROLLER ERROR: getProductByAllEstablishmentController -", error.message, error.stack);
    res.status(500).json({ error: "Erro interno ao buscar produtos por estabelecimento (admin)." });
  }
};

// const createProductController = async (req, res) => {
//   const userType = req.user.idTipoUtilizador;
//   try {
//     if (userType !== 1) {
//       return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
//     }

//     const {
//       nomeProduto,
//       precoProduto,
//       descricaoProduto,
//       tipoProdutoidTipoProduto,
//       estadoProdutoidEstadoProduto,
//       EstabelecimentoidEstabelecimento,
//       stockProduto,
//       imagemProduto, 
//     } = req.body;

//     // REMOVER: const imagemProdutoFile = req.file ? req.file.path : null;

//     if (imagemProduto && typeof imagemProduto !== 'string') {
//         return res.status(400).json({ error: "URL da imagem inválido." });
//     }

//     const productData = {
//       nomeProduto: nomeProduto.trim(),
//       precoProduto,
//       descricaoProduto: descricaoProduto.trim(),
//       imagemProduto: imagemProduto ? imagemProduto.trim() : null,
//       tipoProdutoidTipoProduto,
//       estadoProdutoidEstadoProduto,
//       EstabelecimentoidEstabelecimento,
//       stockProduto,
//     };

//     const newProduct = await productService.createProduct(productData);
//     res.status(201).json({ message: "Produto adicionado com sucesso", product: newProduct });
//   } catch (error) {
//     console.error("CONTROLLER ERROR: createProductController -", error.message, error.stack);
//     if (error.status) { 
//         return res.status(error.status).json({ error: error.message, details: error.details });
//     }
//     res.status(500).json({ error: "Erro interno ao criar o produto." });
//   }
// };

// const updateProductController = async (req, res) => {
//   const userType = req.user.idTipoUtilizador;
//   try {
//     if (userType !== 1) {
//       return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
//     }
//     const { productId } = req.params;
//     const updates = { ...req.body };

//     if (updates.hasOwnProperty('imagemProduto')) {
//         if (updates.imagemProduto === null || (typeof updates.imagemProduto === 'string' && updates.imagemProduto.trim() === '')) {
//             updates.imagemProduto = null; 
//         } else if (typeof updates.imagemProduto !== 'string' || !(updates.imagemProduto.startsWith('http://') || updates.imagemProduto.startsWith('https://'))) {
//             return res.status(400).json({ error: "URL da imagem inválido para atualização." });
//         }
//     }

//     if (Object.keys(updates).length === 0) {
//         return res.status(400).json({ error: "Nenhum dado fornecido para atualização." });
//     }

//     const updatedProduct = await productService.updateProduct(productId, updates);
//     res.status(200).json({ message: "Produto atualizado com sucesso", product: updatedProduct });
//   } catch (error) {
//     console.error("CONTROLLER ERROR: updateProductController -", error.message, error.stack);
//     if (error.status) {
//         return res.status(error.status).json({ error: error.message, details: error.details });
//     }
//     res.status(500).json({ error: "Erro interno ao atualizar o produto." });
//   }
// };

const deleteProductController = async (req, res) => {
  const { productId } = req.params;
  const userType = req.user.idTipoUtilizador;
  try {
    if (userType !== 1) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    await productService.deleteProduct(productId);
    res.status(200).json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("CONTROLLER ERROR: deleteProductController -", error.message, error.stack);
    if (error.status === 404) {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno ao excluir o produto." });
  }
};

const getAllProductsAdminController = async (req, res) => {
  const userType = req.user.idTipoUtilizador;
  try {
    if (userType !== 1) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    const result = await productService.getAllProductsAdmin();
    res.status(200).json({ message: "Produtos (admin) obtidos com sucesso", ...result }); 
  } catch (error) {
    console.error("CONTROLLER ERROR: getAllProductsAdminController -", error.message, error.stack);
    res.status(500).json({ error: "Erro interno ao buscar todos os produtos (admin)." });
  }
};

const getProductsByMyNeighborhoodController = async (req, res) => {
  try {
    if (!req.user || !req.user.idUtilizador) {}
    const userId = req.user.idUtilizador;
    const user = await userService.fetchUserByIdInternal(userId);
    if (!user || (user.VizinhançaidVizinhança === null || user.VizinhançaidVizinhança === undefined)) {}
    const neighborhoodId = user.VizinhançaidVizinhança;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; 

    const result = await productService.getProductsByNeighborhoodForUser(neighborhoodId, page, limit); 
    res.status(200).json({ message: "Produtos da vizinhança obtidos com sucesso", ...result });
  } catch (error) {}
};

// Crie o diretório de uploads se não existir
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads'); // Ajuste '..' para a raiz do projeto
if (!fs.existsSync(UPLOADS_DIR)) {
    try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log(`Diretório de uploads criado: ${UPLOADS_DIR}`);
    } catch (error) {
        console.error(`Erro ao criar diretório de uploads ${UPLOADS_DIR}:`, error);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        cb(null, `${uuidv4()}${extension}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        // Rejeita o arquivo, mas não lança um erro que para a requisição imediatamente
        // O controller pode então verificar se req.file existe
        cb(null, false);
        // Se quiser lançar um erro que pode ser capturado por um error handler:
        // cb(new Error('Apenas ficheiros de imagem são permitidos!'), false);
    }
};

const uploadMiddleware = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// const createProductController = async (req, res, next) => { // Adicione next para passar erros para o error handler
//   const userType = req.user.idTipoUtilizador;
//   try {
//     if (userType !== 1) {
//       // Se um arquivo foi carregado por multer mas o usuário não é admin, apague-o
//       if (req.file && req.file.path) {
//         try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo após falha de autorização:", e); }
//       }
//       return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
//     }

//     const {
//       nomeProduto, precoProduto, descricaoProduto, tipoProdutoidTipoProduto,
//       estadoProdutoidEstadoProduto, EstabelecimentoidEstabelecimento, stockProduto,
//     } = req.body;

//     let imageUrl = null;

//     if (req.file) {
//       // Seu fileFilter já validou o tipo. Se chegou aqui, o arquivo é uma imagem válida.
//       // A pasta de destino é 'src/uploads/'
//       // O frontend precisa saber como acessar isso. Se 'src' não for servida diretamente,
//       // você precisa de um caminho público como '/uploads/'
//       imageUrl = `/uploads/${req.file.filename}`; // Assumindo que '/uploads/' mapeia para 'src/uploads/'
//     } else if (req.body.imagemProduto && typeof req.body.imagemProduto === 'string') {
//       imageUrl = req.body.imagemProduto.trim();
//       if (imageUrl && !(imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/uploads/'))) {
//         return res.status(400).json({ error: "URL da imagem fornecido é inválido." });
//       }
//     }

//     if (!nomeProduto || !precoProduto || !descricaoProduto /* ...outras validações... */) {
//         if (req.file && req.file.path) {
//             try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo após validação falhada:", e); }
//         }
//         return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
//     }

//     const productData = {
//       nomeProduto: nomeProduto.trim(),
//       precoProduto: parseFloat(precoProduto),
//       descricaoProduto: descricaoProduto.trim(),
//       imagemProduto: imageUrl,
//       tipoProdutoidTipoProduto: parseInt(tipoProdutoidTipoProduto),
//       estadoProdutoidEstadoProduto: parseInt(estadoProdutoidEstadoProduto),
//       EstabelecimentoidEstabelecimento: parseInt(EstabelecimentoidEstabelecimento),
//       stockProduto: parseInt(stockProduto),
//     };

//     const newProduct = await productService.createProduct(productData);
//     res.status(201).json({ message: "Produto adicionado com sucesso", product: newProduct });
//   } catch (error) {
//     if (req.file && req.file.path) {
//          try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo após falha na criação do produto:", e); }
//     }
//     // Passar o erro para o error handler global
//     // Se seu fileFilter lança `new Error(...)`, ele será pego aqui.
//     console.error("CONTROLLER ERROR: createProductController -", error.message);
//     if (error.message && error.message.startsWith("Only images are allowed")) { // Erro do seu fileFilter
//         return res.status(400).json({ error: error.message });
//     }
//     next(error); // Passa para o error handler global do Express
//   }
// };

const createProductController = async (req, res, next) => {
  const userType = req.user.idTipoUtilizador;
  try {
    if (userType !== 1) {
      if (req.file && req.file.path) { // Se um arquivo foi carregado mas o usuário não é admin
        try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo após falha de autorização:", e); }
      }
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }

    // Debug: Logar o que multer colocou em req.body e req.file
    console.log("createProductController req.file:", req.file);
    console.log("createProductController req.body:", req.body);

    const {
      nomeProduto, // string
      precoProduto, // string, precisa ser parseFloat
      descricaoProduto, // string
      tipoProdutoidTipoProduto, // string, precisa ser parseInt
      estadoProdutoidEstadoProduto, // string, precisa ser parseInt
      EstabelecimentoidEstabelecimento, // string, precisa ser parseInt
      stockProduto, // string, precisa ser parseInt
      // imagemProduto (string URL) NÃO virá do body se um arquivo foi enviado via 'imagemProdutoFile'
    } = req.body;

    // Validação dos campos de texto OBRIGATÓRIOS
    if (!nomeProduto || nomeProduto.trim() === '' ||
        !precoProduto ||
        !descricaoProduto || descricaoProduto.trim() === '' ||
        !tipoProdutoidTipoProduto ||
        !estadoProdutoidEstadoProduto ||
        !EstabelecimentoidEstabelecimento ||
        !stockProduto) {
      if (req.file && req.file.path) { // Se um arquivo foi carregado mas os dados são inválidos
        try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo após validação de campos falhada:", e); }
      }
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos corretamente." });
    }

    let finalImagemProdutoUrl = null; // Default para null se allowNull: true no modelo

    if (req.file) {
      // Se um arquivo foi enviado via 'imagemProdutoFile'
      finalImagemProdutoUrl = `/uploads/${req.file.filename}`; // Caminho relativo para salvar no BD
    } else if (req.body.imagemProduto && typeof req.body.imagemProduto === 'string' && req.body.imagemProduto.trim() !== '') {
      // Se nenhum arquivo foi enviado, mas um URL de imagem foi passado no campo 'imagemProduto' do FormData
      const urlInput = req.body.imagemProduto.trim();
      if (!(urlInput.startsWith('http://') || urlInput.startsWith('https://'))) {
         if (req.file && req.file.path) { try { fs.unlinkSync(req.file.path); } catch(e){} } // Caso raro
        return res.status(400).json({ error: "URL da imagem fornecido no campo 'imagemProduto' é inválido." });
      }
      finalImagemProdutoUrl = urlInput;
    }

    // Se seu modelo Produto.imagemProduto TEM allowNull: false (notNull Violation):
    // Você PRECISA de um valor aqui. Se finalImagemProdutoUrl ainda for null, decida o que fazer:
    // 1. Retornar erro:
    // if (!finalImagemProdutoUrl) {
    //   if (req.file && req.file.path) { try { fs.unlinkSync(req.file.path); } catch(e){} }
    //   return res.status(400).json({ error: "A imagem do produto é obrigatória." });
    // }
    // 2. Usar um placeholder (se fizer sentido para seu app):
    // if (!finalImagemProdutoUrl) {
    //   finalImagemProdutoUrl = "/uploads/placeholder.jpg"; // Exemplo
    // }
    // **RECOMENDAÇÃO: Altere seu modelo Produto para `imagemProduto: { type: DataTypes.STRING, allowNull: true }`**


    const productData = {
      nomeProduto: nomeProduto.trim(),
      precoProduto: parseFloat(precoProduto), // Converter para número
      descricaoProduto: descricaoProduto.trim(),
      imagemProduto: finalImagemProdutoUrl, // Será o URL do arquivo carregado, um URL fornecido, ou null
      tipoProdutoidTipoProduto: parseInt(tipoProdutoidTipoProduto, 10), // Converter para número
      estadoProdutoidEstadoProduto: parseInt(estadoProdutoidEstadoProduto, 10), // Converter para número
      EstabelecimentoidEstabelecimento: parseInt(EstabelecimentoidEstabelecimento, 10), // Converter para número
      stockProduto: parseInt(stockProduto, 10), // Converter para número
    };

    // Validação adicional dos números convertidos
    if (isNaN(productData.precoProduto) || productData.precoProduto < 0 ||
        isNaN(productData.stockProduto) || productData.stockProduto < 0 || !Number.isInteger(productData.stockProduto) ||
        isNaN(productData.tipoProdutoidTipoProduto) ||
        isNaN(productData.estadoProdutoidEstadoProduto) ||
        isNaN(productData.EstabelecimentoidEstabelecimento)
    ) {
        if (req.file && req.file.path) { try { fs.unlinkSync(req.file.path); } catch(e){} }
        return res.status(400).json({ error: "Valores numéricos inválidos para preço, stock ou IDs." });
    }


    const newProduct = await productService.createProduct(productData);
    res.status(201).json({ message: "Produto adicionado com sucesso", product: newProduct });
  } catch (error) {
    if (req.file && req.file.path) { // Se um erro ocorreu após o upload mas antes do BD
         try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo após falha na criação do produto (controller catch):", e); }
    }
    console.error("ERRO NO createProductController:", error.message, error.stack ? error.stack.substring(0, 500) : '');
    next(error);
  }
};

const updateProductController = async (req, res, next) => {
  const userType = req.user.idTipoUtilizador;
  const UPLOADS_DIR_ABSOLUTE = path.resolve(__dirname, '..', 'uploads'); // Caminho absoluto para src/uploads

  try {
    if (userType !== 1) {
      if (req.file && req.file.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo após falha de autorização (update):", e); }
      }
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    const { productId } = req.params;
    const updates = { ...req.body };

    let oldImagePathToDelete = null;

    const existingProduct = await productService.getProductByIdForUpdate(productId); // Adapte conforme seu service

    if (req.file) {
      updates.imagemProduto = `/uploads/${req.file.filename}`;
      if (existingProduct && existingProduct.imagemProduto && existingProduct.imagemProduto.startsWith('/uploads/')) {
          const oldFilename = path.basename(existingProduct.imagemProduto);
          oldImagePathToDelete = path.join(UPLOADS_DIR_ABSOLUTE, oldFilename); // Use caminho absoluto para apagar
      }
    } else if (updates.hasOwnProperty('imagemProduto')) {
      if (updates.imagemProduto === null || (typeof updates.imagemProduto === 'string' && updates.imagemProduto.trim() === '')) {
        updates.imagemProduto = null;
         if (existingProduct && existingProduct.imagemProduto && existingProduct.imagemProduto.startsWith('/uploads/')) {
             const oldFilename = path.basename(existingProduct.imagemProduto);
             oldImagePathToDelete = path.join(UPLOADS_DIR_ABSOLUTE, oldFilename);
         }
      } else if (typeof updates.imagemProduto === 'string') {
        const urlInput = updates.imagemProduto.trim();
        if (!(urlInput.startsWith('http://') || urlInput.startsWith('https://') || urlInput.startsWith('/uploads/'))) {
          if (req.file && req.file.path) try {fs.unlinkSync(req.file.path); } catch(e){} // Se houve upload falhado por causa disto
          return res.status(400).json({ error: "URL da imagem fornecido é inválido para atualização." });
        }
        updates.imagemProduto = urlInput;
        if (existingProduct && existingProduct.imagemProduto && existingProduct.imagemProduto !== urlInput && existingProduct.imagemProduto.startsWith('/uploads/')) {
             const oldFilename = path.basename(existingProduct.imagemProduto);
             oldImagePathToDelete = path.join(UPLOADS_DIR_ABSOLUTE, oldFilename);
        }
      }
    }

    if (updates.precoProduto !== undefined) updates.precoProduto = parseFloat(updates.precoProduto);
    if (updates.stockProduto !== undefined) updates.stockProduto = parseInt(updates.stockProduto);

    if (Object.keys(updates).length === 0 && !req.file) {
        return res.status(400).json({ error: "Nenhum dado fornecido para atualização." });
    }

    const updatedProduct = await productService.updateProduct(productId, updates);

    if (oldImagePathToDelete) {
        try {
            if (fs.existsSync(oldImagePathToDelete)) {
                fs.unlinkSync(oldImagePathToDelete);
                console.log("Imagem antiga apagada:", oldImagePathToDelete);
            }
        } catch (e) {
            console.error("Erro ao apagar imagem antiga:", oldImagePathToDelete, e);
        }
    }

    res.status(200).json({ message: "Produto atualizado com sucesso", product: updatedProduct });
  } catch (error) {
    if (req.file && req.file.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Erro ao apagar arquivo novo após falha na atualização do produto:", e); }
    }
    console.error("CONTROLLER ERROR: updateProductController -", error.message);
     if (error.message && error.message.startsWith("Only images are allowed")) { // Erro do seu fileFilter
        return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};


module.exports = {
  getProductByIdController,
  getProductByTypeController,
  getProductController,
  getProductByEstablsihmentController,
  getProductByAllEstablishmentController,
  createProductController,
  updateProductController,
  deleteProductController,
  getAllProductsAdminController,
  getProductsByMyNeighborhoodController,
};