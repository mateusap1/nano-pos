const fs = require('fs');

const fsp = jest.createMockFromModule('fs/promises');

fsp.readFile = jest.fn(async (filePath) => fs.getMockFiles()[filePath]);
fsp.mkdir = jest.fn(async () => {});

module.exports = fsp;