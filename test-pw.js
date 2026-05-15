const bcrypt = require('bcryptjs');
async function run() {
  console.log('Is admin123 matching?', await bcrypt.compare('admin123', '$2b$10$gu51npCMMrU69/oAshtbWu98otx4Jsa.QEcw6Z1CVTeXkXsPM9LqG'));
}
run();
