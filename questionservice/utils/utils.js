const fs = require('fs').promises;
const path = require('path');

async function readFromFile(relativePath) {
    const filePath = path.resolve(__dirname, relativePath);
    return await fs.readFile(filePath, 'utf8');
}

module.exports = {
    readFromFile
};
