// services/redemptionCodeService.js
const { sequelize } = require("../models/association/associations");
const {
  resgateCodigo,
  Produto, 
  Utilizador,
  estadoResgate,
  Estabelecimento,
  Vizinhanca,
} = require("../models/association/associations");

const { fetchUserByIdInternal, updateUserDetails } = require("./userService");
const { getProductByIdForUpdate, updateProductDetails } = require("./productService");

const generateCode = (userId, productId) => { return `${userId}${productId}${Date.now()}`.slice(-8).toUpperCase(); };

// const generateCode = (userId, neighborhoodId) => {
//   const rawCode = `${userId}${neighborhoodId}${Date.now()}`;
//   return Buffer.from(rawCode)
//     .toString("base64")
//     .replace(/[^A-Z0-9]/gi, "")
//     .substring(0, 8)
//     .toUpperCase();
// };

const redeemProduct = async (userId, productId) => {
  const ID_ESTADO_PRODUTO_ATIVO = 1;
  const ID_ESTADO_PRODUTO_NAO_VISIVEL = 2;
  const ID_ESTADO_RESGATE_CRIADO = 1;

  const t = await sequelize.transaction();

  try {
    const user = await fetchUserByIdInternal(userId);
    if (!user) throw new Error("Utilizador não encontrado.");

    const product = await getProductByIdForUpdate(productId, t, true);
    if (!product) { await t.rollback(); throw new Error("Produto não encontrado."); }
    if (product.estadoProdutoidEstadoProduto !== ID_ESTADO_PRODUTO_ATIVO) { await t.rollback(); throw new Error("Este produto não está atualmente disponível para resgate.");}
    if (product.stockProduto <= 0) {
      if (product.estadoProdutoidEstadoProduto !== ID_ESTADO_PRODUTO_NAO_VISIVEL) {
        await updateProductDetails(productId, { estadoProdutoidEstadoProduto: ID_ESTADO_PRODUTO_NAO_VISIVEL }, t);
      }
      await t.rollback(); throw new Error("Produto esgotado.");
    }
    if (user.pontosUtilizador < product.precoProduto) { await t.rollback(); throw new Error("Pontos insuficientes para resgatar este produto.");}

    const novosPontos = user.pontosUtilizador - product.precoProduto;
    const userUpdateResult = await updateUserDetails(userId, { pontosUtilizador: novosPontos }, t);
    if (userUpdateResult[0] === 0) { await t.rollback(); throw new Error("Falha ao atualizar os pontos do utilizador.");}

    const novoStock = product.stockProduto - 1;
    const productUpdateData = { stockProduto: novoStock };
    if (novoStock === 0) {
      productUpdateData.estadoProdutoidEstadoProduto = ID_ESTADO_PRODUTO_NAO_VISIVEL;
    }
    const productUpdateResult = await updateProductDetails(productId, productUpdateData, t);
    if (productUpdateResult[0] === 0) { await t.rollback(); throw new Error("Falha ao atualizar o stock do produto.");}

    const code = generateCode(userId, productId);
    const redemptionDate = new Date();

    const newRedemptionCode = await resgateCodigo.create({
      dataResgate: redemptionDate,
      ProdutoidProduto: productId,
      estadoResgateidEstadoResgate: ID_ESTADO_RESGATE_CRIADO,
      codigo: code,
      UtilizadoridUtilizador: userId,
    }, { transaction: t });

    await t.commit();


    const createdCodeWithDetails = await resgateCodigo.findByPk(newRedemptionCode.idResgate, {
        include: [
            { 
              model: Produto, 

              attributes: ['nomeProduto', 'precoProduto', 'imagemProduto'] 
            }

        ]
    });
    

    if (createdCodeWithDetails) {
        return createdCodeWithDetails;
    } else {

        console.warn("redeemProduct: Não foi possível buscar createdCodeWithDetails com include. Retornando dados básicos.");
        const productDetailsForResponse = {
            nomeProduto: product.nomeProduto,
            precoProduto: product.precoProduto,
            imagemProduto: product.imagemProduto
        };
      
        return {
            ...newRedemptionCode.get({ plain: true }),
            Produto: productDetailsForResponse 
        };
    }

  } catch (error) {
    if (t && !t.finished) { 
        try { await t.rollback(); } catch (rollbackError) { console.error("Error during forced transaction rollback:", rollbackError); }
    }
    console.error("SERVICE ERROR: redeemProduct - ", error.message);
    throw error; 
  }
};

const getAllRedemptionCodesAdmin = async (page = 1, limit = 15) => {
  try {
    const offset = (page - 1) * limit;
    const { count, rows } = await resgateCodigo.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        { 
          model: Produto,
          attributes: [
            'idProduto', 
            'nomeProduto', 
            'imagemProduto', 
            'precoProduto', 
            'descricaoProduto' 
          ], 
          include: [{
            model: Estabelecimento,
            as: 'Estabelecimento',
            attributes: ['idEstabelecimento', 'nomeEstabelecimento'],
            include: [{
                model: Vizinhanca,
                as: 'Vizinhanca', 
                attributes: ['idVizinhanca', 'nomeFreguesia']
            }]
          }]
        },
        { 
          model: Utilizador,
          attributes: [
            'idUtilizador', 
            'nomeUtilizador', 
            'emailUtilizador',
            'VizinhançaidVizinhança' 
          ], 
          include: [{
            model: Vizinhanca,
            as: 'Vizinhanca', 
            attributes: ['idVizinhanca', 'nomeFreguesia']
          }]
        },
        { 
          model: estadoResgate,
          attributes: ['idEstadoResgate', 'estadoResgate'] 
        }
      ],
      order: [['dataResgate', 'DESC']],
      distinct: true
    });
    
    const codesWithProductPoints = rows.map(codeInstance => {
        const code = codeInstance.get({ plain: true });
        if (code.Produto) {
            code.pontosProduto = code.Produto.precoProduto; 
        }
        return code;
    });

    return { 
        redemptionCodes: codesWithProductPoints, 
        totalItems: count, 
        totalPages: Math.ceil(count / limit), 
        currentPage: parseInt(page, 10) 
    };
  } catch (error) {
    console.error("SERVICE ERROR: getAllRedemptionCodesAdmin -", error.message, error.stack);
    if (error.original) console.error("Original Sequelize Error:", error.original);
    throw error;
  }
};

const findMyRedemptionCodesService = async (userId, page = 1, limit = 6) => {
  try {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);


    const { count, rows } = await resgateCodigo.findAndCountAll({
      where: { UtilizadoridUtilizador: userId },
      include: [
        {
          model: Produto,
          attributes: ['idProduto', 'nomeProduto', 'imagemProduto', 'descricaoProduto'],
          required: true,
          include: [
            {
              model: Estabelecimento,
              as: 'Estabelecimento', 
              attributes: ['idEstabelecimento', 'nomeEstabelecimento'],
              required: true,
            },
          ],
        },
        {
          model: estadoResgate, 
          attributes: ['idEstadoResgate', 'estadoResgate'],
          required: true,
        },
      ],
      limit: parseInt(limit, 10),
      offset: offset,
      order: [['dataResgate', 'DESC']],
      distinct: true,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      redemptionCodes: rows,
    };
  } catch (error) {
    console.error("SERVICE ERROR: findMyRedemptionCodesService -", error.message, error.stack);
    throw error;
  }
};


module.exports = { 
    //getRedemptionsCode, // Se esta função também usa includes, verifica os aliases nela
    redeemProduct,
    getAllRedemptionCodesAdmin,
    findMyRedemptionCodesService,
};