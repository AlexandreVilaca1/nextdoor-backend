// Localização: src/middlewares/imageUploads.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Constrói o caminho absoluto para a pasta 'src/uploads/'
// __dirname aqui é o diretório de 'imageUploads.js' (ou seja, src/middlewares/)
// Então, path.resolve sobe um nível (para 'src/') e entra em 'uploads/'
const UPLOADS_DIR_PATH = path.resolve(__dirname, '../uploads');

// Verifica se o diretório de uploads existe, se não, cria-o
if (!fs.existsSync(UPLOADS_DIR_PATH)) {
  try {
    fs.mkdirSync(UPLOADS_DIR_PATH, { recursive: true });
  } catch (err) {
    console.error(`Erro ao criar o diretório de uploads em ${UPLOADS_DIR_PATH}:`, err);
    // Considere lançar um erro aqui ou tratar de forma que impeça a aplicação de continuar
    // se o diretório de uploads for essencial e não puder ser criado.
    // process.exit(1); // Exemplo drástico
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR_PATH); // Usa o caminho absoluto/resolvido
  },
  filename: (req, file, cb) => {
    // Gera um nome de arquivo único para evitar conflitos e sobrescritas
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  // Tipos de imagem permitidos (Expressão Regular)
  const allowedMimeTypes = /jpeg|jpg|png|gif|webp|avif/; // Adicionei gif e webp por completude

  // Verifica a extensão do arquivo E o mimetype
  const isExtensionAllowed = allowedMimeTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isMimeTypeAllowed = allowedMimeTypes.test(file.mimetype);

  if (isExtensionAllowed && isMimeTypeAllowed) {
    cb(null, true); // Aceita o arquivo
  } else {
    // Rejeita o arquivo com uma mensagem de erro específica
    // Esta mensagem será pega pelo error handler do Express se você chamar next(error) no controller
    cb(new Error("Tipo de imagem não permitido! Apenas JPEG, JPG, PNG, GIF, WEBP, AVIF são aceites."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de tamanho do arquivo: 5MB
  },
});

module.exports = upload;