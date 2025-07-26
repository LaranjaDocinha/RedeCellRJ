const fs = require('fs');
const oldPath = './backend/key AiStudi.env';
const newPath = './backend/.env';

fs.rename(oldPath, newPath, (err) => {
  if (err) {
    console.error('Erro ao renomear o arquivo:', err);
  } else {
    console.log('Arquivo renomeado com sucesso!');
  }
});
